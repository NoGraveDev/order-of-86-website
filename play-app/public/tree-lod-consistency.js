import * as T from 'three';
// LOD changes geometry, never species, bark color, painted textures, or shader treatment.
export function harmonizeTreeLODs(library){
 const report=[];
 library.traverse(root=>{
  if(!root.name.endsWith('-distant'))return;
  const near=library.getObjectByName(root.name.slice(0,-8));if(!near)return;
  root.traverse(farPart=>{
   if(!farPart.isMesh)return;
   const nearPart=near.getObjectByName(farPart.name.replace('-distant',''));if(!nearPart?.isMesh)return;
   farPart.material=nearPart.material;
   const source=nearPart.geometry.getAttribute('color'),target=farPart.geometry.getAttribute('color');
   if(source&&target){const values=new Float32Array(target.count*source.itemSize);
    for(let i=0;i<target.count;i++){const j=Math.floor(i*source.count/target.count);values[i*source.itemSize]=source.getX(j);values[i*source.itemSize+1]=source.getY(j);values[i*source.itemSize+2]=source.getZ(j);if(source.itemSize===4)values[i*4+3]=source.getW(j);}
    // Unequal vertex counts can alias a repeating per-leaf palette. Match its mean exactly.
    for(let k=0;k<3;k++){
     let sourceMean=0,targetMean=0,min=Infinity,max=-Infinity;
     for(let i=0;i<source.count;i++)sourceMean+=source.getComponent(i,k)/source.count;
     for(let i=0;i<target.count;i++){const v=values[i*source.itemSize+k];targetMean+=v/target.count;min=Math.min(min,v);max=Math.max(max,v);}
     const spread=Math.min(1,targetMean>min?sourceMean/(targetMean-min):1,max>targetMean?(1-sourceMean)/(max-targetMean):1);
     for(let i=0;i<target.count;i++)values[i*source.itemSize+k]=sourceMean+(values[i*source.itemSize+k]-targetMean)*spread;
    }
    farPart.geometry=farPart.geometry.clone();farPart.geometry.setAttribute('color',new T.BufferAttribute(values,source.itemSize));
   }
   report.push({near:nearPart.name,far:farPart.name});
  });
 });
 return report;
}
