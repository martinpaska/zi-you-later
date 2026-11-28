# Builds one HSK pack (new HSK, official syllabus of 2025-11, valid from 2026-07) from the sources in its folder hsk<N>/:
#   words.tsv     the words of the official vocabulary list of that level (HSK 考试大纲, CLEC 2025)
#   chars.txt     the characters to recognise at that level (official order)
#   write.txt     the characters to write (official order; for HSK 1 and 2 one list for both levels)
#   lessons.txt   the words grouped into the communicative tasks of the official task syllabus
#   grammar.txt, sentences.txt  grammar points, exercises and sentences (build_grammar.py)
#   tests.txt     practice tests in the official HSK format (build_grammar.py), if the level has them
#   cedict-hsk<N>.u8  CC-CEDICT entries for these words and characters (English meanings, traditional forms; CC BY-SA 4.0)
#   meanings.py   meanings picked by hand where the dictionary's first senses are not the HSK sense
# HSK 1 is loaded on startup: the line `const HSK1=…;` in js/data-hsk1.js, grammar-hsk1.json, hsk1-tests.json, and its
# stroke data goes into strokes.json. HSK 2 and up are loaded only when the course is chosen (js/pack-load.js):
# packs/hsk<N>.js, packs/hsk<N>-grammar.json, packs/hsk<N>-tests.json and packs/hsk<N>-strokes.json (stroke data for the
# characters that strokes.json does not have, so strokes.json stays the same size for everyone else).
# Every level may use the words of the levels below it in sentences and exercises (the lists are cumulative).
# Stroke data for characters missing from strokes.json comes from hanzi-writer-data (Make Me a Hanzi, Arphic PL).
#
# Needs: pip install pypinyin==0.55.0
# Run: npm pack hanzi-writer-data@2.0.1 && tar xzf hanzi-writer-data-2.0.1.tgz
#      python3 hsk/build.py package 1       (the unpacked hanzi-writer-data folder, then the level; 1 if left out)
import json,os,re,sys,unicodedata,runpy
from pypinyin import pinyin as _pinyin,Style   # pip install pypinyin==0.55.0: a character's main reading
HERE=os.path.dirname(os.path.abspath(__file__));R=os.path.dirname(HERE)
LEVEL=int(sys.argv[2]) if len(sys.argv)>2 else 1
H=os.path.join(R,f'hsk{LEVEL}')
# how many words and characters the official lists have, per level
COUNTS={1:(300,246),2:(200,125),3:(500,284),4:(1000,441),5:(1600,431),6:(1800,413)}
def lines(f,d=None):return [l.rstrip('\n') for l in open(os.path.join(d or H,f),encoding='utf8') if l.strip() and not l.startswith('# ')]
errs=[]
HAN=lambda c:'㐀'<=c<='鿿'
base=lambda w:re.sub(r'\d$','',w)
M=runpy.run_path(os.path.join(H,'meanings.py'))
OVERRIDE,CHAR_EN,TRAD=M.get('OVERRIDE',{}),M.get('CHAR_EN',{}),M.get('TRAD',{})

# the official word lists: this level's, and the levels below it (sentences may use those too)
def words_of(lv):
    out=[]
    for l in lines('words.tsv',os.path.join(R,f'hsk{lv}')):
        no,_,w,py,pos=(l.split('\t')+[''])[:5];out.append(dict(no=int(no),w=w,s=base(w),py=py.split('/')[0].replace('’',"'"),pos=pos))
    return out
W=words_of(LEVEL)
# a word written the same way twice in one list (过 guò, 过 guo) is written word|pinyin in lessons.txt
from collections import Counter
_n=Counter(w['w'] for w in W)
for w in W:w['k']=w['w'] if _n[w['w']]==1 else w['w']+'|'+w['py']
chars=list(lines('chars.txt')[0]);write=set(lines('write.txt')[0])
nw,nc=COUNTS[LEVEL]
if len(W)!=nw:errs.append(f"{len(W)} words, the official list has {nw}")
if len(chars)!=nc:errs.append(f'{len(chars)} characters, the official list has {nc}')

# lessons
L=[];at={}
for l in lines('lessons.txt'):
    if l.startswith('## '):
        n,en,zh,seal=[x.strip() for x in l[3:].split('|')];L.append(dict(l=n,en=en,zh=zh,seal=seal,words=[]));continue
    for w in l.split():
        if w in at:errs.append(f'"{w}" is in lessons {at[w]} and {L[-1]["l"]}')
        at[w]=L[-1]['l'];L[-1]['words'].append(w)
official={w['k'] for w in W}
for w in at:
    if w not in official:errs.append(f'"{w}" in lessons.txt is not in the official list')
for w in official:
    if w not in at:errs.append(f'"{w}" of the official list is in no lesson')
for x in L:
    if x['seal'] not in chars:errs.append(f'seal {x["seal"]} of lesson {x["l"]} is not an HSK {LEVEL} character')
if len({x['seal'] for x in L})!=len(L):errs.append('two lessons have the same seal')
ORD={x['l']:i for i,x in enumerate(L)}
if errs:sys.exit('\n'.join('! '+e for e in errs))

# CC-CEDICT
E={}
for l in lines(f'cedict-hsk{LEVEL}.u8'):
    m=re.match(r'(\S+) (\S+) \[([^\]]+)\] /(.*)/',l)
    if m:E.setdefault(m.group(2),[]).append(dict(t=m.group(1),py=m.group(3),senses=m.group(4).split('/')))
def syl_tone(s):
    for c in unicodedata.normalize('NFD',s):
        o=ord(c)
        if o in (0x304,0x301,0x30C,0x300):return {0x304:1,0x301:2,0x30C:3,0x300:4}[o]
    return 0
def bare(s):return ''.join(c for c in unicodedata.normalize('NFD',s.lower()) if not 0x300<=ord(c)<=0x36f).replace('ü','v')
SYL=re.compile(r"(?:[zcs]h|[bpmfdtnlgkhjqxrzcsyw])?[aeiouüvāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+(?:ng(?![aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ])|n(?![aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ])|r(?![aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]))?",re.I)
def syls(py):return SYL.findall(py.replace("'",' '))
SKIP=re.compile(r'^(surname |.*\(surname\)$|variant of|old variant|see |CL:|abbr\.|Taiwan pr\.|also pr\.|\(old\)|\(dialect\)|\(Tw\)|\(archaic\)|\(literary\)|used in |\(bound form\) ?$)',re.I)
def clean(senses,maxn=3):
    out=[]
    for s in senses:
        s=re.sub(r'\s*CL:[^/]*','',s);s=re.sub(r'\[[^\]]*\]','',s)
        s=re.sub(r'\((?:Note|used|colloquial|also|Tw|bound form|specifier|pronoun|coll\.|loanword|onom\.)[^)]*\)\s*','',s,flags=re.I)
        s=re.sub(r'\(\s*;?\s*\)','',s).strip(' ;,')
        if not s or SKIP.match(s) or len(s)>48:continue
        if s not in out:out.append(s)
        if len(out)==maxn:break
    return '; '.join(out)
def numbered(py):
    out=[]
    for x in syls(py):out.append(bare(x).replace('v','u:')+str(syl_tone(x) or 5))
    return ''.join(out)
def entry(s,py=None):
    es=[e for e in (E.get(s) or []) if clean(e['senses'])]
    if not es:return None
    # a lower-case reading first (not a surname), then an entry that is not itself a variant of another character, then the one with most senses
    rank=lambda e:(not e['py'][:1].isupper(),not any('variant of' in x for x in e['senses']),len(clean(e['senses'],9)))
    if py:
        k=numbered(py)
        m=[e for e in es if e['py'].lower().replace(' ','')==k] or [e for e in es if e['py'].lower().replace(' ','').rstrip('5')==k.rstrip('5')]
        if m:return max(m,key=rank)
    return max(es,key=rank)
POS={'名':'n','动':'v','形':'adj','副':'adv','代':'pr','数':'nu','量':'m','助':'p','介':'prep','连':'conj','叹':'interj','数量':'nu+m','前缀':'prefix','后缀':'suffix'}
def pos_of(p):
    p=re.sub(r'[（）()]','',p).split('、')[0].strip()
    return POS.get(p,'')

# words (two senses of one word with the same reading, like 花1 to spend and 花2 flower, become one card)
t2={};wd=[];byk={}
for w in W:
    e=entry(w['s'],w['py']);en=OVERRIDE.get(w['k']) or OVERRIDE.get(w['w']) or OVERRIDE.get(w['s']) or (clean(e['senses'],2) if e else '')
    if not en:errs.append(f'no meaning for {w["w"]}')
    if e and w['s'] in TRAD:e={**e,'t':TRAD[w['s']]}
    if e:
        for a,b in zip(w['s'],e['t']):
            if a!=b:t2[a]=b
    k=(w['s'],w['py'])
    if k in byk:
        x=byk[k]
        if en not in x[4]:x[4]+='; '+en
        continue
    byk[k]=[at[w['k']],w['s'],w['py'],pos_of(w['pos']),en,'m'];wd.append(byk[k])
def word_pos(x):return [y['words'] for y in L if y['l']==x[0]][0].index(next(w['k'] for w in W if w['s']==x[1] and w['py']==x[2] and at[w['k']]==x[0]))
wd.sort(key=lambda x:(ORD[x[0]],word_pos(x)))

# characters: the lesson of the first word that uses it, its reading in that word; the rest by hand
NOWORD,NOWORD_PY=M.get('NOWORD',{}),M.get('NOWORD_PY',{})
NEUTRAL=set('吗呢吧的了么们着过啊')   # particles and suffixes that are neutral on their own too
ch=[]
for c in chars:
    single=next((w for w in W if w['s']==c),None);used=[w for w in W if c in w['s']]
    used.sort(key=lambda w:ORD[at[w['k']]])
    if single:l=at[single['k']];py=single['py']
    elif used:
        w=used[0];l=at[w['k']];ss=syls(w['py'])
        py=ss[w['s'].index(c)] if len(ss)==len(w['s']) else None
    else:l=NOWORD.get(c);py=NOWORD_PY.get(c)
    # a character that is toneless inside a word (先生 xiānsheng) still has its own tone (生 shēng)
    if py and not syl_tone(py) and c not in NEUTRAL:py=None
    if not l:errs.append(f'character {c} has no lesson');continue
    if not py:py=_pinyin(c,style=Style.TONE,heteronym=False)[0][0]
    e=entry(c,py)
    t=syl_tone(py);s=bare(py).replace('v','ü')
    en=CHAR_EN.get(c) or OVERRIDE.get(c) or (clean(e['senses'],2) if e else '')
    if not en:errs.append(f'no meaning for character {c}')
    tr=t2.get(c) or (c if (single or used) else e['t'] if e and len(e['t'])==1 else c)
    if tr!=c:t2[c]=tr
    ch.append([l,tr,c,py.lower() if py[:1].isupper() else py,t,s,en])
ch.sort(key=lambda x:(ORD[x[0]],chars.index(x[2])))

meta=dict(id=f'hsk{LEVEL}',lessons=[dict(l=x['l'],en=x['en'],zh=x['zh'],seal=x['seal']) for x in L],write=[c for c in chars if c in write])
# grammar points, their exercises and the sentences (grammar.txt, sentences.txt; see build_grammar.py)
sys.path.insert(0,HERE);import build_grammar
below=[(w['s'],w['py']) for lv in range(1,LEVEL) for w in words_of(lv)]
extra={k:v for lv in range(1,LEVEL+1) for k,v in runpy.run_path(os.path.join(R,f'hsk{lv}','meanings.py')).get('EXTRA',{}).items()}   # (the grammar words of the levels below too)
st,gram,drills,tests,gerr=build_grammar.make(H,LEVEL,[(w['s'],w['py']) for w in W],below,extra,[x['l'] for x in L]);errs+=gerr;meta['grammar']=gram
if tests:meta['tests']=len(tests)
pack=dict(ch=ch,wd=wd,st=st,t2=t2,meta=meta)
# traditional forms of the characters of the sentences that come from lower levels (their own packs may not be loaded):
# taken from the packs of those levels as built
def built_t2(lv):
    f=os.path.join(R,'js','data-hsk1.js') if lv==1 else os.path.join(R,'packs',f'hsk{lv}.js')
    m=re.search(r'^(?:const HSK1|PACK_DATA\.hsk\d+)=(\{.*\});$',open(f,encoding='utf8').read(),flags=re.M)
    return json.loads(m.group(1))['t2'] if m else {}
if LEVEL>1:
    t2low={}
    for lv in range(1,LEVEL):t2low.update(built_t2(lv))
    for x in st:
        for c in ''.join(x[1]):
            if c not in t2 and c in t2low:t2[c]=t2low[c]

# stroke data for characters not yet in strokes.json (HSK 2 and up: in a file of their own)
sp=os.path.join(R,'strokes.json');S=json.load(open(sp,encoding='utf8'));add=0
own={} if LEVEL==1 else None
need=sorted({c for c in ''.join(x[2]+x[1] for x in ch)+''.join(x[1] for x in wd)+(''.join(''.join(x[1]) for x in st) if LEVEL>1 else '') if HAN(c)}|{t2.get(c,c) for x in wd for c in x[1]})
hwd=sys.argv[1] if len(sys.argv)>1 else None
if LEVEL>1:
    op=os.path.join(R,'packs',f'hsk{LEVEL}-strokes.json');old=json.load(open(op,encoding='utf8')) if os.path.exists(op) else {}
    own={}
for c in need:
    if c in S:continue
    if own is not None and LEVEL>1 and c in old:own[c]=old[c];continue
    f=os.path.join(hwd,c+'.json') if hwd else None
    if f and os.path.exists(f):
        d=json.load(open(f,encoding='utf8'));v={'strokes':d['strokes'],'medians':d['medians']};add+=1
        if LEVEL==1:S[c]=v
        else:own[c]=v
    elif c in chars or any(c in x[1] for x in wd):errs.append(f'no stroke data for {c}' if hwd else f'no stroke data for {c} (pass the hanzi-writer-data folder)')

for e in errs:print('!',e)
if errs and any(not e.startswith('no stroke data') for e in errs):sys.exit(1)
js=lambda x:json.dumps(x,ensure_ascii=False,separators=(',',':'))
if LEVEL==1:
    if add:json.dump(S,open(sp,'w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
    ip=os.path.join(R,'js','data-hsk1.js');s=open(ip,encoding='utf8').read()
    line='const HSK1='+js(pack)+';'
    s2,n=re.subn(r'^const HSK1=.*;$',lambda m:line,s,count=1,flags=re.M)
    if not n:sys.exit('js/data-hsk1.js has no line "const HSK1=…;"')
    open(ip,'w',encoding='utf8').write(s2)
    open(os.path.join(R,'grammar-hsk1.json'),'w',encoding='utf8').write(js(drills))
    open(os.path.join(R,'hsk1-tests.json'),'w',encoding='utf8').write(js(tests))
else:
    P=os.path.join(R,'packs');os.makedirs(P,exist_ok=True);n=f'hsk{LEVEL}'
    open(os.path.join(P,n+'.js'),'w',encoding='utf8').write(f'/* the HSK {LEVEL} pack (new HSK, official syllabus 2025), built by hsk/build.py from hsk{LEVEL}/. It is loaded only when\n   the course is chosen (js/pack-load.js); meanings from CC-CEDICT (CC BY-SA 4.0) */\nPACK_DATA.{n}={js(pack)};\n')
    open(os.path.join(P,n+'-grammar.json'),'w',encoding='utf8').write(js(drills))
    open(os.path.join(P,n+'-strokes.json'),'w',encoding='utf8').write(js(dict(sorted(own.items()))))
    tp=os.path.join(P,n+'-tests.json')
    if tests:open(tp,'w',encoding='utf8').write(js(tests))
    elif os.path.exists(tp):os.remove(tp)
print(f'HSK {LEVEL}: {len(ch)} characters, {len(wd)} words, {len(L)} lessons, {len(meta["write"])} to write, {sum(map(len,gram.values()))} grammar points, {sum(map(len,drills.values()))} exercises, {len(st)} sentences, {len(tests)} practice tests; {add} stroke sets added; {len(errs)} problems')
