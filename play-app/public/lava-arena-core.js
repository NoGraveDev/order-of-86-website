import {WALK_SPEED,SPRINT_SPEED,JUMP_SECONDS,jumpOffset} from './player-locomotion.js';
import {height,places} from './geography.js';
const crucible=places.find(p=>p.name==='The Crucible');
export const LAVA_SITE={id:'ember-lava-arena',realm:'ember',name:'Floor Is Lava · The Crucible',atlasNote:'Multiplayer · Wand knockback arena',x:crucible.x,z:crucible.z+14};
export const ARENA={x:crucible.x,z:crucible.z,y:Math.max(...[-19,0,19].flatMap(x=>[-19,0,19].map(z=>height(crucible.x+x,crucible.z+z))))+3,limit:16.8,duration:90000};
export const LAVA_STEP=50;
export const SAFE_TILES=Array.from({length:25},(_,i)=>({x:(i%5-2)*6,z:(Math.floor(i/5)-2)*6,half:2.25}));
export const gate={x:ARENA.x,z:ARENA.z+30,y:height(ARENA.x,ARENA.z+30)};
export const onStone=(x,z)=>SAFE_TILES.some(t=>Math.abs(x-t.x)<=t.half&&Math.abs(z-t.z)<=t.half);
export const surges=t=>[0,1,2].map(i=>({x:-15+i*12,z:Math.sin(t*.65+i*2)*15,r:2.1}));
export function jumpHeight(p,t){return jumpOffset((t-p.jumpAt)/1000);}
export function newArena(id,now){return {id,phase:'waiting',host:'',startsAt:0,tickAt:now,players:[],orbs:[],nextOrb:0,winners:[]};}
export function arenaPlayer(id,name,dog,slot,now){const spawn=[[-12,12],[12,-12],[-12,-12],[12,12],[0,12],[0,-12],[-12,0],[12,0]][slot];return {id,name,dog,x:spawn[0],z:spawn[1],yaw:Math.atan2(-spawn[0],-spawn[1]),hp:100,vx:0,vz:0,jumpAt:-10000,jumpReady:0,shotAt:-10000,hits:0,seq:0,lastSeen:now,inputAt:0,input:{x:0,z:0,aim:0,shoot:false,jump:false},status:'ready'};}
function conclude(s){const alive=s.players.filter(p=>p.status==='alive');if(alive.length<=1){s.phase='finished';s.winners=alive.map(p=>p.id);}else if(s.tickAt-s.startsAt>=ARENA.duration){const best=Math.max(...alive.map(p=>p.hp));s.phase='finished';s.winners=alive.filter(p=>Math.abs(p.hp-best)<.01).map(p=>p.id);}}
export function advanceArena(s,now){
 for(const p of s.players)if(['alive','ready'].includes(p.status)&&now-p.lastSeen>12000)p.status='left';
 if(s.phase==='waiting'){if(!s.players.some(p=>p.id===s.host&&p.status==='ready'))s.host=s.players.find(p=>p.status==='ready')?.id||'';s.tickAt=now;return;}
 if(s.phase==='countdown'&&now>=s.startsAt){s.phase='playing';s.tickAt=s.startsAt;for(const p of s.players)if(p.status==='ready')p.status='alive';}
 if(s.phase!=='playing')return;
 const end=Math.min(now,s.startsAt+ARENA.duration);while(s.tickAt+LAVA_STEP<=end&&s.phase==='playing'){
 s.tickAt+=LAVA_STEP;const t=s.tickAt,dt=LAVA_STEP/1000;
 for(const p of s.players){if(p.status!=='alive')continue;const input=t-p.inputAt<400?p.input:{x:0,z:0,aim:p.yaw,shoot:false,jump:false};p.yaw=input.aim;
 if(input.jump&&t>=p.jumpReady){p.jumpAt=t;p.jumpReady=t+JUMP_SECONDS*1000;}
 const length=Math.max(1,Math.hypot(input.x,input.z)),speed=input.sprint?SPRINT_SPEED:WALK_SPEED;p.x=Math.max(-ARENA.limit,Math.min(ARENA.limit,p.x+(input.x/length*speed+p.vx)*dt));p.z=Math.max(-ARENA.limit,Math.min(ARENA.limit,p.z+(input.z/length*speed+p.vz)*dt));p.vx*=Math.exp(-4*dt);p.vz*=Math.exp(-4*dt);
 if(!onStone(p.x,p.z)&&jumpHeight(p,t)<.65){const wave=surges((t-s.startsAt)/1000).some(w=>Math.hypot(p.x-w.x,p.z-w.z)<w.r);p.hp=Math.max(0,p.hp-dt*(wave?65:38));if(!p.hp)p.status='out';}
 if(p.status==='alive'&&input.shoot&&t-p.shotAt>=800){p.shotAt=t;const dx=Math.sin(p.yaw),dz=Math.cos(p.yaw);s.orbs.push({id:++s.nextOrb,owner:p.id,x:p.x+dx*1.1,z:p.z+dz*1.1,dx,dz,born:t});}
 }
 s.orbs=s.orbs.filter(o=>{o.x+=o.dx*23*dt;o.z+=o.dz*23*dt;if(t-o.born>1700||Math.abs(o.x)>17.5||Math.abs(o.z)>17.5)return false;const hit=s.players.find(p=>p.id!==o.owner&&p.status==='alive'&&jumpHeight(p,t)<.95&&Math.hypot(p.x-o.x,p.z-o.z)<1.15);if(hit){hit.vx=o.dx*16;hit.vz=o.dz*16;hit.hits++;return false;}return true;});conclude(s);
 }
 conclude(s);
}
export function validArenaInput(b){return Number.isSafeInteger(b.seq)&&b.seq>0&&b.input&&['x','z','aim'].every(k=>Number.isFinite(b.input[k]))&&Math.abs(b.input.x)<=1&&Math.abs(b.input.z)<=1&&Math.abs(b.input.aim)<=Math.PI*2&&typeof b.input.shoot==='boolean'&&typeof b.input.jump==='boolean'&&(b.input.sprint===undefined||typeof b.input.sprint==='boolean');}
