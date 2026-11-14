// the scripts are classic scripts that share one global scope, so they are checked together, as one program in load order
const assert=require('node:assert/strict');
const {ESLint}=require('eslint');
const {list,read}=require('../lib/scripts');
module.exports=[
['no undefined names, no names declared twice, no obvious slips (ESLint on all scripts together)',async()=>{
  const parts=[];let at=0;const map=[];   // line → file
  for(const f of list){const src=read(f).replace(/\n$/,'');const n=src.split('\n').length;map.push([at+1,at+n,f]);at+=n;parts.push(src)}
  const eslint=new ESLint({useEslintrc:false,overrideConfig:{env:{browser:true,es2022:true,serviceworker:false},parserOptions:{ecmaVersion:2022,sourceType:'script'},
    globals:{HanziWriter:'readonly',supabase:'readonly'},
    rules:{'no-undef':'error','no-redeclare':['error',{builtinGlobals:false}],'no-dupe-keys':'error','no-dupe-args':'error','no-const-assign':'error','no-func-assign':'error','no-unreachable':'error','no-dupe-else-if':'error','no-self-compare':'error'}}});
  const [res]=await eslint.lintText(parts.join('\n'),{filePath:'app.js'});
  const where=l=>{const m=map.find(([a,b])=>l>=a&&l<=b);return m?m[2]+':'+(l-m[0]+1):'line '+l};
  const bad=res.messages.map(m=>`${where(m.line)}  ${m.message} (${m.ruleId||'syntax'})`);
  assert.deepEqual(bad,[],'\n'+bad.join('\n'));
}]];
