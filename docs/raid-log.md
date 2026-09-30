# RAID Log (Risks, Assumptions, Issues, Dependencies)

**When to use it:** Start a RAID log in week 1 of an engagement and keep it updated every week until handoff. It is one list that tracks four kinds of things that can hurt a project: Risks (might happen), Assumptions (we believe are true but have not proven), Issues (already happening), and Dependencies (things we need from someone else). Reviewing it weekly turns hidden worries into owned actions.

**Who reads it:** The delivery team, the customer's project owner and IT lead, and your engagement manager. The top items go into the status report and executive update.

**How long it should be:** As long as needed, but keep it alive. Usually 10 to 30 open rows. Close items instead of deleting them, so there is a history.

---

## The template

### How to score
*Good looks like: everyone scores the same way. Keep it simple.*

- Likelihood: 1 (low) to 3 (high)
- Impact: 1 (low) to 3 (high)
- Score = Likelihood x Impact. Review anything scoring 6 or 9 every week.

### Risks
*Good looks like: written as "If [cause], then [effect]", with a mitigation you are actually doing, not just planning.*

| ID | Risk (If... then...) | L | I | Score | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|---|
| R-01 | If [cause], then [effect]. | | | | [action] | [name] | [Open / Closed] |

### Assumptions
*Good looks like: each assumption has a way and a date to check it. An untested assumption is a hidden risk.*

| ID | Assumption | How we will validate | Owner | Due | Status |
|---|---|---|---|---|---|
| A-01 | [We assume...] | [test] | [name] | [date] | [Open / Confirmed / False] |

### Issues
*Good looks like: things that are already hurting the project, with severity and a fix date.*

| ID | Issue | Severity | Action | Owner | Due | Status |
|---|---|---|---|---|---|---|
| I-01 | [issue] | [High / Med / Low] | [action] | [name] | [date] | [Open / Closed] |

### Dependencies
*Good looks like: who we depend on, for what, by when, and what happens if it is late.*

| ID | We need | From | By | Impact if late | Status |
|---|---|---|---|---|---|
| D-01 | [item] | [team or person] | [date] | [impact] | [Open / Met] |

---

## Worked example: Northwind Logistics

Snapshot as of week 6 (June 12, 2026).

### Risks

| ID | Risk (If... then...) | L | I | Score | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|---|
| R-01 | If the Ledgerline API limit stays at 60 calls per minute, then month-end drafts will be delayed by up to 40 minutes. | 3 | 2 | 6 | Queue with backoff; request higher limit; load test week 7 | Grace Kim | Open |
| R-02 | If clerks fear losing their jobs, then they will not use the review screen properly and adoption will stall. | 2 | 3 | 6 | Luis team session June 17; publish new roles in disputes and exceptions | Luis Ortega | Open |
| R-03 | If a carrier changes its invoice layout, then accuracy for that carrier may drop without anyone noticing. | 2 | 3 | 6 | Per-carrier validation failure chart; weekly audit sample | Priya Shah | Open |
| R-04 | If the security review finds a blocker late, then go-live slips. | 1 | 3 | 3 | Security review completed early | Omar Haddad | Closed May 20 |

### Assumptions

| ID | Assumption | How we will validate | Owner | Due | Status |
|---|---|---|---|---|---|
| A-01 | The Ledgerline API can create draft invoices with charge lines. | Sandbox test | Grace Kim | May 8 | Confirmed |
| A-02 | Top 40 carriers are about 80% of non-EDI volume. | Mailbox stats for 3 months | Luis Ortega | May 12 | Confirmed (78%) |
| A-03 | Clerk-keyed ERP values are accurate enough to use as labels. | Double-check 200 invoices | Priya Shah | May 22 | Confirmed (97.2% accurate; fixed labels used in golden set) |
| A-04 | Carrier master currency is correct for every carrier. | Compare with last 6 months of invoices | Luis Ortega | June 26 | Open |

### Issues

| ID | Issue | Severity | Action | Owner | Due | Status |
|---|---|---|---|---|---|---|
| I-03 | European date formats (day first) parsed wrongly | High | Added format rules and tests | Priya Shah | June 9 | Closed |
| I-04 | API limit risk (see R-01) confirmed in sandbox load test | Medium | Ask Ledgerline admin for higher limit | Grace Kim | June 17 | Open |
| I-05 | Multi-invoice PDFs from 2 carriers | Medium | Route to review for now; add splitter in phase 2 | Priya Shah | June 19 | Open |

### Dependencies

| ID | We need | From | By | Impact if late | Status |
|---|---|---|---|---|---|
| D-01 | Cloud account and model access in US East | Northwind IT | May 6 | Build cannot start | Met May 5 |
| D-02 | 2,000 labeled historical invoices | Luis Ortega | May 8 | No golden set, eval slips | Met May 11 |
| D-03 | 2 more pilot clerks | Luis Ortega | June 15 | Less tuning data before go-live | Open |
| D-04 | Two Northwind engineers for handoff | Grace Kim | June 29 | Handoff slips past week 10 | Open |

---

## Common mistakes

- Writing risks as vague worries ("integration") instead of "If... then..." statements.
- Mitigations that are only ideas, with no owner or date.
- Never testing assumptions. Note A-04 above: an open assumption like this is exactly where incidents come from.
- Letting the log go stale. A RAID log that is not reviewed weekly is worse than none, because it gives false comfort.
- Deleting closed items, which loses the project history and the lessons.
