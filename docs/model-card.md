# AI System / Model Card

**When to use it:** Write a model card (for one model) or a system card (for a whole AI system built around one or more models) before go-live, and update it every time the model, prompt, data, or guardrails change. It is the "nutrition label" for an AI system: what it is for, what it is not for, how well it works and for whom, where it is weak, and how humans stay in control. On FDE projects you usually do not train the model yourself, so the card describes the system you built: the model you call, your prompts, your data checks, and your guardrails. Risk teams, auditors, and the engineers who inherit the system all rely on it.

**Who reads it:** The customer's risk, security, and audit teams; the business owner; the engineers who will run and change the system after handoff; and sometimes regulators or external auditors. Your own product team reads it to learn how the system is used in the field.

**How long it should be:** 2 to 4 pages. Link to the eval plan, design doc, and runbook for details instead of copying them.

---

## The template

### 1. Overview
*Good looks like: name, version, date, owner, and a 2-sentence description a non-engineer understands.*

- System name and version: [name, version]
- Card date and author: [date, name]
- Owner after handoff: [name, team]
- Description: [what it does, in plain words]

### 2. Components
*Good looks like: every model and major part, with version and where it runs. No secrets, no keys.*

| Component | What it is | Version | Where it runs |
|---|---|---|---|

### 3. Intended use
*Good looks like: the users, the task, and the decisions the output feeds.*

- Intended users: [who]
- Intended task: [what]
- Decisions supported: [what the output is used for, and who makes the final decision]

### 4. Out-of-scope uses
*Good looks like: specific things the system must not be used for, even if it technically could.*

- [Use it must not be used for]

### 5. Data
*Good looks like: what data the system sees in production, what data it was tuned and evaluated on, and how data is stored and protected.*

- Production inputs: [data types, sensitive fields]
- Tuning and evaluation data: [datasets, sizes, how labeled]
- Training on customer data: [yes/no, details]
- Retention and location: [where, how long]

### 6. Performance
*Good looks like: headline metrics with targets, measured on a held-out set, with the date and version. Link to the eval plan.*

| Metric | Target | Result | Dataset, date |
|---|---|---|---|

### 7. Performance by slice
*Good looks like: results for important groups, and a plain statement of where it is weaker.*

| Slice | Result | Note |
|---|---|---|

### 8. Limitations and known failure modes
*Good looks like: honest, specific weaknesses and what happens when they occur.*

- [Limitation]: [effect and mitigation]

### 9. Guardrails and human oversight
*Good looks like: the controls between the model output and any real-world effect, and who can override.*

- [Control]: [what it does]

### 10. Risks and harms
*Good looks like: who could be harmed and how, with likelihood, impact, and the control for each.*

| Risk | Who is affected | Control |
|---|---|---|

### 11. Monitoring and incidents
*Good looks like: what is watched in production, alert thresholds, and a list of past incidents with links.*

- [Monitor]: [threshold]
- Incidents: [date, summary, link]

### 12. Change and review process
*Good looks like: who can change the model or prompt, the release gates, and when the card is next reviewed.*

- [Process]

---

## Worked example: Northwind Logistics

### 1. Overview
- System name and version: Northwind invoice extraction, prompt v7 with validator rule set 3 (includes lane-currency check, ADR-005)
- Card date and author: July 10, 2026, Priya Shah (FDE, Atlas AI); reviewed by Ana Silva and Omar Haddad
- Owner after handoff: Ana Silva (evals and prompts), Marcus Lee (operations), Northwind IT
- Description: The assistant reads carrier invoices that arrive by email, fills in 18 invoice fields, checks them against Northwind's shipment data, and creates a draft in the Ledgerline ERP. A clerk reviews anything the system is unsure about, and a person releases every batch before payment.

### 2. Components

| Component | What it is | Version | Where it runs |
|---|---|---|---|
| OCR step | Turns scanned pages into text with positions (text PDFs skip it) | Cloud provider OCR service, July 2026 | Northwind cloud account, US East |
| Extraction model | General-purpose large language model, called through a managed endpoint | Model version pinned in config, set May 12 | Same account and region; no data used for training |
| Extraction prompt | Instructions and 6 examples for the 18 fields, returns JSON with value, confidence, and source text | v7 (June 9) | Project repository |
| Validator | Rule checks: shipment exists, totals add up, dates valid, currency matches lane billing currency | Rule set 3 (July 2) | Pipeline worker |
| Router | Sends fields below confidence thresholds to clerk review (ADR-003) | Thresholds v2 | Pipeline worker |

### 3. Intended use
- Intended users: Northwind AP clerks (14) and the AP Manager.
- Intended task: pre-fill carrier freight invoices (PDF and scanned) in English, in USD or other currencies, for carriers in the automation list.
- Decisions supported: whether a draft is ready for batch release. The final decision to pay is always made by a named person (senior clerk Beth Reyes or Luis Ortega) at daily batch release.

### 4. Out-of-scope uses
- Releasing or scheduling payments automatically. Revisiting this needs a new decision record (ADR-004 revisit, October review) and audit approval.
- Credit notes, EDI invoices, and PDFs containing more than one invoice (these are routed to review, not extracted).
- Non-freight invoices (office supplies, utilities, services). Not tested.
- Judging carrier performance or disputes. The system reads documents; it does not decide who is right.
- Any use outside Northwind's own cloud account or region.

### 5. Data
- Production inputs: carrier invoices from the AP mailbox, about 32,000 per month (60% PDF by email, 25% scanned; EDI excluded). Contains carrier bank details; account numbers are masked in the review screen except the last 4 digits.
- Tuning and evaluation data: dev set of 800 invoices for prompt tuning; golden set of 1,200 invoices from 60 carriers, never used for tuning; edge set of 150 hard invoices labeled by Luis Ortega. Labels come from Ledgerline values, with disagreements corrected by 2 clerks. See the eval plan.
- Training on customer data: none. The model is not trained or fine-tuned on Northwind data, and the managed endpoint does not keep inputs.
- Retention and location: raw PDFs and extractions are deleted after 30 days; model outputs are logged for 30 days, and full prompts with invoice text are not logged. Ledgerline stays the system of record. Everything stays in Northwind's US East account.

### 6. Performance

| Metric | Target | Result | Dataset, date |
|---|---|---|---|
| Critical field accuracy (12 fields) | at least 97% | 97.4% | Golden set, June 9 |
| Invoice-level exact match | at least 85% | 86.2% | Golden set, June 9 |
| Calibration (accuracy when confidence above 0.9) | at least 99.5% | 99.6% | Golden set, June 9 |
| Hallucination rate (value not in document) | under 0.1% | 0.04% | Golden set, June 9 |
| Invoices needing no human edits | at least 60% | 64% | Production, top 40 carriers, 2 weeks to July 10 |
| Handling time per invoice | under 3 min | 2.4 min (baseline 7 min) | Review-screen logs, 2 weeks to July 10 |
| Cost per invoice | under $0.08 | about $0.05 | Cloud billing, June |

### 7. Performance by slice

| Slice | Result | Note |
|---|---|---|
| Text PDFs | 97.9% critical field accuracy | Strongest slice |
| Scanned paper (25% of volume) | 95.9% | Below target. Lower confidence threshold, so more fields go to review |
| Top 40 carriers | 97.6% | In automation |
| Long-tail carriers | 96.3% | All start on "review all" until 30 invoices pass with under 5% edits |
| Non-USD invoices | 97.1% after ADR-005 | Currency was the cause of the June 30 incident; see below |

### 8. Limitations and known failure modes
- Carrier layout changes: when a carrier changes its invoice design, accuracy for that carrier can drop without warning. Mitigation: per-carrier validation failure alert above 15%, and weekly audit sample.
- Currency symbols: the model can read the wrong currency when the symbol is missing or only in a footer. Mitigation: validator checks currency against the lane's billing currency (ADR-005).
- Handwritten notes: handwritten changes to amounts are often missed. Mitigation: routed to review when the OCR step detects handwriting.
- Multi-invoice PDFs: not split; the whole file goes to review with reason "multiple invoices" (splitting is phase 2).
- Confidence scores are reliable above 0.9 but less so in the middle range (0.5 to 0.9), so those fields always go to review.

### 9. Guardrails and human oversight
- Draft-only posting (ADR-004): the system cannot release a payment. Every batch is released by a named person, and the release is logged with their name.
- Confidence routing (ADR-003): fields under their threshold are highlighted for the clerk, with the source text shown.
- Validator rules: any failed check sends the invoice to review with a reason.
- Prompt injection: text in a PDF that looks like an instruction is treated as document text; tested in the edge set with zero failures.
- Clerks can override any field; every edit is recorded and feeds the weekly quality review.

### 10. Risks and harms

| Risk | Who is affected | Control |
|---|---|---|
| Wrong amount paid to a carrier | Northwind finance, carrier | Draft-only; batch release by a person; totals and currency checks |
| Clerks over-trust pre-filled values | AP clerks, Northwind | Yellow highlights for low confidence; weekly audit of 100 random invoices |
| Clerk roles reduced without a plan | AP clerks | AP Manager owns the change plan; freed time moves to disputes and exceptions |
| Bank details exposed | Carriers | Masking in review screen; PDF viewer limited to AP role |
| Quality drifts silently over months | Northwind | Weekly audit sample, per-carrier alert, quarterly re-run of golden set |

### 11. Monitoring and incidents
- Per-carrier validation failure rate: alert above 15% over the last 50 invoices (normal 3% to 8%).
- Draft creation failures: alert above 5% over 15 minutes.
- Straight-through rate: normal range 55% to 70% per day; investigate outside it.
- Weekly audit: 100 random live invoices checked by a clerk; critical field accuracy below 97% triggers a review.
- Incidents: June 30, 2026, 37 Blue Harbor Freight invoices drafted in USD instead of EUR (about $18,000 exposure). Caught at batch release by Beth Reyes; nothing was paid. Fixed by the lane-currency check (ADR-005) on July 2. See the post-mortem.

### 12. Change and review process
- Any prompt, model, threshold, or validator change must pass the eval plan release gates: no drop in critical field accuracy on the golden set, no slice down more than 1 point, zero guardrail failures.
- Two sign-offs for every change: Ana Silva (engineering) and Luis Ortega (business).
- A model version change from the cloud provider is treated as a new release and re-run on the golden set before switching.
- This card is updated with every release and reviewed every quarter. Next review: October 2026, together with the ADR-004 revisit.

---

## Common mistakes

- Writing only the good numbers. A card without limitations and weak slices is marketing, and risk teams will not trust it.
- Describing the base model but not your system. Your prompt, validator, and human review change the behavior more than the model name does.
- Vague out-of-scope uses like "do not misuse". Name the specific uses you have not tested.
- Writing the card once at launch and never updating it, so it describes a system that no longer exists.
- Leaving out past incidents. They are the best evidence that your controls work.
