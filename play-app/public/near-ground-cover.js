import {wiggleSite} from './wiggle-core.js';
import {marketSite,merchantSite} from './moon-market-layout.js';
import {sunRoadDistance} from './sunward-layout.js';
import {realms} from './world-data.js';
import * as T from 'three';
import {batchStoryAssets} from './storybook-assets.js';
import {height,biome,pathDist,places} from './geography.js';
import {WORLD_RADIUS} from './world-scale.js';
// Stable world-grid seed: moving the camera never makes grass shuffle.
export function addNearGroundCover(world,mobile){
 const group=new T.Group();group.name='Near_field_grass_and_wildflowers';world.add(group);let cellX=Infinity,cellZ=Infinity;
 const hash=(x,z)=>{let h=(Math.imul(x,73856093)^Math.imul(z,19349663))>>>0;h=Math.imul(h^(h>>>16),2246822507)>>>0;return (h^(h>>>13))>>>0};
 const meshes={};const capacity=mobile?3500:7500;
 for(const name of ['grass','flowers','fern']){const dummy=Array.from({length:capacity},()=>({x:0,y:-100,z:0}));meshes[name]=batchStoryAssets(name,dummy,group,false);for(const m of meshes[name]){m.count=0;m.instanceMatrix.setUsage(T.DynamicDrawUsage)}}
 const transform=new T.Object3D(),tint=new T.Color();
 return {update(position){const cx=Math.floor(position.x/16),cz=Math.floor(position.z/16);if(cx===cellX&&cz===cellZ)return;cellX=cx;cellZ=cz;const counts={grass:0,flowers:0,fern:0},radius=mobile?38:58,step=1.6;
 for(let ix=Math.floor((cx*16-radius)/step);ix<Math.ceil((cx*16+radius+16)/step);ix++)for(let iz=Math.floor((cz*16-radius)/step);iz<Math.ceil((cz*16+radius+16)/step);iz++){
 const h=hash(ix,iz),x=(ix+(h%997)/997)*step,z=(iz+((h>>>10)%991)/991)*step,r=biome(x,z);if((Math.abs(x-wiggleSite.x)<7&&Math.abs(z-wiggleSite.z)<8)||(Math.abs(x-marketSite.x)<7&&z>marketSite.z-6&&z<marketSite.z+12)||(Math.abs(x-merchantSite.x)<3&&Math.abs(z-merchantSite.z)<3)||realms.slice(1).some(p=>Math.abs(x-p.x)<17&&Math.abs(z-p.z)<17)||places.some(p=>Math.abs(x-p.x)<14&&Math.abs(z-p.z)<14)||Math.hypot(x,z)>WORLD_RADIUS-8||sunRoadDistance(x,z)<6||pathDist(x,z)<4.5||['frost','ember','abyss'].includes(r.id)||Math.hypot(x,z)<12)continue;
 const name=r.id==='deepwood'&&h%7===0?'fern':h%43===0?'flowers':'grass',i=counts[name]++;if(i>=capacity)continue;transform.position.set(x,height(x,z)-.025,z);transform.rotation.set(0,(h%628)/100,0);transform.scale.setScalar(.6+((h>>>18)%100)/170);transform.updateMatrix();tint.set(r.id==='violet'?'#c8b6ed':r.id==='sunward'?'#fff0a1':r.id==='shadow'?'#89a18b':'#c7de9b');
 for(const mesh of meshes[name]){mesh.setMatrixAt(i,transform.matrix);mesh.setColorAt(i,tint)}
 }
 for(const [name,list]of Object.entries(meshes))for(const m of list){m.count=Math.min(capacity,counts[name]);m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;m.computeBoundingSphere();}
 }};
}
