# Project 8: RAG with evals

## Goal
Build a small retrieval-augmented generation (RAG) pipeline over 10 generated company policy documents: ingest, chunk, embed, store, retrieve top-k with an access-control (ACL) filter, answer with citations, and measure it with a 15-question golden set (recall@k, fact accuracy, faithfulness, ACL leaks).

## What you will learn
- The RAG pipeline end to end, and where each piece can fail.
- Filtering by permission before ranking, so restricted text never reaches the model.
- Citations as a contract: every sentence points at a chunk id you can check.
- Evals as a quality gate: a script that prints metrics and exits non-zero when they drop.

## Prerequisites
- Python 3.10+, numpy basics helpful.
- Optional: Anthropic API key (real answers), Docker (pgvector), about 1 GB of disk for sentence-transformers.

## Layout
```
p8-rag-evals/
  docs/                 # 10 policy docs, each with title + acl front matter
  evals/golden.jsonl    # 15 questions: expected doc, key fact, user groups
  rag/
    __init__.py
    embed.py            # HashingEmbedder (offline) + SentenceTransformerEmbedder (real)
    index.py            # load, chunk, InMemoryStore (numpy), retrieve with ACL
    answer.py           # fake (top chunk) or real (Claude) answers with [chunk-id] citations
  ask.py                # ask one question
  eval.py               # run the golden set and quality gates
  tests/test_rag.py
  docker-compose.yml    # optional pgvector
  requirements.txt  .env.example
```

## Setup
macOS / Linux:
```bash
cd p8-rag-evals
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
Windows PowerShell:
```powershell
cd p8-rag-evals
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Run
```bash
python ask.py "How many weeks of parental leave do primary caregivers get?"
python ask.py "What is the salary band for L4 engineers?"              # regular user: abstains
python ask.py "What is the salary band for L4 engineers?" --groups hr  # HR user: answers
python eval.py
```
`eval.py` prints one row per question and a summary like:
```
{ "recall@3": 1.0, "fact_accuracy": 1.0, "faithfulness": 1.0, "acl_leaks": 0, "questions": 15 }
```
It exits with code 1 if recall@k < 0.8, faithfulness < 0.8, or any ACL leak, so CI can block a bad change.

Now try `python ask.py "How much vacation do I get?"`. The hashing embedder abstains because the PTO doc never says "vacation". That is the limit of lexical matching, and why real embeddings exist.

## Real mode
```bash
pip install sentence-transformers
export EMBED_MODE=st LLM_MODE=real ANTHROPIC_API_KEY=your-key MODEL=claude-sonnet-5
python eval.py
```
PowerShell: `$env:EMBED_MODE="st"; $env:LLM_MODE="real"; $env:ANTHROPIC_API_KEY="your-key"; $env:MODEL="claude-sonnet-5"`.
Real mode costs money (15 API calls per eval run). Note: `MIN_SCORE` in `rag/answer.py` is tuned for the hashing embedder; re-tune it for a new embedder.

## pgvector (documented, optional)
The numpy `InMemoryStore` is the fallback so everything runs without Docker. To use Postgres:
```bash
docker compose up -d
```
```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE chunks (id text PRIMARY KEY, doc_id text, title text, acl text, body text, embedding vector(384));
CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);
-- top-k with ACL filter; <=> is cosine distance, so smaller is closer
SELECT id, body, 1 - (embedding <=> %(q)s) AS score
FROM chunks WHERE acl = ANY(%(allowed)s)
ORDER BY embedding <=> %(q)s LIMIT %(k)s;
```
384 is the dimension of all-MiniLM-L6-v2; the hashing embedder uses 1024.

## Test
```bash
python -m pytest -q
```
Expected: `7 passed`, offline, in about a second.

## Stretch goals
1. Implement `PgVectorStore` with the same `add` / `search` methods and switch with `VECTOR_STORE=pgvector`.
2. Add 5 paraphrased golden questions ("vacation", "work from home") and compare hashing vs sentence-transformers recall.
3. Replace the word-overlap faithfulness check with an LLM-as-judge and measure how often the two disagree.
4. Add hybrid search (BM25 plus vectors) and a reranker; report recall@1 before and after.
