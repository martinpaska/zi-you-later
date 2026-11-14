#!/usr/bin/env node
/* Runs every test in tests/cases/. Each file exports a list of [name, async fn(t)]; t has {root, base, browser, ...}.
     node tests/run.js              everything (needs Playwright with Chromium)
     node tests/run.js --static     only the tests that need no browser
     node tests/run.js path         only the files whose name contains "path"
   A test fails by throwing (use node:assert). */
const fs=require('fs'),path=require('path'),server=require('./lib/server');
const args=process.argv.slice(2),staticOnly=args.includes('--static'),filter=args.filter(a=>!a.startsWith('--'));
(async()=>{
  const files=fs.readdirSync(path.join(__dirname,'cases')).filter(f=>f.endsWith('.js')&&(!filter.length||filter.some(x=>f.includes(x)))).sort();
  const t={root:server.ROOT};let srv=null,browser=null;
  const needBrowser=!staticOnly&&files.some(f=>!/^0\d-/.test(f));
  if(needBrowser){const s=await server.start();srv=s.srv;t.base=s.base;
    try{browser=await require('playwright').chromium.launch();t.browser=browser}catch(e){console.error('Playwright with Chromium is needed for the browser tests (npm i -D playwright, npx playwright install chromium), or run with --static.\n'+e.message);process.exit(2)}}
  let pass=0,fail=0;const failed=[];
  for(const f of files){
    const isStatic=/^0\d-/.test(f);if(staticOnly&&!isStatic)continue;
    console.log('\n'+f.replace(/\.js$/,''));
    for(const [name,fn] of require('./cases/'+f)){
      const t0=Date.now();
      try{await fn(t);pass++;console.log('  ✓ '+name+' ('+(Date.now()-t0)+' ms)')}
      catch(e){fail++;failed.push(f+' › '+name);console.log('  ✗ '+name+'\n'+String(e&&e.message||e).split('\n').map(l=>'      '+l).join('\n'))}}}
  if(browser)await browser.close();if(srv)srv.close();
  console.log(`\n${pass} passed, ${fail} failed`);if(fail){console.log('Failed:\n  '+failed.join('\n  '));process.exit(1)}
})();
