# HSK 1 grammar points, exercises and sentences, called by build.py.
#   grammar.txt    the grammar points by lesson, with examples and exercises (format at the top of the file)
#   sentences.txt  more sentences by lesson for the Sentences mode
#   tests.txt      practice tests in the format of the official HSK 1 sample test
# Every sentence may use only the 300 official words (plus a few grammar words of the official grammar list, EXTRA),
# and every choice and wrong sentence only their characters. The pinyin of a sentence is put together from the words.
import os,re,random
H=os.path.dirname(os.path.abspath(__file__))
PUNCT={'，':',','。':'.','？':'?','！':'!','、':',','：':':'}
NUMS='零一二三四五六七八九十百千'
NUMPY={'零':'líng','一':'yī','二':'èr','三':'sān','四':'sì','五':'wǔ','六':'liù','七':'qī','八':'bā','九':'jiǔ','十':'shí','百':'bǎi','千':'qiān'}
EXTRA={'杯':'bēi','没':'méi'}   # in the official grammar list (借用名量词 杯, 否定副词 没（有）) but not in the word list
MW=set('个本件口块只杯天年点分')   # 一 changes its tone before these
GE_AFTER=set(NUMS)|set('这那哪几两')
TONES={'āēīōūǖ':1,'áéíóúǘ':2,'ǎěǐǒǔǚ':3,'àèìòùǜ':4}
def first_tone(py):
    for c in py:
        for k,t in TONES.items():
            if c in k:return t
        if c.isalpha() and c not in 'aeiouü' and False:pass
    return 5
def src(name):return [l.rstrip('\n') for l in open(os.path.join(H,name),encoding='utf8') if l.strip() and not l.startswith('# ') and l.strip()!='#']

def make(words):
    """words: [(simplified, pinyin)] of the official list. Returns (st, grammar, drills, tests, errors)."""
    PY={}
    for s,p in words:PY.setdefault(s,p.replace(' ',''))
    chars=set(''.join(PY))|set(EXTRA)|set(NUMS)
    errs=[]
    def num_py(t):
        out=[];ds=t[1:] if t.startswith('第') else t
        for i,c in enumerate(ds):
            p=NUMPY[c]
            if c=='一' and i+1<len(ds) and ds[i+1] in '百千':p='yì'
            out.append(("'" if out and p[0] in 'aeoāáǎàēéěèōóǒò' else '')+p)
        return ('dì' if t.startswith('第') else '')+''.join(out)
    def tok_py(t):
        if t in PUNCT:return PUNCT[t]
        if t in PY:return PY[t]
        if t in EXTRA:return EXTRA[t]
        if re.fullmatch(f'第?[{NUMS}]+',t):return num_py(t)
        return None
    def sent(line,where):
        """'我 是 学生 。 = I am a student.' → (tokens, pinyin tokens, English)"""
        if ' = ' not in line:errs.append(f'{where}: no " = English" in "{line}"');return None
        zh,en=line.split(' = ',1);toks=zh.split()
        pys=[]
        for t in toks:
            p=tok_py(t)
            if p is None:errs.append(f'{where}: "{t}" is not an HSK 1 word ({zh})');p='?'
            pys.append(p)
        for i,t in enumerate(toks):   # tone changes of 不 and 一, and the neutral 个 after numbers
            nxt=pys[i+1] if i+1<len(toks) else ''
            if t=='不' and first_tone(nxt)==4:pys[i]='bú'
            if t=='不' and 0<i<len(toks)-1 and toks[i-1]==toks[i+1]:pys[i]='bu'   # 喝不喝 hē bu hē
            if t=='一' and i+1<len(toks) and toks[i+1] in MW:pys[i]='yí' if (first_tone(nxt)==4 or toks[i+1]=='个') else 'yì'
            if t=='个' and i and (toks[i-1] in GE_AFTER or re.fullmatch(f'第?[{NUMS}]+',toks[i-1])):pys[i]='ge'
        return toks,pys,en.strip()
    def py_line(toks,pys):
        s=''
        for t,p in zip(toks,pys):s+=(p+' ' if t in PUNCT else (' ' if s and not s.endswith(' ') else '')+p)
        s=re.sub(r' ([,.?!])',r'\1',s).strip();return s[:1].upper()+s[1:]
    def chk_chars(text,where):
        bad=[c for c in text if '㐀'<=c<='鿿' and c not in chars]
        if bad:errs.append(f'{where}: {"".join(bad)} not in HSK 1 ({text})')

    # grammar points
    gr={};drills={};st=[];seen=set()
    cur=None
    for l in src('grammar.txt'):
        if l.startswith('## '):
            les,t,so=[x.strip() for x in l[3:].split('|')]
            cur=dict(t=t,src=so,ex='',pat='',eg=[],_gap=[],_bad=[]);gr.setdefault(les,[]).append(cur);cur['_l']=les;continue
        k,v=l.split(':',1);v=v.strip();where=f'grammar {cur["_l"]} "{cur["t"]}"'
        if k in('ex','pat','tip'):cur[k]=v;chk_chars(v,where)
        elif k=='eg':
            r=sent(v,where)
            if r:cur['eg'].append(r)
        elif k=='gap':
            m=re.match(r'(.*?)\[(.+?)\](.*?) = (.*?) / (.*)$',v)
            if not m:errs.append(f'{where}: cannot read gap "{v}"');continue
            a,ans,b,en,others=m.groups();ans=ans.strip();filled=(a+(' '+ans+' ' if ans!='∅' else ' ')+b)
            r=sent(' '.join(filled.split())+' = '+en,where)
            if not r:continue
            os_=others.split()
            for o in os_:chk_chars(o,where)
            if ans in os_:errs.append(f'{where}: the answer is also a wrong choice ({v})')
            gz=''.join(a.split())+'＿'+''.join(b.split())
            cur['_gap'].append((gz,[ans.replace(' ','')]+[o for o in os_],en.strip(),r))
        elif k=='bad':
            m=re.match(r'(.*) = (.*)$',v);opts=[x.strip() for x in m.group(1).split(' / ')]
            for o in opts:chk_chars(o,where)
            cur['_bad'].append((opts,m.group(2).strip()))
        else:errs.append(f'{where}: unknown line "{l}"')
    out={}
    for les,ps in gr.items():
        out[les]=[]
        for i,p in enumerate(ps):
            qs=[['c',gz,opts,en] for gz,opts,en,_ in p['_gap']]+[['p',opts,en] for opts,en in p['_bad']]
            # word order: the examples and the gap sentences without inner commas, at most five
            n=0
            for toks,pys,en in p['eg']+[g[3] for g in p['_gap']]:
                body=toks[:-1] if toks[-1] in PUNCT else toks
                if n>=5 or any(t in PUNCT for t in body) or not 3<=len(body)<=8:continue
                qs.append(['o',body,en]);n+=1
            drills[f'{les}-{i}']=qs
            item=dict(t=p['t'],src=p['src'],ex=p['ex'],pat=p['pat'],eg=[[''.join(t),py_line(t,y),e] for t,y,e in p['eg']])
            if p.get('tip'):item['tip']=p['tip']
            out[les].append(item)
            for t,y,e in p['eg']:
                if ''.join(t) not in seen:seen.add(''.join(t));st.append([les,t,y,e])
    # sentences
    les=None
    for l in src('sentences.txt'):
        if l.startswith('## '):les=l[3:].strip();continue
        r=sent(l,f'sentences {les}')
        if r and ''.join(r[0]) not in seen:seen.add(''.join(r[0]));st.append([les,r[0],r[1],r[2]])
    order=[str(i) for i in range(1,16)]
    st.sort(key=lambda x:order.index(x[0]))
    return st,out,drills,make_tests(sent,errs),errs

SPK={'女：':'f','男：':'m'}
def make_tests(sent,errs):
    """tests.txt → [{n, l1:[…], …}]. A text is a list of lines [speaker ('f', 'm' or ''), tokens, pinyin]; choices are
    shuffled here (the same way on every build) and k is the index of the right one."""
    def text(s,where):
        lines=[];cur=['',[]]
        for t in s.split():
            if t in SPK:
                if cur[1]:lines.append(cur)
                cur=[SPK[t],[]]
            else:cur[1].append(t)
        if cur[1]:lines.append(cur)
        out=[]
        for sp,toks in lines:
            r=sent(' '.join(toks)+' = -',where)
            out.append([sp,r[0],r[1]] if r else [sp,toks,['?']*len(toks)])
        return out
    tests=[];T=None;rnd=random.Random(1)
    def choices(right,wrong,where,pic=False):
        opts=[right]+wrong;rnd.shuffle(opts)
        return [o if pic else text(o,where) for o in opts],opts.index(right)
    for l in src('tests.txt'):
        if l.startswith('## '):T=dict(n=l[3:].strip(),l1=[],l2=[],l3=dict(pics=[],q=[]),l4=[],r1=dict(pics=[],q=[]),r2=dict(ans=[],q=[]),r3=dict(words=[],q=[]),r4=[]);tests.append(T);continue
        k,v=l.split(':',1);v=v.strip();where=f'test {T["n"]} {k}'
        if k in('l1','l2','l4','r4'):
            q,a=v.split(' = ',1);a=[x.strip() for x in a.split(' / ')]
            o,ki=choices(a[0],a[1:] if k!='l1' else a[1].split(),where,pic=k=='l1')
            item=dict(o=o,k=ki)
            if k in('l4','r4'):s,qq=q.split(' | ');item['t']=text(s,where);item['q']=text(qq,where)
            else:item['t']=text(q,where)
            T[k].append(item)
        elif k in('l3','r1'):q,pic=v.rsplit(' = ',1);T[k]['q'].append(dict(t=text(q,where),pic=pic.strip()))
        elif k in('l3x','r1x'):T[k[:2]]['x']=v
        elif k=='r2':q,a=v.split(' = ',1);T['r2']['q'].append(dict(t=text(q,where),a=a.strip()))
        elif k=='r2x':T['r2']['x']=v
        elif k=='r3w':T['r3']['w']=v.split()
        elif k=='r3':
            m=re.match(r'(.*?)\[(.+?)\](.*)$',v);a,w,c=m.groups()
            full=text(a+' '+w+' '+c,where);n=len([t for t in a.split() if t not in SPK])
            for line in full:   # the word to fill in becomes a gap, without its pinyin
                if n<len(line[1]):line[1][n]='＿';line[2][n]='';break
                n-=len(line[1])
            T['r3']['q'].append(dict(t=full,w=w))
        else:errs.append(f'{where}: unknown line "{l}"')
    for T in tests:
        for part,key in (('l3','pic'),('r1','pic')):
            P=T[part];pics=[q[key] for q in P['q']]+[P.pop('x')];rnd.shuffle(pics);P['pics']=pics
            for q in P['q']:q['k']=pics.index(q.pop(key))
        P=T['r2'];ans=[q['a'] for q in P['q']]+[P.pop('x')];rnd.shuffle(ans);P['ans']=[text(a,'test r2') for a in ans]
        for q in P['q']:q['k']=ans.index(q.pop('a'))
        P=T['r3'];ws=P.pop('w');rnd.shuffle(ws);P['words']=[text(w,'test r3')[0] for w in ws]
        for q in P['q']:
            if q['w'] not in ws:errs.append(f'test {T["n"]} r3: {q["w"]} is not in the word bank')
            q['k']=ws.index(q.pop('w')) if q['w'] in ws else 0
        n=sum(len(T[x]) if isinstance(T[x],list) else len(T[x]['q']) for x in('l1','l2','l3','l4','r1','r2','r3','r4'))
        if n!=40:errs.append(f'test {T["n"]}: {n} questions, not 40')
    return tests
