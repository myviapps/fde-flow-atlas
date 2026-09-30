# Customer Incident Notice: Initial, Update and Resolved

**When to use it:** Use these three short messages whenever something you deployed breaks in a way the customer notices. Send the initial notice as soon as you know there is a real problem, updates on a fixed schedule, and a resolved notice when it is fixed and checked. Customers forgive outages; they do not forgive silence or surprises.

**Who reads it:** The customer's sponsor and business owner (who need impact and time), their IT and service desk (who need facts to answer users), and sometimes their customers. Write so a non-technical executive understands the first two lines.

**How long it should be:** Each notice is 5 to 10 lines. The initial notice should take under 10 minutes to write once you have the template in front of you.

---

## The template

### Message 1: Initial notice
*Good looks like: sent within the agreed time (often 15 to 30 minutes from detection). States what users see, who is affected, what you are doing, and exactly when the next update will come. Does not guess the cause.*

Subject: [Product] incident [ID]: [plain description of what users see]

- Status: Investigating
- Started: [time, timezone]
- Impact: [who is affected, what they cannot do, workaround if any]
- What we know: [facts only]
- What we are doing: [current actions]
- Next update: by [clock time]
- Contact: [name and channel]

### Message 2: Update
*Good looks like: sent on time even if nothing changed. Says what changed since the last note, the current best understanding, and the next update time.*

Subject: Update [number], incident [ID]

- Status: [Investigating / Identified / Mitigating / Monitoring]
- Since last update: [what changed]
- Impact now: [current scope]
- Cause: [known / not yet known; short plain statement]
- Next steps: [actions with owners]
- Next update: by [clock time]

### Message 3: Resolved
*Good looks like: says it is fixed, how you checked, how long it lasted, what to do about affected work, and when the review will be shared. No blame.*

Subject: Resolved: incident [ID]

- Status: Resolved at [time]; total duration [minutes]
- Impact summary: [who, how many, what data]
- Cause in one paragraph: [plain language]
- Fix and checks: [what changed, how verified]
- Actions for the customer: [reprocess items, check records]
- Next: blameless review shared by [date]

### Timing rule
*Good looks like: a table agreed before any incident.*

| Severity | Initial notice | Update every | Resolved notice |
|---|---|---|---|

---

## Worked example: Brannock Logistics

On June 30, 2026, a change to how the assistant read invoices without a currency symbol caused a small number of GBP invoices to draft in USD. Priya Shah wrote the notices for Dana Morales, Grace Kim and Luis Ortega.

### Message 1: Initial notice (10:20)

Subject: Invoice assistant incident INC-0630: some drafts show the wrong currency

- Status: Investigating
- Started: 09:40 Eastern
- Impact: Some invoices from UK carriers are being drafted in USD instead of GBP. Drafts are not posted until a clerk approves them, so no payments have been made. Clerks should check the currency on every UK carrier invoice until we tell you otherwise.
- What we know: The issue began after release 1.5 at 09:30. It affects invoices with no currency symbol.
- What we are doing: We are rolling back to release 1.4 now and will then check all drafts created since 09:30.
- Next update: by 10:50 Eastern
- Contact: Priya Shah, #ap-ops or 555-0142

### Message 2: Update (10:50)

Subject: Update 1, incident INC-0630

- Status: Mitigating
- Since last update: Rollback finished at 10:35. New invoices now show the right currency.
- Impact now: 23 drafts created between 09:40 and 10:35 have the wrong currency. None were approved or posted.
- Cause: A change in how we detect the currency when the invoice has no symbol.
- Next steps: We will correct the 23 drafts and send you a list. Luis's team should not approve any of them until then.
- Next update: by 11:30 Eastern

### Message 3: Resolved (12:10)

Subject: Resolved: incident INC-0630

- Status: Resolved at 12:05; duration 2 hours 25 minutes
- Impact summary: 23 GBP invoice drafts showed USD. No payments were made. Clerks caught 4 of them before we finished.
- Cause: Release 1.5 changed currency detection and our test set had no invoices without a currency symbol.
- Fix and checks: We rolled back, corrected the 23 drafts, and checked 200 recent invoices from UK carriers: all correct.
- Actions for the customer: Please approve the 23 corrected drafts using the attached list.
- Next: A blameless review will be shared by July 3.

---

## Common mistakes

- Waiting until you know the cause. Send the first notice with what you know and say what you do not.
- Missing the promised update time. If you have nothing new, send "no change, next update at ...".
- Blame or jargon in the customer notice. Keep it plain and factual.
- Promising a fix time you cannot control. Promise the next update time instead.
- Forgetting the resolved notice, so the customer never learns it is safe to trust the system again.
