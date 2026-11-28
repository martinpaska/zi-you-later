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
['HSK 1: the card on Home opens Your path: 4 chapters, 15 lessons, each with its units as stamps, one "start" and the button to the next unit',async t=>{
  const a=await open(t,{pack:'hsk1',state:{seals:{'hsk1:1':{d:'2026-11-10',s:90}}}});
  try{assert.match(await a.text('.jcard'),/Rok v Pekingu.*Lekce 2.*Slova 1.*1 \/ 15/);await a.page.click('.jcard');await a.page.waitForSelector('.journey');
    assert.equal(await a.page.$$eval('.jch',e=>e.length),4);assert.equal(await a.page.$$eval('.ulesson',e=>e.length),15);
    const n=await a.page.evaluate(()=>LESSONS.reduce((s,l)=>s+lessonUnits(l).length,0));assert.equal(await a.page.$$eval('.unode',e=>e.length),n);
    assert.equal(await a.page.$$eval('.unode.cur',e=>e.length),1);assert.equal(await a.page.$eval('.unode.cur',e=>e.dataset.unit),'2|w1','the first unit of lesson 2 is not marked');
    assert.equal(await a.page.$$eval('#ul-1 .unode.done',e=>e.length),await a.page.evaluate(()=>lessonUnits('1').length),'a stamped lesson is not all done');
    assert.ok(!(await a.page.$('.ulesson.locked, [data-jump]')),'a lesson is locked');
    assert.match(await a.text('.tcta'),/Pokračuj: Lekce 2 · Slova 1/);assert.match(await a.text('#ul-1 .ulh'),/Lekce 1 · Splněno/);assert.ok(!(await a.page.$('.ulh button')),'the lesson card still has a button');assert.ok(await a.page.$('.jgoal [data-go="hsktest"]'),'no goal');
    assert.equal(await a.page.evaluate(()=>document.documentElement.scrollWidth),390,'the path is wider than the screen');
    await a.page.click('.unode.cur');await a.page.waitForSelector('.nsheet .usheet');assert.match(await a.text('.usheet'),/Slova 1.*Začít/);
    await a.page.click('.nsheet [data-ugo]');await a.page.waitForSelector('.ubar');noErrors(a)}finally{await a.close()}
}],
['every lesson of both courses is split into units: words units of about 5 words that cover the lesson, grammar units for its points, then the review and the Final test',async t=>{
  for(const pack of ['hsk1','cin1']){const a=await open(t,{pack});
    try{const bad=await a.page.evaluate(()=>LESSONS.flatMap(l=>{const us=lessonUnits(l),it=lessonItems(l),ws=it.filter(x=>x.kind==='w'),main=ws.length?ws:it,e=[];
        const w=us.filter(u=>u.kind==='w'),got=w.flatMap(u=>u.items.map(x=>x.k)),chars=w.flatMap(u=>u.chars.map(x=>x.k));
        if(us[0].kind!=='w')e.push(l+': does not start with words');if(us.slice(-2).map(u=>u.id).join()!=='r,f')e.push(l+': does not end with the review and the Final test');
        if(got.length!==main.length||new Set(got).size!==main.length||main.some(x=>!got.includes(x.k)))e.push(l+': the words units do not cover the lesson once');
        if(ws.length&&chars.length!==it.filter(x=>x.kind==='c').length)e.push(l+': not every character is in a unit');
        if(w.some(u=>u.items.length<2||u.items.length>8))e.push(l+': a words unit of '+w.map(u=>u.items.length));
        if(w.some(u=>!u.g))e.push(l+': a words unit without its character');
        const gp=us.filter(u=>u.kind==='g').flatMap(u=>u.pts);if(gp.join()!==(GRAMMAR[l]||[]).map((g,i)=>i).join())e.push(l+': grammar points '+gp);
        if(new Set(us.map(u=>u.id)).size!==us.length)e.push(l+': two units with one id');return e}));
      assert.deepEqual(bad,[],pack);noErrors(a)}finally{await a.close()}}
}],
['a unit is a session of mixed exercises: it ends with its result, saves the level, teaches its words and opens the next unit; played again it goes up a level',async t=>{
  const a=await open(t,{pack:'hsk1'});
  try{await a.page.evaluate(()=>unitRun('1','w1'));const types=await playUnit(a);
    for(const k of ['intro','mc','match','tone','pinyin'])assert.ok(types.includes(k),'no '+k+' exercise in '+types.join(' '));
    assert.match(await a.text('.udone'),/Lekce 1 · Slova 1.*Podbod hotový!.*\d+ ?%.*správně napoprvé · (\d+ min )?\d+ s/);assert.ok(!/asi \d+ min/.test(await a.text('.udone')),'the time is a guess');assert.ok(await a.page.$('.udone .rstamp'),'no 完 seal');
    assert.deepEqual(await a.page.evaluate(()=>state.units),{'hsk1:1':{w1:1}});
    assert.ok(await a.page.evaluate(()=>lessonUnits('1')[0].items.every(seen)),'the words of the unit were not learnt');
    await a.page.click('#unext');await a.page.waitForSelector('.ubar');assert.equal(await a.page.evaluate(()=>unitNow().u.id),'w2');
    await a.page.evaluate(()=>album());assert.equal(await a.page.$eval('.unode.cur',e=>e.dataset.unit),'1|w2');assert.equal(await a.page.$$eval('[data-unit="1|w1"].done .ulvb i.on',e=>e.length),1,'no level on a done unit');
    await a.page.click('[data-unit="1|w1"]');assert.match(await a.text('.usheet'),/Úroveň 1 ze 3.*Procvičit na úrovni 2/);await a.page.click('.nsheet [data-ugo="2"]');
    const t2=await playUnit(a);assert.ok(!t2.includes('intro'),'level 2 introduces the words again');assert.match(await a.text('.udone'),/Úroveň výš!/);
    assert.equal(await a.page.evaluate(()=>state.units['hsk1:1'].w1),2);noErrors(a)}finally{await a.close()}
}],
['grammar units and the lesson review run with their exercises; every unit is open from the start',async t=>{
  const a=await open(t,{pack:'hsk1'});
  try{assert.ok(await a.page.evaluate(()=>LESSONS.every(l=>lessonOpen(l)&&lessonUnits(l).every(u=>unitOpen(l,u)))),'a lesson or unit is locked');
    const g=await a.page.evaluate(()=>lessonUnits('1').find(u=>u.kind==='g').id);
    await a.page.evaluate(g=>unitRun('1',g),g);await a.page.waitForSelector('.ucard');let types=await playUnit(a);
    assert.ok(types.includes('gcard')&&types.includes('gram'),'no grammar in '+types.join(' '));
    await a.page.evaluate(()=>unitRun('1','r'));await a.page.waitForSelector('.ucard');types=await playUnit(a);assert.ok(types.length>8,'a short review: '+types.join(' '));
    assert.deepEqual(Object.keys(await a.page.evaluate(()=>state.units['hsk1:1'])).sort(),[g,'r'].sort());noErrors(a)}finally{await a.close()}
}],
['what you know counts: the words units of words you already learnt are done, and the path starts after them',async t=>{
  const a0=await open(t,{pack:'hsk1'});let srs;try{srs=await a0.page.evaluate(()=>Object.fromEntries(lessonUnits('1')[0].items.map(x=>[x.k,{e:2.5,i:3,n:2,lp:0,d:Date.now()+9e8}])))}finally{await a0.close()}
  const a=await open(t,{pack:'hsk1',srs});
  try{assert.deepEqual(await a.page.evaluate(()=>[unitLv('1',lessonUnits('1')[0]),unitNow().u.id]),[1,'w2']);noErrors(a)}finally{await a.close()}
}],
['you can jump anywhere on the path, and it goes on from there: a unit of lesson 3, then the Final test of lesson 5',async t=>{
  const a=await open(t,{pack:'hsk1'});
  try{await a.page.evaluate(()=>album());assert.equal(await a.page.$eval('.unode.cur',e=>e.dataset.unit),'1|w1');
    await a.page.click('[data-unit="3|w2"]');await a.page.waitForSelector('.nsheet .usheet');assert.match(await a.text('.usheet'),/Začít/);
    await a.page.click('.nsheet [data-ugo]');await a.page.waitForSelector('.ubar');await playUnit(a);
    assert.deepEqual(await a.page.evaluate(()=>[unitNow().l,unitNow().u.id]),['3',await a.page.evaluate(()=>lessonUnits('3')[2].id)],'the path does not go on after the unit you played');
    await a.page.evaluate(()=>album());assert.equal(await a.page.$eval('.unode.cur',e=>e.dataset.unit.split('|')[0]),'3');
    await a.page.evaluate(()=>{const r=Math.random;Math.random=()=>0.999999;pathMark('5',lessonUnits('5').find(u=>u.kind==='f'));startStep('5','final');Math.random=r});
    for(let i=0;i<40;i++){if(!await a.page.$('#qo'))break;await a.page.click('#qo .opt[data-i="0"]');await a.page.click('#qn')}
    await a.page.waitForTimeout(300);assert.match(await a.text('#mode'),/Pečeť orazítkována/);
    const r=await a.page.evaluate(()=>[!!sealOf('5'),lessonDone('5'),lessonDone('1'),unitNow().l]);assert.deepEqual(r,[true,true,false,'6'],'nothing before lesson 5 counts as done, and the path goes on with lesson 6');
    noErrors(a)}finally{await a.close()}
}],
['pinyin on the path can be switched off and on: the units, their sheets and results then hide it',async t=>{
  const a=await open(t,{pack:'hsk1'});
  try{await a.page.evaluate(()=>album());assert.equal(await a.page.getAttribute('.jhead [data-pathpy]','aria-pressed'),'true');
    await a.page.click('.jhead [data-pathpy]');assert.deepEqual(await a.page.evaluate(()=>[state.pathPy,document.body.classList.contains('nopy')]),[false,true]);
    await a.page.click('[data-unit="1|w1"]');await a.page.waitForSelector('.nsheet .usheet');
    assert.equal(await a.page.$$eval('.usheet .pys',e=>e.filter(x=>x.offsetParent).length),0,'pinyin still shows on the unit sheet');
    await a.page.click('.nsheet [data-ugo]');await a.page.waitForSelector('.ubar [data-pathpy]');assert.equal(await a.page.getAttribute('.ubar [data-pathpy]','aria-pressed'),'false');
    await a.page.click('.ubar [data-pathpy]');assert.equal(await a.page.evaluate(()=>state.pathPy),true);assert.ok(!(await a.page.evaluate(()=>document.body.classList.contains('nopy'))));
    noErrors(a)}finally{await a.close()}
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
// plays a unit to its end, choosing the first answer, typing a wrong pinyin, skipping the writing (a mistake comes back twice at most)
async function playUnit(a){const p=a.page,types=[];
  for(let i=0;i<200;i++){await p.waitForTimeout(40);
    const k=await p.evaluate(()=>{const M=document.getElementById('mode');if(M.querySelector('.udone'))return 'done';if(M.querySelector('#inext'))return 'intro';if(M.querySelector('#fb .fb #ucont'))return 'fb';
      if(M.querySelector('#ucont'))return 'gcard';if(M.querySelector('.gdcard'))return 'gram';if(M.querySelector('#uhw'))return 'write';if(M.querySelector('#mg'))return 'match';if(M.querySelector('#ts'))return 'tone';
      if(M.querySelector('#uin'))return 'pinyin';if(M.querySelector('#bk'))return 'build';if(M.querySelector('.opts'))return 'mc';return '?'});
    if(k==='done')return types;if(k!=='fb')types.push(k);
    if(k==='intro')await p.click('#inext');else if(k==='fb'||k==='gcard')await p.click('#ucont');else if(k==='mc')await p.click('.opts .opt');
    else if(k==='gram'){if(await p.$('#bk')){for(const b of await p.$$('#bk .chunk'))await b.click();await p.click('#chk')}else await p.click('#qo .opt')}
    else if(k==='pinyin'){await p.fill('#uin','xx');await p.press('#uin','Enter')}
    else if(k==='tone'){const n=await p.$$eval('#ts .tsyl',x=>x.length);for(let j=0;j<n;j++)await p.keyboard.press('1');await p.click('#tfc')}
    else if(k==='match'){const ts=await p.$$('#mg .mt');for(let x=0;x<ts.length;x+=2)for(let y=1;y<ts.length;y+=2){if(await ts[x].evaluate(e=>e.classList.contains('gone')))break;if(await ts[y].evaluate(e=>e.classList.contains('gone')))continue;await ts[x].click();await ts[y].click()}}
    else if(k==='build'){for(const b of await p.$$('#bk .chunk'))await b.click();await p.click('#chk');if(!(await p.$('#fb #ucont')))await p.click('#chk')}
    else if(k==='write')await p.click('#unow');else throw new Error('an unknown exercise: '+(await a.text('#mode')).slice(0,120))}
  throw new Error('the unit does not end')}
// the characters of HSK 1 lesson 1, for seeding progress (read from the page's own data)
async function a0(t){const a=await open(t,{pack:'hsk1'});try{return await a.page.evaluate(()=>HSK1.ch.filter(c=>c[0]==='1'))}finally{await a.close()}}
