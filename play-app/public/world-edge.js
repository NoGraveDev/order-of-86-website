import {abyssAngle} from './abyss-layout.js';
import * as T from 'three';
import {WORLD_RADIUS} from './world-scale.js';
export function fitsWorld(x,z,footprint=0){return Number.isFinite(x)&&Number.isFinite(z)&&Math.hypot(x,z)+footprint<=WORLD_RADIUS-6;}
// Cut actual triangles, then close every exposed edge down to the waterline.
export function closeWorldEdge(terrain,parent,radius=WORLD_RADIUS){
 const p=terrain.attributes.position,original=terrain.index.array,indices=[],edges=new Map();
 for(let i=0;i<original.length;i+=3){const tri=[original[i],original[i+1],original[i+2]];if(tri.some(v=>Math.hypot(p.getX(v),p.getZ(v))>radius))continue;indices.push(...tri);for(let j=0;j<3;j++){const a=tri[j],b=tri[(j+1)%3],key=Math.min(a,b)+':'+Math.max(a,b);if(edges.has(key))edges.delete(key);else edges.set(key,[a,b]);}}
 terrain.setIndex(indices);terrain.computeBoundingSphere();
 const vertices=[],colors=[];
 const add=(points,color)=>{for(const point of points){vertices.push(...point);colors.push(color.r,color.g,color.b)}};
 for(const [a,b]of edges.values()){
  const av=[p.getX(a),p.getY(a),p.getZ(a)],bv=[p.getX(b),p.getY(b),p.getZ(b)];
  const angle=Math.atan2((av[0]+bv[0])*.5,-(av[2]+bv[2])*.5),delta=Math.atan2(Math.sin(angle-abyssAngle),Math.cos(angle-abyssAngle));
  if(Math.abs(delta)<.43&&Math.min(av[1],bv[1])>35){
   const point=(v,j)=>{const a=Math.atan2(v[0],-v[2]),r=Math.hypot(v[0],v[2]),f=j/7;
    const inset=j===0||j===7?0:(2.5+2*Math.sin(a*87+j*1.8))*(j%2?1:2);
    const y=-28+(v[1]+28)*f+(j===0||j===7?0:Math.sin(a*41+j)*2.5);
    return[v[0]*(1-inset/r),y,v[2]*(1-inset/r)];};
   for(let j=0;j<7;j++){const aa=point(av,j),bb=point(bv,j),ac=point(av,j+1),bc=point(bv,j+1),c=new T.Color('#587482').multiplyScalar(.75+.25*Math.sin(angle*117+j*2));add([aa,bb,ac,bb,bc,ac],c);}
  }else{const ab=[av[0],-28,av[2]],bb=[bv[0],-28,bv[2]];add([av,bv,ab,bv,bb,ab],new T.Color('#65776e'));}
 }
 const wallGeometry=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3)).setAttribute('color',new T.Float32BufferAttribute(colors,3));wallGeometry.computeVertexNormals();const wall=new T.Mesh(wallGeometry,new T.MeshStandardMaterial({vertexColors:true,roughness:1,side:T.DoubleSide}));wall.name='Closed_world_boundary';parent.add(wall);
 const water=new T.Mesh(new T.CircleGeometry(radius*5,128),new T.MeshStandardMaterial({color:'#789caa',roughness:.9,metalness:0,fog:true}));water.rotation.x=-Math.PI/2;water.position.y=-27.8;water.name='Beyond_world_water';parent.add(water);
 return {wall,water,boundaryEdges:edges.size};
}
export function containWorldObject(root){
 root.updateWorldMatrix(true,true);const box=new T.Box3().setFromObject(root),center=root.getWorldPosition(new T.Vector3());
 if(box.isEmpty())return false;
 const footprint=Math.hypot(Math.max(Math.abs(box.min.x-center.x),Math.abs(box.max.x-center.x)),Math.max(Math.abs(box.min.z-center.z),Math.abs(box.max.z-center.z)));
 const limit=Math.max(0,WORLD_RADIUS-6-footprint),radius=Math.hypot(center.x,center.z);
 if(radius<=limit||radius===0)return false;
 root.position.x+=center.x*(limit/radius-1);root.position.z+=center.z*(limit/radius-1);root.updateWorldMatrix(true,true);return true;
}
