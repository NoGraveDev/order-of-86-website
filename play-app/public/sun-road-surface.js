import {subtractPolygon} from './boardwalk-surface.js';
// Earlier road corridors own their overlap once. Trim incoming bricks to that union.
export function buildSunRoadSurface(segments,ground){const faces=[],owners=[];let bricks=0;
 const bounds=p=>({minX:Math.min(...p.map(v=>v.x)),maxX:Math.max(...p.map(v=>v.x)),minZ:Math.min(...p.map(v=>v.z)),maxZ:Math.max(...p.map(v=>v.z))});
 const overlap=(a,b)=>a.minX<=b.maxX&&a.maxX>=b.minX&&a.minZ<=b.maxZ&&a.maxZ>=b.minZ;
 for(const s of segments){const point=(t,side)=>({x:s.a.x+s.dx*t+s.dz/s.length*side,z:s.a.z+s.dz*t-s.dx/s.length*side,y:0}),corridor=[point(0,-4.5),point(1,-4.5),point(1,4.5),point(0,4.5)],bound=bounds(corridor),near=owners.filter(o=>overlap(bound,o.bound));
  const n=Math.ceil(s.length/1.65);for(let i=0;i<n;i++)for(let lane=0;lane<6;lane++){const lo=-4.5+lane*1.5+.035,hi=lo+1.43;let pieces=[[point(i/n,lo),point((i+.96)/n,lo),point((i+.96)/n,hi),point(i/n,hi)]];for(const owner of near)pieces=pieces.flatMap(p=>overlap(bounds(p),owner.bound)?subtractPolygon(p,owner.poly):[p]);for(const points of pieces)faces.push({material:(i+lane)%3,points:points.map(p=>({...p,y:ground(p.x,p.z)+.09}))});bricks++;}
  owners.push({poly:corridor,bound});
 }return {faces,bricks};}
