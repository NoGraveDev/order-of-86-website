import {orderJourney} from './order-progression.js';
export function createOrderJourney({storage,shop,getOrder,notify,getPosition}){let pending=null,lastError=0;
 const state=()=>orderJourney(storage);
 async function sync(){if(pending)return pending;pending=(async()=>{await shop.idle();if(!state().needsSync)return true;const ok=await shop.run({operation:'order-sync',order:getOrder()});if(!ok&&Date.now()-lastError>15000){lastError=Date.now();notify('Order XP is waiting to save. Check Account or try again.');}return ok;})().finally(()=>pending=null);return pending;}
 async function visit(target){const j=state(),c=j.orders[getOrder()]?.contract;if(!c||j.orders[getOrder()].maxed||c.route[c.step]?.id!==target.id)return;const before=c.completed,p=getPosition();const ok=await shop.run({operation:'order-visit',order:getOrder(),target:target.id,expectedCompleted:c.completed,expectedStep:c.step,position:{x:p.x,y:p.y,z:p.z}});if(ok){const next=state().orders[getOrder()].contract;notify(next.completed>before?getOrder()+' survey complete! +800 Order XP.':getOrder()+' survey · '+next.step+' / 3 landmarks.');}else notify(document.getElementById('shopError').textContent||'Survey could not be saved.');}
 return {sync,visit,update(){if(!pending&&state().needsSync&&Date.now()-lastError>5000)void sync();},get state(){return state();}};
}
