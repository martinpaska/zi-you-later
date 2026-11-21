// finishing exercises: the result screen with its 完 seal, grammar, sentences and writing
const assert=require('node:assert/strict');
const {open}=require('../lib/app');
const drill=async a=>{for(let i=0;i<40;i++){if(await a.page.$('#qo'))await a.page.click('#qo .opt');
    else if(await a.page.$('#bk')){const n=(await a.page.$$('#bk .chunk')).length;for(let k=0;k<n;k++)await a.page.click(`#bk .chunk[data-j="${k}"]`);await a.page.click('#chk')}else break;
    await a.page.waitForTimeout(30);await a.page.click('#nx');await a.page.waitForTimeout(30)}};

module.exports=[
['HSK 1 grammar: each lesson shows its points, and a drill runs to its result with the 完 seal',async t=>{
  const a=await open(t,{pack:'hsk1'});
  try{const n=await a.page.evaluate(()=>Object.values(HSK1.meta.grammar).reduce((s,p)=>s+p.length,0));assert.equal(n,35);
    for(const l of await a.page.evaluate(()=>Object.keys(GRAMMAR))){await a.page.evaluate(l=>{goHome();grammar(l)},l);
      assert.equal(await a.page.$$eval('.gp',e=>e.length),await a.page.evaluate(l=>GRAMMAR[l].length,l),'points of lesson '+l)}
    await a.page.evaluate(()=>gdrill('5',0));await a.page.waitForTimeout(700);await drill(a);
    assert.match(await a.text('#mode .score'),/\d+ \/ \d+/);assert.ok(await a.page.$('.rstamp'),'no 完 seal');assert.deepEqual(a.errors,[])}finally{await a.close()}
}],
['Chinese 1 grammar keeps the textbook pages and its own exercises',async t=>{
  const a=await open(t,{pack:'cin1'});
  try{await a.page.evaluate(()=>grammar('1'));assert.match(await a.text('#mode .gp'),/Učebnice s\. 22/);assert.ok((await a.page.$$('.ghow')).length>=5);
    await a.page.evaluate(()=>gdrill('1',0));await a.page.waitForTimeout(700);assert.match(await a.text('#mode'),/1 \/ 20/);assert.deepEqual(a.errors,[])}finally{await a.close()}
}],
['sentences: each HSK 1 lesson has some, and building one starts',async t=>{
  const a=await open(t,{pack:'hsk1'});
  try{const per=await a.page.evaluate(()=>LESSONS.map(l=>ST.filter(s=>s.l===l).length));assert.ok(per.every(n=>n>=8),'sentences per lesson: '+per);
    await a.page.evaluate(()=>{state.sel=new Set(['3']);goHome();build(ST.filter(s=>s.l==='3'),false)});await a.page.waitForTimeout(300);
    assert.ok(await a.page.$('#bk .chunk'),'no pieces to build with');assert.deepEqual(a.errors,[])}finally{await a.close()}
}],
['flashcards: the back of a card shows one or two short sentences with the word; tapping a sentence does not turn the card',async t=>{
  const a=await open(t,{pack:'hsk1',state:{set:'w',cdir:'zh',cflips:9}});
  try{await a.page.evaluate(()=>{const x=ALLITEMS.find(x=>x.kind==='w'&&x.s==='喝');state.sel=new Set(LESSONS);state.set='w';window.pool=()=>[x];cards()});
    const front=await a.page.$$eval('#card .cexf .exi',e=>e.map(x=>x.textContent));   // the side that shows the word: its sentences in Chinese only
    assert.ok(front.length>=1&&front.every(s=>/[一-鿿]/.test(s)&&!/[a-z]/i.test(s)),'Chinese side: '+front);
    await a.page.click('#card');await a.page.waitForSelector('#card .cexin .exi');
    const zh=await a.page.$$eval('#card .cexin .zh',e=>e.map(x=>x.textContent));assert.ok(zh.length>=1&&zh.length<=2,'sentences: '+zh.length);assert.ok(zh.every(s=>s.includes('喝')&&s.length<=12),'not short, or without the word: '+zh);
    await a.page.click('#card .cexin [data-ss]');await a.page.waitForTimeout(200);assert.ok(await a.page.$('#card.flipped'),'tapping a sentence turned the card');
    assert.ok(!(await a.page.evaluate(()=>{const c=document.querySelector('#card');return c.scrollHeight>c.clientHeight+6})),'the card back does not fit');assert.deepEqual(a.errors,[])}finally{await a.close()}
}],
['flashcards, English side: the front shows the sentences in English only, and the back shows both languages',async t=>{
  const a=await open(t,{pack:'hsk1',state:{set:'w',cdir:'en',cflips:9}});
  try{await a.page.evaluate(()=>{const x=ALLITEMS.find(x=>x.kind==='w'&&x.s==='喝');state.sel=new Set(LESSONS);state.set='w';window.pool=()=>[x];cards()});
    const front=await a.page.$$eval('#card .cexf .exi',e=>e.map(x=>x.textContent));assert.ok(front.length>=1&&front.every(s=>/[a-z]/i.test(s)&&!/[一-鿿]/.test(s)),'English side: '+front);
    assert.ok(!(await a.page.$('#card .cexf [data-ss]')),'a play button on the front would give the answer away');
    await a.page.click('#card');await a.page.waitForSelector('#card .cexin .exi .pyl');assert.ok(!(await a.page.$('#card .cexf')),'the front sentences stay on the back');assert.deepEqual(a.errors,[])}finally{await a.close()}
}],
['entries written alike but read differently (得 de / děi) are said differently',async t=>{
  for(const pack of ['cin1','hsk1']){const a=await open(t,{pack});
    try{const groups=await a.page.evaluate(()=>{const g={};for(const x of ALLITEMS)(g[x.kind+x.s]=g[x.kind+x.s]||[]).push(x);
        return Object.values(g).filter(v=>new Set(v.map(x=>x.p)).size>1).map(v=>({w:v[0].s,pinyin:v.map(x=>x.p),said:v.map(said)}))});
      if(pack==='cin1')assert.ok(groups.some(g=>g.w==='得'),'the 得 entries are gone: this test would check nothing');
      for(const g of groups)assert.equal(new Set(g.said).size,g.said.length,`${g.w} (${g.pinyin}) is said alike: ${g.said}`)}finally{await a.close()}}
}],
['sentences of HSK 1 are its own: none for Chinese 1 (they use words that are not in HSK 1), and every character is an HSK 1 one',async t=>{
  const a=await open(t,{pack:'hsk1'});
  try{await a.page.waitForTimeout(500);const r=await a.page.evaluate(()=>{const known=new Set(ALLITEMS.flatMap(x=>[...x.s.replace(/[()…]/g,'')]));
      const bad=ALLITEMS.flatMap(x=>examples(x,9)).filter(s=>[...s.zh.join('')].some(c=>/[㐀-鿿]/.test(c)&&!known.has(c))).map(s=>s.zh.join(''));return {ex:EX.length,bad:[...new Set(bad)].slice(0,5)}});
    assert.equal(r.ex,0,'Chinese 1 sentences are loaded in HSK 1');assert.deepEqual(r.bad,[],'sentences with characters outside HSK 1')}finally{await a.close()}
  const b=await open(t,{pack:'cin1'});
  try{await b.page.waitForFunction(()=>EX.length>300,null,{timeout:4000});assert.deepEqual(b.errors,[])}finally{await b.close()}
}],
['the 完 seal and the counting score appear at the end of a round; with reduced motion the score is simply there',async t=>{
  for(const reduced of [false,true]){
    const a=await open(t,{pack:'hsk1',reducedMotion:reduced});
    try{await a.page.evaluate(()=>{open(bar(100,'')+'<div class="card"><span class="score">8 / 10</span></div>')});
      if(reduced)assert.equal(await a.text('.score'),'8 / 10','the score is animated with reduced motion');
      else{await a.page.waitForTimeout(1300);assert.equal(await a.text('.score'),'8 / 10','the score never arrived')}
      assert.ok(await a.page.$('.rstamp'),'no 完 seal');assert.deepEqual(a.errors,[])}finally{await a.close()}}
}],
['writing: strokes load for a new HSK 1 character and for a Chinese 1 character',async t=>{
  for(const [pack,l] of [['hsk1','7'],['cin1','1']]){
    const a=await open(t,{pack,state:{set:'c',selBy:{[pack]:[l]},sel:[l]}});
    try{await a.page.evaluate(()=>{goHome();setup('write')});await a.page.click('#sgo');await a.page.waitForTimeout(1500);
      const txt=await a.text('#mode');assert.ok(!/nenačetl|could not load/i.test(txt),pack+': stroke data did not load');assert.ok((await a.page.$$('#mode svg path')).length>3,'nothing drawn');assert.deepEqual(a.errors,[])}finally{await a.close()}}
}]];
