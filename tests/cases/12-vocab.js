// the Vocabulary list: every word once, in every lesson of both courses, in search and in the starred list
const assert=require('node:assert/strict');
const {open}=require('../lib/app');
const rows=a=>a.page.$$eval('#vbody .vrow .vz',e=>e.map(x=>x.textContent));
const dups=z=>z.filter((x,i)=>z.indexOf(x)!==i);

module.exports=[
...['cin1','hsk1'].map(pack=>[`${pack}: no word is listed twice in any lesson`,async t=>{
  const a=await open(t,{pack});
  try{const ls=await a.page.evaluate(()=>LESSONS);const bad=[];let total=0;
    for(const l of ls){await a.page.evaluate(l=>{store.set('ic-vlesson',l);goHome();vocab()},l);const z=await rows(a);total+=z.length;assert.ok(z.length>=8,`lesson ${l} lists only ${z.length}`);if(dups(z).length)bad.push(l+': '+dups(z).join(' '))}
    assert.deepEqual(bad,[],'listed twice: '+bad.join(' | '));assert.deepEqual(a.errors,[]);assert.ok(total>300,'only '+total+' rows in all')}finally{await a.close()}}]),
['search finds by pinyin, character and meaning, and never lists a word twice',async t=>{
  const a=await open(t,{pack:'hsk1'});
  try{await a.page.evaluate(()=>{goHome();vocab()});
    for(const [q,expect] of [['chi','吃'],['吃','吃'],['to eat','吃'],['xiexie','谢谢']]){await a.page.fill('#vq',q);await a.page.waitForTimeout(350);const z=await rows(a);
      assert.ok(z.includes(expect),`"${q}" does not find ${expect}: ${z.slice(0,8)}`);assert.deepEqual(dups(z),[],`"${q}" lists twice`)}
    assert.deepEqual(a.errors,[])}finally{await a.close()}
}],
['the starred list shows a starred word once',async t=>{
  const a=await open(t,{pack:'hsk1'});
  try{await a.page.evaluate(()=>{for(const x of ALLITEMS.filter(x=>x.s==='吃'))toggleStar(x);goHome();store.set('ic-vlesson','star');vocab()});
    const z=await rows(a);assert.equal(z.filter(x=>x==='吃').length,1,'吃 in the ★ list: '+z);assert.deepEqual(a.errors,[])}finally{await a.close()}
}]];
