import {collisionIndex} from './spatial-collisions.js';
import * as T from 'three';
import {spreadRealm} from './realm-placement.js';
import {wizards} from './wizards.js';
import {realms} from './world-data.js';
import {height,biome} from './geography.js';
import {createWizard} from './characters.js';
const homes={Husky:'frost',Bernard:'frost',Tiger:'ember',Solid:'sunward',Collie:'deepwood',Spotted:'deepwood',Dalmatian:'deepwood',Split:'abyss',Classic:'violet',Zombie:'shadow',Blotted:'shadow',Shiny:'shadow'};
export function homeRealm(d){return d.id===6164?'starter':homes[d.breed]}
const wandererRoute=[{x:7,z:-25},...Array.from({length:29},(_,i)=>({x:Math.sin(i*Math.PI*2/28)*220,z:-Math.cos(i*Math.PI*2/28)*220})),{x:7,z:-25}];
const routeLengths=wandererRoute.slice(1).map((p,i)=>Math.hypot(p.x-wandererRoute[i].x,p.z-wandererRoute[i].z));
export function wandererPosition(distance){let d=distance%routeLengths.reduce((a,b)=>a+b,0);for(let i=0;i<routeLengths.length;i++){if(d<=routeLengths[i]){const a=wandererRoute[i],b=wandererRoute[i+1],t=d/routeLengths[i];return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,heading:Math.atan2(b.x-a.x,b.z-a.z)}}d-=routeLengths[i]}return {...wandererRoute[0],heading:0}}
export function createRealmDogs(helpers,obstacles=[]){const group=new T.Group();group.name='The_Order_of_86_Roaming_Dogs';helpers.world.add(group);
 const nearbyObstacles=collisionIndex(obstacles);
 const homesById=new Map();for(const realm of realms){const dogs=wizards.filter(d=>d.id!==6164&&homeRealm(d)===realm.id).sort((a,b)=>a.id-b.id);const positions=spreadRealm(realm,dogs.length,realms.indexOf(realm)+8518,obstacles);dogs.forEach((dog,i)=>homesById.set(dog.id,positions[i]))}
 const npcs=wizards.map((dog,i)=>{const realm=realms.find(r=>r.id===homeRealm(dog)),{x,z}=homesById.get(dog.id)||{x:7,z:-25};const rig=null,actor=new T.Group();actor.name='NPC_'+dog.id+'_'+dog.name;actor.position.set(x,height(x,z),z);actor.visible=false;group.add(actor);return {dog,realm,rig,actor,homeX:x,homeZ:z,phase:i*2.399,walkTime:0,calmUntil:0,selected:false,loaded:false}});
 let nearest=null;
 function update(time,dt,position,selectedId,paused=false){nearest=null;const candidates=[];for(const n of npcs){n.selected=n.dog.id===selectedId;if(n.selected){n.actor.visible=false;continue}if(!paused&&time>=n.calmUntil)n.walkTime+=dt;const t=n.walkTime*.20+n.phase;const roaming=n.dog.id===6164?wandererPosition(n.walkTime*2.6):null;const x=roaming?roaming.x:n.homeX+Math.sin(t)*12,z=roaming?roaming.z:n.homeZ+Math.sin(t*.7)*9;if(roaming){n.realm=biome(x,z);n.heading=roaming.heading}
 n.walking=!paused&&time>=n.calmUntil&&biome(x,z).id===n.realm.id&&(!!roaming||!nearbyObstacles(x,z,.8).some(c=>Math.hypot(x-c.x,z-c.z)<c.r+.8));if(n.walking)n.actor.position.set(x,height(x,z),z);
 const distance=n.actor.position.distanceTo(position);if(distance<85)candidates.push({n,distance});else n.actor.visible=false;
 if(distance<3.5&&(!nearest||distance<nearest.distance))nearest={...n,distance};}
 candidates.sort((a,b)=>a.distance-b.distance);candidates.forEach(({n,distance},i)=>{n.actor.visible=i<32;if(!n.actor.visible)return;if(!n.rig){n.rig=createWizard(n.dog,helpers);n.actor.add(n.rig.root);n.loaded=true}const t=n.walkTime*.20+n.phase;n.actor.rotation.y=n.dog.id===6164?n.heading||0:Math.atan2(Math.cos(t)*2.4,Math.cos(t*.7)*1.26);const resting=!n.walking;if(!paused){n.rig.limbs.forEach((l,j)=>l.rotation.x=resting?0:Math.sin(time*3+n.phase+(j===0||j===3?0:Math.PI))*.28);n.rig.tail.rotation.z=Math.sin(time*2+n.phase)*.12;}n.rig.root.position.y=resting?0:Math.abs(Math.sin(time*3+n.phase))*.015;});return nearest;}
 function select(id){for(const n of npcs){n.selected=n.dog.id===id;if(n.selected)n.actor.visible=false}}
 return {group,npcs,update,select,get nearest(){return nearest}};
}
