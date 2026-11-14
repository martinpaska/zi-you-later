const T2=DATA.t2;
const toTrad=s=>[...s].map(c=>T2[c]||c).join('');
/* meanings never show Chinese characters (e.g. "component of 咖啡"), so they can't give the answer away
   when the meaning is the prompt: the characters become pinyin ("component of kāfēi") */
{const py={},tr=w=>[...w].map(c=>DATA.t2[c]||c).join('');
  for(const [,t,s,p] of DATA.ch){py[t]=py[t]||p;py[s]=py[s]||p}
  for(const [,s,p] of DATA.wd){const w=s.replace(/\([^)]*\)/g,'');py[w]=p;py[tr(w)]=p}
  const fix=e=>e.replace(/[\u3400-\u9fff]+/g,w=>py[w]||[...w].map(c=>py[c]||c).join(''));
  for(const x of DATA.ch)x[6]=fix(x[6]);for(const x of DATA.wd)x[4]=fix(x[4])}
const CH=DATA.ch.map(([l,t,s,p,tone,syl,en])=>({kind:'c',l,t,s,p,tone,syl,en,k:'c:'+t+'|'+p}));
const WD=DATA.wd.map(([l,s,p,pos,en,kd])=>({kind:'w',l,s,t:toTrad(s),p,pos,en,proper:kd==='p',k:'w:'+s+'|'+p}));
const ST=DATA.st.map(([l,zh,py,en],i)=>({l:String(l),zh,py,en,id:i,zht:zh.map(toTrad)}));
const ALLITEMS=[...new Map([...CH,...WD].map(x=>[x.k,x])).values()];
/* resume: an unfinished Flashcards / Learn / Writing session is kept in this browser only, as item keys and where you
   were (a few kB at most), for 7 days or until you finish it, and offered on Home ("Continue where you left off") */
const RES_KEY='ic-resume',RES_MODES={cards:'Flashcards',learn:'Learn',write:'Writing'},BYK=new Map(ALLITEMS.map(x=>[x.k,x]));
const fromK=a=>(a||[]).map(k=>BYK.get(k)).filter(Boolean),kOf=a=>a.map(x=>x.k);
function resAll(){const r=store.get(RES_KEY,{})||{};let ch=false;for(const m in r)if(!RES_MODES[m]||!r[m]||Date.now()-r[m].t>7*864e5){delete r[m];ch=true}if(ch)store.set(RES_KEY,r);return r}
function resSave(m,d){const r=resAll();r[m]={...d,t:Date.now(),sel:[...state.sel],set:state.set,filter:state.filter||'all'};store.set(RES_KEY,r)}
function resClear(m){const r=resAll();if(r[m]){delete r[m];store.set(RES_KEY,r)}}
function resume(m){const r=resAll()[m];if(!r)return;state.sel=new Set(r.sel);state.set=r.set;state.filter=r.filter;saveState();
  if(m==='cards')cards(fromK(r.k),fromK(r.r),r);else if(m==='learn')learn(r);else if(m==='write')write(null,r)}
const BYKEY=new Map(ALLITEMS.map(x=>[x.k,x]));
const LESSONS=PACK==='hsk1'?HSK1.meta.lessons.map(x=>x.l):['I','1','2','3','4','5','6','7','8','9','10'];
const LNAME=l=>l==='I'?'Intro':'Lesson '+l;
const LZH=PACK==='hsk1'?Object.fromEntries(HSK1.meta.lessons.map(x=>[x.l,x.zh])):{I:'入门',1:'问好',2:'家庭',3:'时间',4:'爱好',5:'看朋友',6:'约时间',7:'学中文',8:'学校生活',9:'买东西',10:'交通'};
const LTITLE=PACK==='hsk1'?Object.fromEntries(HSK1.meta.lessons.map(x=>[x.l,x.en])):{I:'Basics',1:'Greetings',2:'Family',3:'Dates and Time',4:'Hobbies',5:'Visiting Friends',6:'Making Appointments',7:'Studying Chinese',8:'School Life',9:'Shopping',10:'Transportation'};
const TONE={1:'high and level',2:'rising',3:'low, dipping',4:'falling',0:'light, unstressed'};
const TLABEL=t=>t?'Tone '+t:'Neutral tone';
// Characters with several readings: speak a homophone so the speech engine says the reading taught here.
const ALT={長:'常',還:'孩',覺:'绝',空:'控',便:'变',假:'架',舍:'社',漂:'票',為:'位',地:'第',只:'纸',行:'型',種:'肿',都:'兜',喂:'围',個:'各',囗:'围',糸:'密',幺:'腰',隹:'追',什:'神',校:'笑',間:'尖',節:'洁',片:'骗',興:'杏',教:'交',樂:'月',場:'厂',宿:'素',和:'河'};
