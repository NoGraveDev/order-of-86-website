import {beginMinigame,finishMinigame} from './minigame-rewards.js';
import {leaderboardView,cacheChessRecord} from './chess-record-view.js';
import * as T from 'three';
import {realms} from './world-data.js';
import {height} from './geography.js';
import {engineOf,newTable,chessAction} from './chess-state.js';
const frost=realms.find(r=>r.id==='frost');
export const chessSite={x:frost.x-14,z:frost.z+24};
const glyphs={wk:'♔',wq:'♕',wr:'♖',wb:'♗',wn:'♘',wp:'♙',bk:'♚',bq:'♛',br:'♜',bb:'♝',bn:'♞',bp:'♟'};
const names={k:'king',q:'queen',r:'rook',b:'bishop',n:'knight',p:'pawn'};
export function createFrostChess({scene,getState,request,isConnected,soloOnly=false}){
 const group=new T.Group();group.name='Frosthollow Chess Table';group.position.set(chessSite.x,height(chessSite.x,chessSite.z),chessSite.z);scene.add(group);
 const ice=new T.MeshStandardMaterial({color:0x91c6d5,roughness:.28,metalness:.15}),light=new T.MeshStandardMaterial({color:0xe1f5ef}),dark=new T.MeshStandardMaterial({color:0x25465c});
 function box(w,h,d,x,y,z,mat){const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);group.add(mesh);return mesh;}
 box(5,.4,5,0,1.7,0,ice);box(1.2,1.5,1.2,0,.75,0,ice);
 for(let r=0;r<8;r++)for(let c=0;c<8;c++)box(.55,.06,.55,(c-3.5)*.55,1.94,(r-3.5)*.55,(r+c)%2?dark:light);
 for(const z of [-3.4,3.4])box(2,.65,1.1,0,.4,z,ice);
 const signCanvas=document.createElement('canvas');signCanvas.width=1024;signCanvas.height=768;const signContext=signCanvas.getContext('2d'),signTexture=new T.CanvasTexture(signCanvas);signTexture.colorSpace=T.SRGBColorSpace;
 const sign=new T.Mesh(new T.PlaneGeometry(5,3.75),new T.MeshBasicMaterial({map:signTexture,side:T.DoubleSide}));sign.position.set(6,3.6,0);group.add(sign);box(.24,3.7,.24,4,.85,0,ice);box(.24,3.7,.24,8,.85,0,ice);
 let rankingKey='';function rankings(data){const key=JSON.stringify(data?.leaders||[]);if(key===rankingKey)return;rankingKey=key;const ctx=signContext;ctx.fillStyle='#213f50';ctx.fillRect(0,0,1024,768);ctx.strokeStyle='#b8d6de';ctx.lineWidth=16;ctx.strokeRect(12,12,1000,744);ctx.fillStyle='#f4e5b8';ctx.font='bold 55px Georgia';ctx.fillText('FROSTHOLLOW CHESS',60,95);ctx.fillStyle='#bfdee3';ctx.font='30px sans-serif';ctx.fillText('ALL-TIME WINNERS',60,155);const rows=(data?.leaders||[]).slice(0,5);if(!rows.length){ctx.font='36px Georgia';ctx.fillText('Your first victory belongs here.',60,300);}rows.forEach((p,i)=>{ctx.fillStyle='#f4f3e9';ctx.font='38px sans-serif';ctx.fillText((i+1)+'. '+p.name.slice(0,24),60,245+i*90,680);ctx.textAlign='right';ctx.fillText(p.wins+' wins',955,245+i*90);ctx.textAlign='left';});signTexture.needsUpdate=true;}
 rankings(null);
 const pieceGroup=new T.Group();group.add(pieceGroup);let meshKey='';
 function worldPieces(game){const key=game.fen().split(' ')[0];if(key===meshKey)return;meshKey=key;for(const mesh of [...pieceGroup.children]){mesh.geometry.dispose();pieceGroup.remove(mesh);}for(const row of game.board())for(const p of row){if(!p)continue;const scale={p:.28,n:.4,b:.48,r:.4,q:.6,k:.7}[p.type];const mesh=new T.Mesh(new T.CylinderGeometry(p.type==='r'?.16:.07,.2,scale,8),p.color==='w'?light:dark);mesh.position.set((p.square.charCodeAt(0)-97-3.5)*.55,2+scale/2,(8-Number(p.square[1])-3.5)*.55);pieceGroup.add(mesh);}}
 worldPieces(engineOf(newTable()));
 const dialog=document.createElement('dialog');dialog.id='chessDialog';dialog.innerHTML=`<div class="chess-heading"><div><small>FROSTHOLLOW · CHESS</small><h2>The Echo Board</h2></div><button id="chessClose" aria-label="Close chess">×</button></div><div class="chess-controls"><button id="chessAI">Play against AI</button><button id="chessHuman">Room table</button><label>AI level <select id="chessLevel"><option value="1">Gentle</option><option value="2" selected>Thoughtful</option><option value="3">Challenging</option></select></label></div><p id="chessStatus" role="status">Connecting to the table…</p><div id="chessSeats"></div><div id="chessBoard" aria-label="Chess board"></div><div id="chessMoveControls" class="chess-controls"><label>Promote to <select id="chessPromotion"><option value="q">Queen</option><option value="r">Rook</option><option value="b">Bishop</option><option value="n">Knight</option></select></label><button id="chessResign">Resign</button><button id="chessStand">Leave seat</button><button id="chessRematch">Rematch</button></div><p id="chessError" role="alert"></p><p class="chess-help">Tap a piece, then a highlighted square. Closing this board keeps your seat. Leaving the room or disconnecting forfeits an active game after 20 seconds.</p><details><summary>Move history</summary><p id="chessHistory">No moves yet.</p></details>`;document.body.append(dialog);
 const layout=document.createElement('div'),play=document.createElement('div'),aside=document.createElement('aside');layout.className='chess-layout';play.className='chess-play';aside.className='chess-leaderboard';aside.innerHTML='<h3>Frosthollow winners</h3><p>All-time · This world</p><div id="chessLeaders"></div>';const board=dialog.querySelector('#chessBoard');dialog.insertBefore(layout,dialog.querySelector('#chessSeats'));for(const el of [dialog.querySelector('#chessSeats'),board,dialog.querySelector('#chessMoveControls')])play.append(el);layout.append(play,aside);
 const $=id=>dialog.querySelector('#'+id);let current=null,selected=null,poll=null,acting=false,near=false,wasConnected=false,solo=soloOnly,worker=null;
 function cancelAI(){worker?.terminate();worker=null;}
 function startAI(){cancelAI();solo=true;current={revision:0,self:'local-human',table:newTable()};current.table.seats={w:{id:'local-human',name:'You'},b:{id:'local-ai',name:'Echo AI'}};selected=null;worldPieces(engineOf(current.table));render();}
 function think(){if(!solo||worker||current.table.result||engineOf(current.table).turn()!=='b')return;const revision=current.revision;worker=new Worker(new URL('./chess-ai-worker.js',import.meta.url),{type:'module'});$('chessStatus').textContent='Echo AI is thinking…';worker.onmessage=({data})=>{cancelAI();if(!solo||current.revision!==revision)return;if(data.error){$('chessError').textContent=data.error;return;}if(data.move){current.table=chessAction(current.table,'local-ai','Echo AI','move',data.move);current.revision++;selected=null;worldPieces(engineOf(current.table));render();}};worker.onerror=()=>{cancelAI();$('chessError').textContent='AI unavailable. Start a new game to retry.';};worker.postMessage({fen:engineOf(current.table).fen(),depth:Number($('chessLevel').value)});}
 $('chessAI').onclick=()=>{if(acting){$('chessError').textContent='Wait for your table action to finish.';return;}if(!solo&&current&&Object.values(current.table.seats).some(s=>s?.id===current.self)){$('chessError').textContent='Leave your room-table seat before starting a private AI game.';return;}startAI();};
 $('chessHuman').onclick=()=>{if(!isConnected())return;cancelAI();solo=false;current=null;selected=null;send('state');};
 $('chessClose').onclick=()=>dialog.close();
 function accept(data){
  if(solo)return;
  if(current&&data.revision<current.revision)return;
  const changed=!current||data.revision!==current.revision||data.self!==current.self;
  current=data;
  rankings(data);leaderboardView($('chessLeaders'),data);cacheChessRecord(data);
  // A heartbeat must not replace the button beneath a finger mid-tap.
  if(changed){selected=null;worldPieces(engineOf(data.table));render();}
 }
 async function refresh(){if(poll)return poll;poll=request({action:'state'}).then(accept);try{await poll;}finally{poll=null;}}
 async function send(action,extra={}){
  if(solo){if(action==='state')return;try{if(action==='rematch'||action==='stand'){startAI();return;}if(action==='resign')cancelAI();if(worker){$('chessError').textContent='Wait for Echo AI to finish its move.';return;}current.table=chessAction(current.table,'local-human','You',action,extra);current.revision++;selected=null;$('chessError').textContent='';worldPieces(engineOf(current.table));render();think();}catch(e){$('chessError').textContent=e.message;}return;}
  if(!isConnected()){$('chessError').textContent='Reconnect to your room to play.';return;}
  if(action==='state'){if(poll||acting)return;try{await refresh();}catch(e){$('chessError').textContent=e.message;}return;}
  if(acting)return;
  const expected=current?.revision;acting=true;$('chessError').textContent='Sending…';
  try{
   // Queue the user's action behind a poll instead of silently dropping it.
   if(poll)await poll;
   if(action==='move'&&current?.revision!==expected)throw Error('The board changed. Select your piece again.');
   let data;
   try{data=await request({action,revision:current?.revision,...extra});}
   catch(e){
    // Concurrent seat/rematch votes commute; refresh and retry one conflict.
    // Never replay a move or retry an ambiguous network failure.
    if(e.status!==409||!['sit','rematch'].includes(action))throw e;
    await refresh();data=await request({action,revision:current?.revision,...extra});
   }
   accept(data);$('chessError').textContent='';
  }catch(e){$('chessError').textContent=e.message;try{await refresh();}catch{}}
  finally{acting=false;}
 }
 let rewardRun=null,rewardGame=null,rewardPaid=false;
 function render(){if(!current)return;const {table,self}=current,game=engineOf(table),myColor=['w','b'].find(c=>table.seats[c]?.id===self),playing=!table.result&&table.seats.w&&table.seats.b,canMove=playing&&myColor===game.turn();
 if(myColor&&playing&&rewardGame!==table.gameId){rewardGame=table.gameId;rewardPaid=false;rewardRun=beginMinigame('chess',table.gameId);}if(myColor&&table.result&&!rewardPaid&&rewardGame===table.gameId&&(game.isCheckmate()||game.isDraw())&&table.moves.length>=4){rewardPaid=true;finishMinigame('chess',rewardRun,table.outcome?.winner===myColor);}
 $('chessHuman').hidden=!isConnected()||!solo;$('chessAI').textContent=solo?'New AI game':'Play against AI';$('chessLevel').hidden=!solo;aside.hidden=solo;layout.style.gridTemplateColumns=solo?'minmax(0,1fr)':'';play.style.maxWidth=solo?'430px':'';play.style.width='100%';play.style.margin=solo?'0 auto':'';dialog.querySelector('.chess-help').textContent=solo?'You play White against Echo AI. Private practice — no multiplayer leaderboard points. Closing the board keeps this game until you leave or reload.':'Tap a piece, then a highlighted square. Closing keeps your seat; disconnecting forfeits after 20 seconds.';
 $('chessStatus').textContent=table.result||(playing?(game.turn()==='w'?'White':'Black')+' to move'+(game.isCheck()?' · Check!':''):'Take a seat and invite a friend to play.');
 $('chessSeats').replaceChildren();for(const color of ['w','b']){const seat=table.seats[color],button=document.createElement('button');button.textContent=(color==='w'?'White':'Black')+' · '+(seat?seat.name+(seat.id===self&&!solo?' (you)':''):'Take seat');button.disabled=!!seat||!!myColor||!!table.result;button.onclick=()=>send('sit',{color});$('chessSeats').append(button);}
 const moves=selected&&canMove?game.moves({square:selected,verbose:true}):[];const board=$('chessBoard');const focused=board.contains(document.activeElement)?document.activeElement.dataset.square:null;board.replaceChildren();
 const ranks=myColor==='b'?[1,2,3,4,5,6,7,8]:[8,7,6,5,4,3,2,1],files=myColor==='b'?'hgfedcba':'abcdefgh';
 for(const rank of ranks)for(const file of files){const square=file+rank,p=game.get(square),legal=moves.some(m=>m.to===square),b=document.createElement('button');b.type='button';b.dataset.square=square;b.className='chess-square '+((file.charCodeAt(0)+rank)%2?'light':'dark')+(selected===square?' selected':'')+(legal?' legal':'');b.setAttribute('aria-label',square+(p?' '+(p.color==='w'?'white':'black')+' '+names[p.type]:' empty')+(legal?' legal move':''));b.setAttribute('aria-pressed',String(selected===square));const icon=document.createElement('span');icon.className='chess-piece '+(p?.color==='w'?'white-piece':'black-piece');icon.textContent=p?glyphs[p.color+p.type]:'';const coordinate=document.createElement('small');coordinate.textContent=square;b.append(icon,coordinate);b.onclick=()=>{if(acting)return;if(!canMove){$('chessError').textContent=!myColor?'Take an open seat to play.':!playing?'Both players must take a seat first.':'Wait for your opponent’s move.';return;}if(legal){send('move',{from:selected,to:square,promotion:$('chessPromotion').value});return;}selected=p?.color===myColor?square:null;$('chessError').textContent='';render();};board.append(b);}
 if(focused)board.querySelector(`[data-square="${focused}"]`)?.focus({preventScroll:true});
 $('chessResign').hidden=!myColor||!playing;$('chessStand').hidden=solo||!myColor;$('chessRematch').hidden=!myColor||!table.result;$('chessRematch').disabled=table.rematch.includes(self);$('chessRematch').textContent=table.rematch.includes(self)?'Waiting for opponent…':'Rematch';$('chessHistory').textContent=table.moves.map((m,i)=>(i%2===0?(i/2+1)+'. ':'')+m).join(' ')||'No moves yet.';
 }
 $('chessResign').onclick=()=>send('resign');$('chessStand').onclick=()=>send('stand');$('chessRematch').onclick=()=>send('rematch');
 // Networking must keep its cadence even when 3D rendering runs below 20 fps.
 setInterval(()=>{if(!solo&&isConnected()&&(near||dialog.open))send('state');},1000);
 if(solo)startAI();
 return {near:()=>near,open(){if(!near)return;if(!dialog.open)dialog.showModal();if(solo){if(!current)startAI();render();}else send('state');},update(dt){const state=getState();near=Math.hypot(state.x-chessSite.x,state.z-chessSite.z)<9&&Math.abs(state.y-group.position.y)<7;if(!isConnected()){if(!solo&&dialog.open)dialog.close();wasConnected=false;return;}if(!wasConnected){if(!solo)current=null;wasConnected=true;if(near&&!solo)send('state');}}};
}
