import * as T from 'three';
export function bakeInstanceGeometry(part){
 const geometry=part.geometry.clone();
 // glTF quantization is decoded by node scale in the renderer. Instancing bakes
 // that transform into vertices, so integer attributes must first become floats.
 for(const name of ['position','normal']){const a=geometry.getAttribute(name);if(a&&!(a.array instanceof Float32Array)){const values=new Float32Array(a.count*a.itemSize);for(let i=0;i<a.count;i++){values[i*a.itemSize]=a.getX(i);values[i*a.itemSize+1]=a.getY(i);values[i*a.itemSize+2]=a.getZ(i)}geometry.setAttribute(name,new T.BufferAttribute(values,a.itemSize));}}
 return geometry.applyMatrix4(part.matrixWorld);
}
