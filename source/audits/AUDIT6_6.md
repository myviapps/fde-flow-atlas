# AUDIT6_6: deep per-topic audit (Modules 4-7 and projects)

Scope: case discovery poc exec docs demo moat change pm roi arc pod lastmile fieldlife fluency interview interviewrounds dsa builddrill casebank sqlbank career portfolio projecta projectb.
Method: read every lesson subtopic (lessons_*.json + patch_*.json) and concept (ideas, traps, qa). Numbers and code were re-checked: all sqlbank query outputs re-run in SQLite (all correct); ROI/NPV/sensitivity, NPS/health score, PERT, TTV, gross margin, NRR and comp-comparison arithmetic are all correct. Before calling anything missing I grepped all lessons for it (for example go/no-go, cutover, Kanban, time and materials, IP ownership, release notes, gifts, WISMO: none found in lessons).

### case
- ADD MICRO: Restate and clarify the goal -> say your structure up front (signposting) and time-box a 30-45 min round out loud ("5 min questions, 10 min current state, 10 min design, 5 min risks").
- ADD MICRO: Data reality and constraints -> a back-of-envelope sizing line: volume x tokens x price per day and a latency budget (e.g. 14 discharges x 10 notes x 2k tokens), since interviewers often ask "what would this cost?".
- ADD MICRO: Thin slice, plan and risks -> the "do we even need AI?" check: name the non-AI fix first (e.g. notify pharmacy automatically when the discharge order is drafted) and use it as the baseline the AI slice must beat.
- ADD MICRO: Thin slice, plan and risks -> the backtest target "80% of next-day discharges appear on the list" is recall only; add precision (how many listed patients do not leave) and the cost of each error type to pharmacy workload.
- ADD MICRO: Success metric, baseline and guardrail -> adoption as a leading metric (share of nightly lists opened and confirmed by the charge nurse) alongside the lagging hours metric.

### discovery
- ADD SUBTOPIC: Quantitative discovery: sizing the pain with data: pull ticket/log exports and run simple counts to confirm or refute interview claims (triangulate what people say with what systems show), and how to request a data sample safely.
- ADD MICRO: Preparing an interview guide -> a separate short guide for executives (15-20 min: outcome, budget, deadline, what the board asks about) versus the user guide.
- ADD MICRO: Shadowing and capturing pain -> collect 20-50 real input samples, including the ugliest ones (handwritten PO, blurry scan), to test AI feasibility early; get permission and mask personal data.
- ADD MICRO: Writing the problem statement -> how to synthesise: affinity mapping (one note per observation, cluster, count by theme) and saturation (stop when new interviews add no new themes).
- ADD MICRO: Writing the problem statement -> convert the statement into an opportunity size that feeds the ROI topic (1,500 invoices x 4 min saved = 100 hours/month).
- ADD MICRO: Open vs leading questions -> handling the customer who insists "just build what we asked": acknowledge, agree a short discovery time box, and show one data point that changes the ask.

### poc
- ADD MICRO: Written success criteria -> small eval sets carry uncertainty: at 85% on 300 labelled items the 95% interval is roughly +/-4 points; set targets and decision rules with that margin in mind, and "P1 recall 100%" needs a stated minimum number of P1 cases.
- ADD MICRO: Scoping: in, out and customer commitments -> data handling during a POC: NDA/DPA signed before data moves, where the POC runs (vendor sandbox vs customer tenant), masked or synthetic data, and a deletion date (only the last checklist line mentions it).
- ADD MICRO: POC versus pilot versus production -> competitive bake-offs: the customer runs the same criteria against two or three vendors; ask for the shared eval set and the scoring method up front.
- ADD MICRO: Turning a POC into a signed deal -> a mid-point checkpoint with an explicit early-stop rule, and treating a well-evidenced no-go as a good outcome.
- ADD MICRO: Answering RFP technical sections -> standard security questionnaire formats (SIG Lite, CAIQ), a public trust center, and the AI-specific questions buyers now ask: is our data used for training, retention and zero-data-retention options, model sub-processors, and where inference runs.

### exec
- ADD SUBTOPIC: Delivering bad news early: telling a sponsor about a slip or a miss before they find out (no-surprises rule): own it, give the impact, the new date with confidence, and options, in writing the same day; include a template email.
- ADD MICRO: Two tracks during an incident -> severity levels (SEV1-SEV3) that set update cadence, one named incident lead, and a customer-facing incident report (plain-language cause, impact, fix, prevention) that differs from the internal blameless postmortem.
- ADD MICRO: Listen and restate -> apologise for the impact without speculating about blame, liability or SLA credits; route contractual questions to the account team.
- ADD MICRO: Storytelling in reviews -> pre-wiring: brief the key executive 1:1 before a steering meeting so there are no surprises in the room, and how to handle two executives who want different outcomes (surface the conflict to the sponsor, do not pick a side).
- ADD MICRO: Answer first -> async writing norms: subject line that states the ask and deadline, one topic per message, and moving decisions out of chat into the recap/decision log.

### docs
- ADD SUBTOPIC: User-facing documentation: end-user quick-start (one page), admin guide, FAQ of known limits and release notes/changelog per version; who owns each after handover.
- ADD MICRO: The statement of work -> commercial models the SOW sits under: fixed price vs time and materials vs milestone payments, and how each changes an FDE's risk when scope moves.
- ADD MICRO: The statement of work -> clauses an engineer must read: IP ownership of custom code and adapters, warranty or hypercare period, acceptance by deemed approval (e.g. 10 business days), and data return/deletion at the end.
- ADD MICRO: Keeping a decision log -> a change request template (description, reason, impact on time/cost/risk, options, approver, date); the text mentions change requests three times but never shows one.
- ADD MICRO: The technical design doc -> review workflow: who must approve (customer security, data owner), comment resolution, and versioning so the approved design is findable later.

### demo
- ADD SUBTOPIC: Handling questions and objections: a parking lot for off-topic questions, "I don't know, I'll confirm by Thursday", the four common AI objections (hallucination, data security, cost, jobs) with short honest answers, and never promising roadmap dates.
- ADD MICRO: Handling live failures -> LLM non-determinism: the same prompt can answer differently live than in rehearsal; pin model version, lower temperature where supported, pre-warm, and keep cached outputs for the key step.
- ADD MICRO: Rehearsal and a recorded backup -> screen-share hygiene: notifications off, a clean browser profile, no tabs or history showing another customer's data, zoom 125-150%.
- ADD MICRO: Tailoring to executives and end users -> a third audience: the customer's IT/security engineers (architecture, data flow, logs, auth), who often decide go-live.
- ADD MICRO: Build the demo around the user's workflow -> show one AI failure on purpose and how the human corrects it; it builds more trust than a flawless run.

### moat
- ADD MICRO: Isolating one-offs with config and adapters -> per-tenant feature flags as the third isolation tool (turn behaviour on for one customer without a branch), with flag cleanup.
- ADD MICRO: The build-it-where decision -> the promotion lifecycle: when an adapter becomes a core feature, migrate tenants to it and delete the custom code; otherwise sprawl remains.
- ADD MICRO: Process data as a moat -> other moats (switching costs from deep integration, workflow embedding, eval sets and domain know-how) and the caveat that foundation-model progress weakens pure data moats.
- ADD MICRO: Process data as a moat -> many enterprise contracts forbid cross-customer training; per-tenant opt-in, aggregation/anonymisation, and zero-retention terms with model providers must be checked before logging for training.

### change
- ADD SUBTOPIC: Retiring the old way and expanding: a decommission plan for the legacy spreadsheet/report (date, owner, read-only period), then taking the proven workflow to the next team or use case (land and expand from the FDE side).
- ADD MICRO: Handling resistance -> the opposite problem, over-trust (automation bias): users accepting nearly 100% of suggestions without checking; watch acceptance and edit rates and audit samples.
- ADD MICRO: Measuring adoption -> retention cohorts (of users active in week 1, how many are still active in week 4) and stickiness (daily/weekly active), because one-week breadth hides drop-off.
- ADD MICRO: Communication plans -> in some countries (e.g. Germany) works councils or unions must be consulted before tools that can monitor employee performance; involve HR early.
- ADD MICRO: Training plans that stick -> ongoing support channels: office hours for the first month, in-app tips, and a one-click feedback button feeding the champion issue log.

### pm
- ADD MICRO: Agile and sprints in practice -> Kanban as the common FDE alternative (continuous flow, WIP limits, board columns) and the tools used (Jira, Linear, GitHub Projects).
- ADD MICRO: Backlog and user stories -> definition of done (tests pass, evals pass, deployed to staging, docs updated) versus per-story acceptance criteria.
- ADD MICRO: The weekly status report -> a milestone plan and critical path view for the sponsor (which dates move if one dependency slips).
- ADD MICRO: The weekly status report -> glossary note: RAG status (red/amber/green) is not RAG (retrieval-augmented generation); beginners confuse them in this atlas.

### roi
- ADD SUBTOPIC: Tracking realised value after go-live: compare forecast with actuals monthly, attribute with a control group or before/after, update the case, and feed the numbers into QBRs and renewal.
- ADD MICRO: Estimating value from a baseline -> value from quality and risk, not only time: fewer errors x cost per error (rework, penalties, refunds), and avoided incidents; with a worked line.
- ADD MICRO: ROI, payback and NPV -> IRR (the discount rate at which NPV = 0), which many CFOs ask for, and TCO as the name for the full cost picture.
- ADD MICRO: What a business case contains -> compare against alternatives, including "do nothing" and a non-AI process fix, not only against zero.
- ADD MICRO: The full cost of an AI system -> derive the 60,000/year LLM line from volume x tokens x price (link to llmcost) instead of stating it.

### arc
- ADD SUBTOPIC: Go-live: readiness and cutover: kick-off to go-live gate, UAT sign-off, go/no-go checklist, staged rollout (shadow mode, one team, then all), rollback plan and a launch-day run sheet; the arc currently jumps from hardening to measuring with no launch step.
- ADD MICRO: Weeks 1-2 -> the kick-off meeting (agenda, RACI, success criteria read-back, dependency list) that opens the engagement.
- ADD MICRO: Weeks 11-12: handover -> hypercare exit criteria (e.g. two weeks with no SEV1, CoE resolved a drill) and the L1/L2/L3 support split after handover.
- FIX: Weeks 7-10 example "You add three retries with exponential backoff" -> code uses stop_after_attempt(3), which is 3 attempts = 2 retries; say "up to three attempts" or use stop_after_attempt(4).
- FIX: Weeks 7-10 code `@retry(stop=..., wait=...)` retries every exception, including 4xx from raise_for_status -> add `retry=retry_if_exception(lambda e: isinstance(e, httpx.TransportError) or (isinstance(e, httpx.HTTPStatusError) and e.response.status_code in (429, 500, 502, 503, 504)))`; retrying a 404/401 only adds delay.
- FIX: Measure against the criteria SQL `WHEN received_at < DATE '2026-01-05' THEN 'baseline'` has no lower bound, so it is not the same 90-day definition as the week-1 baseline the text insists on -> `WHEN received_at >= DATE '2026-01-05' - INTERVAL '90 days' AND received_at < DATE '2026-01-05'`.

### pod
- ADD SUBTOPIC: Pod rituals and the home team: daily pod sync, weekly sync with product/platform engineering, how to escalate a platform bug, code review inside the pod, a shared cross-pod knowledge base, and handing an account over when people rotate.
- ADD MICRO: Pod anatomy -> Echo/Delta are Palantir terms; other real shapes: FDE paired with an account executive and solutions engineer, a solo FDE across several accounts, an FDE manager over many pods.
- ADD MICRO: Darwinistic adoption -> low usage can mean poor discoverability or missing training rather than low value; talk to a few users before removing a feature.
- ADD MICRO: Darwinistic adoption SQL -> a 21-day window can touch four calendar weeks with date_trunc('week'), so "2 of 3 weeks" is really "2 of up to 4"; use full completed weeks.

### lastmile
- ADD SUBTOPIC: The onboarding plan end to end: kick-off, tenant setup, SSO and user provisioning (SAML/OIDC, SCIM, role mapping), data connections, configuration, UAT, go-live and hypercare, with time-to-first-value tracked; Module 6 has no end-to-end view of onboarding.
- ADD SUBTOPIC: Enablement and the support model: admin training, who handles L1 (customer helpdesk), L2 (customer CoE) and L3 (vendor), escalation SLAs, and a known-issues page, so the FDE is not the permanent support desk.
- ADD MICRO: Probing an undocumented API -> watch real traffic with browser DevTools (Network tab, HAR export) or a proxy such as mitmproxy; throttle probes against production; redact tokens and personal data from fixtures before committing them.
- ADD MICRO: Repairing broken schemas -> schema-drift alerts (new column, new status code, spike in "unknown" or quarantined rows) and a data contract with a named owner on the customer side.
- ADD MICRO: Encoding workflow exceptions -> rule governance: who may edit the YAML, versioning and review, a test per rule, and detecting overlapping rules; `matches()` raises KeyError when a claim has no amount.
- FIX: Subtopic "A typed wrapper with retries and tests" -> the code has no retries, no timeout, no raise_for_status and no tests; add an httpx.Client(timeout=10, transport=httpx.HTTPTransport(retries=3)) or tenacity on 429/5xx, and a pytest using httpx.MockTransport that replays the saved fixtures (pagination, 200-with-error body).

### fieldlife
- ADD SUBTOPIC: Ethics and professional conduct on site: never carry one customer's data, code or plans to another, gifts and hospitality rules and anti-bribery, no side work or recruiting customer staff, honesty about what the product cannot do, and what to do when asked to bypass a control or when you see harmful use (escalate to your manager or legal).
- ADD MICRO: Travel and remote rhythm -> shared channels (Slack Connect or Teams) with the customer: expected response times, what belongs in tickets vs chat, no decisions in DMs, and nothing confidential from other accounts pasted there.
- ADD MICRO: Your first two weeks -> your own internal ramp before or alongside the customer: shadow a senior FDE, learn the platform and internal tools, read past account notes.
- ADD MICRO: A sustainable pace -> impostor feelings in a new domain, and saying "I don't know yet, I will find out by X" to customers without losing credibility.

### fluency
- ADD SUBTOPIC: Staying current in a fast field: a weekly routine (provider release notes and API changelogs, official docs and cookbooks, one paper or technical post skimmed, one thing reproduced in code) and how to judge hype.
- ADD MICRO: Designing a route that fits the role -> when job posts ask for them, cloud and data certifications (AWS, Azure, Google Cloud, Databricks) and free model-provider courses and cookbooks; plus Kaggle for practice data.
- ADD MICRO: Salesforce Trailhead and Agentforce -> customers may instead run Microsoft Copilot Studio, ServiceNow or Google agent platforms; the same agent-spec template applies.
- ADD MICRO: Applying the 4Ds -> measure your own AI speed-up honestly (time a task with and without the tool) rather than assuming it.

### interview
- ADD MICRO: How the loop is scored -> the 40/30/20/10 weights are the course's model; real loops differ by company (decomposition rounds, take-homes, presentation rounds), so confirm the loop with the recruiter.
- ADD MICRO: Business acumen -> GRR (gross revenue retention, no expansion counted) next to NRR, ACV, and services versus subscription revenue, which FDE leaders also watch.
- FIX: The practical build round `fetch_all` treats any non-429 status as success, so a 500 raises KeyError on body["orders"], and it sleeps once more after the final 429 before raising -> check `if status == 200: break`, retry on 429 and 5xx, raise on other 4xx, and skip the sleep on the last attempt.

### interviewrounds
- ADD SUBTOPIC: The AI/LLM technical round: live prompt iteration, designing a small eval set, choosing a model on cost/latency/quality, handling hallucination and prompt injection, and debugging a broken RAG or agent trace, now common at AI-lab FDE loops.
- ADD SUBTOPIC: Project deep dive and presentation round: presenting a past project or mock customer proposal in 20-30 minutes, slide structure, handling technical follow-ups and "what would you do differently".
- ADD MICRO: Recruiter and hiring manager screens -> run several processes in parallel so offers land close together; ask each recruiter for the timeline.
- ADD MICRO: Live coding and pair programming -> the environment: CoderPad/HackerRank-style editors with little autocomplete; know stdlib by heart (collections, itertools, heapq, json, re, datetime).
- ADD MICRO: The reverse interview and the offer -> handling rejection: ask for feedback, typical 6-12 month reapply windows, and a short post-loop self-review.

### dsa
- ADD SUBTOPIC: Recursion, trees and memoization: recursive thinking with a base case, traversing tree-shaped data (nested JSON, folder trees, org charts), a binary tree/BST example, and functools.cache as a first taste of dynamic programming.
- ADD MICRO: Graphs with BFS and DFS -> topological sort (Kahn's algorithm) with cycle detection, the text says DFS orders dependencies but shows no code; one line on Dijkstra for weighted graphs.
- ADD MICRO: Arrays, strings and hash maps -> prefix sums for range totals, and dict.get / defaultdict for counting and grouping.
- ADD MICRO: Sorting and binary search -> multi-key sorts (key=lambda r: (r["region"], -r["amount"])) and Python's sort stability.

### builddrill
- ADD SUBTOPIC: Swapping the stub for an LLM call: structured output constrained to the three categories, a timeout, a fallback to the keyword rule on error or invalid output, a mocked LLM in tests, and a 20-example accuracy check; the drill tells you to do this but never shows how.
- ADD MICRO: A minute-by-minute plan -> git during the drill: git init at minute 10, .gitignore for .venv and .env, small commits at each phase so reviewers can see the process.
- ADD MICRO: Presenting trade-offs -> read your own diff once before submitting (debug prints, secrets, dead code).

### casebank
- ADD SUBTOPIC: Cases 9 and 10: an agent that acts, and legal review: an IT helpdesk agent that resets passwords and changes access (tests action permissions, confirmation, audit, blast radius) and a contract-review assistant for a legal team (tests citations, privilege, lawyer sign-off).
- ADD SUBTOPIC: Cases 11 and 12: production crises: an LLM bill that tripled in a month (diagnosis from token logs, caching, model routing) and a suspected prompt-injection data leak (containment, communication, fix), testing operational judgment.
- FIX: Case 6 outline "WISMO contacts per 1,000 parcels" -> WISMO is never defined; write "WISMO ('where is my order') contacts per 1,000 parcels".

### sqlbank
- ADD SUBTOPIC: Extra hard: exercises 11 to 14: running totals with SUM() OVER (ORDER BY ...), deduplication keeping the latest row with ROW_NUMBER(), conditional aggregation (pivot with SUM(CASE WHEN ...)), and a month-over-month growth or first-order cohort retention table; these are among the most asked analytics questions.
- ADD MICRO: Medium: exercise 5 -> the NOT IN NULL trap and NOT EXISTS as the safer alternative to LEFT JOIN ... IS NULL.
- ADD MICRO: How to answer SQL questions -> dialect differences interviewers use (PostgreSQL date_trunc and date subtraction vs SQLite strftime and julianday; integer division) and a self-join example.

### career
- ADD SUBTOPIC: Breaking in from a beginner background: stepping-stone roles (support engineer, implementation consultant, solutions engineer, data analyst), new-grad and apprentice FDE programs, and how to present career-switch or bootcamp experience with projects.
- ADD SUBTOPIC: Growing as an FDE: levels and what senior looks like, a running brag document for reviews, and common next steps (senior FDE, product, engineering management, founding a company).
- ADD MICRO: An FDE-focused resume -> ATS-friendly format: single column, standard headings, PDF, keywords taken from the posting.
- ADD MICRO: Finding FDE roles -> visa sponsorship and location filters, and the companies using the FDE title (for example Palantir, OpenAI, Anthropic, Scale) as search seeds.
- ADD MICRO: Negotiating an offer -> exploding offer deadlines and asking for an extension; negotiating non-cash terms such as travel share and remote days.

### portfolio
- ADD SUBTOPIC: Hosting a live demo safely: free or cheap hosting options, keeping API keys server-side, spend caps and rate limits, a mock mode when the key budget runs out, and checking the link still works before each application.
- ADD MICRO: A project README that sells -> a CI badge from a GitHub Actions workflow that runs tests on each push, and a LICENSE file.

### projecta
- ADD SUBTOPIC: Ingestion: parse, chunk, embed and upsert with ACLs: PDF/table parsing, chunk size and overlap, batch embedding, carrying allowed_groups from the source system, and re-indexing or deleting when documents change; the project never shows how chunks get into the table.
- ADD MICRO: Hybrid retrieval with permissions -> filtered HNSW search can return fewer than LIMIT rows when most chunks are filtered out; raise hnsw.ef_search or use iterative index scans (pgvector 0.8+), and test with a low-privilege user.
- ADD MICRO: Evaluation and serving -> retrieval metrics computed separately (recall@5 and MRR against expected source documents), plus a Docker Compose file with Postgres for the "anyone can run it" claim.
- ADD MICRO: QLoRA fine-tuning -> formatting examples with the model's chat template, a minimal TRL SFTTrainer call, and serving the adapter (e.g. vLLM LoRA support or merging weights).
- ADD MICRO: Grading evidence -> retrieved documents can contain prompt-injection text; wrap passages as data and have the grounding check ignore instructions inside them.
- FIX: The agent graph -> the permission design is not wired through: `retrieve` calls `search(s["query"])` with no user groups and the `/ask` endpoint takes no identity; add `user_groups` to RAGState, derive it from auth in `/ask`, and pass it as $3 to the hybrid query.
- FIX: Evaluation and serving `"faithfulness": sum(r["grounded"] ...) / len(log)` -> that is the share of fully grounded answers, not claim-level faithfulness as defined above; rename it grounded_answer_rate or compute supported_claims / total_claims.
- FIX: Evaluation and serving `out.get("tok_in", 0)` -> no node ever writes tok_in/tok_out, so cost is always 0; accumulate resp.usage.input_tokens/output_tokens in each LLM node into the state.

### projectb
- ADD SUBTOPIC: Running tests safely: write_file and run_tests: the missing nodes; write only inside ROOT, run pytest in a container with no network, CPU/memory limits and a timeout, increment attempts, return the git diff as the patch, and reset the repo (git checkout/clean) between tasks and rounds so evaluation runs are independent.
- ADD MICRO: File-system tools -> grep should skip .git, virtualenvs and binaries (--exclude-dir, -I) and have a timeout; open_file should clamp start to at least 1 (start=0 reads the last line via lines[-1]).
- FIX: `subprocess.run(["grep", "-rnE", pattern, "."])` -> a model-supplied pattern starting with "-" is parsed as a grep option (argument injection); use `["grep", "-rnIE", "-e", pattern, "--", "."]`.
- FIX: `apply_delta` add op uses the id the LLM supplied, so an existing id is silently overwritten -> generate ids in code (next free b-NNN); the merge branch also drops the removed bullet's harmful count, add it to the kept bullet too.
