import {ascentPoint} from './frost-layout.js';
import {height} from './geography.js';
import {SLED_BEST_KEY} from './minigame-records.js';
export {SLED_BEST_KEY};
export const track=[];let length=0;
for(let i=0;i<=1800;i++){const p=ascentPoint(.94*(1-i/1800));if(i)length+=Math.hypot(p.x-track[i-1].x,p.z-track[i-1].z);track.push({...p,y:height(p.x,p.z),s:length})}
export const trackLength=length;
export function trackPose(distance,lane=0){const s=Math.max(0,Math.min(length,distance));let lo=0,hi=track.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(track[mid].s<s)lo=mid;else hi=mid}const a=track[lo],b=track[hi],t=(s-a.s)/(b.s-a.s),dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz),x=a.x+dx*t-dz/l*lane,z=a.z+dz*t+dx/l*lane;return{x,z,y:height(x,z),yaw:Math.atan2(dx,dz),slope:(a.y-b.y)/l}}
export const gates=Array.from({length:9},(_,i)=>({s:length*(.08+i*.1),lane:[-1.7,1.7,0][i%3]}));
export const hazards=Array.from({length:8},(_,i)=>({s:length*(.13+i*.1),lane:[1.7,0,-1.7][i%3]}));
export function newRace(){return{s:0,lane:0,speed:0,time:0,penalty:0,gate:0,hazard:0,hits:0,passed:0,done:false,event:''}}
export function advanceRace(r,dt,input={}){if(r.done||!Number.isFinite(dt)||dt<=0)return r;dt=Math.min(dt,.1);r.event='';const p=trackPose(r.s);r.time+=dt;r.speed=Math.max(4,Math.min(27,r.speed+(5+Math.max(0,p.slope)*9-(input.brake?20:0)-r.speed*.15)*dt));r.lane+=((input.steer||0)*6+Math.sin(r.s*.034)*r.speed*.024)*dt;if(Math.abs(r.lane)>3.4){r.lane=Math.sign(r.lane)*3.4;r.speed=Math.max(4,r.speed-16*dt);r.event='Snowbank — steer inward'}r.s=Math.min(length,r.s+r.speed*dt);
while(r.gate<gates.length&&r.s>=gates[r.gate].s){const g=gates[r.gate++];if(Math.abs(r.lane-g.lane)<=1.35){r.passed++;r.event='Clean gate!'}else{r.penalty+=2;r.event='Missed gate +2s'}}
while(r.hazard<hazards.length&&r.s>=hazards[r.hazard].s){const h=hazards[r.hazard++];if(Math.abs(r.lane-h.lane)<1){r.hits++;r.speed*=.5;r.penalty+=1.5;r.event='Snow mound +1.5s'}}
r.done=r.s>=length;return r}
export function recordBest(storage,time){try{const old=Number(storage.getItem(SLED_BEST_KEY));const best=old>0?Math.min(old,time):time;storage.setItem(SLED_BEST_KEY,String(best));return{best,saved:true}}catch{return{best:time,saved:false}}}
