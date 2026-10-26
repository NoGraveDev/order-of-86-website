import {account,accountAPI,initializeAccount} from './account-state.js';
import {initAccountUI} from './account-ui.js';

const $=id=>document.getElementById(id),choiceKey='pawtheon-entry-choice-v1';
const gate=document.createElement('main');gate.id='entryGate';gate.setAttribute('aria-labelledby','entryHeading');
gate.innerHTML='<section class="entry-card"><p class="entry-eyebrow">THE ORDER OF 86</p><h1 id="entryHeading">Pawtheon</h1><p id="entryMessage" role="status">Checking your account…</p><div id="entryAuth" hidden><button id="entrySignup" class="primary">Create account</button><button id="entryLogin">Sign in</button><p>Your wizard, discoveries and progress follow your account.</p></div><div id="entryModes" hidden><h2>How would you like to play?</h2><div class="entry-modes"><button id="entrySingle"><strong>Single Player</strong><span>Explore the world on your own.</span></button><button id="entryMulti"><strong>Multiplayer</strong><span>Join a public lobby or your friends.</span></button></div><button id="entryAccount">Account &amp; saved progress</button><button id="entryLogout">Sign out</button></div><button id="entryRetry" hidden>Try again</button><p id="entryError" role="alert"></p></section>';
document.body.append(gate);
let loading=false,entered=false,checking=false;
function openAccount(mode){$('accountBtn').click();if(mode)$('accountDialog').querySelector('[data-account-mode="'+mode+'"]').click();}
$('entrySignup').onclick=()=>openAccount('signup');$('entryLogin').onclick=()=>openAccount('login');$('entryAccount').onclick=()=>openAccount();$('entryRetry').onclick=()=>location.reload();
function lock(message){
 globalThis.pawEntryAuthorized=false;document.body.classList.add('entry-locked');gate.hidden=false;
 $('entryModes').hidden=true;$('entryAuth').hidden=false;$('entryMessage').textContent=message;
 // The account draft was already persisted by account-state. Never switch to guest storage.
 account.blocked=true;account.authExpired=true;globalThis.dispatchEvent(new Event('paw-account'));
 document.querySelectorAll('dialog[open]').forEach(d=>d.close());openAccount('login');$('accountGuest').hidden=false;$('accountMember').hidden=true;
}
async function validate(){const data=await accountAPI('session');if(!data.user||data.user.id!==account.user?.id){lock('Your session ended. Sign in to continue.');return false;}return true;}
async function checkSession(){if(checking||!account.user||account.authExpired)return;checking=true;try{await validate();}catch{/* Offline is not proof of sign-out; protected actions still require a valid session. */}finally{checking=false;}}
addEventListener('paw-auth-required',checkSession);addEventListener('visibilitychange',()=>{if(!document.hidden)void checkSession();});addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
setInterval(()=>{if(entered&&!document.hidden)void checkSession();},30000);
async function enter(mode){
 if(loading)return;loading=true;$('entryError').textContent='';$('entrySingle').disabled=$('entryMulti').disabled=true;
 try{
  if(!await validate())return;
  const current=/\/multiplayer(?:\.html)?\/?$/.test(location.pathname)?'multi':'single';
  if(mode!==current){const target=new URL(mode==='multi'?'./multiplayer':'./',import.meta.url);if(mode==='multi')target.hash=location.hash;sessionStorage.setItem(choiceKey,JSON.stringify({account:account.user.id,mode,at:Date.now()}));location.assign(target.href);return;}
  globalThis.pawEntryAuthorized=true;entered=true;gate.hidden=true;document.body.classList.remove('entry-locked');
  await import('./loading-screen.js');
 }catch{if(!entered){$('entryError').textContent='Could not verify your account. Check your connection and try again.';}else{document.body.classList.add('entry-locked');gate.hidden=false;$('entryError').textContent='The world could not load. Refresh to try again.';$('entryRetry').hidden=false;}}
 finally{loading=false;$('entrySingle').disabled=$('entryMulti').disabled=false;}
}
$('entrySingle').onclick=()=>enter('single');$('entryMulti').onclick=()=>enter('multi');
$('entryLogout').onclick=async()=>{try{await accountAPI('logout',{});sessionStorage.removeItem(choiceKey);location.reload();}catch{$('entryError').textContent='Sign-out could not be confirmed. Please try again.';}};
await initializeAccount();initAccountUI();
$('entryAuth').hidden=!!account.user;$('entryModes').hidden=!account.user;
$('entryMessage').textContent=account.user?'Welcome, '+account.user.name+'.':'Create an account or sign in to play.';
if(account.status.startsWith('Account service unavailable')){$('entryMessage').textContent=account.status;$('entryRetry').hidden=false;}
let pending;try{pending=JSON.parse(sessionStorage.getItem(choiceKey)||'null');sessionStorage.removeItem(choiceKey);}catch{}
if(account.user&&pending?.account===account.user.id&&['single','multi'].includes(pending.mode)&&Date.now()-pending.at>=0&&Date.now()-pending.at<30000)await enter(pending.mode);
