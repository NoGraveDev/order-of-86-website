import {realms} from './world-data.js';
import {WORLD_RADIUS} from './world-scale.js';
import {biome,pathDist,places} from './geography.js';
export const treeFamilies=['oak','woodland','silver-tree','cypress','swamp-cypress'];
export function treeVariant(name,x,z){if(!treeFamilies.includes(name))return name;let hash=(Math.imul(Math.floor(x*3),73856093)^Math.imul(Math.floor(z*3),19349663))>>>0;hash=Math.imul(hash^(hash>>>16),2246822507)>>>0;hash=(hash^(hash>>>13))>>>0;const variant=hash%4+1;return name+(variant===1?'':'-'+variant);}
export function realmDetailPlan(mobile=false){
 const placements=[];let seed=86073;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const clear=(x,z)=>Math.hypot(x,z)<WORLD_RADIUS-32&&pathDist(x,z)>9&&!realms.some(r=>Math.hypot(x-r.x,z-r.z)<38)&&!places.some(p=>Math.hypot(x-p.x,z-p.z)<16);
 for(const realm of realms.slice(1)){
  // Four composed groups around each principal landmark, plus small discoveries throughout its territory.
  // Low planting beds near entrances fill the foreground without blocking the trailing camera.
  const low={deepwood:[2,3,4],violet:[4],frost:[3,4],ember:[2,4],sunward:[2,4],abyss:[2,4],shadow:[1,4]}[realm.id];
  for(let i=0;i<32;i++){
   const x=realm.x+(i%2?1:-1)*(10+random()*15),z=realm.z-12+random()*45;
   if(biome(x,z).id!==realm.id||Math.hypot(x-realm.x,z-realm.z)<18||pathDist(x,z)<4.8)continue;
   placements.push({name:realm.id+'-detail-'+low[i%low.length],realm:realm.id,x,z,scale:.75+random()*.5,rotation:random()*Math.PI*2,foreground:true});
  }
  const anchors=[];
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2,r=48+(i%2)*18;anchors.push({x:realm.x+Math.cos(a)*r,z:realm.z+Math.sin(a)*r})}
  for(let i=0;i<(mobile?35:55);i++){const a=realm.angle+(random()-.5)*.76,r=240+random()*(WORLD_RADIUS-275);anchors.push({x:Math.sin(a)*r,z:-Math.cos(a)*r})}
  for(const anchor of anchors){
   if(!clear(anchor.x,anchor.z)||biome(anchor.x,anchor.z).id!==realm.id)continue;
   for(let i=0;i<7;i++){const a=i*2.399,r=i===0?0:3+random()*5,x=anchor.x+Math.cos(a)*r,z=anchor.z+Math.sin(a)*r;if(!clear(x,z)||biome(x,z).id!==realm.id)continue;const variant=(i+Math.floor(random()*4))%4+1;placements.push({name:realm.id+'-detail-'+variant,realm:realm.id,x,z,scale:i===0?1.2+random()*.6:.65+random()*.7,rotation:random()*Math.PI*2});}
  }
 }
 return placements;
}
