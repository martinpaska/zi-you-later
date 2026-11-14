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
