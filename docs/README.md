# FDE Template Doc Pack

Reusable, beginner-friendly templates that a Forward Deployed Engineer (FDE) uses on real customer engagements. Each template has:

- When to use it, who reads it, and how long it should be.
- The template itself, with bracketed fill-in prompts and short italic guidance on what good looks like.
- A fully filled-in worked example.
- Common mistakes to avoid.

## One story across all templates

Every worked example follows the same invented engagement, so you can read them in order and see how the documents connect. Northwind Logistics, a freight company, deploys an invoice-extraction assistant built by Atlas AI (also invented). Priya Shah is the FDE. Dana Morales (CFO) is the sponsor, Luis Ortega runs Accounts Payable, Grace Kim leads IT, and Omar Haddad leads security. The project runs 10 weeks from May 4, 2026, goes live on the top 40 carriers in week 9, has a currency incident on June 30, and is handed off on July 10.

Suggested reading order: discovery guide, business case, SOW, PRD, design doc, decision log, security questionnaire, eval plan, RAID log, status report, exec update, runbook, post-mortem, handoff, STAR card, resume bullets.

## Templates

| # | Template | When to use it | Atlas topics |
|---|---|---|---|
| 1 | [Customer discovery interview guide](discovery-guide.md) | Before and during first customer conversations, to learn the real workflow, pain, and success metrics. | discovery, case |
| 2 | [Statement of work](sow.md) | After discovery, to agree on scope, deliverables, acceptance criteria, timeline, and fees before delivery starts. | arc, pm |
| 3 | [Product requirements doc](prd.md) | Before design, to agree on the problem, users, goals, and testable requirements for one customer use case. | discovery, docs |
| 4 | [Technical design doc / RFC](design-doc.md) | Before most coding, to explain how the system will work, the options considered, and how it fails safely. | docs, sysdesign |
| 5 | [Architecture decision record](decision-log.md) | Whenever the team makes a hard-to-reverse technical decision that people will later ask about. | docs |
| 6 | [Weekly executive update](exec-update.md) | Every week, to tell the sponsor in 2 minutes whether you are on track and what you need from them. | exec |
| 7 | [Weekly project status report](status-report.md) | Every week, to track milestones, workstreams, issues, and owned action items with the project team. | pm |
| 8 | [RAID log](raid-log.md) | From week 1 to handoff, to track risks, assumptions, issues, and dependencies with owners. | pm, change |
| 9 | [ROI business case one-pager](business-case.md) | When a sponsor must justify the spend to finance, using the customer's own checkable numbers. | roi, slg |
| 10 | [Security questionnaire answers](security-questionnaire.md) | When the customer's security team sends a questionnaire before approving the deployment. | security, compliance |
| 11 | [Production runbook](runbook.md) | Before go-live, so any on-call engineer can check health, handle alerts, and roll back safely. | observability, lastmile |
| 12 | [LLM evaluation plan](eval-plan.md) | Before tuning prompts or models, to define datasets, metrics, guardrails, and release gates. | evals, guardrails |
| 13 | [Handoff and enablement plan](handoff.md) | From mid-engagement onward, so the customer team can run, fix, and improve the system without you. | lastmile, change |
| 14 | [STAR interview story card](star-card.md) | When preparing for behavioral interviews, to turn a real project moment into a 2-minute story. | interview, casebank |
| 15 | [FDE resume bullet worksheet](resume-bullets.md) | Right after a project, to turn facts and numbers into strong resume bullets. | career |
| 16 | [Blameless incident post-mortem](post-mortem.md) | Within 5 business days of an incident or near miss, to find system causes and owned fixes. | observability, resilient |
| 17 | [POC / pilot success-criteria sheet](poc-plan.md) | Before a POC or pilot starts, to agree on scope, measurable success criteria, stop rules, and who makes the go/no-go call. | arc, case, discovery |
| 18 | [Stakeholder map and champion list](stakeholder-map.md) | From week 1, updated every 2 weeks, to know who can help or block and who will push the project forward. | discovery, change, case |
| 19 | [10-minute demo script](demo-script.md) | Before any decision-making demo, to tell a before/after story on the customer's data and recover calmly when something fails. | demo |
| 20 | [AI system / model card](model-card.md) | Before go-live and at every model or prompt change, to document intended use, performance by slice, limits, and guardrails. | responsibleai, mlops, guardrails |
| 21 | [Data source inventory and data-quality checklist](data-inventory.md) | In week 1, to list every data source with owner, format, and sensitivity, and to test each one for quality before building on it. | etl, lastmile, compliance, dataformats |
| 22 | [Integration spec for a customer API](api-integration-spec.md) | Before calling a customer system, to fix endpoints, auth, field mapping, errors, idempotency, and rate limits, proven in a sandbox. | http, integration, lastmile, apistyles |
| 23 | [End-user training and communication plan](training-plan.md) | 4 to 6 weeks before go-live, to plan who hears what from whom and how each user group practices real tasks. | change |
| 24 | [Personal 12-week FDE learning route](learning-plan.md) | When growing into an FDE role, to turn a vague goal into 12 weeks of practice with visible outputs and checkpoints. | fluency, career |
| 25 | [AI governance and risk checklist (NIST AI RMF, EU AI Act)](ai-governance-checklist.md) | Before go-live and at every major change, to classify AI risk, map controls to NIST AI RMF and the EU AI Act, and get risk accepted. | responsibleai, compliance |
| 26 | [Data protection impact assessment (DPIA)](dpia.md) | In the design phase of any system that processes personal data with AI, to find risks to people and the measures that reduce them. | compliance, security |
| 27 | [SLI/SLO definition sheet with error budget policy](slo-sheet.md) | Before go-live, to agree on measurable reliability targets, burn-rate alerts, and what the team does when the error budget runs out. | observability |
| 28 | [Reproducible bug report](bug-report.md) | Whenever you find wrong behavior someone else must fix, so they can reproduce it from your steps alone. | debugging |
| 29 | [One-page case decomposition worksheet](case-worksheet.md) | After a first customer call or in an interview case, to break an open problem into users, goal, constraints, options, and a recommendation. | case, casebank |
| 30 | [AI Readiness Assessment and Use-Case Scorecard](ai-readiness.md) | Before committing to a build, to check readiness and pick a first pilot. | aireadiness, discovery |
| 31 | [Go-Live Readiness and Cutover Plan](golive-checklist.md) | In the three weeks before go-live, and on cutover day. | golive, lastmile |
| 32 | [UAT Test Script and Sign-Off Sheet](uat-plan.md) | Before go-live, to let the customer's users accept the system. | golive |
| 33 | [Support Model and Escalation Matrix](support-model.md) | Before go-live, to agree tiers, severities and escalation. | supportops |
| 34 | [Customer Incident Notice: Initial, Update and Resolved](incident-comms.md) | During any customer-visible incident. | incidents, supportops |
| 35 | [End-of-Day and Handoff Note](async-update.md) | Every working day at the end of work, and whenever work passes to a colleague in another time zone, a cover or a new owner. | asyncwriting, fieldlife, pod |
| 36 | [Customer Success Plan and Value Tracker](success-plan.md) | In the two weeks before go-live to record agreed success criteria, then monthly after go-live to track value realised, renewal risks and expansion candidates. | expansion, change, slg |
| 37 | [Agent SOP and Policy Specification](agent-sop.md) | Before writing any prompt for a customer-facing AI agent, to turn the customer's SOPs into rules the agent can be built and tested against. | cxagents, supportops |
| 38 | [Annotation Guidelines](labeling-guide.md) | Before any labeling starts, to write the rulebook that makes labels consistent and measurable, and again after each agreement check. | labeling, evals |
| 39 | [Team Prompt Library and Usage Guide](prompt-library.md) | During enablement after go-live, to give a team shared, tested prompts and clear rules for when to trust the output. | enablement, prompting |

Templates 30 to 39 follow a second invented engagement: Brannock Logistics, with the same people (Priya Shah at Atlas AI and the Brannock team). Templates 1 to 29 use Northwind Logistics. The ideas transfer between the two stories.
