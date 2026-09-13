import * as T from 'three';
import {GLTFLoader} from './GLTFLoader.js';
import {biome,height,pathDist,places,WORLD_RADIUS} from './geography.js';
import {realms} from './world-data.js';
// Three instanced draw calls. Fixed seed and conservative clearance preserve paths/landmarks.
export async function addEnvironmentOutcrops(world,colliders) {
 const loader=new GLTFLoader(),names=['weathered-boulder','basalt-outcrop','ridge-stone'];
 const palette={starter:'#727c60',deepwood:'#506d5d',violet:'#92909f',frost:'#afc7ce',ember:'#48474b',sunward:'#c4b477',abyss:'#607683',shadow:'#52645a'};
 const groups=names.map(()=>[]);let seed=866164;
 const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<420;i++){
  const a=random()*Math.PI*2,r=35+random()*(WORLD_RADIUS-55),x=Math.sin(a)*r,z=Math.cos(a)*r;
  if(pathDist(x,z)<12||[...realms,...places].some(p=>Math.hypot(x-p.x,z-p.z)<24)||colliders.some(c=>Math.hypot(x-c.x,z-c.z)<c.r+5))continue;
  const region=biome(x,z),type=['ember','abyss'].includes(region.id)?1:i%3;
  const scale=.6+random()*.8;
  groups[type].push({x,z,scale,angle:random()*Math.PI*2,color:palette[region.id]});
 }
 return Promise.all(names.map(async(name,index)=>{
  try {
   const gltf=await loader.loadAsync('models/environment/'+name+'.glb');
   gltf.scene.updateMatrixWorld(true);let source;gltf.scene.traverse(o=>{if(o.isMesh)source=o});
   if(!source)throw Error('No mesh in '+name);
   const geometry=source.geometry.clone().applyMatrix4(source.matrixWorld);
   const material=new T.MeshStandardMaterial({color:'#ffffff',roughness:.94});
   const entries=groups[index],mesh=new T.InstancedMesh(geometry,material,entries.length),dummy=new T.Object3D();
   entries.forEach((v,i)=>{dummy.position.set(v.x,height(v.x,v.z)-.12,v.z);dummy.rotation.y=v.angle;dummy.scale.setScalar(v.scale);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,new T.Color(v.color));colliders.push({x:v.x,z:v.z,r:v.scale*(index===0?1.55:index===1?1:1.2)})});
   mesh.name='Blender_'+name;mesh.userData.blenderAsset='models/environment/outcrops.blend';mesh.computeBoundingSphere();world.add(mesh);
   return entries.length;
  }catch(error){console.warn('Environment detail unavailable: '+name,error);return 0;}
 }));
}
