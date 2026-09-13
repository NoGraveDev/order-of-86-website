import {wizardProgress} from './wizard-progression.js';
export function createWizardProgressUI({source,openDialog,saveNote,getJourney,getOrder}){
 const $=id=>document.getElementById(id);let previous=null;
 // Keep transient XP below the live lobby badge, including wrapped status text.
 const roomBar=$('roomBar'),notice=$('xpNotice');
 function placeNotice(){
  const mobile=document.body.classList.contains('mobile-hud');
  const room=roomBar?.getBoundingClientRect();
  const visible=roomBar&&!roomBar.hidden&&roomBar.getClientRects().length&&!roomBar.closest('dialog');
  const top=!mobile&&visible?Math.max(80,room.bottom+12):80;
  notice.style.setProperty('--xp-notice-top',top+'px');
  notice.style.visibility=!mobile&&visible&&top+notice.offsetHeight>innerHeight-12?'hidden':'';
 }
 if(roomBar){new ResizeObserver(placeNotice).observe(roomBar);new MutationObserver(placeNotice).observe(roomBar,{attributes:true,attributeFilter:['hidden']});}
 new ResizeObserver(placeNotice).observe(notice);window.addEventListener('resize',placeNotice);placeNotice();

 function render(state){
  $('xpQuestBtn').textContent=(state.order?state.order+' '+state.orderLevel+' / 50':'Level '+state.level+' Wizard')+' · Quests';
  for(const id of ['wizardLevel','inventoryLevel','questLevel'])$(id).textContent=(state.order?state.order+' '+state.orderLevel+' / 50 · ':'')+'Wizard level '+state.level;
  for(const id of ['wizardXP','inventoryXP','questXP']){const p=$(id);p.max=state.needed;p.value=state.intoLevel;p.setAttribute('aria-label',state.maxed?'Order mastered':`${state.intoLevel} of ${state.needed} XP toward ${state.order||'Wizard'} level ${(state.orderLevel||state.level)+1}`);}
  for(const id of ['wizardXPText','inventoryXPText','questXPText'])$(id).textContent=state.maxed?'Order mastered · Choose another Order':`${state.intoLevel} / ${state.needed} XP to ${state.order||'Wizard'} level ${(state.orderLevel||state.level)+1}`;
  $('questSaveNote').textContent=saveNote();$('questTotalXP').textContent=state.xp+' total XP · '+state.completed+' / '+state.quests.length+' quests complete';
  const list=$('xpQuestList');list.replaceChildren();for(const q of [...state.quests].sort((a,b)=>Number(a.complete)-Number(b.complete))){const card=document.createElement('article');card.className='xp-quest'+(q.complete?' complete':'');card.dataset.quest=q.id;const title=document.createElement('h3'),p=document.createElement('p'),reward=document.createElement('strong'),progress=document.createElement('progress'),label=document.createElement('span');title.textContent=q.name;p.textContent=q.description;reward.textContent=q.complete?`${q.xp} XP earned`:`+${q.xp} XP bonus`;label.textContent=q.complete?'Complete':`${q.current} / ${q.target}`;progress.max=q.target;progress.value=q.current;progress.setAttribute('aria-label',q.name+' progress');card.append(title,p,reward,label,progress);list.append(card);}
 }
 function update(announce=true){const legacy=wizardProgress(source),j=getJourney?.(),o=j?.orders[getOrder()];const state=j?{...legacy,level:j.overallLevel,xp:j.totalXP,intoLevel:o.intoLevel,needed:o.needed,order:getOrder(),orderLevel:o.level,maxed:o.maxed}:legacy;if(previous?.xp===state.xp&&previous?.order===state.order&&previous?.completed===state.completed)return state;render(state);
  if(announce&&previous&&state.xp>previous.xp){const leveled=state.level>previous.level;$('xpNotice').textContent=(leveled?`Level up! Level ${state.level} Wizard · `:'')+'+'+(state.xp-previous.xp)+' '+(state.order||'')+' XP';$('xpNotice').hidden=false;clearTimeout(update.timer);update.timer=setTimeout(()=>$('xpNotice').hidden=true,4500);}
  previous=state;return state;
 }
 for(const id of ['xpQuestBtn','inventoryQuests'])$(id).onclick=()=>{update(false);$('questSaveNote').textContent=saveNote();openDialog('xpQuests');};
 update(false);return {update,get state(){return previous;}};
}
