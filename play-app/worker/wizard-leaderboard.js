import {orderJourney} from '../public/order-progression.js';
import {ORDER_IDS} from '../public/order-spells.js';
export async function wizardLeaderboard(db,url){
 const result=await db.prepare('SELECT name,save,created FROM player_accounts ORDER BY created,id').all();
 const ranked=[];for(const row of result.results){try{const j=orderJourney(JSON.parse(row.save));ranked.push({name:row.name,level:j.overallLevel,orders:Object.fromEntries(ORDER_IDS.map(o=>[o,j.orders[o].level])),mastered:j.mastered.length,wanderer:j.wandererUnlocked,xp:j.totalXP});}catch{/* Invalid saves must not break the public board. */}}
 ranked.sort((a,b)=>b.level-a.level||b.xp-a.xp);
 let rank=0;const entries=ranked.map((r,i)=>{if(!i||r.level!==ranked[i-1].level||r.xp!==ranked[i-1].xp)rank=i+1;const {xp,...entry}=r;return {rank,...entry};});
 const query=(url.searchParams.get('q')||'').trim().slice(0,24).toLowerCase(),filtered=entries.filter(r=>r.name.toLowerCase().includes(query)),pageSize=25,pages=Math.max(1,Math.ceil(filtered.length/pageSize));
 const requested=Number(url.searchParams.get('page')||1),page=Math.min(pages,Math.max(1,Number.isSafeInteger(requested)?requested:1));
 return {entries:filtered.slice((page-1)*pageSize,page*pageSize),page,pages,total:filtered.length,accounts:entries.length,orderNames:ORDER_IDS};
}
