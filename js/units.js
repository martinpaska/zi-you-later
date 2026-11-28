/* ---------- Your path, step by step: every lesson is split into short units, played one after another like stops on a
   path. A words unit brings about 5 new words (with the characters they use), a grammar unit up to two grammar points,
   then a lesson review and the Final test (the seal). A unit is one session of mixed exercises: meet a word, then
   choose, listen, type the pinyin, fill in the tones, match, build a sentence and write a character. Mistakes come back
   at the end of the session. A finished unit can be played again at level 2 and 3 (gold): fewer hints, more recall.
   Levels are kept in state.units ('hsk1:1' → {w1:2,g1:1,r:1}), so they sync with the account. Every lesson and unit is open:
   you can jump anywhere, and the path goes on from where you last played (state.pathAt, per course). ---------- */
const UNIT_N=5,UNIT_MAX=3;
const UNITS={};
function lessonUnits(l){
  if(UNITS[l])return UNITS[l];
  const it=lessonItems(l),ws=it.filter(x=>x.kind==='w'),cs=it.filter(x=>x.kind==='c'),main=ws.length?ws:cs;
  const n=Math.max(1,Math.round(main.length/UNIT_N)),chunks=[...Array(n)].map((_,i)=>main.slice(Math.round(i*main.length/n),Math.round((i+1)*main.length/n)));
  // a lesson's characters go with the first unit whose words use them; the rest are shared out
  const chars=chunks.map(()=>[]);
  if(ws.length){let k=0;for(const c of cs){const i=chunks.findIndex(ch=>ch.some(w=>w.s.includes(c.s)));(chars[i>=0?i:k++%n]).push(c)}}
  // each words unit shows a character of its own: the first one of its words that no unit before it shows
  const used=new Set(),wu=chunks.map((ch,i)=>{const hs=ch.flatMap(x=>[...x.s].filter(isHan)),g=hs.find(c=>!used.has(c))||hs[0]||'';used.add(g);return {id:'w'+(i+1),kind:'w',n:i+1,items:ch,chars:chars[i],g}});
  const gp=(GRAMMAR[l]||[]).map((g,i)=>i),gu=[];for(let i=0;i<gp.length;i+=2)gu.push({id:'g'+(gu.length+1),kind:'g',n:gu.length+1,pts:gp.slice(i,i+2)});
  // grammar units are spread between the words units: never first, the last one before the review
  const out=[];wu.forEach((u,i)=>{out.push(u);gu.forEach((g,j)=>{if(Math.max(1,Math.round((j+1)*wu.length/(gu.length+1)))===i+1)out.push(g)})});
  gu.forEach(g=>{if(!out.includes(g))out.push(g)});
  out.push({id:'r',kind:'r'},{id:'f',kind:'f'});
  return UNITS[l]=out;
}
const unitKey=l=>PACK+':'+l;
const unitStored=(l,u)=>((state.units||{})[unitKey(l)]||{})[u.id]||0;
// the level of a unit: what was played, at least 1 when its lesson's seal is stamped or (words) all its words are learnt
function unitLv(l,u){if(u.kind==='f')return sealOf(l)?1:0;const s=unitStored(l,u);if(s)return s;
  if(sealOf(l))return 1;if(u.kind==='w'&&u.items.every(seen))return 1;
  if(u.kind==='g'&&((state.lsteps||{})[unitKey(l)]||{}).grammar)return 1;return 0}
const lessonDone=l=>!!sealOf(l)||lessonUnits(l).every(u=>u.kind==='f'||unitLv(l,u)>0);
const lessonStarted=l=>lessonUnits(l).some(u=>u.kind!=='f'&&unitLv(l,u)>0);
// nothing is locked: every lesson and every unit can be played in any order
const lessonOpen=()=>true,unitOpen=()=>true;
// where you last played on the path (lesson and unit), so the path goes on from there
const pathAt=()=>((state.pathAt||{})[PACK])||null;
function pathMark(l,u){state.pathAt={...(state.pathAt||{}),[PACK]:{l,u:u.id}};saveState()}
/* where you are: from the unit you last played, the next unit that is not done (in that lesson, then in the lessons after
   it, then from the start of the course). Without a last unit, the first one that is not done. A Final test you went
   past (the next lesson is started) does not hold you back. */
function unitNow(){const at=pathAt(),k=at?Math.max(0,LESSONS.indexOf(at.l)):0;
  const order=[...LESSONS.slice(k),...LESSONS.slice(0,k)];
  for(const [j,l] of order.entries()){const nl=LESSONS[LESSONS.indexOf(l)+1],us=lessonUnits(l);
    const from=j===0&&at&&at.l===l?Math.max(0,us.findIndex(u=>u.id===at.u)):0;
    const u=us.slice(from).find(u=>unitLv(l,u)===0&&!(u.kind==='f'&&nl&&lessonStarted(nl)));if(u)return {l,u}}
  // everything after the last unit is done: the units before it in its lesson, then the last lesson
  if(at){const us=lessonUnits(at.l),u=us.find(u=>unitLv(at.l,u)===0);if(u)return {l:at.l,u}}
  const l=LESSONS[LESSONS.length-1];return {l,u:lessonUnits(l)[0]}}
function unitSave(l,u,lv){const k=unitKey(l),all=state.units||{};state.units={...all,[k]:{...(all[k]||{}),[u.id]:Math.max(lv,unitStored(l,u))}};saveState()}
const unitName=(l,u)=>u.kind==='w'?`Words ${u.n}`:u.kind==='g'?(u.pts.length>1?`Grammar ${u.n}`:'Grammar'):u.kind==='r'?'Lesson review':'Final test';
const unitGlyph=(l,u)=>u.kind==='w'?esc(state.script==='t'?toTrad(u.g):u.g):u.kind==='g'?'法':u.kind==='r'?'复':lessonMeta(l).seal;
const lvDots=lv=>`<span class="ulv" aria-hidden="true">${[1,2,3].map(i=>`<i class="${i<=lv?'on':''}"></i>`).join('')}</span>`;

/* the path: each lesson is a sheet of paper with an old ink landscape; the units are stamps on a winding road over it,
   red as far as you have come. Only the app's colours: black ink, red, the paper. A stamp shows its unit's character (法 grammar, 复 the review,
   the lesson's seal for the Final test); three bars under it are its level. */
const UX=[0,-56,-84,-56,0,56,84,56],UROW=118;
const unitWords=(l,u)=>u.kind==='w'?u.items.map(hz).join(' '):u.kind==='g'?u.pts.map(p=>GRAMMAR[l][p].t).join(' · '):u.kind==='r'?'Everything from this lesson':`${PASS}% stamps the seal`;
/* the picture behind each lesson: one old Chinese ink landscape per lesson (art/ink1–22.webp, public domain, The
   Metropolitan Museum of Art, Open Access CC0; see art/README.md), turned into the app's ink and paper. It spans the
   width of the sheet from the top, whole, never cut or stretched; each lesson gets the
   painting whose shape (width / height) is closest to its sheet, and no two lessons of a course share one. */
// INKS is written by art/build.py
const INKS=[0.722,0.525,0.608,0.295,0.522,0.651,0.501,0.347,0.443,0.48,0.532,0.338,0.324,0.431,0.759,0.46,0.509,0.237,0.454,0.416,0.278,0.301];
// the sheet is about 340px wide; a painting spans it, so it is 340 / aspect tall. A lesson gets the painting closest to
// its own shape; a long lesson whose sheet holds two paintings whole gets a second one at its foot, never overlapping.
const INK_OF=(()=>{let m=null;return l=>{if(!m){m={};const used=new Set(),h=i=>336/INKS[i];
  for(const x of LESSONS){const H=lessonUnits(x).length*UROW+94,r=340/H;let a=-1,bd=1e9;
    INKS.forEach((v,i)=>{const d=Math.abs(Math.log(v/Math.max(r,.42)))+(used.has(i)?9:0);if(d<bd){bd=d;a=i}});used.add(a);
    let b=-1;if(H>h(a)+260){let bb=1e9;INKS.forEach((v,i)=>{if(i===a||h(a)+h(i)>H)return;const d=(H-h(a)-h(i))+(used.has(i)?2000:0);if(d<bb){bb=d;b=i}});if(b>=0)used.add(b)}
    m[x]=[a+1,b+1]}}return m[l]}})();
function lessonPathHtml(l,k){
  // only the lesson you are in has a current stamp; elsewhere the red road reaches the first unit not done yet
  const now=unitNow(),m=lessonMeta(l),us=lessonUnits(l),nx=now.l===l?now.u:null,first=us.find(u=>unitLv(l,u)===0),done=us.filter(u=>u.kind!=='f'&&unitLv(l,u)>0).length,tot=us.length-1;
  const xs=us.map((u,i)=>UX[(k+i)%UX.length]),ys=us.map((u,i)=>i*UROW+44),reach=nx?us.indexOf(nx):sealOf(l)?us.length-1:first?us.indexOf(first):-1,H=us.length*UROW;
  let line='',ink='';for(let i=1;i<us.length;i++){const d=`M${xs[i-1]} ${ys[i-1]} C${xs[i-1]} ${ys[i-1]+UROW/2} ${xs[i]} ${ys[i]-UROW/2} ${xs[i]} ${ys[i]}`;if(i<=reach)ink+=d;else line+=d}
  const node=(u,i)=>{const lv=unitLv(l,u),here=nx===u,cls=[u.kind,lv?'done':'',here?'cur':'',!lv&&!here?'lock':''].join(' ');
    return `<div class="urow" style="--x:${xs[i]}px;--r:${[-4,3,-2,4,-3,2][(k+i)%6]}deg"><button class="unode ${cls}" data-unit="${l}|${u.id}" type="button" aria-label="${esc(`${LNAME(l)} · ${unitName(l,u)}`)}">
      ${here?`<span class="ustart">${u.kind==='f'?'Test':lv?'Here':'Start'}</span>`:''}<span class="ubub" lang="zh-Hans">${unitGlyph(l,u)}</span>${u.kind!=='f'?`<span class="ulvb" aria-hidden="true">${[1,2,3].map(j=>`<i class="${j<=lv?'on':''}"></i>`).join('')}</span>`:''}</button>
      <span class="uname">${esc(unitName(l,u))}</span></div>`};
  return `<section class="ulesson" id="ul-${l}"><div class="ulh">${sealHtml(l,'sm')}<div class="ulht"><small><span>${esc(LNAME(l))}</span>${sealOf(l)?' · <span>Completed</span>':` · <span>${esc(`${done} / ${tot} units`)}</span>`}</small><b>${esc(m.en)}</b>
      <span class="ulbar" aria-hidden="true"><i style="width:${sealOf(l)?100:Math.round(done/Math.max(1,tot)*100)}%"></i></span></div></div>
    <div class="umap ia${INK_OF(l)[0]}${INK_OF(l)[1]?` ib${INK_OF(l)[1]}`:''}"><div class="unodes" style="height:${H}px"><svg class="ulink" width="1" height="${H}" aria-hidden="true" focusable="false"><path class="todo" d="${line}"/><path class="ink" d="${ink}"/></svg>${us.map(node).join('')}</div></div>
    </section>`;
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-unit]');if(b){e.preventDefault();const [l,id]=b.dataset.unit.split('|');unitSheet(l,id)}});
function unitSheet(l,id){
  const us=lessonUnits(l),u=us.find(x=>x.id===id);if(!u)return;
  const lv=unitLv(l,u),m=lessonMeta(l);
  const what=u.kind==='w'?`<div class="uwords">${u.items.map(x=>`<span class="uw"><b class="han">${hzHtml(x)}</b><small>${pyHtml(x.p)}</small><small class="m">${esc(short(x.en))}</small></span>`).join('')}</div>`
    :u.kind==='g'?`<ul class="ugp">${u.pts.map(i=>`<li>${esc(GRAMMAR[l][i].t)}</li>`).join('')}</ul>`
    :u.kind==='r'?'<p class="hint">Everything from this lesson, mixed: words, characters, tones, sentences and grammar.</p>'
    :`<p class="hint">${esc(`16 questions on the words and characters of the lesson. ${PASS}% stamps the seal.`)}</p>`;
  const lvTxt=u.kind==='f'?'':lv?`<p class="ulvt">${lvDots(lv)}<span>${esc(lv>=UNIT_MAX?'Gold · level 3 of 3':`Level ${lv} of 3`)}</span></p>`:'';
  const cta=u.kind==='f'?`<button class="btn" data-ugo="1" type="button">${sealOf(l)?'Take the Final test again':'Take the Final test'}</button>`
    :!lv?`<button class="btn" data-ugo="1" type="button">Start</button>`
    :lv<UNIT_MAX?`<button class="btn" data-ugo="${lv+1}" type="button">${esc(`Practise at level ${lv+1}`)}</button><button class="btn ghost" data-ugo="${lv}" type="button">Play it again</button>`
    :`<button class="btn" data-ugo="3" type="button">Play it again</button>`;
  const saved=keyHandler,sh=document.createElement('div');sh.className='nsheet';
  sh.innerHTML=`<div class="npanel" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="ust" style="height:auto;max-height:92svh"><div class="nhead"><span class="ngrab" aria-hidden="true"></span>
    <button class="nclose" id="usx" type="button">${T_('Close')}</button><span></span><span></span></div>
    <div class="nbody usheet"><p class="eyebrow"><span>${esc(LNAME(l))}</span> · <span>${esc(m.en)}</span></p><h2 id="ust">${esc(unitName(l,u))}</h2>${lvTxt}${what}<div class="btns ucta">${cta}</div></div></div>`;
  document.body.appendChild(sh);document.body.style.overflow='hidden';sheetFocus(sh);
  const close=()=>{sh.remove();document.body.style.overflow='';keyHandler=saved};
  sh.onclick=e=>{if(e.target===sh)return close();const b=e.target.closest('[data-ugo]');if(!b)return;close();
    if(u.kind==='f'){pathMark(l,u);return startStep(l,'final')}unitRun(l,u.id,+b.dataset.ugo)};
  $('usx').onclick=close;keyHandler=e=>{if(e.key==='Escape'){e.preventDefault();close()}};
}

/* ---------- one unit: a session of mixed exercises ---------- */
// choices: the right one and up to n others from the same lesson first, never two that would both be right
function uChoices(x,type,n=3){
  const key=type==='mean'?y=>short(y.en):y=>hz(y),bad=y=>y.k===x.k||key(y)===key(x)||hz(y)===hz(x)||short(y.en)===short(x.en)||(type==='audio'&&y.p.toLowerCase()===x.p.toLowerCase());
  const u=new Set(),out=[];for(const src of [shuffle(lessonItems(x.l)),shuffle(x.kind==='c'?CH:WD)])for(const y of src){if(out.length>=n)break;if(y.kind!==x.kind||bad(y)||u.has(key(y)))continue;u.add(key(y));out.push(y)}
  return shuffle([x,...out])}
const sentsWith=(l,items)=>ST.filter(s=>s.l===l&&s.zh.length<=9&&items.some(x=>s.zh.includes(x.s)));
const writable=(l,cs)=>STROKES?cs.filter(c=>c.kind==='c'&&(!PATH.write||PATH.write.includes(c.s))&&(STROKES[hz(c)]||STROKES[c.s])):[];
const toneable=x=>!x.proper&&(x.p.replace(/\([^)]*\)/g,'').match(SYL)||[]).length>0;
// the exercises of a unit at a level, in order: a new word is met, then asked straight away, then mixed with the others
function unitPlan(l,u,lv){
  const us=lessonUnits(l),before=us.slice(0,us.indexOf(u)).filter(v=>v.kind==='w').flatMap(v=>v.items),T=[];
  const pick=(a,n)=>shuffle(a).slice(0,n),mc=()=>['mean','char','audio'][Math.random()*3|0];
  const old=pick(before.filter(seen).length?before.filter(seen):before,2).map(x=>({t:lv>1?'pinyin':mc(),x}));
  if(u.kind==='w'){const it=u.items,chars=u.chars.length?u.chars:it.filter(x=>x.kind==='c'),ss=sentsWith(l,it),wr=writable(l,chars);
    if(lv===1){
      /* level 1 teaches the words two at a time: meet one, recognise it at once, meet the next, recognise it, then tell the
         two apart (choose the Chinese, listen). Each word thus goes from recognising it to recalling it; the pairs are
         mixed at the end with a match, a tone, the pinyin, a sentence and a character to write. */
      for(let i=0;i<it.length;i+=2){const p=it.slice(i,i+2);
        p.forEach(x=>{if(mastery(x)<2)T.push({t:'intro',x});T.push({t:'mean',x})});
        p.forEach((x,j)=>T.push({t:j?'audio':'char',x}))}
      T.push({t:'match',xs:it});
      const tn=it.filter(toneable);if(tn.length)T.push({t:'tone',x:pick(tn,1)[0]});T.push({t:'pinyin',x:pick(it,1)[0]});
      if(chars.length&&it.some(x=>x.kind==='w'))T.push({t:'mean',x:pick(chars,1)[0]});
      if(ss.length)T.push({t:'build',s:pick(ss,1)[0]});if(wr.length)T.push({t:'write',x:pick(wr,1)[0],lv});}
    else{
      // levels 2 and 3: no intros; every word is recalled (level 2) or produced (level 3), from the easier exercises to the harder
      const easy=[],hard=[];
      it.forEach(x=>{easy.push({t:lv===3?'audio':(Math.random()<.5?'char':'audio'),x});hard.push({t:lv===3||Math.random()<.4?'pinyin':'char',x})});
      T.push(...shuffle(easy),{t:'match',xs:it});pick(it.filter(toneable),2).forEach(x=>T.push({t:'tone',x}));T.push(...shuffle(hard));
      if(chars.length&&it.some(x=>x.kind==='w'))pick(chars,2).forEach(x=>T.push({t:lv===3?'pinyin':'char',x}));
      pick(ss,2).forEach(s=>T.push({t:'build',s,listen:lv===3}));pick(wr,lv===3?2:1).forEach(x=>T.push({t:'write',x,lv}))}
    // two words from the units before come back between the new ones, not only at the end
    old.forEach((t,i)=>T.splice(Math.min(T.length,Math.round(T.length*(i+1)/3)),0,t))}
  else if(u.kind==='g'){const drills=u.pts.map(i=>({i,qs:shuffle((GDRILL&&GDRILL[l+'-'+i])||[])}));
    drills.forEach(({i,qs})=>{if(lv===1)T.push({t:'gcard',g:GRAMMAR[l][i]});qs.slice(0,lv===1?4:5).forEach(q=>T.push({t:'gram',q,g:GRAMMAR[l][i]}))});
    if(lv>1)shuffleTail(T,0);
    const ss=sentsWith(l,lessonItems(l).filter(x=>x.kind==='w'));pick(ss,T.filter(t=>t.t==='gram').length?1:3).forEach(s=>T.push({t:'build',s,listen:lv===3}));
    pick(lessonItems(l).filter(seen),3).forEach(x=>T.push({t:lv>1?'pinyin':mc(),x}))}
  else{const it=lessonItems(l),weak=shuffle(it).sort((a,b)=>mastery(a)-mastery(b)).slice(0,10);
    weak.forEach((x,i)=>T.push({t:i%4===3&&toneable(x)?'tone':lv>1&&i%3===0?'pinyin':mc(),x}));
    T.splice(4,0,{t:'match',xs:pick(it,5)});pick(sentsWith(l,it),2).forEach(s=>T.push({t:'build',s,listen:lv===3}));
    const wr=writable(l,it.filter(x=>x.kind==='c'));if(wr.length)T.push({t:'write',x:pick(wr,1)[0],lv});
    (GRAMMAR[l]||[]).forEach((g,i)=>{const q=shuffle((GDRILL&&GDRILL[l+'-'+i])||[])[0];if(q&&T.filter(t=>t.t==='gram').length<3)T.push({t:'gram',q,g})});
    shuffleTail(T,0)}
  return T}
// mixes the exercises, keeping every word's first meeting before its questions
function shuffleTail(T,from){const s=shuffle(T.slice(from));T.splice(from,s.length,...s)}
function unitRun(l,id,lv){
  const u=lessonUnits(l).find(x=>x.id===id);if(!u)return;pathMark(l,u);if(u.kind==='f')return startStep(l,'final');
  lv=Math.max(1,Math.min(UNIT_MAX,lv||unitLv(l,u)+1||1));lessonRestore();
  const need=[STROKES?null:loadStrokes().catch(()=>null),u.kind!=='w'&&!GDRILL?loadGdrill().catch(()=>null):null].filter(Boolean);
  if(need.length){open(ubar(0)+`<div class="card"><p class="hint">Loading…</p></div>`);Promise.all(need).then(()=>{if(M().querySelector('.ubar'))unitPlay(l,u,lv)});return}
  unitPlay(l,u,lv)}
const ubar=(pct,combo)=>`<div class="bar ubar"><button class="back" data-go="album" aria-label="Your path">✕</button><div class="progress"><span style="width:${pct}%"></span></div><span class="count">${combo>=3?`<span class="ucombo">${combo}×</span>`:''}</span>${pyBtn()}</div>`;
/* pinyin on the path can be switched off (state.pathPy === false): the units, their sheets and the results then show the
   characters without pinyin, except where the pinyin is the exercise itself (type the pinyin, fill in the tones) */
const pyBtn=()=>`<button class="upy" data-pathpy type="button" aria-pressed="${state.pathPy!==false}" aria-label="Show pinyin" title="Show pinyin">pīn</button>`;
function pathPyApply(){document.body.classList.toggle('nopy',state.pathPy===false);document.querySelectorAll('[data-pathpy]').forEach(b=>b.setAttribute('aria-pressed',String(state.pathPy!==false)))}
document.addEventListener('click',e=>{if(!e.target.closest('[data-pathpy]'))return;e.preventDefault();state.pathPy=state.pathPy===false;saveState();pathPyApply()});
pathPyApply();
// extra: a list of items to go over again after a unit (its mistakes); such a round leaves the unit's level as it is
function unitPlay(l,u,lv,extra){
  const plan=extra?shuffle(extra.flatMap(x=>[{t:'char',x},{t:'audio',x}])).concat(shuffle(extra.map(x=>({t:'pinyin',x})))):unitPlan(l,u,lv),q=plan.slice(),total=plan.filter(t=>t.t!=='intro'&&t.t!=='gcard').length||1,t0=Date.now();
  let solved=0,firstOk=0,asked=0,combo=0,noIntro=false,noWrite=false;const graded=new Set(),missed=new Set(),tries=new Map();
  const head=()=>ubar(Math.min(100,solved/total*100),combo);
  const gradeOnce=(x,ok)=>{if(!x||graded.has(x.k))return;graded.add(x.k);grade(x,ok)};
  // leaving a unit half way asks first (what was answered is kept in the review, the unit is not marked done)
  const quit=e=>{const b=e.target.closest('.ubar .back');if(!b||!M().querySelector('.ucard,.intro'))return;if(!solved)return;
    if(!confirm(T_('Leave this unit? It is not finished yet, so it stays open on your path.'))){e.preventDefault();e.stopImmediatePropagation()}};
  document.addEventListener('click',quit,true);
  function next(){keyHandler=null;const t=q.shift();if(!t){document.removeEventListener('click',quit,true);return finish()}
    if(t.t==='intro'){if(noIntro)return next();intro(t.x,0,1,()=>next(),()=>{noIntro=true;next()});const ic=M().querySelector('.intro');if(ic)ic.classList.add('upath');return fixBar()}
    if(t.t==='write'&&noWrite){solved++;return next()}
    ({gcard:gcardTask,mean:mcTask,char:mcTask,audio:mcTask,pinyin:pyTask,tone:toneTask,match:matchTask,build:buildTask,write:writeTask,gram:gramTask})[t.t](t)}
  const fixBar=()=>{const b=M().querySelector('.bar');if(b)b.outerHTML=head()};
  // after an answer: feedback, then Continue. A mistake brings the exercise back at the end (twice at most).
  function answered(t,ok,html,extra=''){
    const n=(tries.get(t)||0)+1;tries.set(t,n);if(n===1){asked++;if(ok)firstOk++}
    if(ok){solved++;combo++}else{combo=0;if(t.x)missed.add(t.x);if(n<3)q.splice(Math.min(q.length,3),0,t);else solved++}   // a mistake comes back three exercises later
    const b=M().querySelector('.ubar .progress span');if(b)b.style.width=Math.min(100,solved/total*100)+'%';const c=M().querySelector('.ubar .count');if(c)c.innerHTML=combo>=3?`<span class="ucombo">${combo}×</span>`:'';
    $('fb').innerHTML=`<div class="fb ${ok?'ok':'bad'}"><h3>${ok?(combo>=5?'Excellent!':'Correct!'):'Not quite. It will come back.'}</h3>${html||''}<div class="btns">${extra}<button class="btn" id="ucont" type="button">Continue ›</button></div></div>`;
    $('fb').scrollIntoView({block:'nearest',behavior:'smooth'});$('ucont').onclick=next;$('ucont').focus({preventScroll:true});
    keyHandler=e=>{if(e.key==='Enter'){e.preventDefault();next()}};
    try{if(navigator.vibrate)navigator.vibrate(ok?8:[20,40,20])}catch(e){}
  }
  const card=(body,cls='')=>open(head()+`<div class="card top-align ucard ${cls}">${body}<div id="fb" role="status" aria-live="polite" style="width:100%"></div></div>`);
  function mcTask(t){const x=t.x,type=t.t,opts=uChoices(x,type);
    card(`<p class="eyebrow">${type==='mean'?'Choose the meaning':type==='char'?'Choose the Chinese':'Listen and choose'}</p>${qHead(x,type)}${optsHtml(x,type,opts)}`);
    const box=M().querySelector('.opts');if(type==='audio'){M().querySelector('[data-say]').onclick=()=>speak(x);setTimeout(()=>speak(x),200)}
    const choose=b=>{if(!b||box.classList.contains('answered'))return;box.classList.add('answered');const ok=opts[+b.dataset.i]===x;
      box.querySelector(`[data-i="${opts.indexOf(x)}"]`).classList.add('is-ok');if(!ok)b.classList.add('is-bad');if(type!=='mean')revealChars(box,opts);
      gradeOnce(x,ok);speak(x);answered(t,ok,answerLine(x))};
    box.onclick=e=>choose(e.target.closest('.opt'));keyHandler=e=>{const n=+e.key;if(n>=1&&n<=opts.length)choose(box.querySelector(`[data-i="${n-1}"]`))}}
  function pyTask(t){const x=t.x;card(`<p class="eyebrow">Type the pinyin</p>${qHead(x,'pinyin')}${typeHtml('uin')}<div class="btns"><button class="btn ghost" id="uidk" type="button">I don't know</button><button class="btn" id="uchk" type="button">Check</button></div>`);
    const inp=$('uin');inp.focus();
    const check=give=>{if(inp.disabled)return;if(!give&&!inp.value.trim())return inp.focus();const ok=!give&&pyOk(inp.value,x);inp.disabled=true;inp.classList.add(ok?'is-ok':'is-bad');
      M().querySelector('.ucard .btns').hidden=true;gradeOnce(x,ok);speak(x);
      answered(t,ok,answerLine(x)+(!ok&&inp.value&&!give?`<p class="hint">${esc(`You typed “${inp.value}”.`)} ${esc(`Accepted: ${pyForms(x.p).join(' · ')}`)}</p>`:''))};
    $('uchk').onclick=()=>check(false);$('uidk').onclick=()=>check(true);inp.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();check(false)}}}
  function toneTask(t){const x=t.x,syl=x.p.replace(/\([^)]*\)/g,'').match(SYL)||[],ans=syl.map(sylTone),bare=syl.map(bareSyl),pk=syl.map(()=>null);let cur=0,done=false;
    card(`<p class="eyebrow">Fill in the tones</p><span class="han tfw" data-nosay>${esc(hz(x))}</span><p class="hint tfen">${esc(x.en)}</p><div class="tsyls" id="ts" aria-label="Syllables"></div>
      <div class="tones" id="qo">${[1,2,3,4,0].map(n=>`<button class="tbtn t${n}" data-t="${n}" type="button">${contour(n)}${n||'neutral'}<small>${n?TONE[n]:'tone'}</small></button>`).join('')}</div>
      <div class="btns" id="tfb"><button class="btn ghost" id="tfp" type="button">${PLAY}Hint: listen</button><button class="btn" id="tfc" type="button" disabled>Check</button></div>`,'tfill');
    const draw=()=>{$('ts').innerHTML=bare.map((b,i)=>{const v=pk[i],st=done?(v===ans[i]?' ok':' bad'):'';
        return `<button class="tsyl${i===cur&&!done?' cur':''}${v!==null?' t'+v:''}${st}" data-i="${i}" type="button" aria-label="${esc(b)}">${esc(v===null?b:markSyl(b,v))}<small>${done&&v!==ans[i]?esc(syl[i]):v===null?'?':v?v+'.':'·'}</small></button>`}).join('');$('tfc').disabled=done||pk.some(v=>v===null)};
    draw();$('ts').onclick=e=>{const b=e.target.closest('[data-i]');if(b&&!done){cur=+b.dataset.i;draw()}};
    const set=v=>{if(done)return;pk[cur]=v;const nx=pk.findIndex((w,i)=>w===null&&i>cur),any=pk.indexOf(null);cur=nx>=0?nx:any>=0?any:cur;draw()};
    $('qo').onclick=e=>{const b=e.target.closest('[data-t]');if(b)set(+b.dataset.t)};$('tfp').onclick=()=>speak(x);
    const check=()=>{if(done||pk.some(v=>v===null))return;done=true;const ok=pk.every((v,i)=>v===ans[i]);draw();$('tfb').hidden=true;$('qo').classList.add('answered');gradeOnce(x,ok);speak(x);
      answered(t,ok,`<p class="tfa"><span class="han">${esc(hz(x))}</span> ${pyHtml(x.p)}</p>`)};
    $('tfc').onclick=check;keyHandler=e=>{if(/^[0-5]$/.test(e.key))set(e.key==='5'?0:+e.key);else if(e.key==='Enter'){e.preventDefault();check()}}}
  function matchTask(t){const u2=new Set(),xs=shuffle(t.xs).filter(x=>{const a=short(x.en),b=hz(x);if(u2.has(a)||u2.has(b))return false;u2.add(a);u2.add(b);return true}).slice(0,5);
    if(xs.length<3){solved++;return next()}
    const L=shuffle(xs.map((x,i)=>({i,c:true}))),R=shuffle(xs.map((x,i)=>({i,c:false}))),tiles=L.flatMap((a,r)=>[a,R[r]]);let sel=null,left=xs.length,miss=0;
    card(`<p class="eyebrow">Match the pairs</p><div class="mgrid cols umatch" id="mg">${tiles.map((a,j)=>{const x=xs[a.i];return `<button class="mt" data-j="${j}" type="button">${a.c?`<span class="han${x.kind==='w'?' mw':''}">${hz(x)}</span>`:esc(short(x.en))}</button>`}).join('')}</div>`);
    $('mg').onclick=e=>{const b=e.target.closest('.mt');if(!b||b.classList.contains('gone'))return;const a=tiles[+b.dataset.j];
      if(!sel){sel=b;b.setAttribute('aria-pressed','true');if(a.c)speak(xs[a.i]);return}
      const s=tiles[+sel.dataset.j];if(sel===b){b.removeAttribute('aria-pressed');sel=null;return}
      if(s.c===a.c){sel.removeAttribute('aria-pressed');sel=b;b.setAttribute('aria-pressed','true');if(a.c)speak(xs[a.i]);return}
      if(s.i===a.i){[sel,b].forEach(z=>{z.removeAttribute('aria-pressed');z.classList.add('gone')});sel=null;if(!a.c)speak(xs[a.i]);if(--left===0)answered(t,miss<=1,'')}
      else{miss++;[sel,b].forEach(z=>{z.removeAttribute('aria-pressed');z.classList.remove('shake');void z.offsetWidth;z.classList.add('shake')});sel=null}}}
  function buildTask(t){const s=t.s,z=sentHz(s),words=z.map((c,i)=>({c,i})).filter(w=>!isPunct(w.c)),bank=shuffle(words),picked=[];let locked=false,marks=null,n=0;
    card(`<p class="eyebrow">${t.listen?'Listen and build the sentence':'Build the sentence'}</p>${t.listen?`<button class="play huge" id="sp" type="button">${PLAY}Play sentence</button>`:`<p class="meaning" style="font-size:1.2rem;font-weight:700">${esc(s.en)}</p><button class="play" id="sp" type="button">${PLAY}Hint: listen</button>`}
      <div class="ansrow" id="ar" aria-label="Your sentence" data-end="${endMark(z,s.en)}"></div><div class="bank" id="bk">${bank.map((w,j)=>`<button class="chunk han" data-j="${j}" type="button">${esc(w.c)}</button>`).join('')}</div>
      <div class="btns" id="bbt"><button class="btn ghost" id="clr" type="button">Clear</button><button class="btn" id="chk" type="button" disabled>Check</button></div>`);
    $('sp').onclick=()=>speakSent(s);if(t.listen)setTimeout(()=>speakSent(s),250);
    const render=()=>{$('ar').innerHTML=picked.map((j,k)=>`<button class="chunk han${marks?(marks[k]?' cok':' cbad'):''}" data-n="${k}" type="button">${esc(bank[j].c)}</button>`).join('');
      M().querySelectorAll('#bk .chunk').forEach(b=>b.classList.toggle('used',picked.includes(+b.dataset.j)));$('chk').disabled=locked||picked.length!==bank.length};
    const dr=dragReorder($('ar'),picked,render,()=>locked,$('bk'),()=>{marks=null});
    $('bk').onclick=e=>{const b=e.target.closest('.chunk');if(!b||locked||dr.dragged()||picked.includes(+b.dataset.j))return;marks=null;picked.push(+b.dataset.j);render()};
    $('ar').onclick=e=>{const b=e.target.closest('.chunk');if(!b||locked||dr.dragged())return;marks=null;picked.splice(+b.dataset.n,1);render()};
    $('clr').onclick=()=>{if(!locked){picked.length=0;marks=null;render()}};
    $('chk').onclick=()=>{if(locked)return;n++;const got=picked.map(j=>bank[j].c),want=words.map(w=>w.c),ok=got.join('')===want.join('');
      if(!ok&&n===1){marks=got.map((c,k)=>c===want[k]);render();$('fb').innerHTML=`<div class="fb bad"><h3>Not quite.</h3><p>Pieces in red are in the wrong place. Fix the order and check again.</p></div>`;return}
      locked=true;marks=null;render();$('bbt').hidden=true;speakSent(s);answered(t,ok&&n===1,`${rubyHtml(s)}<p>${esc(s.en)}</p>`)};
    render()}
  function writeTask(t){const x=t.x;let c=hz(x);if(!STROKES||!STROKES[c])c=x.s;if(!STROKES||!STROKES[c]||typeof HanziWriter==='undefined'){solved++;return next()}
    const mem=t.lv>1,css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim(),N=STROKES[c].strokes.length;
    card(`<p class="eyebrow">${mem?'Write it from memory':'Trace the character'}</p><div class="wprompt"><span class="py" style="font-size:1.5rem">${pyHtml(x.p)}</span><span class="hint">${esc(short(x.en))}</span></div>
      <div class="pad upad" id="upad"><svg class="guide" viewBox="0 0 100 100" aria-hidden="true"><g stroke="currentColor" stroke-opacity=".18" stroke-width=".6" stroke-dasharray="2 2" fill="none"><line x1="0" y1="50" x2="100" y2="50"/><line x1="50" y1="0" x2="50" y2="100"/><line x1="0" y1="0" x2="100" y2="100"/><line x1="100" y1="0" x2="0" y2="100"/></g></svg><div class="hw" id="uhw"></div></div>
      <p class="strokes" id="ust2">${esc(`Stroke 1 of ${N}`)}</p><div class="btns" id="uwb"><button class="btn ghost" id="unow" type="button">Can't write now</button></div>`,'uwrite');
    const size=$('upad').clientWidth;let mis=0,dn=0;
    const w=hwCreate('uhw',c,{width:size,height:size,padding:size*.06,showCharacter:false,showOutline:!mem,strokeColor:css('--ink'),outlineColor:css('--outline')||css('--line'),drawingColor:css('--accent'),highlightColor:css('--accent'),drawingWidth:Math.max(14,size/16),charDataLoader:(ch,ok,err)=>STROKES[ch]?ok(STROKES[ch]):err()});
    const st=()=>{$('ust2').textContent=`Stroke ${Math.min(dn+1,N)} of ${N}`+(mis?` · mistakes ${mis}`:'')};
    w.quiz({leniency:wlen(),acceptBackwardsStrokes:true,showHintAfterMisses:t.lv>=3?2:3,highlightOnComplete:true,onMistake:()=>{mis++;st()},onCorrectStroke:()=>{dn++;st()},
      onComplete:({totalMistakes})=>{$('uwb').hidden=true;speak(x);answered(t,totalMistakes<=Math.max(2,Math.round(N/3)),answerLine(x))}});
    $('unow').onclick=()=>{noWrite=true;solved++;next()}}
  const NONE='∅',gz=s=>state.script==='t'?toTrad(s):s;
  function gcardTask(t){const g=t.g;card(`<p class="eyebrow">New grammar</p><h2 class="ugt">${esc(g.t)}</h2><p>${esc(g.ex)}</p><p class="gpat">${esc(g.pat)}</p>
      <div class="geg">${g.eg.slice(0,3).map(([zz,p,e])=>`<div class="ge"><div><span class="han">${esc(gz(zz))}</span><span class="pyl">${pyHtml(p)}</span><span class="en">${esc(e)}</span></div><button class="play" data-gsay="${esc(zz)}" type="button" aria-label="Play">${PLAY}</button></div>`).join('')}</div>
      ${g.tip?`<p class="gtip"><b>Watch out:</b> ${esc(g.tip)}</p>`:''}<div class="btns"><button class="btn" id="ucont" type="button">Continue ›</button></div>`);
    M().querySelectorAll('[data-gsay]').forEach(b=>b.onclick=()=>sayText(b.dataset.gsay));$('ucont').onclick=next;keyHandler=e=>{if(e.key==='Enter'){e.preventDefault();next()}}}
  function gramTask(t){const g=t.g,qq=t.q,full=qq[0]==='c'?qq[1].replace('＿',qq[2][0]===NONE?'':qq[2][0]):qq[0]==='p'?qq[1][0]:qq[1].join('').replace(/\s+/g,'')+endMark(null,qq[2]);
    const fin=ok=>{sayText(full);answered(t,ok,`<p class="han gans">${esc(gz(full))}</p><p>${esc(qq[0]==='c'?qq[3]:qq[2])}</p>`)};
    if(qq[0]!=='o'){const os=shuffle(qq[0]==='c'?qq[2]:qq[1]),right=qq[0]==='c'?qq[2][0]:qq[1][0];
      card(`<p class="eyebrow">${esc(g.t)}</p>${qq[0]==='c'?`<p class="hint">Fill in the gap.</p><p class="gq han">${esc(gz(qq[1])).replace('＿','<span class="gblank">＿＿</span>')}</p><p class="muted gen">${esc(qq[3])}</p>`:`<p class="hint">Which sentence is correct?</p><p class="muted gen">${esc(qq[2])}</p>`}
        <div class="opts ${qq[0]==='p'?'one ':''}gopts" id="qo">${os.map((o,k)=>`<button class="opt${qq[0]==='c'?' c':''}" data-k="${k}" type="button">${o===NONE?'<i>(nothing)</i>':`<span class="han">${esc(gz(o))}</span>`}</button>`).join('')}</div>`,'gdcard');
      $('qo').onclick=e=>{const b=e.target.closest('.opt');if(!b||$('qo').dataset.done)return;$('qo').dataset.done=1;const ok=os[+b.dataset.k]===right;
        M().querySelectorAll('#qo .opt').forEach(o=>{o.disabled=true;if(os[+o.dataset.k]===right)o.classList.add('right');else if(o===b)o.classList.add('wrong')});fin(ok)};
      keyHandler=e=>{const n=+e.key;if(n>=1&&n<=os.length)M().querySelectorAll('#qo .opt')[n-1].click()};return}
    let bank=shuffle(qq[1].map((c,k)=>({c,k})));for(let i=0;i<5&&qq[1].length>2&&bank.every((b,k)=>b.c===qq[1][k]);i++)bank=shuffle(bank);const pk=[];let locked=false;
    card(`<p class="eyebrow">${esc(g.t)}</p><p class="hint">Put the words in the right order.</p><p class="muted gen">${esc(qq[2])}</p>
      <div class="ansrow" id="ar" aria-label="Your sentence" data-end="${endMark(null,qq[2])}"></div><div class="bank" id="bk">${bank.map((b,k)=>`<button class="chunk han" data-j="${k}" type="button">${esc(gz(b.c))}</button>`).join('')}</div>
      <div class="btns" id="gbt"><button class="btn ghost" id="clr" type="button">Clear</button><button class="btn" id="chk" type="button" disabled>Check</button></div>`,'gdcard');
    const render=()=>{$('ar').innerHTML=pk.map((j,n)=>`<button class="chunk han" data-n="${n}" type="button">${esc(gz(bank[j].c))}</button>`).join('');
      M().querySelectorAll('#bk .chunk').forEach(b=>b.classList.toggle('used',pk.includes(+b.dataset.j)));$('chk').disabled=locked||pk.length!==bank.length};
    const dr=dragReorder($('ar'),pk,render,()=>locked,$('bk'));
    $('bk').onclick=e=>{const b=e.target.closest('.chunk');if(!b||locked||pk.includes(+b.dataset.j)||dr.dragged())return;pk.push(+b.dataset.j);render()};
    $('ar').onclick=e=>{const b=e.target.closest('.chunk');if(!b||locked||dr.dragged())return;pk.splice(+b.dataset.n,1);render()};
    $('clr').onclick=()=>{if(!locked){pk.length=0;render()}};
    $('chk').onclick=()=>{if(locked)return;locked=true;const got=pk.map(j=>bank[j].c).join(''),ok=got===qq[1].join('')||(qq[3]||[]).includes(got);
      $('ar').querySelectorAll('.chunk').forEach(c=>c.classList.add(ok?'cok':'cbad'));$('gbt').hidden=true;fin(ok)};render()}
  function finish(){keyHandler=null;
    // every item of a words unit counts as met, even one that was only in an intro or a match
    if(u.kind==='w'&&!extra)u.items.forEach(x=>gradeOnce(x,!missed.has(x)));
    if(!extra)unitSave(l,u,lv);
    const mi=[...missed];
    const acc=asked?Math.round(firstOk/asked*100):100,sec=Math.max(1,Math.round((Date.now()-t0)/1e3)),took=sec<60?`${sec} s`:`${sec/60|0} min ${sec%60} s`,us=lessonUnits(l),nx=unitNow(),last=us.filter(v=>v.kind!=='f').every(v=>unitLv(l,v)>0)&&!sealOf(l);
    const nxt=nx.l===l&&nx.u===u?null:nx;
    open(ubar(100,0)+`<div class="card udone"><p class="eyebrow">${esc(`${LNAME(l)} · ${unitName(l,u)}`)}</p><h2>${extra?'Mistakes practised':lv>=UNIT_MAX?'Gold!':lv>1?'Level up!':'Unit complete!'}</h2>
      <span class="score">${acc}%</span><p class="hint">${esc(`right the first time · ${took}`)}</p>${lvDots(unitStored(l,u))}
      ${u.kind==='w'?`<div class="uwords">${u.items.map(x=>`<span class="uw${missed.has(x)?' miss':''}"><b class="han">${hzHtml(x)}</b><small>${pyHtml(x.p)}</small>${starHtml(x,'xs-in')}</span>`).join('')}</div>`:''}
      ${last?`<p class="ufin">${esc(`Every unit of ${LNAME(l)} is done. Take the Final test to stamp the seal.`)}</p>`:''}
      ${mi.length?`<button class="btn ghost umist" id="umist" type="button">${esc(`Practise the ${mi.length} mistakes`)}</button>`:''}<div class="btns"><button class="btn ghost" data-go="album" type="button">Your path</button>${last?`<button class="btn" id="ufinal" type="button">Final test ›</button>`:nxt?`<button class="btn" id="unext" type="button">Continue ›</button>`:''}</div></div>`);
    if($('umist'))$('umist').onclick=()=>unitPlay(l,u,lv,mi);
    if($('ufinal'))$('ufinal').onclick=()=>startStep(l,'final');if($('unext'))$('unext').onclick=()=>unitRun(nxt.l,nxt.u.id)}
  next();
}
