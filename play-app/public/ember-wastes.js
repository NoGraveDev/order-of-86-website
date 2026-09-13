import * as T from 'three';
import {height,biome,pathDist,places,WORLD_RADIUS} from './geography.js';
import {realms} from './world-data.js';
import {emberPoint,emberRivers,riverPoint,lavaVisible,riverClearance,emberLoreSites,emberReserved} from './ember-layout.js';
export function addEmberWastes(world,colliders){
 const root=new T.Group();root.name='Ember_Wastes_Reborn';world.add(root);
 const geo={rock:new T.IcosahedronGeometry(1,1),orb:new T.SphereGeometry(1,8,6),box:new T.BoxGeometry(1,1,1),column:new T.CylinderGeometry(.85,1,1,6),cone:new T.ConeGeometry(1,1,6)};
 const palette={basalt:'#302b30',rust:'#6f4940',ash:'#948a7f',glass:'#171a22',gold:'#ffc466',fire:'#ff6419',sulfur:'#e2d36b',green:'#697b48',petal:'#df714e',bone:'#c8baa0'};
 const materials=Object.fromEntries(Object.entries(palette).map(([k,color])=>[k,new T.MeshStandardMaterial({color,roughness:k==='glass'?.23:.86,...(['fire','gold','sulfur'].includes(k)?{emissive:color,emissiveIntensity:k==='fire'?1.25:.3}:{})})]));
 const batches=new Map(),animals=[],moths=[];let seed=8610910;
 const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 function put(kind,color,x,y,z,sx,sy,sz,rotation=0){const key=kind+color;if(!batches.has(key))batches.set(key,{kind,color,entries:[]});batches.get(key).entries.push({x,y,z,sx,sy,sz,rotation});}
 function part(g,kind,color,x,y,z,sx,sy,sz,rotation=0){const m=new T.Mesh(geo[kind],materials[color]);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.z=rotation;g.add(m);return m;}
 function boulder(x,z,s){const y=height(x,z),rot=rand()*6.28;put('rock',rand()<.35?'rust':'basalt',x,y+s*.43,z,s,s*.82,s*.75,rot);put('rock','ash',x+s*.13,y+s*1.01,z,s*.48,s*.15,s*.42,rot);colliders.push({x,z,r:s*.96});}
 let boulders=0;
 for(let i=0;i<1800;i++){const angle=2.69279+(rand()-.5)*.79,r=270+rand()*653,x=Math.sin(angle)*r,z=-Math.cos(angle)*r,s=i%7===0?7+rand()*9:1.4+rand()*4.5;
  if(biome(x,z).id!=='ember'||Math.hypot(x,z)+s>WORLD_RADIUS-12||pathDist(x,z)<s+11||riverClearance(x,z)<s+14||[...realms,...places].some(p=>Math.hypot(x-p.x,z-p.z)<s+39)||colliders.some(c=>Math.hypot(x-c.x,z-c.z)<c.r+s+3))continue;
  boulder(x,z,s);boulders++;
  if(i%4===0)for(let j=0;j<4;j++){const px=x+Math.cos(j*1.4)*s*1.15,pz=z+Math.sin(j*1.4)*s*1.15;put('column','glass',px,height(px,pz)+s*.55,pz,s*.24,s*(.8+j*.14),s*.24,j);}
 }
 // Ground-conforming lava, with narrow basalt banks and genuine gaps at the ring roads.
 const lavaMaterial=new T.ShaderMaterial({side:T.DoubleSide,uniforms:{time:{value:0}},vertexShader:'varying vec2 lavaUV;void main(){lavaUV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`uniform float time;varying vec2 lavaUV;
 void main(){vec2 p=vec2(lavaUV.x*9.,lavaUV.y*.42-time*.19);float vein=sin(p.y*3.+sin(p.x*2.1)*2.)*sin(p.x*2.7+sin(p.y*1.3));float hot=smoothstep(.24,.8,vein);float bank=smoothstep(0.,.14,lavaUV.x)*smoothstep(0.,.14,1.-lavaUV.x);vec3 color=mix(vec3(.12,.035,.025),mix(vec3(.63,.055,.006),vec3(1.,.57,.025),hot),bank);gl_FragColor=vec4(color,1.);\n#include <colorspace_fragment>\n}`});
 let riverSegments=0;
 for(const river of emberRivers){const vertices=[],uv=[],indices=[];for(let r=river.start;r<river.end;r+=2){const p=riverPoint(r,river.side),q=riverPoint(r+2,river.side);if(!lavaVisible(p.x,p.z)||!lavaVisible(q.x,q.z))continue;
   for(let j=0;j<8;j++){const n=vertices.length/3;for(const [v,f] of [[p,j/8],[q,j/8],[p,(j+1)/8],[q,(j+1)/8]]){const point=emberPoint(v.u+(f*2-1)*v.width,v.r);vertices.push(point.x,height(point.x,point.z)+.15,point.z);uv.push(f,v.r);}indices.push(n,n+1,n+2,n+2,n+1,n+3);}riverSegments++;
   if(Math.round(r-river.start)%6===0){colliders.push({x:p.x,z:p.z,r:p.width+1.3});for(const side of [-1,1]){const b=emberPoint(p.u+side*(p.width+1.8),r);put('rock','basalt',b.x,height(b.x,b.z)+.45,b.z,1.8,.95,2.4,r);}}
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();const mesh=new T.Mesh(g,lavaMaterial);mesh.name='Flowing_Lava_'+river.id;root.add(mesh);
  for(const r of [440,780]){const p=riverPoint(r,river.side);for(let i=-5;i<=5;i++){const c=emberPoint(p.u+i*2.8,r);put('box','basalt',c.x,height(c.x,c.z)+.1,c.z,2.65,.22,14,-realms[4].angle);for(const side of [-1,1]){const b=emberPoint(p.u+i*2.8,r+side*8.5);put('column','ash',b.x,height(b.x,b.z)+.8,b.z,.38,1.6,.38);}}}
 }
 // Lore stops: objects, not additional buildings or invented relics.
 for(const site of emberLoreSites){const {x,z}=site,y=height(x,z);put('column','basalt',x-3,y+.8,z,1,1.6,1);put('rock','gold',x-3,y+1.7,z,.28,.2,.28);}
 const memorial=emberLoreSites.find(p=>p.id==='ember-orbs');
 for(let i=0;i<18;i++){const x=memorial.x+(i%6-2.5)*2,z=memorial.z-3-Math.floor(i/6)*2.5,y=height(x,z);put('box','basalt',x,y+.65,z,1.45,1.3,1.45);put('orb',i<6?'ash':'glass',x,y+1.65,z,.43,.43,.43);}
 const garden=places.find(p=>p.name==='Ash Garden');
 for(let i=0;i<210;i++){const a=rand()*6.28,r=5+rand()*21,x=garden.x+Math.cos(a)*r,z=garden.z+Math.sin(a)*r,y=height(x,z);put('column','green',x,y+.4,z,.07,.8,.07);for(let j=0;j<5;j++)put('rock',i%3?'petal':'gold',x+Math.cos(j*1.256)*.22,y+.8,z+Math.sin(j*1.256)*.22,.23,.1,.2,j);}
 const seeds=emberLoreSites.find(p=>p.id==='ember-seeds');for(let i=0;i<22;i++){const x=seeds.x-7+(i%6)*2.3,z=seeds.z-3-Math.floor(i/6)*2.5,y=height(x,z);put('rock','ash',x,y+.08,z,.7,.15,.7);put('cone','green',x,y+.55,z,.4,.9,.4);put('orb','fire',x,y+.4,z,.11,.13,.11);}
 // Forge-side braziers support animated moth swarms.
 const mothSite=emberLoreSites.find(p=>p.id==='ember-moths');
 for(let j=0;j<4;j++){const x=mothSite.x+Math.cos(j*1.57)*7,z=mothSite.z+Math.sin(j*1.57)*7,y=height(x,z);put('column','basalt',x,y+1.4,z,.65,2.8,.65);put('rock','fire',x,y+3,z,.6,.6,.6);}
 const wingShape=new T.Shape();wingShape.moveTo(0,0);for(const [x,y]of [[.25,.3],[.72,.5],[1,.2],[.78,.08],[.86,-.2],[.45,-.35],[.18,-.2]])wingShape.lineTo(x,y);wingShape.closePath();const wingGeo=new T.ShapeGeometry(wingShape);wingGeo.rotateX(-Math.PI/2);
 const wingMat={spark:new T.MeshStandardMaterial({color:'#82716a',emissive:'#d76c26',emissiveIntensity:.35,side:T.DoubleSide}),sulfur:new T.MeshStandardMaterial({color:'#e9d779',emissive:'#becf4e',emissiveIntensity:.5,side:T.DoubleSide})};
 const wingMeshes={};for(const type of ['spark','sulfur']){const wings=new T.InstancedMesh(wingGeo,wingMat[type],48);wings.name=type+'_Moth_Wings';wings.instanceMatrix.setUsage(T.DynamicDrawUsage);wings.frustumCulled=false;root.add(wings);wingMeshes[type]=wings;}
 const mothBodies=new T.InstancedMesh(geo.orb,materials.basalt,48),mothMarks=new T.InstancedMesh(geo.orb,materials.gold,96);mothBodies.name='Moth_Fuzzy_Bodies';mothMarks.name='Moth_Ember_Patterns';mothBodies.frustumCulled=mothMarks.frustumCulled=false;root.add(mothBodies,mothMarks);
 for(let i=0;i<48;i++)moths.push({type:i<24?'spark':'sulfur',phase:rand()*6.28,radius:3+rand()*11,center:i%3===0?emberLoreSites.find(p=>p.id==='ember-familiars'):mothSite});
 const dustGeo=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(new Float32Array(48*3),3));const dust=new T.Points(dustGeo,new T.PointsMaterial({color:'#f8d77e',size:.13,transparent:true,opacity:.6,depthWrite:false}));dust.name='Moth_Sulfur_And_Sparks';dust.frustumCulled=false;root.add(dust);
 function creature(type,x,z,index){const g=new T.Group();g.name=type;root.add(g);const wings=[];
  if(type==='Ash_Rabbit'){part(g,'orb','ash',0,.48,0,.46,.5,.65);part(g,'orb','ash',0,.82,-.45,.31,.3,.3);for(const s of [-1,1]){part(g,'orb','basalt',s*.15,1.3,-.42,.09,.48,.1,s*.12);part(g,'orb','fire',s*.21,.89,-.65,.045,.045,.04);part(g,'orb','ash',s*.25,.16,.13,.2,.16,.34);}part(g,'orb','bone',0,.58,.6,.19,.19,.19);}
  if(type==='Magma_Crab'){part(g,'rock','basalt',0,.23,0,.39,.25,.29);for(const s of [-1,1]){for(let j=0;j<3;j++)part(g,'box','basalt',s*.4,.13,(j-1)*.22,.45,.07,.08,s*.25);part(g,'rock','fire',s*.45,.28,-.4,.16,.12,.23);part(g,'orb','gold',s*.12,.39,-.2,.035,.04,.035);}}
  if(type==='Pumice_Tortoise'){part(g,'orb','ash',0,.68,0,1.25,.75,1.55);for(let j=0;j<18;j++){const a=j*2.4,r=.3+(j%4)*.18;part(g,'rock','basalt',Math.cos(a)*r,.99+(.9-r)*.4,Math.sin(a)*r,.1,.05,.09);}part(g,'orb','green',0,.44,-1.65,.36,.3,.5);for(const s of [-1,1])for(const f of [-1,1])part(g,'orb','bone',s*.95,.15,f*.85,.35,.2,.45);}
  if(type==='Cinder_Swallow'){part(g,'orb','basalt',0,0,0,.18,.16,.5);for(const s of [-1,1]){const w=part(g,'cone','basalt',s*.5,0,0,.65,.12,.35,s*.12);w.rotation.z=s*.3;wings.push(w);part(g,'cone','fire',s*.25,0,.55,.13,.1,.4);}}
  if(type==='Anvil_Beetle'){part(g,'box','basalt',0,.23,0,.5,.3,.65);part(g,'box','ash',0,.42,0,.7,.13,.45);part(g,'cone','rust',0,.37,-.42,.22,.15,.4);for(const s of [-1,1])for(let j=0;j<3;j++)part(g,'box','basalt',s*.3,.09,(j-1)*.22,.3,.065,.08);}
  if(type==='Forge_Salamander'){part(g,'orb','basalt',0,.16,0,.18,.17,.7);part(g,'orb','fire',0,.12,-.05,.14,.12,.59);part(g,'orb','basalt',0,.2,-.63,.22,.2,.25);for(const s of [-1,1])for(const f of [-1,1])part(g,'box','fire',s*.22,.06,f*.36,.3,.07,.1);part(g,'cone','fire',0,.1,.88,.12,.12,.6);}
  animals.push({g,type,x,z,index,wings,phase:rand()*6.28});return g;
 }
 const wildlife=emberLoreSites.find(p=>p.id==='ember-fauna'),forge=emberLoreSites.find(p=>p.id==='ember-familiars');
 for(let i=0;i<10;i++){creature('Ash_Rabbit',wildlife.x-8+(i%5)*3,wildlife.z-7-Math.floor(i/5)*4,i);creature('Magma_Crab',forge.x-7+(i%5)*3,forge.z-5-Math.floor(i/5)*3,i);}
 for(let i=0;i<6;i++){creature('Forge_Salamander',forge.x-5+i*2,forge.z+4,i);creature('Anvil_Beetle',forge.x-5+i*2,forge.z-9,i);}
 for(let i=0;i<8;i++)creature('Cinder_Swallow',mothSite.x,mothSite.z,i);
 for(let i=0;i<4;i++){const p=riverPoint(502+i*6,-1);creature('Pumice_Tortoise',p.x,p.z,i);}
 const dummy=new T.Object3D(),wingMark=new T.Vector3();for(const {kind,color,entries}of batches.values()){const m=new T.InstancedMesh(geo[kind],materials[color],entries.length);m.name='Ember_'+kind+'_'+color;entries.forEach((e,i)=>{dummy.position.set(e.x,e.y,e.z);dummy.scale.set(e.sx,e.sy,e.sz);dummy.rotation.set(0,e.rotation,0);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix)});m.computeBoundingSphere();root.add(m);}
 root.userData.counts={boulders,riverSegments,moths:moths.length,animals:animals.length};
 function matrix(mesh,i,x,y,z,sx,sy,sz,yaw=0,roll=0){dummy.position.set(x,y,z);dummy.rotation.set(0,yaw,roll);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}
 return {root,update(time,position){lavaMaterial.uniforms.time.value=time;
  const near=Math.hypot(position.x-mothSite.x,position.z-mothSite.z)<190;for(const m of [...Object.values(wingMeshes),mothBodies,mothMarks,dust])m.visible=near;
  if(near){const counts={spark:0,sulfur:0};moths.forEach((m,i)=>{const a=time*(.28+(i%4)*.025)+m.phase,x=m.center.x+Math.cos(a)*m.radius,z=m.center.z+Math.sin(a*1.17)*m.radius,y=height(x,z)+3.3+Math.sin(time*1.2+m.phase)*.6,flap=Math.sin(time*12+m.phase)*.7;matrix(mothBodies,i,x,y,z,.07,.07,.22,-a);for(const side of [-1,1]){matrix(wingMeshes[m.type],counts[m.type]++,x,y,z,.48,.48,.48,-a+(side<0?Math.PI:0),side*flap);wingMark.set(.53,.035,-.02).applyMatrix4(dummy.matrix);matrix(mothMarks,i*2+(side+1)/2,wingMark.x,wingMark.y,wingMark.z,.05,.025,.08,-a);}dustGeo.attributes.position.setXYZ(i,x-.25,y-.5-(i%4)*.15,z-.2);});for(const mesh of [...Object.values(wingMeshes),mothBodies,mothMarks])mesh.instanceMatrix.needsUpdate=true;dustGeo.attributes.position.needsUpdate=true;}
  for(const animal of animals){const {g,type,x,z,phase,index}=animal;g.visible=Math.hypot(position.x-x,position.z-z)<145;if(!g.visible)continue;let px=x,pz=z,y=0;
   if(type==='Cinder_Swallow'){const a=time*.45+phase;px=x+Math.cos(a)*(16+index);pz=z+Math.sin(a)*(16+index);y=13+Math.sin(a*2);for(const w of animal.wings)w.rotation.z=Math.sin(time*7+phase)*.5;g.rotation.y=-a;}
   else if(type==='Pumice_Tortoise'){const p=riverPoint(502+index*6+Math.sin(time*.12+phase)*2,-1);px=p.x;pz=p.z;y=.24;g.rotation.y=realms[4].angle;}
   else{px+=Math.sin(time*.28+phase)*1.1;pz+=Math.cos(time*.28+phase)*.8;g.rotation.y=-time*.28-phase;y=type==='Ash_Rabbit'?Math.max(0,Math.sin(time*2+phase))*.18:0;}
   g.position.set(px,height(px,pz)+y,pz);
  }
 }};
}
