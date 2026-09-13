import * as T from 'three';
const loader=new T.TextureLoader(),textures=new Map(),materials=new Map(),dreamMaterials=[];
export function polishedTexture(kind,normal=false){
 const key=kind+(normal?'-normal':'-color');if(textures.has(key))return textures.get(key);
 const t=loader.load('textures/polished/'+key+(normal?'.png':'.jpg'));t.colorSpace=normal?T.NoColorSpace:T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;textures.set(key,t);return t;
}
export function surfaceKind(name){
 if(/moss/i.test(name))return 'moss';
 if(/owl|feather|leaves|foliage|grass|fern|flower|reed|lil[yies]|sunward-detail-[24]|violet-detail-4|deepwood-detail-[34]/i.test(name))return 'leaf';
 if(/wood|bark|cypress|bench|bridge|perch|lantern|deepwood-detail-[12]/i.test(name))return 'bark';
 if(/ice|glacial|frost|crystal|shard|tear|star/i.test(name))return 'ice';
 if(/metal|iron|gold|hammer|forge|ember-detail-2/i.test(name))return 'metal';
 if(/moss|shadow-detail-4/i.test(name))return 'moss';
 if(/rock|cliff|basalt|ember|abyss-detail|mountain/i.test(name))return 'rock';
 return 'stone';
}
export function paintedMaterial(source,name){
 const kind=surfaceKind(name),key=source.uuid+':'+kind+(/site-frost-1/.test(name)?':mirror':'')+(/ember-detail-2|site-ember-0/.test(name)?':lava':'');if(materials.has(key))return materials.get(key);
 const m=source.clone();m.name='Illustrated '+kind;m.map=polishedTexture(kind);m.normalMap=polishedTexture(kind,true);m.normalScale.setScalar(kind==='leaf'?.2:kind==='bark'?.7:.45);m.roughness=kind==='ice'?.32:kind==='metal'?.48:.88;m.metalness=kind==='metal'?.2:0;m.side=kind==='leaf'||/site-frost-1/.test(name)?T.DoubleSide:T.FrontSide;
 // Small backlight contribution keeps folded leaf silhouettes legible beneath dense crowns.
 if(kind==='leaf'){m.emissive.set('#52663b');m.emissiveIntensity=.12;}
 if(['leaf','bark','moss'].includes(kind)){m.onBeforeCompile=shader=>{shader.vertexShader='varying vec3 polishWorldPosition;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n vec4 polishWorld=vec4(transformed,1.);\n#ifdef USE_INSTANCING\n polishWorld=instanceMatrix*polishWorld;\n#endif\n polishWorldPosition=(modelMatrix*polishWorld).xyz;');shader.fragmentShader='varying vec3 polishWorldPosition;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\n float foliageDistance=distance(polishWorldPosition,cameraPosition);\n float stipple=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);\n if(stipple>smoothstep(.8,4.,foliageDistance))discard;')};m.customProgramCacheKey=()=>'near-camera-foliage-v1';}
 if(/ember-detail-2|site-ember-0/.test(name)){m.emissive.set('#ed812d');m.emissiveIntensity=.7;m.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n#ifdef USE_COLOR\n totalEmissiveRadiance*=smoothstep(.08,.25,vColor.r-vColor.g);\n#endif')};m.customProgramCacheKey=()=>'painted-lava-v1';}
 materials.set(key,m);return m;
}
export function polishLandmark(model,realm){model.traverse(o=>{if(!o.isMesh)return;const src=o.material;if(/glow|Moonlight/.test(src.name))return;
 const m=src.clone(),kind=surfaceKind(o.name+' '+src.name);m.normalMap=polishedTexture(kind,true);m.normalScale.setScalar(.42);m.roughness=kind==='ice'?.3:kind==='metal'?.4:.88;m.metalness=kind==='metal'?.28:0;
 if(!m.map)m.map=polishedTexture(kind);if(realm==='shadow'){m.emissive.set('#a8cedd');m.emissiveIntensity=.08;dreamMaterials.push(m)}if(realm==='sunward'){m.emissive.set('#fff0b0');m.emissiveIntensity=.28;}o.material=m;});return model;}

export function updateDreamStone(time){for(const m of dreamMaterials)m.emissiveIntensity=.08+.045*(1+Math.sin(time*.6));}
