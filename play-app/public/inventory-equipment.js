import {shopItems} from './moon-shop-core.js';
import {account} from './account-state.js';

export function initInventoryEquipment({getShop,onFilter}) {
 const $=id=>document.getElementById(id),rows=new Map();let busy=false;
 const name=id=>shopItems.find(item=>item.id===id)?.name||'None';
 async function act(body){if(busy)return;busy=true;$('inventoryEquipmentStatus').textContent='Saving equipment…';refresh();try{const ok=await getShop().run(body);$('inventoryEquipmentStatus').textContent=ok?'Equipment saved.':$('shopError').textContent||'Equipment could not be changed. Try again.';}catch{$('inventoryEquipmentStatus').textContent='Equipment could not be saved. Try again.';}finally{busy=false;refresh();}}
 for(const item of shopItems){
  const card=document.createElement('article');card.className='inventory-item inventory-gear';card.dataset.item=item.id;
  const img=document.createElement('img');img.src='/play/equipment/'+item.id+(['pipe','cloak'].includes(item.id)?'.svg':'.png');img.alt=item.name;img.loading='lazy';img.width=160;img.height=160;
  const title=document.createElement('h3');title.textContent=item.name;const description=document.createElement('p');description.textContent=item.description;const status=document.createElement('p');status.className='inventory-gear-state';
  const actions=document.createElement('div');actions.className='inventory-gear-actions';const equip=document.createElement('button'),stow=document.createElement('button');equip.dataset.inventoryEquip=item.id;stow.dataset.inventoryStow=item.id;
  equip.onclick=()=>act({operation:getShop().state.equipped===item.id?'unequip':'equip',item:item.id});stow.onclick=()=>act({operation:getShop().state.secondary===item.id?'unstow':'stow',item:item.id});
  actions.append(equip,stow);card.append(img,title,status,description,actions);$('inventoryEquipmentList').append(card);rows.set(item.id,{card,status,equip,stow});
 }
 function refresh(){const state=getShop().state;if(!state)return;const locked=busy||account.blocked;$('inventoryLoadout').textContent='Active: '+name(state.equipped)+' · Second: '+name(state.secondary);$('inventorySwap').disabled=locked||!state.secondary;
  for(const item of shopItems){const {card,status,equip,stow}=rows.get(item.id),level=state.owned[item.id]||0,active=state.equipped===item.id,second=state.secondary===item.id;card.dataset.owned=String(level);card.classList.toggle('is-equipped',active);status.textContent=level?'Tier '+level+' · '+(active?'Active':second?'Carried as second':'Owned'):'Not owned · Available at Moon Market';equip.textContent=active?'Unequip':'Equip';equip.hidden=!level;equip.disabled=locked;stow.textContent=second?'Remove second item':'Carry as second';stow.hidden=!level||active;stow.disabled=locked;}
  onFilter();
 }
 $('inventorySwap').onclick=()=>{const state=getShop().state;void act({operation:'swap',expectedEquipped:state.equipped,expectedSecondary:state.secondary||null});};
 globalThis.addEventListener('paw-equipment',refresh);new MutationObserver(()=>{if($('collection').open){$('inventoryEquipmentStatus').textContent='';refresh();}}).observe($('collection'),{attributes:true,attributeFilter:['open']});refresh();
}
