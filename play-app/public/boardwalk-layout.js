import {abyssCaves} from './abyss-layout.js';
import {boatChannelDistance,boatCourse} from './boat-course-layout.js';
import {height} from './geography.js';
import {boardSegments,waterSample,segmentSample} from './abyss-hydrology-layout.js';
// Split crossings first, then share nodes. Every branch uses the same deck height.
export function buildBoardwalkLayout(){
 const nodes=[],edges=[],lookup=new Map(),junctions=[];
 const cross=(x,z,a,b)=>x*b-z*a;
 function node(x,z){const key=x.toFixed(4)+','+z.toFixed(4);if(lookup.has(key))return lookup.get(key);const w=waterSample(x,z),n={x,z,y:Math.max(height(x,z)+.22,w.distance<0?w.y+.85:-Infinity),links:[]};lookup.set(key,n);nodes.push(n);return n;}
 for(const s of boardSegments){const cuts=[0,1];for(const q of boardSegments){const den=cross(s.dx,s.dz,q.dx,q.dz);if(Math.abs(den)<1e-7)continue;const dx=q.a.x-s.a.x,dz=q.a.z-s.a.z,t=cross(dx,dz,q.dx,q.dz)/den,u=cross(dx,dz,s.dx,s.dz)/den;if(t>1e-6&&t<1-1e-6&&u>=-1e-6&&u<=1+1e-6)cuts.push(t);}cuts.sort((a,b)=>a-b);
  for(let k=1;k<cuts.length;k++){const start=cuts[k-1],end=cuts[k];if(end-start<1e-6)continue;const count=Math.ceil((end-start)*s.length/1.1);let a=node(s.a.x+s.dx*start,s.a.z+s.dz*start);for(let i=1;i<=count;i++){const t=start+(end-start)*i/count,b=node(s.a.x+s.dx*t,s.a.z+s.dz*t),length=Math.hypot(b.x-a.x,b.z-a.z),e={a,b,dx:b.x-a.x,dz:b.z-a.z,length,width:2.75};
   // Keep the whole board above the terrain, including the uphill lateral edge.
   for(const n of [a,b])for(const side of [-2.75,2.75])n.y=Math.max(n.y,height(n.x+e.dz/length*side,n.z-e.dx/length*side)+.22);
   edges.push(e);a.links.push(e);b.links.push(e);a=b;
  }}
 }
 for(const n of nodes){if(n.links.length!==2||Math.abs(cross(n.links[0].dx,n.links[0].dz,n.links[1].dx,n.links[1].dz))>.02)junctions.push(n);}
 for(const e of edges)e.grade=junctions.some(n=>Math.hypot(n.x-(e.a.x+e.b.x)/2,n.z-(e.a.z+e.b.z)/2)<4)?.0:.5;
 // Raise navigable arches where the full-lake course passes underneath.
 for(const n of nodes)if(boatChannelDistance(n.x,n.z)<9&&waterSample(n.x,n.z).distance<5)n.y=Math.max(n.y,waterSample(n.x,n.z).y+7.5);
 // Flatten junction approaches, then propagate a grade-limited envelope.
 const queue=[...nodes].sort((a,b)=>b.y-a.y);for(let i=0;i<queue.length;i++){const n=queue[i];for(const e of n.links){const other=e.a===n?e.b:e.a,target=n.y-e.length*e.grade;if(other.y<target-1e-6){other.y=target;queue.push(other);}}}
 // Every terminal gets a visible ramp down to its adjoining dry path.
 for(const n of [...nodes].filter(n=>n.links.length===1)){const original=n.links[0],other=original.a===n?original.b:original.a,dx=(n.x-other.x)/original.length,dz=(n.z-other.z)/original.length;let length=15,end;
  for(;length<=(abyssCaves.some(c=>Math.hypot(n.x-c.x,n.z-(c.z+40))<1)?15:45);length+=5){const x=n.x+dx*length,z=n.z+dz*length,w=waterSample(x,z),y=height(x,z)+.22;if(w.distance>4&&Math.abs(y-n.y)/(length-4)<.5){end={x,z,y,links:[]};break;}}
  if(!end)continue;const count=Math.ceil(length/1.1);let a=n;for(let i=1;i<=count;i++){const t=i/count,b={x:n.x+dx*length*t,z:n.z+dz*length*t,y:Math.max(n.y+(end.y-n.y)*Math.max(0,(length*t-4)/(length-4)),height(n.x+dx*length*t,n.z+dz*length*t)+.22),links:[]},e={a,b,dx:b.x-a.x,dz:b.z-a.z,length:length/count,width:2.75,grade:.5};edges.push(e);nodes.push(b);a.links.push(e);b.links.push(e);a=b;}
 }
 return{nodes,edges,junctions};
}
