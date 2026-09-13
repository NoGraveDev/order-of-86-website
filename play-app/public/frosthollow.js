import {createMoon} from './moon-models.js';
import * as T from 'three';
import {height,biome,pathDist,places,WORLD_RADIUS} from './geography.js';
import {realms} from './world-data.js';
import {firstHowlMountain,ascentPoint,mountainDistance,frostLoreSites} from './frost-layout.js';
// Shared geometry and instancing keep the added forest inexpensive on phones.
export function addFrosthollow(world,colliders){
 const root=new T.Group();root.name='Frosthollow_Expanded';world.add(root);
 const geometries={rock:new T.IcosahedronGeometry(1,2),cone:new T.ConeGeometry(1,1,9),trunk:new T.CylinderGeometry(.65,1,1,8),box:new T.BoxGeometry(1,1,1)},batches=new Map();
 const palette={snow:'#edf6fa',fir:'#244e4e',tips:'#386565',bark:'#5b5151',stone:'#687f90',ice:'#9cdaeb',light:'#d6fff2',bone:'#d8d0b9',moss:'#5e8972'};
 function put(kind,color,x,y,z,sx,sy,sz,rotation=0){const key=kind+color;if(!batches.has(key))batches.set(key,{kind,color,entries:[]});batches.get(key).entries.push({x,y,z,sx,sy,sz,rotation})}
 function rock(x,z,s){const y=height(x,z);put('rock','stone',x,y+s*.55,z,s,s*.8,s*.82,x);put('rock','snow',x-.08*s,y+s*1.04,z,s*.94,s*.34,s*.77,x);if(s>1)colliders.push({x,z,r:s*.85});}
 let seed=860910;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 let trees=0,rocks=0;
 for(let i=0;i<1900;i++){
  const a=1.39+rand()*.79,r=230+rand()*690,x=Math.sin(a)*r,z=-Math.cos(a)*r;
  if(biome(x,z).id!=='frost'||Math.hypot(x,z)>WORLD_RADIUS-24||mountainDistance(x,z)<firstHowlMountain.radius+14||pathDist(x,z)<13||[...realms,...places].some(p=>Math.hypot(x-p.x,z-p.z)<43)||colliders.some(c=>Math.hypot(x-c.x,z-c.z)<c.r+7))continue;
  if(i%3===0){rock(x,z,.65+rand()*5);rocks++;continue}
  const h=16+rand()*17,y=height(x,z),w=h*.19;
  put('trunk','bark',x,y+h*.32,z,.65,h*.64,.65);
  // Six overlapping, irregular whorls, with snow shelves on every crown.
  for(let j=0;j<6;j++){
   const f=1-j*.135,cy=y+h*(.29+j*.115),rot=rand()*6.28;
   put('cone',j%2?'tips':'fir',x,cy,z,w*f,h*.36,w*f,rot);
   put('cone','snow',x,cy+h*.055,z,w*f*.88,h*.25,w*f*.88,rot);
   for(let k=0;k<4;k++){const a=rot+k*Math.PI/2,rr=w*f*.74;put('rock','snow',x+Math.cos(a)*rr,cy-h*.035,z+Math.sin(a)*rr,w*f*.35,h*.025,w*f*.22,a)}
  }
  colliders.push({x,z,r:1.05});trees++;
 }
 // A broad continuous spiral ribbon follows precisely the collision terrain.
 const vertices=[],indices=[],segments=1800,width=4.8;
 for(let i=0;i<=segments;i++){const t=i/segments,p=ascentPoint(t),q=ascentPoint(Math.min(1,t+.001)),prev=ascentPoint(Math.max(0,t-.001));const dx=q.x-prev.x,dz=q.z-prev.z,len=Math.hypot(dx,dz);for(const side of [-1,1]){const x=p.x+side*dz/len*width,z=p.z-side*dx/len*width;vertices.push(x,height(x,z)+.32,z)}if(i<segments){const n=i*2;indices.push(n,n+2,n+1,n+1,n+2,n+3)}}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const trail=new T.Mesh(geo,new T.MeshStandardMaterial({color:'#bccbd3',roughness:1,side:T.DoubleSide}));trail.name='First_Howl_Walkable_Ascent';root.add(trail);
 for(let i=0;i<120;i++){const p=ascentPoint(i/120),q=ascentPoint((i+.1)/120),dx=q.x-p.x,dz=q.z-p.z,l=Math.hypot(dx,dz),x=p.x+dz/l*7,z=p.z-dx/l*7,y=height(x,z);put('rock','stone',x,y+.7,z,.7,1,.7);put('rock','snow',x,y+1.45,z,.7,.28,.7);if(i%3===0)put('rock','light',x,y+1.85,z,.22,.3,.22)}
 // Seven outer stones recall the tones; a memorial at the summit tells the hymn.
 for(let i=0;i<7;i++){const a=i*Math.PI*2/7,x=770+Math.cos(a)*10,z=-65+Math.sin(a)*10;rock(x,z,1.7)}
 for(const site of frostLoreSites){const {x,z}=site,y=height(x,z);
  if(site.id==='frost-first-howl'){
   const monument=new T.Group();monument.name='First_Howl_Summit_Landmark';monument.position.set(x,y,z);root.add(monument);
   const stone=new T.Mesh(new T.IcosahedronGeometry(1,2),new T.MeshStandardMaterial({color:'#778b9a',roughness:.88}));stone.scale.set(2.6,3.4,1.35);stone.position.y=3.1;monument.add(stone);
   put('rock','snow',x,y+6.1,z,2,.45,1.2);put('rock','stone',x,y+.2,z,3.5,.5,2.4);
   for(let i=0;i<7;i++){const moon=createMoon(i);moon.scale.setScalar(.065);moon.position.set((i-3)*1.12,6.8+Math.sin(i/6*Math.PI)*1.7,.3);monument.add(moon)}
   const label=document.createElement('canvas');label.width=768;label.height=256;const ctx=label.getContext('2d');ctx.fillStyle='#263a48';ctx.fillRect(0,0,768,256);ctx.strokeStyle='#b9dbe7';ctx.lineWidth=5;ctx.strokeRect(12,12,744,232);ctx.fillStyle='#edf6fa';ctx.textAlign='center';ctx.font='bold 54px Georgia';ctx.fillText('THE FIRST HOWL',384,105);ctx.font='28px Georgia';ctx.fillText('Seven tones. One world.',384,165);
   const texture=new T.CanvasTexture(label);texture.colorSpace=T.SRGBColorSpace;const plaque=new T.Mesh(new T.PlaneGeometry(4.1,1.37),new T.MeshBasicMaterial({map:texture}));plaque.position.set(0,3.3,1.37);monument.add(plaque);colliders.push({x,z,r:2.65});
  }
  if(site.id==='frost-listeners'){for(let i=0;i<9;i++){const a=i*6.28/9;rock(x+Math.cos(a)*10,z+Math.sin(a)*10,1.4)}for(let i=0;i<3;i++)put('rock','ice',x-3+i*3,y+.3,z,1.2,.3,1.2)}
  if(site.id==='frost-bones'){for(let i=-2;i<=2;i++){put('box','stone',x+i*3,y+2,z,2.7,4,2);put('box','snow',x+i*3,y+4.1,z,2.9,.45,2.2);put('box','bark',x+i*3,y+2,z+1.02,1.8,1.3,.08);put('trunk','bone',x+i*3,y+1.8,z+1.16,.16,1,.16,.7);put('rock','bone',x+i*3,y+2.32,z+1.16,.23,.19,.19)} }
  if(site.id==='frost-garden'){for(let i=0;i<24;i++){const px=x+(i%6-2.5)*2,pz=z+(Math.floor(i/6)-1.5)*2;put('rock','moss',px,height(px,pz)+.18,pz,.8,.2,.65);put('cone','tips',px,height(px,pz)+.55,pz,.35,.9,.35)}for(let i=0;i<12;i++){const a=i*6.28/12;rock(x+Math.cos(a)*9,z+Math.sin(a)*7,.65)}}
  if(site.id==='frost-beacon'){put('rock','ice',x,y+3,z,2,5,2);put('rock','light',x,y+8,z,1.2,1.8,1.2);colliders.push({x,z,r:2.4});for(let i=0;i<6;i++){const a=i*6.28/6;rock(x+Math.cos(a)*6,z+Math.sin(a)*6,1.3)}}
 }
 const dummy=new T.Object3D();for(const {kind,color,entries}of batches.values()){const material=new T.MeshStandardMaterial({color:palette[color],roughness:color==='ice'?.28:.9,...(color==='light'?{emissive:palette.light,emissiveIntensity:.6}:{})});const m=new T.InstancedMesh(geometries[kind],material,entries.length);m.name='Frost_'+kind+'_'+color;entries.forEach((e,i)=>{dummy.position.set(e.x,e.y,e.z);dummy.scale.set(e.sx,e.sy,e.sz);dummy.rotation.set(0,e.rotation,0);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix)});m.computeBoundingSphere();root.add(m)}
 root.userData.counts={trees,rocks};return root;
}
