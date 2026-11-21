/* ---------- question helpers ---------- */
function mcOptions(x,type){return shuffle([x,...distract(x,3,type==='mean'?y=>short(y.en):y=>hz(y))])}
function qHead(x,type){
  // the question reads top to bottom: what you look at, then the question, then the answers
  if(type==='mean')return `<span class="${bigClass(x)} han">${hz(x)}</span><p class="qask">What does this mean?</p>`;
  if(type==='char')return `<p class="qask">Which one means:</p><p class="meaning" style="font-size:1.5rem;font-weight:700">${esc(x.en)}</p>`;
  if(type==='audio')return `<p class="qask">Which one do you hear?</p><button class="play huge" data-say>${PLAY}Play</button>`;
  if(type==='pinyin')return `<span data-nosay class="${bigClass(x)} han">${hz(x)}</span><p class="hint" style="margin:0">${esc(x.en)}</p><p class="qask">Type the pinyin with tones</p>`;
}
function optsHtml(x,type,opts,numbered=true){
  if(type==='mean')return `<div class="opts">${opts.map((y,i)=>`<button class="opt" data-i="${i}">${numbered?`<kbd>${i+1}</kbd>`:''}${esc(short(y.en))}</button>`).join('')}</div>`;
  return `<div class="opts chars">${opts.map((y,i)=>`<button class="opt" data-i="${i}"><span class="han" ${y.kind==='w'?'style="font-size:1.5rem"':''}>${hz(y)}</span><small></small></button>`).join('')}</div>`;
}
const typeHtml=id=>`<div class="typein"><input id="${id}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="e.g. mei3 or měi" aria-label="Pinyin"></div><p class="hint">Type tones as numbers 1–4 (leave neutral tones without a number), and ü as v.</p>`;
function revealChars(box,opts){box.querySelectorAll('.opt small').forEach((s,i)=>s.innerHTML=pyHtml(opts[i].p))}

