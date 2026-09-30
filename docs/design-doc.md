# Technical Design Doc / RFC

**When to use it:** Write a design doc after the PRD is agreed and before you write most of the code. It explains how the system will work, what options you considered, and why you chose this one. Writing it forces you to find problems on paper, where they are cheap to fix. "RFC" (request for comments) means the same thing: you share it to get feedback, not to announce a finished decision.

**Who reads it:** Your engineering team, the customer's IT and security teams, and reviewers from your own company (architects, product). Future engineers read it to understand why the system looks the way it does.

**How long it should be:** 4 to 10 pages plus diagrams. Put long details (full schemas, API specs) in an appendix.

---

## The template

### 1. Header
*Good looks like: anyone can see the status and who to ask.*

- Title: [system name]
- Author(s): [names]
- Reviewers: [names and teams]
- Status: [Draft / In review / Approved / Superseded]
- Last updated: [date]
- Links: [PRD, SOW, tickets]

### 2. Context and problem
*Good looks like: 1 short paragraph with a link to the PRD. Do not repeat the whole PRD.*

[What we are building and why.]

### 3. Goals and non-goals
*Good looks like: technical goals that come from the PRD requirements.*

- Goals: [list]
- Non-goals: [list]

### 4. Proposed design
*Good looks like: a diagram plus a walk-through of one request from start to end.*

- Architecture diagram: [link or ASCII diagram]
- Components: [each component and its job]
- Data flow: [step by step]
- Data model: [key tables or objects]
- APIs and integrations: [external systems, auth, limits]

### 5. Alternatives considered
*Good looks like: at least 2 real options, with honest pros and cons and why you did not pick them.*

| Option | Pros | Cons | Why not |
|---|---|---|---|

### 6. Security and privacy
*Good looks like: where data lives, who can access it, how it is encrypted, how long it is kept.*

[Details.]

### 7. Reliability and operations
*Good looks like: what happens when each dependency fails, and how you will know.*

- Failure modes: [dependency, what happens, how we recover]
- Monitoring and alerts: [metrics]
- Scaling: [expected load and limits]

### 8. Testing and evaluation
*Good looks like: unit, integration, and model evaluation, with the pass bar for each.*

[Plan, linking to the eval plan.]

### 9. Rollout plan
*Good looks like: gradual steps with a rollback at each step.*

[Phases, feature flags, rollback.]

### 10. Cost estimate
*Good looks like: cost per unit and per month at expected volume.*

[Estimate.]

### 11. Open questions and risks
*Good looks like: what you do not know yet and how you will find out.*

- [Question or risk]

---

## Worked example: Northwind Logistics

### 1. Header
- Title: Northwind Invoice Extraction Pipeline
- Author(s): Priya Shah (Atlas AI)
- Reviewers: Grace Kim (Northwind IT), Omar Haddad (Northwind Security), Atlas solutions architect
- Status: Approved (May 14, 2026)
- Last updated: May 14, 2026
- Links: Northwind PRD v1.2, SOW dated April 30, 2026

### 2. Context and problem
Northwind AP clerks key about 32,000 carrier invoices per month by hand. The PRD asks for a system that extracts 18 fields, validates them against shipment data, and creates drafts in Ledgerline, sending uncertain invoices to a human review queue.

### 3. Goals and non-goals
- Goals: invoice processed within 5 minutes; at least 97% critical field accuracy; all data in Northwind's US East account; easy for Northwind IT to run.
- Non-goals: EDI; final posting or payment; supporting non-freight invoices.

### 4. Proposed design

```
ap-invoices@ mailbox
      |
      v
[Ingest worker] --> object storage (raw PDFs, 30-day retention)
      |
      v
[OCR step] --> text + layout
      |
      v
[LLM extraction] --> 18 fields + confidence + source spans
      |
      v
[Validator] <-- Ledgerline shipment and carrier master data
      |
   pass? ----no----> [Review queue + review screen] --clerk--> 
      | yes                                                  |
      v                                                      v
[ERP writer] -----------------> Ledgerline draft invoice <---
```

- Components:
  - Ingest worker: polls the mailbox every 2 minutes, stores PDFs, removes duplicates by file hash.
  - OCR step: turns scanned pages into text with positions. Text PDFs skip OCR.
  - LLM extraction: a prompt with the field schema returns JSON with a value, confidence, and the source text for each field.
  - Validator: rules such as "total equals subtotal plus tax plus charges", "shipment number exists", "currency matches carrier master".
  - Review queue and screen: shows the PDF next to fields, highlights low-confidence and failed fields.
  - ERP writer: creates drafts through the Ledgerline API, retries with backoff.
- Data flow: one invoice goes mailbox, storage, OCR, extraction, validation, then either draft or review queue. Each step writes a status row keyed by invoice ID.
- Data model: `invoice` (id, source email, file hash, status), `extraction` (field, value, confidence, source span), `review_edit` (field, old value, new value, clerk, time).
- APIs and integrations: Ledgerline REST API, service account with draft-only permission, limit 60 calls per minute.

### 5. Alternatives considered

| Option | Pros | Cons | Why not |
|---|---|---|---|
| Template OCR per carrier | Cheap per page, predictable | Needs setup per carrier, broke in 2023 | Failed before; 400+ carriers |
| LLM only, no OCR | Simpler pipeline | Weak on low-quality scans (25% of volume) | Accuracy on scans was 8 points lower in spike |
| File drop to ERP instead of API | No API work | Nightly batch, slow errors | Breaks 5-minute target |

### 6. Security and privacy
- All components run in Northwind's cloud account, US East region.
- Model is called through the cloud provider's managed endpoint in the same region; no data used for training.
- Encryption at rest and in transit; bank account fields masked in the review screen except for the last 4 digits.
- Access through Northwind single sign-on; clerks see the review screen only.
- Raw PDFs and extractions deleted after 30 days; Ledgerline keeps the system of record.

### 7. Reliability and operations
- Failure modes:
  - Ledgerline API down: drafts queue up and retry; alert after 15 minutes.
  - Model endpoint errors: retry 3 times, then send the invoice to the review queue as "manual".
  - Mailbox access fails: alert after 10 minutes with no new mail during business hours.
- Monitoring: queue depth, processing time, straight-through rate, validation failure rate by carrier, API error rate.
- Scaling: peak about 2,500 invoices per day at month end; workers scale to 4 instances.

### 8. Testing and evaluation
Unit tests for validators, integration tests against a Ledgerline sandbox, and a 1,200-invoice golden set (see eval plan). Pass bar: 97% critical field accuracy before pilot.

### 9. Rollout plan
- Week 6: shadow mode on 3 carriers (system runs, clerks still key by hand, we compare).
- Week 8: live on 10 carriers.
- Week 9: live on top 40 carriers.
- Rollback: a per-carrier feature flag sends all invoices from that carrier to the review queue.

### 10. Cost estimate
About $0.05 per invoice (OCR $0.015, model $0.03, compute and storage $0.005). At 32,000 invoices per month: about $1,600 per month.

### 11. Open questions and risks
- Carriers may change templates without notice. Mitigation: validation failure rate by carrier on the dashboard.
- Multi-invoice PDFs need splitting; first version sends them to review.

---

## Common mistakes

- Only describing the happy path. Reviewers care most about what happens when things fail.
- Skipping "alternatives considered", so reviewers cannot tell if you thought about other options.
- No rollout or rollback plan for a system that touches a customer's financial records.
- Writing the doc after the code is done. Then it is documentation, not design.
- Leaving security to "later" when the customer's security team must approve it first.
