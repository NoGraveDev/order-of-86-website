import {BOAT_COURSE_VERSION} from '../public/boat-course-layout.js';
import {chessRecords} from './chess-records.js';
const LAVA_COURSE='crucible-v1';
const remembered=new WeakMap();
function done(db,key,mark=false){let seen=remembered.get(db);if(!seen){seen=new Set();remembered.set(db,seen);}if(mark){if(seen.size>4096)seen.clear();seen.add(key);}return seen.has(key);}
// These helpers consume only persisted authoritative simulations, never a posted score.
async function profileFor(db,room,player,game,run){const saved=await db.prepare('SELECT profile FROM minigame_result_members WHERE game=? AND run=? AND player=?').bind(game,run,player).first();if(saved)return saved.profile;const profile=(await db.prepare("SELECT m.profile FROM multiplayer_chess_members m JOIN multiplayer_players p ON p.token=m.token JOIN player_accounts a ON m.profile='account:'||a.id WHERE p.room=? AND substr(p.token,1,16)=?").bind(room,player).first())?.profile;if(profile)await db.prepare('INSERT OR IGNORE INTO minigame_result_members(game,run,player,profile) VALUES(?,?,?,?)').bind(game,run,player,profile).run();return profile;}
export async function captureBoatResults(db,room,race,entries){
 if(!race.startsAt)return;const finished=entries.filter(p=>p.status==='finished'&&Number.isFinite(p.finished)&&p.finished>0);
 const settled=entries.length>0&&entries.every(p=>['finished','dnf'].includes(p.status));const best=finished.length?Math.min(...finished.map(p=>p.finished)):null;
 const winners=finished.filter(p=>p.finished===best);
 for(const p of finished){const key='boat:'+race.id+':'+p.player+':'+settled;if(done(db,key))continue;const profile=await profileFor(db,room,p.player,'boat',race.id);if(!profile)continue;
 await db.prepare("INSERT INTO minigame_results(game,run,profile,course,time,won,drawn,hits,finished) VALUES('boat',?,?,?,?,?,?,0,?) ON CONFLICT(game,run,profile) DO UPDATE SET won=MAX(won,excluded.won),drawn=MAX(drawn,excluded.drawn)").bind(race.id,profile,race.course||BOAT_COURSE_VERSION,p.finished,settled&&p.finished===best&&winners.length===1?1:0,settled&&p.finished===best&&winners.length>1?1:0,Math.round(race.startsAt+p.finished*1000)).run();done(db,key,true);}
}
export async function captureLavaResults(db,room,round){
 if(round.phase!=='finished'||!round.startsAt||done(db,'lava:'+round.id))return;
 for(const p of round.players.filter(p=>['alive','out'].includes(p.status))){const profile=await profileFor(db,room,p.id,'lava',round.id);if(!profile)continue;const winner=round.winners.includes(p.id);
 await db.prepare("INSERT OR IGNORE INTO minigame_results(game,run,profile,course,time,won,drawn,hits,finished) VALUES('lava',?,?,?,?,?,?,?,?)").bind(round.id,profile,LAVA_COURSE,Math.max(0,(round.tickAt-round.startsAt)/1000),winner&&round.winners.length===1?1:0,winner&&round.winners.length>1?1:0,Number.isInteger(p.hits)?p.hits:0,round.tickAt).run();}
 done(db,'lava:'+round.id,true);
}
const parsed=v=>{try{return JSON.parse(v||'{}');}catch{return {};}};
const validTime=v=>typeof v==='number'&&Number.isFinite(v)&&v>0&&v<864000?v:null;
const fastest=(...values)=>{const valid=values.map(validTime).filter(v=>v!==null);return valid.length?Math.min(...valid):null;};
export function savedTimes(row){const records=parsed(row.records);return {sled:fastest(records.sled?.bestTime,parsed(row.sled)),boatSolo:fastest(records.boat?.bestTime,parsed(row.boat)),maze9:validTime(records.maze9?.bestTime),maze13:validTime(records.maze13?.bestTime),maze86:validTime(records.maze86?.bestTime),crossword:validTime(records.crossword?.bestTime)};}
export async function minigameRecords(db,profile){
 const result={chess:await chessRecords(db,profile),verified:{},leaders:{},savedLeaders:{},coverage:'Boat and Floor Is Lava finish histories start with this update. Earlier results were not retained. Existing personal bests remain available.'};
 for(const [game,course]of [['boat',BOAT_COURSE_VERSION],['lava',LAVA_COURSE]]){
 const summary=await db.prepare('SELECT COUNT(*) AS games,COALESCE(SUM(won),0) AS wins,COALESCE(SUM(drawn),0) AS draws,MIN(time) AS bestTime FROM minigame_results WHERE game=? AND profile=? AND course=?').bind(game,profile,course).first();
 const recent=(await db.prepare('SELECT run,time,won,drawn,hits,finished FROM minigame_results WHERE game=? AND profile=? AND course=? ORDER BY finished DESC LIMIT 8').bind(game,profile,course).all()).results;
 result.verified[game]={...summary,losses:summary.games-summary.wins-summary.draws,recent,course};
 const order=game==='boat'?'bestTime ASC,wins DESC,games DESC,a.id':'wins DESC,draws DESC,games ASC,a.id';
 result.leaders[game]=(await db.prepare("SELECT a.id,a.name,COUNT(*) AS games,SUM(r.won) AS wins,SUM(r.drawn) AS draws,MIN(r.time) AS bestTime FROM minigame_results r JOIN player_accounts a ON r.profile='account:'||a.id WHERE r.game=? AND r.course=? GROUP BY a.id ORDER BY "+order+' LIMIT 20').bind(game,course).all()).results.map(({id,...r})=>({...r,self:'account:'+id===profile}));
 }
 // Existing solo result fields are player-reported, not verified simulations. No rewards are granted here.
 const rows=(await db.prepare(`SELECT id,name,json_extract(save,'$."pawtheon-minigame-records-v1"') AS records,json_extract(save,'$."pawtheon-sled-best-v3"') AS sled,json_extract(save,'$."pawtheon-tide-run-best-river-v3"') AS boat FROM player_accounts`).all()).results;
 for(const game of ['sled','boatSolo','maze9','maze13','maze86','crossword'])result.savedLeaders[game]=rows.map(row=>({name:row.name,time:savedTimes(row)[game],self:'account:'+row.id===profile})).filter(r=>r.time!==null).sort((a,b)=>a.time-b.time||a.name.localeCompare(b.name)).slice(0,20);
 return result;
}
