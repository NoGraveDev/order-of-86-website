export const PLAYER_MAP_COLOR='#70bdff';
export function mapPlayers(peers,player){
 const list=[];for(const [id,peer]of peers||[]){const p=peer.rig?.root?.position,name=peer.target?.name;
  if(peer.target?.invisible||!p||![p.x,p.y,p.z].every(Number.isFinite)||(p.y< -20)!==(player.position.y< -20))continue;
  list.push({id,name:typeof name==='string'?name:'Player',x:p.x,z:p.z,distance:Math.round(Math.hypot(p.x-player.position.x,p.z-player.position.z))});
 }return list;
}
export function playerMapPoint(v,size,padding=14){const dx=v.x-size/2,dy=v.y-size/2,limit=size/2-padding,scale=Math.min(1,limit/Math.max(Math.abs(dx),Math.abs(dy),1));return {x:size/2+dx*scale,y:size/2+dy*scale,edge:scale<1};}
export function drawMapPlayer(ctx,v,name){ctx.save();ctx.translate(v.x,v.y);ctx.fillStyle=PLAYER_MAP_COLOR;ctx.strokeStyle='#10283b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(6,0);ctx.lineTo(0,6);ctx.lineTo(-6,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.font='bold 10px sans-serif';const right=v.x>(ctx.canvas?.width||240)/2;ctx.textAlign=right?'right':'left';const text=name.slice(0,12)+(name.length>12?'…':'')+(v.edge?' · far':'');const x=right?-9:9,y=v.y<26?17:-9;ctx.lineWidth=3;ctx.strokeText(text,x,y);ctx.fillStyle='#c8e8ff';ctx.fillText(text,x,y);ctx.restore();}
