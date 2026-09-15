import {harmonizeTreeLODs} from './tree-lod-consistency.js';
import {bakeInstanceGeometry} from './instanced-geometry.js';
import {paintedMaterial} from './polished-materials.js';
import {treeVariant} from './realm-dressing.js';
import * as T from 'three';
import {GLTFLoader} from './GLTFLoader.js';
import {loadCrystalLizards,cloneLizard} from './crystal-lizards.js';
let library;const footprints=new Map(), geometryCache=new Map(),forestBatches=[];
export function assetFootprint(name){if(!footprints.has(name)){const box=new T.Box3().setFromObject(library.getObjectByName(name)),distant=library.getObjectByName(name+'-distant');if(distant)box.union(new T.Box3().setFromObject(distant));footprints.set(name,Math.hypot(Math.max(Math.abs(box.min.x),Math.abs(box.max.x)),Math.max(Math.abs(box.min.z),Math.abs(box.max.z))))}return footprints.get(name)}

export async function loadStorybook(onProgress){
 library=(await new GLTFLoader().loadAsync('models/runtime/environment-kit.glb?v=magenta-20260915',onProgress)).scene;
 const coastal=(await new GLTFLoader().loadAsync('models/abyss/coastal-trees.glb')).scene;library.add(coastal);
 library.updateMatrixWorld(true);
 library.traverse(o=>{if(o.isMesh){o.material=paintedMaterial(o.material,o.name);
 if(/^silver-tree.*_leaves$/.test(o.name)){
  // Retain painted grain and individual-leaf colors without the green texture muddying violet crowns.
  o.material=o.material.clone();o.material.emissive.set('#7842aa');o.material.emissiveIntensity=.22;
  o.material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
   float violetValue=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(1.22,.74,1.7)*violetValue,.85);`);};
  o.material.customProgramCacheKey=()=> 'violet-canopy-v1';
 }
}});
 // Golden crowns retain the established four oak silhouettes and matching LODs.
 for(let i=1;i<=4;i++)for(const suffix of ['', '-distant']){const name='oak'+(i===1?'':'-'+i)+suffix,source=library.getObjectByName(name);if(!source)continue;const g=source.clone(true);g.traverse(o=>{o.name=o.name.replace(/^oak/,'gold-tree');if(o.isMesh&&/leaves/.test(o.name)){o.geometry=o.geometry.clone();const colors=o.geometry.getAttribute('color');if(colors)for(let j=0;j<colors.count;j++){const light=.6+.4*colors.getY(j);colors.setXYZ(j,light,light*.72,light*.045);}o.material=new T.MeshStandardMaterial({color:'#ffe356',vertexColors:!!colors,roughness:.9,emissive:'#b48713',emissiveIntensity:.12});}});library.add(g);}
 // Replace legacy creatures after environment polishing so stone textures cannot
 // overwrite the authored crystal facets, glossy eyes, or species palettes.
 const lizards=await loadCrystalLizards();
 for(const replacement of lizards.children){const old=library.getObjectByName(replacement.name);old?.removeFromParent();}
 library.add(lizards);
 library.userData.lodColorPairs=harmonizeTreeLODs(library);
 return library;
}
export function storyAsset(name){
 const source=library?.getObjectByName(name);if(!source)throw Error('Missing Blender environment asset: '+name);
 const root=source.userData.articulated?cloneLizard(source):source.clone(true);root.name=name;root.userData.blenderAsset=source.userData.blenderAsset||'models/storybook/environment-library.blend';return root;
}
export function placeStoryAsset(name,x,y,z,parent,scale=1,rotation=0){
 name=treeVariant(name,x+parent.position.x,z+parent.position.z);const root=storyAsset(name);root.position.set(x,y,z);root.scale.setScalar(scale);root.rotation.y=rotation;parent.add(root);return root;
}
function partGeometry(part){if(!geometryCache.has(part.uuid))geometryCache.set(part.uuid,bakeInstanceGeometry(part));return geometryCache.get(part.uuid)}
function instanceParts(name,placements,parent){const source=library.getObjectByName(name),batches=[],dummy=new T.Object3D();
 source.traverse(part=>{if(!part.isMesh)return;const batch=new T.InstancedMesh(partGeometry(part),part.material,placements.length);
 placements.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,p.rotation||0,0);if(Array.isArray(p.scale))dummy.scale.set(...p.scale);else dummy.scale.setScalar(p.scale||1);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix)});
 batch.name='Storybook_'+name+'_'+part.name;batch.userData.blenderAsset='models/storybook/environment-library.blend';batch.computeBoundingSphere();parent.add(batch);batches.push(batch)});return batches;
}
export function batchStoryAssets(name,placements,parent,partition=true){
 if(!placements.length)return[];
 if(partition&&library.getObjectByName(name+'-distant')){
  const near=instanceParts(name,placements,parent),far=instanceParts(name+'-distant',placements,parent),matrices=near[0].instanceMatrix.array.slice();
  for(const b of [...near,...far])b.instanceMatrix.setUsage(T.DynamicDrawUsage);
  forestBatches.push({placements,near,far,matrices});return [...near,...far];
 }
 if(partition&&placements.length>64){const cells=new Map();for(const p of placements){const key=Math.floor(p.x/160)+','+Math.floor(p.z/160);if(!cells.has(key))cells.set(key,[]);cells.get(key).push(p)}return [...cells.values()].flatMap(entries=>batchStoryAssets(name,entries,parent,false));}
 return instanceParts(name,placements,parent);
}
export function updateStoryBatches(position,mobile=false){
 const nearDistance=mobile?38:60,farDistance=mobile?420:580;
 for(const {placements,near,far,matrices} of forestBatches){let n=0,f=0;
 placements.forEach((p,i)=>{const d=Math.hypot(p.x-position.x,p.z-position.z);if(d>farDistance)return;const list=d<nearDistance?near:far,index=d<nearDistance?n++:f++;
 for(const mesh of list)mesh.instanceMatrix.array.set(matrices.subarray(i*16,i*16+16),index*16)});
 for(const [list,count]of [[near,n],[far,f]])for(const mesh of list){mesh.count=count;mesh.visible=count>0;mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();}
 }
}

export function tintStoryAsset(root,color){if(!color)return root;root.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.color.set(color).lerp(new T.Color('#ffffff'),.45)}});return root}
