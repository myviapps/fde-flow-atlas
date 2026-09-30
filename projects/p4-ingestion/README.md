# Project 4: resilient ingestion

Pull customers from a flaky, paginated API and land them safely in SQLite. The mock API
throws 429 rate limits and 500 errors and serves malformed rows on purpose. The client:

- follows an opaque `next_cursor` page by page
- retries 429/5xx with exponential backoff plus jitter (tenacity), but never retries 4xx
- validates every row with Pydantic; good rows are upserted, bad rows go to a `dead_letter` table with the reason
- saves the cursor checkpoint in the same transaction as the page's rows, so a crash resumes exactly where it stopped, with no duplicates

## What you'll learn
Retry policy design, idempotent writes, checkpointing, dead-letter queues, and testing
failure paths deterministically.

## Prerequisites
Python 3.10+. No network, no API keys, no Docker. SQLite ships with Python.

## Setup
macOS / Linux:
```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```
Windows PowerShell:
```powershell
py -m venv .venv; .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Run
```bash
python run.py                     # mock returns 429 then 500 before behaving
python run.py                     # second run: "already complete; nothing to do"
python run.py --db fresh.db --fail 503,503,429
```
Inspect results: `sqlite3 ingest.db "select * from dead_letter"` (or open it in DB Browser for SQLite).
Delete `ingest.db` to start over.

## Test
```bash
pytest -q
```
Expected: `7 passed`. Tests pass `wait=wait_none()` so retries do not actually sleep.

## Files
- `ingest/mock_api.py` the misbehaving API (scriptable failures, deterministic data)
- `ingest/models.py` the Pydantic contract for a valid customer
- `ingest/store.py` SQLite tables: customers, dead_letter, checkpoint
- `ingest/client.py` fetch with retries, validate, store, loop over pages
- `run.py` command-line entry point

## Stretch goals
- Honor the `Retry-After` header on 429 instead of the computed backoff.
- Wrap the mock in a tiny FastAPI app and call it with `httpx`, adding request timeouts.
- Add a `reprocess_dead_letters()` that re-validates DLQ rows after you fix a rule.
- Emit metrics (rows/sec, retry count, DLQ rate) and alert if the DLQ rate passes 5%.
