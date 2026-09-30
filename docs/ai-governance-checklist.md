# AI Governance and Risk Checklist (NIST AI RMF and EU AI Act)

**When to use it:** Fill in this checklist before an AI system goes live, and review it at every major change and at least once a year. It helps you answer the questions a customer's risk, legal, or audit team will ask: What kind of AI system is this? How risky is it under the rules that apply? Who is accountable? How do we know it works, and what do we do when it does not? The checklist is organized by the four functions of the NIST AI Risk Management Framework (Govern, Map, Measure, Manage), a voluntary US framework, and it notes where the EU AI Act, a binding EU law, adds duties. It does not replace legal advice. Its job is to make sure nothing obvious is missed and that every "yes" points to evidence.

**Who reads it:** The customer's risk, compliance, and legal teams; internal audit; the business owner and sponsor who accept the remaining risk; and the engineers who own the system. Your own company's legal or trust team should review what you write about the law.

**How long it should be:** 2 to 4 pages. Each checklist line is one row with a link to evidence (model card, eval plan, runbook, DPIA). If a row needs a paragraph, the paragraph belongs in the linked document.

---

## The template

### 1. System and owners
*Good looks like: what the system is, who is accountable for it, and who can stop it.*

- System: [name, version]
- Purpose: [one sentence]
- Accountable owner: [name, role]
- Who can pause or turn it off: [names]
- Our role under the EU AI Act: [provider / deployer / both / not in scope], reason: [why]

### 2. Risk classification
*Good looks like: a written decision, with the reasoning, that a lawyer can check. Say what would change the answer.*

| Question | Answer | Reason |
|---|---|---|
| Is it a prohibited practice (EU AI Act Art. 5)? | [Yes / No] | [reason] |
| Is it high-risk (Annex I product or Annex III use case)? | [Yes / No] | [reason] |
| Does it trigger transparency duties (Art. 50: chatbots, synthetic content, emotion recognition)? | [Yes / No] | [reason] |
| Resulting tier | [prohibited / high / limited / minimal] | |
| What would change the tier | [uses that must stay out of scope] | |

### 3. Checklist
*Good looks like: every row is Done, Partial, or Gap, with evidence a reviewer can open. "Done" without evidence is a Gap.*

| # | Check | NIST AI RMF | EU AI Act note | Evidence | Status |
|---|---|---|---|---|---|
| G1 | Policy and accountability: owner, roles, and sign-off named | Govern | Deployer duties (Art. 26) if high-risk | [link] | [Done / Partial / Gap] |
| G2 | Staff who use or run the system have AI training | Govern | AI literacy (Art. 4) | | |
| G3 | Third-party model and vendor risks reviewed | Govern, Manage | Provider documentation | | |
| M1 | Intended use, users, and out-of-scope uses written down | Map | Intended purpose drives classification | | |
| M2 | People who could be harmed identified | Map | Fundamental rights (Art. 27) if high-risk | | |
| M3 | Legal and data requirements identified (privacy, sector rules) | Map | Works together with GDPR | | |
| ME1 | Performance measured on representative data, with targets | Measure | Accuracy (Art. 15) if high-risk | | |
| ME2 | Results by slice; weak groups named | Measure | Bias and data governance (Art. 10) if high-risk | | |
| ME3 | Security and misuse tested (for example prompt injection) | Measure | Robustness (Art. 15) if high-risk | | |
| ME4 | Production monitoring with thresholds | Measure | Post-market monitoring | | |
| MA1 | Human oversight: a person can check, override, and stop | Manage | Human oversight (Art. 14) if high-risk | | |
| MA2 | Incident process and notification path | Manage | Serious incident reporting if high-risk | | |
| MA3 | Change control and re-evaluation before release | Manage | Substantial modification can change roles | | |
| MA4 | Logs kept long enough to investigate | Manage | Record keeping (Art. 12, 26) if high-risk | | |
| MA5 | Decommission and rollback plan | Manage | | | |

### 4. Gaps and actions
*Good looks like: every Gap or Partial has an owner, a date, and a plain statement of the risk while it is open.*

| # | Gap | Risk while open | Action | Owner | Due |
|---|---|---|---|---|---|

### 5. Risk acceptance and sign-off
*Good looks like: a named business owner accepts the remaining risk in writing.*

- Residual risk summary: [2 to 3 sentences]
- Accepted by: [name, role, date]
- Next review: [date or trigger]

---

## Worked example: Northwind Logistics

Completed July 8, 2026 by Priya Shah and Ana Silva, reviewed by Omar Haddad (Security) and Northwind's legal team. Accepted by Dana Morales July 9.

### 1. System and owners
- System: Northwind invoice extraction, prompt v7, validator rule set 3
- Purpose: pre-fill carrier invoice fields and create draft invoices in Ledgerline for clerk review.
- Accountable owner: Luis Ortega (business), Grace Kim (technical)
- Who can pause or turn it off: Northwind IT on-call (global flag "auto_draft_enabled"), Luis Ortega (per-carrier "review all")
- Our role under the EU AI Act: Northwind is a deployer; Atlas AI and the model provider are providers. Northwind's legal team's view is that the Act likely does not reach this US-only use today, because the system and its outputs are used in the US. Northwind still applies the Act's structure because it pays European carriers and may extend the tool to other regions. Legal to re-check before any EU rollout.

### 2. Risk classification

| Question | Answer | Reason |
|---|---|---|
| Prohibited practice (Art. 5)? | No | No manipulation, social scoring, biometric identification, or emotion recognition |
| High-risk (Annex I or III)? | No | Extracts data from business documents. Not used for employment decisions, credit scoring of people, essential services, or any other Annex III area |
| Transparency duties (Art. 50)? | No | Does not chat with people or publish generated content; clerks know every field is machine-filled (yellow highlights, training) |
| Resulting tier | Minimal risk | Only the AI literacy duty (Art. 4) applies in general |
| What would change the tier | Using the clerk edit log to rate, rank, or discipline clerks would be "monitoring and evaluating the performance and behaviour" of workers, an Annex III high-risk use. This is written as an out-of-scope use in the model card and the DPIA |

Timeline note: the Act's rules apply in stages (prohibitions and AI literacy from February 2025, general-purpose model duties from August 2025, most high-risk duties later, with changes proposed to that timeline). Legal checks the current dates at each review.

### 3. Checklist

The EU AI Act column is left out here: at minimal risk, only AI literacy (Art. 4, row G2) applies.

| # | Check | NIST AI RMF | Evidence | Status |
|---|---|---|---|---|
| G1 | Owner, roles, sign-off | Govern | Handoff plan ownership map; model card section 12 | Done |
| G2 | AI training for users and operators | Govern | Clerk training (14 of 14), shadow week for IT, eval pairing for Ana | Done |
| G3 | Third-party model and vendor risk | Govern, Manage | Security questionnaire (112 answers); endpoint "no training" setting; model version pinned | Done |
| M1 | Intended and out-of-scope uses | Map | Model card sections 3 and 4 | Done |
| M2 | Who could be harmed | Map | Model card section 10 (carriers, clerks, Northwind finance) | Done |
| M3 | Legal and data requirements | Map | DPIA (July 8); internal audit's payment control kept by batch release | Done |
| ME1 | Performance on representative data | Measure | Eval plan; golden set 97.4% critical field accuracy | Done |
| ME2 | Results by slice | Measure | Model card section 7; scanned slice 95.9% named as weak | Partial: scanned slice below target |
| ME3 | Security and misuse tests | Measure | Edge set prompt-injection tests, zero failures | Done |
| ME4 | Production monitoring | Measure | Runbook alerts; weekly audit of 100 invoices; SLO sheet | Done |
| MA1 | Human oversight | Manage | Draft-only (ADR-004); batch release by a named person; overrides logged | Done |
| MA2 | Incident process | Manage | Post-mortem of June 30 currency incident; runbook escalation | Done |
| MA3 | Change control | Manage | Eval release gates; two sign-offs (Ana Silva, Luis Ortega) | Done |
| MA4 | Logs | Manage | Release and admin logs kept 1 year; extractions 30 days | Done |
| MA5 | Rollback and decommission | Manage | Kill switch and manual fallback in runbook section 7 | Done |

### 4. Gaps and actions

| # | Gap | Risk while open | Action | Owner | Due |
|---|---|---|---|---|---|
| ME2 | Scanned slice at 95.9%, below the 97% target | More wrong fields on scans reach review; clerks may over-trust | Lower confidence threshold for scans (done); improve OCR step | Atlas AI | August 31 |
| M1 | Clerk edit log could be misused for performance rating | Would create a high-risk use and harm clerk trust | Access to per-clerk edit data limited to Ana Silva and Luis; reports show carrier and field, not clerk | Grace Kim | July 17 |

### 5. Risk acceptance and sign-off
- Residual risk summary: The system is minimal risk under the EU AI Act structure and well controlled under the NIST AI RMF. The main remaining risks are lower accuracy on scanned invoices and misuse of clerk-level data, both with owners and dates. No invoice can be paid without a person releasing it.
- Accepted by: Dana Morales, CFO, July 9, 2026
- Next review: October 2026 (with the ADR-004 revisit), or earlier on any new use, new model, or new region.

---

## Common mistakes

- Treating the classification as obvious and not writing down the reasoning. The reasoning is what an auditor checks.
- Forgetting that the use decides the risk tier, not the technology. The same data used to rate employees would be a different, higher-risk system.
- Marking rows "Done" with no evidence link.
- Using the checklist once at launch and never again. New uses, new models, and new regions all need a fresh look.
- Stating legal conclusions as an engineer. Write the facts clearly and let legal counsel own the legal view.
