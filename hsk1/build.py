# Builds the HSK 1 pack: the line `const HSK1=…;` in index.html, and stroke data for its characters in strokes.json.
#
# Sources (all in this folder):
#   words.tsv     the 280 words of the official vocabulary list (HSK 考试大纲, CLEC 2025, valid from 2026-07)
#   chars.txt     the 246 characters to recognise for HSK 1 (official order)
#   write.txt     the 100 characters to write for HSK 1–2 (official order)
#   lessons.txt   the words grouped into the 15 communicative tasks of the official task syllabus
#   cedict-hsk1.u8  CC-CEDICT entries for these words and characters (English meanings, traditional forms; CC BY-SA 4.0)
# Stroke data for characters missing from strokes.json comes from hanzi-writer-data (Make Me a Hanzi, Arphic PL).
#
# Needs: pip install pypinyin==0.55.0
# Run: npm pack hanzi-writer-data@2.0.1 && tar xzf hanzi-writer-data-2.0.1.tgz
#      python3 hsk1/build.py package        (the unpacked hanzi-writer-data folder)
import json,os,re,sys,unicodedata
from pypinyin import pinyin as _pinyin,Style   # pip install pypinyin==0.55.0: a character's main reading
H=os.path.dirname(os.path.abspath(__file__));R=os.path.dirname(H)
lines=lambda f:[l.rstrip('\n') for l in open(os.path.join(H,f),encoding='utf8') if l.strip() and not l.startswith('# ')]
errs=[]
HAN=lambda c:'㐀'<=c<='鿿'
base=lambda w:re.sub(r'\d$','',w)

# the official word list
W=[]
for l in lines('words.tsv'):
    no,lv,w,py,pos=(l.split('\t')+[''])[:5];W.append(dict(no=int(no),w=w,s=base(w),py=py.split('/')[0].replace('’',"'"),pos=pos))
chars=list(lines('chars.txt')[0]);write=set(lines('write.txt')[0])
if len(W)!=280:errs.append(f'{len(W)} words, the official list has 280')
if len(chars)!=246:errs.append(f'{len(chars)} characters, the official list has 246')

# lessons
L=[];at={}
for l in lines('lessons.txt'):
    if l.startswith('## '):
        n,en,zh,seal=[x.strip() for x in l[3:].split('|')];L.append(dict(l=n,en=en,zh=zh,seal=seal,words=[]));continue
    for w in l.split():
        if w in at:errs.append(f'"{w}" is in lessons {at[w]} and {L[-1]["l"]}')
        at[w]=L[-1]['l'];L[-1]['words'].append(w)
official={w['w'] for w in W}
for w in at:
    if w not in official:errs.append(f'"{w}" in lessons.txt is not in the official list')
for w in official:
    if w not in at:errs.append(f'"{w}" of the official list is in no lesson')
for x in L:
    if x['seal'] not in chars:errs.append(f'seal {x["seal"]} of lesson {x["l"]} is not an HSK 1 character')
ORD={x['l']:i for i,x in enumerate(L)}

# CC-CEDICT
E={}
for l in lines('cedict-hsk1.u8'):
    m=re.match(r'(\S+) (\S+) \[([^\]]+)\] /(.*)/',l)
    if m:E.setdefault(m.group(2),[]).append(dict(t=m.group(1),py=m.group(3),senses=m.group(4).split('/')))
MK={'a':'āáǎà','e':'ēéěè','i':'īíǐì','o':'ōóǒò','u':'ūúǔù','ü':'ǖǘǚǜ'}
def to_marks(num):
    out=[]
    for s in num.replace('u:','ü').split():
        t=int(s[-1]) if s[-1].isdigit() else 5;b=s.rstrip('012345')
        if t in (1,2,3,4):
            lo=b.lower();i=lo.find('a') if 'a' in lo else lo.find('e') if 'e' in lo else lo.find('ou') if 'ou' in lo else max(lo.rfind(v) for v in 'aeiouü')
            b=b[:i]+MK[lo[i]][t-1]+b[i+1:]
        out.append(b)
    return out
def syl_tone(s):
    for c in unicodedata.normalize('NFD',s):
        o=ord(c)
        if o in (0x304,0x301,0x30C,0x300):return {0x304:1,0x301:2,0x30C:3,0x300:4}[o]
    return 0
def bare(s):return ''.join(c for c in unicodedata.normalize('NFD',s.lower()) if not 0x300<=ord(c)<=0x36f).replace('ü','v')
SYL=re.compile(r"(?:[zcs]h|[bpmfdtnlgkhjqxrzcsyw])?[aeiouüvāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+(?:ng(?![aeiouü])|n(?![aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ])|r(?![aeiouü]))?",re.I)
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
# senses picked by hand where the first CC-CEDICT senses are not the HSK 1 meaning (the list's 1/2 marks one sense)
OVERRIDE={'好玩儿':'fun; interesting','面条儿':'noodles','菜':'dish (of food); vegetable','分':'minute; fen (1/100 yuan); to divide','钱':'money',
  '回':'to go back; to return','汉字':'Chinese character','超市':'supermarket','来':'to come','到':'to arrive; to; until','吃':'to eat','饭':'meal; cooked rice',
  '爱':'to love; to like','便宜':'cheap','卖':'to sell','听':'to listen; to hear','读':'to read; to read aloud','多少':'how many; how much','同学':'classmate',
  '小朋友':'child; kid','下课':'to finish class','上课':'to go to class; to have class','时间':'time','工作':'to work; work; job','茶':'tea','去':'to go',
  '包子':'baozi (steamed stuffed bun)','饺子':'jiaozi (dumplings)','白天':'daytime','早上':'(early) morning','能':'can; to be able to','觉得':'to feel; to think',
  '你':'you','他':'he; him','这':'this','那':'that','是':'to be (am, is, are); yes','国':'country','年':'year','里':'inside; in',
  '店':'shop; store','上':'up; on; above; last (week, month)','下':'down; under; below; next (week, month)','在':'to be at; in; at; (doing) right now',
  '些':'some; a few','有':'to have; there is','星期':'week','热':'hot','多':'many; much; (in questions) how','男':'male; man','女':'female; woman',
  '先生':'Mr.; sir; husband','东西':'thing; stuff','大家':'everyone','叫':'to be called; to call','日':'day; date','号':'number; day of the month',
  '天':'day; sky','是的':'yes','哪些':'which ones','要':'to want; will; to need','想':'to want to; to think; to miss','说':'to say; to speak',
  '开':'to open; to drive; to turn on','看':'to look; to watch; to read','对':'right, correct; to, toward','给':'to give; for','本1':'(measure word for books)','点1':"o'clock; (measure word for hours)",'两1':'two (before a measure word)','和1':'and; with',
  '会1':'can; to know how to','喂1':'hello (when answering the phone)','边':'side; edge','了':'(particle: completed action or change)',
  '的':'(possessive or descriptive particle)','吧':'(particle: suggestion or guess)','吗':'(question particle)','呢':'(particle: and you?; ongoing action)',
  '们':'(plural suffix for people)','第':'(prefix for ordinal numbers)','个':'(the most common measure word)','件':'(measure word for clothes, matters)',
  '口':'(measure word for family members); mouth','块':'kuai (yuan, in speech); piece','元':'yuan (unit of money)','还':'also; still',
  '都':'all; both','再':'again','也':'also; too','很':'very','太':'too; extremely','非常':'very; extremely','有点儿':'a bit, somewhat',
  '一下':'(after a verb) briefly, a bit','一点儿':'a little, a bit','没事':"it's nothing; never mind",'那个':'that one','哪个':'which one'}
POS={'名':'n','动':'v','形':'adj','副':'adv','代':'pr','数':'nu','量':'m','助':'p','介':'prep','连':'conj','叹':'interj','数量':'nu+m','前缀':'prefix','后缀':'suffix'}
def pos_of(p):
    p=re.sub(r'[（）()]','',p).split('、')[0].strip()
    return POS.get(p,'')

# words
t2={};wd=[]
for w in W:
    e=entry(w['s'],w['py']);en=OVERRIDE.get(w['w']) or OVERRIDE.get(w['s']) or (clean(e['senses'],2) if e else '')
    if not en:errs.append(f'no meaning for {w["w"]}')
    if e:
        for a,b in zip(w['s'],e['t']):
            if a!=b:t2[a]=b
    wd.append([at[w['w']],w['s'],w['py'],pos_of(w['pos']),en,'m'])
wd.sort(key=lambda x:(ORD[x[0]],[y['words'] for y in L if y['l']==x[0]][0].index(next(w['w'] for w in W if w['s']==x[1] and at[w['w']]==x[0]))))

# characters: the lesson of the first word that uses it, its reading in that word; the rest by hand
NOWORD={'中':'1','住':'5','做':'14','只':'3','坐':'8','文':'12','昨':'2','桌':'3','正':'13','真':'4','知':'12','道':'12'}
NOWORD_PY={'中':'zhōng','住':'zhù','做':'zuò','只':'zhǐ','坐':'zuò','文':'wén','昨':'zuó','桌':'zhuō','正':'zhèng','真':'zhēn','知':'zhī','道':'dào'}
NEUTRAL=set('吗呢吧的了么们')   # particles and suffixes that are neutral on their own too
# short meanings for single characters, where the dictionary's first senses are not the HSK 1 sense
CHAR_EN={'只':'only; (measure word for animals)','中':'middle; China','午':'noon','汉':'Han; Chinese','明':'bright; next (day, year)','苹':'(as in 苹果) apple',
  '先':'first; before','士':'(as in 女士) person; scholar','期':'period of time','星':'star','什':'(as in 什么) what','关':'to close; to turn off','话':'words; speech',
  '系':'(as in 关系) relation','宜':'suitable','漂':'(as in 漂亮) pretty','亮':'bright','便':'(as in 便宜) cheap; convenient','欢':'happy','喜':'to like; happy',
  '视':'to look at','影':'shadow; image','道':'road; way','题':'topic; question','以':'(as in 可以) can','可':'can; may','候':'(as in 时候) time','现':'now; present',
  '同':'same; together','正':'just (doing); straight','钟':"clock; o'clock",'班':'class; shift','公':'public','司':'(as in 公司) company','作':'to do; work','脑':'brain',
  '条':'strip; (measure word for long things)','米':'rice; meter','院':'courtyard; institution','息':'breath; rest','得':'to get','觉':'to feel','服':'clothes','衣':'clothes',
  '市':'market; city','超':'to exceed; super','租':'to rent','出':'to go out; to come out','包':'bag; to wrap','面':'face; noodles; flour','奶':'milk','牛':'cow; ox',
  '果':'fruit; result','鸡':'chicken','蛋':'egg','电':'electricity','打':'to hit; to make (a call)','客':'guest','起':'to rise; to get up','兴':'(as in 高兴) mood',
  '谢':'to thank','房':'house; room','间':'room; between','商':'trade','样':'shape; kind','气':'air; gas','非':'not','常':'often; always','机':'machine','东':'east',
  '西':'west','手':'hand','杯':'cup','本':'(measure word for books); root','名':'name','认':'to recognize','识':'to know','生':'to be born; life; student','友':'friend',
  '朋':'friend','子':'child; (noun suffix)','字':'character; word','么':'(as in 什么)','儿':'son; child; (suffix -r)','孩':'child','和':'and; with','会':'can; to know how to',
  '点':"dot; o'clock",'工':'work; worker','老':'old','师':'teacher','白':'white','床':'bed','校':'school','晚':'evening; late','早':'early; morning','习':'to practice',
  '语':'language','知':'to know','文':'writing; language','昨':'yesterday','桌':'table','住':'to live (somewhere)','做':'to do; to make','坐':'to sit; to take (a bus)',
  '真':'really; real','今':'now; today','零':'zero','号':'number; day of the month'}
ch=[]
for c in chars:
    single=next((w for w in W if w['s']==c),None);used=[w for w in W if c in w['s']]
    used.sort(key=lambda w:ORD[at[w['w']]])
    if single:l=at[single['w']];py=single['py']
    elif used:
        w=used[0];l=at[w['w']];ss=syls(w['py'])
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

meta=dict(id='hsk1',lessons=[dict(l=x['l'],en=x['en'],zh=x['zh'],seal=x['seal']) for x in L],write=[c for c in chars if c in write])
pack=dict(ch=ch,wd=wd,st=[],t2=t2,meta=meta)

# stroke data for characters not yet in strokes.json
sp=os.path.join(R,'strokes.json');S=json.load(open(sp,encoding='utf8'));add=0
need=sorted({c for c in ''.join(x[2]+x[1] for x in ch)+''.join(x[1] for x in wd) if HAN(c)}|{t2.get(c,c) for x in wd for c in x[1]})
hwd=sys.argv[1] if len(sys.argv)>1 else None
for c in need:
    if c in S:continue
    f=os.path.join(hwd,c+'.json') if hwd else None
    if f and os.path.exists(f):d=json.load(open(f,encoding='utf8'));S[c]={'strokes':d['strokes'],'medians':d['medians']};add+=1
    elif c in chars or any(c in x[1] for x in wd):errs.append(f'no stroke data for {c}' if hwd else f'no stroke data for {c} (pass the hanzi-writer-data folder)')
if add:json.dump(S,open(sp,'w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))

for e in errs:print('!',e)
if errs and any(not e.startswith('no stroke data') for e in errs):sys.exit(1)
ip=os.path.join(R,'index.html');s=open(ip,encoding='utf8').read()
line='const HSK1='+json.dumps(pack,ensure_ascii=False,separators=(',',':'))+';'
s2,n=re.subn(r'^const HSK1=.*;$',lambda m:line,s,count=1,flags=re.M)
if not n:sys.exit('index.html has no line "const HSK1=…;"')
open(ip,'w',encoding='utf8').write(s2)
print(f'{len(ch)} characters, {len(wd)} words, {len(L)} lessons, {len(meta["write"])} to write; {add} stroke sets added; {len(errs)} problems')
