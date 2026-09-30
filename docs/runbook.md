# Production Runbook / On-Call Playbook

**When to use it:** Write a runbook before a system goes live, and keep it updated after every incident. A runbook tells the person on call, often at 2am and often not the person who built the system, exactly how to check health, recognize common problems, and fix them step by step. For an FDE, the runbook is one of the most important handoff documents: it is how the customer's team runs the system after you leave.

**Who reads it:** On-call engineers (yours at first, then the customer's), support staff, and the customer's IT team. It must work for someone who has never seen the code.

**How long it should be:** 3 to 10 pages. Each alert playbook should fit on one screen. Write commands and links exactly, so they can be copied.

---

## The template

### 1. Service overview
*Good looks like: what the system does in 2 sentences, who uses it, and business hours that matter.*

- Service: [name]
- What it does: [2 sentences]
- Users and business impact if down: [who is affected, how badly]
- Important hours: [when it must be up]

### 2. Contacts and escalation
*Good looks like: real names and how to reach them, with a clear order.*

| Level | Who | How to reach | When |
|---|---|---|---|

### 3. Architecture at a glance
*Good looks like: a small diagram and a list of dependencies, with links to dashboards.*

[Diagram and dependency list]

### 4. Health checks
*Good looks like: a 5-minute daily check anyone can run.*

- [Dashboard link]: [what normal looks like]

### 5. Alerts and playbooks
*Good looks like: one section per alert: what it means, how to confirm, how to fix, how to verify, when to escalate.*

#### Alert: [name]
- Meaning: [what triggered]
- Impact: [who is affected]
- Confirm: [steps]
- Fix: [numbered steps]
- Verify: [how you know it is fixed]
- Escalate if: [condition]

### 6. Common tasks
*Good looks like: routine operations with exact steps.*

- [Task]: [steps]

### 7. Rollback and kill switch
*Good looks like: how to safely turn off automation and fall back to manual work.*

[Steps]

### 8. Change history
*Good looks like: a short log of changes to this runbook.*

| Date | Change | By |
|---|---|---|

---

## Worked example: Northwind Logistics

### 1. Service overview
- Service: Northwind Invoice Extraction Pipeline
- What it does: Reads carrier invoices from the ap-invoices@ mailbox, extracts fields with OCR and an LLM, and creates draft invoices in Ledgerline. Uncertain invoices go to the clerk review queue.
- Users and business impact if down: 14 AP clerks fall back to manual keying (7 minutes per invoice). A day of downtime at month end adds about 1 day of backlog.
- Important hours: 7am to 7pm Eastern, Monday to Friday; last 3 business days of each month are critical.

### 2. Contacts and escalation

| Level | Who | How to reach | When |
|---|---|---|---|
| 1 | Northwind IT on-call (Marcus Lee or Ana Silva) | IT on-call pager | Any alert |
| 2 | Grace Kim, IT Lead | Phone in on-call directory | Not fixed in 30 minutes, or data risk |
| 3 | Atlas AI support | Support portal, severity 1 | Model or product defect |
| Business | Luis Ortega, AP Manager | Team chat #ap-ops | Clerks need to switch to manual |

### 3. Architecture at a glance
Mailbox, ingest worker, object storage, OCR, LLM extraction, validator, review queue, ERP writer, Ledgerline. Dashboards: "Invoice Pipeline Overview" and "Per-Carrier Quality" in Northwind's monitoring tool.

### 4. Health checks
Daily at 8am:
- Overview dashboard: queue depth under 200; median processing time under 3 minutes; no red panels.
- Per-Carrier Quality: no carrier with validation failure rate above 15% (normal is 3% to 8%).
- Straight-through rate yesterday: 55% to 70% is normal.

### 5. Alerts and playbooks

#### Alert: ERP writer failures
- Meaning: more than 5% of draft creations failed in the last 15 minutes.
- Impact: drafts are delayed; they wait in the retry queue, nothing is lost.
- Confirm: Overview dashboard, "ERP errors" panel; check the error code in the ERP writer log.
- Fix:
  1. If error is 429 (rate limit): no action; the queue drains with backoff. If it lasts over 1 hour, lower worker count to 2.
  2. If error is 401 (auth): the service account password or token expired. Rotate it in the secrets manager following task "Rotate ERP credentials" below.
  3. If error is 5xx: check the Ledgerline status page and contact the Ledgerline admin.
- Verify: error rate back under 1% and retry queue shrinking.
- Escalate if: not fixed in 30 minutes during month-end.

#### Alert: Carrier validation spike
- Meaning: one carrier's validation failure rate is above 15% over the last 50 invoices.
- Impact: usually a carrier layout change; wrong values may reach drafts.
- Confirm: Per-Carrier Quality dashboard; open 3 recent invoices from that carrier and compare to the old layout.
- Fix:
  1. Turn on the carrier's "review all" flag, which sends every invoice from that carrier to clerks.
  2. Post in #ap-ops so clerks know to check that carrier closely.
  3. Open an Atlas support ticket with 5 sample PDFs.
- Verify: new invoices from that carrier appear in the review queue.
- Escalate if: amounts or currency look wrong in drafts that were already created. Treat as severity 1 and follow the post-mortem process.

#### Alert: Mailbox silent
- Meaning: no new invoices ingested for 20 minutes during business hours.
- Confirm: send a test email with a sample PDF to ap-invoices@.
- Fix: check the mailbox connector credentials; restart the ingest worker.
- Verify: the test invoice appears in the queue within 5 minutes.

### 6. Common tasks
- Rotate ERP credentials: create a new token in Ledgerline admin, update secret "ledgerline-api" in the secrets manager, restart the ERP writer, confirm one draft is created.
- Add a new carrier to automation: confirm at least 30 invoices from that carrier passed review with under 5% edits, then turn off its "review all" flag.
- Reprocess one invoice: in the admin screen, search the invoice ID and click "Reprocess".

### 7. Rollback and kill switch
- Per carrier: "review all" flag (see above).
- Whole system: set the global flag "auto_draft_enabled" to false. All invoices go to the review queue with pre-filled fields; clerks keep working.
- Full manual fallback: stop the ingest worker. Clerks work from the mailbox directly, as before the project.

### 8. Change history

| Date | Change | By |
|---|---|---|
| June 19 | First version for go-live | Priya Shah |
| July 2 | Added lane-currency check to carrier spike playbook after incident | Priya Shah |
| July 9 | Contacts moved to Northwind on-call | Marcus Lee |

---

## Common mistakes

- Writing for yourself instead of for someone who has never seen the system.
- Alerts with no playbook, so the on-call person has to guess.
- No kill switch, so the only choice during an AI quality problem is "leave it on" or "turn everything off".
- Out-of-date contacts and links. Test the runbook in a drill before handoff.
- Not updating the runbook after an incident, so the same problem is solved from scratch next time.
