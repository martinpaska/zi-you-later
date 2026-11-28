// Czech: what the page shows is translated. The app is written in English and translated on screen (js/strings-cs.js, js/i18n.js),
// so a new text that nobody added to the dictionary is shown in English. These tests catch the likely misses.
const assert=require('node:assert/strict');
const {open,known}=require('../lib/app');

module.exports=[
['What\'s new: every title, summary, place and item has a Czech text',async t=>{
  const a=await open(t,{lang:'cs'});
  try{const miss=await a.page.evaluate(()=>NEWS.flatMap(x=>[x.t,x.what,x.where,...x.items]).filter(Boolean).filter(s=>T(s)==null));
    assert.deepEqual(miss,[],'not translated:\n'+miss.join('\n'));assert.deepEqual(a.errors,[])}finally{await a.close()}
}],
['the course, mode and story texts of both courses have a Czech text',async t=>{
  for(const pack of ['cin1','hsk1','hsk2','hsk3']){
    const a=await open(t,{pack,lang:'cs'});
    try{const miss=await a.page.evaluate(()=>{
        const s=[...PACKS.flatMap(p=>[p.n,p.d]),...Object.values(MODEINFO).flatMap(i=>[i.n,i.d]),PATH.story,PATH.intro,PATH.goal.t,PATH.goal.d,PATH.goal.b,...SEAL_CHAPTERS.flatMap(([n,,st])=>[n,st]),...Object.values(LTITLE)];
        return s.filter(Boolean).filter(x=>!/[㐀-鿿]/.test(x)&&!/^HSK \d$/.test(x)&&x!=='Integrated Chinese 1/1 · FF MUNI'&&T(x)==null)});   // (names stay as they are)
      assert.deepEqual(miss,[],pack+' not translated:\n'+miss.join('\n'))}finally{await a.close()}}
}],
['Czech screens show no English interface text (Home, Your path, a lesson, Settings)',async t=>{
  const leftovers=/\b(Continue|Settings|Close|Reminders?|Your path|Chapter \d|You are here|Older news|Completed|Lessons?|seals?|Final test|Flashcards|Grammar|Sentences|Writing|Vocabulary)\b/;
  for(const pack of ['hsk1','cin1','hsk2','hsk3']){
    const a=await open(t,{pack,lang:'cs',srs:known([],0)});
    try{const shots={};
      shots.home=await a.text('#home');
      await a.page.evaluate(()=>album());shots.path=await a.text('#mode');
      await a.page.evaluate(()=>lessonSheet(LESSONS[1]));shots.lesson=await a.text('.nsheet');await a.page.keyboard.press('Escape');
      await a.page.evaluate(()=>{goHome();settings()});shots.settings=await a.text('#mode');
      for(const [name,txt] of Object.entries(shots)){const m=txt.match(leftovers);assert.ok(!m,`${pack} ${name} shows English: "${m&&m[0]}" in …${txt.slice(Math.max(0,txt.search(leftovers)-40),txt.search(leftovers)+40)}…`)}
      assert.deepEqual(a.errors,[])}finally{await a.close()}}
}],
['plurals and texts with numbers in Czech: 1 kartička, 3 kartičky, 7 kartiček, lessons, chapters, progress',async t=>{
  const a=await open(t,{lang:'cs'});
  try{const r=await a.page.evaluate(()=>['1 cards to review today','3 cards to review today','7 cards to review today','Continue: Lesson 3','Continue: Intro','19% done','Chapter 2','Next: Lesson 4 ›','Final test · Lesson 15'].map(x=>T(x)));
    assert.deepEqual(r,['Dnes tě čeká 1 kartička','Dnes tě čeká 3 kartičky','Dnes tě čeká 7 kartiček','Pokračuj: Lekce 3','Pokračuj: Úvod','Splněno 19 %','Kapitola 2','Další: Lekce 4 ›','Finální test · Lekce 15'])}finally{await a.close()}
}],
['switching to English shows English; no Czech leftovers on Home',async t=>{
  const a=await open(t,{pack:'hsk1',lang:'en'});
  try{const txt=await a.text('#home'),cz=txt.match(/\b(Tvoje cesta|Pokračuj|Cvičení|Kartičky|Nastavení|Zavřít|Slovíčka|Kapitola|Vytvořit účet|Co chceš dělat)\b/);
    assert.ok(!cz,'Czech on the English Home: '+(cz&&cz[0]));assert.match(txt,/Your path/);assert.match(txt,/What do you want to do/);assert.deepEqual(a.errors,[])}finally{await a.close()}
}],
['privacy: opens from the landing page, About, Home and the sign-up form, in Czech and in English, and Back returns there',async t=>{
  const a=await open(t,{lang:'cs',welcome:true});
  try{const p=a.page;
    await p.click('#welcome .wlegal [data-privacy]');await p.waitForSelector('#privacy');
    const shown=async()=>(await p.innerText('#mode')).replace(/\s+/g,' ');   // only what is visible (the other language is hidden)
    let txt=await shown();
    for(const re of [/Soukromí/,/localStorage/,/Supabase/,/Google Fonts/,/jsDelivr/,/Smazat účet/,/Admin/])assert.match(txt,re);
    assert.match(txt,/zatím neověřený/,'with no region set, the page says it is not verified');
    assert.ok(!/@/.test(txt),'no email address while CONTACT_EMAIL is empty');
    assert.ok(!/Who sees what/.test(txt),'the English text is hidden in Czech');
    await p.click('#mode .bar .back');assert.equal(await p.isVisible('#welcome'),true,'Back returns to the landing page');
    await p.evaluate(()=>{location.hash='about'});await p.waitForSelector('#aboutpage:not([hidden])');
    await p.click('#aboutpage [data-lang="cs"] [data-privacy]');await p.waitForSelector('#privacy');await p.click('#mode .bar .back');
    assert.equal(await p.isVisible('#aboutpage'),true,'Back returns to About');
    await p.evaluate(()=>{history.replaceState(null,'',location.pathname);closeAbout();goHome()});
    await p.click('#home footer [data-privacy]');await p.waitForSelector('#privacy');await p.click('#mode .bar .back');assert.equal(await p.isVisible('#home'),true);
    await p.evaluate(()=>{setLang('en');authForm('up')});await p.click('#mode [data-privacy]');await p.waitForSelector('#privacy');
    txt=await shown();assert.match(txt,/Who sees what/);assert.match(txt,/not verified yet/);assert.ok(!/Soukromí/.test(txt));
    await p.click('#mode .bar .back');assert.ok(await p.$('#af'),'Back returns to the sign-up form');
    assert.deepEqual(a.errors,[])}finally{await a.close()}
}],
['Report a problem: hidden without a contact email; with one, the footers and exercise screens have it and the email says what was on screen',async t=>{
  const a=await open(t,{lang:'cs',welcome:true});
  try{const p=a.page;
    assert.equal(await p.evaluate(()=>[...document.querySelectorAll('[data-report]')].some(e=>e.getClientRects().length)),false,'no visible report link');
    await p.evaluate(()=>{goHome();setup('cards')});assert.equal(await p.$('#mode .mreport'),null);
    // the same app with a contact email and the region filled in
    await p.route('**/js/account.js',async r=>{const res=await r.fetch();r.fulfill({response:res,body:(await res.text()).replace("const CONTACT_EMAIL='';","const CONTACT_EMAIL='bugs@example.com';").replace("const SUPABASE_REGION='';","const SUPABASE_REGION='EU (Frankfurt)';")})});
    await p.reload();await p.waitForFunction(()=>typeof renderHome==='function'&&document.readyState==='complete');
    assert.equal(await p.evaluate(()=>CONTACT_ON),true);
    await p.evaluate(()=>welcome());assert.equal(await p.isVisible('#welcome .wlegal [data-report]'),true);
    await p.evaluate(()=>goHome());assert.equal(await p.isVisible('#home footer [data-report]'),true);
    assert.equal(await a.text('#home footer [data-report]'),'Nahlásit chybu');
    await p.click('#home [data-mode="cards"]');await p.click('#sgo');await p.waitForSelector('#mode .mreport [data-report]');
    assert.equal(await a.text('#mode .mreport'),'Nahlásit chybu na téhle obrazovce');
    const href=decodeURIComponent(await p.evaluate(()=>reportHref()));
    assert.match(href,/^mailto:bugs@example\.com\?subject=Zì You Later: chyba/);
    assert.match(href,/Kurz: Čínština 1/);assert.match(href,/Obrazovka: Kartičky/);assert.match(href,/Lekce: Lekce 1, Lekce 2/);assert.match(href,/Položka: [^\n]*[㐀-鿿]/);
    await p.evaluate(()=>privacy());const txt=await a.text('#mode');assert.match(txt,/bugs@example\.com/);assert.match(txt,/EU \(Frankfurt\)/);
    assert.equal(await p.$('#mode .mreport'),null,'not on the privacy page itself');
    assert.deepEqual(a.errors,[])}finally{await a.close()}
}],
['iPhone: Home says once how to add the app to the Home Screen; closing it is for good, and it is not shown when installed or elsewhere',async t=>{
  const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1';
  const ios=standalone=>new Function(`Object.defineProperty(Navigator.prototype,'userAgent',{get:()=>${JSON.stringify(UA)}});Object.defineProperty(Navigator.prototype,'standalone',{get:()=>${standalone}})`);
  let a=await open(t,{lang:'cs',init:ios(false)});
  try{const p=a.page;assert.equal(await p.isVisible('#ioshint .ioshint'),true,'shown on an iPhone in Safari');
    const txt=await a.text('#ioshint');assert.match(txt,/Přidej si ji na plochu/);assert.match(txt,/připomínky/);
    await p.click('#iosx');assert.equal(await p.$('#ioshint .ioshint'),null);
    await p.evaluate(()=>renderHome());assert.equal(await p.$('#ioshint .ioshint'),null,'closed for good');
    // shown on one day only: on a later day it does not come back
    await p.evaluate(()=>{store.set('ic-ioshint',{day:'2000-01-01'});renderHome()});assert.equal(await p.$('#ioshint .ioshint'),null);
    assert.deepEqual(a.errors,[])}finally{await a.close()}
  a=await open(t,{lang:'cs',init:ios(true)});
  try{assert.equal(await a.page.$('#ioshint .ioshint'),null,'not when running from the Home Screen')}finally{await a.close()}
  a=await open(t,{lang:'cs'});
  try{assert.equal(await a.page.$('#ioshint .ioshint'),null,'not in a desktop browser')}finally{await a.close()}
}],
['the new texts (privacy, report, Home Screen hint) have Czech',async t=>{
  const a=await open(t,{lang:'cs'});
  try{const miss=await a.page.evaluate(()=>['Privacy','Report a problem','Report a problem on this screen','What is stored and who can see it:','Add it to your Home Screen','Home',
      'In Safari, tap Share (the square with an arrow), then Add to Home Screen. The app then opens like any other, full screen. On an iPhone, reminders only work this way.'].filter(s=>T(s)==null));
    assert.deepEqual(miss,[],'not translated:\n'+miss.join('\n'));
    assert.equal(await a.text('#home footer [data-privacy]'),'Soukromí');
    await a.page.evaluate(()=>authForm('up'));assert.match(await a.text('#mode'),/Co se ukládá a kdo to vidí: Soukromí/);assert.deepEqual(a.errors,[])}finally{await a.close()}
}]];
