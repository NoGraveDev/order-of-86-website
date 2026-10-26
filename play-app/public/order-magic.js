import * as T from 'three';
import {gearModifiers} from './moon-shop-core.js';
import {height,WORLD_RADIUS} from './geography.js';
export function createOrderMagic({scene,player,getLoadout,getOrder,getGear,getContractTarget,canMove,ground,colliders,getCrowdTime,collectItem}){
 const root=new T.Group();root.name='Order_Spell_Effects';scene.add(root);let time=0,speedUntil=0,speed=1,waterUntil=0,anchor=null;const ready=new Map(),effects=[];
 function marker(p,color,life=8,radius=.8,follow=null){const g=new T.Group();g.position.copy(p);const ring=new T.Mesh(new T.TorusGeometry(radius,.05,5,24),new T.MeshBasicMaterial({color,transparent:true,opacity:.85,depthTest:false}));ring.rotation.x=-Math.PI/2;g.add(ring);root.add(g);effects.push({g,until:time+life,follow});return g;}
 function lantern(p,color,life){const g=marker(p,color,life);const light=new T.PointLight(color,6,28,1.2);light.position.y=2;g.add(light);effects.at(-1).playerFollow=true;}
 const safe=(x,z)=>Math.hypot(x,z)<WORLD_RADIUS-3&&canMove(x,z)&&!colliders.some(c=>Math.hypot(x-c.x,z-c.z)<c.r+1);
 const remaining=slot=>{const spell=getLoadout()[slot];return spell?Math.max(0,(ready.get(spell.id)||0)-time):0;};
 function cast(slot,input){const spell=getLoadout()[slot];if(!spell)return {ok:false,message:'Unlock and equip this Order spell slot first.'};if(remaining(slot)>0)return {ok:false,message:'This spell is recharging.'};const tier=spell.tier,mods=gearModifiers(getGear?.(),getOrder()),power=spell.power[tier-1]*(['scales','lantern-scales','all','lizards','shards','owls','wizards','trail'].includes(spell.kind)?mods.range:spell.kind==='lure'?mods.lure:spell.kind==='flame'?mods.flame:spell.kind==='blink'?mods.blink:spell.kind==='still'?mods.still:1),life=(8+4*(tier-1))*mods.duration*(spell.kind==='lure'?mods.lureDuration:1),start=player.position.clone(),forward=new T.Vector3(Math.sin(player.rotation.y),0,Math.cos(player.rotation.y));let message=spell.name,targets=[];
 const {critters,collected,scales,shards,collectedShards,crowd,metWizards,owls,locations,discovered,placed}=input;
 if(spell.kind==='flame'){
  const seen=new Set(),flight=2*mods.duration;
  const launch=(p,d,life,split=false)=>{const g=marker(p,spell.color,life,.3);g.name='Measured_Flame_Orb';g.add(new T.Mesh(new T.IcosahedronGeometry(.3,1),new T.MeshBasicMaterial({color:spell.color})));g.add(new T.PointLight(spell.color,4,8));Object.assign(effects.at(-1),{velocity:d.clone().multiplyScalar(power),ignite:placed,items:[['lizards',critters],['shards',shards],['scales',scales]],seen,launch,splitAt:split?time+flight*.4:null});return effects.at(-1);};
  launch(start.clone().add(new T.Vector3(0,1.2,0)),forward,flight,tier===3);
  message+=' · collects lizards, Moon Shards and scales'+(tier===3?' · splits into three paths.':tier===2?' · extended range.':'.');
 }
 if(['scales','lantern-scales','all'].includes(spell.kind))targets.push(...scales.filter(s=>s.g.visible).map(s=>s.g));
 if(['lizards','all'].includes(spell.kind))targets.push(...critters.filter(c=>c.g.visible).map(c=>c.g));
 if(['shards','all'].includes(spell.kind))targets.push(...shards.filter(s=>s.g.visible).map(s=>s.g));
 if(spell.kind==='owls')targets.push(...owls.flock.map(o=>o.g));
 if(spell.kind==='wizards')targets.push(...crowd.npcs.filter(n=>!n.selected&&!metWizards.has(n.dog.id)).map(n=>n.actor));
 if(['lantern-scales','owls'].includes(spell.kind))lantern(start,spell.color,life);
 if(['scales','lantern-scales','all','lizards','shards','owls','wizards'].includes(spell.kind)){targets=targets.filter(g=>g.position.distanceTo(start)<=power).slice(0,40);for(const g of targets)marker(g.position.clone().add(new T.Vector3(0,.8,0)),spell.color,life,.8,g);message+=' · '+targets.length+' discoveries marked within '+power+'m.';}
 if(['lure','still'].includes(spell.kind)){const near=critters.filter(c=>c.g.visible&&c.g.position.distanceTo(start)<=power);for(let i=0;i<near.length;i++){const c=near[i];c.orderMagicUntil=time+life;c.orderMagicTarget=spell.kind==='still'?c.g.position.clone():start.clone().add(new T.Vector3(Math.sin(i*2.4)*3,0,Math.cos(i*2.4)*3));c.orderMagicTarget.y=height(c.orderMagicTarget.x,c.orderMagicTarget.z);marker(c.g.position.clone(),spell.color,life,.6,c.g);}marker(start,spell.color,life,3);message+=' · '+near.length+' lizards '+(spell.kind==='still'?'stilled.':'answer your call.');}
 if(['calm','still'].includes(spell.kind)){const near=crowd.npcs.filter(n=>!n.selected&&n.actor.position.distanceTo(start)<=power);for(const n of near){n.calmUntil=getCrowdTime()+life;marker(n.actor.position.clone(),spell.color,life,.7,n.actor);}message+=' · '+near.length+' wizards calmed.';}
 if(spell.kind==='trail'){const pending=getContractTarget(),target=pending||locations.filter(l=>!discovered.has(l.id)).sort((a,b)=>Math.hypot(a.x-start.x,a.z-start.z)-Math.hypot(b.x-start.x,b.z-start.z))[0];if(!target||Math.hypot(target.x-start.x,target.z-start.z)>power)return {ok:false,message:'No survey or undiscovered landmark within '+power+'m. Try closer to your Order’s realm.'};for(let i=1;i<=12;i++){const t=i/12,x=start.x+(target.x-start.x)*t,z=start.z+(target.z-start.z)*t;marker(new T.Vector3(x,height(x,z)+.2,z),spell.color,life,.5);}message+=' → '+(target.landmark||target.name);}
 if(spell.kind==='blink'){let end=start.clone();for(let d=.5;d<=power;d+=.5){const p=start.clone().addScaledVector(forward,d);if(!safe(p.x,p.z))break;end=p;}if(end.distanceTo(start)<1)return {ok:false,message:'No clear, safe path to step into.'};marker(start,spell.color,2);end.y=ground(end.x,end.z);player.position.copy(end);marker(end,spell.color,2);}
 if(spell.kind==='anchor'){if(anchor&&anchor.order===getOrder()){if(!safe(anchor.p.x,anchor.p.z))return {ok:false,message:'The marked spot is no longer safe. Set a new waystone after changing Orders.'};player.position.copy(anchor.p);player.position.y=ground(anchor.p.x,anchor.p.z);anchor=null;message='Returned to your waystone.';}else{if(!safe(start.x,start.z))return {ok:false,message:'Mark a waystone on clear, dry ground.'};anchor={order:getOrder(),p:start.clone()};message='Waystone marked. Cast again to return.';}marker(player.position,spell.color,life);}
 if(['speed','journey'].includes(spell.kind)){speed=spell.kind==='speed'?power:1.8;speedUntil=time+(spell.kind==='journey'?power:life);lantern(start,spell.color,spell.kind==='journey'?power:life);message+=' · faster travel.';}
 if(['water','journey'].includes(spell.kind)){waterUntil=time+power*mods.water;marker(start,spell.color,power*mods.water,1.4);message+=' · '+Math.round(power*mods.water*10)/10+' seconds of water walking.';}
 if(spell.kind==='renew'){for(const s of getLoadout())if(s&&s.id!==spell.id)ready.set(s.id,time);lantern(start,spell.color,life);message+=' · your other equipped spells are ready.';}
 ready.set(spell.id,time+spell.cooldown*mods.cooldown);return {ok:true,message};
 }
 function disposeEffect(e){e.g.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});e.g.removeFromParent();}
 function advanceFlame(e,end,from){
  const stop=e.splitAt===null?end:Math.min(end,e.splitAt),speed=e.velocity.length();
  for(let t=from;t<stop-1e-9;){const step=Math.min(stop-t,.5/speed),a=e.g.position.clone();e.g.position.addScaledVector(e.velocity,step);e.g.position.y=ground(e.g.position.x,e.g.position.z)+1.2;const b=e.g.position,delta=b.clone().sub(a),length=delta.lengthSq();
   const touches=(p,r)=>{const u=length?Math.max(0,Math.min(1,p.clone().sub(a).dot(delta)/length)):0;return p.distanceToSquared(a.clone().addScaledVector(delta,u))<=r*r;};
   for(const [kind,items]of e.items)for(const item of items){const key=kind+':'+item.id;if(item.g.visible&&!e.seen.has(key)&&touches(item.g.position,1.8)){e.seen.add(key);collectItem?.(kind,item);}}
   for(const prop of e.ignite.children){const flame=prop.getObjectByName('Brazier_Flame');if(flame&&touches(prop.position.clone().add(new T.Vector3(0,1.5,0)),2.8)){flame.visible=true;if(prop.userData.placement)prop.userData.placement.lit=true;}}
   t+=step;
  }
  if(e.splitAt!==null&&end>=e.splitAt){const splitTime=e.splitAt,until=e.until; e.splitAt=null;e.until=splitTime;
   for(const angle of [-Math.PI/5,0,Math.PI/5]){const child=e.launch(e.g.position.clone(),e.velocity.clone().normalize().applyAxisAngle(new T.Vector3(0,1,0),angle),until-time);child.until=until;advanceFlame(child,end,splitTime);if(time>=until){disposeEffect(child);effects.splice(effects.indexOf(child),1);}}
  }
 }
 return {root,cast,remaining,recharge(){for(const s of getLoadout())if(s)ready.set(s.id,time);},get time(){return time;},get speedMultiplier(){return time<speedUntil?speed:1;},get waterWalking(){return time<waterUntil;},cancelTravel(){speedUntil=waterUntil=time;},update(dt,blocked=false){time+=dt;if(blocked)speedUntil=waterUntil=time;if(anchor?.order!==getOrder())anchor=null;for(let i=effects.length-1;i>=0;i--){const e=effects[i];if(e.velocity&&!blocked)advanceFlame(e,Math.min(time,e.until),time-dt);if(time>=e.until||e.velocity&&blocked){disposeEffect(e);effects.splice(i,1);continue;}if(e.playerFollow)e.g.position.copy(player.position);if(e.follow){e.g.visible=e.follow.visible;e.g.position.copy(e.follow.position);}e.g.rotation.y=time;}}};
}
