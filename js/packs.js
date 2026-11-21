/* course packs: Chinese 1 (Integrated Chinese 1/1, FF MUNI) and HSK 1. The active one decides the data of every mode;
   progress is kept per character and word, so what you know in one pack counts in the other too. */
const PACKS=[{id:'cin1',n:'Chinese 1',s:'Chin. 1',d:'Integrated Chinese 1/1 · FF MUNI',zh:'中文一'},{id:'hsk1',n:'HSK 1',s:'HSK 1',d:'New HSK, from July 2026 · meanings in English',zh:'汉语水平考试'}];
const PACK=(()=>{try{const p=(JSON.parse(localStorage.getItem('ic-state'))||{}).pack;return p==='hsk1'&&HSK1?'hsk1':'cin1'}catch(e){return 'cin1'}})();
const DATA=PACK==='hsk1'?{...HSK1,t2:{...DATA_CIN1.t2,...HSK1.t2}}:DATA_CIN1;
