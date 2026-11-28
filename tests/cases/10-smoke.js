// the app loads and every screen opens, in both courses and both languages, without a single error
const assert=require('node:assert/strict');
const {open}=require('../lib/app');
const noErrors=a=>assert.deepEqual(a.errors,[],'\n'+a.errors.join('\n'));
const PACK_NAMES={hsk2:'Back in China',hsk3:'Living in China'};

module.exports=[
...[['cin1','cs'],['cin1','en'],['hsk1','cs'],['hsk1','en'],['hsk2','cs'],['hsk2','en'],['hsk3','cs'],['hsk3','en']].map(([pack,lang])=>[`Home loads: ${pack}, ${lang}`,async t=>{
  const a=await open(t,{pack,lang});
  try{assert.ok(await a.page.isVisible('#home'),'Home is not visible');assert.ok(await a.page.isVisible('.jcard'),'the Your path card is missing');
    assert.equal(await a.page.evaluate(()=>PACK),pack);assert.equal(await a.page.evaluate(()=>LANG),lang);
    assert.ok(!(await a.page.isVisible('#welcome')),'the welcome page is showing');noErrors(a)}finally{await a.close()}}]),
...['cin1','hsk1','hsk2','hsk3'].map(pack=>[`every exercise tile on Home opens its screen: ${pack}`,async t=>{
  const a=await open(t,{pack});
  try{const modes=await a.page.$$eval('#home [data-mode]',bs=>bs.filter(b=>!b.hidden&&b.offsetParent).map(b=>b.dataset.mode));
    assert.ok(modes.length>=7,'only '+modes.length+' tiles: '+modes);
    for(const m of modes){await a.page.evaluate(()=>goHome());await a.page.click(`#home [data-mode="${m}"]`);await a.page.waitForTimeout(150);
      assert.ok(await a.page.isVisible('#mode'),m+' did not open');assert.ok((await a.page.textContent('#mode')).trim().length>20,m+' opened empty')}
    noErrors(a)}finally{await a.close()}}]),
['the tiles each course should not have are hidden',async t=>{
  const tiles=async pack=>{const a=await open(t,{pack});try{return await a.page.$$eval('#home [data-mode]',bs=>bs.filter(b=>!b.hidden&&b.offsetParent).map(b=>b.dataset.mode))}finally{await a.close()}};
  const c=await tiles('cin1'),h=await tiles('hsk1'),h2=await tiles('hsk2'),h3=await tiles('hsk3');
  assert.ok(c.includes('test')&&c.includes('gram1')&&!c.includes('hsktest')&&!c.includes('learn'),'Chinese 1: '+c);
  assert.ok(h.includes('hsktest')&&!h.includes('test')&&!h.includes('gram1')&&!h.includes('learn'),'HSK 1: '+h);
  for(const [n,x] of [['HSK 2',h2],['HSK 3',h3]])assert.ok(!x.includes('hsktest')&&!x.includes('test')&&!x.includes('gram1')&&x.includes('grammar')&&x.includes('write'),n+': '+x);   // (no practice test in the new HSK 2 and 3 format yet)
}],
...['hsk2','hsk3'].map(pack=>[`${pack}: its data is loaded only when chosen, with its lessons, grammar, sentences, strokes and font`,async t=>{
  const a=await open(t,{pack,lang:'en'});
  try{const r=await a.page.evaluate(async n=>{const D=PACK_DATA[n],x=D.ch[D.ch.length-1];await loadStrokes();const g=await loadGdrill();
      return {lv:HSK_LV,wd:WD.length,dataWd:D.wd.length,lessons:LESSONS.length,ls:D.meta.lessons.length,gr:Object.keys(GRAMMAR).length,st:ST.length,stroke:!!STROKES[x[2]],
        drills:Object.keys(g).length,font:await (async()=>{const fs=[...document.fonts].filter(f=>f.family.replace(/"/g,'')==='ZiYou Kai');await Promise.all(fs.map(f=>f.load().catch(()=>{})));return fs.length>=2&&fs.every(f=>f.status==='loaded')})(),
        loaded:[...document.scripts].map(s=>s.getAttribute('src')).filter(s=>s&&s.startsWith('packs/')),seals:PL.length,write:PATH.write.length}},pack);
    assert.equal(r.lv,+pack.slice(3));assert.equal(r.wd,r.dataWd);assert.equal(r.lessons,r.ls);assert.equal(r.seals,r.ls);assert.ok(r.gr>=15&&r.st>=200&&r.drills>=30&&r.write>0,JSON.stringify(r));
    assert.ok(r.stroke,'no stroke data for a '+pack+' character after loadStrokes()');assert.ok(r.font,'the pack font was not added');assert.deepEqual(r.loaded,['packs/'+pack+'.js']);
    await a.page.evaluate(()=>album());assert.match(await a.text('#mode'),new RegExp(PACK_NAMES[pack]));
    noErrors(a)}finally{await a.close()}}]),
['HSK 1 and Chinese 1 load no HSK 2 or 3 data; the course list shows all four courses, and choosing HSK 3 switches to it',async t=>{
  const a=await open(t,{pack:'hsk1',lang:'en'});
  try{const req=[];a.page.on('request',q=>{if(/packs\/|ziyoukai-hsk/.test(q.url()))req.push(q.url())});
    assert.deepEqual(await a.page.evaluate(()=>Object.keys(PACK_DATA)),['hsk1']);
    await a.page.evaluate(()=>packSheet());await a.page.waitForSelector('.nsheet');
    assert.deepEqual(await a.page.$$eval('[data-pack]',b=>b.map(x=>x.dataset.pack)),['cin1','hsk1','hsk2','hsk3']);
    assert.match(await a.text('[data-pack="hsk3"]'),/284 characters · 500 words · 22 lessons/);assert.deepEqual(req,[],'downloaded: '+req.join(' '));
    await Promise.all([a.page.waitForNavigation(),a.page.click('[data-pack="hsk3"]')]);await a.page.waitForFunction(()=>typeof renderHome==='function'&&document.readyState==='complete');
    assert.equal(await a.page.evaluate(()=>PACK),'hsk3');assert.equal(await a.page.evaluate(()=>WD.length),500);
    noErrors(a)}finally{await a.close()}
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
