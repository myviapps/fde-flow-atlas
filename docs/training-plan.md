# End-User Training and Communication Plan

**When to use it:** Write this plan once you know who will use the new system and roughly when they will start, usually 4 to 6 weeks before go-live. It covers two things that decide whether people actually use what you built: communication (what people hear, from whom, and when) and training (what each group must be able to do, and how they practice it). A tool that works but that users fear, do not understand, or quietly work around is a failed project. The FDE rarely owns the message, but the FDE usually writes the first draft of this plan and makes sure the right leader delivers it.

**Who reads it:** The business owner who leads the change (often a manager of the end users), the sponsor, team leads or "super users", HR if roles change, and your own team. End users see the messages and the training, not the plan.

**How long it should be:** 2 to 3 pages, plus the message drafts and a quick-reference guide for users. Keep the calendar on one page.

---

## The template

### 1. Change summary
*Good looks like: in 3 sentences, what changes for users, what does not change, and why. Written so a user would recognize their own day.*

- What changes: [new tool, new steps]
- What does not change: [what stays the same, including jobs if true]
- Why: [the business reason in plain words]

### 2. Audiences
*Good looks like: each group, how the change affects them, and their biggest worry.*

| Audience | Size | How their work changes | Biggest worry | Change leader |
|---|---|---|---|---|

### 3. Key messages
*Good looks like: 3 to 5 short, true messages. Answer the worry directly. Never promise what leadership has not agreed.*

- [Message]

### 4. Communication calendar
*Good looks like: who says what, through which channel, when. The most important messages come from the users' own manager, in person.*

| Date | Audience | Message | Channel | Sender |
|---|---|---|---|---|

### 5. Learning goals
*Good looks like: tasks users must be able to do, which you can check. Not topics.*

| Audience | After training, they can |
|---|---|

### 6. Training sessions
*Good looks like: short, hands-on sessions on real examples, close to the date people start using the tool.*

| Session | Audience | Format and length | Date | Trainer |
|---|---|---|---|---|

### 7. Materials
*Good looks like: a short quick-reference guide, a place to ask questions, and a way to report problems.*

- [Material]: [owner]

### 8. Support during rollout
*Good looks like: extra help in the first weeks, named people, and fast answers.*

[Floor support, chat channel, office hours]

### 9. Measuring adoption
*Good looks like: numbers that show people are using the tool correctly, not just logging in.*

| Measure | Target | Source |
|---|---|---|

### 10. Feedback loop
*Good looks like: how user feedback reaches the team and how users hear what changed because of it.*

[Process]

---

## Worked example: Northwind Logistics

Plan written May 27, 2026 (week 4) by Priya Shah with Luis Ortega, who owns the change. Approved by Dana Morales on May 29.

### 1. Change summary
- What changes: AP clerks stop typing carrier invoices into Ledgerline. The assistant fills in the fields and creates drafts. Clerks review the invoices the system is unsure about in a new review screen, and a senior clerk releases each day's batch.
- What does not change: clerks still own every invoice and every payment decision. Nothing is paid without a person releasing it. No one loses their job because of this project; freed time moves to carrier disputes and exceptions (confirmed by Dana Morales in writing on May 26).
- Why: the month-end backlog reaches 6 days, costing about $210,000 per year in late-payment penalties and weekends of overtime.

### 2. Audiences

| Audience | Size | How their work changes | Biggest worry | Change leader |
|---|---|---|---|---|
| AP clerks | 14 | Review instead of type; new screen and keyboard shortcuts | Job loss; being blamed for the machine's errors | Luis Ortega |
| Senior clerk (batch release) | 1 (Beth Reyes) | Releases daily draft batch, checks totals by carrier | Missing a wrong draft | Luis Ortega |
| AP manager | 1 (Luis) | Watches quality dashboard; decides which carriers go to automation | Losing control of quality | Dana Morales |
| Treasury and audit | about 5 | Payment control now happens at batch release | Weaker control | Luis Ortega |
| Carriers | 412 active | Nothing; same mailbox | None | None (no message needed) |

### 3. Key messages
- "You review, the assistant types. You are still the one who decides."
- "No one loses their job because of this project. Time you save goes to disputes and exceptions, which are the work we never have time for."
- "Nothing is paid without a person releasing it."
- "If a draft looks wrong, you are right to stop it. Tell us, and we will fix the system, not blame you."

### 4. Communication calendar

| Date | Audience | Message | Channel | Sender |
|---|---|---|---|---|
| June 1 | All AP clerks | Why we are doing this; what changes; no job loss | Team meeting, in person | Luis Ortega, with Dana Morales for 5 minutes |
| June 3 | Treasury and audit | Payment control moves to batch release (ADR-004) | 30-minute walkthrough | Luis Ortega |
| June 8 | 3 pilot clerks | You are testing, not being tested; shadow mode | Kickoff in person | Luis Ortega, Priya Shah |
| June 17 | All AP clerks | Pilot results, new roles in disputes, questions answered | Team session, 45 minutes | Luis Ortega |
| June 19 | All AP clerks | Go-live dates by carrier group; where to get help | Email plus #ap-ops post | Luis Ortega |
| July 2 | All AP clerks | What happened on June 30, how Beth caught it, what we changed | Team huddle, 15 minutes | Luis Ortega, Beth Reyes |
| July 17 | All AP clerks, Dana | First results (time saved, backlog) and thank you | Team meeting | Dana Morales |

### 5. Learning goals

| Audience | After training, they can |
|---|---|
| AP clerks | Open the review queue; fix a yellow (low-confidence) field using the source text; reject an invoice with a reason; do 10 invoices in a row using only the keyboard |
| Senior clerk | Release a batch; spot an unusual total by carrier; pause a batch and raise it in #ap-ops |
| AP manager | Read the Per-Carrier Quality dashboard; move a carrier on or off "review all" |

### 6. Training sessions

| Session | Audience | Format and length | Date | Trainer |
|---|---|---|---|---|
| Pilot training | 3 pilot clerks | Hands-on with 30 real invoices, 90 minutes | June 8 | Priya Shah |
| Pilot wave 2 | 2 more clerks | Hands-on, 90 minutes | June 15 | Beth Reyes, Priya watching |
| Group training | Remaining 9 clerks, in 3 groups of 3 | Hands-on, 60 minutes, clerks train clerks | June 23 to 25 | Beth Reyes and pilot clerks |
| Batch release | Beth Reyes, Luis (backup) | Walkthrough on staging, then live together for 3 days | June 22 to 24 | Priya Shah |
| Dashboard and carrier onboarding | Luis Ortega, senior clerks | Live session with real data | July 7 | Priya Shah |

Training ends 1 to 5 days before each group starts using the tool (10 carriers from June 22, top 40 from June 29), so skills are fresh.

### 7. Materials
- Clerk quick guide, 2 pages, with screenshots and the 8 keyboard shortcuts: Luis Ortega and Beth Reyes (reviewed June 12).
- "What does yellow mean?" one-page card taped next to each screen: Beth Reyes.
- Short screen recording (4 minutes) of a full review: Priya Shah.
- #ap-ops channel for questions and suspicious drafts: Luis Ortega.

### 8. Support during rollout
- Weeks 8 and 9: Priya and Beth sit with the clerks from 8am to 11am each day ("floor walking").
- #ap-ops answered within 15 minutes during business hours.
- Daily 10-minute stand-up with clerks at 4pm during go-live weeks: what was confusing today.

### 9. Measuring adoption

| Measure | Target | Source | Result by July 10 |
|---|---|---|---|
| Clerks trained before their go-live | 14 of 14 | Training sign-in | 14 of 14 |
| Handling time per reviewed invoice | under 3 min | Review-screen logs | 2.4 min |
| Invoices keyed outside the tool (workarounds) | under 2% | Ledgerline drafts not created by the pipeline | 1.1% |
| Clerks who say "I trust the highlights" (5-question pulse survey) | at least 70% | Survey July 9 | 79% (11 of 14) |

### 10. Feedback loop
Questions and problems go to #ap-ops or the 4pm stand-up. Priya logs each item and tags it (bug, training gap, feature idea). Every Friday, Luis posts "You asked, we changed" with the fixes of the week. Example: clerks asked for the shipment number to be shown next to the PDF; shipped June 26.

---

## Common mistakes

- Letting the vendor or the FDE deliver the "why" message. Users trust their own manager; the FDE should write facts, the manager should speak.
- Training too early. Skills fade in 2 weeks if people do not use them. Train close to go-live.
- Teaching features instead of tasks, so people pass the session but cannot do their real work.
- Promising things leadership has not agreed ("no jobs will change"). Get the promise in writing first, or do not make it.
- Measuring logins instead of real use. Watch for workarounds, like people still typing invoices by hand.
