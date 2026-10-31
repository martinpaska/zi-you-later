# Builds ../grammar-practice.json from l1.txt … l10.txt.
# Line format: c|sentence with ＿|correct/wrong/wrong|English  ·  p|correct sentence/wrong/wrong|English  ·  o|chunks in correct order|English
# The first option is always the correct one (the app shuffles them). ∅ means "nothing goes here".
# Run: python3 grammar-practice/build.py grammar-practice.json
import json,re,glob,sys,os
out={};err=[]
# Time words may stand before or after the subject ("我今天很忙" = "今天我很忙"), so both orders are accepted.
TIME=re.compile(r'^(今天|明天|昨天|周末|晚上|下午|上午|早上|中午|每天|最近|现在|今年|下|个|上个|星期.?|[零一二两三四五六七八九十]+|点|半|刻|号|月|寒假)$')
SUBJ={'我','你','他','她','我们','你们','他们','她们','王朋','李友','老师','王老师','大家'}
ANCHOR=re.compile(r'^(今天|明天|昨天|周末|晚上|下午|上午|早上|中午|每天|最近|现在|今年|寒假|星期.?|点|半|刻)$')
def block(t,k):
    e=k
    while e<len(t) and TIME.match(t[e]):e+=1
    while e>k and not ANCHOR.match(t[e-1]):e-=1
    return e
def time_alts(t):
    res=[]
    if len(t)>2 and t[0] in SUBJ and ANCHOR.match(t[1]) or (len(t)>2 and t[0] in SUBJ and t[1]=='下'):
        e=block(t,1)
        if e>1 and e<len(t) and t[e] not in ('，','或者','岁'):res.append(t[1:e]+[t[0]]+t[e:])
    e=block(t,0)
    if e>0 and e<len(t)-1 and t[e] in SUBJ:res.append([t[e]]+t[:e]+t[e+1:])
    return res
for p in sorted(glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)),"l*.txt"))):
    if 'early' in p: continue
    key=None
    for n,line in enumerate(open(p,encoding='utf8'),1):
        line=line.rstrip('\n')
        if not line.strip():continue
        if line.startswith('# '):
            key=line[2:].strip();out.setdefault(key,[]);continue
        f=line.split('|')
        t=f[0]
        if t=='c':
            if len(f)!=4:err.append((p,n,'fields',line));continue
            q,opts,en=f[1],f[2].split('/'),f[3]
            if q.count('＿')!=1:err.append((p,n,'blank',line))
            if len(set(opts))!=len(opts) or len(opts)<2:err.append((p,n,'opts',line))
            out[key].append(['c',q,opts,en])
        elif t=='p':
            if len(f)!=3:err.append((p,n,'fields',line));continue
            opts=f[1].split('/')
            if len(set(opts))!=len(opts) or len(opts)<2:err.append((p,n,'opts',line))
            out[key].append(['p',opts,f[2]])
        elif t=='o':
            if len(f)!=3:err.append((p,n,'fields',line));continue
            ch=f[1].split()
            if len(ch)<2:err.append((p,n,'chunks',line))
            alts=[''.join(x) for x in time_alts(ch)]
            out[key].append(['o',ch,f[2]]+([alts] if alts else []))
        else:err.append((p,n,'type',line))
for e in err:print(e)
bad={k:len(v) for k,v in out.items() if len(v)!=20}
print('points',len(out),'items',sum(map(len,out.values())),'not20',bad)
json.dump(out,open(sys.argv[1],'w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
