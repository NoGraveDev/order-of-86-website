import {marketSite,merchantSite} from './moon-market-layout.js';
import {mapPlayers,playerMapPoint,drawMapPlayer} from './map-players.js';
import {mapTerrain} from './map-terrain.js';
import {realms} from './world-data.js';
import {places,WORLD_RADIUS} from './geography.js';
export function miniMapPoint(x,z,position,range,size=240){return {x:size/2+(x-position.x)*size/(range*2),y:size/2+(z-position.z)*size/(range*2)}}
export function createMiniMap({canvas,zoomIn,zoomOut,scaleLabel,toggle,body,open,openAtlas}){
 const levels=[90,160,260];let level=1,collapsed=false;const size=240,ctx=canvas.getContext?.('2d'),terrain=document.createElement('canvas'),cache=terrain.getContext?.('2d');canvas.width=canvas.height=size;terrain.width=terrain.height=600;
 if(cache)cache.drawImage(mapTerrain(600,1),0,0);
 function controls(){scaleLabel.textContent=levels[level]*2+' m across';zoomIn.disabled=level===0;zoomOut.disabled=level===levels.length-1}
 zoomIn.onclick=()=>{level=Math.max(0,level-1);controls()};zoomOut.onclick=()=>{level=Math.min(levels.length-1,level+1);controls()};toggle.onclick=()=>{collapsed=!collapsed;body.hidden=collapsed;toggle.textContent=collapsed?'Show':'Hide';toggle.setAttribute('aria-expanded',String(!collapsed))};open.onclick=openAtlas;controls();
 return {get range(){return levels[level]},get collapsed(){return collapsed},draw(player,crowd,activeId,owls,peers){if(!ctx||!cache||collapsed)return;const range=levels[level],p=player.position,point=(x,z)=>miniMapPoint(x,z,p,range,size);ctx.fillStyle='#10282c';ctx.fillRect(0,0,size,size);const origin=point(-WORLD_RADIUS,-WORLD_RADIUS),width=WORLD_RADIUS/range*size;ctx.drawImage(terrain,origin.x,origin.y,width,width);
 function dot(x,z,color,r){const v=point(x,z);if(v.x<3||v.y<3||v.x>size-3||v.y>size-3)return;ctx.beginPath();ctx.arc(v.x,v.y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#10282c';ctx.lineWidth=1.5;ctx.stroke()}
 for(const place of [...realms,...places])dot(place.x,place.z,'#fff1c9',4);
 for(const n of crowd.npcs)if(n.dog.id!==activeId)dot(n.actor.position.x,n.actor.position.z,'#ed8fe1',3);
 for(const o of owls.flock)dot(o.g.position.x,o.g.position.z,'#f3b760',3);
 for(const site of [marketSite,merchantSite]){const v=point(site.x,site.z);if(v.x>8&&v.x<size-8&&v.y>8&&v.y<size-8){ctx.fillStyle='#f3d277';ctx.fillRect(v.x-4,v.y-4,8,8);ctx.font='bold 9px sans-serif';ctx.textAlign='left';ctx.fillText(site===marketSite?'SHOP':'TRADE',v.x+6,v.y-4);}}
 const players=mapPlayers(peers,player);for(const other of players)drawMapPlayer(ctx,playerMapPoint(point(other.x,other.z),size),other.name);const label=document.getElementById('miniPlayers');if(label){const text=players.length?players.map(p=>p.name+' · '+p.distance+'m').join(' / '):'';if(label.textContent!==text)label.textContent=text;}
 ctx.save();ctx.translate(size/2,size/2);ctx.rotate(-player.rotation.y);ctx.beginPath();ctx.moveTo(0,10);ctx.lineTo(-7,-7);ctx.lineTo(0,-3);ctx.lineTo(7,-7);ctx.closePath();ctx.fillStyle='#52ffdc';ctx.fill();ctx.strokeStyle='#082e33';ctx.lineWidth=2;ctx.stroke();ctx.restore();ctx.font='bold 16px sans-serif';ctx.fillStyle='#fff1c9';ctx.textAlign='left';ctx.fillText('N ↑',10,22);
 }};
}
