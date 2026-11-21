// the app loads and every screen opens, in both courses and both languages, without a single error
const assert=require('node:assert/strict');
const {open}=require('../lib/app');
const noErrors=a=>assert.deepEqual(a.errors,[],'\n'+a.errors.join('\n'));

module.exports=[
...[['cin1','cs'],['cin1','en'],['hsk1','cs'],['hsk1','en']].map(([pack,lang])=>[`Home loads: ${pack}, ${lang}`,async t=>{
  const a=await open(t,{pack,lang});
  try{assert.ok(await a.page.isVisible('#home'),'Home is not visible');assert.ok(await a.page.isVisible('.jcard'),'the Your path card is missing');
    assert.equal(await a.page.evaluate(()=>PACK),pack);assert.equal(await a.page.evaluate(()=>LANG),lang);
    assert.ok(!(await a.page.isVisible('#welcome')),'the welcome page is showing');noErrors(a)}finally{await a.close()}}]),
...['cin1','hsk1'].map(pack=>[`every exercise tile on Home opens its screen: ${pack}`,async t=>{
  const a=await open(t,{pack});
  try{const modes=await a.page.$$eval('#home [data-mode]',bs=>bs.filter(b=>!b.hidden&&b.offsetParent).map(b=>b.dataset.mode));
    assert.ok(modes.length>=7,'only '+modes.length+' tiles: '+modes);
    for(const m of modes){await a.page.evaluate(()=>goHome());await a.page.click(`#home [data-mode="${m}"]`);await a.page.waitForTimeout(150);
      assert.ok(await a.page.isVisible('#mode'),m+' did not open');assert.ok((await a.page.textContent('#mode')).trim().length>20,m+' opened empty')}
    noErrors(a)}finally{await a.close()}}]),
['the tiles each course should not have are hidden',async t=>{
  const tiles=async pack=>{const a=await open(t,{pack});try{return await a.page.$$eval('#home [data-mode]',bs=>bs.filter(b=>!b.hidden&&b.offsetParent).map(b=>b.dataset.mode))}finally{await a.close()}};
  const c=await tiles('cin1'),h=await tiles('hsk1');
  assert.ok(c.includes('test')&&c.includes('gram1')&&!c.includes('hsktest')&&!c.includes('learn'),'Chinese 1: '+c);
  assert.ok(h.includes('hsktest')&&!h.includes('test')&&!h.includes('gram1')&&!h.includes('learn'),'HSK 1: '+h);
}],
['first visit: the welcome page, and every practice tile on it opens its exercise without signing up',async t=>{
  for(const m of ['cards','write','twins','grammar','sentences','test']){
    const a=await open(t,{welcome:true,lang:'cs'});
    try{assert.ok(await a.page.isVisible('#welcome'),'no welcome page');
      await a.page.click(`[data-wmode="${m}"]`);await a.page.waitForTimeout(250);
      assert.ok(await a.page.isVisible('#mode'),m+' did not open from the welcome page');assert.ok(!(await a.page.isVisible('#welcome')));noErrors(a)}finally{await a.close()}}
}],
['Settings and What\'s new open; What\'s new shows five entries and folds the rest',async t=>{
  const a=await open(t,{lang:'cs'});
  try{await a.page.evaluate(()=>settings());assert.ok((await a.text('#mode')).includes('Připomínky'),'no Reminders section in Settings');
    await a.page.evaluate(()=>{goHome();whatsNew(true)});await a.page.waitForSelector('.nsheet');
    const n=await a.page.evaluate(()=>NEWS.length);const open5=await a.page.$$eval('.nsheet .nbody>.ncard:not(.nhero)',e=>e.length);
    assert.equal(open5,Math.min(5,n),'entries in the list under the big card: '+open5);   // the list holds the last five (the newest is also the big card on top)
    if(n>5){assert.equal(await a.page.$$eval('.nsheet .nold .ncard',e=>e.length),n-5);assert.ok(await a.page.$('.nolder'),'no "Older news" fold')}
    noErrors(a)}finally{await a.close()}
}]];
