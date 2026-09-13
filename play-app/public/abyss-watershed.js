import {buildBoardwalkSurface} from './boardwalk-surface.js';
import {boatChannelDistance,boatCourse} from './boat-course-layout.js';
import {buildBoardwalkBoundary} from './boardwalk-boundary.js';
import {buildWatershedSurface,waterSurfaceAt} from './watershed-surface.js';
import {buildBoardwalkLayout} from './boardwalk-layout.js';
import * as T from 'three';
import {height,biome} from './geography.js';
import {abyssAngle,abyssFalls,fallPoint} from './abyss-layout.js';
import {blueLakes,blueRivers,blueSegments,boardSegments,waterSample,waterClearance,segmentSample} from './abyss-hydrology-layout.js';
export function addAbyssWatershed(world){
 const root=new T.Group();root.name='Abyss_Blue_Watershed';world.add(root);const uniform={value:0},surfaces=[];
 function waterMaterial(kind){return new T.ShaderMaterial({side:T.DoubleSide,uniforms:{time:uniform,kind:{value:kind}},vertexShader:`uniform float time;uniform float kind;varying vec2 wuv;varying vec3 wp;void main(){wuv=uv;wp=position;vec3 p=position;if(kind<.5)p.y+=.07*sin(p.x*.24+time)*cos(p.z*.21-time*.7);if(kind>2.5)p.y+=.8*sin(length(p.xz)*.11+time*1.3)+.3*sin(p.x*.07-p.z*.03+time);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`uniform float time;uniform float kind;varying vec2 wuv;varying vec3 wp;
void main(){float ripple=sin(wp.x*.18+time*.7)*cos(wp.z*.2-time*.9);float foam=0.;vec3 deep=vec3(.025,.27,.48),blue=vec3(.055,.56,.75);
if(kind>.5&&kind<2.5){ripple=sin(wuv.y*12.-time*3.+sin(wuv.x*21.))*sin(wuv.x*37.+wuv.y*3.);foam=smoothstep(.65,.95,ripple)*(kind>1.5?.65:.28);blue=vec3(.11,.66,.81);}
if(kind>2.5){float crest=sin(length(wp.xz)*.11+time*1.3+sin(atan(wp.x,-wp.z)*26.)*.4);foam=smoothstep(.82,1.,crest)*.5;ripple=crest;blue=vec3(.10,.48,.72);}
vec3 c=mix(deep,blue,.56+ripple*.22);c=mix(c,vec3(.83,.96,1.),foam);gl_FragColor=vec4(c,1.);\n#include <colorspace_fragment>\n}`});}
 const lakeMat=waterMaterial(0),riverMat=waterMaterial(1),cascadeMat=waterMaterial(2),seaMat=waterMaterial(3);
 function strip(name,rows,material){const v=[],uv=[],idx=[];rows.forEach((row,i)=>{for(const p of row.points)v.push(...p);uv.push(0,row.v,1,row.v);if(i){const n=i*2;idx.push(n-2,n-1,n,n-1,n+1,n)}});const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3)).setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const m=new T.Mesh(g,material);m.name=name;root.add(m);surfaces.push(m);return m;}
 const surface=buildWatershedSurface(),waterGeometry=new T.BufferGeometry();
 waterGeometry.setAttribute('position',new T.Float32BufferAttribute(surface.vertices.flatMap(p=>[p.x,p.y+.018,p.z]),3));
 waterGeometry.setAttribute('uv',new T.Float32BufferAttribute(surface.vertices.flatMap(p=>[p.x*.03,p.z*.03]),2));
 waterGeometry.computeVertexNormals();const connectedWater=new T.Mesh(waterGeometry,riverMat);connectedWater.name='Terrain_Clipped_Connected_Watershed';root.add(connectedWater);surfaces.push(connectedWater);
 const riverLength=blueSegments.reduce((n,s)=>n+s.length,0);
 for(let i=0;i<abyssFalls.length;i++){const f=abyssFalls[i],p=fallPoint(f,959),top=i?67:68;strip('Connected_Sea_Waterfall_'+i,Array.from({length:50},(_,j)=>({points:[-1,1].map(s=>[p.x+Math.cos(f.angle)*s*f.width,top+(-27.5-top)*j/49,p.z+Math.sin(f.angle)*s*f.width]),v:j*.22})),cascadeMat);}
 const seaVertices=[],seaUV=[],seaIndices=[];
 for(let j=0;j<=28;j++)for(let i=0;i<=100;i++){const a=abyssAngle-.52+i*1.04/100,r=959+j*11;seaVertices.push(Math.sin(a)*r,-27.65,-Math.cos(a)*r);seaUV.push(i/100,j/28);if(i<100&&j<28){const n=j*101+i;seaIndices.push(n,n+1,n+101,n+1,n+102,n+101)}}
 const seaGeo=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(seaVertices,3)).setAttribute('uv',new T.Float32BufferAttribute(seaUV,2));seaGeo.setIndex(seaIndices);seaGeo.computeVertexNormals();const sea=new T.Mesh(seaGeo,seaMat);sea.name='Abyss_Incoming_Ocean_Surf';root.add(sea);
 const ocean=world.getObjectByName('Beyond_world_water');if(ocean)ocean.material.color.set('#397fa9');
 // Individual wooden boards, paired stringers, support posts and low rope rails.
 const woodGeo=new T.BoxGeometry(1,1,1),woodMats=['#8e7552','#a08760','#b09974'].map(color=>new T.MeshStandardMaterial({color,roughness:.95}));
 const posts=[],rails=[],dummy=new T.Object3D(),layout=buildBoardwalkLayout(),walk=layout.edges;
 // One partitioned deck: no layered plank tops or overlapping landing caps.
 const deckSurface=buildBoardwalkSurface(layout),deckVertices=[[],[],[]];
 function tri(list,a,b,c){const up=(b.z-a.z)*(c.x-a.x)-(b.x-a.x)*(c.z-a.z);for(const p of up>=0?[a,b,c]:[a,c,b])list.push(p.x,p.y,p.z);}
 for(const face of deckSurface.faces){const list=deckVertices[face.material],p=face.points;for(let i=1;i<p.length-1;i++)tri(list,p[0],p[i],p[i+1]);}
 deckVertices.forEach((vertices,i)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.computeVertexNormals();const m=new T.Mesh(g,woodMats[i]);m.name='Boardwalk_planks_'+i;root.add(m);});
 root.userData.deckSurface=deckSurface;
 // Continuous two-height timber banisters on exposed edges only.
 const boundary=buildBoardwalkBoundary(layout),postKeys=new Set();
 for(const edge of boundary){const {a,b}=edge,dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz),angle=Math.atan2(dx,dz),slope=Math.atan2(b.y-a.y,length);
  for(const rise of [.52,1.05])rails.push({x:(a.x+b.x)/2,y:(a.y+b.y)/2+rise,z:(a.z+b.z)/2,sx:.12,sy:.12,sz:Math.hypot(length,b.y-a.y)+.025,angle,slope});
  for(const p of [a,b]){const key=p.x.toFixed(3)+','+p.z.toFixed(3);if(postKeys.has(key))continue;postKeys.add(key);const channel=waterSample(p.x,p.z).distance<5&&boatChannelDistance(p.x,p.z)<9;const g=channel?p.y-.25:Math.min(height(p.x,p.z),p.y-.2);posts.push({x:p.x,y:(g+p.y+1.12)/2,z:p.z,sx:.14,sy:p.y+1.12-g,sz:.14,angle});}
 }
 const underside=[];for(const face of deckSurface.faces){const p=face.points.map(v=>({...v,y:v.y-.18}));for(let i=1;i<p.length-1;i++)tri(underside,p[0],p[i],p[i+1]);}
 const undersideGeo=new T.BufferGeometry();undersideGeo.setAttribute('position',new T.Float32BufferAttribute(underside,3));undersideGeo.computeVertexNormals();const undersideMat=woodMats[0].clone();undersideMat.side=T.BackSide;const undersideMesh=new T.Mesh(undersideGeo,undersideMat);undersideMesh.name='Boardwalk_Underside';root.add(undersideMesh);
 const sides=[];for(const {a,b}of boundary){const low=p=>({x:p.x,y:p.y-.18,z:p.z}),c=low(b),d=low(a);for(const p of [a,b,c,a,c,d])sides.push(p.x,p.y,p.z);}
 const fasciaGeo=new T.BufferGeometry();fasciaGeo.setAttribute('position',new T.Float32BufferAttribute(sides,3));fasciaGeo.computeVertexNormals();const fasciaMat=woodMats[0].clone();fasciaMat.side=T.DoubleSide;const fascia=new T.Mesh(fasciaGeo,fasciaMat);fascia.name='Boardwalk_Outer_Fascia';root.add(fascia);
 root.userData.railBoundary=boundary;
 function make(entries,mat,name){const m=new T.InstancedMesh(woodGeo,mat,entries.length);m.name=name;entries.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(-(p.slope||0),p.angle,0,'YXZ');dummy.scale.set(p.sx,p.sy,p.sz);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix)});m.computeBoundingSphere();root.add(m);return m;}
 make(posts,woodMats[0],'Boardwalk_pilings');make(rails,new T.MeshStandardMaterial({color:'#c9b992',roughness:1}),'Boardwalk_rope_rails');
 const walkCells=new Map();for(const s of walk){for(let x=Math.floor((Math.min(s.a.x,s.b.x)-4)/30);x<=Math.floor((Math.max(s.a.x,s.b.x)+4)/30);x++)for(let z=Math.floor((Math.min(s.a.z,s.b.z)-4)/30);z<=Math.floor((Math.max(s.a.z,s.b.z)+4)/30);z++){const key=x+','+z;if(!walkCells.has(key))walkCells.set(key,[]);walkCells.get(key).push(s);}}
 const nearest=(x,z)=>{const landing=layout.junctions.find(n=>Math.hypot(n.x-x,n.z-z)<=3);let best=landing?{distance:0,y:landing.y,landing:true}:null;for(const s of walkCells.get(Math.floor(x/30)+','+Math.floor(z/30))||[]){const t=((x-s.a.x)*s.dx+(z-s.a.z)*s.dz)/(s.length*s.length);if(t<-.0001||t>1.0001)continue;const p=segmentSample(s,x,z);if(p.distance<=2.75&&(!best||p.y>best.y))best={...p,s};}return best;};
 const counts={lakes:blueLakes.length,rivers:blueRivers.length,riverMetres:Math.round(riverLength),boardwalkMetres:Math.round(walk.reduce((n,s)=>n+s.length,0)),planks:walk.length};root.userData.counts=counts;
 return{root,walk,layout,surface,counts,nearest,arrival(x,z){if(!waterSurfaceAt(x,z)||nearest(x,z))return{x,z};let best=null;for(const s of walk){const p=segmentSample(s,x,z);if(!best||p.y>best.y)best={distance:p.distance,x:s.a.x+s.dx*p.t,z:s.a.z+s.dz*p.t};}return best||{x,z}},ground(x,z){const p=nearest(x,z);return p?Math.max(height(x,z),p.y):height(x,z)},canMove(x,z){return !waterSurfaceAt(x,z)||!!nearest(x,z)},update(time){uniform.value=time}};
}
