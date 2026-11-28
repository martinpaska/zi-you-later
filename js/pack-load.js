/* HSK 2 and up are not part of the startup scripts: a level's data (packs/hsk<N>.js, built by hsk/build.py) is written into
   the page here, only when that course is the chosen one, so it runs right after this file and before packs.js. Everyone
   else downloads none of it. If the file cannot be loaded (offline before it was ever cached), packs.js falls back to Chinese 1. */
const PACK_DATA={hsk1:HSK1};
const LAZY_PACKS=['hsk2','hsk3'];
{let p=null;try{p=(JSON.parse(localStorage.getItem('ic-state'))||{}).pack}catch(e){}
  if(LAZY_PACKS.includes(p))document.write('<script src="packs/'+p+'.js"><\/script>')}
