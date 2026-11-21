/* ---------- Welcome screen: shown on the first visit, reopened from "About this app" ---------- */
function welcome(){keyHandler=null;stopAudio();M().hidden=true;M().innerHTML='';$('home').hidden=true;$('aboutpage').hidden=true;const w=$('welcome');w.hidden=false;window.scrollTo(0,0);
  if(MOTION){w.classList.remove('anim');void w.offsetWidth;w.classList.add('anim')}}
$('wtry').onclick=()=>{store.set('ic-welcomed',true);signupFlow=false;goHome()};
// the tiles of "What you'll practise" open that exercise straight away, without signing up
document.querySelectorAll('[data-wmode]').forEach(b=>b.onclick=()=>{store.set('ic-welcomed',true);signupFlow=false;goHome();const m=b.dataset.wmode;setup(PACK==='hsk1'&&m==='test'?'hsktest':m)});
$('tologo').onclick=()=>welcome();
$('wsign').onclick=$('wsign2').onclick=()=>{store.set('ic-welcomed',true);signupFlow=true;account()};
{const lg=document.querySelector('#home .logo');if(lg)$('welcome').querySelector('.wlogo').replaceWith(lg.cloneNode(true))}
/* About is its own page at #about: opened from the landing bar or the home footer */
let aboutPrev='home',aboutPushed=false;
function showAbout(){const a=$('aboutpage');if(!a.hidden)return;aboutPrev=!$('welcome').hidden?'welcome':'home';
  keyHandler=null;stopAudio();M().hidden=true;M().innerHTML='';$('welcome').hidden=true;$('home').hidden=true;a.hidden=false;window.scrollTo(0,0);
  if(MOTION){a.classList.remove('anim');void a.offsetWidth;a.classList.add('anim')}}
function closeAbout(){if($('aboutpage').hidden)return;$('aboutpage').hidden=true;if(aboutPrev==='welcome')welcome();else goHome()}
function openAbout(e){if(e)e.preventDefault();aboutPushed=true;location.hash='about'}
$('welcome').querySelector('.wlink').onclick=openAbout;
$('about').onclick=openAbout;
$('aboutback').onclick=()=>{if(aboutPushed){aboutPushed=false;history.back()}else{history.replaceState(null,'',location.pathname+location.search);closeAbout()}};
window.addEventListener('hashchange',()=>{if(location.hash==='#about')showAbout();else{aboutPushed=false;closeAbout()}});
if(location.hash==='#about')setTimeout(showAbout,0);

/* sign up / log in with email and password (Supabase Auth) */
function authForm(mode='up'){
  const up=mode==='up';
  open(bar(0,'','‹ Back')+`<h2>${up?'Create account':'Log in'}</h2>
    <p class="hint">${up?'Save your progress to an account, continue on any device and join the leaderboard.':'Welcome back. Your progress syncs as soon as you are in.'}</p>
    <div class="seg" role="group" aria-label="Account"><button data-am="up" aria-pressed="${up}">Create account</button><button data-am="in" aria-pressed="${!up}">Log in</button></div>
    <form class="section" id="af" novalidate>
      <div class="typein"><input id="aem" type="email" autocomplete="email" inputmode="email" placeholder="Email" aria-label="Email" required></div>
      <div class="typein"><input id="apw" type="password" autocomplete="${up?'new-password':'current-password'}" placeholder="${up?'Password, at least 8 characters':'Password'}" aria-label="Password" required minlength="8"></div>
      <p class="hint" id="am" aria-live="polite"></p>
      <div class="btns"><button class="btn" id="ago" type="submit">${up?'Create account':'Log in'}</button></div>
      ${up?'':'<button class="link" type="button" id="aforgot" style="align-self:flex-start">Forgot your password?</button>'}
    </form>
    <p class="hint">No account? Everything still works and your progress stays in this browser. <button class="link" data-home>Continue without an account ›</button></p>`);
  M().querySelectorAll('[data-am]').forEach(b=>b.onclick=()=>authForm(b.dataset.am));
  const msg=t=>{$('am').textContent=t};
  $('af').onsubmit=async e=>{e.preventDefault();
    const email=$('aem').value.trim(),password=$('apw').value;
    if(!/^\S+@\S+\.\S+$/.test(email))return msg('Enter a valid email address.');
    if(password.length<8)return msg('Use a password with at least 8 characters.');
    $('ago').disabled=true;msg(up?'Creating your account…':'Logging in…');
    try{
      if(up){const {data,error}=await sb.auth.signUp({email,password,options:{emailRedirectTo:SITE_URL}});if(error)throw error;
        if(data.session){signupFlow=true;await initCloud();account()}
        else{$('af').innerHTML='<p class="notice"><b>Check your inbox.</b> We sent a link to <span id="aem2"></span>. Open it on this device to confirm your email and finish your account.</p>';$('aem2').textContent=email}}
      else{const {error}=await sb.auth.signInWithPassword({email,password});if(error)throw error;await initCloud();if(me)goHome();else{signupFlow=true;account()}}
    }catch(err){$('ago').disabled=false;const m=String(err&&err.message||'');
      msg(/invalid login/i.test(m)?'Wrong email or password.':/not confirmed/i.test(m)?'Confirm your email first: open the link we sent you.':/already registered/i.test(m)?'There is already an account with this email. Log in instead.':/rate limit|too many/i.test(m)?'Too many attempts. Wait a minute and try again.':'Something went wrong. Check your connection and try again.')}
  };
  if($('aforgot'))$('aforgot').onclick=async()=>{const email=$('aem').value.trim();if(!/^\S+@\S+\.\S+$/.test(email))return msg('Type your email above first.');
    try{const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:SITE_URL});if(error)throw error;msg('If there is an account for this email, a link to set a new password is on its way.')}catch(e){msg('Could not send the email. Try again in a minute.')}};
}
/* opened from the "reset password" email */
function newPassword(){
  open(bar(0,'','‹ Back')+`<h2>Set a new password</h2><form class="section" id="npf" novalidate><div class="typein"><input id="npw" type="password" autocomplete="new-password" placeholder="New password, at least 8 characters" aria-label="New password"></div><p class="hint" id="npm" aria-live="polite"></p><div class="btns"><button class="btn" type="submit" id="npgo">Save password</button></div></form>`);
  $('npf').onsubmit=async e=>{e.preventDefault();const pw=$('npw').value;if(pw.length<8){$('npm').textContent='Use at least 8 characters.';return}
    $('npgo').disabled=true;try{const {error}=await sb.auth.updateUser({password:pw});if(error)throw error;$('npm').textContent='Saved. You are signed in.';setTimeout(account,900)}catch(err){$('npgo').disabled=false;$('npm').textContent='Could not save the password. Open the link from the email again.'}};
}

