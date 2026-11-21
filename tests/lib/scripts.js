// the app's scripts, in the order index.html loads them
const fs=require('fs'),path=require('path'),{ROOT}=require('./server');
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const list=[...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m=>m[1]);
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
module.exports={html,list,read,ROOT};
