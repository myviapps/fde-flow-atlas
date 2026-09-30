# Answering a Customer Security Questionnaire

**When to use it:** Use this template when a customer's security or compliance team sends you a questionnaire before they approve your product. These often have 50 to 300 questions about data handling, access control, encryption, and incident response. An FDE often owns the answers for the specific deployment, working with your company's security team. Clear, honest answers can save weeks; vague answers cause long back-and-forth and can block a deal.

**Who reads it:** The customer's security team and sometimes their legal, privacy, and compliance teams. Your own security and legal teams must review your answers before you send them.

**How long it should be:** As long as the questionnaire requires, but each answer should be short: usually 1 to 4 sentences plus a link to evidence. Use this template as your working sheet and as a summary cover note.

---

## The template

### 1. Cover note
*Good looks like: a short summary the security reviewer reads first, pointing to the key facts and evidence.*

- Customer: [name]
- Questionnaire: [name, version, number of questions]
- Deployment described: [which product, which hosting model]
- Prepared by: [name], reviewed by [security team member]
- Key facts: [3 to 5 bullets: where data lives, certifications, training use, retention]
- Evidence attached: [list]

### 2. Data flow summary
*Good looks like: a simple description of what data enters, where it goes, and when it is deleted. Reviewers ask this first.*

[Data flow in 4 to 6 steps]

### 3. Answer sheet
*Good looks like: every answer is Yes, No, Partial, or Not applicable, followed by a short explanation and evidence. Never answer "Yes" to something only partly true.*

| # | Question | Answer | Explanation | Evidence |
|---|---|---|---|---|
| [n] | [question text] | [Yes / No / Partial / N/A] | [short explanation] | [document, section] |

Standard areas to cover:
- Data classification and residency
- Encryption at rest and in transit
- Access control, single sign-on, least privilege
- Logging and monitoring
- Data retention and deletion
- AI-specific: model training on customer data, prompt and output logging, third-party model providers
- Vulnerability management and penetration testing
- Incident response and notification timelines
- Business continuity and backups
- Subprocessors
- Certifications and audits

### 4. Gaps and compensating controls
*Good looks like: honest list of "No" or "Partial" answers, each with a control or a plan.*

| Gap | Compensating control or plan | Date |
|---|---|---|

### 5. Follow-up log
*Good looks like: every clarifying question from the customer, with the answer and date.*

| Date | Question | Answer | By |
|---|---|---|---|

---

## Worked example: Northwind Logistics

### 1. Cover note
- Customer: Northwind Logistics
- Questionnaire: Northwind Vendor Security Assessment v4, 112 questions
- Deployment described: Atlas AI invoice-extraction assistant, deployed in Northwind's own cloud account (US East)
- Prepared by: Priya Shah (FDE), reviewed by Atlas AI security team
- Key facts:
  - All invoice data is processed and stored in Northwind's cloud account in US East.
  - Customer data is never used to train models.
  - Raw invoices and extractions are deleted after 30 days.
  - Atlas AI holds a SOC 2 Type II report (latest period ending March 2026).
  - Access is through Northwind single sign-on; Atlas staff have no standing access after handoff.
- Evidence attached: SOC 2 Type II report (under NDA), design doc section 6, data flow diagram, penetration test summary (February 2026), subprocessor list.

### 2. Data flow summary
1. Invoice emails arrive in Northwind's mailbox; the ingest worker in Northwind's account reads them.
2. PDFs are stored in encrypted object storage in Northwind's account.
3. Text is extracted and sent to a managed model endpoint in the same cloud region. The endpoint does not store or train on the data.
4. Extracted fields are checked and written as drafts to Ledgerline.
5. PDFs and extractions are deleted after 30 days. Ledgerline stays the system of record.

### 3. Answer sheet (sample of 8 of 112 answers)

| # | Question | Answer | Explanation | Evidence |
|---|---|---|---|---|
| 3.1 | Is customer data stored outside our environment? | No | All storage and processing run in Northwind's cloud account, US East. | Design doc s.6 |
| 3.4 | Is data encrypted at rest? | Yes | Storage and databases use the cloud provider's encryption with keys managed in Northwind's key service. | Design doc s.6 |
| 4.2 | Is single sign-on supported? | Yes | Review screen uses Northwind's identity provider; no local accounts. | Config screenshot |
| 5.7 | Are privileged actions logged? | Yes | All admin actions and draft releases are logged and kept 1 year in Northwind's log store. | Runbook s.5 |
| 7.1 | Is customer data used to train or improve AI models? | No | Contract and endpoint settings prohibit training on Northwind data. Clerk edits are used only to evaluate this deployment and stay in Northwind's account. | MSA s.9, endpoint settings |
| 7.3 | Are prompts and model outputs logged? | Partial | Model outputs (fields and confidence) are logged for 30 days. Full prompts containing invoice text are not logged. | Design doc s.7 |
| 8.2 | Will you notify us of a security incident within 24 hours? | Yes | Atlas commits to notify within 24 hours of confirming an incident affecting Northwind data. | MSA s.12 |
| 9.5 | Is a penetration test done at least yearly? | Yes | Third-party test, February 2026; no open high findings. | Pen test summary |

### 4. Gaps and compensating controls

| Gap | Compensating control or plan | Date |
|---|---|---|
| Bank account numbers visible in raw PDFs to clerks | Masked in the review screen except last 4 digits; PDF viewer limited to AP role | Done May 20 |
| No customer-managed key for model endpoint traffic | Traffic stays inside the cloud provider network in the same region; no storage at endpoint | Accepted by Omar Haddad May 20 |

### 5. Follow-up log

| Date | Question | Answer | By |
|---|---|---|---|
| May 15 | Can Atlas staff access production after handoff? | No. Break-glass access only, approved by Northwind IT, time-limited to 24 hours, and logged. | Priya Shah |
| May 18 | Which subprocessors see invoice data? | None outside Northwind's cloud provider, which Northwind already contracts with directly. | Atlas security |

---

## Common mistakes

- Answering "Yes" to be helpful when the true answer is "Partial". Security teams check, and trust is hard to win back.
- Copying generic answers that describe a different hosting model than this deployment.
- Not answering the AI-specific questions (training, logging, model providers) clearly. These are now the first questions reviewers read.
- Sending answers without your own security team's review.
- Losing track of follow-up questions, so the same thing gets asked three times.
