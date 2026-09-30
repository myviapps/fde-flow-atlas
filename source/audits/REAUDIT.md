# FDE Flow Atlas: re-audit (gaps and formats)

Scope: 85 topics + 11 projects in `build/build3.py` FULL, checked against `/mnt/project-files/FDE_Course_Structure.md`,
common FDE job descriptions (Anthropic, OpenAI, Palantir, Scale, Ramp, Databricks style postings), lesson subtopic titles and
full-text search of all lesson bodies. 29 topics have widgets (widgets_1..4). docs_pack.json has 16 templates.

Coverage of the course outline is now essentially complete: every outline bullet (Gotham/Foundry, Echo/Delta, NRR, RoPE,
BPE, ACE, Letta Context-Bench, Agent Skills, LoRA/QLoRA/distillation, Auftragstaktik, TTV, Rocketlane PSA, 4Ds,
Project A/B, 40/30/20/10 interview pillars, compensation) is found in at least one lesson. The remaining gaps are
beginner skills the outline assumes but never teaches, plus what current FDE job postings ask for.

Priority key: P0 = must-have before a beginner is hireable, P1 = should-have, P2 = nice-to-have.

---

## 1. Missing topics

### P0-1 `pandas` (module 0, "Data wrangling with pandas")
Why: Customer data arrives as messy CSV/Excel exports; almost every FDE posting lists pandas. Today pandas is one
subtopic in python2 ("A first look at pandas"); no lesson mentions fillna, merge, dtypes or date parsing, yet
p1-csv-cleaner and the outline ("handling missing data") depend on it.
Subtopics:
- DataFrames, Series and reading CSV/Excel/JSON
- Selecting, filtering and assigning (loc, iloc, boolean masks)
- Missing data, dtypes and parsing dates
- groupby, aggregation and pivot tables
- Joining with merge and spotting fan-out
- Validating a cleaned dataset before handing it over
Format: practice, interactive (live DataFrame playground via Pyodide).

### P0-2 `debugging` (module 2, "Debugging and unfamiliar code")
Why: FDEs are dropped into customer codebases and broken integrations; "debug the tech" is in the outline, but no
lesson covers pdb/breakpoints, bisecting or reading a stranger's repo (0 hits for pdb, breakpoint, debugger).
Subtopics:
- A method: reproduce, isolate, hypothesise, verify
- Reading tracebacks and logs to find the first real error
- Breakpoints and pdb / VS Code debugger
- Minimal reproductions and git bisect
- Finding your way around an unfamiliar codebase
- Writing up a bug so someone else can fix it
Format: practice, animation.

### P0-3 `llmapi` (module 3, "Calling LLM APIs")
Why: Every AI FDE's first task is calling a model API well. No lesson covers message roles, sampling (temperature,
top_p: 0 hits in LLM context), streaming basics, API error handling for LLMs, or enterprise access through
AWS Bedrock / Azure OpenAI / Vertex AI (0 hits), which is how most enterprise customers must consume models.
Subtopics:
- Messages, roles and the system prompt
- Sampling: temperature, top_p, max_tokens and stop sequences
- Streaming responses and token usage fields
- Errors, rate limits, retries and model fallbacks
- Enterprise access: Bedrock, Azure OpenAI, Vertex and LLM gateways
- Pinning model versions and handling deprecations
Format: interactive (sampling playground: temperature vs output spread), reading.

### P0-4 `aicoding` (module 7 or 2, "Working with AI coding tools")
Why: FDE postings now expect fluent use of Claude Code, Cursor, Copilot to ship fast at a customer. Only one
passing mention (frameworks). The outline's "vibe coding" is framed as an anti-pattern, never as a skill to do well.
Subtopics:
- What coding agents are good and bad at
- Giving the agent context: CLAUDE.md, specs and tests first
- Reviewing and verifying generated code
- Security and data rules when coding on customer systems
- Using agents to learn an unfamiliar codebase fast
Format: practice, reading.

### P1-5 `dataformats` (module 0, "Data formats, encodings and time")
Why: Most last-mile breakage is mundane: UTF-8 vs Latin-1, Excel dates, timezones (1 hit, in git), regex parsing
(no teaching lesson), XML, Parquet. lastmile and integration assume this knowledge.
Subtopics:
- Text encodings and the UTF-8 bugs you will meet
- Dates, times, timezones and UTC storage
- Regular expressions for parsing messy fields
- JSON, XML, CSV quirks and Parquet
- Validating schemas with JSON Schema and Pydantic
Format: practice, interactive (regex and date-parsing tester).

### P1-6 `entnetwork` (module 2, "Enterprise networks and access")
Why: On-site, the first blocker is often the corporate network: proxies, TLS inspection with custom CA certificates,
firewall allowlists, VPN, private endpoints. internet and cloud cover the basics but not the enterprise reality.
Subtopics:
- Corporate proxies and HTTPS_PROXY
- TLS inspection and custom CA bundles
- Firewalls, allowlists and egress rules
- VPNs, bastions and private endpoints
- Diagnosing "it works on my laptop but not in their network"
Format: flowchart (diagnosis tree), reading.

### P1-7 `tabularml` (module 3, "Classic ML on tabular data")
Why: Many enterprise AI asks (churn, fraud, forecasting) are best solved with gradient boosting, not LLMs; an FDE
must recognise that. mlbasics stops at scikit-learn basics; feature engineering / XGBoost / forecasting have 0 hits.
Subtopics:
- Framing a business question as a prediction
- Feature engineering and leakage
- Gradient boosted trees (XGBoost, LightGBM)
- Time-series forecasting basics
- When classic ML beats an LLM
Format: reading, project.

### P1-8 `poc` (module 4, "Pre-sales POCs and scoping")
Why: FDEs often run technical proof-of-concepts before a contract and must estimate effort; "estimation", "RFP",
"proof of concept" have 0 hits (POC appears only in passing).
Subtopics:
- POC versus pilot versus production
- Written success criteria before you start
- Estimating effort and sizing work
- Answering RFP technical sections
- Turning a POC into a signed deal
Format: document, reading.

### P2-9 `pytooling` (module 0, "Python project tooling")
Why: pyproject, uv/poetry, ruff, mypy and the logging module appear only in passing; beginners need a clean repo
layout to pass take-homes. (Could instead be subtopics in oop/tdd; see section 2.)
Subtopics: pyproject and dependency management (uv, pip-tools); Linting and formatting (ruff); Type checking (mypy);
The logging module and config; Makefiles and task runners.
Format: practice, reading.

---

## 2. Thin topics / missing subtopics

P0
- evals: "Evaluating agents: trajectories and tool-call accuracy"; "RAG metrics: faithfulness and context recall" (agent eval and context recall: 0 hits).
- rag: "Ingesting from SharePoint, Drive and Confluence with permission sync"; "Keeping the index fresh: updates and deletes".
- deploy: "Debugging pods: kubectl logs, describe, CrashLoopBackOff" (0 hits); "Packaging with Helm charts".
- cloud: "Managed AI services: Bedrock, Azure OpenAI, Vertex AI" (0 hits).
- demo (shortest lesson, 8.8k chars, 5 short subtopics): "Demo environments and seeded data"; "Rehearsal and a recorded backup"; "Running the POC readout".

P1
- genesis: "FDEs at AI labs and SaaS today (Anthropic, OpenAI, Stripe, Datadog)" (Blueprint slide 4); "Diagnostic: does this company need FDEs?" (slide 12, 0 hits); "The 70-80% code time split".
- etl / integration: "Detecting and handling schema drift" (0 hits).
- linux: "Writing small bash scripts safely" (0 hits for shell/bash scripting).
- pm: "Estimating effort and T-shirt sizing".
- transformer: "Decoding: greedy, temperature and top_p" (0 hits for greedy).
- tools: "Computer-use and browser agents" (0 hits).
- oop or tdd: "Project layout: pyproject, ruff, mypy" (if pytooling is not added).
- slg: "SLG vs product-led and sales-led growth" (lesson is 9.6k, below average).
- computers: "Memory, disk and why your laptop runs out" (lesson is 9.9k, below average).
- observability: "The Python logging module in practice" (0 hits for logging module).

---

## 3. Interactive tools worth adding (no widget today)

Already marked interactive in fit.json (build these first):
- sqlbank: in-browser SQL runner (sql.js) that grades each exercise against expected rows.
- git: commit-graph playground; type commit, branch, merge, reset and watch the graph change.
- terminal: sandboxed fake shell with a small filesystem to practise cd, ls, mkdir, cat and env vars.
- planner: toggle indexes on a sample table and compare the EXPLAIN plan and estimated cost.
- acid: two-transaction stepper that shows dirty read, lost update and phantom per isolation level.

Worth considering next:
- pandas (new): Pyodide DataFrame playground with a dirty CSV and checks.
- llmapi (new): sampling playground showing output spread as temperature and top_p change (precomputed samples).
- dataformats (new): regex and timezone tester with common enterprise date formats.
- spark: partition skew calculator (keys, partitions, executor memory -> straggler time).
- streaming: consumer group rebalancer; add partitions and consumers and watch lag.
- tools: agent loop stepper with max-steps and cost budget, showing where a loop runs away.
- security: JWT decoder plus RBAC/ABAC policy checker.
- dsa: pattern-recognition flashcards (problem statement -> which pattern) with timer.

---

## 4. Document templates not in docs_pack.json

P0
- poc-plan: POC / pilot success-criteria sheet (scope, SMART criteria, data needed, exit decision). Topics: arc, case, poc.
- stakeholder-map: power/interest grid plus champion list. Topics: discovery, change, case.
- demo-script: 10-minute demo script with before/after story and failure fallbacks. Topics: demo.
- model-card: model / system card for an AI feature. Topics: responsibleai, mlops, guardrails.

P1
- data-inventory: data source inventory and data-quality checklist (owner, access, freshness, PII class). Topics: etl, lastmile, compliance.
- api-integration-spec: integration spec for a customer API (auth, endpoints, limits, errors, sample payloads). Topics: http, integration, lastmile.
- training-plan: end-user training and communication plan. Topics: change.
- learning-plan: personal 12-week learning route. Topics: fluency, career.
- ai-governance-checklist: customer AI governance / risk checklist (NIST AI RMF, EU AI Act). Topics: responsibleai, compliance.
- dpia: data protection impact assessment. Topics: compliance.

P2
- slo-sheet: SLI/SLO definition sheet with error budget policy. Topics: observability.
- bug-report: reproducible bug report. Topics: debugging (new).
- case-worksheet: one-page case decomposition worksheet. Topics: case, casebank.

---

## Top 10 must-have gaps (in order)
1. New topic `pandas` (data wrangling; blocks p1 and most real customer data work).
2. New topic `llmapi` (messages, sampling, streaming, Bedrock/Azure/Vertex access).
3. New topic `debugging` (method, pdb, bisect, unfamiliar codebases).
4. New topic `aicoding` (using Claude Code / Cursor well and safely).
5. evals: add agent trajectory and RAG faithfulness/context-recall subtopics.
6. rag: add enterprise-source ingestion with permission sync and index freshness.
7. deploy + cloud: kubectl debugging, Helm, and managed AI services.
8. Widget: sqlbank in-browser SQL runner (practice at scale).
9. Templates: poc-plan, stakeholder-map, demo-script, model-card.
10. demo lesson expansion plus genesis additions (Blueprint slides 4 and 12).

## Format counts (fit.json, first choice)
interactive 31, project 18, practice 13, animation 12, reading 11, flowchart 6, document 5.
All mentions (first or second): reading 50, interactive 34, project 29, practice 22, animation 19, flowchart 17, document 16.
