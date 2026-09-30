import json
import logging

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    assert client.get("/health").json()["status"] == "ok"


def test_ask_returns_answer_sources_and_metrics(caplog):
    with caplog.at_level(logging.INFO, logger="rag.metrics"):
        r = client.post("/ask", json={"question": "Is flood damage from surface water covered?"})
    assert r.status_code == 200
    body = r.json()
    assert "POL-HOME-02" in body["sources"]
    for key in ("latency_ms", "tokens_in", "tokens_out", "est_cost_usd", "grounded"):
        assert key in body["metrics"]
    logged = json.loads(caplog.records[-1].getMessage())
    assert logged["request_id"] == body["metrics"]["request_id"]


def test_validation_rejects_empty_question():
    assert client.post("/ask", json={"question": ""}).status_code == 422
