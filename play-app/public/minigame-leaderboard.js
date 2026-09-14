import {account,accountAPI,recordStorage} from './account-state.js';
const games=[['chess','Chess','Server results'],['boat','Boat Race · Multiplayer','Server results · fastest finishes'],['lava','Floor Is Lava','Server results · wins'],['sled','Howl Run','Saved times · player-reported'],['boatSolo','Boat Race · Solo','Saved times · player-reported'],['maze9','Golden Labyrinth · 9 × 9','Saved times · player-reported'],['maze13','Golden Labyrinth · 13 × 13','Saved times · player-reported']];
let data=null,owner=null,selected='chess';
const time=v=>typeof v==='number'&&Number.isFinite(v)?v.toFixed(2)+'s':'—';
const $=id=>document.getElementById(id);
function element(tag,text){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;}
function card(id,title){const article=element('article');article.className='minigame-card';article.append(element('h3',title));const body=element('div');body.id=id;article.append(body);return article;}
export function ensureMinigamePanels(){
 const panel=$('inventory-panel-minigames');if(!panel||$('minigameLeaderboard'))return;
 panel.insertBefore(card('inventoryBoatRecord','Boat Race · Tide Run'),$('inventoryMinigameStatus'));
 panel.insertBefore(card('inventoryLavaRecord','Floor Is Lava · The Crucible'),$('inventoryMinigameStatus'));
 const board=card('minigameLeaderboard','Mini-game leaderboards'),body=board.lastElementChild;
 const label=element('label','Choose a game '),select=element('select');select.id='minigameLeaderboardGame';select.setAttribute('aria-label','Leaderboard game');select.style.maxWidth='100%';
 for(const [value,title]of games){const option=element('option',title);option.value=value;select.append(option);}select.onchange=()=>{selected=select.value;renderBoard();};label.append(select);body.append(label);
 for(const [tag,id]of [['p','minigameLeaderboardType'],['ol','minigameLeaderboardRows'],['p','minigameLeaderboardNote']]){const node=element(tag);node.id=id;body.append(node);}panel.insertBefore(board,$('inventoryMinigameStatus'));
 if(owner!==account.user?.id){owner=account.user?.id;data=null;try{data=JSON.parse(recordStorage.getItem('paw-minigame-server-cache-v1')||'null');}catch{}}
 renderBoard();
}
function stats(target,pairs){const grid=element('div');grid.className='minigame-stats';for(const [value,label]of pairs){const node=element('div');node.append(element('strong',String(value)),element('span',label));grid.append(node);}target.append(grid);}
function serverHistory(target,game){const record=data?.verified?.[game];if(!record)return;const details=element('details');details.append(element('summary','Recent multiplayer results'));const list=element('ol');for(const r of record.recent){const text=new Date(r.finished).toLocaleDateString()+' · '+(game==='boat'?time(r.time):r.won?'Win':r.drawn?'Draw':'Completed round');list.append(element('li',text));}if(!list.children.length)list.append(element('li','No recorded finishes yet.'));details.append(list);target.append(details);}
export function renderMinigamePanels(records){ensureMinigamePanels();if(!$('inventoryBoatRecord'))return;const boat=$('inventoryBoatRecord'),lava=$('inventoryLavaRecord');boat.replaceChildren();lava.replaceChildren();
 const solo=records.boat,br=data?.verified?.boat,lr=data?.verified?.lava;
 boat.append(element('h4','Solo · personal saved times'));stats(boat,[[solo.count,'Recorded finishes'],[time(solo.bestTime),'Personal best']]);boat.append(element('p','Your earlier solo best is retained. Finish history starts with this update.'));
 const history=element('details');history.append(element('summary','Recent solo finishes'));const list=element('ol');for(const r of solo.recent)list.append(element('li',new Date(r.finished).toLocaleDateString()+' · '+time(r.time)+' · '+time(r.penalty)+' penalties'));if(!list.children.length)list.append(element('li','Finish a solo race to start your history.'));history.append(list);boat.append(history);
 boat.append(element('h4','Multiplayer · server results'));stats(boat,[[br?.games??'—','Finishes'],[time(br?.bestTime),'Fastest finish'],[br?.wins??'—','Wins'],[br?.draws??'—','Ties']]);serverHistory(boat,'boat');
 stats(lava,[[lr?.games??'—','Completed rounds'],[lr?.wins??'—','Wins'],[lr?.draws??'—','Draws'],[lr?.losses??'—','Other finishes']]);serverHistory(lava,'lava');
 lava.append(element('p',data?.coverage||'Refresh records to load your multiplayer results. Boat and Floor Is Lava history begins with this update; older room results were not retained.'));
 renderBoard();return {boat:br?.games||0,lava:lr?.games||0};
}
function renderBoard(){if(!$('minigameLeaderboardRows'))return;const [,,kind]=games.find(g=>g[0]===selected);$('minigameLeaderboardType').textContent=kind;
 const rows=selected==='chess'?data?.chess?.leaders:data?.leaders?.[selected]||data?.savedLeaders?.[selected];const list=$('minigameLeaderboardRows');list.replaceChildren();
 if(!rows?.length)list.append(element('li',data?'No ranked finishes yet. Be the first!':'Refresh records to load rankings.'));
 else for(const r of rows){const score=['sled','boatSolo','maze9','maze13'].includes(selected)?time(r.time):selected==='boat'?time(r.bestTime)+' · '+r.wins+' wins':r.wins+' wins · '+r.games+' games';list.append(element('li',r.name+(r.self?' (you)':'')+' · '+score));}
 $('minigameLeaderboardNote').textContent=['sled','boatSolo','maze9','maze13'].includes(selected)?'Player-reported times from account saves, not server-verified. Maze layouts vary. Rankings grant no XP or rewards.':'Completed multiplayer results recorded by the game server. Leaving early does not count as a finish. Rankings grant no extra XP or rewards.'+(selected==='chess'?' Historical chess profiles are retained.':'');
}
export async function refreshMinigameLeaderboard(){const next=await accountAPI('minigame-records');data=next;try{recordStorage.setItem('paw-minigame-server-cache-v1',JSON.stringify(next));}catch{}renderBoard();return next;}

export function multiplayerRecordCounts(){return {boat:data?.verified?.boat?.games||0,lava:data?.verified?.lava?.games||0};}
