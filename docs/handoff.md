# Handoff and Enablement Plan

**When to use it:** Write the handoff plan about halfway through an engagement, then run it in the last weeks. An FDE's job is not finished when the system works; it is finished when the customer can run, fix, and improve it without you. This plan lists what the customer's team must learn, how you will teach them, how you will prove they are ready, and what support continues after you leave.

**Who reads it:** The customer's IT lead and the engineers who will own the system, the business owner and key users, your engagement manager, and your company's support or customer success team.

**How long it should be:** 2 to 4 pages, plus the checklists. The runbook and design doc are linked, not copied.

---

## The template

### 1. Handoff summary
*Good looks like: who takes over what, and the date the customer becomes the first line of support.*

- System: [name]
- Handoff date: [date]
- New owners: [team and names]
- After handoff, first-line support is: [who]

### 2. Ownership map
*Good looks like: every part of the system and process has one named owner.*

| Area | Owner after handoff | Backup |
|---|---|---|

### 3. Skills and knowledge needed
*Good looks like: what each audience must be able to do, written as actions, not topics.*

| Audience | Must be able to |
|---|---|

### 4. Enablement sessions
*Good looks like: hands-on sessions with real tasks, not only slides.*

| Session | Audience | Format | Date |
|---|---|---|---|

### 5. Documentation delivered
*Good looks like: a list with links and who reviewed each document.*

- [Document]: [link], reviewed by [name]

### 6. Readiness checks
*Good looks like: proof the team can do the work alone, such as a drill or a shadow week.*

- [Check]: [pass condition]

### 7. Access transfer
*Good looks like: vendor access removed or reduced, credentials rotated, and ownership of accounts moved.*

- [Item]

### 8. Support after handoff
*Good looks like: what help remains, for how long, and how to ask for it.*

[Support model, hours, response times, end date for hypercare]

### 9. Open items at handoff
*Good looks like: honest list of what is not finished, with owners.*

| Item | Owner | Due |
|---|---|---|

---

## Worked example: Northwind Logistics

### 1. Handoff summary
- System: Northwind Invoice Extraction Pipeline
- Handoff date: July 10, 2026 (end of week 10)
- New owners: Northwind IT (Marcus Lee, Ana Silva) for the platform; AP team (Luis Ortega) for the business process
- After handoff, first-line support is: Northwind IT on-call

### 2. Ownership map

| Area | Owner after handoff | Backup |
|---|---|---|
| Pipeline operations and alerts | Marcus Lee | Ana Silva |
| Ledgerline integration and credentials | Ana Silva | Grace Kim |
| Prompt and evaluation changes | Ana Silva | Atlas AI support |
| Carrier onboarding to automation | Luis Ortega | Senior clerk Beth Reyes |
| Daily batch release | Senior clerk Beth Reyes | Luis Ortega |
| Security reviews | Omar Haddad | Grace Kim |

### 3. Skills and knowledge needed

| Audience | Must be able to |
|---|---|
| IT engineers | Run the daily health check; handle every alert in the runbook; rotate credentials; reprocess an invoice; roll back using flags |
| IT engineers | Run the eval (`make eval`), read results, and apply the release gates before any prompt change |
| AP manager | Read the Per-Carrier Quality dashboard; decide when to move a carrier to automation |
| AP clerks | Use the review screen with the keyboard; understand confidence highlights; report suspicious drafts |

### 4. Enablement sessions

| Session | Audience | Format | Date |
|---|---|---|---|
| System walkthrough | IT engineers | Code and architecture tour, 2 hours | June 24 |
| Runbook drill | IT engineers | Simulated alerts in staging, they fix, Priya watches | July 1 |
| Evals and prompt changes | Ana Silva | Pair on a real prompt change through the release gates | July 6 |
| Dashboard and carrier onboarding | Luis Ortega, senior clerks | Live session with real data | July 7 |
| Shadow week | IT engineers | They run on-call, Priya is backup only | July 6 to 10 |

### 5. Documentation delivered
- Design doc: reviewed by Grace Kim
- Runbook: reviewed and tested by Marcus Lee
- Decision log (ADR-001 to ADR-005): reviewed by Ana Silva
- Eval plan and scripts: reviewed by Ana Silva
- Clerk quick guide (2 pages): reviewed by Luis Ortega

### 6. Readiness checks
- Runbook drill: Marcus and Ana resolve 3 simulated alerts with no help. Result: passed July 1 (one runbook step clarified).
- Shadow week: all real alerts handled by Northwind with Atlas only watching. Result: passed; 2 alerts, both handled in under 20 minutes.
- Prompt change: Ana ships a change through the release gates alone. Result: passed July 8.

### 7. Access transfer
- Atlas standing access removed July 10; break-glass access only, approved by Northwind IT.
- Ledgerline service account credentials rotated by Ana Silva July 10.
- Repository ownership moved to Northwind's source control organization.
- Alert routing moved from Atlas to Northwind on-call July 6.

### 8. Support after handoff
- Hypercare: 4 weeks (to August 7). Priya available 2 hours per day for questions; weekly 30-minute check-in with Grace Kim.
- After hypercare: standard Atlas AI support; severity 1 response within 1 hour, 24/7.

### 9. Open items at handoff

| Item | Owner | Due |
|---|---|---|
| Split multi-invoice PDFs automatically (phase 2) | Ana Silva with Atlas | September 30 |
| Improve scanned invoice accuracy (95.9% today) | Atlas AI | August 31 |
| Consider auto-release for top 10 carriers (ADR-004 revisit) | Luis Ortega | October review |

---

## Common mistakes

- Starting handoff in the last week. People need practice, not just a presentation.
- Teaching topics instead of tasks. "Understands the architecture" cannot be tested; "handles the ERP alert alone" can.
- Keeping vendor access after handoff "just in case", which security teams rightly dislike.
- Hiding unfinished work. Open items that are written down are manageable; surprises are not.
- Forgetting business users. The system can run perfectly and still fail if nobody owns the process.
