export function createMobileHUD({pause}){
 const $=id=>document.getElementById(id),nav=document.querySelector('header nav');
 const toggle=document.createElement('button');toggle.id='hudMenuBtn';toggle.textContent='Menu';toggle.setAttribute('aria-haspopup','dialog');nav.prepend(toggle);
 const dialog=document.createElement('dialog');dialog.id='hudMenu';dialog.setAttribute('aria-labelledby','hudMenuTitle');dialog.innerHTML='<button class="close" aria-label="Close game menu">×</button><small>YOUR JOURNEY</small><h2 id="hudMenuTitle">Travel kit</h2><div id="hudMenuGrid"></div><div id="hudQuestSlot"></div><div id="hudRoomSlot"></div><p class="hud-tip">Double-tap the joystick to keep walking. Touch it again to stop. Sprint toggles your pace.</p>';document.body.append(dialog);
 // A shared desktop column owns the quest panel and all spell controls.
 // Mobile keeps its existing quest relocation; its home anchor stays in this rail.
 const rail=document.createElement('section');rail.id='desktopHudRail';rail.setAttribute('aria-label','Quests and abilities');rail.append($('quest'),document.querySelector('.spell-control'));document.body.append(rail);
 const grid=$('hudMenuGrid'),buttons=['accountBtn','dogsBtn','collectionBtn','achievementsBtn','settingsBtn','helpBtn'].map($),quest=$('quest'),room=$('roomBar'),chat=$('packChat'),homes=new Map();
 for(const element of [...buttons,quest,...(room?[room]:[])]){const anchor=document.createComment('hud-home');element.before(anchor);homes.set(element,anchor);}
 const map=document.createElement('button');map.textContent='Mini-map';map.setAttribute('aria-pressed','false');map.onclick=()=>{const shown=document.body.classList.toggle('mobile-map-open');map.setAttribute('aria-pressed',String(shown));dialog.close();};grid.append(map);
 if(chat){const button=document.createElement('button');button.id='hudChatBtn';button.textContent='Pack chat';button.onclick=()=>{dialog.close();document.body.classList.add('mobile-chat-open');chat.open=true;pause();$('chatInput').focus();};grid.append(button);chat.addEventListener('toggle',()=>{if(!chat.open)document.body.classList.remove('mobile-chat-open');});new MutationObserver(()=>{button.textContent='Pack chat '+$('chatUnread').textContent;}).observe($('chatUnread'),{childList:true,characterData:true,subtree:true});}
 toggle.onclick=()=>{pause();dialog.showModal();};dialog.querySelector('.close').onclick=()=>dialog.close();
 dialog.addEventListener('click',e=>{if(buttons.includes(e.target.closest('button'))||e.target.closest('#wizardQuestBtn, #xpQuestBtn, #shopBtn, #leaderboardBtn'))dialog.close();},true);
 dialog.addEventListener('close',()=>{pause();if(!chat?.open&&!document.querySelector('dialog[open]'))$('world').focus({preventScroll:true});});
 const leftRail=document.createElement('section');leftRail.id='leftHudRail';leftRail.setAttribute('aria-label','Lobby and navigation');document.body.append(leftRail);const mini=$('miniMap'),miniHome=document.createComment('minimap-home');mini.before(miniHome);
 const dockMedia=matchMedia('(min-width:768px)');
 const media=matchMedia('(max-width:750px), (pointer:coarse) and (max-width:1100px)');
 function adapt(){const small=media.matches,docked=dockMedia.matches;map.hidden=docked;document.body.classList.toggle('hud-map-docked',docked);$('settingsBtn').textContent=small?'Settings':'⚙';$('helpBtn').textContent=small?'Help & controls':'?';document.body.classList.toggle('mobile-hud',small);if(!small&&dialog.open)dialog.close();for(const element of buttons){if(small)grid.insertBefore(element,map);else homes.get(element).after(element);}if(small){$('hudQuestSlot').append(quest);if(room&&!docked)$('hudRoomSlot').append(room);}else{homes.get(quest).after(quest);if(room&&!docked)homes.get(room).after(room);}}
 const oldAdapt=adapt;function placeNavigation(){oldAdapt();if(dockMedia.matches){if(room)leftRail.append(room);leftRail.append(mini);}else{miniHome.after(mini);if(room){if(media.matches)$('hudRoomSlot').append(room);else homes.get(room).after(room);}}}
 media.addEventListener('change',placeNavigation);dockMedia.addEventListener('change',placeNavigation);placeNavigation();
}
