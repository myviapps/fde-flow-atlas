# Stakeholder Map: Power/Interest Grid and Champion List

**When to use it:** Build a stakeholder map in week 1, right after the first discovery conversations, and update it every 2 weeks. A stakeholder is anyone who can help, block, or is affected by the project. The power/interest grid sorts them into 4 boxes so you know how to spend your limited time: who to manage closely, who to keep satisfied, who to keep informed, and who to simply monitor. The champion list names the few people inside the customer who will actively push the project forward when you are not in the room. Most FDE projects that fail technically fine still fail because a quiet blocker was never met, or a champion left.

**Who reads it:** Mainly you, your engagement manager, and your account executive. It is an internal working document, so write it honestly and respectfully, as if the customer might one day read it. Do not share the raw grid with the customer.

**How long it should be:** 1 to 2 pages: the grid, one table of people, and a short champion list.

---

## The template

### 1. Project and date
*Good looks like: the date, because the map changes as people change jobs and opinions.*

- Project: [name]
- Last updated: [date], by [name]

### 2. People table
*Good looks like: every person or group who can affect the outcome, including users and blockers you have not met yet. Power means ability to change the outcome (budget, veto, access). Interest means how much they care or are affected. Score each 1 (low) to 3 (high).*

| Person | Role | Power (1-3) | Interest (1-3) | Current stance | What they care about |
|---|---|---|---|---|---|
| [name] | [title] | [n] | [n] | [Supporter / Neutral / Skeptic / Unknown] | [their goal or fear] |

### 3. Power/interest grid
*Good looks like: every person from the table placed in one box, with the action for that box.*

| | Low interest | High interest |
|---|---|---|
| **High power** | Keep satisfied: [names] | Manage closely: [names] |
| **Low power** | Monitor: [names] | Keep informed: [names] |

### 4. Engagement plan
*Good looks like: for each high-power person, a concrete action, a channel, and a frequency.*

| Person | What we need from them | Action | Channel and frequency | Owner |
|---|---|---|---|---|

### 5. Champion list
*Good looks like: 1 to 3 named champions inside the customer. A real champion has influence, wants the project to succeed for their own reasons, and acts on it without being asked. Note what they get from the success and what you do to help them.*

| Champion | Why they care (their win) | Influence | How we support them | Backup champion |
|---|---|---|---|---|

### 6. Blockers and gaps
*Good looks like: skeptics and people you have not met, with a plan to understand their concerns, not to "handle" them.*

- [Person or group]: [concern], [plan]

### 7. Changes since last update
*Good looks like: who moved boxes and why.*

- [Change]

---

## Worked example: Northwind Logistics

### 1. Project and date
- Project: Northwind invoice-extraction assistant
- Last updated: May 15, 2026 (end of week 2), by Priya Shah. Next update May 29.

### 2. People table

| Person | Role | Power (1-3) | Interest (1-3) | Current stance | What they care about |
|---|---|---|---|---|---|
| Dana Morales | CFO, sponsor | 3 | 3 | Supporter | Penalties and hiring cost; a clean story for the board |
| Luis Ortega | AP Manager | 2 | 3 | Supporter | Month-end backlog; his team's jobs and morale |
| Grace Kim | IT Lead | 3 | 2 | Neutral, cautious | Not owning a system her team cannot support; cloud cost |
| Omar Haddad | Security Lead | 3 | 1 | Neutral (met once, May 12) | Data staying in Northwind's account; model not trained on their data |
| Marcus Lee | IT engineer | 1 | 2 | Neutral | Clear alerts, not being paged at night for someone else's code |
| Ana Silva | IT engineer | 1 | 3 | Supporter | Learning LLM work; wants to own evals after handoff |
| Beth Reyes | Senior AP clerk | 1 | 3 | Skeptic | Accuracy on messy scans; being blamed for errors she did not make |
| AP clerks (14) | Key invoices today | 1 | 3 | Mixed, some worried | Job security; not having a harder day |
| Northwind auditors | Internal audit | 2 | 1 | Unknown | A human control before any payment |
| Tom Becker | Engagement Manager, Atlas AI | 2 | 3 | Supporter | Scope and timeline, renewal |

### 3. Power/interest grid

| | Low interest | High interest |
|---|---|---|
| **High power** | Keep satisfied: Omar Haddad, Grace Kim, Northwind auditors | Manage closely: Dana Morales, Luis Ortega |
| **Low power** | Monitor: (none today) | Keep informed: Ana Silva, Marcus Lee, Beth Reyes, AP clerks |

Grace Kim scores 2 on interest, so she sits on the line between boxes. We treat her as "manage closely" because she owns the cloud account and ERP access, and the handoff depends on her team.

### 4. Engagement plan

| Person | What we need from them | Action | Channel and frequency | Owner |
|---|---|---|---|---|
| Dana Morales | Budget, go/no-go decisions, clerks' time | 2-minute written update; 15 minutes live at key decisions | Weekly exec update; steering at weeks 4 and 7 | Priya Shah |
| Luis Ortega | Pilot clerks, labels, change message to his team | Working session; share clerk feedback first with him | Twice weekly, 30 min | Priya Shah |
| Grace Kim | Cloud account, ERP API, future ownership | Invite to design review; agree on runbook and handoff early | Weekly, 30 min | Priya Shah |
| Omar Haddad | Security approval by May 20 | Answer questionnaire follow-ups within 1 business day; close each open item in writing | Async, plus a review call May 19 | Priya Shah |
| Northwind auditors | Accept the payment control | Walk through draft-only design (ADR-004) with Luis | Once, week 3 | Luis Ortega |

### 5. Champion list

| Champion | Why they care (their win) | Influence | How we support them | Backup champion |
|---|---|---|---|---|
| Luis Ortega | Ends month-end overtime for his team; gets credit with the CFO | Owns the process and the clerks; Dana trusts his judgment | Give him numbers and a demo he can present himself; help write his team message | Beth Reyes, once her concerns are met |
| Ana Silva | Wants to grow into AI engineering; will own evals after handoff | Grace listens to her on technical fit | Pair with her on the eval script from week 3; name her in updates | Marcus Lee |

Dana Morales is the sponsor, not a champion: she funds and decides, but she will not push day to day. Do not confuse the two.

### 6. Blockers and gaps
- Omar Haddad: has a veto and the questionnaire is still open. Two open items (bank account numbers visible to clerks, no customer-managed key for model traffic). Propose a fix or a written acceptance for each before May 20, and ask what worried him on past vendor reviews.
- Beth Reyes: skeptical because the 2023 template OCR tool created extra work. Ask her to pick the 20 hardest invoices for the edge set, and show her results on them first.
- AP clerks: fear of job loss. Luis owns the message (freed time moves to disputes and exceptions, no layoffs); we give him facts, not slogans. Team session planned for June 17.
- Grace Kim: worried about running an AI system after we leave. Put her team on the runbook and handoff plan from week 3, not week 9.

### 7. Changes since last update
- Ana Silva moved from Neutral to Supporter after the eval-script pairing session on May 13.
- Northwind auditors added; Luis mentioned they must approve any change to the payment control.

*Update on June 19 (week 7): Omar Haddad moved to Supporter after the security review closed on May 20. Beth Reyes moved to Supporter after she ran the shadow pilot and the assistant handled 18 of her 20 hardest invoices; she became Luis's backup champion and later owned the daily batch release.*

---

## Common mistakes

- Mapping only the people who come to meetings. The biggest blockers (security, audit, procurement) are often the ones you never meet.
- Mistaking a friendly contact for a champion. A champion has influence and acts without being asked.
- Having only one champion. People change jobs, go on leave, or get busy. Always name a backup.
- Treating skeptics as enemies. Their concerns are often real risks; turn them into test cases.
- Writing the map once and never updating it. Stances change every few weeks.
