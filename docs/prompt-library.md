# Team Prompt Library and Usage Guide

**When to use it:** Use this when a customer team has started using an AI assistant and each person keeps their own private prompts, with uneven results. A prompt library is a shared, tested collection of prompts for the team's real tasks, plus a short guide on how to use them and when not to trust the output. Set it up during enablement (the training and adoption phase after go-live), then keep it alive with an owner and a review date. Re-test it whenever the model or the task changes.

**Who reads it:** The everyday users on the customer's team; the "champions" (respected users who help colleagues); the team lead who owns the library; the customer's Center of Excellence or IT owner if there is one; and the FDE who sets it up and hands it over.

**How long it should be:** A one-page usage guide plus 8 to 12 library entries of about half a page each. Start small. Ten tested entries used weekly beat a hundred untested ones nobody opens.

---

## The template

### Part A. Usage guide (one page at the front of the library)

#### 1. What this library is for
*Good looks like: two sentences on which tasks it covers and who it is for.*

- Covers: [the team's recurring tasks, for example "replying to customer emails, summarising call notes"]
- For: [team names and roles]

#### 2. How to use an entry
*Good looks like: five steps or fewer that a new person can follow the first day.*

1. [Find the entry by task or tag]
2. [Copy the prompt and replace every {placeholder} with your own text]
3. [Read the output against the "check the output" list]
4. [Edit before you send or save; you are responsible for what leaves your desk]
5. [Tell the owner if it fails, using the feedback form or channel]

#### 3. Rules for what goes in a prompt
*Good looks like: plain, concrete data rules the team can remember.*

- Never paste: [customer bank details, passwords, health records, anything marked confidential]
- Allowed with care: [names of customers, masked where possible]
- Always keep human review for: [anything sent outside the company, anything about money, law or safety]

#### 4. When to trust the output and when to check
*Good looks like: a short table by task risk, so users know how much checking each task needs.*

| Task type | Risk | How much to check |
|---|---|---|
| [drafting, summarising your own notes] | [Low] | [Skim for errors] |
| [answers quoting policy, numbers or dates] | [Medium] | [Check every number and quote against the source] |
| [anything sent to customers or affecting money] | [High] | [A second person reviews] |

#### 5. Ownership and review
*Good looks like: a named owner, a review rhythm and a way to suggest changes.*

- Library owner: [name, role]
- Review: [every 3 months and after any model change]
- Suggest a change: [where]

### Part B. Library entry (copy this block for each prompt)

#### Entry [ID]: [task name]
*Good looks like: one entry is complete enough that a stranger can use it without asking anyone.*

- Task in plain words: [what you want done and for whom]
- Team and tags: [team, tags]
- Owner and last tested: [name, date, model version]
- When to use / when not to use: [conditions]
- **The prompt:**

```
[The prompt text, with placeholders such as {customer_email} and {policy_text}]
```

- Example input: [an anonymised real example]
- Example good output: [what a good result looks like]
- Check the output: [3 to 5 checks, for example "every date matches the source"]
- Known problems: [failure cases seen so far]
- Version history: [date, what changed]

### Part C. Library index
*Good looks like: one table that lets people find the right entry in under a minute.*

| ID | Task | Team | Risk | Owner | Last tested |
|---|---|---|---|---|---|
| [P-01] | [task] | [team] | [Low/Medium/High] | [name] | [date] |

---

## Worked example: Brannock Logistics

Context: two months after the invoice-extraction assistant went live, Brannock's accounts payable (AP) team of 14 also used a general chat assistant for emails and notes, each in their own way. Luis Ortega, the AP Manager, asked Priya Shah, Forward Deployed Engineer at Atlas AI, to set up a shared library during enablement. Priya interviewed four clerks, read a month of usage, and picked the ten most common tasks. Ana Silva from Brannock IT became the library owner after handoff.

### Part A. Usage guide

#### 1. What this library is for
- Covers: the recurring AP tasks of drafting replies to carriers, summarising invoice exceptions, and preparing month-end notes.
- For: the 14-person AP team and the two AP leads.

#### 2. How to use an entry
1. Find the entry in the index by task.
2. Copy the prompt into the assistant and replace each {placeholder} with your text. Never leave a placeholder in.
3. Read the output against the "check the output" list in the entry.
4. Edit it. You are the sender, not the assistant.
5. If it fails, post the input (masked) and output in the AP-assistant channel. Ana reads it every Friday.

#### 3. Rules for what goes in a prompt
- Never paste: bank account numbers, login details, tax IDs.
- Allowed with care: carrier company names and invoice numbers.
- Always keep human review for: anything sent to a carrier, and anything about a dispute.

#### 4. When to trust the output and when to check

| Task type | Risk | How much to check |
|---|---|---|
| Summarising your own meeting notes | Low | Skim for missing actions |
| Explaining an invoice exception | Medium | Check every amount and invoice number against Ledgerline |
| Emails to carriers | High | Lead reads dispute and bank-related replies before sending |

#### 5. Ownership and review
- Library owner: Ana Silva, Brannock IT.
- Review: every 3 months, and re-test all entries when the assistant's model changes.
- Suggest a change: the AP-assistant channel, tag the entry ID.

### Part B. Sample entry

#### Entry P-03: Reply to a carrier asking about payment status
- Task in plain words: write a short, polite email telling a carrier the status of an invoice, using the status we looked up.
- Team and tags: AP, email, carriers.
- Owner and last tested: Mei Tanaka, November 12, 2026, tested on 12 real emails with the current model.
- When to use / when not to use: use when the carrier only asks about status. Do not use for disputes or bank detail changes; hand those to the leads.
- **The prompt:**

```
You write emails for Brannock Logistics Accounts Payable.
Write a short, polite reply to the carrier email below, in the same language as the email (English or Spanish only).
Use ONLY the facts in STATUS. If STATUS says "in review", do not give any payment date.
Do not mention bank details, internal systems or other carriers.
Sign as "Brannock Accounts Payable".

CARRIER EMAIL:
{carrier_email}

STATUS (from the payment system):
{status_text}
```

- Example input: carrier email "Has invoice BL-22817 been paid?"; status "Paid on November 3, reference PAY-88412".
- Example good output: "Hello, invoice BL-22817 was paid on November 3, payment reference PAY-88412. Please tell us if you do not see it by November 7. Brannock Accounts Payable."
- Check the output: the invoice number and date match the status; no date is given when the status is "in review"; no bank details appear; the language matches.
- Known problems: with a status of "scheduled" the assistant sometimes says "will arrive on" instead of "is scheduled for". Fixed in v2 by adding "scheduled" wording to the prompt.
- Version history: v1 November 5; v2 November 12 (scheduled wording).

### Part C. Library index

| ID | Task | Team | Risk | Owner | Last tested |
|---|---|---|---|---|---|
| P-01 | Summarise an invoice exception list | AP | Medium | Ana Silva | Nov 12, 2026 |
| P-02 | Turn meeting notes into action items | AP | Low | Ana Silva | Nov 12, 2026 |
| P-03 | Reply to a carrier asking for payment status | AP | High | Mei Tanaka | Nov 12, 2026 |
| P-04 | Explain a short payment in plain words (for internal use) | AP | Medium | Tomas Reyes | Nov 12, 2026 |
| P-05 | Draft the month-end accruals note | Finance | Medium | Luis Ortega | Nov 12, 2026 |

Result after eight weeks: 11 of 14 clerks used the library weekly, average time to reply to a status email fell from 6 minutes to 2, and Ana logged 9 failure reports that led to 4 prompt fixes.

---

## Common mistakes

- Filling the library with prompts nobody tested. Test each on several real examples before it is published.
- Giving no "check the output" list. Users then either trust everything or nothing.
- Using generic tips instead of the team's own anonymised examples. People remember what looks like their own work.
- Having no owner or review date, so the library goes stale after the next model update.
- Letting confidential text into example inputs. Mask names, numbers and account details before publishing.
