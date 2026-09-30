"""Support ticket API skeleton. Make tests/test_app.py pass. The clock is running."""
from fastapi import FastAPI, Request

from app.classifier import LEVELS, classify  # noqa: F401  (you will need both)

app = FastAPI(title="Ticket Triage")
TICKETS: dict[str, dict] = {}  # ticket_id -> ticket dict. Keep it in memory; do not add a DB.


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "tickets": len(TICKETS)}


@app.post("/ingest")
async def ingest(request: Request) -> dict:
    # TODO: read the raw CSV body, validate each row (required fields, ISO date, tier),
    # classify it, upsert into TICKETS, and return
    # {"ingested": int, "rejected": [{"line": int, "error": str}], "total_stored": int}.
    # A CSV without the required header columns should return HTTP 400.
    raise NotImplementedError


@app.get("/tickets")
def list_tickets(priority: str | None = None, status: str | None = None) -> list[dict]:
    # TODO: filter by priority/status, oldest first. Unknown priority -> HTTP 422.
    raise NotImplementedError


@app.get("/summary")
def summary() -> dict:
    # TODO: {"total", "by_priority", "by_status", "open_high" (oldest first), "top_customers" (top 3)}
    raise NotImplementedError
