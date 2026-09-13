import * as T from 'three';
import {GLTFLoader} from './GLTFLoader.js';
import {lizardTypes} from './collectibles.js';

export const SEPTEMBER_LIZARD_SOURCE='blender/sources/crystal-lizard-september-08.blend';
export const LIZARD_WALK_DISTANCE=.2;
// Every spawned creature owns its bones, while geometry and animation clips stay shared.
export function cloneLizard(source){
 const root=source.clone(true),copies=new Map();
 function pair(a,b){copies.set(a,b);a.children.forEach((child,i)=>pair(child,b.children[i]));}pair(source,root);
 source.traverse(original=>{if(!original.isSkinnedMesh)return;const copy=copies.get(original);copy.skeleton=original.skeleton.clone();copy.skeleton.bones=original.skeleton.bones.map(b=>copies.get(b));copy.bind(copy.skeleton,original.bindMatrix.clone());});
 return root;
}
const walkers=new WeakMap();
export function animateLizard(root,travelDistance,phase=0){
 let walker=walkers.get(root);
 if(!walker){
  const clip=root.animations.find(a=>a.name==='CrystalLizard_Walk');
  if(!clip)throw Error('September lizard walk animation is missing');
  const mixer=new T.AnimationMixer(root),action=mixer.clipAction(clip);action.play();
  walker={mixer,duration:clip.duration};walkers.set(root,walker);
 }
 // Distance-driven sampling freezes with world time and never advances hidden
 // creatures independently. A complete gait covers the authored 20cm stride.
 walker.mixer.setTime((travelDistance/LIZARD_WALK_DISTANCE+phase)*walker.duration);
}
// Master Bible §V: retain each species' colors, not merely the realm's scenery tint.
export const lizardPalettes={
 common:{plates:['#c3d5dc','#e9e2ef','#eff2dd','#d5eadd','#f7f3f0'],seams:'#a7b4bc',spikes:['#8fcdd0','#b4a4d8','#e8c5df','#e1dfa3'],claws:'#fff6ed'},
 moss:{plates:['#407c3c','#66a254','#8fbd6c','#528b42','#add485'],seams:'#315133',spikes:['#285b35','#408641','#70a944','#9cc963'],claws:'#c4dc9f'},
 script:{plates:['#653093','#8743b4','#aa68cd','#783aa6','#c08ce0'],seams:'#40205e',spikes:['#593192','#8750c4','#b389e8','#d8b8fa'],claws:'#e1c8ff'},
 // Frost uses the authored September palette without recoloring.
 frost:{original:true},
 magma:{plates:['#bf4518','#e86620','#fa983c','#d85016','#ffc16b'],seams:'#81301b',spikes:['#b53612','#e64d16','#ff8b24','#ffcc5f'],claws:'#ffd991'},
 prism:{plates:['#dfE6ee','#f5f4fa','#ffffff','#e9edf5','#ffffff'],seams:'#bfc9dd',rainbow:['#ef707c','#ffb74f','#f6e96a','#69cc98','#60bfea','#aa8be7','#e694d2'],claws:'#ffffff'},
 ghost:{plates:['#489fb9','#6fc2d8','#a2dfeb','#54b2ce','#c2f0f4'],seams:'#4b9dbd',spikes:['#318fae','#45bfd6','#7fe3ed','#c3ffff'],claws:'#d9ffff',opacity:.72},
 purr:{plates:['#d882aa','#e9a0c1','#f3bfd7','#df91b5','#ffdaE8'],seams:'#a86491',spikes:['#c575a9','#e390bd','#f5b7d7','#ffdfed'],claws:'#ffedf4'},
 rot:{plates:['#24342e','#354b3b','#496044','#2c4034','#607653'],seams:'#a1c94c',spikes:['#334329','#5c722e','#96aa39','#becb58'],claws:'#aab96a'}
};
const ice=[[.38,.71,.88],[.55,.82,.95],[.69,.90,1],[.43,.75,.94],[.76,.92,1]];
const sapphire=[[.025,.18,.43],[.04,.30,.66],[.10,.44,.80],[.22,.60,.90]];
function closest(colors,r,g,b){let best=0,distance=Infinity;colors.forEach((c,i)=>{const d=(c[0]-r)**2+(c[1]-g)**2+(c[2]-b)**2;if(d<distance){distance=d;best=i}});return best;}
function variantGeometry(source,kind,palette){
 if(palette.original||kind==='eyes')return source;
 const geometry=new T.BufferGeometry();geometry.setIndex(source.index);
 for(const [name,attribute] of Object.entries(source.attributes))geometry.setAttribute(name,name==='color'?attribute.clone():attribute);
 const colors=geometry.getAttribute('color'),positions=geometry.getAttribute('position');
 const shades=(palette[kind] instanceof Array?palette[kind]:[palette[kind]||'#ffffff']).map(c=>new T.Color(c));
 const rainbow=palette.rainbow?.map(c=>new T.Color(c));
 for(let i=0;i<colors.count;i++){
  let color;
  if(kind==='spikes'&&rainbow){
   // Each authored dorsal shard gets a spectral hue along the length of the tail.
   const index=Math.max(0,Math.min(rainbow.length-1,Math.floor((positions.getZ(i)+.15)*rainbow.length/.9)));
   color=rainbow[index].clone().multiplyScalar([.60,.78,.92,1][closest(sapphire,colors.getX(i),colors.getY(i),colors.getZ(i))]);
  }else color=shades[kind==='plates'?closest(ice,colors.getX(i),colors.getY(i),colors.getZ(i)):kind==='spikes'?closest(sapphire,colors.getX(i),colors.getY(i),colors.getZ(i)):0];
  colors.setXYZ(i,color.r,color.g,color.b);
 }
 return geometry;
}
export async function loadCrystalLizards(){
 const gltf=await new GLTFLoader().loadAsync('models/creatures/crystal-lizard-september.glb'),base=gltf.scene;
 base.animations=gltf.animations;
 const library=new T.Group();library.name='September crystal lizards';
 for(const type of lizardTypes){
  const palette=lizardPalettes[type.id],root=cloneLizard(base);root.name='lizard-'+type.id;
  root.userData={blenderAsset:SEPTEMBER_LIZARD_SOURCE,lizardType:type.id,realm:type.realm,design:'September 8',articulated:true};
  root.traverse(part=>{if(!part.isMesh)return;
   const kind=part.name,geometry=variantGeometry(part.geometry,kind,palette),material=part.material.clone();
   material.name=type.name+' '+kind;material.color.set('#ffffff');material.vertexColors=true;
   material.roughness=kind==='eyes'?.12:kind==='spikes'?.24:kind==='seams'?.65:.38;
   material.metalness=kind==='eyes'?.05:0;
   if(palette.opacity&&kind!=='eyes'){material.transparent=true;material.opacity=kind==='seams'?.10:kind==='plates'?.84:palette.opacity;material.depthWrite=false;}
   if(type.id==='ghost'&&kind==='spikes'){material.emissive.set('#53c6e6');material.emissiveIntensity=.3;}
   if(type.id==='rot'&&kind==='seams'){material.emissive.set('#8bbf35');material.emissiveIntensity=.12;}
   const mesh=part;mesh.geometry=geometry;mesh.material=material;
   // Bone/track names stay identical across variants for the shared walk clip.
   mesh.name=root.name+'_'+kind;mesh.userData.part=kind;mesh.frustumCulled=false;
   // Draw faint inner cores before the crystalline shell, not over its facets.
   if(palette.opacity)mesh.renderOrder=kind==='seams'?0:1;
   mesh.userData.blenderAsset=SEPTEMBER_LIZARD_SOURCE;
  });
  library.add(root);
 }
 return library;
}
