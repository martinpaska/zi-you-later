# Builds ../grammar-practice.json from l1.txt … l10.txt.
# Line format: c|sentence with ＿|correct/wrong/wrong|English  ·  p|correct sentence/wrong/wrong|English  ·  o|chunks in correct order|English
# The first option is always the correct one (the app shuffles them). ∅ means "nothing goes here".
# Run: python3 grammar-practice/build.py grammar-practice.json
import json,re,glob,sys,os
out={};err=[]
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
            out[key].append(['o',ch,f[2]])
        else:err.append((p,n,'type',line))
for e in err:print(e)
bad={k:len(v) for k,v in out.items() if len(v)!=20}
print('points',len(out),'items',sum(map(len,out.values())),'not20',bad)
json.dump(out,open(sys.argv[1],'w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
