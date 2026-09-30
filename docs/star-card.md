# STAR Interview Story Card

**When to use it:** Use a STAR card to prepare stories for job interviews, especially behavioral questions like "Tell me about a time you handled a difficult customer" or "Tell me about a technical decision you made under pressure." STAR stands for Situation, Task, Action, Result. FDE interviews lean heavily on these stories because the job mixes engineering, customers, and judgment. Build a bank of 6 to 10 cards from real projects, then practice telling each one in about 2 minutes.

**Who reads it:** You, while preparing. Sometimes a mentor or friend who does a mock interview with you. The interviewer never sees the card; they hear the story.

**How long it should be:** One card per story, about half a page. Spoken, the story should take 2 to 3 minutes, with more detail ready if asked.

---

## The template

### 1. Story title
*Good looks like: a short name you can remember under pressure.*

[Title]

### 2. Questions this story answers
*Good looks like: 3 to 5 common interview questions, so you know when to use it.*

- [Tell me about a time...]

### 3. Situation (about 15% of the time)
*Good looks like: 2 or 3 sentences of context. Who, where, what was at stake. Skip details that do not matter.*

[Situation]

### 4. Task (about 10%)
*Good looks like: what you specifically were responsible for. Make your role clear.*

[Task]

### 5. Action (about 60%)
*Good looks like: 3 to 5 steps you personally took, using "I", with the reasoning behind each. This is the heart of the story.*

1. [Action and why]

### 6. Result (about 15%)
*Good looks like: numbers where possible, plus what you learned or would do differently.*

- Outcome: [measurable result]
- Lesson: [what you learned]

### 7. Likely follow-up questions
*Good looks like: questions the interviewer might ask, with short answers ready.*

- Q: [question] A: [answer]

### 8. Skills shown
*Good looks like: the qualities this story proves, so you can match stories to the job description.*

[Skills]

---

## Worked example: Northwind Logistics

### 1. Story title
"The Blue Harbor currency incident"

### 2. Questions this story answers
- Tell me about a time something went wrong in production.
- Tell me about a mistake you made and what you learned.
- How do you design AI systems to be safe?
- Tell me about a time you kept a customer's trust under pressure.

### 3. Situation
I was the Forward Deployed Engineer deploying an invoice-extraction assistant at Northwind Logistics, a freight company processing about 32,000 carrier invoices a month. One day after we went live on the top 40 carriers, a carrier changed its invoice layout, and 37 invoices were drafted in the ERP with the wrong currency, about EUR 212,000 recorded as USD.

### 4. Task
I owned the pipeline and the customer relationship on the technical side. I had to stop the damage, find the cause, fix it, and keep the CFO confident in the project, which she was already nervous about because of a failed automation project in 2023.

### 5. Action
1. I turned on a per-carrier "review all" flag within 10 minutes of being paged, which sent all of that carrier's invoices to clerks without stopping the rest of the system. I had built that flag for exactly this kind of case.
2. I traced the root cause in about an hour: the model read "USD" from a payment instruction line, and our only currency check compared against the carrier master, which was also wrong.
3. I called the AP manager and CFO the same afternoon, before they heard it second-hand. I explained what happened, that nothing was paid because of the draft-only design we had agreed on, and what I would change.
4. I added an independent check against the shipment lane's billing currency, a layout-change alert per carrier, and multi-currency cases in the evaluation set. All were done within a week.
5. I ran a blameless post-mortem with both teams and pointed out that I had left an assumption about carrier currency untested in our risk log. I now close assumptions before go-live.

### 6. Result
- Outcome: no money was paid wrongly; the fix shipped in 2 days; the project stayed on schedule. Two weeks later the system handled 64% of invoices with no human edits, handling time dropped from 7 to 2.4 minutes, and July month-end backlog was 1 day instead of 6. The CFO later approved phase 2.
- Lesson: check money fields against a second, independent source, and keep a human gate until data proves you can remove it.

### 7. Likely follow-up questions
- Q: Why were invoices drafts and not posted? A: I pushed for draft-only in the design phase (a written decision record) because the cost of a wrong payment was much higher than a small daily review effort.
- Q: What would you do differently? A: Test the carrier master assumption before go-live and add layout-change detection from the start.
- Q: How did the customer react? A: The CFO said the early call and the fact that the safety design worked increased her trust.

### 8. Skills shown
Ownership, calm incident response, AI safety design, customer communication, honest reflection, systems thinking.

---

## Common mistakes

- Spending most of the time on the situation and very little on your actions.
- Saying "we" for everything, so the interviewer cannot tell what you did.
- No numbers in the result.
- Picking a story where everything went perfectly. Interviewers learn more from how you handle problems.
- Memorizing a script word for word. Know the points, then tell it naturally.
