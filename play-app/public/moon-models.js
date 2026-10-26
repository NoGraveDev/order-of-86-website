import * as T from 'three';
import {moons} from './world-data.js';
// Shared silhouettes: the loading screen and the sky always use the same seven moons.
export function createMoon(i){
 const [name,c]=moons[i],g=new T.Group();g.name=name;
 function mesh(geometry,color,x=0,y=0,z=0,sx=1,sy=sx,sz=sx,parent=g){const m=new T.Mesh(geometry,new T.MeshStandardMaterial({color,roughness:.8,side:T.DoubleSide}));m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;}
 function orb(c,x,y,z,sx,sy=sx,sz=sx,p=g){return mesh(new T.SphereGeometry(1,24,16),c,x,y,z,sx,sy,sz,p)}
 function torus(c,x,y,z,r,t,p=g){return mesh(new T.TorusGeometry(r,t,7,48),c,x,y,z,1,1,1,p)}
 if(i===0){orb(c,0,0,0,10,8,9,g);orb(c,6,4,0,5,4,5,g);orb('#bb755b',-3,5,6,2,1,2,g)}if(i===1){orb(c,0,0,0,9,3.5,7,g);const ring=torus(c,0,0,0,13,.3,g);ring.rotation.x=1.2;ring.rotation.y=.25}if(i===2){let m=orb(c,0,0,0,5,10,5,g);m.rotation.z=.65}if(i===3){for(let j=0;j<7;j++)orb(c,Math.sin(j*2.4)*5,Math.cos(j*2.4)*5,Math.sin(j)*3,5,4,4,g)}if(i===4)mesh(new T.IcosahedronGeometry(8,1),c,0,0,0,1,1,1,g);if(i===5){const shape=new T.Shape();shape.absarc(0,0,9,.5,5.78,false);shape.absarc(4,0,7,5.55,.74,true);mesh(new T.ShapeGeometry(shape),c,0,0,0,1,1,1,g)}if(i===6){orb(c,0,0,0,4,3.7,3.5,g);for(let j=0;j<5;j++)orb('#a5b7bd',Math.sin(j*3)*2,Math.cos(j*3)*2,3,.55,.55,.2,g)}
 return g;
}
