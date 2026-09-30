# FDE Resume Bullet Worksheet

**When to use it:** Use this worksheet when you update your resume or LinkedIn after a project, or when you prepare to apply for Forward Deployed Engineer roles. Good FDE resume bullets show three things at once: technical depth, customer impact in numbers, and ownership. This worksheet helps you gather the raw facts first, then turn them into short, strong bullets. Fill it in right after each project, while you still remember the numbers.

**Who reads it:** You. The finished bullets are read by recruiters (who scan in seconds for impact and keywords) and hiring managers (who look for scope and judgment).

**How long it should be:** One worksheet per project, about 1 page. The final output is 3 to 5 bullets per project, each one or two lines.

---

## The template

### 1. Project facts
*Good looks like: the raw material. Write everything down; you will cut later.*

- Customer type (no confidential names if not allowed): [industry, size]
- Your role and team size: [role, how many people]
- Duration: [weeks or months]
- Problem: [one sentence]
- What you built: [one sentence]
- Tech used: [languages, cloud, models, tools]

### 2. Numbers
*Good looks like: before and after, with units. Ask the customer for numbers if you do not have them.*

| Metric | Before | After |
|---|---|---|

### 3. Things you personally owned
*Good looks like: decisions and work that were yours, not the team's.*

- [Item]

### 4. Bullet formula
*Good looks like: strong verb + what you did + how (tech) + result (number).*

"[Verb] [what] using [how], [result with number]."

Strong verbs: Built, Designed, Deployed, Led, Cut, Reduced, Increased, Automated, Migrated, Negotiated, Launched, Owned.

### 5. Draft bullets
*Good looks like: 6 to 8 drafts, including different angles: technical, customer, business, leadership.*

1. [Draft]

### 6. Final bullets
*Good looks like: 3 to 5 bullets, each under about 25 words, most with a number.*

- [Final]

### 7. Check
*Good looks like: every bullet passes all checks.*

- [ ] Starts with a strong verb
- [ ] Has a number or clear outcome
- [ ] Shows my role, not just the team's
- [ ] No confidential customer details
- [ ] A non-expert understands it

---

## Worked example: Northwind Logistics

This worksheet is filled in by Priya Shah after the Northwind engagement.

### 1. Project facts
- Customer type: mid-size freight logistics company, about 1,800 employees
- Your role and team size: Forward Deployed Engineer, lead engineer on a team of 3 (plus customer IT and AP staff)
- Duration: 10 weeks, plus 4 weeks of hypercare
- Problem: 14 AP clerks keyed about 32,000 carrier invoices per month by hand, causing backlogs and late-payment penalties
- What you built: an LLM-based invoice-extraction pipeline with validation, a clerk review screen, and ERP integration
- Tech used: Python, OCR, LLM structured extraction, cloud serverless workers, REST API integration, evaluation harness, monitoring dashboards

### 2. Numbers

| Metric | Before | After |
|---|---|---|
| Handling time per invoice | 7 min | 2.4 min |
| Invoices with no human edits | 0% | 64% |
| Month-end backlog | 6 days | 1 day |
| Critical field accuracy | 97.2% (manual) | 97.8% |
| Projected 3-year net benefit | none | $896,000 |
| Time to handoff | none | 10 weeks, customer on-call from week 10 |

### 3. Things you personally owned
- Architecture and design doc, approved by customer IT and security.
- Decision to post only drafts (ADR-004), which later prevented a bad payment.
- Evaluation plan and 1,200-invoice golden set.
- Incident response and post-mortem for the currency incident.
- Handoff: runbook, drills, and training for 2 customer engineers.

### 4. Bullet formula
"Reduced invoice handling time 66% (7 to 2.4 minutes) by deploying an LLM extraction pipeline with confidence-based human review."

### 5. Draft bullets
1. Built an invoice-extraction pipeline for a logistics customer.
2. Deployed an LLM invoice-extraction pipeline that processed 32,000 invoices per month with 64% needing no human edits.
3. Reduced invoice handling time 66% and month-end backlog from 6 days to 1 for a 1,800-person logistics company.
4. Designed an evaluation harness with a 1,200-invoice golden set, raising critical field accuracy from 96.1% to 97.4% before launch.
5. Led incident response when a carrier layout change caused currency errors; draft-only design meant zero wrong payments, fix shipped in 2 days.
6. Wrote the business case with the CFO's team showing $896,000 projected 3-year net benefit.
7. Handed off to the customer's IT team in 10 weeks through runbook drills and a shadow on-call week.

(Draft 1 is too weak: no number, no "how". Kept as a "before" example.)

### 6. Final bullets
- Deployed an LLM invoice-extraction pipeline for a logistics customer, processing 32,000 invoices per month with 64% needing no human edits.
- Cut invoice handling time 66% (7 to 2.4 minutes) and month-end backlog from 6 days to 1, supporting a projected $896K 3-year net benefit.
- Built an evaluation harness and 1,200-invoice golden set; raised critical field accuracy from 96.1% to 97.4% before launch.
- Designed draft-only ERP posting and per-carrier kill switches; when a carrier layout change caused currency errors, zero wrong payments were made.
- Handed off to customer engineers in 10 weeks using runbook drills and a shadow on-call week.

### 7. Check
- [x] Starts with a strong verb
- [x] Has a number or clear outcome
- [x] Shows my role, not just the team's
- [x] No confidential customer details (customer not named)
- [x] A non-expert understands it

---

## Common mistakes

- Listing duties ("responsible for building pipelines") instead of results.
- Leaving out numbers because you did not write them down at the time. Fill this in right after each project.
- Naming customers or sharing confidential figures without permission.
- Only technical bullets. FDE roles also want customer impact, communication, and ownership.
- Buzzword lists with no proof ("AI, LLM, RAG, agents") that do not say what you actually did.
