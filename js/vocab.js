/* ---------- Vocabulary list: each lesson's characters (the Character Workbook) and then its words, with the words each
   character appears in; a search over every lesson by character, pinyin (with or without tones) or meaning.
   The ★ tab lists everything you starred (the same stars as everywhere else) and starts practice on just those. ---------- */
const vUniq=a=>[...new Map(a.map(x=>[x.k,x])).values()];
// a character that is also a one-character word in the same list is shown once, as the word
const vOnce=a=>{const w=new Set(a.filter(x=>x.kind==='w').map(x=>x.s));return a.filter(x=>x.kind!=='c'||!w.has(x.s))};
// pinyin order: letters without tones first (ü after u), then tones 1–4 and neutral, a character before a word, then the character itself
const VSYL=new Map();const vSyl=x=>{if(!VSYL.has(x.k)){const syl=(x.p.replace(/\([^)]*\)/g,'').toLowerCase().normalize('NFC').match(SYL)||[]);
  const one=m=>{let o='';for(const c of m)o+=MK[c]?(MK[c][0]==='v'?'u~':MK[c][0]):c==='ü'?'u~':/[a-z]/.test(c)?c:'';return o};
  VSYL.set(x.k,{b:syl.map(one).join(' '),t:syl.map(m=>sylTone(m)||5).join('')})}return VSYL.get(x.k)};
// pinyin order, syllable by syllable like a dictionary (shén, shénme, shēng): letters first (ü after u), then tones 1–4 and neutral,
// a character before a word with the same pinyin, then the character itself
const vAlpha=(a,b)=>{const A=vSyl(a),B=vSyl(b);return A.b<B.b?-1:A.b>B.b?1:A.t<B.t?-1:A.t>B.t?1:a.kind!==b.kind?(a.kind==='c'?-1:1):a.s.localeCompare(b.s,'zh')};
// pinyin as base letters ("zhongguo") and as numbered syllables ("zhong1guo2"); ü is v, the neutral tone is 5
function vPy(p){const syl=(p.replace(/\([^)]*\)/g,'').toLowerCase().normalize('NFC').replace(/u:/g,'ü').match(SYL)||[]);
  const one=m=>{let b='';for(const c of m)b+=MK[c]?MK[c][0]:c==='ü'?'v':c;return b.replace(/[^a-z]/g,'')};
  return {b:syl.map(one).join(''),n:syl.map(m=>one(m)+(sylTone(m)||5)).join('')}}
const VIDX=new Map();const vIdx=x=>{if(!VIDX.has(x.k)){const a=vPy(x.p),b=vPy(x.p.replace(/[()]/g,''));VIDX.set(x.k,{b:[a.b,b.b],n:[a.n,b.n],en:x.en.toLowerCase()})}return VIDX.get(x.k)};
function vSearch(q){
  q=q.trim().normalize('NFC');if(!q)return [];
  const all=vUniq([...CH,...WD]),han=[...q].filter(isHan).join(''),out=[];
  if(han){for(const x of all){const z=[x.s,x.t].map(s=>s.replace(/[()…]/g,''));const sc=z.includes(han)?0:z.some(s=>s.startsWith(han))?1:z.some(s=>s.includes(han))?2:-1;if(sc>=0)out.push([sc,x])}}
  else{
    const lo=q.toLowerCase().replace(/u:/g,'ü').replace(/([lnjqxy])v/g,'$1ü').replace(/^v/,'ü'),tones=/[1-5]/.test(lo)||/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(lo);
    // the query as pinyin: numbers ("zhong1 guo2"), marks ("zhōngguó") or plain letters ("zhongguo", "ni hao")
    let qb='',qn='';
    if(/[1-5]/.test(lo)){for(const m of lo.replace(/[\s'’-]+/g,'').match(/[a-zü]+[1-5]?/g)||[]){const b=m.replace(/[1-5]/,'').replace(/ü/g,'v');qb+=b;qn+=b+(m.match(/[1-5]/)||[''])[0]}}
    else{const v=vPy(lo);qb=v.b;qn=v.n}
    const word=new RegExp('(^|[^a-z])'+lo.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
    for(const x of all){const I=vIdx(x);let sc=-1;
      if(qb&&/^[a-zü\s'’1-5āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ-]+$/.test(lo)){
        const hay=tones?I.n:I.b,nd=tones?qn:qb;
        if(hay.some(h=>h===nd))sc=0;else if(hay.some(h=>h.startsWith(nd)))sc=1;else if(nd.length>1&&hay.some(h=>h.includes(nd)))sc=3}
      if(!tones&&lo.length>1){const e=I.en;if(e.split(/[;,]\s*/).some(p=>p.replace(/^(to|a|an|the) /,'')===lo))sc=sc<0?.5:Math.min(sc,.5);else if(word.test(e))sc=sc<0?2:Math.min(sc,2)}
      if(sc>=0)out.push([sc,x])}}
  return out.sort((a,b)=>a[0]-b[0]||(a[1].kind===b[1].kind?0:a[1].kind==='c'?-1:1)||ORD(a[1].l)-ORD(b[1].l)).map(r=>r[1]).slice(0,80);
}
// textbook words that use a character, up to a lesson (the words you can already read with it)
function vWordsWith(x,upto){const c=[x.s,x.t];return vUniq(WD.filter(w=>ORD(w.l)<=ORD(upto)&&c.some(z=>w.s.includes(z)||w.t.includes(z))&&w.s!==x.s)).sort((a,b)=>ORD(a.l)-ORD(b.l)).slice(0,8)}
function vocab(){
  const ls=LESSONS.filter(l=>CH.some(x=>x.l===l)||WD.some(x=>x.l===l));let l=store.get('ic-vlesson','1');if(l!=='star'&&!ls.includes(l))l=ls[0];
  let hp=store.get('ic-vhp',false),he=store.get('ic-vhe',false),q='';
  const favs=()=>vUniq([...WD,...CH].filter(starred)).sort(vAlpha);
  const row=(x,j,tag,with_)=>`<li class="vrow m${mastery(x)}${with_&&with_.length?' vch':''}" data-i="${j}"><span class="vz han">${hzHtml(x)}</span><span class="vp">${pyHtml(x.p)}${x.pos?` <small>${esc(x.pos)}</small>`:''}</span><span class="ve">${esc(x.en)}${tag?` <small class="vl">· ${tag}</small>`:''}</span>${with_&&with_.length?`<span class="vw" data-nosay><small>in words:</small> ${with_.map(w=>`<button class="vwb han" data-vw="${esc(w.k)}" lang="zh-Hans">${esc(hz(w))}</button>`).join('')}</span>`:''}<button class="vstar" data-st="${j}" aria-pressed="${starred(x)}" aria-label="Star">★</button><button class="mini" data-say="${j}" aria-label="Play">${PLAY}</button></li>`;
  const kindTag=x=>`${x.kind==='c'?'Character':'Word'} · ${x.l==='I'?'Intro':'L'+x.l}`;
  let list=[],shown=new Set();
  function body(){
    shown=new Set();const fav=l==='star';let h='';
    if(q){list=vOnce(vSearch(q));
      h=`<p class="vtitle" aria-live="polite">${list.length?`<b>${(list.length===80?'80+':list.length)+' '+(list.length===1?'result':'results')}</b>`:'<span>Nothing found. Try the pinyin without tones, a character, or an English word.</span>'}</p>
        ${list.length?`<ol class="vlist" id="vl">${list.map((x,j)=>row(x,j,kindTag(x))).join('')}</ol>`:''}`}
    else if(fav){list=vOnce(favs());
      h=`<p class="vtitle"><b>Starred</b> · ${list.length} ${list.length===1?'item':'items'} from all lessons</p>
        ${list.length?`<div class="vprac"><span class="hint">Practise only these:</span><div class="vpbtns">${[['cards','Flashcards'],['learn','Learn'],['write','Writing'],['match','Match']].map(([m,n])=>`<button class="btn ghost" data-pm="${m}">${n}</button>`).join('')}</div></div>`
          :`<div class="card vempty"><span class="vbig">★</span><p>Nothing starred yet. Tap ★ next to a word in any lesson and it is saved here, ready to practise.</p></div>`}
        <ol class="vlist" id="vl">${list.map((x,j)=>row(x,j,kindTag(x))).join('')}</ol>`}
    else{const cs=vUniq(CH.filter(x=>x.l===l)),ws=vUniq(WD.filter(x=>x.l===l));list=vOnce([...cs,...ws]).sort(vAlpha);
      h=`<p class="vtitle"><b>${LNAME(l)}</b> · ${LTITLE[l]} <span class="han">${LZH[l]}</span> · ${cs.length} characters${ws.length?` · ${ws.length} words`:''}</p>
        <p class="hint vsh">Characters and words together, in pinyin order. Under a character: the words of this and earlier lessons that use it.</p>
        <ol class="vlist" id="vl">${list.map((x,j)=>row(x,j,'',x.kind==='c'||[...x.s].filter(isHan).length===1?vWordsWith(x,l):null)).join('')}</ol>`}
    $('vbody').innerHTML=h;$('vbody').className=(hp?'hp ':'')+(he?'he':'');
    const i=ls.indexOf(l);$('vnav').innerHTML=q||fav?'':`${i>0?`<button class="btn ghost" data-go="${ls[i-1]}">‹ <span>${LNAME(ls[i-1])}</span></button>`:'<span></span>'}${i<ls.length-1?`<button class="btn ghost" data-go="${ls[i+1]}"><span>${LNAME(ls[i+1])}</span> ›</button>`:''}`;
    M().querySelectorAll('.vtab').forEach(b=>b.setAttribute('aria-selected',String(!q&&b.dataset.l===l)));
    $('vtools').hidden=!list.length;
    M().querySelectorAll('[data-pm]').forEach(b=>b.onclick=()=>{state.sel=new Set(LESSONS);state.filter='star';state.set=list.some(x=>x.kind==='w')?'w':'c';saveState();setup(b.dataset.pm)});
    M().querySelectorAll('#vnav [data-go]').forEach(b=>b.onclick=()=>{go(b.dataset.go);window.scrollTo(0,0)});
  }
  const go=x=>{l=x;q='';$('vq').value='';$('vqx').hidden=true;store.set('ic-vlesson',l);body();const t=M().querySelector('.vtab[aria-selected="true"]');if(t)t.scrollIntoView({block:'nearest',inline:'center'})};
  open(bar(0,'','‹ Home')+`<div class="vhead"><h2>Vocabulary list</h2>
    <div class="vsearch" role="search"><svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="8.5" cy="8.5" r="5.5"/><path d="M13 13l4 4"/></svg><input id="vq" type="search" enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Search: 中, zhong, zhōngguó, China" aria-label="Search characters and words"><button id="vqx" type="button" aria-label="Clear search" hidden>×</button></div>
    <div class="vtabs" role="tablist" aria-label="Lessons"><button role="tab" class="vtab vfav" data-l="star" aria-selected="false" aria-label="Starred">★ <span id="vnf">${favs().length}</span></button>${ls.map(x=>`<button role="tab" class="vtab" data-l="${x}" aria-selected="false">${x==='I'?'Intro':x}</button>`).join('')}</div>
    <div class="vtools" id="vtools"><div class="seg" role="group" aria-label="Hide"><button data-h="py" aria-pressed="${hp}">Hide pinyin</button><button data-h="en" aria-pressed="${he}">Hide meaning</button></div>
      <span class="hint" id="vth">${hp||he?'Tap a word to reveal it.':'Tap a word for details, ★ to save it.'}</span></div></div>
    <div id="vbody"></div><div class="vnav" id="vnav"></div>`);
  M().querySelectorAll('.vtab').forEach(b=>b.onclick=()=>go(b.dataset.l));
  let tm=null;$('vq').oninput=()=>{clearTimeout(tm);tm=setTimeout(()=>{q=$('vq').value;$('vqx').hidden=!q;body()},120)};
  $('vq').onkeydown=e=>{if(e.key==='Escape'&&$('vq').value){e.preventDefault();go(l)}else if(e.key==='Enter')$('vq').blur()};
  $('vqx').onclick=()=>{go(l);$('vq').focus()};
  M().querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>{if(b.dataset.h==='py'){hp=!hp;store.set('ic-vhp',hp)}else{he=!he;store.set('ic-vhe',he)}
    b.setAttribute('aria-pressed',String(b.dataset.h==='py'?hp:he));$('vth').textContent=T_(hp||he?'Tap a word to reveal it.':'Tap a word for details, ★ to save it.');const y=scrollY;body();window.scrollTo(0,y)});
  $('vbody').onclick=e=>{const vw=e.target.closest('[data-vw]');if(vw){e.stopPropagation();speak(BYKEY.get(vw.dataset.vw));return}
    const say=e.target.closest('[data-say]');if(say){speak(list[+say.dataset.say]);return}
    const st=e.target.closest('[data-st]');if(st){st.setAttribute('aria-pressed',toggleStar(list[+st.dataset.st]));if($('vnf'))$('vnf').textContent=favs().length;return}
    const r=e.target.closest('.vrow');if(!r)return;const j=+r.dataset.i;
    if((hp||he)&&!shown.has(j)){shown.add(j);r.classList.add('show');speak(list[j]);return}
    infoSheet(list,j)};
  body();const t=M().querySelector('.vtab[aria-selected="true"]');if(t)t.scrollIntoView({block:'nearest',inline:'center'});
}

