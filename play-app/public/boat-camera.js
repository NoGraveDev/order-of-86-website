import {height} from './geography.js';
import {waterSurfaceAt} from './watershed-surface.js';
// River surfaces can be far above terrain, especially behind a downhill racer.
// Validate the whole sightline, including the interpolated camera, not just its destination.
export function riverCameraFloor(x,z){return Math.max(height(x,z),(waterSurfaceAt(x,z)?.y??-Infinity)+.08);}
export function boatCameraPose(player,yaw,previous,dt,deckAt=()=>null){
 const floor=riverCameraFloor,dx=Math.sin(yaw),dz=Math.cos(yaw);
 const ceiling=(x,z)=>{const deck=deckAt(x,z);return deck&&deck.y>floor(x,z)+4?deck.y-.5:Infinity;};
 const target={x:player.x-dx*2,z:player.z-dz*2,y:player.y+1.2};target.y=Math.max(target.y,floor(target.x,target.z)+.85);target.y=Math.min(target.y,ceiling(target.x,target.z)-.15);
 function safe(p){if(p.y<floor(p.x,p.z)+.85||p.y>ceiling(p.x,p.z))return false;const n=Math.max(12,Math.ceil(Math.hypot(p.x-target.x,p.z-target.z)*3));for(let i=1;i<=n;i++){const t=i/n,x=target.x+(p.x-target.x)*t,z=target.z+(p.z-target.z)*t,y=target.y+(p.y-target.y)*t;if(y<floor(x,z)+.25||y>ceiling(x,z))return false;}return true;}
 let chosen;
 for(const distance of [11,8,5,3,1.5,0]){const p={x:player.x+dx*distance,z:player.z+dz*distance,y:player.y+2.6+distance*.1};p.y=Math.max(p.y,floor(p.x,p.z)+1.1);
  for(let i=1;i<=32;i++){const t=i/32,x=target.x+(p.x-target.x)*t,z=target.z+(p.z-target.z)*t;p.y=Math.max(p.y,target.y+(floor(x,z)+.4-target.y)/t);}
  if(safe(p)){chosen=p;break;}
 }
 // Last-resort close chase view, staying above the actual water and under the deck.
 chosen??={x:player.x,z:player.z,y:Math.min(ceiling(player.x,player.z)-.1,Math.max(player.y+1.6,floor(player.x,player.z)+1.1))};
 const blend=1-Math.exp(-Math.max(0,dt)*8),smooth={x:previous.x+(chosen.x-previous.x)*blend,y:previous.y+(chosen.y-previous.y)*blend,z:previous.z+(chosen.z-previous.z)*blend};
 // Crossing a rapid/underpass cannot interpolate through an opaque surface.
 return {position:safe(smooth)?smooth:chosen,target};
}
