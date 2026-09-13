import {sunwardSites} from './sunward-layout.js';
import {sculptWatershed} from './abyss-hydrology-layout.js';
import {abyssLift,abyssLoreSites} from './abyss-layout.js';
import {violetLoreSites} from './violet-layout.js';
import {emberLift,emberLoreSites} from './ember-layout.js';
import {mountainLift,frostLoreSites} from './frost-layout.js';
import {wetlandBasins} from './wetland-layout.js';
import {realms,sectorRealms} from './world-data.js';
import {WORLD_SCALE,STARTER_RADIUS,TERRAIN_SEGMENTS,TERRAIN_EXTENT} from './world-scale.js';
export {WORLD_RADIUS} from './world-scale.js';
export function biome(x,z){if(Math.hypot(x,z)<STARTER_RADIUS)return realms[0];let a=Math.atan2(x,-z);if(a<0)a+=Math.PI*2;return sectorRealms[Math.round(a/(Math.PI*2/7))%7]}
export function pathDist(x,z){const radial=Math.min(...realms.slice(1).map(r=>Math.abs(x*Math.cos(r.routeAngle)+z*Math.sin(r.routeAngle))));return Math.min(radial,Math.abs(Math.hypot(x,z)-220*WORLD_SCALE),Math.abs(Math.hypot(x,z)-390*WORLD_SCALE))}
function rawHeight(x,z){x/=WORLD_SCALE;z/=WORLD_SCALE;const radius=Math.hypot(x,z),b=biome(x*WORLD_SCALE,z*WORLD_SCALE);const smooth=Math.min(1,radius/55);const broad=Math.sin(x*.012)*Math.cos(z*.011)*7+Math.sin(x*.025+z*.014)*2;const rugged=['frost','ember','abyss'].includes(b.id)?8:3;const hill=Math.pow(Math.sin(x*.018-z*.009),2)*rugged*Math.min(1,pathDist(x*WORLD_SCALE,z*WORLD_SCALE)/20);return (broad+hill)*smooth+Math.max(0,radius-430)*.13}
function shapedHeight(x,z){const r=realms[6],d=Math.hypot(x-r.x,z-r.z);if(d<9.5){const t=Math.min(1,d/9.5);const bowl=1-t*t*(3-2*t);return rawHeight(x,z)-15*bowl}let y=rawHeight(x,z)+emberLift(x,z)+abyssLift(x,z);if(biome(x,z).id==='shadow')for(const basin of wetlandBasins){const d=Math.hypot((x-basin.x)/basin.rx,(z-basin.z)/basin.rz);if(d<1){const t=Math.max(0,Math.min(1,(d-.65)/.35)),blend=t*t*(3-2*t);y=(rawHeight(basin.x,basin.z)-1.8)*(1-blend)+y*blend;break}}return y}
export const places=[];
const descriptions=[
['Memory Trees','Spore Fox Trail','Silver Stream', 'Trees preserve the Deepwood’s memories. The Wild Order protects the roots and the stories woven between them.'],
['Archivum','Hall of the Dead','Listener Post', 'The Scribepack preserves names, words, and competing accounts. A lost fact is a memory that no one can recover.'],
['Frozen Lake of Echoes','Truth Mirror','Glacier Glass Outcrop', 'Frosthollow’s ice remembers sound. Bernardguard protects those who seek the Truth Mirror and the truths within it.'],
['The Crucible','First Ember Cave','Ash Garden', 'Fire transforms, but courage teaches it restraint. The Ember Wastes hold ancient coals and fields renewed by ash.'],
['Purified Plateau','Plateau of Prints','White Pillar Fields', 'Light touches the open gold plains. The Radiant Order teaches that revelation must be carried with care.'],
['The Divide','Mirror Caves','Twin Currents', 'The land and sea divide and join. In the Abyssal Reaches, two perspectives may be true at once.'],
['The Shifting Grounds','Zombie Crypts','Great Rot Border', 'Beyond the Dream Spire, the land changes and the Rot advances. The Orders seek ways to restore what remains.']];
realms.slice(1).forEach((r,i)=>descriptions[i].slice(0,3).forEach((name,j)=>{const angle=r.angle+(j===1?.16:j===2?-.14:0),radius=[220,390,425][j]*WORLD_SCALE;places.push({id:r.id+'-place-'+j,realm:r.id,name,landmark:name,x:Math.sin(angle)*radius,z:-Math.cos(angle)*radius,tag:r.name.toUpperCase(),lore:descriptions[i][3],kind:j})}));

places.push(...sunwardSites,...frostLoreSites,...emberLoreSites,...violetLoreSites,...abyssLoreSites);
const emberPlaceLore={
 'The Crucible':'The Crucible is a natural volcanic arena: a circular combat pit with obsidian walls and a lava floor. In the Ember Wastes, fire transforms; courage teaches it restraint.',
 'First Ember Cave':'The First Ember is a single coal that has burned since before the First Howl. It is not hot to the touch, consumes no fuel, and burns small and steady. The Flame Order guards it, believing that if it goes out, all fire magic will fail. Frostforge calculates that it has at least ten thousand years left.',
 'Ash Garden':'On A-day of Ember-fall, the Tigers scatter volcanic ash on a designated field and plant fire-resistant seeds. The garden blooms for one week. The flowers are beautiful, mildly toxic, and sacred to the Tigers.'
};
for(const p of places)if(emberPlaceLore[p.name]){p.lore=emberPlaceLore[p.name];if(p.name==='The Crucible')p.interactionRadius=38;}
const terrainSites=[...realms.filter(r=>r.id!=='abyss'),...places.filter(p=>!p.customFrost&&!p.customViolet&&!p.customAbyss)];
function analyticHeight(x,z){
 let value=shapedHeight(x,z);
 const nearest=terrainSites.find(p=>Math.abs(x-p.x)<58&&Math.abs(z-p.z)<58);
 if(nearest){const d=Math.hypot(x-nearest.x,z-nearest.z),inner=nearest.name==='Frozen Lake of Echoes'?14:nearest.name==='The Crucible'?14:nearest.id?34:12;
 const t=Math.min(1,Math.max(0,(d-inner)/22)),blend=t*t*(3-2*t);if(d<inner+22)value=shapedHeight(nearest.x,nearest.z)*(1-blend)+value*blend;}
 return biome(x,z).id==='abyss'?sculptWatershed(x,z,value):value+mountainLift(x,z);
}

// Gameplay and props use the exact same triangle surface as the rendered terrain.
// Sampling the continuous formula independently can put feet beneath coarse hill triangles.
const terrainHeights=new Float64Array((TERRAIN_SEGMENTS+1)**2).fill(NaN),step=TERRAIN_EXTENT/TERRAIN_SEGMENTS;
function gridHeight(ix,iz){const key=iz*(TERRAIN_SEGMENTS+1)+ix;if(Number.isNaN(terrainHeights[key]))terrainHeights[key]=analyticHeight(ix*step-TERRAIN_EXTENT/2,iz*step-TERRAIN_EXTENT/2);return terrainHeights[key]}
export function height(x,z){
 const gx=Math.max(0,Math.min(TERRAIN_SEGMENTS-1e-8,(x+TERRAIN_EXTENT/2)/step)),gz=Math.max(0,Math.min(TERRAIN_SEGMENTS-1e-8,(z+TERRAIN_EXTENT/2)/step)),ix=Math.floor(gx),iz=Math.floor(gz),tx=gx-ix,tz=gz-iz;
 const b=gridHeight(ix+1,iz),c=gridHeight(ix,iz+1);
 return tx+tz<=1?gridHeight(ix,iz)*(1-tx-tz)+b*tx+c*tz:gridHeight(ix+1,iz+1)*(tx+tz-1)+b*(1-tz)+c*(1-tx);
}
