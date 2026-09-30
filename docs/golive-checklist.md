# Go-Live Readiness and Cutover Plan

**When to use it:** Start the checklist about three weeks before a planned go-live and keep it up to date until the go/no-go meeting. Use the cutover plan part to script the actual release, hour by hour. Go-live is the moment real users and real data start depending on the system. The checklist makes sure that moment is a planned event rather than a surprise.

**Who reads it:** The sponsor (who makes the final go decision), the customer's release manager and change board (CAB), IT operations, the business owner, support, and your own team. On cutover day, the cutover plan is the page everyone keeps open.

**How long it should be:** The checklist is 1 page. The cutover plan is 1 to 2 pages. The go/no-go log is a half page written at the meeting.

---

## The template

### 1. Go/no-go criteria
*Good looks like: every line has an owner, a proof link and a status. "Should have" lines may go live with an accepted risk; "must have" lines may not.*

Must have:

| Criterion | Owner | Proof | Status |
|---|---|---|---|
| UAT signed off by the business owner | | | |
| Rollback method tested in staging | | | |
| Migration dry run reconciled (counts match) | | | |
| Change approved by the CAB for this window | | | |
| Runbook written and handed to support | | | |
| On-call named for every day of week one | | | |

Should have:

| Criterion | Owner | Proof | Status | If missed, accepted risk |
|---|---|---|---|---|
| End users trained on top tasks | | | | |
| Go-live notice sent to users | | | | |
| Dashboards and alerts tested | | | | |
| Open minor defects have workarounds | | | | |

### 2. Environments and freezes
*Good looks like: which environment is which, who owns it, and the dates when code and data are frozen.*

- Environments: [dev, test, staging, production and owners]
- Code freeze: [date and time]
- Data freeze or last delta load: [date and time]

### 3. Cutover schedule
*Good looks like: a table by clock time, with a named person per step, a duration, and a check that proves the step worked.*

| Time | Step | Owner | Check | Duration |
|---|---|---|---|---|

### 4. Rollback plan
*Good looks like: a decision point, a person who decides, exact steps, and how long the rollback takes.*

- Rollback trigger (what makes us go back): [conditions]
- Decider: [name]
- Point of no return: [time]
- Steps: [numbered]
- Time to complete: [minutes]

### 5. Communications
*Good looks like: who is told what, when, by whom.*

| When | Audience | Message | Sender |
|---|---|---|---|

### 6. Go/no-go log
*Good looks like: the decision, the risks accepted and by whom, written at the meeting.*

- Date and attendees: [list]
- Decision: [Go / Go with risk / No-go]
- Accepted risks, owners and mitigations: [list]

### 7. Hypercare entry
*Good looks like: what "live and stable" means, so the team knows when hypercare starts and ends.*

- Hypercare period: [days]
- Exit criteria: [numbers, e.g. no severity 1 or 2 for 5 working days]

---

## Worked example: Brannock Logistics

Go-live: the invoice assistant for the top 40 carriers, Saturday June 20, 2026 (week 9 of the project). Meeting on Thursday June 18.

### Go/no-go criteria at the Thursday meeting

| Criterion | Owner | Proof | Status |
|---|---|---|---|
| UAT signed off | Luis Ortega | UAT sheet, 42 of 42 cases pass, 1 minor defect open | Done |
| Rollback tested | Priya Shah | Staging test June 12, 14 minutes | Done |
| Migration reconciled | Grace Kim | Carrier list: 40 of 40 loaded, 0 differences | Done |
| CAB approval | Grace Kim | Change ticket CHG-5521, window Sat 06:00 to 10:00 | Done |
| Runbook handed over | Priya Shah | Runbook v1 signed by Brannock IT | Done |
| On-call named | Grace Kim | Rota for June 20 to 27 | Done |
| Users trained | Luis Ortega | 12 of 14 clerks trained | Accepted risk |
| Dashboards tested | Priya Shah | Alert test on June 16 | Done |

### Decision
Go with risk. Two clerks are on leave and untrained. Mitigation: Luis pairs them with a trained clerk on their first day back. Accepted by Dana Morales.

### Cutover schedule (Saturday June 20)

| Time | Step | Owner | Check | Duration |
|---|---|---|---|---|
| 06:00 | Pause the mailbox connector | Grace | Queue shows 0 incoming | 5 min |
| 06:10 | Take backup of Ledgerline draft table | Grace | Backup file size logged | 15 min |
| 06:30 | Deploy release 1.4 to production | Priya | Health page green | 20 min |
| 07:00 | Load carrier rules for 40 carriers | Priya | Row count 40 | 10 min |
| 07:15 | Send 10 test invoices | Priya, Luis | 10 of 10 drafts correct | 30 min |
| 08:00 | Go / rollback decision | Dana | Test result | 5 min |
| 08:15 | Reopen mailbox, start live flow | Grace | First live invoice processed | 10 min |
| 09:00 | Announce live in #ap-ops | Luis | Message posted | 5 min |

### Rollback plan
- Trigger: fewer than 9 of 10 test invoices correct, or the ERP writer errors above 5%.
- Decider: Dana Morales, with Priya's recommendation.
- Point of no return: 08:15, when the mailbox reopens.
- Steps: pause the mailbox, redeploy release 1.3, restore the backup, tell the clerks to key manually.
- Time: 14 minutes (from the staging test).

### Hypercare entry
Two weeks of hypercare start at 09:00. Exit: no severity 1 or 2 incident for 5 working days and straight-through rate above 55%.

---

## Common mistakes

- Treating the checklist as a formality. If every item is always green, nobody is checking real proof.
- An untested rollback. If you have not rehearsed it, it is a hope.
- No named decider. On the day, five people say "your call".
- Going live on a Friday evening or before a holiday or month-end.
- Forgetting to tell users. A perfect release that surprises people still creates tickets.
