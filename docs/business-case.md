# ROI Business Case One-Pager

**When to use it:** Write a business case when a customer sponsor needs to justify spending money on your solution, usually before the SOW is signed or when renewing or expanding. The sponsor often has to present it to a finance committee. Your job as an FDE is to give them honest, checkable numbers built from their own data, so the case survives questions from finance.

**Who reads it:** The customer sponsor, their finance team (who will check every number), and their leadership. Your account executive uses it too.

**How long it should be:** One page, plus an appendix with the calculations. If the main point does not fit on one page, the case is not clear enough yet.

---

## The template

### 1. The ask
*Good looks like: what you want approved, how much it costs, and the return, in 2 sentences.*

[We request approval for X at a cost of $Y, returning $Z over N years.]

### 2. Problem today
*Good looks like: the cost of doing nothing, in money, with sources.*

- [Cost item]: [amount per year] (source: [where the number comes from])

### 3. Proposed solution
*Good looks like: 2 to 3 sentences in business language.*

[Solution]

### 4. Benefits
*Good looks like: split hard savings (money that actually leaves the budget or is avoided) from soft benefits (time, quality). Finance only trusts hard savings.*

Hard savings:
| Benefit | Calculation | Annual value |
|---|---|---|

Soft benefits:
- [Benefit]

### 5. Costs
*Good looks like: all costs, including the customer's own internal time.*

| Cost | Year 1 | Year 2 | Year 3 |
|---|---|---|---|

### 6. Return
*Good looks like: net benefit, ROI, and payback period. Show the formula.*

- 3-year net benefit: [benefits minus costs]
- ROI: [net benefit divided by cost]
- Payback: [month when cumulative benefits exceed cumulative costs]

### 7. Assumptions and sensitivity
*Good looks like: the key assumptions and what happens if they are 25% worse.*

- [Assumption]
- If [assumption] is 25% worse: [new result]

### 8. Risks and how we reduce them
*Good looks like: the 2 or 3 things that could stop the benefits, and the control for each.*

- [Risk]: [mitigation]

---

## Worked example: Northwind Logistics

### 1. The ask
We request approval for the Atlas AI invoice-extraction assistant at a 3-year cost of $1,020,000, returning $1,916,000 in hard savings, a net benefit of $896,000 (88% ROI) with payback in about month 14.

### 2. Problem today
- Late-payment penalties: $210,000 per year (source: finance ledger, 2025).
- Month-end overtime: $120,000 per year (source: payroll report, 2025).
- Missed 2% early-payment discounts: about $180,000 per year (source: 30 carriers offering terms, 2025 spend).
- Planned hiring: 4 more AP clerks in 2026 to handle 12% volume growth, $72,000 each fully loaded (source: 2026 headcount plan).
- Error-driven disputes with carriers: 2.8% keying error rate (source: dispute log sample).

### 3. Proposed solution
An assistant reads carrier invoices, fills in the fields, checks them against shipment data, and creates drafts in Ledgerline. Clerks only review the invoices the system is unsure about, cutting handling time from 7 minutes to under 3.

### 4. Benefits
Hard savings:

| Benefit | Calculation | Annual value |
|---|---|---|
| Avoided new hires | 4 clerks x $72,000 | $288,000 |
| Overtime removed | 100% of month-end overtime | $120,000 |
| Penalties reduced | 70% of $210,000 | $150,000 |
| Early-payment discounts captured | Estimate from 30 carriers | $180,000 |
| **Total at full run rate** | | **$738,000** |

Soft benefits:
- About 28,000 clerk hours per year freed (384,000 invoices x 4.5 minutes saved) for disputes and exceptions.
- Fewer keying errors, so fewer carrier disputes.
- Month-end close faster, backlog under 2 days.

### 5. Costs

| Cost | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Software subscription | $240,000 | $240,000 | $240,000 |
| Deployment services (SOW) | $180,000 | 0 | 0 |
| Northwind internal time (IT, AP, security) | $60,000 | $30,000 | $30,000 |
| **Total** | **$480,000** | **$270,000** | **$270,000** |

Cloud running costs (about $20,000 per year) are included in the internal time line.

### 6. Return
- Year 1 benefits: $440,000 (about 7 months at run rate after go-live and ramp).
- 3-year benefits: $440,000 + $738,000 + $738,000 = $1,916,000.
- 3-year costs: $1,020,000.
- 3-year net benefit: $896,000.
- ROI: $896,000 / $1,020,000 = 88%.
- Payback: about month 14.

### 7. Assumptions and sensitivity
- Straight-through rate reaches 60% by month 3 of production.
- Invoice volume grows 12% as planned.
- Early-payment discounts depend on paying within 10 days, which needs backlog under 2 days.
- If all benefits are 25% lower: 3-year benefits $1,437,000, net $417,000, ROI 41%, payback about month 20. Still positive.
- If early-payment discounts are zero: 3-year benefits about $1,449,000, net $429,000, ROI 42%.

### 8. Risks and how we reduce them
- Accuracy lower than expected on Northwind data: SOW payment tied to 97% accuracy on a golden set of Northwind invoices.
- A wrong amount gets paid: all invoices are drafts, released by a human (ADR-004).
- Clerks do not adopt the tool: AP manager owns the change plan; clerks trained in the pilot.

---

## Common mistakes

- Counting "hours saved" as cash savings. Unless headcount, overtime, or hiring actually changes, finance will call it soft.
- Using vendor averages instead of the customer's own numbers.
- Forgetting the customer's internal costs, which makes the case look too good and hurts trust.
- No sensitivity check. Finance always asks "what if you are wrong?"
- Assuming full benefits from day one instead of showing a ramp.
