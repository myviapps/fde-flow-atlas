import json,glob,re,os
import os as _o
S=_o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))+'/'
OUT=_o.path.dirname(S.rstrip('/'))+'/'
src=open(S+'build/atlas_v2_backup.html').read()
B=S+'build/'
def rep(old,new,count=1):
    global src
    assert old in src, old[:70]
    src=src.replace(old,new,count)
lessons={}
for f in sorted(glob.glob(S+'lessons/lessons_?.json'))+sorted(glob.glob(S+'lessons/lessons_6?.json')):
    lessons.update(json.load(open(f)))
for f in sorted(glob.glob(S+'lessons/patch_*.json')):
    for k,v in json.load(open(f)).items():
        if k in lessons:
            lessons[k]['subtopics']=lessons[k].get('subtopics',[])+v.get('add_subtopics',[])
            lessons[k]['glossary']=lessons[k].get('glossary',[])+v.get('add_glossary',[])
            for rs in v.get('replace_subtopics',[]):
                ix=[i for i,x in enumerate(lessons[k]['subtopics']) if x.get('title')==rs.get('title')]
                assert ix,('replace_subtopics: no subtopic',k,rs.get('title'))
                lessons[k]['subtopics'][ix[0]]=rs
            lessons[k]['practice']=lessons[k].get('practice',[])+v.get('add_practice',[])
            for old,new in v.get('fix',[]):
                t=json.dumps(lessons[k],ensure_ascii=False);o2=json.dumps(old,ensure_ascii=False)[1:-1];n2=json.dumps(new,ensure_ascii=False)[1:-1]
                assert o2 in t,('fix not found',k,old[:60]);lessons[k]=json.loads(t.replace(o2,n2))
extra=[]
for f in sorted(glob.glob(S+'lessons/lessons_?_concepts.json'))+sorted(glob.glob(S+'lessons/lessons_6?_concepts.json')):
    extra+=json.load(open(f))
def js(o): return json.dumps(o,ensure_ascii=False).replace('</','<\\/')
order=["computers","terminal","python1","python2","internet","dbbasics","mlbasics","mathbasics","genesis","slg","http","git","tdd","bigo","resilient","sql","planner","normalize","acid","spark","etl","fastapi","deploy","cloud","embeddings","transformer","context","ace","skills","rag","tools","mcp","finetune","evals","case","exec","moat","arc","pod","lastmile","fluency","interview","projecta","projectb"]
have={c['id'] for c in extra}
order=[o for o in order if o in have or o not in {"http","git","tdd","bigo","normalize","embeddings","fluency","projectb","computers","terminal","python1","python2","internet","dbbasics","mlbasics","mathbasics"}]
rep('const MODS = {\n  1:','const MODS = {\n  0:"Prerequisites",\n  1:')
if 'computers' in have: rep("load(C.some(c=>c.id===start)?start:'genesis',false);","load(C.some(c=>c.id===start)?start:'computers',false);")
rep('.qa{display:flex',open(B+'lesson_css.txt').read()+'.qa{display:flex')
rep('    <div class="cols">',open(B+'lesson_html.txt').read()+'    <div class="cols">')
m=re.search(r'const ORDER = \[.*?\];',src)
src=src[:m.start()]+'NEW.push(...'+js(extra)+');\nconst LESSONS = '+js(lessons)+';\nconst ORDER = '+js(order)+';'+src[m.end():]
rep('function drawDiagram(c){',open(B+'lesson_js.txt').read()+'function drawDiagram(c){')
rep('  drawDiagram(c);','  drawDiagram(c);\n  renderLesson(c);')
n=len(order)
rep('The FDE Academy curriculum, module by module. Every concept is drawn as a moving flow: press play, or step through with the arrow keys.',
    'The FDE Academy curriculum from scratch, module by module. Each of the %d concepts has a moving flow to watch, then a full lesson with examples, code, a glossary and practice.'%n)
open(S+'work/fde-flow-atlas.html','w').write(src)
off=re.sub(r'<link rel="(preconnect|stylesheet)" href="https://fonts\.[^"]*"( crossorigin)?>\n','',src)
off='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">\n'+off.replace('<header class="top">','</head><body>\n<header class="top">',1)+'\n</body></html>\n'
left=[u for u in re.findall(r'https?://[^\s"\'<>]+',off) if 'w3.org/2000/svg' not in u]
pass
open(OUT+'FDE_Flow_Atlas.html','w').write(off)
missing=[o for o in order if o not in lessons]
print('concepts',n,'lessons',len(lessons),'missing lessons',missing,'urls in offline',left[:5],'size',len(off))
