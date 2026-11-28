/* course packs: Chinese 1 (Integrated Chinese 1/1, FF MUNI) and the new HSK, levels 1–3. The active one decides the data of
   every mode; progress is kept per character and word, so what you know in one pack counts in the others too.
   c: characters, words and lessons of a pack, for the course list (HSK 2 and up are not loaded unless chosen). */
const PACKS=[{id:'cin1',n:'Chinese 1',s:'Chin. 1',d:'Integrated Chinese 1/1 · FF MUNI',zh:'中文一'},
  {id:'hsk1',n:'HSK 1',s:'HSK 1',d:'New HSK, from July 2026 · meanings in English',zh:'汉语水平考试',c:[246,300,15]},
  {id:'hsk2',n:'HSK 2',s:'HSK 2',d:'New HSK, level 2 · builds on HSK 1',zh:'汉语水平考试',c:[125,199,17]},
  {id:'hsk3',n:'HSK 3',s:'HSK 3',d:'New HSK, level 3 · builds on HSK 1 and 2',zh:'汉语水平考试',c:[284,500,22]}];
const PACK=(()=>{try{const p=(JSON.parse(localStorage.getItem('ic-state'))||{}).pack;return PACK_DATA[p]?p:'cin1'}catch(e){return 'cin1'}})();
const HSK=PACK_DATA[PACK]||null;   // the chosen HSK level's data (null in Chinese 1)
const HSK_LV=HSK?+PACK.slice(3):0;
// the words of a level may appear in the sentences of the levels above it: their traditional forms come along
const DATA=HSK?{...HSK,t2:{...DATA_CIN1.t2,...HSK1.t2,...HSK.t2}}:DATA_CIN1;
// HSK 2 and up: the characters that the main font does not have are in a font of their own (fonts/build_font.py), checked
// first; a character it lacks falls through to fonts/ziyoukai.woff2. HSK 1 and Chinese 1 never download it.
if(HSK_LV>1&&self.FontFace&&document.fonts)for(const f of ['ZiYou Kai','ZiYou Han'])
  try{document.fonts.add(new FontFace(f,`url(fonts/ziyoukai-${PACK}.woff2) format("woff2")`,{display:'swap',unicodeRange:'U+3400-4DBF,U+4E00-9FFF'}))}catch(e){}
// so that the course works offline later, its grammar exercises and stroke data are fetched (and cached) soon after startup
if(HSK_LV>1)addEventListener('load',()=>setTimeout(()=>{for(const u of [`packs/${PACK}-grammar.json`,`packs/${PACK}-strokes.json`])fetch(u).catch(()=>{})},4000));
