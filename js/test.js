/* ---------- Test: an exam with sections, graded only when you hand it in ---------- */
const SECTIONS=[['listen','Listening','听力'],['read','Reading','阅读'],['pinyin','Pinyin and tones','拼音'],['write','Writing','写作']];
const PLAN={quick:{audio:2,hearMean:1,hearTF:1,mean:2,sentMean:1,blank:2,pinyin:1,tone:1,order:1},
  full:{audio:3,hearMean:2,hearTF:2,mean:3,sentMean:2,blank:3,pinyin:3,tone:2,order:2,trans:1,draw:1}};
const QSEC={audio:'listen',hearMean:'listen',hearTF:'listen',mean:'read',sentMean:'read',blank:'read',pinyin:'pinyin',tone:'pinyin',order:'write',trans:'write',draw:'write'};
const QTITLE={audio:'Listen and choose the word you hear.',hearMean:'Listen and choose what the sentence means.',hearTF:'Listen. Does the English match what you hear?',
  mean:'Choose the meaning.',sentMean:'Read the sentence and choose what it means.',blank:'Choose the word that fills the gap.',
  pinyin:'Write the pinyin with tones.',tone:'Which tone does this character have?',order:'Put the words in the right order.',trans:'Translate into Chinese (characters or pinyin).',draw:'Write this character from memory.'};
function test(){
  const L=[...state.sel].sort((a,b)=>LESSONS.indexOf(a)-LESSONS.indexOf(b));
  let secs=store.get('ic-tsecs',SECTIONS.map(s=>s[0])).filter(k=>SECTIONS.some(s=>s[0]===k));if(!secs.length)secs=SECTIONS.map(s=>s[0]);
  const nW=basePool('w').length,nC=basePool('c').length,nS=ST.filter(s=>state.sel.has(s.l)).length;
  open(bar(0,'')+`<div class="card top-align exam-intro"><p class="eyebrow">Lesson test · ${L.map(LNAME).join(', ')||'no lessons'}</p><h2>Test yourself like in class</h2>
    <p class="muted">Pick the sections you want, like in a chapter test. You see your score only after you hand it in.</p>
    <div class="row" style="width:100%"><span>Sections</span><span class="hint">Tap to include or leave out</span></div>
    <div class="secrow" role="group" aria-label="Sections">${SECTIONS.map(([k,n,z])=>`<button data-sec="${k}" aria-pressed="${secs.includes(k)}"><b class="han">${z}</b>${n}</button>`).join('')}</div>
    <div class="row" style="width:100%"><span>Length</span><div class="seg" role="group" aria-label="Length"><button data-len="quick" aria-pressed="true">Quick · 12</button><button data-len="full" aria-pressed="false">Full · 24</button></div></div>
    <div class="row" style="width:100%"><span>Time limit</span><div class="seg" role="group" aria-label="Time limit"><button data-tl="0" aria-pressed="true">None</button><button data-tl="10" aria-pressed="false">10 min</button><button data-tl="20" aria-pressed="false">20 min</button></div></div>
    <p class="hint">${nC} characters, ${nW} words and ${nS} sentences from the selected lessons.</p>
    <button class="btn" id="go" ${nC+nW<4?'disabled':''}>Start the test</button></div>`);
  let len='quick',tl=0;
  M().querySelectorAll('[data-len]').forEach(b=>b.onclick=()=>{len=b.dataset.len;M().querySelectorAll('[data-len]').forEach(x=>x.setAttribute('aria-pressed',x===b))});
  M().querySelectorAll('[data-tl]').forEach(b=>b.onclick=()=>{tl=+b.dataset.tl;M().querySelectorAll('[data-tl]').forEach(x=>x.setAttribute('aria-pressed',x===b))});
  M().querySelectorAll('[data-sec]').forEach(b=>b.onclick=()=>{const k=b.dataset.sec;secs=secs.includes(k)?secs.filter(x=>x!==k):[...secs,k];store.set('ic-tsecs',secs);
    b.setAttribute('aria-pressed',secs.includes(k));$('go').disabled=!secs.length||nC+nW<4;$('go').textContent=secs.length?'Start the test':'Pick at least one section'});
  $('go').onclick=()=>exam(makeExam(len,secs),tl);
}
function makeExam(len,secs=SECTIONS.map(s=>s[0])){
  const words=shuffle(basePool('w').filter(x=>!x.proper)),chars=shuffle(basePool('c')),items=shuffle([...words,...chars]);
  const sents=shuffle(ST.filter(s=>state.sel.has(s.l)&&s.zh.filter(c=>!isPunct(c)).length>=2));
  const used=new Set(),take=(arr,f=()=>true)=>{const x=arr.find(y=>!used.has(y.k||('s'+y.id))&&f(y));if(x)used.add(x.k||('s'+x.id));return x};
  // spread the questions over the chosen sections; sentence questions need sentences in the selected lessons
  const SENT=['hearMean','hearTF','sentMean','blank','order','trans'],N=len==='full'?24:12;
  let types=Object.keys(PLAN.full).filter(t=>secs.includes(QSEC[t])&&(sents.length||!SENT.includes(t)));
  if(!types.length)types=Object.keys(PLAN.full).filter(t=>!SENT.includes(t));
  const plan={},qs=[];types.forEach(t=>plan[t]=0);for(let k=0;k<N;k++)plan[types[k%types.length]]++;
  const otherEn=s=>shuffle(ST.filter(t=>t.en!==s.en&&state.sel.has(t.l))).concat(shuffle(ST.filter(t=>t.en!==s.en))).map(t=>t.en);
  for(const [type,n] of Object.entries(plan))for(let k=0;k<n;k++){
    let q=null;
    if(type==='audio'||type==='mean'){const x=take(items);if(x)q={x,opts:mcOptions(x,type)}}
    else if(type==='pinyin'){const x=take(items,y=>!/[()…]/.test(y.p));if(x)q={x}}
    else if(type==='tone'||type==='draw'){const x=take(chars,y=>type==='draw'||y.tone>0);if(x)q={x}}
    else{const s=take(sents);if(s){q={s};
      if(type==='hearMean'||type==='sentMean'){const o=[...new Set(otherEn(s))].slice(0,3);q.opts=shuffle([s.en,...o]);q.right=q.opts.indexOf(s.en)}
      if(type==='hearTF'){q.truth=Math.random()<.5;q.shown=q.truth?s.en:otherEn(s)[0]}
      if(type==='blank'){const z=s.zh,idx=z.map((c,i)=>i).filter(i=>!isPunct(z[i])),bi=idx[Math.random()*idx.length|0],ans=z[bi],ln=[...ans].length;
        const pool=[...new Set([...ST.filter(t=>state.sel.has(t.l)).flatMap(t=>t.zh),...WD.filter(w=>state.sel.has(w.l)).map(w=>w.s)])].filter(c=>c!==ans&&!isPunct(c)&&!/[()…]/.test(c)&&!s.zh.includes(c));
        const near=shuffle(pool.filter(c=>[...c].length===ln)),rest=shuffle(pool.filter(c=>[...c].length!==ln));
        q.bi=bi;q.opts=shuffle([ans,...[...near,...rest].slice(0,3)]);q.right=q.opts.indexOf(ans)}
      if(type==='order'){q.bank=shuffle(s.zh.map((c,i)=>i).filter(i=>!isPunct(s.zh[i])))}
    }}
    if(q){q.type=type;q.sec=QSEC[type];qs.push(q)}
  }
  const ord=SECTIONS.map(([k])=>k);return qs.sort((a,b)=>ord.indexOf(a.sec)-ord.indexOf(b.sec));
}
function exam(qs,tlMin){
  const N=qs.length,ans=new Array(N).fill(null),flag=new Array(N).fill(false),t0=Date.now();let i=0,writer=null,over=false;
  if(!N){test();return}
  open(`<div class="bar"><button class="back" id="quit">‹ Leave</button><div class="progress"><span style="width:0%"></span></div><span class="count" id="clock">0:00</span></div>
    <div class="qnav" id="qnav" aria-label="Questions"></div><div id="qbox"></div>`);
  const fmt=ms=>{const s=Math.max(0,Math.round(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
  TIMER=setInterval(()=>{if(!$('clock')){clearInterval(TIMER);return}const el=Date.now()-t0;
    if(tlMin){const left=tlMin*6e4-el;$('clock').textContent=fmt(left)+' left';$('clock').classList.toggle('late',left<6e4);if(left<=0&&!over)finish()}else $('clock').textContent=fmt(el)},500);
  $('quit').onclick=()=>{$('quit').outerHTML='<span class="confirm"><span>Leave the test?</span><button class="btn badb" data-home>Leave</button></span>'};
  const done=a=>a!==null&&a!==''&&!(Array.isArray(a)&&!a.length);
  function nav(){$('qnav').innerHTML=qs.map((q,k)=>`${k===0||qs[k-1].sec!==q.sec?`<span class="qsec han">${SECTIONS.find(s=>s[0]===q.sec)[2]}</span>`:''}<button class="qn${k===i?' cur':''}${done(ans[k])?' done':''}${flag[k]?' flag':''}" data-k="${k}" aria-label="Question ${k+1}">${k+1}</button>`).join('');
    $('qnav').querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{i=+b.dataset.k;show()});
    const n=ans.filter(done).length;M().querySelector('.progress span').style.width=n/N*100+'%'}
  function show(){
    const q=qs[i],sec=SECTIONS.find(s=>s[0]===q.sec),x=q.x,s=q.s,a=ans[i];let body='';
    const big=x?`<span class="${bigClass(x)} han" data-nosay>${hz(x)}</span>`:'';
    if(q.type==='audio')body=`<button class="play huge" id="qp">${PLAY}Play</button>${optsHtml(x,'audio',q.opts,false)}`;
    else if(q.type==='mean')body=big+optsHtml(x,'mean',q.opts,false);
    else if(q.type==='hearMean'||q.type==='sentMean')body=(q.type==='hearMean'?`<button class="play huge" id="qp">${PLAY}Play sentence</button>`:`<p class="han examzh" data-nosay>${esc(sentHz(s).join(''))}</p>`)+`<div class="opts one">${q.opts.map((o,k)=>`<button class="opt" data-i="${k}">${esc(o)}</button>`).join('')}</div>`;
    else if(q.type==='hearTF')body=`<button class="play huge" id="qp">${PLAY}Play sentence</button><p class="meaning" style="font-weight:700">“${esc(q.shown)}”</p><div class="opts"><button class="opt c" data-v="1">True</button><button class="opt c" data-v="0">False</button></div>`;
    else if(q.type==='blank'){const z=sentHz(s);body=`<p class="han examzh" data-nosay>${z.map((c,k)=>k===q.bi?'<span class="gap">　　</span>':esc(c)).join('')}</p><p class="hint">${esc(s.en)}</p><div class="opts chars">${q.opts.map((o,k)=>`<button class="opt" data-i="${k}"><span class="han" style="font-size:1.5rem">${esc(state.script==='t'?toTrad(o):o)}</span></button>`).join('')}</div>`}
    else if(q.type==='pinyin')body=big+`<p class="hint">${esc(x.en)}</p><div class="typein"><input id="qi" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="e.g. ni3 hao3" aria-label="Pinyin"></div><p class="hint">Tones as numbers 1–4, ü as v.</p>`;
    else if(q.type==='tone')body=big+`<div class="tones">${[1,2,3,4,0].map(t=>`<button class="tbtn t${t}" data-t="${t}">${contour(t)}${t||'neutral'}<small>${t?TONE[t]:'tone'}</small></button>`).join('')}</div>`;
    else if(q.type==='order'){const z=sentHz(s);body=`<p class="meaning" style="font-weight:700">${esc(s.en)}</p><div class="ansrow" id="ar" data-end="${endMark(z,s.en)}"></div><div class="bank" id="bk">${q.bank.map((ix,k)=>`<button class="chunk han" data-j="${k}">${esc(z[ix])}</button>`).join('')}</div><button class="btn ghost" id="oc">Clear</button>`}
    else if(q.type==='trans')body=`<p class="meaning" style="font-size:1.25rem;font-weight:700">${esc(s.en)}</p><div class="typein"><input id="qi" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="你好 or ni3 hao3" aria-label="Your translation"></div><p class="hint">Characters or pinyin with tone numbers. Punctuation does not matter.</p>`;
    else if(q.type==='draw')body=`<span class="py" style="font-size:1.5rem">${pyHtml(x.p)}</span><p class="meaning">${esc(x.en)}</p><div class="pad" id="pad"><svg class="guide" viewBox="0 0 100 100" aria-hidden="true"><g stroke="currentColor" stroke-opacity=".18" stroke-width=".6" stroke-dasharray="2 2" fill="none"><line x1="0" y1="50" x2="100" y2="50"/><line x1="50" y1="0" x2="50" y2="100"/><line x1="0" y1="0" x2="100" y2="100"/><line x1="100" y1="0" x2="0" y2="100"/></g></svg><div class="hw" id="hw"></div></div><p class="strokes" id="wst"></p><button class="btn ghost" id="wre">Start over</button>`;
    $('qbox').innerHTML=`<div class="card top-align"><div class="qhead"><span class="eyebrow"><span class="han">${sec[2]}</span> ${sec[1]}</span><button class="flagbtn" id="fl" aria-pressed="${flag[i]}">⚑ ${flag[i]?'Flagged':'Flag'}</button></div>
      <p class="qprompt"><span class="qnum">${i+1}.</span> ${QTITLE[q.type]}</p>${body}</div>
      <div class="btns"><button class="btn ghost" id="pv" ${i?'':'disabled'}>‹ Previous</button>${i<N-1?'<button class="btn" id="nx">Next ›</button>':'<button class="btn" id="hand">Hand in the test</button>'}</div>
      <div id="handbox"></div>`;
    nav();window.scrollTo(0,0);
    const set=v=>{ans[i]=v;nav()};
    $('fl').onclick=()=>{flag[i]=!flag[i];$('fl').setAttribute('aria-pressed',flag[i]);$('fl').textContent='⚑ '+(flag[i]?'Flagged':'Flag');nav()};
    $('pv').onclick=()=>{i--;show()};if($('nx'))$('nx').onclick=()=>{i++;show()};if($('hand'))$('hand').onclick=handIn;
    if($('qp')){const play=()=>q.x?speak(q.x):speakSent(q.s);$('qp').onclick=play;setTimeout(play,250)}
    const opts=$('qbox').querySelectorAll('.opt');
    opts.forEach(b=>{const v=b.dataset.v!==undefined?b.dataset.v==='1':+b.dataset.i;if(a===v)b.setAttribute('aria-pressed','true');
      b.onclick=()=>{opts.forEach(o=>o.setAttribute('aria-pressed',o===b));set(v)}});
    $('qbox').querySelectorAll('.tbtn').forEach(b=>{if(a===+b.dataset.t)b.classList.add('picked');b.onclick=()=>{$('qbox').querySelectorAll('.tbtn').forEach(o=>o.classList.toggle('picked',o===b));set(+b.dataset.t)}});
    const inp=$('qi');if(inp){inp.value=a||'';inp.oninput=()=>set(inp.value);inp.onkeydown=e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();($('nx')||$('hand')).click()}}}
    if(q.type==='order'){let picked=Array.isArray(a)?a.slice():[];const z=sentHz(s);
      const r=()=>{$('ar').innerHTML=picked.map((k,n)=>`<button class="chunk han" data-n="${n}">${esc(z[q.bank[k]])}</button>`).join('');$('bk').querySelectorAll('.chunk').forEach(b=>b.classList.toggle('used',picked.includes(+b.dataset.j)));set(picked.length?picked.slice():null)};
      $('bk').onclick=e=>{const b=e.target.closest('.chunk');if(b&&!dr.dragged()&&!picked.includes(+b.dataset.j)){picked.push(+b.dataset.j);r()}};
      const dr=dragReorder($('ar'),picked,r,null,$('bk'));
      $('ar').onclick=e=>{const b=e.target.closest('.chunk');if(b&&!dr.dragged()){picked.splice(+b.dataset.n,1);r()}};$('oc').onclick=()=>{picked.length=0;r()};r()}
    if(q.type==='draw'){
      const fail=m=>{$('wst').textContent=m};
      if(typeof HanziWriter==='undefined')return fail('The writing tool could not load, so this question is skipped.');
      loadStrokes().then(()=>{if(!$('hw'))return;let c=hz(x);if(!STROKES[c])c=x.s;if(!STROKES[c])return fail('No stroke data for this character, so it is skipped.');
        const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim(),size=$('pad').clientWidth,n=STROKES[c].strokes.length;
        writer=hwCreate('hw',c,{width:size,height:size,padding:size*.06,showCharacter:false,showOutline:false,strokeColor:css('--ink'),outlineColor:css('--outline')||css('--line'),drawingColor:css('--accent'),highlightColor:css('--accent'),drawingWidth:Math.max(14,size/16),charDataLoader:(ch,ok,err)=>STROKES[ch]?ok(STROKES[ch]):err()});
        const start=()=>{let mis=0;fail(`${n} strokes`);writer.quiz({leniency:wlen(),acceptBackwardsStrokes:true,showHintAfterMisses:4,highlightOnComplete:false,onMistake:()=>{mis++;fail(`${n} strokes · mistakes ${mis}`)},
          onComplete:({totalMistakes})=>{set({m:totalMistakes,n});fail(`Done · ${totalMistakes} mistakes. You can start over if you want.`)}})};
        if(a&&a.n){writer.showCharacter();fail(`Done · ${a.m} mistakes. Start over to write it again.`)}else start();$('wre').onclick=()=>{writer.hideCharacter();start()}}).catch(()=>fail('The stroke data could not load, so this question is skipped.'))}
  }
  function handIn(){const open_=ans.filter(a=>!done(a)).length,fl=flag.filter(Boolean).length;
    if(!open_&&!fl)return finish();
    $('handbox').innerHTML=`<div class="fb bad"><h3>${open_?`${open_} unanswered`:''}${open_&&fl?' · ':''}${fl?`${fl} flagged`:''}</h3><p>Use the numbers at the top to go back, or hand it in now.</p><div class="btns"><button class="btn" id="hf">Hand in anyway</button></div></div>`;$('hf').onclick=finish}
  function correctOf(q,a){
    switch(q.type){
      case 'audio':case 'mean':return a!==null&&q.opts[a]===q.x;
      case 'hearMean':case 'sentMean':case 'blank':return a===q.right;
      case 'hearTF':return a===q.truth;
      case 'pinyin':return typeof a==='string'&&pyOk(a,q.x);
      case 'tone':return a===q.x.tone;
      case 'order':{const z=q.s.zh;return Array.isArray(a)&&a.map(k=>z[q.bank[k]]).join('')===z.filter(c=>!isPunct(c)).join('')}
      case 'trans':{if(typeof a!=='string'||!a.trim())return false;const han=[...a].filter(isHan);const back={};for(const k in T2)back[T2[k]]=k;
        if(han.length)return han.map(c=>back[c]||c).join('')===q.s.zh.join('').replace(/[^㐀-鿿]/g,'');return pyKey(a.replace(/[^\p{L}\p{N}]/gu,''))===pyKey(q.s.py.join(''))}
      case 'draw':return !!a&&a.m<=Math.max(1,a.n/5|0);
    }}
  function finish(){
    over=true;clearInterval(TIMER);const el=Date.now()-t0;
    const res=qs.map((q,k)=>correctOf(q,ans[k]));
    qs.forEach((q,k)=>{if(q.x&&(q.type!=='draw'||ans[k]))grade(q.x,res[k])});
    const score=res.filter(Boolean).length,pct=Math.round(score/N*100),gr=pct>=90?'A':pct>=80?'B':pct>=70?'C':pct>=60?'D':'F';
    const secs=SECTIONS.map(([k,n,z])=>{const ix=qs.map((q,j)=>j).filter(j=>qs[j].sec===k);return {k,n,z,t:ix.length,c:ix.filter(j=>res[j]).length}}).filter(s=>s.t);
    const yourA=(q,a)=>{if(a===null||a===''||(Array.isArray(a)&&!a.length))return '<i>no answer</i>';
      switch(q.type){case 'audio':return `<span class="han">${hz(q.opts[a])}</span>`;case 'mean':return esc(short(q.opts[a].en));case 'hearMean':case 'sentMean':return esc(q.opts[a]);
        case 'blank':return `<span class="han">${esc(q.opts[a])}</span>`;case 'hearTF':return a?'True':'False';case 'tone':return TLABEL(a);
        case 'order':return `<span class="han">${esc(a.map(k=>sentHz(q.s)[q.bank[k]]).join(''))}</span>`;case 'draw':return `${a.m} mistakes`;default:return esc(a)}};
    const rightA=q=>{switch(q.type){case 'hearTF':return (q.truth?'True':'False')+` · <span class="han">${esc(sentHz(q.s).join(''))}</span> = ${esc(q.s.en)}`;
      case 'blank':return `<span class="han">${esc(sentHz(q.s).join(''))}</span>`;case 'tone':return `${TLABEL(q.x.tone)} · <span class="han">${hz(q.x)}</span> ${pyHtml(q.x.p)}`;
      case 'hearMean':case 'sentMean':case 'order':case 'trans':return `<span class="han">${esc(sentHz(q.s).join(''))}</span> ${pyHtml(q.s.py.join(' ').replace(/ ([,.?!])/g,'$1'))} = ${esc(q.s.en)}`;
      default:return `<span class="han">${hzHtml(q.x)}</span> ${pyHtml(q.x.p)} = ${esc(q.x.en)}`}};
    const wrong=qs.map((q,k)=>k).filter(k=>!res[k]);const wrongItems=[...new Set(wrong.map(k=>qs[k].x).filter(Boolean))];
    open(bar(100,fmt(el))+`<div class="card exam-res"><p class="eyebrow">Test result · ${fmt(el)}${over&&tlMin&&el>=tlMin*6e4?' · time ran out':''}</p>
      <div class="gradebox"><span class="grade g${gr}">${gr}</span><span><span class="score">${pct}%</span><span class="hint">${score} of ${N} correct</span></span></div>
      <div class="secres">${secs.map(s=>`<div class="prow"><b><span class="han">${s.z}</span> ${s.n}</b><span class="mbar"><i class="m2" style="width:${s.c/s.t*100}%"></i></span><span class="count">${s.c} / ${s.t}</span></div>`).join('')}</div>
      <p>${pct>=90?'Excellent. You are ready for this lesson.':pct>=70?'Good. Go through the mistakes below, then practise them.':'Practise the mistakes below, then take the test again.'}</p>
      <div class="btns">${wrongItems.length?`<button class="btn" id="pm">Practise my ${wrongItems.length} mistakes</button>`:''}<button class="btn ghost" data-go="test">New test</button></div></div>
      <h3>Answers</h3><div class="revlist">${qs.map((q,k)=>`<div class="rv ${res[k]?'ok':'bad'}"><span class="rvn">${res[k]?'✓':'✗'} ${k+1}</span><div><p class="hint">${QTITLE[q.type]}</p>${res[k]?'':`<p>Your answer: ${yourA(q,ans[k])}</p>`}<p>${res[k]?'':'Correct: '}${rightA(q)}</p></div>${q.x?starHtml(q.x,'xs-sm'):''}</div>`).join('')}</div>`);
    if($('pm'))$('pm').onclick=()=>cards(shuffle(wrongItems));
  }
  show();
}

