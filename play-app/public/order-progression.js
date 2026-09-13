import {readStarter} from './starter-dogs.js';
import {wizardProgress,levelFromXP,levelFloor} from './wizard-progression.js';
import {wizards} from './wizards.js';
import {realms} from './world-data.js';
import {places,height} from './geography.js';
import {ORDER_IDS,ORDER_REALMS,orderSpells,spellsForOrder,slotsAtLevel,upgradeCost,tierLevel} from './order-spells.js';
const SHOP='pawtheon-moon-shop-v1',MAX_XP=levelFloor(50),REWARD=800;
const get=(save,key)=>typeof save?.getItem==='function'?save.getItem(key):save?.[key];
const orderMap=make=>Object.fromEntries(ORDER_IDS.map(o=>[o,make(o)]));
export function selectedOrder(save){const starter=readStarter({getItem:key=>get(save,key)});if(starter)return starter.trainingOrder;const d=wizards.find(d=>d.id===Number(get(save,'pawtheon-dog')));return d?.order||'Flame';}
function rawOrders(save){const raw=get(save,SHOP);if(!raw)return undefined;return (typeof raw==='string'?JSON.parse(raw):raw)?.orders;}
export function emptyOrders(){return {version:1,creditedXP:0,collectionXP:orderMap(()=>0),contracts:orderMap(()=>({completed:0,step:0,lastAt:0})),upgrades:{},loadouts:{}};}
export function readOrders(raw){if(raw===undefined)return emptyOrders();const r=structuredClone(raw);if(!r||r.version!==1||Object.keys(r).some(k=>!['version','creditedXP','collectionXP','activityXP','contracts','upgrades','loadouts'].includes(k)))throw Error('Invalid Order save.');
 const integer=(n,max)=>Number.isSafeInteger(n)&&n>=0&&n<=max;
 if(!integer(r.creditedXP,Number.MAX_SAFE_INTEGER)||!r.collectionXP||Object.keys(r.collectionXP).length!==6||!ORDER_IDS.every(o=>integer(r.collectionXP[o],Number.MAX_SAFE_INTEGER))||Object.values(r.collectionXP).reduce((a,b)=>a+b,0)!==r.creditedXP)throw Error('Invalid Order XP.');
 if(r.activityXP!==undefined&&(!r.activityXP||Object.keys(r.activityXP).length!==6||!ORDER_IDS.every(o=>integer(r.activityXP[o],MAX_XP))))throw Error('Invalid activity XP.');
 if(!r.contracts||Object.keys(r.contracts).length!==6||!ORDER_IDS.every(o=>{const c=r.contracts[o];return c&&Object.keys(c).every(k=>['completed','step','lastAt'].includes(k))&&integer(c.completed,10000)&&integer(c.step,2)&&integer(c.lastAt,1e15);}))throw Error('Invalid Order contract.');
 if(!r.upgrades||Array.isArray(r.upgrades)||Object.entries(r.upgrades).some(([id,t])=>!orderSpells.some(s=>s.id===id&&s.order!=='Wanderer')||!Number.isInteger(t)||t<1||t>3))throw Error('Invalid Order spell tier.');
 if(!r.loadouts||Array.isArray(r.loadouts)||Object.entries(r.loadouts).some(([o,list])=>![...ORDER_IDS,'Wanderer'].includes(o)||!Array.isArray(list)||list.length>3||new Set(list.filter(Boolean)).size!==list.filter(Boolean).length||list.some(id=>id!==null&&!spellsForOrder(o).some(s=>s.id===id))))throw Error('Invalid Order loadout.');return r;
}
export function contractRoute(order,completed=0){const realm=ORDER_REALMS[order],pool=[...realms.filter(r=>r.id===realm),...places.filter(p=>p.realm===realm||p.id.startsWith(realm+'-'))];return Array.from({length:3},(_,i)=>pool[(completed+i)%pool.length]);}
function cappedLevel(xp){const s=levelFromXP(Math.min(MAX_XP,xp));return {...s,level:Math.min(50,s.level),xp:Math.min(MAX_XP,xp),maxed:s.level>=50,intoLevel:s.level>=50?0:s.intoLevel,needed:s.level>=50?1:s.needed};}
function credit(save,r,order){const legacy=wizardProgress(save).xp;if(r.creditedXP>legacy)throw Error('Invalid Order collection history.');const delta=legacy-r.creditedXP;if(delta){r.collectionXP[ORDER_IDS.includes(order)?order:'Flame']+=delta;r.creditedXP=legacy;}return r;}
export function orderJourney(save,raw=rawOrders(save)){
 const legacy=wizardProgress(save),r=readOrders(raw),needsSync=raw===undefined||r.creditedXP<legacy.xp;
 credit(save,r,selectedOrder(save));const orders=orderMap(o=>{const level=cappedLevel(r.collectionXP[o]+(r.activityXP?.[o]||0)+r.contracts[o].completed*REWARD);const spent=spellsForOrder(o).reduce((n,s)=>{const t=r.upgrades[s.id]||1;return n+(t>=2?2:0)+(t===3?3:0);},0);if(spent>(level.level-1)*2||spellsForOrder(o).some(s=>(r.upgrades[s.id]||1)>1&&level.level<tierLevel(s,r.upgrades[s.id])))throw Error('Invalid Order spell progression.');return {...level,points:(level.level-1)*2-spent,slots:slotsAtLevel(level.level),contract:{...r.contracts[o],route:contractRoute(o,r.contracts[o].completed),reward:REWARD}};});
 const mastered=ORDER_IDS.filter(o=>orders[o].maxed),wandererUnlocked=mastered.length===6;orders.Wanderer={...cappedLevel(wandererUnlocked?MAX_XP:0),points:0,slots:wandererUnlocked?3:0,locked:!wandererUnlocked};
 const active=selectedOrder(save)==='Wanderer'&&!wandererUnlocked?'Flame':selectedOrder(save),overallLevel=1+ORDER_IDS.reduce((n,o)=>n+orders[o].level-1,0);
 for(const [o,list]of Object.entries(r.loadouts)){const state=orders[o];if(list.length>state.slots||list.some(id=>id&&spellsForOrder(o).find(s=>s.id===id).unlock>state.level))throw Error('Invalid equipped Order spell.');}
 return {orders,active,overallLevel,mastered,wandererUnlocked,needsSync,record:r,totalXP:ORDER_IDS.reduce((n,o)=>n+orders[o].xp,0),legacy};
}
export function orderLoadout(journey,order=journey.active){const state=journey.orders[order];if(!state||state.locked)return [];const available=spellsForOrder(order).filter(s=>s.unlock<=state.level),out=[...(journey.record.loadouts[order]||[])];while(out.length<state.slots)out.push(available.find(s=>!out.includes(s.id))?.id||null);return out.map(id=>id?{...orderSpells.find(s=>s.id===id),tier:order==='Wanderer'?3:journey.record.upgrades[id]||1}:null);}
export function applyOrderAction(save,raw,body,now=Date.now()){
 const journey=orderJourney(save,raw),r=journey.record,order=body.order;if(order!==journey.active)throw Error('Your active Order changed. Reopen the spellbook.');const state=journey.orders[order];
 if(body.operation==='order-sync')return r;
 if(body.operation==='order-visit'){
  if(!ORDER_IDS.includes(order)||state.maxed)throw Error('This Order is already mastered.');const c=r.contracts[order];if(c.completed!==body.expectedCompleted||c.step!==body.expectedStep)throw Error('This survey step was already recorded.');const target=contractRoute(order,c.completed)[c.step];if(body.target!==target.id)throw Error('Visit the marked survey landmark first.');const p=body.position;if(!p||![p.x,p.y,p.z].every(Number.isFinite)||Math.hypot(p.x-target.x,p.z-target.z)>(target.interactionRadius||17)+2||(p.y< -20||Math.abs(p.y-height(p.x,p.z))>80))throw Error('Move closer to the survey landmark.');if(c.lastAt&&now-c.lastAt<3000)throw Error('Continue to the next landmark before reporting.');c.lastAt=now;c.step++;if(c.step===3){c.step=0;c.completed++;}return r;
 }
 const spell=orderSpells.find(s=>s.id===body.item&&s.order===order);if(!spell||state.locked||state.level<spell.unlock)throw Error('This spell is not unlocked for your Order.');
 if(body.operation==='order-upgrade'){if(order==='Wanderer')throw Error('Wanderer spells are already mastered.');const tier=r.upgrades[spell.id]||1;if(body.expectedLevel!==tier)throw Error('This spell changed. Reopen the book.');if(tier===3)throw Error('This spell is fully upgraded.');if(state.level<tierLevel(spell,tier+1))throw Error('Reach Order level '+tierLevel(spell,tier+1)+' first.');if(state.points<upgradeCost(tier))throw Error('Not enough Order spell points.');r.upgrades[spell.id]=tier+1;}
 else if(body.operation==='order-equip'){if(!Number.isInteger(body.slot)||body.slot<0||body.slot>=state.slots)throw Error('This spell slot is locked.');const list=orderLoadout(journey,order).map(s=>s?.id||null);for(let i=0;i<list.length;i++)if(list[i]===spell.id)list[i]=null;list[body.slot]=spell.id;r.loadouts[order]=list;}
 else throw Error('Unknown Order action.');return r;
}
