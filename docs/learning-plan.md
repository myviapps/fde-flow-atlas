# Personal 12-Week FDE Learning Route

**When to use it:** Use this plan when you want to grow into a Forward Deployed Engineer role, or get stronger in one, over about 3 months. It turns a vague goal ("learn AI engineering") into 12 weeks of specific practice, each week ending with something you built or wrote that someone else can see. FDE skills are wide: coding fluency, data, APIs, LLM evaluation, writing, and talking with customers. The most common failure is spending 12 weeks watching courses. This plan forces a mix of learning, building, and shipping on real problems, with checkpoints so you notice early when you are off track.

**Who reads it:** You, first. Then your mentor or manager, who checks progress at each checkpoint. A hiring manager may later see the portfolio of work it produces.

**How long it should be:** 1 to 2 pages for the plan, plus a short weekly log. If the plan is longer than that, you are planning instead of practicing.

---

## The template

### 1. Goal
*Good looks like: one sentence with a date and something checkable, such as a role, a project you own, or a skill someone can test.*

- By [date], I will [checkable outcome].

### 2. Starting point
*Good looks like: an honest self-rating on the skills that matter, with evidence, so you spend time on gaps, not on what you already know.*

| Skill | Rating (1 to 5) | Evidence |
|---|---|---|

### 3. Time budget
*Good looks like: real hours you can protect every week, and when.*

- Hours per week: [n], on [days and times]

### 4. The 12-week route
*Good looks like: each week has one focus, one small thing to learn, and one visible output. Harder weeks come after you have a base.*

| Week | Focus | Learn | Build or ship (visible output) |
|---|---|---|---|
| 1 | [focus] | [resource or practice] | [output] |

### 5. Portfolio pieces
*Good looks like: 3 to 5 pieces of work that prove the goal, each explainable in 2 minutes.*

- [Piece]: [what it proves]

### 6. People
*Good looks like: a mentor, a reviewer for your writing, and one person who will give you a real problem.*

- Mentor: [name, cadence]
- Reviewer: [name]
- Real problem source: [name]

### 7. Checkpoints
*Good looks like: 3 checkpoints with a pass condition. Decide in advance what you will change if you miss one.*

| Week | Check | Pass condition | If missed |
|---|---|---|---|

### 8. Weekly log
*Good looks like: 3 lines per week. What I did, what I learned, what is next.*

| Week | Did | Learned | Next |
|---|---|---|---|

---

## Worked example: Northwind Logistics

Ana Silva, IT engineer at Northwind, took over evals and prompts from Priya Shah at handoff on July 10, 2026. She wants to grow into an AI engineering role that looks a lot like an FDE: owning an AI system end to end, working directly with business users. Priya mentors her during hypercare and after.

### 1. Goal
By October 2, 2026, I will lead the October review of the invoice assistant for Dana Morales and Luis Ortega on my own, and ship phase 2 multi-invoice splitting with an eval I designed.

### 2. Starting point

| Skill | Rating (1 to 5) | Evidence |
|---|---|---|
| Python | 3 | Wrote internal scripts; ran `make eval` with Priya; slow with tests |
| SQL | 4 | Daily work on Ledgerline reports |
| APIs and integrations | 3 | Owns the Ledgerline integration since July 10, but has not designed one |
| LLM prompting and evals | 2 | Shipped one prompt change through the release gates (July 8) with a checklist |
| Cloud operations | 3 | On-call for the pipeline during shadow week |
| Writing for executives | 1 | Has never written an exec update |
| Customer and user conversations | 2 | Talks to IT users; never led a meeting with the AP team |

### 3. Time budget
- 6 hours per week: Tuesday and Thursday 3pm to 5pm (protected by Grace Kim), plus 2 hours Saturday morning.

### 4. The 12-week route

| Week | Focus | Learn | Build or ship (visible output) |
|---|---|---|---|
| 1 (Jul 13) | Python fluency | Testing basics with pytest; read the pipeline's validator code | 10 new unit tests for the validator, merged |
| 2 (Jul 20) | Data formats | JSON Schema, CSV pitfalls, dates and currencies | A schema check for extraction output that fails on bad dates |
| 3 (Jul 27) | Evals | Metrics, slices, why a locked golden set matters | Re-run golden set; one-page write-up of the scanned slice (95.9%) |
| 4 (Aug 3) | Debugging | Reproduce before you fix; write a bug report | Bug report and fix for one real issue from #ap-ops |
| 5 (Aug 10) | Checkpoint 1 | Review with Priya | Checkpoint 1 (see below) |
| 6 (Aug 17) | LLM basics | How context, examples, and output formats change results | Two prompt variants for splitting, compared on 60 multi-invoice PDFs |
| 7 (Aug 24) | Design | Read the design doc and ADRs again; alternatives and trade-offs | Design doc (3 pages) for multi-invoice splitting, reviewed by Grace |
| 8 (Aug 31) | Discovery | How to interview users and ask for numbers | 30-minute interview with Beth Reyes on multi-invoice pain; notes |
| 9 (Sep 7) | Checkpoint 2 | Review with Priya and Grace | Checkpoint 2 (see below) |
| 10 (Sep 14) | Build and gate | Release gates, rollback flags | Splitting shipped behind a flag to 2 carriers |
| 11 (Sep 21) | Executive writing | The 2-minute update; lead with the ask | Two weekly exec updates to Luis, rewritten once after Priya's comments |
| 12 (Sep 28) | Present | Demo script and numbers story | October review deck and dry run with Luis |

### 5. Portfolio pieces
- Validator tests and schema check: proves Python and data-format fluency.
- Scanned-slice analysis: proves eval thinking beyond averages.
- Multi-invoice splitting design doc plus eval: proves she can design and measure an AI feature.
- October review: proves she can talk to executives about results and risks.

### 6. People
- Mentor: Priya Shah, 30 minutes every Thursday (2 hours per day available until August 7 during hypercare, then weekly).
- Reviewer: Grace Kim for design and technical writing.
- Real problem source: Luis Ortega and Beth Reyes (multi-invoice PDFs, open item from the handoff plan, due September 30).

### 7. Checkpoints

| Week | Check | Pass condition | If missed |
|---|---|---|---|
| 5 (Aug 14) | Fluency | Tests merged, schema check live, bug report accepted by Marcus Lee | Drop week 6 LLM topic; repeat weeks 1 to 4 focus with pairing |
| 9 (Sep 11) | Design | Design doc approved by Grace; eval set of 60 labeled multi-invoice PDFs ready | Move splitting ship date; tell Luis by September 14 |
| 12 (Oct 2) | Goal | Splitting live for 2 carriers with no guardrail failures; review delivered | Ask Priya to co-present; reset goal for Q4 |

### 8. Weekly log (first 3 weeks)

| Week | Did | Learned | Next |
|---|---|---|---|
| 1 | 12 validator tests merged; found one rule with no test at all (tax rounding) | Tests find gaps in my understanding, not only bugs | Schema for extraction output |
| 2 | Schema check live in dev; it caught 3 malformed outputs in the dev set | Most "model errors" were format errors | Scanned slice |
| 3 | Scanned slice: 70% of errors are in charge-line amounts on faint scans | An average hides where the work is | Pick a real bug from #ap-ops |

---

## Common mistakes

- Only consuming content (courses, videos) and never producing something another person can look at.
- Too many goals. Pick one outcome and let every week feed it.
- No real problem. Practice projects are fine, but a real user with a real pain teaches the customer side of the job.
- Skipping writing and speaking practice. For FDEs, the exec update and the demo matter as much as the code.
- No checkpoints, so you find out in week 12 that you drifted in week 3.
