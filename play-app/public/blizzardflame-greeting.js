import * as T from 'three';
export function createBlizzardflameGreeting(crowd,camera){
 const npc=crowd.npcs.find(n=>n.dog.id===5035),point=new T.Vector3();
 const bubble=document.createElement('div');bubble.id='blizzardflameGreeting';bubble.textContent='BLIMEY!';bubble.hidden=true;bubble.setAttribute('role','status');document.body.append(bubble);
 let armed=true,until=0;
 return {update(position,paused=false,now=performance.now()){
  const distance=npc.actor.position.distanceTo(position);
  if(distance>6)armed=true;
  if(!paused&&!npc.selected&&distance<4&&armed){armed=false;until=now+3000;}
  if(paused||npc.selected||!npc.actor.visible||now>=until){bubble.hidden=true;return;}
  point.copy(npc.actor.position);point.y+=3.9;point.project(camera);
  bubble.hidden=point.z< -1||point.z>1||Math.abs(point.x)>1||Math.abs(point.y)>1;
  bubble.style.left=((point.x+1)*innerWidth/2)+'px';bubble.style.top=((-point.y+1)*innerHeight/2)+'px';
 }};
}
