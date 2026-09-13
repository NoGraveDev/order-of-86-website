import {abyssPoint} from './abyss-layout.js';
import {blueRivers} from './abyss-hydrology-layout.js';
export const BOAT_COURSE_VERSION='river-run-v3';
const river=id=>blueRivers.find(r=>r.id===id).points;
// One continuous expedition: source cascades, Splitwater, lagoon, eastern
// upstream return, highland river, High Tide shoreline, then the sea outlet.
const points=[...river('mountain-cascade'),...river('lower-river').slice(1,-1),abyssPoint(15,330),abyssPoint(16,308),abyssPoint(40,300),abyssPoint(60,318),...river('eastern-river').toReversed().slice(1),...river('eastern-cascade').toReversed().slice(1),...river('highland-river').slice(0,-1),abyssPoint(-10,785),abyssPoint(9,804),abyssPoint(5,827),abyssPoint(-25,843),abyssPoint(-55,840),...river('western-lake-outlet').slice(1,-1)];
const end=river('western-lake-outlet').at(-1),previous=points.at(-1);points.push({x:previous.x+(end.x-previous.x)*.65,z:previous.z+(end.z-previous.z)*.65});
const path=[points[0]];
// Rounded bends stay within the existing river bed, without cutting banks.
for(let i=1;i<points.length-1;i++){const a=points[i-1],b=points[i],c=points[i+1],la=Math.hypot(a.x-b.x,a.z-b.z),lc=Math.hypot(c.x-b.x,c.z-b.z),cut=Math.min(4,la/4,lc/4),p={x:b.x+(a.x-b.x)*cut/la,z:b.z+(a.z-b.z)*cut/la},q={x:b.x+(c.x-b.x)*cut/lc,z:b.z+(c.z-b.z)*cut/lc};path.push(p);for(let j=1;j<=8;j++){const t=j/8;path.push({x:(1-t)**2*p.x+2*(1-t)*t*b.x+t*t*q.x,z:(1-t)**2*p.z+2*(1-t)*t*b.z+t*t*q.z});}}path.push(points.at(-1));
export const boatRouteSegments=[];let length=0;
for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);if(d<1e-6)continue;boatRouteSegments.push({a,b,dx,dz,length:d,start:length});length+=d;}
export const boatLapMetres=length;
export const boatCourse={y:106,length,version:BOAT_COURSE_VERSION};
export function routePose(metres){const m=Math.max(0,Math.min(length,metres)),s=boatRouteSegments.find(s=>s.start+s.length>=m)||boatRouteSegments.at(-1),t=(m-s.start)/s.length;return{x:s.a.x+s.dx*t,z:s.a.z+s.dz*t,y:106,yaw:Math.atan2(s.dx,s.dz)};}
// Retain the normalized parameter for route sampling tools; this is not a loop.
export const coursePose=angle=>routePose(angle/(Math.PI*2)*length);
export function boatChannelDistance(x,z){let distance=Infinity;for(const s of boatRouteSegments){const t=Math.max(0,Math.min(1,((x-s.a.x)*s.dx+(z-s.a.z)*s.dz)/(s.length*s.length)));distance=Math.min(distance,Math.hypot(x-s.a.x-s.dx*t,z-s.a.z-s.dz*t));}return distance;}
export const boatSpeedZones=Array.from({length:Math.floor(length/55)-1},(_,i)=>{const p=routePose(45+i*55),side=i%2?1:-1;return{...p,id:i,side,halfLength:5,halfWidth:1.45};});
