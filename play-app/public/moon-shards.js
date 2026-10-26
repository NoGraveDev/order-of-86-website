import {spreadRealm} from './realm-placement.js';
import {realms,moons} from './world-data.js';
import {makeDirectoryItem} from './directory-items.js';
import {height} from './geography.js';
export const shardSpawns=moons.flatMap(([name,color],type)=>spreadRealm(realms[[4,5,6,1,2,7,0][type]],3,type+6164).map((p,i)=>({id:'moon-'+type+'-'+i,type,name,color,...p})));
export function addMoonShards(helpers,parent,collected,obstacles=[],occupied=[]){for(let type=0;type<7;type++){const points=spreadRealm(realms[[4,5,6,1,2,7,0][type]],3,type+6164,obstacles,occupied);shardSpawns.filter(s=>s.type===type).forEach((s,i)=>Object.assign(s,points[i]))}return shardSpawns.map(s=>{const g=makeDirectoryItem('shard'+s.type,s.x,s.z,s.color,helpers,parent);g.name='Collectible_'+s.id;g.userData.collectibleShard=s.id;g.visible=!collected.has(s.id);return {...s,g}})}
export function nearbyShard(shards,position,collected){let found=null,best=2.8;for(const s of shards){if(s.g.visible===false)continue;const d=Math.hypot(s.x-position.x,s.z-position.z);if(d<best&&Math.abs(height(s.x,s.z)-position.y)<2){found=s;best=d}}return found}
export function collectShard(shard,collected){if(!shard||collected.has(shard.id))return false;collected.add(shard.id);shard.g.visible=false;return true}
export function animateShards(shards,collected,time){for(const s of shards){if(s.g.visible===false)continue;s.g.position.y=height(s.x,s.z)+.35+Math.sin(time*1.7+s.type)*.16;s.g.rotation.y=time*.6}}
