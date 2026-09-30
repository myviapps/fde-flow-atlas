# Support Model and Escalation Matrix

**When to use it:** Write this during the last third of an engagement, before go-live, so it is agreed and rehearsed before the first real ticket arrives. It states who answers which kind of problem (support tiers), how urgent each kind is (severity levels and response targets), who the FDE hands to and who they call, and when hypercare ends. Without it, the first outage becomes an argument about whose problem it is.

**Who reads it:** The customer's service desk and IT operations, their business owner, your own support and engineering leads, and the sponsor, who agrees the response targets. Users see a one-page version showing how to ask for help.

**How long it should be:** 2 to 3 pages. The escalation matrix must fit on a single screen.

---

## The template

### 1. Support tiers
*Good looks like: each tier says who they are, what they handle, and what they may not do. Include the tier the FDE sits in during hypercare.*

| Tier | Who | Handles | Hands up when |
|---|---|---|---|
| L1 | [customer service desk] | how-to, password, known issues from the knowledge base | cannot fix in [N] minutes |
| L2 | [customer IT or FDE during hypercare] | configuration, data, integration, reproduce and diagnose | needs a code or model change |
| L3 | [vendor engineering] | code and product defects | n/a |

### 2. Severity levels and targets
*Good looks like: definitions a tired person can apply in 10 seconds, with response and update times, and business hours stated.*

| Severity | Definition | First response | Update every | Hours |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |

### 3. How to raise a ticket
*Good looks like: one channel, a required minimum of information, and an emergency route for severity 1.*

- Channel: [portal, email, phone]
- Required information: [what happened, when, who, screenshot, ticket or invoice ID]
- Severity 1 route: [phone number or pager]

### 4. Escalation matrix
*Good looks like: names, time limits and a next step for each severity, including the business contact.*

| Severity | Step 1 | If no progress in | Step 2 | Then |
|---|---|---|---|---|

### 5. Triage checklist
*Good looks like: the same 6 questions every time, so tickets arrive with facts.*

- What did the user do, and what did they expect?
- When did it start, and did it ever work?
- Who and how many are affected?
- Can we reproduce it? With which input?
- What changed recently (release, data, settings)?
- Is there a workaround?

### 6. Knowledge base and deflection
*Good looks like: a rule for turning repeated tickets into articles and a target for how many tickets the articles absorb.*

- Article owner: [name]
- Rule: any issue seen 3 times becomes an article within [N] days

### 7. Hypercare and handover
*Good looks like: dates, exit criteria and the handover meeting.*

- Hypercare: [start to end date]
- FDE role during hypercare: [L2 with extended hours]
- Exit criteria: [numbers]
- Handover meeting: [date, attendees]

---

## Worked example: Brannock Logistics

### Support tiers

| Tier | Who | Handles | Hands up when |
|---|---|---|---|
| L1 | Brannock service desk (Marcus Lee, Ana Silva) | how-to, clerk access, known issues | 15 minutes without a fix |
| L2 | Brannock IT (Grace Kim's team); Priya Shah during hypercare | queue problems, ERP errors, wrong extractions, config | needs a model or code change |
| L3 | Atlas AI engineering (Arun Nair on call) | defects in the assistant | n/a |

### Severity levels and targets

| Severity | Definition | First response | Update every | Hours |
|---|---|---|---|---|
| 1 | Nobody can process invoices, or wrong amounts or currencies are being posted | 15 min | 30 min | 24 x 7 during month-end, else 07:00 to 19:00 |
| 2 | One major feature broken or one carrier failing, workaround exists | 1 hour | 4 hours | 07:00 to 19:00 |
| 3 | Minor problem, slow, cosmetic | 1 business day | 2 days | 07:00 to 19:00 |
| 4 | Question or improvement request | 2 business days | weekly | 07:00 to 19:00 |

### Escalation matrix

| Severity | Step 1 | No progress in | Step 2 | Then |
|---|---|---|---|---|
| 1 | Service desk pages L2 on call | 15 min | L2 declares incident and pages Atlas L3 | Grace Kim informs Dana Morales; Luis Ortega tells clerks to key manually |
| 2 | Service desk assigns L2 | 4 hours | L2 raises to Atlas L3 | Grace Kim reviews daily |
| 3 | Service desk queue | 2 days | L2 | Weekly review |

### Knowledge base
Ana Silva owns the articles. Any issue seen 3 times gets an article within 5 working days. Target: the first 5 articles (blurry scans, duplicates, GBP invoices, login, missing carrier) absorb 30% of how-to tickets.

### Hypercare and handover
Hypercare June 20 to July 3. Priya works as L2 with extended hours (07:00 to 20:00). Exit: no severity 1 or 2 for 5 working days and fewer than 15 tickets a week. Handover meeting July 10 with Grace, Marcus, Ana and Luis.

---

## Common mistakes

- Severity defined by who is shouting rather than by impact.
- No named humans. "IT" is not a person.
- Setting response targets the team cannot staff, especially outside business hours.
- Skipping the rehearsal. Test the escalation with a fake severity 1 before go-live.
- Ending hypercare on a date instead of on numbers.
