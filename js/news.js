/* ---------- What's new: a short note shown once after an update (never on a first visit).
   Add a new entry at the top of NEWS with each release that people would notice. ---------- */
/* id: a new id makes the sheet open once after the update; d: the real date shown on the card; t: title.
   The newest entry is the big card on top: art (a home tile's picture), what, where, go (what "Try it" opens). */
const NEWS=[
  {id:'2026-11-27',d:'2026-11-27',t:'Your path, step by step',go:()=>album(),
    what:'Every lesson on Your path is now split into short units of about 5 new words, with mixed exercises, like in a language game.',
    where:'Home › Your path',
    items:['One unit takes 3 to 5 minutes: meet the new words, then choose, listen, type the pinyin, fill in the tones, match pairs, build sentences and write characters. Mistakes come back at the end.',
      'Units open one after another. Grammar units come between the words, then a lesson review and the Final test, which stamps the seal as before.',
      'Play a finished unit again at level 2 and 3 (gold): fewer hints, more typing and writing from memory.',
      'Know a lesson already? Pass its Final test to skip straight to it. What you have learnt so far counts: units with words you know are done.',
      'Each lesson has its own old Chinese ink landscape from The Metropolitan Museum of Art (public domain), shown whole while you scroll.',
      'New words are taught two at a time, a mistake comes back a few exercises later, and after a unit you can practise its mistakes.']},
  {id:'2026-11-21',d:'2026-11-21',t:"Today’s review as flashcards",art:'cards',go:()=>review(),
    what:"The cards to review today now look and work like Flashcards: tap to flip, then say how well you remembered it: Again, Hard, Good or Easy.",
    where:"Home › Cards to review today",
    items:["Rounds of 15. After each round you see the cards you did not know and can go over them again, or go on with the next round.", "Each button shows when the card comes back. Swipe right for Good, left for Again; keys 1–4 work too."]},
  {id:'2026-11-15',d:'2026-11-10',t:'Album of seals for Chinese 1',go:()=>album(),
    what:'Chinese 1 now has its own seals: one for the Intro and each of Lessons 1–10, on Home under Your path, in place of the Learn tile.',
    where:'Home › Your path',
    items:['Every lesson has a seal that fills with ink as you learn it. Open it to see the steps: new words, flashcards, tones, the textbook grammar, sentences, writing and the Final test.','Pass the Final test with 80 % to stamp the seal. Learn is still there, as the first step of every lesson.']},
  {id:'2026-11-14',d:'2026-11-10',t:'HSK 1 practice test',go:()=>hskTest(),
    what:'Two practice tests of 40 questions in the format of the official HSK 1 test: listening and reading, with pinyin.',
    where:'Home › HSK 1 practice test',
    items:['Listening, 4 parts: pictures, replies, dialogues and short talks. Every recording plays twice, the woman and the man in different voices.','Reading, 4 parts: pictures, replies, words for the gaps and short texts, with a 20-minute clock.','The answers are checked at the end. You see your score for each part and every mistake with the right answer.']},
  {id:'2026-11-13',d:'2026-11-10',t:'New course: HSK 1',go:()=>packSheet(),
    what:'Switch between courses at the top of Home: Chinese 1 (the textbook) or HSK 1, the new HSK from July 2026, in 15 lessons from the official syllabus.',
    where:'Home › Course',
    items:['New course HSK 1: the 300 words and 246 characters of the new HSK level 1 (official syllabus, valid from July 2026), in 15 lessons following its communicative tasks. Meanings in English.',
      'Switch courses at the top of Home. What you know counts in both: a word learnt in one course is known in the other too.',
      'Your path in HSK 1: every lesson has a seal that fills with ink as you learn it. Open a lesson to see its steps, and pass its Final test (80 %) to stamp the seal into your album.',
      'Grammar for HSK 1: the 35 points of the official HSK 1 grammar list, each with examples and exercises, and 235 sentences to build, translate and listen to. A practice test in the HSK 1 format comes next.']},
  {id:'2026-11-12',d:'2026-11-06',t:'Chinese Phonetics – test, now in Courses',art:'pinyin',go:()=>phonetics(),
    what:'The pinyin dictation is now called Chinese Phonetics – test and sits in Courses, next to Chinese Grammar I. Everything inside is the same, your results too.',
    where:'Home › Courses › Chinese Phonetics – test',
    items:['Čínský diktát is now Chinese Phonetics – test, in Courses next to Chinese Grammar I.']},
  {id:'2026-11-11',d:'2026-11-06',t:'Characters and search in the Vocabulary list',art:'vocab',go:()=>vocab(),
    what:'Every character of the Character Workbook is now in the Vocabulary list, lesson by lesson, with the words you can read with it. And you can search every lesson by character, pinyin or meaning.',
    where:'Home › Practise › Vocabulary list',
    items:['The Vocabulary list shows each lesson’s characters from the Character Workbook first, then its words. Intro has its own tab with the 50 basic characters.',
      'Under each character: the words of this and earlier lessons that use it. Tap one to hear it.',
      'Search over every lesson: a character (中), pinyin with or without tones (zhongguo, zhong1guo2, zhōngguó) or an English word (China).']},
  {id:'2026-11-10',d:'2026-11-06',t:'One voice everywhere',
    what:'Characters, words, sentences, grammar and dictation are now all read by the same voice, smoothly, without cut-off endings. Pick the voice and its speed once.',
    where:'Settings › Sound',go:()=>settings(),
    items:['One voice for the whole app: your device’s Chinese voice reads everything, at one speed you set in Settings › Sound.',
      'Words are no longer joined from single syllables, so they sound smooth and nothing is cut short.',
      'The syllable recordings and the Device voice / Recordings switches are gone.']},
  {id:'2026-11-09',d:'2026-11-06',t:'Seminar 5 follows the slides',art:'gram1',go:()=>gram1('S5'),
    what:'Chinese Grammar I, seminar G5 now follows the seminar presentation: the verb suffix 了 in detail, 一下 and 一点儿, 在 and 有, the preposition 在 and 吧.',
    where:'Home › Courses › Chinese Grammar I › G5',
    items:['Seminar G5 follows the seminar slides, with much more on 了: where it goes, the object, two verbs, sentences with two actions, questions.',
      'Vocabulary is now called Vocabulary list.','Courses moved to the bottom of Home.','What’s new looks like this now, and you can open it any time in Settings.']},
  {id:'2026-11-08',d:'2026-11-05',t:'Courses',items:['New section Courses on Home, with Chinese Grammar I (the seminars G1–G10).']},
  {id:'2026-11-07',d:'2026-11-05',t:'Chinese Grammar I',items:['Grammar 1 and the course seminars G1–G10: a summary of each seminar with examples, and 20 practice sentences per seminar using only textbook words.']},
  {id:'2026-11-06',d:'2026-11-05',t:'A native speaker and simpler setup',items:[
    'Characters and words are now read by a native speaker by default. You can switch back in Settings › Sound.',
    'Simpler setup: Flashcards and Writing have one row of options.',
    'The leaderboard has a single ranking: cards reviewed in the last 7 days, so newcomers can reach the top too.']},
  {id:'2026-11-05c',d:'2026-11-05',t:'Continue where you left off',items:[
    'Continue where you left off: an unfinished Flashcards, Learn or Writing session waits on Home for 7 days. Only the words and your place are kept, a few kB in this browser.']},
  {id:'2026-11-05b',d:'2026-11-05',t:'Starred words',items:[
    'Starred words: tap ★ next to any word in the vocabulary list. The ★ tab lists them all, and from there you can practise just those with Flashcards, Learn, Writing or Match.']},
  {id:'2026-11-05',d:'2026-11-05',t:'Vocabulary list',items:[
    'Vocabulary list: every word of each lesson in one list. Switch lessons at the top, hide the pinyin or the meaning to test yourself.',
    'Čínský diktát and Recordings now use a native speaker. Faulty recordings are gone and syllables in words are no longer cut short.',
    'Minimal pairs was removed; Čínský diktát covers the same practice.']}];
const PIN='<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 18s-5.5-5.2-5.5-9.5a5.5 5.5 0 0 1 11 0C15.5 12.8 10 18 10 18z"/><circle cx="10" cy="8.5" r="2"/></svg>';
const newsDate=d=>{try{return new Date(d+'T12:00').toLocaleDateString(LANG==='cs'?'cs-CZ':'en-GB',{day:'numeric',month:LANG==='cs'?'long':'short'})}catch(e){return d}};
/* the sheet opens by itself once after an update (never on a first visit), and any time from Settings or the footer */
function whatsNew(force){
  if(!force){const k=NEWS.findIndex(x=>x.id===store.get('ic-news',null));if(k===0)return}
  store.set('ic-news',NEWS[0].id);if(document.querySelector('.nsheet'))return;
  const h=NEWS[0],art=h.art?modeArt(h.art):'';
  const saved=keyHandler,sh=document.createElement('div');sh.className='nsheet';
  sh.innerHTML=`<div class="npanel" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="nwt"><div class="nhead"><span class="ngrab" aria-hidden="true"></span>
    <button class="nclose" id="nwx" type="button">${T_('Close')}</button><h2 id="nwt">${T_("What's new")}</h2><span></span></div>
    <div class="nbody"><article class="ncard nhero">${art?`<div class="nart">${art}</div>`:''}<span class="nbadge">${T_('New')}</span><h3>${esc(T_(h.t))}</h3>
      <p class="nwhat">${esc(T_(h.what))}</p>${h.where?`<p class="nwhere">${PIN}<span>${esc(T_(h.where))}</span></p>`:''}${h.go?`<button class="btn" id="nwgo">${T_('Try it')}</button>`:''}</article>
    ${(()=>{const card=x=>`<article class="ncard"><p class="ndate">${esc(newsDate(x.d))}</p><h3>${esc(T_(x.t))}</h3><ul>${x.items.map(t=>`<li>${esc(T_(t))}</li>`).join('')}</ul></article>`,N=5;
      return NEWS.slice(0,N).map(card).join('')+(NEWS.length>N?`<details class="more nolder"><summary><span>${esc(T_('Older news'))} <span class="gcnt">${NEWS.length-N}</span></span></summary><div class="nold">${NEWS.slice(N).map(card).join('')}</div></details>`:'')})()}</div></div>`;
  document.body.appendChild(sh);document.body.style.overflow='hidden';sheetFocus(sh);
  const panel=sh.querySelector('.npanel');setTimeout(()=>panel.focus({preventScroll:true}),20);
  const close=()=>{if(!sh.isConnected)return;keyHandler=saved;document.body.style.overflow='';
    if(MOTION){sh.classList.add('out');setTimeout(()=>sh.remove(),220)}else sh.remove();if(sh._back&&sh._back.focus)sh._back.focus()};
  sh.onclick=e=>{if(e.target===sh)close()};$('nwx').onclick=close;
  if($('nwgo'))$('nwgo').onclick=()=>{close();h.go()};
  keyHandler=e=>{if(e.key==='Escape'){e.preventDefault();close()}};
  // drag the top of the sheet down to close it, like a phone sheet
  const hd=sh.querySelector('.nhead');let y0=null,dy=0;
  hd.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;y0=e.clientY;dy=0;hd.setPointerCapture(e.pointerId);panel.style.transition='none'});
  hd.addEventListener('pointermove',e=>{if(y0==null)return;dy=Math.max(0,e.clientY-y0);panel.style.transform=`translateY(${dy}px)`});
  const up=()=>{if(y0==null)return;y0=null;panel.style.transition='';if(dy>90)close();else panel.style.transform=''};
  hd.addEventListener('pointerup',up);hd.addEventListener('pointercancel',up);
}
document.addEventListener('click',e=>{if(e.target.closest('[data-news]'))whatsNew(true)});
if(store.get('ic-welcomed',false)){renderHome();setTimeout(whatsNew,700)}else{store.set('ic-news',NEWS[0].id);welcome()}
setTimeout(initCloud,0);

