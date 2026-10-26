import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
const origin=process.argv[2];if(!origin)throw Error('Provide staging origin');
const password=randomBytes(24).toString('hex'),username='cfcheck_'+randomBytes(4).toString('hex');
let count=0;const pass=s=>{count++;console.log('PASS '+s)};
async function api(action,body,cookie=''){const r=await fetch(origin+'/play/api/accounts/'+action,{method:body?'POST':'GET',headers:{Origin:origin,'Content-Type':'application/json','X-Pawtheon-Request':'1',Cookie:cookie},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json(),cookie:r.headers.get('Set-Cookie')?.split(';')[0]};}
for(const path of ['/','/lore.html','/play/','/studio/','/wizard/5035','/wizard/5035/og.png','/play/multiplayer']){let r=await fetch(origin+path);assert.equal(r.status,200,path);pass(path)}
for(const path of ['/server.js','/package.json','/AGENTS.md','/play-app/worker/index.js','/.env','/index.php','/server%2ejs']){let r=await fetch(origin+path);assert.equal(r.status,404,path);pass('private blocked '+path)}
const a=await api('signup',{username,password,name:'Migration verification'});assert.equal(a.status,200,'signup '+a.status+' '+a.data.error);assert(a.cookie);const id=a.data.user.id;pass('signup');
const login=await api('login',{username,password});assert.equal(login.status,200);pass('login');
const save={'pawtheon-dog':'5035'};const saved=await api('save',{accountId:id,revision:0,save},a.cookie);assert.equal(saved.status,200);assert.equal(saved.data.save['pawtheon-dog'],'5035');pass('save');
const session=await api('session',undefined,login.cookie);assert.equal(session.data.save['pawtheon-dog'],'5035');pass('second session persistence');
assert.equal((await api('save',{accountId:id,revision:0,save},a.cookie)).status,409);pass('stale save rejected');
const csrf=await fetch(origin+'/play/api/accounts/save',{method:'POST',headers:{Origin:'https://evil.example','Content-Type':'application/json',Cookie:a.cookie},body:'{}'});assert.equal(csrf.status,403);pass('CSRF rejected');
const room=await fetch(origin+'/play/api/multiplayer/public-join',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:a.cookie},body:JSON.stringify({state:{dog:5035,x:0,y:0,z:0,yaw:0}})});const roomData=await room.json();assert.equal(room.status,200,'room '+room.status+' '+roomData.error);pass('multiplayer public join');
assert.equal((await api('logout',{accountId:id},a.cookie)).status,200);assert.equal((await api('session',undefined,a.cookie)).data.user,null);pass('logout revokes session');
console.log(JSON.stringify({checks:count,testUsername:username}));
