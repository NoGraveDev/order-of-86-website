import * as T from 'three';
import {roomEmotes} from './room-emotes.js';
export function createRoomChat({send,camera,peers,getState}){
 const $=id=>document.getElementById(id),panel=$('packChat');if(!panel)return null;
 const log=$('chatLog'),input=$('chatInput'),bubbles=new Map();let cursor=0,unread=0,sending=false,active=false;
 panel.addEventListener('toggle',()=>{if(panel.open){unread=0;$('chatUnread').textContent='';log.scrollTop=log.scrollHeight}});
 async function submit(kind,text){if(sending||!active)return;sending=true;$('chatSend').disabled=true;$('chatError').textContent='';try{await send(kind,text);if(kind==='chat')input.value=''}catch(e){$('chatError').textContent=e.message}finally{sending=false;$('chatSend').disabled=false}}
 $('chatForm').onsubmit=e=>{e.preventDefault();if(input.value.trim())submit('chat',input.value.trim())};
 for(const [id,emote]of Object.entries(roomEmotes)){const b=document.createElement('button');b.type='button';b.textContent=emote.icon;b.title=b.ariaLabel=emote.label;b.dataset.emote=id;b.onclick=()=>submit('emote',id);$('emotePicker').append(b)}
 document.addEventListener('keydown',e=>{if(!active||document.querySelector('dialog[open]'))return;if(e.key==='Enter'&&!e.target.closest('input,textarea,button,select')){e.preventDefault();panel.open=true;input.focus()}else if(e.key==='Escape'&&panel.contains(e.target)){e.preventDefault();input.blur();panel.open=false;document.getElementById('world').focus()}});
 return {get cursor(){return cursor},setActive(value){active=value;panel.hidden=!value;if(!value){for(const b of bubbles.values())b.el.remove();bubbles.clear()}},accept(messages=[]){
 for(const m of messages){if(m.id<=cursor)continue;cursor=m.id;const row=document.createElement('p'),name=document.createElement('strong');name.textContent=(m.self?'You':m.name)+': ';row.append(name,document.createTextNode(m.kind==='emote'?(roomEmotes[m.text]?.icon+' '+roomEmotes[m.text]?.label):m.text));log.append(row);while(log.children.length>100)log.firstElementChild.remove();
 if(!panel.open&&!m.self){unread++;$('chatUnread').textContent='('+unread+')'}
 if(m.kind==='emote'&&roomEmotes[m.text]&&Date.now()-m.created<6000){const key=m.self?'self':m.sender;bubbles.get(key)?.el.remove();const el=document.createElement('div');el.className='player-emote';el.textContent=roomEmotes[m.text].icon;el.ariaLabel=m.name+' '+roomEmotes[m.text].label;document.body.append(el);bubbles.set(key,{el,until:performance.now()+4500})}
 }if(panel.open)log.scrollTop=log.scrollHeight;
 },update(){for(const [id,b]of bubbles){if(performance.now()>b.until){b.el.remove();bubbles.delete(id);continue}const p=id==='self'?getState():peers.get(id)?.target;if(!p||p.invisible){b.el.hidden=true;continue}const v=new T.Vector3(p.x,p.y+4.4,p.z).project(camera);b.el.hidden=v.z>1||v.z< -1||Math.abs(v.x)>1||Math.abs(v.y)>1;b.el.style.left=(v.x*.5+.5)*innerWidth+'px';b.el.style.top=(-v.y*.5+.5)*innerHeight+'px'}}};
}
