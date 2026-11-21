let LANG=document.documentElement.lang==='cs'?'cs':'en';
const csPl=(n,a,b,c)=>{n=Math.abs(+n);return n===1?a:n>=2&&n<=4?b:c};
const CS_NOUN={characters:['znak','znaky','znaků'],words:['slovo','slova','slov'],'characters and words':['znak a slovo','znaky a slova','znaků a slov'],sentences:['věta','věty','vět'],'twin groups':['skupina dvojčat','skupiny dvojčat','skupin dvojčat'],cards:['kartička','kartičky','kartiček']};
const csN=(n,k)=>n+' '+csPl(n,...CS_NOUN[k]);
const csLessons=t=>t.replace(/\bIntro\b/g,'Úvod').replace(/\bLesson (\d+)/g,'Lekce $1');
const CS_P=[
 [/^(\d+) days?$/,(m,n)=>`${n} ${csPl(+n,'den','dny','dní')}`],
 [/^(\d+) mo$/,(m,n)=>`${n} měs.`],
 [/^([\d.]+) yr$/,(m,n)=>`${n.replace('.',',')} r.`],
 [/^About (\d+) cards will be due by tomorrow\.$/,(m,n)=>`Do zítřka bude k opakování asi ${n} ${csPl(+n,'kartička','kartičky','kartiček')}.`],
 [/^(\d+) more cards are waiting today\.$/,(m,n)=>`Dnes na tebe čeká ještě ${n} ${csPl(+n,'kartička','kartičky','kartiček')}.`],
 [/^Cards reviewed today: (\d+)\. About (\d+) will be due by tomorrow\.$/,(m,a,b)=>`Dnes zopakováno: ${a}. Do zítřka bude k opakování asi ${b}.`],
 [/^Go over the (\d+) again$/,(m,n)=>`Projít ${n} znovu`],
 [/^(\d+) cards to review today$/,(m,n)=>`Dnes tě čeká ${n} ${csPl(+n,'kartička','kartičky','kartiček')}`],
 [/^Chapter (\d+)$/,(m,n)=>`Kapitola ${n}`],
 [/^Practice test (\d+)$/,(m,n)=>`Cvičný test ${n}`],
 [/^Best: (\d+) \/ 40$/,(m,n)=>`Nejlépe: ${n} / 40`],
 [/^(Listening|Reading) · Part (\d)$/,(m,s,n)=>`${s==='Listening'?'Poslech':'Čtení'} · ${n}. část`],
 [/^(Listening|Reading) (\d+) \/ 20$/,(m,s,n)=>`${s==='Listening'?'Poslech':'Čtení'} ${n} / 20`],
 [/^(Listening|Reading) (\d)$/,(m,s,n)=>`${s==='Listening'?'Poslech':'Čtení'} ${n}`],
 [/^(\d+) · (Listening|Reading) (\d)$/,(m,i,s,n)=>`${i} · ${s==='Listening'?'Poslech':'Čtení'} ${n}`],
 [/^To look at again \((\d+)\)$/,(m,n)=>`K zopakování (${n})`],
 [/^Continue: Lesson (\d+)$/,(m,n)=>`Pokračuj: Lekce ${n}`],
 [/^(\d+)% done$/,(m,n)=>`Splněno ${n} %`],
 [/^(\d+) \/ (\d+) seals$/,(m,a,b)=>`${a} / ${b} ${csPl(+b,'pečeť','pečetě','pečetí')}`],
 [/^(\d+) of (\d+) seals$/,(m,a,b)=>`${a} z ${b} pečetí`],
 [/^Stamped · (\d+)%$/,(m,n)=>`Orazítkováno · ${n} %`],
 [/^Seal stamped · (\d+)%$/,(m,n)=>`Pečeť orazítkována · ${n} %`],
 [/^(\d+) known$/,(m,n)=>`umíš ${n}`],
 [/^(\d+) (character|characters)$/,(m,n)=>`${n} ${csPl(+n,'znak','znaky','znaků')}`],
 [/^(\d+) words · (\d+) characters$/,(m,a,b)=>`${csN(+a,'words')} · ${csN(+b,'characters')}`],
 [/^from (\d+) %$/,(m,n)=>`od ${n} %`],
 [/^Continue: (.+)$/,(m,s)=>`Pokračuj: ${CS[s]||s}`],
 [/^Final test · (Lesson \d+|Intro)$/,(m,n)=>`Finální test · ${csLessons(n)}`],
 [/^Final test (\d+)%$/,(m,n)=>`Finální test ${n} %`],
 [/^You need (\d+)% to stamp the seal\.$/,(m,n)=>`K orazítkování pečeti potřebuješ ${n} %.`],
 [/^(\d+) of (\d+) correct\.$/,(m,a,b)=>`Správně ${a} z ${b}.`],
 [/^(‹ )?(Lesson \d+|Intro) · (.+)$/,(m,a,n,t)=>`${a||''}${csLessons(n)} · ${CS[t]||t}`],
 [/^‹ (Lesson \d+|Intro)$/,(m,n)=>`‹ ${csLessons(n)}`],
 [/^Next: (Lesson \d+|Intro) ›$/,(m,n)=>`Další: ${csLessons(n)} ›`],
 [/^(\d+) topics · Seminar (\d+)$/,(m,a,b)=>`${a} ${csPl(+a,'téma','témata','témat')} · Seminář ${b}`],
 [/^✎ Practise seminar (\d+) · (\d+) sentences$/,(m,a,b)=>`✎ Procvičit seminář ${a} · ${b} vět`],
 [/^Seminar (\d+)$/,(m,a)=>`Seminář ${a}`],
 [/^Chinese Grammar I · Seminar (\d+)$/,(m,a)=>`Gramatika čínštiny I · Seminář ${a}`],
 [/^(\d+) players so far\. Everyone who creates an account appears here\.$/,(m,n)=>`Zatím ${n} ${csPl(+n,'hráč','hráči','hráčů')}. Každý, kdo si založí účet, se tu objeví.`],
 [/^All (\d+) players$/,(m,n)=>`Všichni hráči: ${n}`],
 [/^(\d+) lessons$/,(m,n)=>`${n} ${csPl(+n,'lekce','lekce','lekcí')}`],
 [/^· (\d+) (item|items) from all lessons$/,(m,n)=>`· ${n} ${csPl(+n,'položka','položky','položek')} ze všech lekcí`],
 [/^(\d+) in a row!$/,(m,n)=>`${n} v řadě!`],
 [/^Remove (.+)$/,(m,c)=>`Odebrat ${c}`],
 [/^Place (\d+) of (\d+)$/,(m,a,b)=>`${a}. místo z ${b}`],
 [/^(\d+) more (known|cards|days) to overtake (.+)\.$/,(m,n,u,who)=>`Na další místo (${who}) ti chybí ${n} ${u==='known'?csPl(n,'položka','položky','položek'):u==='cards'?csPl(n,'kartička','kartičky','kartiček'):csPl(n,'den','dny','dní')}.`],
 [/^Your first session: (\d+) new (characters|words), about (\d+) minutes\. Each one is introduced first, then you are tested on it\.$/,(m,n,k,t)=>`Tvoje první sezení: ${n} ${k==='words'?csPl(n,'nové slovo','nová slova','nových slov'):csPl(n,'nový znak','nové znaky','nových znaků')}, asi ${t} ${csPl(t,"minutu","minuty","minut")}. Každý ti nejdřív představím a pak tě z něj vyzkouším.`],
 [/^Next round · (\d+) left$/,(m,n)=>`Další kolo · zbývá ${n}`],
 [/^(\d+) left$/,(m,n)=>`zbývá ${n}`],
 [/^Stroke (\d+) of (\d+)$/,(m,a,b)=>`Tah ${a} z ${b}`],
 [/^Stroke (\d+) of (\d+) · mistakes (\d+)$/,(m,a,b,c)=>`Tah ${a} z ${b} · chyby ${c}`],
 [/^(\d+) strokes · mistakes (\d+)$/,(m,a,c)=>`${a} ${csPl(a,'tah','tahy','tahů')} · chyby ${c}`],
 [/^(\d+) strokes$/,(m,a)=>`${a} ${csPl(a,'tah','tahy','tahů')}`],
 [/^Character (\d+) of (\d+)$/,(m,a,b)=>`Znak ${a} z ${b}`],
 [/^Done · mistakes (\d+)$/,(m,c)=>`Hotovo · chyby ${c}`],
 [/^Done · (\d+) mistakes\. You can start over if you want\.$/,(m,c)=>`Hotovo · chyby: ${c}. Můžeš začít znovu.`],
 [/^Done · (\d+) mistakes\. Start over to write it again\.$/,(m,c)=>`Hotovo · chyby: ${c}. Začni znovu a napiš to ještě jednou.`],
 [/^Round (\d+) · (\d+) \/ (\d+)$/,(m,r,a,b)=>`Kolo ${r} · ${a} / ${b}`],
 [/^(\d+) due · (\d+) new (characters|words)$/,(m,a,b,k)=>`${a} k opakování · ${b} ${k==='words'?csPl(b,'nové slovo','nová slova','nových slov'):csPl(b,'nový znak','nové znaky','nových znaků')}`],
 [/^(\d+) in these lessons$/,(m,n)=>`${n} v těchto lekcích`],
 [/^(\d+) of (\d+) known$/,(m,a,b)=>`${a} z ${b} umíš`],
 [/^(\d+) (characters and words|characters|words|sentences|twin groups|cards)$/,(m,n,k)=>csN(n,k)],
 [/^(\d+) characters, (\d+) words and (\d+) sentences from the selected lessons\.$/,(m,a,b,c)=>`${csN(a,'characters')}, ${csN(b,'words')} a ${csN(c,'sentences')} z vybraných lekcí.`],
 [/^(\d+) points?$/,(m,n)=>`${n} ${csPl(n,'bod','body','bodů')}`],
 [/^(\d+) day streak(, studied today)?$/,(m,n,t)=>`${n} ${csPl(n,'den','dny','dní')} v řadě${t?', dnes splněno':''}`],
 [/^Question (\d+)$/,(m,n)=>`Otázka ${n}`],
 [/^(Intro|Lesson \d+)(, (Intro|Lesson \d+))*$/,m=>csLessons(m)],
 [/^Tone (\d)$/,(m,n)=>`${n}. tón`],
 [/^Tone (\d), (.+)$/,(m,n,r)=>`${n}. tón, ${T(r)??r}`],
 [/^Neutral tone, (.+)$/,(m,r)=>`Neutrální tón, ${T(r)??r}`],
 [/^Start (.+?) · (\d+) (characters and words|characters|words|twin groups|sentences)$/,(m,a,n,k)=>`Spustit: ${T(a)??a} · ${csN(n,k)}`],
 [/^See the (\d+) (characters and words|characters|words|sentences)$/,(m,n,k)=>`Zobrazit ${csN(n,k)}`],
 [/^✗ Still learning: (\d+)$/,(m,n)=>`✗ Neumím: ${n}`],
 [/^✓ Know: (\d+)$/,(m,n)=>`✓ Umím: ${n}`],
 [/^New cards come from (.+) · (characters|words)$/,(m,l,k)=>`Nové kartičky z: ${l==='no lessons'?'žádné lekce':csLessons(l)} · ${k==='words'?'slova':'znaky'}`],
 [/^Practise Lesson (\w+) sentences$/,(m,l)=>`Procvičit věty z lekce ${l}`],
 [/^Textbook p\. (\d+)$/,(m,n)=>`Učebnice s. ${n}`],
 [/^Study the (\d+) again$/,(m,n)=>`Projít ${n} znovu`],
 [/^Practise the (\d+) mistakes$/,(m,n)=>`Procvičit ${n} ${+n===1?'chybu':+n<5?'chyby':'chyb'}`],
 [/^Still learning: (\d+)\. Go through them again until they are all in the Know pile\.$/,(m,n)=>`Neumíš: ${n}. Projdi je znovu, dokud nebudou všechny v hromádce Umím.`],
 [/^Practise my (\d+) mistakes?$/,(m,n)=>`Procvičit ${n} ${csPl(n,'chybu','chyby','chyb')}`],
 [/^(\d+) h ago$/,(m,n)=>`před ${n} h`],[/^(\d+) d ago$/,(m,n)=>`před ${n} d`],
 [/^(.+) \(you\)$/,(m,n)=>`${n} (ty)`],
 [/^Your best is (.+)\.$/,(m,n)=>`Tvůj rekord je ${n}.`],
 [/^Reviewed today: (\d+) · all time: (\d+)$/,(m,a,b)=>`Dnes zopakováno: ${a} · celkem: ${b}`],
 [/^cards reviewed today: (\d+)\. Streak: (\d+) days?\.$/,(m,a,b)=>`Dnes zopakovaných kartiček: ${a}. Série: ${b} ${csPl(b,'den','dny','dní')}.`],
 [/^in (\d+) tones\. Which character did you hear\?$/,(m,n)=>`ve ${n} tónech. Který znak jsi slyšel(a)?`],
 [/^You picked (.+)\. Play it again and listen for the (.+) shape\.$/,(m,a,b)=>`Vybral(a) jsi ${a.replace(/tone (\d)/g,'$1. tón')}. Přehraj si to znovu a poslouchej ${T(b)??b} průběh.`],
 [/^Why it means “$/,()=>'Proč to znamená „'],
 [/^You typed “(.+)”\. Accepted answers: (.+)$/,(m,a,b)=>`Napsal(a) jsi „${a}“. Uznávám: ${b}`],
 [/^Traditional (\S+)$/,(m,c)=>`Tradiční ${c}`],[/^Simplified (\S+)$/,(m,c)=>`Zjednodušené ${c}`],
 [/^(\d+)\+? results?$/,(m,n)=>`${m.replace(/ results?$/,'')} ${csPl(n,'výsledek','výsledky','výsledků')}`],
 [/^You have done (\d+) reviews(?: and know (\d+) items)?(?:, with a (\d+)-day streak)?\. For now it is all only in this browser\.$/,(m,n,k,st)=>`Máš za sebou ${n} opakování${k?`, umíš ${k} ${csPl(k,'položku','položky','položek')}`:''}${st?` a držíš sérii ${st} ${csPl(st,'den','dny','dní')}`:''}. Zatím je to všechno jen v tomhle prohlížeči.`],
 [/^You have a (\d+)-day streak\. You see it and keep it only with an account, on your phone and computer too\.$/,(m,n)=>`Máš sérii ${n} ${csPl(n,'den','dny','dní')} v řadě. Uvidíš ji a nepřijdeš o ni, jen když si založíš účet, a pak ji máš i na telefonu a počítači.`],
 [/^(\d+) characters · (\d+) words · (\d+) lessons$/,(m,a,b,c)=>`${csN(a,'characters')} · ${csN(b,'words')} · ${c} ${csPl(c,'lekce','lekce','lekcí')}`],
 [/^(\d+) of (\d+) known$/,(m,a,b)=>`umíš ${a} z ${b}`]
];
/* Czech for the pinyin dictation trainer */
Object.assign(CS,{"Chinese Phonetics – test":"Fonetika čínštiny – test","Test prep: initials, finals, tones, words":"Příprava na test: iniciály, finály, tóny, slova",
 "Initials":"Iniciály","Finals and tone":"Finály a tón","Whole words":"Celá slova","Tell apart":"Rozlišování","Practice test":"Zkušební test",
 "Hear a syllable, type its initial. Test items 1–25.":"Uslyšíš slabiku a napíšeš její iniciálu. V testu položky 1–25.",
 "The initial is shown, type the final with its tone. Items 26–50.":"Iniciálu vidíš, napiš finálu s tónem. Položky 26–50.",
 "Pick the tone of each syllable of a word. Items 51–75.":"Urči tón každé slabiky slova. Položky 51–75.",
 "Type the whole word with its tones. Items 76–100.":"Napiš celé slovo i s tóny. Položky 76–100.",
 "Two syllables that differ in one sound. Which one did you hear?":"Dvě slabiky, které se liší jednou hláskou. Kterou jsi slyšel(a)?",
 "100 items like the real test. No feedback until the answer sheet at the end.":"100 položek jako ve skutečném testu. Výsledky uvidíš až v opraveném archu na konci.",
 "Get ready for the phonetics test: 100 dictated items, 80% to pass. You hear a syllable or a word, you write it in pinyin.":"Příprava na test z fonetiky: 100 diktovaných položek, k úspěchu potřebuješ 80 %. Uslyšíš slabiku nebo slovo a zapíšeš ho v pinyinu.",
 "Not tried yet":"Zatím nezkoušeno","Focus on weak spots":"Zaměřit se na slabá místa","Everything evenly":"Všechno stejně",
 "Weak spots: hard initials (z zh c ch s sh j q x r), hard finals (ong eng ang an en in ing ian uan un ue …) and your own mistakes come up more often. The practice test is always mixed evenly.":"Slabá místa: těžké iniciály (z zh c ch s sh j q x r), těžké finály (ong eng ang an en in ing ian uan un ue …) a tvoje vlastní chyby přijdou na řadu častěji. Zkušební test je vždy namíchaný rovnoměrně.",
 "Voice and speed":"Hlas a rychlost","Your weak spots":"Tvoje slabá místa",
 "Nothing yet. Your most frequent mix-ups show up here, for example ong → eng.":"Zatím nic. Tady se ukáže, co si nejčastěji pleteš, třeba ong → eng.",
 "Practice tests:":"Zkušební testy:","Reset dictation stats…":"Smazat statistiky diktátu…","Delete the dictation stats?":"Smazat statistiky diktátu?",
 "Start":"Začít","Start the test":"Začít test","100 items":"100 položek",
 "No Chinese voice on this device, so you won't hear anything.":"Na tomhle zařízení chybí čínský hlas, takže nic neuslyšíš.",
 "Mac: System Settings → Accessibility → Spoken Content → System voice → Manage voices → Chinese. Download a voice, then reload this page.":"Mac: Nastavení systému → Zpřístupnění → Mluvený obsah → Systémový hlas → Spravovat hlasy → čínština. Stáhni hlas a pak stránku obnov.",
 "Windows: Settings → Time & language → Speech → Add voices → Chinese (Simplified, China).":"Windows: Nastavení → Čas a jazyk → Řeč → Přidat hlasy → čínština (zjednodušená, Čína).",
 "iPhone and Android phones usually have one already.":"iPhone a telefony s Androidem ho obvykle už mají.",
 "Chinese voice":"Čínský hlas","Play a sample":"Přehrát ukázku","Speed":"Rychlost",
 "The voice is your device's speech synthesis, not a native speaker. It is good practice, but now and then it may read a tone oddly.":"Hlas je syntéza řeči tvého zařízení, ne rodilý mluvčí. Na procvičení dobrý, ale občas může nějaký tón přečíst divně.",
 "Could not load the syllables. Check your connection and try again.":"Slabiky se nepodařilo načíst. Zkontroluj připojení a zkus to znovu.",
 "Play again":"Přehrát znovu","again":"znovu","I don't know":"Nevím","Missing initial":"Chybějící iniciála",
 "Initial, e.g. zh":"Iniciála, např. zh","Final and tone, e.g. ong1 or ōng":"Finála a tón, např. ong1 nebo ōng","Whole word, e.g. yin1yue4 or yīnyuè":"Celé slovo, např. yin1yue4 nebo yīnyuè",
 "Your answer":"Tvoje odpověď","Your answer:":"Tvoje odpověď:","(nothing)":"(nic)","This syllable has no initial.":"Tahle slabika nemá iniciálu.",
 "Enter checks, Shift+Enter plays again.":"Enter zkontroluje, Shift+Enter přehraje znovu.",
 "Enter checks, Shift+Enter plays again. Type ü as v.":"Enter zkontroluje, Shift+Enter přehraje znovu. ü piš jako v.",
 "Tap a tone for each syllable, or press 1–4. Shift+Enter plays again.":"Vyber tón pro každou slabiku, nebo mačkej 1–4. Shift+Enter přehraje znovu.",
 "Which one did you hear? Press 1 or 2. Shift+Enter plays again.":"Kterou jsi slyšel(a)? Zmáčkni 1 nebo 2. Shift+Enter přehraje znovu.",
 "Tap a tone for each syllable, or press 1–4. Enter goes on, Shift+Enter plays again.":"Vyber tón pro každou slabiku, nebo mačkej 1–4. Enter pokračuje, Shift+Enter přehraje znovu.",
 "Enter goes on, Shift+Enter plays again.":"Enter pokračuje, Shift+Enter přehraje znovu.",
 "✓ Correct":"✓ Správně","✗ Not quite":"✗ Tohle ne",
 "Counted as right. After j, q, x and y, ü is written u:":"Uznáno. Po j, q, x a y se ü píše jako u:",
 "This one comes back in a moment.":"Tahle se za chvíli vrátí.","Every answer right.":"Všechno správně.",
 "Wrong answers came back until the round was over.":"Chybné odpovědi se vracely až do konce kola.",
 "Mix-ups this round:":"Co se ti v tomhle kole pletlo:","To listen to again:":"Poslechni si znovu:","Next round":"Další kolo",
 "‹ End":"‹ Ukončit","Finish the test":"Dokončit test","Leave the test? Your answers will be lost.":"Opustit test? Odpovědi se ztratí.",
 "Passed":"Splněno","Not passed yet":"Zatím nesplněno","You need 80% to pass.":"K úspěchu potřebuješ 80 %.",
 "Mistakes in each part (out of 25)":"Chyby v jednotlivých částech (z 25)","Corrected answer sheet":"Opravený arch","New test":"Nový test","wrong":"špatně","Focus":"Zaměření"});
CS_P.push(
 [/^(\d+)% right · (\d+) answers$/,(m,a,n)=>`${a} % správně · ${n} ${csPl(n,'odpověď','odpovědi','odpovědí')}`],
 [/^Last: (\d+)%$/,(m,a)=>`Naposledy: ${a} %`],
 [/^Tone (\d) → (\d)$/,(m,a,b)=>`${a}. tón → ${b}.`]);
function T(s){
  if(Object.prototype.hasOwnProperty.call(CS,s))return CS[s];
  for(const [re,f] of CS_P){const m=s.match(re);if(m)return f(...m)}
  if(s.startsWith('· ')){const t=T(s.slice(2));return t==null?null:'· '+t}
  if(s.includes(' · ')){const parts=s.split(' · ');let ch=false;const out=parts.map(x=>{const t=x?T(x):null;if(t!=null){ch=true;return t}return x});if(ch)return out.join(' · ')}
  return null;
}
function trWS(s){const m=s.match(/^(\s*)([\s\S]*?)(\s*)$/);if(!m[2]||!/[A-Za-z]/.test(m[2]))return s;const t=T(m[2]);return t==null?s:m[1]+t+m[3]}
const I18N_SKIP='script,style,textarea,.han,.py,.meaning,.examzh,[data-lang],[data-noi18n]';
const ORIG=new WeakMap(),ORIGA=new WeakMap();
function trText(n){const p=n.parentElement;if(!p||p.closest(I18N_SKIP))return;const cur=n.nodeValue;let en=ORIG.get(n);
  if(en===undefined||(cur!==en&&cur!==trWS(en))){en=cur;ORIG.set(n,en)}
  const want=LANG==='cs'?trWS(en):en;if(cur!==want)n.nodeValue=want}
function trAttrs(el){if(el.closest('[data-lang],[data-noi18n]'))return;let o=ORIGA.get(el);
  for(const a of ['placeholder','aria-label','title']){const v=el.getAttribute(a);if(v==null)continue;if(!o){o={};ORIGA.set(el,o)}let en=o[a];
    if(en===undefined||(v!==en&&v!==trWS(en))){en=v;o[a]=en}const want=LANG==='cs'?trWS(en):en;if(v!==want)el.setAttribute(a,want)}}
const ZH_SEL='.han,.han-in,.ruby,.examzh,.zh',PY_SEL='.py,.pyl',EN_SEL='.meaning,.ge .en,.gp>p,.ghow li,.gtip,.gen,.story,.ex p';
function markZh(root){const z=document.body.classList.contains('trad')?'zh-Hant':'zh-Hans';
  if(root.matches(ZH_SEL))root.lang=z;else if(root.matches(PY_SEL))root.lang='zh-Latn-pinyin';
  root.querySelectorAll(ZH_SEL).forEach(e=>{if(e.lang!==z)e.lang=z});root.querySelectorAll(EN_SEL).forEach(e=>{if(!e.lang)e.lang='en'});root.querySelectorAll(PY_SEL).forEach(e=>{e.lang='zh-Latn-pinyin'})}
function trTree(root){if(root.nodeType===3){trText(root);return}if(root.nodeType!==1||root.closest('script,style'))return;markZh(root);
  if(root.matches('[placeholder],[aria-label],[title]'))trAttrs(root);
  root.querySelectorAll('[placeholder],[aria-label],[title]').forEach(trAttrs);
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode())trText(n)}
function setLang(l){LANG=l==='cs'?'cs':'en';store.set('ic-lang',LANG);document.documentElement.lang=LANG;trTree(document.body);
  document.querySelectorAll('[data-lang-set]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.langSet===LANG)));
  document.querySelectorAll('.langdd .cur').forEach(e=>e.textContent=LANG==='cs'?'CZ':'EN');langMenu(false)}
function langMenu(open,dd){document.querySelectorAll('.langdd').forEach(d=>{const o=open&&d===dd,m=d.querySelector('.langmenu'),was=!m.hidden;m.hidden=!o;d.querySelector('.langbtn').setAttribute('aria-expanded',String(o));if(o&&!was)(m.querySelector('[aria-pressed="true"]')||m.querySelector('button')).focus();else if(!o&&was&&m.contains(document.activeElement))d.querySelector('.langbtn').focus()})}
document.addEventListener('click',e=>{const b=e.target.closest('.langbtn');if(b){const dd=b.closest('.langdd');langMenu(dd.querySelector('.langmenu').hidden,dd);return}if(!e.target.closest('.langmenu'))langMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape')langMenu(false)});
document.addEventListener('click',e=>{const b=e.target.closest('[data-lang-set]');if(b){e.stopPropagation();setLang(b.dataset.langSet)}},true);
new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')trText(m.target);else if(m.type==='attributes')trAttrs(m.target);else m.addedNodes.forEach(trTree)}})
  .observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label','title']});
setLang(LANG);
