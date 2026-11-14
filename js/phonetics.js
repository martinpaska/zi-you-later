/* ---------- Chinese Phonetics – test (Fonetika čínštiny – test, the pinyin dictation): practice for the course's phonetics test ----------
   The test has 100 dictated items and needs 80 %: 1–25 initials, 26–50 final + tone, 51–75 tones in two-syllable
   words, 76–100 whole words. phonetics.json (built by phonetics/build.py from the course syllable table) holds one
   speakable character per syllable+tone and 2-syllable words. The sound is the device's Chinese voice, as everywhere in the app. */
let PYD=null,pyLoad=null;
const PY_INI=['zh','ch','sh','b','p','m','f','d','t','n','l','g','k','h','j','q','x','r','z','c','s','y','w'];
const PY_HI=new Set('z zh c ch s sh j q x r'.split(' ')),PY_HF=new Set('ong eng ang an en in ing ian uan un ue uo ou iu ui iong iang uang'.split(' '));
const PY_PAIRS=[['i','z','zh'],['i','c','ch'],['i','s','sh'],['i','j','zh'],['i','q','ch'],['i','x','sh'],['i','j','q'],['i','r','l'],
  ['f','ong','eng'],['f','an','ang'],['f','en','eng'],['f','in','ing'],['f','an','en'],['f','ian','uan'],['f','uo','ou'],['f','ie','ue'],['f','un','ong'],['f','iu','ou'],['f','ui','ei']];
const PYMODES=[
  ['ini','Initials','Hear a syllable, type its initial. Test items 1–25.'],
  ['fin','Finals and tone','The initial is shown, type the final with its tone. Items 26–50.'],
  ['tone','Tones in words','Pick the tone of each syllable of a word. Items 51–75.'],
  ['word','Whole words','Type the whole word with its tones. Items 76–100.'],
  ['pair','Tell apart','Two syllables that differ in one sound. Which one did you hear?'],
  ['test','Practice test','100 items like the real test. No feedback until the answer sheet at the end.']];
const pyName=m=>PYMODES.find(x=>x[0]===m)[1];
const pySplit=b=>{const i=PY_INI.find(x=>b.startsWith(x)&&b.length>x.length)||'';return {i,f:b.slice(i.length)}};
const pySyl=k=>{const t=+k.slice(-1),b=k.slice(0,-1);return {b,t,k,...pySplit(b)}};
function loadPy(){
  if(PYD)return Promise.resolve(PYD);
  if(!pyLoad)pyLoad=fetch('phonetics.json').then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(j=>{
    const syl=Object.entries(j.syl).map(([k,c])=>({...pySyl(k),c})),SY=new Map(syl.map(s=>[s.k,s]));
    const words=j.words.map(([w,p])=>({w,s:p.split(' ').map(pySyl)}));
    const pairs={};
    for(const [kind,a,b] of PY_PAIRS){const ct=a+'/'+b,list=pairs[ct]=[];
      for(const s of syl){if((kind==='i'?s.i:s.f)!==a)continue;
        const o=SY.get((kind==='i'?b+s.f:s.i+b)+s.t);if(o)list.push({kind,ct,a:s,b:o})}
      if(!list.length)delete pairs[ct]}
    return PYD={syl,SY,words,pairs};
  }).catch(e=>{pyLoad=null;throw e});
  return pyLoad;
}
/* pinyin text: marks and numbers, ü typed as v or u: */
const pyNorm=s=>s.toLowerCase().normalize('NFC').replace(/u:/g,'ü').replace(/v/g,'ü');
function pyParse1(s){let b='',t=0;for(const c of pyNorm(s)){if(MK[c]){b+=MK[c][0]==='v'?'ü':MK[c][0];if(MK[c][1])t=MK[c][1]}else if(/[1-5]/.test(c))t=+c%5;else if(/[a-zü]/.test(c))b+=c}return {b,t}}
function pyParseMany(s){const out=[];
  for(const ch of pyNorm(s).split(/[\s'’,.-]+/).filter(Boolean)){
    const parts=/[0-5]/.test(ch)?ch.split(/(?<=[0-5])/):(ch.match(SYL)||[ch]);
    for(const p of parts){const x=pyParse1(p);if(x.b)out.push({...x,...pySplit(x.b)})}}
  return out}
const pyPreview=v=>pyNorm(v).replace(/([a-zü]+)([0-5])/g,(m,b,t)=>+t%5?markSyl(b,+t):b);
const pyJqxy=s=>s.replace(/([jqxy])ü/g,'$1u');
const pyWordPy=w=>w.s.map((x,i)=>(i&&/^[aeo]/.test(x.b)?"'":'')+markSyl(x.b,x.t)).join('');
const pyFull=it=>it.m==='pair'?markSyl(it.play.b,it.play.t):it.w?pyWordPy(it.w):markSyl(it.s.b,it.s.t);
const pyChars=it=>it.m==='pair'?it.play.c:it.w?it.w.w:it.s.c;
const pyFinal=s=>markSyl(s.b,s.t).slice(s.i.length);
const pyPct=(a,b)=>b?Math.round(a/b*100):0;
const pySyls=it=>it.m==='pair'?[it.play]:it.w?it.w.s:[it.s];
const pySay=it=>sayText(pyChars(it));
const PYH=h=>`<span data-noi18n lang="zh-Latn-pinyin">${h}</span>`;

/* stats: per-mode accuracy and the most frequent confusions, stored as "i:zh>z", "f:ong>eng", "t:3>2" (right>given) */
function pyRecord(mode,ok,confs){const m=PYS.m[mode]||(PYS.m[mode]={n:0,ok:0});m.n++;if(ok)m.ok++;for(const k of confs)PYS.c[k]=(PYS.c[k]||0)+1;savePys()}
const pyConfLabel=k=>{const [a,b]=k.slice(2).split('>');return k[0]==='t'?`Tone ${a} → ${b}`:`${a} → ${b}`};
const pyChip=(k,n)=>`<span class="mmi">${k[0]==='t'?`<span>${esc(pyConfLabel(k))}</span>`:PYH(esc(pyConfLabel(k)))}${n>1?` <b>×${n}</b>`:''}</span>`;
const pyTopConf=(n=12)=>Object.entries(PYS.c).sort((a,b)=>b[1]-a[1]).slice(0,n);
function pySylDiff(a,u,parts){const out=[];
  if(parts.includes('i')&&a.i&&u.i&&a.i!==u.i)out.push('i:'+a.i+'>'+u.i);
  const fa=PY_JQXY(a.i)?pyJqxy(a.i+a.f).slice(a.i.length):a.f,fu=PY_JQXY(a.i)?pyJqxy(a.i+u.f).slice(a.i.length):u.f;
  if(parts.includes('f')&&fu&&fa!==fu)out.push('f:'+fa+'>'+fu);
  if(parts.includes('t')&&u.t&&a.t!==u.t)out.push('t:'+a.t+'>'+u.t);
  return out}
const PY_JQXY=i=>/^[jqxy]$/.test(i);

/* weights: hard initials and finals, and the learner's own confusions, come up more often */
function pyWeights(){const weak=state.pyWeak!==false,mi=new Map(),mf=new Map(),mt=new Map(),mc=new Map();
  if(weak)for(const [k,n] of Object.entries(PYS.c)){const [a,b]=k.slice(2).split('>'),m=k[0]==='i'?mi:k[0]==='f'?mf:mt;
    m.set(a,(m.get(a)||0)+n);if(k[0]!=='t')m.set(b,(m.get(b)||0)+n/2);
    for(const [kind,x,y] of PY_PAIRS)if(kind===k[0]&&((x===a&&y===b)||(x===b&&y===a)))mc.set(x+'/'+y,(mc.get(x+'/'+y)||0)+n)}
  const own=(m,k)=>Math.min(3,(m.get(k)||0)*.5);
  const syl=(s,parts)=>{let w=1;if(!weak)return w;
    if(parts.includes('i')){if(PY_HI.has(s.i))w+=2;w+=own(mi,s.i)}
    if(parts.includes('f')){if(PY_HF.has(s.f))w+=2;w+=own(mf,s.f)}
    if(parts.includes('t'))w+=own(mt,String(s.t));return w};
  return {syl,word:(w,parts)=>w.s.reduce((a,s)=>a+syl(s,parts)-1,1),pair:ct=>1+(weak?own(mc,ct):0)}}
function pyPicker(list,key,weight){const recent=[];
  return ()=>{let tot=0;const ws=list.map(x=>{const w=recent.includes(key(x))?0:weight(x);tot+=w;return w});
    let r=Math.random()*tot,i=0;for(;i<list.length-1;i++){r-=ws[i];if(r<=0)break}
    const x=list[i];recent.push(key(x));if(recent.length>Math.min(12,list.length-1))recent.shift();return x}}
function pyGen(mode){
  const W=pyWeights(),P=PYD;
  if(mode==='ini'){const p=pyPicker(P.syl.filter(s=>s.i),s=>s.k,s=>W.syl(s,['i']));return ()=>({m:mode,s:p()})}
  if(mode==='fin'){const p=pyPicker(P.syl,s=>s.k,s=>W.syl(s,['f','t']));return ()=>({m:mode,s:p()})}
  if(mode==='tone'){const p=pyPicker(P.words,w=>w.w,w=>W.word(w,['t']));return ()=>({m:mode,w:p()})}
  if(mode==='word'){const p=pyPicker(P.words,w=>w.w,w=>W.word(w,['i','f','t']));return ()=>({m:mode,w:p()})}
  const cts=Object.keys(P.pairs),pc=pyPicker(cts,c=>c,c=>W.pair(c));
  return ()=>{const ct=pc(),list=P.pairs[ct],pr=list[Math.random()*list.length|0],opts=shuffle([pr.a,pr.b]);
    return {m:'pair',pr,opts,play:opts[Math.random()*2|0]}}}

/* grading one answer: ans is the typed text, the picked tones, or the picked syllable */
function pyGrade(it,ans){
  if(it.m==='ini'){const u=String(ans||'').toLowerCase().replace(/[^a-z]/g,''),ok=u===it.s.i;
    return {ok,confs:!ok&&PY_INI.includes(u)?['i:'+it.s.i+'>'+u]:[],u:u?esc(u)+`<span class="pyfx">${esc(pyFinal(it.s))}</span>`:''}}
  if(it.m==='fin'){const s=it.s,x=pyParse1(String(ans||''));let b=x.b;
    if(s.i&&b.startsWith(s.i)&&b.length>s.i.length&&b.slice(s.i.length)===s.f)b=b.slice(s.i.length);
    let uh=false;if(PY_JQXY(s.i)&&b.startsWith('ü')&&s.f.startsWith('u')){b='u'+b.slice(1);uh=true}
    const ok=b===s.f&&x.t===s.t;
    return {ok,uh:ok&&uh,confs:ok?[]:pySylDiff(s,{i:s.i,f:b,t:x.t},['f','t']),u:b||x.t?`<span class="pyfx">${esc(s.i)}</span>`+esc(pyPreview(String(ans))):''}}
  if(it.m==='tone'){const pk=ans||[],ok=it.w.s.every((s,i)=>pk[i]===s.t);
    return {ok,confs:it.w.s.flatMap((s,i)=>pk[i]&&pk[i]!==s.t?['t:'+s.t+'>'+pk[i]]:[]),u:pk.some(Boolean)?esc(it.w.s.map((s,i)=>markSyl(s.b,pk[i]||0)).join(' ')):''}}
  if(it.m==='word'){const raw=String(ans||''),u=pyParseMany(raw),a=it.w.s;
    const key=l=>pyJqxy(l.map(s=>s.b).join(''))+'|'+l.map(s=>s.t).filter(Boolean).join('');
    const ok=!!u.length&&key(u)===key(a);
    return {ok,uh:ok&&/[jqxy]ü/.test(pyNorm(raw)),confs:!ok&&u.length===a.length?a.flatMap((s,i)=>pySylDiff(s,u[i],['i','f','t'])):[],u:raw.trim()?esc(pyPreview(raw)):''}}
  const p=ans,ok=p===it.play;
  return {ok,confs:ok||!p?[]:[it.pr.kind+':'+(it.pr.kind==='i'?it.play.i+'>'+p.i:it.play.f+'>'+p.f)],u:p?esc(markSyl(p.b,p.t)):''}}

/* the question part of a card, shared by practice and the test */
function pyAsk(it){
  if(it.m==='ini')return `<div class="pyq" aria-label="Missing initial">${PYH(`<span class="pyslot" id="pyslot">?</span><span>${esc(pyFinal(it.s))}</span>`)}</div>
    <div class="typein"><input id="pyin" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="Initial, e.g. zh" aria-label="Your answer"></div>`;
  if(it.m==='fin')return `<div class="pyq">${PYH(`<span>${it.s.i?esc(it.s.i):'–'}</span><span class="pyslot" id="pyslot">?</span>`)}</div>${it.s.i?'':'<p class="hint pynote">This syllable has no initial.</p>'}
    <div class="typein"><input id="pyin" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="Final and tone, e.g. ong1 or ōng" aria-label="Your answer"></div><p class="pyprev" id="pyprev" aria-live="polite"></p>`;
  if(it.m==='word')return `<div class="pyq">${PYH('<span class="pyslot wide" id="pyslot">? ?</span>')}</div>
    <div class="typein"><input id="pyin" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="Whole word, e.g. yin1yue4 or yīnyuè" aria-label="Your answer"></div><p class="pyprev" id="pyprev" aria-live="polite"></p>`;
  if(it.m==='tone')return `<div class="tsyls" id="ts" aria-label="Syllables"></div>
    <div class="tones four" id="qo">${[1,2,3,4].map(t=>`<button class="tbtn t${t}" data-t="${t}">${contour(t)}${t}<small>${TONE[t]}</small></button>`).join('')}</div>`;
  return `<div class="opts pyopts" id="qo">${it.opts.map((s,i)=>`<button class="opt c" data-i="${i}"><kbd>${i+1}</kbd>${PYH(esc(markSyl(s.b,s.t)))}</button>`).join('')}</div>`;
}
const PY_KEYS={ini:'Enter checks, Shift+Enter plays again.',fin:'Enter checks, Shift+Enter plays again. Type ü as v.',word:'Enter checks, Shift+Enter plays again. Type ü as v.',
  tone:'Tap a tone for each syllable, or press 1–4. Shift+Enter plays again.',pair:'Which one did you hear? Press 1 or 2. Shift+Enter plays again.'};
/* wires up the inputs of a card; get() returns the current answer */
function pyWire(it,onPick){
  const inp=$('pyin');
  if(inp){if($('pyprev'))inp.oninput=()=>{$('pyprev').textContent=inp.value.trim()?pyPreview(inp.value):''};
    setTimeout(()=>inp.focus({preventScroll:true}),0);return {get:()=>inp.value,inp,key:()=>false}}
  if(it.m==='tone'){const pick=it.w.s.map(()=>0);let cur=0,lock=false;
    const draw=(res)=>{$('ts').innerHTML=it.w.s.map((s,i)=>{const t=pick[i],st=res?(t===s.t?' ok':' bad'):'';
      return `<button class="tsyl${i===cur&&!res?' cur':''}${t?' t'+t:''}${st}" data-i="${i}" aria-label="${esc(s.b)}" data-noi18n lang="zh-Latn-pinyin">${esc(markSyl(s.b,t))}<small${res&&t!==s.t?` class="t${s.t}"`:''}>${res&&t!==s.t?esc(markSyl(s.b,s.t)):t?t+'.':'?'}</small></button>`}).join('')};
    const set=t=>{if(lock)return;pick[cur]=t;const nx=pick.findIndex((v,i)=>!v&&i>cur),any=pick.indexOf(0);cur=nx>=0?nx:any>=0?any:cur;draw();onPick&&onPick()};
    draw();$('ts').onclick=e=>{const b=e.target.closest('[data-i]');if(b&&!lock){cur=+b.dataset.i;draw()}};
    $('qo').onclick=e=>{const b=e.target.closest('[data-t]');if(b)set(+b.dataset.t)};
    return {get:()=>pick.slice(),reveal:()=>{lock=true;draw(true)},
      key:e=>{if(/^[1-4]$/.test(e.key)){set(+e.key);return true}if(e.key==='Backspace'&&!lock){const l=cur>0&&!pick[cur]?cur-1:cur;pick[l]=0;cur=l;draw();return true}
        if(e.key==='ArrowLeft'&&!lock){cur=Math.max(0,cur-1);draw();return true}if(e.key==='ArrowRight'&&!lock){cur=Math.min(pick.length-1,cur+1);draw();return true}return false}}}
  let picked=null;
  $('qo').onclick=e=>{const b=e.target.closest('[data-i]');if(!b||$('qo').classList.contains('answered'))return;picked=it.opts[+b.dataset.i];
    $('qo').querySelectorAll('.opt').forEach(o=>o.setAttribute('aria-pressed',String(o===b)));onPick&&onPick(true)};
  return {get:()=>picked,key:e=>{if(e.key==='1'||e.key==='2'){const b=$('qo').querySelector(`[data-i="${+e.key-1}"]`);if(b)b.click();return true}return false}}
}
/* the back button of a practice bar goes to the trainer's start screen, not home */
function pyBack(fn){const b=M().querySelector('.bar .back');if(b){b.removeAttribute('data-home');b.textContent='‹ Back';b.onclick=fn}}

/* ---------- start screen ---------- */
async function phonetics(){
  if(!PYD){open(bar(0,'','‹ Home')+`<h2>Chinese Phonetics – test</h2><p class="hint" id="pyload">Loading…</p>`);
    try{await loadPy()}catch(e){if($('pyload'))$('pyload').innerHTML='Could not load the syllables. Check your connection and try again.';return}
    if(!$('pyload'))return}
  const mode=PYMODES.some(m=>m[0]===state.pyMode)?state.pyMode:'ini';
  const statOf=k=>{if(k==='test'){const t=PYS.tests[PYS.tests.length-1];return t?`Last: ${t.s}%`:'Not tried yet'}
    const m=PYS.m[k];return m&&m.n?`${pyPct(m.ok,m.n)}% right · ${m.n} answers`:'Not tried yet'};
  const art=modeArt('pinyin'),top=pyTopConf();
  open(bar(0,'','‹ Home')+`<div class="shead">${art?`<span class="sart">${art}</span>`:''}<div><h2>Chinese Phonetics – test</h2><p class="muted">Get ready for the phonetics test: 100 dictated items, 80% to pass. You hear a syllable or a word, you write it in pinyin.</p></div></div>
    <div id="pyvoice"></div>
    <section class="step"><h3><span class="sn">1</span>What do you want to practise?</h3>
      <div class="choices pychoices">${PYMODES.map(([k,n,d])=>`<button class="choice" data-pm="${k}" aria-pressed="${mode===k}"><b>${n}</b><span>${d}</span><small class="pystat">${statOf(k)}</small></button>`).join('')}</div>
      <div class="seg" role="group" aria-label="Focus"><button data-pw="1" aria-pressed="${state.pyWeak!==false}">Focus on weak spots</button><button data-pw="0" aria-pressed="${state.pyWeak===false}">Everything evenly</button></div>
      <p class="hint" style="margin:0">Weak spots: hard initials (z zh c ch s sh j q x r), hard finals (ong eng ang an en in ing ian uan un ue …) and your own mistakes come up more often. The practice test is always mixed evenly.</p></section>
    <section class="step"><h3><span class="sn">2</span>Voice</h3><div id="pyvbox"></div></section>
    <section class="step"><h3>Your weak spots</h3>
      ${top.length?`<div class="mmiss pyconf">${top.map(([k,n])=>pyChip(k,n)).join('')}</div>`:'<p class="hint" style="margin:0">Nothing yet. Your most frequent mix-ups show up here, for example ong → eng.</p>'}
      ${PYS.tests.length?`<p class="hint" style="margin:0"><span>Practice tests:</span> ${PYS.tests.slice(-8).map(t=>`<b class="${t.s>=80?'pyok':'pybad'}">${t.s}%</b>`).join(' · ')}</p>`:''}
      <div class="confirm" id="pyrc"><button class="btn ghost" id="pyr1">Reset dictation stats…</button></div></section>
    <div class="startbar"><button class="btn bigbtn" id="pygo"></button></div>`);
  const go=()=>{const m=state.pyMode&&PYMODES.some(x=>x[0]===state.pyMode)?state.pyMode:'ini';$('pygo').textContent=m==='test'?'Start the test · 100 items':'Start · '+pyName(m)};go();
  M().querySelectorAll('[data-pm]').forEach(b=>b.onclick=()=>{state.pyMode=b.dataset.pm;saveState();M().querySelectorAll('[data-pm]').forEach(c=>c.setAttribute('aria-pressed',String(c===b)));go()});
  M().querySelectorAll('[data-pw]').forEach(b=>b.onclick=()=>{state.pyWeak=b.dataset.pw==='1';saveState();M().querySelectorAll('[data-pw]').forEach(c=>c.setAttribute('aria-pressed',String(c===b)))});
  $('pygo').onclick=()=>{const m=state.pyMode||'ini';m==='test'?pyTest():pyPractice(m)};
  $('pyr1').onclick=()=>{$('pyrc').innerHTML='<span>Delete the dictation stats?</span><button class="btn badb" id="pyr2">Yes, delete</button><button class="btn ghost" id="pyr3">No</button>';
    $('pyr2').onclick=()=>{PYS={m:{},c:{},tests:[],u:0};savePys();phonetics()};$('pyr3').onclick=phonetics};
  pyVoiceBox();setTimeout(()=>{pyVoiceLate=true;pyVoiceBox()},1500);
}
let pyVoiceLate=false;
const NOVOICE_HTML=`<div class="notice pywarn" role="alert"><b>No Chinese voice on this device, so you won't hear anything.</b><ul>
    <li>Mac: System Settings → Accessibility → Spoken Content → System voice → Manage voices → Chinese. Download a voice, then reload this page.</li>
    <li>Windows: Settings → Time &amp; language → Speech → Add voices → Chinese (Simplified, China).</li>
    <li>iPhone and Android phones usually have one already.</li></ul></div>`;
function voiceControls(p){const has='speechSynthesis' in window&&voices.length>0,r=state.rate||.8;
  return `<div class="pyvrow"><select id="${p}vsel" aria-label="Chinese voice"${has?'':' disabled'}>${has?voices.map(v=>`<option value="${esc(v.name)}"${voice&&v.name===voice.name?' selected':''}>${esc(v.name)} (${esc(v.lang)})</option>`).join(''):'<option>No Chinese voice found on this device</option>'}</select><button class="btn ghost" id="${p}vt"${has?'':' disabled'}>${PLAY}Play a sample</button></div>
    <label class="pyrate"><span>Speed</span><input type="range" id="${p}rate" min="0.5" max="1.2" step="0.05" value="${r}"><b id="${p}rv" data-noi18n>${r.toFixed(2)}×</b></label>
    <p class="hint" style="margin:0">One voice for the whole app: characters, words, sentences, grammar and dictation. It is your device's Chinese voice, not a recording of a person, and now and then it may read a tone oddly. The best voices are the "Natural" ones in Microsoft Edge and Google 普通话 in Chrome; on iPhone, a better one can be added in Settings › Accessibility › Spoken Content › Voices › Chinese.</p>`}
function wireVoice(p){
  if($(p+'vsel'))$(p+'vsel').onchange=e=>{state.voice=e.target.value;saveState();pickVoice()};
  if($(p+'vt'))$(p+'vt').onclick=()=>sayText('你好，我们一起学中文吧。');
  $(p+'rate').oninput=e=>{state.rate=+e.target.value;$(p+'rv').textContent=state.rate.toFixed(2)+'×'};
  $(p+'rate').onchange=()=>saveState();
}
function pyVoiceBox(){
  const box=$('pyvbox'),warn=$('pyvoice');if(!box)return;
  const has='speechSynthesis' in window&&voices.length>0;
  warn.innerHTML=!has&&(pyVoiceLate||!('speechSynthesis' in window))?NOVOICE_HTML:'';
  box.innerHTML=voiceControls('py');wireVoice('py');
}
if('speechSynthesis' in window)speechSynthesis.addEventListener('voiceschanged',()=>{if($('pyvbox'))pyVoiceBox();if($('srate')){const y=scrollY;settings();scrollTo(0,y)}if(voice&&$('noVoice'))$('noVoice').hidden=true});

/* ---------- practice rounds: 15 items, a wrong one comes back about 4 items later ---------- */
function pyPractice(mode){
  const gen=pyGen(mode),q=Array.from({length:15},gen),miss=[],confs=[];let qi=0,good=0,bad=0;
  function render(){
    if(qi>=q.length)return end();
    const it=q[qi];let done=false;
    open(tallyBar(bad,good,q.length,(qi+1)+' / '+q.length)+`<div class="card top-align pycard"><p class="eyebrow">${pyName(mode)}${it.again?' · again':''}</p>
      <button class="play huge" id="pyp">${PLAY}Play again</button>
      ${pyAsk(it)}<p class="hint pykeys">${PY_KEYS[mode]}</p>
      <div class="btns" id="pyb"><button class="btn ghost" id="pyidk">I don't know</button><button class="btn" id="pyc">Check</button></div>
      <div id="fb" role="status" aria-live="polite" style="width:100%"></div></div>`);
    pyBack(phonetics);
    const play=()=>pySay(it);$('pyp').onclick=play;setTimeout(play,250);
    const w=pyWire(it,auto=>{if(auto)check()});
    const check=(give)=>{if(done)return;done=true;const ans=give?null:w.get(),g=pyGrade(it,ans);
      if(g.ok)good++;else{bad++;miss.push(it);confs.push(...g.confs);if((it.tries||0)<2)q.splice(Math.min(q.length,qi+4),0,{...it,again:true,tries:(it.tries||0)+1})}
      pyRecord(mode,g.ok,g.confs);
      if(w.inp){w.inp.readOnly=true;w.inp.classList.add(g.ok?'is-ok':'is-bad')}
      if(w.reveal)w.reveal();
      if($('pyslot')){const s=$('pyslot');s.textContent=it.m==='ini'?it.s.i:it.m==='fin'?pyFinal(it.s):pyFull(it);s.classList.add(g.ok?'ok':'bad')}
      if(it.m==='pair'){const box=$('qo');box.classList.add('answered');box.querySelectorAll('.opt').forEach((o,i)=>{const s=it.opts[i];if(s===it.play)o.classList.add('is-ok');else if(s===ans)o.classList.add('is-bad');o.insertAdjacentHTML('beforeend',`<span class="han" lang="zh-Hans">${esc(s.c)}</span>`)})}
      if(it.m==='tone')$('qo').classList.add('answered');
      $('pyb').hidden=true;
      $('fb').innerHTML=`<div class="fb ${g.ok?'ok':'bad'}"><h3>${g.ok?'✓ Correct':'✗ Not quite'}</h3>
        <p class="pyans"><b class="han" lang="zh-Hans">${esc(pyChars(it))}</b> ${PYH(`<b>${pyHtml(pyFull(it))}</b>`)}<button class="mini" id="pyfp" aria-label="Play">${PLAY}</button></p>
        ${g.ok?'':`<p class="pyyou"><span>Your answer:</span> ${g.u?PYH(`<b>${g.u}</b>`):'<b>(nothing)</b>'}</p>`}
        ${g.uh?`<p class="hint" style="margin:0"><span>Counted as right. After j, q, x and y, ü is written u:</span> ${PYH(`<b>${esc(pyFull(it))}</b>`)}</p>`:''}
        ${!g.ok&&(it.tries||0)<2?'<p class="hint" style="margin:0">This one comes back in a moment.</p>':''}
        <button class="btn" id="pyn">${qi===q.length-1?'See result':'Next ›'}</button></div>`;
      $('pyfp').onclick=play;$('pyn').onclick=()=>{qi++;render()};
      if(!w.inp)document.activeElement&&document.activeElement.blur&&document.activeElement.blur();
      $('fb').scrollIntoView({block:'nearest',behavior:MOTION?'smooth':'auto'});
      if(!g.ok||mode==='pair')play()};
    $('pyc').onclick=()=>check();$('pyidk').onclick=()=>check(true);
    keyHandler=e=>{if(e.key==='Enter'){e.preventDefault();if(e.shiftKey)play();else if(done)$('pyn').click();else check();return}
      if(!done&&w.key(e))e.preventDefault()};
  }
  function end(){keyHandler=null;const tot=good+bad,cc={};for(const k of confs)cc[k]=(cc[k]||0)+1;
    const um=[...new Map(miss.map(it=>[pyFull(it),it])).values()];
    open(bar(100,tot+' / '+tot)+`<div class="card"><p class="eyebrow">${pyName(mode)}</p><span class="score">${good} / ${tot}</span>
      <p>${!bad?'Every answer right.':'Wrong answers came back until the round was over.'}</p>
      ${Object.keys(cc).length?`<p class="hint" style="margin:0">Mix-ups this round:</p><div class="mmiss">${Object.entries(cc).sort((a,b)=>b[1]-a[1]).map(([k,n])=>pyChip(k,n)).join('')}</div>`:''}
      ${um.length?`<p class="hint" style="margin:0">To listen to again:</p><div class="mmiss">${um.map((it,i)=>`<button class="mmi pymi" data-nosay data-mi="${i}"><b class="han" lang="zh-Hans">${esc(pyChars(it))}</b> ${PYH(pyHtml(pyFull(it)))}</button>`).join('')}</div>`:''}
      <div class="btns"><button class="btn ghost" id="pyhub">‹ Back</button><button class="btn" id="pyag">Next round</button></div></div>`);
    pyBack(phonetics);$('pyhub').onclick=phonetics;$('pyag').onclick=()=>pyPractice(mode);
    M().querySelectorAll('[data-mi]').forEach(b=>b.onclick=()=>pySay(um[+b.dataset.mi]));
    keyHandler=e=>{if(e.key==='Enter'){e.preventDefault();pyPractice(mode)}};
  }
  render();
}

/* ---------- practice test: 25 + 25 + 25 + 25, no feedback, then the corrected answer sheet ---------- */
function pyTest(){
  const P=PYD,take=(a,n)=>shuffle(a).slice(0,n),ws=shuffle(P.words);
  const items=[...take(P.syl.filter(s=>s.i),25).map(s=>({m:'ini',s})),...take(P.syl,25).map(s=>({m:'fin',s})),
    ...ws.slice(0,25).map(w=>({m:'tone',w})),...ws.slice(25,50).map(w=>({m:'word',w}))];
  const ans=new Array(100).fill(null);let n=0;
  const quit=()=>{if(confirm(T_('Leave the test? Your answers will be lost.')))phonetics()};
  function render(){
    const it=items[n];
    open(`<div class="bar"><button class="back" id="pyq">‹ End</button><div class="progress"><span style="width:${n}%"></span></div><span class="count">${n+1} / 100</span></div>
      <div class="card top-align pycard"><p class="eyebrow">${'Practice test · '+pyName(it.m)}</p>
      <button class="play huge" id="pyp">${PLAY}Play again</button>
      ${pyAsk(it)}<p class="hint pykeys">${it.m==='tone'?'Tap a tone for each syllable, or press 1–4. Enter goes on, Shift+Enter plays again.':'Enter goes on, Shift+Enter plays again.'}</p>
      <div class="btns"><button class="btn" id="pyn">${n===99?'Finish the test':'Next ›'}</button></div></div>`);
    $('pyq').onclick=quit;
    const play=()=>pySay(it);$('pyp').onclick=play;setTimeout(play,250);
    const w=pyWire(it);
    const nx=()=>{ans[n]=w.get();if(n===99)return result();n++;render()};$('pyn').onclick=nx;
    keyHandler=e=>{if(e.key==='Enter'){e.preventDefault();e.shiftKey?play():nx();return}if(w.key(e))e.preventDefault()};
  }
  function result(){keyHandler=null;
    const gs=items.map((it,i)=>pyGrade(it,ans[i])),right=gs.filter(g=>g.ok).length,pass=right>=80;
    for(const g of gs)for(const k of g.confs)PYS.c[k]=(PYS.c[k]||0)+1;
    const m=PYS.m.test||(PYS.m.test={n:0,ok:0});m.n+=100;m.ok+=right;PYS.tests.push({d:todayStr(),s:right});PYS.tests=PYS.tests.slice(-20);savePys();
    const sec=[0,1,2,3].map(k=>gs.slice(k*25,k*25+25).filter(g=>!g.ok).length);
    open(bar(100,'100 / 100','‹ Back')+`<div class="card"><p class="eyebrow">Practice test</p><span class="score">${right}%</span>
      <p><b class="${pass?'pyok':'pybad'}">${pass?'Passed':'Not passed yet'}</b> · <span>You need 80% to pass.</span></p>
      <div class="pstats pysec">${[0,1,2,3].map(k=>`<div class="stat"><b>${sec[k]}</b><span>${pyName(PYMODES[k][0])}</span></div>`).join('')}</div><p class="hint" style="margin:0">Mistakes in each part (out of 25)</p>
      <div class="btns"><button class="btn ghost" id="pyhub">‹ Back</button><button class="btn" id="pyag">New test</button></div></div>
      <h3 class="pysh">Corrected answer sheet</h3>
      <div class="pysheet">${[0,1,2,3].map(k=>`<section><h4><span data-noi18n>${k*25+1}–${k*25+25}</span> ${pyName(PYMODES[k][0])}</h4><ol>${items.slice(k*25,k*25+25).map((it,j)=>{const i=k*25+j,g=gs[i];
        return `<li class="${g.ok?'':'bad'}"><span class="n">${i+1}.</span><span class="a" data-noi18n lang="zh-Latn-pinyin">${g.ok?`<b>${g.u}</b>`:`<i class="x" aria-label="wrong">✗</i> ${g.u?`<s>${g.u}</s>`:'<s>—</s>'} <b class="fix">${esc(pyFull(it))}</b>`}<button class="han pych" data-pi="${i}" lang="zh-Hans" aria-label="Play">${esc(pyChars(it))}</button></span></li>`}).join('')}</ol></section>`).join('')}</div>`);
    pyBack(phonetics);$('pyhub').onclick=phonetics;$('pyag').onclick=pyTest;
    M().querySelectorAll('[data-pi]').forEach(b=>b.onclick=e=>{e.stopPropagation();pySay(items[+b.dataset.pi])});
  }
  render();
}
const T_=s=>LANG==='cs'?(T(s)??s):s;

