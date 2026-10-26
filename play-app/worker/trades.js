import {currentAccount} from './accounts.js';
import {readOffer,emptyOffer,exchangeInventories} from '../public/trade-core.js';
import {shopView} from '../public/moon-shop-core.js';
const fail=(error,status=400)=>({error,status});
export async function tradeRequest(request,db,room,token,body,now){
 const actor=await currentAccount(request,db,now);if(!actor)return fail('Sign in to trade and keep your inventory.',401);
 const member=await db.prepare('SELECT p.*,m.profile FROM multiplayer_players p JOIN multiplayer_chess_members m ON m.token=p.token WHERE p.token=? AND p.room=? AND p.updated>?').bind(token,room,now-20000).first();if(!member||member.profile!=='account:'+actor.id)return fail('Rejoin this room with your signed-in account.',403);
 await db.prepare("UPDATE player_trades SET status='expired' WHERE status='pending' AND expires<=?").bind(now).run();
 const op=body.operation;
 async function view(t){const a=await db.prepare('SELECT id,name,save,revision FROM player_accounts WHERE id=?').bind(t.account_a).first(),b=await db.prepare('SELECT id,name,save,revision FROM player_accounts WHERE id=?').bind(t.account_b).first();return {id:t.id,version:t.version,status:t.status,expires:t.expires,mine:t.account_a===actor.id?'a':'b',a:{player:t.token_a.slice(0,16),name:a.name,offer:JSON.parse(t.offer_a),accepted:!!t.accepted_a,inventory:inventory(a)},b:{player:t.token_b.slice(0,16),name:b.name,offer:JSON.parse(t.offer_b),accepted:!!t.accepted_b,inventory:inventory(b)}};}
 function inventory(a){const s=shopView(JSON.parse(a.save));return {shards:s.balance,scales:s.scales,leaves:s.leaves,lizards:s.lizards,gear:s.owned};}
 if(op==='list'){const rows=await db.prepare('SELECT * FROM player_trades WHERE room=? AND (account_a=? OR account_b=?) ORDER BY created DESC LIMIT 12').bind(room,actor.id,actor.id).all();return {trades:await Promise.all(rows.results.map(view))};}
 if(op==='request'){
  if(typeof body.target!=='string'||!/^[a-f0-9]{16}$/.test(body.target))return fail('Choose a nearby player.');const peer=await db.prepare('SELECT p.*,m.profile FROM multiplayer_players p JOIN multiplayer_chess_members m ON m.token=p.token WHERE p.room=? AND substr(p.token,1,16)=? AND p.updated>?').bind(room,body.target,now-20000).first();if(!peer?.profile.startsWith('account:'))return fail('Both players must sign in before trading.');const other=await db.prepare('SELECT * FROM player_accounts WHERE id=?').bind(peer.profile.slice(8)).first();if(!other||other.id===actor.id)return fail('Choose another player account.');if(!near(member,peer))return fail('Move within 8 meters of a visible player to trade.');
  const id=crypto.randomUUID(),result=await db.prepare("INSERT INTO player_trades(id,room,account_a,account_b,token_a,token_b,offer_a,offer_b,revision_a,revision_b,created,expires) SELECT ?,?,?,?,?,?,?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM player_trades WHERE status='pending' AND (account_a IN (?,?) OR account_b IN (?,?)))").bind(id,room,actor.id,other.id,token,peer.token,JSON.stringify(emptyOffer()),JSON.stringify(emptyOffer()),actor.revision,other.revision,now,now+600000,actor.id,other.id,actor.id,other.id).run();if(!result.meta.changes)return fail('One of you already has an open trade. Finish or cancel it first.',409);return {trade:await view(await db.prepare('SELECT * FROM player_trades WHERE id=?').bind(id).first())};
 }
 let t=await db.prepare('SELECT * FROM player_trades WHERE id=? AND room=? AND (account_a=? OR account_b=?)').bind(body.id,room,actor.id,actor.id).first();if(!t)return fail('Trade not found.',404);if(t.status!=='pending')return {trade:await view(t)};
 if(body.version!==t.version)return fail('The offer changed. Review the latest items before confirming.',409);
 if(op==='cancel'){await db.prepare("UPDATE player_trades SET status='cancelled',version=version+1 WHERE id=? AND version=? AND status='pending'").bind(t.id,t.version).run();return {trade:await view(await db.prepare('SELECT * FROM player_trades WHERE id=?').bind(t.id).first())};}
 const players=await Promise.all([t.token_a,t.token_b].map(k=>db.prepare('SELECT * FROM multiplayer_players WHERE token=? AND room=? AND updated>?').bind(k,room,now-20000).first()));if(!players[0]||!players[1]||!near(...players))return fail('Both players must stay nearby and connected to complete the trade.');
 const a=await db.prepare('SELECT * FROM player_accounts WHERE id=?').bind(t.account_a).first(),b=await db.prepare('SELECT * FROM player_accounts WHERE id=?').bind(t.account_b).first();
 let result;
 if(op==='offer'){
  const oa=readOffer(body.a),ob=readOffer(body.b);exchangeInventories(JSON.parse(a.save),JSON.parse(b.save),oa,ob);
  result=await db.prepare("UPDATE player_trades SET offer_a=?,offer_b=?,accepted_a=0,accepted_b=0,revision_a=?,revision_b=?,version=version+1 WHERE id=? AND version=? AND status='pending'").bind(JSON.stringify(oa),JSON.stringify(ob),a.revision,b.revision,t.id,t.version).run();
 }else if(op==='accept'){
  if(a.revision!==t.revision_a||b.revision!==t.revision_b){await db.prepare("UPDATE player_trades SET revision_a=?,revision_b=?,accepted_a=0,accepted_b=0,version=version+1 WHERE id=? AND version=? AND status='pending'").bind(a.revision,b.revision,t.id,t.version).run();return fail('An inventory changed. Both players must review and confirm again.',409);}
  const oa=JSON.parse(t.offer_a),ob=JSON.parse(t.offer_b);if(![oa,ob].some(o=>o.shards||o.scales||o.leaves||o.gear.length||Object.values(o.lizards||{}).some(n=>n>0)))return fail('Add an item or price before confirming.');const saves=exchangeInventories(JSON.parse(a.save),JSON.parse(b.save),oa,ob),side=t.account_a===actor.id?'a':'b',other=side==='a'?'b':'a';if(t['accepted_'+side])return {trade:await view(t)};
  if(t['accepted_'+other]){try{result=await db.prepare("UPDATE player_trades SET accepted_a=1,accepted_b=1,status='completed',result_a=?,result_b=?,version=version+1 WHERE id=? AND version=? AND status='pending'").bind(JSON.stringify(saves[0]),JSON.stringify(saves[1]),t.id,t.version).run();}catch(e){if(/Trade inventory changed/.test(e.message))return fail('An inventory changed. Review and confirm again.',409);throw e;}}
  else result=await db.prepare(`UPDATE player_trades SET accepted_${side}=1,version=version+1 WHERE id=? AND version=? AND status='pending'`).bind(t.id,t.version).run();
 }else return fail('Unknown trade action.');
 if(!result.meta.changes)return fail('The trade changed. Review the latest offer.',409);return {trade:await view(await db.prepare('SELECT * FROM player_trades WHERE id=?').bind(t.id).first())};
}
function near(a,b){const x=JSON.parse(a.state),y=JSON.parse(b.state);return !x.invisible&&!y.invisible&&x.y>=-20&&y.y>=-20&&Math.hypot(x.x-y.x,x.y-y.y,x.z-y.z)<=8;}
