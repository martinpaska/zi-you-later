/* offline + update notice: sw.js keeps a copy of the app; when a newer version is on the web it says so */
function showUpdate(){if($('upd'))return;const d=document.createElement('div');d.id='upd';d.setAttribute('role','status');
  d.innerHTML='<span>New version available</span><button type="button" id="updgo">Reload</button><button type="button" id="updx" aria-label="Later">×</button>';
  document.body.appendChild(d);trTree(d);$('updgo').onclick=()=>location.reload();$('updx').onclick=()=>d.remove()}
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){navigator.serviceWorker.register('sw.js').catch(()=>{});
  navigator.serviceWorker.addEventListener('message',e=>{if(e.data&&e.data.type==='update')showUpdate()});
  navigator.serviceWorker.ready.then(r=>{if(r.active)r.active.postMessage({type:'hello'})}).catch(()=>{})}
if('speechSynthesis' in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice;setTimeout(()=>{if(!voice){$('noVoice').innerHTML=NOVOICE_HTML;$('noVoice').hidden=false}},2500)}else{setTimeout(()=>{$('noVoice').innerHTML=NOVOICE_HTML;$('noVoice').hidden=false},0)}
