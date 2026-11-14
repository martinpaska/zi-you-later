/* ---------- Try writing: a quick writing sheet over any card ---------- */
function tryWrite(x){
  const simp=[...x.s.replace(/[()…]/g,'')].filter(isHan),shown=state.script==='t'?simp.map(c=>T2[c]||c):simp,L=simp.length;
  if(!L)return;
  const syl=x.kind==='c'?[x.p]:sylsOf(x.p),perSyl=syl.length===L,tn=x.kind==='c'?[x.tone]:syl.map(sylTone);
  const saved=keyHandler;keyHandler=e=>{if(e.key==='Escape')close()};let j=0,mem=true;
  const sh=document.createElement('div');sh.className='wsheet';sh.setAttribute('role','dialog');sh.setAttribute('aria-modal','true');sh.setAttribute('aria-label','Try writing');
  document.body.appendChild(sh);document.body.style.overflow='hidden';sheetFocus(sh);
  const close=()=>{sh.remove();document.body.style.overflow='';keyHandler=saved;if(sh._back&&sh._back.isConnected)sh._back.focus()};
  sh.onclick=e=>{if(e.target===sh)close()};
  const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  function draw(){
    let c=shown[j];if(STROKES&&!STROKES[c]&&STROKES[simp[j]])c=simp[j];
    const has=STROKES&&STROKES[c],last=j===L-1;
    sh.innerHTML=`<div class="wpanel"><div class="row"><h2>Try writing</h2><button class="btn ghost" id="twx">Close</button></div>
      <div class="wprompt"><span class="py" style="font-size:1.5rem">${pyHtml(x.p)}</span><span class="hint">${esc(short(x.en))}</span></div>
      ${L>1?`<div class="wword">${shown.map((h,k)=>`<span class="wbox${k<j?' done':k===j?' now':''}" data-k="${k}" role="button" tabindex="0" aria-label="Character ${k+1}" style="cursor:pointer"><span class="han${perSyl&&k<j?' t'+tn[k]:''}">${k<j||!mem?h:''}</span><small>${perSyl?pyHtml(syl[k]):''}</small></span>`).join('')}</div>`:''}
      <p class="hint">${mem?'Write it from memory. Stuck? Show the outline and trace it.':'Trace the outline, then try it from memory again.'}</p>
      <div class="pad" id="twpad"><svg class="guide" viewBox="0 0 100 100" aria-hidden="true"><g stroke="currentColor" stroke-opacity=".18" stroke-width=".6" stroke-dasharray="2 2" fill="none"><line x1="0" y1="50" x2="100" y2="50"/><line x1="50" y1="0" x2="50" y2="100"/><line x1="0" y1="0" x2="100" y2="100"/><line x1="100" y1="0" x2="0" y2="100"/></g></svg><div class="hw" id="twhw"></div></div>
      <p class="strokes" id="twst">${STROKES?(has?'':'No stroke data for this character.'):'Loading stroke data…'}</p>
      <div class="btns"><button class="btn ghost" id="twhelp">${mem?'Show outline':'From memory again'}</button><button class="btn ghost" id="twre">Start over</button><button class="btn" id="twn">${last?'Done':'Next character ›'}</button></div></div>`;
    $('twx').onclick=close;
    $('twhelp').onclick=()=>{mem=!mem;draw()};
    sh.querySelectorAll('.wword [data-k]').forEach(b=>b.onclick=()=>{j=+b.dataset.k;draw()});
    $('twn').onclick=()=>{if(last)close();else{j++;mem=true;draw()}};
    if(!STROKES){loadStrokes().then(()=>{if(sh.isConnected)draw()}).catch(()=>{$('twst').textContent='The stroke data could not load. Check your connection.'});return}
    if(!has||typeof HanziWriter==='undefined'){if(typeof HanziWriter==='undefined')$('twst').textContent='The writing tool could not load. Check your connection.';return}
    const size=$('twpad').clientWidth,n=STROKES[c].strokes.length;
    const w=hwCreate('twhw',c,{width:size,height:size,padding:size*.06,showCharacter:false,showOutline:!mem,
      strokeColor:css('--ink'),outlineColor:css('--outline')||css('--line'),drawingColor:css('--accent'),highlightColor:css('--accent'),drawingWidth:Math.max(14,size/16),
      charDataLoader:(ch,ok,err)=>STROKES[ch]?ok(STROKES[ch]):err()});
    const start=()=>{let mis=0,done=0;$('twst').textContent=`Stroke 1 of ${n}`;
      w.quiz({leniency:wlen(),acceptBackwardsStrokes:true,showHintAfterMisses:mem?3:2,highlightOnComplete:true,
        onMistake:()=>{mis++;$('twst').textContent=`Stroke ${done+1} of ${n} · mistakes ${mis}`},
        onCorrectStroke:()=>{done++;$('twst').textContent=`Stroke ${Math.min(done+1,n)} of ${n} · mistakes ${mis}`},
        onComplete:({totalMistakes})=>{$('twst').textContent=totalMistakes?`Done · mistakes ${totalMistakes}`:'Done, no mistakes!';
          const b=sh.querySelector('.wbox.now .han');if(b){b.textContent=shown[j];if(perSyl)b.classList.add('t'+tn[j])}if(last)speak(x)}})};
    $('twre').onclick=start;start();
  }
  draw();
}

