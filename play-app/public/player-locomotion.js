// Shared baseline locomotion for the world and the Crucible arena.
export const WALK_SPEED=5.5,SPRINT_SPEED=11,JUMP_VELOCITY=7,GRAVITY=18;
export const JUMP_SECONDS=2*JUMP_VELOCITY/GRAVITY;
export function movementVector(right,forward,yaw){
 const length=Math.max(1,Math.hypot(right,forward)),x=right/length,z=forward/length;
 return {x:x*Math.cos(yaw)-z*Math.sin(yaw),z:-x*Math.sin(yaw)-z*Math.cos(yaw)};
}
export function jumpOffset(seconds){return seconds>=0&&seconds<JUMP_SECONDS?Math.max(0,JUMP_VELOCITY*seconds-GRAVITY*seconds*seconds/2):0;}
export function thirdPersonPose(player,yaw,pitch,zoom){return {
 position:{x:player.x+Math.sin(yaw)*zoom*Math.cos(pitch),y:player.y+2.6+Math.sin(pitch)*zoom,z:player.z+Math.cos(yaw)*zoom*Math.cos(pitch)},
 target:{x:player.x,y:player.y+1.9,z:player.z},
};}
