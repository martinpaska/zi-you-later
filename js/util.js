const $=id=>document.getElementById(id);
const M=()=>$('mode');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const short=s=>s.split(';')[0].trim();
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const isHan=c=>/[\u3400-\u9fff]/.test(c);

/* tones and pinyin */
const V='aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ';
const SYL=new RegExp(`(?:[zcs]h|[bpmfdtnlgkhjqxrzcsyw])?[${V}]+(?:ng(?![${V}])|n(?![${V}])|r(?![${V}]))?`,'gi');
const MK={};'āáǎàa ēéěèe īíǐìi ōóǒòo ūúǔùu ǖǘǚǜü'.split(' ').forEach(g=>{const base=g[4]==='ü'?'v':g[4];[...g].forEach((c,i)=>MK[c]=[base,i<4?i+1:0])});
const sylTone=s=>{for(const c of s)if(MK[c]&&MK[c][1])return MK[c][1];return 0};
function pyHtml(p){return esc(p).replace(SYL,m=>`<span class="t${sylTone(m)}">${m}</span>`)}
function tonesOf(x){return x.kind==='c'?[x.tone]:(x.p.replace(/\([^)]*\)/g,'').match(SYL)||[]).map(sylTone)}
const hz=x=>state.script==='t'?x.t:x.s;
function hzHtml(x){
  const s=hz(x),h=[...s].filter(isHan);let tn=tonesOf(x);
  if(x.kind==='w'&&/儿/.test(x.s)&&h.length===tn.length+1)tn=null;
  if(!tn||h.length!==tn.length)return esc(s);
  let i=0;return [...s].map(c=>isHan(c)?`<span class="t${tn[i++]}">${c}</span>`:esc(c)).join('');
}
function pyKey(s){
  s=s.toLowerCase().normalize('NFC').replace(/u:/g,'v');let base='',tones='';
  for(const c of s){if(MK[c]){base+=MK[c][0];if(MK[c][1])tones+=MK[c][1]}else if(/[1-4]/.test(c))tones+=c;else if(/[a-z]/.test(c))base+=c}
  return base+'|'+tones;
}
function pyForms(p){p=p.replace(/\([^)]*\)/g,'').trim();const syl=p.match(SYL)||[];if(!syl.length)return [p];
  const marks=syl.map(v=>v.toLowerCase()),nums=syl.map(v=>{let b='';for(const c of v.toLowerCase())b+=MK[c]?MK[c][0]:c;return b+(sylTone(v)||'')});
  return [...new Set([marks.join(''),marks.join(' '),nums.join(''),nums.join(' ')])]}
const pyOk=(input,x)=>{const k=pyKey(input);return [x.p.replace(/\([^)]*\)/g,''),x.p.replace(/[()]/g,'')].some(v=>pyKey(v)===k)};

function contour(t){
  const y=l=>26-(l-1)*5.5, P={1:[[4,5],[26,5]],2:[[4,3],[26,5]],3:[[4,2],[13,1],[26,4]],4:[[4,5],[26,1]]}[t];
  const guides=[1,2,3,4,5].map(l=>`<line x1="2" x2="28" y1="${y(l)}" y2="${y(l)}" stroke="currentColor" stroke-opacity=".14" stroke-width="1"/>`).join('');
  const mark=t?`<polyline points="${P.map(([x,l])=>x+','+y(l)).join(' ')}" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`
    :`<circle cx="15" cy="${y(2)}" r="3.4" fill="currentColor"/>`;
  return `<svg viewBox="0 0 30 30" aria-hidden="true">${guides}${mark}</svg>`;
}
const PEN='<svg class="pen" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 3.5l3 3L7 16H4v-3z"/><path d="M11.5 5.5l3 3"/></svg>';
const PLAY='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3.5v13l11-6.5z" fill="currentColor"/></svg>';
const bigClass=x=>x.kind==='c'?'big':'wordbig';
const kindLabel=x=>x.kind==='c'?'Character':x.proper?'Name':'Word';

