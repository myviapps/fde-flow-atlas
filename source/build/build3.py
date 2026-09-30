import json,glob,re,os,subprocess
import os as _o
S=_o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))+'/'
OUT=_o.path.dirname(S.rstrip('/'))+'/'
B=S+'build/'
subprocess.run(['python3',B+'build2.py'],check=True,capture_output=True)
src=open(S+'work/fde-flow-atlas.html').read()
def rep(old,new):
    global src
    assert src.count(old)==1, ('count',src.count(old),old[:80])
    src=src.replace(old,new)
def js(o): return json.dumps(o,ensure_ascii=False).replace('</','<\\/')
projects=[]
for f in sorted(glob.glob(S+'lessons/proj_*_projects.json')): projects+=json.load(open(f))
cases={}
for f in sorted(glob.glob(S+'lessons/cases_*.json')): cases.update(json.load(open(f)))
# gather ids present
newc=[]
for f in sorted(glob.glob(S+'lessons/lessons_[i-z]_concepts.json'))+sorted(glob.glob(S+'lessons/lessons_6?_concepts.json')): newc+=json.load(open(f))
V4=[c['id'] for c in newc]+[p['id'] for p in projects]
FULL=["computers","terminal","python1","python2","pandas","dataformats","internet","dbbasics","mlbasics","mathbasics","linux","frontend","typescript","oop","asyncpy","pytooling","stats",
 "genesis","fderoles","slg","fdeskills",
 "http","git","tdd","debugging","aicoding","bigo","resilient","sql","planner","normalize","acid","spark","etl","dataquality","warehouse","fastapi","deploy","cloud","entnetwork","security","compliance","regulated","observability","caching","queues","sysdesign","apistyles","nosql","streaming","cicd","integration","webauto","bi","spreadsheets",
 "mlworkflow","featureeng","linreg","logreg","trees","boosting","knnsvm","clustering","dimred","anomaly","timeseries","recsys","neuralnets","dlarch",
 "embeddings","transformer","llmapi","prompting","context","ace","skills","rag","tools","mcp","multiagent","agentmemory","finetune","rlhf","evals","labeling","llmobs","guardrails","llmcost","mlops","mlmetrics","docai","serving","frameworks","graphrag","multimodal","voice","responsibleai",
 "case","discovery","poc","exec","docs","demo","moat","change","pm","roi",
 "arc","pod","asyncwriting","fieldlife","incidents","ethics",
 "aireadiness","lastmile","golive","supportops","cxagents","enablement","expansion","psa","lowcode",
 "fluency","interview","interviewrounds","dsa","builddrill","casebank","sqlbank","career","portfolio","projecta","projectb",
 "p0-setup","p1-csv-cleaner","p2-sql-analytics","p3-fastapi-service","p4-ingestion","p5-docker-deploy","p6-tool-agent","p7-mcp-server","p8-rag-evals","p9-capstone","p10-drill"]
m=re.search(r'const ORDER = (\[.*?\]);',src)
have=set(json.loads(m.group(1)))|set(V4)
order=[o for o in FULL if o in have]
missing_in_full=[o for o in have if o not in FULL]
order+=missing_in_full
src=src[:m.start()]+'NEW.push(...'+js(newc+projects)+');\nconst CASES = '+js(cases)+';\nconst NEWV4 = '+js(V4)+';\nconst ORDER = '+js(order)+';'+src[m.end():]
rep('3:"Enterprise AI and GenAI",','3:"Machine learning and GenAI",')
rep('const MODS = {\n  0:"Prerequisites",','const MODS = {\n  0:"Prerequisites",\n  8:"Hands-on projects",')
rep('.qa{display:flex',open(B+'v4_css.txt').read()+'.qa{display:flex')
rep('  <main>\n','  <main>\n  <div id="conceptView" style="display:contents">\n')
rep('  </main>','  </div>\n'+open(B+'v4_html_syl.txt').read()+'  </main>')
i=src.index('<div class="panel"><h4>Key ideas</h4>'); i=src.rindex('<div class="cols">',0,i); j=src.rindex('\n',0,i)+1
src=src[:j]+open(B+'v4_html_case.txt').read()+open(B+'v4_html_project.txt').read()+src[j:]
rep('function drawDiagram(c){',open(B+'v4_js.txt').read()+'function drawDiagram(c){')
rep("  const c=C.find(x=>x.id===id)||C[0];cur=c;step=0;","  if(id==='syllabus'){openSyllabus(fromUser);return;}\n  showView('concept');\n  const c=C.find(x=>x.id===id)||C[0];cur=c;step=0;")
a=src.index('  drawDiagram(c);\n  renderLesson(c);'); b=src.index('if(!reduced) play(); else stop();',a)+len('if(!reduced) play(); else stop();')
src=src[:a]+'''  const fmt=c.format||'animation';
  stop();animToken++;
  stage.hidden=(fmt==='text'||fmt==='project');
  stage.classList.toggle('static',fmt==='flowchart');
  const dots=document.getElementById('dots');dots.innerHTML='';
  if(fmt==='animation'||fmt==='flowchart')drawDiagram(c);
  renderLesson(c);renderCase(c);renderProject(c);
  try{history.replaceState(null,'','#'+c.id)}catch(e){}
  try{localStorage.setItem('fde-atlas-last',c.id)}catch(e){}
  if(fmt==='animation'){
    c.steps.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.className='dot';b.setAttribute('aria-label','Step '+(i+1)+': '+s.t);b.onclick=()=>{stop();go(i)};dots.appendChild(b)});
    go(0);
    if(!reduced) play(); else stop();
  } else if(fmt==='flowchart'){
    document.getElementById('stepno').textContent='';
    document.getElementById('stitle').textContent='How to read this chart';
    document.getElementById('stext').textContent=c.note||'';
  }'''+src[b:]
rep('function go(i){','function go(i){\n  if(!cur||!cur.steps||!cur.steps.length||(cur.format&&cur.format!==\'animation\'))return;')
rep('function play(){','function play(){if(!cur||!cur.steps||(cur.format&&cur.format!==\'animation\'))return;')
rep("  const pick=document.getElementById('picker');","  const pick=document.getElementById('picker');\n  {const b=document.createElement('button');b.type='button';b.className='navtop';b.id='navSyl';b.textContent='Syllabus and progress';b.onclick=()=>openSyllabus(true);nav.appendChild(b);\n   const o=document.createElement('option');o.value='syllabus';o.textContent='Syllabus and progress';pick.appendChild(o);}")
rep("if(!C.some(c=>c.id===start)){","if(start!=='syllabus'&&!C.some(c=>c.id===start)){")
src=re.sub(r"load\(C\.some\(c=>c\.id===start\)\?start:'(\w+)',false\);",lambda m:"load(start==='syllabus'||C.some(c=>c.id===start)?start:'"+m.group(1)+"',false);",src)
# lesson extras
rep("    subs.appendChild(a);","    if(s.table)a.appendChild(mkTable(s.table));\n    if(s.checklist&&s.checklist.length)a.appendChild(mkChecklist(s.checklist,'cl:'+c.id+':'+i));\n    if(s.flow&&s.flow.nodes)a.appendChild(mkFlow(s.flow));\n    subs.appendChild(a);")

# ---- v5: interactive widgets, quizzes, templates, best-format tags
wjs='var WIDGETS={},WIDGET_CSS="";\n'
for f in sorted(glob.glob(S+'lessons/widgets_*.js')):
    code=re.sub(r'</(script)',r'<\\/\1',open(f).read(),flags=re.I)
    wjs+='try{\n'+code+'\n}catch(e){console.error("widgets file failed","'+os.path.basename(f)+'",e)}\n'
quiz={}
for f in sorted(glob.glob(S+'lessons/quiz_*.json')): quiz.update(json.load(open(f)))
docs=[]
for f in sorted(glob.glob(S+'lessons/docs_pack*.json')): docs+=json.load(open(f))
fit={}
for f in sorted(glob.glob(S+'lessons/fit*.json')): fit.update(json.load(open(f)))
rep('const CASES = ','const QUIZ = '+js(quiz)+';\nconst DOCS = '+js(docs)+';\nconst FIT = '+js(fit)+';\n'+wjs+'const CASES = ')
rep('.qa{display:flex',open(B+'v5_css.txt').read()+'.qa{display:flex')
rep('<p class="thesis" id="thesis"></p>','<p class="thesis" id="thesis"></p>\n      <p class="fitline" id="fitline" hidden></p>')
rep('    <section class="lesson" id="lesson"',open(B+'v5_html_try.txt').read()+'    <section class="lesson" id="lesson"')
rep('    <div class="panel"><h4>Interview questions, with a strong answer</h4>',open(B+'v5_html_quiz.txt').read()+'    <div class="panel"><h4>Interview questions, with a strong answer</h4>')
rep('  </main>',open(B+'v5_html_tpl.txt').read()+'  </main>')
rep('function drawDiagram(c){',open(B+'v5_js.txt').read()+'function drawDiagram(c){')
rep("if(id==='syllabus'){openSyllabus(fromUser);return;}","if(isViewId(id)){openView(id,fromUser);return;}")
rep("if(start!=='syllabus'&&!C.some(","if(!isViewId(start)&&!C.some(")
src=src.replace("load(start==='syllabus'||","load(isViewId(start)||")
rep("renderLesson(c);renderCase(c);renderProject(c);","renderFit(c);renderTry(c);renderLesson(c);renderCase(c);renderProject(c);renderQuiz(c);renderTplRel(c);")
rep("document.getElementById('syllabusView').hidden=v!=='syllabus';","document.getElementById('syllabusView').hidden=v!=='syllabus';document.getElementById('templatesView').hidden=v!=='templates';{const t=document.getElementById('navTpl');if(t)t.setAttribute('aria-current',v==='templates'?'true':'false');}")
rep("pick.appendChild(o);}","pick.appendChild(o);}\n  if(DOCS.length){const b=document.createElement('button');b.type='button';b.className='navtop';b.id='navTpl';b.style.marginTop='6px';b.textContent='Templates library';b.onclick=()=>openTemplates(null,true);nav.appendChild(b);\n   const o=document.createElement('option');o.value='templates';o.textContent='Templates library';pick.appendChild(o);}")
rep("sm.appendChild(nw);}","sm.appendChild(nw);}\n      if(WIDGETS[c.id]){const t=document.createElement('span');t.className='fmt';t.textContent='Try it';sm.appendChild(t);}\n      {const qb=qstore()[c.id];if(qb!=null&&QUIZ[c.id]){const t=document.createElement('span');t.className='fmt';t.textContent='Quiz '+qb+'/'+QUIZ[c.id].length;sm.appendChild(t);}}")

# ---- v6: collapsible sidebar, full-width layout, wrapped code, per-learner progress
rep('.qa{display:flex',open(B+'v6_css.txt').read()+'.qa{display:flex')
rep("const gE=el('g',{},svg),gL=el('g',{},svg),gN=el('g',{},svg);","const gE=el('g',{},svg),gN=el('g',{},svg),gL=el('g',{},svg);")
rep("lt=el('text',{x:mid[0],y:mid[1]+off,'text-anchor':'middle',class:'elabel'},gL)","const lp=lblPos(a,b,mid,label,off);lt=el('text',{x:lp[0],y:lp[1],'text-anchor':lp[2],class:'elabel'},gL)")
rep('function drawDiagram(c){',open(B+'v6_js.txt').read()+'function drawDiagram(c){')
for k in ['fde-atlas-done','fde-atlas-quiz']:
    src=src.replace("localStorage.getItem('%s'"%k,"localStorage.getItem(pk('%s')"%k).replace("localStorage.setItem('%s',"%k,"localStorage.setItem(pk('%s'),"%k)
src=src.replace("localStorage.setItem('fde-atlas-last',","localStorage.setItem(pk('fde-atlas-last'),").replace("localStorage.getItem('fde-atlas-last')","localStorage.getItem(pk('fde-atlas-last'))")
rep("function saveStore(s){try{localStorage.setItem(pk('fde-atlas-done'),JSON.stringify(s))}catch(e){}}","function saveStore(s){try{localStorage.setItem(pk('fde-atlas-done'),JSON.stringify(s))}catch(e){}renderProgress()}")
rep("function qsave(s){try{localStorage.setItem(pk('fde-atlas-quiz'),JSON.stringify(s))}catch(e){}}","function qsave(s){try{localStorage.setItem(pk('fde-atlas-quiz'),JSON.stringify(s))}catch(e){}renderProgress()}")
rep("let start=(location.hash||'').slice(1);","initV6();\nlet start=(location.hash||'').slice(1);")
nproj=sum(1 for p in projects if p['id'] in order); n=len(order)-nproj
src=re.sub(r'<header class="top">\s*<h1>FDE Flow Atlas</h1>\s*<p>.*?</p>','<header class="top">\n  <h1>FDE Flow Atlas</h1>\n  <p>Become a Forward Deployed Engineer from scratch: %d topics from prerequisites to interviews, taught with animations, flowcharts, lessons, case studies and code, plus %d hands-on projects. Start with Syllabus and progress to track your to-do list.</p>'%(n,nproj),src,flags=re.S)
for f in sorted(glob.glob(S+'lessons/patch_*.json')):
    for k,v in json.load(open(f)).items():
        for old,new in v.get('concept_fix',[]):
            o2=json.dumps(old,ensure_ascii=False)[1:-1].replace('</','<\\/');n2=json.dumps(new,ensure_ascii=False)[1:-1].replace('</','<\\/')
            if o2 not in src: o2,n2=old,new
            assert src.count(o2)>=1,('concept_fix not found',k,old[:70]);src=src.replace(o2,n2)
open(S+'work/fde-flow-atlas.html','w').write(src)
off=re.sub(r'<link rel="(preconnect|stylesheet)" href="https://fonts\.[^"]*"( crossorigin)?>\n','',src)
off='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">\n'+off.replace('<header class="top">','</head><body>\n<header class="top">',1)+'\n</body></html>\n'
assert '<link rel="stylesheet" href="https://fonts' not in off
open(OUT+'FDE_Flow_Atlas.html','w').write(off)
print('widgets',len(re.findall(r'widgets_',wjs)),'quiz',len(quiz),'docs',len(docs),'fit',len(fit));print('topics',n,'projects',nproj,'cases',len(cases),'new',len(V4),'size',len(off))
