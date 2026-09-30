# FDE Flow Atlas: final audit

Scope: the 119 ids in `build/build3.py` FULL (108 topics and 11 projects), all 540 quiz questions (10 quiz files),
12 widget files, the fit, case, concept and lesson files plus patches, `REAUDIT.md` and
`/mnt/project-files/FDE_Course_Structure.md`.

## 1. Quiz correctness (540 questions read)

I read every question. For each one I checked that `options[answer]` is correct, that no other option could also be
defended as correct, and that `why` matches the keyed answer. Structure check: every topic has 5 questions, every
question has 4 options, and every `answer` index is in range.

Result: **all 540 keyed answers are correct**, and none has a second option that could also be argued as correct.
No answer index was changed. I edited two `why` texts because they overstated a fact. Each edit used
`json.dump(..., ensure_ascii=False, indent=1)`, which keeps the files' existing format, and changed only that one line:

| File | Question | Change |
|---|---|---|
| quiz_1.json | warehouse#3 (SELECT * bill jumped) | The old `why` said "Column stores bill by data scanned", which is not true of every warehouse. It now says on-demand warehouses such as BigQuery bill by bytes scanned, and compute-billed ones such as Snowflake also cost more because the scan runs longer. The answer is unchanged. |
| quiz_2.json | embeddings#0 (what is an embedding) | The old `why` said an embedding "cannot be decoded back into the original text". It now says an embedding is not a reversible compression, but research shows embeddings can leak parts of the text, so protect them like the source data. The answer is unchanged. |

Questions I checked closely and left alone: internet#4 (whether HTTPS reveals the site name through SNI; "usually"
covers ECH), mcp#3 (OAuth 2.1 for HTTP transports), dlarch#3 (7B model in fp16 needs about 14 GB), logreg#3
(exp(0.7) is about 2.0), mathbasics#0 (dot product is 8), dbbasics#3 (sqlite3 discards uncommitted rows),
anomaly#4 (masking), timeseries#2 (14-day lag). interview#0 and builddrill#0 test figures specific to this course
(the 40/30/20/10 weights and the 30-minute core path). Both agree with the course's own lessons.

## 2. Consistency

Check script: `scratchpad/chk.py`.

- Concepts: all 119 FULL ids have a concept. The 97 topic concepts come from old.js, new1-3.js and
  lessons_?_concepts.json, and the 11 projects from proj_*_projects.json. FULL has no duplicates, and no concept is
  missing from FULL.
- Lessons, cases and quizzes: all **108 topic ids** have a lesson (patch_s and patch_x apply cleanly), a case and a
  quiz of 5 questions. The 11 project ids (`p0-setup` to `p10-drill`) have no lesson, case or quiz. This is by design:
  each carries a full `project` block (setup, steps, run, tests, stretch, interview). No lesson, case or quiz exists
  for an id that is not in FULL.
- Fit: all 119 ids have a fit entry, and there are no extras.
- Every fit entry that lists `interactive` has a widget (53 widget keys). **0 mismatches.**
- The reverse check finds 5 widgets whose fit entry does not list `interactive`, so the "best format" tag
  undersells them. This is a report only; fit was not changed:
  - `spark`: fit is animation, reading. The widget is a partition skew calculator.
  - `streaming`: fit is animation, reading. The widget is a consumer group rebalancer.
  - `security`: fit is animation, reading. The widget is a JWT decoder and RBAC checker.
  - `tools`: fit is animation, project. The widget is an agent loop stepper.
  - `dsa`: fit is practice, reading. The widget is pattern flashcards.
  Suggested fix: add "interactive" to each of these fit entries (in fit.json).
- Every gap in REAUDIT.md has been addressed. All P0, P1 and P2 topics exist (pandas, debugging, llmapi, aicoding,
  dataformats, entnetwork, poc, pytooling, and tabular ML split into mlworkflow to recsys). The thin-topic subtopics
  are present (evals, rag, deploy, cloud, demo, genesis, etl, linux, pm, transformer, tools, slg, computers,
  observability). The suggested widgets are built.

## 3. Remaining gaps (strict: only what a hiring manager would actually probe)

Every bullet of the course outline is covered, including Hadoop, StatefulSets, multi-stage builds, API gateways,
RoPE, T5, Letta, Rocketlane and compensation. Before listing a gap, I checked the subtopic titles and searched the
full text of all lessons, concepts, cases, projects and docs.

### P1-1 Application security basics: add subtopics to `security` (module 2)
Why: enterprise customers run a security review or pen test on anything an FDE deploys. The atlas covers identity
well (authN/Z, OAuth, SAML, RBAC, secrets), dependency scanning (cicd) and prompt injection (guardrails). But it has
no web application security. Search counts: OWASP 0, XSS 0, SSRF 0, path traversal 0, threat model 0, and
SQL injection only 3.
Subtopics:
- The OWASP Top 10 for an FDE: broken access control and IDOR, injection (SQL, command), SSRF, XSS and output
  encoding, and security misconfiguration
- A 30-minute threat model: data flows, trust boundaries, and a light version of STRIDE
- Passing a customer pen test: common findings (headers, CORS, verbose errors, open admin endpoints) and how to fix
  them
Quiz and case: an IDOR in `/orders/{id}`, and an SSRF through a "fetch this URL" tool.

### P1-2 Choosing a model: add a subtopic to `llmapi` (module 3), with a short cross-link from `llmcost`
Why: "Which model should we use?" is the most common first question a customer asks an AI-lab FDE. The atlas
teaches routing (llmcost) and self-hosting versus API (serving). It never teaches how to choose among models. Search
counts: "choose a model" 0, "reasoning model" 0, "extended thinking" 2 (in passing).
Subtopics:
- Choosing a model: capability, latency (TTFT), cost, context length, modalities, region, and data terms under
  the customer's cloud contract
- Reasoning and extended-thinking models: when the extra latency and tokens pay off, and how to set thinking
  budgets
- Running a bake-off on the customer's own eval set instead of public leaderboards

### P2-3 Running customer meetings: add a subtopic to `exec` or `pm` (module 4)
Why: this is a daily FDE task. The atlas covers discovery interviews, incidents and status reports, but not routine
meeting mechanics. Search counts: "follow-up email" 0, "agenda" 1, "meeting notes" 1.
Subtopic: "Agenda, notes and the same-day recap email (decisions, owners, dates); setting expectations and saying
no politely".

### P2-4 Quick charts for findings: add a subtopic to `pandas` (module 0)
Why: FDEs often present a data finding to a customer before any dashboard exists. Search count: matplotlib 2.
Subtopic: "Plotting with pandas .plot and matplotlib in a notebook, and the three charts that answer most questions".

### P2-5 TypeScript on the server: add a subtopic to `frontend` (module 0)
Why: many AI-lab FDE postings ask for Python or TypeScript, and many customer stacks run on Node. The atlas teaches
TypeScript only in the browser. Search counts: Node.js 4, npm 3.
Subtopic: "Node and TypeScript basics: npm, a tiny Express or Next.js API route calling an LLM SDK".

Not gaps, because they are already covered: agent memory (multiagent, "Shared state and memory"), LLM vendor data
retention and ZDR (compliance, "DPAs, subprocessors and LLM vendors"), dependency and CVE scanning (cicd), load
testing (caching), backups and restore (acid, cloud), and Excel ingestion (pandas, dataformats).

## 4. Factual concerns

- Two `why` texts overstated a fact (section 1). Both are fixed.
- The p6-tool-agent and p8-rag-evals project `.env` examples use the model id `claude-opus-5` ("for example claude-opus-5"). Check this
  against the current Anthropic models page before release. It is safer to say "copy a current model id from the
  provider's models page", as the Project A template already does.
- Stale-by-design numbers: example prices (3 and 15 dollars per million tokens) are labelled EXAMPLE, and the
  lessons say to check current price sheets. That is fine.
- Spot checks found no errors: KV-cache arithmetic (serving, 128 KB per token for a Llama-3-8B-like model), the MCP
  OAuth 2.1 statement, Palantir Gotham and Foundry, and the Echo and Delta description.

## 5. Summary
- Quizzes: 540 of 540 keyed answers are correct. 2 explanations were softened. No answer indexes changed.
- Consistency: 0 missing items across concept, lesson, case, quiz and fit. The 11 projects have no lesson, case or
  quiz by design. 0 interactive-without-widget. 5 widgets are not tagged interactive in fit.
- Gaps: 2 P1 (application security, model selection and reasoning models) and 3 P2 (meeting mechanics, quick
  charts, TypeScript on the server). All are subtopic additions to existing topics. No new topic id is needed.
