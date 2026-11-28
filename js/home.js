/* home */
function dueAll(){return ALLITEMS.filter(isDue)}
function newAvail(){rollDay();const left=Math.max(0,state.newPerDay+(stats.extra||0)-stats.nw);return basePool().filter(x=>!seen(x)).slice(0,left)}
function renderHome(){
  { const r=resAll(),ms=Object.keys(RES_MODES).filter(m=>r[m]).sort((a,b)=>r[b].t-r[a].t);
    $('resume').innerHTML=ms.length?`<h2>Continue where you left off</h2>${ms.map(m=>{const x=r[m],ls=x.sel.length===LESSONS.length?'All lessons':x.sel.length===1?LNAME(x.sel[0]):x.sel.length+' lessons';
      return `<div class="resi"><button class="resgo" data-rm="${m}"><b>${RES_MODES[m]}</b><span><span>${esc(x.pos)}</span> · <span>${ls}</span>${x.filter==='star'?' · ★':''}</span><i aria-hidden="true">›</i></button><button class="resx" data-rx="${m}" aria-label="Discard">✕</button></div>`}).join('')}`:'';
    $('resume').querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>resume(b.dataset.rm));
    $('resume').querySelectorAll('[data-rx]').forEach(b=>b.onclick=()=>{resClear(b.dataset.rx);renderHome()}); }
  document.body.classList.toggle('trad',state.script==='t');
  applyTc();applyTheme();
  const noun=state.set==='w'?'words':'characters';
  const known=ALLITEMS.filter(x=>mastery(x)===2).length,due=dueAll().length,nw=newAvail().length;
  const fresh=!stats.total&&!known&&!due;
  /* first visit: no wall of zeros, just what the first session is */
  $('today').innerHTML=fresh?`<p class="firstrun">Your first session: ${nw} new ${noun}, about ${Math.max(2,Math.round(nw/3))} minutes. Each one is introduced first, then you are tested on it.</p>`:`<div class="stat"><b>${due}</b><span>due for review</span></div><div class="stat"><b>${nw}</b><span>new today</span></div><button class="stat statlink" data-go="progress"><b>${known}</b><span>items known ›</span></button>`;
  const st=stats.last===todayStr()||stats.last===todayStr(new Date(Date.now()-DAY))?stats.streak:0,doneToday=stats.last===todayStr();
  $('streak').className='streak'+(st?'':' off');streakVis();
  $('streak').innerHTML=`<span class="fl" aria-hidden="true">🔥</span>${st}`;$('streak').title=$('streak').ariaLabel=`${st} day streak${doneToday?', studied today':''}`;
  const tot=due+nw;$('goReview').disabled=!tot;{const cd=document.getElementById('calday');if(cd)cd.textContent=new Date().getDate()}
  $('goReview').innerHTML=`<span><b>${fresh&&tot?'Start your first session':tot?'Start today\'s review':'All done for today'}</b><span>${tot?`${due} due · ${nw} new ${noun}`:'Come back tomorrow, or pick something to do below.'}</span></span><span class="go">›</span>`;
  const ls=[...state.sel].sort((a,b)=>LESSONS.indexOf(a)-LESSONS.indexOf(b));
  $('herolx').innerHTML=`New cards come from ${ls.length?ls.map(l=>l==='I'?'Intro':'L'+l).join(', '):'no lessons'} · ${noun} <button class="link" id="chl">Change</button>`;
  $('chl').onclick=()=>setup('review');
  nudgeHome();iosHint();packHome();pathHome();
}
$('goReview').onclick=()=>review();
/* modes that need content a pack does not have are hidden there (HSK: no chapter tests and no FF MUNI courses, so its Courses group is hidden;
   HSK 2 and 3 have no practice test yet, as there is no official sample test of the new format for them) */
const PACK_HIDE={cin1:['hsktest','learn','album'],hsk1:['test','gram1','pinyin','album','learn'],hsk2:['test','gram1','pinyin','album','learn','hsktest'],hsk3:['test','gram1','pinyin','album','learn','hsktest']};   // the seals are on Home (Your path) in both courses
function packHome(){const P=PACKS.find(x=>x.id===PACK);if($('packname'))$('packname').textContent=P.s;   // plain text: the page translator turns it into Czech (T_ is not ready on the first render)
  document.querySelectorAll('#home [data-mode]').forEach(b=>{if((PACK_HIDE[PACK]||[]).includes(b.dataset.mode))b.hidden=true});
  document.querySelectorAll('#home .mgroup').forEach(g=>{g.hidden=![...g.querySelectorAll('[data-mode]')].some(b=>!b.hidden)})}
$('packbtn').onclick=()=>packSheet();
function packSheet(){
  // a pack that is not loaded (HSK 2 and up, unless chosen) shows its size from PACKS, without the progress bar
  const dataOf=x=>x==='cin1'?DATA_CIN1:PACK_DATA[x]||null;
  const items=d=>[...d.ch,...d.wd].map(r=>r.length===7?'c:'+r[1]+'|'+r[3]:'w:'+r[1]+'|'+r[2]);
  const known=k=>{const r=srs[k];return r&&r.n&&r.i>=7};
  const saved=keyHandler,sh=document.createElement('div');sh.className='nsheet';
  sh.innerHTML=`<div class="npanel" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="pkt" style="height:auto;max-height:92svh"><div class="nhead"><span class="ngrab" aria-hidden="true"></span>
    <button class="nclose" id="pkx" type="button">${T_('Close')}</button><h2 id="pkt">${T_('Course')}</h2><span></span></div>
    <div class="nbody">${PACKS.map(P=>{const d=dataOf(P.id),ks=d?[...new Set(items(d))]:[],k=ks.filter(known).length;
      return `<button class="pkcard${P.id===PACK?' on':''}" data-pack="${P.id}" type="button"><span class="pkzh" lang="zh-Hans">${P.zh}</span><span class="pkt"><b>${esc(T_(P.n))}</b><small>${esc(T_(P.d))}</small>
        <small class="pkn">${esc(T_(d?`${new Set(d.ch.map(r=>r[2])).size} characters · ${d.wd.length} words · ${d.meta?d.meta.lessons.length:11} lessons`:`${P.c[0]} characters · ${P.c[1]} words · ${P.c[2]} lessons`))}</small>
        ${d?`<span class="mbar"><i class="m2" style="width:${ks.length?k/ks.length*100:0}%"></i></span><small>${esc(T_(`${k} of ${ks.length} known`))}</small>`:''}</span>${P.id===PACK?`<span class="pkon">✓</span>`:''}</button>`}).join('')}
      <p class="hint" style="margin:4px 4px 0">${T_('What you know counts in every course: a character or word you learnt in one is known in the others too.')}</p></div></div>`;
  document.body.appendChild(sh);document.body.style.overflow='hidden';sheetFocus(sh);
  const close=()=>{sh.remove();document.body.style.overflow='';keyHandler=saved};
  sh.onclick=e=>{if(e.target===sh)close();const b=e.target.closest('[data-pack]');if(!b)return;
    if(b.dataset.pack===PACK)return close();state.pack=b.dataset.pack;saveState();store.set('ic-state',{...store.get('ic-state',{}),pack:b.dataset.pack});location.reload()};
  $('pkx').onclick=close;keyHandler=e=>{if(e.key==='Escape'){e.preventDefault();close()}};
}

function applyTheme(){const t=state.theme||'auto',dark=t==='dark'||(t==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme=dark?'dark':'light';const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=dark?'#141111':'#d72323'}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if((state.theme||'auto')==='auto')applyTheme()});
function applyTc(){document.body.classList.toggle('tc-classic',state.tc==='classic');document.body.classList.toggle('tc-off',state.tc==='off')}
