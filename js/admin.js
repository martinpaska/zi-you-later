/* ---------- Anonymous usage counts: each device says "I was here" and "I opened mode X" at most once a day.
   Only daily totals are stored (supabase/admin.sql, table usage): no id, no IP, nothing about the person. ---------- */
function track(kind){
  if(!SUPA_ON)return;const t=todayStr();
  let d=store.get('ic-ping',{});if(d._!==t)d={_:t};if(d[kind])return;d[kind]=1;store.set('ic-ping',d);
  loadSupabase().then(c=>c&&c.rpc('track',{what:kind})).catch(()=>{});
}
document.addEventListener('click',e=>{const m=e.target.closest('[data-mode]');if(m&&/^[a-z0-9_]{1,20}$/.test(m.dataset.mode))track('mode:'+m.dataset.mode);else if(e.target.closest('#goReview'))track('mode:review')},true);

/* ---------- Admin page (#admin): accounts, activity, usage and every user, for admins only.
   The data comes from admin_stats() in supabase/admin.sql, which refuses anyone not in the admins table. ---------- */
const ADM_MODES={review:'Dnešní opakování',cards:'Kartičky',learn:'Učení',grammar:'Gramatika',gram1:'Gramatika čínštiny I',write:'Psaní',vocab:'Seznam slovíček',
  sentences:'Věty',match:'Přiřazování',tones:'Tóny',twins:'Tóny ve slovech',pinyin:'Fonetika čínštiny – test',test:'Test'};
let ADMIN=null;
async function isAdmin(){if(ADMIN!==null)return ADMIN;if(!SUPA_ON||!uid)return false;const c=await loadSupabase();if(!c)return false;
  try{const {data,error}=await c.rpc('is_admin');ADMIN=!error&&data===true}catch(e){ADMIN=false}return ADMIN}
const admDay=(d,o={day:'numeric',month:'numeric'})=>new Date(d+'T12:00:00Z').toLocaleDateString('cs-CZ',o);
const admAgo=t=>{if(!t)return '–';const m=(Date.now()-new Date(t))/6e4;return m<2?'teď':m<60?Math.round(m)+' min':m<1440?Math.round(m/60)+' h':m<2880?'včera':Math.round(m/1440)+' d'};
function admPage(inner){open(bar(0,'','‹ Home')+`<div class="adm" data-noi18n><div class="row"><h2>Admin</h2><span class="hint">Zì You Later</span></div>${inner}</div>`)}
async function adminPage(){
  if(!SUPA_ON)return admPage('<div class="notice">Účty nejsou zapnuté (v index.html chybí klíče Supabase).</div>');
  if(!cloudReady){admPage('<p class="hint">Načítám…</p>');setTimeout(()=>{if(!M().hidden&&M().querySelector('.adm'))adminPage()},500);return}
  if(!uid)return admPage(`<div class="notice"><p style="margin:0 0 10px">Přihlas se svým účtem. Admin stránku uvidí jen účty zapsané v tabulce <code>admins</code>.</p><button class="btn" data-go="account">Přihlásit se</button></div>`);
  admPage('<p class="hint">Načítám data…</p>');
  const c=await loadSupabase();let data=null,error=null;
  try{({data,error}=await c.rpc('admin_stats'))}catch(e){error=e}
  if(!M().querySelector('.adm'))return;
  if(error){const m=String(error.message||error);
    return admPage(`<div class="notice pywarn"><b>${/not an admin/.test(m)?'Tenhle účet není admin.':/admin_stats|function|schema cache/i.test(m)?'V databázi chybí admin funkce.':'Data se nepodařilo načíst.'}</b>
      <p style="margin:6px 0 0">${/not an admin/.test(m)?'Přidej se do tabulky admins podle supabase/README.md (krok Admin).':/admin_stats|function|schema cache/i.test(m)?'Spusť v Supabase soubor supabase/admin.sql (SQL Editor → New query → Run).':esc(m)}</p></div>`)}
  ADMIN=true;admRender(data);
}
function admRender(D){
  const users=D.users||[],now=Date.now(),day=864e5,act=u=>Math.max(+new Date(u.synced||0),+new Date(u.last_sign_in||0));
  const iso=k=>new Date(now-k*day).toISOString().slice(0,10),days=[...Array(30)].map((_,i)=>iso(29-i));
  const U={},MO={};for(const r of D.usage||[]){if(r.kind==='visit')U[r.day]=r;else if(r.day>=days[0]){const k=r.kind.slice(5);MO[k]=(MO[k]||0)+r.guests+r.members}}
  const S={};for(const r of D.signups||[])S[r.day]=r.n;
  const dv=d=>U[d]?U[d].guests+U[d].members:0,sum=(a,f)=>a.reduce((s,x)=>s+f(x),0);
  const v30=sum(days,dv),v7=sum(days.slice(-7),dv),today=days[29];
  const a1=users.filter(u=>now-act(u)<day).length,a7=users.filter(u=>now-act(u)<7*day).length,a30=users.filter(u=>now-act(u)<30*day).length;
  const n7=users.filter(u=>now-new Date(u.created)<7*day).length,n30=users.filter(u=>now-new Date(u.created)<30*day).length;
  const reviews=sum(users,u=>u.total||0),tests=users.flatMap(u=>Array.isArray(u.tests)?u.tests:[]);
  const kpi=(n,l,s)=>`<div class="stat"><b>${n}</b><span>${l}</span>${s?`<small>${s}</small>`:''}</div>`;
  const firstUse=(D.usage||[]).length?D.usage[0].day:null;
  // stacked daily bars: devices with an account (red) on top of guests (blue), with a hover title per day
  const W=600,H=150,B=22,mx=Math.max(1,...days.map(dv)),bw=W/days.length;
  const daily=`<svg class="admch" viewBox="0 0 ${W} ${H+B}" role="img" aria-label="Zařízení za den, posledních 30 dní">
    ${[.5,1].map(f=>`<line x1="0" x2="${W}" y1="${H-H*f}" y2="${H-H*f}" class="grid"/><text x="0" y="${H-H*f-4}" class="ax">${Math.round(mx*f)}</text>`).join('')}<line x1="0" x2="${W}" y1="${H}" y2="${H}" class="base"/>
    ${days.map((d,i)=>{const g=U[d]?U[d].guests:0,m=U[d]?U[d].members:0,hg=g/mx*H,hm=m/mx*H,x=i*bw+bw*.18,w=bw*.64;
      return `<g class="hov"><title>${admDay(d,{weekday:'short',day:'numeric',month:'numeric'})}: ${g+m} zařízení (${g} bez účtu, ${m} s účtem)</title><rect x="${i*bw}" y="0" width="${bw}" height="${H}" fill="transparent"/>
        ${g?`<rect class="sg" x="${x}" y="${H-hg}" width="${w}" height="${Math.max(0,hg)}" rx="2"/>`:''}${m?`<rect class="sm" x="${x}" y="${H-hg-hm-(g?2:0)}" width="${w}" height="${Math.max(0,hm)}" rx="2"/>`:''}</g>`}).join('')}
    ${[0,14,29].map(i=>`<text x="${i*bw+bw/2}" y="${H+16}" class="ax" text-anchor="${i?i===29?'end':'middle':'start'}">${admDay(days[i])}</text>`).join('')}</svg>`;
  const smx=Math.max(1,...days.map(d=>S[d]||0));
  const signups=`<svg class="admch" viewBox="0 0 ${W} ${90+B}" role="img" aria-label="Nové účty za den, posledních 30 dní"><line x1="0" x2="${W}" y1="90" y2="90" class="base"/><text x="0" y="10" class="ax">${smx}</text>
    ${days.map((d,i)=>{const n=S[d]||0,h=n/smx*86;return `<g class="hov"><title>${admDay(d,{weekday:'short',day:'numeric',month:'numeric'})}: ${n} ${n===1?'nový účet':n>=2&&n<=4?'nové účty':'nových účtů'}</title><rect x="${i*bw}" y="0" width="${bw}" height="90" fill="transparent"/>${n?`<rect class="sm" x="${i*bw+bw*.18}" y="${90-h}" width="${bw*.64}" height="${h}" rx="2"/>`:''}</g>`}).join('')}
    ${[0,29].map(i=>`<text x="${i?W:0}" y="${90+16}" class="ax" text-anchor="${i?'end':'start'}">${admDay(days[i])}</text>`).join('')}</svg>`;
  const modes=Object.entries(MO).sort((a,b)=>b[1]-a[1]),mmx=Math.max(1,...modes.map(x=>x[1]));
  const modeBars=modes.length?`<div class="admbars">${modes.map(([k,n])=>`<div class="admbar" title="${esc(ADM_MODES[k]||k)}: ${n}×"><span>${esc(ADM_MODES[k]||k)}</span><i><b style="width:${n/mmx*100}%"></b></i><em>${n}</em></div>`).join('')}</div>`:'<p class="hint">Zatím žádná data.</p>';
  open(bar(0,'','‹ Home')+`<div class="adm" data-noi18n><div class="row"><h2>Admin</h2><button class="btn ghost" id="admre">↻ Obnovit</button></div>
    <p class="hint" style="margin:0">Data k ${new Date(D.now).toLocaleString('cs-CZ')}. Zařízení = kolik prohlížečů daný den aplikaci otevřelo (každý se započítá jednou denně).</p>
    <h3>Dnes a tento týden</h3>
    <div class="pstats admk">${kpi(dv(today),'zařízení dnes',U[today]?`${U[today].guests} bez účtu · ${U[today].members} s účtem`:'')}${kpi(v7,'zařízení·dní za 7 dní',`průměr ${(v7/7).toLocaleString('cs-CZ',{maximumFractionDigits:1})} denně`)}${kpi(v30,'zařízení·dní za 30 dní',`průměr ${(v30/30).toLocaleString('cs-CZ',{maximumFractionDigits:1})} denně`)}
      ${kpi(D.accounts,'účtů celkem',`${D.confirmed} s potvrzeným e-mailem`)}${kpi(n7,'nových účtů za 7 dní',`${n30} za 30 dní`)}${kpi(`${a1} / ${a7} / ${a30}`,'aktivních účtů','dnes / 7 dní / 30 dní')}
      ${kpi(reviews.toLocaleString('cs-CZ'),'opakování kartiček','součet všech účtů')}${kpi(tests.length,'zkušebních testů diktátu',tests.length?`průměr ${Math.round(sum(tests,t=>t.s)/tests.length)} %, splněno ${tests.filter(t=>t.s>=80).length}`:'')}</div>
    <h3>Zařízení za den <small>30 dní</small></h3><div class="admleg"><span><i class="sg"></i>bez účtu</span><span><i class="sm"></i>s účtem</span></div>${daily}
    ${firstUse?`<p class="hint">Počítáme od ${admDay(firstUse,{day:'numeric',month:'numeric',year:'numeric'})}.</p>`:'<p class="hint">Návštěvy se začnou počítat od chvíle, kdy spustíš supabase/admin.sql a lidé otevřou novou verzi aplikace.</p>'}
    <h3>Nové účty za den <small>30 dní</small></h3>${signups}
    <h3>Co lidé otevírají <small>30 dní, zařízení·dní</small></h3>${modeBars}
    <div class="row admuh"><h3>Uživatelé <small>${users.length}</small></h3><div class="admut"><input id="admq" type="search" placeholder="Hledat jméno nebo e-mail" aria-label="Hledat uživatele"><button class="btn ghost" id="admcsv">⤓ CSV</button></div></div>
    <div class="admtw"><table class="admt"><thead><tr>${[['name','Uživatel'],['email','E-mail'],['created','Registrace'],['act','Naposledy'],['known','Umí'],['week','Týden'],['streak','Série'],['total','Celkem'],['test','Diktát'],['lessons','Lekce']].map(([k,l])=>`<th><button data-sort="${k}">${l}</button></th>`).join('')}</tr></thead><tbody id="admtb"></tbody></table></div>
    <p class="hint">Umí = položky s intervalem 7+ dní, Týden = opakování za posledních 7 dní, Série = dny v řadě, Celkem = všechna opakování, Diktát = poslední zkušební test. Hosté bez účtu se v tabulce neobjevují, ti jsou jen v počtech zařízení.</p></div>`);
  let sk='created',dir=-1;
  const val=(u,k)=>k==='act'?act(u):k==='created'?+new Date(u.created):k==='test'?(Array.isArray(u.tests)&&u.tests.length?u.tests[u.tests.length-1].s:-1):k==='lessons'?(u.lessons||[]).length:k==='name'||k==='email'?String(u[k]||'').toLowerCase():(u[k]??-1);
  const rows=()=>{const q=$('admq').value.trim().toLowerCase();const list=users.filter(u=>!q||String(u.name||'').toLowerCase().includes(q)||String(u.email||'').toLowerCase().includes(q))
      .sort((a,b)=>{const x=val(a,sk),y=val(b,sk);return (x>y?1:x<y?-1:0)*dir});
    $('admtb').innerHTML=list.map(u=>{const t=Array.isArray(u.tests)&&u.tests.length?u.tests[u.tests.length-1]:null;
      return `<tr><td>${u.name?`${esc(u.avatar||'')} ${esc(u.name)}`:'<span class="muted">bez přezdívky</span>'}</td><td>${esc(u.email||'')}${u.confirmed?'':' <span class="admbad" title="E-mail není potvrzený">nepotvrzený</span>'}</td>
        <td>${new Date(u.created).toLocaleDateString('cs-CZ')}</td><td>${admAgo(act(u)||null)}</td><td>${u.known??'–'}</td><td>${u.week??'–'}</td><td>${u.streak??'–'}</td><td>${u.total??'–'}</td>
        <td>${t?`<span class="${t.s>=80?'pyok':'pybad'}">${t.s} %</span>`:'–'}</td><td>${Array.isArray(u.lessons)?esc(u.lessons.map(l=>l==='I'?'Ú':l).join(' ')):'–'}</td></tr>`}).join('')||'<tr><td colspan="10" class="muted">Nikdo neodpovídá.</td></tr>';
    M().querySelectorAll('[data-sort]').forEach(b=>b.setAttribute('aria-sort',b.dataset.sort===sk?(dir>0?'ascending':'descending'):'none'))};
  M().querySelectorAll('[data-sort]').forEach(b=>b.onclick=()=>{if(sk===b.dataset.sort)dir=-dir;else{sk=b.dataset.sort;dir=['name','email'].includes(sk)?1:-1}rows()});
  $('admq').oninput=rows;$('admre').onclick=()=>adminPage();
  $('admcsv').onclick=()=>{const head=['nickname','email','confirmed','created','last_active','known','learning','week','streak','total','last_test','lessons'];
    const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
    const csv=[head.join(','),...users.map(u=>[u.name,u.email,u.confirmed,u.created,act(u)?new Date(act(u)).toISOString():'',u.known,u.learning,u.week,u.streak,u.total,Array.isArray(u.tests)&&u.tests.length?u.tests[u.tests.length-1].s:'',(u.lessons||[]).join(' ')].map(q).join(','))].join('\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8'}));a.download='zi-you-later-users-'+todayStr()+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
  rows();
}
window.addEventListener('hashchange',()=>{if(location.hash==='#admin')adminPage()});
if(location.hash==='#admin')setTimeout(adminPage,0);

// before the account check has finished, a saved Supabase session means "probably signed in", so the flame does not blink
const likelyMember=()=>{if(cloudReady)return !!uid;try{return Object.keys(localStorage).some(k=>/^sb-.+-auth-token$/.test(k))}catch(e){return false}};
function streakVis(){const b=$('streak');if(b)b.hidden=SUPA_ON&&!likelyMember()}
