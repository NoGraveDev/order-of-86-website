import {findStarter} from '../public/starter-dogs.js';
import {shopItems} from '../public/moon-shop-core.js';
import {lavaRequest} from './lava-arena.js';
import {tradeRequest} from './trades.js';
import {orderJourney} from '../public/order-progression.js';
import {accountRequest,currentAccount} from './accounts.js';
import {boatRequest} from './boat-races.js';
import {profileId,chessRecords} from './chess-records.js';
import {chessRequest} from './chess.js';
import {WORLD_RADIUS} from '../public/world-scale.js';
import {height} from '../public/geography.js';
import {wizards} from '../public/wizards.js';
import {roomEmotes} from '../public/room-emotes.js';
const dogIds=new Set(wizards.map(d=>d.id));
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
const secret=()=>crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');
const validSecret=s=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s);
function stateOf(s){if(!s||!dogIds.has(s.dog))throw Error('Choose a valid wizard.');for(const k of ['x','y','z','yaw'])if(!Number.isFinite(s[k]))throw Error('Invalid player position.');if(Math.hypot(s.x,s.z)>WORLD_RADIUS+1||s.y< -40||s.y>800)throw Error('Outside the world.');return {dog:s.dog,starter:findStarter(s.starter)?.id||null,x:s.x,y:s.y,z:s.z,yaw:s.yaw,spell:Number.isSafeInteger(s.spell)?s.spell:0,flying:s.dog===8667&&!!s.flying,moving:!!s.moving,invisible:s.gear?.item==='cloak'&&Number.isInteger(s.gear.level)&&s.gear.level>=1&&s.gear.level<=3&&s.invisible===true,...(shopItems.some(i=>i.id===s.gear?.item&&Number.isInteger(s.gear.level)&&s.gear.level>=1&&s.gear.level<=i.costs.length)?{gear:{item:s.gear.item,level:s.gear.level}}:{}),...(s.secondaryGear?.item!==s.gear?.item&&shopItems.some(i=>i.id===s.secondaryGear?.item&&Number.isInteger(s.secondaryGear.level)&&s.secondaryGear.level>=1&&s.secondaryGear.level<=i.costs.length)?{secondaryGear:{item:s.secondaryGear.item,level:s.secondaryGear.level}}:{})}}
async function validateWanderer(request,db,now,state){if(state.dog!==6164)return;const a=await currentAccount(request,db,now);if(!a||!orderJourney(JSON.parse(a.save)).wandererUnlocked)throw Error('Invalid wizard selection: master all six Orders to level 50 on your account to unlock the Wanderer.');}
export default {async fetch(request,env){const url=new URL(request.url);if(url.pathname.startsWith('/api/accounts/'))return accountRequest(request,env.DB);if(!url.pathname.startsWith('/api/multiplayer/'))return env.ASSETS.fetch(request);if(request.method!=='POST')return json({error:'Use POST.'},405);if(request.headers.get('Origin')&&request.headers.get('Origin')!==url.origin)return json({error:'Origin rejected.'},403);if(!env.DB)return json({error:'Multiplayer is temporarily unavailable. Solo play is unaffected.'},503);
 try{const raw=await request.text();if(raw.length>4096)return json({error:'Request too large.'},413);const body=JSON.parse(raw),action=url.pathname.split('/').at(-1),now=Date.now();const db=env.DB;
 if(action==='create'){const id=secret();await db.batch([db.prepare('DELETE FROM multiplayer_players WHERE updated < ?').bind(now-120000),db.prepare('DELETE FROM multiplayer_messages WHERE room IN (SELECT id FROM multiplayer_rooms WHERE expires < ?)').bind(now),db.prepare('DELETE FROM multiplayer_chess WHERE room IN (SELECT id FROM multiplayer_rooms WHERE expires < ?)').bind(now),db.prepare('DELETE FROM multiplayer_boat_entries WHERE room IN (SELECT id FROM multiplayer_rooms WHERE expires < ?)').bind(now),db.prepare('DELETE FROM multiplayer_boat_races WHERE room IN (SELECT id FROM multiplayer_rooms WHERE expires < ?)').bind(now),db.prepare('DELETE FROM multiplayer_lava_arenas WHERE room IN (SELECT id FROM multiplayer_rooms WHERE expires < ?)').bind(now),db.prepare('DELETE FROM multiplayer_rooms WHERE expires < ?').bind(now),db.prepare('INSERT INTO multiplayer_rooms (id,expires) VALUES (?,?)').bind(id,now+86400000)]);return json({room:id})}
 if(action==='public-join'){
 const account=await currentAccount(request,db,now),name=account?account.name:(typeof body.name==='string'?body.name.trim().slice(0,24):'');
 if(!name)return json({error:'Enter a player name.'},400);
 const token=secret(),candidate=secret(),state=stateOf(body.state);await validateWanderer(request,db,now,state);
 const profile=account?'account:'+account.id:await profileId(validSecret(body.profileKey)?body.profileKey:token);
 const angle=parseInt(token.slice(0,8),16)/4294967296*Math.PI*2;state.x=Math.sin(angle)*10;state.z=15+Math.cos(angle)*10;state.y=height(state.x,state.z);
 // D1 batch is transactional: choosing/creating a room and claiming its seat cannot race.
 // Reserve boat reconnect grace seats too, so returning racers cannot become player nine.
 const available=`SELECT r.id FROM multiplayer_rooms r JOIN multiplayer_public_rooms q ON q.room=r.id WHERE r.expires>? AND (SELECT COUNT(*) FROM multiplayer_players p WHERE p.room=r.id AND (p.updated>? OR (p.updated>? AND EXISTS (SELECT 1 FROM multiplayer_boat_entries b WHERE b.room=p.room AND b.player=substr(p.token,1,16) AND b.status IN ('ready','racing')))))<8 ORDER BY q.created,q.room LIMIT 1`;
 await db.batch([
 db.prepare('DELETE FROM multiplayer_players WHERE updated < ?').bind(now-120000),db.prepare('DELETE FROM multiplayer_messages WHERE room IN (SELECT id FROM multiplayer_rooms WHERE expires < ?)').bind(now),db.prepare('DELETE FROM multiplayer_chess WHERE room IN (SELECT id FROM multiplayer_rooms WHERE expires < ?)').bind(now),db.prepare('DELETE FROM multiplayer_boat_entries WHERE room IN (SELECT id FROM multiplayer_rooms WHERE expires < ?)').bind(now),db.prepare('DELETE FROM multiplayer_boat_races WHERE room IN (SELECT id FROM multiplayer_rooms WHERE expires < ?)').bind(now),db.prepare('DELETE FROM multiplayer_lava_arenas WHERE room IN (SELECT id FROM multiplayer_rooms WHERE expires < ?)').bind(now),db.prepare('DELETE FROM multiplayer_rooms WHERE expires < ?').bind(now),
 db.prepare('DELETE FROM multiplayer_public_rooms WHERE room NOT IN (SELECT id FROM multiplayer_rooms WHERE expires>?)').bind(now),
 db.prepare(`INSERT INTO multiplayer_rooms(id,expires) SELECT ?,? WHERE NOT EXISTS (${available})`).bind(candidate,now+86400000,now,now-20000,now-60000),
 db.prepare('INSERT INTO multiplayer_public_rooms(room,created) SELECT id,? FROM multiplayer_rooms WHERE id=?').bind(now,candidate),
 db.prepare(`INSERT INTO multiplayer_players(token,room,name,state,updated) SELECT ?,id,?,?,? FROM (${available})`).bind(token,name,JSON.stringify(state),now,now,now-20000,now-60000),
 db.prepare('INSERT INTO multiplayer_chess_profiles (id,name) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name').bind(profile,name),
 db.prepare('INSERT INTO multiplayer_chess_members (token,profile) VALUES (?,?)').bind(token,profile)
 ]);
 const joined=await db.prepare('SELECT room FROM multiplayer_players WHERE token=?').bind(token).first();
 if(!joined)return json({error:'Unable to find a lobby. Please try again.'},503);
 return json({room:joined.room,token,public:true,spawn:{x:state.x,y:state.y,z:state.z}});
 }
 if(!validSecret(body.room))return json({error:'Invalid invitation.'},400);const room=await db.prepare('SELECT id FROM multiplayer_rooms WHERE id=? AND expires>?').bind(body.room,now).first();if(!room)return json({error:'Room expired. Create a new invitation.'},404);
 if(action==='join'){const account=await currentAccount(request,db,now);const name=account?account.name:(typeof body.name==='string'?body.name.trim().slice(0,24):'');if(!name)return json({error:'Enter a player name.'},400);const token=secret(),state=stateOf(body.state);await validateWanderer(request,db,now,state);const profile=account?'account:'+account.id:await profileId(validSecret(body.profileKey)?body.profileKey:token);const angle=parseInt(token.slice(0,8),16)/4294967296*Math.PI*2;state.x=Math.sin(angle)*10;state.z=15+Math.cos(angle)*10;state.y=height(state.x,state.z);const result=await db.prepare("INSERT INTO multiplayer_players (token,room,name,state,updated) SELECT ?,?,?,?,? WHERE (SELECT COUNT(*) FROM multiplayer_players p WHERE room=? AND (updated>? OR (updated>? AND EXISTS (SELECT 1 FROM multiplayer_boat_entries b WHERE b.room=p.room AND b.player=substr(p.token,1,16) AND b.status IN ('ready','racing')))))<8").bind(token,body.room,name,JSON.stringify(state),now,body.room,now-20000,now-60000).run();if(!result.meta.changes)return json({error:'This room is full (8 players).'},409);await db.batch([db.prepare('INSERT INTO multiplayer_chess_profiles (id,name) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name').bind(profile,name),db.prepare('INSERT INTO multiplayer_chess_members (token,profile) VALUES (?,?)').bind(token,profile)]);return json({token,public:!!await db.prepare('SELECT room FROM multiplayer_public_rooms WHERE room=?').bind(body.room).first(),spawn:{x:state.x,y:state.y,z:state.z}})}
 const token=request.headers.get('Authorization')?.replace(/^Bearer /,'');if(!validSecret(token))return json({error:'Please rejoin the room.'},401);
 if(action==='trade'){try{const result=await tradeRequest(request,db,body.room,token,body,now);return json(result,result.status||200);}catch(e){if(/Invalid|offered|Offered|already owns/.test(e.message))return json({error:e.message},400);throw e;}}
 if(action==='lava'){const result=await lavaRequest(db,body.room,token,body,now);return json(result,result.status||200)}
 if(action==='boat'){const result=await boatRequest(db,body.room,token,body,now);return json(result,result.status||200)}
 if(action==='chess-records'){const member=await db.prepare('SELECT m.profile FROM multiplayer_chess_members m JOIN multiplayer_players p ON p.token=m.token WHERE p.token=? AND p.room=? AND p.updated>?').bind(token,body.room,now-20000).first();if(!member)return json({error:'Please rejoin the room.'},401);return json(await chessRecords(db,member.profile));}
 if(action==='chess'){const result=await chessRequest(db,body.room,token,body,now);return json(result,result.status||200)}
 if(action==='leave'){await db.prepare('DELETE FROM multiplayer_players WHERE token=? AND room=?').bind(token,body.room).run();return json({ok:true})}
 if(action==='message'){
 const member=await db.prepare('SELECT name FROM multiplayer_players WHERE token=? AND room=? AND updated>?').bind(token,body.room,now-20000).first();if(!member)return json({error:'Please rejoin the room.'},401);
 const kind=body.kind,text=typeof body.text==='string'?body.text.trim():'';
 if(!['chat','emote'].includes(kind)||!text||text.length>240||(kind==='emote'&&!Object.hasOwn(roomEmotes,text)))return json({error:'Choose an emote or write 1–240 characters.'},400);
 const sender=token.slice(0,16);
 const result=await db.prepare('INSERT INTO multiplayer_messages(room,sender,name,kind,text,created) SELECT ?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM multiplayer_messages WHERE room=? AND sender=? AND created>?)').bind(body.room,sender,member.name,kind,text,now,body.room,sender,now-1000).run();
 if(!result.meta.changes)return json({error:'Give your pack a moment—try again in a second.'},429);
 await db.prepare('DELETE FROM multiplayer_messages WHERE room=? AND id NOT IN (SELECT id FROM multiplayer_messages WHERE room=? ORDER BY id DESC LIMIT 100)').bind(body.room,body.room).run();return json({ok:true});
 }
 if(action!=='sync')return json({error:'Unknown action.'},404);
 const state=stateOf(body.state);await validateWanderer(request,db,now,state);const result=await db.prepare("UPDATE multiplayer_players SET state=?,updated=? WHERE token=? AND room=? AND (updated>? OR (updated>? AND EXISTS (SELECT 1 FROM multiplayer_boat_entries b WHERE b.room=multiplayer_players.room AND b.player=substr(multiplayer_players.token,1,16) AND b.status IN ('ready','racing'))))").bind(JSON.stringify(state),now,token,body.room,now-20000,now-60000).run();if(!result.meta.changes)return json({error:'Connection expired. Rejoin this room.'},401);
 const rows=await db.prepare('SELECT token,name,state FROM multiplayer_players WHERE room=? AND updated>?').bind(body.room,now-20000).all();const cursor=Number.isSafeInteger(body.after)&&body.after>=0?body.after:0;const messages=await db.prepare('SELECT * FROM (SELECT id,sender,name,kind,text,created FROM multiplayer_messages WHERE room=? AND id>? ORDER BY id DESC LIMIT 100) ORDER BY id').bind(body.room,cursor).all();return json({messages:messages.results.map(m=>({...m,self:m.sender===token.slice(0,16)})),players:rows.results.map(p=>({id:p.token===token?'self':p.token.slice(0,16),name:p.name,...JSON.parse(p.state)}))});
 }catch(e){if(e instanceof SyntaxError||/valid|Outside/.test(e.message))return json({error:e.message},400);console.error('Multiplayer request failed',e.message);return json({error:'Room service unavailable. Retry or return to solo.'},503)}}};
