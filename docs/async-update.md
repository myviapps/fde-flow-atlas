# End-of-Day and Handoff Note

**When to use it:** Post an end-of-day note (EOD note) every working day you are on an engagement, at the moment you stop work, in the team's shared or internal channel. It is a short written summary of what you did, what comes next, what is blocked and what you need from whom. Use the longer handoff version when work passes to someone else: a colleague in another time zone who starts while you sleep, a teammate covering while you are on leave, or a new owner at the end of your time on the project. A good note lets the next person start working immediately instead of waiting a whole day to ask you a question.

**Who reads it:** Your own team (other FDEs, engineers and your engagement manager), colleagues in other time zones who pick up your work, and, for the customer-facing version, the customer's project lead and engineers in the shared channel. Your manager often skims EOD notes to spot blockers early. Anyone covering for you reads the handoff version line by line.

**How long it should be:** The daily note: 5 to 10 lines, readable in under a minute, written in about 5 minutes. The handoff version: under one page. If it grows longer, move detail into tickets or documents and link them.

---

## The template

### Version A: daily end-of-day note

### 1. Header line
*Good looks like: date, project and your status color, so the note can be found later by searching the channel.*

EOD [date], [project]: [Green / Amber / Red]

### 2. Done
*Good looks like: 1 to 4 finished items, each with a link (pull request, ticket, document). "Worked on X" is not done; say what state it reached.*

- [Item, with link]

### 3. Next
*Good looks like: what you will do first tomorrow, so others can plan around it.*

- [Item]

### 4. Blocked
*Good looks like: what stops you, why, and since when. Write "Nothing blocked" when that is true, so readers know you checked.*

- [Blocker]: [cause], blocked since [date]

### 5. Needs
*Good looks like: one named person, one clear question and one time, in the reader's time zone if it differs from yours. This is the most important line in the note.*

- @[person]: [question or request], by [day and time, with time zone]

### 6. Heads-up
*Good looks like: anything the reader should know before it surprises them: a planned deployment, a meeting that moved, a change in a date. Leave it out if there is nothing.*

- [Item]

### Version B: handoff note (add these sections to Version A)

### 7. Current state
*Good looks like: where each open piece of work stands right now, in one line each, with the exact branch, environment or ticket.*

| Work item | State | Where it lives |
|---|---|---|

### 8. How to continue
*Good looks like: the first 1 to 3 steps the next person should take, written so they could do them without messaging you.*

1. [Step]

### 9. Watch out for
*Good looks like: known traps, fragile parts and anything that looks wrong but is expected.*

- [Item]

### 10. Contacts and access
*Good looks like: who to ask for what, and confirmation that the next person already has the access they need. Never paste passwords or keys; point to the vault or access request instead.*

| Need | Person | How to reach |
|---|---|---|

### 11. Emergency route
*Good looks like: what counts as urgent and how to reach someone out of hours, agreed in advance.*

[Rule and contact route]

---

## Worked example: Brannock Logistics

Priya Shah, Forward Deployed Engineer at Atlas AI, is on site at Brannock Logistics building the invoice-extraction assistant, which reads carrier invoices and posts them to Brannock's Ledgerline ERP. Her colleague Arun Nair, an Atlas AI platform engineer, works from Singapore, 12 hours ahead of Priya. The two have no working-hours overlap, so the written note is the only handoff.

### Daily note posted in the internal Atlas AI channel, Tuesday 17:10

EOD Tue June 2, Brannock invoice assistant: Amber

**Done**
- Retry logic for Ledgerline timeouts merged (PR 214). Failed posts now retry 3 times with backoff.
- Evaluation run on 400 scanned invoices: 93.8% critical-field accuracy, report in the eval folder (link).

**Next**
- Load test the posting service at month-end volume (2,000 invoices per hour).

**Blocked**
- Staging database password expired this afternoon, so the load test cannot start. Blocked since 15:30 Tue.

**Needs**
- @arun: please rotate the staging database password in the vault by 11:00 your time Wednesday (23:00 my time Tuesday). I start the load test at 09:00 my time.

**Heads-up**
- I deploy build 1.8 to staging at 09:00 my time Wednesday. Please do not change staging config after your 20:00.
- Status is Amber only because of the password; it goes back to Green once the load test starts.

### Customer-facing version posted in the shared channel with Brannock, same evening

EOD Tue June 2: on track for the June 8 pilot.

- Done: timeouts to Ledgerline now retry automatically, so a slow ERP no longer loses invoices.
- Next: load test at month-end volume on Wednesday.
- Needs: @grace, can your team confirm by Thursday 12:00 that the 60 requests per minute limit on Ledgerline can be raised during the test window? If not, the test runs at the current limit and takes longer.

### Handoff note before Priya's week of leave, Friday June 12

EOD Fri June 12 plus handoff to Arun for June 15 to 19. Status: Green.

**Current state**

| Work item | State | Where it lives |
|---|---|---|
| Posting service build 1.9 | In staging, passed load test | Branch main, staging environment |
| Daily batch approval screen | 80% built, not reviewed | PR 231 (draft) |
| Scanned-invoice accuracy | 95.1%, target 97% by June 26 | Eval report, week 7 tab |
| Pilot with 3 carriers | Running, clerks approve every invoice | Pilot dashboard (link) |

**How to continue**
1. Monday: finish PR 231 (the missing piece is the "reject with reason" button) and ask Tom Becker for review.
2. Tuesday: run the eval on the new batch of 200 scans that Luis sends Monday evening.
3. Wednesday: 10:00 Brannock time weekly call with Dana Morales. The agenda and last week's exec update are linked in the channel.

**Watch out for**
- Carrier "Kestrel Freight" sends invoices with two totals; the second one is the correct total. The rule for this is in the validator and is expected behavior.
- The pilot dashboard shows a dip every day at 06:00 while Ledgerline runs its backup. It is not an outage.

**Contacts and access**

| Need | Person | How to reach |
|---|---|---|
| Ledgerline access or limits | Grace Kim, Brannock IT | Shared channel, reply within 4 working hours |
| Business questions, clerk feedback | Luis Ortega, AP lead | Shared channel |
| Sponsor decisions | Dana Morales | Through Luis first; email only if urgent |
| Access check | Confirmed: Arun has vault, staging and pilot dashboard access (tested June 12) | |

**Emergency route**
Urgent means invoices are not posting to Ledgerline for more than 30 minutes during Brannock business hours. Page the Atlas AI on-call rotation, then post in the shared channel. Priya is not to be contacted during leave unless the on-call lead decides it is necessary.

Priya Shah, Forward Deployed Engineer, Atlas AI

---

## Common mistakes

- Writing a diary ("worked on the pipeline all day") instead of what reached done, with links.
- A "Needs" line with no name or no time ("someone should look at the password"), so nobody acts on it.
- Giving deadlines only in your own time zone when the reader is in another one.
- Posting the internal note in the customer's shared channel by mistake. Check the channel before you press send.
- Pasting a password, key or customer personal data into the note. Point to the vault or the ticket instead.
