// Your path: the story page, the lesson sheet, the Final test and the seals, in both courses
const assert=require('node:assert/strict');
const {open,known}=require('../lib/app');
const noErrors=a=>assert.deepEqual(a.errors,[],'\n'+a.errors.join('\n'));
// a Final test in which every shuffle keeps its order: the right answer is always the first choice
const finalTest=async(a,lesson,right=true)=>{
  await a.page.evaluate(l=>{const r=Math.random;Math.random=()=>0.999999;startStep(l,'final');Math.random=r},lesson);
  for(let i=0;i<40;i++){if(!await a.page.$('#qo'))break;await a.page.click(`#qo .opt[data-i="${right?0:1}"]`);await a.page.click('#qn')}
  await a.page.waitForTimeout(300)};
const steps=a=>a.page.$$eval('.lstep',s=>s.map(x=>({n:x.querySelector('.ln').textContent,ok:x.classList.contains('ok'),now:x.classList.contains('now'),off:x.disabled})));

module.exports=[
['HSK 1: the card on Home opens the story with 4 chapters, 15 stops and one "you are here"',async t=>{
  const a=await open(t,{pack:'hsk1',state:{seals:{'hsk1:1':{d:'2026-11-10',s:90}}}});
  try{assert.match(await a.text('.jcard'),/Rok v Pekingu.*Lekce 2.*1 \/ 15/);await a.page.click('.jcard');await a.page.waitForSelector('.journey');
    assert.equal(await a.page.$$eval('.jch',e=>e.length),4);assert.equal(await a.page.$$eval('.jst',e=>e.length),15);
    assert.equal(await a.page.$$eval('.jst.here',e=>e.length),1);assert.equal(await a.page.$eval('.jst.here',e=>e.dataset.lsheet),'2','the next lesson is not marked');
    assert.equal(await a.page.$$eval('.jst.ok',e=>e.length),1);assert.match(await a.text('.jch .jchh'),/第一章/);assert.ok(await a.page.$('.jgoal [data-go="hsktest"]'),'no goal');
    await a.page.click('.jst.here');assert.ok(await a.page.waitForSelector('.nsheet'),'a stop does not open its lesson');noErrors(a)}finally{await a.close()}
}],
['HSK 1: passing a Final test stamps the seal for good, and the whole lesson then counts as done',async t=>{
  const a=await open(t,{pack:'hsk1',state:{selBy:{hsk1:['3','4']}}});
  try{await finalTest(a,'1');assert.match(await a.text('#mode'),/Pečeť orazítkována.*Finální test 100 %/);
    const seals=await a.page.evaluate(()=>state.seals);assert.deepEqual(Object.keys(seals),['hsk1:1']);assert.equal(seals['hsk1:1'].s,100);
    await a.page.reload();await a.page.waitForFunction(()=>typeof state!=='undefined');   // it is kept
    await a.page.evaluate(()=>lessonSheet('1'));const s=await steps(a);assert.equal(s.length,7);assert.ok(s.every(x=>x.ok),'not every step is ✓: '+JSON.stringify(s));
    assert.match(await a.text('.lshp'),/Splněno/);assert.ok(!/umíš|hotovo|\d+ \/ \d+/.test(await a.text('.lsteps')),'a step still shows a label');
    await a.page.keyboard.press('Escape');await a.page.evaluate(()=>goHome());
    assert.deepEqual(await a.page.evaluate(()=>[...state.sel]),['3','4'],'the lessons chosen for the review were not restored');noErrors(a)}finally{await a.close()}
}],
['HSK 1: a failed Final test (under 80 %) stamps nothing and offers another try',async t=>{
  const a=await open(t,{pack:'hsk1'});
  try{await finalTest(a,'15',false);assert.match(await a.text('#mode'),/potřebuješ 80 %/);assert.ok(await a.page.$('#ftag'),'no "try again"');
    assert.deepEqual(await a.page.evaluate(()=>state.seals||{}),{});assert.ok(!(await a.page.$('.rstamp')),'a failed test got the 完 seal');noErrors(a)}finally{await a.close()}
}],
['the seal of a lesson fills with what you know, and the steps of a lesson offer the right next step',async t=>{
  const a=await open(t,{pack:'hsk1',srs:known(await a0(t),30)});
  try{const ink=await a.page.evaluate(()=>lessonInk('1'));assert.ok(ink>10&&ink<100,'ink '+ink);
    await a.page.evaluate(()=>lessonSheet('1'));const s=await steps(a);assert.equal(s.filter(x=>x.now).length,1,'exactly one recommended step');
    assert.ok(s.find(x=>x.n.startsWith('Gramatika')||x.n==='Grammar'),'no grammar step');assert.match(await a.text('.lshp'),/Splněno \d+ %/);noErrors(a)}finally{await a.close()}
}],
['Chinese 1: seals are kept apart from HSK 1; the Intro has no grammar, sentences or tones steps',async t=>{
  const a=await open(t,{pack:'cin1'});
  try{await finalTest(a,'I');assert.deepEqual(Object.keys(await a.page.evaluate(()=>state.seals)),['cin1:I']);
    await a.page.evaluate(()=>{goHome();lessonSheet('I')});const s=await steps(a);
    assert.deepEqual(s.filter(x=>x.off).map(x=>x.n),['Tóny ve slovech','Gramatika','Věty']);assert.ok(s.filter(x=>!x.off).every(x=>x.ok));
    await a.page.keyboard.press('Escape');await a.page.evaluate(()=>lessonSheet('1'));
    await a.page.click('.lstep[data-step="grammar"]');await a.page.waitForTimeout(300);assert.match(await a.text('#mode .row'),/Gramatika.*Lekce 1/);   // the textbook grammar of that lesson
    await a.page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ic-state'));s.pack='hsk1';localStorage.setItem('ic-state',JSON.stringify(s))});
    await a.page.reload();await a.page.waitForFunction(()=>typeof PACK!=='undefined');assert.equal(await a.page.evaluate(()=>PACK),'hsk1');
    assert.equal(await a.page.evaluate(()=>PL.filter(x=>sealOf(x.l)).length),0,'a Chinese 1 seal shows in HSK 1');noErrors(a)}finally{await a.close()}
}],
['Home shows how many cards are due, and nothing when none are',async t=>{
  const day=864e5,chars=await a0(t),due=Object.fromEntries(chars.slice(0,5).map(c=>['c:'+c[1]+'|'+c[3],{e:2.5,i:3,n:2,lp:0,d:Date.now()-day}]));
  let a=await open(t,{pack:'hsk1',srs:due});
  try{assert.match(await a.text('#premind'),/Dnes tě čeká 5 kartiček/);await a.page.click('#premind');await a.page.waitForTimeout(300);assert.match(await a.text('#mode'),/zbývá/)}finally{await a.close()}
  a=await open(t,{pack:'hsk1'});try{assert.ok(!(await a.page.$('#premind')),'a reminder row with nothing due');noErrors(a)}finally{await a.close()}
}]];
// the characters of HSK 1 lesson 1, for seeding progress (read from the page's own data)
async function a0(t){const a=await open(t,{pack:'hsk1'});try{return await a.page.evaluate(()=>HSK1.ch.filter(c=>c[0]==='1'))}finally{await a.close()}}
