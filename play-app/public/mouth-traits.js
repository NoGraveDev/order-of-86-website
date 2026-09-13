import {GLTFLoader} from './GLTFLoader.js';
const models=new Map(),loader=new GLTFLoader();
export function attachMouthTrait(root,kind,reach=0){
 if(!['steak','chicken-leg'].includes(kind))return;
 if(!models.has(kind))models.set(kind,loader.loadAsync(new URL('./models/mouth-traits/'+kind+'.glb',import.meta.url).href).then(g=>g.scene));
 root.userData.mouthTrait=kind;
 root.userData.mouthReady=models.get(kind).then(template=>{
  const prop=template.clone(true);prop.name='Blender_Mouth_'+kind;prop.position.set(.10,1.75,.80+reach);prop.rotation.z=-.10;
  prop.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  root.add(prop);root.userData.mouthLoaded=true;return prop;
 }).catch(error=>{root.userData.mouthLoadError=String(error);console.warn('Mouth trait model failed to load:',kind,error);});
}
