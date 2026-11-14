/* state */
let state=Object.assign({sel:['1','2'],script:'s',filter:'all',set:'c',newPerDay:10,board:false,voice:''},store.get('ic-state',{}));
state.pack=PACK;state.sel=new Set(((state.selBy&&state.selBy[PACK])||(PACK==='cin1'?state.sel:['1','2'])).filter(l=>LESSONS.includes(l)));
// the syllable recordings were fixed: they become the default sound for characters and words (once; the setting can be changed back)
if(state.pyRate&&!state.rate)state.rate=state.pyRate;['wordAudio','sentAudio','pyAudio','pyRate','av3','av4'].forEach(k=>delete state[k]);
const saveState=()=>{const sel=[...state.sel];state.selBy={...(state.selBy||{}),[PACK]:sel};store.set('ic-state',{...state,sel:PACK==='cin1'?sel:((state.selBy.cin1)||['1','2']),selBy:state.selBy});cloudSave()};

/* spaced repetition (SM-2 style) */
let srs=store.get('ic-srs',{});
const todayStr=(d=new Date())=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
let stats=Object.assign({day:'',rev:0,nw:0,streak:0,last:'',total:0,u:0},store.get('ic-stats',{}));
/* pinyin dictation: answers and correct answers per mode, confusions (right>given), practice test scores */
let PYS=Object.assign({m:{},c:{},tests:[],u:0},store.get('ic-pinyin',{}));
const savePys=()=>{PYS.u=Date.now();store.set('ic-pinyin',PYS);cloudSave()};
function rollDay(){const t=todayStr();if(stats.day!==t){stats.day=t;stats.rev=0;stats.nw=0;stats.extra=0}}
rollDay();
const DAY=864e5,MIN=6e4;
const saveSrs=()=>{store.set('ic-srs',srs);store.set('ic-stats',stats);cloudSave();remindSave()};
/* reminders: the service worker cannot read localStorage, so the page leaves it a note in a cache: whether reminders are on,
   the language, when every card is due and the last day of study. With periodic background sync (Chrome and Edge, with the
   app installed) the worker then shows "N cards to review" once a day when nothing was studied yet. */
const REMIND_OK='Notification' in window&&'serviceWorker' in navigator,REMIND_BG=REMIND_OK&&typeof ServiceWorkerRegistration!=='undefined'&&'periodicSync' in ServiceWorkerRegistration.prototype;
function remindSave(){if(!('caches' in window))return;
  try{const due=Object.values(srs).map(r=>r&&r.d).filter(Boolean).sort((a,b)=>a-b);
    caches.open('zyl-remind').then(c=>c.put('note',new Response(JSON.stringify({on:!!state.remind,lang:document.documentElement.lang==='cs'?'cs':'en',due,last:stats.last||''}),{headers:{'Content-Type':'application/json'}}))).catch(()=>{})}catch(e){}}
async function remindSet(on){
  if(on){if(!REMIND_OK)return 'unsupported';const perm=await Notification.requestPermission();if(perm!=='granted'){state.remind=false;saveState();remindSave();return 'denied'}}
  state.remind=!!on;saveState();remindSave();
  try{const r=await navigator.serviceWorker.ready;if(REMIND_BG){if(on)await r.periodicSync.register('zyl-remind',{minInterval:12*36e5});else await r.periodicSync.unregister('zyl-remind')}}catch(e){return on?'nobg':'off'}
  return on?(REMIND_BG?'on':'nobg'):'off'}
const rec=x=>srs[x.k];
function nextIvl(r,q){
  const i=r?r.i:0,e=r?r.e:2.5;
  if(q==='again')return 0;
  if(q==='hard')return i===0?0:Math.max(1,Math.round(i*1.2));
  if(q==='good')return i===0?1:i<3?3:Math.round(i*e);
  return i===0?4:Math.round(i*e*1.3);
}
const ivlLabel=(d)=>d===0?'10 min':d<30?d+(d===1?' day':' days'):d<365?Math.round(d/30)+' mo':(d/365).toFixed(1)+' yr';
function rate(x,q){
  rollDay();
  const isNew=!(srs[x.k]&&srs[x.k].n),r=srs[x.k]||(srs[x.k]={e:2.5,i:0,n:0,lp:0,d:0});
  r.i=nextIvl(isNew?null:r,q);
  if(q==='again'){r.e=Math.max(1.3,r.e-.2);r.lp++;r.d=Date.now()+10*MIN}
  else{if(q==='hard')r.e=Math.max(1.3,r.e-.15);if(q==='easy')r.e+=.15;r.d=r.i?Date.now()+r.i*DAY:Date.now()+10*MIN}
  r.n++;r.u=Date.now();
  stats.rev++;stats.total++;if(isNew)stats.nw++;{const h=stats.hist||(stats.hist={}),td=todayStr();h[td]=(h[td]||0)+1;for(const d in h)if(d<todayStr(new Date(Date.now()-14*DAY)))delete h[d]}
  const t=todayStr(),y=todayStr(new Date(Date.now()-DAY));
  if(stats.last!==t){stats.streak=stats.last===y?stats.streak+1:1;stats.last=t;stats.best=Math.max(stats.best||0,stats.streak)}
  stats.u=Date.now();saveSrs();
}
// Practice modes nudge the schedule: right answers count only for new or due items, mistakes always bring the item back.
function grade(x,ok){const r=rec(x);if(!ok)rate(x,'again');else if(!r||!r.n||r.d<=Date.now())rate(x,'good')}
const mastery=x=>{const r=rec(x);return !r||!r.n?0:r.i>=7?2:1};
const isDue=x=>{const r=rec(x);return !!r&&r.n>0&&r.d<=Date.now()};
const starred=x=>!!(srs[x.k]&&srs[x.k].s);
/* a ★ for any character or word: the same stars as the Vocabulary list (★ tab) and the details sheet, synced with the account */
const starHtml=(x,cls='')=>x&&x.k&&BYKEY.has(x.k)?`<button type="button" class="xstar ${cls}" data-xstar="${esc(x.k)}" aria-pressed="${starred(x)}" aria-label="Star" title="Star">★</button>`:'';
document.addEventListener('click',e=>{const b=e.target.closest('[data-xstar]');if(!b)return;e.preventDefault();e.stopPropagation();
  const x=BYKEY.get(b.dataset.xstar);if(!x)return;const on=toggleStar(x);
  document.querySelectorAll(`[data-xstar="${CSS.escape(b.dataset.xstar)}"]`).forEach(o=>o.setAttribute('aria-pressed',String(on)));
  if($('ifstar')&&b.closest('.wsheet'))$('ifstar').setAttribute('aria-pressed',String(on))},true);
function toggleStar(x){const r=srs[x.k]||(srs[x.k]={e:2.5,i:0,n:0,lp:0,d:Date.now()+3650*DAY,fresh:1});r.s=!r.s;r.u=Date.now();saveSrs();return r.s}
const seen=x=>{const r=rec(x);return r&&r.n>0};

const setItems=()=>state.set==='w'?WD:CH;
function basePool(set){const src=set==='c'?CH:set==='w'?WD:setItems(),u=new Set(),out=[];for(const x of src){if(!state.sel.has(x.l)||u.has(x.k))continue;u.add(x.k);out.push(x)}return out}
function pool(){const b=basePool();return state.filter==='weak'?b.filter(x=>mastery(x)<2):state.filter==='star'?b.filter(starred):b}
function twinGroups(items,noNeutral){
  const g={};for(const x of items){if(noNeutral&&!x.tone)continue;(g[x.syl]=g[x.syl]||[]).push(x)}
  return Object.entries(g).filter(([,a])=>new Set(a.map(x=>x.tone)).size>1).sort((a,b)=>a[0].localeCompare(b[0])).map(([syl,a])=>({syl,items:a.sort((p,q)=>(p.tone||5)-(q.tone||5))}));
}
function distract(x,n,key){
  const kx=key(x),u=new Set([kx]),out=[],same=(x.kind==='c'?CH:WD);
  for(const src of [shuffle(basePool(x.kind)),shuffle(same)])for(const y of src){if(out.length>=n)break;const k=key(y);if(u.has(k))continue;u.add(k);out.push(y)}
  return out;
}
const priority=items=>shuffle(items).sort((a,b)=>(isDue(b)-isDue(a))||(mastery(a)-mastery(b)));
const sentHz=s=>(state.script==='t'?s.zht:s.zh);
const ORD=l=>l==='I'?0:+l;
