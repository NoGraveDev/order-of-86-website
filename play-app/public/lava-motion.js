import {WALK_SPEED,SPRINT_SPEED,JUMP_SECONDS} from './player-locomotion.js';
import {ARENA,jumpHeight} from './lava-arena-core.js';
const clamp=v=>Math.max(-ARENA.limit,Math.min(ARENA.limit,v));
// Visual prediction only. Health, hits, movement authority and winners stay on the server.
export class LavaMotion{
 constructor(){this.reset();}
 reset(){this.pose=null;this.errorX=0;this.errorZ=0;this.jumpAt=-10000;this.jumpReady=0;this.serverJump=-10000;this.lastPacket=0;}
 accept(p,tickAt,now){const age=Math.max(0,Math.min(.2,(now-tickAt)/1000)),input=now-p.inputAt<400?p.input:{x:0,z:0},n=Math.max(1,Math.hypot(input.x,input.z)),speed=input.sprint?SPRINT_SPEED:WALK_SPEED;const x=clamp(p.x+(input.x/n*speed+p.vx)*age),z=clamp(p.z+(input.z/n*speed+p.vz)*age);
 if(!this.pose||p.status!=='alive'||Math.hypot(this.pose.x-x,this.pose.z-z)>5){this.pose={x,z,vx:p.vx,vz:p.vz};this.errorX=this.errorZ=0;}else{this.errorX=x-this.pose.x;this.errorZ=z-this.pose.z;this.pose.vx=p.vx*Math.exp(-4*age);this.pose.vz=p.vz*Math.exp(-4*age);}
 if(p.jumpAt>this.serverJump){if(now-this.jumpAt>900)this.jumpAt=p.jumpAt;this.serverJump=p.jumpAt;this.jumpReady=Math.max(this.jumpReady,p.jumpReady);}this.lastPacket=now;
 }
 step(dt,input,now,alive){if(!this.pose)return null;dt=Math.min(.05,dt);const p=this.pose;if(alive&&now-this.lastPacket<650){const n=Math.max(1,Math.hypot(input.x,input.z)),speed=input.sprint?SPRINT_SPEED:WALK_SPEED;p.x=clamp(p.x+(input.x/n*speed+p.vx)*dt);p.z=clamp(p.z+(input.z/n*speed+p.vz)*dt);p.vx*=Math.exp(-4*dt);p.vz*=Math.exp(-4*dt);if(input.jump&&now>=this.jumpReady){this.jumpAt=now;this.jumpReady=now+JUMP_SECONDS*1000;}}
 const ease=1-Math.exp(-dt*8);p.x=clamp(p.x+this.errorX*ease);p.z=clamp(p.z+this.errorZ*ease);this.errorX*=1-ease;this.errorZ*=1-ease;return {...p,jump:alive?jumpHeight({jumpAt:this.jumpAt},now):0};}
}
