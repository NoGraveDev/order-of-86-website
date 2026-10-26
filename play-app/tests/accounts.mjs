import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomBytes} from 'node:crypto';
import worker from '../worker/index.js';
import {openRoomDatabase} from '../scripts/preview-database.mjs';
const dir=mkdtempSync(join(tmpdir(),'paw-accounts-'));let roomDB=openRoomDatabase(join(dir,'test.sqlite'));const origin='https://paw.example';let checks=0;
const pass=label=>{checks++;console.log('PASS '+label)};
async function api(action,body,cookie='',overrides={}){const r=await worker.fetch(new Request(origin+'/api/accounts/'+action,{method:body?'POST':'GET',headers:{Origin:origin,'Content-Type':'application/json','X-Pawtheon-Request':'1',Cookie:cookie,...overrides},...(body?{body:JSON.stringify(body)}:{})}),{DB:roomDB.DB});return {status:r.status,data:await r.json(),cookie:r.headers.get('Set-Cookie')?.split(';')[0],header:r.headers.get('Set-Cookie')};}
try{
 const password=randomBytes(24).toString('base64url'),username='test_'+randomBytes(4).toString('hex');
 let a=await api('signup',{username,password,name:'Tester'});assert.equal(a.status,200);assert.equal(a.data.progression.level,1);assert.equal(a.data.progression.xp,0);assert(a.header.includes('HttpOnly'));assert(a.header.includes('Secure'));assert(a.header.includes('SameSite=Strict'));assert.equal(a.data.recovery.length,64);assert(!a.data.user.password_hash);const recovery=a.data.recovery,id=a.data.user.id,cookie=a.cookie;pass('signup, private session cookie and safe response');
 assert.equal((await api('signup',{username:username.toUpperCase(),password,name:'Other'})).status,409);
 assert.equal((await api('login',{username,password:password+'wrong'})).status,401);
 const second=await api('login',{username,password});assert.equal(second.status,200);assert.notEqual(second.cookie,cookie);pass('case-insensitive uniqueness and password verification');
 const save={'pawtheon-lizards-v1':JSON.stringify(['common-0','common-1','common-2','common-3','moss-0','moss-1','moss-2','moss-3','frost-0']),'pawtheon-dog':'5035','pawtheon-achievements-v1':'{"earned":["first-lizard"],"realms":["starter"]}','pawtheon-owl-journal-v1':'{"counts":{"Common Owl":1},"unlocked":["common-owl:0"]}'};
 let saved=await api('save',{accountId:id,revision:0,save},cookie);assert.equal(saved.status,200);assert(saved.data.unlocked.includes('crystal-keeper'));
 let read=await api('session',undefined,second.cookie);assert.deepEqual(read.data.save,save);assert.equal(read.data.progression.xp,375);assert.equal(read.data.progression.level,3);pass('save visible on a second device and computed title unlock');
 assert.equal((await api('save',{accountId:id,revision:0,save:{}},second.cookie)).status,409);
 assert.equal((await api('session',undefined,cookie)).data.save['pawtheon-dog'],'5035');pass('stale writes cannot overwrite progress');
 assert.equal((await api('save',{accountId:id,revision:1,save:{'pawtheon-lizards-v1':'["fake"]'}},cookie)).status,400);
 assert.equal((await api('save',{accountId:id,revision:1,save:{'password':'"oops"'}},cookie)).status,400);
 assert.equal((await api('profile',{accountId:id,revision:1,name:'Tester',title:'moonlit'},cookie)).status,400);
 let profile=await api('profile',{accountId:id,revision:1,name:'Updated',title:'crystal-keeper'},cookie);assert.equal(profile.status,200);pass('save allowlist, collectible validation and locked-title rejection');
 const guest={'pawtheon-lizards-v1':'["frost-1"]','pawtheon-dog':'6164','pawtheon-sled-best-v3':'123.4','pawtheon-achievements-v1':'{"earned":["first-shard"],"realms":["frost"]}','pawtheon-owl-journal-v1':'{"counts":{"Common Owl":2},"unlocked":["common-owl:1"]}'};
 let imported=await api('import',{accountId:id,revision:2,save:guest},cookie);assert.equal(imported.status,200);assert.equal(JSON.parse(imported.data.save['pawtheon-lizards-v1']).length,10);assert.equal(imported.data.save['pawtheon-dog'],'5035');assert.equal(imported.data.save['pawtheon-sled-best-v3'],'123.4');assert.equal((await api('import',{accountId:id,revision:3,save:guest},cookie)).status,409);assert.deepEqual(JSON.parse(imported.data.save['pawtheon-achievements-v1']).earned,['first-shard','first-lizard']);assert.equal(JSON.parse(imported.data.save['pawtheon-owl-journal-v1']).unlocked.length,2);pass('one-time additive import preserves account choices, badges and wisdom');
 const b=await api('signup',{username:username+'b',password,name:'Other'});assert.equal((await api('session',undefined,b.cookie)).data.revision,0);assert.equal((await api('save',{accountId:id,revision:0,save},b.cookie)).status,403);assert.equal((await api('session',undefined)).data.user,null);pass('account/guest isolation and stale-tab account binding');
 assert.equal((await api('save',{accountId:id,revision:3,save},cookie,{Origin:'https://evil.example'})).status,403);assert.equal((await api('logout',{accountId:id},cookie,{'X-Pawtheon-Request':''})).status,403);pass('CSRF and cross-origin mutations blocked');
 // Both devices join the same room with an authenticated, stable chess identity.
 const roomResponse=await worker.fetch(new Request(origin+'/api/multiplayer/create',{method:'POST',headers:{Cookie:cookie,Origin:origin},body:'{}'}),{DB:roomDB.DB});const {room}=await roomResponse.json();
 for(const c of [cookie,second.cookie]){const r=await worker.fetch(new Request(origin+'/api/multiplayer/join',{method:'POST',headers:{Cookie:c,Origin:origin},body:JSON.stringify({room,name:'Spoofed',state:{dog:5035,x:0,y:0,z:0,yaw:0}})}),{DB:roomDB.DB});assert.equal(r.status,200);const {token}=await r.json();const m=await roomDB.DB.prepare('SELECT profile FROM multiplayer_chess_members WHERE token=?').bind(token).first();assert.equal(m.profile,'account:'+id);const p=await roomDB.DB.prepare('SELECT name FROM multiplayer_players WHERE token=?').bind(token).first();assert.equal(p.name,'Updated');}assert.equal((await api('records',undefined,cookie)).status,200);assert.equal((await api('records',undefined)).status,401);pass('cross-device chess identity, private records and server-owned display name');
 roomDB.close();roomDB=openRoomDatabase(join(dir,'test.sqlite'));assert.equal((await api('session',undefined,cookie)).data.revision,3);pass('database restart persistence');
 const reset=await api('recover',{username,password:password+'new',recovery});assert.equal(reset.status,200);assert.notEqual(reset.data.recovery,recovery);assert.equal((await api('session',undefined,cookie)).data.user,null);assert.equal((await api('session',undefined,second.cookie)).data.user,null);assert.equal((await api('recover',{username,password,recovery})).status,401);pass('one-use recovery rotates credentials and revokes all old sessions');
 assert.equal((await api('logout',{accountId:id},reset.cookie)).status,200);assert.equal((await api('session',undefined,reset.cookie)).data.user,null);pass('logout invalidates session');
 const stored=await roomDB.DB.prepare('SELECT password_hash,recovery_hash FROM player_accounts WHERE id=?').bind(id).first();assert(!JSON.stringify(stored).includes(password));assert(!JSON.stringify(stored).includes(recovery));pass('only credential hashes stored');
 for(let i=0;i<16;i++){const r=await api('login',{username:'limit_test',password});if(i===15)assert.equal(r.status,429);}pass('persistent login throttling');
 console.log(`${checks} account/security checks passed`);
}finally{roomDB.close();rmSync(dir,{recursive:true,force:true});}
