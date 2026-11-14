// reminders: the switch in Settings, and the note the page leaves for the service worker (the worker itself is tested in 05)
const assert=require('node:assert/strict');
const {open}=require('../lib/app');
const MS=864e5;

module.exports=[
['turning reminders on and off in Settings saves the choice and the note for the service worker',async t=>{
  const due=Object.fromEntries(Array.from({length:6},(_,i)=>['c:x'+i+'|y',{e:2.5,i:3,n:2,lp:0,d:Date.now()-MS}]));
  // headless Chromium never grants the notification permission, so the page's request is answered "granted" here
  const a=await open(t,{pack:'hsk1',lang:'cs',sw:true,srs:due,init:()=>{Object.defineProperty(Notification,'requestPermission',{value:async()=>'granted'})}});
  try{await a.page.evaluate(()=>settings());assert.match(await a.text('#remh'),/Jednou denně/);assert.ok(!(await a.page.$('#remt')),'the test button shows while reminders are off');
    await a.page.click('[data-rem="1"]');await a.page.waitForFunction(()=>state.remind===true,null,{timeout:5000});
    assert.ok(await a.page.waitForSelector('#remt',{timeout:3000}),'no test button after turning on');
    const note=await a.page.evaluate(async()=>{const c=await caches.open('zyl-remind'),r=await c.match('note');return r&&r.json()});
    assert.ok(note,'no note for the service worker');assert.equal(note.on,true);assert.equal(note.lang,'cs');assert.equal(note.due.length,6);
    await a.page.click('[data-rem="0"]');await a.page.waitForFunction(()=>state.remind===false,null,{timeout:5000});
    const off=await a.page.evaluate(async()=>(await (await (await caches.open('zyl-remind')).match('note')).json()).on);assert.equal(off,false);
    assert.deepEqual(a.errors,[])}finally{await a.close()}
}],
['studying updates the note: the last day of study and when each card is due',async t=>{
  const a=await open(t,{pack:'hsk1',lang:'en',sw:true,init:()=>{Object.defineProperty(Notification,'requestPermission',{value:async()=>'granted'})}});
  try{await a.page.evaluate(async()=>{await remindSet(true);const x=ALLITEMS[0];rate(x,'good');saveSrs()});await a.page.waitForTimeout(400);
    const note=await a.page.evaluate(async()=>(await (await caches.open('zyl-remind')).match('note')).json());
    assert.equal(note.lang,'en');assert.equal(note.due.length,1);assert.ok(note.due[0]>Date.now(),'a card just learnt should be due later');assert.deepEqual(a.errors,[])}finally{await a.close()}
}]];
