# Capstone: agentic RAG service (Claims Policy Assistant)

One deployable service that answers questions about insurance claims policies, only from
documents the caller is allowed to see, and says "I don't know" instead of guessing.

## The customer case

A mid-size insurer ("Northwind Mutual", fictional) has claims-policy documents spread across
public policy wording, adjuster manuals and a fraud playbook. Adjusters waste time searching,
and the call centre gives inconsistent answers. They want an assistant that:

- answers from the policy text, with citations, so a supervisor can check it;
- never shows an adjuster-only or fraud-team rule to a policyholder (ACL);
- refuses when the documents do not cover the question (no invented coverage);
- reports cost and quality per request so the insurer's IT team can run it.

Success criteria agreed with the customer: 90%+ correct on the golden set, 100% of shipped
answers grounded, zero ACL leaks, p95 latency under 3 seconds in real mode.

## What you'll learn

- A LangGraph `StateGraph` with a loop: retrieve, grade, rewrite (with a retry cap), generate, grounding check.
- Retrieval with ACL filtering applied before ranking.
- An offline `LLM_MODE=fake` so tests and eval run without a key or network.
- Per-request JSON metrics: latency, tokens, estimated cost, grounded yes/no.
- An eval script over a golden set that can gate CI.
- Packaging with a Dockerfile and docker compose.

## Prerequisites

Python 3.10+, basic FastAPI and pytest. Docker is optional. An Anthropic API key is optional.

## Setup

macOS / Linux:
```bash
cd p9-capstone
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```
Windows PowerShell:
```powershell
cd p9-capstone
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

## Run

```bash
uvicorn app.main:app --reload            # http://127.0.0.1:8000/docs
curl -X POST localhost:8000/ask -H "Content-Type: application/json" \
  -d '{"question": "Is flood damage from surface water covered?", "user_groups": ["public"]}'
python demo.py                            # the scripted customer demo
python eval.py                            # golden-set scorecard, exit code 1 if below threshold
```

Real mode: set `LLM_MODE=real`, `ANTHROPIC_API_KEY` and `MODEL` (a model id from the Anthropic
docs) in your environment, then run the same commands. Set the price variables to your current
price sheet so the cost estimate is right.

Docker:
```bash
docker compose up --build                 # api on :8000, fake mode by default
docker compose --profile pgvector up      # also starts Postgres with pgvector
```

## Test

```bash
python -m pytest -q        # 8 passed, no network needed
```

## How the graph works

```
START -> retrieve -> grade --relevant--> generate -> check -> END
                       |                    ^
                       +--none, rewrites<N--> rewrite -> retrieve
                       +--none, rewrites=N-----------------> generate (refusal)
```

`check` is a guardrail: if the draft answer is not supported by the retrieved text, the
service returns the refusal and logs `grounded: false`.

## Moving to pgvector

The in-memory index in `app/corpus.py` mirrors this SQL:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE docs (id text PRIMARY KEY, acl text[] NOT NULL, body text, embedding vector(256));
CREATE INDEX ON docs USING hnsw (embedding vector_cosine_ops);
-- search: ACL filter first, then nearest neighbours
SELECT id, body FROM docs WHERE acl && $1::text[] ORDER BY embedding <=> $2 LIMIT 3;
```
Swap `search()` for a function that runs that query (psycopg), keep the same signature, and
the graph does not change. Use a real embedding model and set the vector size to match it.

## Demo script (3 minutes)

1. Policyholder asks a plain question: answer plus citation.
2. Casual wording ("car crash"): watch `rewrites=1` rescue retrieval.
3. Adjuster asks about approval limits: gets the adjuster manual.
4. Same question as a policyholder: refusal, proving the ACL works.
5. Off-topic question: refusal after the retry cap, not a made-up answer.
Close on the metrics line and the eval scorecard: this is what their IT team will monitor.

## Stretch goals

- Replace the hashing embedder with a real embedding model and the pgvector query above.
- Add a `/feedback` endpoint and feed thumbs-down answers into the golden set.
- Run `eval.py` in GitHub Actions on every pull request.
- Optional, document only: QLoRA fine-tune a small open model on (question, cited answer)
  pairs to cut cost for the grading step. Steps: collect 1-5k graded pairs from logs, load the
  base model in 4-bit (bitsandbytes), train LoRA adapters with PEFT on one GPU, then compare
  against the prompted model on the same golden set before switching. Do not run it as part of
  this project; RAG plus evals should come first.
