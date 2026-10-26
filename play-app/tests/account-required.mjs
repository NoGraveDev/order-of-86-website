import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import worker from '../worker/index.js';import {openRoomDatabase} from '../scripts/preview-database.mjs';
const dir=mkdtempSync(join(tmpdir(),'paw-required-')),file=join(dir,'test.sqlite');let db=openRoomDatabase(file);
const origin='https://game.test',state={dog:5035,x:0,y:0,z:15,yaw:0};
async function api(path,body,cookie='',token=''){const res=await worker.fetch(new Request(origin+'/api/'+path,{method:body?'POST':'GET',headers:{Origin:origin,'Content-Type':'application/json','X-Pawtheon-Request':'1',Cookie:cookie,Authorization:'Bearer '+token},...(body?{body:JSON.stringify(body)}:{})}),{DB:db.DB});return {status:res.status,data:await res.json(),cookie:res.headers.get('Set-Cookie')?.split(';')[0]};}
async function signup(){const r=await api('accounts/signup',{username:'entry_'+randomBytes(5).toString('hex'),password:randomBytes(30).toString('base64url'),name:'Entry tester'});assert.equal(r.status,200);return r;}
try{
 assert.equal((await api('accounts/session')).data.user,null);
 for(const action of ['create','public-join','join','sync','message','chess','boat','lava','trade','chess-records','leave'])assert.equal((await api('multiplayer/'+action,{state})).status,401,action);
 const a=await signup(),b=await signup();const joined=await api('multiplayer/public-join',{state,name:'Forged guest name'},a.cookie);assert.equal(joined.status,200);const {room,token}=joined.data;
 assert.equal((await api('multiplayer/sync',{room,state},a.cookie,token)).status,200);
 assert.equal((await api('multiplayer/sync',{room,state},b.cookie,token)).status,401);
 assert.equal((await api('multiplayer/sync',{room,state},'',token)).status,401);
 // Historical guest token cannot be adopted by a signed-in account.
 await db.DB.prepare('UPDATE multiplayer_chess_members SET profile=? WHERE token=?').bind('guest-legacy',token).run();assert.equal((await api('multiplayer/sync',{room,state},a.cookie,token)).status,401);
 await db.DB.prepare('UPDATE multiplayer_chess_members SET profile=? WHERE token=?').bind('account:'+a.data.user.id,token).run();
 db.close();db=openRoomDatabase(file);assert.equal((await api('multiplayer/sync',{room,state},a.cookie,token)).status,200);
 assert.equal((await api('accounts/logout',{accountId:a.data.user.id},a.cookie)).status,200);assert.equal((await api('multiplayer/sync',{room,state},a.cookie,token)).status,401);
 assert.equal((await api('accounts/session',undefined,b.cookie)).data.user.id,b.data.user.id);
 console.log('PASS account-required all multiplayer endpoints, session health public, account-bound tokens, old guests denied, restart persistence, logout revocation and other accounts preserved');
}finally{db.close();rmSync(dir,{recursive:true,force:true});}
