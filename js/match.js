/* ---------- Match ---------- */
function match(kind){
  kind=kind||store.get('ic-mkind','en');store.set('ic-mkind',kind);
  const u=new Set(),items=shuffle(pool()).filter(x=>{const k=kind==='en'?short(x.en):x.p;if(u.has(k)||u.has(hz(x)))return false;u.add(k);u.add(hz(x));return true}).slice(0,6);
  // layout: two columns (meaning left, Chinese right) or one mixed grid
  const cols=store.get('ic-mlay','cols')==='cols';
  const tiles=cols?(()=>{const L=shuffle(items.map((x,i)=>({i,c:false}))),R=shuffle(items.map((x,i)=>({i,c:true})));return L.flatMap((t,r)=>[t,R[r]])})():shuffle(items.flatMap((x,i)=>[{i,c:true},{i,c:false}]));
  let sel=null,left=items.length,t0=null,pen=0,combo=0;const missed=new Set();
  const updTally=()=>{const n=items.length-left,T=M().querySelector('.tally');M().querySelector('.progress .g').style.width=n/items.length*100+'%';M().querySelector('.bar .count').textContent=n+' / '+items.length;
    if(T){T.querySelector('.no b').textContent=pen;T.querySelector('.left b').textContent=left;T.querySelector('.yes b').textContent=n}};
  const bestKey='ic-best-'+state.set+kind+'-'+[...state.sel].sort().join(','),best=store.get(bestKey,null),fmt=t=>(t/10).toFixed(1)+' s';
  const other=x=>kind==='en'?esc(short(x.en)):`<span class="mpy">${pyHtml(x.p)}</span>`;
  const ICOLS='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="7" height="16" rx="2"/><rect x="14" y="4" width="7" height="16" rx="2"/></svg>',
        IMIX='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="5" height="5" rx="1.5"/><rect x="9.5" y="3" width="5" height="5" rx="1.5"/><rect x="16" y="3" width="5" height="5" rx="1.5"/><rect x="3" y="9.5" width="5" height="5" rx="1.5"/><rect x="9.5" y="9.5" width="5" height="5" rx="1.5"/><rect x="16" y="9.5" width="5" height="5" rx="1.5"/><rect x="3" y="16" width="5" height="5" rx="1.5"/><rect x="9.5" y="16" width="5" height="5" rx="1.5"/><rect x="16" y="16" width="5" height="5" rx="1.5"/></svg>';
  open(tallyBar(0,0,items.length,'0 / '+items.length,'Mistakes','Matched','‹ Home',false)+`<div class="mtop"><div class="seg" role="group" aria-label="Match"><button data-k="en" aria-pressed="${kind==='en'}">中 ↔ EN</button><button data-k="py" aria-pressed="${kind==='py'}">中 ↔ pinyin</button></div>
    <button class="mlay" id="mlay" aria-label="${cols?'Mixed':'Two columns'}" title="${cols?'Mixed':'Two columns'}">${cols?IMIX:ICOLS}</button>
    <span class="timer" id="tm">0.0 s</span><span class="mpen" id="mpen" aria-hidden="true"></span></div>
    <p class="mstat"><span id="mmsg" aria-live="polite">${cols?(kind==='en'?'Tap a meaning, then its Chinese.':'Tap a pinyin, then its Chinese.'):(kind==='en'?'Tap a Chinese tile, then its meaning.':'Tap a Chinese tile, then its pinyin.')}</span>${best?`<span class="mbest"><span>Best</span> ${fmt(best)}</span>`:''}</p>
    <div class="mgrid${cols?' cols':''}" id="mg">${tiles.map((t,j)=>{const x=items[t.i];return `<button class="mt" data-j="${j}">${t.c?`<span class="han${x.kind==='w'?' mw':''}">${hz(x)}</span>`:other(x)}</button>`}).join('')}</div>`);
  M().querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>match(b.dataset.k));
  $('mlay').onclick=()=>{store.set('ic-mlay',cols?'mix':'cols');match(kind)};
  // the grid takes exactly the rest of the screen, so the whole game fits without scrolling
  const g=$('mg'),fit=()=>{if(!document.body.contains(g))return removeEventListener('resize',fit);
    const top=g.getBoundingClientRect().top+scrollY;let h=Math.min(cols?520:560,Math.max(260,innerHeight-top-18));g.style.height=h+'px';
    const over=document.documentElement.scrollHeight-innerHeight;if(over>0)g.style.height=Math.max(260,h-over)+'px'};
  fit();addEventListener('resize',fit);
  const msg=t=>{$('mmsg').textContent=T(t)};
  const show=()=>{const s=(Date.now()-t0)/1000+pen;if($('tm'))$('tm').textContent=s.toFixed(1)+' s';return s};
  function finish(){clearInterval(TIMER);const tenth=Math.round(show()*10),nb=!best||tenth<best;if(nb)store.set(bestKey,tenth);
    const stars=pen===0?3:pen<=2?2:1;
    g.className='mgrid mdone';g.style.height='';
    g.innerHTML=`<div class="mres"><p class="eyebrow">Done</p><span class="score">${fmt(tenth)}</span>
      <div class="mseals" aria-label="${stars} / 3">${['好','很','棒'].map((c,i)=>`<span class="mseal han${i<stars?' on':''}" style="animation-delay:${.15+i*.18}s">${c}</span>`).join('')}</div>
      <p>${nb?'New personal best for these lessons!':'Your best is '+fmt(best)+'.'}</p>
      ${missed.size?`<p class="hint">Mixed up:</p><div class="mmiss">${[...missed].map(i=>`<span class="mmi"><b class="han">${hz(items[i])}</b>${starHtml(items[i],'xs-in')} ${other(items[i])}</span>`).join('')}</div>`:pen===0?'<p class="hint">No mistakes!</p>':''}
      <div class="btns"><button class="btn ghost" data-home>‹ Home</button><button class="btn" id="mag">New round</button></div></div>`;
    trTree(g);$('mag').onclick=()=>match(kind);fit();if(stars===3)confetti()}
  g.onclick=e=>{const b=e.target.closest('.mt');if(!b||b.classList.contains('gone')||b.classList.contains('ok'))return;
    if(!t0){t0=Date.now();TIMER=setInterval(show,100)}
    const t=tiles[+b.dataset.j];if(t.c)speak(items[t.i]);
    if(!sel){sel=b;b.setAttribute('aria-pressed','true');return}
    if(sel===b){b.setAttribute('aria-pressed','false');sel=null;return}
    const s=tiles[+sel.dataset.j];
    if(s.i===t.i&&s.c!==t.c){[sel,b].forEach(x=>{x.setAttribute('aria-pressed','false');x.classList.add('ok');setTimeout(()=>x.classList.add('gone'),420)});left--;combo++;
      updTally();msg(combo>=2?combo+' in a row!':'Match!');
      if(!left)setTimeout(finish,500)}
    else{pen+=1;combo=0;missed.add(s.i);missed.add(t.i);updTally();msg('Mistake: +1 s');
      const p=$('mpen');p.textContent='+1 s';p.classList.remove('on');void p.offsetWidth;p.classList.add('on');
      [sel,b].forEach(x=>{x.classList.add('shake');x.setAttribute('aria-pressed','false');setTimeout(()=>x.classList.remove('shake'),320)})}
    sel=null;
  };
}

