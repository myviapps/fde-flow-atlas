# Integration Spec for a Customer API

**When to use it:** Write an integration spec before you write code that calls a customer system, such as their ERP, CRM, or ticketing tool. The spec says exactly which endpoints you call, how you log in, what you send and get back, how you map fields, what happens on every kind of error, and how fast you are allowed to go. Integrations are where FDE projects most often slip, because the customer's API is "not well used", the documentation is out of date, or nobody knows the rate limit. Writing the spec forces those questions early, and a sandbox test proves the answers.

**Who reads it:** Your engineers, the customer's IT or integration team (who own the API), the customer's security team (who approve the credentials and permissions), and the engineers who will support the integration after handoff.

**How long it should be:** 3 to 6 pages. Show one real request and response for each endpoint. Put the full field mapping in a table, not in prose.

---

## The template

### 1. Header
*Good looks like: status, owners on both sides, and the API version you tested against.*

- Integration: [your system] to [customer system]
- API version and base URL (sandbox and production): [values]
- Owners: [your engineer], [customer API owner]
- Status: [Draft / Tested in sandbox / Approved / Live]

### 2. Purpose and direction
*Good looks like: what data moves, in which direction, and what triggers it. One sentence each.*

- Reads: [what you read and why]
- Writes: [what you write and why]
- Trigger: [event, schedule, or user action]

### 3. Authentication and permissions
*Good looks like: least privilege, stated exactly. How credentials are stored, rotated, and revoked.*

- Method: [OAuth client credentials, API key, service account token]
- Permissions granted: [the smallest set that works]
- Secret storage and rotation: [where, how often, who]

### 4. Endpoints used
*Good looks like: only the endpoints you really call, with method, path, purpose, and expected volume.*

| Method | Path | Purpose | Calls per invoice or event | Peak calls per minute |
|---|---|---|---|---|

### 5. Example request and response
*Good looks like: a real, trimmed example from the sandbox, with secrets removed.*

```
[request]
[response]
```

### 6. Field mapping
*Good looks like: every field you write, where it comes from, its type and format, and what happens if it is missing.*

| Our field | Their field | Type and format | Required | If missing or invalid |
|---|---|---|---|---|

### 7. Errors, retries, and idempotency
*Good looks like: a row per error class, and a rule that stops you from creating the same record twice when you retry.*

| Error | Meaning | Our behavior |
|---|---|---|

- Idempotency: [key used so retries do not create duplicates]

### 8. Rate limits and performance
*Good looks like: the documented limit, the tested limit, your peak need, and what you do when you hit it.*

[Numbers and plan]

### 9. Testing
*Good looks like: sandbox tests for the happy path and each error, plus a load test at peak volume.*

- [Test]: [result]

### 10. Monitoring and ownership
*Good looks like: metrics and alerts, and who fixes what after handoff. Link the runbook.*

[Metrics, alerts, owners]

### 11. Open questions
*Good looks like: each with an owner and a date.*

- [Question], [owner], [date]

---

## Worked example: Northwind Logistics

### 1. Header
- Integration: Northwind invoice pipeline to Ledgerline ERP
- API version and base URL: Ledgerline REST API v3; sandbox `https://ledgerline-sbx.northwind.internal/api/v3`, production `https://ledgerline.northwind.internal/api/v3`
- Owners: Priya Shah (Atlas AI), Grace Kim (Northwind IT); Ana Silva after handoff
- Status: Live (top 40 carriers since June 29, 2026)

### 2. Purpose and direction
- Reads: shipments (to check the invoice matches a real shipment, lane, and billing currency) and carriers (payment terms, default currency).
- Writes: draft AP invoices only. Never posts or releases them (ADR-004).
- Trigger: an invoice passes validation, or a clerk approves it in the review screen.

### 3. Authentication and permissions
- Method: service account `svc-invoice-pipeline` with a bearer token.
- Permissions granted: read shipments, read carriers, create and update AP invoices in status "draft". No permission to post, release, or delete. Confirmed in sandbox: a post attempt returns 403.
- Secret storage and rotation: token stored as secret "ledgerline-api" in Northwind's secrets manager; rotated every 90 days and at handoff (Ana Silva rotated it July 10). Steps are in the runbook task "Rotate ERP credentials".

### 4. Endpoints used

| Method | Path | Purpose | Calls per invoice | Peak calls per minute |
|---|---|---|---|---|
| GET | `/shipments?number={shipment_no}` | Find shipment, lane, billing currency, expected charges | 1 | 9 |
| GET | `/carriers/{carrier_id}` | Payment terms, default currency (cached 1 hour) | under 0.1 | 1 |
| POST | `/ap/invoices` | Create a draft invoice with header and charge lines | 1 | 9 |
| PATCH | `/ap/invoices/{id}` | Update a draft after a clerk correction | under 0.1 | 1 |

Peak need: 2,500 invoices per day at month end, bunched into about 5 busy hours, so about 8 to 9 invoices per minute, or about 20 calls per minute with retries.

### 5. Example request and response

```
POST /api/v3/ap/invoices
Authorization: Bearer ****
Idempotency-Key: 7f3c9a1e...b2 (SHA-256 of the PDF file)
Content-Type: application/json

{
  "status": "draft",
  "carrier_id": "CAR-00187",
  "invoice_number": "BHF-2026-44812",
  "invoice_date": "2026-06-03",
  "due_date": "2026-07-03",
  "currency": "EUR",
  "shipment_number": "NW-40021877",
  "lines": [
    {"code": "FRT", "description": "Ocean freight RTM-CHI", "amount": "4850.00"},
    {"code": "FSC", "description": "Fuel surcharge", "amount": "412.25"}
  ],
  "tax_amount": "0.00",
  "total_amount": "5262.25",
  "external_ref": "atlas-inv-000481223"
}

201 Created
{"id": "APD-2291044", "status": "draft", "created_at": "2026-06-03T14:02:11Z"}
```

### 6. Field mapping (critical fields shown; full 18-field table in appendix)

| Our field | Their field | Type and format | Required | If missing or invalid |
|---|---|---|---|---|
| invoice_number | invoice_number | String, max 40 | Yes | Send to review |
| carrier | carrier_id | Ledgerline carrier ID, looked up by sender and name | Yes | Send to review, reason "unknown carrier" |
| invoice_date | invoice_date | ISO date YYYY-MM-DD | Yes | Send to review |
| due_date | due_date | ISO date | No | Ledgerline computes from payment terms |
| currency | currency | ISO 4217 code; must equal shipment lane billing currency (ADR-005) | Yes | Send to review, reason "currency mismatch" |
| subtotal, tax, total | lines[].amount, tax_amount, total_amount | Decimal string, 2 places, dot as separator | Yes | Send to review if total is not subtotal plus tax plus charges |
| shipment_number | shipment_number | NW- plus 8 digits | Yes | Send to review, reason "no matching shipment" |
| our invoice ID | external_ref | String | Yes | Always set; used to find drafts from our side |

### 7. Errors, retries, and idempotency

| Error | Meaning | Our behavior |
|---|---|---|
| 400 | Our payload is wrong | No retry; send invoice to review with the error text; alert if above 1% |
| 401 | Token expired or revoked | No retry; alert; rotate token (runbook) |
| 403 | Permission missing | No retry; alert; this should never happen in normal use |
| 404 on shipment | Shipment not found | Send to review, reason "no matching shipment" |
| 409 | Draft with this idempotency key exists | Treat as success; read the existing draft ID |
| 429 | Rate limit | Retry with exponential backoff (2, 4, 8, 16, 32 seconds, plus random jitter), then back to the queue |
| 5xx or timeout (10 seconds) | Ledgerline problem | Same backoff; alert if failures above 5% over 15 minutes |

- Idempotency: `Idempotency-Key` is the SHA-256 hash of the PDF file, so a retry or a resent email never creates a second draft. Ledgerline keeps keys for 7 days; our ingest also removes duplicate files by the same hash.

### 8. Rate limits and performance
- Documented limit: 60 calls per minute per service account.
- Sandbox load test (June 16, 2,500 invoices in 5 hours): no loss, but drafts were delayed up to 40 minutes at the burst peak (RAID R-01, I-04).
- Change: the Ledgerline admin raised the limit to 120 calls per minute for this service account on June 18. Re-test: maximum delay 4 minutes. I-04 closed.
- Our client also limits itself to 100 calls per minute, so we never use the full limit that other Northwind systems share.

### 9. Testing
- Create, read back, and update a draft in sandbox: passed May 8 (confirmed assumption A-01, charge lines supported).
- Post or release attempt with our token returns 403: passed May 8.
- Each error row above simulated with a mock server: passed May 22.
- Same PDF sent twice creates one draft: passed May 22.
- Load test at month-end peak: passed June 18 after the limit change.

### 10. Monitoring and ownership
- Metrics: calls per minute, error rate by status code, retry queue size, time from validation to draft created.
- Alerts: "ERP writer failures" above 5% over 15 minutes (see runbook).
- Owners after handoff: Ana Silva (integration and credentials), Grace Kim (backup and Ledgerline admin contact).

### 11. Open questions
- Will Ledgerline v4 (planned for 2027) keep the idempotency header? Grace Kim, check at the October review.

---

## Common mistakes

- Asking for broad "admin" credentials to move fast. Security will block it later, and it is dangerous. Ask for the smallest permission and test that everything else is refused.
- No idempotency key, so a retry after a timeout creates a duplicate invoice, which in finance can mean a duplicate payment.
- Trusting the documented rate limit without a load test at the real peak.
- Mapping only the happy path. Every field needs a rule for "missing" and "invalid".
- Writing the spec from the documentation and never testing it against the sandbox. Customer API documentation is often out of date.
