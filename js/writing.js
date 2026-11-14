/* ---------- Writing ---------- */
let STROKES=null;
/* stroke-drawn characters: shift the drawing so the character's own bounding box sits in the middle of its square
   (the stroke data puts some characters, e.g. 不, noticeably low or to one side) */
function hwCreate(id,ch,o){const w=HanziWriter.create(id,ch,o);try{const el=typeof id==='string'?document.getElementById(id):id,d=STROKES&&STROKES[ch],svg=el&&el.querySelector('svg');
  if(d&&svg){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const st of d.strokes){const n=st.match(/-?\d+(?:\.\d+)?/g).map(Number);for(let i=0;i+1<n.length;i+=2){const x=n[i],y=n[i+1];if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}}
    const k=((o.width||el.clientWidth)-2*(o.padding||0))/1024;svg.style.transform=`translate(${((512-(x0+x1)/2)*k).toFixed(1)}px,${(((y0+y1)/2-388)*k).toFixed(1)}px)`}}catch(e){}return w}
async function loadStrokes(){if(STROKES)return STROKES;const r=await fetch('strokes.json');STROKES=await r.json();return STROKES}
/* handwriting recognition for "Translate · Draw": the drawn strokes are compared with the stroke medians in strokes.json
   (in order, with skipped or joined strokes allowed, and in any order as a fallback). Candidates are the characters of the
   textbook's words and sentences, so nothing outside the course is suggested. Works offline. */
let REC_CANDS=null;
function recCands(){if(REC_CANDS)return REC_CANDS;const s=new Set(),add=t=>{for(const c of t)if(isHan(c)&&STROKES[c])s.add(c)};
  for(const x of DATA.ch)if(x[0]!=='I')add(x[1]+x[2]);for(const x of DATA.wd)add(x[1]);for(const x of DATA.st)add(x[1].join(''));
  for(const x of ST)add(x.zh.join('')+x.zht.join(''));for(const k in DATA.t2)if(s.has(k))add(DATA.t2[k]);
  return REC_CANDS=[...s]}
function recPrep(strokes,flip){ // strokes: [[ [x,y],... ], ...] -> normalised, resampled
  const N=10;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(const s of strokes)for(const [x,y0_] of s){const y=flip?-y0_:y0_;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  const cx=(x0+x1)/2,cy=(y0+y1)/2,k=Math.max(x1-x0,y1-y0,1);
  return strokes.map(s=>{const p=s.map(([x,y])=>[(x-cx)/k,((flip?-y:y)-cy)/k]);
    let L=0;const d=[0];for(let i=1;i<p.length;i++){L+=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);d.push(L)}
    const out=[];for(let t=0;t<N;t++){const at=L*t/(N-1);let i=1;while(i<p.length-1&&d[i]<at)i++;
      if(p.length<2){out.push(p[0]);continue}const a=p[i-1],b=p[i],f=d[i]>d[i-1]?(at-d[i-1])/(d[i]-d[i-1]):0;out.push([a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f])}
    return out})}
function recStrokeDist(a,b){let s=0;for(let i=0;i<a.length;i++)s+=Math.hypot(a[i][0]-b[i][0],a[i][1]-b[i][1]);return s/a.length}
function recScore(u,t){ // lower is better
  const G=.45,n=u.length,m=t.length,C=u.map(a=>t.map(b=>recStrokeDist(a,b)));
  const D=Array.from({length:n+1},(_,i)=>new Float64Array(m+1));
  for(let i=0;i<=n;i++)for(let j=0;j<=m;j++){if(!i&&!j)continue;let v=1e9;
    if(i&&j)v=D[i-1][j-1]+C[i-1][j-1];if(i)v=Math.min(v,D[i-1][j]+G);if(j)v=Math.min(v,D[i][j-1]+G);D[i][j]=v}
  // stroke order is not always right: also a greedy best match in any order
  const used=new Set(),pairs=[];for(let i=0;i<n;i++)for(let j=0;j<m;j++)pairs.push([C[i][j],i,j]);pairs.sort((a,b)=>a[0]-b[0]);
  const ui=new Set();let g=0,k=0;for(const [c,i,j] of pairs){if(ui.has(i)||used.has(j)||c>G)continue;ui.add(i);used.add(j);g+=c;k++}
  g+=(n-k+m-k)*G;
  return Math.min(D[n][m],g+.15)/Math.max(n,m)}
function recognise(strokes,cands,data,top=8){const u=recPrep(strokes,false);const r=[];
  for(const c of cands){const d=data[c];if(!d)continue;if(!d._p)d._p=recPrep(d.medians,true);r.push([recScore(u,d._p),c])}
  return r.sort((a,b)=>a[0]-b[0]).slice(0,top).map(x=>x[1])}
/* how forgiving stroke recognition is: Relaxed (default) or Strict */
const wlen=()=>1.7;
function write(rest0,at){
  // Characters: one at a time. Words: write each character of the word in turn.
  const words=state.set==='w';
  const hanOf=x=>[...x.s.replace(/[()…]/g,'')].filter(isHan);
  const src=words?pool().filter(x=>hanOf(x).length):pool();if(at&&!fromK(at.k).length)at=null;let [deck,rest]=at?[fromK(at.k),fromK(at.r)]:roundOf(Array.isArray(rest0)?rest0:shuffle(src.length?src:basePool('c')));
  let i=at?Math.min(at.i,deck.length-1):0,j=0,level=store.get('ic-wlevel','trace'),writer=null,wordMis=0,got=at?at.g:0,again=at?at.a:0;
  open(bar(0,'')+`<div class="card"><p class="hint">Loading stroke data…</p></div>`);
  if(typeof HanziWriter==='undefined'){M().querySelector('.card').innerHTML='<p>The writing library could not load. Check your connection and try again.</p>';return}
  loadStrokes().then(draw).catch(()=>{M().querySelector('.card').innerHTML='<p>The stroke data could not load. Try reloading the page.</p>'});
  const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  function draw(){
    if(!j)resSave('write',{k:kOf(deck),r:kOf(rest),i,g:got,a:again,pos:(i+1)+' / '+deck.length});
    const x=deck[i],simp=hanOf(x),shown=state.script==='t'?simp.map(c=>T2[c]||c):simp,L=simp.length;
    const syl=x.kind==='c'?[x.p]:sylsOf(x.p),perSyl=syl.length===L,tn=x.kind==='c'?[x.tone]:syl.map(sylTone);
    let c=shown[j],note='';
    if(!STROKES[c]){if(STROKES[simp[j]]){c=simp[j];note='No stroke data for the traditional form, so you are writing the simplified '+simp[j]+'.'}else note='No stroke data for this character, so it is skipped.'}
    const n=STROKES[c]?STROKES[c].strokes.length:0,lastChar=j===L-1;
    const boxes=L>1?`<div class="wword" aria-label="Word progress">${shown.map((h,k)=>`<span class="wbox${k<j?' done':k===j?' now':''}" data-k="${k}" role="button" tabindex="0" aria-label="Character ${k+1}" style="cursor:pointer"><span class="han${perSyl&&k<=j?' t'+tn[k]:''}">${k<j||level!=='memory'?h:''}</span><small>${perSyl?pyHtml(syl[k]):''}</small></span>`).join('')}</div>`:'';
    const nextLabel=!lastChar?'Next character ›':i<deck.length-1?'Skip ›':'Finish';
    open(tallyBar(i-got,got,deck.length,(i+1)+' / '+deck.length)+`<div class="card top-align">
      <div class="seg" role="group" aria-label="Level"><button data-lv="show" aria-pressed="${level==='show'}">1 Watch</button><button data-lv="trace" aria-pressed="${level==='trace'}">2 Trace</button><button data-lv="memory" aria-pressed="${level==='memory'}">3 From memory</button></div>
      <div class="wprompt">${level==='memory'||L>1?'':`<span class="han" style="font-size:2.5rem">${c}</span>`}<span class="py" style="font-size:1.5rem">${x.kind==='c'?contour(x.tone):''}${pyHtml(x.p)}</span><button class="play" id="say" aria-label="Play">${PLAY}</button></div>${starHtml(x)}
      <p class="meaning">${esc(x.en)}</p>${boxes}
      <div class="pad" id="pad"><svg class="guide" viewBox="0 0 100 100" aria-hidden="true"><g stroke="currentColor" stroke-opacity=".18" stroke-width=".6" stroke-dasharray="2 2" fill="none"><line x1="0" y1="50" x2="100" y2="50"/><line x1="50" y1="0" x2="50" y2="100"/><line x1="0" y1="0" x2="100" y2="100"/><line x1="100" y1="0" x2="0" y2="100"/></g></svg><div class="hw" id="hw"></div></div>
      <p class="strokes" id="wst" role="status" aria-live="polite">${L>1?`Character ${j+1} of ${L} · `:''}${n?n+' strokes':''}</p>${note?`<p class="hint">${note}</p>`:''}
      <div class="btns" id="wbtns"><button class="btn ghost" id="wre">${level==='show'?'Play again':'Start over'}</button><button class="btn ghost" id="wnext">${nextLabel}</button></div></div>
      <p class="hint whint" style="text-align:center">${level==='show'?'Watch the stroke order, then switch to Trace.':level==='trace'?'Trace each stroke in order with your finger. A hint appears after two misses.':'Write it without the outline. A hint appears after three misses.'}${L>1?' Write the word one character at a time. Tap a box above to jump to that character.':''}</p>`);
    $('say').onclick=()=>speak(x);
    M().querySelectorAll('[data-lv]').forEach(b=>b.onclick=()=>{level=b.dataset.lv;store.set('ic-wlevel',level);draw()});

    M().querySelectorAll('.wword [data-k]').forEach(b=>b.onclick=()=>{j=+b.dataset.k;draw()});
    const advance=()=>{if(!lastChar){j++;draw();return}i++;j=0;wordMis=0;if(i>=deck.length)finish();else draw()};
    $('wnext').onclick=advance;
    if(!n)return;
    const size=$('pad').clientWidth;
    writer=hwCreate('hw',c,{width:size,height:size,padding:size*.06,showCharacter:false,showOutline:level!=='memory',
      strokeColor:css('--ink'),outlineColor:css('--outline')||css('--line'),drawingColor:css('--accent'),highlightColor:css('--accent'),
      drawingWidth:Math.max(14,size/16),strokeAnimationSpeed:1.1,delayBetweenStrokes:220,
      charDataLoader:(ch,onLoad,onErr)=>STROKES[ch]?onLoad(STROKES[ch]):onErr()});
    const pre=L>1?`Character ${j+1} of ${L} · `:'';
    const start=()=>{
      $('wst').classList.remove('wok','wbad');
      if(level==='show'){writer.hideCharacter();writer.animateCharacter();return}
      let mis=0,done=0;
      writer.quiz({leniency:wlen(),acceptBackwardsStrokes:true,showHintAfterMisses:level==='memory'?3:2,highlightOnComplete:true,
        onMistake:()=>{mis++;$('wst').textContent=`${pre}Stroke ${done+1} of ${n} · mistakes ${mis}`},
        onCorrectStroke:()=>{done++;$('wst').textContent=`${pre}Stroke ${Math.min(done+1,n)} of ${n} · mistakes ${mis}`},
        onComplete:M()._wdone=({totalMistakes})=>{
          const ok=totalMistakes<=Math.max(store.get('ic-wstrict',false)?1:2,n/(store.get('ic-wstrict',false)?5:3)|0);wordMis+=ok?0:1;
          $('wst').textContent=`${pre}${n} strokes · mistakes ${totalMistakes}`;
          const b=M().querySelector('.wbox.now');if(b){b.classList.add('done');const h=b.querySelector('.han');h.textContent=shown[j];if(perSyl)h.classList.add('t'+tn[j])}
          if(lastChar)speak(x);else if(x.kind==='c')speak(x);
          const msg=lastChar&&L>1?(wordMis===0?'Word complete!':'Word complete, with some mistakes.'):totalMistakes===0?'No mistakes!':ok?'Done, nearly perfect.':'Done, with some mistakes.';
          /* the result replaces the stroke counter and the buttons swap in place, so nothing on the screen moves */
          const ws=$('wst');ws.classList.add(ok&&wordMis===0?'wok':'wbad');
          ws.innerHTML=`<b>${msg}</b>${lastChar&&level==='trace'&&wordMis===0?' <button class="link" id="tomem">Now from memory ›</button>':''}`;
          if(!lastChar){$('wnext').classList.remove('ghost');$('wnext').focus()}
          if(lastChar){$('wbtns').innerHTML='<button class="btn badb" id="wag">↻ Again later</button><button class="btn okb" id="wok">✓ Got it</button>';
            $('wag').onclick=()=>{grade(x,false);again++;deck.splice(Math.min(deck.length,i+4),0,x);i++;j=0;wordMis=0;draw()};
            $('wok').onclick=()=>{grade(x,level==='memory'?wordMis===0:true);got++;advance()};
            keyHandler=e=>{if(e.key==='ArrowLeft')$('wag').click();else if(e.key==='ArrowRight'||e.key==='Enter')$('wok').click()}}
          if($('tomem'))$('tomem').onclick=()=>{level='memory';store.set('ic-wlevel',level);j=0;wordMis=0;draw()}}});
      $('wst').textContent=`${pre}Stroke 1 of ${n}`;
    };
    $('wre').onclick=start;start();
  }
  function finish(){resClear('write');open(bar(100,deck.length+' / '+deck.length)+`<div class="card"><p class="eyebrow">Writing done</p><span class="score">${got}</span><p>${words?'words':'characters'} you have got.${again?` ${again}× sent back for another go.`:''} If you traced them, try From memory next.</p><div class="btns"><button class="btn ghost" data-home>‹ Home</button>${rest.length?`<button class="btn ghost" data-go="write">Start over</button><button class="btn" id="wnr">Next round · ${rest.length} left</button>`:'<button class="btn" data-go="write">Again</button>'}</div></div>`);if($('wnr'))$('wnr').onclick=()=>write(rest)}
}

