import {height,biome} from './geography.js';
import {waterSample} from './abyss-hydrology-layout.js';
import {TERRAIN_EXTENT,TERRAIN_SEGMENTS,WORLD_RADIUS} from './world-scale.js';
// Water and the terrain use identical grid triangles. Clip each water triangle
// where its depth reaches zero; shared shoreline vertices touch the actual land.
const step=TERRAIN_EXTENT/TERRAIN_SEGMENTS,half=TERRAIN_EXTENT/2,cache=new Map();
 function sample(ix,iz){const key=ix+','+iz;if(cache.has(key))return cache.get(key);const x=ix*step-half,z=iz*step-half,g=height(x,z),w=waterSample(x,z),valid=biome(x,z).id==='abyss'&&Number.isFinite(w.y)&&w.distance<48;const y=valid?w.y:g-1;const p={x,z,y,ground:g,depth:valid?Math.min(y-g,6-w.distance):-1,flow:w.lake?0:1};cache.set(key,p);return p;}
export function waterSurfaceAt(x,z){if(Math.hypot(x,z)>WORLD_RADIUS)return null;const gx=(x+half)/step,gz=(z+half)/step,ix=Math.floor(gx),iz=Math.floor(gz),tx=gx-ix,tz=gz-iz;const points=tx+tz<=1?[sample(ix,iz),sample(ix+1,iz),sample(ix,iz+1)]:[sample(ix+1,iz+1),sample(ix+1,iz),sample(ix,iz+1)],weights=tx+tz<=1?[1-tx-tz,tx,tz]:[tx+tz-1,1-tz,1-tx];const depth=points.reduce((n,p,i)=>n+p.depth*weights[i],0);return depth>0?{y:points.reduce((n,p,i)=>n+p.y*weights[i],0),depth}:null;}
export function buildWatershedSurface(){const vertices=[],shore=[];
 function clip(poly,value,mark=false){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],va=value(a),vb=value(b);if(va>=0)out.push(a);if((va>=0)!==(vb>=0)){const t=va/(va-vb),p={};for(const k of ['x','z','y','ground','depth','flow'])p[k]=a[k]+(b[k]-a[k])*t;out.push(p);if(mark)shore.push(p);}}return out;}
 for(let iz=0;iz<TERRAIN_SEGMENTS;iz++)for(let ix=0;ix<TERRAIN_SEGMENTS;ix++){
  const a=sample(ix,iz),b=sample(ix+1,iz),c=sample(ix,iz+1),d=sample(ix+1,iz+1);
  for(const triangle of [[a,c,b],[b,c,d]]){if(triangle.every(p=>p.depth<=0))continue;let poly=clip(triangle,p=>p.depth,true);poly=clip(poly,p=>WORLD_RADIUS-Math.hypot(p.x,p.z));for(let j=1;j<poly.length-1;j++)vertices.push(poly[0],poly[j],poly[j+1]);}
 }
 return{vertices,shore};
}
