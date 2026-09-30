# AUDIT6_2: deep per-topic audit, Module 2 engineering and data topics (batch N=2)

Scope: http git tdd debugging aicoding bigo resilient sql planner normalize acid spark etl warehouse fastapi deploy cloud entnetwork.
Sources read: every lesson in lessons_*.json, every add_subtopics entry in patch_*.json, and each concept (ideas, traps, qa, steps, code) from lessons_*_concepts.json or build/atlas_v2_backup.html.
Before listing anything as missing I grepped all lessons and patches. Items that another topic already covers are left out: webhooks and HMAC are in apistyles and integration, OAuth and OIDC are in security, Kafka and CDC are in streaming, CI stages are in cicd, and ssh -J is in linux.
Overall: the lessons are strong and accurate. Most gaps are practical commands and edge cases a working FDE needs. There are a few real code bugs, all in etl and resilient.

### http
- ADD MICRO: Headers and authentication -> HTTP Basic auth (requests auth=(user, pw), header Authorization: Basic base64) and API keys sent as a query parameter. Both are still common on legacy enterprise APIs, and Basic auth appears nowhere in the atlas.
- ADD MICRO: JSON bodies in and out -> the other body types: form-encoded (data=), which the OAuth example uses without explaining, and multipart file upload (files={"file": open(...)}). Uploading a PDF or CSV to an API is an everyday FDE task, and multipart appears nowhere.
- ADD MICRO: JSON bodies in and out -> dates arrive as ISO 8601 strings with or without a timezone, and money or large ids are sometimes sent as strings to avoid float loss. Parse them deliberately.
- ADD MICRO: Status codes tell you what happened -> 3xx in practice. requests follows redirects automatically but drops the Authorization header when the redirect goes to a different host (a common surprise 401), and a 301/302 on POST may turn into a GET. Also mention 405 and 413.
- ADD MICRO: Status codes tell you what happened -> rate-limit headers (X-RateLimit-Limit/Remaining/Reset, RateLimit-*) that let a client slow down before it gets a 429.
- ADD MICRO: Pagination: getting all the data -> requests.Session is used but never explained. Explain connection reuse (keep-alive) and default headers, and introduce httpx as the async-capable equivalent.
- ADD MICRO: Debugging with curl first -> GUI and CLI clients (Postman, Bruno, HTTPie) and "Copy as cURL" from browser devtools, which is the fastest way to reproduce a call the customer's web app makes. None of these are mentioned anywhere.

### git
- ADD SUBTOPIC: Rebase versus merge, and keeping a branch up to date: git rebase origin/main compared with merge, what rewriting history means, why you never rebase a shared branch, and the squash, merge and rebase options on a PR. The concept QA says "merge or rebase", but rebase is never taught.
- ADD SUBTOPIC: Rescue tools: stash, reflog, cherry-pick and blame: git stash / stash pop for switching tasks mid-edit, git reflog to recover "lost" commits after a bad reset, cherry-pick to move one fix to a release branch, and blame -L (currently only in debugging).
- ADD MICRO: Undoing mistakes safely -> .gitignore exists only as a code comment. Show a real Python .gitignore (.env, .venv/, __pycache__/, *.pem, data/), explain git rm --cached for a file that is already tracked, and mention a pre-commit secret scanner (gitleaks or detect-secrets).
- ADD MICRO: Undoing mistakes safely -> git reset --soft/--mixed/--hard with one line each. The lesson warns about reset but never shows what it does. Also git commit --amend for fixing the last unpushed commit.
- ADD MICRO: Branches and the remote -> first-time setup: git config user.name/user.email, SSH key or personal access token authentication to GitHub or GitLab (customer GitLab often needs a PAT), and cloning through a proxy (link to entnetwork).
- ADD MICRO: Pull requests and code review -> commit message conventions (imperative subject of 50 characters or fewer, body explaining why, ticket id, optional Conventional Commits) and the fork-and-PR workflow used when you lack write access to the customer's repo.
- ADD MICRO: Pull requests and code review -> tags and releases (git tag -a v1.4.2), which link to the image tags in deploy.

### tdd
- ADD SUBTOPIC: Testing errors, time, files and environment: pytest.raises with match=, pytest.approx for floats (apply_discount uses float money), monkeypatch for environment variables and attributes, tmp_path for files, and freezing the clock (freezegun or an injected now), which the ideas list says to mock but never shows.
- ADD SUBTOPIC: Integration tests against a real database: how the pg_conn fixture referenced in the lesson is actually built (docker compose or testcontainers, a transaction rolled back per test, seeded fixtures), plus recorded HTTP responses (responses/respx/vcrpy) from the QA answer.
- ADD MICRO: Fixtures and parametrised tests -> fixture scope (function/module/session) and yield fixtures for teardown. conftest is mentioned but teardown never is.
- ADD MICRO: CI: tests on every pull request -> coverage with pytest-cov (--cov, --cov-fail-under) and what coverage does and does not prove. The trap mentions coverage but no command is given, and pytest-cov appears nowhere.
- ADD MICRO: CI: tests on every pull request -> the workflow installs with pip install -r requirements.txt pytest, while the take-home subtopic uses uv and make check. Pick one, or show a uv-based workflow with dependency caching.
- ADD MICRO: Your first pytest test -> useful flags: -x, -k, -vv, --lf (rerun last failures), -s (show prints).

### debugging
- ADD SUBTOPIC: Bugs that only happen sometimes or only in production: a diff checklist (config/env vars, library versions from pip freeze, data, timezone/locale, OS/arch, permissions), race conditions and ordering, caches, and how to capture a failing payload in production safely (redacted) so you can replay it.
- ADD SUBTOPIC: Debugging a running service or container: attaching debugpy to a process in a container or pod through a port-forward, kubectl exec plus python -c checks, raising the log level at runtime, and following a request ID across services (link to observability).
- ADD MICRO: Reading tracebacks and logs -> keeping tracebacks in logs with log.exception / exc_info=True, and chaining with raise NewError(...) from e. The subtopic teaches reading chained tracebacks but not producing good ones.
- ADD MICRO: A method: reproduce, isolate, hypothesise, verify -> timebox the investigation and escalate with the bug log after N hours. Also rubber-duck explaining, including to a coding agent.
- ADD MICRO: A debugging session in Python -> the comma fix (replace(",", "")) breaks European formats such as "1.250,00". Mention locale-aware parsing, or at least a test for it, because customers in the EU send this format.

### aicoding
- ADD SUBTOPIC: Driving an agent session: plan first, permissions and context: ask for a plan before edits, permission modes and command allowlists in the tool's settings file, managing the context window (fresh sessions per task, /clear, compaction drift), running parallel agents on separate git worktrees, and headless or CI use (agent PR review, scripted runs).
- ADD MICRO: Security and data rules on customer systems -> hallucinated or typo-squatted package names ("slopsquatting"). Verify that every new dependency exists and is the intended one before installing, and pin it.
- ADD MICRO: Security and data rules on customer systems -> check the customer contract or SOW for clauses on AI-generated code, IP ownership and licence scanning, and record which tool produced which change if their policy requires it.
- ADD MICRO: Giving context: CLAUDE.md, specs, tests -> connecting the agent to the customer's docs, tickets or a read-only database through MCP servers, with a read-only scope (link to mcp).

### bigo
- ADD SUBTOPIC: Measure before you optimise: profiling Python: time.perf_counter and timeit for micro-benchmarks, cProfile plus snakeviz or py-spy to find the hot function in a real job, and tracemalloc for memory. None of these tools appear anywhere in the atlas, yet "the job is slow" is a weekly FDE question.
- ADD MICRO: List versus dict: the most common fix -> other hidden O(n) operations: list.pop(0) and insert(0, x) (use collections.deque), repeated string += in a loop (use join), and x in dict.values().
- ADD MICRO: What Big-O measures -> best, average and worst case, and amortised O(1) (list.append, dict growth). "O(1) on average" appears without being explained.
- ADD MICRO: What Big-O measures -> space complexity in practice. Stream a 10 GB file with a generator or chunked reads (pandas chunksize) instead of loading it whole. Space complexity is in the glossary and ideas but never shown.
- ADD MICRO: Hidden loops: N+1 queries and API calls -> the pandas equivalent: iterrows or apply over rows compared with vectorised column operations or merge (link to pandas).

### resilient
- ADD SUBTOPIC: Rate limiting yourself and circuit breakers: a client-side token bucket or fixed requests per second, capping concurrency (asyncio.Semaphore or a worker pool), and a circuit breaker that stops calling a failing API for a cool-down period. The QA answer relies on a token-bucket limiter that is never taught, and circuit breakers appear nowhere in the atlas.
- FIX: Pagination and checkpoints code -> "save_cursor(cursor) ... if not cursor: break" writes a null cursor at the end, so the next scheduled run restarts the full backfill. Either stop checkpointing once the job completes and switch to an updated_since watermark for incremental runs, or say explicitly that the checkpoint is only for resuming one backfill.
- ADD MICRO: Pagination and checkpoints -> write the checkpoint atomically (write to a temp file, then os.replace) so a crash mid-write cannot corrupt it.
- ADD MICRO: Backoff, jitter and Retry-After -> the text says "Honour it when present", but the tenacity code ignores Retry-After. Show a custom wait function that reads the header, and note that Retry-After may be an HTTP date instead of a number of seconds.
- ADD MICRO: Timeouts and error classes -> reconcile with http: this lesson stops on 401, while http says "refresh token, then retry once". Teach both: refresh once for an expired OAuth token, and stop and alert if it still fails.
- ADD MICRO: Test the failure paths first -> the retry test really sleeps for about 3 seconds because of wait_exponential_jitter. Show fetch_page.retry.wait = wait_none() (or patching sleep) so tests stay fast.

### sql
- ADD SUBTOPIC: More join shapes: anti-joins, self-joins and set operations: LEFT JOIN ... IS NULL versus NOT EXISTS for "in A not in B", the NOT IN with NULL trap (returns no rows), FULL OUTER JOIN for reconciling two sources (none in the atlas), self-join, CROSS JOIN for date spines, and UNION versus UNION ALL.
- ADD SUBTOPIC: Conditional logic, dates and types: CASE WHEN and conditional aggregation (SUM(CASE ...) or FILTER), DATE_TRUNC and time zones on timestamptz, integer division (why the lesson writes 100.0), CAST and NULLIF to avoid dividing by zero. These appear in other topics but are never taught in the SQL lesson itself.
- ADD MICRO: Window functions -> ROW_NUMBER versus RANK versus DENSE_RANK on the same tied data, and frames: ROWS BETWEEN 6 PRECEDING AND CURRENT ROW for a 7-day moving average, plus the default-frame surprise with LAST_VALUE. ROWS BETWEEN appears nowhere in the atlas.
- ADD MICRO: Window functions -> dedupe-latest-row as a named pattern, and QUALIFY on Snowflake/BigQuery/Databricks as the shortcut for the outer-query filter.
- ADD MICRO: CTEs for readable queries -> PostgreSQL 12+ inlines a CTE that is referenced once, and MATERIALIZED / NOT MATERIALIZED override this. Also recursive CTEs for hierarchies (org charts, bills of materials).
- ADD MICRO: Joins and the fan-out trap -> parameterised queries from Python (%s placeholders, never f-strings) and SQL injection. It appears only as a comment in etl.

### planner
- ADD SUBTOPIC: Join algorithms in a plan: nested loop, hash join and merge join, what each node looks like in EXPLAIN, when the planner picks each, plus the Bitmap Index/Heap Scan node beginners see constantly. The steps mention join algorithms but no subtopic explains them.
- ADD SUBTOPIC: Finding slow queries and keeping tables healthy: pg_stat_statements to find the top queries by total time, auto_explain, VACUUM/autovacuum and bloat after big updates or deletes, and index maintenance. pg_stat_statements and VACUUM appear nowhere in the atlas.
- ADD MICRO: B-tree indexes and column order -> CREATE INDEX CONCURRENTLY on a live customer table (a plain CREATE INDEX blocks writes), and dropping indexes safely.
- ADD MICRO: B-tree indexes and column order -> covering indexes with INCLUDE and index-only scans, partial indexes (WHERE status = 'open'), implicit casts that silently disable an index (a text column compared with an integer), and LIKE 'abc%' needing text_pattern_ops under a non-C collation.
- ADD MICRO: Partitioning large tables -> the warehouse equivalents: there are no B-tree indexes in Snowflake/BigQuery, so tuning uses partitioning, clustering keys and pruning instead (link to warehouse).

### normalize
- ADD SUBTOPIC: Schema migrations: evolving a live schema with versioned migrations (Alembic for SQLAlchemy, or Flyway), expand-and-contract for renames, adding a NOT NULL column with a default and backfill, and why old and new app versions must both work during a rollout. Alembic appears nowhere, and deploy assumes "backward compatible migrations" without teaching them.
- ADD MICRO: Tables, primary keys and foreign keys -> column types: NUMERIC for money (never float), timestamptz compared with timestamp, TEXT compared with VARCHAR(n), BOOLEAN, JSONB for semi-structured extras, and created_at/updated_at audit columns with soft delete (deleted_at).
- ADD MICRO: Tables, primary keys and foreign keys -> ON DELETE options side by side (RESTRICT, CASCADE, SET NULL) and when each is right.
- ADD MICRO: 2NF and 3NF: one fact, one place -> name the many-to-many junction table as a general pattern (order_lines is one, but the lesson never says so), plus a one-to-one example.
- ADD MICRO: Tables, primary keys and foreign keys -> reading and drawing an ER diagram (crow's-foot notation, dbdiagram.io or Mermaid erDiagram), because customers hand you diagrams and you hand them back.
- FIX: "customer_id SERIAL PRIMARY KEY" -> still works, but PostgreSQL recommends "customer_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY" (or BIGINT) for new tables. Add a one-line note.

### acid
- ADD SUBTOPIC: Deadlocks and lock ordering: how two transactions that lock rows in opposite order deadlock, the "deadlock detected" error (40P01), fixing it by always locking in a consistent order, lock_timeout and statement_timeout, and retrying. The word deadlock appears nowhere in the atlas.
- ADD SUBTOPIC: Transactions that span an external call: you cannot roll back an API call or an email. Cover the transactional outbox pattern, idempotency keys on the external write, compensating actions (sagas, briefly), and SELECT ... FOR UPDATE SKIP LOCKED for a simple Postgres job queue. This is the exact case of AI agents writing back to systems of record.
- ADD MICRO: Isolation levels and anomalies -> optimistic concurrency with a version column (UPDATE ... WHERE id = %s AND version = %s), which is common in web apps and ORMs.
- ADD MICRO: Isolation levels and anomalies -> dirty reads are listed in the ideas but never explained. Note that PostgreSQL never allows them, even at READ UNCOMMITTED.
- ADD MICRO: Atomicity: BEGIN, COMMIT, ROLLBACK -> savepoints (nested conn.transaction() in psycopg 3 creates one), and ORM sessions (SQLAlchemy session.begin()) as the other way transactions show up in app code.
- ADD MICRO: Isolation levels and anomalies -> in psycopg 3, SET TRANSACTION must be the first statement of the transaction. Set conn.isolation_level = IsolationLevel.SERIALIZABLE, or use an autocommit connection, so a nested transaction() does not become a savepoint that rejects the SET.
- NOTE: "Normalization for transactional data" largely repeats the normalize topic. Shorten it to a cross-link and use the space for the two subtopics above.

### spark
- ADD SUBTOPIC: When not to use Spark: data under tens of GB fits pandas, Polars or DuckDB on one machine, which is faster to build and cheaper. Give the decision rule and show the same aggregation in DuckDB. FDEs regularly get asked to "use Spark" for 2 GB.
- ADD SUBTOPIC: Spark SQL, the Spark UI and Databricks basics: spark.sql() and createOrReplaceTempView, reading Jobs, Stages and SQL tabs and task metrics (spill, skew), and notebooks, jobs and clusters on Databricks. The UI is only in the practice tasks, and spark.sql appears nowhere.
- ADD MICRO: Joins: broadcast and skew -> the example says "salting city ... for a join", but the code salts an aggregation. Show a salted join, where the small side is exploded across the N salt values.
- ADD MICRO: Writing output for fast reads -> mode("overwrite") combined with partitionBy deletes all existing partitions unless spark.sql.sources.partitionOverwriteMode=dynamic. This is a classic data-loss trap.
- ADD MICRO: Driver, executors and partitions -> repartition(n) (full shuffle) versus coalesce(n) (no shuffle, can only reduce). The lesson uses both but never contrasts them.
- ADD MICRO: Writing output for fast reads -> Delta Lake/Iceberg writes (MERGE INTO, OPTIMIZE/compaction, time travel) as the modern target instead of plain Parquet folders.
- ADD MICRO: Lazy evaluation and actions -> schema handling on read: inferSchema is slow and guesses wrong on CSV, so supply an explicit StructType. Also reading JSON with nested fields.
- FIX: concept step "The shuffle": "Data is serialized (Kryo is faster than Java serialization)" -> for DataFrames, Spark uses its own Tungsten binary format during shuffles, and Kryo matters mainly for RDD code. Reword so learners do not tune Kryo for a DataFrame job.

### etl
- FIX: land_raw code -> df.to_parquet(f"{path}/part-0.parquet") raises FileNotFoundError because pandas does not create the load_date= folder. Add pathlib.Path(path).mkdir(parents=True, exist_ok=True).
- FIX: land_raw code -> pd.Timestamp.utcnow() is deprecated in pandas 2.2+. Use pd.Timestamp.now(tz="UTC").
- FIX: extract_orders plus the Airflow DAG -> fetchall() returns tuples, so pd.DataFrame(rows) in land_raw loses the column names. Use psycopg's row_factory=dict_row. The DAG also never calls save_watermark, so every run re-extracts the same window. Compute the new watermark as max(updated_at) and save it after a successful load.
- ADD MICRO: Extracting: full loads and watermarks -> a strict updated_at > watermark misses late-committing rows and ties at the same timestamp. Use >= with a small look-back overlap plus dedupe/MERGE, and keep timestamps in UTC. Also explain how deletes are detected without CDC (a soft-delete flag or a periodic full key comparison).
- ADD MICRO: Orchestrating the whole pipeline -> Airflow 3 (released 2025) moved the TaskFlow imports to "from airflow.sdk import dag, task". Note both, and explain catchup and backfills (re-running a date range) and passing the logical date so each run processes its own window.
- ADD SUBTOPIC: Buy before you build: managed connectors: Fivetran, Airbyte, dlt and cloud-native ingestion (AWS DMS, Azure Data Factory), when a managed connector beats custom code (standard SaaS sources) and when it does not (on-prem legacy, custom APIs). None of these tools are mentioned anywhere.
- ADD MICRO: Data quality tests and freshness -> row-count reconciliation against the source and volume anomaly checks (today's count against a 7-day average). The QA lists these but no subtopic shows them.
- ADD MICRO: Orchestrating the whole pipeline -> PII masking in the T of ETL (hashing or tokenising identifiers, dropping free text) with a small code example, since that is the lesson's own reason for choosing ETL.

### warehouse
- ADD SUBTOPIC: dbt materializations and incremental models: view, table, incremental (is_incremental() with a unique_key and merge strategy) and ephemeral, when each fits, and full-refresh. Incremental dbt models appear nowhere in the atlas, yet they are how large fact tables are built.
- ADD SUBTOPIC: Access control and cost on a warehouse: roles and grants, row-level security and column masking policies for PII, warehouse sizing and auto-suspend on Snowflake, slot/on-demand pricing on BigQuery, and query tags for cost attribution.
- ADD MICRO: dbt models, tests and lineage -> project anatomy: profiles.yml connection, dbt_project.yml, seeds, macros and Jinja basics, and the everyday commands (dbt run/test/build/seed/docs, --select with +).
- ADD MICRO: The main platforms and the lakehouse -> connecting from Python (snowflake-connector-python, google-cloud-bigquery, databricks-sql-connector) and pulling a result into pandas safely (LIMIT, only the columns you need).
- FIX (consistency): the etl dbt YAML uses the older "relationships: to/field" form without arguments:, while this lesson uses the dbt 1.10+ "arguments:" form. Align both so learners do not think one of them is wrong.

### fastapi
- ADD SUBTOPIC: Settings, lifespan and app structure: pydantic-settings BaseSettings for env config, the lifespan context manager for creating and closing shared clients (the module-level httpx.AsyncClient is never closed) and loading models once, APIRouter per module, and exception handlers for consistent error bodies. lifespan and exception_handler appear nowhere.
- ADD SUBTOPIC: File uploads and long-running jobs: UploadFile / File(...) for PDFs and CSVs (python-multipart), size limits, BackgroundTasks for short fire-and-forget work, and a queue plus job-status endpoint (202 Accepted, then GET /jobs/{id}) for minute-long LLM or document jobs. The trap mentions a background queue, but it is never shown.
- ADD SUBTOPIC: A real database: SQLAlchemy 2.0 models and sessions (sync and async), the get_db dependency done fully (SessionLocal is referenced but never defined), and Alembic migrations (link to normalize).
- ADD MICRO: Your first endpoint -> running in production: --reload is for development only. Cover uvicorn --workers or gunicorn with uvicorn workers, --proxy-headers behind a load balancer, and one worker per container on Kubernetes.
- ADD MICRO: Testing with TestClient and overrides -> test_with_auth_overridden will error because get_db builds a real SessionLocal. Override get_db with a fake as well, as the example text promises ("overrides the database with a fake").
- ADD MICRO: Streaming LLM answers -> handle client disconnects (request.is_disconnected()), send an error event mid-stream instead of a broken connection, and warn that proxies and ingress controllers may buffer SSE (disable buffering, raise idle timeouts).
- ADD MICRO: concept code -> CORSMiddleware appears only in the concept code. Explain in a lesson what CORS is and when a browser front end needs it.

### deploy
- ADD SUBTOPIC: Local multi-container dev with Docker Compose: a compose.yaml with api + postgres + a vector DB, depends_on with healthchecks, volumes and .env. It is the standard way to hand a customer a runnable pilot, and compose appears only in passing elsewhere.
- ADD SUBTOPIC: Jobs, CronJobs and namespaces: running nightly pipelines and one-off migrations as Kubernetes Job/CronJob, namespaces and kubectl contexts (kubectl config use-context, -n), and kubectl port-forward to reach a service without an Ingress. CronJob and port-forward appear nowhere.
- ADD MICRO: Writing a small, safe Dockerfile -> building on an Apple Silicon laptop produces arm64 images that fail on amd64 clusters with "exec format error". Use docker buildx build --platform linux/amd64. This is a very common day-one FDE failure.
- ADD MICRO: Writing a small, safe Dockerfile -> ENV PYTHONUNBUFFERED=1 (otherwise logs appear late or not at all in kubectl logs), pinning the base image by digest, and scanning the image (trivy, or the registry scanner).
- ADD MICRO: Health probes, resources and autoscaling -> startupProbe for slow model loading, so the liveness probe does not kill the pod before it is ready (named as a CrashLoopBackOff cause but never solved). Also separate /live and /ready endpoints.
- ADD MICRO: Ingress, rollouts and rollbacks -> graceful shutdown: handle SIGTERM, terminationGracePeriodSeconds and draining in-flight requests during rolling updates. Also a PodDisruptionBudget.
- ADD MICRO: Health probes, resources and autoscaling -> requesting GPUs (resources.limits nvidia.com/gpu: 1, node selectors/tolerations) for self-hosted models, or link to serving if it covers this.

### cloud
- ADD SUBTOPIC: Getting access and working from the CLI: aws configure sso / named profiles / aws sts get-caller-identity, gcloud auth login and application-default credentials, az login and subscriptions, assuming a role the customer grants (cross-account role with an external ID), and never using long-lived access keys. CLI auth appears nowhere, but it is the first hour of every cloud engagement.
- ADD SUBTOPIC: Choosing where code runs: VMs (EC2/Compute Engine/Azure VM), containers on managed Kubernetes, serverless containers (Cloud Run, ECS Fargate, Azure Container Apps) and functions (Lambda/Cloud Functions), with a decision table on cost, cold starts, GPUs and customer ops skills. The concept table skips compute options entirely.
- FIX: concept code backend "s3" { ... dynamodb_table = "tf-locks" } -> DynamoDB locking is deprecated since Terraform 1.11. Use use_lockfile = true (S3-native locking). Keep a note on the older form for existing customer repos.
- ADD MICRO: The Terraform workflow and state -> show the moved block that the example mentions, plus import blocks / terraform import for resources a customer created by hand, and terraform plan -detailed-exitcode in CI to detect drift.
- ADD MICRO: Variables, modules and environments -> count and for_each for creating several similar resources, data sources to look up existing VPCs or subnets the customer already owns, pinned provider versions (required_providers), and OpenTofu as the open-source fork some customers mandate.
- ADD MICRO: IAM and least privilege -> encryption keys: KMS / Cloud KMS / Key Vault, customer-managed keys (CMK) that banks require, and granting kms:Decrypt alongside s3:GetObject when a bucket uses SSE-KMS (a common AccessDenied cause).
- ADD MICRO: Networking: VPCs, subnets and security groups -> the example references aws_security_group.api, which is never defined, so terraform validate fails. Define it or add a comment. Also add S3/Storage gateway endpoints so private subnets reach object storage without a NAT.

### entnetwork
- ADD MICRO: TLS inspection and custom CA bundles -> Java needs keytool -importcert -keystore $JAVA_HOME/lib/security/cacerts (or a custom truststore passed with -Djavax.net.ssl.trustStore). The lesson says Java has its own keystore but gives no command, and keytool appears nowhere.
- ADD MICRO: TLS inspection and custom CA bundles -> inside containers, copy the CA into /usr/local/share/ca-certificates/ and run update-ca-certificates in the Dockerfile, so every runtime in the image trusts it.
- ADD MICRO: Corporate proxies and HTTPS_PROXY -> Docker specifics: the daemon needs its own proxy (systemd drop-in or daemon.json) to pull images, docker build needs --build-arg HTTPS_PROXY, and Kubernetes pods need proxy env vars set in the Deployment, plus NO_PROXY for .svc and .cluster.local and the cluster CIDR.
- ADD MICRO: Corporate proxies and HTTPS_PROXY -> internal package mirrors (Artifactory, Nexus) with pip index-url, npm registry and a Docker registry mirror, as the usual answer when pypi.org is blocked (link to wherever pip.conf is covered in lessons_x).
- ADD MICRO: Diagnosing 'works on my laptop, not in their network' -> streaming responses (SSE, WebSockets) break behind proxies that buffer or cut idle connections at 30 to 60 seconds. Symptoms and the request to make (buffering off, longer idle timeout, or heartbeats).
- ADD MICRO: Firewalls, allowlists and egress rules -> the reverse direction: some SaaS APIs require the customer's static egress IPs to be allowlisted on the vendor side. Ask for the proxy or NAT public IPs early. Also mention mTLS client certificates that some enterprise APIs require.
- Otherwise complete. This is the strongest lesson in the batch.

## Counts
Totals: 28 new subtopics, 75 micro additions and 8 fixes.
Fixes by topic: etl 3 (the land_raw folder bug, the utcnow deprecation, and tuple rows plus an unsaved watermark), resilient 1 (the checkpoint reset), spark 1 (Kryo wording), cloud 1 (dynamodb_table deprecated), normalize 1 (SERIAL), warehouse 1 (dbt YAML consistency). Smaller code defects are filed as micros: fastapi get_db override, cloud undefined security group, acid psycopg SET TRANSACTION, spark salted-join mismatch.
Complete apart from micros: http and entnetwork. No topic has a wrong core fact.
