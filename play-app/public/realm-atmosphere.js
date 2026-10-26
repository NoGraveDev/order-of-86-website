import * as T from 'three';
import {realms} from './world-data.js';
import {places,height,biome} from './geography.js';
import {polishedTexture} from './polished-materials.js';
// Bounded, ground-following water surfaces: no intersecting floating pool stacks.
export function addRealmAtmosphere(world){
 const root=new T.Group();root.name='Canon_water_and_atmosphere';world.add(root);const animated=[],waterUniforms=[];
 function ribbon(name,points,width,color){const v=[],uv=[],indices=[];
 points.forEach(([x,z],i)=>{const prev=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+1)],dx=next[0]-prev[0],dz=next[1]-prev[1],length=Math.hypot(dx,dz)||1;
 for(const side of [-1,1]){const px=x+dz/length*width*side,pz=z-dx/length*width*side;v.push(px,height(px,pz)+.075,pz);uv.push(side*.5+.5,i*.25)}
 if(i){const a=(i-1)*2;indices.push(a,a+2,a+1,a+1,a+2,a+3)}});
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
 const m=new T.MeshStandardMaterial({color,roughness:.24,metalness:.22,normalMap:polishedTexture('ice',true),normalScale:new T.Vector2(.25,.25),side:T.DoubleSide});const u={value:0};waterUniforms.push(u);m.onBeforeCompile=shader=>{shader.uniforms.waterTime=u;shader.vertexShader='uniform float waterTime;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed.y+=.035*sin(position.x*.7+waterTime*1.6)+.02*cos(position.z*.5-waterTime);')};m.customProgramCacheKey=()=>'water-ribbon-v1';const mesh=new T.Mesh(g,m);mesh.name=name;root.add(mesh);return mesh;
 }
 const forest=realms[1];for(const offset of [-1,1]){const pts=[];for(let i=0;i<70;i++){const z=forest.z-110+i*3.2,x=forest.x+offset*(24+Math.sin(i*.09)*9);if(biome(x,z).id==='deepwood')pts.push([x,z])}ribbon('Deepwood_silver_stream',pts,1.35,'#98c5bd')}
 for(const p of places){
 if(p.name==='Silver Stream'){const pts=Array.from({length:40},(_,i)=>[p.x-24+i*1.25,p.z+Math.sin(i*.14)*3]);ribbon('Silver_Stream_under_wooden_crossing',pts,1.8,'#aacfc6')}
 if(p.name==='Frozen Lake of Echoes'){const g=new T.CircleGeometry(12,64);g.rotateX(-Math.PI/2);const ice=new T.Mesh(g,new T.MeshStandardMaterial({color:'#a9cfdf',roughness:.2,metalness:.16,map:polishedTexture('ice'),normalMap:polishedTexture('ice',true),normalScale:new T.Vector2(.16,.16)}));ice.scale.z=.78;ice.position.set(p.x,height(p.x,p.z)+.08,p.z);ice.name='Frozen_Lake_solid_echo_ice';root.add(ice)}
 if(['Twin Currents','The Divide'].includes(p.name)){for(const side of [-1,1]){const pts=Array.from({length:45},(_,i)=>[p.x+side*(2.5+Math.sin(i*.13)),p.z-28+i*1.3]);ribbon('Abyssal_'+p.name+'_current_'+side,pts,1.2,side===1?'#456e87':'#91b2b5')}}
 }
 let seed=8631;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 for(const [id,color,count,size] of [['deepwood','#b9e5a7',90,.12],['ember','#d9b097',70,.15],['shadow','#d3dfd7',65,1.5],['abyss','#d1e9ef',55,.2]]){
 const r=realms.find(r=>r.id===id),vertices=[];for(let i=0;i<count;i++){const x=r.x+(random()-.5)*100,z=r.z+(random()-.5)*100;vertices.push(x,height(x,z)+.8+random()*5,z)}
 const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));const m=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:0},color:{value:new T.Color(color)},size:{value:size},alpha:{value:id==='shadow'?.08:.6}},vertexShader:'uniform float time;uniform float size;void main(){vec3 p=position;p.x+=sin(time*.25+position.z)*.3;p.y+=sin(time*.4+position.x)*.25;vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=clamp(size*500./max(1.,-mv.z),1.,32.);gl_Position=projectionMatrix*mv;}',fragmentShader:'uniform vec3 color;uniform float alpha;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;gl_FragColor=vec4(color,pow(1.-r,2.)*alpha);\n#include <colorspace_fragment>\n}'});
 const points=new T.Points(g,m);points.name=id+'_ambient_particles';root.add(points);animated.push({points,r});
 }
 return {update(time,position){for(const u of waterUniforms)u.value=time;for(const {points,r} of animated){points.visible=Math.hypot(position.x-r.x,position.z-r.z)<180;points.material.uniforms.time.value=time}}};
}
