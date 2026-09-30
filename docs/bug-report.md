# Reproducible Bug Report

**When to use it:** Write a bug report whenever you find behavior that is wrong and you cannot fix it in the next 10 minutes, or when someone else will fix it. A good bug report lets another engineer see the bug happen on their own machine, from your steps alone, without asking you anything. That is what "reproducible" means. On FDE projects, bugs often cross team lines (your product, the customer's system, a model provider), so a clear report is also how you get help from people who do not know your project. The discipline of writing one often finds the cause before you finish: to write "minimal steps", you must shrink the problem.

**Who reads it:** The engineer who will fix it (maybe you in a week, maybe the customer's team after handoff), your product or support team if it is a product bug, and the project owner who decides the priority.

**How long it should be:** Half a page to 2 pages. The steps to reproduce and the expected vs actual results are the most important parts. Attach logs and files instead of pasting pages of them.

---

## The template

### 1. Title
*Good looks like: what is wrong, where, and under which condition, in one line. A reader should know the bug from the title alone.*

[Component]: [wrong behavior] when [condition]

### 2. Summary and impact
*Good looks like: 2 to 3 sentences, with who is affected and how much.*

- Summary: [what happens]
- Impact: [users, data, money, volume]
- Severity: [1 critical / 2 major / 3 minor], Priority: [when it must be fixed]

### 3. Environment
*Good looks like: exact versions, so the fixer runs the same thing.*

- System and version: [build, prompt, model, config]
- Where: [dev, staging, production]
- Data: [input file IDs, never real secrets or personal data in the ticket]

### 4. Steps to reproduce
*Good looks like: numbered, minimal, copy-pasteable. The fewest steps that still show the bug.*

1. [Step]
2. [Step]

### 5. Expected result
*Good looks like: what should happen, with a reason (a spec, a document, a rule).*

[Expected]

### 6. Actual result
*Good looks like: what did happen, exactly, including error text and values.*

[Actual]

### 7. Frequency and scope
*Good looks like: how often it happens, and where it does not happen. Where it does not happen is a big clue.*

- Happens: [always / sometimes, x of y tries]
- Does not happen when: [condition]

### 8. Evidence
*Good looks like: logs, screenshots, sample files, with times and IDs.*

- [Attachment]

### 9. Notes and suspected cause
*Good looks like: your best guess, clearly marked as a guess, and any workaround.*

- Suspected cause: [guess]
- Workaround: [if any]

### 10. Resolution
*Good looks like: filled in by the fixer: cause, fix, test added, and how it was verified.*

- Root cause: [cause]
- Fix: [link]
- Regression test: [test name]
- Verified by: [name, how, date]

---

## Worked example: Northwind Logistics

### 1. Title
Date normalizer: invoice date and due date swapped day and month for day-first (European) invoices when the day is 12 or lower

### 2. Summary and impact
- Summary: Invoices from European-lane carriers print dates as day/month/year (03/06/2026 means June 3). The normalizer reads them as month/day/year, so the date becomes March 6. The model extracts the text correctly; the error happens after extraction.
- Impact: 71 of 1,200 golden-set invoices (from 9 carriers) have wrong invoice or due dates, 142 critical fields in total, about 1.0 point of critical field accuracy. In production, a wrong due date could make an invoice look months overdue, or hide one that is about to incur a late-payment penalty.
- Severity: 2 (wrong financial data, would be caught in review only if the clerk noticed). Priority: fix before the D2 evaluation report (due week 5).

### 3. Environment
- System and version: pipeline commit a41c9e2, prompt v5, date normalizer in `pipeline/normalize/dates.py`
- Where: dev, and the golden-set eval run of June 2, 2026
- Data: golden-set invoices GS-0117, GS-0448, GS-0902 (Blue Harbor Freight, Rotterdam to Chicago lane)

### 4. Steps to reproduce
1. Check out commit a41c9e2.
2. Run the unit check:
   ```
   python -c "from pipeline.normalize.dates import normalize_date; print(normalize_date('03/06/2026', carrier_id='CAR-00187'))"
   ```
3. Or run the eval on one invoice: `make eval SET=golden VERSION=v5 IDS=GS-0117`.

### 5. Expected result
`2026-06-03`. The invoice shows "Invoice date: 03/06/2026" and the label in Ledgerline (keyed by a clerk) is June 3, 2026. The data inventory rule says carriers with a European locale are parsed day first.

### 6. Actual result
`2026-03-06`. In the eval, GS-0117 shows `invoice_date: expected 2026-06-03, got 2026-03-06` and `due_date: expected 2026-07-03, got 2026-03-07`.

### 7. Frequency and scope
- Happens: always, for day-first dates where the day is 1 to 12 (71 of 71 such invoices in the golden set).
- Does not happen when: the day is 13 or higher (for example 17/06/2026). Then parsing fails, the field gets confidence 0, and the invoice goes to review. This is why the bug was hidden: the obvious half of the cases went to clerks, and only the silent half produced wrong values.
- Also fine for: US carriers (month first) and dates with month names ("3 June 2026").

### 8. Evidence
- Eval mismatch export for June 2 run, filtered to date fields (CSV attached, bank fields removed).
- Screenshot of GS-0117 invoice header.
- Carrier config showing CAR-00187 has no locale set.

### 9. Notes and suspected cause
- Suspected cause (guess): `normalize_date` calls the date parser with its default month-first setting and ignores the carrier's locale; also the carrier config has no locale for 9 carriers.
- Workaround: none safe in production; not live yet.

Reported by Ana Silva, June 2, 2026, while reviewing eval mismatches with Priya Shah. Assigned to Priya Shah.

### 10. Resolution
- Root cause: two faults together. (1) The normalizer did not pass a day-first flag to the parser. (2) The carrier config had no locale field, so there was nothing to pass. The eval did not catch it earlier because the dev set had only 11 European-lane invoices.
- Fix: added `locale` to carrier config (set for 9 carriers by Luis Ortega); normalizer parses day first for European locale; an ambiguous date (day 12 or lower) from a carrier with no locale now goes to review instead of guessing. Commit 5d20f7b.
- Regression test: `test_dates.py::test_day_first_ambiguous`, `test_day_first_unambiguous`, `test_no_locale_ambiguous_goes_to_review`; 40 European-lane invoices added to the dev set.
- Verified by: Ana Silva re-ran the golden set on June 9. All 142 date fields correct; critical field accuracy up about 1.0 point, part of the move from 96.1% to 97.4% reported with D2. Closed as RAID issue I-03 on June 9.

---

## Common mistakes

- Titles like "Dates broken" or "Model is wrong". Say what, where, and when.
- Steps that only work on your laptop ("run my script"), or that need a 20-minute setup the fixer does not have.
- Leaving out where the bug does not happen. The day-13 case above was the key clue.
- Mixing your guess with the facts. Keep "what I saw" and "what I think" separate, so the fixer is not misled.
- Pasting real personal or financial data (bank details, customer names) into a ticket system that many people can read.
