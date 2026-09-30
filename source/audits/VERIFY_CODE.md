# Code verification: lessons a–r, concepts, cases 1–4 and m–r, patch_s

Scope: lessons_a..lessons_r (.json), their *_concepts.json, cases_1..4, cases_m..r, patch_s.json.
The checks covered 652 code blocks, found by walking every object that has a `code` string.

| Language | Blocks |
|---|---|
| Python (labelled Python, plus unlabelled concept code that parses as Python) | 325 (plus 6 empty `code` strings) |
| SQL | 69 |
| bash | 40 |
| Other (Text 154, YAML 29, JSON 7, Terraform, Cypher, HTML, etc.) | 212. Not in scope. JSON and YAML were parse-checked as a bonus. |

## Python (325 blocks)

- **Syntax:** all 325 pass `ast.parse`. No syntax errors.
- **(a) Run and passed: 187**
  - 163 ran on their own, with a 20 s timeout in a temp dir.
  - 6 are fragments that pass when run together with the earlier blocks of the same lesson:
    - lessons_a resilient (its pytest suite: 2 passed)
    - lessons_m oop/2, mlmetrics/1, mlmetrics/3
    - lessons_p roi/4
  - 3 are multi-file blocks (`# pricing.py`, `# test_pricing.py`, ...). They were split into files and run with pytest, and all pass: lessons_e tdd/0, tdd/1 and lessons_l_concepts build drill.
  - 12 need an input file. They were run against small synthetic fixtures and all behave as intended:
    - sales.csv blocks in lessons_g and g_concepts
    - lessons_c evals/1, 4, 5
    - lessons_d pod/2, lastmile/3
    - lessons_l career/3
    - cases_1 computers, python1, python2
  - 3 needed small harnesses:
    - stdin input for the BMI example
    - an argv JSON file for the refund script
    - a stub redis/db for the cache-aside example
- **Printed-output comments:** every `print(...)  # expected` comment and every commented output block in the runnable blocks was compared with real output. About 110 comparisons, 0 mismatches. This includes:
  - pandas tables (lessons_q)
  - ROI/NPV tables (lessons_p, cases_p)
  - stats and ML metrics (lessons_m)
  - numpy math (lessons_h)
  - DSA answers (lessons_j)
  - patch_s blocks
- **(b) Needs network, keys, cloud or services, so syntax-check only: 117**
  - Anthropic, OpenAI, boto3 (SQS, DynamoDB, Bedrock, Secrets Manager), redis, Kafka, neo4j, mlflow, pyspark, HF transformers/peft/trl, sentence-transformers, mcp, celery, opentelemetry, fastai, streamlit, locust, pymongo, paramiko, zeep, Claude Agent SDK, and real HTTP hosts.
  - The Anthropic SDK calls were read by hand and all use real API surface:
    - `messages.create`, `.stream` with `text_stream` and `get_final_message`
    - `count_tokens`, `batches.create`
    - `cache_control`, `tool_choice`, `thinking`
    - PDF `document` blocks and `image` blocks
    - the exception classes, and `AnthropicVertex(project_id, region)`
  - Bedrock `converse` usage is also correct.
  - Model names are placeholders throughout.
- **(c) Fragments by design, syntax-check only: 21**
  - They use names from other blocks or files: `app`, `emails`, `latencies`, `y_val`, test files for modules not shown, LangGraph sketch, FastAPI+Celery sketch, and so on.
  - Two are interactive by design:
    - the `http.server` example runs forever
    - the pdb `breakpoint()` example
  - pyflakes was run on every block to look for missing standard-library imports. The only true gap was the one fixed below. The other hits were imported in an earlier subtopic of the same lesson, or are deliberately partial concept sketches.

## SQL (69 blocks)

- **SQLite, 18 blocks executed:**
  - 8 self-contained blocks ran cleanly.
  - lessons_h dbbasics/0 raises its UNIQUE violation on purpose ("rejected: not unique").
  - 9 fragments ran on the schema from the earlier subtopic.
  - All 10 expected-result tables in lessons_p sqlbank match the real query output exactly.
- **Postgres dialect, 44 blocks:** these use intervals, `EXPLAIN (ANALYZE)`, pgvector, RLS, `ON CONFLICT` and similar. All parse with pglast, the real Postgres parser.
- **Not Postgres by design, 7 blocks:**
  - Spark/Databricks `CREATE OR REPLACE TABLE`
  - BigQuery backticks
  - 3 dbt/Jinja models
  - a `:param` bind-variable query
  - one concept block that mixes Python and SQL

## bash (40 blocks)

- 38 pass `bash -n`.
- 2 fail by design:
  - lessons_b deploy/0 uses a `<container_id>` placeholder
  - lessons_g terminal/5 mixes a shell snippet with a labelled `# convert.py` Python file

## JSON / YAML (bonus parse check)

- All strict JSON and YAML blocks parse.
- 3 JSON blocks do not parse by design:
  - JSONC with `//` comments
  - JSONL eval cases
  - a commented Curator delta
- 2 YAML blocks do not parse by design:
  - an ASCII RACI grid
  - a Helm template with `{{ }}`

## Fixes made (2)

1. **lessons_i.json › caching › subtopics[2] "Cache-aside, TTLs and invalidation"** (Python)
   - The block calls `json.loads` / `json.dumps` but only did `import random`. No earlier subtopic in the lesson imports json.
   - Changed `import random` to `import json, random`.
   - Re-ran it with a stub redis client and DB: it returns 412.0 on the miss and again on the hit.
2. **lessons_q.json › debugging › subtopics[1] "Reading tracebacks and logs"** (Text, a Python traceback shown as output)
   - The traceback was missing the `<genexpr>` frame that Python really prints for `sum(parse_total(r) for r in rows)`. The pdb `w` output in the next subtopic does show that frame.
   - Inserted the missing frame:
     ```
     File "invoices.py", line 8, in <genexpr>
       return sum(parse_total(r) for r in rows)
     ```
   - Checked against real Python 3.11 output.

Both files were rewritten with `json.dumps(..., ensure_ascii=False, indent=1)`, the same format as the originals (checked byte-for-byte before editing).

## Not verified

- The 117 service-bound Python blocks were checked for syntax and API names only. They were not executed.
- The 21 fragments were checked for syntax only, apart from the combined runs listed above.
- The 44 Postgres SQL blocks were parsed only, not executed on a Postgres server.
- The 38 bash blocks were syntax-checked only. They were not executed (curl, git, docker, kubectl, helm).
- Text, Terraform, Cypher, Dockerfile, TypeScript/JavaScript, Protobuf and HCL blocks were not checked.
