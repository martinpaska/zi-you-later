/* ---------- Sentences ---------- */
function sentences(){
  const list=ST.filter(s=>state.sel.has(s.l));
  open(bar(0,list.length+' sentences')+`<div class="card"><h2>Sentences from the selected lessons</h2><p class="muted">${PACK==='hsk1'?'Each sentence uses only HSK 1 words.':'Each sentence uses only vocabulary the textbook has introduced by that lesson.'}</p>
    <div class="btns"><button class="btn ghost" id="sb">Build sentences</button><button class="btn ghost" id="st">Translate into Chinese</button><button class="btn ghost" id="sl">Build from listening</button></div></div>`);
  $('sb').onclick=()=>build(list,false);$('st').onclick=()=>translate(list);$('sl').onclick=()=>build(list,true);
}
const isPunct=c=>/^[，。？！、,.?!]$/.test(c);
/* sentence building: drag a piece of your answer to another place, or drag a piece from the bank straight to a place
   in the answer (a tap still adds a piece at the end, or sends it back). picked holds bank indexes (data-j) and is
   mutated in place; render() redraws; onChange() runs before every change (e.g. to clear red/green marks). */
function dragReorder(ar,picked,render,locked,bk,onChange){
  let drag=null,just=false;
  const ins=(x,y,skip)=>{const cs=[...ar.querySelectorAll('.chunk')].filter(c=>c!==skip);let k=0;for(const c of cs){const r=c.getBoundingClientRect();if(y>r.bottom||(y>=r.top&&x>r.left+r.width/2))k++}return [k,cs]};
  const near=(x,y)=>{const r=ar.getBoundingClientRect();return x>=r.left-24&&x<=r.right+24&&y>=r.top-40&&y<=r.bottom+40};
  const off=()=>{window.removeEventListener('pointermove',onMove);window.removeEventListener('pointerup',onUp);window.removeEventListener('pointercancel',onUp)};
  const onMove=e=>{if(!ar.isConnected)return off();if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(!drag.on){if(Math.hypot(dx,dy)<8)return;drag.on=true;drag.b.classList.add('dragging');try{drag.b.setPointerCapture(e.pointerId)}catch(_){}}
    e.preventDefault();drag.b.style.transform=`translate(${dx}px,${dy}px)`;
    ar.querySelectorAll('.chunk').forEach(c=>c.classList.remove('dropl'));ar.classList.remove('dropend');drag.k=null;
    if(drag.from==='bank'&&!near(e.clientX,e.clientY))return;
    const [k,cs]=ins(e.clientX,e.clientY,drag.from==='row'?drag.b:null);if(cs[k])cs[k].classList.add('dropl');else ar.classList.add('dropend');drag.k=k};
  const onUp=e=>{if(!ar.isConnected)return off();if(!drag||e.pointerId!==drag.id)return;const d=drag;drag=null;
    ar.querySelectorAll('.chunk').forEach(c=>c.classList.remove('dropl'));ar.classList.remove('dropend');
    if(!d.on)return;just=true;setTimeout(()=>just=false,0);d.b.classList.remove('dragging');d.b.style.transform='';
    if(onChange)onChange();
    if(d.from==='row'){const v=picked.splice(d.n,1)[0];picked.splice(d.k??d.n,0,v)}
    else if(d.k!=null)picked.splice(d.k,0,d.j);
    render()};
  ar.addEventListener('pointerdown',e=>{const b=e.target.closest('.chunk');if(!b||(locked&&locked()))return;drag={from:'row',b,n:+b.dataset.n,x:e.clientX,y:e.clientY,on:false,id:e.pointerId}});
  if(bk)bk.addEventListener('pointerdown',e=>{const b=e.target.closest('.chunk');if(!b||(locked&&locked())||picked.includes(+b.dataset.j))return;drag={from:'bank',b,j:+b.dataset.j,x:e.clientX,y:e.clientY,on:false,id:e.pointerId}});
  window.addEventListener('pointermove',onMove,{passive:false});window.addEventListener('pointerup',onUp);window.addEventListener('pointercancel',onUp);
  return {dragged:()=>just};
}
/* the end mark of a sentence (？ for questions), shown fixed at the end of the row where you build it */
const endMark=(zh,en)=>{const l=zh&&zh.length?zh[zh.length-1]:'';if(isPunct(l))return {'?':'？','!':'！','.':'。',',':'，'}[l]||l;return /\?\s*$/.test(en||'')?'？':/!\s*$/.test(en||'')?'！':'。'};
function rubyHtml(s){const z=sentHz(s);
  // one pinyin syllable above each character, so every chunk sits on the same line
  const cell=(p,c)=>`<span class="rb"><small>${p}</small><span class="han">${esc(c)}</span></span>`;
  // punctuation stays attached to the word before it, so it never wraps onto a line alone
  const g=[];z.forEach((c,i)=>{if(isPunct(c)&&g.length){g[g.length-1]+=cell('&nbsp;',c);return}
    const ch=[...c],sy=(s.py[i]||'').match(SYL)||[];
    g.push(isPunct(c)?cell('&nbsp;',c):ch.length>1&&ch.length===sy.length?ch.map((h,j)=>cell(pyHtml(sy[j]),h)).join(''):cell(pyHtml(s.py[i]),c))});
  return `<div class="ruby">${g.map(x=>`<span class="rw">${x}</span>`).join('')}</div>`}
function build(list,listen){
  const qs=shuffle(list).slice(0,8);let qi=0,score=0;
  function draw(){
    if(qi>=qs.length)return finish();
    const s=qs[qi],z=sentHz(s),words=z.map((c,i)=>({c,i})).filter(w=>!isPunct(w.c)),bank=shuffle(words);let picked=[];
    open(tallyBar(qi-score,score,qs.length,(qi+1)+' / '+qs.length)+(listen&&!$('noVoice').hidden?`<p class="notice">This browser has no Chinese voice, so you may not hear the sentence. Try Build sentences instead.</p>`:'')+`<div class="card top-align"><p class="eyebrow">${listen?'Listen and build':'Build the sentence'} · ${LNAME(s.l)}</p>
      ${listen?`<button class="play huge" id="sp">${PLAY}Play sentence</button>`:`<p class="meaning" style="font-size:1.25rem;font-weight:700">${esc(s.en)}</p><button class="play" id="sp">${PLAY}Hint: listen</button>`}
      <div class="ansrow" id="ar" aria-label="Your sentence" data-end="${endMark(z,s.en)}"></div><div class="bank" id="bk">${bank.map((w,j)=>`<button class="chunk han" data-j="${j}">${esc(w.c)}</button>`).join('')}</div>
      <div class="btns"><button class="btn ghost" id="clr">Clear</button><button class="btn" id="chk" disabled>Check</button></div><div id="fb" role="status" aria-live="polite" style="width:100%"></div></div>`);
    $('sp').onclick=()=>speakSent(s);if(listen)setTimeout(()=>speakSent(s),250);
    let tries=0,locked=false,marks=null;
    const renderAns=()=>{$('ar').innerHTML=picked.map((j,n)=>`<button class="chunk han${marks?(marks[n]?' cok':' cbad'):''}" data-n="${n}">${esc(bank[j].c)}</button>`).join('');
      M().querySelectorAll('#bk .chunk').forEach(b=>b.classList.toggle('used',picked.includes(+b.dataset.j)));$('chk').disabled=locked||picked.length!==bank.length};
    const dr=dragReorder($('ar'),picked,renderAns,()=>locked,$('bk'),()=>{marks=null});
    $('bk').onclick=e=>{const b=e.target.closest('.chunk');if(!b||locked||dr.dragged()||picked.includes(+b.dataset.j))return;marks=null;picked.push(+b.dataset.j);renderAns()};
    // tap a piece in your sentence to send it back; drag it to move it
    $('ar').onclick=e=>{const b=e.target.closest('.chunk');if(!b||locked||dr.dragged())return;marks=null;picked.splice(+b.dataset.n,1);renderAns()};
    $('clr').onclick=()=>{if(locked)return;picked.length=0;marks=null;renderAns()};
    const reveal=ok=>{locked=true;renderAns();speakSent(s);
      $('fb').innerHTML=`<div class="fb ${ok?'ok':'bad'}"><h3>${ok?(tries===1?'Correct!':'Correct now!'):'The sentence is:'}</h3>${rubyHtml(s)}<p>${esc(s.en)}</p><button class="btn" id="nx">${qi<qs.length-1?'Next ›':'See result'}</button></div>`;
      $('nx').onclick=()=>{qi++;draw()};keyHandler=e=>{if(e.key==='Enter')$('nx').click()}};
    $('chk').onclick=()=>{if(locked)return;tries++;
      const got=picked.map(j=>bank[j].c),want=words.map(w=>w.c),ok=got.join('')===want.join('');
      if(ok){if(tries===1)score++;return reveal(true)}
      marks=got.map((c,n)=>c===want[n]);renderAns();
      $('fb').innerHTML=`<div class="fb bad"><h3>Not quite.</h3><p>Pieces in red are in the wrong place. Drag them to fix the order, or tap one to send it back, then check again.</p><div class="btns"><button class="btn ghost" id="sa">Show answer</button></div></div>`;
      $('sa').onclick=()=>reveal(false)};
  }
  function finish(){open(bar(100,qs.length+' / '+qs.length)+`<div class="card"><p class="eyebrow">Sentences done</p><span class="score">${score} / ${qs.length}</span><p>${score===qs.length?'Every sentence right.':'Try the ones you missed again, or switch to Build from listening.'}</p><div class="btns"><button class="btn ghost" data-home>‹ Home</button><button class="btn" id="ag">Again</button></div></div>`);$('ag').onclick=()=>build(list,listen)}
  draw();
}
function translate(list){
  const qs=shuffle(list).slice(0,8);let qi=0,score=0,how=store.get('ic-tmode','han');
  const strip=t=>[...t.normalize('NFC')].filter(isHan).join('');
  const toSimp=t=>{const back={};for(const k in T2)back[T2[k]]=k;return [...t].map(c=>back[c]||c).join('')};
  // mark each typed character as matching the answer or not (longest common subsequence)
  function diff(a,b){const A=[...a],B=[...b],L=Array.from({length:A.length+1},()=>new Array(B.length+1).fill(0));
    for(let i=A.length-1;i>=0;i--)for(let j=B.length-1;j>=0;j--)L[i][j]=A[i]===B[j]?L[i+1][j+1]+1:Math.max(L[i+1][j],L[i][j+1]);
    let i=0,j=0,out='';while(i<A.length&&j<B.length){if(A[i]===B[j]){out+=`<span class="dok">${esc(A[i])}</span>`;i++;j++}else if(L[i+1][j]>=L[i][j+1]){out+=`<span class="dbad">${esc(A[i])}</span>`;i++}else{out+=`<span class="dmiss">${esc(B[j])}</span>`;j++}}
    while(i<A.length)out+=`<span class="dbad">${esc(A[i++])}</span>`;while(j<B.length)out+=`<span class="dmiss">${esc(B[j++])}</span>`;return out}
  // Draw mode: draw a character on the pad, tap the right one among the suggestions, and it joins the sentence
  async function drawPad(inp){
    const cv=$('tcv'),pad=$('tpad'),ar=$('ar'),cd=$('tcands');let strokes=[],cur=null,chars=[];
    const fit=()=>{const r=pad.getBoundingClientRect(),k=devicePixelRatio||1;cv.width=r.width*k;cv.height=r.height*k;paint()};
    const paint=()=>{const g=cv.getContext('2d'),k=cv.width/(pad.clientWidth||1);g.setTransform(k,0,0,k,0,0);g.clearRect(0,0,cv.width,cv.height);
      g.strokeStyle=getComputedStyle(pad).color;g.lineWidth=Math.max(4,pad.clientWidth/40);g.lineCap=g.lineJoin='round';
      for(const st of strokes.concat(cur?[cur]:[])){g.beginPath();st.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));if(st.length===1)g.lineTo(st[0][0]+.1,st[0][1]);g.stroke()}};
    const row=()=>{inp.value=chars.join('');ar.innerHTML=chars.map((c,i)=>`<button class="chunk han" data-i="${i}" aria-label="Remove ${esc(c)}">${esc(c)}</button>`).join('');
      ar.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{if(inp.disabled)return;chars.splice(+b.dataset.i,1);row()});ar.scrollLeft=ar.scrollWidth};
    const suggest=()=>{if(!strokes.length){cd.innerHTML='<span class="hint">Draw one character, then tap it here.</span>';return}
      const r=recognise(strokes,recCands(),STROKES,6).map(c=>state.script==='t'?T2[c]||c:c).filter((c,i,a)=>a.indexOf(c)===i);
      cd.innerHTML=r.map(c=>`<button class="chunk han" data-c="${esc(c)}">${esc(c)}</button>`).join('');
      cd.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{if(inp.disabled)return;chars.push(b.dataset.c);strokes=[];paint();suggest();row()})};
    const at=e=>{const r=cv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]};
    cv.onpointerdown=e=>{if(inp.disabled)return;e.preventDefault();cv.setPointerCapture(e.pointerId);cur=[at(e)];paint()};
    cv.onpointermove=e=>{if(!cur)return;const p=at(e),q=cur[cur.length-1];if(Math.hypot(p[0]-q[0],p[1]-q[1])>1.5){cur.push(p);paint()}};
    cv.onpointerup=cv.onpointercancel=()=>{if(!cur)return;strokes.push(cur);cur=null;paint();suggest()};
    $('tundo').onclick=()=>{if(inp.disabled)return;strokes.pop();paint();suggest()};
    $('tclr').onclick=()=>{if(inp.disabled)return;strokes=[];paint();suggest()};
    $('tdel').onclick=()=>{if(inp.disabled)return;chars.pop();row()};
    fit();await loadStrokes();
  }
  function draw(){
    if(qi>=qs.length)return finish();
    const s=qs[qi],z=sentHz(s),chunks=shuffle(z.map((c,i)=>({c,p:s.py[i]})).filter(w=>!isPunct(w.c)));let hint=0;
    open(tallyBar(qi-score,score,qs.length,(qi+1)+' / '+qs.length)+`<div class="card top-align"><p class="eyebrow">Translate into Chinese · ${LNAME(s.l)}</p>
      <p class="meaning" style="font-size:1.25rem;font-weight:700">${esc(s.en)}</p>
      <button class="play" id="tsp">${PLAY}Hint: listen</button>
      <div class="seg" role="group" aria-label="Answer with"><button data-how="han" aria-pressed="${how==='han'}">Characters</button><button data-how="py" aria-pressed="${how==='py'}">Pinyin</button><button data-how="draw" aria-pressed="${how==='draw'}">Draw</button></div>
      ${how==='draw'?`<input id="tin" type="hidden"><div class="ansrow tdr" id="ar" aria-label="Your sentence" data-end="${endMark(z,s.en)}"></div>
      <div class="bank tcands" id="tcands" aria-label="Suggestions" aria-live="polite"><span class="hint">Draw one character, then tap it here.</span></div>
      <div class="tdraw"><div class="pad tpad" id="tpad"><svg class="guide" viewBox="0 0 100 100" aria-hidden="true"><g stroke="currentColor" stroke-opacity=".18" stroke-width=".6" stroke-dasharray="2 2" fill="none"><line x1="0" y1="50" x2="100" y2="50"/><line x1="50" y1="0" x2="50" y2="100"/><line x1="0" y1="0" x2="100" y2="100"/><line x1="100" y1="0" x2="0" y2="100"/></g></svg><canvas id="tcv" aria-label="Drawing pad"></canvas></div>
      <div class="ttools"><button class="btn ghost" id="tundo" aria-label="Undo stroke">↶</button><button class="btn ghost" id="tclr" aria-label="Clear drawing">✕</button><button class="btn ghost" id="tdel" aria-label="Delete last character">⌫</button></div></div>`
      :`<div class="typein"><input id="tin" autocomplete="off" autocapitalize="off" spellcheck="false" lang="${how==='han'?'zh':'en'}" placeholder="${how==='han'?'Type in Chinese, e.g. 你好':'e.g. ni3 hao3'}" aria-label="Your translation"></div>
      <p class="hint">${how==='han'?'Use your Chinese keyboard. Punctuation and spaces do not matter.':'Type tones as numbers 1–4 and ü as v. Spaces and punctuation do not matter.'}</p>`}
      <div id="hintbox" class="bank" aria-live="polite"></div>
      <div class="btns"><button class="btn ghost" id="th">Hint</button><button class="btn ghost" id="tidk">Show answer</button><button class="btn" id="tchk">Check</button></div><div id="fb" role="status" aria-live="polite" style="width:100%"></div></div>`);
    const inp=$('tin');if(how==='draw')drawPad(inp);else inp.focus();
    $('tsp').onclick=()=>{if(!inp.disabled)hint=Math.max(hint,1);speakSent(s)};
    M().querySelectorAll('[data-how]').forEach(b=>b.onclick=()=>{how=b.dataset.how;store.set('ic-tmode',how);draw()});
    $('th').onclick=()=>{hint++;
      if(hint===1){$('hintbox').innerHTML=`<p class="hint" style="width:100%;text-align:center">Words to use, in mixed order:</p>`+chunks.map(w=>`<span class="chunk han hchunk" style="font-size:1.25rem">${esc(w.c)}${how==='py'?`<small>${pyHtml(w.p)}</small>`:''}</span>`).join('');if(how==='py')$('th').disabled=true}
      else{$('hintbox').insertAdjacentHTML('beforeend',`<p class="hint" style="width:100%;text-align:center">${pyHtml(s.py.join(' ').replace(/ ([,.?!])/g,'$1'))}</p>`);$('th').disabled=true}
      };
    const check=give=>{if(inp.disabled)return;const v=inp.value;let ok=false;
      if(!give){if(how!=='py')ok=toSimp(strip(v))===strip(s.zh.join(''))&&strip(v).length>0;
        else ok=pyKey(v.replace(/[^\p{L}\p{N}]/gu,''))===pyKey(s.py.join(''))}
      inp.disabled=true;inp.classList.add(ok?'is-ok':'is-bad');if(ok&&!hint)score++;else if(ok)score+=.5;
      speakSent(s);
      const yours=!give&&!ok&&v.trim()?(how!=='py'?`<p class="hint">Your answer, compared:</p><p class="han tdiff">${diff(strip(v),strip(z.join('')))}</p>`:`<p class="hint">You typed “${esc(v)}”.</p>`):'';
      $('fb').innerHTML=`<div class="fb ${ok?'ok':'bad'}"><h3>${ok?(hint?'Correct, with a hint.':'Correct!'):give?'The answer is:':'Not quite. One correct translation is:'}</h3>${rubyHtml(s)}<button class="play" data-ss="${s.id}" style="align-self:center">${PLAY}Play sentence</button>${yours}
        <div class="btns">${!ok&&!give&&v.trim()?'<button class="btn ghost" id="tovr">Mine is also right</button>':''}<button class="btn" id="nx">${qi<qs.length-1?'Next ›':'See result'}</button></div></div>`;
      $('fb').scrollIntoView({block:'nearest',behavior:'smooth'});
      if($('tovr'))$('tovr').onclick=()=>{score++;qi++;draw()};
      $('nx').onclick=()=>{qi++;draw()};keyHandler=e=>{if(e.key==='Enter'&&document.activeElement!==inp){e.preventDefault();$('nx').click()}}};
    $('tchk').onclick=()=>check(false);$('tidk').onclick=()=>check(true);
    inp.onkeydown=e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();check(false)}};
  }
  function finish(){open(bar(100,qs.length+' / '+qs.length)+`<div class="card"><p class="eyebrow">Translation done</p><span class="score">${+score.toFixed(1)} / ${qs.length}</span><p>${score===qs.length?'Every sentence right without hints.':'A hint counts as half a point. Try again to beat your score.'}</p><div class="btns"><button class="btn ghost" data-home>‹ Home</button><button class="btn" id="ag">Again</button></div></div>`);$('ag').onclick=()=>translate(list)}
  draw();
}
