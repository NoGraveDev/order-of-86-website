import * as T from 'three';
import {spellCatalog} from './spellbook-core.js';
import {gearModifiers} from './moon-shop-core.js';
import {height} from './geography.js';
export function createExtraMagic({scene,player,getSpell,getGear}){
 const root=new T.Group();root.name='Equipped_Extra_Spell_Effects';scene.add(root);let time=0,readyAt=0;const effects=[];
 function marker(position,color,duration,follow){const g=new T.Group();g.position.copy(position);const ring=new T.Mesh(new T.TorusGeometry(.7,.045,5,24),new T.MeshBasicMaterial({color,depthTest:false,transparent:true,opacity:.85}));ring.rotation.x=-Math.PI/2;g.add(ring);const beacon=new T.Mesh(new T.ConeGeometry(.2,.55,5),new T.MeshBasicMaterial({color,depthTest:false}));beacon.position.y=1.2;beacon.rotation.z=Math.PI;g.add(beacon);root.add(g);effects.push({g,follow,until:time+duration});}
 function cast({scales,critters,collected,shards,collectedShards,locations,discovered}){const equipped=getSpell(),spell=spellCatalog.find(s=>s.id===equipped?.id);if(!spell)return {ok:false,message:'Equip an extra spell in your spell book.'};if(time<readyAt)return {ok:false,message:'Your extra spell is recharging.'};const tier=equipped.tier,range=spell.ranges[tier-1],mods=gearModifiers(getGear?.()),duration=(8+(tier-1)*4)*mods.duration;let targets=[];
 if(spell.id==='scale-sight')targets=scales.filter(s=>s.g.visible).map(s=>({g:s.g,name:'scale'}));
 if(spell.id==='lizard-lantern')targets=critters.filter(c=>!collected.has(c.id)).map(c=>({g:c.g,name:c.typeData.name}));
 if(spell.id==='moon-sight')targets=shards.filter(s=>!collectedShards.has(s.id)).map(s=>({g:s.g,name:s.name}));
 if(spell.id==='wayfinder'){const next=locations.filter(l=>!discovered.has(l.id)).map(l=>({...l,d:Math.hypot(l.x-player.position.x,l.z-player.position.z)})).filter(l=>l.d<=range).sort((a,b)=>a.d-b.d)[0];if(next){for(let i=1;i<=12;i++){const t=i/12,x=player.position.x+(next.x-player.position.x)*t,z=player.position.z+((next.id==='starter'?-9:next.z)-player.position.z)*t;marker(new T.Vector3(x,height(x,z)+.25,z),spell.color,duration);}readyAt=time+spell.cooldowns[tier-1]*mods.cooldown;return {ok:true,message:spell.name+' → '+next.landmark+' · '+Math.round(next.d)+'m',duration,range};}}
 targets=targets.filter(t=>t.g.position.distanceTo(player.position)<=range).sort((a,b)=>a.g.position.distanceToSquared(player.position)-b.g.position.distanceToSquared(player.position)).slice(0,24);
 if(!targets.length)return {ok:false,message:'No undiscovered '+(spell.id==='wayfinder'?'landmarks':spell.id==='scale-sight'?'scales':spell.id==='moon-sight'?'Moon Shards':'Crystal Lizards')+' within '+range+'m. Try another area.'};
 for(const t of targets)marker(t.g.position.clone().add(new T.Vector3(0,.7,0)),spell.color,duration,t.g);readyAt=time+spell.cooldowns[tier-1]*mods.cooldown;return {ok:true,message:spell.name+' · '+targets.length+' revealed for '+duration+' seconds',duration,range};}
 return {root,cast,remaining:()=>Math.max(0,readyAt-time),update(dt){time+=dt;for(let i=effects.length-1;i>=0;i--){const e=effects[i];if(e.until<=time){e.g.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});e.g.removeFromParent();effects.splice(i,1);}else{if(e.follow){e.g.visible=e.follow.visible;e.g.position.copy(e.follow.position).add(new T.Vector3(0,.7,0));}e.g.rotation.y=time;}}}};
}
