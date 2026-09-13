import * as T from 'three';
import {height} from './geography.js';
import {abyssCaves} from './abyss-layout.js';
export const CAVE_FLOOR=-32;
export function caveLimit(x,z,cave){const dz=Math.max(-69,Math.min(6,z-cave.z)),width=dz> -29?4.4:12.3;return{x:cave.x+Math.max(-width,Math.min(width,x-cave.x)),z:cave.z+dz};}
export function createAbyssCaves({scene,world,player,surfaceGround=height,surfaceArrival=(x,z)=>({x,z}),onTransition,onLore}){
 let active=null;const root=new T.Group();root.name='Underground_Abyss_Galleries';root.visible=false;scene.add(root);
 const stone=new T.MeshStandardMaterial({color:'#344b58',roughness:1,side:T.DoubleSide}),floorMat=new T.MeshStandardMaterial({color:'#607d83',roughness:.95}),crystal=new T.MeshStandardMaterial({color:'#a1d3dd',emissive:'#72b4c7',emissiveIntensity:.3,roughness:.25}),rootMat=new T.MeshStandardMaterial({color:'#668b79',roughness:.9});
 const groups=new Map(),entrances=new Map();
 function box(parent,x,y,z,sx,sy,sz,mat=stone){const m=new T.Mesh(new T.BoxGeometry(sx,sy,sz),mat);m.position.set(x,y,z);parent.add(m);return m;}
 function beam(g,a,b,r,mat=rootMat){const dir=new T.Vector3(...b).sub(new T.Vector3(...a)),m=new T.Mesh(new T.CylinderGeometry(r*.7,r,dir.length(),6),mat);m.position.copy(new T.Vector3(...a).addScaledVector(dir,.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());g.add(m);}
 for(const c of abyssCaves){const entrance=new T.Group(),ey=surfaceGround(c.x,c.z);entrance.name='Cave_Entrance_'+c.id;entrance.position.set(c.x,ey,c.z);world.add(entrance);entrances.set(c.id,entrance);
  for(const side of [-1,1]){box(entrance,side*4.4,3,0,2.2,6,3);const cap=new T.Mesh(new T.IcosahedronGeometry(1,1),stone);cap.position.set(side*4.8,4,0);cap.scale.set(2.8,4.8,3.2);entrance.add(cap);box(entrance,side*3.1,2.4,.6,.22,4.8,.22,crystal);}
  box(entrance,0,6,0,10,2.2,3.6);box(entrance,0,2.7,-.2,6,5.4,.2,new T.MeshBasicMaterial({color:'#101e29'}));box(entrance,0,-.12,2,6,.24,5,floorMat);
  if(c.theme==='tidal')for(let z=5;z<=25;z+=2)for(const side of [-1,1]){const x=c.x+side*.8;box(world,x,height(x,c.z+z)+.025,c.z+z,1.4,.05,1.7,floorMat);}
  const g=new T.Group();g.name=c.name;g.position.set(c.x,CAVE_FLOOR,c.z);root.add(g);groups.set(c.id,g);
  box(g,0,-.5,-31,28,1,80,floorMat);box(g,0,11,-31,30,2,82);box(g,0,5,8,30,12,2);box(g,0,5,-72,30,12,2);
  for(const s of [-1,1]){box(g,s*6,4.5,-10,2,10,40);box(g,s*14,4.5,-50,2,10,44);box(g,s*10,4.5,-30,10,10,2);}
  // Folded rock faces break the rectangular collision envelope into a natural cave profile.
  const vertices=[],paint=[];
  for(const side of [-1,1])for(let j=0;j<15;j++)for(let band=0;band<3;band++){
   const z0=5-j*5,z1=z0-5;if(z0> -30&&z1< -30)continue;
   const width=z0> -29?4.8:12.65,y0=band*3.5,y1=(band+1)*3.5;
   const x0=side*(width+.1*Math.sin(j*2.3+band)),x1=side*(width+.1*Math.cos(j*1.7+band));
   const points=[[x0,y0,z0],[x1,y0,z1],[x0+side*.16,y1,z0],[x1,y0,z1],[x1-side*.1,y1,z1],[x0+side*.16,y1,z0]];
   const color=new T.Color((j+band)%3===0?'#526e79':(j+band)%3===1?'#3c5664':'#65808a');
   for(const v of points){vertices.push(...v);paint.push(color.r,color.g,color.b);}
  }
  const wallGeo=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3)).setAttribute('color',new T.Float32BufferAttribute(paint,3));wallGeo.computeVertexNormals();g.add(new T.Mesh(wallGeo,new T.MeshStandardMaterial({vertexColors:true,roughness:1,side:T.DoubleSide})));
  // A lit threshold identifies the way back; it is a portal, not a hole through the terrain mesh.
  box(g,0,3,6.8,6,6,.1,new T.MeshBasicMaterial({color:'#a6d8e4'}));
  for(let j=0;j<24;j++){const side=j%2?1:-1,z=-4-j*2.6,x=side*(z> -29?4.8:12.8);const m=new T.Mesh(new T.ConeGeometry(.45+(j%3)*.2,2+j%4,5),stone);m.position.set(x,9.5,z);m.rotation.z=Math.PI;g.add(m);}
  for(let j=0;j<16;j++){const z=-33-(j%8)*4.5,x=(j<8?-1:1)*(9.5+Math.sin(j)*1.3);if(c.theme==='mirror'){const m=new T.Mesh(new T.OctahedronGeometry(1),crystal);m.position.set(x,1.8,z);m.scale.set(.75,2.6,.75);m.rotation.y=j;g.add(m);}else{beam(g,[x,9,z],[x*.9,4,z+2],.28);beam(g,[x*.9,4,z+2],[x*.65,.1,z+3],.16);}}
  const pool=new T.Mesh(new T.CircleGeometry(5,40),new T.MeshStandardMaterial({color:c.theme==='mirror'?'#80b7c9':'#4d8e83',emissive:'#376b78',emissiveIntensity:.23,roughness:.18,metalness:.25}));pool.rotation.x=-Math.PI/2;pool.position.set(0,.035,-54);g.add(pool);
  // Walkable water-thin reflective surface; not a hidden collision pit.
  box(g,0,.65,-66,3,1.3,1.6,crystal);
  for(let j=0;j<7;j++){const light=new T.PointLight(c.theme==='mirror'?'#a5ddff':'#9be7c8',24,24,1.4);light.position.set(j%2?3:-3,4,-4-j*10);g.add(light);}
 }
 function enter(c){active=c;root.visible=true;world.visible=false;for(const [id,g]of groups)g.visible=id===c.id;player.position.set(c.x,CAVE_FLOOR,c.z+1);onTransition(true);}
 function exit(){if(!active)return;const c=active;active=null;root.visible=false;world.visible=true;const p=surfaceArrival(c.x,c.z+11);player.position.set(p.x,surfaceGround(p.x,p.z),p.z);onTransition(false);}
 const nearest=()=>abyssCaves.find(c=>Math.abs(player.position.x-c.x)<2.8&&player.position.z-c.z>=-.5&&player.position.z-c.z<=4.5&&Math.abs(player.position.y-entrances.get(c.id).position.y)<1.5);
 const prompt=()=>active?(player.position.z-active.z> -4?'Return to the coast':player.position.z-active.z< -59?'Read the gallery inscription':null):(nearest()?'Enter '+nearest().name:null);
 return{root,entrances,get active(){return active},nearest,prompt,enter,exit,
  ground(x,z){return active?CAVE_FLOOR:height(x,z)},
  constrain(x,z){return active?caveLimit(x,z,active):{x,z}},
  interact(){if(active){if(player.position.z-active.z> -4)exit();else if(player.position.z-active.z< -59)onLore(active);return true;}const c=nearest();if(c){enter(c);return true;}return false;}
 };
}
