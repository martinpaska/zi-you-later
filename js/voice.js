/* audio: characters and words play from a native speaker's syllable recordings; sentences use the best device voice */
let voice=null,voices=[];
const vScore=v=>{const n=v.name,l=v.lang||'';let s=0;
  if(/^zh[-_]?CN/i.test(l)||/cmn/i.test(l))s+=40;else if(/^zh/i.test(l)&&!/HK|yue/i.test(l))s+=20;else if(/^zh/i.test(l))s+=5;else return -1;
  if(/natural|neural|online/i.test(n))s+=30;if(/xiaoxiao|yunxi|xiaoyi|yunjian/i.test(n))s+=12;if(/google/i.test(n))s+=18;if(/tingting|lili|meijia|yu-shu|enhanced|premium/i.test(n))s+=10;
  if(!v.localService)s+=2;return s};
function pickVoice(){
  if(!('speechSynthesis' in window))return;
  voices=speechSynthesis.getVoices().filter(v=>vScore(v)>=0).sort((a,b)=>vScore(b)-vScore(a));
  const all=speechSynthesis.getVoices();
  voice=(state.voice&&voices.find(v=>v.name===state.voice))||all.find(x=>/^zh[-_]CN/i.test(x.lang))||all.find(x=>/^zh/i.test(x.lang)&&!/HK|TW/i.test(x.lang))||all.find(x=>/^zh/i.test(x.lang))||null;
}
