const NEW = [
/* ================================================= MODULE 1 */
{id:"genesis", mod:1, sec:"1.1 and 1.3", name:"Palantir origin and roles",
 title:"Echoes, Deltas and the FDE as a human API",
 thesis:"Palantir invented the role because its customers' problems didn't fit a spec. A strategist and a small team of engineers sat inside the customer and turned the mission into software on a shared platform.",
 vb:[710,290],
 nodes:[
  ["mission",90,70,"Client mission","analysts · ops"],
  ["echo",265,70,"Echo","deployment strategist"],
  ["delta",440,70,"Deltas","FDE engineers"],
  ["platform",615,70,"Platform","Gotham · Foundry"],
  ["live",615,220,"Live workflow","in production"],
  ["feedback",440,220,"Field feedback","gaps · workarounds"],
  ["product",265,220,"Core product","new capability"],
  ["nextc",90,220,"Next customer","less custom work"]
 ],
 edges:[["mission","echo"],["echo","delta"],["delta","platform"],["platform","live"],["live","feedback"],["feedback","product"],["product","nextc"]],
 steps:[
  {t:"A mission, not a spec", n:["mission"], d:"Palantir's first customers were intelligence and defense agencies (Gotham), later commercial firms (Foundry). Their problems were urgent and messy, and nobody could write a clean requirements document for them."},
  {t:"The Echo frames the problem", n:["echo"], e:["mission>echo"], d:"The Echo, or Deployment Strategist, lives with the customer. They learn the mission, the users and the politics, own the relationship, and decide which problem is worth solving first."},
  {t:"Deltas build it", n:["delta"], e:["echo>delta"], d:"Deltas are the Forward Deployed Software Engineers. They integrate the customer's data, write the code and ship. Together, Echo and Deltas act as a human API between the customer's reality and the product."},
  {t:"On a shared platform", n:["platform"], e:["delta>platform"], d:"Deltas build on Gotham or Foundry instead of from scratch. That is what separates an FDE from a consultant: the work compounds into a product."},
  {t:"Running in production", n:["live"], e:["platform>live"], d:"The output is a workflow people use every day, not a slide deck or a proof of concept."},
  {t:"Field feedback", n:["feedback"], e:["live>feedback"], d:"The field sees what the product can't do yet: missing connectors, awkward workflows, repeated workarounds."},
  {t:"Back into the product", n:["product"], e:["feedback>product"], d:"Repeated field work becomes a core capability. The FDE team is effectively paid discovery for the product roadmap."},
  {t:"The next deployment is cheaper", n:["nextc"], e:["product>nextc"], d:"Each customer needs less custom work than the last. This is the loop every FDE org is trying to run."}
 ],
 ideas:["SWE: one capability, many customers. FDE: one customer, many capabilities.","FDE vs. Customer Success Engineer: a CSE drives adoption and health after the sale and rarely ships production code.","FDE vs. Solutions Architect: an SA designs and advises, mostly pre-sale. An FDE writes and ships the code.","FDE vs. tech consultant: a consultant bills hours and hands over artifacts. An FDE builds on a product and feeds it back.","A typical FDE spends 70 to 80% of their time on code and model work."],
 traps:["Describing the FDE as a sales engineer or support role.","Forgetting the product feedback half of the job.","Treating 'human API' as meaning you just relay requests. You translate and build."],
 qa:[["What's the difference between an FDE and a solutions architect?","An SA designs the solution and advises, usually before the sale. An FDE owns delivery: writes and ships production code inside the customer and feeds what they learn back to the product."],
     ["Why did Palantir split Echoes and Deltas?","Framing the problem and building the solution are different skills, and both are full-time jobs on a hard deployment. The Echo keeps the Deltas focused on the right problem and shields them from admin drag."],
     ["What does 'human API' mean to you?","The FDE is the interface between a messy customer environment and a clean product: they take unstructured needs in and return working software, and pass structured feedback to the product team."]]
},
{id:"slg", mod:1, sec:"1.2", name:"Services-led growth",
 title:"The services-led growth flywheel",
 thesis:"FDEs cost money up front, which lowers gross margin. Companies accept that because deep deployments create usage, proprietary data and expansion revenue. That is the margin-for-moat trade.",
 vb:[710,290],
 nodes:[
  ["invest",90,70,"FDE investment","lower gross margin"],
  ["deploy",265,70,"Deep deploy","real workflows"],
  ["usage",440,70,"Usage uplift","adoption depth"],
  ["data",615,70,"Process data","proprietary"],
  ["product",615,220,"Better product","models · features"],
  ["nrr",440,220,"Expansion","NRR above 100%"],
  ["moat",265,220,"Switching cost","the moat"],
  ["funds",90,220,"Funds more FDEs","next accounts"]
 ],
 edges:[["invest","deploy"],["deploy","usage"],["usage","data"],["data","product"],["product","nrr"],["nrr","moat"],["moat","funds"],["funds","invest",0,"repeat"]],
 steps:[
  {t:"Spend on FDEs", n:["invest"], d:"Engineers embedded with customers are expensive and don't scale like software. Gross margin drops compared with pure self-serve SaaS. This is the 'margin' side of the trade."},
  {t:"Go deep, not wide", n:["deploy"], e:["invest>deploy"], d:"FDEs wire the product into the customer's core workflows and data, the part a self-serve customer never gets to."},
  {t:"Usage goes up", n:["usage"], e:["deploy>usage"], d:"More teams, more workflows, more daily users. Adoption depth is the metric: how central the product is to how the customer operates."},
  {t:"Proprietary process data", n:["data"], e:["usage>data"], d:"Every workflow generates data about how work actually gets done: decisions, exceptions, corrections. Competitors can't buy this."},
  {t:"The product improves", n:["product"], e:["data>product"], d:"That data trains better models and shows which features to build. This is the data flywheel."},
  {t:"Expansion revenue", n:["nrr"], e:["product>nrr"], d:"Net Revenue Retention = (starting ARR + expansion − contraction − churn) / starting ARR. Above 100% means existing customers grow even with no new logos. FDE-heavy companies aim well above it."},
  {t:"The moat", n:["moat"], e:["nrr>moat"], d:"A product woven into core workflows, tuned on the customer's own data, is very hard to rip out. This is the 'moat' side of the trade."},
  {t:"Reinvest", n:["funds","invest"], e:["moat>funds","funds>invest"], d:"Expansion revenue pays for the next FDE deployments, and each one is cheaper because the product has absorbed earlier field work."}
 ],
 ideas:["Services-Led Growth (SLG): use hands-on delivery to land and expand, instead of product-led self-serve.","Margin-for-moat: accept lower early margins for stickier, larger accounts.","NRR is the headline metric FDE orgs move.","The trade only works if field work flows back into the product. Otherwise it's just a consulting business."],
 traps:["Calling FDEs a cost center without mentioning NRR and the data flywheel.","Ignoring that margins must improve over time as the product absorbs custom work."],
 qa:[["Why would a software company accept lower margins to run an FDE team?","Because deep deployments raise NRR and switching costs, and the field work becomes product. Margin is traded now for a durable moat and expansion revenue later."],
     ["What is NRR and how does an FDE influence it?","Revenue from existing customers this year over last year, including expansion and churn. FDEs raise it by driving adoption into new teams and workflows and by preventing churn on hard deployments."],
     ["When does services-led growth fail?","When every deployment is bespoke and nothing flows back to the product, so margins never improve and the company becomes a consultancy."]]
},
/* ================================================= MODULE 2 */
{id:"resilient", mod:2, sec:"2.1", name:"Resilient API ingestion",
 title:"Clean code against unreliable customer APIs",
 thesis:"Customer systems rate limit, time out and return bad data. Defensive code expects all three: retry what's transient, validate at the boundary, and never drop a bad record silently.",
 vb:[710,420],
 codeTitle:"Python: retries, validation, dead letters",
 code:`@retry(wait=wait_exponential_jitter(initial=1, max=30),
       stop=stop_after_attempt(5),
       retry=retry_if_exception_type(RetryableError))
def fetch_page(cursor: str | None) -> dict:
    r = session.get(URL, params={"cursor": cursor}, timeout=10)
    if r.status_code == 429:
        raise RetryableError(r.headers.get("Retry-After"))
    if r.status_code >= 500:
        raise RetryableError(r.status_code)
    r.raise_for_status()          # 4xx: a bug, don't retry
    return r.json()

def load(rows):
    for row in rows:
        try:
            yield Order.model_validate(row)   # pydantic schema
        except ValidationError as e:
            dead_letter.put(row, str(e))

# test_ingest.py: mock 429, 500 and malformed rows first (TDD)`,
 nodes:[
  ["caller",90,70,"Your pipeline","paginated pull"],
  ["client",265,70,"API client","timeout 10s"],
  ["api",440,70,"Customer API","rate limited",1],
  ["resp",615,70,"Response","status?"],
  ["retry",615,210,"429 / 5xx","backoff + jitter"],
  ["validate",440,210,"Validate","schema · nulls"],
  ["store",265,210,"Clean records","typed · tested"],
  ["dlq",440,350,"Dead letter","bad rows kept"]
 ],
 edges:[["caller","client"],["client","api"],["api","resp"],["resp","retry"],["retry","client",0,"retry"],["resp","validate",0,"200"],["validate","store"],["validate","dlq"]],
 steps:[
  {t:"Pull a page", n:["caller","client"], e:["caller>client"], d:"Paginate with a cursor, not an offset, so rows inserted mid-pull don't shift pages. Wrap the customer's API in a small client class (the adapter pattern) so the rest of your code never sees its quirks.", l:[3,4]},
  {t:"Always set a timeout", n:["api"], e:["client>api"], d:"A request with no timeout can hang a worker forever. Every outbound call gets one.", l:[4]},
  {t:"Classify the response", n:["resp"], e:["api>resp"], d:"429 and 5xx are transient and worth retrying. Other 4xx errors mean your request is wrong, so retrying only hides a bug.", l:[5,6,7,8,9]},
  {t:"Back off and retry", n:["retry","client"], e:["resp>retry","retry>client"], d:"Wait 1s, 2s, 4s... with random jitter so parallel workers don't retry in lockstep. Honour the Retry-After header. Stop after a few attempts and alert. Writes need idempotency keys so a retry can't double-charge.", l:[0,1,2,6]},
  {t:"Validate at the boundary", n:["validate"], e:["resp>validate"], d:"Parse every record into a typed schema. Missing fields, wrong types and nulls fail here, loudly, instead of three steps downstream.", l:[12,13,14,15]},
  {t:"Keep the good rows", n:["store"], e:["validate>store"], d:"Clean, typed records flow on. Decide per field how to handle missing data: reject, default, or impute, and document the choice."},
  {t:"Never drop bad rows silently", n:["dlq"], e:["validate>dlq"], d:"Bad rows go to a dead-letter queue or table with the error, so you can report data quality to the customer and replay after a fix.", l:[16,17]},
  {t:"Test the failure paths first", n:["client","validate"], d:"In TDD you write tests for the 429, the 500 and the malformed row before the code. Mock the API. Complexity check: the pipeline is O(n) in rows; keep it that way.", l:[19]}
 ],
 ideas:["Transient (retry): 429, 502, 503, 504, timeouts. Permanent (fix): 400, 401, 403, 404, 422.","Exponential backoff with jitter, capped attempts, Retry-After honoured.","Idempotency keys on any write that could be retried.","Validate at the boundary; quarantine bad data instead of dropping it.","Git hygiene: small commits, feature branches, PRs with tests."],
 traps:["Retrying 400s forever.","No timeout on HTTP calls.","Swallowing exceptions with a bare except and moving on."],
 qa:[["The customer API rate limits you at 100 requests a minute and you need 2 million records. What do you do?","Ask for a bulk export or webhook first. Otherwise paginate with large pages, use a token-bucket limiter under the limit, back off on 429, checkpoint the cursor so the job can resume, and run it incrementally after the first backfill."],
     ["How do you handle missing data in a pipeline?","Validate at ingestion, decide per field whether to reject, default or impute, quarantine rejects with reasons, and report data-quality metrics to the customer."],
     ["What design pattern would you use to integrate a flaky customer API?","An adapter: one client class that hides auth, pagination, retries and field mapping, with an interface the rest of the code depends on so it can be mocked in tests."]]
},
{id:"planner", mod:2, sec:"2.2", name:"Query planning and indexes",
 title:"How a database plans and runs your query",
 thesis:"The same SQL can take 2 ms or 2 minutes depending on the plan. Reading EXPLAIN ANALYZE and choosing the right index is one of the most practical skills an FDE brings to a customer's database.",
 vb:[710,290],
 codeTitle:"PostgreSQL: EXPLAIN ANALYZE",
 code:`EXPLAIN ANALYZE
SELECT * FROM orders
WHERE customer_id = 42 AND created_at >= '2026-09-01';

Index Scan using idx_orders_cust_created on orders
  (cost=0.43..8.61 rows=12 width=64)
  (actual time=0.031..0.058 rows=11 loops=1)
  Index Cond: ((customer_id = 42) AND
               (created_at >= '2026-09-01'))
Planning Time: 0.210 ms
Execution Time: 0.081 ms

CREATE INDEX idx_orders_cust_created
    ON orders (customer_id, created_at);   -- B-tree
CREATE INDEX ON docs USING gin (tags);     -- arrays, JSONB
CREATE TABLE events (...) PARTITION BY RANGE (created_at);`,
 nodes:[
  ["sql",90,70,"SQL text","your query"],
  ["parser",265,70,"Parser","syntax → tree"],
  ["rewriter",440,70,"Rewriter","views expanded"],
  ["planner",615,70,"Planner","cost-based"],
  ["stats",615,220,"Statistics","row estimates",1],
  ["plan",440,220,"Plan choice","seq vs. index"],
  ["index",265,220,"B-tree index","(customer, date)"],
  ["exec",90,220,"Executor","11 rows out"]
 ],
 edges:[["sql","parser"],["parser","rewriter"],["rewriter","planner"],["stats","planner",0,"estimates"],["planner","plan"],["plan","index"],["index","exec"]],
 steps:[
  {t:"Parse", n:["sql","parser"], e:["sql>parser"], d:"The parser checks syntax and builds a tree. Typos fail here, before anything touches data.", l:[1,2]},
  {t:"Rewrite", n:["rewriter"], e:["parser>rewriter"], d:"Views are expanded into their underlying queries and rules applied. A query on a view is really a query on its base tables."},
  {t:"Plan by cost", n:["planner","stats"], e:["rewriter>planner","stats>planner"], d:"The planner enumerates ways to run the query (scan types, join orders, join algorithms) and estimates each one's cost from table statistics: row counts and value distributions."},
  {t:"Seq scan or index scan?", n:["plan"], e:["planner>plan"], d:"If the filter matches a small fraction of rows, an index scan wins. If it matches most of the table, reading everything sequentially is cheaper. Bad statistics lead to the wrong choice; run ANALYZE.", l:[4,5]},
  {t:"Walk the B-tree", n:["index"], e:["plan>index"], d:"A B-tree finds the first matching key in O(log n) and then reads a range. In a composite index put equality columns first (customer_id), then the range column (created_at).", l:[7,8,12,13]},
  {t:"Execute and compare", n:["exec"], e:["index>exec"], d:"EXPLAIN ANALYZE shows estimated rows (12) next to actual rows (11). A large gap between them is the first thing to look for when a query is slow.", l:[6,9,10]},
  {t:"Other index types", n:["index"], d:"Hash indexes handle equality only. GIN is an inverted index for arrays, JSONB and full-text search. Every index speeds reads but slows writes and costs storage.", l:[14]},
  {t:"Partitioning", n:["plan"], d:"Split a huge table by a key such as month. The planner skips partitions that can't match (partition pruning), and old partitions can be dropped instantly.", l:[15]}
 ],
 ideas:["Read plans bottom-up; compare estimated and actual rows.","B-tree: equality, ranges and sorting (the default). Hash: equality only. GIN: contains-style lookups on arrays, JSONB and text.","Composite index order matters: equality columns first, then range.","Functions on an indexed column (WHERE lower(email) = ...) skip the index unless you index the expression."],
 traps:["Adding an index for every slow query without checking write load.","Leading-wildcard LIKE '%abc' expecting a B-tree to help.","Trusting EXPLAIN without ANALYZE (estimates only)."],
 qa:[["A report query went from 2 seconds to 2 minutes overnight. How do you debug it?","Run EXPLAIN ANALYZE, look for a plan change and a big gap between estimated and actual rows. Usually stale stats after a bulk load (run ANALYZE), data growth tipping an index scan into a seq scan, or a new join. Then fix the stats, index or query."],
     ["When would the database ignore your index?","When the filter matches a large share of rows, when you wrap the column in a function or cast, when the leading column of a composite index isn't filtered, or when stats are wrong."],
     ["B-tree vs. GIN?","B-tree for ordered lookups on scalar values. GIN for 'does this array or document contain X' queries, such as JSONB keys, tags or full-text search."]]
},
{id:"acid", mod:2, sec:"2.2", name:"Transactions and ACID",
 title:"What a transaction guarantees",
 thesis:"ACID is why a bank transfer can't half-happen. You'll need it when an AI workflow writes back to a customer's system of record.",
 vb:[710,290],
 codeTitle:"A transfer, and a concurrent reader",
 code:`-- Transaction A
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
-- CHECK (balance >= 0) is enforced on each row
COMMIT;            -- or ROLLBACK if anything failed

-- Transaction B, at the same time (READ COMMITTED)
SELECT balance FROM accounts WHERE id = 1;
-- sees the last committed value until A commits`,
 nodes:[
  ["ta",90,70,"Transaction A","transfer $100"],
  ["begin",265,70,"BEGIN","two updates"],
  ["locks",440,70,"Row locks","acct 1 and 2"],
  ["wal",615,70,"WAL","logged first"],
  ["commit",615,220,"COMMIT","durable"],
  ["rollback",440,220,"ROLLBACK","on any error"],
  ["mvcc",265,220,"MVCC snapshot","old version"],
  ["tb",90,220,"Transaction B","reads balance"]
 ],
 edges:[["ta","begin"],["begin","locks"],["locks","wal"],["wal","commit"],["locks","rollback"],["tb","mvcc"],["mvcc","locks",0,"no wait"]],
 steps:[
  {t:"Start a transaction", n:["ta","begin"], e:["ta>begin"], d:"Both updates belong to one unit of work. Atomicity: either both apply or neither does.", l:[1,2,3]},
  {t:"Lock the rows being changed", n:["locks"], e:["begin>locks"], d:"Writers lock the rows they change, so two transfers can't both subtract from the same balance and lose an update."},
  {t:"A reader arrives", n:["tb","mvcc"], e:["tb>mvcc","mvcc>locks"], d:"With MVCC (PostgreSQL, Oracle, MySQL InnoDB) the reader sees the last committed version of the row and doesn't wait for the writer. Isolation: nobody sees A's half-finished work.", l:[7,8,9]},
  {t:"Constraints hold", n:["locks"], d:"Consistency: CHECK, foreign key and unique constraints are enforced. A transfer that would make a balance negative fails.", l:[4]},
  {t:"Write-ahead log", n:["wal"], e:["locks>wal"], d:"Changes go to the write-ahead log and are flushed to disk before COMMIT returns. After a crash, the database replays the log."},
  {t:"Commit", n:["commit"], e:["wal>commit"], d:"Durability: once COMMIT returns, the change survives a crash. Now new readers see the new balances.", l:[5]},
  {t:"Or roll back", n:["rollback"], e:["locks>rollback"], d:"If anything fails, ROLLBACK undoes everything since BEGIN. The database is exactly as it was.", l:[5]}
 ],
 ideas:["Atomicity, Consistency, Isolation, Durability.","Isolation levels: READ COMMITTED (PostgreSQL default), REPEATABLE READ, SERIALIZABLE. Higher means fewer anomalies and more retries.","Anomalies to know: dirty read, non-repeatable read, phantom, lost update, write skew.","Normalization (1NF to 3NF) removes duplicated data for transactional systems; analytics tables are often denormalized on purpose."],
 traps:["Doing read-modify-write in application code without a lock or SELECT ... FOR UPDATE.","Holding a transaction open while calling an LLM or external API.","Assuming SERIALIZABLE never needs retry logic."],
 qa:[["Two agents approve the same refund at the same moment. How do you prevent a double refund?","Do it in one transaction with a row lock (SELECT ... FOR UPDATE) or a conditional update (UPDATE ... WHERE status = 'pending'), plus a unique constraint or idempotency key on the refund."],
     ["Why not hold a transaction open during an LLM call?","It holds locks for seconds, blocking other writers and exhausting connections. Call the model first, then open a short transaction to write the result."],
     ["Normalize or denormalize?","Normalize the operational database to keep writes consistent. Denormalize into wide tables or marts for analytics and AI retrieval, where reads dominate."]]
},
{id:"spark", mod:2, sec:"2.2", name:"Spark execution",
 title:"How a Spark job runs across a cluster",
 thesis:"Spark splits data into partitions and runs the same work on each in parallel. Performance lives or dies on shuffles, partition sizes and skew.",
 vb:[710,290],
 codeTitle:"PySpark: spend per customer",
 code:`df = (spark.read.parquet("s3://lake/events/")       # 2,000 files
        .filter(F.col("date") >= "2026-09-01")       # narrow
        .withColumn("amt", F.col("amt").cast("double")))
agg = (df.groupBy("customer_id")                     # wide: shuffle
         .agg(F.sum("amt").alias("spend")))
out = agg.join(F.broadcast(customers), "customer_id")  # small side copied
spark.conf.set("spark.sql.shuffle.partitions", "400")
spark.conf.set("spark.sql.adaptive.enabled", "true")   # AQE: skew, coalesce
out.write.partitionBy("region").parquet("s3://lake/marts/spend/")  # action`,
 nodes:[
  ["code",90,70,"PySpark code","lazy transforms"],
  ["driver",265,70,"Driver","plan → DAG"],
  ["stages",440,70,"Stages","split at shuffle"],
  ["tasks",615,70,"Tasks","1 per partition"],
  ["exec",615,220,"Executors","cores · memory"],
  ["shuffle",440,220,"Shuffle","network · disk"],
  ["stage2",265,220,"Stage 2","aggregate + join"],
  ["write",90,220,"Write","partitioned parquet"]
 ],
 edges:[["code","driver"],["driver","stages"],["stages","tasks"],["tasks","exec"],["exec","shuffle"],["shuffle","stage2"],["stage2","write"]],
 steps:[
  {t:"Transformations are lazy", n:["code"], d:"filter, withColumn and groupBy only build a plan. Nothing runs until an action such as write, count or collect.", l:[0,1,2,3,4]},
  {t:"The driver plans", n:["driver"], e:["code>driver"], d:"On the action, the driver's Catalyst optimizer rewrites the plan (for example pushing the date filter into the Parquet read) and builds a DAG.", l:[8]},
  {t:"Stages split at shuffles", n:["stages"], e:["driver>stages"], d:"Narrow operations (filter, cast) run in one pass on each partition. A wide operation (groupBy, join) needs data from every partition, which ends a stage.", l:[1,3]},
  {t:"One task per partition", n:["tasks","exec"], e:["stages>tasks","tasks>exec"], d:"Each partition becomes a task on an executor core. Aim for partitions around 100 to 200 MB. Thousands of tiny files mean scheduling overhead; a few huge ones mean idle cores and spills."},
  {t:"The shuffle", n:["shuffle"], e:["exec>shuffle"], d:"Rows are redistributed by customer_id across the network and disk. Data is serialized (Kryo is faster than Java serialization). This is usually the most expensive step.", l:[6]},
  {t:"Skew", n:["stage2"], e:["shuffle>stage2"], d:"If one customer has 40% of events, one task gets 40% of the work and the job waits on it. Fix with Adaptive Query Execution's skew handling or by salting the key.", l:[7]},
  {t:"Broadcast small tables", n:["stage2"], d:"Joining to a small customers table? Broadcast it to every executor so the big side never shuffles.", l:[5]},
  {t:"Write partitioned output", n:["write"], e:["stage2>write"], d:"Partitioning output by region lets downstream readers skip whole folders, the same idea as partition pruning in a database.", l:[8]}
 ],
 ideas:["Narrow vs. wide transformations; every wide one costs a shuffle.","Memory: executors spill to disk when a partition doesn't fit. More, smaller partitions often beat more memory.","cache() only data you reuse, and unpersist it after.","Hadoop MapReduce wrote to disk between every step; Spark keeps intermediate data in memory where it can."],
 traps:["collect() on a big DataFrame, pulling everything into the driver.","Python UDFs where a built-in function exists (slow serialization).","Leaving shuffle partitions at the default for every data size."],
 qa:[["A Spark job has 199 tasks finish in a minute and one that runs for an hour. What's happening?","Data skew on the shuffle key. Confirm in the Spark UI task metrics, then enable AQE skew join, salt the hot key, or pre-aggregate before the join."],
     ["How do you speed up a join between a 2 TB table and a 50 MB table?","Broadcast the small table so the large one isn't shuffled."],
     ["Narrow vs. wide transformation?","Narrow: each output partition depends on one input partition (filter, map). Wide: it depends on many (groupBy, join, distinct), which requires a shuffle."]]
},
{id:"etl", mod:2, sec:"2.2", name:"ETL and ELT pipelines",
 title:"Moving customer data into something usable",
 thesis:"Almost every FDE engagement starts with getting data out of the customer's systems into a clean, modeled form. ELT is today's default; ETL still wins when data must be cleaned or masked before it lands.",
 vb:[710,290],
 nodes:[
  ["sources",90,70,"Sources","ERP · CRM · files"],
  ["extract",265,70,"Extract","CDC · API · batch"],
  ["raw",440,70,"Raw layer","as landed"],
  ["transform",615,70,"Transform","SQL · dbt · Spark"],
  ["checks",615,220,"Quality checks","nulls · dupes · keys"],
  ["marts",440,220,"Marts","modeled tables"],
  ["consumers",265,220,"Consumers","BI · ML · agents"],
  ["orch",90,220,"Orchestrator","Airflow · schedules",1]
 ],
 edges:[["sources","extract"],["extract","raw"],["raw","transform"],["transform","checks"],["checks","marts"],["marts","consumers"],["orch","extract",0,"triggers"]],
 steps:[
  {t:"Find the sources", n:["sources"], d:"ERP, CRM, spreadsheets, a legacy Oracle database, an SFTP drop. Discovery tells you which ones are the real source of truth."},
  {t:"Extract incrementally", n:["extract","orch"], e:["sources>extract","orch>extract"], d:"Full loads first, then incremental by a watermark (updated_at) or change data capture from the database log. An orchestrator schedules runs and retries failures."},
  {t:"Land it raw (the L in ELT)", n:["raw"], e:["extract>raw"], d:"Store exactly what arrived, unchanged, in the lake or warehouse. You can always replay transformations from it. In classic ETL you transform before this step instead."},
  {t:"Transform in the warehouse", n:["transform"], e:["raw>transform"], d:"Clean, deduplicate, conform types and join, in SQL (often dbt) or Spark. Transformations are code, version-controlled and tested."},
  {t:"Check data quality", n:["checks"], e:["transform>checks"], d:"Not-null, uniqueness, referential integrity and freshness tests. A failing check stops bad data from reaching dashboards and models."},
  {t:"Publish marts", n:["marts"], e:["checks>marts"], d:"Clean, modeled tables per business domain, such as orders or claims. These are what people and AI systems query."},
  {t:"Serve consumers", n:["consumers"], e:["marts>consumers"], d:"Dashboards, ML features and RAG or agent tools all read from the same trusted marts."}
 ],
 ideas:["ETL: transform before loading. Use it when PII must be masked before landing or targets can't do heavy compute.","ELT: load raw, transform in the warehouse. Cheap storage and replayability make it the default.","Loads should be idempotent: re-running a day's job gives the same result.","Medallion naming: bronze (raw), silver (clean), gold (marts)."],
 traps:["Transforming in place with no raw copy to replay from.","No freshness monitoring, so a silently stalled pipeline feeds stale data to an AI agent.","Non-idempotent appends that duplicate rows on retry."],
 qa:[["ETL or ELT for this customer?","ELT by default for replayability and speed. ETL where regulations require masking or filtering before data leaves a zone, or when the destination can't run the transformations."],
     ["How do you make a pipeline safe to re-run?","Partition by date, overwrite the partition or MERGE on a key instead of appending, and keep extraction watermarks in state."],
     ["What data quality checks would you add first?","Row counts against the source, not-null and unique on keys, referential integrity between facts and dimensions, and freshness on every table a user or model depends on."]]
}
];
