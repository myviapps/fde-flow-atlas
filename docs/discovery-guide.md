# Customer Discovery Interview Guide

**When to use it:** Use this guide before and during your first conversations with a customer, when you still do not know exactly what problem you are solving. Discovery is where a Forward Deployed Engineer (FDE) learns how work really happens today, who feels the pain, what "success" means in numbers, and what could block a deployment. Run one interview per role (sponsor, daily user, IT, security) and fill in one copy of this guide per interview.

**Who reads it:** You and your delivery team. A cleaned-up summary goes to your account lead and later feeds the PRD and the statement of work.

**How long it should be:** 2 to 4 pages of notes per interview. The question list is a menu, not a script. A 45-minute interview usually covers 10 to 15 questions well.

---

## The template

### 1. Interview details
*Good looks like: you can tell who said what, and how much weight to give it, months later.*

- Customer: [company name]
- Interviewee: [name, role, team, how long in the role]
- Interviewer(s): [names]
- Date and format: [date, video or on site, length]
- Their role in the decision: [sponsor / user / approver / blocker / influencer]

### 2. Goals for this interview
*Good looks like: 2 or 3 specific things you want to leave knowing. If you cannot name them, you are not ready.*

- [What do I need to learn from this person that nobody else can tell me?]
- [Which assumption am I trying to confirm or kill?]

### 3. Current workflow
*Good looks like: a step-by-step picture of today, with real volumes and times, ideally while they share their screen.*

Questions to pick from:
- Walk me through the last time you did [task], from start to finish.
- How many [items] per day, week, or month? Where does that number come from?
- Which tools, spreadsheets, or systems do you touch?
- Where do things wait, get stuck, or get sent back?
- What happens on your worst day?

Notes: [steps, volumes, times, tools, handoffs]

### 4. Pain and cost
*Good looks like: pain tied to money, time, risk, or people. "It is annoying" is not enough; "we pay $X in late fees" is.*

- What does this problem cost you today? (time, money, errors, overtime, penalties, churn)
- Who else feels this pain?
- What have you already tried? Why did it not work?

Notes: [pains with numbers and sources]

### 5. Success criteria
*Good looks like: measurable outcomes the customer agrees to, with a baseline and a target.*

- If this worked perfectly, what would be different in 6 months?
- Which number would you show your boss to prove it worked?
- What is the minimum result that would still be worth it?

Notes: [metric, baseline, target, who measures it]

### 6. Data and systems
*Good looks like: you know where the data lives, what shape it is in, who owns it, and how you would get a sample.*

- Where does the input data come from? What formats?
- Can we get a sample of real data this week? What approvals are needed?
- Which systems must the solution read from or write to?

Notes: [sources, formats, owners, access path]

### 7. Constraints and risks
*Good looks like: blockers found in week 1, not week 8.*

- Security, privacy, or compliance rules we must follow?
- Budget, timing, or headcount limits?
- Any past AI or automation projects that failed here?

Notes: [constraints, risks]

### 8. Decision process
*Good looks like: you know who signs, who can say no, and when budget is decided.*

- Who else needs to agree before this goes live?
- How are tools like this approved and bought here?

Notes: [people, steps, dates]

### 9. Summary and next steps
*Good looks like: 3 to 5 bullets you would repeat back to the customer, plus owners and dates.*

- Key takeaways: [bullets]
- Surprises: [what you did not expect]
- Open questions: [list]
- Next steps: [action, owner, date]

---

## Worked example: Northwind Logistics

### 1. Interview details
- Customer: Northwind Logistics (freight forwarder, about 1,800 employees)
- Interviewee: Luis Ortega, Accounts Payable (AP) Manager, 6 years in role, manages 14 AP clerks
- Interviewer(s): Priya Shah (FDE, Atlas AI), Tom Becker (Engagement Manager, Atlas AI)
- Date and format: April 14, 2026, on site in Columbus, 50 minutes, with screen share
- Their role in the decision: Daily owner of the process and key user; strong influencer with the CFO

### 2. Goals for this interview
- Learn the real, step-by-step invoice process and where time is lost.
- Confirm or kill our assumption that most carrier invoices arrive as PDFs by email.
- Get a sample of real invoices.

### 3. Current workflow
- Carrier invoices arrive in a shared mailbox (ap-invoices@). About 38,000 per month from 400+ carriers.
- Channel mix (Luis's estimate, confirmed later from mailbox stats): 60% PDF by email, 25% scanned paper, 15% EDI (EDI is already automated).
- A clerk opens each PDF, finds the shipment number, looks up the shipment in the Ledgerline ERP, and keys 18 fields by hand: carrier, invoice number, date, currency, amounts, accessorial charges, and so on.
- Average 7 minutes per invoice. Invoices that do not match a shipment go to an "exceptions" spreadsheet, which is about 9% of volume.
- Worst day: month end, when the backlog reaches 6 working days.

### 4. Pain and cost
- Late-payment penalties: about $210,000 per year.
- Missed early-payment discounts (2% for payment within 10 days) from about 30 carriers.
- Overtime at month end: roughly $120,000 per year.
- Keying error rate about 2.8%, which creates disputes with carriers.
- Tried before: a template-based OCR tool in 2023. Failed because every carrier template needed manual setup and it broke when layouts changed.

### 5. Success criteria
- "I want my team reviewing, not typing."
- Metric Luis would show the CFO: average handling time per invoice and backlog days.
- Minimum worth it: handling time under 3 minutes and backlog under 2 days at month end.

### 6. Data and systems
- Input: PDFs (text-based and scanned) in the shared mailbox. Twelve months of history exists.
- Luis can export 2,000 invoices with their keyed ERP values, which gives us ground-truth labels. Needs sign-off from Grace Kim (IT) and Omar Haddad (Security).
- Must write to the Ledgerline ERP. IT says an API exists but is "not well used."

### 7. Constraints and risks
- Invoices contain bank details. Security will ask where data is stored.
- Clerks are nervous about job loss. Luis wants a message about redeploying people to exception handling and carrier disputes.
- The 2023 failure left skepticism with the CFO.

### 8. Decision process
- Dana Morales (CFO) is the sponsor and signs the budget.
- Omar Haddad (Security) must approve any vendor that handles financial data.
- Budget is decided in the Q2 planning cycle, which closes May 15.

### 9. Summary and next steps
- Key takeaways: real volume is about 32,000 non-EDI invoices per month; the main cost is time and penalties; ground-truth labels already exist in the ERP.
- Surprises: the ERP API exists but is rarely used, so integration is a risk.
- Open questions: ERP API rate limits; data residency rules.
- Next steps:
  - Priya: send security pre-read to Omar by April 17.
  - Luis: request export of 2,000 labeled invoices by April 21.
  - Tom: book a 30-minute session with Grace Kim on the ERP API by April 18.

---

## Common mistakes

- Pitching the product in the interview instead of listening. Aim for the customer talking 80% of the time.
- Accepting vague pain ("it is slow") without asking for a number and where the number comes from.
- Only talking to the sponsor. The daily users know where the real work and the real edge cases are.
- Leaving without a data sample or a clear path to get one.
- Not writing the summary the same day, and losing the details.
