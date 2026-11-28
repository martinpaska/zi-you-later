/* ---------- Your path: an album of seals, one per lesson. A seal fills with ink as the lesson's characters and words are
   learnt (learning counts half, known counts full) and is stamped for good when its Final test is passed with 80 % or more.
   Stamped seals are kept in state.seals ('hsk1:5' → {d,s}), so they sync with the account. ---------- */
/* each course has its own seals: Chinese 1 (Intro + Lessons 1–10 of Integrated Chinese 1/1), HSK 1 (15 lessons), HSK 2 (17) and HSK 3 (22).
   HSK 2 and 3 have no practice test yet (no official sample test of the new format), so their goal is the grammar. */
const PATHS={
  hsk1:HSK1&&{lessons:HSK1.meta.lessons,write:HSK1.meta.write,story:'A year in Beijing',intro:'You have just landed in Beijing for a year. Every lesson is a stop on the way, and every stop gives you a seal.',
    chapters:[['The basics',['1','2','3','4','5'],'You have just landed in Beijing.'],
      ['Everyday life',['6','7','8','9','10','11'],'You live with a Chinese family now.'],
      ['School and work',['12','13','14'],'Chinese classes and a first part-time job.'],
      ['Chinese culture',['15'],'Tea and dumplings with the family.']],
    goal:{zh:'考',t:'The HSK 1 test',d:'Forty questions, listening and reading. Try the practice test whenever you like.',b:'HSK 1 practice test ›',go:'data-go="hsktest"'}},
  hsk2:PACK_DATA.hsk2&&{lessons:PACK_DATA.hsk2.meta.lessons,write:PACK_DATA.hsk2.meta.write,story:'Back in China',intro:'Your second year in China: you know your way around now. Every lesson is a step further, and every step gives you a seal.',
    chapters:[['People and things',['1','2','3','4','5'],'New friends, new things, a new neighbourhood.'],
      ['Out and about',['6','7','8','9','10','11'],'Cafés, metro rides, shops and a game of football.'],
      ['Home, school and work',['12','13','14','15'],'Exams at school and your first real job.'],
      ['Family and New Year',['16','17'],'New Year with your Chinese grandparents.']],
    goal:{zh:'考',t:'The HSK 2 test',d:'A practice test in the new HSK 2 format comes once the official sample test is out. Until then, the grammar of every lesson is waiting for you.',b:'Grammar ›',go:'data-mode="grammar"'}},
  hsk3:PACK_DATA.hsk3&&{lessons:PACK_DATA.hsk3.meta.lessons,write:PACK_DATA.hsk3.meta.write,story:'Living in China',intro:'You live in China now, with a flat, a job and friends. Every lesson is a part of your new life, and every part gives you a seal.',
    chapters:[['A new life',['1','2','3','4','5','6'],'New faces, a bank card, dinner out and a train ticket.'],
      ['Home and family',['7','8','9','10'],'A cold, a weekend off, a flat of your own.'],
      ['Study and work',['11','12','13','14','15'],'Classes, the school sports day and the office.'],
      ['Nature and the city',['16','17','18'],'Seasons, places and a city that keeps changing.'],
      ['Culture',['19','20','21','22'],'Shows, matches, chopsticks and festivals.']],
    goal:{zh:'考',t:'The HSK 3 test',d:'A practice test in the new HSK 3 format comes once the official sample test is out. Until then, the grammar of every lesson is waiting for you.',b:'Grammar ›',go:'data-mode="grammar"'}},
  cin1:{lessons:Object.entries({I:'人',1:'好',2:'家',3:'天',4:'乐',5:'茶',6:'话',7:'汉',8:'信',9:'买',10:'车'}).sort((a,b)=>LESSONS.indexOf(a[0])-LESSONS.indexOf(b[0])).map(([l,seal])=>({l,en:LTITLE[l],zh:LZH[l],seal})),write:null,
    story:'Your first semester',intro:'Your first semester of Chinese at FF MUNI, lesson by lesson. Every lesson you finish gives you a seal.',
    chapters:[['First steps',['I','1','2'],'Strokes, tones and the first characters.'],
      ['Everyday life',['3','4','5','6'],'Dates, hobbies and appointments.'],
      ['School',['7','8'],'Back at school.'],
      ['Out and about',['9','10'],'Shopping and getting around the city.']],
    goal:{zh:'考',t:'The end of the semester',d:'The chapter tests, like in class: listening, reading, pinyin and writing.',b:'Chapter tests ›',go:'data-mode="test"'}}};
const PATH=PATHS[PACK],PL=PATH.lessons,SEAL_CHAPTERS=PATH.chapters;
const PASS=80;
var LESSON_CTX=null;   // {l, step, keep} while an exercise was started from a lesson
const lessonMeta=l=>PL.find(x=>x.l===l);
const lessonItems=l=>vUniq([...CH.filter(x=>x.l===l),...WD.filter(x=>x.l===l)]);
function lessonInk(l){const it=lessonItems(l);if(!it.length)return 0;return Math.min(100,Math.round(it.reduce((a,x)=>a+[0,.5,1][mastery(x)],0)/it.length*100))}
const sealOf=l=>(state.seals||{})[PACK+':'+l];
function nextLesson(){return unitNow().l}
function sealHtml(l,cls=''){const m=lessonMeta(l),done=!!sealOf(l),p=lessonInk(l);
  return `<span class="stamp ${done?'done':p?'prog':''} ${cls}" style="--p:${done?100:p}${done?`;transform:rotate(${[-4,3,-2,4,-3][LESSONS.indexOf(l)%5]}deg)`:''}" lang="zh-Hans"><span>${m.seal}</span></span>`}
// Home: the next lesson and the row of seals
function pathHome(){const box=$('pathbox');if(!box)return;box.hidden=false;
  const due=dueAll().length,now=unitNow(),n=now.l,got=PL.filter(x=>sealOf(x.l)).length,ch=SEAL_CHAPTERS.findIndex(c=>c[1].includes(n));
  box.innerHTML=`<h2>Your path</h2><button class="jcard" data-go="album" type="button">${sealHtml(n,'pn')}<span class="jct"><small class="eyebrow">${esc(PATH.story)}</small><b>${esc(`Continue: ${LNAME(n)}`)}</b><small class="jnext">${esc(unitName(n,now.u))}</small>
      <span class="jbar" aria-hidden="true"><i style="width:${Math.round(got/PL.length*100)}%"></i></span><small><span>${esc(`Chapter ${ch+1}`)}</span> · <span>${esc(SEAL_CHAPTERS[ch][0])}</span> · <span>${esc(`${got} / ${PL.length} seals`)}</span></small></span><span class="go" aria-hidden="true">›</span></button>
${due?`<button class="premind" id="premind" type="button"><span class="prdot" aria-hidden="true">${due>99?'99+':due}</span><span><b>${esc(due===1?'1 card to review today':`${due} cards to review today`)}</b><small>A few minutes keep them in your head.</small></span><span class="go" aria-hidden="true">›</span></button>`:''}`;
  if($('premind'))$('premind').onclick=()=>review();
  $('rvsec').hidden=true;remindSave();   // Today's review is not a section of Home; cards that are due show as a reminder
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-lsheet]');if(b){e.preventDefault();lessonSheet(b.dataset.lsheet)}});
/* Your path: the course told as a story. Each chapter opens with a few lines of the story; its lessons follow, each a
   sheet of an old map with its units as stamps on the road (js/units.js), and the path ends at the course's goal. The
   button at the bottom always starts the next unit; the page opens where you are. */
function album(){lessonRestore();
  const got=PL.filter(x=>sealOf(x.l)).length,now=unitNow();let k=0;
  open(bar(0,'','‹ Home')+`<div class="journey"><div class="jhead"><div class="jtop"><p class="eyebrow">Your path</p>${pyBtn()}</div><h2>${esc(PATH.story)}</h2><p class="hint">${esc(PATH.intro)}</p>
      <div class="jprog"><span class="jbar"><i style="width:${Math.round(got/PL.length*100)}%"></i></span><b>${esc(`${got} / ${PL.length} seals`)}</b></div></div>
    ${SEAL_CHAPTERS.map(([cn,ls,story],ci)=>`<section class="jch"><div class="jchh"><p class="jnum" lang="zh-Hans" aria-label="${esc(`Chapter ${ci+1}`)}"><span>第${'一二三四五六七八九十'[ci]}章</span></p><h3>${esc(cn)}</h3><p class="jq">„<span>${esc(story)}</span>“</p></div>
      ${ls.map(l=>{const h=lessonPathHtml(l,k);k+=lessonUnits(l).length;return h}).join('')}</section>`).join('')}
    <section class="jgoal"><span class="jflag" aria-hidden="true">${PATH.goal.zh}</span><div><p class="eyebrow">Goal</p><h3>${esc(PATH.goal.t)}</h3><p class="hint">${esc(PATH.goal.d)}</p>
      <button class="btn ghost" ${PATH.goal.go} type="button">${esc(PATH.goal.b)}</button></div></section>
    <div class="tdock"><button class="tcta" id="tcta" type="button"><span class="tsign" lang="zh-Hans">${unitGlyph(now.l,now.u)}</span><span class="ttx"><b><span>${esc(`Continue: ${LNAME(now.l)}`)}</span> · <span>${esc(unitName(now.l,now.u))}</span></b><small${now.u.kind==='w'?' class="han"':''}>${esc(unitWords(now.l,now.u))}</small></span><span class="tar" aria-hidden="true">›</span></button></div></div>`);
  $('tcta').onclick=()=>now.u.kind==='f'?startStep(now.l,'final'):unitRun(now.l,now.u.id);
  // the path opens where you are
  const cur=M().querySelector('.unode.cur');if(cur&&cur.getBoundingClientRect().top>innerHeight*.6)cur.scrollIntoView({block:'center'});
}
// the steps of a lesson; a step started from here is remembered when its round is finished
function lessonSheet(l){
  const m=lessonMeta(l),it=lessonItems(l),ws=it.filter(x=>x.kind==='w'),cs=it.filter(x=>x.kind==='c'),wr=cs.filter(x=>!PATH.write||PATH.write.includes(x.s));
  const nw=ws.length?ws:cs,seen=nw.filter(x=>rec(x)&&rec(x).n).length,   // a lesson without words (the Chinese 1 Intro) learns its characters
   known=it.filter(x=>mastery(x)===2).length,flags=((state.lsteps||{})[PACK+':'+l])||{},s=sealOf(l);
  const steps=[['learn','Learn the new words',`${seen} / ${nw.length}`,seen>=nw.length],['cards','Flashcards',`${known} known`,known>=Math.ceil(it.length*.6)],
    ['tones','Tones in words','',ws.length?!!flags.tones:null],['grammar','Grammar',`${(GRAMMAR[l]||[]).length} ${(GRAMMAR[l]||[]).length===1?'point':'points'}`,(GRAMMAR[l]||[]).length?!!flags.grammar:null],['sentences','Sentences',`${ST.filter(x=>x.l===l).length} sentences`,ST.some(x=>x.l===l)?!!flags.sentences:null],
    ['write','Writing characters',`${wr.length} ${wr.length===1?'character':'characters'}`,!wr.length||!!flags.write],['final','Final test',s?`${s.s} %`:`from ${PASS} %`,!!s]];
  if(s)steps.forEach(x=>{if(x[3]!==null)x[3]=true});   // a stamped seal: the whole lesson counts as done
  const rec_=steps.find(x=>x[3]===false);
  const saved=keyHandler,sh=document.createElement('div');sh.className='nsheet';
  sh.innerHTML=`<div class="npanel" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="lst" style="height:auto;max-height:92svh"><div class="nhead"><span class="ngrab" aria-hidden="true"></span>
    <button class="nclose" id="lsx" type="button">${T_('Close')}</button><span></span><span></span></div>
    <div class="nbody"><div class="lsh">${sealHtml(l,'lg')}<div><h2 id="lst">${esc(T_(LNAME(l)))} · ${esc(T_(m.en))}</h2><p class="hint" style="margin:2px 0 0"><span lang="zh-Hans">${m.zh}</span> · ${esc(T_(`${ws.length} words · ${cs.length} characters`))}</p>
      <p class="lshp">${s?esc(T_('Completed')):esc(T_(`${lessonInk(l)}% done`))}</p></div></div>
    <div class="lsteps">${steps.map(([k,n,c,done],i)=>`<button class="lstep${done?' ok':''}${rec_&&rec_[0]===k?' now':''}" data-step="${k}" type="button"${done===null?' disabled':''}><span class="dot">${done?'✓':k==='final'?'印':i+1}</span><span class="ln">${esc(T_(n))}</span>${rec_&&rec_[0]===k?'<span class="lgo" aria-hidden="true">›</span>':k==='final'&&s?`<small>${s.s} %</small>`:''}</button>`).join('')}</div>
    ${rec_?`<button class="btn lscta" data-step="${rec_[0]}" type="button">${esc(T_('Continue: '+rec_[1]))}</button>`:`<button class="btn ghost lscta" data-step="final" type="button">${esc(T_('Take the Final test again'))}</button>`}</div></div>`;
  document.body.appendChild(sh);document.body.style.overflow='hidden';sheetFocus(sh);
  const close=()=>{sh.remove();document.body.style.overflow='';keyHandler=saved};
  sh.onclick=e=>{if(e.target===sh)return close();const b=e.target.closest('[data-step]');if(!b||b.disabled)return;close();startStep(l,b.dataset.step)};
  $('lsx').onclick=close;keyHandler=e=>{if(e.key==='Escape'){e.preventDefault();close()}};
}
// a step works on its lesson only; the lessons chosen for the daily review come back on the way home
function startStep(l,step){
  const keep=(LESSON_CTX&&LESSON_CTX.keep)||{sel:state.sel,set:state.set,filter:state.filter};
  state.sel=new Set([l]);state.filter='all';
  if(step==='final'){LESSON_CTX={l,step,keep};return finalTest(l)}
  state.set=step==='write'||step==='cards'||(step==='learn'&&!WD.some(x=>x.l===l))?'c':'w';LESSON_CTX={l,step,keep};
  if(step==='learn')learn();else if(step==='cards')cards();else if(step==='tones')toneFill();else if(step==='write')write();
  else if(step==='grammar')grammar(l);else if(step==='sentences')build(ST.filter(x=>x.l===l),false);
}
// called by open(): at the end of a round started from a lesson, mark the step and offer the way back
// save the state with the lessons chosen for the review (not the one lesson of the step that is running)
function saveKept(){const k=LESSON_CTX&&LESSON_CTX.keep,now={sel:state.sel,set:state.set,filter:state.filter};if(k)Object.assign(state,k);saveState();Object.assign(state,now)}
function lessonRestore(){const k=LESSON_CTX&&LESSON_CTX.keep;LESSON_CTX=null;if(!k)return;Object.assign(state,k);saveState()}
function lessonRoundEnd(){
  if(!LESSON_CTX||LESSON_CTX.step==='final')return;const sc=M().querySelector('.card .score');if(!sc||M().querySelector('.lback'))return;
  const {l,step}=LESSON_CTX,key=PACK+':'+l;state.lsteps={...(state.lsteps||{}),[key]:{...((state.lsteps||{})[key]||{}),[step]:1}};saveState();
  sc.closest('.card').insertAdjacentHTML('afterend',`<div class="btns lback"><button class="btn ghost" data-lsheet="${l}" type="button">${esc(`‹ ${LNAME(l)} · ${lessonMeta(l).en}`)}</button></div>`);
}
// Final test: 16 questions on the lesson's words and characters; 80 % stamps the seal
function finalTest(l){
  const byHz=a=>[...new Map(a.map(x=>[hz(x),x])).values()];   // a character that is also a one-character word is asked once
  const it=shuffle(byHz(lessonItems(l))),pool=vUniq([...CH,...WD]),N=Math.min(16,Math.max(it.length,Math.min(12,it.length*2))),qs=[];   // a small lesson asks each item twice, in two ways
  const types=['mean','hz','listen','py'];
  for(let i=0;i<N;i++){const x=it[i%it.length],t=types[(i+(i>=it.length?1:0))%4],same=it.filter(y=>y.kind===x.kind&&y.k!==x.k&&short(y.en)!==short(x.en)&&hz(y)!==hz(x)),more=shuffle(pool.filter(y=>y.kind===x.kind&&y.k!==x.k&&hz(y)!==hz(x)&&short(y.en)!==short(x.en)));
    const opts=shuffle([x,...shuffle(same).concat(more).filter((y,k,a)=>a.findIndex(z=>(t==='hz'?short(z.en):hz(z))===(t==='hz'?short(y.en):hz(y)))===k).slice(0,3)]);qs.push({x,t,opts})}
  let qi=0,good=0;const miss=[];
  function render(){
    if(qi>=qs.length)return end();
    const q=qs[qi],x=q.x;
    const prompt=q.t==='mean'?`<p class="eyebrow">Which is it?</p><p class="ftq">${esc(short(x.en))}</p>`:q.t==='hz'?`<p class="eyebrow">What does it mean?</p><span class="han ftz" data-nosay>${hzHtml(x)}</span>`
      :q.t==='listen'?`<p class="eyebrow">Which did you hear?</p><button class="play huge" id="ftp" type="button">${PLAY}Play again</button>`:`<p class="eyebrow">Which is it?</p><p class="ftq">${pyHtml(x.p)}</p>`;
    open(tallyBar(qi-good,good,qs.length,(qi+1)+' / '+qs.length)+`<div class="card top-align ftcard"><p class="hint" style="margin:0">${esc(`Final test · ${LNAME(l)}`)}</p>${prompt}
      <div class="opts ${q.t==='hz'?'one':'chars'}" id="qo">${q.opts.map((o,k)=>`<button class="opt${q.t==='hz'?'':' c'}" data-i="${k}" type="button">${q.t==='hz'?`<span>${esc(short(o.en))}</span>`:`<span class="han">${hzHtml(o)}</span>`}</button>`).join('')}</div>
      <div id="fb" role="status" aria-live="polite" style="width:100%"></div></div>`);
    LESSON_CTX={...LESSON_CTX,l,step:'final'};
    if(q.t==='listen'){$('ftp').onclick=()=>speak(x);setTimeout(()=>speak(x),250)}
    const box=$('qo');
    const pick=k=>{if(box.classList.contains('answered'))return;box.classList.add('answered');const o=q.opts[k],ok=o===x;
      box.querySelectorAll('.opt')[q.opts.indexOf(x)].classList.add('is-ok');if(!ok){box.querySelectorAll('.opt')[k].classList.add('is-bad');miss.push(x)}else good++;
      grade(x,ok);speak(x);const last=qi===qs.length-1;
      $('fb').innerHTML=`<div class="fb ${ok?'ok':'bad'}"><h3>${ok?'Correct!':'Not quite.'}</h3>${answerLine(x)}<button class="btn" id="qn" type="button">${last?'See result':'Next ›'}</button></div>`;
      $('qn').onclick=()=>{qi++;render()};keyHandler=e=>{if(e.key==='Enter'){e.preventDefault();qi++;render()}}};
    box.onclick=e=>{const b=e.target.closest('[data-i]');if(b)pick(+b.dataset.i)};
    keyHandler=e=>{if(/^[1-4]$/.test(e.key)&&q.opts[+e.key-1])pick(+e.key-1)};
  }
  function end(){keyHandler=null;const pct=Math.round(good/qs.length*100),prev=sealOf(l);
    if(pct>=PASS){state.seals={...(state.seals||{}),[PACK+':'+l]:{d:todayStr(),s:Math.max(pct,prev?prev.s:0)}};
      saveKept();return stampScreen(l,pct,!prev)}
    const um=byHz(miss);
    open(bar(100,qs.length+' / '+qs.length)+`<div class="card"><p class="eyebrow">${esc(`Final test · ${LNAME(l)}`)}</p><span class="score">${pct}%</span>
      <p><span>${esc(`You need ${PASS}% to stamp the seal.`)}</span> <span>${esc(`${good} of ${qs.length} correct.`)}</span></p>
      ${um.length?`<p class="hint" style="margin:0">To look at again:</p><div class="mmiss">${um.map(x=>`<span class="mmi"><b class="han">${esc(hz(x))}</b> ${pyHtml(x.p)}${starHtml(x,'xs-in')}</span>`).join('')}</div>`:''}
      <div class="btns"><button class="btn ghost" data-go="album" type="button">‹ Your path</button><button class="btn" id="ftag" type="button">Try again</button></div></div>`);
    $('ftag').onclick=()=>finalTest(l);
  }
  render();
}
function stampScreen(l,pct,first){
  const m=lessonMeta(l),got=PL.filter(x=>sealOf(x.l)).length,n=PL.find(x=>!sealOf(x.l)),nx=unitNow();
  open(bar(100,'')+`<div class="stampv"><div class="spaper"><span class="sbig" lang="zh-Hans">${m.seal}</span>${[[14,20],[80,26],[22,78],[76,72]].map(([x,y],k)=>`<i class="sdrop" style="left:${x}%;top:${y}%;animation-delay:${.32+k*.04}s"></i>`).join('')}</div>
    <h2 class="swon">${first?'Seal stamped!':'Seal stamped again'}</h2><p class="hint" style="text-align:center;margin:0"><span>${esc(`${LNAME(l)} · ${m.en}`)}</span> · <span>${esc(`Final test ${pct}%`)}</span> · <span>${esc(`${got} of ${PL.length} seals`)}</span></p>
    <div class="srow">${PL.map(x=>sealHtml(x.l,'xs'+(x.l===l?' cur':''))).join('')}</div>
    <div class="btns"><button class="btn ghost" data-go="album" type="button">Your path</button>${nx.l!==l&&!sealOf(nx.l)?`<button class="btn" id="snext" type="button">${esc(`Next: ${LNAME(nx.l)} ›`)}</button>`:''}</div></div>`);
  if($('snext'))$('snext').onclick=()=>unitRun(nx.l,nx.u.id);
  try{if(navigator.vibrate)navigator.vibrate([10,60,30])}catch(e){}
  if(!n)setTimeout(confetti,500);
}

