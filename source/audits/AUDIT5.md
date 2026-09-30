# FDE Flow Atlas: audit 5 (full content and layout pass)

Scope: the built page `/mnt/project-files/fde-atlas/FDE_Flow_Atlas.html`. That covers 119 FULL ids (108 topics and
11 projects), `LESSONS` with patch_s, patch_x and patch_y merged, 108 cases, 540 quiz questions, 53 widgets,
29 templates, the project folders and zip, and `FDE_Course_Structure.md`. Every "0 hits" claim below comes from a
regex search over the full text of every concept, lesson, case, quiz, template and project block.
Earlier audits are resolved: REAUDIT and FINAL_AUDIT gaps are present (OWASP and pen test in `security`, model choice
and reasoning models in `llmapi`, meetings in `exec`, charts in `pandas`, a Node route in `frontend`), and the 5
fit tags now include `interactive`.

Headline counts: **4 new topics and 13 new subtopics proposed (A)**. **0 structural lesson defects, 6 code-light
topics and 15 short lessons (B)**. **0 page overflows, 49 hidden edge labels, 4 edges drawn through nodes, 3 clipped
widget captions, 1 clipped Copy button, 7 reading-width inconsistencies, and 11 dark-mode contrast failures in 7
widgets (C)**.
All 11 project test suites pass: p0 8, p1 14, p2 13, p3 6, p4 7, p5 9, p6 13, p7 7, p8 7, p9 8, p10 solution 6.
p10 starter fails 6 of 6 by design. p7 and p9 need `pip install -r requirements.txt` first. The zip is
byte-identical to `projects/`.

## A. Content gaps (prioritised)

### P0: new topics

**A1. New topic `regulated`, module 2 (after `compliance`): "Regulated industries playbook"**
Why: every enterprise FDE posting at AI labs and data platforms names healthcare, finance or public-sector
customers. `compliance` gives GDPR, HIPAA and SOC 2 one shared subtopic. Search counts: PCI 0, FedRAMP 0, SOX 0,
ISO 27001 0, HITRUST 0, CCPA 0, FHIR/HL7 0, GovCloud 0, CJIS 0, DoD IL levels 0, SR 11-7 model risk 3 (casebank
only), ITAR 2.
Subtopics:
1. Healthcare: HIPAA, BAAs, the minimum-necessary rule, Safe Harbor de-identification, and HL7 v2 and FHIR APIs
2. Financial services: SOC 2 Type II evidence, PCI DSS scope reduction and tokenization, SOX change control, and SR 11-7 model risk
3. Government and defense: FedRAMP Moderate and High, DoD IL4 and IL5, AWS GovCloud and Azure Government, ITAR, CJIS, and clearances
4. Data residency and cross-border transfer: EU regions, SCCs, CCPA/CPRA, DPIAs, and deleting data from vector stores and logs
5. Frameworks customers cite (ISO 27001, HITRUST, NIST 800-53) and how to map your deployment to their controls
6. Checklist: what to ask in week 1 of a regulated deployment
Case: a hospital RAG pilot blocked by a missing BAA with the LLM vendor. Quiz: which PCI scope a tokenized field removes.

**A2. New topic `fieldlife`, module 5 (after `pod`): "Life on site: travel, politics and scope"**
Why: postings say "up to 50% travel" and "embedded with customer teams". The atlas teaches the formal parts
(discovery, SOW, change management) but not day-to-day life inside a customer. Search counts: politic 1,
"power dynamic" 1 (the course outline lists "power dynamics"), empathy 0 (the outline lists "cognitive empathy"),
burnout 0, context switch 0, "first 90 days" or 30/60/90 0, war room 0.
Subtopics:
1. Your first two weeks at a customer: badges, laptops, VPN and access requests, and a 30/60/90 plan
2. Travel and on-site etiquette: device security, expenses, working in their office, and time zones
3. Reading the org: power dynamics, sponsors versus blockers, and cognitive empathy in practice
4. Scope creep in real life: "while you are here" asks, change requests, and saying no with a trade (links `docs`, `poc`)
5. Juggling several accounts: context switching, weekly prioritisation, and escalating to internal product, engineering and support
6. A sustainable pace: on-call boundaries, war rooms, and avoiding burnout

**A3. New topic `interviewrounds`, module 7 (after `interview`): "Interview rounds, one by one"**
Why: `interview` covers scoring and the build, customer and business rounds. There is no round-by-round guide to the
formats FDE loops actually use. Search counts: "live coding" 0, "pair program" 0, debugging round 0, "reverse
interview" or "questions to ask" 0 (2 unrelated hits), "hiring bar" or leveling 0, levels.fyi 0. "System design"
has 6 hits, all generic in `sysdesign`. Take-home appears only as a project layout in `tdd`.
Subtopics:
1. Recruiter and hiring-manager screens: what each one filters for, and a 90-second pitch
2. Live coding and pair programming: think aloud, write tests first, and use AI tools only when they are allowed
3. Debugging and code-reading rounds in an unfamiliar repo (links `debugging`)
4. FDE system design: designing under a customer's constraints (SSO, VPC, residency, a legacy source)
5. Take-home assignments: time-boxing, a README with trade-offs, and what reviewers open first
6. Behavioral and values rounds, questions to ask them (reverse interview), and follow-up after the loop

**A4. New topic `portfolio`, module 7 (after `career`): "Portfolio and public proof of work"**
Why: the brief asks for GitHub, writing and demos. Search counts: "GitHub profile" 0, blog 1, "open source" 4 (all
incidental), Loom or demo video 9 (none about a portfolio). `interview` has only one mixed subtopic ("Portfolio,
STAR stories and the offer").
Subtopics:
1. A GitHub profile that works in 30 seconds: pinned repos, a profile README, and commit hygiene
2. Project READMEs that sell: problem, GIF, architecture, eval numbers, and "run in 3 commands"
3. Which atlas projects to feature for AI-lab, data-platform and SaaS FDE roles (p6, p8, p9, projecta)
4. Writing in public: short technical posts, case write-ups, and postmortems of your own projects
5. A 3-minute recorded demo, with a script and editing (links `demo`)
6. Small open-source contributions and public tools (an MCP server, a dbt package)

### P1: new subtopics in existing topics
| # | Target id | Subtopic title | Evidence (hits) |
|---|---|---|---|
| 5 | `bi` | Text-to-SQL and "chat with your data": schema context, read-only roles, validation, evals | text-to-SQL 1 |
| 6 | `sysdesign` | Multi-tenant SaaS: tenant isolation (row, schema, database), per-tenant keys, noisy neighbours | multi-tenant 0, RLS 4 |
| 7 | `debugging` | Reading Java and C# enterprise code: Maven or Gradle, Spring config, JVM stack traces | Java 4, Maven/Spring 1; the outline lists Java/C++ |
| 8 | `slg` | Working with sales: the deal cycle, AE, SE and FDE roles, MEDDICC basics, technical objections | MEDDIC 0, objection 1, AE 6 |
| 9 | `cloud` | Cloud cost basics: billing, tags, budgets and alerts, GPU cost, right-sizing | FinOps or cloud cost 3 (templates only) |
| 10 | `integration` | Ticketing and ITSM targets: ServiceNow, Jira, Zendesk APIs and webhooks | ServiceNow 0, Jira 0, Zendesk 0 |
| 11 | `integration` | RPA and low-code (UiPath, Power Automate, n8n): when to automate the UI instead of calling the API | RPA 0; Zapier appears only in `fluency` |
| 12 | `mcp` | MCP versus agent-to-agent protocols (A2A), and when each fits | A2A 0 |
| 13 | `compliance` | Data subject requests: erasing a person from a warehouse, vector index, logs and backups | right to erasure 1 (templates) |

### P2: smaller additions
- `moat`: "Writing field feedback the product team acts on" (evidence, frequency, revenue at risk). "field feedback" or
  "feature request" has 4 hits.
- `change`: "Account health: usage, NPS, renewal risk and the QBR". "health score" has 0 hits and QBR has 5.
- `roi`: "Pricing models your customer is on: seat, usage, outcome, paid pilot". Pricing appears only incidentally.
- `career`: "Researching compensation: levels.fyi, bands, equity refreshers".
- Model id check: the p6, p8 and p9 `.env` examples and the atlas project blocks use `claude-sonnet-5` 8 times. Check it
  against the provider's models page before release, or say "copy a current model id".

## B. Quality gaps per topic

Structure: all 108 lessons have **5 or more subtopics** (minimum 5), **8 or more glossary terms** and **3 practice
items**. All have 5 quiz questions and a case with an artifact. No subtopic body is under 350 characters.
**Nothing is structurally missing.**

### B1. The 15 shortest lessons (prose characters: plain, analogy, why, subtopic bodies and examples; median 8,065)
| Rank | id | chars | | Rank | id | chars |
|---|---|---|---|---|---|---|
| 1 | docs | 5,290 | | 9 | bi | 6,240 |
| 2 | builddrill | 5,608 | | 10 | python1 | 6,345 |
| 3 | planner | 5,744 | | 11 | mathbasics | 6,373 |
| 4 | sql | 5,978 | | 12 | mlbasics | 6,418 |
| 5 | discovery | 6,125 | | 13 | oop | 6,438 |
| 6 | career | 6,147 | | 14 | terminal | 6,524 |
| 7 | resilient | 6,162 | | 15 | acid | 6,584 |
| 8 | pod | 6,218 | | | | |

Priority fixes:
- `docs` (5 subtopics, shortest): add "Runbooks and handover docs", and a worked SOW change-request example.
- `planner` (5 subtopics): add "Postgres statistics, ANALYZE and bad row estimates" and "A slow-query triage walkthrough".
- `sql` (6): add "Anti-joins, EXISTS and deduplication with ROW_NUMBER", the most common interview pattern.
- `bi` (5): add Text-to-SQL (A5) and "Embedding dashboards in an app, with row-level access".
- `pod` (5): add "A week in the pod: rituals and hand-offs", or fold in `fieldlife` (A2).
- `career`, `discovery`, `builddrill`: see B2. A3 and A4 absorb some of the career and interview depth.

### B2. Code-light topics where code clearly helps
Counts are code blocks excluding plain `Text` blocks.
- `builddrill`: 1 real block (bash). The subtopic "Scaffolding FastAPI and tests fast" has no FastAPI or pytest
  code. Add the 40-line skeleton (app, model, one test) that the drill expects.
- `aicoding`: 0 real blocks (2 Text). Add a CLAUDE.md example, a "tests first, then ask the agent" pytest file, and
  a `git diff --stat` review step.
- `debugging`: 2 (bash only). Add Python for `breakpoint()`/pdb, a `logging` setup, and a minimal-repro script.
- `serving`: 3. Add an OpenAI-compatible client call to vLLM or Ollama, and a VRAM calculator function.
- `multiagent` 3, `guardrails` 3, `multimodal` 3: add an orchestrator-worker sketch, an input/output filter with
  a PII regex and an allowlist, and an image or STT API call.
- The concept stage has no code panel for 46 topics, including linux, frontend, oop, etl, warehouse, entnetwork,
  observability, sysdesign, apistyles, nosql, integration, featureeng, trees, prompting, multiagent, evals,
  guardrails, llmcost and frameworks. This is low priority because each lesson has code.

### B3. Case studies
All 108 have an artifact, a made-up company and a numeric outcome. The thinnest by narrative characters (median
1,768) are: python1 1,088, sql 1,139, http 1,152, python2 1,164, git 1,165, tdd 1,184, mathbasics 1,185,
spark 1,209, terminal 1,218, acid 1,253. 42 cases have only 2 discussion questions (66 have 3), and 39 have
5 approach steps. Fix: bring each of the 10 thinnest up to 6 approach steps and 3 discussion questions, and add one
"what went wrong first" line. sql, spark and acid matter most because interviews probe them.

### B4. Projects
Every project has setup, steps, run, tests (with the expected pass count, and the counts match the real runs) and
stretch goals. Every README has run, pytest and venv steps. No gaps. Optional: p7 and p9 tests need their
requirements installed, and the tests block could print `pip install -r requirements.txt` just before `pytest`.

## C. UI and layout audit (Playwright, Chromium)

Method: 150 views (119 ids, Syllabus, Templates and 29 `tpl-*` docs) at 1440x900 and 390x844, in light and dark
(`colorScheme`), with reduced motion and all `<details>` opened. That is 600 measurements, with 0 page errors and
0 console errors.

### C1. Horizontal page overflow: none
`scrollWidth - clientWidth` is 0 for all 600 views, and no ancestor clips with `overflow-x`.
Inner sideways scrolling at 390px (acceptable, but worth knowing about):
- `article.sub > div.ltable` scrolls in 31 topics. The worst overflows are `boosting` +254px, `observability`,
  `knnsvm` +97, `genesis`, `entnetwork` +80 and `nosql` +79. Suggested fix: stack cells as cards under 480px, or
  add a "scroll" hint.
- **Bug (P1):** in `p7-mcp-server`, step 06 at 390px, the figure caption "JSON · claude_desktop_config.example.json"
  does not wrap. It pushes the **Copy button 34px out of `figure.codeblock`**, which has `overflow:hidden`, so the
  button is cut off. Fix: `.codeblock figcaption{flex-wrap:wrap}` and `figcaption span{overflow-wrap:anywhere;min-width:0}`.

### C2. SVG labels versus their boxes
- Node labels (W=136, 124px usable): 91 labels in 53 topics are wider than the box. `drawDiagram` and `mkFlow` hide
  this by setting `textLength` and squeezing the glyphs. 12 are squeezed to 0.90 or less. The worst are
  interview "Customer scenario" 0.84, streaming flow "warehouse-loader" 0.87, embeddings "Embedding model" 0.87,
  frameworks "Claude Agent SDK" 0.87, moat "Every deployment" 0.87, computers "Operating system" 0.88, genesis
  "Customer mission" 0.88 and deploy "Code + Dockerfile" 0.88. Fix: raise W to 148, or shorten these labels.
- Widget captions clipped by the `svg` (`overflow:hidden`):
  - `resilient`, 390px: "retries hitting the server per 100 ms (peak …)" is cut by 24px.
  - `queues`, 390px: "queue depth, last 30 simulated seconds (now …)" is cut by 30px.
  - `transformer`, both widths: the rotated column label "tired" is cut by 2 to 3px.
  Fix: wrap the caption, or shorten it below 360px.
- Checked and not bugs: the rotated y-axis labels in logreg, trees, knnsvm, clustering, mlmetrics and pm are
  inside the SVG in screen coordinates.
- Stage label size at 390px: the smallest is 10.9px (context, evals), and all 94 diagrams are 10.9px or larger.

### C3. Reading width (1440px, where the content column is 1130px and `--read` is 920px)
These pass: lesson `.body p`, `.example`, `figure.codeblock`, `.ltable`, `.lflow` and `ul.check`, case
`ol#csapproach` and `#csartifact`, quiz `ol#quizlist` and `.qzopts button`, and project `.pstep .body p` all end at
920px. These are inconsistent, and each one ends past 920:
1. **Project step code** (`#psteps` and `#psetup > article.pstep > figure.codeblock`, 119 blocks in 11 projects)
   is 1130px wide, while the step text beside it stops at 920. The lesson code blocks cap at 920. Add
   `:root .pstep .codeblock{max-width:var(--read)}`.
2. **Project tree and tests** (`#ptree figure.codeblock` and `#pmeta`) are 1130px. Cap them at the reading width, or
   put them in a grid.
3. **Case study top grid** (`#casestudy .grid2`: `#cssituation` and `#csproblem`) and `.cols` (`#cslessons` and
   `#csdiscuss`) end at 1084px. `.outcome` is a 1084px box and `#csoutcome` ends at 934px, 14px past the reading
   edge because of the box padding. Meanwhile the approach and artifact stop at 920. Give `.grid2`, `.cols` and
   `.outcome` inside `.cs` a `max-width:var(--read)`.
4. **Lesson intro** (`section#lesson > div.intro`) is 1130px, and `#lanalogy` and `#lwhy` in `.side` end at
   1107px. `#ltoc` buttons wrap to 1119px, and `div.cols` (glossary and practice) is 1130px. Cap `.intro`, `.toc`
   and `.cols` at the reading width, as the subtopics are.
5. **Interview Q&A** (`.panel #qa details` and `p`, 341 items) ends at 1130 and 1115px, while ideas and traps sit
   in two 554px columns. Cap `#qa` at 920.
6. **Narration** (`.narration p#stext`) ends at 936 to 1009px in 89 topics.
7. **Try it** (`#tryhost`, 53 widgets) is 1088px wide, and `#tryintro` above it is 920px. This is acceptable for
   charts, but stat tiles (`.wg-w1-stats`, `.wg-w3-tiles`) and notes (`p.wg-*-note` and `-mean`) run to 1088px.
   Cap text notes at 920.
Syllabus: `details.sconcept > ul.check` ends at 939px (19px over), and `section.smod` is a 1130px box. Templates:
`#tpldoc` is 872px and consistent. At 390px no block goes past its section, except the table scrolls noted in C1.

### C4. Diagram overlaps
- **Edge labels hidden under nodes (P1): 49 labels in 31 topics.** The label layer `gL` is painted before the
  node layer `gN`, so when the gap between two nodes is narrower than the label, the node rect covers it.
  Screenshots confirm "ls / dir" and "activate" in terminal, and "share filters", "for sequences", "fix
  forgetting", "drop recurrence" and "scale on GPUs" in dlarch. The full list:
  anomaly "one number"; apistyles "request"; asyncpy "request", "all done", flow "hits await"; bigo "refactor";
  caching "GET key", "not cached"; debugging "confirmed", "wrong: new guess"; dlarch (5 above); docai "scans only";
  docs flow "records"; finetune "soft labels"; git "approve", "switch -c"; guardrails "approved"; http "r.json()";
  llmapi "429 / 529"; logreg "when done"; mathbasics "serve + measure"; mlbasics "instead"; mlmetrics "vs true
  labels"; mlops "looks fine", "metrics"; multiagent flow "tech issue"; normalize "analytics"; oop "Order(...)",
  "fills attrs", flow "inherits"; pm "new risks", "unblock"; pod "shields"; projectb "results"; python2 "each
  row", "groupby", "json.dump"; pytooling "git commit", "git push"; queues "deliver", "enqueue"; security
  "redirect"; terminal "activate", "ls / dir"; warehouse flow "source()".
  Fix: paint labels last (`svg.append(gL)` after `gN`) with a `paint-order:stroke` halo in the surface colour, and
  move labels above short horizontal edges.
- Edges drawn through a node: in `context`, Instructions to Context window crosses History, and Output format to
  Context window crosses User state. In the `pandas` flow (sub-4), Orders table to merge() crosses Customer table.
  In the `warehouse` flow (sub-4), Marts to BI and AI crosses Docs + lineage. Fix: add a bend, or move the nodes.
- Two edge labels collide in `multimodal`: "call" and "result" overlap by 127px².
- Node/node overlaps: 0. Nodes or labels outside the viewBox: 0.

### C5. Dark-mode contrast in `#tryhost` (WCAG 4.5:1)
11 failing groups in 7 widgets (36 elements). They are identical at 1440 and 390:
| Widget | Selector | Ratio | Colours (fg/bg) |
|---|---|---|---|
| observability | `svg text` "budget used: 50%" over the orange bar | **1.66** | 226,235,232 / 244,167,58 |
| acid | `.wg-acid-cell.wg-acid-future .wg-acid-num` | **2.41** | 77,90,89 / 20,28,31 |
| sql | `tr.wg-sql-out td` (18 cells) | **2.87** | 92,100,101 / 20,28,31 |
| sql | `button.wg-sql-mv` (arrows) | 3.34 | 102,111,111 |
| transformer | `button.wg-tf-word` (selected) | 3.47 | 11,18,32 / 74,105,168 |
| acid | `.wg-acid-future pre.wg-acid-sql` | 3.88 | 113,121,121 |
| clustering | `.wg-w8-btn` "Move centers" (disabled look) | 3.88 | 113,121,121 |
| acid | "Back" button | 4.48 | 123,132,132 |
| http, prompting | `textarea` text | 4.48 | 123,132,132 |
Fix: in dark mode, draw bar text in ink over the bar, or position it outside the bar. Raise the dimmed or "future"
tokens to at least #8a9696, and use white text on `.wg-tf-word` selected.
Light mode also fails in these same widgets (acid 1.95, sql 2.16, transformer 2.72). The orange #d67c06 text used
in slg, pm, arc and interview (the `wg-star-warn` and `wg-pm-flag` classes) is 3.11 on white.
The range-slider values (31 widgets) were excluded because a slider shows no text.
Widgets were tested in their initial state only.

### C6. Priority order for fixes
1. C4 hidden edge labels (49). 2. C1 p7 Copy button. 3. C5 observability, acid and sql contrast.
4. C3 items 1, 3 and 4 (project code, case grids, lesson intro). 5. C2 widget captions (resilient, queues).
6. C2 squeezed node labels. 7. C4 edges through nodes. 8. C3 items 5 to 7 and the Syllabus checklist.
