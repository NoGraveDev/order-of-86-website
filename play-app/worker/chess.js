import {chessRecords} from './chess-records.js';
import {newTable,chessAction} from '../public/chess-state.js';
export async function chessRequest(db,room,token,body,now){
 const member=await db.prepare('SELECT name FROM multiplayer_players WHERE token=? AND room=? AND updated>?').bind(token,room,now-20000).first();
 if(!member)return {status:401,error:'Please rejoin the room.'};
 await db.prepare('INSERT OR IGNORE INTO multiplayer_chess (room,state,revision) VALUES (?,?,0)').bind(room,JSON.stringify(newTable())).run();
 const row=await db.prepare('SELECT state,revision FROM multiplayer_chess WHERE room=?').bind(room).first();
 let table=JSON.parse(row.state);table.gameId||=crypto.randomUUID();const membership=await db.prepare('SELECT profile FROM multiplayer_chess_members WHERE token=?').bind(token).first();const profile=membership?.profile||token.slice(0,16);let finished=null;const capture=()=>{if(table.outcome)finished={game:table.gameId,outcome:structuredClone(table.outcome),reason:table.result};};const id=token.slice(0,16);
 const active=await db.prepare('SELECT token FROM multiplayer_players WHERE room=? AND updated>?').bind(room,now-20000).all();
 const ids=new Set(active.results.map(p=>p.token.slice(0,16)));let changed=false;
 for(const seat of Object.values(table.seats))if(seat&&!ids.has(seat.id)){table=chessAction(table,seat.id,seat.name,'stand');capture();changed=true;}
 if(body.action!=='state'){
  if(body.revision!==row.revision)return {status:409,error:'The board changed. Please try your move again.'};
  try{if(body.action==='sit'&&Object.values(table.seats).some(s=>s?.profile===profile))throw Error('This player already has a seat. Use another player’s browser for your opponent.');table=chessAction(table,id,member.name,body.action,body);if(body.action==='sit')table.seats[body.color].profile=profile;capture();changed=true;}catch(e){return {status:400,error:e.message};}
 }
 if(changed){
  const state=JSON.stringify(table),statements=[db.prepare('UPDATE multiplayer_chess SET state=?,revision=revision+1 WHERE room=? AND revision=?').bind(state,room,row.revision)];
  if(finished){const seats=finished.outcome.seats;
   if(seats.w?.profile&&seats.b?.profile&&seats.w.profile!==seats.b.profile)for(const color of ['w','b']){
    const seat=seats[color];statements.push(db.prepare('INSERT OR IGNORE INTO multiplayer_chess_scores (game,profile,won,drawn,reason,finished) SELECT ?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM multiplayer_chess WHERE room=? AND revision=? AND state=?)').bind(finished.game,seat.profile,Number(finished.outcome.winner===color),Number(finished.outcome.winner===null),finished.reason,now,room,row.revision+1,state));
   }
  }
  const results=await db.batch(statements);if(!results[0].meta.changes)return {status:409,error:'The board changed. Please try again.'};
 }

 return {table,revision:row.revision+(changed?1:0),self:id,...await chessRecords(db,profile)};
}
