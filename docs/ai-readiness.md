# AI Readiness Assessment and Use-Case Scorecard

**When to use it:** Use this at the very start of an engagement, before anyone commits to building something, or when a customer says "we want AI" without knowing where to begin. It has two parts. Part A checks whether the customer is ready for AI work at all (data, people, process, platform and risk). Part B lists candidate use cases, scores each one on the same scale, and picks a first pilot that the sponsor can sign.

**Who reads it:** The executive sponsor (who signs the pilot choice), the customer's business owners for each use case, their IT and security leads, and your own engagement manager. Part A is also a useful warning list for you: every red item is a risk you must plan for.

**How long it should be:** 2 to 4 pages. The scoring table should fit on one page. Fill it in a workshop with the customer, not alone at your desk, because the scores are only trusted when the customer's people set them.

---

## The template

### Part A: Readiness assessment

Score each dimension Green (ready), Amber (workable, with a plan) or Red (blocks the pilot until fixed).

### 1. Data
*Good looks like: you have seen real samples, not heard a description. You know where the data lives, who owns it, how clean it is, and whether you are allowed to use it.*

- Where the data lives: [systems, formats]
- Owner and access route: [name, how long access takes]
- Quality from a sample of [N] records: [what was wrong, how often]
- Permission to use it with an AI model: [yes / no / unknown, and who decides]
- Rating: [Green / Amber / Red] because [one sentence]

### 2. People
*Good looks like: a named sponsor with budget, a named business owner per use case, and the people who will actually use the tool have been asked.*

- Sponsor: [name, role]
- Business owner per use case: [names]
- Technical contact: [name]
- Users consulted so far: [how many, how]
- Rating: [rating] because [reason]

### 3. Process
*Good looks like: the current workflow is written down step by step, with volume and time per item, so you can measure improvement.*

- Current workflow: [steps, volume per week, minutes per item]
- Where a human must stay in the loop: [steps]
- Rating: [rating] because [reason]

### 4. Platform
*Good looks like: you know where the tool will run, how you get access to test systems, and how the customer deploys software.*

- Cloud or on-premise: [answer]
- Test environment available: [yes / no, when]
- Integration points and their APIs: [systems]
- Rating: [rating] because [reason]

### 5. Risk and governance
*Good looks like: you know the rules that apply (privacy, security review, regulator) and how long approvals take.*

- Security review needed: [yes / no, lead time]
- Personal or regulated data involved: [types]
- Who can say stop: [name]
- Rating: [rating] because [reason]

### Part B: Use-case scorecard

*Good looks like: 5 to 8 candidates from a discovery workshop, each scored 1 to 5 by the group on value, feasibility and risk, using the definitions below. Use the same weights for every row.*

- Value: 5 = large, measurable saving or revenue; 1 = nice to have.
- Feasibility: 5 = data is ready and the task is well defined; 1 = data missing or task vague.
- Risk: 5 = a wrong answer could harm a customer, break a rule or cost a lot; 1 = a wrong answer is cheap and easy to catch.
- Score = 0.5 x value + 0.3 x feasibility + 0.2 x (6 - risk). (Example weights: agree yours with the sponsor.)

| # | Use case | Owner | Value | Feasibility | Risk | Score | Quadrant |
|---|---|---|---|---|---|---|---|

### Recommended first pilot
*Good looks like: a quick win (high value, high feasibility) with risk 3 or lower, one owner, one metric, and a date.*

- Pilot: [use case]
- Why this one, and why not the highest scorer if different: [reasoning]
- Success metric and target: [metric]
- Buy, build or configure: [choice and reason]
- Decision needed from the sponsor by [date]: [approval]

### Roadmap (next 12 months)
*Good looks like: three horizons, pilot then next two use cases then bigger bets, each gated on results.*

| Horizon | Use case | Gate to start |
|---|---|---|

---

## Worked example: Brannock Logistics

Priya Shah of Atlas AI ran a two-hour workshop on April 22, 2026 with Dana Morales (CFO, sponsor), Luis Ortega (AP Manager), Grace Kim (IT Lead) and Omar Haddad (security).

### Part A summary

| Dimension | Rating | Because |
|---|---|---|
| Data | Amber | 300 sample invoices seen; 12% are low-quality scans. Ledgerline data is clean. Permission to send invoices to a hosted model is not yet approved. |
| People | Green | Dana sponsors and holds budget; Luis owns the AP workflow and joined the workshop; 4 clerks were interviewed. |
| Process | Green | AP steps written down: 14 clerks, about 9,000 invoices a month, 7 minutes to key each one. |
| Platform | Amber | Ledgerline has a documented API; a test environment exists but takes 2 weeks to refresh. |
| Risk | Amber | Invoices contain bank details, so a security review is required (lead time 3 weeks). Payments are always approved by a human. |

### Part B scorecard

| # | Use case | Owner | Value | Feas. | Risk | Score | Quadrant |
|---|---|---|---|---|---|---|---|
| 1 | Carrier invoice extraction | Luis | 4 | 4 | 2 | 4.00 | Quick win |
| 2 | Dispute email drafting | Luis | 3 | 4 | 3 | 3.30 | Quick win |
| 3 | Auto-approve payments | Dana | 5 | 2 | 5 | 3.30 | Big bet |
| 4 | Shipment delay predictions | Grace | 4 | 2 | 3 | 3.20 | Big bet |
| 5 | Customer chatbot | Dana | 3 | 3 | 4 | 2.80 | Filler |

### Recommended first pilot
- Pilot: carrier invoice extraction for the top 40 carriers, with clerks reviewing uncertain invoices.
- Why: highest score, quick win, risk 2 because a human approves every payment. "Auto-approve payments" has the same value but a risk of 5 and poor data, so it stays a later gate.
- Metric and target: cut key time from 7 minutes to 3 minutes per invoice, with 98% accuracy on amount, currency and carrier.
- Buy, build or configure: configure Atlas AI's document assistant; build only the Ledgerline connector.
- Decision needed from Dana by April 27: approve the 10-week pilot and the security review.

### Roadmap

| Horizon | Use case | Gate to start |
|---|---|---|
| Months 1 to 3 | Invoice extraction | Sponsor signs pilot |
| Months 4 to 6 | Dispute email drafting | Extraction reaches target accuracy for 4 weeks |
| Months 7 to 12 | Payment approval support | Audit trail approved by Omar and finance controller |

---

## Common mistakes

- Scoring alone. Scores the customer did not set are ignored the first time they disagree.
- Picking the highest value idea and ignoring risk and data. Big bets with red data readiness stall for months.
- Skipping the readiness check because the sponsor is enthusiastic. Enthusiasm does not create data access.
- Changing the weights after seeing the ranking. Agree them before you score.
- Leaving out the owner. A use case with no business owner never gets adopted.
