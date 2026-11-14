// the course data and the JSON files the app loads (the build scripts check these too; this guards edits made by hand)
const assert=require('node:assert/strict'),vm=require('vm'),fs=require('fs'),path=require('path');
const {read,ROOT}=require('../lib/scripts');
const lit=(file,name)=>vm.runInNewContext(read(file)+';'+name);
const json=f=>JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8'));
const isHan=c=>/[㐀-鿿]/.test(c);
const HSK1=lit('js/data-hsk1.js','HSK1'),CIN1=lit('js/data-cin1.js','DATA_CIN1');

module.exports=[
['HSK 1: 15 lessons, 246 characters, 300 words, every item in a lesson',()=>{
  const ls=HSK1.meta.lessons.map(x=>x.l);assert.equal(ls.length,15);assert.equal(HSK1.ch.length,246);assert.equal(HSK1.wd.length,300);
  for(const l of HSK1.meta.lessons){assert.ok(l.en&&l.zh&&l.seal,'lesson '+l.l+' lacks a title or seal');assert.ok(HSK1.wd.some(w=>w[0]===l.l),'lesson '+l.l+' has no words')}
  for(const x of [...HSK1.ch,...HSK1.wd])assert.ok(ls.includes(x[0]),'item in an unknown lesson: '+x.join(','));
  assert.equal(new Set(HSK1.meta.lessons.map(x=>x.seal)).size,15,'two lessons have the same seal');
}],
['HSK 1: no word or character twice; every character of the list is in a word; every meaning is filled in',()=>{
  const key=(k,a)=>k+':'+a.join('|'),seen=new Set(),dup=[];
  for(const c of HSK1.ch){const k=key('c',[c[1],c[3]]);if(seen.has(k))dup.push(k);seen.add(k);assert.ok(c[6],'no meaning: '+c[2])}
  for(const w of HSK1.wd){const k=key('w',[w[1],w[2]]);if(seen.has(k))dup.push(k);seen.add(k);assert.ok(w[4],'no meaning: '+w[1])}
  assert.deepEqual(dup,[],'twice: '+dup.join(' '));
  const inWords=new Set(HSK1.wd.flatMap(w=>[...w[1]].filter(isHan)));const lonely=[...HSK1.ch.map(c=>c[2]).filter(c=>!inWords.has(c))];   // (copied: arrays made inside the vm have another prototype)
  assert.deepEqual(lonely,[],'a character in no word of the list: '+lonely.join(''));   // (the other way round is fine: 店 and 饺 are in words, not in the official character list)
}],
['HSK 1 and Chinese 1: stroke data exists for every simplified character, in characters and in words (writing needs it)',()=>{
  const S=json('strokes.json'),need=new Set();   // (a traditional form without strokes is fine: the app falls back to the simplified one)
  for(const D of [HSK1,CIN1]){for(const c of D.ch)need.add(c[2]);for(const w of D.wd)for(const c of w[1])need.add(c)}
  const miss=[...need].filter(c=>isHan(c)&&!S[c]);assert.deepEqual(miss,[],'no strokes for: '+miss.join(''));
}],
['HSK 1: every sentence has one pinyin syllable per word and no leftover "?"',()=>{
  assert.ok(HSK1.st.length>=200);
  for(const [l,zh,py,en] of HSK1.st){assert.equal(zh.length,py.length,'tokens and pinyin differ: '+zh.join(''));zh.forEach((w,i)=>assert.ok(py[i]!=='?'||/^[，。？！、：]$/.test(w),'no pinyin for '+w+' in '+zh.join('')));assert.ok(en)}
}],
['HSK 1: every grammar point has its exercises, and the exercises are well formed',()=>{
  const G=HSK1.meta.grammar,D=json('grammar-hsk1.json'),lessons=new Set(HSK1.meta.lessons.map(x=>x.l));let points=0,qs=0;
  for(const [l,ps] of Object.entries(G)){assert.ok(lessons.has(l),'grammar for an unknown lesson '+l);
    ps.forEach((p,i)=>{points++;assert.ok(p.t&&p.ex&&p.pat&&p.eg.length>=2,`point ${l}-${i} is incomplete`);
      const d=D[l+'-'+i];assert.ok(d&&d.length>=8,`no exercises for ${l}-${i}`);
      for(const q of d){qs++;
        if(q[0]==='c'){assert.ok(q[1].includes('＿'),'gap missing in '+q[1]);assert.ok(q[2].length>=2&&new Set(q[2]).size===q[2].length,'choices of '+q[1])}
        else if(q[0]==='p'){assert.ok(q[1].length>=2&&new Set(q[1]).size===q[1].length,'sentences '+q[1].join(' '))}
        else if(q[0]==='o'){assert.ok(q[1].length>=2)}else assert.fail('unknown type '+q[0])}})}
  assert.equal(points,35);assert.ok(qs>=400,'exercises: '+qs);
  const stray=Object.keys(D).filter(k=>{const [l,i]=k.split('-');return !(G[l]&&G[l][+i])});assert.deepEqual(stray,[],'exercises without a point: '+stray.join(' '));
}],
['HSK 1 practice tests: 2 tests of 40 questions, every answer index inside its choices',()=>{
  const T=json('hsk1-tests.json');assert.equal(T.length,2);
  for(const t of T){let n=0;
    for(const k of ['l1','l2','l4','r4'])for(const q of t[k]){n++;assert.ok(q.k>=0&&q.k<q.o.length,`${t.n} ${k}: answer ${q.k} of ${q.o.length}`);assert.equal(q.o.length,3)}
    for(const k of ['l3','r1']){assert.equal(t[k].pics.length,6);assert.equal(new Set(t[k].pics).size,6,k+' pictures repeat');for(const q of t[k].q){n++;assert.ok(q.k>=0&&q.k<6)}}
    assert.equal(t.r2.ans.length,6);for(const q of t.r2.q){n++;assert.ok(q.k>=0&&q.k<6)}
    assert.equal(t.r3.words.length,6);for(const q of t.r3.q){n++;assert.ok(q.k>=0&&q.k<6);assert.ok(q.t.some(l=>l[1].includes('＿')),'r3 has no gap')}
    assert.equal(n,40,`test ${t.n}: ${n} questions`)}
}],
['Chinese 1: the Intro and lessons 1–10, with characters and words, and the other JSON files parse',()=>{
  const ls=new Set(['I',...Array.from({length:10},(_,i)=>String(i+1))]);
  for(const x of [...CIN1.ch,...CIN1.wd])assert.ok(ls.has(String(x[0])),'unknown lesson '+x[0]);
  for(const l of ls)assert.ok(CIN1.ch.some(c=>String(c[0])===l),'no characters in lesson '+l);
  assert.ok(CIN1.ch.length>=390&&CIN1.wd.length>=360&&CIN1.st.length>=150);
  for(const f of ['examples.json','phonetics.json','grammar1.json','grammar-practice.json','strokes.json','manifest.webmanifest'])json(f);
}],
['strings-cs.js: every Czech string is a non-empty string (a hole or a stray value breaks the translator)',()=>{
  const CS=lit('js/strings-cs.js','CS'),bad=Object.entries(CS).filter(([k,v])=>typeof v!=='string'||!v.trim()||!k.trim());
  assert.deepEqual(bad.slice(0,5),[]);assert.ok(Object.keys(CS).length>=700,'only '+Object.keys(CS).length+' strings');
}]];
