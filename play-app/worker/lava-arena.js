import {newArena,arenaPlayer,advanceArena,validArenaInput,gate} from '../public/lava-arena-core.js';
const fail=(error,status=400)=>({error,status});
async function updateLava(db,room,token,body,now){
 const member=await db.prepare('SELECT name,state FROM multiplayer_players WHERE room=? AND token=? AND updated>?').bind(room,token,now-20000).first();if(!member)return fail('Rejoin your room to play.',401);
 const action=body.action||'state',self=token.slice(0,16);if(!['state','join','start','input','leave','new'].includes(action))return fail('Unknown arena action.');if(action==='input'&&!validArenaInput(body))return fail('Invalid arena input.');
 await db.prepare('INSERT OR IGNORE INTO multiplayer_lava_arenas(room,state,revision) VALUES (?,?,0)').bind(room,JSON.stringify(newArena(crypto.randomUUID(),now))).run();
 const row=await db.prepare('SELECT state,revision FROM multiplayer_lava_arenas WHERE room=?').bind(room).first();let s=JSON.parse(row.state);
 const present=(await db.prepare('SELECT token FROM multiplayer_players WHERE room=? AND updated>?').bind(room,now-20000).all()).results.map(p=>p.token.slice(0,16));for(const p of s.players)if(!present.includes(p.id))p.status='left';
 advanceArena(s,now);let p=s.players.find(p=>p.id===self);
 if(!['state','join'].includes(action)&&body.round!==s.id)return fail('The round changed. Reopen the arena.',409);
 if(action==='new'){if(s.phase!=='finished')return fail('Finish this round first.');s=newArena(crypto.randomUUID(),now);p=null;}
 if(action==='join'||action==='new'){
 const pose=JSON.parse(member.state);if(Math.hypot(pose.x-gate.x,pose.z-gate.z)>12||Math.abs(pose.y-gate.y)>10)return fail('Walk to the Crucible arena entrance first.');
 if(s.phase!=='waiting')return fail('A round is underway. Join the next one.');if(!p||p.status==='left'){s.players=s.players.filter(v=>v.status!=='left');if(s.players.length>=8)return fail('The arena is full.');const used=new Set(s.players.map(v=>v.slot));let slot=0;while(used.has(slot))slot++;p={...arenaPlayer(self,member.name,pose.dog,slot,now),slot};s.players.push(p);}if(!s.host)s.host=self;
 }else if(action==='start'){if(s.phase!=='waiting'||s.host!==self)return fail('Only the arena host can start.');if(s.players.filter(p=>p.status==='ready').length<2)return fail('At least two players must join.');s.phase='countdown';s.startsAt=now+4000;
 }else if(action==='leave'){if(p)p.status='left';advanceArena(s,now);
 }else if(action==='input'){if(!p)return fail('Join the next round to play.');if(['countdown','playing'].includes(s.phase)&&['ready','alive'].includes(p.status)&&body.seq>p.seq){p.seq=body.seq;p.input={x:body.input.x,z:body.input.z,aim:body.input.aim,shoot:body.input.shoot,jump:body.input.jump,sprint:body.input.sprint===true};p.inputAt=now;}}
 if(p)p.lastSeen=now;
 const r=await db.prepare('UPDATE multiplayer_lava_arenas SET state=?,revision=revision+1 WHERE room=? AND revision=?').bind(JSON.stringify(s),room,row.revision).run();if(!r.meta.changes)return fail('Arena sync changed. Try the next update.',409);
 return {self,serverNow:now,revision:row.revision+1,round:s};
}

// Serialize same-room work in one runtime, retaining database CAS across runtimes.
const queues=new WeakMap();
export function lavaRequest(db,room,token,body,now){let rooms=queues.get(db);if(!rooms){rooms=new Map();queues.set(db,rooms);}const previous=rooms.get(room)||Promise.resolve();const task=previous.catch(()=>{}).then(()=>updateLava(db,room,token,body,now));rooms.set(room,task);task.finally(()=>{if(rooms.get(room)===task)rooms.delete(room);}).catch(()=>{});return task;}
