// Czech: what the page shows is translated. The app is written in English and translated on screen (js/strings-cs.js, js/i18n.js),
// so a new text that nobody added to the dictionary is shown in English. These tests catch the likely misses.
const assert=require('node:assert/strict');
const {open,known}=require('../lib/app');

module.exports=[
['What\'s new: every title, summary, place and item has a Czech text',async t=>{
  const a=await open(t,{lang:'cs'});
  try{const miss=await a.page.evaluate(()=>NEWS.flatMap(x=>[x.t,x.what,x.where,...x.items]).filter(Boolean).filter(s=>T(s)==null));
    assert.deepEqual(miss,[],'not translated:\n'+miss.join('\n'));assert.deepEqual(a.errors,[])}finally{await a.close()}
}],
['the course, mode and story texts of both courses have a Czech text',async t=>{
  for(const pack of ['cin1','hsk1']){
    const a=await open(t,{pack,lang:'cs'});
    try{const miss=await a.page.evaluate(()=>{
        const s=[...PACKS.flatMap(p=>[p.n,p.d]),...Object.values(MODEINFO).flatMap(i=>[i.n,i.d]),PATH.story,PATH.intro,PATH.goal.t,PATH.goal.d,PATH.goal.b,...SEAL_CHAPTERS.flatMap(([n,,st])=>[n,st]),...Object.values(LTITLE)];
        return s.filter(Boolean).filter(x=>!/[㐀-鿿]/.test(x)&&!['HSK 1','Integrated Chinese 1/1 · FF MUNI'].includes(x)&&T(x)==null)});   // (names stay as they are)
      assert.deepEqual(miss,[],pack+' not translated:\n'+miss.join('\n'))}finally{await a.close()}}
}],
['Czech screens show no English interface text (Home, Your path, a lesson, Settings)',async t=>{
  const leftovers=/\b(Continue|Settings|Close|Reminders?|Your path|Chapter \d|You are here|Older news|Completed|Lessons?|seals?|Final test|Flashcards|Grammar|Sentences|Writing|Vocabulary)\b/;
  for(const pack of ['hsk1','cin1']){
    const a=await open(t,{pack,lang:'cs',srs:known([],0)});
    try{const shots={};
      shots.home=await a.text('#home');
      await a.page.evaluate(()=>album());shots.path=await a.text('#mode');
      await a.page.evaluate(()=>lessonSheet(LESSONS[1]));shots.lesson=await a.text('.nsheet');await a.page.keyboard.press('Escape');
      await a.page.evaluate(()=>{goHome();settings()});shots.settings=await a.text('#mode');
      for(const [name,txt] of Object.entries(shots)){const m=txt.match(leftovers);assert.ok(!m,`${pack} ${name} shows English: "${m&&m[0]}" in …${txt.slice(Math.max(0,txt.search(leftovers)-40),txt.search(leftovers)+40)}…`)}
      assert.deepEqual(a.errors,[])}finally{await a.close()}}
}],
['plurals and texts with numbers in Czech: 1 kartička, 3 kartičky, 7 kartiček, lessons, chapters, progress',async t=>{
  const a=await open(t,{lang:'cs'});
  try{const r=await a.page.evaluate(()=>['1 cards to review today','3 cards to review today','7 cards to review today','Continue: Lesson 3','Continue: Intro','19% done','Chapter 2','Next: Lesson 4 ›','Final test · Lesson 15'].map(x=>T(x)));
    assert.deepEqual(r,['Dnes tě čeká 1 kartička','Dnes tě čeká 3 kartičky','Dnes tě čeká 7 kartiček','Pokračuj: Lekce 3','Pokračuj: Úvod','Splněno 19 %','Kapitola 2','Další: Lekce 4 ›','Finální test · Lekce 15'])}finally{await a.close()}
}],
['switching to English shows English; no Czech leftovers on Home',async t=>{
  const a=await open(t,{pack:'hsk1',lang:'en'});
  try{const txt=await a.text('#home'),cz=txt.match(/\b(Tvoje cesta|Pokračuj|Cvičení|Kartičky|Nastavení|Zavřít|Slovíčka|Kapitola|Vytvořit účet|Co chceš dělat)\b/);
    assert.ok(!cz,'Czech on the English Home: '+(cz&&cz[0]));assert.match(txt,/Your path/);assert.match(txt,/What do you want to do/);assert.deepEqual(a.errors,[])}finally{await a.close()}
}]];
