import {sunRoadDistance} from './sunward-layout.js';
import * as T from 'three';
import {textured} from './surface-textures.js';
import {realms} from './world-data.js';
import {places,biome,height,pathDist} from './geography.js';
export function addWorldDetail({world,mesh,orb,beam,torus,cube,ico,mat,rand,mobile=false}){
 const group=new T.Group();group.name='Expanded_Realm_Details';world.add(group);const collisions=[];
 const batches=new Map(),dummy=new T.Object3D();
 const geo={rock:ico,leaf:new T.IcosahedronGeometry(1,2),trunk:new T.CylinderGeometry(.6,.9,1,16),grass:new T.PlaneGeometry(.65,1,1,4),crystal:new T.ConeGeometry(1,1,5)};
 function instance(kind,color,x,y,z,sx,sy,sz){const key=kind+color;if(!batches.has(key))batches.set(key,{kind,color,items:[]});batches.get(key).items.push([x,y,z,sx,sy,sz])}
 for(let i=0;i<2000;i++){const angle=rand()*Math.PI*2,r=105+Math.sqrt(rand())*365,x=Math.sin(angle)*r,z=-Math.cos(angle)*r,b=biome(x,z);if(pathDist(x,z)<9||places.some(p=>Math.hypot(x-p.x,z-p.z)<23)||realms.some(p=>Math.hypot(x-p.x,z-p.z)<25))continue;const y=height(x,z),s=.8+rand()*1.4;
 if(['deepwood','violet','shadow'].includes(b.id)){const h=(b.id==='deepwood'?13:8)*s;instance('trunk',b.id==='violet'?'#c6c8c1':'#605348',x,y+h/2,z,.8*s,h,.8*s);collisions.push({x,z,r:1.1*s});if(b.id!=='shadow'){for(let j=0;j<3;j++)instance('leaf',b.id==='violet'?'#b5a1c5':'#517a5e',x+Math.sin(j*2.4)*3*s,y+h+j*s,z+Math.cos(j*2.4)*3*s,4*s,2.4*s,3.5*s)}else{instance('rock','#799383',x+2,y+1,z,2,.7,2)}}
 else if(b.id==='frost')instance('crystal','#c3e1e7',x,y+5*s,z,2*s,10*s,2*s);
 else if(b.id==='sunward'){instance('rock','#d6c58c',x,y+.8,z,3*s,1.5*s,2*s);if(i%4===0)instance('trunk','#ede2c3',x,y+5*s,z,1,10*s,1)}
 else instance('rock',b.id==='ember'?'#45414a':'#536979',x,y+2*s,z,4*s,5*s,3*s);
 }
 for(let i=0;i<(mobile?12000:28000);i++){const a=rand()*Math.PI*2,r=Math.sqrt(rand())*470,x=Math.sin(a)*r,z=-Math.cos(a)*r,b=biome(x,z);if(sunRoadDistance(x,z)<6||pathDist(x,z)<5||['frost','abyss','ember'].includes(b.id))continue;const color=b.id==='violet'?'#b59dcc':b.id==='shadow'?'#718a6e':b.id==='sunward'?'#d7c16d':'#9aaf65';instance('grass',color,x,height(x,z)+.4,z,1,.5+rand(),1);if(i%8===0)instance('leaf',b.id==='violet'?'#dbc4ed':'#ecdc9f',x,height(x,z)+.9,z,.15,.15,.15)}
 for(const {kind,color,items} of batches.values()){const batch=new T.InstancedMesh(geo[kind],textured(mat(color),kind==='trunk'?'bark':kind==='leaf'?'leaf':kind==='grass'?'grass':kind==='crystal'?'ice':'rock'),items.length);batch.name='Detail_'+kind;if(kind==='grass')batch.material.side=T.DoubleSide;items.forEach(([x,y,z,sx,sy,sz],i)=>{dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(0,i*2.399,0);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix)});batch.computeBoundingSphere();group.add(batch)}
 // Milestones illuminate the radial roads and their two linking circuits.
 for(const r of realms.slice(1))for(let distance=45;distance<460;distance+=40){const x=Math.sin(r.angle)*distance+Math.cos(r.angle)*6,z=-Math.cos(r.angle)*distance+Math.sin(r.angle)*6,y=height(x,z);mesh(ico,'#8b9383',x,y+.7,z,.55,.9,.45,group);orb(r.color,x,y+1.5,z,.18,.18,.18,group)}
 for(const p of places){const g=new T.Group();g.name=p.name;g.position.set(p.x,height(p.x,p.z),p.z);group.add(g);const c=realms.find(r=>r.id===p.realm).color;
 if(['Archivum','Hall of the Dead','Zombie Crypts'].includes(p.name)){for(let i=-2;i<=2;i++){mesh(cube,p.realm==='shadow'?'#5c6563':'#b1a7b7',i*4,3,0,2.7,6,3,g);mesh(new T.ConeGeometry(2,2,4),c,i*4,7,0,1,1,1,g);for(let j=0;j<4;j++)beam([i*4-.6,1.5+j,1.55],[i*4+.6,1.5+j,1.55],.03,c,g)}for(let side of [-1,1])mesh(cube,'#8f879a',side*11,4,-5,2,8,14,g)}
 else if(p.name.includes('Cave')||p.name.includes('Mirror')||p.name==='Listener Post'){for(let i=0;i<7;i++){const a=i*Math.PI/6;mesh(ico,p.realm==='frost'?'#b5dbe8':'#697481',Math.cos(a)*7,Math.sin(a)*7,0,2,2.5,3,g)}if(p.name==='Truth Mirror'){orb('#486b83',0,3.5,0,1.8,3,.1,g);torus('#cde9e9',0,3.5,0,2,.2,g).scale.y=1.5}else if(p.name==='First Ember Cave')orb('#f2a65f',0,.5,0,.5,.5,.5,g);else for(let i=0;i<6;i++)mesh(new T.ConeGeometry(.5,3,5),c,-4+i*1.6,1,-1,1,1,1,g)}
 else if(p.name==='The Crucible'){/* Dedicated multiplayer lava arena supplies this landmark. */}
 else if(p.name==='The Divide'){for(let side of [-1,1])for(let j=0;j<6;j++)mesh(ico,'#536c7b',side*(10+j),4+j, -10+j*5,5,10,7,g);for(let j=0;j<12;j++)mesh(cube,'#a7bcc0',-8+j*1.5,.1,8,1.4,.2,3,g)}
 else if(p.name==='Frozen Lake of Echoes'){const ice=mesh(new T.CircleGeometry(20,48),'#96becd',0,.08,0,1,1,1,g);ice.rotation.x=-Math.PI/2;for(let j=0;j<10;j++)beam([-15+j*3,.11,-9],[Math.sin(j)*12,.11,12],.025,'#e0f0ef',g)}
 else if(p.name.includes('Plateau')||p.name.includes('Pillar')){for(let j=0;j<12;j++){let a=j*Math.PI/6;mesh(new T.CylinderGeometry(.8,1,7,8),'#eee6cd',Math.sin(a)*13,3.5,Math.cos(a)*13,1,1,1,g)}const disk=mesh(new T.CircleGeometry(14,36),'#d9cfad',0,.05,0,1,1,1,g);disk.rotation.x=-Math.PI/2;for(let j=0;j<7;j++)orb('#f7edcd',Math.sin(j)*9,.08,Math.cos(j)*9,1.1,.025,.6,g)}
 else if(p.name==='Great Rot Border'||p.name==='The Shifting Grounds'){for(let j=0;j<16;j++){const a=j*2.4;mesh(ico,'#404e42',Math.sin(a)*10,.3,Math.cos(a)*10,3,.6,2,g);beam([Math.sin(a)*4,.2,Math.cos(a)*4],[Math.sin(a)*16,.3,Math.cos(a)*16],.17,'#819c63',g);orb('#a1bd82',Math.sin(a)*9,1,Math.cos(a)*9,.25,.25,.25,g)}}
 else{for(let j=0;j<10;j++){const a=j*2.4;mesh(ico,'#9ba499',Math.sin(a)*10,.3,Math.cos(a)*10,1,.5,1,g);orb(c,Math.sin(a)*9,1,Math.cos(a)*9,.3,.4,.3,g)}for(let j=0;j<5;j++)beam([-10+j*5,.15,-5],[-7+j*5,.15,5],.05,c,g)}
 // Name-free rune posts identify each discoverable location in the world.
 mesh(cube,'#66736d',-4,1.1,14,.6,2.2,.6,g);orb(c,-4,2.4,14,.22,.22,.22,g);
 }
 return {collisions,group};
}
