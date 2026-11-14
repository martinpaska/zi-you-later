/* ---------- Grammar: a summary of each lesson's grammar points ---------- */
function grammar(l0){
  const ls=Object.keys(GRAMMAR);let l=l0||ls.find(x=>state.sel.has(x))||'1';
  const zh=t=>state.script==='t'?toTrad(t):t;
  const list=ST.filter(s=>s.l===l);
  open(bar(0,'','‹ Home')+`<div class="row"><h2>Grammar</h2><span class="hint">${GRAMMAR[l].length} points · Lesson ${l}</span></div>
    <div class="lpick" role="group" aria-label="Lesson">${ls.map(k=>`<button data-gl="${k}" aria-pressed="${k===l}">L${k}</button>`).join('')}</div>
    <div class="glist">${GRAMMAR[l].map((g,i,_,D=(PACK==='cin1'&&GDETAIL[l]||[])[i]||{})=>`<article class="gp"><header><span class="gn">${i+1}</span><h3>${esc(g.t)}</h3><span class="gpage">${g.p?`Textbook p. ${g.p}`:`<span lang="zh-Hans" data-noi18n>${esc(g.src)}</span>`}</span></header>
      <p>${esc(g.ex)}</p><p class="gpat">${esc(g.pat)}</p>
      ${D.d?`<div class="ghow"><h4>How it works</h4><ul>${D.d.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></div>`:''}
      <details class="more gegd"><summary><span>Examples <span class="gcnt">${[...g.eg,...(D.eg||[])].length}</span></span></summary><div class="geg">${[...g.eg,...(D.eg||[])].map(([z,p,e])=>`<div class="ge"><div><span class="han">${esc(zh(z))}</span><span class="pyl">${pyHtml(p)}</span><span class="en">${esc(e)}</span></div><button class="play" data-gsay="${esc(z)}" aria-label="Play">${PLAY}</button></div>`).join('')}</div></details>
      ${g.tip?`<p class="gtip"><b>Watch out:</b> ${esc(g.tip)}</p>`:''}<button class="btn gdbtn" data-gd="${i}">✎ Practise this point</button></article>`).join('')}</div>
    ${list.length?`<div class="btns"><button class="btn" id="gpr">Practise Lesson ${l} sentences</button></div>`:''}
    <p class="hint">${PACK==='hsk1'?'The grammar points follow the official HSK 1 grammar list (HSK syllabus, 2025). The explanations, examples and exercises were written for this app and use only HSK 1 words.':'The grammar points follow the textbook. The explanations and examples were written for this app.'}</p>`);
  M().querySelectorAll('[data-gl]').forEach(b=>b.onclick=()=>grammar(b.dataset.gl));
  M().querySelectorAll('[data-gsay]').forEach(b=>b.onclick=e=>{e.stopPropagation();sayText(b.dataset.gsay)});
  if($('gpr'))$('gpr').onclick=()=>build(list,false);
  M().querySelectorAll('[data-gd]').forEach(b=>b.onclick=()=>gdrill(l,+b.dataset.gd));
}

/* ---------- Grammar 1: the course grammar seminars G1–G10 (Gramatika čínštiny 1), summarised in our own words.
   grammar1.json is built by grammar1/build.py; every example and drill uses only textbook vocabulary. ---------- */
let G1D=null;
async function loadG1(){if(G1D)return G1D;const r=await fetch('grammar1.json');if(!r.ok)throw new Error(r.status);G1D=await r.json();return G1D}
async function gram1(k0){
  if(!G1D){open(bar(0,'','‹ Home')+'<div class="card"><p class="hint">Loading…</p></div>');try{await loadG1()}catch(e){open(bar(0,'','‹ Home')+'<div class="card"><p>Chinese Grammar I could not be loaded. Check your connection and try again.</p></div>');return}}
  const ks=Object.keys(G1D);let k=k0||store.get('ic-g1','S1');if(!G1D[k])k=ks[0];store.set('ic-g1',k);
  const S=G1D[k],n=+k.slice(1),i=ks.indexOf(k),zh=t=>state.script==='t'?toTrad(t):t;
  const ex=(ws,ps,cz,nw)=>`<div class="ge"><div><span class="han">${esc(zh(ws.join('')))}</span><span class="pyl">${pyHtml(ps.join(' ').replace(/ ([,.?!:])/g,'$1'))}</span><span class="en" data-noi18n>${esc(cz)}</span>${nw?`<span class="g1nw"><b>Mimo učebnici:</b> ${nw.map(([z,p,g])=>`<span class="han">${esc(zh(z))}</span> ${pyHtml(p)} – ${esc(g)}`).join(' · ')}</span>`:''}</div><button class="play" data-say="${esc(ws.join(''))}" aria-label="Play">${PLAY}</button></div>`;
  const prac=`<button class="btn gdbtn" data-g1p>✎ Practise seminar ${n} · ${S.drills.length} sentences</button>`;
  open(bar(0,'','‹ Home')+`<div class="row"><h2>Chinese Grammar I</h2><span class="hint">${S.topics.length} topics · Seminar ${n}</span></div>
    <div class="lpick" role="group" aria-label="Seminar">${ks.map(x=>`<button data-g1="${x}" aria-pressed="${x===k}">G${x.slice(1)}</button>`).join('')}</div>
    <p class="g1title" data-noi18n>${esc(S.t)}</p>${prac}
    <div class="glist" data-noi18n>${S.topics.map((t,j)=>`<article class="gp"><header><span class="gn">${j+1}</span><h3>${esc(t.t)}</h3></header>
      <div class="ghow"><ul>${t.p.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
      ${t.ex.length?`<details class="more gegd"><summary><span><span data-i18n>Examples</span> <span class="gcnt">${t.ex.length}</span></span></summary><div class="geg">${t.ex.map(e=>ex(...e)).join('')}</div></details>`:''}</article>`).join('')}</div>
    ${prac}
    <div class="vnav">${i>0?`<button class="btn ghost" data-g1="${ks[i-1]}">‹ <span>Seminar ${i}</span></button>`:'<span></span>'}${i<ks.length-1?`<button class="btn ghost" data-g1="${ks[i+1]}"><span>Seminar ${i+2}</span> ›</button>`:''}</div>
    <p class="hint">Summaries of the course seminars Gramatika čínštiny 1, written for this app. The exercises use only words from the textbook; a few examples add a word from the seminar slides, marked "Mimo učebnici".</p>`);
  M().querySelectorAll('[data-g1]').forEach(b=>b.onclick=()=>{gram1(b.dataset.g1);window.scrollTo(0,0)});
  M().querySelectorAll('[data-say]').forEach(b=>b.onclick=e=>{e.stopPropagation();sayText(b.dataset.say)});
  M().querySelectorAll('[data-g1p]').forEach(b=>b.onclick=async()=>{await loadGdrill();GDRILL[k+'-0']=S.drills;gdrill(k,0)});
  M().querySelectorAll('[data-i18n]').forEach(e=>{e.textContent=T_(e.textContent)});
}

/* ---------- Grammar drills: 20 exercises for one grammar point ---------- */
let GDRILL=null;
async function loadGdrill(){if(GDRILL)return GDRILL;const r=await fetch(PACK==='hsk1'?'grammar-hsk1.json':'grammar-practice.json');GDRILL=await r.json();return GDRILL}
function gdrill(l,gi,only){
  const sem=!!(G1D&&G1D[l]),G=sem?{t:'Chinese Grammar I · Seminar '+l.slice(1)}:GRAMMAR[l][gi],toList=()=>sem?gram1(l):grammar(l),zh=t=>state.script==='t'?toTrad(t):t,NONE='∅';
  if(!GDRILL){open(bar(0,'')+`<div class="card"><p class="hint">Loading exercises…</p></div>`);
    loadGdrill().then(()=>gdrill(l,gi,only)).catch(()=>open(bar(0,'')+`<div class="card"><p>The exercises could not be loaded. Check your connection and try again.</p><button class="btn" id="gdb">‹ Back to grammar</button></div>`)||($('gdb').onclick=toList));return}
  const all=GDRILL[l+'-'+gi]||[];const qs=shuffle(only||all);let qi=0,ok=0,bad=0;const missed=[];
  const back=()=>{const b=M().querySelector('.bar .back');if(b){b.removeAttribute('data-home');b.textContent=T_(sem?'‹ Chinese Grammar I':'‹ Grammar');b.onclick=toList}};
  const full=q=>q[0]==='c'?q[1].replace('＿',q[2][0]===NONE?'':q[2][0]):q[0]==='p'?q[1][0]:q[1].join('').replace(/\s+/g,'')+endMark(null,q[2]);
  function draw(){
    if(qi>=qs.length)return finish();
    const q=qs[qi],head=tallyBar(bad,ok,qs.length,(qi+1)+' / '+qs.length);
    const top=`<p class="eyebrow">${esc(G.t)}</p>`;
    let body='';
    if(q[0]==='c'){const os=shuffle(q[2]);q._o=os;
      body=`<p class="hint">Fill in the gap.</p><p class="gq han">${esc(zh(q[1])).replace('＿','<span class="gblank">＿＿</span>')}</p><p class="muted gen">${esc(q[3])}</p>
        <div class="opts gopts" id="qo">${os.map((o,k)=>`<button class="opt c" data-k="${k}">${o===NONE?'<i>(nothing)</i>':`<span class="han">${esc(zh(o))}</span>`}</button>`).join('')}</div>`}
    else if(q[0]==='p'){const os=shuffle(q[1]);q._o=os;
      body=`<p class="hint">Which sentence is correct?</p><p class="muted gen">${esc(q[2])}</p>
        <div class="opts one gopts" id="qo">${os.map((o,k)=>`<button class="opt" data-k="${k}"><span class="han">${esc(zh(o))}</span></button>`).join('')}</div>`}
    else{let bank=shuffle(q[1].map((c,k)=>({c,k})));if(q[1].length>2)for(let t=0;t<5&&bank.every((b,k)=>b.c===q[1][k]);t++)bank=shuffle(bank);q._b=bank;q._p=[];
      body=`<p class="hint">Put the words in the right order.</p><p class="muted gen">${esc(q[2])}</p>
        <div class="ansrow" id="ar" aria-label="Your sentence" data-end="${endMark(null,q[2])}"></div><div class="bank" id="bk">${bank.map((b,k)=>`<button class="chunk han" data-j="${k}">${esc(zh(b.c))}</button>`).join('')}</div>
        <div class="btns"><button class="btn ghost" id="clr">Clear answer</button><button class="btn" id="chk" disabled>Check</button></div>`}
    open(head+`<div class="card top-align gdcard">${top}${body}<div id="fb" role="status" aria-live="polite" style="width:100%"></div></div>`);back();
    const done=(right,picked)=>{if(right)ok++;else{bad++;missed.push(q)}
      const sent=full(q);sayText(sent);
      $('fb').innerHTML=`<div class="fb ${right?'ok':'bad'}"><h3>${right?'Correct!':'The right answer is:'}</h3><p class="han gans">${esc(zh(sent))}</p><p>${esc(q[0]==='c'?q[3]:q[2])}</p>
        <div class="row gfbrow"><button class="play" id="gsay">${PLAY}Play</button><button class="btn" id="nx">${qi<qs.length-1?'Next ›':'See result'}</button></div></div>`;
      $('gsay').onclick=()=>sayText(sent);$('nx').onclick=()=>{qi++;draw()};$('nx').focus();keyHandler=e=>{if(e.key==='Enter'){e.preventDefault();$('nx').click()}}};
    if(q[0]!=='o'){const right=q[0]==='c'?q[2][0]:q[1][0];
      $('qo').onclick=e=>{const b=e.target.closest('.opt');if(!b||$('qo').dataset.done)return;$('qo').dataset.done=1;
        const pick=q._o[+b.dataset.k],r=pick===right;
        M().querySelectorAll('#qo .opt').forEach(x=>{x.disabled=true;if(q._o[+x.dataset.k]===right)x.classList.add('right');else if(x===b)x.classList.add('wrong')});
        done(r)};
      keyHandler=e=>{const n=+e.key;if(n>=1&&n<=q._o.length){const b=M().querySelectorAll('#qo .opt')[n-1];if(b)b.click()}}}
    else{let locked=false;const pk=q._p;
      const render=()=>{$('ar').innerHTML=pk.map((j,n)=>`<button class="chunk han" data-n="${n}">${esc(zh(q._b[j].c))}</button>`).join('');
        M().querySelectorAll('#bk .chunk').forEach(b=>b.classList.toggle('used',pk.includes(+b.dataset.j)));$('chk').disabled=locked||pk.length!==q._b.length};
      $('bk').onclick=e=>{const b=e.target.closest('.chunk');if(!b||locked||pk.includes(+b.dataset.j)||dr.dragged())return;pk.push(+b.dataset.j);render()};
      const dr=dragReorder($('ar'),pk,render,()=>locked,$('bk'));
      $('ar').onclick=e=>{const b=e.target.closest('.chunk');if(!b||locked||dr.dragged())return;pk.splice(+b.dataset.n,1);render()};
      $('clr').onclick=()=>{if(!locked){pk.length=0;render()}};
      $('chk').onclick=()=>{if(locked)return;locked=true;const got=pk.map(j=>q._b[j].c).join(''),r=got===q[1].join('')||(q[3]||[]).includes(got);
        $('ar').querySelectorAll('.chunk').forEach(c=>c.classList.add(r?'cok':'cbad'));$('chk').disabled=true;done(r)};
      render()}
  }
  function finish(){
    open(bar(100,qs.length+' / '+qs.length)+`<div class="card"><p class="eyebrow">${esc(G.t)}</p><span class="score">${ok} / ${qs.length}</span>
      <p>${bad?'Go through your mistakes again until they stick.':'Every answer right. Well done!'}</p>
      <div class="btns">${bad?`<button class="btn" id="gm">Practise the ${bad} mistakes</button>`:''}<button class="btn ghost" id="ga">Start over</button><button class="btn ghost" id="gb">‹ Back to grammar</button></div></div>`);back();
    if($('gm'))$('gm').onclick=()=>gdrill(l,gi,missed.slice());$('ga').onclick=()=>gdrill(l,gi);$('gb').onclick=toList}
  draw();
}

