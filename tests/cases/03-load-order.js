/* The scripts are loaded one after another. Inside one big script a function could be called before the line that declares it
   (declarations are hoisted); across files it cannot: a file may only use, while it is loading, what the files before it
   (and itself) declare. This reads every file, finds the code that runs at load time (top-level statements and functions
   called from them), and reports a use of something that a LATER file declares. */
const assert=require('node:assert/strict');
const acorn=require('acorn'),escope=require('eslint-scope');
const {list,read}=require('../lib/scripts');

function parent(node,p){node.parent=p;for(const k in node){if(k==='parent')continue;const v=node[k];
  if(Array.isArray(v)){for(const c of v)if(c&&typeof c.type==='string')parent(c,node)}else if(v&&typeof v.type==='string')parent(v,node)}}
const isIIFE=b=>{const p=b.parent;return !!p&&p.type==='CallExpression'&&p.callee===b};

module.exports=[
['a file does not use, while loading, something that a later file declares',()=>{
  const files=list.map((f,i)=>{const src=read(f),ast=acorn.parse(src,{ecmaVersion:2022,sourceType:'script',locations:true,ranges:true});parent(ast,null);
    return {f,i,ast,sm:escope.analyze(ast,{ecmaVersion:2022,sourceType:'script'})}});
  // every top-level name: where it is declared and what it is
  const decl=new Map();
  for(const F of files)for(const v of F.sm.globalScope.variables){const d=v.defs[0];if(!d)continue;
    const kind=d.type==='FunctionName'?'function':d.type==='ClassName'?'class':d.parent&&d.parent.kind;
    if(!decl.has(v.name))decl.set(v.name,{file:F.i,kind,node:d.node,F})}
  // a reference runs at load time when no function around it is deferred (an immediately called function is not)
  const loadTime=(scope,stop)=>{for(let s=scope;s&&s!==stop;s=s.upper)if(s.type==='function'&&!isIIFE(s.block))return false;return true};
  const problems=[];
  const visit=(F,scope,stop,from,chain,seen)=>{
    for(const s of F.sm.scopes){if(s!==scope&&!inside(s,scope))continue;
      for(const r of s.references){if(!loadTime(s,scope.type==='global'?null:scope.upper))continue;
        const d=decl.get(r.identifier.name);if(!d)continue;
        if(r.resolved&&r.resolved.scope.type!=='global')continue;       // a local name
        if(d.file>from.i)problems.push(`${from.f} uses ${r.identifier.name} at load time (${chain.join(' → ')||'top level'}, line ${r.identifier.loc.start.line}), but ${files[d.file].f} declares it later`);
        else if(d.kind==='function'&&!seen.has(d.node)){seen.add(d.node);const sc=d.F.sm.acquire(d.node);
          if(sc)visit(d.F,sc,null,from,[...chain,r.identifier.name],seen)}}}};
  const inside=(s,top)=>{for(let x=s;x;x=x.upper)if(x===top)return true;return false};
  for(const F of files)visit(F,F.sm.globalScope,null,F,[],new Set());
  assert.deepEqual([...new Set(problems)],[],'\n'+[...new Set(problems)].join('\n'));
}]];
