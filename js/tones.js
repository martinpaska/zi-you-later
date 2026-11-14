/* ---------- Tone trainer: hear it, pick the tone (single syllables, then tone pairs) ---------- */
function tones(level){
  level=level||store.get('ic-tlevel','one');store.set('ic-tlevel',level);
  const ROUND=12,stat=store.get('ic-tonestat',{});
  const han=x=>[...x.s].filter(isHan);
  const singles=[...new Map(basePool('c').filter(x=>x.tone>=1&&x.tone<=4).map(x=>[x.s,x])).values()];
  const pairs=basePool('w').filter(x=>{const sy=sylsOf(x.p),h=han(x);return h.length===2&&sy.length===2&&!/[不一]/.test(x.s)&&sy.every(y=>sylTone(y)>0)});
  const src=level==='two'?pairs:singles;
  if(!src.length){open(bar(0,'')+`<div class="card"><p class="eyebrow">Tone trainer</p><p>${level==='two'?'No two-syllable words in these lessons yet. Add more lessons, or practise single syllables.':'No characters in these lessons.'}</p><div class="btns"><button class="btn ghost" data-home>‹ Home</button>${level==='two'?'<button class="btn" id="t1">Single syllables</button>':''}</div></div>`);if($('t1'))$('t1').onclick=()=>tones('one');return}
  const qs=[];let it=shuffle(src);while(qs.length<ROUND){if(!it.length)it=shuffle(src);qs.push(it.shift())}
  let qi=0,score=0,missed=[];
  const tonesOf=x=>level==='two'?sylsOf(x.p).map(sylTone):[x.tone];
  const tb=(t,r)=>`<button class="tbtn t${t}" data-r="${r}" data-t="${t}">${contour(t)}${t}<small>${TONE[t]}</small></button>`;
  function render(){
    const x=qs[qi],tt=tonesOf(x),pick=[];
    open(tallyBar(qi-score,score,ROUND,(qi+1)+' / '+ROUND)+`<div class="card top-align">
      <div class="seg" role="group" aria-label="Level"><button data-tl="one" aria-pressed="${level==='one'}">Single syllables</button><button data-tl="two" aria-pressed="${level==='two'}">Tone pairs</button></div>
      <p class="eyebrow">${level==='two'?'Which two tones do you hear?':'Which tone do you hear?'}</p>
      <div style="display:flex;gap:10px;justify-content:center;align-items:center"><button class="play huge" id="tp">${PLAY}Play</button><button class="btn ghost" id="ts" style="flex:none">🐢 Slower</button></div>
      <div id="tq" style="width:100%;display:flex;flex-direction:column;gap:10px">${tt.map((_,r)=>`${level==='two'?`<p class="hint" style="margin:0">Syllable ${r+1}</p>`:''}<div class="tones four" data-row="${r}">${[1,2,3,4].map(t=>tb(t,r)).join('')}</div>`).join('')}</div>
      <div id="fb" role="status" aria-live="polite" style="width:100%"></div></div>
      <p class="hint" style="text-align:center">Listen without looking. Keys: ${level==='two'?'press two numbers 1 to 4':'1 to 4 pick a tone'}, R replays.</p>`);
    M().querySelectorAll('[data-tl]').forEach(b=>b.onclick=()=>tones(b.dataset.tl));
    const play=()=>speak(x);$('tp').onclick=play;$('ts').onclick=()=>sayText(han(x).join(''),true);setTimeout(play,250);
    const choose=(r,t)=>{if($('tq').classList.contains('answered')||pick[r])return;pick[r]=t;
      $('tq').querySelector(`[data-row="${r}"] [data-t="${t}"]`).classList.add('picked');
      if(pick.filter(Boolean).length===tt.length)check()};
    $('tq').onclick=e=>{const b=e.target.closest('.tbtn');if(b)choose(+b.dataset.r,+b.dataset.t)};
    keyHandler=e=>{const n=+e.key;if(n>=1&&n<=4){const r=pick[0]&&tt.length>1?1:0;choose(r,n)}else if(e.key==='r'||e.key==='R')play()};
    function check(){
      $('tq').classList.add('answered');
      const sandhi=level==='two'&&tt[0]===3&&tt[1]===3;
      const okEach=tt.map((t,r)=>pick[r]===t||(sandhi&&r===0&&pick[r]===2));
      const ok=okEach.every(Boolean);
      tt.forEach((t,r)=>{const row=$('tq').querySelector(`[data-row="${r}"]`);row.querySelector(`[data-t="${t}"]`).classList.add('is-ok');if(!okEach[r])row.querySelector(`[data-t="${pick[r]}"]`).classList.add('is-bad');
        const k=String(t),v=stat[k]||[0,0];stat[k]=[v[0]+(okEach[r]?1:0),v[1]+1]});
      store.set('ic-tonestat',stat);
      if(ok)score++;else missed.push(x);grade(x,ok);
      const last=qi===ROUND-1,sy=level==='two'?sylsOf(x.p):[x.p];
      $('fb').innerHTML=`<div class="fb ${ok?'ok':'bad'}"><h3>${ok?'Correct!':'Not quite.'}</h3>
        <div class="tpair">${han(x).map((c,r)=>`<span class="t${tt[r]}"><span class="han">${state.script==='t'?(T2[c]||c):c}</span><b>${pyHtml(sy[r]||'')}</b>${contour(tt[r])}<small>${TLABEL(tt[r])}</small></span>`).join('')}</div>
        <p style="margin:6px 0 0">${esc(x.en)}</p>
        ${sandhi?'<p class="hint">Two third tones in a row: the first one is said as a rising second tone, so 3 + 3 sounds like 2 + 3. Both answers count.</p>':''}
        ${!ok?`<p class="hint">You picked ${pick.map(t=>'tone '+t).join(' + ')}. Play it again and listen for the ${tt.map(t=>TONE[t]).join(', then ')} shape.</p>`:''}
        <button class="btn" id="qn">${last?'See result':'Next ›'}</button></div>`;
      const nx=()=>{if(last)result();else{qi++;render()}};$('qn').onclick=nx;keyHandler=e=>{if(e.key==='Enter')nx();else if(e.key==='r'||e.key==='R')play()};
    }
  }
  function result(){
    const u=[...new Set(missed)],acc=[1,2,3,4].map(t=>{const v=stat[t]||[0,0];return {t,p:v[1]?Math.round(v[0]/v[1]*100):null,n:v[1]}});
    const weak=acc.filter(a=>a.n>=5).sort((a,b)=>a.p-b.p)[0];
    open(bar(100,ROUND+' / '+ROUND)+`<div class="card"><p class="eyebrow">Tone trainer · ${level==='two'?'tone pairs':'single syllables'}</p><span class="score">${score} / ${ROUND}</span>
      <p>${score===ROUND?'Perfect ears!':score>=9?'Very good. Replay the ones you missed below.':'Tones take time. Keep the sessions short and come back tomorrow.'}</p>
      <div class="tacc">${acc.map(a=>`<div class="t${a.t}">${contour(a.t)}<span>Tone ${a.t}</span><i><b style="width:${a.p||0}%"></b></i><small>${a.p===null?'–':a.p+'%'}</small></div>`).join('')}</div>
      <p class="hint">All-time accuracy for each tone.${weak&&weak.p<90?` Your hardest is tone ${weak.t} (${TONE[weak.t]}).`:''}</p>
      ${u.length?`<div class="grp">${u.map((y,i)=>`<div class="gi"><span class="han">${hzHtml(y)}</span><span class="p">${pyHtml(y.p)}</span><span class="m">${esc(y.en)}</span><button class="mini" data-mi="${i}" aria-label="Play">${PLAY}</button>${starHtml(y,'xs-sm')}</div>`).join('')}</div>`:''}
      <div class="btns"><button class="btn ghost" data-home>‹ Home</button>${level==='one'?'<button class="btn ghost" id="lv2">Try tone pairs</button>':''}<button class="btn" id="ra">Play again</button></div></div>`);
    M().querySelectorAll('.mini').forEach(m=>m.onclick=()=>speak(u[+m.dataset.mi]));$('ra').onclick=()=>tones(level);if($('lv2'))$('lv2').onclick=()=>tones('two');
  }
  render();
}

/* ---------- Tone twins ---------- */
function twins(){const t=state.ttask||'fill';return t==='fill'?toneFill():twinQuiz(t==='twin'?'tone':'listen')}
/* ---------- Tones in words: the pinyin comes without tone marks, you give each syllable its tone ---------- */
const TMARKS={a:'āáǎà',e:'ēéěè',i:'īíǐì',o:'ōóǒò',u:'ūúǔù','ü':'ǖǘǚǜ'};
const bareSyl=m=>m.normalize('NFD').replace(/[̀́̄̌]/g,'').normalize('NFC');
function markSyl(b,t){if(!t)return b;const lo=b.toLowerCase();let i=lo.search(/[ae]/);if(i<0)i=lo.indexOf('ou');
  if(i<0)for(let j=lo.length-1;j>=0;j--)if(TMARKS[lo[j]]){i=j;break}
  if(i<0)return b;let c=TMARKS[lo[i]][t-1];if(b[i]!==lo[i])c=c.toUpperCase();return b.slice(0,i)+c+b.slice(i+1)}
function toneFill(){
  const qs=shuffle(basePool('w').filter(x=>!x.proper)).slice(0,10);let qi=0,score=0;const missed=[];
  function render(){
    if(qi>=qs.length)return finish();
    const x=qs[qi],syl=x.p.replace(/\([^)]*\)/g,'').match(SYL)||[],ans=syl.map(sylTone),bare=syl.map(bareSyl),pick=syl.map(()=>null);
    let cur=0,done=false,heard=false;
    open(tallyBar(qi-score,score,qs.length,(qi+1)+' / '+qs.length)+`<div class="card top-align tfill"><p class="eyebrow">Fill in the tones · ${LNAME(x.l)}</p>
      <span class="han tfw" data-nosay>${esc(hz(x))}</span><p class="hint tfen">${esc(x.en)}</p>
      <div class="tsyls" id="ts" aria-label="Syllables"></div>
      <div class="tones" id="qo">${[1,2,3,4,0].map(t=>`<button class="tbtn t${t}" data-t="${t}">${contour(t)}${t||'neutral'}<small>${t?TONE[t]:'tone'}</small></button>`).join('')}</div>
      <div class="btns" id="tfb"><button class="btn ghost" id="tfp">${PLAY}Hint: listen</button><button class="btn" id="tfc" disabled>Check</button></div>
      <div id="fb" role="status" aria-live="polite" style="width:100%"></div></div>`);
    const draw=()=>{$('ts').innerHTML=bare.map((b,i)=>{const t=pick[i],st=done?(t===ans[i]?' ok':' bad'):'';
        return `<button class="tsyl${i===cur&&!done?' cur':''}${t!==null?' t'+t:''}${st}" data-i="${i}" aria-label="${esc(b)}">${esc(t===null?b:markSyl(b,t))}<small${done&&t!==ans[i]?` class="t${ans[i]}"`:''}>${done&&t!==ans[i]?esc(syl[i]):t===null?'?':t?t+'.':'·'}</small></button>`}).join('');
      $('tfc').disabled=done||pick.some(t=>t===null)};
    draw();
    $('ts').onclick=e=>{const b=e.target.closest('[data-i]');if(!b||done)return;cur=+b.dataset.i;draw()};
    const set=t=>{if(done)return;pick[cur]=t;const nx=pick.findIndex((v,i)=>v===null&&i>cur),any=pick.indexOf(null);cur=nx>=0?nx:any>=0?any:cur;draw()};
    $('qo').onclick=e=>{const b=e.target.closest('[data-t]');if(b)set(+b.dataset.t)};
    $('tfp').onclick=()=>{if(!done)heard=true;speak(x)};
    const check=()=>{if(done||pick.some(t=>t===null))return;done=true;const ok=pick.every((t,i)=>t===ans[i]);
      if(ok)score+=heard?.5:1;else missed.push(x);grade(x,ok);draw();$('tfb').hidden=true;$('qo').classList.add('answered');speak(x);
      const last=qi===qs.length-1;
      $('fb').innerHTML=`<div class="fb ${ok?'ok':'bad'}"><h3>${ok?(heard?'Correct, with a hint.':'Correct!'):'Not quite.'}</h3><p class="tfa"><span class="han">${esc(hz(x))}</span> ${pyHtml(x.p)}</p><button class="btn" id="qn">${last?'See result':'Next ›'}</button></div>`;
      $('fb').scrollIntoView({block:'nearest',behavior:'smooth'});
      $('qn').onclick=()=>{qi++;render()}};
    $('tfc').onclick=check;
    keyHandler=e=>{if(/^[0-5]$/.test(e.key)){set(e.key==='5'?0:+e.key);return}
      if(e.key==='ArrowLeft'&&!done){cur=Math.max(0,cur-1);draw()}else if(e.key==='ArrowRight'&&!done){cur=Math.min(bare.length-1,cur+1);draw()}
      else if(e.key==='Enter'){e.preventDefault();done?$('qn').click():check()}};
  }
  function finish(){keyHandler=null;open(bar(100,qs.length+' / '+qs.length)+`<div class="card"><p class="eyebrow">Tones done</p><span class="score">${+score.toFixed(1)} / ${qs.length}</span>
    <p>${score===qs.length?'Every tone right without hints.':'A hint counts as half a point.'}</p>
    ${missed.length?`<p class="hint">Words to look at again:</p><div class="mmiss">${missed.map(x=>`<span class="mmi"><b class="han">${esc(hz(x))}</b> ${pyHtml(x.p)}${starHtml(x,'xs-in')}</span>`).join('')}</div>`:''}
    <div class="btns"><button class="btn ghost" data-home>‹ Home</button><button class="btn" id="ag">Again</button></div></div>`);$('ag').onclick=toneFill}
  render();
}
function twinQuiz(qmode){
  const ROUND=10,p=basePool('c'),qs=[];
  if(qmode==='tone'){const all=twinGroups(p).flatMap(g=>g.items.map(x=>({x,g})));let it=shuffle(all);while(qs.length<ROUND){if(!it.length)it=shuffle(all);qs.push(it.shift())}}
  else{const groups=twinGroups(p,true);let gs=shuffle(groups);while(qs.length<ROUND){if(!gs.length)gs=shuffle(groups);const g=gs.shift();
    const by={};for(const x of shuffle(g.items))by[x.tone]=by[x.tone]||x;const opts=shuffle(Object.values(by)).slice(0,4);qs.push({x:opts[Math.random()*opts.length|0],g,opts})}}
  let qi=0,score=0,missed=[];
  function render(){
    const q=qs[qi],head=tallyBar(qi-score,score,ROUND,(qi+1)+' / '+ROUND);
    if(qmode==='tone')open(head+`<div class="card top-align"><p class="eyebrow">Pick the tone</p><span data-nosay class="big han">${hz(q.x)}</span><span class="py" style="color:var(--muted)">${q.x.syl}</span><p class="hint">${esc(q.x.en)}</p>
      <div class="tones" id="qo">${[1,2,3,4,0].map(t=>`<button class="tbtn t${t}" data-t="${t}">${contour(t)}${t||'neutral'}<small>${t?TONE[t]:'tone'}</small></button>`).join('')}</div><div id="fb" role="status" aria-live="polite" style="width:100%"></div></div>`);
    else{open(head+`<div class="card top-align"><p class="eyebrow">Listen and pick</p><p class="hint">The syllable <b>${q.x.syl}</b> in ${q.opts.length} tones. Which character did you hear?</p><button class="play huge" id="qp">${PLAY}Play syllable</button>
      <div class="opts chars" id="qo">${q.opts.map((x,i)=>`<button class="opt" data-i="${i}"><span class="han">${hz(x)}</span><small></small></button>`).join('')}</div><div id="fb" role="status" aria-live="polite" style="width:100%"></div></div>`);
      $('qp').onclick=()=>speak(q.x);setTimeout(()=>speak(q.x),250)}
    const box=$('qo');
    box.onclick=e=>{const b=e.target.closest('button');if(!b||box.classList.contains('answered'))return;box.classList.add('answered');let ok,picked;
      if(qmode==='tone'){picked=+b.dataset.t;ok=picked===q.x.tone;box.querySelector(`[data-t="${q.x.tone}"]`).classList.add('is-ok')}
      else{picked=q.opts[+b.dataset.i];ok=picked===q.x;revealChars(box,q.opts);box.querySelector(`[data-i="${q.opts.indexOf(q.x)}"]`).classList.add('is-ok')}
      if(!ok)b.classList.add('is-bad');
      if(ok)score++;else missed.push(q.x);grade(q.x,ok);
      const x=q.x,last=qi===ROUND-1;
      const h=ok?`<h3>Correct!</h3>${answerLine(x)}`:qmode==='tone'?`<h3>That wasn't ${TLABEL(picked).toLowerCase()}.</h3><div class="why t${x.tone}">${contour(x.tone)}<span>It was <b>${TLABEL(x.tone).toLowerCase()}</b>, ${TONE[x.tone]}: <b class="han">${hz(x)}</b> <b>${x.p}</b></span></div>`
        :`<h3>You heard a different one.</h3><div class="why t${x.tone}">${contour(x.tone)}<span>You heard <b class="han">${hz(x)}</b> <b>${x.p}</b>, ${TLABEL(x.tone).toLowerCase()} (${TONE[x.tone]}). You picked <b class="han">${hz(picked)}</b> <span class="t${picked.tone}"><b>${picked.p}</b>, ${TLABEL(picked.tone).toLowerCase()}</span>.</span></div>`;
      $('fb').innerHTML=`<div class="fb ${ok?'ok':'bad'}">${h}<p class="hint">Twins with the syllable <b>${q.g.syl}</b>:</p><div class="grp">${q.g.items.map((y,i)=>`<div class="gi t${y.tone}${y===x?' target':''}"><span class="han">${hz(y)}</span><span class="p">${y.p}</span><span class="m">${TLABEL(y.tone)} · ${esc(y.en)}</span><button class="mini" data-gi="${i}" aria-label="Play">${PLAY}</button>${starHtml(y,'xs-sm')}</div>`).join('')}</div><button class="btn" id="qn">${last?'See result':'Next question ›'}</button></div>`;
      $('fb').querySelectorAll('.mini').forEach(m=>m.onclick=()=>speak(q.g.items[+m.dataset.gi]));
      const nx=()=>{if(last)result();else{qi++;render()}};$('qn').onclick=nx;keyHandler=e=>{if(e.key==='Enter')nx()};
      speak(x);
    };
  }
  function result(){
    const u=[...new Set(missed)];
    open(bar(100,ROUND+' / '+ROUND)+`<div class="card"><p class="eyebrow">${qmode==='tone'?'Pick the tone':'Listen and pick'}</p><span class="score">${score} / ${ROUND}</span>
      <p>${score===ROUND?'Perfect. Try adding another lesson.':score>=7?'Good work. Play the ones you missed below.':'Tones take time. Go through the mistakes and try again.'}</p>
      ${u.length?`<div class="grp">${u.map((y,i)=>`<div class="gi t${y.tone}"><span class="han">${hz(y)}</span><span class="p">${y.p}</span><span class="m">${TLABEL(y.tone)} · ${esc(y.en)}</span><button class="mini" data-mi="${i}" aria-label="Play">${PLAY}</button>${starHtml(y,'xs-sm')}</div>`).join('')}</div>`:''}
      <div class="btns"><button class="btn ghost" data-home>‹ Home</button><button class="btn" id="ra">Play again</button></div></div>`);
    M().querySelectorAll('.mini').forEach(m=>m.onclick=()=>speak(u[+m.dataset.mi]));$('ra').onclick=()=>twinQuiz(qmode);
  }
  render();
}

