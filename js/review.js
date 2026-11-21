/* ---------- Review (spaced repetition) ----------
   Today's review: every card that is due (the longest-waiting first), with a new card mixed in after every three.
   It runs as Flashcards (cards() with rv): tap to flip, Know / Still learning or a swipe, rounds of 15.
   Know and Still learning set when a card comes back (see grade() and rate() in state.js). */
function review(){
  const due=dueAll().sort((a,b)=>rec(a).d-rec(b).d),nw=newAvail();
  const q=[];let di=0,ni=0;while(di<due.length||ni<nw.length){for(let k=0;k<3&&di<due.length;k++)q.push(due[di++]);if(ni<nw.length)q.push(nw[ni++])}
  if(!q.length){
    const tomorrow=ALLITEMS.filter(x=>{const r=rec(x);return r&&r.n&&r.d<=Date.now()+DAY}).length;
    open(bar(100,'done')+`<div class="card"><p class="eyebrow">Review complete</p><span class="score">${stats.rev}</span><p>cards reviewed today: ${stats.rev}. Streak: ${stats.streak} ${stats.streak===1?'day':'days'}.</p>
      <p class="hint">About ${tomorrow} cards will be due by tomorrow.</p>
      <div class="btns"><button class="btn ghost" data-home>‹ Home</button><button class="btn" id="more">Learn 10 more new</button></div></div>`);
    $('more').onclick=()=>{stats.extra=(stats.extra||0)+10;saveSrs();review()};
    if(!basePool().some(x=>!seen(x)))$('more').disabled=true;
    return;
  }
  cards(...roundOf(q),null,true);   // the review looks and works like Flashcards
}
