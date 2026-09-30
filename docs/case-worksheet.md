# One-Page Case Decomposition Worksheet

**When to use it:** Use this worksheet whenever you face an open problem and need a structured answer fast: after a first customer call, before a design session, or in an FDE interview case ("A freight company is drowning in invoices. What would you build?"). Decomposing a case means breaking one big, fuzzy question into smaller questions you can answer one by one: who the users are, what goal matters, what limits you, what the options are, and what you would do first. The worksheet keeps you to one page and about 30 minutes, so you practice thinking in structure instead of writing an essay. Filled-in worksheets from real work also become your case bank: a set of practiced stories and structures you can reuse in interviews.

**Who reads it:** Mostly you. Sometimes your engagement manager or a teammate before a customer meeting, or an interviewer if you sketch it live on a whiteboard.

**How long it should be:** One page. If it does not fit, you have not decided what matters yet. Aim for 20 to 30 minutes to fill it in.

---

## The template

### 1. The case in one sentence
*Good looks like: the problem as the customer or interviewer stated it, then your restatement in terms of a user and an outcome.*

- As stated: [quote]
- My restatement: [user] needs [outcome] because [reason]

### 2. Clarifying questions
*Good looks like: the 3 to 5 questions whose answers would change your solution most. Write the answer, or your assumption if you cannot ask.*

| Question | Answer or assumption |
|---|---|

### 3. Users and workflow today
*Good looks like: the main user and the steps they take now, with the slow or painful step marked.*

1. [Step] 

### 4. Goal and metrics
*Good looks like: one main metric the customer cares about, plus 1 or 2 guardrail metrics that must not get worse.*

- Main metric: [metric, baseline, target]
- Guardrails: [metric]

### 5. Constraints
*Good looks like: the limits that rule out options: data, systems, security, time, money, people.*

- [Constraint]

### 6. Issue tree
*Good looks like: 3 or 4 branches that do not overlap and together cover the problem, each with a sub-question you can answer.*

- [Branch]: [sub-question]

### 7. Size it
*Good looks like: a quick estimate of volume and value, with a sanity check.*

[Numbers]

### 8. Options
*Good looks like: 2 or 3 real options, a one-line trade-off for each, and a choice.*

| Option | Trade-off |
|---|---|

- Choice: [option], because [reason]

### 9. Biggest risks and cheapest test
*Good looks like: the 2 or 3 things most likely to kill the idea, and how to test each in days, not months.*

| Risk | Cheapest test |
|---|---|

### 10. Recommendation and next steps
*Good looks like: answer first, in 2 sentences, then the next 3 actions with owners.*

- Recommendation: [answer]
- Next: [action, owner, date]

---

## Worked example: Northwind Logistics

Filled in by Priya Shah on the evening of April 14, 2026, after the first discovery interview with Luis Ortega. Time taken: 25 minutes.

### 1. The case in one sentence
- As stated: "My team spends the whole day typing numbers from PDFs into the ERP." (Luis Ortega)
- My restatement: AP clerks need carrier invoices entered into Ledgerline correctly and fast, because a 6-day month-end backlog causes late-payment penalties and missed discounts.

### 2. Clarifying questions

| Question | Answer or assumption |
|---|---|
| How many invoices, in which formats? | About 38,000 per month; 15% EDI already automated; the rest PDF by email or scanned paper |
| Do we have ground truth? | Yes: 12 months of values clerks keyed into Ledgerline. Luis can export 2,000 |
| Can we write to the ERP? | An API exists but is "not well used". Assumption until tested: it can create drafts |
| What would success look like to the CFO? | Handling time under 3 minutes, backlog under 2 days |
| Why did the 2023 tool fail? | Template OCR needed setup per carrier and broke on layout changes |

### 3. Users and workflow today
1. Clerk opens an email and the PDF.
2. Finds the shipment number and looks it up in Ledgerline.
3. **Keys 18 fields by hand (slow, about 7 minutes per invoice, 2.8% errors).**
4. Mismatches go to an exceptions spreadsheet (about 9%).
5. Invoice waits for approval and payment.

### 4. Goal and metrics
- Main metric: handling time per invoice, 7 minutes today, target under 3.
- Guardrails: field accuracy at least as good as manual keying (about 97%); no invoice paid wrongly.

### 5. Constraints
- Data contains bank details; security (Omar Haddad) must approve; data likely must stay in Northwind's cloud account.
- 400+ carriers, layouts change without notice (why templates failed).
- Budget decided in the Q2 cycle, which closes May 15.
- Clerks fear job loss; adoption is a real risk.

### 6. Issue tree
- Input: can we read every invoice type? (text PDF, scanned, multi-page, multi-invoice)
- Extraction quality: can we reach about 97% on critical fields, and know when we are unsure?
- Integration: can we write drafts to Ledgerline fast enough at month-end peak?
- People and control: will clerks trust and use it, and does a human still control payment?

### 7. Size it
- Volume: 38,000 minus 15% EDI is about 32,300, so about 32,000 invoices per month. Sanity check: matches Luis's "about 1,500 a day" (32,000 / 21 business days).
- Value (from Luis, to verify with finance): penalties about $210,000 per year, overtime about $120,000, missed 2% discounts from about 30 carriers. Already over $300,000 per year before hiring costs, so a six-figure project can pay back.

### 8. Options

| Option | Trade-off |
|---|---|
| Template OCR per carrier | Cheap per page, but already failed here; 400+ templates |
| OCR plus LLM extraction with validation and review | Works across layouts; needs evals and a human review step |
| Ask carriers to move to EDI | Ideal data, but Northwind cannot force 400 carriers; years, not weeks |

- Choice: OCR plus LLM with validation, confidence routing, and draft-only posting, because it handles unknown layouts and keeps a human in control of money.

### 9. Biggest risks and cheapest test

| Risk | Cheapest test |
|---|---|
| Accuracy on scans too low | Run a spike on 100 real invoices (25 scanned) in week 1 |
| ERP API cannot create drafts | 30-minute session with Grace Kim; one sandbox call |
| Clerks will not adopt | Involve a skeptical senior clerk in picking the hardest test invoices |

### 10. Recommendation and next steps
- Recommendation: Build an assistant that extracts, validates, and creates Ledgerline drafts, with clerks reviewing only uncertain invoices. Start with the top 40 carriers (about 80% of volume) to prove value in 10 weeks.
- Next: security pre-read to Omar (Priya, April 17); ERP API session with Grace (Tom Becker, April 18); export 2,000 labeled invoices (Luis, April 21).

*Case bank note, added after the project: this worksheet became Priya's practice case for interviews ("design an invoice automation for a logistics company"). Its issue tree is the structure she uses live; the June 30 currency incident is the "what could go wrong" example; the STAR card holds the full story.*

---

## Common mistakes

- Jumping to the solution ("use an LLM") before asking who the user is and what number must move.
- Asking many clarifying questions that would not change the answer. Ask the few that would.
- Issue-tree branches that overlap ("accuracy" and "model quality"), so you count the same thing twice and miss something else.
- Skipping the sanity check on numbers, then building a business case on a figure that is off by 10 times.
- Ending without a recommendation. An interviewer or customer wants your answer first, then your reasons.
