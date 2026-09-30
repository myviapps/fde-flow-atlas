"""The spec as tests. The same file ships in starter/tests so you know when you are done."""
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app import main
from app.classifier import classify_rules

CSV = (Path(__file__).resolve().parents[2] / "data" / "tickets.csv").read_bytes()
client = TestClient(main.app)


@pytest.fixture(autouse=True)
def empty_store():
    main.TICKETS.clear()


def ingest(body=CSV):
    return client.post("/ingest", content=body, headers={"Content-Type": "text/csv"})


def test_rules():
    assert classify_rules("Site is down", "Outage for everyone", "free") == "high"
    assert classify_rules("Export error", "", "pro") == "medium"
    assert classify_rules("Dark mode?", "Nice to have", "free") == "low"
    assert classify_rules("Dark mode?", "Nice to have", "enterprise") == "medium"


def test_ingest_counts_and_rejects_bad_row():
    r = ingest().json()
    assert r["ingested"] == 20
    assert len(r["rejected"]) == 1 and r["rejected"][0]["line"] == 14


def test_ingest_is_idempotent():
    ingest()
    assert ingest().json()["total_stored"] == 20


def test_bad_header_is_400():
    assert ingest(b"id,text\n1,hello\n").status_code == 400


def test_filter_by_priority():
    ingest()
    high = client.get("/tickets", params={"priority": "high"}).json()
    assert high and all(t["priority"] == "high" for t in high)
    assert client.get("/tickets", params={"priority": "urgent"}).status_code == 422


def test_summary():
    ingest()
    s = client.get("/summary").json()
    assert s["total"] == 20 and sum(s["by_priority"].values()) == 20
    dates = [t["created_at"] for t in s["open_high"]]
    assert dates == sorted(dates) and s["open_high"][0]["ticket_id"] == "T-1004"
    assert s["top_customers"][0][0] == "Contoso"
