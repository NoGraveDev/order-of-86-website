import {mergeGeometries} from './BufferGeometryUtils.js';
import * as T from 'three';
import {height,biome,pathDist,places,WORLD_RADIUS} from './geography.js';
import {realms} from './world-data.js';
import {violetPoint,violetLoreSites} from './violet-layout.js';

export function addVioletHighlands(world,colliders,{mobile=false}={}){
 const root=new T.Group();root.name='Violet_Highlands_Gardens';world.add(root);
 const shapes={orb:new T.SphereGeometry(1,8,6),box:new T.BoxGeometry(1,1,1),stem:new T.CylinderGeometry(.75,1,1,5),crystal:new T.OctahedronGeometry(1),cone:new T.ConeGeometry(1,1,5)};
 const colors={leaf:'#657b60',stem:'#617450',violet:'#8353b4',lavender:'#b78cda',pale:'#e2ccec',ink:'#332c43',paper:'#d9c79d',magenta:'#da83da',brown:'#856553',cream:'#f2e3c7',quartz:'#cddfea',egg:'#a9c9de'};
 const mats=Object.fromEntries(Object.entries(colors).map(([k,color])=>[k,new T.MeshStandardMaterial({color,roughness:.9})]));
 const batches=new Map(),fauna=[],beds=[];let seed=860926;
 const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const dummy=new T.Object3D();
 function part(g,shape,color,x,y,z,sx,sy,sz,roll=0){const m=new T.Mesh(shapes[shape],mats[color]);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.z=roll;g.add(m);return m;}
 function put(shape,color,x,y,z,sx,sy,sz,rot=0){const key=shape+color+':'+Math.floor(x/80)+','+Math.floor(z/80);if(!batches.has(key))batches.set(key,{shape,color,items:[]});batches.get(key).items.push({x,y,z,sx,sy,sz,rot});}
 const clear=(x,z,margin=2)=>biome(x,z).id==='violet'&&Math.hypot(x,z)<WORLD_RADIUS-20&&pathDist(x,z)>margin+3&&!realms.some(p=>Math.hypot(x-p.x,z-p.z)<27+margin)&&!places.filter(p=>!p.customViolet).some(p=>Math.hypot(x-p.x,z-p.z)<18+margin)&&!colliders.some(c=>Math.hypot(x-c.x,z-c.z)<c.r+margin);
 // Individual branching lavender spikes, not generic purple flower balls.
 let lavender=0;
 function plant(x,z,s=1){const y=height(x,z);for(let j=0;j<5;j++){const a=j*2.399,dx=Math.cos(a)*.3*s,dz=Math.sin(a)*.3*s,h=(.72+(j%3)*.18)*s;
  put('stem','stem',x+dx,y+h*.48,z+dz,.035*s,h,.035*s);
  for(let k=0;k<3;k++)put('orb',j%2?'lavender':'violet',x+dx,y+h+k*.11*s,z+dz,.095*s,(.13-k*.02)*s,.085*s);
  put('orb','leaf',x+dx*1.4,y+.27*s,z+dz*1.4,.17*s,.035*s,.07*s,a);
 }lavender++;}
 const anchors=[];
 for(let i=0;i<(mobile?85:140);i++){const r=265+rand()*650,p=violetPoint((rand()-.5)*r*.74,r);if(clear(p.x,p.z,7))anchors.push(p);}
 for(const site of violetLoreSites)for(let j=0;j<7;j++){const a=j*2.399;anchors.push({x:site.x+Math.cos(a)*9,z:site.z+Math.sin(a)*9});}
 // Low planting banks frame the Citadel without putting tall crowns behind the camera.
 const citadel=realms.find(r=>r.id==='violet');for(const side of [-1,1])for(let j=0;j<5;j++)anchors.push({x:citadel.x+side*(22+j%2*4),z:citadel.z-10+j*8});
 for(const anchor of anchors){let planted=0;for(let j=0;j<(mobile?12:20);j++){const a=rand()*6.28,r=Math.sqrt(rand())*6,x=anchor.x+Math.cos(a)*r,z=anchor.z+Math.sin(a)*r;if(!clear(x,z,.5)||violetLoreSites.some(p=>Math.hypot(x-p.x,z-p.z)<3))continue;plant(x,z,.85+rand()*.65);planted++;}if(planted)beds.push(anchor);}
 // Low quartz nesting shrubs and scattered parchment scraps show how the species live.
 const finchSite=violetLoreSites[2],scribeSite=violetLoreSites[1];
 for(let i=0;i<6;i++){const x=finchSite.x-9+i*3.5,z=finchSite.z-7,y=height(x,z);
  for(let j=0;j<5;j++)put('orb','leaf',x+Math.cos(j*2.4)*.6,y+.7,z+Math.sin(j*2.4)*.6,.55,.32,.55);
  for(let j=0;j<12;j++)put('crystal','quartz',x+Math.cos(j*.524)*.43,y+1.06,z+Math.sin(j*.524)*.43,.17,.15,.12,j);
  for(let j=0;j<3;j++)put('orb','egg',x+(j-1)*.16,y+1.08,z,.08,.11,.08);
 }
 for(let i=0;i<20;i++){const x=scribeSite.x-8+rand()*16,z=scribeSite.z-5-rand()*5,y=height(x,z);put('box','paper',x,y+.04,z,.5,.045,.35,rand()*6);for(let j=0;j<3;j++)put('box','ink',x,y+.067,z-.1+j*.09,.28,.01,.016);}
 function animal(type,x,z,index){const g=new T.Group();g.name=type;root.add(g);const wings=[];
  if(type==='Lavender_Moth'){
   part(g,'orb','violet',0,0,0,.1,.11,.33);
   for(const s of [-1,1]){const pivot=new T.Group();g.add(pivot);part(pivot,'orb','lavender',s*.39,0,-.03,.4,.045,.4);part(pivot,'orb','violet',s*.24,-.01,.25,.25,.04,.25);part(pivot,'orb','cream',s*.46,.044,-.12,.075,.015,.09);wings.push(pivot);part(g,'stem','ink',s*.09,.16,-.26,.016,.35,.016,s*-.4);part(g,'orb','cream',s*.07,.02,-.29,.034,.034,.03);}
  }else if(type==='Scroll_Mouse'){
   part(g,'orb','paper',0,.25,0,.27,.26,.43);part(g,'orb','paper',0,.39,-.36,.22,.21,.23);
   for(const s of [-1,1]){part(g,'orb','magenta',s*.18,.61,-.29,.12,.16,.055);part(g,'orb','ink',s*.13,.43,-.52,.025,.028,.025);for(const z of [-.2,.2])part(g,'orb','ink',s*.19,.055,z,.075,.05,.12);}
   part(g,'orb','magenta',0,.32,-.59,.045,.035,.035);part(g,'box','paper',0,.17,-.6,.28,.025,.22);for(let j=0;j<3;j++)part(g,'box','ink',0,.19,-.65+j*.045,.18,.008,.013);
   for(let j=0;j<6;j++)part(g,'orb','magenta',Math.sin(j*.5)*.16,.09,.38+j*.09,.04,.04,.095);
  }else if(type==='Archive_Beetle'){
   part(g,'orb','paper',0,.23,0,.27,.22,.38);part(g,'orb','brown',0,.16,-.35,.17,.14,.15);
   for(let j=0;j<7;j++)part(g,'box','ink',Math.sin(j*2)*.1,.39+(j%2)*.015,-.22+j*.07,.14,.012,.018,(j%3-1)*.4);
   for(const s of [-1,1])for(let j=0;j<3;j++)part(g,'stem','brown',s*.27,.09,-.2+j*.19,.035,.28,.035,s*1.05);
  }else{
   const color=type==='Meadow_Lark'?'lavender':'brown';part(g,'orb',color,0,.5,0,.28,.33,.4);part(g,'orb','cream',0,.45,-.18,.22,.25,.23);part(g,'orb',color,0,.83,-.2,.23,.23,.24);
   for(const s of [-1,1]){part(g,'orb','ink',s*.14,.88,-.36,.027,.03,.025);const w=part(g,'orb',type==='Meadow_Lark'?'violet':'paper',s*.24,.53,.06,.09,.25,.29,s*.15);wings.push(w);part(g,'stem','brown',s*.1,.12,0,.025,.25,.025);}
   const beak=part(g,'cone','cream',0,.79,-.47,.08,.2,.08);beak.rotation.x=-Math.PI/2;part(g,'orb',color,0,.45,.39,.12,.08,.23);
  }
  // Bake stationary body pieces together per material; wing joints remain articulated.
  const grouped=new Map();for(const m of [...g.children]){if(!m.isMesh||wings.includes(m))continue;m.updateMatrix();const geometry=m.geometry.clone().applyMatrix4(m.matrix);if(!grouped.has(m.material))grouped.set(m.material,[]);grouped.get(m.material).push(geometry);g.remove(m);}
  for(const [material,geometries]of grouped){const merged=mergeGeometries(geometries);g.add(new T.Mesh(merged,material));geometries.forEach(geo=>geo.dispose());}
  g.position.set(x,height(x,z),z);fauna.push({g,type,x,z,index,wings,phase:rand()*6.28});
 }
 for(let i=0;i<(mobile?28:44);i++){const site=violetLoreSites[i%4===0?3:0];animal('Lavender_Moth',site.x+Math.cos(i*2.4)*(4+i%7),site.z+Math.sin(i*2.4)*(4+i%7),i);}
 for(let i=0;i<10;i++){animal('Scroll_Mouse',scribeSite.x-8+i*1.7,scribeSite.z-7,i);animal('Archive_Beetle',scribeSite.x-7+i*1.5,scribeSite.z-4,i);}
 for(let i=0;i<8;i++){const p=violetLoreSites[3];animal('Meadow_Lark',p.x-9+i*2.6,p.z-5-(i%2)*3,i);}
 for(let i=0;i<6;i++)animal('Quartz_Finch',finchSite.x-9+i*3.5,finchSite.z-7,i);
 const vegetation=[];
 for(const {shape,color,items}of batches.values()){const m=new T.InstancedMesh(shapes[shape],mats[color],items.length);m.name='Violet_'+shape+'_'+color;items.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,p.rot,0);dummy.scale.set(p.sx,p.sy,p.sz);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix)});m.computeBoundingSphere();root.add(m);vegetation.push(m);}
 root.userData.counts={lavender,beds:beds.length,animals:fauna.length,species:Object.fromEntries(['Lavender_Moth','Scroll_Mouse','Archive_Beetle','Meadow_Lark','Quartz_Finch'].map(type=>[type,fauna.filter(a=>a.type===type).length]))};
 let lastX=Infinity,lastZ=Infinity;
 return {root,fauna,beds,update(time,position){
  if(Math.hypot(position.x-lastX,position.z-lastZ)>3){lastX=position.x;lastZ=position.z;for(const m of vegetation)m.visible=Math.hypot(m.boundingSphere.center.x-position.x,m.boundingSphere.center.z-position.z)<(mobile?100:165)+m.boundingSphere.radius;}
  for(const a of fauna){const {g,type,x,z,index,wings,phase}=a;g.visible=Math.hypot(x-position.x,z-position.z)<(mobile?80:120);if(!g.visible)continue;
   const t=time*.35+phase;let px=x,pz=z,lift=0;
   if(type==='Lavender_Moth'){px+=Math.cos(t)*1.7;pz+=Math.sin(t*1.3)*1.7;lift=1.65+Math.sin(time*1.5+phase)*.35;wings.forEach((w,i)=>w.rotation.z=(i?1:-1)*Math.sin(time*10+phase)*.8);g.rotation.y=-t;}
   else if(type==='Quartz_Finch'){lift=1.18;g.rotation.y=Math.sin(t)*.7;}
   else if(type==='Meadow_Lark'){px+=Math.sin(t)*.6;lift=Math.max(0,Math.sin(time*1.4+phase))*.2;g.rotation.y=-t;wings.forEach((w,i)=>w.rotation.z=(i?1:-1)*(.15+Math.max(0,Math.sin(time+phase))*.3));}
   else{px+=Math.sin(t)*.55;pz+=Math.cos(t)*.45;g.rotation.y=-t;}
   g.position.set(px,height(px,pz)+lift,pz);
  }
 }};
}
