import {polishedTexture} from './polished-materials.js';
import * as T from 'three';
const cache=new Map(),loader=new T.TextureLoader();
const repeats={ground:[130,130],bark:[2,3],leaf:[3,3],grass:[1,1],stone:[2,2],rock:[2,2],metal:[2,2],ice:[2,2]};
function texture(kind,channel='detail'){
 const key=kind+':'+channel;if(cache.has(key))return cache.get(key);
 const t=loader.load(kind==='ground'?'models/storybook/paper.png':'textures/'+kind+'-'+channel+'.png');
 t.colorSpace=channel==='detail'?T.SRGBColorSpace:T.NoColorSpace;
 t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(...(repeats[kind]||[2,2]));
 t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.anisotropy=4;
 cache.set(key,t);return t;
}
export function surfaceTexture(kind){if(kind==='ground'){const t=polishedTexture('ground');t.repeat.set(260,260);return t}return texture(kind)}
export function textured(material,kind){
 const m=new T.MeshStandardMaterial({color:material.color,roughness:.92,side:material.side,map:texture(kind)});
 if(kind==='grass'){m.alphaTest=.45;m.side=T.DoubleSide;m.emissive.copy(material.color);m.emissiveIntensity=.16;}
 else if(kind!=='ground'){m.normalMap=texture(kind,'normal');m.normalScale.set(.4,.4);m.roughnessMap=texture(kind,'roughness');}
 return m;
}
