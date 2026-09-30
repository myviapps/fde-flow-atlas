# Blameless Incident Post-Mortem

**When to use it:** Write a post-mortem after any significant incident: an outage, wrong data reaching a customer system, a security event, or a near miss that could have been bad. "Blameless" means you focus on how the system and process allowed the problem, not on who made a mistake. People who fear blame hide information, and hidden information causes the next incident. Write it within 5 business days, while memories are fresh.

**Who reads it:** Both engineering teams, the customer's project owner and sponsor, and often your own leadership. A short summary goes into the executive update.

**How long it should be:** 2 to 5 pages. The timeline and action items are the most important parts.

---

## The template

### 1. Summary
*Good looks like: 3 to 4 sentences: what happened, impact, how long, and the main fix.*

[Summary]

### 2. Impact
*Good looks like: numbers. Who and what was affected, for how long, and what it cost or could have cost.*

- Users affected: [who]
- Duration: [start to end]
- Data or money affected: [amounts]
- Severity: [1 / 2 / 3]

### 3. Timeline
*Good looks like: times in one time zone, from first cause to full recovery, including when people noticed and what they did.*

| Time | Event |
|---|---|

### 4. Root cause and contributing factors
*Good looks like: use "5 whys" to go past the first answer. Usually there is more than one factor.*

- Trigger: [what started it]
- Root cause: [why the system allowed it]
- Contributing factors: [list]

### 5. Detection
*Good looks like: how it was found, and how it should have been found.*

[How detected; how long until detected; what would have caught it sooner]

### 6. What went well
*Good looks like: honest credit to the controls and people that limited the damage.*

- [Item]

### 7. What went poorly
*Good looks like: about systems and processes, not people.*

- [Item]

### 8. Action items
*Good looks like: specific, owned, dated, and each one clearly tied to a cause. Mark the type: prevent, detect, or mitigate.*

| Action | Type | Owner | Due | Status |
|---|---|---|---|---|

### 9. Lessons learned
*Good looks like: 2 or 3 lessons other projects can use.*

- [Lesson]

---

## Worked example: Northwind Logistics

### 1. Summary
On June 30, 2026, one day after go-live on the top 40 carriers, 37 invoices from Blue Harbor Freight were created in Ledgerline as drafts with currency USD when the invoices were actually in EUR. The carrier had switched to a new invoice layout that morning. An AP clerk noticed the amounts looked wrong at the daily batch release, so no invoice was paid. We added a lane-currency check and a layout-change alert.

### 2. Impact
- Users affected: AP team; 1 carrier (Blue Harbor Freight).
- Duration: 09:10 to 14:25 Eastern (about 5 hours 15 minutes).
- Data or money affected: 37 draft invoices, total about EUR 212,000, recorded as USD. None were released or paid. If released, the overpayment or underpayment would have been about $18,000 because of the exchange rate difference.
- Severity: 2 (wrong financial data in the ERP, caught before payment).

### 3. Timeline
All times Eastern, June 30, 2026.

| Time | Event |
|---|---|
| 09:10 | First Blue Harbor invoice in the new layout arrives and is drafted as USD. |
| 09:10 to 14:00 | 36 more Blue Harbor invoices are drafted, all high confidence, all passing validation. |
| 14:05 | During daily batch release, senior clerk Beth Reyes sees Blue Harbor totals are unusually round in USD and pauses the release. |
| 14:15 | Luis Ortega posts in #ap-ops; Marcus Lee (Northwind IT) pages Priya Shah. |
| 14:25 | Priya turns on the "review all" flag for Blue Harbor. No new drafts. |
| 15:40 | Root cause found: new layout shows "EUR" only in the footer; model read "USD" from a remittance instruction line. |
| 16:30 | Clerks correct the 37 drafts to EUR and release them after checking. |

### 4. Root cause and contributing factors
- Trigger: Blue Harbor Freight changed its invoice layout for European lanes without notice.
- Root cause: the validator checked currency only against the carrier master, which listed USD for Blue Harbor. Nothing checked the currency against the shipment's lane (Rotterdam to Chicago, billed in EUR). So a wrong value passed every check.
- Contributing factors:
  - The model gave high confidence because "USD" appeared clearly on the page.
  - RAID assumption A-04 ("carrier master currency is correct for every carrier") was still open and not validated.
  - The carrier validation spike alert did not fire because validations were passing.

### 5. Detection
Detected by a human at the daily batch release (the control from ADR-004), about 5 hours after the first bad draft. A layout-change signal (for example a sudden change in page structure for one carrier) would have caught it within the first few invoices.

### 6. What went well
- The draft-only design (ADR-004) worked: nothing was paid.
- The clerk trusted her judgment and paused the release.
- The per-carrier "review all" flag stopped the problem in 10 minutes with no code change.

### 7. What went poorly
- We relied on one source (carrier master) to check currency.
- An open assumption in the RAID log was not tested before go-live.
- High model confidence was treated as proof of correctness.

### 8. Action items

| Action | Type | Owner | Due | Status |
|---|---|---|---|---|
| Add check: invoice currency must match the shipment lane's billing currency (ADR-005) | Prevent | Priya Shah | July 2 | Done |
| Validate carrier master currency against 6 months of invoices (closes A-04) | Prevent | Luis Ortega | July 3 | Done (4 carriers fixed) |
| Add layout-change alert per carrier | Detect | Priya Shah | July 7 | Done |
| Add currency slice and 20 multi-currency invoices to the eval edge set | Detect | Priya Shah | July 7 | Done |
| Update runbook carrier spike playbook | Mitigate | Priya Shah | July 2 | Done |

### 9. Lessons learned
- Check important fields against a second, independent source. One rule is not a safety net.
- Close assumptions before go-live. An open assumption is a risk wearing a disguise.
- Keep a human gate for money until the data proves you can remove it.

---

## Common mistakes

- Naming a person as the root cause ("the clerk should have noticed"). Ask why the system made the mistake possible.
- Stopping at the first "why", such as "the model was wrong", without asking why that reached the ERP.
- Action items without owners or dates, which means the incident will happen again.
- Leaving out what went well, which discourages the people and controls that saved the day.
- Waiting weeks to write it, when details are forgotten.
