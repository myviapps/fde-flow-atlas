# Product Requirements Doc (PRD) for a Customer Use Case

**When to use it:** Write a PRD after discovery and before design, when you need everyone to agree on what problem the solution solves, for whom, and how you will know it works. On an FDE engagement the PRD describes one customer use case, not a whole product. It turns interview notes into clear requirements that engineers can design against and the customer can sign off.

**Who reads it:** The customer product owner and sponsor, your engineers, your product team (so they can see patterns across customers), and anyone reviewing the design doc later.

**How long it should be:** 3 to 6 pages. If it gets longer, you are probably writing design details that belong in the design doc.

---

## The template

### 1. Summary
*Good looks like: 3 sentences. Problem, who has it, what we will do.*

[Summary]

### 2. Problem and evidence
*Good looks like: the problem stated in the user's words, backed by numbers from discovery.*

- Problem: [description]
- Evidence: [numbers, quotes, sources]

### 3. Users and personas
*Good looks like: each user type, what they do today, and what they need.*

| Persona | Today | Needs |
|---|---|---|
| [name/role] | [current behavior] | [need] |

### 4. Goals and non-goals
*Good looks like: goals are measurable; non-goals stop scope creep.*

Goals:
- [Goal with metric, baseline, target]

Non-goals:
- [Thing we will not do]

### 5. User stories
*Good looks like: "As a [user], I want [action] so that [benefit]", each with a priority.*

| ID | Story | Priority |
|---|---|---|
| US1 | As a [user], I want [x] so that [y]. | Must |

### 6. Functional requirements
*Good looks like: testable statements. Each one could become a test case.*

- FR1: The system shall [behavior].

### 7. Non-functional requirements
*Good looks like: numbers for speed, availability, security, and cost.*

- Latency: [target]
- Availability: [target]
- Security and privacy: [rules]
- Cost: [budget per unit]

### 8. AI behavior and quality bar
*Good looks like: what the model must do well, what it must never do, and how humans stay in control.*

- Quality bar: [metric and target]
- Must never: [unsafe or unacceptable outputs]
- Human in the loop: [when a human reviews]

### 9. Success metrics
*Good looks like: how you will measure after launch, with a data source for each metric.*

| Metric | Baseline | Target | Source |
|---|---|---|---|

### 10. Open questions
*Good looks like: each question has an owner and a date.*

- [Question] (owner, date)

---

## Worked example: Northwind Logistics

### 1. Summary
Northwind's AP clerks key about 32,000 carrier invoices per month by hand, which is slow and causes late-payment penalties. We will build an invoice-extraction assistant that reads each invoice, fills the 18 fields, checks them against shipment data, and creates a draft in Ledgerline. Clerks only review invoices the system is unsure about.

### 2. Problem and evidence
- Problem: "My team spends the whole day typing numbers from PDFs into the ERP." (Luis Ortega, AP Manager)
- Evidence:
  - About 7 minutes per invoice, 14 clerks (time study, April 2026).
  - Month-end backlog up to 6 working days.
  - About $210,000 per year in late-payment penalties (finance ledger).
  - Keying error rate about 2.8% (dispute log sample).

### 3. Users and personas

| Persona | Today | Needs |
|---|---|---|
| AP clerk | Keys every field by hand | Pre-filled fields, clear flags on uncertain values, fast keyboard review |
| AP manager (Luis) | Tracks backlog in a spreadsheet | Live view of queue size, straight-through rate, and aging |
| IT engineer | Not involved today | A system that is easy to monitor and support |
| CFO (Dana) | Sees penalties after the fact | Monthly proof of savings |

### 4. Goals and non-goals
Goals:
- Cut average handling time from 7 minutes to under 3 minutes per invoice.
- At least 60% of invoices from the top 40 carriers need no human edits (stretch: 70%).
- Field-level accuracy on the 12 critical fields at least 97%.
- Month-end backlog under 2 working days.

Non-goals:
- Approving or paying invoices.
- EDI invoices.
- Replacing clerks. Freed time moves to exceptions and carrier disputes.

### 5. User stories

| ID | Story | Priority |
|---|---|---|
| US1 | As an AP clerk, I want fields pre-filled from the PDF so that I only check them. | Must |
| US2 | As an AP clerk, I want uncertain fields highlighted with the source text shown so that I can fix them fast. | Must |
| US3 | As an AP manager, I want a dashboard of queue size and straight-through rate so that I can plan staffing. | Should |
| US4 | As an AP clerk, I want to see why an invoice failed validation so that I know what to check. | Must |
| US5 | As an IT engineer, I want alerts when the pipeline fails so that I can fix it before clerks notice. | Must |

### 6. Functional requirements
- FR1: The system shall pull new emails with PDF attachments from ap-invoices@ every 2 minutes.
- FR2: The system shall extract 18 fields, each with a confidence score.
- FR3: The system shall match each invoice to a shipment and carrier in Ledgerline and flag mismatches.
- FR4: The system shall send an invoice to the review queue if any critical field is below its confidence threshold or fails a validation rule.
- FR5: The system shall create a draft invoice in Ledgerline for invoices that pass all checks.
- FR6: The system shall record every clerk edit for use in evaluation.

### 7. Non-functional requirements
- Latency: invoice available (draft or in queue) within 5 minutes of arriving.
- Availability: 99.5% during business hours (7am to 7pm Eastern).
- Security and privacy: all data stays in Northwind's US East cloud account; data retained for 30 days in the processing store; no customer data used to train models.
- Cost: under $0.08 in model and compute cost per invoice.

### 8. AI behavior and quality bar
- Quality bar: at least 97% field-level accuracy on the 12 critical fields (invoice number, carrier, shipment number, invoice date, due date, currency, subtotal, tax, total, and 3 charge-line fields).
- Must never: invent a value that is not on the document; change the currency or amount without flagging it; post a final (non-draft) entry.
- Human in the loop: every invoice below threshold goes to a clerk; all entries in Ledgerline are drafts that a clerk or batch approver releases.

### 9. Success metrics

| Metric | Baseline | Target | Source |
|---|---|---|---|
| Handling time per invoice | 7 min | under 3 min | Review screen logs |
| Straight-through rate | 0% | at least 60% | Pipeline logs |
| Critical field accuracy | 97.2% (manual) | at least 97% | Weekly audit sample |
| Month-end backlog | 6 days | under 2 days | Ledgerline aging report |

### 10. Open questions
- Does the Ledgerline API support draft invoices with charge lines? (Grace Kim, May 8)
- Which carriers send multi-invoice PDFs? (Luis Ortega, May 12)

---

## Common mistakes

- Writing the solution ("use model X with prompt Y") instead of the requirement.
- Goals with no baseline, so nobody can prove improvement later.
- Forgetting the "must never" list for the AI. Unsafe behavior needs to be a requirement, not a hope.
- Ignoring secondary users like IT support, who will own the system after you leave.
- Leaving open questions without owners, so they stay open forever.
