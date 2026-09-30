# Annotation Guidelines

**When to use it:** Use this before anyone labels a single item for a project: when you build a golden set to test an AI system, when you need training data for a classifier, or when people will review the model's outputs after launch. The guideline is the written rulebook that tells every annotator (the person adding a label) exactly how to decide. Most disagreements between labelers come from unclear rules, not careless people, so this document is where labeling quality is won or lost. Write version 1 before the pilot, then improve it after every round of measured agreement.

**Who reads it:** The annotators (the customer's staff, a vendor team or you); the domain expert who owns the meaning of each label and settles disputes; the FDE who measures agreement and builds the golden set; and the engineer who will use the labels in evals or training.

**How long it should be:** 2 to 4 pages for 4 to 8 labels. Each label needs a definition, examples and edge cases, but if annotators need more than a few minutes to find the answer to a question, the document is too long or badly organised.

---

## The template

### 1. Purpose and use of the labels
*Good looks like: one or two sentences saying what the labels will be used for, so annotators can decide sensibly in cases the rules do not cover.*

- Task: [what is being labeled, for example "the intent of each incoming email"]
- The labels will be used to: [test the model / train a classifier / route items in production]
- Cost of a wrong label: [what goes wrong if a label is wrong]

### 2. The items
*Good looks like: annotators know exactly what one item is and what they can see when labeling.*

- One item is: [an email, a page, a call, a model reply]
- What the annotator sees: [text only / text and metadata / the model's suggested label]
- Sampling: [how items were chosen and how many will be labeled]

### 3. The labels
*Good looks like: every label has a plain definition, at least two clear examples and one near-miss that looks like it but is not. Include an "other" or "unclear" label so nobody is forced to guess.*

| Label | Definition | Clear examples | Near-miss (not this label) |
|---|---|---|---|
| [label name] | [one sentence] | ["example 1", "example 2"] | ["example that belongs elsewhere, and where"] |

### 4. Decision order for items that fit two labels
*Good looks like: a short numbered list that settles overlaps the same way every time. If two labels overlap often, this is the most valuable section.*

1. [If X, choose label A, even if Y is also present]
2. [Otherwise, if ...]

### 5. Edge cases
*Good looks like: every case where a labeler hesitated during your practice run is here, with the answer and the reason.*

| Situation | Label | Reason |
|---|---|---|
| [empty, spam, wrong language, two questions in one item, missing information] | [label] | [one line] |

### 6. Process
*Good looks like: annotators know how many items to do, how to ask a question, and what happens to disagreements.*

- Batch size and deadline: [items per person per day, due date]
- Questions: [where to ask, who answers, and how answers are added to this document]
- Overlap: [share of items labeled by two people, for example 20%]
- Gold questions: [share of hidden items with known answers, and the pass mark]
- Disagreements: [an adjudicator, a named expert, decides; the decision and reason are recorded]

### 7. Quality targets
*Good looks like: numbers agreed before labeling starts, with a rule for what happens when they are missed.*

| Measure | Target | If missed |
|---|---|---|
| Percent agreement between two annotators | [for example 90%] | [review disagreements, fix the guideline] |
| Cohen's kappa (agreement beyond chance) | [for example 0.80] | [same] |
| Gold question score per annotator | [for example 90%] | [retrain, then re-check that person's work] |

### 8. Tools and format
*Good looks like: the annotator can start without a call.*

- Tool: [spreadsheet, Label Studio, in-house screen]
- Fields saved with each label: [item id, label, annotator, timestamp, guideline version, optional comment]
- Export format: [CSV or JSON, one row per label]

### 9. Version history
*Good looks like: every change is dated and explains why, and every saved label carries the guideline version it was made under.*

| Version | Date | What changed and why | Approved by |
|---|---|---|---|
| [v1] | [date] | [first draft] | [name] |

---

## Worked example: Brannock Logistics

Context: Brannock's accounts payable inbox gets about 4,100 carrier emails a month. Atlas AI is building the Carrier Payment Status email agent (see the agent SOP). Before building it, Priya Shah, Forward Deployed Engineer at Atlas AI, needed a golden set of 300 real emails labeled by intent, to measure how well a model routes each email. Luis Ortega, the AP Manager, is the domain expert. Two AP clerks, Tomas and Mei, did the labeling.

### 1. Purpose and use of the labels
- Task: label the intent of each incoming carrier email.
- The labels will be used to: test the routing step of the email agent, and to set the threshold for handing an email to a human.
- Cost of a wrong label: a bank change email labeled as payment status would be answered by the agent instead of Vendor Security. That is a fraud risk, so bank_change errors matter most.

### 2. The items
- One item is: one email, subject and body, with signatures and quoted older messages removed.
- What the annotator sees: the cleaned text only. They do not see the model's guess, so they are not nudged.
- Sampling: 300 emails drawn evenly across three weeks, with extra bank-related emails added so the rare label has at least 20 examples. Names and account numbers are masked.

### 3. The labels

| Label | Definition | Clear examples | Near-miss (not this label) |
|---|---|---|---|
| payment_status | Asks whether or when an invoice will be or was paid | "Has BL-22817 been paid?" | "You paid BL-22817 too little" (that is dispute) |
| remittance | Asks for a copy of the payment advice | "Please resend last week's remittance" | "Where is our payment?" (payment_status) |
| dispute | Says an amount, deduction or date is wrong | "You short-paid BL-21990 by 300 dollars" | "Was BL-21990 paid in full?" (payment_status, it is a question, not a claim) |
| bank_change | Mentions changing, confirming or updating bank details | "Our account number has changed" | "Which account did you pay into?" (bank_change, see edge cases) |
| other | Anything else, or no intent | "Can you quote a new lane?" | Any email with a clear intent above |

### 4. Decision order for items that fit two labels
1. If the email mentions bank details in any way, choose bank_change, even if it also asks about payment status.
2. Otherwise, if it says an amount or date is wrong, choose dispute.
3. Otherwise, if it asks for a document, choose remittance.
4. Otherwise, if it asks about payment, choose payment_status.
5. Otherwise, other.

### 5. Edge cases

| Situation | Label | Reason |
|---|---|---|
| Two questions: status of one invoice and a remittance copy | The first in the order above that applies (remittance ranks above payment_status) | One label per email; the order decides it |
| Email in Portuguese | Label by meaning, add comment "lang" | The agent will hand these off later, but routing should still be measured |
| Blank body with an attachment | other, add comment "attachment only" | Cannot tell intent |
| "Payment not received, please advise" | payment_status | No claim that an amount is wrong |
| "You paid us less than the invoice" | dispute | A claim about the amount |

### 6. Process
- Batch size and deadline: 60 emails per person per day, done in 5 days.
- Questions: post in the shared thread; Priya answers within a day, and Luis rules on anything about policy. Each answer is added to section 5 the same day.
- Overlap: both clerks labeled 100 of the 300 emails, the rest were split. Priya added 15 gold emails with answers Luis had confirmed.
- Disagreements: Luis adjudicates and writes one line of reason. Reasons that repeat become new rules.

### 7. Quality targets

| Measure | Target | If missed |
|---|---|---|
| Percent agreement | 90% | Read every disagreement, fix the guideline, redo a fresh 100 |
| Cohen's kappa | 0.80 | Same |
| Gold question score per person | 90% | Talk through the misses, recheck that person's last batch |

Round 1 results on 100 shared emails with guideline v1: 83% agreement and kappa 0.76. Of the 17 disagreements, 8 were payment_status versus dispute ("Payment not received" and "payment short"). Guideline v2 added the dispute wording rule and the decision order above. Round 2 on 100 new emails: 93% agreement and kappa 0.90. Both targets were met, so full labeling went ahead.

### 8. Tools and format
- Tool: a shared spreadsheet with dropdown labels (Label Studio was considered for the next project with more than 2,000 items).
- Fields saved with each label: email id, label, annotator, timestamp, guideline version, comment.
- Export format: CSV, one row per label, joined to the adjudicated final label.

### 9. Version history

| Version | Date | What changed and why | Approved by |
|---|---|---|---|
| v1 | October 6, 2026 | First draft from the AP inquiries SOP and 30 emails Priya labeled herself | Luis Ortega |
| v2 | October 9, 2026 | Added decision order, dispute wording rule, five edge cases after 17 disagreements in round 1 | Luis Ortega |

---

## Common mistakes

- Writing labels without near-miss examples. Annotators can spot the clear cases; disagreements happen at the borders, so show the borders.
- Trusting percent agreement alone. If 90% of items belong to one label, two people guessing the same label every time score 90% while agreeing on nothing useful. Report kappa too and look at each label separately.
- Letting annotators see the model's suggested label. They will accept it too often and the golden set will flatter the model.
- Changing the guideline without a version number, so no one knows which labels were made under which rules.
- Skipping adjudication and just taking a majority or the first labeler's answer. Disagreements are the most useful information you have: each one shows a rule that is missing.
