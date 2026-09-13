import {BOAT_COURSE_VERSION} from '../public/boat-course-layout.js';
import {newBoatRace,applyBoatCommand,BOAT_STEP} from '../public/boat-race-core.js';
const fail=(error,status=400)=>({error,status});
export async function boatRequest(db,room,token,body,now){
 const member=await db.prepare('SELECT name,state FROM multiplayer_players WHERE token=? AND room=? AND updated>?').bind(token,room,now-60000).first();if(!member)return fail('Rejoin your room to race.',401);
 const self=token.slice(0,16),action=body.action||'state';
 await db.prepare('INSERT OR IGNORE INTO multiplayer_boat_races(room,state,revision) VALUES (?,?,0)').bind(room,JSON.stringify({id:crypto.randomUUID(),phase:'waiting',host:self,startsAt:0,course:BOAT_COURSE_VERSION})).run();
 let row=await db.prepare('SELECT state,revision FROM multiplayer_boat_races WHERE room=?').bind(room).first(),race=JSON.parse(row.state);
 if(race.course!==BOAT_COURSE_VERSION){const next={id:crypto.randomUUID(),phase:'waiting',host:self,startsAt:0,course:BOAT_COURSE_VERSION};const result=await db.prepare('UPDATE multiplayer_boat_races SET state=?,revision=revision+1 WHERE room=? AND revision=?').bind(JSON.stringify(next),room,row.revision).run();if(!result.meta.changes)return fail('The course changed. Reopen the grid.',409);race=next;row.revision++;}
 const active=await db.prepare('SELECT token FROM multiplayer_players WHERE room=? AND updated>?').bind(room,now-60000).all(),ids=new Set(active.results.map(p=>p.token.slice(0,16)));
 await db.prepare("UPDATE multiplayer_boat_entries SET status='dnf' WHERE room=? AND race=? AND status IN ('ready','racing') AND updated<?").bind(room,race.id,now-45000).run();
 let roster=(await db.prepare('SELECT * FROM multiplayer_boat_entries WHERE room=? AND race=? ORDER BY player').bind(room,race.id).all()).results;
 for(const p of roster)if(!ids.has(p.player)&&['ready','racing'].includes(p.status)){await db.prepare("UPDATE multiplayer_boat_entries SET status='dnf' WHERE room=? AND player=? AND race=?").bind(room,p.player,race.id).run();p.status='dnf';}
 if(action!=='state'&&action!=='join'&&action!=='new'&&body.race!==race.id)return fail('This race has changed. Refresh the race lobby.',409);
 let entry=roster.find(p=>p.player===self),changed=false;
 if(race.startsAt&&now>=race.startsAt&&race.phase==='countdown'){race.phase='racing';changed=true;}
 if(race.phase==='waiting'&&!roster.some(p=>p.player===race.host&&p.status==='ready')){const next=roster.find(p=>p.status==='ready')?.player;if(next&&next!==race.host){race.host=next;changed=true;}}
 if(['racing','countdown'].includes(race.phase)&&roster.length&&roster.every(p=>['finished','dnf'].includes(p.status))){race.phase='finished';changed=true;}
 if(action==='new'){
  if(race.phase!=='finished'&&roster.some(p=>['ready','racing'].includes(p.status)))return fail('Finish or leave the current race first.');
  race={id:crypto.randomUUID(),phase:'waiting',host:self,startsAt:0,course:BOAT_COURSE_VERSION};changed=true;roster=[];entry=null;
 }
 if(action==='join'||action==='new'){
  if(race.phase!=='waiting')return fail('A race is underway. Join the next race.');
  if(!entry||entry.status==='dnf'){const slot=roster.filter(p=>p.status==='ready').length;if(slot>=8)return fail('The starting grid is full.');const state=newBoatRace(slot),dog=JSON.parse(member.state).dog;
   await db.prepare('INSERT INTO multiplayer_boat_entries(room,player,race,name,dog,state,seq,status,updated,finished) VALUES (?,?,?,?,?,?,0,\'ready\',?,NULL) ON CONFLICT(room,player) DO UPDATE SET race=excluded.race,name=excluded.name,dog=excluded.dog,state=excluded.state,seq=0,status=excluded.status,updated=excluded.updated,finished=NULL').bind(room,self,race.id,member.name,dog,JSON.stringify(state),now).run();
  }
 }else if(action==='start'){
  if(race.phase!=='waiting'||race.host!==self)return fail('Only the race host can start the grid.');if(roster.filter(p=>p.status==='ready').length<2)return fail('At least two racers must join.');
  race.phase='countdown';race.startsAt=now+5000;changed=true;
 }else if(action==='leave'){
  await db.prepare("UPDATE multiplayer_boat_entries SET status='dnf',updated=? WHERE room=? AND player=? AND race=?").bind(now,room,self,race.id).run();
 }else if(action==='input'){
  if(!entry||!['ready','racing','finished'].includes(entry.status)||!race.startsAt)return fail('Join the next starting grid.');
  if(!Array.isArray(body.commands)||body.commands.length>30)return fail('Invalid boat commands.');
  const state=JSON.parse(entry.state);let seq=entry.seq;const budget=Math.floor(Math.max(0,now-race.startsAt)/1000/BOAT_STEP)+1;
  for(const c of body.commands){if(!Number.isSafeInteger(c.seq)||![-1,0,1].includes(c.steer)||typeof c.brake!=='boolean'||(c.recover!==undefined&&typeof c.recover!=='boolean'))return fail('Invalid boat input.');if(c.seq<=seq)continue;if(state.done)return fail('This racer has already finished.');if(c.seq!==seq+1||c.seq>budget)return fail('Boat clock is catching up. Try again.',409);if(now<race.startsAt)return fail('Wait for the shared start.',409);applyBoatCommand(state,c);seq=c.seq;if(state.done)break;}
  const status=state.done?'finished':now>=race.startsAt?'racing':'ready',finished=state.done?(entry.finished??(Math.max(state.time,(now-race.startsAt)/1000)+state.penalty)):null;
  const result=await db.prepare('UPDATE multiplayer_boat_entries SET state=?,seq=?,status=?,updated=?,finished=? WHERE room=? AND player=? AND race=? AND seq=?').bind(JSON.stringify(state),seq,status,now,finished,room,self,race.id,entry.seq).run();if(!result.meta.changes)return fail('Boat state changed. Refresh the race.',409);
 }else if(action!=='state')return fail('Unknown race action.');
 if(entry&&action==='state')await db.prepare('UPDATE multiplayer_boat_entries SET updated=? WHERE room=? AND player=? AND race=?').bind(now,room,self,race.id).run();
 if(changed){const result=await db.prepare('UPDATE multiplayer_boat_races SET state=?,revision=revision+1 WHERE room=? AND revision=?').bind(JSON.stringify(race),room,row.revision).run();if(!result.meta.changes)return fail('The starting grid changed. Try again.',409);}
 roster=(await db.prepare('SELECT player,name,dog,state,seq,status,finished FROM multiplayer_boat_entries WHERE room=? AND race=? ORDER BY player').bind(room,race.id).all()).results;
 return {race,serverNow:now,self,entries:roster.map(p=>({...p,state:JSON.parse(p.state)}))};
}
