import {wizardLeaderboard} from './wizard-leaderboard.js';
import {orderJourney} from '../public/order-progression.js';
import {applyShopAction,preserveAccountShop,shopView} from '../public/moon-shop-core.js';
import {wizardProgress} from '../public/wizard-progression.js';
import {chessRecords} from './chess-records.js';
import {validateSave,importSave,unlockedTitles,titles} from './account-progress.js';
const encoder=new TextEncoder(),DAY=86400000,ITERATIONS=600000;
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const random=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
const digest=async value=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(value)));
async function passwordHash(password,salt){const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:encoder.encode(salt),iterations:ITERATIONS},key,256));}
function equal(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let n=0;for(let i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0;}
const json=(body,status=200,headers={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const tokenOf=request=>request.headers.get('Cookie')?.match(/(?:^|;\s*)paw_play_session=([a-f0-9]{64})(?:;|$)/)?.[1];
function cookie(request,token,age=30*86400){return `paw_play_session=${token}; Path=/play/; HttpOnly; SameSite=Strict; Max-Age=${age}${new URL(request.url).protocol==='https:'?'; Secure':''}`;}
export async function currentAccount(request,db,now=Date.now()){const token=tokenOf(request);if(!token)return null;return await db.prepare('SELECT a.* FROM player_accounts a JOIN player_sessions s ON s.account=a.id AND s.version=a.auth_version WHERE s.hash=? AND s.expires>?').bind(await digest(token),now).first();}
function view(a){const save=JSON.parse(a.save);return {user:{id:a.id,username:a.username,name:a.name,title:a.title},save,revision:a.revision,imported:!!a.imported,updated:a.updated,unlocked:unlockedTitles(save),progression:wizardProgress(save),orderProgression:orderJourney(save),shop:shopView(save),titles};}
async function limit(db,key,now,max){const window=Math.floor(now/900000);const r=await db.prepare('INSERT INTO account_rate_limits(key,window,count) VALUES (?,?,1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN window=excluded.window THEN count+1 ELSE 1 END,window=excluded.window RETURNING count').bind(key,window).first();return r.count<=max;}
export async function accountRequest(request,db){const url=new URL(request.url),action=url.pathname.split('/').at(-1),now=Date.now();if(!db)return json({error:'Accounts are temporarily unavailable.'},503);
 if(request.method==='GET'&&action==='leaderboard'){try{return json(await wizardLeaderboard(db,url));}catch{return json({error:'Leaderboard unavailable. Please try again.'},503);}}
 if(request.method==='GET'&&action==='records'){const a=await currentAccount(request,db,now);return a?json(await chessRecords(db,'account:'+a.id)):json({error:'Sign in to see your records.'},401);}
 if(request.method==='GET'&&action==='session'){const a=await currentAccount(request,db,now);return json(a?view(a):{user:null});}
 if(request.method!=='POST')return json({error:'Use POST.'},405);
 // Require same-origin JSON and a non-simple header, including for login and logout.
 if(request.headers.get('Origin')!==url.origin||request.headers.get('X-Pawtheon-Request')!=='1'||!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Origin rejected.'},403);
 try{const raw=await request.text();if(raw.length>65536)return json({error:'Request too large.'},413);const b=JSON.parse(raw);
 if(['signup','login','recover'].includes(action)){
 const username=typeof b.username==='string'?b.username.trim().toLowerCase():'';if(!/^[a-z0-9_]{3,24}$/.test(username))return json({error:'Use 3–24 letters, numbers or underscores for your username.'},400);
 const ip=request.headers.get('CF-Connecting-IP')||'local';if(!await limit(db,'ip:'+await digest(ip),now,60)||!await limit(db,'name:'+username,now,15))return json({error:'Too many attempts. Try again in 15 minutes.'},429);
 if(typeof b.password!=='string'||b.password.length<15||b.password.length>128)return json({error:'Use a password of 15–128 characters.'},400);
 let a=await db.prepare('SELECT * FROM player_accounts WHERE username=?').bind(username).first(),recovery;
 if(action==='signup'){
 if(a)return json({error:'That username is unavailable.'},409);const name=typeof b.name==='string'?b.name.trim():'';if(!name||name.length>24||/[\u0000-\u001f\u007f]/.test(name))return json({error:'Choose a display name of 1–24 characters.'},400);
 const salt=random(),hash=await passwordHash(b.password,salt);recovery=random();const id=crypto.randomUUID();const result=await db.prepare('INSERT OR IGNORE INTO player_accounts(id,username,name,password_hash,salt,recovery_hash,created,updated) VALUES (?,?,?,?,?,?,?,?)').bind(id,username,name,hash,salt,await digest(recovery),now,now).run();if(!result.meta.changes)return json({error:'That username is unavailable.'},409);a=await db.prepare('SELECT * FROM player_accounts WHERE id=?').bind(id).first();
 }else if(action==='login'){
 const hash=await passwordHash(b.password,a?.salt||'unregistered-account-padding');if(!a||!equal(hash,a.password_hash))return json({error:'Username or password did not match.'},401);
 }else{
 if(!a||typeof b.recovery!=='string'||!equal(await digest(b.recovery.trim()),a.recovery_hash))return json({error:'Username or recovery code did not match.'},401);
 const salt=random(),hash=await passwordHash(b.password,salt);recovery=random();const r=await db.prepare('UPDATE player_accounts SET password_hash=?,salt=?,recovery_hash=?,auth_version=auth_version+1 WHERE id=? AND recovery_hash=?').bind(hash,salt,await digest(recovery),a.id,a.recovery_hash).run();if(!r.meta.changes)return json({error:'Recovery code was already used.'},409);await db.prepare('DELETE FROM player_sessions WHERE account=?').bind(a.id).run();a=await db.prepare('SELECT * FROM player_accounts WHERE id=?').bind(a.id).first();
 }
 const token=random();await db.batch([db.prepare('DELETE FROM player_sessions WHERE expires<?').bind(now),db.prepare('DELETE FROM account_rate_limits WHERE window<?').bind(Math.floor(now/900000)-1),db.prepare('INSERT INTO player_sessions(hash,account,version,expires) VALUES (?,?,?,?)').bind(await digest(token),a.id,a.auth_version,now+30*DAY)]);
 return json({...view(a),...(recovery?{recovery}:{})},200,{'Set-Cookie':cookie(request,token)});
 }
 const a=await currentAccount(request,db,now);if(!a)return json({error:'Sign in again to save your progress.'},401);
 if(b.accountId!==a.id)return json({error:'This tab belongs to a different account. Reload before continuing.'},403);
 if(action==='logout'){await db.prepare('DELETE FROM player_sessions WHERE hash=?').bind(await digest(tokenOf(request))).run();return json({ok:true},200,{'Set-Cookie':cookie(request,'',0)});}
 if(action==='save'||action==='import'){
 if(!Number.isSafeInteger(b.revision)||b.revision<0)return json({error:'Invalid save revision.'},400);
 if(action==='import'&&a.imported)return json({error:'Guest progress has already been imported.'},409);
 const incoming=validateSave(b.save),save=action==='import'?importSave(JSON.parse(a.save),incoming):validateSave(preserveAccountShop(JSON.parse(a.save),incoming));
 const unlocked=unlockedTitles(save),title=unlocked.includes(a.title)?a.title:'wanderer';
 const r=await db.prepare(`UPDATE player_accounts SET save=?,revision=revision+1,updated=?,title=?,imported=? WHERE id=? AND revision=? AND auth_version=? ${action==='import'?'AND imported=0':''}`).bind(JSON.stringify(save),now,title,action==='import'?1:a.imported,a.id,b.revision,a.auth_version).run();
 if(!r.meta.changes)return json({error:'Another device saved first. Choose which progress to keep.',conflict:true},409);
 return json(view(await db.prepare('SELECT * FROM player_accounts WHERE id=?').bind(a.id).first()));
 }
 if(action==='shop'){
 if(b.revision!==a.revision)return json({error:'Another device changed your progress. Open Account and load the latest save.',conflict:true},409);
 if(!Number.isSafeInteger(b.revision)||b.revision<0)return json({error:'Invalid save revision.'},400);
 let save;try{save=applyShopAction(JSON.parse(a.save),b);}catch(e){return json({error:e.message},400);}
 const result=await db.prepare('UPDATE player_accounts SET save=?,revision=revision+1,updated=? WHERE id=? AND revision=? AND auth_version=?').bind(JSON.stringify(save),now,a.id,b.revision,a.auth_version).run();
 if(!result.meta.changes)return json({error:'Another device changed your progress. Open Account and load the latest save.',conflict:true},409);
 return json(view(await db.prepare('SELECT * FROM player_accounts WHERE id=?').bind(a.id).first()));
 }
 if(action==='profile'){
 const name=typeof b.name==='string'?b.name.trim():'';if(!name||name.length>24||/[\u0000-\u001f\u007f]/.test(name)||!unlockedTitles(JSON.parse(a.save)).includes(b.title))return json({error:'Choose a valid name and an unlocked title.'},400);
 const r=await db.prepare('UPDATE player_accounts SET name=?,title=?,revision=revision+1 WHERE id=? AND revision=?').bind(name,b.title,a.id,b.revision).run();if(!r.meta.changes)return json({error:'Another device updated your profile. Reload to continue.',conflict:true},409);return json(view(await db.prepare('SELECT * FROM player_accounts WHERE id=?').bind(a.id).first()));
 }
 return json({error:'Unknown account action.'},404);
 }catch(e){if(e instanceof SyntaxError||/Invalid|Unknown|Unsupported|Save structure/.test(e.message))return json({error:'The saved data is invalid or unsupported.'},400);return json({error:'Account service unavailable. Please try again.'},503);}
}
