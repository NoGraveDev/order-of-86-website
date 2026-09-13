// Partition the union into non-overlapping convex faces. Junctions own their
// centre once; adjacent planks are trimmed to it instead of z-fighting over it.
const cross=(a,b,p)=>(b.x-a.x)*(p.z-a.z)-(b.z-a.z)*(p.x-a.x);
export const polygonArea=poly=>Math.abs(poly.reduce((sum,p,i)=>{const q=poly[(i+1)%poly.length];return sum+p.x*q.z-q.x*p.z;},0))/2;
function clip(poly,a,b,inside){const out=[];for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],u=cross(a,b,p),v=cross(a,b,q),keep=inside?u>=-1e-9:u<=1e-9,next=inside?v>=-1e-9:v<=1e-9;if(keep)out.push(p);if(keep!==next){const t=u/(u-v);out.push({x:p.x+(q.x-p.x)*t,y:p.y+(q.y-p.y)*t,z:p.z+(q.z-p.z)*t});}}return out;}
export function subtractPolygon(poly,cut){const pieces=[];let remaining=poly;const area=cut.reduce((sum,p,i)=>{const q=cut[(i+1)%cut.length];return sum+p.x*q.z-q.x*p.z;},0);if(area<0)cut=[...cut].reverse();for(let i=0;i<cut.length&&remaining.length>=3;i++){const a=cut[i],b=cut[(i+1)%cut.length],outside=clip(remaining,a,b,false);if(outside.length>=3&&polygonArea(outside)>1e-8)pieces.push(outside);remaining=clip(remaining,a,b,true);}return pieces;}
export function buildBoardwalkSurface(layout){const owners=[],cells=new Map(),faces=[];
 const keys=poly=>{const out=[];for(let x=Math.floor(Math.min(...poly.map(p=>p.x))/12);x<=Math.floor(Math.max(...poly.map(p=>p.x))/12);x++)for(let z=Math.floor(Math.min(...poly.map(p=>p.z))/12);z<=Math.floor(Math.max(...poly.map(p=>p.z))/12);z++)out.push(x+','+z);return out;};
 function add(poly,material,landing=false){const nearby=new Set();for(const k of keys(poly))for(const owner of cells.get(k)||[])nearby.add(owner);let parts=[poly];for(const owner of nearby){parts=parts.flatMap(p=>subtractPolygon(p,owner));if(!parts.length)break;}for(const points of parts)faces.push({points,material,landing});owners.push(poly);for(const k of keys(poly)){if(!cells.has(k))cells.set(k,[]);cells.get(k).push(poly);}}
 for(const n of layout.junctions)add(Array.from({length:16},(_,i)=>({x:n.x+3*Math.sin(i*Math.PI/8),z:n.z+3*Math.cos(i*Math.PI/8),y:n.y})),1,true);
 layout.edges.forEach((e,i)=>{const nx=e.dz/e.length*e.width,nz=-e.dx/e.length*e.width;add([{x:e.a.x+nx,z:e.a.z+nz,y:e.a.y},{x:e.b.x+nx,z:e.b.z+nz,y:e.b.y},{x:e.b.x-nx,z:e.b.z-nz,y:e.b.y},{x:e.a.x-nx,z:e.a.z-nz,y:e.a.y}],i%3);});
 return {faces};
}
