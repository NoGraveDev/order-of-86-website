// Rail only the exposed boundary of the deck union, never across a junction.
export function buildBoardwalkBoundary(layout){
 const polygons=[],cells=new Map();
 function add(points,owner){const p={points,owner};polygons.push(p);for(let x=Math.floor(Math.min(...points.map(p=>p.x))/12);x<=Math.floor(Math.max(...points.map(p=>p.x))/12);x++)for(let z=Math.floor(Math.min(...points.map(p=>p.z))/12);z<=Math.floor(Math.max(...points.map(p=>p.z))/12);z++){const key=x+','+z;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(p);}return p;}
 const sides=[];
 for(const e of layout.edges){const nx=e.dz/e.length*2.75,nz=-e.dx/e.length*2.75,p=[{x:e.a.x+nx,z:e.a.z+nz,y:e.a.y},{x:e.b.x+nx,z:e.b.z+nz,y:e.b.y},{x:e.b.x-nx,z:e.b.z-nz,y:e.b.y},{x:e.a.x-nx,z:e.a.z-nz,y:e.a.y}],poly=add(p,e);sides.push({a:p[0],b:p[1],poly},{a:p[2],b:p[3],poly});}
 for(const n of layout.junctions){const p=Array.from({length:16},(_,i)=>({x:n.x+3*Math.sin(i*Math.PI/8),z:n.z+3*Math.cos(i*Math.PI/8),y:n.y})),poly=add(p,n);for(let i=0;i<16;i++)sides.push({a:p[i],b:p[(i+1)%16],poly});}
 const cross=(a,b,c)=>(b.x-a.x)*(c.z-a.z)-(b.z-a.z)*(c.x-a.x);
 function interval(a,b,p){let lo=0,hi=1;const sign=Math.sign(cross(p[0],p[1],p[2]));for(let i=0;i<p.length;i++){const c=p[i],d=p[(i+1)%p.length],u=sign*cross(c,d,a),v=sign*cross(c,d,b),delta=v-u;if(Math.abs(delta)<1e-10){if(u<1e-7)return null;continue;}const t=(1e-7-u)/delta;if(delta>0)lo=Math.max(lo,t);else hi=Math.min(hi,t);if(lo>=hi)return null;}return[lo,hi];}
 const result=[];
 for(const {a,b,poly}of sides){const nearby=new Set();for(let x=Math.floor(Math.min(a.x,b.x)/12);x<=Math.floor(Math.max(a.x,b.x)/12);x++)for(let z=Math.floor(Math.min(a.z,b.z)/12);z<=Math.floor(Math.max(a.z,b.z)/12);z++)for(const p of cells.get(x+','+z)||[])nearby.add(p);let parts=[[0,1]];for(const p of nearby){if(p===poly)continue;const cut=interval(a,b,p.points);if(!cut)continue;parts=parts.flatMap(([lo,hi])=>cut[1]<=lo||cut[0]>=hi?[[lo,hi]]:[[lo,Math.min(hi,cut[0])],[Math.max(lo,cut[1]),hi]].filter(([l,h])=>h-l>1e-6));if(!parts.length)break;}
 const at=t=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t});for(const [lo,hi]of parts)if(Math.hypot(b.x-a.x,b.z-a.z)*(hi-lo)>.025)result.push({a:at(lo),b:at(hi)});
 }
 return result;
}
