// sw.js run with a mocked service worker environment: the reminders, and what happens when a new version activates
const assert=require('node:assert/strict'),vm=require('vm');
const {read}=require('../lib/scripts');
const src=read('sw.js');

function env({keys=[],note,sent}={}){
  const shown=[],posted=[],deleted=[],store=new Map();
  const R=t=>({json:async()=>JSON.parse(t),text:async()=>t});
  if(note)store.set('note',JSON.stringify(note));if(sent)store.set('sent',sent);
  const cache={match:async k=>store.has(k)?R(store.get(k)):undefined,put:async(k,r)=>{store.set(String(k),r._b)},delete:async()=>true};
  const handlers={},win={postMessage:m=>posted.push(m.type)};
  const self={addEventListener:(t,f)=>{handlers[t]=f},registration:{scope:'https://x/app/',showNotification:async(t,o)=>{shown.push(t+' | '+o.body)}},
    clients:{matchAll:async()=>[win],claim:async()=>{}},skipWaiting:async()=>{}};
  const ctx={self,caches:{open:async()=>cache,keys:async()=>keys,delete:async k=>{deleted.push(k)}},Response:function(b){this._b=b},Request:function(){},URL,location:{origin:'https://x'},fetch:async()=>null,Date,console,Promise};
  vm.createContext(ctx);vm.runInContext(src,ctx);
  const fire=async(type,ev={})=>{let w;handlers[type]({waitUntil:p=>{w=p},...ev});await w};
  return {fire,shown,posted,deleted,store};
}
const day=(d=new Date())=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const past=Date.now()-1e6,far=Date.now()+1e9;
const sync=async(note,sent)=>{const e=env({note,sent});await e.fire('periodicsync',{tag:'zyl-remind'});return e.shown};

module.exports=[
['the reminder says how many cards are due, in Czech with the right plural and in English',async()=>{
  assert.deepEqual(await sync({on:true,lang:'cs',due:[past,far],last:''}),['Čeká tě 1 kartička | Pár minut a zůstanou ti v hlavě.']);
  assert.match((await sync({on:true,lang:'cs',due:[past,past,past],last:''}))[0],/^Čeká tě 3 kartičky/);
  assert.match((await sync({on:true,lang:'cs',due:Array(7).fill(past),last:''}))[0],/^Čeká tě 7 kartiček/);
  assert.match((await sync({on:true,lang:'en',due:[past,past],last:''}))[0],/^2 cards to review/);
  assert.match((await sync({on:true,lang:'en',due:[past],last:''}))[0],/^1 card to review/);
}],
['no reminder when nothing is due, when you already studied today, when it was sent today, when reminders are off, or without a note',async()=>{
  assert.deepEqual(await sync({on:true,lang:'cs',due:[far],last:''}),[]);
  assert.deepEqual(await sync({on:true,lang:'cs',due:[past],last:day()}),[]);
  assert.deepEqual(await sync({on:true,lang:'cs',due:[past],last:''},day()),[]);
  assert.deepEqual(await sync({on:false,lang:'cs',due:[past],last:''}),[]);
  assert.deepEqual(await sync(null),[]);
}],
['sending a reminder is remembered, so it comes once a day',async()=>{
  const e=env({note:{on:true,lang:'cs',due:[past],last:''}});await e.fire('periodicsync',{tag:'zyl-remind'});assert.equal(e.shown.length,1);assert.equal(e.store.get('sent'),day());
}],
['the test button always sends a notification',async()=>{
  const a=env({note:{on:true,lang:'cs',due:[past,past,past,past],last:day()},sent:day()});await a.fire('message',{data:{type:'remind-test'}});assert.match(a.shown[0],/^Čeká tě 4 kartičky/);
  const b=env({note:{on:true,lang:'cs',due:[],last:''}});await b.fire('message',{data:{type:'remind-test'}});assert.match(b.shown[0],/^Připomínky fungují/);
}],
['a new version drops the old caches, keeps the reminder note, and tells open pages',async()=>{
  const e=env({keys:['zyl-v11','zyl-v12','zyl-remind','something-else']});await e.fire('activate');
  assert.deepEqual(e.deleted.sort(),['something-else','zyl-v11']);assert.ok(!e.deleted.includes('zyl-remind'),'the reminder note was deleted');assert.deepEqual(e.posted,['update']);
}],
['the very first install does not announce a "new version"',async()=>{
  const e=env({keys:['zyl-v12']});await e.fire('activate');assert.deepEqual(e.deleted,[]);assert.deepEqual(e.posted,[]);
}]];
