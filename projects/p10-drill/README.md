# Timed drill: 90-minute build (support ticket triage API)

Practice the most common FDE interview and first-week task: take a messy CSV from a customer,
turn it into a small working API, and explain your trade-offs. Set a 90-minute timer.

## The brief (read this, then start the clock)

> "We export our support tickets as a CSV (`data/tickets.csv`). Build an API that ingests the
> file, classifies each ticket's priority (low, medium, high), and serves a summary our support
> lead can check every morning. Enterprise customers are contractually higher priority.
> The export is not always clean."

Required endpoints:

| Endpoint | Behaviour |
|---|---|
| `POST /ingest` | Raw CSV body. Validate rows, classify, upsert by `ticket_id`. Return `{"ingested", "rejected": [{"line", "error"}], "total_stored"}`. Missing header columns returns 400. |
| `GET /tickets?priority=&status=` | Filtered list, oldest first. Unknown priority returns 422. |
| `GET /summary` | `total`, `by_priority`, `by_status`, `open_high` (oldest first), `top_customers` (top 3). |

Rules: in-memory storage is fine. Rules-based classification is fine. An LLM is optional and
must fall back to rules if it fails. `starter/tests/test_app.py` is the acceptance test.

## What you'll learn

Scoping under time pressure, validating dirty input without crashing, choosing rules before
an LLM, test-first delivery, and giving a clear demo at the end.

## Setup

macOS / Linux:
```bash
cd p10-drill
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```
Windows PowerShell:
```powershell
cd p10-drill
py -m venv .venv; .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Minute-by-minute plan

| Minutes | Do this |
|---|---|
| 0-5 | Read the brief and the CSV. Write 3 assumptions at the top of `app/main.py` (for example: upsert on duplicate id, bad rows are reported not fatal). |
| 5-10 | `cd starter`, run `python -m pytest -q`. See 6 failures. Start `uvicorn app.main:app --reload`, check `/health`. |
| 10-25 | `classify_rules`. Get `test_rules` green. |
| 25-45 | `/ingest`: `csv.DictReader`, validate, record rejected lines, upsert. Get the ingest tests green. |
| 45-55 | `/tickets` with filters and the 422 check. |
| 55-70 | `/summary`. All 6 tests green. Commit. |
| 70-80 | Buffer: fix whatever broke. Only if green: optional LLM path with fallback. |
| 80-87 | Write a 10-line README: how to run, assumptions, what you'd do next. |
| 87-90 | Rehearse a 2-minute demo: ingest, summary, one trade-off. |

If you are stuck for more than 10 minutes on one step, write a TODO, move on, and come back.

## Run

```bash
cd starter            # or solution/ to see the reference
uvicorn app.main:app --reload
curl -X POST localhost:8000/ingest -H "Content-Type: text/csv" --data-binary @../data/tickets.csv
curl localhost:8000/summary
```
Windows PowerShell: `Invoke-RestMethod -Method Post -Uri localhost:8000/ingest -ContentType text/csv -InFile ..\data\tickets.csv`

## Test

```bash
cd starter && python -m pytest -q    # 6 failed at the start, 6 passed when you're done
cd solution && python -m pytest -q   # reference: 6 passed
```

Only open `solution/` after your 90 minutes, then compare.

## Self-scoring rubric (100 points)

| Area | Points | Full marks when |
|---|---|---|
| Works | 30 | All 6 acceptance tests pass. |
| Input handling | 15 | Bad rows reported with line numbers; bad header is 400; re-ingest does not duplicate. |
| Classification | 15 | Rules are readable, enterprise bump applied, logic isolated in one function. |
| Code quality | 10 | Small functions, clear names, no dead code, no secrets. |
| Your own tests | 10 | At least one test you wrote beyond the given ones (for example unknown tier). |
| README and assumptions | 10 | Someone else can run it in 2 minutes and sees your assumptions. |
| Demo and trade-offs | 10 | 2-minute walkthrough naming one trade-off (rules vs LLM, memory vs DB). |

70+ is interview-ready. Under 50: repeat the drill in a week with a fresh timer.

## Stretch goals

- `LLM_MODE=real`: classify with an LLM, validate the label, fall back to rules on any error (the solution shows one way).
- Persist tickets in SQLite so a restart keeps data.
- Add `GET /summary?since=2026-09-15` and a stale-ticket alert (open high older than 3 days).
- Repeat the drill with a different dataset (orders, invoices) to build speed.
