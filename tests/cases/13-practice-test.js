// the HSK 1 practice test: 40 questions, answers checked at the end
const assert=require('node:assert/strict');
const {open}=require('../lib/app');

// answers the whole test; wrong(i) says which questions to get wrong
async function run(a,idx,wrong=()=>false){
  await a.page.evaluate(()=>{goHome();hskTest()});await a.page.waitForSelector('[data-ht="0"]');   // (the tests are loaded when this screen opens)
  const ks=await a.page.evaluate(i=>htFlat(HT[i]).map(q=>q.k),idx);
  await a.page.click(`[data-ht="${idx}"]`);await a.page.waitForTimeout(300);
  for(let i=0;i<40;i++){const n=await a.page.$$eval('#mode [data-a]',b=>b.length);const pick=wrong(i)?(ks[i]+1)%n:ks[i];
    await a.page.click(`#mode [data-a="${pick}"]`);await a.page.click('#htn');await a.page.waitForTimeout(20)}
  await a.page.waitForSelector('.htparts');return ks}
// the score counts up from zero: wait for its final value (the bar above also says "40 / 40", so look at the score itself)
const score=(a,v)=>a.page.waitForFunction(v=>{const s=document.querySelector('#mode .score');return !!s&&s.textContent.replace(/\s+/g,' ').trim()===v},v,{timeout:4000}).catch(async()=>{throw new Error('the score is "'+await a.text('#mode .score')+'", not "'+v+'"')});

module.exports=[
['test 1 and test 2: all 40 right gives 40 / 40, with 20 + 20 and eight parts of five',async t=>{
  const a=await open(t,{pack:'hsk1'});
  try{await a.page.evaluate(()=>hskTest());await a.page.waitForSelector('[data-ht="0"]');
    for(const idx of [0,1]){await run(a,idx);await score(a,'40 / 40');const txt=await a.text('#mode');
      assert.match(txt,/Poslech 20 \/ 20/);assert.match(txt,/Čtení 20 \/ 20/);assert.equal(await a.page.$$eval('.htpart',e=>e.length),8);assert.ok(!(await a.page.$('.htr')),'a mistake is listed')}
    const best=await a.page.evaluate(()=>state.hskt);assert.deepEqual(Object.values(best).map(x=>x.s),[40,40]);assert.deepEqual(a.errors,[])}finally{await a.close()}
}],
['wrong answers are counted and listed with the right answer; the end has the 完 seal',async t=>{
  const a=await open(t,{pack:'hsk1'});
  try{await run(a,0,i=>i%5===0);await score(a,'32 / 40');const txt=await a.text('#mode');   // 8 wrong
    assert.equal(await a.page.$$eval('.htr',e=>e.length),8);assert.match(txt,/Správná odpověď/);assert.ok((await a.page.$$('.htr [data-htr]')).length>0,'no "play again" in the review of a listening mistake');
    assert.equal(await a.page.evaluate(()=>state.hskt['1'].s),32);assert.ok(await a.page.$('.rstamp'),'no 完 seal at the end of the test');assert.deepEqual(a.errors,[])}finally{await a.close()}
}],
['the answer is only checked at the end: no feedback while answering, Back keeps the answer, reading starts at question 21',async t=>{
  const a=await open(t,{pack:'hsk1'});
  try{await a.page.evaluate(()=>hskTest());await a.page.click('[data-ht="0"]');await a.page.waitForTimeout(300);
    assert.ok(await a.page.isDisabled('#htn'),'Next is enabled before an answer');await a.page.click('#mode [data-a="0"]');assert.ok(!(await a.page.$('.fb')),'feedback during the test');
    await a.page.click('#htn');await a.page.click('#htb');assert.ok(await a.page.$('#mode .sel'),'the answer was lost');
    assert.equal(await a.page.evaluate(()=>htFlat(HT[0]).findIndex(x=>x.sec==='r')),20,'reading should start at question 21');assert.deepEqual(a.errors,[])}finally{await a.close()}
}]];
