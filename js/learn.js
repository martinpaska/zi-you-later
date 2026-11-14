/* ---------- Learn ---------- */
/* Learn: meet each item before it is quizzed */
const ALSO=new Map();for(const x of CH)for(const p of (COMP[x.s]||['',[]])[1]){const a=ALSO.get(p[0])||[];if(!a.some(y=>y.s===x.s))a.push(x);ALSO.set(p[0],a)}
function partsHtml(x){
  const h=v=>[...v].filter(isHan).join(''),c=h(state.script==='t'?x.t:x.s),d=COMP[c]||COMP[h(x.s)];
  const pic=PICT[h(x.s)],svg=PICTSVG[h(x.s)];if(pic)return `<div class="ex"><span class="eyebrow">Picture character</span>${svg?`<div class="evo" aria-hidden="true"><svg class="pict" viewBox="0 0 100 100">${svg}</svg><span class="arr">→</span><span class="han evoc">${esc(c)}</span></div>`:''}<p style="margin:4px 0 0">${esc(c)} started as a drawing of ${esc(pic)}.${svg?' Tap the drawing to see it again.':' Picture the old drawing when you see it.'}</p></div>`;
  if(!d||!d[1].length)return `<div class="ex"><span class="eyebrow">Built from</span><p>${esc(c)} is a basic shape of its own, not made of smaller parts. Basic shapes like this turn up inside many other characters, so it is worth knowing well.</p></div>`;
  const snd=d[1].find(p=>p[3]==='sound');
  return `<div class="ex"><span class="eyebrow">Built from${d[0]?' · '+esc(d[0]):''}</span><div class="parts">${d[1].map(([p,py,g,r])=>{const also=(ALSO.get(p)||[]).filter(y=>y.s!==x.s).slice(0,4);
      return `<div class="part"><span class="han pc">${esc(p)}</span>${PICTSVG[p]?`<svg class="mini" viewBox="0 0 100 100" aria-hidden="true">${PICTSVG[p]}</svg>`:''}<div><b>${esc(g||'a shape')}</b>${py?` <span class="muted">${esc(py)}</span>`:''}${r?` <span class="role ${r}">${r==='sound'?'sound hint':'meaning hint'}</span>`:''}${also.length?`<small class="muted">also in ${also.map(y=>`<span class="han">${hz(y)}</span>`).join(' ')}</small>`:''}</div></div>`}).join('')}</div>
    ${IDEO[h(x.s)]?`<p class="story"><b>Why it means “${esc(short(x.en))}”:</b> ${esc(IDEO[h(x.s)])}</p>`:''}
    ${snd&&!IDEO[h(x.s)]?`<p class="hint">${esc(snd[0])} hints at the sound (${esc(snd[1])}), the other part hints at the meaning. Most characters work like this.</p>`:''}</div>`;
}
function wordPartsHtml(x){
  const cs=[...(state.script==='t'?x.t:x.s)].filter(isHan),syl=sylsOf(x.p);
  return `<div class="ex"><span class="eyebrow">Characters in this word</span><div class="parts">${cs.map((c,i)=>{const y=CH.find(z=>z.s===c||z.t===c);
    const d=COMP[c]||(y&&COMP[y.t])||(y&&COMP[y.s]),pr=d&&d[1].length?d[1].map(([q,qy,g])=>`<span class="han">${esc(q)}</span> ${esc(g||'')}`).join(' + '):'';
    return `<div class="part"><span class="han pc">${c}</span><div><b>${y?esc(short(y.en)):''}</b> <span class="muted">${syl.length===cs.length?pyHtml(syl[i]):y?pyHtml(y.p):''}</span>${pr?`<small class="muted radl">${pr}</small>`:''}${y&&ORD(y.l)!==ORD(x.l)?`<small class="muted">${LNAME(y.l)}</small>`:''}</div></div>`}).join('')}</div></div>`;
}
function intro(x,k,n,next,skip){
  const wcs=[...hz(x)].filter(isHan);
  open(bar(k/n*100,k+' / '+n)+`<div class="card top-align intro">
    <div class="introtop">${x.kind==='c'?`<div class="anim" id="anim" aria-label="Stroke order"></div>`:`<div class="animw" id="animw" aria-label="Stroke order">${wcs.map(c=>`<div class="anim awc" data-c="${c}"></div>`).join('')}</div>`}
    <div class="introinfo">${backHtml(x)}<button class="play iconplay" id="isay" aria-label="Play">${PLAY}</button></div></div>
    <p class="hint" style="text-align:center;margin:0">Tap the character to see the stroke order again.</p>
    <div class="infox">${x.kind==='c'?partsHtml(x):wcs.length===1?partsHtml(x):wordPartsHtml(x)}${hookHtml(x)}</div>
    <details class="more"><summary>Examples and more</summary><div class="infox">${relatedHtml(x)}${exampleHtml(x,4)}</div></details>
    <div class="btns stickyact"><button class="btn ghost" id="iskip">Skip intros</button><button class="btn" id="inext">${k<n?'Next ›':'Start the quiz ›'}</button></div></div>`);
  bindHook(x);setTimeout(()=>speak(x),250);
  const pv=M().querySelector('.pict');if(pv){const run=()=>{const ks=[...pv.children];ks.forEach((k,i)=>{k.style.animation='none';void k.getBBox();k.style.animation='';k.style.animationDelay=(i*.28)+'s'});
      const ev=M().querySelector('.evo');ev.classList.remove('go');void ev.offsetWidth;ev.style.setProperty('--d',(ks.length*.28+.5)+'s');ev.classList.add('go')};run();pv.onclick=run}
  $('isay').onclick=()=>speak(x);$('inext').onclick=next;$('iskip').onclick=skip;
  keyHandler=e=>{if(e.key==='Enter'){e.preventDefault();next()}};
  if(x.kind==='c'){const flat=()=>{const el=$('anim');if(el)el.innerHTML=`<span class="big han">${hzHtml(x)}</span>`};
    const go=()=>{const el=$('anim');if(!el)return;if(!STROKES||typeof HanziWriter==='undefined')return flat();
      let c=hz(x);if(!STROKES[c])c=x.s;if(!STROKES[c]){el.innerHTML=`<span class="big han">${hzHtml(x)}</span>`;return}
      const sz=el.clientWidth,css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
      const w=hwCreate('anim',c,{width:sz,height:sz,padding:sz*.06,strokeColor:css('--t'+x.tone)||css('--ink'),outlineColor:css('--outline')||css('--line'),radicalColor:null,strokeAnimationSpeed:1.3,delayBetweenStrokes:180,charDataLoader:(ch,ok,err)=>STROKES[ch]?ok(STROKES[ch]):err()});
      w.animateCharacter();el.onclick=()=>w.animateCharacter()};
    STROKES?go():loadStrokes().then(go).catch(flat)}
  else{const boxes=[...M().querySelectorAll('.awc')],tn=tonesOf(x);
    const flat=()=>boxes.forEach(b=>{b.innerHTML=`<span class="han awch">${b.dataset.c}</span>`});
    const go=()=>{if(!STROKES||typeof HanziWriter==='undefined')return flat();const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
      const ws=boxes.map((b,i)=>{const c=STROKES[b.dataset.c]?b.dataset.c:null;if(!c){b.innerHTML=`<span class="han awch">${b.dataset.c}</span>`;return null}
        b.id='awc'+i;const sz=b.clientWidth;return hwCreate(b.id,c,{width:sz,height:sz,padding:sz*.06,strokeColor:css('--t'+(tn&&tn.length===boxes.length?tn[i]:0))||css('--ink'),outlineColor:css('--outline')||css('--line'),radicalColor:null,strokeAnimationSpeed:1.4,delayBetweenStrokes:150,charDataLoader:(ch,ok,err)=>STROKES[ch]?ok(STROKES[ch]):err()})});
      const run=(i=0)=>{if(i>=ws.length||!M().contains(boxes[0]))return;const w=ws[i];if(!w)return run(i+1);w.hideCharacter();w.animateCharacter({onComplete:()=>run(i+1)})};
      ws.forEach(w=>w&&w.hideCharacter());run();M().querySelector('#animw').onclick=()=>run()};
    STROKES?go():loadStrokes().then(go).catch(flat)}
}
function learn(at){
  const all=at?fromK(at.a):priority(pool()),ROUND=7;let next=at?at.nx:0,round=at?at.rd:0,mastered=at?at.m:0,items=[],stage=new Map(),queue=[],last=null;const missed=new Set(),done=new Set();
  const MC=['mean','char','audio'];
  function newRound(){if(next>=all.length)return finish();resSave('learn',{a:kOf(all),nx:next,rd:round,m:mastered,pos:'Round '+(round+1)+' · '+mastered+' / '+all.length});round++;items=all.slice(next,next+ROUND);next+=items.length;items.forEach(x=>stage.set(x,0));queue=[];
    const fresh=state.lintro===false?[]:items.filter(x=>mastery(x)<2);let k=0;
    const step=()=>k<fresh.length?intro(fresh[k],++k,fresh.length,step,()=>{state.lintro=false;saveState();ask()}):ask();step()}
  function pick(){const left=items.filter(x=>stage.get(x)<2);if(!left.length)return null;if(!queue.length)queue=shuffle(left);if(queue.length>1&&queue[0]===last)queue.push(queue.shift());return queue.shift()}
  function head(){const left=items.filter(x=>stage.get(x)<2).length;
    return tallyBar([...missed].filter(x=>!done.has(x)).length,mastered,all.length,'Round '+round+' · '+mastered+' / '+all.length,'Mistakes','Mastered')}
  function ask(){
    const x=pick();if(!x)return roundDone();last=x;
    const st=stage.get(x),type=st===0?MC[Math.random()*3|0]:'pinyin';
    if(type==='pinyin'){
      open(head()+`<div class="card top-align"><span class="tag">Step 2 of 2 · type it</span>${qHead(x,type)}${typeHtml('lin')}<div class="btns"><button class="btn ghost" id="idk">I don't know</button><button class="btn" id="chk">Check</button></div><div id="fb" role="status" aria-live="polite" style="width:100%"></div></div>`);
      const inp=$('lin');inp.focus();
      const check=give=>{if(inp.disabled)return;const ok=!give&&pyOk(inp.value,x);inp.disabled=true;inp.classList.add(ok?'is-ok':'is-bad');result(x,ok,true,inp.value)};
      $('chk').onclick=()=>check(false);$('idk').onclick=()=>check(true);
      inp.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();check(false)}};
    }else{
      const opts=mcOptions(x,type);
      open(head()+`<div class="card top-align"><span class="tag">Step 1 of 2 · choose</span>${qHead(x,type)}${optsHtml(x,type,opts)}<div id="fb" role="status" aria-live="polite" style="width:100%"></div></div>`);
      const box=M().querySelector('.opts');
      if(type==='audio'){M().querySelector('[data-say]').onclick=()=>speak(x);setTimeout(()=>speak(x),200)}
      const choose=b=>{if(box.classList.contains('answered'))return;box.classList.add('answered');const y=opts[+b.dataset.i],ok=y===x;
        box.querySelector(`[data-i="${opts.indexOf(x)}"]`).classList.add('is-ok');if(!ok)b.classList.add('is-bad');if(type!=='mean')revealChars(box,opts);result(x,ok,false)};
      box.onclick=e=>{const b=e.target.closest('.opt');if(b)choose(b)};
      keyHandler=e=>{const n=+e.key;if(n>=1&&n<=opts.length)choose(box.querySelector(`[data-i="${n-1}"]`))};
    }
  }
  function result(x,ok,typed,val){
    const st=stage.get(x);
    if(ok){stage.set(x,st+1);if(st+1===2){mastered++;done.add(x);grade(x,true)}}else{stage.set(x,0);missed.add(x);grade(x,false)}
    speak(x);
    $('fb').innerHTML=`<div class="fb ${ok?'ok':'bad'}"><h3>${ok?(st+1===2?'Correct, mastered!':'Correct!'):'Not yet. This one will come back.'}</h3>${answerLine(x)}
      ${!ok&&typed&&val?`<p class="hint">You typed “${esc(val)}”. Accepted answers: ${pyForms(x.p).map(esc).join(' · ')}</p>`:''}
      <div class="btns">${!ok&&typed&&val?'<button class="btn ghost" id="ovr">I was right</button>':''}<button class="btn" id="cont">Continue ›</button></div></div>`;
    $('cont').onclick=ask;
    if($('ovr'))$('ovr').onclick=()=>{stage.set(x,2);mastered++;done.add(x);grade(x,true);ask()};
    keyHandler=e=>{if(e.key==='Enter'){e.preventDefault();ask()}};
  }
  function roundDone(){
    open(head()+`<div class="card"><p class="eyebrow">Round ${round} done</p><h2>Mastered ${mastered} of ${all.length}</h2><div class="grp">${items.map(y=>`<div class="gi"><span class="han">${hzHtml(y)}</span><span class="p">${pyHtml(y.p)}</span><span class="m">${esc(y.en)}</span><span></span>${starHtml(y,'xs-sm')}</div>`).join('')}</div>
      <div class="btns"><button class="btn" id="nr">${next<all.length?'Next round ›':'Finish'}</button></div></div>`);
    $('nr').onclick=newRound;
  }
  function finish(){resClear('learn');open(bar(100,all.length+' / '+all.length)+`<div class="card"><p class="eyebrow">Learn complete</p><span class="score">${all.length}</span><p>You answered every item by choosing and by typing its pinyin. Next: Test or Writing.</p><div class="btns"><button class="btn ghost" data-home>‹ Home</button><button class="btn" data-go="test">Take a test</button></div></div>`)}
  newRound();
}

