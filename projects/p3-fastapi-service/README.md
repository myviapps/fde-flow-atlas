# Project 3: FastAPI tickets service

A small, production-shaped REST API for support tickets: create, list, get and update,
protected by an API key, stored in SQLite through SQLAlchemy 2, validated with Pydantic v2,
and covered by pytest tests that use FastAPI's TestClient.

## What you'll learn
- Designing request and response models with Pydantic v2 (validation, enums, partial updates)
- SQLAlchemy 2 typed ORM models and a per-request session dependency
- Auth as a dependency (`X-API-Key`), with 401 vs 403 and fail-closed config
- Correct status codes: 201 created, 200 ok, 401, 403, 404, 422
- Testing an API with an in-memory database and dependency overrides

## Prerequisites
Python 3.10+ and a terminal. No Docker needed.

## Setup
macOS / Linux:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
Windows PowerShell:
```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Run
```bash
export API_KEY=dev-key            # PowerShell: $env:API_KEY="dev-key"
uvicorn app.main:app --reload
```
Open http://127.0.0.1:8000/docs for the interactive docs (click Authorize and paste the key), or:
```bash
curl -X POST localhost:8000/tickets -H "X-API-Key: dev-key" -H "Content-Type: application/json" -d '{"title":"VPN down","priority":"high"}'
curl localhost:8000/tickets -H "X-API-Key: dev-key"
curl -X PATCH localhost:8000/tickets/1 -H "X-API-Key: dev-key" -H "Content-Type: application/json" -d '{"status":"closed"}'
```
Data is stored in `tickets.db` (set `DATABASE_URL` to change it).

## Test
```bash
pytest -q
```
Expected: `6 passed`.

## Endpoints
| Method | Path | Success | Errors |
|---|---|---|---|
| POST | /tickets | 201 | 401, 403, 422 |
| GET | /tickets?status=&limit=&offset= | 200 | 401, 403, 422 |
| GET | /tickets/{id} | 200 | 401, 403, 404 |
| PATCH | /tickets/{id} | 200 | 401, 403, 404, 422 |

## Stretch goals
- Add `DELETE /tickets/{id}` returning 204, and a test for it.
- Replace `create_all` with Alembic migrations.
- Add a `comments` table with a one-to-many relationship.
- Swap SQLite for Postgres with only a `DATABASE_URL` change.
