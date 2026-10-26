import {realms} from './world-data.js';
import {WORLD_SCALE as S} from './world-scale.js';
const realm=realms.find(r=>r.id==='shadow');
export const wetlandBasins=[];
for(let radius=145*S;radius<450*S;radius+=47)for(let offset=-.32;offset<.34;offset+=.13){
 const a=realm.angle+offset,x=Math.sin(a)*radius,z=-Math.cos(a)*radius;
 const trail=Math.min(...realms.slice(1).map(r=>Math.abs(x*Math.cos(r.routeAngle)+z*Math.sin(r.routeAngle))),Math.abs(radius-220*S),Math.abs(radius-390*S));
 if(trail<29||Math.hypot(x-realm.x,z-realm.z)<38)continue;
 wetlandBasins.push({x,z,rx:16+(wetlandBasins.length%3)*3,rz:13+(wetlandBasins.length%4)*2});
}
// Two visible sanctuary-side pools frame the arrival without crossing the radial trail.
for(const side of [-1,1]){const basin={x:realm.x+Math.cos(realm.angle)*45*side,z:realm.z+Math.sin(realm.angle)*45*side,rx:14,rz:11};for(let i=wetlandBasins.length-1;i>=0;i--){const other=wetlandBasins[i];if(Math.hypot(other.x-basin.x,other.z-basin.z)<Math.max(other.rx,other.rz)+18)wetlandBasins.splice(i,1)}wetlandBasins.push(basin);}
