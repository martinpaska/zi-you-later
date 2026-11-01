/* Zì You Later service worker: the app works offline, and tells the page when a new version is on the web.
   Strategy: serve from the cache straight away, refresh the cache in the background. When the refreshed app page
   differs from the cached one, every open page gets {type:'update'} and shows "New version · Reload". */
const CACHE='zyl-v1';
const CORE=['./','index.html','manifest.webmanifest','fonts/ziyoukai.woff2','strokes.json','grammar-practice.json','examples.json',
  'apple-touch-icon.png','icon-192.png','icon-512.png','favicon-32.png'];
const CDN=['https://cdn.jsdelivr.net/npm/hanzi-writer@3.7.2/dist/hanzi-writer.min.js'];

self.addEventListener('install',e=>{
  e.waitUntil((async()=>{const c=await caches.open(CACHE);
    await Promise.all(CORE.concat(CDN).map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})));
    await self.skipWaiting()})());
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==CACHE)await caches.delete(k);await self.clients.claim()})());
});

const isApp=url=>url.origin===location.origin&&(/\/$/.test(url.pathname)||/\/index\.html$/.test(url.pathname));
const cachable=url=>url.origin===location.origin||url.hostname==='cdn.jsdelivr.net'||url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com';

// a found update is remembered (pages that open later ask for it), and cleared once a page gets the new copy
const FLAG='__update-ready';
async function notifyUpdate(){const c=await caches.open(CACHE);await c.put(FLAG,new Response('1'));for(const w of await self.clients.matchAll({type:'window'}))w.postMessage({type:'update'})}
self.addEventListener('message',e=>{if(!e.data||e.data.type!=='hello')return;
  e.waitUntil((async()=>{const c=await caches.open(CACHE),f=await c.match(FLAG);if(f&&e.source)e.source.postMessage({type:'update'})})())});

self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(!cachable(url))return;
  // the app page: one cache key for "./" and "index.html", ignoring ?query and #hash
  const key=req.mode==='navigate'||isApp(url)?new URL('./',self.registration.scope).href:req;
  e.respondWith((async()=>{
    const c=await caches.open(CACHE),hit=await c.match(key,{ignoreSearch:req.mode==='navigate'||isApp(url)});
    const appKey=key===new URL('./',self.registration.scope).href;
    // read the cached app page before handing it to the browser, to compare it with the one on the web
    const hitText=hit&&appKey?await hit.clone().text().catch(()=>null):null;
    const fresh=fetch(req.mode==='navigate'?new Request(new URL('./',self.registration.scope).href,{cache:'no-cache'}):req).then(async res=>{
      if(res&&(res.ok||res.type==='opaque')){
        let changed=false;if(hitText!=null&&res.ok){try{changed=(await res.clone().text())!==hitText}catch(_){}}
        await c.put(key,res.clone());if(changed)await notifyUpdate()}
      return res}).catch(()=>null);
    // a page opened after an update was found already gets the new copy, so the notice is no longer needed
    if(hit&&req.mode==='navigate')await c.delete(FLAG);
    if(hit){e.waitUntil(fresh);return hit}
    const res=await fresh;if(res)return res;
    if(req.mode==='navigate'){const any=await c.match(new URL('./',self.registration.scope).href);if(any)return any}
    return new Response('',{status:504,statusText:'Offline'});
  })());
});
