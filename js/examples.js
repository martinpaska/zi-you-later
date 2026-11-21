const keyOf=x=>x.s.replace(/\(.*?\)/g,'').split('…')[0];
/* extra short example sentences (examples.json, built from examples/l1.txt … l10.txt), loaded in the background */
let EX=[];const SENTS=new Map(ST.map(s=>[String(s.id),s]));
if(PACK!=='hsk1')fetch('examples.json').then(r=>r.json()).then(a=>{EX=a.map(([l,zh,py,en],i)=>({l:String(l),zh,py,en,id:'x'+i,zht:zh.map(toTrad),ex:true}));EX.forEach(s=>SENTS.set(s.id,s))}).catch(()=>{});
function examples(x,n=2){
  const w=keyOf(x);if(!w)return [];
  // same lesson first, then later lessons, then earlier ones; within that the shortest sentences first
  const dist=s=>ORD(s.l)>=ORD(x.l)?ORD(s.l)-ORD(x.l):99+ORD(x.l)-ORD(s.l);
  const seen=new Set();
  return ST.concat(EX).filter(s=>{const z=s.zh.join('');if(!z.includes(w)||seen.has(z))return false;seen.add(z);return true}).sort((a,b)=>dist(a)-dist(b)||a.zh.join('').length-b.zh.join('').length).slice(0,n);
}
const example=x=>examples(x,1)[0]||null;
// o: {max: only sentences of at most this many characters, heading: false for no "Example" heading, tag: false for no lesson tag, cls: an extra class}
function exampleHtml(x,n=2,o={}){
  let list=examples(x,o.max?12:n);if(o.max)list=list.filter(s=>s.zh.join('').length<=o.max).slice(0,n);if(!list.length)return '';
  const w=hz(x).replace(/\(.*?\)/g,'').split('…')[0];
  // one "Examples" heading, then each sentence with a small lesson tag
  return `<div class="ex exs${o.cls?' '+o.cls:''}">${o.heading===false?'':`<span class="eyebrow">${list.length>1?'Examples':'Example'}</span>`}${list.map(s=>{const zh=sentHz(s).join('');
    return `<div class="exi"><div class="row"><span class="zh han">${esc(zh).split(esc(w)).join(`<mark>${esc(w)}</mark>`)}</span>${o.span?`<span class="play iconplay" role="button" data-ss="${s.id}" aria-label="Play sentence">${PLAY}</span>`:`<button class="play" data-ss="${s.id}" aria-label="Play sentence">${PLAY}</button>`}</div><span class="pyl">${pyHtml(s.py.join(' ').replace(/ ([,.?!])/g,'$1'))}</span><span class="en">${esc(s.en)}${o.tag===false?'':` <span class="exl">${LNAME(s.l)}</span>`}</span></div>`}).join('')}</div>`;
}
// Other textbook words that share a character with this item, in lesson order.
function related(x){
  const cs=new Set([...x.s].filter(isHan));
  return WD.filter(w=>w.k!==x.k&&keyOf(w)!==keyOf(x)&&[...w.s].some(c=>cs.has(c))).sort((a,b)=>ORD(a.l)-ORD(b.l)).slice(0,14);
}
function relatedHtml(x){
  const r=related(x);if(!r.length)return '';
  const cur=Math.max(...[...state.sel].map(ORD),ORD(x.l));
  return `<div class="ex"><span class="eyebrow">${x.kind==='c'?'Words with this character':'Related words'}${r.some(w=>ORD(w.l)>cur)?' · faded = later lesson':''}</span><div class="rel">${r.map(w=>`<button class="relw${ORD(w.l)>cur?' later':''}" data-rk="${esc(w.k)}"><span class="han">${hzHtml(w)}</span><small>${pyHtml(w.p)} · ${esc(short(w.en))} · L${w.l}</small></button>`).join('')}</div></div>`;
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-rk]');if(b){e.stopPropagation();speak(BYKEY.get(b.dataset.rk))}},true);

