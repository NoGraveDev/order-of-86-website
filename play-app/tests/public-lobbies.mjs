import {randomBytes} from 'node:crypto';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openRoomDatabase} from '../scripts/preview-database.mjs';
import worker from '../worker/index.js';
const dir=await mkdtemp(join(tmpdir(),'public-lobbies-')),file=join(dir,'rooms.sqlite');let db=openRoomDatabase(file);
let cookie;
const state={dog:5035,x:0,y:0,z:15,yaw:0};
async function api(action,body={},token='',origin='https://game.test'){const res=await worker.fetch(new Request('https://game.test/api/multiplayer/'+action,{method:'POST',headers:{Origin:origin,Cookie:cookie,Authorization:'Bearer '+token},body:JSON.stringify(body)}),{DB:db.DB});return {status:res.status,...await res.json()};}
const enter=i=>api('public-join',{name:'Guest '+i,state});
try {
 const signup=await worker.fetch(new Request('https://game.test/api/accounts/signup',{method:'POST',headers:{Origin:'https://game.test','Content-Type':'application/json','X-Pawtheon-Request':'1'},body:JSON.stringify({username:'lobby_'+randomBytes(5).toString('hex'),password:randomBytes(30).toString('base64url'),name:'Member'})}),{DB:db.DB});assert.equal(signup.status,200);cookie=signup.headers.get('Set-Cookie').split(';')[0];

 const privateRoom=(await api('create')).room;
 const players=await Promise.all(Array.from({length:65},(_,i)=>enter(i)));
 assert(players.every(p=>p.status===200&&p.public));
 const counts=new Map();for(const p of players)counts.set(p.room,(counts.get(p.room)||0)+1);
 assert.deepEqual([...counts.values()].sort((a,b)=>b-a),[8,8,8,8,8,8,8,8,1]);assert(!counts.has(privateRoom));
 await Promise.all(Array.from({length:7},(_,i)=>enter(100+i)));
 const first=players[0],same=players.filter(p=>p.room===first.room);assert.equal((await api('sync',{room:first.room,state},first.token)).players.length,8);
 assert.equal((await api('join',{room:first.room,name:'Ninth',state})).status,409);
 await api('leave',{room:first.room},first.token);const replacement=await enter(66);assert.equal(replacement.room,first.room);
 const second=same[1];await db.DB.prepare('UPDATE multiplayer_players SET updated=? WHERE token=?').bind(Date.now()-70000,second.token).run();const recovered=await enter(67);assert.equal(recovered.room,first.room);assert.equal((await api('sync',{room:first.room,state},second.token)).status,401);
 // A disconnected racer keeps its seat for 60 seconds, unlike the normal 20-second lease.
 const racer=same[2];await db.DB.prepare('INSERT INTO multiplayer_boat_entries(room,player,race,name,dog,state,status,updated) VALUES(?,?,?,?,?,?,?,?)').bind(first.room,racer.token.slice(0,16),'grace-test','Racer',5035,'{}','racing',Date.now()).run();
 await db.DB.prepare('UPDATE multiplayer_players SET updated=? WHERE token=?').bind(Date.now()-30000,racer.token).run();
 assert.equal((await api('join',{room:first.room,name:'No ninth racer',state})).status,409);
 const overflow=await enter(108);assert.notEqual(overflow.room,first.room);
 assert.equal((await api('sync',{room:first.room,state},racer.token)).status,200);
 assert.equal((await api('sync',{room:privateRoom,state},replacement.token)).status,401);
 const invite=await api('join',{room:privateRoom,name:'Friend',state});assert.equal(invite.status,200);assert.equal(invite.public,false);
 assert.equal((await api('public-join',{name:'',state})).status,200);assert.equal((await api('public-join',{name:'Invalid',state:{...state,dog:6164}})).status,400);
 assert.equal((await api('public-join',{name:'Cross origin',state},'','https://evil.test')).status,403);
 db.close();db=openRoomDatabase(file);assert.equal((await api('sync',{room:replacement.room,state},replacement.token)).status,200);
 await db.DB.prepare('UPDATE multiplayer_rooms SET expires=0 WHERE id=?').bind(first.room).run();assert.notEqual((await enter(68)).room,first.room);
 console.log('PASS: 65 concurrent joins → eight full lobbies + ninth lobby; private isolation, direct-invite cap, leave refill, stale replacement/rejection, validation, restart and room expiry.');
}finally{db.close();await rm(dir,{recursive:true,force:true});}
