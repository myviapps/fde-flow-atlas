# 10-Minute Demo Script

**When to use it:** Write a demo script whenever you show your system to people who will make a decision: a sponsor before a go/no-go, a leadership steering meeting, or a new team you need on board. A good demo is a story, not a feature tour. It shows the "before" (the painful way work happens today), the "after" (the same work with your system), and the proof (numbers from the customer's own data). It also plans for things going wrong, because live demos fail at the worst moment. A script lets you rehearse, stay inside 10 minutes, and recover calmly.

**Who reads it:** You and anyone presenting with you (often the customer champion). It is a working document, not a handout. The audience never sees it.

**How long it should be:** 1 to 2 pages. One row per minute or step, plus the fallback plan and a checklist.

---

## The template

### 1. Audience and goal
*Good looks like: who will be in the room, what they care about, and the one decision or feeling you want at the end.*

- Audience: [names and roles]
- What they care about: [their goals, in their words]
- Goal of the demo: [the decision or next step you want]
- Presenters: [who speaks when]

### 2. The one-sentence story
*Good looks like: a sentence the sponsor could repeat to their boss.*

[Today X takes Y; with the system it takes Z, and a human stays in control of W.]

### 3. Demo data
*Good looks like: real customer examples (with permission), chosen in advance, including one hard case. Never "lorem ipsum" or vendor sample data.*

- Example 1 (easy): [item]
- Example 2 (hard): [item]
- Example 3 (system is unsure, human reviews): [item]

### 4. Script
*Good looks like: timed steps that add up to 10 minutes or less, each with what you show, what you say, and the point it proves. Leave 2 minutes of the meeting for questions.*

| Time | Show | Say (key line) | Point it proves |
|---|---|---|---|
| 0:00 | [screen] | [line] | [point] |

### 5. Failure fallbacks
*Good looks like: for each likely failure, how you will notice it and exactly what you switch to, prepared before the meeting.*

| If this fails | You will see | Switch to |
|---|---|---|
| [failure] | [symptom] | [fallback] |

### 6. Likely questions
*Good looks like: the 3 to 5 hardest questions, with short honest answers.*

- Q: [question] A: [answer]

### 7. Pre-demo checklist
*Good looks like: things to check 1 day and 30 minutes before.*

- [ ] [item]

### 8. The ask
*Good looks like: the exact thing you will ask for at the end.*

[Ask]

---

## Worked example: Northwind Logistics

### 1. Audience and goal
- Audience: Dana Morales (CFO), Luis Ortega (AP Manager), Grace Kim (IT Lead), Omar Haddad (Security Lead), 2 people from internal audit.
- What they care about: Dana wants penalties and hiring costs down; Luis wants the month-end backlog gone; Grace wants something her team can run; Omar and audit want no payment without a human.
- Goal of the demo: confidence to say "go" at the June 19 go/no-go meeting for live use on 10 carriers from June 22.
- Presenters: Luis Ortega opens and tells the "before" story; Beth Reyes (senior AP clerk) drives the review screen; Priya Shah (FDE) explains the system and numbers. Thursday, June 18, 2026, 10:00, 15-minute slot.

### 2. The one-sentence story
Today a clerk spends 7 minutes keying each carrier invoice; with the assistant she checks a pre-filled draft in about 3 minutes, and nothing is paid until a person releases it.

### 3. Demo data
Three real invoices from the shadow pilot, approved for use by Luis:
- Example 1 (easy): a 1-page text PDF from a top-10 carrier. All 18 fields filled with high confidence.
- Example 2 (hard): a scanned 3-page invoice with a handwritten note and accessorial charges. Beth chose it from her "hardest 20".
- Example 3 (unsure): an invoice whose shipment number does not match any shipment in Ledgerline. The system routes it to review with a clear reason.

### 4. Script

| Time | Show | Say (key line) | Point it proves |
|---|---|---|---|
| 0:00 | Title slide with 3 numbers: 7 min, 6-day backlog, $210,000 penalties | Luis: "This is what month end costs us today." | Shared problem, in their numbers |
| 0:45 | Beth's screen: a PDF on the left, empty Ledgerline form on the right | Beth keys 4 fields live, then Luis: "Now do that 18 times, 32,000 times a month." | Makes the "before" pain felt |
| 2:00 | Example 1 arrives in the review screen, fully pre-filled | Priya: "The assistant read this invoice about 40 seconds after it hit the mailbox." | Speed; the happy path |
| 3:00 | Beth clicks a field; source text highlights on the PDF | Beth: "I can see exactly where every number came from." | Trust: every value has a source |
| 4:00 | Example 2, the hard scan; 2 fields highlighted yellow | Priya: "When the assistant is unsure, it says so, and Beth checks only those 2 fields." | Confidence routing, human in control |
| 5:30 | Example 3 in the review queue with reason "shipment not found" | Beth: "Before, I found these at the end of the day. Now they come to me first." | Validation against real shipment data |
| 6:30 | Daily batch release screen: drafts waiting, Release button | Priya: "Nothing reaches payment until Beth or Luis releases it. That is the control audit asked for." | Draft-only design (ADR-004) |
| 7:30 | Shadow pilot results slide | Priya: "97.4% accuracy on 12 critical fields, 55% of invoices need no edits, 3.2 minutes per invoice." | Proof from Northwind's own data |
| 8:45 | Plan slide: 10 carriers June 22, top 40 June 29, handoff July 10 | Luis: "Here is what we are asking to do next." | Clear path, small safe steps |
| 9:30 | Ask slide | Luis makes the ask (section 8) | Decision |

### 5. Failure fallbacks

| If this fails | You will see | Switch to |
|---|---|---|
| Live extraction is slow or the model endpoint errors | Example 1 not in the review screen after 90 seconds | Say "while that runs, here is one from this morning" and open the same invoice already processed at 8:00 (pre-loaded in the queue) |
| Ledgerline test environment is down | Draft creation error or login page | Show the draft screenshots in the backup deck (slides 12 to 14); explain the drafts are still stored and retried automatically, which is a real feature |
| Wi-Fi or VPN fails | Nothing loads | Play the 4-minute recording of the same 3 examples, made June 17, with Beth narrating live over it |
| The hard example extracts a field wrong | A wrong value with low confidence | Do not hide it. Beth fixes it in the review screen: "This is exactly why I check the yellow fields." Note it for the eval edge set |
| The hard example extracts a field wrong with high confidence | A wrong value not highlighted | Say so plainly, show that validation or batch release is the next safety net, and add it to the follow-ups. Never pretend it is correct |
| Running out of time | Clock past 7:30 before the results slide | Skip Example 3, go straight to results and the ask |

### 6. Likely questions
- Q (Dana): "What happens to the clerks?" A (Luis): "No layoffs. Freed time moves to carrier disputes and exceptions, which we are behind on today."
- Q (Omar): "Does the model learn from our invoices?" A (Priya): "No. It runs through a managed endpoint in your own US East account, and your data is not used for training."
- Q (Grace): "Who fixes it at 2am after July 10?" A (Priya): "Your on-call, Marcus Lee or Ana Silva, using the runbook they are testing with us now. Atlas has break-glass access only."
- Q (audit): "Can it pay an invoice by itself?" A: "No. It only creates drafts; a named person releases each batch, and the release is logged."
- Q (Dana): "Why only 10 carriers first?" A: "Small steps. Each new carrier starts on review-all until 30 invoices pass with under 5% edits."

### 7. Pre-demo checklist
- [ ] June 17: record the backup video; build the backup deck with screenshots.
- [ ] June 17: rehearse once with Luis and Beth, timed, including one fallback.
- [ ] June 18, 9:00: pre-load a processed copy of each example in the review queue.
- [ ] June 18, 9:30: log in to review screen and Ledgerline test; close chat apps and notifications; zoom browser to 125%.
- [ ] June 18, 9:30: check that no bank account numbers are visible on screen (masked except last 4 digits).
- [ ] Results slide numbers match the latest weekly exec update.

### 8. The ask
"We ask for a go at tomorrow's meeting to run live on 10 carriers from June 22, drafts only, with Beth releasing a daily batch. We will report the numbers to you every Friday."

Result: go decision given June 19; see the POC success-criteria sheet for the signed verdict.

---

## Common mistakes

- Giving a feature tour ("and here is the settings page") instead of a before-and-after story.
- Using clean vendor sample data. The audience trusts their own messy invoices, and only those.
- No fallback plan, so a Wi-Fi drop kills the meeting. Always have a recording and screenshots ready.
- Hiding a mistake the system makes live. Owning it calmly and showing the safety net builds more trust than a perfect run.
- Running long and losing the ask. Time the rehearsal and cut steps, not the ending.
