"""Support ticket API: ingest CSV, classify priority, serve a summary."""
import csv
import io
from collections import Counter
from datetime import date

from fastapi import FastAPI, HTTPException, Request

from app.classifier import LEVELS, classify

app = FastAPI(title="Ticket Triage")
TICKETS: dict[str, dict] = {}  # in-memory store keyed by ticket_id (upsert = idempotent ingest)
REQUIRED = ["ticket_id", "created_at", "customer", "subject"]
TIERS = {"free", "pro", "enterprise"}


def parse_row(row: dict) -> dict:
    """Validate one CSV row; raise ValueError with a readable message if it is bad."""
    missing = [f for f in REQUIRED if not (row.get(f) or "").strip()]
    if missing:
        raise ValueError(f"missing {', '.join(missing)}")
    created = date.fromisoformat(row["created_at"].strip())  # ValueError on a bad date
    tier = (row.get("tier") or "free").strip().lower()
    if tier not in TIERS:
        raise ValueError(f"unknown tier {tier!r}")
    status = (row.get("status") or "open").strip().lower()
    priority, method = classify(row["subject"], row.get("body") or "", tier)
    return {"ticket_id": row["ticket_id"].strip(), "created_at": created.isoformat(),
            "customer": row["customer"].strip(), "tier": tier, "subject": row["subject"].strip(),
            "status": status, "priority": priority, "classified_by": method}


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "tickets": len(TICKETS)}


@app.post("/ingest")
async def ingest(request: Request) -> dict:
    text = (await request.body()).decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames or not set(REQUIRED) <= set(reader.fieldnames):
        raise HTTPException(400, f"CSV header must include {REQUIRED}")
    ingested, rejected = 0, []
    for line_no, row in enumerate(reader, start=2):  # line 1 is the header
        try:
            ticket = parse_row(row)
        except ValueError as e:
            rejected.append({"line": line_no, "error": str(e)})
            continue
        TICKETS[ticket["ticket_id"]] = ticket
        ingested += 1
    return {"ingested": ingested, "rejected": rejected, "total_stored": len(TICKETS)}


@app.get("/tickets")
def list_tickets(priority: str | None = None, status: str | None = None) -> list[dict]:
    if priority and priority not in LEVELS:
        raise HTTPException(422, f"priority must be one of {LEVELS}")
    rows = [t for t in TICKETS.values()
            if (not priority or t["priority"] == priority) and (not status or t["status"] == status)]
    return sorted(rows, key=lambda t: t["created_at"])


@app.get("/summary")
def summary() -> dict:
    tickets = list(TICKETS.values())
    open_high = sorted((t for t in tickets if t["status"] == "open" and t["priority"] == "high"),
                       key=lambda t: t["created_at"])
    return {
        "total": len(tickets),
        "by_priority": {lvl: sum(t["priority"] == lvl for t in tickets) for lvl in LEVELS},
        "by_status": dict(Counter(t["status"] for t in tickets)),
        "open_high": [{"ticket_id": t["ticket_id"], "customer": t["customer"],
                       "created_at": t["created_at"], "subject": t["subject"]} for t in open_high],
        "top_customers": Counter(t["customer"] for t in tickets).most_common(3),
    }
