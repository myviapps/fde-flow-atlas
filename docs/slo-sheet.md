# SLI/SLO Definition Sheet with Error Budget Policy

**When to use it:** Write this sheet before go-live, when you and the customer agree on what "working well" means for a production system, and review it every month or quarter. It uses three ideas from site reliability engineering. A service level indicator (SLI) is a measurement of something users care about, written as "good events divided by all events", for example "share of invoices ready within 5 minutes". A service level objective (SLO) is the target for that SLI over a time window, for example "99% over 28 days". The error budget is the amount of failure the SLO allows (here, 1% of invoices may be late). The error budget policy says what the team does when the budget is being used up, such as pausing risky changes. Together they replace arguments like "is the system reliable enough?" with a number both sides agreed on in advance.

**Who reads it:** The engineers who run the system (yours, then the customer's), the customer's IT lead, the business owner who agrees on targets, and on-call staff who get alerted when budgets burn too fast.

**How long it should be:** 2 to 3 pages. One row per SLO. Most systems need 3 to 5 SLOs; more than that and nobody watches them.

---

## The template

### 1. Service and users
*Good looks like: who depends on the system and which hours matter. SLOs should measure what those users feel.*

- Service: [name]
- Users and what they need: [who, what "good" means to them]
- Measurement hours: [24/7 or business hours]
- Window: [for example rolling 28 days]

### 2. SLI and SLO table
*Good looks like: each SLI is good events over valid events, measured at a named source, close to the user. Targets come from user needs and past data, not from "as many nines as possible".*

| # | SLI (good / valid events) | Source | SLO target | Error budget in the window |
|---|---|---|---|---|
| 1 | [good events] / [valid events] | [logs, probe, dashboard] | [e.g. 99%] | [e.g. 295 late invoices] |

### 3. What does not count
*Good looks like: clear exclusions agreed in advance, so nobody argues after an incident.*

- [Exclusion, for example planned maintenance announced 2 days ahead]

### 4. Alerting on burn rate
*Good looks like: alerts fire when the budget is being used too fast, not on every single error. Use a fast alert (page) and a slow alert (ticket).*

| SLO | Fast burn (page) | Slow burn (ticket) |
|---|---|---|

### 5. Error budget policy
*Good looks like: specific actions at specific levels of budget used, agreed and signed by both the engineering and business owners before any incident.*

| Budget used in window | What we do |
|---|---|
| Under 50% | [normal] |
| 50% to 100% | [slow down] |
| Over 100% | [freeze] |
| One incident uses over 20% | [post-mortem] |

### 6. Current status
*Good looks like: the latest numbers and budget used, reviewed on a fixed schedule.*

| # | SLO | Actual | Budget used | Notes |
|---|---|---|---|---|

### 7. Review and owners
*Good looks like: who reviews, how often, and when targets are revisited.*

- [Owner, cadence, next target review]

---

## Worked example: Northwind Logistics

Agreed June 24, 2026 by Priya Shah, Grace Kim, and Luis Ortega. Owned by Marcus Lee after handoff.

### 1. Service and users
- Service: Northwind Invoice Extraction Pipeline
- Users and what they need: AP clerks need invoices ready to review soon after they arrive; the senior clerk needs drafts that are right at batch release; Luis needs month-end backlog under 2 days.
- Measurement hours: business hours, 7am to 7pm Eastern, Monday to Friday (PRD). About 240 business hours in 28 days.
- Window: rolling 28 days. About 29,500 invoices per window.

### 2. SLI and SLO table

| # | SLI (good / valid events) | Source | SLO target | Error budget in the window |
|---|---|---|---|---|
| 1 | Freshness: invoices ready (draft or in review queue) within 5 minutes of arriving / all invoices arriving in business hours | Pipeline status table, arrival and ready timestamps | 99% | About 295 late invoices |
| 2 | Review screen availability: successful 1-minute probe checks (load queue, open an invoice) / all probe checks in business hours | Synthetic probe | 99.5% | 72 bad minutes |
| 3 | Draft creation: invoices approved for drafting that exist in Ledgerline within 30 minutes / all invoices approved for drafting | ERP writer log | 99.9% | About 29 failed drafts |
| 4 | Draft correctness: auto-created drafts released with no currency or amount correction / all auto-created drafts released | Batch release log | 99.5% | About 73 wrong drafts (about 14,700 auto-drafts per window) |

Model quality (critical field accuracy on the weekly audit sample, target at least 97%) is watched in the eval plan, not as an error budget, because the sample is too small for daily decisions.

### 3. What does not count
- Invoices arriving outside business hours (measured from 7am the next business day).
- Ledgerline planned maintenance announced 2 business days ahead (SLO 3 pauses; drafts queue and retry).
- Invoices from a carrier on "review all" do not count toward SLO 4.

### 4. Alerting on burn rate

| SLO | Fast burn (page) | Slow burn (ticket) |
|---|---|---|
| 1 Freshness | More than 10% of invoices late over 1 hour (10x burn) | More than 2% late over 1 business day |
| 2 Availability | Probe failing 5 minutes in a row | Over 20 bad minutes in a week |
| 3 Draft creation | ERP writer failures above 5% over 15 minutes (runbook alert) | Retry queue older than 30 minutes |
| 4 Correctness | Layout-change alert for any carrier (added July 7) | Any wrong auto-draft found at release |

SLO 4 is measured late, at batch release, so its budget tells you about damage after the fact. The layout-change alert is the fast early signal for it.

### 5. Error budget policy

| Budget used in window | What we do |
|---|---|
| Under 50% | Normal releases through the eval gates. |
| 50% to 100% | Only fixes and reliability work ship. Any other prompt or model change needs Grace Kim's approval. Review at the weekly ops meeting. |
| Over 100% | Freeze all non-reliability changes until the SLO is back within target for 5 business days. For SLO 4, move affected carriers to "review all" until fixed. |
| One incident uses over 20% | Blameless post-mortem within 5 business days, with owned actions. |

Signed by Grace Kim (engineering) and Luis Ortega (business), June 24.

### 6. Current status
Partial window: June 29 (top 40 go-live) to July 10.

| # | SLO | Actual | Budget used | Notes |
|---|---|---|---|---|
| 1 | 99% within 5 min | 99.6% (median 1.8 min) | About 20% | Month-end June 30 peak handled after the API limit rise |
| 2 | 99.5% availability | 99.9% | 25% (18 minutes) | Review screen down 18 minutes on July 7 during a server patch; patching moved to 6am |
| 3 | 99.9% drafts created | 99.97% | About 14% | 4 failures from an expired token; rotation added to the calendar |
| 4 | 99.5% correct drafts | 99.7% | About 53% | 37 wrong-currency Blue Harbor drafts on June 30 used about half the budget in one day |

What the policy did: the June 30 incident used over 20% of the SLO 4 budget, so a post-mortem was written (done). Budget over 50%, so from July 1 to July 7 only the lane-currency check, the layout-change alert, and runbook fixes shipped; a planned prompt tweak for charge lines waited until July 13.

### 7. Review and owners
- Marcus Lee reviews the SLO dashboard every Monday; Grace Kim reviews monthly.
- Targets revisited at the October review, together with the ADR-004 decision on auto-release. If auto-release is approved for the top 10 carriers, SLO 4 moves to 99.9% for those carriers.

---

## Common mistakes

- Measuring what is easy (server CPU, uptime of one component) instead of what users feel (is my invoice ready, is the draft right).
- Setting 99.99% because it sounds good. Every extra nine costs a lot; pick the target users actually need.
- Paging on every error instead of on budget burn, so people learn to ignore alerts.
- Having an error budget with no policy, so nothing changes when it runs out.
- Forgetting correctness. For AI systems, "fast and available but wrong" is still an outage for the business.
