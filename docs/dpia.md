# Data Protection Impact Assessment (DPIA)

**When to use it:** Run a DPIA before a new system starts processing personal data in a way that could put people at risk, especially when it uses new technology like AI, processes data at large scale, or monitors people. Under the EU GDPR (Article 35) a DPIA is required when processing is "likely to result in a high risk" to people's rights and freedoms, and many companies require one for every new AI system as policy, even where the law may not. A DPIA answers four questions: What personal data do we process, and why? Is it necessary and proportionate? What could go wrong for the people whose data it is? What do we do to reduce those risks? For an FDE, the DPIA often decides whether a deployment is approved, so start it in the design phase, not the week before go-live.

**Who reads it:** The customer's privacy officer or Data Protection Officer (DPO), legal and security teams, the business owner, and sometimes a regulator. Your company's privacy team reviews the parts that describe your product. The customer, as the controller, owns the final DPIA; the FDE usually drafts the technical sections.

**How long it should be:** 4 to 8 pages. Link to the design doc, security questionnaire, and data inventory for details instead of copying them.

---

## The template

### 1. Overview
*Good looks like: who the controller and processors are, who is responsible, and why this DPIA was done.*

- Project: [name]
- Controller: [organization that decides why and how data is processed]
- Processors: [vendors that process data on the controller's behalf]
- DPIA owner: [name, role]; technical input: [name]
- Why a DPIA: [legal requirement, policy, or both, with the trigger]

### 2. Description of the processing
*Good looks like: a plain walk-through: what data, about whom, from where, to where, for how long.*

| Data category | Whose data | Source | Where stored | Retention | Who can access |
|---|---|---|---|---|---|

- Processing steps: [numbered steps]
- Use of AI: [what the model does with personal data; training or not]

### 3. Purpose and lawful basis
*Good looks like: each purpose with its lawful basis. No "just in case" purposes.*

| Purpose | Lawful basis | Notes |
|---|---|---|

### 4. Necessity and proportionality
*Good looks like: why each data category is needed, and what you chose not to collect or keep.*

- Data minimization: [what is excluded, masked, or deleted early]
- Accuracy: [how wrong data is found and fixed]
- Storage limitation: [retention rules and how they are enforced]
- Data subject rights: [how access, correction, and deletion requests are handled]
- Transfers: [any data leaving the region or country, and the safeguard]

### 5. Consultation
*Good looks like: who you asked, including people whose data it is or their representatives.*

- [Group]: [what they said, what changed]

### 6. Risks to individuals
*Good looks like: risks to the people, not to the company. Likelihood and severity scored the same way every time.*

| # | Risk to individuals | Likelihood (1-3) | Severity (1-3) | Score |
|---|---|---|---|---|

### 7. Measures to reduce risk
*Good looks like: each risk has a real control, and a residual score after the control.*

| # | Measure | Owner | Status | Residual score |
|---|---|---|---|---|

### 8. Outcome and sign-off
*Good looks like: a clear decision, any conditions, and when it is reviewed. If residual risk is still high, the regulator may need to be consulted (GDPR Art. 36).*

- Decision: [proceed / proceed with conditions / do not proceed]
- DPO or privacy advice: [summary]
- Signed off by: [name, role, date]
- Review date or trigger: [date or event]

---

## Worked example: Northwind Logistics

### 1. Overview
- Project: Northwind invoice-extraction assistant
- Controller: Northwind Logistics
- Processors: Atlas AI (software and deployment services; no standing access after handoff); Northwind's cloud provider (hosting, OCR, and managed model endpoint in US East, under Northwind's existing contract)
- DPIA owner: Northwind privacy counsel (legal team); technical input: Priya Shah (Atlas AI) and Omar Haddad (Security)
- Why a DPIA: Northwind policy requires one for any new AI system that processes personal data. Invoices from European carriers can contain personal data of EU residents, so legal chose to follow the GDPR Article 35 structure. Drafted May 18, 2026; final July 8, 2026 after the pilot.

### 2. Description of the processing

| Data category | Whose data | Source | Where stored | Retention | Who can access |
|---|---|---|---|---|---|
| Carrier contact names, emails, phone numbers | Carrier staff | Invoice PDFs and emails | Pipeline store, US East | 30 days (then Ledgerline only) | AP clerks, pipeline |
| Bank account details | Carriers, including about 60 owner-operators who are individuals | Invoice PDFs; carrier master | Pipeline store (masked in screens); Ledgerline | 30 days in pipeline | AP role only; last 4 digits shown |
| Driver names and signatures | Drivers | Proof-of-delivery pages attached to some invoices | Pipeline store | 30 days | AP clerks |
| Clerk user ID, edits, and release actions | Northwind AP clerks | Review screen | Pipeline database; audit log | Edits 30 days; release log 1 year | Ana Silva, Luis Ortega, auditors |

- Processing steps: (1) invoice email arrives in ap-invoices@; (2) PDF stored encrypted; (3) OCR and model extract 18 invoice fields; (4) validator checks against shipment data; (5) draft created in Ledgerline or sent to clerk review; (6) pipeline copies deleted after 30 days.
- Use of AI: the model reads the whole invoice, so it sees any personal data printed on it. It extracts only invoice fields, not names, phone numbers, or signatures. Data is not used to train any model (endpoint setting and contract).

### 3. Purpose and lawful basis

| Purpose | Lawful basis | Notes |
|---|---|---|
| Pay carrier invoices correctly and on time | Contract with carriers; legal obligation to keep accounting records | Same purpose as today's manual process |
| Check quality of the system (clerk edits) | Legitimate interest | Balanced in section 4; not used to evaluate clerks |
| Security and audit logging | Legitimate interest; legal obligation for payment controls | Release log kept 1 year |

### 4. Necessity and proportionality
- Data minimization: driver names and signatures are not extracted or stored as fields. Bank details are masked in the review screen. Eval exports exclude bank fields. Prompts containing invoice text are not logged.
- Accuracy: clerk review and validator checks; clerks can correct any field; carriers already dispute wrong invoices through the normal process.
- Storage limitation: 30-day automatic deletion in the pipeline store, checked monthly by Marcus Lee with a storage report. Ledgerline retention follows Northwind's existing accounting policy, unchanged by this project.
- Data subject rights: requests go through Northwind's existing privacy request process. Pipeline data can be found by carrier or invoice ID and deleted early if needed.
- Transfers: all processing in Northwind's US East cloud account. European carriers already send invoices to Northwind in the US today; legal confirmed the project does not add a new transfer, only a new tool on the same data.

### 5. Consultation
- AP clerks (through Luis Ortega and the June 1 team meeting): worried that edit logs would be used to judge them. Changed: per-clerk data is restricted and reports show carrier and field, not clerk (see M4).
- Security (Omar Haddad): asked for bank detail masking and no standing vendor access. Both done by May 20.
- Atlas AI privacy team: confirmed the endpoint does not store or train on data.

### 6. Risks to individuals

| # | Risk to individuals | Likelihood | Severity | Score |
|---|---|---|---|---|
| R1 | Bank details of owner-operators exposed to people who do not need them | 2 | 3 | 6 |
| R2 | Personal data kept longer than needed in pipeline copies | 2 | 2 | 4 |
| R3 | Clerk edit data used to monitor or rate individual clerks | 2 | 3 | 6 |
| R4 | Wrong extraction causes a carrier (possibly an individual) to be paid late or wrongly | 2 | 2 | 4 |
| R5 | Vendor or model provider accesses or reuses the data | 1 | 3 | 3 |

### 7. Measures to reduce risk

| # | Measure | Owner | Status | Residual score |
|---|---|---|---|---|
| M1 (R1) | Mask bank details except last 4; PDF viewer limited to AP role; bank fields excluded from logs and exports | Priya Shah | Done May 20 | 2 |
| M2 (R2) | Automatic 30-day deletion; monthly storage report | Marcus Lee | Done; first report July 31 | 2 |
| M3 (R4) | Draft-only posting and human batch release (ADR-004); lane-currency check after the June 30 incident (ADR-005) | Luis Ortega, Priya Shah | Done | 2 |
| M4 (R3) | Per-clerk data restricted to Ana Silva and Luis; written rule in the model card that edits are never used to rate clerks; reports by carrier and field only | Grace Kim | Due July 17 | 2 |
| M5 (R5) | No training setting on endpoint; no standing Atlas access after July 10; break-glass access logged | Omar Haddad | Done | 1 |

### 8. Outcome and sign-off
- Decision: proceed with conditions. Condition: M4 complete by July 17.
- Privacy advice: residual risks are low after the measures; no need to consult a regulator.
- Signed off by: Dana Morales (CFO, business owner) and Northwind privacy counsel, July 8, 2026.
- Review date or trigger: October 2026 review, or earlier if the system is used in a new region, for a new purpose, or with a new model provider.

---

## Common mistakes

- Doing the DPIA after the system is built, when the only choices left are "accept" or "rebuild".
- Describing risks to the company ("fines", "bad press") instead of risks to the people whose data it is.
- Forgetting employees. Logs of what staff do in a new tool are personal data too, and often the most sensitive part.
- Saying "the model does not use personal data" when it reads whole documents that contain it. Be precise about what it sees, what it keeps, and what it extracts.
- Signing off and never reviewing. A new purpose or new region can change the whole assessment.
