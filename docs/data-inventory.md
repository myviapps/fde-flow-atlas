# Data Source Inventory and Data-Quality Checklist

**When to use it:** Build the data inventory in week 1, as soon as you know which systems the project will read from or write to, and run the data-quality checklist before you build anything that depends on the data (labels, validators, dashboards). The inventory lists every data source: what it holds, who owns it, how you get it, what format it comes in, and how sensitive it is. The checklist then tests each source for the problems that break AI projects: missing values, wrong formats, duplicates, stale records, and labels that are not as correct as everyone thinks. Most "the model is wrong" bugs are really "the data was wrong" bugs, and this document is where you catch them early.

**Who reads it:** Your engineering team, the customer's data owners (the people who can fix a bad source), the customer's IT lead, and security or privacy reviewers who need to know where sensitive fields live. After handoff, the customer's engineers use it to understand every input the system depends on.

**How long it should be:** 2 to 4 pages. One table row per source, one checklist per important source. Put long profiling output (column statistics, sample rows) in an appendix or a linked notebook.

---

## The template

### 1. Header
*Good looks like: anyone can see how current the inventory is and who to ask.*

- Project: [name]
- Last updated: [date], by [name]
- Data owner contact on the customer side: [name, role]

### 2. Source inventory
*Good looks like: one row per source, including sources you only read once (like a historical export). Every source has a named owner who can fix it.*

| ID | Source | What it holds | Owner | Access method | Format | Volume and refresh | Sensitivity | Used for |
|---|---|---|---|---|---|---|---|---|
| S-01 | [system or file] | [entities and key fields] | [name] | [API, export, mailbox, database view] | [PDF, CSV, JSON, XML, Parquet] | [rows or files, how often it changes] | [public, internal, confidential, personal data] | [ingest, labels, validation, reporting] |

### 3. Field-level notes for critical fields
*Good looks like: for each field the system depends on, where it comes from, its expected format, and what "wrong" looks like.*

| Field | Source | Expected format | Known problems |
|---|---|---|---|
| [field] | [S-xx] | [for example ISO date YYYY-MM-DD, 3-letter currency code] | [what you have seen go wrong] |

### 4. Data-quality checklist
*Good looks like: each check is a test you actually ran, with a number and a date, not "looks fine". Mark each Pass, Fail, or Not run.*

| # | Check | How we tested | Result | Status |
|---|---|---|---|---|
| Q1 | Completeness: required fields are filled | [query or script] | [% missing] | [Pass / Fail / Not run] |
| Q2 | Validity: values match the expected format and allowed list | | | |
| Q3 | Uniqueness: no duplicate records or files | | | |
| Q4 | Consistency: the same fact agrees across sources | | | |
| Q5 | Accuracy: a sample checked against the real-world truth | | | |
| Q6 | Timeliness: data is fresh enough for the use | | | |
| Q7 | Representativeness: the sample covers the real mix (types, segments, edge cases) | | | |
| Q8 | Label quality: labels agree with a careful human check | | | |
| Q9 | Sensitive fields: known, located, and handled (masked, excluded, or approved) | | | |

### 5. Format and parsing rules
*Good looks like: the exact rules your code applies, so two engineers parse the same value the same way.*

- [Rule, for example "dates: store ISO 8601; parse day-first for carriers with European locale"]

### 6. Issues found and owners
*Good looks like: each problem has an owner who can fix the source, not just a workaround in your code.*

| ID | Issue | Source | Impact | Fix at source or workaround | Owner | Due |
|---|---|---|---|---|---|---|

### 7. Access and approvals
*Good looks like: who approved access to each source, and any conditions.*

- [Source]: approved by [name] on [date], conditions: [for example "no bank fields leave the account"]

---

## Worked example: Northwind Logistics

### 1. Header
- Project: Northwind invoice-extraction assistant
- Last updated: May 15, 2026 (end of week 2), by Priya Shah. Update added July 3 after the currency incident.
- Data owner contact on the customer side: Luis Ortega (AP data), Grace Kim (Ledgerline and IT systems)

### 2. Source inventory

| ID | Source | What it holds | Owner | Access method | Format | Volume and refresh | Sensitivity | Used for |
|---|---|---|---|---|---|---|---|---|
| S-01 | ap-invoices@ mailbox | Carrier invoice emails with PDF attachments | Luis Ortega | Mailbox connector, polled every 2 min | Email with PDF (60% text PDF, 25% scanned paper, some multi-page) | About 32,000 non-EDI invoices per month | Confidential; bank details on many invoices | Ingest |
| S-02 | Ledgerline shipments | Shipment number, carrier, lane, billing currency, expected charges | Grace Kim | Ledgerline REST API, read-only | JSON | About 45,000 shipments per month, real time | Internal | Validation |
| S-03 | Ledgerline carrier master | Carrier ID, name, default currency, payment terms, bank account | Luis Ortega | Nightly CSV export | CSV, UTF-8, comma separated | 412 active carriers, changes weekly | Confidential (bank details) | Validation |
| S-04 | Historical invoice export | 2,000 invoices with the values clerks keyed into Ledgerline | Luis Ortega | One-time export plus PDFs | CSV plus PDF files | 2,000 rows, delivered May 11 | Confidential | Labels for golden and dev sets |
| S-05 | Clerk edit log | Every change a clerk makes in the review screen | Priya Shah, then Ana Silva | Pipeline database table | Rows in `review_edit` | Grows daily from pilot (June 8) | Internal; contains clerk names | Evaluation, weekly audit |
| S-06 | Carrier dispute log | Disputes caused by keying errors | Luis Ortega | Spreadsheet export | XLSX | About 900 rows per year | Internal | Baseline error rate (2.8%) |

### 3. Field-level notes for critical fields

| Field | Source | Expected format | Known problems |
|---|---|---|---|
| Invoice date, due date | S-01 | Stored as ISO 8601 (2026-06-03) | European-lane carriers print day first (03/06/2026); some print month names |
| Currency | S-01, S-02, S-03 | ISO 4217 code (USD, EUR, CAD) | Symbol only ($) or code only in the footer; carrier master default may be wrong |
| Total, subtotal, tax | S-01 | Decimal, 2 places | European number format (1.234,56); totals printed without currency |
| Shipment number | S-01, S-02 | NW- plus 8 digits | Carriers add spaces or drop the prefix |
| Bank account | S-01, S-03 | Masked except last 4 in the review screen | Must not appear in logs or eval exports |

### 4. Data-quality checklist

| # | Check | How we tested | Result | Status |
|---|---|---|---|---|
| Q1 | Completeness | Profiled S-04 export | 1.8% of rows missing due date; all other critical fields filled | Pass (due date made optional in labels) |
| Q2 | Validity | Regex for shipment number; currency against ISO list | 6% of shipment numbers had spaces or no prefix | Pass after normalizing rule |
| Q3 | Uniqueness | File hash across 3 months of mailbox | 3.1% duplicate PDFs (carriers resend) | Pass; ingest removes duplicates by hash |
| Q4 | Consistency | Invoice shipment number exists in S-02 | 97.6% matched; rest are in the exceptions sheet | Pass |
| Q5 | Accuracy | Two clerks re-keyed 200 invoices from S-04 | 97.2% of keyed values correct (A-03) | Pass; disagreements fixed in golden set |
| Q6 | Timeliness | Compared S-03 export time with Ledgerline | Up to 24 hours old | Pass for validation |
| Q7 | Representativeness | Compared S-04 mix with 3 months of mailbox | Scanned share 22% vs 25% live; top 40 carriers 78% | Pass; added 30 scanned invoices |
| Q8 | Label quality | Same as Q5, plus weekly review of 50 eval mismatches | About 1 in 6 mismatches is a label error | Pass, ongoing |
| Q9 | Sensitive fields | Listed fields; checked logs and exports | Bank account in S-01 and S-03 | Pass; masked in review screen, excluded from eval exports |
| Q10 | Currency in S-03 matches real invoices | Compare carrier master currency with 6 months of invoices (A-04) | Not run by go-live | **Not run** |

*Update July 3: Q10 was run after the June 30 Blue Harbor Freight incident. 4 carriers had the wrong default currency in S-03, including Blue Harbor (listed USD, bills European lanes in EUR). All 4 fixed by Luis Ortega. Validator now checks currency against the lane billing currency in S-02 (ADR-005), not only S-03.*

### 5. Format and parsing rules
- Dates: stored as ISO 8601. Carriers flagged "European locale" in the carrier config are parsed day first. An ambiguous date (day 12 or lower) from a carrier with no locale flag goes to review.
- Numbers: detect decimal comma when the last separator is followed by exactly 2 digits.
- Currency: always a 3-letter code. A bare "$" is never enough; it must match the lane billing currency.
- Text encoding: all CSV exports read as UTF-8; carrier names with accents compared after Unicode normalization.

### 6. Issues found and owners

| ID | Issue | Source | Impact | Fix at source or workaround | Owner | Due |
|---|---|---|---|---|---|---|
| DQ-1 | Day-first dates parsed month first | S-01 | Wrong invoice and due dates for European lanes (bug I-03) | Workaround: locale rule in parser | Priya Shah | June 9 (done) |
| DQ-2 | Carrier master currency not checked | S-03 | Wrong currency could pass validation | Fix at source: Luis corrects S-03; plus lane check | Luis Ortega | July 3 (done) |
| DQ-3 | Due date missing in 1.8% of labels | S-04 | Smaller label set for due date | Workaround: due date excluded from exact-match on those rows | Priya Shah | May 20 (done) |

### 7. Access and approvals
- S-01 and S-04: approved by Grace Kim and Omar Haddad on May 7; conditions: data stays in Northwind's US East account, bank fields masked in any screen or export.
- S-02 and S-03: read-only service account approved by Grace Kim on May 6.

---

## Common mistakes

- Trusting labels because they come from the system of record. Keyed ERP values had a 2.8% error rate; check a sample before you call them ground truth.
- Checking each source alone and never checking that sources agree with each other. The currency incident came from one source that was never compared with another.
- Writing "Not run" and then forgetting it. Every "Not run" check is an open risk; copy it into the RAID log with a date.
- Fixing bad data only in your own code. If the source is wrong, tell the owner so the fix helps everyone and survives after you leave.
- Not writing down format rules, so two parts of the system parse "03/06/2026" differently.
