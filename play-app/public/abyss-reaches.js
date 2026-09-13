import {waterClearance,boardwalkDistance} from './abyss-hydrology-layout.js';
import * as T from 'three';
import {mergeGeometries} from './BufferGeometryUtils.js';
import {height,biome,pathDist,places,WORLD_RADIUS} from './geography.js';
import {realms} from './world-data.js';
import {abyssAngle,abyssPoint,abyssLocal,abyssFalls,fallPoint,fallsClearance,abyssLoreSites,abyssCaves} from './abyss-layout.js';
import {batchStoryAssets,assetFootprint} from './storybook-assets.js';
import {fitsWorld} from './world-edge.js';
export function addAbyssReaches(world,colliders,{mobile=false}={}){
 const root=new T.Group();root.name='Abyssal_Coast';world.add(root);const batches=new Map(),fauna=[],trees=new Map(),water=[];
 const geo={rock:new T.IcosahedronGeometry(1,0),orb:new T.SphereGeometry(1,8,6),box:new T.BoxGeometry(1,1,1),cone:new T.ConeGeometry(1,1,6),stem:new T.CylinderGeometry(.7,1,1,6)};
 const palette={stone:'#425760',light:'#80999d',seam:'#263841',salt:'#d6e3df',sand:'#bfb69c',coral:'#ca887a',reef:'#c4a189',green:'#537c70',blue:'#5c9ead',foam:'#d0ece7',ink:'#283e4b',gold:'#c3bc70'};
 const mats=Object.fromEntries(Object.entries(palette).map(([k,color])=>[k,new T.MeshStandardMaterial({color,roughness:.87})]));
 const dummy=new T.Object3D();let seed=8610911;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 function put(shape,color,x,y,z,sx,sy,sz,rot=0){const key=shape+color+Math.floor(x/100)+','+Math.floor(z/100);if(!batches.has(key))batches.set(key,{shape,color,entries:[]});batches.get(key).entries.push({x,y,z,sx,sy,sz,rot});}
 function part(g,shape,color,x,y,z,sx,sy,sz,roll=0){const m=new T.Mesh(geo[shape],mats[color]);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.z=roll;g.add(m);return m;}
 const clear=(x,z,r)=>biome(x,z).id==='abyss'&&waterClearance(x,z)>r+8&&boardwalkDistance(x,z)>r+5&&fitsWorld(x,z,r)&&pathDist(x,z)>r+8&&fallsClearance(x,z)>r+9&&!realms.some(p=>Math.hypot(x-p.x,z-p.z)<r+40)&&!places.some(p=>Math.hypot(x-p.x,z-p.z)<r+24)&&!colliders.some(c=>Math.hypot(x-c.x,z-c.z)<c.r+r+3);
 let treeCount=0,rocks=0;
 for(let i=0;i<(mobile?550:850);i++){const r=300+rand()*620,p=abyssPoint((rand()-.5)*r*.72,r),family=r>770?'windpine':'tidal-tree',form=i%4,name=family+(form?'-'+(form+1):''),scale=.85+rand()*.6,foot=assetFootprint(name)*scale;
  if(!clear(p.x,p.z,Math.max(4,foot)))continue;if(!trees.has(name))trees.set(name,[]);trees.get(name).push({...p,y:height(p.x,p.z),scale,rotation:rand()*6.28});colliders.push({...p,r:scale*1.05});treeCount++;
 }
 for(const [name,list]of trees)batchStoryAssets(name,list,root);
 for(let i=0;i<1100;i++){const r=270+rand()*665,p=abyssPoint((rand()-.5)*r*.78,r),s=1.5+rand()*5;if(!clear(p.x,p.z,s*1.3))continue;const y=height(p.x,p.z);put('rock','stone',p.x,y+s*.45,p.z,s,s*.85,s*.75,rand()*6);put('rock','salt',p.x,y+s*.92,p.z,s*.55,.12,s*.43);colliders.push({...p,r:s*.85});rocks++;}
 // The terrain's exact exposed edges are closed as fractured coastal rock by world-edge.js.
 // Shore habitat stones follow the terrain; the connected watershed owns water.
 const pools=[];
 for(const site of abyssLoreSites.filter(p=>['abyss-fauna','abyss-salt','abyss-forest'].includes(p.id))){const x=site.x,z=site.z-10,y=height(x,z)+.15;pools.push({x,z,y});
  for(let j=0;j<28;j++){const a=j*6.28/28,px=x+Math.cos(a)*8.5,pz=z+Math.sin(a)*8.5;put('rock',j%3?'light':'salt',px,height(px,pz)+.35,pz,.8,.65,.8,j);}
 }
 // Shell fans, salt crystals, coral sprigs and coastal reed tussocks.
 for(let i=0;i<800;i++){const r=280+rand()*640,p=abyssPoint((rand()-.5)*r*.75,r);if(!clear(p.x,p.z,.5))continue;const y=height(p.x,p.z);
  if(i%3===0)for(let j=0;j<5;j++)put('cone','green',p.x+Math.cos(j)*.2,y+.5,p.z+Math.sin(j)*.2,.08,1+j*.08,.08);
  else if(i%3===1)for(let j=0;j<3;j++)put('rock','salt',p.x+j*.25,y+.15,p.z,.18,.32,.18,j);
  else for(let j=0;j<5;j++)put('orb','sand',p.x+Math.sin(j*.5)*.35,y+.08,p.z+Math.cos(j*.5)*.35,.16,.08,.42,j*.5);
 }
 const wings=[];
 function animal(type,x,z,i){const g=new T.Group();g.name=type;root.add(g);const joints=[];
  if(type==='Tide_Crab'){part(g,'orb','blue',0,.3,0,.5,.22,.35);for(const s of [-1,1]){for(let j=0;j<3;j++)part(g,'stem','coral',s*.5,.15,-.25+j*.23,.045,.65,.045,s*1.1);part(g,'rock','blue',s*.65,.39,-.45,s<0?.38:.14,.2,s<0?.43:.2);part(g,'orb','ink',s*.15,.53,-.25,.05,.07,.045);}}
  else if(type==='Spray_Seal'){part(g,'orb','foam',0,.7,0,.7,.6,1.3);part(g,'orb','foam',0,1.08,-.97,.52,.52,.55);part(g,'orb','ink',0,1.03,-1.5,.12,.075,.1);for(const s of [-1,1]){part(g,'orb','ink',s*.24,1.25,-1.38,.06,.065,.035);part(g,'orb','blue',s*.7,.18,.15,.55,.12,.48,s*.35);}part(g,'orb','foam',0,.22,1.24,.8,.14,.38);}
  else if(type==='Coral_Hound'){part(g,'rock','coral',0,.9,0,.48,.5,.9);part(g,'rock','coral',0,1.45,-.7,.4,.4,.4);for(const s of [-1,1])for(const f of [-1,1])part(g,'stem','reef',s*.34,.38,f*.55,.12,.8,.12);for(let j=0;j<12;j++){const x=Math.sin(j*2.4)*.42,z=Math.cos(j*2.4)*.6;part(g,'stem',j%3?'coral':'green',x,1.45+(j%3)*.16,z,.065,.6,.065,(j%3-1)*.55);}part(g,'cone','coral',0,1.0,1.0,.17,.7,.17,.7);}
  else if(type==='Brine_Fly'){part(g,'orb','ink',0,0,0,.09,.08,.18);for(const s of [-1,1])joints.push(part(g,'orb',i%2?'blue':'foam',s*.18,.05,0,.2,.015,.15));}
  else{for(let j=0;j<18;j++){const a=j*.28;part(g,'orb',j%3?'blue':'foam',Math.cos(a)*2,.06,Math.sin(a)*2,.24,.15,.33);}}
  const grouped=new Map();for(const m of [...g.children]){if(joints.includes(m))continue;m.updateMatrix();if(!grouped.has(m.material))grouped.set(m.material,[]);grouped.get(m.material).push((m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone()).applyMatrix4(m.matrix));g.remove(m);}for(const [mat,gs]of grouped){let material=mat;if(type==='Spray_Seal'&&mat===mats.foam){material=mat.clone();material.transparent=true;material.opacity=.66;material.depthWrite=false;}g.add(new T.Mesh(mergeGeometries(gs),material));gs.forEach(g=>g.dispose());}
  fauna.push({g,type,x,z,i,joints,phase:rand()*6.28});
 }
 const sanctuary=abyssLoreSites[1],grove=abyssLoreSites[2],salt=abyssLoreSites[3];
 for(let i=0;i<12;i++)animal('Tide_Crab',sanctuary.x-8+(i%6)*3,sanctuary.z-4-Math.floor(i/6)*3,i);
 for(let i=0;i<6;i++)animal('Spray_Seal',sanctuary.x-7+i*3,sanctuary.z-16,i);
 for(let i=0;i<6;i++)animal('Coral_Hound',grove.x-7+i*3,grove.z-5,i);
 for(let i=0;i<(mobile?16:28);i++)animal('Brine_Fly',salt.x+Math.cos(i*2.4)*6,salt.z-8+Math.sin(i*2.4)*6,i);
 for(let i=0;i<3;i++)animal('Whirlpool_Eel',pools[i].x,pools[i].z,i);

 const staticMeshes=[];for(const {shape,color,entries}of batches.values()){const m=new T.InstancedMesh(geo[shape],mats[color],entries.length);m.name='Abyss_'+shape+'_'+color;entries.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.sx,p.sy,p.sz);dummy.rotation.set(0,p.rot,0);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix)});m.computeBoundingSphere();root.add(m);staticMeshes.push(m);}
 root.userData.counts={trees:treeCount,rocks,waterfalls:2,caves:2,animals:fauna.length};
 return{root,fauna,update(time,player){for(const m of staticMeshes)m.visible=Math.hypot(m.boundingSphere.center.x-player.x,m.boundingSphere.center.z-player.z)<(mobile?200:300)+m.boundingSphere.radius;
  for(const a of fauna){a.g.visible=Math.hypot(player.x-a.x,player.z-a.z)<110;if(!a.g.visible)continue;const t=time*.35+a.phase;let x=a.x,z=a.z,y=height(x,z);if(a.type==='Brine_Fly'){x+=Math.sin(t)*1.4;z+=Math.cos(t)*1.4;y+=1.2+Math.sin(time*1.7+a.phase)*.2;a.joints.forEach((w,i)=>w.rotation.z=(i?1:-1)*Math.sin(time*22+a.phase)*.7);}else if(a.type==='Whirlpool_Eel'){y=pools[a.i].y+.06;a.g.rotation.y=t;}else{x+=Math.sin(t)*.5;a.g.rotation.y=a.type==='Tide_Crab'?Math.sin(t)*.15:-t;}a.g.position.set(x,y,z);}
 }};
}
