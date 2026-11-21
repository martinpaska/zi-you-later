// a tiny static server for the repo root (the app has no build step, so the tests serve the files as they are)
const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..','..');
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.woff2':'font/woff2','.png':'image/png','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'};
function start(){
  const srv=http.createServer((req,res)=>{
    let p=decodeURIComponent(new URL(req.url,'http://x').pathname);if(p.endsWith('/'))p+='index.html';
    const f=path.join(ROOT,p);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end('not found')}
    res.writeHead(200,{'Content-Type':TYPES[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(f).pipe(res)});
  return new Promise(ok=>srv.listen(0,'127.0.0.1',()=>ok({srv,base:'http://127.0.0.1:'+srv.address().port})))}
module.exports={start,ROOT};
