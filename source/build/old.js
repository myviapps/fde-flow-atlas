const OLD = [
/* ---------------------------------------------------------------- ARC */
{id:"arc", group:"The role", name:"Engagement arc",
 title:"How an FDE engagement actually runs",
 thesis:"You are paid to turn a vague business ask into software running in production at the customer, then feed what you learned back into the product.",
 vb:[710,300],
 nodes:[
  ["ask",90,70,"Vague ask","\"AI for claims\""],
  ["discover",265,70,"Discover","users · data · flow"],
  ["scope",440,70,"Scope","metric · non-goals"],
  ["pilot",615,70,"Pilot build","real data · weeks"],
  ["prod",615,230,"Production","SSO · audit · on-call"],
  ["measure",440,230,"Measure","vs. baseline"],
  ["handoff",265,230,"Hand off","train · runbooks"],
  ["product",90,230,"Core product","generalize"]
 ],
 edges:[["ask","discover"],["discover","scope"],["scope","pilot"],["pilot","prod"],["prod","measure"],["measure","pilot",-40,"iterate"],["measure","handoff"],["handoff","product"]],
 steps:[
  {t:"A vague ask arrives", n:["ask"], d:"\"We want AI for our claims team.\" Treat it as a symptom. Nobody has told you the real problem, who feels it, or how you would know it got better."},
  {t:"Discover on site", n:["discover"], e:["ask>discover"], d:"Sit with the people doing the work. Map the current workflow step by step, find where the data lives and who owns it, and write down one baseline number (for example, 4.2 days average claim cycle time)."},
  {t:"Scope a thin slice", n:["scope"], e:["discover>scope"], d:"Pick one workflow you can change in weeks, not quarters. Agree a success metric, the non-goals, and an executive sponsor who signs off. This is where most engagements are won or lost."},
  {t:"Build the pilot", n:["pilot"], e:["scope>pilot"], d:"Build on the platform with the customer's real data from day one. Demo to real users often, even daily. A demo on fake data proves nothing to the customer."},
  {t:"Harden for production", n:["prod"], e:["pilot>prod"], d:"The unglamorous half: SSO and permissions, audit logs, security review, monitoring, alerting, a runbook and an on-call owner. Pilots that skip this never go live."},
  {t:"Measure and loop", n:["measure","pilot"], e:["prod>measure","measure>pilot"], d:"Compare against the baseline you captured in discovery. Gaps go back into the pilot loop. The number is what gets you the next contract."},
  {t:"Hand off", n:["handoff"], e:["measure>handoff"], d:"Train the customer's team, document it, and reduce their dependency on you. An FDE who stays forever is a services cost, not a product win."},
  {t:"Feed the product", n:["product"], e:["handoff>product"], d:"Anything you built twice for two customers should become a product feature. This is how you avoid custom-code sprawl, the classic FDE failure mode."}
 ],
 ideas:["The FDE model started at Palantir: engineers embedded with customers, shipping on a shared platform instead of writing one-off consulting code.","FDE vs. SWE: a SWE builds for many users from a spec. An FDE finds the spec with one customer, then builds.","FDE vs. solutions architect: an SA designs and advises. An FDE writes and ships the production code.","Your two customers are the client and your own product team."],
 traps:["Jumping to a solution (\"let's build a RAG bot\") before you have a baseline metric.","Building on fake data because real data access is slow. Start the access request on day one.","Letting the pilot become a bespoke fork no one else can maintain."],
 qa:[["Walk me through how you'd run a new customer engagement.","Discover, scope, pilot, productionize, measure, hand off. The key is naming the baseline metric in discovery and the sponsor in scoping, because those two things decide whether the work ships and gets renewed."],
     ["How do you avoid custom-code sprawl?","Build on the core platform, keep customer-specific logic in config or thin adapters, and flag any pattern you've built twice to the product team as a feature request with evidence."],
     ["The customer keeps adding scope mid-pilot. What do you do?","Write each new ask down, tie it to the agreed metric, and trade: if it moves the metric, something else comes out; if it doesn't, it goes on the phase 2 list with the sponsor's agreement."]]
},
/* ---------------------------------------------------------------- CASE */
{id:"case", group:"The role", name:"Case decomposition",
 title:"Decomposing a customer case in an interview",
 thesis:"Case rounds test whether you ask the right questions before you design. Work left to right and say each step out loud.",
 vb:[710,300],
 nodes:[
  ["ask",90,70,"Vague ask","hospital discharges"],
  ["who",265,70,"Who and why","users · sponsor"],
  ["flow",440,70,"Current flow","steps · handoffs"],
  ["data",615,70,"Data reality","EHR · beds · notes"],
  ["metric",615,230,"Success metric","hrs to discharge"],
  ["cons",440,230,"Constraints","PHI · on-prem"],
  ["slice",265,230,"Thin slice","one ward · 6 wks"],
  ["plan",90,230,"Plan and risks","demo · rollout"]
 ],
 edges:[["ask","who"],["who","flow"],["flow","data"],["data","metric"],["metric","cons"],["cons","slice"],["slice","plan"]],
 steps:[
  {t:"Restate the ask", n:["ask"], d:"Prompt: \"A hospital wants to use AI to reduce discharge delays.\" Restate it and confirm the goal: fewer hours between 'medically ready' and 'patient leaves'. Don't design yet."},
  {t:"Who feels it, who pays", n:["who"], e:["ask>who"], d:"Users are nurses, case managers and doctors. The sponsor is the COO, who cares about bed capacity. Ask who will use the tool daily and who signs the contract."},
  {t:"Map the current workflow", n:["flow"], e:["who>flow"], d:"Doctor writes the discharge order, pharmacy reconciles meds, transport is booked, family is called. Ask where the wait actually happens. It is often one handoff, such as pharmacy."},
  {t:"Check the data reality", n:["data"], e:["flow>data"], d:"What's in the EHR, what's in free-text notes, what's on a whiteboard? How fresh is it, and can you get read access? Data access is usually the long pole."},
  {t:"Define success", n:["metric"], e:["data>metric"], d:"Pick one number and its baseline: median hours from ready to discharge, currently 6.5. Add a guardrail metric such as 30-day readmissions so you can't 'win' by rushing patients out."},
  {t:"Name the constraints", n:["cons"], e:["metric>cons"], d:"PHI and HIPAA, on-prem or VPC only, clinicians must stay in the loop, EHR integration limits. Say these before the design, not after."},
  {t:"Propose a thin slice", n:["slice"], e:["cons>slice"], d:"One ward, one bottleneck: a queue that predicts tomorrow's likely discharges from notes and orders so pharmacy starts early. Six weeks, measurable, low risk."},
  {t:"Plan, demo, risks", n:["plan"], e:["slice>plan"], d:"Week plan, what you demo and to whom, how you'd roll out to other wards, and the top risks (data access, clinician trust, model errors) with a mitigation each."}
 ],
 ideas:["Interviewers score the questions you ask as much as the design you land on.","Always pair a success metric with a guardrail metric.","A thin slice beats a platform pitch. Scope to what ships in weeks.","Say the constraints out loud: security, deployment location, humans in the loop."],
 traps:["Opening with the model or architecture choice.","No baseline, so no way to prove value.","Ignoring the people who have to change their workflow."],
 qa:[["What's the first thing you'd do on day one at this hospital?","Shadow a case manager through two or three discharges and file the data access request in parallel, because access will gate everything else."],
     ["How would you measure success?","Median hours from medically-ready to discharge on the pilot ward against a pre-pilot baseline, with readmission rate as a guardrail and a comparison ward as control."],
     ["The model makes a wrong prediction. What happens?","It's a prioritization aid, not a decision. A nurse confirms each item, we log overrides, and those overrides become labeled eval data."]]
},
/* ---------------------------------------------------------------- RAG */
{id:"rag", group:"AI systems", name:"RAG pipeline",
 title:"Retrieval-augmented generation, end to end",
 thesis:"RAG answers questions from the customer's own documents by retrieving relevant chunks at query time and putting them in the prompt. Most failures are retrieval failures, not model failures.",
 vb:[710,380],
 codeTitle:"Assembled prompt",
 code:`SYSTEM: Answer only from the sources below.
Cite sources like [S1]. If they don't cover
the question, say you don't know.

<source id="S1" doc="refund-policy.pdf" p="4">
Refunds are accepted within 30 days...
</source>
<source id="S2" doc="vip-terms.pdf" p="2">
VIP customers may request refunds up to 60 days...
</source>

QUESTION: Can a VIP get a refund after 45 days?

ANSWER: Yes. VIP customers have 60 days [S2],
while the standard window is 30 days [S1].`,
 nodes:[
  ["docs",90,60,"Documents","PDF · wiki · tickets"],
  ["chunk",265,60,"Parse and chunk","~500 tok · overlap"],
  ["embedD",440,60,"Embed","vector per chunk"],
  ["index",615,60,"Vector index","HNSW + BM25 + ACL"],
  ["q",90,190,"User question","\"refund after 45d?\""],
  ["embedQ",265,190,"Embed query","same model"],
  ["retrieve",440,190,"Retrieve top-k","hybrid · filter"],
  ["rerank",615,190,"Rerank","50 → 5"],
  ["prompt",615,320,"Build prompt","rules + sources"],
  ["llm",440,320,"LLM","grounded answer"],
  ["answer",265,320,"Answer","with citations"],
  ["log",90,320,"Log and eval","recall · faithful"]
 ],
 edges:[["docs","chunk"],["chunk","embedD"],["embedD","index"],["q","embedQ"],["embedQ","retrieve"],["index","retrieve",0,"search"],["retrieve","rerank"],["rerank","prompt"],["prompt","llm"],["llm","answer"],["answer","log"]],
 steps:[
  {t:"Ingest documents (offline)", n:["docs"], d:"Pull the customer's sources: PDFs, Confluence, tickets. Keep metadata with every document: source, date, and who is allowed to see it. Parsing tables and scanned PDFs well is half the battle."},
  {t:"Chunk", n:["chunk"], e:["docs>chunk"], d:"Split into pieces of a few hundred tokens with some overlap, following structure (headings, sections) where possible. Bad chunk boundaries split the answer across two chunks and retrieval misses it."},
  {t:"Embed and index", n:["embedD","index"], e:["chunk>embedD","embedD>index"], d:"An embedding model turns each chunk into a vector. Store vectors in an ANN index (HNSW), plus a keyword index (BM25) for exact terms like product codes, with ACL metadata on every row."},
  {t:"A question arrives (online)", n:["q","embedQ"], e:["q>embedQ"], d:"Embed the question with the same model used for the chunks. Optionally rewrite it first, for example expanding acronyms or splitting a compound question."},
  {t:"Retrieve", n:["retrieve","index"], e:["embedQ>retrieve","index>retrieve"], d:"Find nearest neighbours and keyword matches, fuse them (reciprocal rank fusion), and filter by the user's permissions. Filtering by ACL here is what stops the bot leaking HR documents."},
  {t:"Rerank", n:["rerank"], e:["retrieve>rerank"], d:"A cross-encoder scores each (question, chunk) pair more accurately than vector similarity. Take roughly 50 candidates down to the best 5. Cheap and usually the biggest quality jump."},
  {t:"Assemble the prompt", n:["prompt"], e:["rerank>prompt"], d:"System rules, the chunks with source IDs, then the question. Tell the model to cite and to say 'I don't know' when the sources don't cover it. See the prompt on the right.", l:[0,1,2,4,5,6,7,8,9,11]},
  {t:"Generate a grounded answer", n:["llm","answer"], e:["prompt>llm","llm>answer"], d:"The model answers from the sources with citations the user can click to verify. Citations are what earn trust from a skeptical customer.", l:[13,14]},
  {t:"Log and evaluate", n:["log"], e:["answer>log"], d:"Log question, retrieved chunks and answer. Measure retrieval recall@k and answer faithfulness separately. When quality drops, this tells you whether to fix chunking and retrieval or the prompt."}
 ],
 ideas:["RAG vs. fine-tuning: RAG adds knowledge that changes or needs citations. Fine-tuning changes behaviour, format or style. Most enterprise asks are knowledge problems, so start with RAG.","Hybrid search (vectors plus BM25) beats either alone on enterprise text full of IDs and jargon.","Permissions must be enforced at retrieval time, not in the prompt.","Evaluate retrieval and generation separately."],
 traps:["Blaming the LLM when the right chunk was never retrieved.","Chunking tables and PDFs naively.","Stuffing 30 chunks into the prompt instead of reranking to a few."],
 qa:[["Users say the RAG bot gives wrong answers. How do you debug it?","Pull the failing questions, check whether the right chunk was in the retrieved set. If not, it's ingestion, chunking or retrieval; if it was, it's the prompt or model. Turn those cases into an eval set before changing anything."],
     ["When would you fine-tune instead of using RAG?","When the problem is behaviour, not knowledge: a strict output format, a domain style, or a small fast model for a narrow task. Often both: RAG for facts, a fine-tuned or well-prompted model for format."],
     ["How do you stop the bot showing documents a user shouldn't see?","Store ACL metadata per chunk and filter at retrieval using the user's identity from SSO, so restricted text never reaches the prompt."]]
},
/* ---------------------------------------------------------------- TOOLS */
{id:"tools", group:"AI systems", name:"Tool calling and agents",
 title:"The agent loop behind LLM tool calling",
 thesis:"The model never runs anything. It asks your code to call a tool, your code runs it and sends the result back, and this loops until the model answers.",
 vb:[700,310],
 codeTitle:"The loop in Python (Anthropic SDK)",
 code:`tools = [{"name": "get_order",
          "description": "Look up an order by id",
          "input_schema": {"type": "object",
             "properties": {"id": {"type": "string"}}}}]
messages = [{"role": "user", "content": question}]

while True:
    resp = client.messages.create(model=MODEL,
               max_tokens=1024, tools=tools, messages=messages)
    if resp.stop_reason != "tool_use":
        return resp.content[0].text
    messages.append({"role": "assistant", "content": resp.content})
    results = [{"type": "tool_result", "tool_use_id": b.id,
                "content": run_tool(b.name, b.input)}
               for b in resp.content if b.type == "tool_use"]
    messages.append({"role": "user", "content": results})`,
 nodes:[
  ["user",90,80,"User","\"why late? #8841\""],
  ["app",340,80,"Your app","the agent loop"],
  ["llm",600,80,"LLM","decides next step"],
  ["docs",170,250,"search_docs","tool",1],
  ["db",340,250,"get_order","orders DB",1],
  ["carrier",510,250,"track_shipment","carrier API",1]
 ],
 edges:[["user","app",14],["app","user",14],["app","llm",16,"messages + tools"],["llm","app",16,"tool_use"],["app","docs",12],["app","db",12],["db","app",12],["app","carrier",12],["carrier","app",12]],
 steps:[
  {t:"User asks", n:["user","app"], e:["user>app"], d:"\"Why did order 8841 ship late?\" The answer needs live data the model doesn't have."},
  {t:"Send messages and tool schemas", n:["llm"], e:["app>llm"], d:"Your app sends the conversation plus tool definitions: a name, a description the model reads to decide when to use it, and a JSON schema for arguments. Descriptions are prompts. Write them carefully.", l:[0,1,2,3,4,6,7,8]},
  {t:"Model asks for a tool", n:["llm","app"], e:["llm>app"], d:"The response stops with stop_reason 'tool_use' and a block like get_order({id: \"8841\"}). Nothing has executed yet. The model has only asked.", l:[9]},
  {t:"Your code runs the tool", n:["db"], e:["app>db","db>app"], d:"Validate the arguments, check this user may see this order, call the database with a timeout. This is where security lives: the model's request is untrusted input.", l:[11,12,13,14]},
  {t:"Return the result", n:["llm"], e:["app>llm"], d:"Append the assistant turn and a tool_result block tied to the tool_use id, then call the model again with the longer conversation.", l:[11,15]},
  {t:"The loop continues", n:["carrier"], e:["llm>app","app>carrier","carrier>app","app>llm"], d:"The order shows a carrier hand-off, so the model calls track_shipment next. Agents are this loop repeated. Cap the number of iterations and total cost."},
  {t:"Final answer", n:["llm","app"], e:["llm>app"], d:"With enough context the model returns plain text and stop_reason 'end_turn'. The loop exits.", l:[9,10]},
  {t:"Reply and log the trace", n:["user"], e:["app>user"], d:"\"It left the warehouse on time but sat 2 days at the carrier's Memphis hub.\" Log every step of the trace. Traces are your debugging tool and your eval data."}
 ],
 ideas:["Tool use is structured output plus a loop in your code. The model proposes, your code disposes.","Tool descriptions and schemas are prompt engineering. Clear names and examples reduce wrong calls.","Treat tool arguments as untrusted input: validate, authorize, rate limit.","Workflow (fixed steps) vs. agent (model picks steps): prefer a workflow when the steps are known."],
 traps:["Letting the model call write or delete tools without a human confirmation step.","No iteration cap, so a confused agent loops and burns money.","Giving the agent 40 overlapping tools instead of a few clear ones."],
 qa:[["Explain how tool calling works to a customer's CTO.","The model reads the tool descriptions and returns a structured request to call one. Our code runs it with the user's permissions and feeds the result back. The model never touches your systems directly."],
     ["When would you not use an agent?","When the steps are known in advance. A fixed pipeline is cheaper, faster, easier to test and easier to explain. Use an agent when the path depends on what it finds."],
     ["How do you make a write action safe?","Split read and write tools, require a human confirmation for writes, make writes idempotent, and log who approved what."]]
},
/* ---------------------------------------------------------------- MCP */
{id:"mcp", group:"AI systems", name:"Model Context Protocol",
 title:"How MCP connects an AI app to a customer system",
 thesis:"MCP is an open standard for exposing tools, resources and prompts to any AI host. Build one server for the customer's system and every MCP-capable app can use it.",
 vb:[710,300],
 codeTitle:"JSON-RPC messages on the wire",
 code:`→ {"method":"initialize","id":1,
    "params":{"protocolVersion":"2025-06-18",
              "capabilities":{},"clientInfo":{...}}}
← {"id":1,"result":{"capabilities":{"tools":{}},
    "serverInfo":{"name":"crm-server"}}}
→ {"method":"notifications/initialized"}

→ {"method":"tools/list","id":2}
← {"id":2,"result":{"tools":[{"name":"find_account",
    "description":"Find a CRM account by domain",
    "inputSchema":{"type":"object",...}}]}}

→ {"method":"tools/call","id":3,"params":{
    "name":"find_account",
    "arguments":{"domain":"acme.com"}}}
← {"id":3,"result":{"content":[{"type":"text",
    "text":"Acme Corp · ARR $1.2M · owner: Priya"}]}}`,
 nodes:[
  ["host",90,70,"Host app","IDE · chat · agent"],
  ["llm",360,70,"LLM","reads tool list"],
  ["client",90,230,"MCP client","one per server"],
  ["server",360,230,"MCP server","tools · resources"],
  ["backend",615,230,"Customer system","CRM · DB · API",1]
 ],
 edges:[["host","client",14],["client","host",14],["client","server",16],["server","client",16],["host","llm",16],["llm","host",16],["server","backend",16],["backend","server",16]],
 steps:[
  {t:"Host starts a client", n:["host","client"], e:["host>client"], d:"The host (Claude Desktop, an IDE, your own agent) creates one MCP client per configured server. Transport is stdio for a local process or Streamable HTTP for a remote server."},
  {t:"Initialize handshake", n:["server"], e:["client>server","server>client"], d:"Client and server agree a protocol version and declare capabilities. The server says it offers tools (and maybe resources and prompts).", l:[0,1,2,3,4,5]},
  {t:"Discover tools", n:["server","client"], e:["client>server","server>client"], d:"tools/list returns each tool's name, description and JSON input schema. This is the same shape the model needs for tool calling.", l:[7,8,9,10]},
  {t:"Tools go to the model", n:["llm"], e:["client>host","host>llm"], d:"The host passes the discovered tools to the LLM alongside the conversation."},
  {t:"Model picks a tool", n:["host","client"], e:["llm>host","host>client"], d:"The model returns a tool_use for find_account. The host may ask the user to approve, then routes the call to the right client."},
  {t:"Call the tool", n:["server"], e:["client>server"], d:"The client sends tools/call with the arguments as a JSON-RPC request.", l:[12,13,14]},
  {t:"Server hits the real system", n:["backend"], e:["server>backend","backend>server"], d:"The server calls the customer's CRM with its own credentials, ideally OAuth scoped to the user. Auth, rate limits and data shaping live here."},
  {t:"Result flows back", n:["llm"], e:["server>client","client>host","host>llm"], d:"The content comes back to the model, which uses it in its answer.", l:[15,16]}
 ],
 ideas:["MCP turns N apps × M systems integrations into N + M: one server per system, reusable by every host.","Three primitives: tools (model-invoked actions), resources (data the app can read), prompts (user-invoked templates).","It is JSON-RPC 2.0 over stdio or Streamable HTTP.","For an FDE, an MCP server is often the fastest way to plug a customer's internal system into an AI product."],
 traps:["Confusing MCP with tool calling. Tool calling is the model API feature; MCP standardizes how tools are discovered and invoked.","Shipping a remote server without auth. Use OAuth and least-privilege scopes.","Exposing every API endpoint as a tool instead of a few task-shaped ones."],
 qa:[["Why would a customer want an MCP server instead of a custom integration?","Build it once and it works in every MCP host they use: their chat app, IDE and internal agents. Auth and business rules live in one place."],
     ["How would you secure a remote MCP server for an enterprise?","OAuth tied to the customer's IdP, per-user scopes, read and write tools separated, audit logging of every call, and rate limits."],
     ["Tools vs. resources?","A tool is an action the model decides to call. A resource is data the host application chooses to load into context, like a file or a record."]]
},
/* ---------------------------------------------------------------- EVALS */
{id:"evals", group:"AI systems", name:"Evals",
 title:"An eval loop that makes LLM work shippable",
 thesis:"Evals are unit tests for non-deterministic systems. Without them every prompt change is a guess and you can't prove value to the customer.",
 vb:[720,280],
 nodes:[
  ["data",90,70,"Golden dataset","120 real cases"],
  ["sut",270,70,"System version","prompt · model · k"],
  ["out",450,70,"Outputs","+ full traces"],
  ["code",630,40,"Code checks","schema · SQL runs"],
  ["judge",630,130,"LLM judge","rubric · 1 to 5"],
  ["human",630,220,"Human review","disagreements"],
  ["scores",450,220,"Scores","per slice"],
  ["gate",270,220,"CI gate","no regressions"],
  ["prod",90,220,"Production","traces · feedback"]
 ],
 edges:[["data","sut"],["sut","out"],["out","code"],["out","judge"],["judge","human"],["code","scores"],["judge","scores"],["human","scores"],["scores","gate"],["gate","prod",0,"ship"],["prod","data",0,"new cases"]],
 steps:[
  {t:"Build a golden dataset", n:["data"], d:"Collect 50 to 200 real tasks from the customer with expected answers or grading notes. Include the hard edge cases users complain about. Tag each case by slice (topic, customer type, language)."},
  {t:"Run a system version", n:["sut"], e:["data>sut"], d:"A 'version' is everything that affects output: prompt, model, retrieval settings, tools. Run the whole dataset through it."},
  {t:"Capture outputs and traces", n:["out"], e:["sut>out"], d:"Save the answer plus every intermediate step: retrieved chunks, tool calls, tokens, latency. Traces tell you why a case failed."},
  {t:"Deterministic checks first", n:["code"], e:["out>code"], d:"Cheap and exact: does the JSON match the schema, does the generated SQL execute, is the cited source real, is the answer under the length limit."},
  {t:"LLM as judge", n:["judge"], e:["out>judge"], d:"For fuzzy qualities like correctness and helpfulness, a model grades against a written rubric. Calibrate it: check its scores agree with human labels on a sample before trusting it."},
  {t:"Humans on the disagreements", n:["human"], e:["judge>human"], d:"Route low-confidence and disputed cases to a domain expert. Their labels improve the dataset and the judge rubric."},
  {t:"Aggregate by slice", n:["scores"], e:["code>scores","judge>scores","human>scores"], d:"An overall 87% can hide a 40% on one important slice. Report per slice and compare against the previous version."},
  {t:"Gate the release", n:["gate","prod"], e:["scores>gate","gate>prod"], d:"Run evals in CI on every prompt or model change. Block a merge if a key slice regresses."},
  {t:"Close the loop", n:["data"], e:["prod>data"], d:"Production failures and thumbs-down feedback become new eval cases. The dataset grows with the customer's real usage."}
 ],
 ideas:["Offline evals (a fixed dataset) catch regressions. Online signals (feedback, A/B) confirm real value.","Grade in layers: code checks, then LLM judge, then humans.","An LLM judge must be calibrated against human labels.","Slice-level metrics are what customers actually care about."],
 traps:["Vibe-checking five examples and calling it evaluated.","Using the same model as generator and unvalidated judge.","One aggregate score that hides a failing slice."],
 qa:[["How do you know your LLM feature is good enough to ship?","A golden set built from real customer tasks, success thresholds agreed with the customer per slice, and a CI gate that shows the new version beats the old one without regressions."],
     ["How do you trust an LLM judge?","Have humans label 50 to 100 cases, measure agreement with the judge, tighten the rubric until agreement is high, and re-check periodically."],
     ["Where does the eval data come from on a new engagement?","From discovery: real historical tickets, documents and expert answers. Then production traces keep adding cases."]]
},
/* ---------------------------------------------------------------- SQL */
{id:"sql", group:"Data", name:"SQL execution order",
 title:"The order SQL really runs in",
 thesis:"You write SELECT first, but the engine evaluates FROM first. Knowing the logical order explains most confusing SQL errors, and it's a favourite live-coding check.",
 vb:[710,280],
 codeTitle:"Top 3 regions by 2026 revenue",
 code:`SELECT c.region,
       COUNT(*)       AS orders,
       SUM(o.amount)  AS revenue,
       RANK() OVER (ORDER BY SUM(o.amount) DESC) AS rnk
FROM   orders o
JOIN   customers c ON c.id = o.customer_id
WHERE  o.created_at >= '2026-01-01'
GROUP  BY c.region
HAVING COUNT(*) > 100
ORDER  BY revenue DESC
LIMIT  3;`,
 nodes:[
  ["from",90,70,"1 FROM","orders · 10,000"],
  ["join",265,70,"2 JOIN ON","+ customers"],
  ["where",440,70,"3 WHERE","→ 3,200 rows"],
  ["group",615,70,"4 GROUP BY","→ 6 groups"],
  ["having",615,210,"5 HAVING","→ 4 groups"],
  ["select",440,210,"6 SELECT","aggs · window"],
  ["order",265,210,"7 ORDER BY","revenue desc"],
  ["limit",90,210,"8 LIMIT","→ 3 rows"]
 ],
 edges:[["from","join"],["join","where"],["where","group"],["group","having"],["having","select"],["select","order"],["order","limit"]],
 steps:[
  {t:"FROM", n:["from"], d:"Start from the orders table: 10,000 rows. Nothing else is known yet, including column aliases.", l:[4]},
  {t:"JOIN", n:["join"], e:["from>join"], d:"Match each order to its customer. An inner join drops orders with no customer. A join on a non-unique key multiplies rows, which silently inflates SUMs.", l:[5]},
  {t:"WHERE", n:["where"], e:["join>where"], d:"Filter individual rows: only 2026 orders survive, 3,200 rows. WHERE can't see aggregates or SELECT aliases because they don't exist yet.", l:[6]},
  {t:"GROUP BY", n:["group"], e:["where>group"], d:"Collapse rows into one group per region: 6 groups. From here on, every column must be grouped or aggregated.", l:[7]},
  {t:"HAVING", n:["having"], e:["group>having"], d:"Filter groups using aggregates: keep regions with more than 100 orders, 4 groups left. HAVING is WHERE for groups.", l:[8]},
  {t:"SELECT and window functions", n:["select"], e:["having>select"], d:"Now compute the output columns and aliases. Window functions like RANK() run here, after grouping, over the grouped rows. DISTINCT also applies at this point.", l:[0,1,2,3]},
  {t:"ORDER BY", n:["order"], e:["select>order"], d:"Sort the result. ORDER BY runs after SELECT, which is why it's the one clause that can use the alias 'revenue'.", l:[9]},
  {t:"LIMIT", n:["limit"], e:["order>limit"], d:"Keep the first 3 rows. Without a deterministic ORDER BY, which 3 you get is undefined.", l:[10]}
 ],
 ideas:["Logical order: FROM, JOIN, WHERE, GROUP BY, HAVING, SELECT (including window functions and DISTINCT), ORDER BY, LIMIT.","Filter early (WHERE) instead of late (HAVING) when you can. It's clearer and usually faster.","Window functions keep rows; GROUP BY collapses them.","The optimizer may physically reorder work, but results must match this logical order."],
 traps:["Using a SELECT alias in WHERE (error in most databases).","Fan-out joins that double-count revenue.","COUNT(col) vs COUNT(*): COUNT(col) skips NULLs."],
 qa:[["Why can't I use a column alias in WHERE?","WHERE runs before SELECT, so the alias doesn't exist yet. Repeat the expression or wrap the query in a CTE."],
     ["Top earner per department?","Use a window: ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) in a CTE, then filter rn = 1 in the outer query. Use RANK if ties should all be returned."],
     ["Revenue looks double what finance reports. Where do you look?","A join that fans out: an order joined to multiple shipment or line-item rows before summing. Aggregate on the child table first, then join."]]
},
/* ---------------------------------------------------------------- FASTAPI */
{id:"fastapi", group:"Shipping", name:"FastAPI request lifecycle",
 title:"What happens to one request in FastAPI",
 thesis:"Most FDE builds end up as an API in front of a model or data pipeline. Knowing where validation, auth and async happen lets you debug it under pressure.",
 vb:[710,280],
 codeTitle:"A small /ask endpoint",
 code:`app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=ORIGINS)

class AskIn(BaseModel):
    question: str = Field(min_length=3)
    top_k: int = 5

class AskOut(BaseModel):
    answer: str
    sources: list[str]

async def current_user(token: str = Depends(oauth2)) -> User:
    return await verify_jwt(token)

@app.post("/ask", response_model=AskOut)
async def ask(body: AskIn, user: User = Depends(current_user)):
    chunks = await retriever.search(body.question,
                 k=body.top_k, groups=user.groups)
    return await llm.answer(body.question, chunks)`,
 nodes:[
  ["client",90,70,"Client","POST /ask"],
  ["server",265,70,"Uvicorn","ASGI server"],
  ["mw",440,70,"Middleware","CORS · logging"],
  ["router",615,70,"Router","match path+method"],
  ["deps",615,210,"Dependencies","auth · db session"],
  ["valid",440,210,"Validation","Pydantic → 422"],
  ["handler",265,210,"Handler","async def ask"],
  ["ser",90,210,"Response model","filter · JSON"]
 ],
 edges:[["client","server"],["server","mw"],["mw","router"],["router","deps"],["deps","valid"],["valid","handler"],["handler","ser"],["ser","client",0,"200 JSON"]],
 steps:[
  {t:"Request arrives", n:["client","server"], e:["client>server"], d:"Uvicorn, an ASGI server, accepts the HTTP connection and hands FastAPI an ASGI scope. Running several workers (processes) gives you parallelism across CPU cores."},
  {t:"Middleware", n:["mw"], e:["server>mw"], d:"Middleware wraps every request and response: CORS, request IDs, timing, logging. It runs before routing and again on the way out.", l:[1]},
  {t:"Routing", n:["router"], e:["mw>router"], d:"FastAPI matches method and path to the ask function. No match gives 404, wrong method gives 405.", l:[13]},
  {t:"Dependencies resolve", n:["deps"], e:["router>deps"], d:"Depends() runs current_user, which verifies the JWT. Failing auth raises 401 before your handler runs. Dependencies are also where you open DB sessions and clean them up.", l:[10,11,14]},
  {t:"Body validation", n:["valid"], e:["deps>valid"], d:"Pydantic parses the JSON into AskIn. A missing question or a too-short one returns a 422 with field-level errors. You get this for free.", l:[3,4,5,14]},
  {t:"Handler runs", n:["handler"], e:["valid>handler"], d:"The async handler awaits retrieval and the LLM call. Awaiting I/O frees the event loop for other requests. A blocking call here (sync DB driver, CPU work) stalls every request on that worker.", l:[14,15,16,17]},
  {t:"Response model", n:["ser"], e:["handler>ser"], d:"The return value is validated against AskOut, which also strips any fields you didn't declare, then serialized to JSON.", l:[7,8,9,13]},
  {t:"Back to the client", n:["client"], e:["ser>client"], d:"Middleware sees the response on the way out and adds headers and timing. The client gets 200 with typed JSON and the docs at /docs stay in sync automatically."}
 ],
 ideas:["Validation errors are 422, auth failures 401 or 403, missing routes 404.","async only helps if everything inside is non-blocking. Use run_in_threadpool or a sync def for blocking work.","Dependencies are FastAPI's dependency injection: auth, DB sessions, settings, all testable by override.","Stream long LLM answers with StreamingResponse or server-sent events."],
 traps:["Calling a blocking SDK inside async def and wondering why throughput collapses.","Returning ORM objects with fields that leak (no response_model).","Doing long LLM jobs inline instead of a background queue when they take minutes."],
 qa:[["Your FastAPI service is slow under load but CPU is low. Why?","Probably blocking I/O inside async handlers stalling the event loop. Profile, switch to async clients or move the call to a thread pool, and add workers."],
     ["How do you add auth to all routes?","A dependency that validates the token, applied at the router level with dependencies=[Depends(current_user)], and overridden in tests."],
     ["How would you serve an LLM answer that takes 20 seconds?","Stream tokens back with server-sent events so users see progress, and set timeouts and retries on the upstream call."]]
},
/* ---------------------------------------------------------------- DEPLOY */
{id:"deploy", group:"Shipping", name:"Docker to Kubernetes",
 title:"From code to pods: shipping a service",
 thesis:"Customers judge you on whether it runs in their environment. Containers make the build reproducible; Kubernetes keeps the right number of healthy copies running.",
 vb:[710,380],
 codeTitle:"Dockerfile and deployment excerpt",
 code:`FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# deployment.yaml (excerpt)
replicas: 3
image: registry.acme.io/ask-api:1.4.2
readinessProbe: {httpGet: {path: /healthz, port: 8000}}
strategy: {rollingUpdate: {maxUnavailable: 0, maxSurge: 1}}`,
 nodes:[
  ["code",90,70,"Dockerfile","code @ sha a1b2c3"],
  ["build",265,70,"docker build","cached layers"],
  ["image",440,70,"Image","ask-api:1.4.2"],
  ["registry",615,70,"Registry","customer's ECR/ACR"],
  ["deploy",615,210,"Deployment","replicas: 3"],
  ["pods",440,210,"Pods","3 × container"],
  ["svc",265,210,"Service","stable IP · LB"],
  ["ingress",90,210,"Ingress","TLS · /api"],
  ["users",90,340,"Users","https requests",1]
 ],
 edges:[["code","build"],["build","image"],["image","registry",0,"push"],["registry","deploy",0,"pull"],["deploy","pods"],["users","ingress"],["ingress","svc"],["svc","pods"]],
 steps:[
  {t:"Write the Dockerfile", n:["code"], d:"Start from a slim base, install dependencies, copy code, set the start command. Copy requirements before the code so dependency layers stay cached.", l:[0,1,2,3,4,5,6]},
  {t:"Build the image", n:["build","image"], e:["code>build","build>image"], d:"Each instruction becomes a cached layer. Changing app code only rebuilds the last layers, so builds take seconds instead of minutes.", l:[2,3,4]},
  {t:"Push to a registry", n:["registry"], e:["image>registry"], d:"Tag with an immutable version or git SHA, never just 'latest'. In FDE work this is often the customer's own registry inside their cloud account.", l:[10]},
  {t:"Declare desired state", n:["deploy"], e:["registry>deploy"], d:"A Deployment says: run 3 replicas of this image. Kubernetes continuously reconciles the actual state toward it and replaces pods that die.", l:[9,10]},
  {t:"Pods start and get checked", n:["pods"], e:["deploy>pods"], d:"The scheduler places pods on nodes. A pod only receives traffic once its readiness probe passes, so a slow model load doesn't serve errors.", l:[11]},
  {t:"Traffic comes in", n:["users","ingress","svc"], e:["users>ingress","ingress>svc"], d:"The Ingress terminates TLS and routes /api to a Service. The Service gives the pods one stable address and load-balances across the ready ones."},
  {t:"Requests reach pods", n:["pods"], e:["svc>pods"], d:"Pods are cattle: any one can die and be replaced. Keep them stateless and put state in a database or object store."},
  {t:"Rolling update", n:["deploy","pods"], e:["registry>deploy","deploy>pods"], d:"Ship 1.4.3 by changing the image tag. With maxUnavailable 0, Kubernetes starts a new pod, waits for it to be ready, then retires an old one. Roll back by reverting the tag.", l:[12]}
 ],
 ideas:["Image = the build artifact. Container = a running image. Pod = one or more containers scheduled together.","Deployment manages replicas and rollouts. Service gives stable networking. Ingress exposes HTTP from outside.","Config goes in ConfigMaps, secrets in Secrets or the cloud secret manager, never baked into the image.","FDE reality: customer VPCs, private registries, sometimes air-gapped installs. Ask early."],
 traps:["Tagging images 'latest' so you can't tell what's running or roll back.","No readiness probe, so users hit pods still loading a model.","Baking API keys into the image."],
 qa:[["Container vs. VM?","A container shares the host kernel and packages just the app and its dependencies, so it starts in seconds and is small. A VM virtualizes hardware and runs a full OS."],
     ["How do you deploy with zero downtime?","Rolling update with readiness probes and maxUnavailable 0, plus backward-compatible database migrations so old and new pods can run side by side."],
     ["The customer won't allow outbound internet. How do you deploy?","Mirror images into their private registry, bundle model weights and dependencies, use their internal package mirrors, and document an offline install path."]]
}
];
