# FDE Flow Atlas: audit 6 (missing concepts, round 6)

Scope: the 112 topics and 11 projects in `build/build3.py` FULL, with every lesson's subtopic titles
(`lessons_*.json`), the patch subtopics (`patch_s`, `patch_x`, `patch_y`, `patch_z1`), the 29 templates, the widgets,
and `FDE_Course_Structure.md`. Hit counts come from a case-insensitive search over all lesson, concept, case, quiz,
template and widget text. REAUDIT, FINAL_AUDIT and AUDIT5 proposals that were added are not proposed again.

Headline: **21 new topics** (Module 1 +2, Module 2 +3, Module 0 +1, Module 3 +4, Module 5 +3, Module 6 +8) and
**17 patch subtopics** in 14 existing topics. After this, Module 6 has 9 topics, Module 5 has 7 and Module 1 has 4.

Already covered well enough (no action): auth, SSO and OAuth (`security`); regex (`dataformats`); Terraform basics
(`cloud`); stakeholder mapping and politics (`discovery`, `fieldlife`, the stakeholder-map template); vector search
basics (`embeddings`, `nosql`); computer-use agents (`tools` patch); LLM gateways (`llmapi`); RPA (`integration`).

## 1. New topics (prioritised)

Format key: best = first and second choice from interactive, document, animation, flowchart, reading, project,
practice. W = widget idea (or "no"). T = new template slug and title (or "no").

### P0: gaps a hiring manager or the course outline names directly

**1. `aireadiness`, module 6, insert before `lastmile`: "AI readiness and use-case prioritisation"**
Why: "AI onboarding" starts with deciding what to build; maturity 0 hits, "AI strategy" 0, impact/effort 0.
Subtopics: 1) Assessing readiness: data, people, process, platform and risk; 2) Running a use-case discovery
workshop; 3) Scoring use cases: value, feasibility, data availability, risk; 4) The 2x2 and picking a first pilot;
5) Build, buy or configure for each use case; 6) Writing the AI roadmap the sponsor signs.
Best: interactive, document. W: use-case scorer; enter 6 use cases, sliders for value, feasibility and risk, plots a
2x2 and ranks them. T: `ai-readiness` "AI readiness assessment and use-case scorecard".

**2. `golive`, module 6, after `lastmile`: "Implementation: UAT, cutover and go-live"**
Why: arc covers phases, but the mechanics of going live are absent: "user acceptance" 0, cutover 0, "data
migration" 2 (incidental). go-live appears only inside templates.
Subtopics: 1) Environments at the customer: dev, test, staging, prod and who owns each; 2) Data migration and
backfill: dry runs and reconciliation counts; 3) User acceptance testing: scripts, sign-off and defect triage;
4) Change control: the customer's CAB and release windows; 5) Cutover plan, go/no-go meeting and rollback;
6) The first week live: parallel run and hypercare entry criteria.
Best: flowchart, document. W: go/no-go gate; tick criteria (UAT signed, rollback tested, runbook, on-call named)
and the gate shows go, go with risk, or no-go with reasons. T: `golive-checklist` "Go-live readiness and cutover
plan"; `uat-plan` "UAT test script and sign-off sheet".

**3. `supportops`, module 6, after `golive`: "Support model, escalation and hypercare"**
Why: postings ask FDEs to own escalations. "support tier" 0, "Tier 2" 0; escalation appears only as template rows.
Subtopics: 1) Support tiers L1, L2, L3 and where the FDE sits; 2) Severity levels and response SLAs;
3) Triage: reproducing a customer ticket fast; 4) Escalating into your own engineering and product teams;
5) Building the knowledge base and deflecting repeat tickets; 6) Exiting hypercare and handing to support.
Best: interactive, document. W: ticket triage drill; 8 realistic tickets, pick severity and route, get feedback.
T: `support-model` "Support model and escalation matrix".

**4. `incidents`, module 5, after `fieldlife`: "Incidents and escalations in the field"**
Why: `observability` has on-call and `exec` has "two tracks during an incident", but running an incident at a
customer is not taught: "incident commander" 0, "status page" 3, "war room" 4 (fieldlife mentions only).
Subtopics: 1) Declaring an incident and naming roles (commander, scribe, comms); 2) Stabilise first: rollback, kill
switch, feature flag; 3) Customer communication cadence: first note, updates, resolution; 4) Working in the
customer's war room and their ITSM process; 5) When the root cause is theirs, not yours; 6) Running the blameless
review and tracking actions.
Best: animation, interactive. W: incident simulator; a timed timeline with decision points and a comms timer that
flags missed updates. T: `incident-comms` "Customer incident notice: initial, update and resolved".

**5. `fderoles`, module 1, after `genesis`: "Customer-facing technical roles compared"**
Why: outline 1.3 is a full section; the atlas has one subtopic ("How FDEs differ from similar roles"). The 70-80%
code time split has no dedicated treatment.
Subtopics: 1) FDE, Solutions Architect, Sales Engineer, Customer Success Engineer, consultant; 2) Where each sits in
the deal and customer lifecycle; 3) The time split: 70-80% code and model work; 4) A week in the life of an FDE;
5) How titles differ at AI labs, data platforms and SaaS companies; 6) Moving between these roles in a career.
Best: interactive, reading. W: role sorter; drag 12 real tasks to the role that owns them, with explanations.
T: no.

**6. `agentmemory`, module 3, after `multiagent`: "Agent memory and state"**
Why: postings for agent roles ask for memory design. "long-term memory" 0, episodic 0, Mem0 or MemGPT 0,
compaction 0. `multiagent` has one subtopic on shared state.
Subtopics: 1) Short-term memory: the thread and its token budget; 2) Summarising and compacting long
conversations; 3) Long-term memory: semantic, episodic and procedural; 4) What to write to memory and when to
forget; 5) Per-user isolation, privacy and deletion of memories; 6) Checkpoints and resuming long-running agents.
Best: animation, interactive. W: memory stepper; step through 12 turns and watch the buffer fill, compact to a
summary, and write facts to a long-term store. T: no.

**7. `llmobs`, module 3, after `evals`: "LLM observability and production feedback"**
Why: spread thin across `observability` (1 subtopic), `mlops` and `evals`. Langfuse 1, LangSmith 2, thumbs 5,
"user feedback" 4. Every post-deployment FDE task needs this.
Subtopics: 1) What to trace: prompts, tool calls, tokens, latency, cost; 2) Spans for agents and the OpenTelemetry
GenAI conventions; 3) Tools: Langfuse, LangSmith, Arize Phoenix and cloud-native options; 4) Logging safely: PII
redaction and retention; 5) Capturing user feedback and turning it into eval cases; 6) Online evals, sampling and
quality dashboards.
Best: interactive, flowchart. W: trace viewer; a nested span tree of one agent run with tokens and ms per span;
find the slow and the costly step. T: no.

**8. `dataquality`, module 2, after `etl`: "Data quality, matching and reconciliation"**
Why: customer data work is mostly this. Great Expectations 1, pandera 1, data contract 2, profiling 2, "record
linkage" 0; entity resolution appears only inside `graphrag`.
Subtopics: 1) The quality dimensions: completeness, validity, uniqueness, consistency, timeliness;
2) Profiling a new source in 15 minutes; 3) Expectation suites: pandera, Great Expectations, dbt tests;
4) Entity resolution: normalise, block, fuzzy match, review; 5) Reconciling source and target: counts, sums,
checksums; 6) Data contracts with the owning team.
Best: practice, interactive. W: fuzzy matcher; two lists of company names, a similarity threshold slider, shows true
and false matches. T: no (extend `data-inventory` instead).

### P1: skills in real FDE job descriptions with thin coverage

**9. `typescript`, module 0, after `frontend`: "JavaScript and TypeScript essentials"**
Why: the outline lists TypeScript and JavaScript as core languages, and AI-lab FDE postings ask for them. `frontend`
has one TypeScript subtopic plus a Node patch; zod 0, vitest 0.
Subtopics: 1) Node, npm and package.json; 2) Types, interfaces and unions; 3) Promises and async/await;
4) Validating input with zod; 5) A small API with an LLM SDK call; 6) Testing with vitest and reading TS errors.
Best: practice, reading. W: no (code examples do the work). T: no.

**10. `spreadsheets`, module 2, after `bi`: "Spreadsheets and Excel automation"**
Why: business users live in Excel. openpyxl 1, xlsxwriter 0, Google Sheets 0, XLOOKUP 0, Power Query 0.
Subtopics: 1) Reading messy workbooks: many sheets, merged headers, hidden rows; 2) Writing formatted reports with
openpyxl and xlsxwriter; 3) The formulas business users know: XLOOKUP, pivots, SUMIFS; 4) Google Sheets through
its API; 5) Replacing a fragile macro with a scheduled script; 6) When a spreadsheet should become a database.
Best: practice, project. W: no. T: no.

**11. `webauto`, module 2, after `integration`: "Browser automation and scraping"**
Why: legacy portals with no API are common on site. Playwright 3, Selenium 0, scraping 0, BeautifulSoup 0.
Subtopics: 1) API first: finding hidden JSON calls in the network tab; 2) Playwright basics: locators, waits,
logins; 3) Parsing HTML with BeautifulSoup; 4) Sessions, MFA and service accounts; 5) Terms of service,
robots.txt and legal limits; 6) When to hand the task to a browser agent.
Best: practice, flowchart. W: no. T: no.

**12. `voice`, module 3, after `multimodal`: "Voice agents in production"**
Why: `multimodal` has one voice-design subtopic. Telephony 0, Twilio 0, WebSocket 0, Realtime API 0. Voice is a
major FDE deployment type at customer-service AI companies.
Subtopics: 1) The pipeline: STT, LLM, TTS versus speech-to-speech; 2) Telephony: PSTN, SIP and a phone number
provider; 3) Streaming over WebSockets; 4) Turn-taking, barge-in and voice activity detection; 5) The latency budget
and how to cut it; 6) Testing voice agents, call recording consent and compliance.
Best: interactive, animation. W: latency budget builder; sliders for network, STT, time to first token and TTS,
shown against an 800 ms target. T: no.

**13. `cxagents`, module 6, after `supportops`: "Customer-service AI agents"**
Why: the largest single FDE hiring area (Sierra-style roles). containment and deflection appear only in a case;
"handoff to a human" 1.
Subtopics: 1) Turning SOPs and policies into agent instructions; 2) Knowledge sources and actions (refund,
lookup, update); 3) Handoff to a human agent with full context; 4) Simulated conversations and regression tests;
5) Metrics: containment, resolution, CSAT, escalation rate; 6) Launch: shadow mode, a percentage rollout, review.
Best: interactive, flowchart. W: conversation tester; run 6 scripted customer messages through a rules-based mock
agent and score which were resolved or escalated. T: `agent-sop` "Agent SOP and policy specification".

**14. `labeling`, module 3, after `evals` (before `llmobs`): "Data labeling and human review"**
Why: Scale-style FDE roles centre on this; also needed for golden sets. inter-annotator 0, "active learning" 0,
Label Studio 0; kappa appears only for judge calibration.
Subtopics: 1) Writing labeling guidelines with edge cases; 2) Tools: Label Studio and spreadsheets; 3) Measuring
agreement: percent agreement and kappa; 4) Adjudication and gold questions; 5) Active learning: label what the
model is unsure about; 6) Human review queues in production.
Best: interactive, practice. W: agreement calculator; two annotators label 20 items, computes percent agreement and
kappa and lists disagreements. T: `labeling-guide` "Annotation guidelines".

### P2: professional and business depth (still required per the user's rule)

**15. `enablement`, module 6, after `cxagents`: "Customer enablement and the AI CoE"**
Why: `change` has a training subtopic and `arc` names the CoE, but AI-specific enablement is missing:
train-the-trainer 0, "prompt library" 0, "office hours" 2.
Subtopics: 1) Enablement versus training: admins, builders, end users; 2) Teaching users when to trust the output;
3) Prompt libraries and worked examples from their own work; 4) Train-the-trainer and champions; 5) Standing up
the Center of Excellence: roles and intake; 6) Office hours, communities and measuring skill growth.
Best: document, reading. W: no. T: `prompt-library` "Team prompt library and usage guide".

**16. `expansion`, module 6, after `enablement`: "Renewal, value realisation and expansion"**
Why: only one patch subtopic (`change`: account health) and one `slg` subtopic. "second use case" 1, upsell 3.
Subtopics: 1) Customer success versus FDE: who owns what after go-live; 2) The success plan and value realised;
3) Renewal risk signals and saving an account; 4) Finding the second use case; 5) The executive business review;
6) Referencing: case studies and customer references.
Best: reading, document. W: no. T: `success-plan` "Customer success plan and value tracker".

**17. `psa`, module 6, after `expansion`: "Professional services operations and PSA"**
Why: outline 6.2 has four bullets; `lastmile` has one subtopic. billable 0, "time and materials" 1, "services
revenue" 0.
Subtopics: 1) Services models: T&M, fixed fee, milestones, retainers, outcome-based; 2) Utilisation, margin and
why they matter; 3) PSA platforms (Rocketlane and others): unified workspace and resourcing; 4) Dynamic playbooks
and templates for repeatable delivery; 5) Client portals and shared plans; 6) AI automation inside services work.
Best: interactive, reading. W: services margin calculator; rate, hours, overrun % and model type give margin.
T: no.

**18. `lowcode`, module 6, after `psa`: "Low-code AI platforms"**
Why: outline Module 6 is "Platforms" and `fluency` names Agentforce only as a credential. "Copilot Studio" 0,
"agent builder" 0, no-code 0.
Subtopics: 1) The landscape: Copilot Studio, Agentforce, ServiceNow, n8n and Zapier; 2) When the customer's
platform choice decides your build; 3) Extending with custom connectors and APIs; 4) Governance: environments,
DLP policies, who can publish; 5) Limits and when to drop to code; 6) Handing a low-code build to citizen developers.
Best: flowchart, reading. W: no. T: no.

**19. `asyncwriting`, module 5, after `pod`: "Writing and async communication"**
Why: `exec` covers structure (pyramid, SCQA) but not day-to-day async work. Slack 2, "shared channel" 0,
"technical writing" 2, "meeting notes" 1.
Subtopics: 1) Bottom line up front in messages and email; 2) Shared Slack or Teams channels with a customer;
3) The end-of-day note and handoffs across time zones; 4) Writing tickets and PR descriptions for their engineers;
5) Saying no and delivering bad news in writing; 6) Tone, brevity and what never goes in chat.
Best: practice, interactive. W: message checker; paste a draft and it flags a missing ask, owner, deadline or a
buried lead (heuristic checklist). T: `async-update` "End-of-day and handoff note".

**20. `ethics`, module 5, after `incidents`: "Professional ethics on site"**
Why: ethic 2 hits (both in `fluency`), "conflict of interest" 0.
Subtopics: 1) Confidentiality: NDAs, screens and conversations in public; 2) Customer data on your laptop and in AI
tools; 3) Honesty: not overpromising what the model can do; 4) Gifts, conflicts of interest and competitors;
5) Automation and the people whose jobs change; 6) When to raise a concern and how.
Best: interactive, reading. W: dilemma cards; 10 scenarios with choices and explained answers. T: no.

**21. `fdeskills`, module 1, after `slg`: "The FDE skill set and self-assessment"**
Why: Blueprint slide 6 (skills radar) has 0 hits for radar; there is no place where a beginner measures themselves
against the role before starting the route.
Subtopics: 1) The five axes: technical depth, problem finding, empathy, product judgment, ownership;
2) T-shaped: one deep spike plus breadth; 3) Ownership and bias to action in practice; 4) Comfort with ambiguity;
5) Rating yourself honestly with evidence; 6) Turning gaps into an atlas route.
Best: interactive, reading. W: skills radar; rate 5 axes, draws the radar and links the weakest axis to topics.
T: no (use the existing `learning-plan`).

## 2. Patches to existing topics

| id | Add subtopic | What it covers (one line) |
|---|---|---|
| `prompting` | Native structured outputs: JSON Schema modes and strict tool inputs | response_format 0, json_schema 3; provider schema modes versus forced tool use |
| `prompting` | Validate, repair and retry with Pydantic | one retry with the validation error fed back; when to give up |
| `deploy` | Docker Compose for a local multi-service stack | app, Postgres and a vector DB in one file; exec, logs and inspect for debugging |
| `deploy` | Kubernetes in a customer cluster | namespaces and restricted RBAC, StatefulSets and PVCs, private registry mirrors, OpenShift (PVC 0, OpenShift 0) |
| `cloud` | Terraform under customer change control | plan review, `terraform import`, drift detection, remote state locking |
| `security` | Enterprise identity plumbing | Entra ID or AD groups to roles, SCIM provisioning (2 hits), mTLS between services (1 hit) |
| `compliance` | Detecting and redacting PII in text and logs | regex plus NER, Presidio (0 hits), reversible pseudonymisation (0 hits) |
| `embeddings` | Choosing a vector database | pgvector versus Pinecone, Qdrant, Weaviate, OpenSearch: filtering, tenancy, backups, cost |
| `apistyles` | WebSockets and Server-Sent Events | WebSocket 0 hits; SSE for token streams, WebSockets for voice and realtime |
| `pandas` | Working in Jupyter notebooks | Jupyter 4 hits; restart-and-run-all, when to move to a script |
| `docs` | Architecture diagrams customers understand | C4 levels and diagrams as code with Mermaid (both 0 hits) |
| `docs` | Runbooks and handover docs (carried over from AUDIT5 B1, not yet added) | what the runbook template is for and a worked example |
| `sql` | Anti-joins, EXISTS and deduplication with ROW_NUMBER (carried over from AUDIT5) | the most common interview pattern; still no subtopic |
| `planner` | Statistics, ANALYZE and bad row estimates (carried over from AUDIT5) | why the planner picks a wrong plan |
| `bi` | Embedding dashboards in an app with row-level access (carried over from AUDIT5) | signed embed URLs and RLS |
| `frontend` | Accessibility basics for customer-facing UIs | WCAG 0 hits; labels, contrast, keyboard use |
| `llmapi` | Multilingual deployments | token cost per language, per-language evals and retrieval (multilingual 1 hit) |

Cross-link notes for writers: `lastmile` subtopic 6 ("Playbooks, portals and PSA automation") should link to `psa`;
`multiagent` "Shared state and memory" should link to `agentmemory`; `observability` "Tracing LLM calls" should
link to `llmobs`; `multimodal` should link to `voice`; `change` "Training plans that stick" should link to
`enablement`; `genesis` "How FDEs differ from similar roles" should shrink to a pointer to `fderoles`.

## 3. Writing batches (5 batches, 4 or 5 topics each)

| Batch | Theme | Topics | Modules |
|---|---|---|---|
| A | The role, the person and conduct | `fderoles`, `fdeskills`, `asyncwriting`, `ethics` | 1, 1, 5, 5 |
| B | Onboarding, go-live and support | `aireadiness`, `golive`, `supportops`, `incidents`, `enablement` | 6, 6, 6, 5, 6 |
| C | AI engineering in production | `agentmemory`, `llmobs`, `labeling`, `voice` | 3, 3, 3, 3 |
| D | Data and business-user tooling | `dataquality`, `spreadsheets`, `webauto`, `typescript` | 2, 2, 2, 0 |
| E | Platforms and the services business | `cxagents`, `lowcode`, `psa`, `expansion` | 6, 6, 6, 6 |

The 17 patches can go to the batch nearest in theme: prompting, embeddings, llmapi to C; deploy, cloud, security,
compliance, apistyles, pandas, sql, planner, bi, frontend to D; docs to B.

Insertion order in FULL (new ids in brackets):
- Module 1: genesis, [fderoles], slg, [fdeskills]
- Module 0: ... frontend, [typescript], oop ...
- Module 2: ... etl, [dataquality], warehouse ... integration, [webauto], bi, [spreadsheets]
- Module 3: ... multiagent, [agentmemory] ... evals, [labeling], [llmobs] ... multimodal, [voice] ...
- Module 5: arc, pod, [asyncwriting], ... fieldlife, [incidents], [ethics]
- Module 6: [aireadiness], lastmile, [golive], [supportops], [cxagents], [enablement], [expansion], [psa], [lowcode]

New templates proposed (10): `ai-readiness`, `golive-checklist`, `uat-plan`, `support-model`, `incident-comms`,
`agent-sop`, `labeling-guide`, `prompt-library`, `success-plan`, `async-update`. None clash with the 29 slugs.
New widgets proposed (15): aireadiness, golive, supportops, incidents, fderoles, agentmemory, llmobs, dataquality,
voice, cxagents, labeling, psa, asyncwriting, ethics, fdeskills.
