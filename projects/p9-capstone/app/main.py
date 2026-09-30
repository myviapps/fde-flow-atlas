"""FastAPI service: POST /ask runs the graph and logs one JSON metrics line per request."""
import json
import logging
import os
import time
import uuid

from fastapi import FastAPI
from pydantic import BaseModel, Field

from app.graph import build_graph
from app.llm import LLM

logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger("rag.metrics")
app = FastAPI(title="Claims Policy Assistant")


class AskRequest(BaseModel):
    question: str = Field(min_length=3, max_length=500)
    # Demo only: in production, derive groups from the verified auth token, never the body.
    user_groups: list[str] = ["public"]


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "llm_mode": os.getenv("LLM_MODE", "fake")}


@app.post("/ask")
def ask(req: AskRequest) -> dict:
    start = time.perf_counter()
    llm = LLM()
    graph = build_graph(llm, max_rewrites=int(os.getenv("MAX_REWRITES", "2")))
    out = graph.invoke({"question": req.question, "query": req.question,
                        "groups": req.user_groups, "rewrites": 0})
    metrics = {
        "request_id": uuid.uuid4().hex[:12],
        "latency_ms": round((time.perf_counter() - start) * 1000, 1),
        "tokens_in": llm.tokens_in,
        "tokens_out": llm.tokens_out,
        "est_cost_usd": llm.cost_usd(),
        "rewrites": out["rewrites"],
        "grounded": out["grounded"],
        "llm_mode": llm.mode,
    }
    log.info(json.dumps(metrics))
    return {"answer": out["answer"], "sources": out["sources"], "metrics": metrics}
