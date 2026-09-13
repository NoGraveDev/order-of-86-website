import {beginMinigame,finishMinigame} from './minigame-rewards.js';
import {recordMinigame} from './minigame-records.js';
import * as T from 'three';
import {height} from './geography.js';
import {sunwardSites} from './sunward-layout.js';
import {makeMaze,moveMaze} from './sunward-maze-model.js';
export function createSunwardMaze({world,player,onStart,onEnd,blocked=()=>false}){
 const site=sunwardSites.find(p=>p.id==='sun-labyrinth');
 // A small golden maze tablet marks the entrance without blocking the road.
 const marker=new T.Group();marker.name='Sunward_Labyrinth_Tablet';marker.position.set(site.x,height(site.x,site.z),site.z);world.add(marker);
 const stone=new T.MeshStandardMaterial({color:'#d7a52d',roughness:.85}),light=new T.MeshBasicMaterial({color:'#fff2a0'});
 const base=new T.Mesh(new T.CylinderGeometry(2.5,3,.5,8),stone);base.position.y=.25;marker.add(base);
 for(let i=0;i<7;i++){const wall=new T.Mesh(new T.BoxGeometry(i%2?2:3.5,.2,.18),light);wall.position.set(i%2?.5:0,.6,-1.5+i*.5);marker.add(wall);}
 const beacon=new T.Mesh(new T.OctahedronGeometry(.5),light);beacon.position.y=3.2;marker.add(beacon);
 const style=document.createElement('style');style.textContent=`
 #sunMaze{box-sizing:border-box;width:min(960px,98vw);max-width:98vw;max-height:98dvh;padding:20px;background:#201f18;color:#fff0c4;border:1px solid #c5a457;border-radius:20px;overflow:auto}
 #sunMaze::backdrop{background:#10160fea;backdrop-filter:blur(8px)}
 #sunMaze *{box-sizing:border-box}#sunMaze h2{margin:3px 0 10px;font-size:28px;color:#fff0bc}#sunMaze p{margin:8px 0;line-height:1.45}
 #sunMaze .maze-kicker{font:11px monospace;letter-spacing:2px;color:#dfba69}#sunMaze .maze-layout{display:grid;grid-template-columns:minmax(0,1fr) 210px;gap:20px;align-items:center}
 #sunMaze canvas{display:block;width:100%;max-height:calc(98dvh - 135px);aspect-ratio:1;object-fit:contain;border-radius:12px;touch-action:none}
 #sunMaze button,#sunMaze select{min-height:44px;background:#39382a;color:#fff0c4;border:1px solid #8b7846;border-radius:9px;padding:9px;cursor:pointer;font:inherit}#sunMaze button:focus-visible,#sunMaze select:focus-visible{outline:3px solid #ffe09a;outline-offset:2px}
 #sunMaze .maze-pad{display:grid;grid-template-columns:repeat(3,48px);gap:5px;justify-content:center;margin:16px 0;touch-action:none}#sunMaze .maze-pad button{font-size:23px;user-select:none;touch-action:none}
 #sunMaze .maze-actions{display:flex;gap:8px;flex-wrap:wrap}#sunMaze .maze-stats{font:15px monospace;color:#ffe09a;min-height:22px}#sunMaze .maze-result{color:#cbeaac;min-height:45px}#sunMaze select{width:100%}
 #mazeEnter{position:fixed;bottom:230px;left:50%;transform:translateX(-50%);z-index:14;background:#695020;color:#fff0c4;max-width:90vw}
 @media(max-width:600px) and (orientation:portrait){#sunMaze{padding:12px}#sunMaze h2{font-size:23px}#sunMaze .maze-layout{grid-template-columns:1fr;gap:8px}#sunMaze canvas{max-height:46dvh}#sunMaze .maze-side{display:grid;grid-template-columns:minmax(0,1fr) 142px;gap:8px;align-items:center}#sunMaze .maze-pad{margin:0;grid-template-columns:repeat(3,44px)}#sunMaze select{font-size:12px;min-width:0;padding:6px}#sunMaze .maze-help{font-size:12px}#sunMaze .maze-result{min-height:0}#sunMaze .maze-actions{grid-column:1/-1}#sunMaze .maze-stats{font-size:12px}}
 @media(orientation:landscape) and (max-height:550px){#sunMaze{padding:10px}#sunMaze h2{font-size:20px;margin:0}#sunMaze .maze-layout{grid-template-columns:minmax(0,1fr) 280px;gap:10px}#sunMaze canvas{max-height:calc(98dvh - 110px)}#sunMaze .maze-side{font-size:12px}#sunMaze .maze-pad{margin:5px}#sunMaze .maze-pad button{min-height:38px;padding:3px}#sunMaze p{margin:3px 0}}
 `;document.head.append(style);
 const dialog=document.createElement('dialog');dialog.id='sunMaze';dialog.setAttribute('aria-labelledby','mazeTitle');dialog.innerHTML=`<div class="maze-kicker">SUNWARD HEIGHTS · A TRIAL OF CLARITY</div><h2 id="mazeTitle">The Golden Labyrinth</h2><div class="maze-layout"><canvas tabindex="0" width="760" height="760" aria-label="Overhead labyrinth. Guide the wizard dog from the upper left to the glowing exit at the lower right."></canvas><div class="maze-side"><div><select aria-label="Maze difficulty"><option value="9">Wanderer · 9 × 9</option><option value="13">Pathfinder · 13 × 13</option></select><p class="maze-help">Guide the wizard dog to the golden exit. The entire labyrinth stays in view.<br>WASD / arrows, or hold the direction buttons.</p><p class="maze-stats"></p><p class="maze-result" role="status" aria-live="polite"></p></div><div class="maze-pad"><span></span><button data-dir="0,-1" aria-label="Move up">↑</button><span></span><button data-dir="-1,0" aria-label="Move left">←</button><button data-dir="0,1" aria-label="Move down">↓</button><button data-dir="1,0" aria-label="Move right">→</button></div><div class="maze-actions"><button data-action="retry">Retry</button><button data-action="new">New maze</button><button data-action="exit">Leave maze</button></div></div></div>`;document.body.append(dialog);
 const enter=document.createElement('button');enter.id='mazeEnter';enter.hidden=true;enter.textContent='Golden Labyrinth · E';document.body.append(enter);
 const canvas=dialog.querySelector('canvas'),ctx=canvas.getContext('2d'),stats=dialog.querySelector('.maze-stats'),result=dialog.querySelector('.maze-result'),select=dialog.querySelector('select');
 let rewardRun=null;
 let state=makeMaze(),elapsed=0,started=false,held=null,nextStep=0,lastTime=0,frame=0,lastFocus=null;
 const dirs={ArrowUp:[0,-1],KeyW:[0,-1],ArrowDown:[0,1],KeyS:[0,1],ArrowLeft:[-1,0],KeyA:[-1,0],ArrowRight:[1,0],KeyD:[1,0]};
 function draw(){
  const n=state.size,s=720/n,ox=20,oy=20;ctx.fillStyle='#191f19';ctx.fillRect(0,0,760,760);
  ctx.fillStyle='#e9dbad';ctx.fillRect(ox,oy,720,720);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(state.grid[y][x]){ctx.fillStyle='#96712d';ctx.fillRect(ox+x*s,oy+y*s,s+.2,s+.2);ctx.fillStyle='#caa952';ctx.fillRect(ox+x*s+1,oy+y*s+1,s-2,s-2);ctx.fillStyle='#e3c476';ctx.fillRect(ox+x*s+1,oy+y*s+1,s-2,2);}
  // Start and open boundary exit remain visible; no fog or hidden corridors.
  ctx.fillStyle='#adc298';ctx.fillRect(ox+s,oy+s,s,s);ctx.fillStyle='#ebae35';ctx.fillRect(ox+state.exit.x*s,oy+state.exit.y*s,s,s);
  ctx.fillStyle='#fff6c7';ctx.font=`bold ${s*.8}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('☀',ox+(state.exit.x+.5)*s,oy+(state.exit.y+.5)*s);
  // Overhead storybook dog: ears, muzzle, paws, and a pointed violet wizard hat.
  ctx.save();ctx.translate(ox+(state.x+.5)*s,oy+(state.y+.5)*s);ctx.scale(s/40,s/40);ctx.strokeStyle='#29232e';ctx.lineWidth=1.5;
  function oval(x,y,rx,ry,color){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.stroke();}
  oval(-10,8,4,6,'#f9f1dc');oval(10,8,4,6,'#f9f1dc');oval(0,4,10,12,'#dfcba6');oval(-11,-3,5,9,'#70513c');oval(11,-3,5,9,'#70513c');oval(0,-1,11,10,'#f9f1dc');oval(0,5,4,3,'#302932');oval(-4,0,1,1,'#302932');oval(4,0,1,1,'#302932');
  oval(0,-9,15,4,'#8261a6');ctx.beginPath();ctx.moveTo(-10,-10);ctx.lineTo(2,-24);ctx.lineTo(9,-10);ctx.closePath();ctx.fillStyle='#8261a6';ctx.fill();ctx.stroke();ctx.fillStyle='#ffe4a2';ctx.fillRect(-2,-15,4,3);ctx.restore();
  stats.textContent=`${elapsed.toFixed(1)}s · ${state.moves} steps`;
 }
 function step(dx,dy){if(moveMaze(state,dx,dy)){started=true;if(state.won){finishMinigame('maze'+state.cells,rewardRun);rewardRun=null;recordMinigame('maze'+state.cells,{time:elapsed,steps:state.moves,seed:state.seed});held=null;result.textContent=`You escaped! ${elapsed.toFixed(1)} seconds · ${state.moves} steps. Try another labyrinth.`;}draw();}}
 function clear(){held=null;nextStep=0;}
 function reset(same=false){clear();state=makeMaze(same?state.seed:crypto.getRandomValues(new Uint32Array(1))[0],Number(select.value));elapsed=0;started=false;rewardRun=beginMinigame('maze'+state.cells);result.textContent='';draw();}
 function tick(time){if(!dialog.open)return;const dt=lastTime?(time-lastTime)/1000:0;lastTime=time;if(!document.hidden&&document.hasFocus()){if(started&&!state.won)elapsed+=dt;if(held&&time>=nextStep){step(...held);nextStep=time+110;}}draw();frame=requestAnimationFrame(tick);}
 function near(){return !blocked()&&Math.hypot(player.position.x-site.x,player.position.z-site.z)<12&&Math.abs(player.position.y-height(site.x,site.z))<8;}
 function open(){if(!near()||document.querySelector('dialog[open]'))return false;lastFocus=document.activeElement;onStart();reset();dialog.showModal();canvas.focus();enter.hidden=true;lastTime=0;frame=requestAnimationFrame(tick);return true;}
 dialog.addEventListener('close',()=>{cancelAnimationFrame(frame);clear();onEnd();lastFocus?.focus?.({preventScroll:true});});
 dialog.addEventListener('keydown',e=>{const d=dirs[e.code];if(!d||e.target===select)return;e.preventDefault();e.stopPropagation();if(!e.repeat){held=d;step(...d);nextStep=performance.now()+180;}});
 addEventListener('keyup',e=>{if(dirs[e.code])clear();});addEventListener('blur',clear);document.addEventListener('visibilitychange',()=>{clear();lastTime=0;});
 for(const b of dialog.querySelectorAll('[data-dir]')){b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);held=b.dataset.dir.split(',').map(Number);step(...held);nextStep=performance.now()+180;});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,clear);b.addEventListener('click',e=>{if(e.detail===0)step(...b.dataset.dir.split(',').map(Number));});}
 select.onchange=()=>reset();dialog.querySelector('[data-action="retry"]').onclick=()=>reset(true);dialog.querySelector('[data-action="new"]').onclick=()=>reset();dialog.querySelector('[data-action="exit"]').onclick=()=>dialog.close();enter.onclick=open;
 return{site,open,near,get active(){return dialog.open},update(time){enter.hidden=!near()||!!document.querySelector('dialog[open]');beacon.rotation.y=time;}};
}
