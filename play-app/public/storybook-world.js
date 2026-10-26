import {wiggleSite} from './wiggle-core.js';
import {marketSite,merchantSite} from './moon-market-layout.js';
import {sunRoadDistance,sunwardSites} from './sunward-layout.js';
import {waterClearance,boardwalkDistance} from './abyss-hydrology-layout.js';
import {fallsClearance} from './abyss-layout.js';
import {violetPoint} from './violet-layout.js';
import {riverClearance} from './ember-layout.js';
import {firstHowlMountain,mountainDistance} from './frost-layout.js';
import {treeVariant,realmDetailPlan} from './realm-dressing.js';
import {fitsWorld} from './world-edge.js';
import {wetlandBasins} from './wetland-layout.js';
import {WORLD_SCALE as S} from './world-scale.js';
import * as T from 'three';
import {batchStoryAssets,placeStoryAsset,assetFootprint,updateStoryBatches} from './storybook-assets.js';
import {realms} from './world-data.js';
import {height,biome,pathDist,places} from './geography.js';
export function addStorybookWorld({world,mobile=false}){
 const group=new T.Group();group.name='Blender_Storybook_Environment';world.add(group);const collisions=[],batches=new Map();let seed=195086;
 const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const arrivalViews=[...realms,...places];
 const add=(name,x,z,scale=1,rotation=rand()*Math.PI*2,y=height(x,z))=>{if((Math.abs(x-wiggleSite.x)<7&&Math.abs(z-wiggleSite.z)<8)||(Math.abs(x-marketSite.x)<11&&z>marketSite.z-10&&z<marketSite.z+22)||(Math.abs(x-merchantSite.x)<6&&Math.abs(z-merchantSite.z)<6))return false;if(biome(x,z).id==='sunward'&&(sunRoadDistance(x,z)<11||sunwardSites.some(p=>Math.hypot(p.x-x,p.z-z)<45)))return false;if(biome(x,z).id==='abyss'&&(waterClearance(x,z)<10||boardwalkDistance(x,z)<8))return false;if(biome(x,z).id==='abyss'&&fallsClearance(x,z)<10)return false;if(mountainDistance(x,z)<firstHowlMountain.radius+12)return false;if(biome(x,z).id==='ember'&&riverClearance(x,z)<16)return false;if(arrivalViews.some(p=>Math.abs(x-p.x)<18&&z-p.z>8&&z-p.z<65))return false;name=treeVariant(name,x,z);const footprint=assetFootprint(name)*(Array.isArray(scale)?Math.max(scale[0],scale[2]):scale);if(!fitsWorld(x,z,footprint))return false;if(!batches.has(name))batches.set(name,[]);batches.get(name).push({x,y,z,scale,rotation});return true};
 // The silhouette budget is spent on branches and individual leaves, not canopy spheres.
 for(let i=0;i<(mobile?920:1350)*S*S;i++){
  const a=rand()*Math.PI*2,r=(30+Math.sqrt(rand())*435)*S,x=Math.sin(a)*r,z=Math.cos(a)*r,b=biome(x,z);
  if(pathDist(x,z)<10||places.some(p=>Math.hypot(x-p.x,z-p.z)<38)||realms.some(p=>Math.hypot(x-p.x,z-p.z)<38))continue;
  const scale=.7+rand()*.65;
  if(['deepwood','violet','shadow'].includes(b.id)){
   const name=b.id==='violet'?'silver-tree':b.id==='shadow'?'swamp-cypress':b.id==='starter'?'oak':'woodland';if(add(name,x,z,scale))collisions.push({x,z,r:scale*.85});
   if(i%3===0)add('fern',x+1,z+2,.8);
   if(i%7===0)add('mushroom',x-1,z+2,.6);
  }else if(b.id==='starter'){if(i%3===0)add('flowers',x,z,1.6);}
  else if(b.id==='frost'){add('crystal',x,z,scale*2);if(i%3===0)add('rock',x+3,z,scale*1.5)}
  else{const name=b.id==='ember'?'basalt':b.id==='abyss'?'cliff':'rock';if(add(name,x,z,scale*(b.id==='sunward'?1.4:2)))collisions.push({x,z,r:scale*1.1})}
 }
 // Deepwood is a forest, not a park: staggered groves overlap above open trails.
 for(let z=-458*S;z<-110*S;z+=13)for(let x=-230*S;x<230*S;x+=13){
  const px=x+(rand()-.5)*7,pz=z+(rand()-.5)*7;
  if(biome(px,pz).id!=='deepwood'||Math.hypot(px,pz)>467*S||pathDist(px,pz)<5||realms.some(r=>Math.hypot(px-r.x,pz-r.z)<38)||places.some(p=>Math.hypot(px-p.x,pz-p.z)<38))continue;
  const scale=1.35+rand()*.6;if(add('woodland',px,pz,scale))collisions.push({x:px,z:pz,r:scale*.85});
  if(rand()<.5)add('fern',px+2,pz-2,1.1);
 }
 // Violet's four authored silver-barked tree forms make groves with open meadow corridors.
 let violetTrees=0;
 for(let r=260;r<928;r+=18)for(let u=-r*.39;u<r*.39;u+=19){
  const p=violetPoint(u+(rand()-.5)*9,r+(rand()-.5)*9),scale=1.1+rand()*.75;
  if(biome(p.x,p.z).id!=='violet'||pathDist(p.x,p.z)<12||realms.some(q=>Math.hypot(p.x-q.x,p.z-q.z)<43)||places.some(q=>Math.hypot(p.x-q.x,p.z-q.z)<(q.customViolet?24:38))||collisions.some(c=>Math.hypot(p.x-c.x,p.z-c.z)<c.r+5))continue;
  // Broad irregular clearings let the flowers read against the tree line.
  if(Math.sin(u*.038+r*.014)>.65)continue;
  if(add('silver-tree',p.x,p.z,scale)){collisions.push({x:p.x,z:p.z,r:scale*.85});violetTrees++;}
 }
 group.userData.violetTrees=violetTrees;
 // Dense ground cover is maintained near the traveler, not across unseen kilometers.
 for(let i=0;i<80*S*S;i++){
  const a=rand()*Math.PI*2,r=(25+rand()*435)*S,x=Math.sin(a)*r,z=Math.cos(a)*r;
  if(pathDist(x,z)<7||realms.some(p=>Math.hypot(x-p.x,z-p.z)<22))continue;
  add('rock',x,z,.6+rand()*.7);
 }
 for(const p of places){
  if(p.customFrost||p.customEmber||p.customViolet||p.customAbyss||p.customSunward)continue;
  const site=new T.Group();site.name=p.name;site.position.set(p.x,height(p.x,p.z),p.z);group.add(site);
  placeStoryAsset('site-'+p.realm+'-'+p.kind,0,0,0,site,1);
  placeStoryAsset('runestone',-4,0,14,site,.65);
 }
 for(const r of realms.slice(1))for(let distance=45;distance<460*S;distance+=40){const x=Math.sin(r.routeAngle)*distance+Math.cos(r.routeAngle)*6,z=-Math.cos(r.routeAngle)*distance+Math.sin(r.routeAngle)*6;add('lantern',x,z,.65)}

 // Flat, shallow dark water nested into terrain depressions; banks remain traversable.
 const waterMaterial=new T.MeshStandardMaterial({color:'#172f30',roughness:.28,metalness:.12});
 for(const basin of wetlandBasins){
  const waterY=height(basin.x,basin.z)+.6,geometry=new T.CircleGeometry(1,32);geometry.rotateX(-Math.PI/2);const water=new T.Mesh(geometry,waterMaterial);water.name='Shadowmire_stagnant_water';water.position.set(basin.x,waterY,basin.z);water.scale.set(basin.rx*.74,1,basin.rz*.74);group.add(water);
  add('lily-pads',basin.x,basin.z,2.5,0,waterY+.025);
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2,x=basin.x+Math.cos(a)*basin.rx*.86,z=basin.z+Math.sin(a)*basin.rz*.86;add('reeds',x,z,.8+rand()*.6);}
  for(let i=0;i<3;i++){const a=i*2.4,x=basin.x+Math.cos(a)*basin.rx*1.14,z=basin.z+Math.sin(a)*basin.rz*1.14;if(realms.some(r=>Math.hypot(x-r.x,z-r.z)<38))continue;add('swamp-cypress',x,z,1.2+rand()*.45);collisions.push({x,z,r:1.1});}
  if(basin.x%3<1)add('fallen-cypress',basin.x+basin.rx,basin.z,1.4);
 }
 for(const detail of realmDetailPlan(mobile))add(detail.name,detail.x,detail.z,detail.scale,detail.rotation);
 for(const [name,entries]of batches)batchStoryAssets(name,entries,group);
 group.traverse(o=>{o.updateMatrix();o.matrixAutoUpdate=false});
 const small=[];group.traverse(o=>{if(o.isInstancedMesh&&/grass|flowers|detail|fern|mushroom|reed|lily/.test(o.name))small.push(o)});
 let lastX=Infinity,lastZ=Infinity;return{group,collisions,update(position){if(Math.hypot(position.x-lastX,position.z-lastZ)<3)return;lastX=position.x;lastZ=position.z;
 updateStoryBatches(position,mobile);
 for(const o of small)o.visible=Math.hypot(o.boundingSphere.center.x-position.x,o.boundingSphere.center.z-position.z)<(mobile?95:155)+o.boundingSphere.radius;
 }};
}
