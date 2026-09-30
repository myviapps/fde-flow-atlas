const MODS = {
  1:"FDE Paradigm and Genesis",
  2:"Technical and Data Foundations",
  3:"Enterprise AI and GenAI",
  4:"Human Stack and Business Acumen",
  5:"FDE Operational Playbook",
  6:"AI Onboarding and Services",
  7:"Portfolio and Interviews"
};
const PATCH = {
  sql:{mod:2, sec:"2.2"},
  fastapi:{mod:2, sec:"2.1"},
  deploy:{mod:2, sec:"2.3", extraIdeas:["Multi-stage builds: compile or install in a 'builder' stage, copy only the result into a slim final image. Smaller images pull faster and have fewer vulnerabilities.","StatefulSets give pods stable names and their own volumes, for databases and vector stores. Deployments are for stateless services.","Service discovery: pods reach a Service by DNS name, such as ask-api.default.svc.cluster.local."]},
  rag:{mod:3, sec:"3.2 and 7.2"},
  tools:{mod:3, sec:"3.3"},
  mcp:{mod:3, sec:"your action plan"},
  evals:{mod:3, sec:"7.2"},
  "case":{mod:4, sec:"4.2", name:"Problem decomposition", extraIdeas:["Peel the onion: keep asking why until you reach the real blocker, which is often a handoff or a data owner, not a model.","Map power dynamics: who decides, who blocks, who benefits.","Find the 80/20 leverage point: the one change that moves most of the metric."]}
};
const ORDER = ["genesis","slg","resilient","sql","planner","acid","spark","etl","fastapi","deploy","cloud","transformer","context","ace","skills","rag","tools","mcp","finetune","evals","case","exec","moat","arc","pod","lastmile","interview","projecta"];
const ALL = {};
OLD.forEach(c=>{ if(PATCH[c.id]) ALL[c.id]=c; });
NEW.forEach(c=>{ ALL[c.id]=c; });
for (const id in PATCH){ const p=PATCH[id], c=ALL[id]; c.mod=p.mod; c.sec=p.sec; if(p.name)c.name=p.name; if(p.extraIdeas)c.ideas=c.ideas.concat(p.extraIdeas); }
const C = ORDER.map(id=>{ if(!ALL[id]) throw new Error("missing "+id); return ALL[id]; });
