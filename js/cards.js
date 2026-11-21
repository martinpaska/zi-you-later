/* ---------- Flashcards ---------- */
/* back of a flashcard: each character in its own grid box, like in Learn (shown complete, no stroke animation) */
function cardBack(x){
  return `<span class="py">${pyHtml(x.p)}</span>${x.pos?`<span class="tag">${esc(x.pos)}</span>`:''}<span class="meaning">${esc(x.en)}</span>`;
}
function strokeCard(x,front){
  const st=M().querySelector(front?'#card .cfront':'#card .cbox .cst'),box=st&&st.parentNode;if(!st)return;
  const go=()=>{if(!STROKES||typeof HanziWriter==='undefined'||!box.isConnected)return;
    const chars=[...hz(x)],fs=parseFloat(getComputedStyle(st).fontSize),nh=chars.filter(isHan).length,cw=$('card').clientWidth,base=Math.min(cw*.42,200),ch=$('card').clientHeight,nx=chars.length-nh,fit=(cw-64-8*(chars.length-1))/Math.max(nh+nx*.45,1),cs=getComputedStyle($('card')),pad=parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom),inf=M().querySelector('#card .cinfo'),stk=!front&&inf&&M().querySelector('#card .cflip.stack, #card .cflip')&&inf.offsetTop>st.getBoundingClientRect().top-$('card').getBoundingClientRect().top+10,exh=(M().querySelector('#card .cexin')||{}).offsetHeight||0,room=front?Infinity:ch-pad-(inf?inf.offsetHeight:0)-exh-30,sz=Math.round(Math.max(48,Math.min(120,ch*.3,fit,room))),tn=tonesOf(x),hanIdx=[];
    const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    const wrap=document.createElement('span');wrap.className=front?'cstk plain':'cstk';wrap.setAttribute('aria-hidden','true');
    const ws=[];let h=0;
    chars.forEach((c,i)=>{const cell=document.createElement('span');
      if(isHan(c)&&STROKES[c]){cell.style.width=cell.style.height=sz+'px';cell.id='cstk'+i;cell.dataset.t=tn&&tn.length===[...x.s].filter(isHan).length?tn[h]:(x.tone||0);ws.push(cell)}
      else{cell.className='han';cell.textContent=c;cell.style.fontSize=Math.round(sz*.4)+'px';cell.style.width=Math.round(sz*.45)+'px'}
      if(isHan(c))h++;wrap.appendChild(cell)});
    if(!ws.length)return;
    st.classList.add('sr-only');box.insertBefore(wrap,st);
    ws.forEach(cell=>hwCreate(cell.id,[...hz(x)][+cell.id.slice(4)],{width:sz,height:sz,padding:sz*.08,showOutline:false,strokeColor:front?css('--ink'):css('--t'+cell.dataset.t)||css('--ink'),radicalColor:null,charDataLoader:(ch,ok,err)=>STROKES[ch]?ok(STROKES[ch]):err()}));
    };
  STROKES?go():loadStrokes().then(go).catch(()=>{})}

/* short sessions: Flashcards and Writing go 15 items at a time unless "All at once" is picked in the setup */
const ROUNDN=15,roundOf=list=>[list.slice(0,ROUNDN),list.slice(ROUNDN)];
// the back of a card: one or two short sentences with the word, inside the card under the word (two when the screen is tall enough)
const cardSents=x=>exampleHtml(x,innerHeight>=760?2:1,{max:12,heading:false,tag:false,cls:'cexin',span:true});
function cards(deck0,rest0,at){
  let rest=rest0||[];if(!deck0||!deck0.length)[deck0,rest]=roundOf(shuffle(pool()));
  let deck=deck0,i=at?Math.min(at.i,deck.length-1):0,flipped=false,yes=at?fromK(at.y):[],no=at?fromK(at.n):[],cardH=0;
  let dir=at&&at.d||state.cdir||'zh';const fromEn=new Map(),isEn=x=>{if(!fromEn.has(x))fromEn.set(x,dir==='en'||(dir==='mix'&&Math.random()<.5));return fromEn.get(x)};
  function draw(){
    if(i>=deck.length)return done();
    resSave('cards',{k:kOf(deck),r:kOf(rest),i,y:kOf(yes),n:kOf(no),d:dir,pos:(i+1)+' / '+deck.length});
    const x=deck[i],en=isEn(x),sents=flipped?cardSents(x):'';
    open(tallyBar(no.length,yes.length,deck.length,(i+1)+' / '+deck.length,'Still learning','Know')+
      `
      <div class="seg cdirseg" role="group" aria-label="Card front">${[['zh','中 → EN'],['en','EN → 中'],['mix','Mixed']].map(([k,n])=>`<button data-cd2="${k}" aria-pressed="${dir===k}">${n}</button>`).join('')}</div>
      <div class="cardwrap"><button class="cstar" id="star" aria-pressed="${starred(x)}" aria-label="Star this card" title="Star this card">★</button><button class="card${flipped?' flipped':''}${sents?' hasex':''}" id="card" aria-live="polite" ${en&&!flipped?'data-nosay':''}>${flipped?`<div class="cflip${[...hz(x)].filter(isHan).length>2?' stack':''}"><span class="cbox ${x.kind==='c'?'one':'wordbig'}"><span class="han cst">${hzHtml(x)}</span></span><div class="cinfo">${cardBack(x)}<span class="play iconplay cplay" data-play role="button" aria-label="Play">${PLAY}</span></div></div>${sents}`:`${en?`<p class="meaning" style="font-size:1.5rem;font-weight:700">${esc(x.en)}</p>`:`<span class="cfront han">${hz(x)}</span>`}${(state.cflips||0)<5?`<span class="flip-hint">Tap to flip</span>`:''}`}</button></div>
      <div class="btns"><button class="btn badb" id="no">✗ Still learning</button><button class="btn okb" id="yes">✓ Know</button></div>
      <div class="btns cardnav"><button class="btn ghost" id="prev" ${i?'':'disabled'}>‹ Back</button><button class="btn ghost" id="tw" aria-label="Try writing ${x.kind==='w'&&[...x.s].filter(isHan).length>1?'this word':'this character'}">${PEN}Write</button><button class="btn ghost" id="shuf" aria-label="Shuffle the rest">Shuffle</button></div>`);
    const card=$('card');
    /* lock the card size for the whole deck: front and back, every card, the same (also on phones whose browser resizes the viewport) */
    if(!cardH)cardH=card.offsetHeight;card.style.height=cardH+'px';card.style.width='100%';
    card.onclick=e=>{const ss=e.target.closest('[data-ss]');if(ss){speakSent(SENTS.get(ss.dataset.ss));return}if(flipped&&e.target.closest('[data-play]')){speak(x);const b=e.target.closest('[data-play]');b.classList.remove('ping');void b.offsetWidth;b.classList.add('ping');return}flipped=!flipped;if(flipped&&(state.cflips||0)<5){state.cflips=(state.cflips||0)+1;saveState()}draw();$('card').classList.add('flipin');if(flipped)speak(x)};
    $('star').onclick=()=>$('star').setAttribute('aria-pressed',toggleStar(x));
    $('tw').onclick=()=>tryWrite(x);
    M().querySelectorAll('[data-cd2]').forEach(b=>b.onclick=()=>{dir=state.cdir=b.dataset.cd2;saveState();fromEn.clear();flipped=false;draw()});
    strokeCard(x,!flipped);
    const sort=ok=>{card.classList.remove('flipin');card.classList.add(ok?'swipe-r':'swipe-l');grade(x,ok);(ok?yes:no).push(x);setTimeout(()=>{i++;flipped=false;draw();if($('card'))$('card').classList.add('cardin')},MOTION?200:0)};
    $('yes').onclick=()=>sort(true);$('no').onclick=()=>sort(false);
    $('prev').onclick=()=>{i--;const y=deck[i];yes=yes.filter(z=>z!==y);no=no.filter(z=>z!==y);flipped=false;draw()};
    $('shuf').onclick=()=>{deck=deck.slice(0,i).concat(shuffle(deck.slice(i)));flipped=false;draw()};
    let sx=null;card.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;card.classList.remove('flipin','cardin')},{passive:true});
    card.addEventListener('touchmove',e=>{if(sx===null)return;const dx=e.touches[0].clientX-sx;if(Math.abs(dx)<8)return;card.classList.add('dragging');card.style.transform=`translateX(${dx}px) rotate(${dx/22}deg)`;card.classList.toggle('drag-r',dx>60);card.classList.toggle('drag-l',dx<-60)},{passive:true});
    card.addEventListener('touchend',e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;sx=null;card.classList.remove('dragging','drag-l','drag-r');
      if(Math.abs(dx)>60){e.preventDefault();card.style.transform='';sort(dx>0)}else{card.style.transition='transform .3s cubic-bezier(.16,1,.3,1)';card.style.transform='';setTimeout(()=>{card.style.transition=''},300)}});
    card.addEventListener('touchcancel',()=>{sx=null;card.classList.remove('dragging','drag-l','drag-r');card.style.transform=''});
    keyHandler=e=>{if(e.key===' '){e.preventDefault();card.click()}else if(e.key==='ArrowRight')sort(true);else if(e.key==='ArrowLeft')sort(false)};
  }
  function done(){resClear('cards');
    open(bar(100,deck.length+' / '+deck.length)+`<div class="card"><p class="eyebrow">Deck finished</p><span class="score">${yes.length} / ${deck.length}</span>
      <p>${no.length?`Still learning: ${no.length}. Go through them again until they are all in the Know pile.`:'You know all of them. Try Learn or Writing next.'}</p>
      ${no.length?`<div class="grp">${no.map((y,j)=>`<div class="gi"><span class="han">${hzHtml(y)}</span><span class="p">${pyHtml(y.p)}</span><span class="m">${esc(y.en)}</span><button class="mini" data-j="${j}" aria-label="Play">${PLAY}</button>${starHtml(y,'xs-sm')}</div>`).join('')}</div>`:''}
      <div class="btns">${no.length?`<button class="btn${rest.length?' ghost':''}" id="again">Study the ${no.length} again</button>`:''}${rest.length?`<button class="btn" id="nextr">Next round · ${rest.length} left</button>`:''}<button class="btn ghost" id="restart">Start over</button></div></div>`);
    M().querySelectorAll('.mini').forEach(m=>m.onclick=()=>speak(no[+m.dataset.j]));
    if($('again'))$('again').onclick=()=>cards(shuffle(no),rest);
    if($('nextr'))$('nextr').onclick=()=>cards(...roundOf(rest));
    $('restart').onclick=()=>cards();
  }
  draw();
}

