# POC / Pilot Success-Criteria Sheet

**When to use it:** Write this sheet before a proof of concept (POC) or pilot starts, and get the customer to sign it. A POC tests whether the idea can work at all, usually on sample data. A pilot tests whether it works for real users on real work, usually on a small slice of traffic. Both fail the same way: nobody agreed up front what "success" means, so the result becomes an argument. This sheet fixes the scope, the numbers, the dates, and who decides, so the go/no-go meeting is a check against a list, not a debate.

**Who reads it:** The customer sponsor (who makes the final call), the business owner whose team takes part, the customer's IT and security leads, your engagement manager, and your own engineers. Finance may read it if the next contract depends on the result.

**How long it should be:** 1 to 2 pages. If you need more, the pilot is probably too big.

---

## The template

### 1. Purpose and decision
*Good looks like: one sentence on what the pilot must prove, and the exact decision it feeds, with a date.*

- This pilot will prove: [the one claim you are testing]
- Decision it feeds: [expand / stop / change, and who decides]
- Decision date: [date of the go/no-go meeting]

### 2. Scope
*Good looks like: a small, named slice of real work. List what is out of scope just as clearly.*

- In scope: [users, data, volume, systems]
- Out of scope: [what will not be tested]
- Mode: [shadow (system runs, humans still do the work) / assisted (humans review system output) / live]

### 3. Baseline
*Good looks like: today's numbers, measured the same way you will measure the pilot, with a source for each.*

| Measure | Baseline | Source |
|---|---|---|
| [measure] | [value] | [where it comes from] |

### 4. Success criteria
*Good looks like: 3 to 6 criteria. Each one has a metric, a target, how it is measured, and whether it is a must-pass or a nice-to-have. Include at least one safety criterion.*

| # | Criterion | Target | How measured | Type |
|---|---|---|---|---|
| S1 | [metric] | [number] | [data source, sample size] | Must / Nice |

### 5. Stop rules
*Good looks like: conditions that pause the pilot right away, whatever the other numbers say.*

- [If X happens, we pause and do Y]

### 6. Timeline and checkpoints
*Good looks like: start date, checkpoints, and the decision meeting on the calendar before the pilot starts.*

| Date | Checkpoint |
|---|---|
| [date] | [what happens] |

### 7. Roles
*Good looks like: a named person for each job, especially who decides and who measures.*

| Role | Person |
|---|---|
| Decides go/no-go | [name] |
| Measures results | [name] |
| Runs the pilot day to day | [name] |

### 8. Customer commitments
*Good looks like: what the customer must provide, by when. Pilots usually fail on access and people, not technology.*

- [Commitment, owner, date]

### 9. Decision rules
*Good looks like: written before the results exist. Say what happens if all musts pass, if one fails, and if results are mixed.*

- All must-pass criteria met: [action]
- One must-pass missed by a small margin: [action]
- Any stop rule triggered or two musts missed: [action]

### 10. Results (fill in at the end)
*Good looks like: the same table as section 4 with an "Actual" column and a clear verdict. No new metrics invented after the fact.*

| # | Target | Actual | Met? |
|---|---|---|---|

Verdict: [Go / Go with conditions / No-go], signed by [name, date]

---

## Worked example: Northwind Logistics

*Written by Priya Shah (FDE, Atlas AI) on May 27, 2026 (week 4), signed by Dana Morales (CFO) and Luis Ortega (AP Manager) on May 29.*

### 1. Purpose and decision
- This pilot will prove: the assistant can extract carrier invoices accurately enough on Northwind's real traffic that clerks spend less time per invoice without letting a wrong value through.
- Decision it feeds: go live on 10 carriers in week 8 (June 22), then the top 40 carriers in week 9. Dana Morales decides, advised by Luis Ortega and Grace Kim.
- Decision date: go/no-go meeting Friday, June 19, 2026.

### 2. Scope
- In scope: 3 carriers (about 2,400 invoices over 2 weeks, PDF and scanned), 4 AP clerks, Northwind's cloud account in US East, Ledgerline test environment for drafts.
- Out of scope: EDI invoices (already automated), credit notes, multi-invoice PDFs, auto-release of payments, carriers outside the 3 chosen.
- Mode: shadow mode, June 8 to June 19. The system extracts every invoice; clerks still key by hand, then review the system's version side by side. Nothing the system produces reaches payment.

### 3. Baseline

| Measure | Baseline | Source |
|---|---|---|
| Handling time per invoice | 7 min | Time study, April 2026 |
| Critical field accuracy (manual keying) | 97.2% | Weekly audit sample |
| Keying error rate on disputed fields | 2.8% | Dispute log sample |
| Month-end backlog | up to 6 working days | AP queue report |

### 4. Success criteria

| # | Criterion | Target | How measured | Type |
|---|---|---|---|---|
| S1 | Critical field accuracy on the golden set | at least 97% | Eval script, 1,200-invoice golden set (see eval plan) | Must |
| S2 | Invoices needing no clerk edits (pilot carriers) | at least 50% | Review-screen logs, all pilot invoices | Must |
| S3 | Handling time with the assistant | under 4 min | Review-screen timer, 4 pilot clerks | Must |
| S4 | Invented values (hallucination rate) | under 0.1% of fields | Eval script plus clerk flags | Must |
| S5 | Clerks who would keep using it | at least 3 of 4 | Short survey, June 18 | Nice |
| S6 | Cost per invoice | under $0.08 | Cloud billing, pilot tag | Nice |

Why S2 and S3 are lower than the SOW targets (60% no-edit, under 3 minutes): shadow mode is the first contact with live traffic and the prompts are still being tuned. The SOW acceptance targets (D4) are measured later, over 2 weeks on the top 40 carriers.

### 5. Stop rules
- A system value would have changed a payment amount and no validation check caught it: pause, root-cause, and re-run the golden set before continuing.
- Any Northwind invoice data found outside the US East account: pause immediately and tell Omar Haddad.
- Pipeline down for more than 1 business day: pause and move the decision date.

### 6. Timeline and checkpoints

| Date | Checkpoint |
|---|---|
| May 29 | Sheet signed; 3 carriers and 4 clerks named |
| June 5 | Shadow mode switched on in test; golden-set run on prompt v5 (96.1%) |
| June 8 | Pilot starts |
| June 9 | Golden-set result on prompt v7 reported (S1); D2 accepted June 10 |
| June 12 | Mid-point check with Luis: numbers so far, clerk feedback |
| June 18 | Leadership demo; clerk survey |
| June 19 | Go/no-go meeting |

### 7. Roles

| Role | Person |
|---|---|
| Decides go/no-go | Dana Morales, CFO |
| Measures results | Priya Shah, with numbers checked by Grace Kim's team |
| Runs the pilot day to day | Luis Ortega, with senior clerk Beth Reyes |
| Security sign-off for live data | Omar Haddad |

### 8. Customer commitments
- 4 clerks with 50% of their time for 2 weeks (Luis Ortega, by June 5).
- Mailbox read access and Ledgerline test environment (Grace Kim, by June 3).
- Security review of the pilot setup complete (Omar Haddad, by June 5).

### 9. Decision rules
- All must-pass criteria met: go live on 10 carriers June 22, drafts only, with daily batch release by a clerk.
- One must-pass missed by a small margin (for example S2 at 45% to 49%): extend shadow mode by 1 week, same criteria, new decision date June 26.
- Any stop rule triggered or two musts missed: no-go; Priya and Luis present a fix plan and new dates within 5 business days.

### 10. Results

| # | Target | Actual | Met? |
|---|---|---|---|
| S1 | at least 97% | 97.4% (prompt v7) | Yes |
| S2 | at least 50% | 55% (52% in week 1, 58% in week 2) | Yes |
| S3 | under 4 min | 3.2 min | Yes |
| S4 | under 0.1% | 0.04% | Yes |
| S5 | at least 3 of 4 | 4 of 4 | Yes |
| S6 | under $0.08 | $0.05 | Yes |

Verdict: Go with conditions, signed by Dana Morales on June 19, 2026. Conditions: scanned invoices (95.9% accuracy) keep a lower confidence threshold so more of them go to review, and every new carrier starts on "review all" until 30 invoices pass with under 5% edits.

---

## Common mistakes

- Writing the success criteria after you see the results. Criteria written late always match the results, and the sponsor knows it.
- Only measuring the model (accuracy) and not the business outcome (time, backlog, money). A sponsor funds outcomes.
- No baseline, so "3.2 minutes" means nothing. Measure today the same way you will measure the pilot.
- A pilot so broad it never ends. Pick a small named slice and a fixed decision date.
- No stop rules, so a safety problem turns into a debate about averages.
