import * as T from 'three';
import {mountainDistance,firstHowlMountain} from './frost-layout.js';
// Use the actual terrain triangles: a fog-independent silhouette, not a second mountain.
export function addMountainLandmark(terrain,world){
 const position=terrain.getAttribute('position'),index=terrain.getIndex(),indices=[];
 for(let i=0;i<index.count;i+=3){const ids=[index.getX(i),index.getX(i+1),index.getX(i+2)];if(ids.some(j=>mountainDistance(position.getX(j),position.getZ(j))<firstHowlMountain.radius))indices.push(...ids);}
 const geometry=terrain.clone();geometry.setIndex(indices);geometry.computeBoundingSphere();
 const colors=geometry.getAttribute('color'),snow=new T.Color('#e1edf2'),rock=new T.Color('#718595');
 for(let i=0;i<position.count;i++){const elevation=position.getY(i),t=Math.max(0,Math.min(1,(elevation-firstHowlMountain.rise*.25)/(firstHowlMountain.rise*.5)));const c=rock.clone().lerp(snow,t);colors.setXYZ(i,c.r,c.g,c.b);}

 const material=new T.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1,fog:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 const mountain=new T.Mesh(geometry,material);mountain.name='Unnamed_Mountain_Horizon';world.add(mountain);return mountain;
}
