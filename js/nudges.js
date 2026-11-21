/* ---------- Sign-up reminders for people without an account: a card on Home once they have some progress,
   and one line under a result (at most once a day). Accounts add sync and the leaderboard, never access, so
   every reminder can be closed: after closing it comes back in 4 days, then 10, and after the third time never. ---------- */
const NUDGE_SVG='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 9.5a4 4 0 0 1-.5 8.5z"/><path d="M12 11v5M9.5 13.5 12 11l2.5 2.5"/></svg>';
const isGuest=()=>SUPA_ON&&cloudReady&&!uid;
function nudgeState(){return store.get('ic-nudge',{n:0,until:0,day:''})}
function nudgeHome(){
  const box=$('nudge');if(!box)return;const s=nudgeState();
  if(!isGuest()||stats.total<15||s.n>=3||Date.now()<s.until){box.innerHTML='';return}
  box.innerHTML=`<section class="nudge" aria-labelledby="nuh"><div class="nutop"><span class="nuic">${NUDGE_SVG}</span><div><h2 id="nuh">Join the others</h2>
      <p class="nusum">With an account you see your streak of days and the class leaderboard, and your progress is on all your devices.</p></div>
      <button class="nux" id="nux" type="button" aria-label="Not now">×</button></div>
    <div class="nubtns"><button class="btn ghost nucta" data-go="account">Create account</button><button class="btn ghost" id="nulater">Not now</button></div></section>`;
  const later=()=>{const s=nudgeState(),n=s.n+1;store.set('ic-nudge',{...s,n,until:Date.now()+(n===1?4:10)*DAY});box.innerHTML=''};
  $('nux').onclick=later;$('nulater').onclick=later;
}
// under every finished round's result, for every guest
function nudgeEnd(){
  if(!isGuest())return;
  const sc=M().querySelector('.card .score');if(!sc)return;const card=sc.closest('.card');if(!card||M().querySelector('.nuend'))return;
  card.insertAdjacentHTML('afterend',`<div class="nuend"><span class="nuic">${NUDGE_SVG}</span><p>Want to see your streak and be on the leaderboard? Create an account.</p><button class="btn ghost nucta" data-go="account">Create account</button></div>`);
}

