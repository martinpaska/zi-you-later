// index.html, js/, css/ and sw.js agree with each other
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const {html,list,read,ROOT}=require('../lib/scripts');
module.exports=[
['every script and the stylesheet that index.html links exist, once each',()=>{
  assert.ok(list.length>10,'index.html has no js/ scripts');
  assert.equal(new Set(list).size,list.length,'a script is linked twice');
  for(const f of list)assert.ok(fs.existsSync(path.join(ROOT,f)),f+' is linked but missing');
  assert.ok(/<link rel="stylesheet" href="css\/app\.css">/.test(html)&&fs.existsSync(path.join(ROOT,'css/app.css')),'css/app.css is not linked');
}],
['no file in js/ is left out of index.html',()=>{
  const on=new Set(list.map(f=>path.basename(f)));
  const extra=fs.readdirSync(path.join(ROOT,'js')).filter(f=>f.endsWith('.js')&&!on.has(f));
  assert.deepEqual(extra,[],'not linked in index.html: '+extra.join(', '));
}],
['the only inline script is the one that sets the theme before the first paint',()=>{
  const inline=[...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)];
  assert.equal(inline.length,1,'inline scripts: '+inline.length);assert.match(inline[0][1],/dataset\.theme/);
}],
['the service worker caches index.html, the stylesheet, every script and every JSON file the app fetches',()=>{
  const sw=read('sw.js'),core=(sw.match(/const CORE=\[([\s\S]*?)\];/)||[])[1];assert.ok(core,'no CORE list in sw.js');
  const cached=new Set([...core.matchAll(/'([^']+)'/g)].map(m=>m[1]));
  const need=['index.html','css/app.css',...list];
  for(const f of list){for(const m of read(f).matchAll(/fetch\('([^']+\.json)'/g))need.push(m[1]);
    for(const m of read(f).matchAll(/fetch\(PACK==='hsk1'\?'([^']+)':'([^']+)'/g))need.push(m[1],m[2])}
  const missing=[...new Set(need)].filter(f=>!cached.has(f));assert.deepEqual(missing,[],'not in sw.js CORE: '+missing.join(', '));
  for(const f of cached)if(!/^https?:/.test(f)&&f!=='./')assert.ok(fs.existsSync(path.join(ROOT,f)),'sw.js caches a missing file: '+f);
  assert.match(sw,/const CACHE='zyl-v\d+';/);
}],
['every file that the stylesheet or the page refers to by path exists',()=>{
  const css=read('css/app.css');
  for(const m of css.matchAll(/url\(["']?(\.\.\/[^)"']+)["']?\)/g)){const f=path.join(ROOT,'css',m[1]);assert.ok(fs.existsSync(f),'css/app.css refers to '+m[1])}
  for(const m of html.matchAll(/(?:href|src)="((?!https?:|#|data:)[^"]+)"/g))assert.ok(fs.existsSync(path.join(ROOT,m[1].split('?')[0])),'index.html refers to '+m[1]);
}]];
