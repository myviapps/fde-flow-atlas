# Architecture Decision Record (ADR) / Decision Log

**When to use it:** Write an ADR every time the team makes a technical decision that would be expensive to reverse or that someone will later ask "why did we do it this way?" Examples: where to host, which model to use, how to integrate with a customer system, how humans review AI output. Each decision gets its own short record, numbered in order. When a decision changes, you write a new ADR that supersedes the old one instead of editing history.

**Who reads it:** Your team, the customer's engineers who will own the system, and anyone joining later. It is especially valuable at handoff, when the people who made the decisions leave.

**How long it should be:** 1 page per decision. If it needs more, link to the design doc.

---

## The template

### ADR-[number]: [short decision title]
*Good looks like: the title states the decision, not the topic. "Post invoices as drafts" is better than "ERP posting".*

### Status
*Good looks like: one of Proposed, Accepted, Rejected, Superseded by ADR-[n].*

[Status], [date]

### Deciders
*Good looks like: names of the people who made the call, including the customer when it affects them.*

[Names and roles]

### Context
*Good looks like: the facts and forces at the time, in a few sentences. Someone reading it in a year should understand the pressure you were under.*

[Situation, constraints, requirements that apply]

### Options considered
*Good looks like: 2 to 4 real options, each with a short pro and con.*

1. [Option]: [pros] / [cons]
2. [Option]: [pros] / [cons]

### Decision
*Good looks like: one clear sentence starting with "We will".*

We will [decision].

### Consequences
*Good looks like: honest good and bad results, including new work this creates.*

- Positive: [list]
- Negative: [list]
- Follow-up actions: [list with owners]

### Revisit when
*Good looks like: the signal that would make you reconsider.*

[Condition]

---

## Worked example: Northwind Logistics

Decision log index:

| ADR | Decision | Status |
|---|---|---|
| ADR-001 | Host everything in Northwind's cloud account, US East | Accepted, May 7 |
| ADR-002 | Use OCR plus LLM extraction, not template OCR | Accepted, May 12 |
| ADR-003 | Route by per-field confidence thresholds | Accepted, May 13 |
| ADR-004 | Post invoices to Ledgerline as drafts only | Accepted, May 14 |
| ADR-005 | Add lane-currency check to validator | Accepted, July 2 |

Full record for ADR-004:

### ADR-004: Post invoices to Ledgerline as drafts only

### Status
Accepted, May 14, 2026

### Deciders
Priya Shah (FDE, Atlas AI), Grace Kim (IT Lead, Northwind), Luis Ortega (AP Manager, Northwind), Dana Morales (CFO, Northwind, informed and agreed)

### Context
The Ledgerline API can create invoices as either "draft" or "posted". Posted invoices enter the payment run automatically. The CFO's biggest worry, from the failed 2023 OCR project, is a wrong amount being paid to a carrier. At the same time, the business case depends on clerks not touching most invoices. Our extraction accuracy on the golden set was not yet measured when this decision was needed.

### Options considered
1. Post directly for high-confidence invoices: fastest, most savings / a model error can reach payment with no human check.
2. Create drafts for all invoices, released in a daily batch approval by a senior clerk: keeps a human gate, small extra effort / adds up to 1 day delay and some review time.
3. Create drafts, and let the system auto-release after 24 hours if nobody objects: less effort than option 2 / silent release feels risky to finance and auditors.

### Decision
We will create every invoice in Ledgerline as a draft. A senior clerk releases straight-through drafts in one daily batch, using a summary screen that shows totals by carrier.

### Consequences
- Positive: no invoice reaches payment without a human action; auditors accepted this control; the CFO supported go-live.
- Negative: about 20 minutes per day of batch review; payments can be 1 day later than with direct posting.
- Follow-up actions: build the batch summary screen (Priya, week 7); add "released by" to audit logs (Grace, week 7).

### Revisit when
Straight-through invoices have had fewer than 0.2% corrections at batch release for 3 months in a row. Then consider option 3 for the top 10 carriers.

---

## Common mistakes

- Writing ADRs only at the end of the project, when nobody remembers the real reasons.
- Editing an old ADR when the decision changes. Write a new one and mark the old one "Superseded".
- Recording the decision but not the context, so later readers think the choice was silly.
- Leaving out the customer when the decision affects their risk or their process.
- Recording tiny choices (variable names, library versions) that do not need an ADR.
