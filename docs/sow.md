# Statement of Work (SOW)

**When to use it:** Write a statement of work once discovery is done and the customer wants to move forward, before any delivery starts. The SOW is the agreement on what you will build, by when, for how much, and how both sides will know it is done. It protects both sides: the customer knows what they are paying for, and you know where the scope ends.

**Who reads it:** The customer sponsor and their procurement or legal team, your account lead, your delivery manager, and sometimes your own legal team. The FDE usually writes the scope, deliverables, and acceptance criteria sections.

**How long it should be:** 3 to 8 pages. Short enough to read in one sitting, specific enough that a stranger could tell whether each deliverable was met.

---

## The template

### 1. Parties and purpose
*Good looks like: one short paragraph a busy executive can read and understand the whole deal.*

This SOW is between [vendor] and [customer] under [master agreement name and date]. Its purpose is to [outcome in one sentence].

### 2. Background
*Good looks like: the business problem in 3 to 5 sentences, with the numbers from discovery.*

[Current situation, pain, and why now.]

### 3. Scope
*Good looks like: an "in scope" list and an "out of scope" list. The out-of-scope list prevents most future arguments.*

In scope:
- [Item]

Out of scope:
- [Item]

### 4. Deliverables
*Good looks like: each deliverable is a concrete thing (software, document, training session) with an owner and a due date.*

| # | Deliverable | Description | Due |
|---|---|---|---|
| D1 | [name] | [what it is] | [week or date] |

### 5. Timeline and phases
*Good looks like: phases with clear exit gates, not only dates.*

| Phase | Weeks | Exit gate |
|---|---|---|
| [phase] | [weeks] | [what must be true to move on] |

### 6. Acceptance criteria
*Good looks like: measurable tests the customer can run. Avoid words like "robust" or "user-friendly".*

- [Deliverable]: accepted when [measurable condition], measured by [method], on [data set].
- Acceptance process: customer has [N] business days to accept or give written reasons for rejection.

### 7. Roles and responsibilities
*Good looks like: customer duties are written down too. Most delays come from missing customer access or people.*

Vendor:
- [role, name, time commitment]

Customer:
- [role, name, time commitment, what they must provide]

### 8. Assumptions and dependencies
*Good looks like: every assumption that would change cost or time if it turned out false.*

- [Assumption]

### 9. Change control
*Good looks like: a simple, named process for adding or removing scope.*

[How changes are requested, estimated, approved, and signed.]

### 10. Fees and payment
*Good looks like: fee type (fixed, time and materials), amounts, and milestones tied to acceptance.*

| Milestone | Amount | Trigger |
|---|---|---|
| [milestone] | [$] | [event] |

### 11. Signatures
[Names, titles, dates for both parties.]

---

## Worked example: Northwind Logistics

### 1. Parties and purpose
This SOW is between Atlas AI, Inc. and Northwind Logistics under the Master Services Agreement dated April 30, 2026. Its purpose is to deploy an invoice-extraction assistant that reads carrier invoices and creates draft entries in Northwind's Ledgerline ERP, so that AP clerks review invoices instead of typing them.

### 2. Background
Northwind receives about 32,000 non-EDI carrier invoices per month. Fourteen AP clerks key 18 fields per invoice by hand, at about 7 minutes each. This causes a month-end backlog of up to 6 working days, about $210,000 per year in late-payment penalties, and a 2.8% keying error rate. A 2023 template-based OCR tool failed because each carrier layout needed manual setup.

### 3. Scope
In scope:
- Ingestion of PDF invoices (text and scanned) from the ap-invoices@ mailbox.
- Extraction of 18 invoice fields using OCR plus a large language model.
- Validation against shipment and carrier master data.
- A review screen for AP clerks for low-confidence invoices.
- Creation of draft invoices in Ledgerline through its API.
- Deployment in Northwind's cloud account (US East region).
- Training for AP clerks and handoff to Northwind IT.

Out of scope:
- EDI invoices (already automated).
- Paper mail scanning (Northwind continues to scan paper into the mailbox).
- Payment approval or release. Final posting stays with Northwind staff.
- Non-freight invoices (utilities, office supplies).

### 4. Deliverables

| # | Deliverable | Description | Due |
|---|---|---|---|
| D1 | Design doc | Architecture, data flow, security controls | Week 2 |
| D2 | Evaluation report | Accuracy on a 1,200-invoice golden set | Week 5 |
| D3 | Pilot system | Running in shadow mode on 3 carriers | Week 6 |
| D4 | Production system | Live on top 40 carriers (about 80% of volume) | Week 10 |
| D5 | Runbook and handoff | Runbook, training, and 2 enablement sessions | Week 10 |

### 5. Timeline and phases
Kickoff is Monday, May 4, 2026.

| Phase | Weeks | Exit gate |
|---|---|---|
| Discover and design | 1 to 2 | D1 signed off by Grace Kim and Omar Haddad |
| Build and evaluate | 3 to 5 | Field accuracy at least 97% on golden set (D2) |
| Pilot (shadow mode) | 6 to 7 | Clerks confirm review screen is usable |
| Production rollout | 8 to 9 | Live on top 40 carriers, no open severity-1 issues |
| Handoff | 10 | Northwind IT runs the system for 1 week alone |

### 6. Acceptance criteria
- D2: accepted when field-level accuracy on the 12 critical fields is at least 97% on the golden set, measured by the evaluation script shared with Northwind.
- D4: accepted when at least 60% of invoices from the top 40 carriers pass with no human edits over 2 consecutive weeks, and average handling time is under 3 minutes, measured from Ledgerline and review-screen logs.
- D5: accepted when two Northwind engineers complete the runbook drill without Atlas help.
- Northwind has 5 business days to accept each deliverable or give written reasons.

### 7. Roles and responsibilities
Atlas AI:
- Priya Shah, Forward Deployed Engineer, full time.
- Tom Becker, Engagement Manager, 30%.
- Solutions architect, 20% in weeks 1 to 3.

Northwind:
- Dana Morales, CFO, executive sponsor, 1 hour per week.
- Luis Ortega, AP Manager, product owner, 4 hours per week.
- Grace Kim, IT Lead, provides cloud account and ERP API access by week 1.
- Omar Haddad, Security, completes security review by week 2.
- Two AP clerks for labeling and pilot, 6 hours per week each in weeks 3 to 7.

### 8. Assumptions and dependencies
- Ledgerline API supports creating draft invoices. If not, a file-drop fallback adds about 2 weeks.
- Northwind provides 2,000 historical invoices with ERP values by May 8.
- The top 40 carriers make up about 80% of volume.
- Cloud account and model access in US East are approved by week 1.

### 9. Change control
Either party submits a change request in writing. Atlas estimates time and cost within 3 business days. No change starts until both sponsors sign the change request.

### 10. Fees and payment
Fixed fee: $180,000. Software subscription is covered under a separate order form.

| Milestone | Amount | Trigger |
|---|---|---|
| Kickoff | $36,000 | SOW signed |
| Evaluation report | $54,000 | D2 accepted |
| Production live | $54,000 | D4 accepted |
| Handoff complete | $36,000 | D5 accepted |

### 11. Signatures
Dana Morales, CFO, Northwind Logistics, April 30, 2026
[Atlas AI signatory], April 30, 2026

---

## Common mistakes

- No out-of-scope list, so every new idea becomes "but we assumed that was included."
- Acceptance criteria that cannot be measured ("accurate", "fast", "easy to use").
- Forgetting customer responsibilities, then losing weeks waiting for access or data.
- Tying payment to dates instead of accepted deliverables, which rewards being late in the same way as being on time.
- Promising accuracy numbers before you have tested on the customer's real data.
