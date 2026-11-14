// opening the app in a headless browser, in a known state, and collecting every error it raises
const fs=require('fs'),path=require('path'),{ROOT}=require('./server');
const NEWS_ID=(fs.readFileSync(path.join(ROOT,'js','news.js'),'utf8').match(/id:'([^']+)'/)||[])[1];   // the newest What's new entry
const HW=path.join(ROOT,'node_modules','hanzi-writer','dist','hanzi-writer.min.js');

/* opts: pack ('cin1' | 'hsk1'), lang ('cs' | 'en'), state (merged into ic-state), srs, stats, welcome (true: show the first-visit page),
   permissions, width, sw (true: let the service worker run), reducedMotion, init (a function run in the page before the app) */
async function open(t,opts={}){
  const {pack='cin1',lang='cs',state={},srs,stats,welcome=false,permissions=[],width=390,sw=false,reducedMotion=false,init}=opts;
  const ctx=await t.browser.newContext({viewport:{width,height:844},deviceScaleFactor:1,permissions,hasTouch:width<600,serviceWorkers:sw?'allow':'block',reducedMotion:reducedMotion?'reduce':'no-preference'});
  const errors=[];
  const page=await ctx.newPage();
  page.on('pageerror',e=>errors.push('pageerror: '+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR/.test(m.text()))errors.push('console.error: '+m.text())});
  // only the app itself is real; fonts and the CDN are answered locally so the tests also run offline
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>{const u=r.request().url();
    if(/hanzi-writer/.test(u)&&fs.existsSync(HW))return r.fulfill({contentType:'application/javascript',body:fs.readFileSync(HW)});
    if(/fonts\.googleapis/.test(u))return r.fulfill({contentType:'text/css',body:''});
    return r.abort()});
  await ctx.addInitScript(({pack,lang,state,srs,stats,welcome,newsId})=>{
    if(sessionStorage.getItem('__seeded'))return;sessionStorage.setItem('__seeded','1');
    try{if(!welcome){localStorage.setItem('ic-welcomed','true');localStorage.setItem('ic-news',JSON.stringify(newsId))}
      localStorage.setItem('ic-state',JSON.stringify({pack,...state}));localStorage.setItem('ic-lang',JSON.stringify(lang));
      if(srs)localStorage.setItem('ic-srs',JSON.stringify(srs));if(stats)localStorage.setItem('ic-stats',JSON.stringify(stats))}catch(e){}
  },{pack,lang,state,srs,stats,welcome,newsId:NEWS_ID});
  if(init)await ctx.addInitScript(init);
  await page.goto(t.base+'/index.html');await page.waitForFunction(()=>typeof renderHome==='function'&&document.readyState==='complete');await page.waitForTimeout(250);
  return {page,ctx,errors,close:()=>ctx.close(),text:async sel=>((await page.textContent(sel))||'').replace(/\s+/g,' ').trim()};
}
// SRS records for the first n characters of a lesson: due (past) or learnt (far in the future)
const MS=864e5;
const known=(chars,days=30)=>Object.fromEntries(chars.map(c=>['c:'+c[1]+'|'+c[3],{e:2.5,i:10,n:3,lp:0,d:Date.now()+days*MS}]));
module.exports={open,known,NEWS_ID};
