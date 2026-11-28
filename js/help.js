/* ---------- Privacy, "Report a problem" and the "Add to Home Screen" hint for iPhone ----------
   CONTACT_EMAIL and SUPABASE_REGION are set at the top of js/account.js. With no contact email the report links stay hidden. */
const CONTACT_ON=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CONTACT_EMAIL);
document.documentElement.classList.toggle('noreport',!CONTACT_ON);

/* the privacy page: written from what the code does (js/account.js, js/admin.js, supabase/*.sql, sw.js). Both languages are
   here in full (data-lang), like About, because it is prose and should be read as a whole. */
function privacyHtml(){
  const mail=CONTACT_ON?`<a href="mailto:${esc(CONTACT_EMAIL)}">${esc(CONTACT_EMAIL)}</a>`:'';
  const gh='<a href="https://github.com/martinpaska/zi-you-later" target="_blank" rel="noopener">GitHub</a>';
  const reg=SUPABASE_REGION?esc(SUPABASE_REGION):'';
  return `<div data-lang="cs">
    <h2>Soukromí</h2>
    <p class="wlead">Co aplikace ukládá, kde to je a kdo to vidí. Bez právničiny, jen to, co kód opravdu dělá.</p>
    <h3>Bez účtu: všechno zůstává v prohlížeči</h3>
    <p>Tvůj postup (opakování, hvězdičky, statistiky, výsledky testů), nastavení, vybrané lekce a jazyk jsou jen v úložišti tohohle prohlížeče (localStorage). Nikam se neposílají. Když vymažeš data webu v prohlížeči, zmizí.</p>
    <p>Když zapneš připomínky, nechá si aplikace v prohlížeči poznámku, kdy ti budou kartičky k opakování a kdy ses naposledy učil(a). I ta zůstává v zařízení.</p>
    <h3>Anonymní počty</h3>
    <p>Jednou denně zařízení pošle do databáze „dnes jsem tu byl“ a které režimy otevřelo. Ukládají se jen denní součty (kolik zařízení s účtem a kolik bez), bez jména, ID nebo IP adresy.</p>
    <h3>S účtem</h3>
    <p>Účet je dobrovolný. Když si ho založíš, uloží se v databázi Supabase:</p>
    <ul><li>tvůj e-mail a heslo (heslo spravuje Supabase, aplikace ho nevidí), kdy účet vznikl a kdy ses naposledy přihlásil(a);</li>
      <li>veřejný profil do žebříčku: přezdívka, avatar, kolik toho umíš a učíš se, série dní, kartičky za týden a celkem;</li>
      <li>tvůj postup a nastavení, aby byly na všech tvých zařízeních.</li></ul>
    <p>Přihlášení si prohlížeč pamatuje v localStorage.</p>
    <h3>Kdo co vidí</h3>
    <ul><li><b>Kdokoli</b>, i bez účtu: žebříček, tedy jen veřejný profil. E-mail tam není.</li>
      <li><b>Jen ty</b>: svůj postup. Hlídají to pravidla přímo v databázi.</li>
      <li><b>Admin</b> (autor aplikace): na admin stránce vidí e-maily účtů, kdy vznikly a kdy byly naposledy aktivní, profily, vybrané lekce, výsledky zkušebních testů a anonymní počty. Jako správce projektu v Supabase má přístup ke všem datům v databázi.</li></ul>
    <h3>Kam se posílají data</h3>
    <ul><li><b>Supabase</b>: databáze a přihlašování. Region serveru: ${reg||'zatím neověřený (EU, nebo USA), autor ho doplní'}. Supabase si může vést technické záznamy, třeba IP adresy, podle svých podmínek.</li>
      <li><b>GitHub Pages</b>: odtud se načítá samotná stránka.</li>
      <li><b>Google Fonts</b> (písma) a <b>jsDelivr</b> (knihovny pro psaní znaků a pro účty): prohlížeč si od nich stahuje soubory, takže vidí tvou IP adresu.</li>
      <li><b>Hlas</b>: čínštinu čte hlas tvého zařízení. Některé hlasy jsou online (třeba „Natural“ v Edge nebo hlasy Google v Chromu) a čtený text pak jde výrobci prohlížeče.</li></ul>
    <p>Žádné reklamy ani sledovací nástroje.</p>
    <h3>Smazání účtu</h3>
    <p><button class="link" data-go="account">Účet</button> → Smazat účet. Smaže se najednou účet, e-mail, profil v žebříčku i postup uložený v databázi. Postup v tomhle prohlížeči zůstane; smažeš ho v <button class="link" data-go="settings">Nastavení</button> (Smazat postup) nebo vymazáním dat webu. Anonymní denní součty s tebou spojené nejsou, ty zůstanou.</p>
    <h3>Kontakt</h3>
    <p>${mail?`Otázky, opravy nebo žádost o smazání: ${mail}.`:`Otázky nebo žádost o smazání: napiš autorovi, Martinu Paškovi, přes ${gh}.`}</p>
    <p class="hint">Tohle není právní dokument, jen poctivý popis. Neoficiální projekt, nejde o aplikaci Masarykovy univerzity.</p>
  </div>
  <div data-lang="en">
    <h2>Privacy</h2>
    <p class="wlead">What the app stores, where it is and who can see it. No legalese, just what the code actually does.</p>
    <h3>Without an account: everything stays in your browser</h3>
    <p>Your progress (reviews, stars, stats, test results), settings, chosen lessons and language live only in this browser's storage (localStorage). They are not sent anywhere. Clearing the site's data in your browser removes them.</p>
    <p>If you turn reminders on, the app leaves itself a note in the browser: when your cards are due and the last day you studied. That note stays on the device too.</p>
    <h3>Anonymous counts</h3>
    <p>Once a day a device tells the database "I was here today" and which modes it opened. Only daily totals are kept (how many devices with an account and how many without), with no name, ID or IP address.</p>
    <h3>With an account</h3>
    <p>An account is optional. If you create one, the Supabase database stores:</p>
    <ul><li>your email and password (Supabase handles the password; the app never sees it), when the account was created and when you last signed in;</li>
      <li>a public profile for the leaderboard: nickname, avatar, how many items you know and are learning, your streak, cards this week and in total;</li>
      <li>your progress and settings, so they are on all your devices.</li></ul>
    <p>Your browser remembers that you are signed in, in localStorage.</p>
    <h3>Who sees what</h3>
    <ul><li><b>Anyone</b>, even without an account: the leaderboard, which is only the public profile. Your email is not on it.</li>
      <li><b>Only you</b>: your progress. Rules in the database itself enforce this.</li>
      <li><b>The admin</b> (the app's author): the admin page shows account emails, when accounts were created and last active, profiles, chosen lessons, practice test results and the anonymous counts. As the owner of the Supabase project, the admin can access all data in the database.</li></ul>
    <h3>Where data goes</h3>
    <ul><li><b>Supabase</b>: the database and sign-in. Server region: ${reg||'not verified yet (EU or US); the author will add it'}. Supabase may keep technical logs, such as IP addresses, under its own terms.</li>
      <li><b>GitHub Pages</b>: serves the page itself.</li>
      <li><b>Google Fonts</b> (fonts) and <b>jsDelivr</b> (the libraries for writing characters and for accounts): your browser downloads files from them, so they see your IP address.</li>
      <li><b>Voice</b>: Chinese is read by your device's voice. Some voices are online (for example "Natural" voices in Edge or Google voices in Chrome), and then the text being read goes to the browser's maker.</li></ul>
    <p>No ads and no tracking tools.</p>
    <h3>Deleting your account</h3>
    <p><button class="link" data-go="account">Account</button> → Delete account. It deletes the account, your email, your leaderboard profile and the progress saved in the database, all at once. Progress in this browser stays; remove it in <button class="link" data-go="settings">Settings</button> (Reset progress) or by clearing the site's data. The anonymous daily totals are not linked to you, so they stay.</p>
    <h3>Contact</h3>
    <p>${mail?`Questions, corrections or a deletion request: ${mail}.`:`Questions or a deletion request: write to the author, Martin Paška, on ${gh}.`}</p>
    <p class="hint">This is not a legal document, just an honest description. An unofficial project, not an app of Masaryk University.</p>
  </div>`;
}
/* opened from the landing page, About, Home's footer and the sign-up form; Back returns there */
function privacy(){
  const from=!$('aboutpage').hidden?'about':!$('welcome').hidden?'welcome':!M().hidden&&M().querySelector('#af [autocomplete="new-password"]')?'signup':!M().hidden&&$('am')&&$('nick')?'account':'home';
  open(bar(0,'','‹ Back')+`<section class="wabout privacy" id="privacy">${privacyHtml()}</section>`);
  const b=M().querySelector('.bar .back');b.removeAttribute('data-home');
  b.onclick=()=>{if(location.hash==='#privacy')history.replaceState(null,'',location.pathname+location.search);
    if(from==='about'){const p=aboutPrev;showAbout();aboutPrev=p}else if(from==='welcome')welcome();else if(from==='signup')authForm('up');else if(from==='account')account();else goHome()};
}
window.addEventListener('hashchange',()=>{if(location.hash==='#privacy')privacy()});
if(location.hash==='#privacy')setTimeout(privacy,0);

/* "Report a problem": an email to CONTACT_EMAIL with what was on the screen (course, screen, lessons, the item shown),
   so a wrong tone or a typo can be found. The person sees the whole text in their mail app before sending. */
let reportMode='';
document.addEventListener('click',e=>{const m=e.target.closest('[data-mode],[data-go]');if(m)reportMode=m.dataset.mode||m.dataset.go},true);
function reportInfo(){
  const cs=LANG==='cs',tx=s=>cs?(T(s)??s):s,clip=s=>String(s||'').replace(/\s+/g,' ').trim().slice(0,120);
  const pk=PACKS.find(p=>p.id===PACK),onMode=!M().hidden;
  const screen=onMode?[reportMode&&MODEINFO[reportMode]?tx(MODEINFO[reportMode].n):reportMode,clip((M().querySelector('h2')||{}).textContent)].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join(' · ')
    :!$('aboutpage').hidden?tx('About'):!$('welcome').hidden?tx('Intro screen'):tx('Home');
  const lessons=[...state.sel].sort((a,b)=>LESSONS.indexOf(a)-LESSONS.indexOf(b)).map(l=>tx(LNAME(l))).join(', ');
  let item='';
  if(onMode){const vis=el=>el&&el.getClientRects().length&&!el.closest('.rstamp,.wseal,.seal,[aria-hidden="true"]');
    const zh=[...M().querySelectorAll('.big,.wordbig,.examzh,.zh,.han,[lang="zh-Hans"],[lang="zh-Hant"]')].find(el=>vis(el)&&isHan(el.textContent||''));
    const py=[...M().querySelectorAll('.py')].find(vis),en=[...M().querySelectorAll('.meaning,.gen,.en')].find(vis);
    item=[zh,py,en].map(el=>el?clip(el.textContent):'').filter(Boolean).join(' · ');
    const n=M().querySelector('.bar .count');if(n&&clip(n.textContent))item+=(item?' ':'')+'('+clip(n.textContent)+')'}
  return {course:pk?tx(pk.n):PACK,screen,lessons,item};
}
function reportHref(){
  const cs=LANG==='cs',i=reportInfo();
  const body=(cs?'Co je špatně:\n\n\n---\n':'What is wrong:\n\n\n---\n')+[
    [cs?'Kurz':'Course',i.course],[cs?'Obrazovka':'Screen',i.screen],[cs?'Lekce':'Lessons',i.lessons],[cs?'Položka':'Item',i.item],
    [cs?'Jazyk':'Language',LANG],[cs?'Zařízení':'Device',navigator.userAgent]].filter(r=>r[1]).map(r=>r[0]+': '+r[1]).join('\n');
  return 'mailto:'+CONTACT_EMAIL+'?subject='+encodeURIComponent('Zì You Later: '+(cs?'chyba':'problem')+(i.item?' · '+i.item.slice(0,40):''))+'&body='+encodeURIComponent(body);
}
document.addEventListener('click',e=>{
  if(e.target.closest('[data-privacy]')){e.preventDefault();privacy();return}
  if(e.target.closest('[data-report]')&&CONTACT_ON){e.preventDefault();location.href=reportHref()}});
// a small "Report a problem" line at the foot of every screen that opens over Home (exercises, lists, settings)
if(CONTACT_ON)new MutationObserver(()=>{const m=M();if(m.hidden||!m.querySelector('.bar')||m.querySelector('.mreport,.adm,#privacy'))return;
  m.insertAdjacentHTML('beforeend','<p class="mreport"><button class="link" type="button" data-report>Report a problem on this screen</button></p>')}).observe(M(),{childList:true});

/* iPhone and iPad: Safari has no install prompt, so say once how to add the app to the Home Screen.
   Reminders on an iPhone only work from there. Not shown when the app already runs from the Home Screen. */
const IOS_SAFARI=IOS/* js/speech.js */&&/Safari/.test(navigator.userAgent)&&!/CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(navigator.userAgent);
const STANDALONE=()=>navigator.standalone===true||matchMedia('(display-mode: standalone)').matches;
const IOS_ICON='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';
function iosHint(){
  const box=$('ioshint');if(!box)return;const s=store.get('ic-ioshint',null),t=todayStr();
  // shown on one day only (the first time Home opens on an iPhone), or until it is closed that day
  if(!IOS_SAFARI||STANDALONE()||(s&&(s.x||s.day!==t))){box.innerHTML='';return}
  if(!s)store.set('ic-ioshint',{day:t});
  box.innerHTML=`<section class="nudge ioshint" aria-labelledby="ioh"><div class="nutop"><span class="nuic">${IOS_ICON}</span><div><h2 id="ioh">Add it to your Home Screen</h2>
      <p class="nusum">In Safari, tap Share (the square with an arrow), then Add to Home Screen. The app then opens like any other, full screen. On an iPhone, reminders only work this way.</p></div>
      <button class="nux" id="iosx" type="button" aria-label="Close">×</button></div></section>`;
  $('iosx').onclick=()=>{store.set('ic-ioshint',{day:t,x:1});box.innerHTML=''};
}
