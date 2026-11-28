/* ---------- Step screen: pick what to practise, then which lessons ---------- */
const MODEINFO={
  review:{ic:'复',n:'Today\'s review',d:'Spaced repetition: due cards plus new ones from these lessons.',set:true,start:'Start the review'},
  cards:{ic:'卡',n:'Flashcards',d:'Flip, listen, sort into Know and Still learning.',set:true,filter:true},
  learn:{ic:'学',n:'Learn',d:'Meet each new item: what it is built from, how to remember it and its stroke order. Then rounds of questions bring back mistakes until you get them.',set:true,filter:true},
  sentences:{ic:'句',n:'Sentences',d:HSK?{hsk1:'Sentences for each lesson that use only HSK 1 words.',hsk2:'Sentences for each lesson that use only HSK 1 and 2 words.',hsk3:'Sentences for each lesson that use only HSK 1–3 words.'}[PACK]:'Example sentences that use only vocabulary up to each lesson.',sent:true},
  write:{ic:'写',n:'Writing',d:'Stroke order, tracing and writing from memory.',set:true,filter:true},
  match:{ic:'配',n:'Match',d:'Pair Chinese with meanings against the clock.',set:true,filter:true},
  tones:{ic:'调',n:'Tone trainer',d:'Hear a character without seeing it and pick its tone. Then tone pairs in two-syllable words.'},
  twins:{ic:'声',n:'Tones in words',d:'Add the tone to every syllable of a word. Or practise tone twins.',tasks:true},
  test:{ic:'考',n:'Test',d:'A chapter test with listening, reading, pinyin and writing sections.'}
};
const TTASKS=[['fill','Fill in the tones','Words without tone marks: give each syllable its tone'],['twin','Tone twins','Same syllable, different tone: pick the tone'],['twinl','Tone twins by ear','Hear a syllable and pick its character']];
const STASKS=[['build','Build sentences','Put the pieces in order'],['listen','Build from listening','Hear it, then build it'],['translate','Translate into Chinese','Type it in characters or pinyin']];
/* the mode's illustration from its home tile, with its own pattern ids */
function modeArt(g){const sv=document.querySelector(`#home [data-mode="${g}"] .mart svg`);return sv?sv.outerHTML.replaceAll('t'+g+'hk','s'+g+'hk').replaceAll('t'+g+'dt','s'+g+'dt'):''}
function setup(g){
  const I=MODEINFO[g];if(!I){MODES[g]();return}
  const art=modeArt(g);
  open(bar(0,'','‹ Home')+`<div class="shead">${art?`<span class="sart">${art}</span>`:`<span class="ic">${I.ic}</span>`}<div><h2>${I.n}</h2><p class="muted">${I.d}</p></div></div>
    ${I.set||I.sent||I.tasks?`<section class="step"><h3><span class="sn">1</span>What do you want to practise?</h3><div id="s1"></div></section>`:''}
    <section class="step"><h3><span class="sn">${I.set||I.sent||I.tasks?2:1}</span>Which lessons?<span class="sp"></span><button class="link" id="allL">Select all</button><button class="link" id="noneL">Clear</button></h3><div class="lessons" id="lessons"></div></section>
    <details class="preview" id="pv"><summary id="pvs"></summary><div class="keys tonekey"><span>Colour = tone:</span><b class="t1">1st</b><b class="t2">2nd</b><b class="t3">3rd</b><b class="t4">4th</b><b class="t0">neutral</b></div><div class="keys"><span>Line under each:</span><span><i style="background:var(--accent)"></i>Known</span><span><i style="background:var(--accent);opacity:.4"></i>Learning</span><span>none = New</span><span>· Tap for details</span></div><div class="grid" id="grid"></div></details>
    <div class="startbar"><button class="btn bigbtn" id="sgo"></button></div>`);
  if(!state.stask||state.stask==='read')state.stask='build';if(!state.ttask)state.ttask='fill';const fill=()=>g==='twins'&&state.ttask==='fill';
  const items=()=>fill()?basePool('w').filter(x=>!x.proper):g==='twins'?basePool('c'):g==='tones'?basePool('c'):g==='test'?[...basePool('c'),...basePool('w')]:g==='review'?basePool():pool();
  function step1(){if(!$('s1'))return;
    if(I.sent){$('s1').innerHTML=`<div class="choices">${STASKS.map(([k,n,d])=>`<button class="choice" data-st="${k}" aria-pressed="${state.stask===k}"><b>${n}</b><span>${d}</span></button>`).join('')}</div>`;
      $('s1').querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{state.stask=b.dataset.st;saveState();step1();rest()});return}
    if(I.tasks){$('s1').innerHTML=`<div class="choices">${TTASKS.map(([k,n,d])=>`<button class="choice" data-tt="${k}" aria-pressed="${state.ttask===k}"><b>${n}</b><span>${d}</span></button>`).join('')}</div>`;
      $('s1').querySelectorAll('[data-tt]').forEach(b=>b.onclick=()=>{state.ttask=b.dataset.tt;saveState();step1();rest()});return}
    const nc=basePool('c').length,nw=basePool('w').length;
    $('s1').innerHTML=`<div class="choices two"><button class="choice" data-set="c" aria-pressed="${state.set==='c'}"><b class="han">字</b><b>Characters</b><span>${nc} in these lessons</span></button><button class="choice" data-set="w" aria-pressed="${state.set==='w'}"><b class="han">词</b><b>Words</b><span>${nw} in these lessons</span></button></div>
      ${g==='learn'?`<div style="margin-bottom:8px"><span class="hint" style="display:block;margin:0 0 4px">Before the questions</span><div class="seg" role="group" aria-label="Introductions"><button data-li="1" aria-pressed="${state.lintro!==false}">Introduce each new item</button><button data-li="0" aria-pressed="${state.lintro===false}">Questions only</button></div></div>`:''}
      ${I.filter?`<span class="hint" style="display:block;margin:0 0 4px">Which ones</span><div class="seg" role="group" aria-label="Filter">${[['all','All'],['weak','Not known yet'],['star','★ Starred']].map(([k,n])=>`<button data-f="${k}" aria-pressed="${state.filter===k}">${n}</button>`).join('')}</div>`:''}`;
    $('s1').querySelectorAll('[data-set]').forEach(b=>b.onclick=()=>{state.set=b.dataset.set;saveState();step1();rest()});
    $('s1').querySelectorAll('[data-li]').forEach(b=>b.onclick=()=>{state.lintro=b.dataset.li==='1';saveState();step1()});
    $('s1').querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{state.filter=b.dataset.f;saveState();step1();rest()});
  }
  function rest(){
    const set=fill()?'w':g==='twins'||g==='test'||g==='tones'?'c':g==='sentences'?null:state.set;
    $('lessons').innerHTML=LESSONS.filter(l=>!((set==='w'||!set)&&l==='I')).map(l=>{
      if(!set){const n=ST.filter(s=>s.l===l).length;return `<button class="lesson" data-l="${l}" aria-pressed="${state.sel.has(l)}" ${n?'':'disabled'}><b>${LNAME(l)}</b><span class="ltitle">${LTITLE[l]}</span><span class="peek han" lang="zh-Hans">${LZH[l]}</span><small>${n?n+' sentences':'no sentences'}</small></button>`}
      const a=[...new Map((set==='w'?WD:CH).filter(x=>x.l===l).map(x=>[x.k,x])).values()],n=a.length||1,m2=a.filter(x=>mastery(x)===2).length,m1=a.filter(x=>mastery(x)===1).length;
      return `<button class="lesson" data-l="${l}" aria-pressed="${state.sel.has(l)}"><b>${LNAME(l)}</b><span class="ltitle">${LTITLE[l]}</span><span class="peek han" lang="zh-Hans">${LZH[l]}</span><small>${a.length?m2+' of '+a.length+' known':'none'}</small><span class="mbar"><i class="m2" style="width:${m2/n*100}%"></i><i class="m1" style="width:${m1/n*100}%"></i></span></button>`}).join('');
    const sl=ST.filter(s=>state.sel.has(s.l)),p=items(),noun=g==='sentences'?'sentences':fill()?'words':g==='twins'?'characters':g==='test'?'characters and words':state.set==='w'?'words':'characters';
    let n=g==='sentences'?sl.length:p.length,ok=n>0,why='Select at least one lesson.';
    if(g==='twins'&&!fill()){const tg=twinGroups(basePool('c'),state.ttask==='twinl');ok=tg.length>0;n=tg.length;why='No tone twins in these lessons. Add more lessons.'}
    if(g==='match'&&p.length<3){ok=false;why='Match needs at least 3 items.'}
    if(g==='write'&&!p.length){ok=false}
    if(g==='review'){const t=dueAll().length+newAvail().length;ok=t>0;why='Nothing due and no new cards left today.'}
    if(I.filter&&!p.length&&state.sel.size)why=state.filter==='star'?'No starred items here yet. Choose All.':'You know everything here. Choose All.';
    $('sgo').disabled=!ok||!state.sel.size;
    $('sgo').textContent=!state.sel.size||!ok?why:`${I.start||(I.sent?STASKS.find(t=>t[0]===state.stask)[1]:I.tasks?TTASKS.find(t=>t[0]===state.ttask)[1]:'Start '+I.n)} · ${g==='twins'&&!fill()?n+' twin groups':g==='review'?dueAll().length+newAvail().length+' cards':n+' '+noun}`;
    const pv=g==='sentences'?[]:p;$('pv').hidden=!pv.length;
    $('pvs').textContent=`See the ${pv.length} ${noun}`;
    $('grid').style.gridTemplateColumns=pv.some(x=>x.kind==='w')?'repeat(auto-fill,minmax(110px,1fr))':'';
    $('grid').innerHTML=$('pv').open?pv.map((x,i)=>`<button class="cell m${mastery(x)}" data-i="${i}" title="${esc(x.p+' · '+short(x.en))}" aria-label="${esc(hz(x)+' '+x.p+', '+x.en)}">${starred(x)?'<span class="st">★</span>':''}<span class="han" ${x.kind==='w'?'style="font-size:1.25rem"':''}>${hzHtml(x)}</span><small>${pyHtml(x.p)}</small></button>`).join(''):'';
    $('grid').onclick=e=>{const c=e.target.closest('.cell');if(c)infoSheet(pv,+c.dataset.i)};
  }
  $('pv').addEventListener('toggle',rest);
  $('lessons').onclick=e=>{const b=e.target.closest('.lesson');if(!b||b.disabled)return;const l=b.dataset.l;state.sel.has(l)?state.sel.delete(l):state.sel.add(l);saveState();step1();rest()};
  $('allL').onclick=()=>{state.sel=new Set(LESSONS);saveState();step1();rest()};
  $('noneL').onclick=()=>{state.sel=new Set();saveState();step1();rest()};
  $('sgo').onclick=()=>{
    if(g==='sentences'){const list=ST.filter(s=>state.sel.has(s.l));
      return state.stask==='listen'?build(list,true):state.stask==='translate'?translate(list):build(list,false)}
    if(g==='review')return review();
    MODES[g]();
  };
  step1();rest();
}
document.addEventListener('click',e=>{const m=e.target.closest('[data-mode]');if(m)setup(m.dataset.mode)});

let keyHandler=null,TIMER=null;
/* motion: views rise in, the progress bar slides from where it was, finish screens count up and throw confetti */
const MOTION=!matchMedia('(prefers-reduced-motion: reduce)').matches;
function open(html){keyHandler=null;clearInterval(TIMER);stopAudio();
  const was=M().hidden?[]:[...M().querySelectorAll('.progress span')],from=was.map(e=>e.style.width),same=!!html.match(/class="card[^"]*" id="card"/)&&!!M().querySelector('#card');
  $('home').hidden=true;$('welcome').hidden=true;$('aboutpage').hidden=true;M().hidden=false;M().innerHTML=html;window.scrollTo(0,0);nudgeEnd();lessonRoundEnd();roundDone();
  if(!MOTION)return;
  M().classList.remove('anim');void M().offsetWidth;if(!same)M().classList.add('anim');
  [...M().querySelectorAll('.progress span')].forEach((pb,k)=>{if(from[k]==null)return;const to=pb.style.width;pb.style.transition='none';pb.style.width=from[k];void pb.offsetWidth;pb.style.transition='';pb.style.width=to});
  const sc=M().querySelector('.score');if(sc){const m=sc.textContent.match(/^(\d+)(.*)$/);if(m){const n=+m[1],rest=m[2],t0=performance.now();
    const tick=t=>{const k=Math.min(1,(t-t0)/700);sc.textContent=Math.round(n*(1-Math.pow(1-k,3)))+rest;if(k<1&&sc.isConnected)requestAnimationFrame(tick)};requestAnimationFrame(tick)}
    const r=sc.textContent.match(/^(\d+)\s*\/\s*(\d+)/),pc=sc.textContent.match(/^(\d+)%/);if(r?+r[1]>=.6*+r[2]:pc?+pc[1]>=60:true)confetti()}
}
/* the end of a round: a red 完 ("done") seal drops onto the result card, the card shakes once, sparks pop around the seal
   and the score counts up. Not on a failed Final test; with reduced motion the seal is simply there. */
function roundDone(){
  const sc=M().querySelector('.card .score');if(!sc||M().querySelector('#ftag'))return;const card=sc.closest('.card');if(card.querySelector('.rstamp'))return;
  card.classList.add('rdone');
  card.insertAdjacentHTML('beforeend',`<span class="rstamp" aria-hidden="true" lang="zh-Hans"><span>完</span>${[[-34,-8],[-22,-36],[14,-42],[42,-18],[46,20],[-40,26]].map(([x,y],i)=>`<i class="rspark" style="--x:${x}px;--y:${y}px;animation-delay:${.42+i*.03}s"></i>`).join('')}</span>`);
  if(!MOTION)return;
  try{if(navigator.vibrate)setTimeout(()=>navigator.vibrate(18),380)}catch(e){}
  const m=sc.textContent.match(/^(\d+(?:\.\d+)?)(.*)$/);if(!m||!+m[1])return;
  const to=+m[1],dec=(m[1].split('.')[1]||'').length,t0=performance.now()+450,D=650;sc.textContent=(0).toFixed(dec)+m[2];
  const tick=t=>{if(!sc.isConnected)return;const k=Math.min(1,Math.max(0,(t-t0)/D)),e=1-Math.pow(1-k,3);sc.textContent=(to*e).toFixed(dec)+m[2];if(k<1)requestAnimationFrame(tick)};
  requestAnimationFrame(tick);
}
function confetti(){
  if(!MOTION)return;const cv=document.createElement('canvas');cv.className='confetti';document.body.appendChild(cv);
  const W=cv.width=innerWidth*devicePixelRatio,H=cv.height=innerHeight*devicePixelRatio,g=cv.getContext('2d'),css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const cols=[css('--accent'),css('--t1'),css('--t2'),css('--t4'),css('--star')],P=[];
  for(let i=0;i<90;i++)P.push({x:W/2+(Math.random()-.5)*W*.2,y:H*.35,vx:(Math.random()-.5)*W*.018,vy:-Math.random()*H*.02-H*.006,r:(4+Math.random()*5)*devicePixelRatio,a:Math.random()*6,va:(Math.random()-.5)*.3,c:cols[i%cols.length]});
  const t0=performance.now();
  (function f(t){const k=(t-t0)/1600;g.clearRect(0,0,W,H);for(const p of P){p.vy+=H*.0007;p.x+=p.vx;p.y+=p.vy;p.a+=p.va;g.save();g.globalAlpha=Math.max(0,1-k);g.translate(p.x,p.y);g.rotate(p.a);g.fillStyle=p.c;g.fillRect(-p.r,-p.r/2,p.r*2,p.r);g.restore()}
    if(k<1)requestAnimationFrame(f);else cv.remove()})(t0);
}
function goHome(){keyHandler=null;lessonRestore();clearInterval(TIMER);stopAudio();M().hidden=true;M().innerHTML='';$('welcome').hidden=true;$('aboutpage').hidden=true;$('home').hidden=false;renderHome();window.scrollTo(0,0);if(MOTION){$('home').classList.remove('anim');void $('home').offsetWidth;$('home').classList.add('anim')}}
document.addEventListener('click',e=>{const h=e.target.closest('[data-home]');if(h){goHome();return}const g=e.target.closest('[data-go]');if(g&&!g.disabled)MODES[g.dataset.go]()});
document.addEventListener('keydown',e=>{if(keyHandler&&!(e.target.tagName==='INPUT'&&e.key!=='Enter')&&e.target.tagName!=='TEXTAREA')keyHandler(e)});
const bar=(pct,count,label='‹ Home')=>`<div class="bar"><button class="back" data-home>${label}</button>${count===''&&!pct?'<span class="barsp"></span>':`<div class="progress"><span style="width:${pct}%"></span></div>`}<span class="count">${count}</span></div>`;
/* progress bar split into red (still learning / mistakes), green (know / correct) and grey (to go), with a small legend */
const tallyBar=(bad,good,total,count,badL='Mistakes',goodL='Correct',label='‹ Home',barBad=true)=>{const T=Math.max(total,1),b=Math.max(0,Math.round(bad)),g=Math.max(0,Math.round(good)),left=Math.max(0,total-(barBad?b:0)-g);
  return `<div class="bar"><button class="back" data-home>${label}</button><div class="progress split" aria-hidden="true"><span class="r" style="width:${barBad?b/T*100:0}%"></span><span class="g" style="width:${g/T*100}%"></span></div><span class="count">${count}</span></div>
  <div class="tally"><span class="no"><i aria-hidden="true"></i><b>${b}</b> ${badL}</span><span class="left"><b>${left}</b> To go</span><span class="yes"><b>${g}</b> ${goodL}<i aria-hidden="true"></i></span></div>`};
const answerLine=x=>`<div class="why">${x.kind==='c'?`<span class="t${x.tone}">${contour(x.tone)}</span>`:''}<span><b class="han" style="font-size:1.5rem">${hzHtml(x)}</b> <b>${pyHtml(x.p)}</b>${x.kind==='c'?' · '+TLABEL(x.tone):''} · ${esc(x.en)}</span>${starHtml(x,'xs-sm')}</div>`;
function backHtml(x,noStar){
  return `<span class="py">${x.kind==='c'?`<span class="t${x.tone}">${contour(x.tone)}</span>`:''}${pyHtml(x.p)}</span>
    ${x.kind==='c'?`<span class="t${x.tone}" style="font-weight:600">${TLABEL(x.tone)}, ${TONE[x.tone]}</span>`:x.pos?`<span class="tag">${esc(x.pos)}</span>`:''}
    <span class="meaning">${esc(x.en)}</span>${x.t!==x.s?`<span class="alt">${state.script==='t'?'Simplified '+x.s:'Traditional '+x.t}</span>`:''}${noStar?'':starHtml(x)}`;
}

/* dialogs: move focus inside once rendered, keep Tab within, focus is restored by the caller on close */
const FOCUSABLE='button:not([disabled]),[href],input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
function sheetFocus(sh){sh._back=document.activeElement;const list=()=>[...sh.querySelectorAll(FOCUSABLE)].filter(e=>e.offsetParent!==null);
  setTimeout(()=>{if(sh.isConnected&&!sh.contains(document.activeElement)){const l=list();(l.find(e=>!e.matches('[aria-label*="Previous"],[disabled]'))||l[0]||sh).focus()}},0);
  sh.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const l=list();if(!l.length){e.preventDefault();return}const a=l[0],z=l[l.length-1];
    if(!sh.contains(document.activeElement)){e.preventDefault();a.focus()}else if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}})}
/* details sheet for one item in a list, with ‹ › to step through it */
function infoSheet(list,i){
  const saved=keyHandler;
  const sh=document.createElement('div');sh.className='wsheet';sh.setAttribute('role','dialog');sh.setAttribute('aria-modal','true');sh.setAttribute('aria-label','Details');
  document.body.appendChild(sh);document.body.style.overflow='hidden';sheetFocus(sh);
  const close=()=>{sh.remove();document.body.style.overflow='';keyHandler=saved;if(sh._back&&sh._back.isConnected)sh._back.focus()};
  sh.onclick=e=>{if(e.target===sh)close()};
  const go=d=>{const k=i+d;if(k<0||k>=list.length)return;i=k;draw();speak(list[i])};
  function draw(){
    const x=list[i],m=mastery(x);
    sh.innerHTML=`<div class="wpanel infop"><div class="row"><button class="btn ghost" id="ifp" ${i?'':'disabled'} aria-label="Previous">‹</button><span class="tag">${kindLabel(x)} · ${LNAME(x.l)} · ${i+1} / ${list.length}</span><button class="btn ghost" id="ifn" ${i<list.length-1?'':'disabled'} aria-label="Next">›</button></div>
      <span class="${bigClass(x)} han">${hzHtml(x)}</span>${backHtml(x,true)}
      <p class="hint">${m===2?'✓ Known':m===1?'Learning':'New'}</p>
      <div class="btns"><button class="btn ghost" id="ifplay">${PLAY} Play</button><button class="btn ghost" id="iftw">${PEN}Try writing</button><button class="starbtn" id="ifstar" aria-pressed="${starred(x)}">★ star</button></div>
      <div class="infox">${hookHtml(x)+relatedHtml(x)+exampleHtml(x,4)}</div>
      <button class="btn" id="ifx" style="align-self:stretch">Close</button></div>`;
    $('ifx').onclick=close;$('ifp').onclick=()=>go(-1);$('ifn').onclick=()=>go(1);
    $('ifplay').onclick=()=>speak(x);$('iftw').onclick=()=>tryWrite(x);
    $('ifstar').onclick=()=>$('ifstar').setAttribute('aria-pressed',toggleStar(x));
    bindHook(x);
  }
  keyHandler=e=>{if(!sh.isConnected)return;if(document.querySelectorAll('.wsheet').length>1)return;if(e.key==='Escape')close();else if(e.key==='ArrowLeft')go(-1);else if(e.key==='ArrowRight')go(1)};
  draw();speak(list[i]);
}
/* your own memory hook: making up a link yourself (elaboration) helps it stick */
function hookHtml(x){const m=(srs[x.k]&&srs[x.k].m)||'',sug=x.kind==='c'&&PICT[x.s]?null:HOOKS[x.k];
  return `<div class="hook"><label for="hk">My memory hook</label>${sug?`<div class="hsug"><span><b>${x.kind==='c'?'Parts':'Characters'}:</b> <span class="han-in">${esc(sug)}</span></span><button class="link" id="hku" type="button">Use this</button></div>`:''}<textarea id="hk" rows="2" maxlength="300" placeholder="${sug?'Turn the parts into a little story or picture, in your own words':x.kind==='c'?'Make up a picture or story that links its shape, sound and meaning':'e.g. a picture, a story or a sound-alike that links it to the meaning'}">${esc(m)}</textarea></div>`}
function bindHook(x){const t=$('hk');if(!t)return;if($('hku')&&HOOKS[x.k])$('hku').onclick=e=>{e.stopPropagation();t.value=t.value.trim()?t.value.trim()+' '+HOOKS[x.k]:HOOKS[x.k];t.oninput();t.focus()};let tm=null;t.addEventListener('click',e=>e.stopPropagation());t.addEventListener('keydown',e=>e.stopPropagation());
  t.oninput=()=>{clearTimeout(tm);tm=setTimeout(()=>{const r=srs[x.k]||(srs[x.k]={e:2.5,i:0,n:0,lp:0,d:Date.now()+3650*DAY,fresh:1});const v=t.value.trim();if(v)r.m=v;else delete r.m;r.u=Date.now();saveSrs()},500)}}

