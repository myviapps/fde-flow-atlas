# FDE Flow Atlas

A self-study course that takes a complete beginner to job-ready as a **Forward Deployed Engineer (FDE)**: the engineer who sits with a customer, finds the real problem, builds and deploys the fix (often with AI), and gets it adopted.

Everything is in one offline web page, [`FDE_Flow_Atlas.html`](FDE_Flow_Atlas.html). Open it in any browser. It needs no install, no account and no internet.

## What is inside

| Part | Count | Where |
|---|---|---|
| Topics, each with an animated flow, a full lesson, a case study and a quiz | 133 | in the page |
| Hands-on projects with starter code and tests | 11 | in the page and [`projects/`](projects/) |
| "Try it yourself" interactive tools | 68 | in the page, under the lesson |
| Quiz questions (5 per topic, answers explained) | 665 | in the page |
| Fill-in document templates with worked examples | 39 | in the page (Templates) and [`docs/`](docs/) |

## How to start

1. Download or clone this repository.
2. Double-click `FDE_Flow_Atlas.html` (or `index.html`, the same page). It opens in your browser.
3. Start at **Module 0: Prerequisites** in the left sidebar and go top to bottom. If you already code, open **Syllabus** and skip what you know.
4. For the projects, open [`projects/`](projects/) (or unzip `FDE_Atlas_Projects.zip`) and follow each project's README. Start with `p0-setup`.

## How to use the page

- **Sidebar (left):** every module and topic. The button at the top left hides or shows it. The search box filters topics.
- **Each topic page, top to bottom:**
  1. *Best way to learn this*: which format suits the topic (interactive, reading, document, project and so on) and why.
  2. *The flow*: an animated diagram. Press play, or use the left and right arrow keys to step through it with narration.
  3. *Lesson*: plain explanation, an analogy, why it matters, subtopics with examples and code, a glossary and practice tasks. Code blocks have a Copy button.
  4. *Try it yourself*: a small interactive tool, on topics where playing with it teaches faster than reading.
  5. *Key ideas, traps and interview questions.*
  6. *Case study*: a realistic customer scenario with discussion questions.
  7. *Check yourself*: a 5-question quiz. Pick an answer to see if it is right and why.
  8. *Related templates*: the document templates that go with the topic.
- **Syllabus:** a checklist of every topic and project. Tick items as you finish them.
- **Templates:** all 39 documents (SOW, PRD, design doc, runbook, eval plan and more), each with a worked example from an invented customer story.
- **My progress:** shown in the sidebar and the syllabus. Your ticks and quiz scores save automatically in your own browser and load again every time you open the page. Nothing leaves your computer, and other people using their own browser see only their own progress. *Reset* (click twice) clears it. Clearing your browser data also clears it, and a different browser starts fresh.
- Links like `FDE_Flow_Atlas.html#rag` open a topic directly. `#syllabus` and `#templates` open those views.

## Modules and topics

**0. Prerequisites** (17 topics)

How computers run code ⚡ · The terminal ⚡ · Python basics · Python data and files · Data wrangling with pandas ⚡ · Data formats and time ⚡ · How the internet works · Databases and SQL basics · What AI and ML are · Math you need for AI ⚡ · Linux, SSH and logs · Front-end basics for demos · JavaScript and TypeScript · Python classes and OOP · Async Python · Python project tooling · Statistics and A/B tests ⚡

**1. FDE Paradigm and Genesis** (4 topics)

Palantir origin and roles · Customer-facing roles ⚡ · Services-led growth ⚡ · FDE skills self-assessment ⚡

**2. Technical and Data Foundations** (34 topics)

How APIs work ⚡ · Git and version control ⚡ · Testing and TDD · Debugging unfamiliar code · Working with AI coding tools · Complexity and patterns ⚡ · Resilient API ingestion ⚡ · SQL execution order ⚡ · Query planning and indexes ⚡ · Schema design · Transactions and ACID ⚡ · Spark execution ⚡ · ETL and ELT pipelines · Data quality and matching ⚡ · Warehouses and dbt · FastAPI request lifecycle · Docker to Kubernetes · Cloud and Terraform · Enterprise networks ⚡ · Auth, SSO and access control ⚡ · Privacy and compliance · Regulated industries · Logs, metrics and traces ⚡ · Caching and performance ⚡ · Queues and background jobs ⚡ · System design basics ⚡ · REST, GraphQL, gRPC, hooks · NoSQL and choosing a DB · Real-time streaming ⚡ · CI/CD pipelines · Enterprise integration · Browser automation · BI dashboards · Spreadsheets and Excel

**3. Machine learning and GenAI** (42 topics)

The ML workflow · Feature engineering · Linear regression ⚡ · Logistic regression ⚡ · Trees and random forests ⚡ · Gradient boosting · kNN, SVM, Naive Bayes ⚡ · Clustering ⚡ · Dimensionality reduction ⚡ · Anomaly detection ⚡ · Time-series forecasting ⚡ · Recommender systems · Neural networks ⚡ · Deep learning architectures · Embeddings and vectors ⚡ · Transformer forward pass ⚡ · Calling LLM APIs ⚡ · Prompting and JSON output ⚡ · Context engineering ⚡ · Agentic Context Engineering · Agent Skills · RAG pipeline ⚡ · Tool calling and agents ⚡ · Model Context Protocol · Multi-agent systems · Agent memory and state ⚡ · LoRA, QLoRA, distillation ⚡ · RL and RLHF ⚡ · Evals ⚡ · Data labeling and review ⚡ · LLM observability ⚡ · LLM security and guardrails ⚡ · LLM cost and latency ⚡ · MLOps and monitoring · ML evaluation metrics ⚡ · Document AI and parsing · Serving open models ⚡ · Agent frameworks compared · Knowledge graphs, GraphRAG · Vision and voice AI · Voice agents ⚡ · Responsible AI, governance

**4. Human Stack and Business Acumen** (10 topics)

Problem decomposition · Customer discovery ⚡ · POCs and scoping · Executive communication ⚡ · SOWs, PRDs, design docs · Demos and storytelling · Product judgment and moats · Change and adoption · Project delivery basics ⚡ · Business cases and ROI ⚡

**5. FDE Operational Playbook** (6 topics)

12-week engagement arc ⚡ · Pod operating model · Writing and async comms ⚡ · Life on site: first 90 days · Incidents in the field ⚡ · Professional ethics on site ⚡

**6. AI Onboarding and Services** (9 topics)

AI readiness and use cases ⚡ · Last-mile onboarding · UAT, cutover and go-live ⚡ · Support and hypercare ⚡ · Customer-service AI agents ⚡ · Enablement and the AI CoE · Renewal and expansion · Services ops and PSA ⚡ · Low-code AI platforms

**7. Portfolio and Interviews** (11 topics)

Learning paths and fluency · Interview blueprint ⚡ · Interview rounds · DSA essentials ⚡ · Timed build drill · Case practice bank · SQL practice bank ⚡ · Resume and job search · Portfolio and proof · Project A: Agentic RAG · Project B: context compiler

⚡ = has an interactive tool.

## Projects

Each folder has a README with the goal, steps, starter code and tests.

| Project | Folder |
|---|---|
| Setup: your dev environment | [`projects/p0-setup`](projects/p0-setup/) |
| Project 1: CSV data cleaner | [`projects/p1-csv-cleaner`](projects/p1-csv-cleaner/) |
| Project 2: SQL analytics | [`projects/p2-sql-analytics`](projects/p2-sql-analytics/) |
| Project 3: FastAPI tickets service | [`projects/p3-fastapi-service`](projects/p3-fastapi-service/) |
| Project 4: resilient ingestion | [`projects/p4-ingestion`](projects/p4-ingestion/) |
| Project 5: containerize and deploy | [`projects/p5-docker-deploy`](projects/p5-docker-deploy/) |
| Project 6: tool-calling order-support agent | [`projects/p6-tool-agent`](projects/p6-tool-agent/) |
| Project 7: MCP server for a mock CRM | [`projects/p7-mcp-server`](projects/p7-mcp-server/) |
| Project 8: RAG with evals | [`projects/p8-rag-evals`](projects/p8-rag-evals/) |
| Capstone: agentic RAG service (Claims Policy Assistant) | [`projects/p9-capstone`](projects/p9-capstone/) |
| Timed drill: 90-minute build (support ticket triage API) | [`projects/p10-drill`](projects/p10-drill/) |

## Folder map

```
FDE_Flow_Atlas.html      the whole course, one offline page (open this)
index.html               same page, so GitHub Pages can serve it
docs/                    39 document templates as Markdown, with an index README
projects/                11 hands-on projects (p0 setup to p9 capstone, p10 timed drill)
FDE_Atlas_Projects.zip   the same projects zipped
source/                  everything needed to rebuild the page
  build/                 build scripts and page code (build3.py is the entry point)
  lessons/               the content: lessons, concepts, cases, quizzes, widgets, templates
  audits/                audit reports from the content reviews
  work/                  scratch output of the build (not committed)
```

## Suggested study plan

- **Weeks 1 to 3:** Module 0 (prerequisites) and projects p0 to p2.
- **Weeks 4 to 7:** Module 2 (technical and data foundations) with projects p3 to p5.
- **Weeks 8 to 12:** Module 3 (machine learning and GenAI) with projects p6 to p8.
- **Weeks 13 to 15:** Modules 1, 4, 5 and 6 (the FDE role, business skills, the engagement playbook), using the templates as you go.
- **Weeks 16 onward:** Module 7 (portfolio and interviews), the capstone p9, and the p10 timed drill every two weeks.

Do the quiz at the end of every topic, and tick the topic in the Syllabus only when you score 4 out of 5 or better.

## Rebuilding the page (for editors)

You need Python 3. From the repository root:

```bash
python3 source/build/build3.py
```

This rewrites `FDE_Flow_Atlas.html` in the repository root. Copy it to `index.html` too if you publish with GitHub Pages.

- `source/build/atlas_v2_backup.html` holds the base page and the original concept diagrams. Edit diagrams there.
- `source/lessons/lessons_*.json` hold lessons, `lessons_*_concepts.json` the newer topics, `cases_*.json` case studies (`cases_zz.json` overrides earlier ones), `quiz_*.json` quizzes, `fit*.json` the "best way to learn" notes, `widgets_*.js` the interactive tools, `docs_pack*.json` the templates, `proj_*_projects.json` the projects, `patch_*.json` extra subtopics and glossary terms.
- The topic order is the `FULL` list in `source/build/build3.py`.

## Publishing online (optional)

In the repository settings on GitHub, open **Pages**, choose "Deploy from a branch", pick `main` and `/ (root)`. The course is then live at `https://<your-user>.github.io/fde-flow-atlas/`.

## Credits

Built as a companion to the FDE Academy course outline. Companies and people in the case studies and templates are invented.
