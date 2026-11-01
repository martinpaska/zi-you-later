# Builds ../examples.json (extra short example sentences) from l1.txt … l10.txt.
# Line format:  words separated by spaces | English
#   - every word gets its pinyin from the app's vocabulary (characters and words), or from NAMES below;
#   - force a reading with 字{pinyin}, e.g. 得{děi};  不 and 一 get their tone changes automatically.
# The checker refuses words that are not in the vocabulary up to that lesson (names and numbers are fine).
# Run: python3 examples/build.py  (writes examples.json next to index.html)
import json,re,os,sys
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s=open(os.path.join(root,'index.html'),encoding='utf8').read()
i=s.index('const DATA=');j=s.index('\n',i);D=json.loads(s[i+len('const DATA='):j].rstrip(';'))
ORD={str(n):n for n in range(1,11)};ORD['I']=0
py={};lev={}
def add(w,p,l):
    if w not in py:py[w]=p
    lev[w]=min(lev.get(w,99),ORD[str(l)])
for l,t,sm,p,*_ in D['ch']:add(sm,p,l);add(t,p,l)
for w in D['wd']:
    l,word,p=str(w[0]),w[1],w[2]
    if '…' in word:
        for a,b in zip(word.split('…'),p.split('…')):add(a.strip(),b.strip(),l)
        continue
    m=re.match(r'^(.*)\((.*)\)(.*)$',word)
    if m:
        a,b,c=m.groups();pm=re.match(r'^(.*)\((.*)\)(.*)$',p)
        pa,pb,pc=pm.groups() if pm else (p,'','')
        add(a+c,(pa+pc).strip(),l);add(a+b+c,(pa+pb+pc).strip(),l);continue
    add(word,p,l)
NAMES={'王':'Wáng','李':'Lǐ','白':'Bái','高':'Gāo','常':'Cháng','王朋':'Wáng Péng','李友':'Lǐ Yǒu','白英爱':"Bái Yīng'ài",'高文中':'Gāo Wénzhōng','王红':'Wáng Hóng','常老师':'Cháng lǎoshī','王老师':'Wáng lǎoshī','李老师':'Lǐ lǎoshī','小李':'Xiǎo Lǐ','小王':'Xiǎo Wáng','小高':'Xiǎo Gāo','王先生':'Wáng xiānsheng','李小姐':'Lǐ xiǎojiě','们':'men','个':'ge','我们':'wǒmen','他们':'tāmen','她们':'tāmen','你们':'nǐmen','这个':'zhège','那个':'nàge','哪个':'nǎge','一点儿':'yìdiǎnr','什么':'shénme','中国人':'Zhōngguórén','美国人':'Měiguórén','英国人':'Yīngguórén','北京人':'Běijīngrén','纽约人':'Niǔyuērén','中国菜':'Zhōngguó cài','美国菜':'Měiguó cài','十':'shí','第':'dì'}
NUM='零一二三四五六七八九十百两'
DIG={'零':'líng','一':'yī','二':'èr','三':'sān','四':'sì','五':'wǔ','六':'liù','七':'qī','八':'bā','九':'jiǔ','十':'shí','百':'bǎi','两':'liǎng'}
POLY={'了':'le','得':'de','还':'hái','都':'dōu','长':'cháng','好':'hǎo','要':'yào','教':'jiāo','只':'zhǐ','中':'zhōng','觉':'jué','行':'xíng','的':'de','地':'de','种':'zhǒng','号':'hào','分':'fēn','便':'biàn','空':'kòng','差':'chà','给':'gěi','为':'wèi','着':'zhe','少':'shǎo','重':'zhòng','大':'dà','正':'zhèng','相':'xiāng','乐':'lè','发':'fā','觉得':'juéde','会':'huì'}
PUN={'，':',','。':'.','？':'?','！':'!','、':',','：':':','…':'…'}
TONEV={'ā':1,'á':2,'ǎ':3,'à':4,'ē':1,'é':2,'ě':3,'è':4,'ī':1,'í':2,'ǐ':3,'ì':4,'ō':1,'ó':2,'ǒ':3,'ò':4,'ū':1,'ú':2,'ǔ':3,'ù':4,'ǖ':1,'ǘ':2,'ǚ':3,'ǜ':4}
def tone(p):
    for c in p:
        if c in TONEV:return TONEV[c]
    return 0
def num(w):
    if all(c in NUM for c in w):
        out=[DIG[c] for c in w]
        if len(w)>1 and w[0]=='一' and w[1]=='百':out[0]='yì'
        return ''.join(out)
def word_py(w,lmax,errs,line):
    if w in PUN:return PUN[w]
    m=re.match(r'^(.+)\{(.+)\}$',w)
    if m:return m.group(2)
    if w in NAMES:return NAMES[w]
    if w in POLY and len(w)<=2 and (w not in py or len(w)==1):pass
    if w in py and lev[w]<=lmax and len(w)>1:return py[w]
    if len(w)==1 and w in POLY:
        if w in lev and lev[w]>lmax:errs.append(f'{line}: "{w}" is from a later lesson')
        return POLY[w]
    if w in py:
        if lev[w]>lmax:errs.append(f'{line}: "{w}" is from lesson {lev[w]} (after {lmax})')
        return py[w]
    n=num(w)
    if n:return n
    # compose from characters
    out=[]
    for c in w:
        if c in NAMES:out.append(NAMES[c]);continue
        if c in POLY:out.append(POLY[c]);continue
        if c in py:
            if lev[c]>lmax:errs.append(f'{line}: "{c}" in "{w}" is from lesson {lev[c]}')
            out.append(py[c]);continue
        if c in DIG:out.append(DIG[c]);continue
        errs.append(f'{line}: no pinyin for "{c}" in "{w}"');out.append('?')
    return ''.join(out)
def sandhi(ws,ps):
    for k,(w,p) in enumerate(zip(ws,ps)):
        nxt=ps[k+1] if k+1<len(ps) else ''
        if w=='不':
            if k>0 and k+1<len(ws) and ws[k-1]==ws[k+1]:ps[k]='bu'
            elif tone(nxt.split()[0] if nxt else '')==4:ps[k]='bú'
            else:ps[k]='bù'
        if w=='一':
            prev=ws[k-1] if k else ''
            if prev in ('第','十') or (k>0 and prev in DIG) or k+1>=len(ws) or ws[k+1] in PUN:ps[k]='yī'
            elif tone(nxt.split()[0] if nxt else '') in (4,0) and nxt not in ('','.'):ps[k]='yí' if tone(nxt.split()[0])==4 else 'yí'
            else:ps[k]='yì'
            if nxt and tone(nxt.split()[0])==0:ps[k]='yí'
    return ps
out=[];errs=[];seen=set()
for n in range(1,11):
    f=os.path.join(root,'examples',f'l{n}.txt')
    if not os.path.exists(f):continue
    for k,line in enumerate(open(f,encoding='utf8'),1):
        line=line.strip()
        if not line or line.startswith('#'):continue
        zh,en=[x.strip() for x in line.split('|')]
        ws=zh.split()
        ps=[word_py(w,n,errs,f'l{n}:{k}') for w in ws]
        ws=[re.sub(r'\{.*\}','',w) for w in ws]
        ps=sandhi(ws,ps)
        key=''.join(ws)
        if key in seen:errs.append(f'l{n}:{k}: duplicate {key}')
        seen.add(key)
        out.append([n,ws,ps,en])
for e in errs:print(e)
json.dump(out,open(os.path.join(root,'examples.json'),'w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
print(len(out),'sentences;',len(errs),'problems')
