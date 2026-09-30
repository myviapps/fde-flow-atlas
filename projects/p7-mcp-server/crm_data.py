"""A tiny in-memory mock CRM. Plain Python, no MCP here, so it is easy to unit test."""
from datetime import date

CUSTOMERS = {
    "C001": {"name": "Acme Test Co", "industry": "manufacturing", "stage": "customer", "arr": 120000, "owner": "Sam"},
    "C002": {"name": "Globex Sample Ltd", "industry": "logistics", "stage": "trial", "arr": 0, "owner": "Priya"},
    "C003": {"name": "Initech Demo Inc", "industry": "software", "stage": "negotiation", "arr": 45000, "owner": "Sam"},
    "C004": {"name": "Umbrella Example LLC", "industry": "healthcare", "stage": "churned", "arr": 0, "owner": "Lee"},
}
NOTES = {"C001": ["Renewal due in November."], "C003": ["Asked for SSO before signing."]}


def reset():
    """Restore the starting notes (used by tests)."""
    NOTES.clear()
    NOTES.update({"C001": ["Renewal due in November."], "C003": ["Asked for SSO before signing."]})


def search(query: str, limit: int = 5) -> list[dict]:
    q = query.lower().strip()
    hits = [
        {"id": cid, **c}
        for cid, c in CUSTOMERS.items()
        if q in c["name"].lower() or q == c["industry"] or q == c["stage"]
    ]
    return hits[: max(1, min(limit, 20))]


def get(customer_id: str) -> dict:
    if customer_id not in CUSTOMERS:
        raise ValueError(f"Unknown customer id {customer_id!r}. Use search_customers first.")
    return {"id": customer_id, **CUSTOMERS[customer_id], "notes": NOTES.get(customer_id, [])}


def add_note(customer_id: str, text: str) -> dict:
    get(customer_id)  # raises for unknown ids
    text = text.strip()
    if not 1 <= len(text) <= 500:
        raise ValueError("Note must be 1 to 500 characters.")
    NOTES.setdefault(customer_id, []).append(f"{date.today().isoformat()}: {text}")
    return {"id": customer_id, "notes": NOTES[customer_id]}


def pipeline_summary() -> str:
    lines = ["# Pipeline summary"]
    for stage in ["trial", "negotiation", "customer", "churned"]:
        names = [c["name"] for c in CUSTOMERS.values() if c["stage"] == stage]
        lines.append(f"- {stage}: {len(names)} ({', '.join(names) or 'none'})")
    total = sum(c["arr"] for c in CUSTOMERS.values())
    lines.append(f"\nTotal ARR: ${total:,}")
    return "\n".join(lines)
