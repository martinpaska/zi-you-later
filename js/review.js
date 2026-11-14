/* ---------- Review (spaced repetition) ---------- */
function review(){
  const due=dueAll().sort((a,b)=>rec(a).d-rec(b).d),nw=newAvail();
  const q=[];let di=0,ni=0;while(di<due.length||ni<nw.length){for(let k=0;k<3&&di<due.length;k++)q.push(due[di++]);if(ni<nw.length)q.push(nw[ni++])}
  let i=0,done=0,shown=false;const total=q.length,counts={again:0,hard:0,good:0,easy:0},studied=new Set();
  function draw(){
    if(i>=q.length)return finish();
    const x=q[i],r=rec(x),isNew=!r||!r.n;
    // New card: study it first, then it comes back a few cards later as a real test.
    if(isNew&&!studied.has(x.k)){
      open(tallyBar(counts.again,counts.hard+counts.good+counts.easy,counts.again+counts.hard+counts.good+counts.easy+(q.length-i),`${q.length-i} left`,'Again','Remembered')+
        `<div class="card" id="rc"><span class="tag">${kindLabel(x)} · ${LNAME(x.l)} · New: study it</span><span class="${bigClass(x)} han">${hzHtml(x)}</span>
        ${backHtml(x)}<button class="play" id="say">${PLAY}Play</button><p class="hint" style="text-align:center;margin:0">Say it out loud a couple of times. It comes back in a few cards to check you remember.</p>
        <details class="more"><summary>Examples and more</summary><div class="infox">${relatedHtml(x)}${exampleHtml(x)}${hookHtml(x)}</div></details></div>
        <div class="btns stickyact"><button class="btn" id="got">Got it, test me in a moment ›</button></div>`);
      $('say').onclick=()=>speak(x);speak(x);bindHook(x);
      const go=()=>{studied.add(x.k);q.splice(Math.min(q.length,i+4),0,x);i++;draw()};
      $('got').onclick=go;keyHandler=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();go()}};
      return;
    }
    // Cards you already know sometimes flip to English → Chinese: producing the character is harder and sticks better.
    const flip=!isNew&&r.i>=1&&r.n%2===1;
    const front=flip?`<span class="tag">${kindLabel(x)} · ${LNAME(x.l)} · EN → 中</span><p class="meaning" style="font-size:1.5rem;font-weight:700">${esc(x.en)}</p><span class="py">${pyHtml(x.p)}</span>`
      :`<span class="tag">${kindLabel(x)} · ${LNAME(x.l)} · ${isNew?'New':'Review'}</span><span class="${bigClass(x)} han">${hz(x)}</span>`;
    open(tallyBar(counts.again,counts.hard+counts.good+counts.easy,counts.again+counts.hard+counts.good+counts.easy+(q.length-i),`${q.length-i} left`,'Again','Remembered')+
      `<div class="card" id="rc">${shown?`<span class="tag">${kindLabel(x)} · ${LNAME(x.l)}${flip?' · EN → 中':''}</span><span class="${bigClass(x)} han">${hzHtml(x)}</span>`:front}
      ${shown?backHtml(x)+`<button class="play" id="say">${PLAY}Play</button>`+relatedHtml(x)+exampleHtml(x)
        :flip?'<p class="hint">Picture the character, or write it, then reveal the answer.</p><button class="btn ghost" id="rw">${PEN}Write it</button>':'<p class="hint">Say the pinyin and the meaning out loud, then reveal the answer.</p>'}</div>
      ${shown?hookHtml(x)+`<div class="srsbtns">${['again','hard','good','easy'].map((k,j)=>`<button class="${k}" data-q="${k}"><span>${k[0].toUpperCase()+k.slice(1)}</span><small>${ivlLabel(nextIvl(isNew?null:r,k))}</small></button>`).join('')}</div><p class="hint" style="text-align:center">Keys 1–4. Again shows the card again in this session.</p>`
        :`<button class="btn" id="show">Show answer</button><p class="hint" style="text-align:center">Space shows the answer.</p>`}`);
    if(shown){$('say').onclick=()=>speak(x);speak(x);bindHook(x);
      M().querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>answer(b.dataset.q));
      keyHandler=e=>{const n=+e.key;if(n>=1&&n<=4)answer(['again','hard','good','easy'][n-1])}}
    else{$('show').onclick=()=>{shown=true;draw()};$('rc').onclick=()=>{shown=true;draw()};keyHandler=e=>{if(e.key===' '){e.preventDefault();shown=true;draw()}};
      if($('rw'))$('rw').onclick=e=>{e.stopPropagation();tryWrite(x)}}
  }
  function answer(k){const x=q[i];rate(x,k);counts[k]++;if(rec(x).i===0)q.splice(Math.min(q.length,i+4),0,x);else done++;i++;shown=false;draw()}
  function finish(){
    const tomorrow=ALLITEMS.filter(x=>{const r=rec(x);return r&&r.n&&r.d<=Date.now()+DAY}).length;
    open(bar(100,'done')+`<div class="card"><p class="eyebrow">Review complete</p><span class="score">${done}</span><p>cards reviewed today: ${stats.rev}. Streak: ${stats.streak} ${stats.streak===1?'day':'days'}.</p>
      <p class="hint">Again ${counts.again} · Hard ${counts.hard} · Good ${counts.good} · Easy ${counts.easy}. About ${tomorrow} cards will be due by tomorrow.</p>
      <div class="btns"><button class="btn ghost" data-home>‹ Home</button><button class="btn" id="more">Learn 10 more new</button></div></div>`);
    $('more').onclick=()=>{stats.extra=(stats.extra||0)+10;saveSrs();review()};
    if(!basePool().some(x=>!seen(x)))$('more').disabled=true;
  }
  if(!q.length){finish();return}
  draw();
}

