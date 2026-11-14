/* ---------- HSK 1 practice test: 40 questions in the format of the official HSK 1 sample test (listening 4 parts, reading
   4 parts). hsk1-tests.json is built by hsk1/build.py from hsk1/tests.txt; the questions are written for this app and use only
   HSK 1 words, the pictures are emoji. Answers are checked at the end, as in the real test. Best scores: state.hskt. ---------- */
let HT=null;var HT_PLAY=null;
async function loadHT(){if(HT)return HT;const r=await fetch('hsk1-tests.json');if(!r.ok)throw new Error(r.status);HT=await r.json();return HT}
const HT_PARTS={l1:'Listen and choose the picture.',l2:'Listen to the question and choose the reply.',l3:'Listen to the dialogue and choose the picture.',l4:'Listen, then answer the question.',
  r1:'Read the sentence and choose the picture.',r2:'Choose the reply to each question.',r3:'Choose the word for the gap.',r4:'Read, then answer the question.'};
const HT_L='ABCDEF';
// a text with pinyin over every word, as in the HSK 1 test paper
function htText(lines,cls=''){const zh=t=>state.script==='t'?toTrad(t):t;
  return `<span class="htx ${cls}" lang="zh-Hans">${lines.map(([sp,ts,ps])=>`<span class="htl">${sp?`<b class="spk">${sp==='f'?'女':'男'}：</b>`:''}${ts.map((t,i)=>t==='＿'?'<span class="tgap">(  )</span>':PUNCT_RE.test(t)?`<span class="pu">${t}</span>`:`<ruby>${esc(zh(t))}<rt>${esc(ps[i])}</rt></ruby>`).join('')}</span>`).join('')}</span>`}
const PUNCT_RE=/^[，。？！、：]$/;
// each recording is played twice; in a dialogue the woman's lines are higher, the man's lower
function htPlay(lines,times=2){stopAudio();if(!('speechSynthesis' in window))return;
  const seq=[];for(let r=0;r<times;r++)lines.forEach((l,i)=>seq.push({t:l[1].filter(x=>x!=='＿').join(''),sp:l[0],wait:r>0&&i===0}));
  const tok={};HT_PLAY=tok;let i=0;
  const next=()=>{if(HT_PLAY!==tok||i>=seq.length){if(HT_PLAY===tok)HT_PLAY=null;return}const s=seq[i++];
    const go=()=>{if(HT_PLAY!==tok)return;const u=new SpeechSynthesisUtterance(s.t);u.lang='zh-CN';if(voice)u.voice=voice;u.rate=state.rate||.8;u.pitch=s.sp==='m'?.7:s.sp==='f'?1.3:1;
      u.onend=u.onerror=()=>setTimeout(next,s.sp?300:0);UTT=u;speechSynthesis.speak(u)};
    s.wait?setTimeout(go,1600):go()};
  next()}
function htFlat(T){const Q=[];
  const add=(sec,part,q)=>Q.push({sec,part,...q});
  T.l1.forEach(q=>add('l',1,{audio:q.t,pics:q.o,k:q.k}));
  T.l2.forEach(q=>add('l',2,{audio:q.t,opts:q.o,k:q.k}));
  T.l3.q.forEach(q=>add('l',3,{audio:q.t,pics:T.l3.pics,k:q.k,six:1}));
  T.l4.forEach(q=>add('l',4,{audio:[...q.t,['',['问：'],['']],...q.q],shown:q.q,opts:q.o,k:q.k}));
  T.r1.q.forEach(q=>add('r',1,{text:q.t,pics:T.r1.pics,k:q.k,six:1}));
  T.r2.q.forEach(q=>add('r',2,{text:q.t,opts:T.r2.ans,k:q.k,six:1}));
  T.r3.q.forEach(q=>add('r',3,{text:q.t,words:T.r3.words,k:q.k,six:1}));
  T.r4.forEach(q=>add('r',4,{text:q.t,ask:q.q,opts:q.o,k:q.k}));
  return Q}
async function hskTest(){
  if(!HT){open(bar(0,'','‹ Home')+'<div class="card"><p class="hint">Loading…</p></div>');try{await loadHT()}catch(e){open(bar(0,'','‹ Home')+'<div class="card"><p>The practice tests could not be loaded. Check your connection and try again.</p></div>');return}}
  const best=state.hskt||{};
  open(bar(0,'','‹ Home')+`<div class="shead"><span class="ic">考</span><div><h2>HSK 1 practice test</h2><p class="muted">40 questions in the format of the official HSK 1 test.</p></div></div>
    <div class="htinfo"><div><b>Listening</b><span>20 questions · about 12 min</span><small>Every recording plays twice.</small></div><div><b>Reading</b><span>20 questions · 20 min</span><small>With pinyin, as in the test.</small></div></div>
    <div class="htsets">${HT.map((T,i)=>{const b=best[T.n];return `<button class="htset" data-ht="${i}" type="button"><span class="htn">${esc(T.n)}</span><span><b>${esc('Practice test '+T.n)}</b><small>${b?esc(`Best: ${b.s} / 40`):esc('Not taken yet')}</small></span><span class="go" aria-hidden="true">›</span></button>`}).join('')}</div>
    <p class="hint">The answers are checked at the end, as in the real test. The questions were written for this app with HSK 1 words only, in the format of the official sample test (CLEC 2025); the pictures are emoji.</p>`);
  M().querySelectorAll('[data-ht]').forEach(b=>b.onclick=()=>htRun(HT[+b.dataset.ht]));
}
function htRun(T){
  const Q=htFlat(T),ans=Array(Q.length).fill(null);let qi=0,rStart=null;
  const secName=s=>s==='l'?'Listening':'Reading';
  function render(){
    clearInterval(TIMER);
    const q=Q[qi],first=qi===0||Q[qi-1].part!==q.part||Q[qi-1].sec!==q.sec;
    if(q.sec==='r'&&!rStart)rStart=Date.now();
    const key=q.sec+q.part,head=`<div class="hthead"><p class="eyebrow">${esc(`${secName(q.sec)} · Part ${q.part}`)} <span class="htnum">${qi+1}</span></p><p class="htins">${esc(HT_PARTS[key])}</p></div>`;
    let body='';
    if(q.sec==='l')body+=`<button class="play huge" id="htp" type="button">${PLAY}<span>Play again</span></button>`;
    if(q.text)body+=`<div class="htq">${htText(q.text)}</div>`;
    if(q.ask)body+=`<div class="htq htask"><span class="star" aria-hidden="true">★</span>${htText(q.ask)}</div>`;
    const pick=ans[qi];
    if(q.words)body=`<div class="htbank">${q.words.map((w,i)=>`<button class="htw${pick===i?' sel':''}" data-a="${i}" type="button"><b>${HT_L[i]}</b>${htText([w])}</button>`).join('')}</div>`+body;
    else if(q.pics)body+=`<div class="htpics${q.six?' six':''}">${q.pics.map((p,i)=>`<button class="htpic${pick===i?' sel':''}" data-a="${i}" type="button" aria-label="${HT_L[i]}"><span class="emo" aria-hidden="true">${p}</span><b>${HT_L[i]}</b></button>`).join('')}</div>`;
    else body+=`<div class="htopts">${q.opts.map((o,i)=>`<button class="htopt${pick===i?' sel':''}" data-a="${i}" type="button"><b>${HT_L[i]}</b>${htText(o)}</button>`).join('')}</div>`;
    const left=rStart?Math.max(0,20*60-Math.round((Date.now()-rStart)/1000)):null;
    open(bar(Math.round(qi/Q.length*100),(qi+1)+' / '+Q.length)+`<div class="card top-align htcard">${head}${body}
      <div class="btns htnav"><button class="btn ghost" id="htb" type="button" ${qi&&Q[qi-1].sec===q.sec?'':'disabled'}>‹ Back</button>${q.sec==='r'?`<span class="httime${left===0?' out':''}" id="htt" aria-label="Time left">${fmtT(left)}</span>`:''}<button class="btn" id="htn" type="button" ${pick==null?'disabled':''}>${qi===Q.length-1?'Hand in':'Next ›'}</button></div></div>`);
    if(q.sec==='l'){$('htp').onclick=()=>htPlay(q.audio);if(first||pick==null)setTimeout(()=>htPlay(q.audio),first?500:300)}
    if(q.sec==='r')TIMER=setInterval(()=>{const el=$('htt');if(!el)return clearInterval(TIMER);const s=Math.max(0,20*60-Math.round((Date.now()-rStart)/1000));el.textContent=fmtT(s);el.classList.toggle('out',!s)},1000);
    M().querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{ans[qi]=+b.dataset.a;M().querySelectorAll('[data-a]').forEach(x=>x.classList.toggle('sel',x===b));$('htn').disabled=false});
    $('htn').onclick=()=>{if(ans[qi]==null)return;stopAudio();if(qi===Q.length-1)return end();qi++;render()};
    $('htb').onclick=()=>{if(qi){stopAudio();qi--;render()}};
    keyHandler=e=>{const n='abcdef'.indexOf(e.key.toLowerCase());const bs=M().querySelectorAll('[data-a]');if(n>=0&&bs[n]){e.preventDefault();bs[n].click()}else if(e.key==='Enter'&&ans[qi]!=null){e.preventDefault();$('htn').click()}};
  }
  const fmtT=s=>s==null?'':`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  function end(){clearInterval(TIMER);keyHandler=null;
    const ok=Q.map((q,i)=>ans[i]===q.k),sc=ok.filter(Boolean).length,ls=Q.filter((q,i)=>q.sec==='l'&&ok[i]).length,rs=sc-ls;
    const prev=(state.hskt||{})[T.n];state.hskt={...(state.hskt||{}),[T.n]:{s:Math.max(sc,prev?prev.s:0),last:sc,d:todayStr()}};saveState();
    const parts=['l1','l2','l3','l4','r1','r2','r3','r4'].map(k=>{const qs=Q.map((q,i)=>[q,i]).filter(([q])=>q.sec+q.part===k);return `<div class="htpart"><span>${esc((k[0]==='l'?'Listening ':'Reading ')+k[1])}</span><span class="htdots">${qs.map(([q,i])=>`<i class="${ok[i]?'ok':'bad'}" title="${i+1}"></i>`).join('')}</span><b>${qs.filter(([,i])=>ok[i]).length} / ${qs.length}</b></div>`}).join('');
    const shown=q=>q.text||(q.shown?q.audio.slice(0,q.audio.findIndex(l=>l[1][0]==='问：')):q.audio),opt=(q,i)=>q.pics?`<span class="emo">${q.pics[i]}</span>`:q.words?htText([q.words[i]]):htText(q.opts[i]);
    const wrong=Q.map((q,i)=>[q,i]).filter(([,i])=>!ok[i]);
    open(bar(100,Q.length+' / '+Q.length)+`<div class="card"><p class="eyebrow">${esc('Practice test '+T.n)}</p><span class="score">${sc} / 40</span>
      <p><span>${esc(`Listening ${ls} / 20`)}</span> · <span>${esc(`Reading ${rs} / 20`)}</span></p>
      <div class="htparts">${parts}</div><div class="btns"><button class="btn ghost" data-go="hsktest" type="button">‹ Practice tests</button><button class="btn" id="htag" type="button">Take it again</button></div></div>
      ${wrong.length?`<h3 class="htrh">${esc(`To look at again (${wrong.length})`)}</h3><div class="htrev">${wrong.map(([q,i])=>`<div class="htr"><p class="eyebrow">${esc(`${i+1} · ${secName(q.sec)} ${q.part}`)}</p>
        <div class="htq">${htText(shown(q))}</div>${q.shown?`<div class="htq htask"><span class="hint">问：</span>${htText(q.shown)}</div>`:''}${q.ask?`<div class="htq htask"><span class="star" aria-hidden="true">★</span>${htText(q.ask)}</div>`:''}
        ${q.sec==='l'?`<button class="play" data-htr="${i}" type="button">${PLAY}Play</button>`:''}
        <p class="htra"><span class="bad"><span>Your answer:</span> ${HT_L[ans[i]]}</span> ${opt(q,ans[i])}</p><p class="htra"><span class="ok"><span>Right answer:</span> ${HT_L[q.k]}</span> ${opt(q,q.k)}</p></div>`).join('')}</div>`:''}`);
    $('htag').onclick=()=>htRun(T);
    M().querySelectorAll('[data-htr]').forEach(b=>b.onclick=()=>htPlay(Q[+b.dataset.htr].audio,1));
    if(sc===40)setTimeout(confetti,300);
  }
  render();
}

