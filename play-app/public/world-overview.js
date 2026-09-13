import {marketSite} from './moon-market-layout.js';
import {mapPlayers,drawMapPlayer} from './map-players.js';
import {mapTerrain} from './map-terrain.js';
import {realms} from './world-data.js';
import {WORLD_RADIUS,places} from './geography.js';
export function worldToMap(x,z,size=900){return {x:size/2+x/(WORLD_RADIUS*2.18)*size,y:size/2+z/(WORLD_RADIUS*2.18)*size}}
export function drawOverview(canvas,player,crowd,activeId,peers){const ctx=canvas.getContext?.('2d');if(!ctx)return;const s=900;if(canvas.width!==s||canvas.height!==s){canvas.width=s;canvas.height=s;}ctx.drawImage(mapTerrain(s),0,0);
 for(const p of places){const v=worldToMap(p.x,p.z);ctx.fillStyle='#f4e6c6';ctx.fillRect(v.x-2,v.y-2,4,4)}
 for(const r of realms){const v=worldToMap(r.x,r.z);ctx.font='bold 17px sans-serif';ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle='#152c31';ctx.strokeText(r.name,v.x,v.y-19);ctx.fillStyle='#fff6dc';ctx.fillText(r.name,v.x,v.y-19);ctx.beginPath();ctx.arc(v.x,v.y,6,0,Math.PI*2);ctx.fill()}
 for(const n of crowd.npcs){if(n.dog.id===activeId)continue;const v=worldToMap(n.actor.position.x,n.actor.position.z);ctx.fillStyle='#ed8fe1';ctx.beginPath();ctx.arc(v.x,v.y,3,0,Math.PI*2);ctx.fill()}
 {const v=worldToMap(marketSite.x,marketSite.z);ctx.fillStyle='#f3d277';ctx.fillRect(v.x-4,v.y-4,8,8);ctx.font='bold 12px sans-serif';ctx.textAlign='left';ctx.fillText('Moon Market · Trade',v.x+8,v.y+17);}
 for(const other of mapPlayers(peers,player))drawMapPlayer(ctx,worldToMap(other.x,other.z),other.name);
 const v=worldToMap(player.position.x,player.position.z);ctx.save();ctx.translate(v.x,v.y);ctx.rotate(-player.rotation.y);ctx.fillStyle='#52ffdc';ctx.strokeStyle='#082e33';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,11);ctx.lineTo(-8,-8);ctx.lineTo(0,-4);ctx.lineTo(8,-8);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();ctx.font='bold 18px sans-serif';ctx.textAlign='left';ctx.fillStyle='#fff';ctx.fillText('N ↑',24,34);ctx.font='13px sans-serif';ctx.fillStyle='#f4e6c6';ctx.fillText('TERRAIN & TRAILS',24,56);ctx.strokeStyle='#f4e6c6';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(28,s-42);ctx.lineTo(28+100/(WORLD_RADIUS*2.18)*s,s-42);ctx.stroke();ctx.fillText('100 m',28,s-52);ctx.fillStyle='#52ffdc';ctx.fillText('You are here',Math.min(v.x+15,s-145),v.y+6);
}
