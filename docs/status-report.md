# Weekly Project Status Report

**When to use it:** Write a status report every week for the people doing and coordinating the work. It is more detailed than the executive update: it covers each workstream, milestones, open issues, and action items with owners. It is the single place where the team and the customer's project team can see what is done, what is late, and who owes what.

**Who reads it:** The customer's project owner and team leads (for example the AP manager and IT lead), your engagement manager, and your delivery team. It is usually reviewed in a weekly status meeting.

**How long it should be:** 1 to 2 pages. Use tables so people can scan it. Anything longer belongs in tickets or the RAID log.

---

## The template

### 1. Header
*Good looks like: the reader knows which week and which project in one glance.*

- Project: [name]
- Week: [N], [date range]
- Prepared by: [name]
- Overall status: [Green / Amber / Red]

### 2. Summary
*Good looks like: 3 to 5 sentences on what happened, what changed, and what needs attention.*

[Summary]

### 3. Milestones
*Good looks like: every SOW milestone with planned date, forecast date, and status. Forecast changes are explained.*

| Milestone | Planned | Forecast | Status |
|---|---|---|---|

### 4. Workstream status
*Good looks like: one row per workstream, with done this week and planned next week.*

| Workstream | Status | Done this week | Next week |
|---|---|---|---|

### 5. Key metrics
*Good looks like: the same small set of numbers every week.*

| Metric | Target | Actual |
|---|---|---|

### 6. Issues and blockers
*Good looks like: each issue has an owner and a date. Link to the RAID log for full detail.*

| # | Issue | Owner | Due |
|---|---|---|---|

### 7. Action items
*Good looks like: last week's actions are closed or explained; new actions have owners.*

| Action | Owner | Due | Status |
|---|---|---|---|

### 8. Changes to scope
*Good looks like: any change request raised or approved this week. "None" is a fine answer.*

[Changes]

---

## Worked example: Northwind Logistics

### 1. Header
- Project: Northwind Invoice Extraction Assistant
- Week: 6, June 8 to 12, 2026
- Prepared by: Priya Shah (FDE, Atlas AI)
- Overall status: Green

### 2. Summary
The evaluation report (D2) was accepted on June 10 with 97.4% critical field accuracy. Shadow-mode pilot started June 8 on 3 carriers: 52% of pilot invoices needed no edits. The main technical risk is the Ledgerline API limit of 60 calls per minute during month-end peaks. The batch approval screen for drafts (from ADR-004) is in progress.

### 3. Milestones

| Milestone | Planned | Forecast | Status |
|---|---|---|---|
| D1 Design doc | Week 2 | Done May 14 | Complete |
| D2 Evaluation report | Week 5 | Done June 10 | Complete (3 days late, fixed date parsing) |
| D3 Pilot in shadow mode | Week 6 | Started June 8 | On track |
| D4 Production, top 40 carriers | Week 10 | Week 9 | On track |
| D5 Runbook and handoff | Week 10 | Week 10 | On track |

### 4. Workstream status

| Workstream | Status | Done this week | Next week |
|---|---|---|---|
| Extraction and evals | Green | Fixed European date formats; accuracy 96.1% to 97.4% | Tune charge-line fields |
| Integration (Ledgerline) | Amber | Draft creation working in sandbox | Load test at 2,500 invoices per day |
| Review screen | Green | Source text highlight shipped | Batch approval screen |
| Change and training | Green | 3 pilot clerks trained | Train 2 more clerks |
| Security | Green | Review signed off May 20 | None |

### 5. Key metrics

| Metric | Target | Actual |
|---|---|---|
| Critical field accuracy (golden set) | 97% | 97.4% |
| Straight-through rate (pilot) | 60% by week 10 | 52% |
| Handling time (pilot clerks) | under 3 min | 3.4 min |
| Median processing time | under 5 min | 1.8 min |

### 6. Issues and blockers

| # | Issue | Owner | Due |
|---|---|---|---|
| I-04 | API limit 60 calls per minute may cause month-end delays | Grace Kim | June 17 |
| I-05 | Multi-invoice PDFs from 2 carriers go to review | Priya Shah | June 19 |

### 7. Action items

| Action | Owner | Due | Status |
|---|---|---|---|
| Request higher API limit from Ledgerline admin | Grace Kim | June 17 | Open |
| Nominate 2 more pilot clerks | Luis Ortega | June 15 | Open |
| Add per-carrier validation failure chart | Priya Shah | June 12 | Done |
| Schedule go/no-go review | Tom Becker | June 12 | Done (June 19) |

### 8. Changes to scope
None this week.

---

## Common mistakes

- Reporting activity ("had 4 meetings") instead of progress against milestones.
- Action items without an owner or a date, which means nobody does them.
- Quietly moving forecast dates without explaining why.
- Marking everything Green because nothing has failed yet, even though risks are growing.
- Duplicating the full RAID log instead of linking to it.
