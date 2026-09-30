NEW.push(
/* ================================================= MODULE 4 */
{id:"exec", mod:4, sec:"4.1", name:"Executive communication",
 title:"Debug the tech, de-escalate the CIO",
 thesis:"When something breaks at a customer, you run two tracks at once: fix the system, and keep the executive's trust by speaking in business outcomes, answer first.",
 vb:[710,290],
 codeTitle:"Metric translation and an exec update",
 code:`TECH METRIC               ->  BUSINESS OUTCOME
p95 latency 8s -> 1.2s        agents clear ~20% more claims/hr
retrieval recall 71% -> 93%   far fewer wrong-policy answers
pipeline freshness < 15 min   claims team never waits on data

EXEC UPDATE  (answer first, SCQA)
Answer:       Fixed at 13:40. No data lost.
Situation:    Claims assistant slowed 10:00-13:40 Tuesday.
Complication: About 1,100 claims took 3x longer to process.
Cause:        A vendor API began rate limiting our calls.
Prevention:   Caching + alert added; failover drill Friday.
Ask:          30 min with your vendor manager on API limits.`,
 nodes:[
  ["esc",90,70,"Escalation","CIO: 'it's broken'"],
  ["listen",265,70,"Listen","restate impact"],
  ["triage",440,70,"Triage","logs · repro"],
  ["fix",615,70,"Fix or workaround","hours, not days"],
  ["translate",615,220,"Translate","metric → outcome"],
  ["update",440,220,"Exec update","answer first"],
  ["prevent",265,220,"Prevent","test · alert"],
  ["trust",90,220,"Trust kept","renewal safe"]
 ],
 edges:[["esc","listen"],["listen","triage"],["triage","fix"],["fix","translate"],["translate","update"],["update","prevent"],["prevent","trust"]],
 steps:[
  {t:"The escalation", n:["esc"], d:"The CIO emails your sponsor: the assistant is 'completely broken'. The facts are unclear and the emotion is real."},
  {t:"Listen before you explain", n:["listen"], e:["esc>listen"], d:"Restate the business impact in their words, say what you're doing next and when they'll hear from you. Active listening lowers the temperature faster than a technical explanation."},
  {t:"Triage like an engineer", n:["triage"], e:["listen>triage"], d:"Scope it: which users, since when, what changed. Pull logs and traces, reproduce, and find the blocker. Peel the onion past the first symptom."},
  {t:"Restore service first", n:["fix"], e:["triage>fix"], d:"A workaround in hours beats a perfect fix in days. Root-cause fixes can follow."},
  {t:"Translate the metrics", n:["translate"], e:["fix>translate"], d:"Executives don't buy latency or recall; they buy throughput, risk and cost. Convert each technical number into its business effect.", l:[0,1,2,3]},
  {t:"Send the update, answer first", n:["update"], e:["translate>update"], d:"Lead with the answer, then situation, complication, cause, prevention and one clear ask. Five to seven lines. This is structured storytelling.", l:[5,6,7,8,9,10,11]},
  {t:"Prevent recurrence", n:["prevent"], e:["update>prevent"], d:"Add the test, alert or cache that would have caught it, and tell them you did. Follow-through is what rebuilds trust."},
  {t:"Trust kept", n:["trust"], e:["prevent>trust"], d:"Handled well, an incident can strengthen the relationship. Negotiation follows the same rule: anchor on the agreed metric, and trade scope for time rather than quality."}
 ],
 ideas:["Two tracks at once: fix the tech and manage the people.","Answer first; the pyramid principle and SCQA give updates a shape.","Every technical metric needs a business translation.","Negotiate with trades: if scope goes up, time or something else moves."],
 traps:["Opening with a technical deep-dive to an angry executive.","Promising a root cause before you have one.","Going quiet while you debug."],
 qa:[["The customer's CIO says your system is broken and threatens to cancel. What do you do in the first hour?","Acknowledge and restate the impact, commit to an update time, triage with logs to scope it, restore service with a workaround if possible, and send a short answer-first update. Root cause and prevention follow."],
     ["How do you explain a 93% retrieval recall to an executive?","In their terms: out of 100 questions, the system finds the right policy 93 times, up from 71, which means far fewer wrong answers reaching customers and fewer escalations."],
     ["The customer wants three more features before go-live. How do you negotiate?","Tie each to the success metric, offer trades (move the date, drop a lower-value item, or phase 2), and get the sponsor to choose, in writing."]]
},
{id:"moat", mod:4, sec:"4.3", name:"Product judgment and moats",
 title:"Custom request or core product? The judgment call",
 thesis:"Every FDE hears 'can you just build this for us'. Good product judgment keeps one-offs isolated, promotes repeated needs into the platform, and turns deployments into proprietary data.",
 vb:[710,420],
 nodes:[
  ["req",90,70,"Customer ask","custom feature"],
  ["seen",265,70,"Seen before?","2+ customers"],
  ["adapter",440,70,"Config/adapter","isolated · owned"],
  ["sprawl",615,70,"Sprawl risk","if unmanaged",1],
  ["core",265,220,"Core product","R&D roadmap"],
  ["deploy",440,220,"Deployments","each runs on core"],
  ["data",615,220,"Process data","proprietary"],
  ["mlops",615,360,"MLOps loop","retrain · evaluate"],
  ["moat",440,360,"Moat","hard to copy"]
 ],
 edges:[["req","seen"],["seen","adapter",0,"no"],["adapter","sprawl"],["seen","core",0,"yes"],["core","deploy"],["deploy","data"],["data","mlops"],["mlops","moat"],["moat","core",0,"funds R&D"]],
 steps:[
  {t:"A custom request", n:["req"], d:"\"Can you add a special approval step just for our EMEA team?\" Saying yes is easy. The judgment is where the code lives."},
  {t:"Is it a pattern?", n:["seen"], e:["req>seen"], d:"Have two or more customers needed something like this? Would a generalized version be valuable to the product?"},
  {t:"No: isolate it", n:["adapter"], e:["seen>adapter"], d:"Put it in configuration or a thin adapter at the edge, with an owner and a test, never forked into the core."},
  {t:"The dark side: sprawl", n:["sprawl"], e:["adapter>sprawl"], d:"Unowned one-offs pile up into custom-solution sprawl and tech debt. Two other failure modes from the Blueprint deck: FDEs becoming an escalation crutch, and discovery bottlenecks when only one FDE understands the account."},
  {t:"Yes: promote it", n:["core"], e:["seen>core"], d:"Take it to the product team with evidence. The FDE org acts as an R&D engine: field work is paid discovery, and generalizing it moves cost from per-customer COGS to shared R&D."},
  {t:"Deployments run on core", n:["deploy"], e:["core>deploy"], d:"Every new customer gets the capability for free, and time-to-value drops."},
  {t:"Process data accumulates", n:["data"], e:["deploy>data"], d:"Each deployment records how work actually gets done: decisions, corrections, exceptions. That data is proprietary."},
  {t:"The MLOps loop", n:["mlops"], e:["data>mlops"], d:"Label, retrain, evaluate and redeploy models on that data. The product gets better with each customer."},
  {t:"The moat", n:["moat","core"], e:["mlops>moat","moat>core"], d:"A competitor can copy features but not years of process data and tuned models. The advantage funds more R&D."}
 ],
 ideas:["Default to config or an adapter; promote to core on evidence of repetition.","R&D vs. COGS: generalized work is investment; bespoke work is cost of delivery.","Process data plus an MLOps loop is the durable moat in AI products.","Watch for sprawl, escalation crutch and discovery bottlenecks."],
 traps:["Forking the core for one customer.","Building a 'platform' before any repetition exists.","Letting FDEs become the permanent support desk."],
 qa:[["How do you decide whether a customer request goes into the core product?","Look for repetition across customers, fit with the product direction and the cost to generalize. If it's a one-off, isolate it in config or an adapter with an owner; if it repeats, bring the product team evidence and a draft design."],
     ["What is a data moat?","Proprietary data generated by using the product, like corrections and decisions in real workflows, fed back through an MLOps loop so the product improves in ways competitors can't copy."],
     ["What does 'escalation crutch' mean?","Customers and internal teams routing every problem to the FDE instead of the product or support, which stops the FDE from building and hides product gaps."]]
},
/* ================================================= MODULE 5 */
{id:"arc", mod:5, sec:"5.1", name:"12-week engagement arc",
 title:"The four-phase, 12-week engagement",
 thesis:"The course's operating model for an engagement: scope in two weeks, prototype fast with users, harden for production, then hand over and feed the product.",
 vb:[710,290],
 nodes:[
  ["pain",90,70,"Pain points","stakeholder map"],
  ["scope",265,70,"Scope","wk 1-2 · SMART"],
  ["proto",440,70,"Prototype","wk 3-6 · speed"],
  ["users",615,70,"End users","side by side",1],
  ["harden",615,220,"Harden","wk 7-10 · SLAs"],
  ["measure",440,220,"Measure","vs. baseline"],
  ["handover",265,220,"Handover","wk 11-12 · CoE"],
  ["product",90,220,"Feedback","to product platform"]
 ],
 edges:[["pain","scope"],["scope","proto"],["proto","users",14],["users","proto",14],["proto","harden"],["harden","measure"],["measure","handover"],["handover","product"]],
 steps:[
  {t:"Find the real pain", n:["pain"], d:"Interview users and leaders, map the workflow, the tech stack and who has power over decisions. Capture a baseline number."},
  {t:"Phase 1, weeks 1-2: scope", n:["scope"], e:["pain>scope"], d:"Write SMART success criteria: Specific, Measurable, Achievable, Relevant, Time-bound. For example, 'cut median claim triage time from 4 hours to 1 for the motor team by week 10'. Choose one pilot."},
  {t:"Phase 2, weeks 3-6: prototype", n:["proto","users"], e:["scope>proto","proto>users","users>proto"], d:"Speed over elegance. Work beside the end users on real data, demo often and change direction quickly."},
  {t:"Phase 3, weeks 7-10: harden", n:["harden"], e:["proto>harden"], d:"Error handling, logging, data-quality checks, latency and caching, security review and agreed SLAs. This turns a demo into something people can depend on."},
  {t:"Measure against the criteria", n:["measure"], e:["harden>measure"], d:"Report the result against the SMART target from week 2. This is the evidence for expansion."},
  {t:"Phase 4, weeks 11-12: hand over", n:["handover"], e:["measure>handover"], d:"Stand up a client Center of Excellence: trained owners, documentation and runbooks, so the customer can run and extend it without you."},
  {t:"Feed the product", n:["product"], e:["handover>product"], d:"The dual-value loop: delivery for the customer, discovery for the company, and platform synthesis of what repeated."}
 ],
 ideas:["Phases: scope (1-2), prototype (3-6), harden (7-10), hand over (11-12).","SMART criteria and one pilot come out of week 2.","Prototype with users, not for them.","Handover means a client CoE, not a zip file."],
 traps:["Hardening a prototype nobody uses yet.","Skipping the baseline, so week 10 has nothing to compare to.","Handing over without trained owners."],
 qa:[["Walk me through a 12-week engagement.","Two weeks to find the pain and agree SMART criteria and a pilot; four weeks prototyping with users on real data; four weeks hardening (errors, logging, data quality, latency, security, SLAs); two weeks handing over to a client CoE and feeding the product team."],
     ["What does 'hardening' include?","Error handling and retries, structured logging and monitoring, data-quality checks, latency work and caching, security review and access control, and agreed SLAs with an on-call owner."],
     ["Give me a SMART success criterion.","Reduce median time from claim received to triaged from 4 hours to 1 hour for the motor claims team by the end of week 10, measured from the claims system timestamps."]]
},
{id:"pod", mod:5, sec:"5.2 and 5.3", name:"Pod operating model",
 title:"How an FDE pod runs: autonomy and time-to-value",
 thesis:"Leadership sets the what and the why; a small pod owns the how. Features survive by being used, and the scoreboard is time-to-value.",
 vb:[710,290],
 nodes:[
  ["lead",90,70,"Leadership","what + why"],
  ["echo",265,70,"Echo","strategist · 1"],
  ["deltas",440,70,"Deltas","engineers · 2"],
  ["how",615,70,"Pod owns how","Auftragstaktik"],
  ["ship",615,220,"Ship small","to real users"],
  ["adopt",440,220,"Adoption?","used or dropped"],
  ["survive",265,220,"Survivors","to the platform"],
  ["ttv",90,220,"Time to value","the scoreboard"]
 ],
 edges:[["lead","echo"],["echo","deltas",0,"shields"],["deltas","how"],["how","ship"],["ship","adopt"],["adopt","survive"],["survive","ttv"],["adopt","deltas",0,"iterate"]],
 steps:[
  {t:"Leadership sets intent", n:["lead"], d:"Auftragstaktik, or mission-type tactics, from Prussian military doctrine: leaders state the objective and why it matters, not the steps."},
  {t:"The Echo", n:["echo"], e:["lead>echo"], d:"One Deployment Strategist per pod owns the customer relationship, scoping and the administrative load."},
  {t:"Protecting the Deltas", n:["deltas"], e:["echo>deltas"], d:"Two FDEs write code. Without protection, admin (status meetings, access tickets, reporting) can eat 40 to 60% of an engineer's time. The Echo absorbs it."},
  {t:"The pod owns the how", n:["how"], e:["deltas>how"], d:"The people closest to the problem choose the technical approach. No central sign-off on every design."},
  {t:"Ship small, to real users", n:["ship"], e:["how>ship"], d:"Put small features in front of users quickly rather than building a big plan."},
  {t:"Darwinistic adoption", n:["adopt","deltas"], e:["ship>adopt","adopt>deltas"], d:"Features that users adopt survive; unused ones get dropped. Bottom-up selection replaces top-down roadmaps inside the account."},
  {t:"Survivors go to the platform", n:["survive"], e:["adopt>survive"], d:"What proves itself in several pods becomes a platform feature."},
  {t:"Measure time-to-value", n:["ttv"], e:["survive>ttv"], d:"TTV: time from contract to the customer getting measurable value. Supporting metrics from the Blueprint deck: usage uplift, adoption depth and revenue protection."}
 ],
 ideas:["Pod: 1 Echo + 2 Deltas.","Mission-type tactics: central intent, local execution.","Protect engineers from the 40-60% admin drag.","TTV is the headline delivery metric."],
 traps:["Central architecture review for every pod decision.","Measuring the pod by features shipped instead of value delivered."],
 qa:[["How would you structure a team for a new strategic account?","A pod of one deployment strategist and two engineers, with a clear objective from leadership, autonomy on approach, and TTV plus adoption as success measures."],
     ["What's Auftragstaktik and why does it suit FDE work?","Leaders give intent, teams choose the method. Field conditions change too fast for central planning, and the engineers on site have the best information."]]
},
/* ================================================= MODULE 6 */
{id:"lastmile", mod:6, sec:"6.1 and 6.2", name:"Last-mile onboarding",
 title:"Closing the last-mile implementation gap",
 thesis:"The product works in the demo, then meets undocumented APIs, broken schemas and workflow exceptions. FDEs fix those in real time and capture each fix so the next onboarding is faster.",
 vb:[710,420],
 nodes:[
  ["signed",90,70,"Contract signed","product 'works'"],
  ["api",265,70,"Undocumented API","no spec"],
  ["schema",440,70,"Broken schema","nulls · drift"],
  ["exc",615,70,"Exceptions","odd workflows"],
  ["wrap",265,220,"API wrapper","typed · retried"],
  ["repair",440,220,"Schema repair","map · validate"],
  ["pipe",615,220,"Custom pipeline","rules · routing"],
  ["play",265,360,"Playbook","fix → template"],
  ["portal",440,360,"Client portal","shared status"],
  ["live",615,360,"Live + adopted","TTV down"]
 ],
 edges:[["signed","api"],["api","schema"],["schema","exc"],["api","wrap"],["schema","repair"],["exc","pipe"],["wrap","play"],["play","portal"],["portal","live"],["pipe","live"]],
 steps:[
  {t:"The delivery gap", n:["signed"], d:"The sale assumed clean integrations. Reality: AI complexity, messy data and an R&D team too stretched to help each customer. Onboarding stalls here."},
  {t:"Undocumented APIs", n:["api","wrap"], e:["signed>api","api>wrap"], d:"The customer's system has no spec. Probe it, capture real responses, and write a typed wrapper with retries and tests so the product sees a clean interface."},
  {t:"Broken schemas", n:["schema","repair"], e:["api>schema","schema>repair"], d:"Columns that mean different things per region, nulls in keys, types that drift. Map, validate and repair at the boundary."},
  {t:"Workflow exceptions", n:["exc","pipe"], e:["schema>exc","exc>pipe"], d:"'Except for claims over £50k, which go to Jane.' Encode the exceptions as rules and routing in the pipeline instead of forking the product."},
  {t:"Capture it as a playbook", n:["play"], e:["wrap>play"], d:"Each fix becomes a template in a dynamic playbook, so the next customer with the same system starts from it. Professional services automation (PSA) tools such as Rocketlane provide unified workspaces for this."},
  {t:"Shared visibility", n:["portal"], e:["play>portal"], d:"A client portal shows plan, status and open tasks to both sides, which removes a lot of status meetings. AI-powered automation drafts plans and updates."},
  {t:"Live and adopted", n:["live"], e:["portal>live","pipe>live"], d:"Onboarding done when people use it, not when it's installed. Each captured fix lowers the next customer's time-to-value."}
 ],
 ideas:["Why onboarding fails: undocumented APIs, broken schemas, workflow exceptions.","Real-time fixes: wrappers, schema repair, pipeline customization.","Capture every fix as a reusable template.","PSA automation: unified workspaces, dynamic playbooks, client portals, AI automation."],
 traps:["Fixing the same integration from scratch for every customer.","Encoding exceptions by forking product code."],
 qa:[["The customer's API has no documentation. How do you integrate?","Get sample traffic or a sandbox, probe endpoints, record real responses as fixtures, write a typed wrapper with tests against them, and confirm edge cases with their engineers."],
     ["How do you make the tenth onboarding faster than the first?","Turn every fix into a template or connector in a shared playbook, track which ones recur, and push the common ones into the product."]]
},
/* ================================================= MODULE 7 */
{id:"interview", mod:7, sec:"7.3", name:"Interview blueprint",
 title:"What an FDE interview loop scores",
 thesis:"LeetCode-only prep fails because FDE loops weight depth, building and customer skills. Prepare in proportion to the four evaluation pillars.",
 vb:[710,290],
 nodes:[
  ["prep",90,70,"Preparation","not LeetCode-only"],
  ["deep",265,70,"Technical depth","40%"],
  ["build",440,70,"Practical build","30%"],
  ["cust",615,70,"Customer case","20%"],
  ["biz",615,220,"Business acumen","10%"],
  ["port",440,220,"Portfolio proof","Projects A and B"],
  ["story",265,220,"Your stories","Vukti · DATAVORE"],
  ["offer",90,220,"Offer","comp benchmarks"]
 ],
 edges:[["prep","deep"],["deep","build"],["build","cust"],["cust","biz"],["biz","port"],["port","story"],["story","offer"]],
 steps:[
  {t:"Why LeetCode-only fails", n:["prep"], d:"Algorithm puzzles are a small part of an FDE loop. Keep DSA warm, but most of the score comes from the four pillars below."},
  {t:"Deep technical understanding (40%)", n:["deep"], e:["prep>deep"], d:"Explain how things work under follow-up questions: attention, RAG failure modes, query plans, transactions, Kubernetes networking. The guides in this atlas map to this pillar."},
  {t:"Practical implementation (30%)", n:["build"], e:["deep>build"], d:"A 60 to 90 minute build against an API or dataset: working code, tests for failure paths, and talking through trade-offs as you go. Practice timed."},
  {t:"Customer scenario and communication (20%)", n:["cust"], e:["build>cust"], d:"A role-played customer with a vague ask. Scored on discovery questions, scoping, and explaining trade-offs to a non-engineer. See Problem decomposition."},
  {t:"Business acumen (10%)", n:["biz"], e:["cust>biz"], d:"NRR, time-to-value, margin-for-moat, custom sprawl. Show you know why the company funds FDEs."},
  {t:"Portfolio as proof", n:["port"], e:["biz>port"], d:"Project A: an agentic RAG system with a QLoRA-tuned open model, a vector DB, and evals for faithfulness, latency and token cost. Project B: a context-as-a-compiler coding agent in LangGraph using ACE's three roles and file-system tools."},
  {t:"Your own stories", n:["story"], e:["port>story"], d:"Map Vukti, DATAVORE and your MCP work to each pillar as short STAR stories with numbers: situation, task, action, result."},
  {t:"The offer", n:["offer"], e:["story>offer"], d:"Know compensation benchmarks for FDE roles at your target companies before the recruiter call, and negotiate on total compensation."}
 ],
 ideas:["Pillars: depth 40%, build 30%, customer 20%, business 10%.","Learning paths: DeepLearning.AI, Andrew Ng's ML Specialization, Fast.ai, Salesforce Trailhead (Agentforce), Zapier's 4-tier AI fluency framework.","Anthropic's 4Ds of AI fluency: Delegation, Description, Discernment, Diligence.","T-shaped: broad across the stack, deep in one AI area you can defend."],
 traps:["Spending most prep time on DSA.","Portfolio projects with no evals or numbers.","Stories that describe the team's work, not yours."],
 qa:[["Why do you want to be an FDE rather than a SWE?","Tie it to your history: you like owning outcomes with real users and messy data, and you've done it (Vukti, DATAVORE). FDE is where engineering depth and customer impact are the same job."],
     ["Tell me about a time a customer's requirements were unclear.","Pick one real story, show the questions you asked, the metric you agreed, the thin slice you shipped, and the measured result."],
     ["What are Anthropic's 4Ds?","Delegation (deciding what to hand to AI), Description (communicating the task clearly), Discernment (judging the output critically), Diligence (using it responsibly and owning the result)."]]
},
{id:"projecta", mod:7, sec:"7.2", name:"Project A: Agentic RAG",
 title:"Portfolio Project A: an agentic RAG service",
 thesis:"The course's flagship portfolio build, and a good shape for your Vukti service: an agent that retrieves, checks its own evidence, retries, and reports quality, latency and cost.",
 vb:[710,290],
 codeTitle:"LangGraph wiring (sketch)",
 code:`g = StateGraph(RAGState)
g.add_node("retrieve", retrieve)        # pgvector hybrid search
g.add_node("grade", grade_chunks)       # LLM: relevant yes/no
g.add_node("rewrite", rewrite_query)
g.add_node("generate", generate)        # QLoRA-tuned Llama 3 / Mistral
g.add_node("check", grounding_check)    # faithfulness vs. chunks
g.add_edge(START, "retrieve")
g.add_edge("retrieve", "grade")
g.add_conditional_edges("grade", route,
    {"relevant": "generate", "retry": "rewrite"})
g.add_edge("rewrite", "retrieve")
g.add_edge("generate", "check")
g.add_edge("check", END)
# log per request: faithfulness, p95 latency, tokens and cost`,
 nodes:[
  ["q",90,70,"User query","via FastAPI"],
  ["agent",265,70,"Agent graph","LangGraph"],
  ["retrieve",440,70,"pgvector search","hybrid + ACL"],
  ["grade",615,70,"Grade chunks","relevant?"],
  ["rewrite",615,220,"Rewrite query","then retry"],
  ["gen",440,220,"Tuned model","QLoRA Llama 3"],
  ["check",265,220,"Grounding check","faithful?"],
  ["out",90,220,"Answer","+ latency, tokens"]
 ],
 edges:[["q","agent"],["agent","retrieve"],["retrieve","grade"],["grade","rewrite",0,"retry"],["rewrite","retrieve",0],["grade","gen",0,"relevant"],["gen","check"],["check","out"]],
 steps:[
  {t:"Request in", n:["q","agent"], e:["q>agent"], d:"A FastAPI endpoint hands the question to a LangGraph state machine. This reuses the FastAPI guide.", l:[0,6]},
  {t:"Retrieve", n:["retrieve"], e:["agent>retrieve"], d:"Hybrid search in pgvector (vectors plus keyword), filtered by the user's permissions. Pinecone or Milvus work too; pgvector keeps it in one Postgres.", l:[1,7]},
  {t:"Grade the evidence", n:["grade"], e:["retrieve>grade"], d:"A cheap model call judges whether the chunks actually answer the question. This is what makes it agentic rather than a fixed pipeline.", l:[2,8,9,10]},
  {t:"Rewrite and retry", n:["rewrite","retrieve"], e:["grade>rewrite","rewrite>retrieve"], d:"If the evidence is weak, rewrite the query and search again, with a retry cap.", l:[3,11]},
  {t:"Generate", n:["gen"], e:["grade>gen"], d:"A QLoRA-tuned open model (Llama 3 or Mistral) answers in the customer's format with citations. See the fine-tuning guide.", l:[4,12]},
  {t:"Check grounding", n:["check"], e:["gen>check"], d:"Verify every claim is supported by the retrieved chunks. Unsupported answers are blocked or flagged.", l:[5,13]},
  {t:"Answer and measure", n:["out"], e:["check>out"], d:"Return the answer and log faithfulness, p95 latency, tokens and cost per request. Those numbers are what make this a portfolio piece instead of a demo. Deploy it with Docker and Kubernetes and you've covered the RAG, agents, FastAPI, MLOps and evals items in your plan in one service.", l:[14]}
 ],
 ideas:["Agentic RAG = retrieval plus self-checks and retries, as a graph.","Measure faithfulness, latency and token cost from day one.","One deployed service covering RAG, agents, FastAPI, MLOps and evals tells a stronger story than five small demos."],
 traps:["No retry cap on the rewrite loop.","A demo with no eval numbers."],
 qa:[["Walk me through your RAG project's architecture.","FastAPI in front of a LangGraph agent: hybrid pgvector retrieval with ACL filters, an LLM grader that triggers query rewrites, a QLoRA-tuned model for generation, a grounding check, and per-request metrics for faithfulness, latency and cost."],
     ["What did the evals show?","Have real numbers ready: baseline vs. with reranking or grading, faithfulness, p95 latency, cost per 1,000 queries, and the biggest failure category you fixed."]]
}
);
