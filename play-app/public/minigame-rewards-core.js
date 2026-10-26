import {orderJourney} from './order-progression.js';
import {ORDER_IDS} from './order-spells.js';
import {levelFloor} from './wizard-progression.js';
export const gameRewards={sled:{xp:150,min:20},boat:{xp:250,min:60},maze9:{xp:100,min:5},maze13:{xp:150,min:8},chess:{xp:100,min:5},lava:{xp:100,min:4}};
export function readRewards(raw){const r=raw??{};if(!r||Array.isArray(r)||Object.keys(r).some(k=>!gameRewards[k]))throw Error('Invalid minigame reward record.');for(const v of Object.values(r))if(!v||Object.keys(v).some(k=>!['id','startedAt','claimed','order'].includes(k))||typeof v.id!=='string'||!/^[a-zA-Z0-9-]{8,80}$/.test(v.id)||!Number.isSafeInteger(v.startedAt)||v.startedAt<1||typeof v.claimed!=='boolean'||!ORDER_IDS.includes(v.order))throw Error('Invalid minigame run.');return structuredClone(r);}
export function applyMinigameReward(save,shop,body,now=Date.now()){
 const spec=gameRewards[body.kind];if(!spec||typeof body.run!=='string'||!/^[a-zA-Z0-9-]{8,80}$/.test(body.run))throw Error('Unknown minigame run.');const runs=readRewards(shop.rewards),old=runs[body.kind];
 if(body.operation==='minigame-start'){if(old?.id===body.run)return;const journey=orderJourney(save,shop.orders);runs[body.kind]={id:body.run,startedAt:now,claimed:false,order:ORDER_IDS.includes(journey.active)?journey.active:'Flame'};}
 else if(body.operation==='minigame-finish'){if(!old||old.id!==body.run||old.claimed)throw Error('This minigame reward was already claimed or the run changed.');if(now-old.startedAt<spec.min*1000||body.completed!==true)throw Error('Finish the minigame before claiming XP.');const r=orderJourney(save,shop.orders).record;r.activityXP??=Object.fromEntries(ORDER_IDS.map(o=>[o,0]));const xp=spec.xp+(body.kind==='lava'&&body.won===true?100:body.kind==='chess'&&body.won===true?50:0);r.activityXP[old.order]=Math.min(levelFloor(50),r.activityXP[old.order]+xp);shop.orders=r;old.claimed=true;}
 else throw Error('Unknown minigame reward action.');shop.rewards=runs;
}
