/* audio: the whole app speaks with one voice, the device's Chinese voice, at one speed (Settings › Sound).
   slow: a slower replay (0.65 × the speed). The utterance is kept in a variable so the browser does not
   drop it half-way (Safari can cut speech short when the object is garbage-collected). */
let UTT=null,LASTSAY={t:'',at:0};
/* iPhone/iPad silent switch: iOS mutes speechSynthesis (and Web Audio) when the ring/silent switch is on, while an
   <audio> element plays in the "playback" session, which the switch does not mute. So on iOS/iPadOS only (iPadOS reports
   itself as a Mac with touch) the app asks for the playback session and keeps a tiny looping clip of true silence playing
   from the first tap; speech then plays in silent mode too. The clip is paused when the page is hidden (no media control
   is left behind) and started again on the next tap or before the next sentence. No MediaSession metadata is set. */
const IOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
let SILENT=null;
function silentClip(){
  // 0.5 s of 8-bit mono silence at 8 kHz as a WAV file, made here so no extra file has to be downloaded or cached
  const n=4000,b=new Uint8Array(44+n).fill(128),v=new DataView(b.buffer),w=(o,t)=>{for(let i=0;i<t.length;i++)b[o+i]=t.charCodeAt(i)};
  w(0,'RIFF');v.setUint32(4,36+n,true);w(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);
  v.setUint32(24,8000,true);v.setUint32(28,8000,true);v.setUint16(32,1,true);v.setUint16(34,8,true);w(36,'data');v.setUint32(40,n,true);
  const a=new Audio(URL.createObjectURL(new Blob([b],{type:'audio/wav'})));
  a.loop=true;a.preload='auto';a.setAttribute('playsinline','');a.setAttribute('webkit-playsinline','');a.setAttribute('x-webkit-airplay','deny');a.disableRemotePlayback=true;
  return a;
}
function unmuteIOS(){
  if(!IOS||document.hidden)return;
  try{if(navigator.audioSession&&navigator.audioSession.type!=='playback')navigator.audioSession.type='playback'}catch(e){}
  try{if(!SILENT)SILENT=silentClip();if(SILENT.paused){const p=SILENT.play();if(p&&p.catch)p.catch(()=>{})}}catch(e){}
}
if(IOS){
  try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}
  for(const ev of ['touchend','pointerup','click','keydown'])document.addEventListener(ev,unmuteIOS,{capture:true,passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&SILENT)try{SILENT.pause()}catch(e){}});
  addEventListener('pagehide',()=>{if(SILENT)try{SILENT.pause()}catch(e){}});
}
function sayText(t,slow){
  if(!('speechSynthesis' in window)||!t)return;
  // one tap can reach two handlers (a row and the tap-to-hear on its characters): the second would cut the first off
  const now=Date.now();if(t===LASTSAY.t&&now-LASTSAY.at<400&&!slow)return;LASTSAY={t,at:now};
  const u=new SpeechSynthesisUtterance(t);u.lang='zh-CN';if(voice)u.voice=voice;u.rate=(state.rate||.8)*(slow?.65:1);
  UTT=u;u.onend=u.onerror=()=>{if(UTT===u)UTT=null};
  unmuteIOS();speechSynthesis.cancel();speechSynthesis.speak(u);
}
function stopAudio(){HT_PLAY=null;try{speechSynthesis.cancel()}catch(e){}UTT=null}
// a character with several readings is read through a homophone (ALT) so the voice says the reading taught here
// two entries with the same writing and a different reading (得 de / děi) would be said alike by the voice: each is said through a text
// that is read the way it is meant (的 is read de; 得去 is read děi qù). A test makes sure no two entries that are written alike sound alike.
const SAYAS={'w:得|de':'的','w:得|děi':'得去'};
const said=x=>SAYAS[x.k]||(x.kind==='c'?(ALT[x.t]||x.s):x.s.replace(/[()…]/g,''));
function speak(x){sayText(said(x))}
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

