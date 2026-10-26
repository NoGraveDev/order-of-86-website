import {boatCourse,coursePose,boatChannelDistance,boatLapMetres,routePose,boatSpeedZones} from './boat-course-layout.js';
export {boatCourse,coursePose};
import {abyssPoint} from './abyss-layout.js';
import {waterSurfaceAt} from './watershed-surface.js';
import {waterSample,blueSegments,segmentSample,boardwalkDistance} from './abyss-hydrology-layout.js';
export const BOAT_BEST_KEY='pawtheon-tide-run-best-river-v3',BOAT_LAPS=1;
export const boatGates=Array.from({length:Math.ceil(boatLapMetres/8)+1},(_,i,a)=>{const p=routePose(i*boatLapMetres/Math.ceil(boatLapMetres/8));return {...p,y:waterSurfaceAt(p.x,p.z)?.y??p.y};});
export function boatSafe(x,z){for(const [dx,dz]of [[0,0],[1.15,0],[-1.15,0],[0,1.15],[0,-1.15]]){const w=waterSurfaceAt(x+dx,z+dz);if(!w||w.depth<.55||(boardwalkDistance(x+dx,z+dz)<3.6&&boatChannelDistance(x+dx,z+dz)>6))return false;}return true;}
// Current and line choice are replayed identically by the authoritative server.
export function boatSpeedEffect(r){
 let delta=0,label='Open water';const w=waterSample(r.x,r.z);
 if(!w.lake){let nearest=null,best=Infinity;for(const s of blueSegments){const d=segmentSample(s,r.x,r.z).distance;if(d<best){best=d;nearest=s;}}if(nearest){const alignment=(Math.sin(r.yaw)*nearest.dx+Math.cos(r.yaw)*nearest.dz)/nearest.length;delta=alignment*2.6;label=alignment>.35?'Downstream current + speed':alignment<-.35?'Upstream current − speed':'Cross-current';}}
 for(const z of boatSpeedZones){const dx=r.x-z.x,dz=r.z-z.z,along=dx*Math.sin(z.yaw)+dz*Math.cos(z.yaw),across=dx*Math.cos(z.yaw)-dz*Math.sin(z.yaw);if(Math.abs(along)>z.halfLength)continue;
 if(Math.abs(across-z.side*2.2)<z.halfWidth){delta+=5;label='Cyan stream · speed boost';break;}
 if(Math.abs(across+z.side*2.2)<z.halfWidth){delta-=6;label='Amber eddy · losing speed';break;}}
 return {delta,label};
}
export const BOAT_STEP=1/60;
export function newBoatRace(slot=0){const p=coursePose(0),lane=slot%2?1.25:-1.25,back=Math.floor(slot/2)*2.4;const x=p.x+Math.cos(p.yaw)*lane-Math.sin(p.yaw)*back,z=p.z-Math.sin(p.yaw)*lane-Math.cos(p.yaw)*back;return{...p,...(boatSafe(x,z)?{x,z}:{}),rudder:0,speed:0,time:0,penalty:0,passed:0,next:1,lap:1,done:false,event:''};}
export function recoverBoat(r){if(r.done)return;Object.assign(r,boatGates[Math.max(0,r.next-1)]);r.speed=0;r.rudder=0;r.penalty+=3;r.event='Back on course · +3s';}
export function advanceBoat(r,dt,input={}){if(r.done||!Number.isFinite(dt)||dt<=0)return r;dt=Math.min(dt,.05);r.time+=dt;r.event='';
 const steer=Math.max(-1,Math.min(1,Number(input.steer)||0));r.rudder=(r.rudder||0)+(steer-(r.rudder||0))*(1-Math.exp(-dt*8));
 const effect=boatSpeedEffect(r);r.effect=effect.label;const target=input.brake?2.5:Math.max(3,10.5+effect.delta-Math.abs(r.rudder)*2.8);r.speed+=(target-r.speed)*(1-Math.exp(-dt*(input.brake?3.5:effect.delta<0?2:.8)));
 r.yaw+=r.rudder*1.45*dt*(.65+.35*Math.min(1,r.speed/5));
 const old={x:r.x,z:r.z},dx=Math.sin(r.yaw)*r.speed*dt,dz=Math.cos(r.yaw)*r.speed*dt,x=r.x+dx,z=r.z+dz;
 if(boatSafe(x,z)){r.x=x;r.z=z;}else{ // Slide along banks instead of pinning both axes.
  if(boatSafe(x,r.z))r.x=x;else if(boatSafe(r.x,z))r.z=z;r.speed*=Math.exp(-dt*5);r.event='Shallows — steer toward open water';
 }
 r.y=waterSurfaceAt(r.x,r.z)?.y??boatCourse.y;
 const g=boatGates[r.next],fx=Math.sin(g.yaw),fz=Math.cos(g.yaw),before=(old.x-g.x)*fx+(old.z-g.z)*fz,after=(r.x-g.x)*fx+(r.z-g.z)*fz;
 if(before<=0&&after>0){const t=-before/(after-before),cx=old.x+(r.x-old.x)*t-g.x,cz=old.z+(r.z-old.z)*t-g.z;if(Math.abs(cx*fz-cz*fx)<=3.8){r.passed++;r.event='Buoy '+(r.next+1)+' cleared';if(r.next===boatGates.length-1){r.done=true;}else r.next++;}}
 return r;
}
// Replayable fixed-size commands are used by both prediction and the server.
export function applyBoatCommand(state,command){if(command.recover)recoverBoat(state);advanceBoat(state,BOAT_STEP,command);if(command.recover&&!state.done)state.event='Back on course · +3s';return state;}
export function saveBoatBest(storage,time){if(!Number.isFinite(time)||time<=0)throw Error('Invalid race time');try{const old=Number(storage.getItem(BOAT_BEST_KEY)),best=Number.isFinite(old)&&old>0?Math.min(old,time):time;storage.setItem(BOAT_BEST_KEY,String(best));return{best,saved:true};}catch{return{best:time,saved:false};}}
