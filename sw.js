/* Zì You Later service worker: the app works offline, and tells the page when a new version is on the web.
   Strategy: serve from the cache straight away, refresh the cache in the background. When the refreshed app page (or one of
   css/ and js/) differs from the cached one, every open page gets {type:'update'} and shows "New version · Reload".
   Every release changes CACHE below, so the files of a version are cached together and an older cache is dropped.
   The big files that rarely change (DATA_FILES) live in their own cache, DATA: a release keeps it, so they are not
   downloaded again. Change DATA only when one of those files changes. */
const CACHE='zyl-v23';
const CORE=['./','index.html','css/app.css',
  'js/data-cin1.js','js/data-hsk1.js','js/pack-load.js','js/packs.js','js/data-chars.js','js/items.js','js/util.js','js/state.js','js/examples.js','js/voice.js','js/update.js','js/speech.js','js/home.js','js/setup.js','js/review.js','js/cards.js','js/try-writing.js','js/questions.js','js/learn.js','js/test.js','js/match.js','js/vocab.js','js/sentences.js','js/grammar-data.js','js/grammar.js','js/writing.js','js/tones.js','js/progress.js','js/account.js','js/welcome.js','js/phonetics.js','js/admin.js','js/nudges.js','js/path.js','js/units.js','js/hsk-test.js','js/modes.js','js/news.js','js/strings-cs.js','js/i18n.js',
  'manifest.webmanifest','grammar-practice.json','grammar-hsk1.json','hsk1-tests.json','examples.json','phonetics.json','grammar1.json',
  'apple-touch-icon.png','icon-192.png','icon-512.png','favicon-32.png'];
const DATA='zyl-data-v4';
const DATA_FILES=['strokes.json','fonts/ziyoukai.woff2','https://cdn.jsdelivr.net/npm/hanzi-writer@3.7.2/dist/hanzi-writer.min.js'];
// the paintings behind Your path (art/*.webp) are big and never change: they go in DATA too, once they are first shown;
// so do the stroke data and the font of HSK 2 and up (packs/hsk<N>-strokes.json, fonts/ziyoukai-hsk<N>.woff2), which only
// the people who chose that course download. The rest of such a pack (packs/hsk<N>.js, -grammar.json) is cached in CACHE
// on first use, like any other file of the app.
const isData=url=>DATA_FILES.some(f=>new URL(f,self.registration.scope).href===url.origin+url.pathname)||(url.origin===location.origin&&/\/(art\/[^/]+\.webp|packs\/hsk\d+-strokes\.json|fonts\/ziyoukai-hsk\d+\.woff2)$/.test(url.pathname));

self.addEventListener('install',e=>{
  e.waitUntil((async()=>{const c=await caches.open(CACHE),d=await caches.open(DATA);
    const get=(cache,u)=>cache.add(new Request(u,{cache:'reload'})).catch(()=>{});
    // the data files already in DATA are kept as they are: a new DATA name brings new copies
    await Promise.all(CORE.map(u=>get(c,u)).concat(DATA_FILES.map(async u=>{if(!await d.match(u))await get(d,u)})));
    await self.skipWaiting()})());
});
self.addEventListener('activate',e=>{
  // a new version (a new CACHE name) replaces the old caches, keeping DATA and the reminder note; open pages are told, unless this is the very first install
  e.waitUntil((async()=>{let had=false;for(const k of await caches.keys())if(k!==CACHE&&k!==DATA&&k!==REMIND){if(/^zyl-v\d+$/.test(k))had=true;await caches.delete(k)}
    await self.clients.claim();if(had)await notifyUpdate()})());
});

/* reminders: the page leaves a note in the cache 'zyl-remind' (on, lang, when cards are due, the last day of study). Once a
   day (periodic background sync) a notification says how many cards are due, unless something was studied today already. */
const REMIND='zyl-remind';
const day=(d=new Date())=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
async function remind(test){
  const c=await caches.open(REMIND),r=await c.match('note');if(!r)return;const n=await r.json().catch(()=>null);if(!n||(!n.on&&!test))return;
  const due=(n.due||[]).filter(t=>t<=Date.now()).length,today=day();
  if(!test){if(!due||n.last===today)return;const s=await c.match('sent');if(s&&(await s.text())===today)return;await c.put('sent',new Response(today))}
  const cs=n.lang==='cs',k=due===1?0:due>=2&&due<=4?1:2;
  const title=test&&!due?(cs?'Připomínky fungují':'Reminders work'):cs?`Čeká tě ${due} ${['kartička','kartičky','kartiček'][k]}`:`${due} ${due===1?'card':'cards'} to review`;
  await self.registration.showNotification(title,{body:cs?'Pár minut a zůstanou ti v hlavě.':'A few minutes keep them in your head.',icon:'icon-192.png',badge:'icon-192.png',tag:'zyl-remind',data:{url:new URL('./',self.registration.scope).href}})}
self.addEventListener('periodicsync',e=>{if(e.tag===REMIND)e.waitUntil(remind(false))});
self.addEventListener('notificationclick',e=>{e.notification.close();const url=(e.notification.data&&e.notification.data.url)||new URL('./',self.registration.scope).href;
  e.waitUntil((async()=>{for(const w of await self.clients.matchAll({type:'window',includeUncontrolled:true})){if('focus' in w)return w.focus()}return self.clients.openWindow(url)})())});

const isAsset=url=>url.origin===location.origin&&/\/(css|js)\/[^/]+$/.test(url.pathname);   // the app is index.html plus css/ and js/: a change in any of them is a new version
const isApp=url=>url.origin===location.origin&&(/\/$/.test(url.pathname)||/\/index\.html$/.test(url.pathname));
const cachable=url=>url.origin===location.origin||url.hostname==='cdn.jsdelivr.net'||url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com';

// a found update is remembered (pages that open later ask for it), and cleared once a page gets the new copy
const FLAG='__update-ready';
async function notifyUpdate(){const c=await caches.open(CACHE);await c.put(FLAG,new Response('1'));for(const w of await self.clients.matchAll({type:'window'}))w.postMessage({type:'update'})}
self.addEventListener('message',e=>{if(e.data&&e.data.type==='remind-test'){e.waitUntil(remind(true));return}if(!e.data||e.data.type!=='hello')return;
  e.waitUntil((async()=>{const c=await caches.open(CACHE),f=await c.match(FLAG);if(f&&e.source)e.source.postMessage({type:'update'})})())});

self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(!cachable(url))return;
  // the app page: one cache key for "./" and "index.html", ignoring ?query and #hash
  const key=req.mode==='navigate'||isApp(url)?new URL('./',self.registration.scope).href:req;
  e.respondWith((async()=>{
    // the data files are kept in DATA, everything else in CACHE; a hit in either one is served
    const main=await caches.open(CACHE),data=await caches.open(DATA),c=isData(url)?data:main,o={ignoreSearch:req.mode==='navigate'||isApp(url)};
    const hit=await c.match(key,o)||await (c===data?main:data).match(key,o);
    const appKey=key===new URL('./',self.registration.scope).href;
    // read the cached app page before handing it to the browser, to compare it with the one on the web
    const watch=appKey||isAsset(url);
    const hitText=hit&&watch?await hit.clone().text().catch(()=>null):null;
    const fresh=fetch(req.mode==='navigate'?new Request(new URL('./',self.registration.scope).href,{cache:'no-cache'}):req).then(async res=>{
      if(res&&(res.ok||res.type==='opaque')){
        let changed=false;if(hitText!=null&&res.ok){try{changed=(await res.clone().text())!==hitText}catch(_){}}
        await c.put(key,res.clone());if(changed)await notifyUpdate()}
      return res}).catch(()=>null);
    // a page opened after an update was found already gets the new copy, so the notice is no longer needed
    if(hit&&req.mode==='navigate')await main.delete(FLAG);
    if(hit){e.waitUntil(fresh);return hit}
    const res=await fresh;if(res)return res;
    if(req.mode==='navigate'){const any=await main.match(new URL('./',self.registration.scope).href);if(any)return any}
    return new Response('',{status:504,statusText:'Offline'});
  })());
});
