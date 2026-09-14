import assert from 'node:assert/strict';
import {emptyOrders,readOrders,orderJourney,applyOrderAction,contractRoute} from '../public/order-progression.js';
import {ORDER_IDS} from '../public/order-spells.js';
import {height} from '../public/geography.js';
const save={'pawtheon-dog':'5035'};
for(const order of ORDER_IDS)for(let round=0;round<12;round++){
 const route=contractRoute(order,round);assert.equal(route.length,8);assert.equal(new Set(route.map(t=>t.id)).size,8);assert.equal(route.at(-1).id,'starter');
 for(let i=1;i<7;i++)assert(Math.hypot(route[i].x-route[i-1].x,route[i].z-route[i-1].z)>500);
}
const legacy=emptyOrders();legacy.contracts.Flame={completed:3,step:2,lastAt:100};
let raw=readOrders(legacy);assert.equal(raw.contracts.Flame.xp,2400);assert.equal(raw.contracts.Flame.step,0);assert.deepEqual(readOrders(raw),raw);
let now=10000;
for(let round=0;round<2;round++){
 const before=raw.contracts.Flame.xp,completed=raw.contracts.Flame.completed,route=contractRoute('Flame',completed);
 for(let step=0;step<route.length;step++){
  const target=route[step],body={operation:'order-visit',order:'Flame',expectedCompleted:completed,expectedStep:step,target:target.id,position:{x:target.x,y:height(target.x,target.z),z:target.z}};
  assert.throws(()=>applyOrderAction(save,raw,{...body,position:{x:99999,y:0,z:99999}},now));
  raw=applyOrderAction(save,raw,body,now);assert.throws(()=>applyOrderAction(save,raw,body,now+4000));now+=4000;
  assert.equal(raw.contracts.Flame.xp,before+(step===7?50:0));
 }
 assert.equal(raw.contracts.Flame.completed,completed+1);
}
assert.equal(orderJourney(save,raw).orders.Flame.contract.reward,50);
assert.equal(raw.contracts.Flame.xp,2500);
console.log('PASS eight distinct world stops, cross-map spacing, legacy XP/partial reset/idempotence, no three-stop payout, exactly 50 per full circuit, replay/distance rejection');
