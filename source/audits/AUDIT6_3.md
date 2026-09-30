# AUDIT6_3: deep per-topic audit (18 topics)

Scope: security compliance regulated observability caching queues sysdesign apistyles nosql streaming cicd integration bi mlworkflow featureeng linreg logreg trees.
Method: I read every subtopic, including its table, checklist and flow data, every patch_*.json entry, and each concept's ideas, traps and qa. I then grepped all lessons before calling anything missing. All 30 Python blocks in mlworkflow, featureeng, linreg, logreg and trees were run with scikit-learn 1.9.1, and every printed output matches the comments in the lessons. These topics are already strong, so the items below are real gaps, not padding.
Topics that other lessons already cover are not proposed again here: pagination (http), SSE (fastapi), retries and backoff (resilient), VPN and proxies (entnetwork), Terraform (cloud), MLflow and drift (mlops), SHAP (boosting), EU AI Act (responsibleai), prompt injection (guardrails), eval gates (evals).

### security
- ADD SUBTOPIC: User provisioning and deprovisioning (JIT vs SCIM 2.0): creating users at first login vs SCIM push from Okta/Entra, group sync, and what happens on offboarding. This is only one checklist line today, and customers ask about it in every SSO call.
- ADD MICRO: Sessions versus tokens -> Cookie flags (HttpOnly, Secure, SameSite), what CSRF is and why SameSite and anti-CSRF tokens stop it, and why a SPA should not keep tokens in localStorage.
- ADD MICRO: Sessions versus tokens -> Refresh-token rotation and revocation, including how to force a logout of a JWT user (short expiry plus a deny-list).
- ADD MICRO: OAuth 2.0 and OpenID Connect -> IdP tokens are RS256 and verified against the IdP's JWKS (kid, key rotation), not an HS256 shared secret. Pin `algorithms=[...]` to block alg=none and algorithm-confusion attacks. Add a PyJWKClient snippet.
- ADD MICRO: Service accounts and secrets -> The OAuth client-credentials grant for machine-to-machine calls, and API keys stored hashed with a prefix so they can be shown once and rotated.
- ADD MICRO: Authentication versus authorization -> If the app owns passwords, hash them with argon2 or bcrypt, never SHA-256. MFA strength runs from SMS to TOTP to push to passkeys/WebAuthn, and passkeys/WebAuthn are phishing resistant.
- ADD MICRO: Application security: OWASP Top 10 -> Mention that the 2025 edition exists (software supply-chain failures is now its own item, and SSRF is folded into broken access control). Cross-link the OWASP Top 10 for LLM Applications from guardrails.
- ADD MICRO: Application security: OWASP Top 10 -> The SSRF allowlist must also handle redirects and DNS rebinding: resolve the host, check the IP, and disable redirects or re-check after each one.

### compliance
- ADD MICRO: PII, PHI and data classification -> Anonymisation vs pseudonymisation. Under GDPR, pseudonymised data (tokenised or hashed ids) is still personal data, and only true anonymisation takes data out of scope. Beginners get this wrong constantly.
- ADD MICRO: PII, PHI and data classification -> The regex redactor is a first pass only. Name a real PII detector (for example Microsoft Presidio, or a cloud DLP API) and show how to measure its recall on a labelled sample.
- ADD MICRO: Least privilege and audit logs -> Retention schedules: a written retention period per data class, automatic deletion jobs, and legal holds as the exception.
- ADD MICRO: Answering a security questionnaire -> Trust center or portal, SOC 2 bridge letter (covering the gap since the last report period), and the rule that the FDE routes every answer through the security team's approved library.
- ADD MICRO: GDPR, HIPAA and SOC 2 -> What an FDE does in the first hour of a suspected data incident on site: stop the spread, preserve evidence, and escalate to the named security contact. The FDE does not investigate alone or notify the customer ad hoc. Tie this to the 72-hour GDPR clock.

### regulated
- ADD MICRO: Data residency and cross-border transfer -> Cross-reference the EU AI Act. Credit scoring, insurance pricing, hiring and some health uses are high-risk, so regulated customers ask about it in the same review. It is covered in responsibleai but never mentioned here.
- ADD MICRO: Finance: SOC 2, PCI DSS, SOX and model risk -> EU financial customers now cite DORA (digital operational resilience, in force January 2025): third-party ICT risk registers, exit plans and incident reporting that apply to AI vendors.
- ADD MICRO: Healthcare: HIPAA, BAAs, PHI and FHIR -> The Limited Data Set with a Data Use Agreement, as the middle option between full PHI and de-identified data. Also SMART on FHIR as the standard way apps get scoped FHIR tokens.
- ADD MICRO: How an FDE works inside these rules -> Life sciences and pharma (a big FDE market): GxP and 21 CFR Part 11, which require validated systems, audit trails and e-signatures. One row in the framework table is enough.

### observability
- ADD MICRO: Distributed tracing -> Auto-instrumentation (`opentelemetry-instrument`, FastAPIInstrumentor, requests/httpx instrumentors) and the OTel Collector as the component that receives, samples and exports. The current code only shows manual spans.
- ADD MICRO: Distributed tracing -> Sampling: head-based vs tail-based sampling (keep all errors and slow traces). Also trace volume cost.
- ADD MICRO: Structured logging -> Propagating the request id with middleware plus contextvars, so every log line gets it automatically. Also write trace_id into logs so logs and traces link.
- ADD MICRO: Structured logging -> Where logs go (stdout, then the platform, then Loki/ELK/CloudWatch/Datadog), retention periods and log cost. Use UTC ISO-8601 timestamps.
- ADD MICRO: Metrics with RED and USE -> High-cardinality labels (user_id or request_id as a label) blow up Prometheus memory and cost. Put those in logs or traces instead.
- ADD MICRO: Alerts, on-call and runbooks -> Multi-window, multi-burn-rate SLO alerts (for example 14.4x over 1h plus 5m), error tracking tools such as Sentry for exceptions, and synthetic or uptime checks from outside the network.
- ADD MICRO: Tracing LLM calls -> Attach quality signals to traces (user thumbs up/down, eval or judge scores, guardrail triggers) and redact or sample prompt bodies by policy.
- FIX: Structured logging code `"ts": time.strftime("%Y-%m-%dT%H:%M:%S")` -> this is local time with no zone. Use `datetime.now(timezone.utc).isoformat()`.
- FIX: Tracing LLM calls code uses `model=MODEL` but `MODEL` is never defined in the snippet -> add `MODEL = "<current model id>"`. The same applies to caching "Caching LLM responses and prompts" and queues "Scheduling long LLM jobs".

### caching
- ADD SUBTOPIC: Finding the bottleneck before you cache: profiling with cProfile/py-spy, EXPLAIN ANALYZE for slow queries, spotting N+1 query loops, and sizing connection pools. "Measure first" is stated but never taught.
- ADD MICRO: Where caches live -> In-process caches in Python: `functools.lru_cache` (no TTL) vs `cachetools.TTLCache`, and why they diverge across workers.
- ADD MICRO: Cache-aside, TTLs and invalidation -> Eviction when memory is full (LRU/LFU, Redis `maxmemory` and `maxmemory-policy allkeys-lru`), and negative caching of "not found".
- ADD MICRO: Cache-aside, TTLs and invalidation -> Stampede protection code: a single-flight lock (`SET key NX EX`) or early refresh. The trap names it, but there is no code.
- ADD MICRO: Cache-aside, TTLs and invalidation -> Key design: include tenant or user id, permission scope and a version in the key (`t:{tenant}:product:42:v4`). This is the fix for the "shared key leaks personal data" trap.
- FIX: Cache-aside code calls `r.get(key)` but `r` is never created -> add `import redis; r = redis.Redis()`.

### queues
- FIX: Workers with Celery and RQ: "an SQS message is limited to 256 KB" -> AWS raised the SQS maximum payload to 1 MiB in 2025. Keep the advice to pass ids, and change the number or say "check the current limit".
- ADD MICRO: Retries, dead letters and idempotency -> Celery reliability settings: `acks_late=True`, `worker_prefetch_multiplier=1`, and `autoretry_for` / `retry_backoff` / `max_retries` in code. The checklist asks for backoff, but the Celery code never shows it.
- ADD MICRO: Queues versus logs -> FIFO queues with message group ids for per-key ordering, and deduplication ids. The "exactly once" wording in the example should be qualified, because SQS standard queues are at least once.
- ADD MICRO: Retries, dead letters and idempotency -> The transactional outbox pattern: write the DB row and an outbox row in one transaction, then publish, so "saved but never enqueued" cannot happen.
- ADD MICRO: Workers with Celery and RQ -> Long jobs must extend the visibility timeout (heartbeat with ChangeMessageVisibility), and backpressure or priority queues keep big batches from starving small ones.
- ADD MICRO: Webhooks in and out -> Replay protection: sign a timestamp together with the body (Stripe-style `t=...,v1=...`), reject old timestamps, and keep rotating signing secrets.
- ADD MICRO: Scheduling long LLM jobs -> For multi-step, long-running workflows (ingest, then embed, then review, then notify), name durable workflow engines (AWS Step Functions, Temporal) as the step up from chained Celery tasks. Also name cloud queue equivalents (Google Pub/Sub, Azure Service Bus).

### sysdesign
- ADD SUBTOPIC: Backups and disaster recovery: RPO vs RTO, multi-AZ vs multi-region, point-in-time restore, restore drills, and what to write in the customer's DR section. The term RPO appears nowhere in the atlas.
- ADD MICRO: Scaling, availability and CAP -> Circuit breakers, bulkheads and graceful degradation (a cached answer or "search only" mode when the LLM is down). The word "breaker" appears nowhere in the atlas.
- ADD MICRO: Scaling, availability and CAP -> Sharding/partitioning a database, and consistency choices in practice (strong vs eventual, read-your-writes, routing a user's reads to the primary after a write).
- ADD MICRO: Clients, load balancers, stateless servers -> The API gateway and rate limiting (token bucket per user or tenant) in front of the app servers. Also a CDN plus object storage with pre-signed URLs, so large uploads bypass the app servers.
- ADD MICRO: Running a system design interview -> A short monolith vs microservices guidance ("start with a modular monolith") and when an LLM gateway (routing, fallback provider, per-tenant quotas) earns a box.

### apistyles
- ADD SUBTOPIC: WebSockets and real-time channels: when to use WebSockets vs SSE vs long polling. WebSockets are needed for voice and live agents, and SSE is taught in fastapi. Cover heartbeats, reconnection and auth on connect. WebSocket appears nowhere in the atlas.
- ADD MICRO: REST: resources, verbs, status codes -> Idempotency-Key header on POST, a standard error body (RFC 9457 application/problem+json), rate-limit headers, and a cross-link to http for pagination.
- ADD MICRO: gRPC and Protobuf -> Schema evolution rules: never reuse or renumber fields, use `reserved`, add fields only. Also gRPC deadlines and status codes, and grpcurl for debugging.
- ADD MICRO: GraphQL -> Mutations and introspection, and persisted queries (which allow GET caching). Show a one-line mutation example.
- ADD MICRO: Versioning and OpenAPI specs -> Generate a typed client from a spec (openapi-python-client or openapi-generator command). Note that FastAPI emits OpenAPI 3.1.
- ADD MICRO: Polling versus webhooks -> JSON-RPC 2.0 as another style FDEs meet, because MCP is built on it. One line plus a cross-link to mcp.

### nosql
- ADD MICRO: Key-value stores: Redis and DynamoDB -> DynamoDB global secondary index code and single-table design basics, eventually consistent vs strongly consistent reads, and on-demand vs provisioned capacity (cost).
- ADD MICRO: Key-value stores -> Redis data structures in practice (INCR+EXPIRE rate limiter, sorted-set leaderboard, hashes). Today these are only named.
- ADD MICRO: Document databases: MongoDB -> An aggregation pipeline example ($match, $group, $lookup) and schema validation (`$jsonSchema`).
- ADD MICRO: A decision table for picking a database -> Add rows for search engines (Elasticsearch/OpenSearch: full-text BM25, facets), time-series stores (TimescaleDB, InfluxDB) and the analytical warehouse, which customers name as options.
- ADD MICRO: Vector databases for AI search -> Hybrid search (BM25 plus vectors), HNSW recall/speed knobs (`ef_search`), and the pitfall that a restrictive filter can return fewer than k rows.

### streaming
- ADD SUBTOPIC: Event schemas and evolution: Avro/Protobuf/JSON Schema with a schema registry, backward/forward compatibility, and the event envelope (id, type, time, version). "Schema Registry" and "Avro" appear nowhere in the atlas.
- ADD MICRO: Delivery guarantees and idempotency -> A Python consumer with `enable.auto.commit=False` that commits after the write (confluent-kafka). Practice task 2 asks for this, but no Python consumer code exists in the lesson.
- ADD MICRO: Kafka topics, partitions and offsets -> Producer durability settings (`acks=all`, `enable.idempotence=true`), log-compacted topics, and that Kafka 4.x runs on KRaft without ZooKeeper.
- ADD MICRO: Stream processing: state and windows -> Watermarks and allowed lateness named explicitly, plus hopping and session windows.
- ADD MICRO: Change data capture with Debezium -> The transactional outbox as the alternative when you own the app, and managed options (Amazon MSK, Confluent Cloud, Kinesis, Pub/Sub, Event Hubs).
- FIX: Consumer groups and scaling flow data: edge `["p1","p2"]` makes partitions 0-5 flow into 6-11, and fraud-scorer is drawn reading only partitions 6-11 ("member 2") while wh-loader reads only 0-5 -> both groups should read all 12 partitions. Draw fraud-scorer's two members splitting 0-5 and 6-11, and wh-loader reading the whole topic.

### cicd
- ADD MICRO: Pipeline stages: lint, test, scan, build -> The pipeline builds the image but never pushes it. Add a push to GHCR/ECR (docker/login-action + build-push-action) so "promote the same image" is real.
- ADD MICRO: Rollbacks and safe releases -> Run DB migrations (Alembic `upgrade head`) as their own gated step before deploy, following expand and contract.
- ADD MICRO: Anatomy of a GitHub Actions workflow -> `concurrency` groups with cancel-in-progress, path filters, and a least-privilege default `permissions: contents: read` at the top.
- ADD MICRO: Pipeline stages -> Supply chain: pin third-party actions to a commit SHA, Dependabot for actions, and SBOM plus image signing (syft/cosign), which security reviewers now ask for.
- ADD MICRO: Environments and secrets -> Deploying into a customer network with no inbound access: self-hosted runners inside their VPC, or pull-based GitOps (Argo CD/Flux). Also terraform plan on PR and apply on merge (cross-link cloud).
- ADD MICRO: CI, delivery and deployment -> Trunk-based development with short-lived branches, semantic version tags plus changelog for customer-facing releases, and the same concepts in GitLab CI, Azure DevOps and Jenkins, which customers often mandate.
- ADD MICRO: Pipeline stages -> An LLM app pipeline adds an eval-suite gate (prompt/model regression) as a CI job. Cross-link evals "Gating releases".
- FIX: `actions/checkout@v4`, `actions/setup-python@v5`, `aws-actions/configure-aws-credentials@v4` -> these still work, but newer majors shipped in 2025 (checkout v5, setup-python v6). Add a note to check the current major versions, or pin by SHA.

### integration
- ADD SUBTOPIC: Writing back to systems of record safely: sandboxes (Salesforce sandbox, SAP QA client), dry-run mode, idempotent upserts on external ids, human approval for bulk changes, and a daily reconciliation report. Agents that write to CRMs and ERPs are core FDE work, and the topic is read-only today.
- ADD MICRO: SFTP file drops done properly -> PGP-encrypted files (gpg decrypt with the customer's key), which banks and insurers almost always require. Also AS2/MFT tools named.
- ADD MICRO: The legacy integration landscape -> File-content pitfalls: encodings (cp1252, UTF-8 BOM), `pandas.read_fwf` for fixed-width, Excel exports, leading zeros lost as numbers, and date formats. Add mainframe exports (EBCDIC, COBOL copybooks) in one line.
- ADD MICRO: The legacy integration landscape -> ID crosswalks and a canonical model: a mapping table between SAP, CRM and partner ids, and who owns master data (MDM).
- ADD MICRO: ERP and CRM APIs, and iPaaS tools -> An OData query example (`$filter`, `$select`, `$top`, `$skip`) and a Salesforce Bulk API 2.0 job sketch. Both are named, but neither is shown.
- ADD MICRO: ERP and CRM APIs -> Event-driven options on these platforms (Salesforce Change Data Capture/Platform Events, SAP event mesh) as an alternative to polling.
- FIX: SFTP code `t = paramiko.Transport((host, 22)); t.connect(username=..., pkey=...)` -> it never verifies the server host key, which allows a man-in-the-middle attack. Pass `hostkey=` from a known_hosts entry, or use SSHClient with `load_system_host_keys()` and RejectPolicy. `RSAKey` also rejects ed25519 keys.
- FIX: Salesforce code `services/data/v60.0` -> v60.0 is from 2024. Say "use the org's current API version (see /services/data)".

### bi
- FIX: Text-to-SQL validator. The regex table check can be bypassed, and it also blocks valid SQL. Tested: `SELECT * FROM orders, staff_salaries` PASSES (a comma join) and `SELECT * FROM "staff_salaries"` PASSES (quoted name), while `WITH t AS (SELECT * FROM orders) SELECT * FROM t` is wrongly BLOCKED. Fix: parse with a SQL parser (sqlglot) to list real tables, and state that the read-only role with grants only on the curated views is the actual guard, with the validator only as a helper.
- ADD MICRO: Performance, freshness and trust -> Row-level security in BI tools (Power BI RLS roles, Looker access filters, Tableau user filters), so a regional manager sees only their region.
- ADD MICRO: What BI tools do -> A first DAX measure (for example `On-time % = DIVIDE([On time], [Delivered])`), since Power BI is the most common enterprise tool and DAX is only named.
- ADD MICRO: Designing a dashboard people use -> A chart-choice mini table: trend is a line, comparison is sorted bars, part-to-whole is a stacked bar (avoid pie beyond three slices), exact values go in a table, one number goes in a KPI tile.
- ADD MICRO: Designing a dashboard people use -> Measuring AI impact: baseline period, before/after with a comparison group, and annotating the launch date on trend charts. Cross-link roi.
- ADD MICRO: What BI tools do -> Embedding dashboards in an app vs a quick Streamlit page for pilot-stage internal tools.

### mlworkflow
- ADD SUBTOPIC: Error analysis: reading the mistakes. Pull the worst errors, slice metrics by segment (region, customer size, new vs old), label error types, and decide whether the fix is data, features or labels. This is the step between "scored" and "ship".
- ADD MICRO: Cross-validation for steadier scores -> GridSearchCV/RandomizedSearchCV code on a Pipeline (the `clf__C` parameter naming) and nested CV when reporting a tuned score. Tuning is described, but this topic has no tuning code.
- ADD MICRO: Train, validation and test splits -> Code for TimeSeriesSplit and GroupKFold. Both are named twice, never shown.
- ADD MICRO: Overfitting, underfitting and bias-variance -> Learning curves (`learning_curve`) to answer the customer question "would more data help?"
- ADD MICRO: Data leakage and reproducibility -> Save and reload the fitted pipeline with joblib, pin the sklearn version, and never unpickle untrusted files. Show a round-trip that scores the same rows.
- ADD MICRO: Framing the problem before the data -> Labels: where they come from, label noise, roughly how many examples are needed, and when a zero-shot LLM classifier is the better day-one baseline than training a model.

### featureeng
- ADD MICRO: Scaling numeric features -> Skewed columns: `np.log1p` or a PowerTransformer for money and counts, plus clipping or winsorizing outliers.
- ADD MICRO: Encoding categories -> OrdinalEncoder for truly ordered categories (small < medium < large), and rare-category grouping with `OneHotEncoder(min_frequency=..., max_categories=...)`.
- ADD MICRO: Features from dates and text -> Point-in-time aggregates in code ("orders in the 90 days before the prediction date", using a groupby with a cutoff or `merge_asof`). The trap is named three times but never shown.
- ADD MICRO: Handling missing values -> Categorical gaps: `SimpleImputer(strategy="constant", fill_value="missing")`. Also KNN/iterative imputers exist, but medians plus flags usually win.
- ADD MICRO: Pipeline, ColumnTransformer and leakage traps -> `get_feature_names_out()` and `set_output(transform="pandas")` to see which columns come out. Also basic feature selection (drop near-constant and duplicate columns).
- ADD MICRO: Interactions and ratios -> Binning (KBinsDiscretizer or `pd.cut`) for business-readable bands such as age groups, and when binning loses information.

### linreg
- ADD MICRO: Assumptions and when it fails -> Code for the two fixes the text recommends: PolynomialFeatures for a curve, and predicting `log(target)` for a funnel (with the back-transform). Neither fix is shown.
- ADD MICRO: Measuring fit: R squared, MAE and RMSE -> Every snippet scores on training rows. Add a train/test (or cross_val_score with `scoring="neg_mean_absolute_error"`) version, matching the lesson's own rule.
- ADD MICRO: Least squares -> Category features as one-hot dummies with `drop="first"` (the dummy-variable trap), and how to read their coefficients against the dropped baseline.
- ADD MICRO: Assumptions and when it fails -> statsmodels OLS `summary()` for p-values and confidence intervals, which finance and risk customers ask for, plus a VIF check for multicollinearity.

### logreg
- FIX: Coefficients as odds, and class imbalance code: `recall_score(y, plain.predict(X))` and `balanced.predict(X)` score recall on the training rows -> split first and report test recall. The lesson elsewhere says never to judge on training data.
- ADD MICRO: Probabilities and thresholds -> Calibration code (`calibration_curve`, `CalibratedClassifierCV`), which is named but not shown. Also choosing the threshold from `precision_recall_curve` or with `TunedThresholdClassifierCV` from a cost function.
- ADD MICRO: Training and the decision boundary -> Tuning C (LogisticRegressionCV), the L1 penalty for sparse models (`solver="liblinear"` or `"saga"`), and fixing ConvergenceWarning by scaling or raising `max_iter`.
- ADD MICRO: Coefficients as odds -> A standardized-coefficient table (feature, coefficient, odds ratio, direction) as the deliverable for a risk or compliance team.

### trees
- ADD MICRO: How a tree makes its splits -> A regression tree example (DecisionTreeRegressor): step-shaped predictions and a demo that it cannot extrapolate past the training max. This is only described today.
- ADD MICRO: How a tree makes its splits -> Categorical inputs for sklearn trees (encode first: ordinal encoding is fine for trees, one-hot splits the signal). Recent sklearn trees also accept NaN.
- ADD MICRO: Bagging and random forests -> The main forest knobs (n_estimators, max_features, max_depth/min_samples_leaf, `class_weight="balanced_subsample"`, n_jobs), model size and latency in production, and that forest probabilities are often poorly calibrated.
- ADD MICRO: Feature importance, its traps -> Partial dependence plots (PartialDependenceDisplay) to show the customer how the prediction moves with one feature, and `plot_tree` for a visual version of export_text. Cross-link SHAP in boosting.
- FIX: Bagging and random forests flow node `"Training rows", "1,000 rows"` -> the example trains on 420 rows (600 x 0.7). Use "420 rows" or "training rows".

## Totals
- ADD SUBTOPIC: 7 (security: SCIM provisioning; caching: profiling; sysdesign: disaster recovery; apistyles: WebSockets; streaming: schemas and registry; integration: safe write-back; mlworkflow: error analysis)
- ADD MICRO: 90
- FIX: 11 (3 of them are real bugs: the text-to-SQL validator bypass in bi, the missing paramiko host-key check in integration, and logreg recall scored on training data; the rest are stale facts or small code and diagram errors)
Spot checks that came out correct: all 30 ML Python outputs; the linreg lr=0.1 divergence claim; the Gini/entropy numbers; the TargetEncoder smoothing value (0.59); the SLO and availability arithmetic; the X12 850 segments; the HITRUST e1/i1/r2 levels; the ISO 27001:2022 control count (93).
