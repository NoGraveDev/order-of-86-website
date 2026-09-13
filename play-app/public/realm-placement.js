import {waterClearance,boardwalkDistance} from './abyss-hydrology-layout.js';
import {collisionIndex} from './spatial-collisions.js';
import {WORLD_SCALE} from './world-scale.js';
import {height,places,biome} from './geography.js';
import {realms} from './world-data.js';
// Deterministic, well-separated homes covering the width and depth of a realm.
export function spreadRealm(realm,count,seed=1,obstacles=[],occupied=[]){
 let state=seed>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};
 const index=collisionIndex(obstacles),nearby=(x,z)=>index(x,z,4);
 const candidates=[];
 for(let i=0;i<1800;i++){
  const starter=realm.id==='starter',radius=(starter?30+Math.sqrt(random())*53:140+random()*300)*WORLD_SCALE;
  const angle=starter?random()*Math.PI*2:realm.angle+(random()-.5)*.66;
  const x=Math.sin(angle)*radius,z=-Math.cos(angle)*radius;
  if(biome(x,z).id!==realm.id)continue;
  if(realm.id==='abyss'&&(waterClearance(x,z)<6||boardwalkDistance(x,z)<6))continue;
  if([...realms,...places].some(p=>Math.hypot(x-p.x,z-p.z)<27))continue;
  if(nearby(x,z).some(p=>Math.hypot(x-p.x,z-p.z)<p.r+4))continue;
  const y=height(x,z);if([[5,0],[-5,0],[0,5],[0,-5]].some(([dx,dz])=>Math.abs(height(x+dx,z+dz)-y)>3))continue;
  candidates.push({x,z});
 }
 const result=[];for(let i=0;i<count;i++){
  let best=null,score=-1;for(const p of candidates){const previous=[...occupied,...result],d=previous.length?Math.min(...previous.map(q=>Math.hypot(p.x-q.x,p.z-q.z))):Math.hypot(p.x-realm.x,p.z-realm.z);if(d>score){score=d;best=p}}
  if(!best)throw new Error('No clear population position in '+realm.id);
  result.push(best);candidates.splice(candidates.indexOf(best),1);
 }return result;
}
