# Builds ../grammar1.json for "Gramatika 1" (the course grammar seminars G1-G10) from g1.txt ... g10.txt.
# The summaries are written for this app in our own words (not copied from the slides).
# File format:
#   # Seminar title                         (first line)
#   ## Topic title
#   - bullet (Czech; Chinese may appear inline)
#   > 我 不 是 老师 。|Czech translation    example: words separated by spaces; pinyin is generated
#   c|sentence with ＿|right/wrong/wrong|Czech   p|right sentence/wrong/wrong|Czech   o|chunks in order|Czech
# Drills may use only the textbook vocabulary (Integrated Chinese 1/1, lessons 1-10) and its names. Examples may also
# use other words (e.g. from the seminar slides), written 桌子{zhuōzi=stůl}; the app marks them "mimo učebnici".
# Each seminar needs exactly 20 drills.
# Run: python3 grammar1/build.py
import json,re,os
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src=open(os.path.join(root,'examples','build.py'),encoding='utf8').read()
exec(src[:src.index('out=[];errs=[];seen=set()')])   # vocabulary, pinyin and tone-change helpers
gsrc=open(os.path.join(root,'grammar-practice','build.py'),encoding='utf8').read()
exec(gsrc[gsrc.index('TIME='):gsrc.index('for p in sorted(')])   # time words may move before/after the subject in order drills
EXTRA=set('们')
def known_chars():
    k=set()
    for w in list(py)+list(NAMES):k|=set(w)
    return k
KC=known_chars()|EXTRA
HAN=re.compile(r'[㐀-鿿]')
def check(txt,where,errs):
    for c in txt:
        if HAN.match(c) and c not in KC:errs.append(f'{where}: "{c}" is not in the textbook vocabulary')
out={};errs=[]
for n in range(1,11):
    f=os.path.join(root,'grammar1',f'g{n}.txt')
    if not os.path.exists(f):continue
    key=f'S{n}';S={'t':'','topics':[],'drills':[]};cur=None
    for k,line in enumerate(open(f,encoding='utf8'),1):
        line=line.rstrip('\n');w=f'g{n}:{k}'
        if not line.strip():continue
        if line.startswith('## '):cur={'t':line[3:].strip(),'p':[],'ex':[]};S['topics'].append(cur);continue
        if line.startswith('# '):S['t']=line[2:].strip();continue
        if line.startswith('- '):cur['p'].append(line[2:].strip());check(line,w,errs);continue
        if line.startswith('> '):
            zh,cz=[x.strip() for x in line[2:].split('|')];ws=[];nw=[]
            # a word from outside the textbook is allowed in examples only, written 桌子{zhuōzi=stůl}
            for x in re.findall(r'[^\s{]+\{[^}]*\}|\S+',zh):
                m=re.match(r'^(.+)\{([^=}]+)=([^}]+)\}$',x)
                if m:nw.append([m.group(1),m.group(2),m.group(3)]);x=m.group(1)+'{'+m.group(2)+'}'
                ws.append(x)
            ps=[word_py(x,10,errs,w) for x in ws];forced={i:p for i,(x,p) in enumerate(zip(ws,ps)) if '{' in x};ws=[re.sub(r'\{.*\}','',x) for x in ws];ps=sandhi(ws,ps)
            for i,p in forced.items():ps[i]=p   # a reading given with {…} wins over the automatic tone changes
            ok=set(''.join(a for a,_,_ in nw));check(''.join(c for c in ''.join(ws) if c not in ok),w,errs);cur['ex'].append([ws,ps,cz]+([nw] if nw else []));continue
        fl=line.split('|');t=fl[0]
        if t=='c' and len(fl)==4:
            q,opts=fl[1],fl[2].split('/')
            if q.count('＿')!=1:errs.append(f'{w}: needs one ＿')
            if len(set(opts))!=len(opts):errs.append(f'{w}: options repeat')
            check(q+''.join(opts),w,errs);S['drills'].append(['c',q,opts,fl[3]])
        elif t=='p' and len(fl)==3:
            opts=fl[1].split('/')
            if len(set(opts))!=len(opts):errs.append(f'{w}: options repeat')
            check(''.join(opts),w,errs);S['drills'].append(['p',opts,fl[2]])
        elif t=='o' and len(fl)==3:
            ch=fl[1].split()
            if len(ch)<3:errs.append(f'{w}: too few chunks')
            check(''.join(ch),w,errs);alts=[''.join(x) for x in time_alts(ch)]
            S['drills'].append(['o',ch,fl[2]]+([alts] if alts else []))
        else:errs.append(f'{w}: cannot read "{line[:40]}"')
    if len(S['drills'])!=20:errs.append(f'g{n}: {len(S["drills"])} drills, need 20')
    out[key]=S
for e in errs:print(e)
json.dump(out,open(os.path.join(root,'grammar1.json'),'w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
print(len(out),'seminars,',sum(len(s['topics']) for s in out.values()),'topics,',sum(len(t['ex']) for s in out.values() for t in s['topics']),'examples,',sum(len(s['drills']) for s in out.values()),'drills;',len(errs),'problems')
