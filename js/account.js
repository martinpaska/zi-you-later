/* ---------- Supabase: accounts, synced progress and the leaderboard ----------
   Fill in both values to turn accounts on (Supabase → Project Settings → API).
   The anon key is meant to be public: what it may do is limited by the row level
   security rules in supabase/schema.sql. Never put the service_role key here. */
const SUPABASE_URL='https://hhjwwkgwqowfglwxruzk.supabase.co';
const SUPABASE_ANON_KEY='sb_publishable_RWAD8X3RQXRjmPuUas0-Gw_GW9tItJD';
const SUPA_ON=!!(SUPABASE_URL&&SUPABASE_ANON_KEY);
const SITE_URL=location.origin+location.pathname;
const FIRST_HASH=location.hash;
let sb=null,sbLoad=null,sbHooked=false,boardTimer=null,boardPull=null,cloudBusy=false;
function loadSupabase(){
  if(!SUPA_ON)return Promise.resolve(null);if(sbLoad)return sbLoad;
  sbLoad=new Promise(res=>{const el=document.createElement('script');el.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    el.onload=()=>{try{sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'}})}catch(e){sb=null}res(sb)};
    el.onerror=()=>res(null);document.head.appendChild(el)});
  return sbLoad;
}
const profRow=r=>({name:r.name,avatar:r.avatar,known:r.known,learning:r.learning,streak:r.streak,week:r.week,total:r.total,updated:Number(r.updated)||0});
const supaErr=e=>{const x=new Error(e&&e.message||'error');x.code=e&&e.code==='23505'?'taken':e&&e.code==='23514'?'invalid':e&&e.code;return x};
/* the leaderboard is public: anyone can read nicknames and counts, even when signed out */
function startBoard(){
  if(!sb||boardTimer)return;
  const pull=async()=>{if(!$('board'))return;const {data,error}=await sb.from('profiles').select('id,name,avatar,known,learning,streak,week,total,updated').order('known',{ascending:false}).limit(200);
    if(!error){board=data.map(r=>({id:r.id,...profRow(r)}));if($('board'))renderBoard()}};
  boardPull=pull;boardTimer=setInterval(pull,60000);
}
/* same small interface as the db the app was first written for: doc(path).get/set/delete, collection().onSnapshot */
function supaCaps(user){
  const me_=user.id;
  const userCap={id:async()=>me_,can:async()=>true};
  const doc=path=>{
    if(path.startsWith('data/users/'))return {
      get:async()=>{const {data,error}=await sb.from('progress').select('data').eq('user_id',me_).maybeSingle();if(error)throw supaErr(error);return {exists:!!data,data:()=>data.data}},
      set:async v=>{const {error}=await sb.from('progress').upsert({user_id:me_,data:v,updated_at:new Date().toISOString()});if(error)throw supaErr(error)}};
    return {
      get:async()=>{const {data,error}=await sb.from('profiles').select('*').eq('id',me_).maybeSingle();if(error)throw supaErr(error);return {exists:!!data,data:()=>profRow(data)}},
      set:async v=>{const {error}=await sb.from('profiles').upsert({id:me_,name:v.name,avatar:v.avatar,known:v.known|0,learning:v.learning|0,streak:v.streak|0,week:v.week|0,total:v.total|0,updated:Math.round(v.updated||Date.now())});if(error)throw supaErr(error);
        const row={id:me_,...profRow({...v,updated:Math.round(v.updated||Date.now())})},i=board.findIndex(r=>r.id===me_);if(i>=0)board[i]=row;else board.push(row);if($('board'))renderBoard()},
      delete:async()=>{const {error}=await sb.rpc('delete_me');if(error)throw supaErr(error);board=board.filter(r=>r.id!==me_);await sb.auth.signOut()}};
  };
  return [userCap,{doc,collection:()=>({onSnapshot:()=>{startBoard()}})}];
}
function resetCloud(){ADMIN=null;clearTimeout(cloudTimer);cloud=null;uid=null;userCap=null;dbCap=null;me=null;boardWritable=null;renderAcct();if($('board'))renderBoard()}

/* ---------- Accounts and leaderboard ---------- */
let signupFlow=false,cloud=null,uid=null,userCap=null,dbCap=null,board=[],boardWritable=null,cloudTimer=null,me=null,cloudReady=false,boardSort='week';
const AVATARS=['🐼','🐉','🐯','🦊','🐱','🐶','🐵','🐰','🦄','🐧','🐸','🌸','⭐','🍜','🥟','🏮'];
const weekCount=()=>{const h=stats.hist||{};let n=0;for(let i=0;i<7;i++)n+=h[todayStr(new Date(Date.now()-i*DAY))]||0;return n};
const curStreak=()=>stats.last===todayStr()||stats.last===todayStr(new Date(Date.now()-DAY))?stats.streak:0;
function summary(){return {known:ALLITEMS.filter(x=>mastery(x)===2).length,learning:ALLITEMS.filter(x=>mastery(x)===1).length,streak:curStreak(),week:weekCount(),total:stats.total,updated:Date.now()}}
function cloudSave(){
  if(!cloud)return;clearTimeout(cloudTimer);
  cloudTimer=setTimeout(async()=>{
    try{await cloud.set({srs:JSON.stringify(srs),stats,state:{...state,sel:[...state.sel]},py:PYS,u:Date.now()})}catch(e){}
    if(me&&boardWritable!==false){try{await dbCap.doc('accounts/'+uid).set({...me,...summary()})}catch(e){}}
  },1500);
}
function mergeSrs(other){let n=0;for(const k in other){const a=srs[k],b=other[k];if(!a||(b.u||0)>(a.u||0)){srs[k]=b;n++}}return n}
async function initCloud(){
  const done=()=>{cloudReady=true;cloudBusy=false;renderAcct();if(!$('home').hidden)nudgeHome();setTimeout(()=>track('visit'),0);if(!M().hidden&&$('board'))renderBoard()};
  if(cloudBusy)return;cloudBusy=true;
  if(SUPA_ON){
    const c=await loadSupabase();if(!c)return done();
    if(!sbHooked){sbHooked=true;c.auth.onAuthStateChange((ev,session)=>{
      if(ev==='SIGNED_IN'&&session&&session.user.id!==uid)setTimeout(initCloud,0);
      else if(ev==='SIGNED_OUT')resetCloud();
      else if(ev==='PASSWORD_RECOVERY')setTimeout(newPassword,0)})}
    startBoard();
    let session=null;try{({data:{session}}=await c.auth.getSession())}catch(e){}
    if(!session)return done();
    if(uid&&session.user.id===uid)return done();
    [userCap,dbCap]=supaCaps(session.user);
  }else{
    if(!window.claude||!window.claude.use)return done();
    try{[userCap,dbCap]=await Promise.all([window.claude.use('user'),window.claude.use('db')])}catch(e){return done()}
  }
  if(!userCap||!dbCap)return done();
  try{uid=await userCap.id()}catch(e){uid=null}
  if(!uid)return done();
  const doc=dbCap.doc('data/users/'+uid+'/progress');
  try{const snap=await doc.get();if(snap.exists){const d=snap.data();mergeSrs(typeof d.srs==='string'?JSON.parse(d.srs):(d.srs||{}));if(d.stats&&(d.stats.u||0)>(stats.u||0))stats=Object.assign(stats,d.stats);if(d.py&&(d.py.u||0)>(PYS.u||0)){PYS=Object.assign({m:{},c:{},tests:[]},d.py);store.set('ic-pinyin',PYS)}rollDay();store.set('ic-srs',srs);store.set('ic-stats',stats)}}catch(e){}
  cloud=doc;
  try{const c=await userCap.can('data.write');if(c===false)boardWritable=false}catch(e){}
  try{const a=await dbCap.doc('accounts/'+uid).get();if(a.exists){const d=a.data();me={name:String(d.name||'').slice(0,20),avatar:d.avatar||AVATARS[0]}}}catch(e){}
  dbCap.collection('accounts').onSnapshot(s=>{board=s.docs.map(d=>({id:d.id,...d.data()}));if($('board'))renderBoard()},()=>{});
  cloudSave();done();
  if(!$('home').hidden)renderHome();
  /* just confirmed the email from the link: go straight to picking a nickname */
  if(SUPA_ON&&!me&&/type=(signup|magiclink)|access_token/.test(FIRST_HASH)&&M().hidden){signupFlow=true;account()}
}
function renderAcct(){streakVis();const b=$('acct');if(!b)return;b.textContent='';
  if(me){const a=document.createElement('span');a.className='av';a.textContent=me.avatar;b.append(a,document.createTextNode(me.name))}
  else b.textContent=uid?'Pick a nickname':'Create account'}
const ago=t=>{const m=(Date.now()-t)/6e4;return m<60?'just now':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' d ago'};
/* leaderboard: a weekly race, items known, streaks; your own card on top, a podium for the top three */
function renderBoard(){
  const el=$('board');if(!el)return;
  if(!cloudReady){el.innerHTML='<p class="hint">Loading…</p>';return}
  if(!dbCap&&!SUPA_ON){el.innerHTML='<p class="hint">The leaderboard is coming soon, together with accounts.</p>';return}
  const k='week',rows=board.filter(r=>typeof r.known==='number'&&r.name).sort((a,b)=>(b[k]||0)-(a[k]||0)||b.known-a.known);
  if(!rows.length){el.innerHTML='<p class="hint">No accounts yet. Create the first one.</p>';return}
  const unit={known:'known',week:'cards',streak:'days'}[k];
  const av=r=>AVATARS.includes(r.avatar)?r.avatar:'🙂';
  // your card: rank, your score, gap to the next player
  const mi=rows.findIndex(r=>r.id===uid),mr=mi>=0?rows[mi]:null;
  let mine='';
  if(mr){const above=mi>0?rows[mi-1]:null,gap=above?(above[k]||0)-(mr[k]||0)+1:0;
    mine=`<div class="bme"><div class="bmetop"><span class="bav">${av(mr)}</span><div><b class="bnm"></b><span class="bsub">Place ${mi+1} of ${rows.length}</span></div><b class="bscore">${mr[k]||0}<small>${unit}</small></b></div>
      <p class="bgoal">${mi===0?'You lead this board. Keep it up!':`${gap} more ${unit} to overtake ${'@@'}.`}</p></div>`}
  const top=rows.slice(0,3),rest=rows.slice(3);
  const pod=[top[1],top[0],top[2]].map((r,ix)=>{if(!r)return '<div class="pcol empty"></div>';const place=[2,1,3][ix];
    return `<div class="pcol p${place}${r.id===uid?' me':''}"><span class="pav">${av(r)}</span><span class="pnm"></span><b class="pval">${r[k]||0}<small>${unit}</small></b><div class="pstep">${place}</div></div>`}).join('');
  el.innerHTML=mine+`<div class="podium">${pod}</div>`+(rows.length<=3?`<p class="hint bcount">${rows.length===1?'Only you so far.':rows.length+' players so far. Everyone who creates an account appears here.'}</p>`:`<p class="hint bcount">All ${rows.length} players</p>`)+rest.map((r,i)=>`<div class="brow${r.id===uid?' me':''}"><span class="rk">${i+4}</span><span class="nm"><span class="av">${av(r)}</span><span class="nn"></span></span><span class="v">${r[k]||0}<small>${unit}</small></span></div>`).join('');
  // names go in as text, never as HTML
  const nm=r=>String(r.name).slice(0,20);
  if(mr){el.querySelector('.bnm').textContent=nm(mr);const g=el.querySelector('.bgoal');if(mi>0)g.textContent=g.textContent.replace('@@',nm(rows[mi-1]))}
  el.querySelectorAll('.podium .pcol:not(.empty) .pnm').forEach((n,ix)=>{const r=[top[1],top[0],top[2]].filter(Boolean)[ix];n.textContent=nm(r)+(r.id===uid?' (you)':'')});
  el.querySelectorAll('.brow .nn').forEach((n,i)=>{const r=rest[i];n.textContent=nm(r)+(r.id===uid?' (you)':'')});
  trTree(el);
}
function leaderboard(){
  open(bar(0,'','‹ Back')+`<h2>Leaderboard</h2>
    <p class="hint">Ranked by cards reviewed in the last 7 days. It keeps moving, so anyone who starts later can make it to the top in their first week.</p>
    <div class="board" id="board"></div>
    <div class="btns"><button class="btn ghost" data-go="account">${me?'My account':'Create account'}</button></div>`);
  renderBoard();if(boardPull)boardPull();
}
function account(){
  if(!cloudReady){open(bar(0,'','‹ Back')+'<h2>Account</h2><p class="hint">Loading…</p>');setTimeout(()=>{if(!M().hidden)account()},600);return}
  if(!uid&&SUPA_ON)return authForm();
  if(!uid){open(bar(0,'','‹ Back')+`<h2>Account</h2><p class="notice">Accounts are coming soon. Until then everything works and your progress is saved in this browser.</p><div class="btns"><button class="btn" data-home>Continue without an account ›</button></div>`);return}
  let pick=me?me.avatar:AVATARS[Math.random()*AVATARS.length|0];
  open(bar(0,'','‹ Back')+`<h2>${me?'My account':'Create account'}</h2>
    ${boardWritable===false?'<p class="notice">Your access to this page is view-only, so you cannot create an account. Ask whoever shared the page to give you Contributor access.</p>':''}
    <div class="section"><h3>Nickname</h3><div class="typein"><input id="nick" maxlength="20" autocomplete="off" placeholder="Your nickname" aria-label="Nickname"></div>
    <h3>Avatar</h3><div class="avs" id="avs">${AVATARS.map(a=>`<button data-av="${a}" aria-pressed="${a===pick}">${a}</button>`).join('')}</div>
    <p class="hint" id="am">Others see your nickname, avatar, how many items you know, your streak and how many cards you reviewed this week. Your progress syncs to every device where you are signed in.</p>
    <div class="btns"><button class="btn" id="asave">${me?'Save':'Create account'}</button></div></div>
    ${SUPA_ON?`<div class="section"><h3>Signed in</h3><p class="hint" id="aemail"></p><div class="btns"><button class="btn ghost" id="alogout">Log out</button></div></div>`:''}
    ${me||SUPA_ON?`<div class="section"><h3>Delete account</h3><p class="hint">${SUPA_ON?'Deletes your account, your leaderboard entry and the progress saved in it. Progress in this browser stays.':'Removes you from the leaderboard. Your progress stays.'}</p><div class="confirm" id="dc"><button class="btn ghost" id="d1">Delete account…</button></div></div>`:''}`);
  if(SUPA_ON){sb.auth.getUser().then(({data})=>{if($('aemail')&&data&&data.user)$('aemail').textContent=data.user.email||''});
    $('alogout').onclick=async()=>{$('alogout').disabled=true;try{await sb.auth.signOut()}catch(e){}resetCloud();goHome()}}
  $('nick').value=me?me.name:'';
  if(boardWritable===false){$('nick').disabled=true;$('asave').disabled=true}
  M().querySelectorAll('[data-av]').forEach(b=>b.onclick=()=>{pick=b.dataset.av;M().querySelectorAll('[data-av]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.av===pick))});
  $('asave').onclick=async()=>{
    const n=$('nick').value.trim().replace(/\s+/g,' ');
    if(n.length<2){$('am').textContent='Pick a nickname with at least 2 characters.';return}
    if(board.some(r=>r.id!==uid&&String(r.name).toLowerCase()===n.toLowerCase())){$('am').textContent='That nickname is taken. Try another one.';return}
    $('asave').disabled=true;
    try{await dbCap.doc('accounts/'+uid).set({name:n,avatar:pick,...summary()});me={name:n,avatar:pick};renderAcct();if(signupFlow){signupFlow=false;goHome()}else leaderboard()}
    catch(e){$('asave').disabled=false;$('am').textContent=e&&e.code==='not_granted'?'Saving was not allowed. You may need Contributor access to this page.':e&&e.code==='taken'?'That nickname is taken. Try another one.':e&&e.code==='invalid'?'Use 2 to 20 characters for the nickname.':'Could not save. Try again.'}
  };
  if($('d1'))$('d1').onclick=()=>{$('dc').innerHTML='<span>Delete your account?</span><button class="btn badb" id="d2">Yes, delete</button><button class="btn ghost" id="d3">No</button>';
    $('d2').onclick=async()=>{try{await dbCap.doc('accounts/'+uid).delete();me=null;if(SUPA_ON)resetCloud();renderAcct();goHome()}catch(e){$('dc').textContent='Could not delete. Try again.'}};$('d3').onclick=account};
}

