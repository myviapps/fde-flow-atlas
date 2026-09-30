# UAT Test Script and Sign-Off Sheet

**When to use it:** User acceptance testing (UAT) is the step where the customer's own people try the system on realistic tasks and say whether it does what they need. Write the script after the requirements are agreed and before go-live. It proves the system meets the customer's needs, which is different from your own testing, which proves the code works.

**Who reads it:** The business owner who signs, the testers (people who do the real work), the customer's IT lead, and your team who fix defects. The sign-off sheet is often filed as a contract or audit record.

**How long it should be:** The script is 1 line per test case, with 20 to 60 cases for a pilot. The sign-off sheet is 1 page.

---

## The template

### 1. Scope and entry criteria
*Good looks like: what is tested, what is out of scope, and what must be true before testing starts.*

- In scope: [features, roles, data]
- Out of scope: [items]
- Entry criteria: [test environment stable, test data loaded, testers trained for 30 minutes]
- Test window: [dates]

### 2. Testers and roles
*Good looks like: real end users, not managers only, and a named person who runs the sessions.*

| Name | Role | Cases assigned |
|---|---|---|

### 3. Test cases
*Good looks like: each case has an ID, a real task, exact steps, an expected result written before the test, and a requirement it proves. Include at least one bad-input case and one case where the system must decline or escalate.*

| ID | Requirement | Steps | Expected result | Actual | Pass / Fail | Defect ID |
|---|---|---|---|---|---|---|

### 4. Defect severity and triage
*Good looks like: agreed definitions and an agreed rule for what blocks go-live.*

- Critical: data loss, wrong money or safety impact. Blocks go-live.
- Major: task cannot be done without a workaround. Blocks go-live unless the sponsor accepts it.
- Minor: cosmetic or easy workaround. Does not block; fix later.
- Triage meeting: [daily, time, who decides severity]

### 5. Defect log
| ID | Case | Description | Severity | Owner | Status | Retest result |
|---|---|---|---|---|---|---|

### 6. Sign-off sheet
*Good looks like: a statement of what was tested and what was accepted, with names, dates and any conditions.*

- Results: [passed / failed / blocked counts]
- Open defects at sign-off: [list with severity]
- Conditions: [e.g. minor defects fixed within 30 days]
- Signed: [business owner, IT lead, Atlas AI engineer, dates]

---

## Worked example: Brannock Logistics

UAT for the invoice assistant, June 8 to 12, 2026, in the Brannock test environment with 200 real (redacted) invoices from the top 40 carriers. Run by Priya Shah. Testers: Luis Ortega and 4 AP clerks (Mei, Tomas, Ruth and Sam).

### Sample test cases

| ID | Requirement | Steps | Expected result | Result |
|---|---|---|---|---|
| UAT-01 | Extract amount and currency | Open invoice 118 (Rotterdam Freight, EUR) in the review screen | Amount 4,210.00 and currency EUR shown | Pass |
| UAT-07 | Uncertain invoices go to review | Send a blurry scan | Invoice appears in review queue with a low-confidence flag | Pass |
| UAT-12 | Duplicate detection | Send the same invoice twice | Second copy is blocked with message "Possible duplicate" | Pass |
| UAT-19 | Bad input | Send a PDF with no text | System says "Could not read" and routes to a clerk | Pass |
| UAT-23 | Currency handling | Send a GBP invoice | Draft shows GBP, not the default USD | Fail (UAT-D3) |
| UAT-30 | Human approval | Try to post a draft without clerk approval | Post is blocked | Pass |
| UAT-38 | Audit trail | Approve an invoice and open history | Shows who approved, when, and the original values | Pass |

### Defect log (extract)

| ID | Case | Description | Severity | Owner | Status | Retest |
|---|---|---|---|---|---|---|
| UAT-D3 | UAT-23 | GBP invoices show USD when the invoice has no currency symbol | Critical | Priya | Fixed June 10 | Pass June 11 |
| UAT-D5 | UAT-31 | Review screen column header truncated on small monitors | Minor | Arun Nair | Open | Not needed |

### Sign-off sheet
- Results: 42 cases run. 41 passed first time; UAT-23 failed, was fixed and passed on retest, so all 42 now pass. 0 blocked. One minor defect remains open.
- Open defects: UAT-D5, minor.
- Conditions: UAT-D5 fixed within 30 days after go-live.
- Signed: Luis Ortega (AP Manager), June 12; Grace Kim (IT Lead), June 12; Priya Shah (Atlas AI), June 12.

---

## Common mistakes

- Writing the expected result after seeing the output. Write it before the test.
- Using only happy-path cases. Real users send blurry scans and duplicates.
- Testers who are not real users. Managers approve what clerks then refuse to use.
- No rule for what blocks go-live, so severity is argued case by case in front of the sponsor.
- Signing off with open critical defects "to keep the date".
