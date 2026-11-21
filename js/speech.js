/* audio: the whole app speaks with one voice, the device's Chinese voice, at one speed (Settings › Sound).
   slow: a slower replay (0.65 × the speed). The utterance is kept in a variable so the browser does not
   drop it half-way (Safari can cut speech short when the object is garbage-collected). */
let UTT=null,LASTSAY={t:'',at:0};
function sayText(t,slow){
  if(!('speechSynthesis' in window)||!t)return;
  // one tap can reach two handlers (a row and the tap-to-hear on its characters): the second would cut the first off
  const now=Date.now();if(t===LASTSAY.t&&now-LASTSAY.at<400&&!slow)return;LASTSAY={t,at:now};
  const u=new SpeechSynthesisUtterance(t);u.lang='zh-CN';if(voice)u.voice=voice;u.rate=(state.rate||.8)*(slow?.65:1);
  UTT=u;u.onend=u.onerror=()=>{if(UTT===u)UTT=null};
  speechSynthesis.cancel();speechSynthesis.speak(u);
}
function stopAudio(){HT_PLAY=null;try{speechSynthesis.cancel()}catch(e){}UTT=null}
// a character with several readings is read through a homophone (ALT) so the voice says the reading taught here
function speak(x){sayText(x.kind==='c'?(ALT[x.t]||x.s):x.s.replace(/[()…]/g,''))}
function speakSent(s){sayText(s.zh.join(''))}
// pinyin of a word or phrase split into syllables (used by writing and the tone exercises)
const sylsOf=p=>p.replace(/[()…]/g,' ').match(SYL)||[];
/* tap any Chinese text to hear it, except where the sound would give away the answer or the element already plays */
const BYHAN=new Map();for(const x of [...WD,...CH])for(const k of [x.s.replace(/[()…]/g,''),x.t.replace(/[()…]/g,'')])if(!BYHAN.has(k))BYHAN.set(k,x);
document.addEventListener('click',e=>{
  const h=e.target.closest&&e.target.closest('.han');if(!h||h.closest('[data-nosay],.opt,.tbtn,.cell,#card,.mt,[data-rk],[data-ss],.lesson,.acct,.seal,.wbox,.tdiff,.wsheet .wprompt'))return;
  const t=[...h.textContent].filter(c=>isHan(c)||isPunct(c)).join('');if(!t.replace(/[，。？！、,.?!]/g,''))return;
  const x=BYHAN.get(t);x?speak(x):sayText(t);
});
document.addEventListener('click',e=>{const b=e.target.closest('[data-ss]');if(b){e.stopPropagation();speakSent(SENTS.get(b.dataset.ss))}},true);

