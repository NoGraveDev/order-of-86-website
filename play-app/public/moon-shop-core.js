import {badges,badgeReward} from './achievements.js';
import {readRewards,applyMinigameReward} from './minigame-rewards-core.js';
import {extraShopItems,extraGearModifiers} from './extra-shop-items.js';
import {readGather,applyGather,extraPickups,lizardInventory} from './gather-core.js';
import {readTradeWallet,tradeDelta} from './trade-wallet.js';
import {readWiggle,applyWiggle} from './wiggle-core.js';
import {readOrders,orderJourney,applyOrderAction} from './order-progression.js';
import {readSpellbook,spellbookView,applySpellAction} from './spellbook-core.js';
import {wizardProgress,levelFloor} from './wizard-progression.js';
export const SHOP_KEY='pawtheon-moon-shop-v1',SHARD_KEY='pawtheon-shards-v1';
export const shopItems=[...extraShopItems,
 {id:'pipe',name:'Wizard Pipe',kind:'Wiggy Leaf ritual',description:'A carved walnut pipe with a brass bowl. Allows you to use Wiggy Leaf from your inventory to recharge equipped spells. One leaf per use; 60 second cooldown.',costs:[6],bonuses:[1],effect:'leaf'},
 {id:'cloak',name:'Invisibility Cloak',kind:'Legendary concealment',description:'Vanish from other players, name tags and maps. Activate with R; 45 second recharge. Replaces your held focus while equipped.',costs:[12,8,10],bonuses:[10,15,20],effect:'invisibility'},
 {id:'wand',name:'Magic Wand',kind:'Quick casting',description:'A slim moonlit focus that shortens the recharge after each spell.',costs:[3,2,3],bonuses:[10,20,30],effect:'cooldown'},
 {id:'staff',name:'Wizard’s Staff',kind:'Lasting magic',description:'A crystal-tipped staff that makes spell trails, gardens and reveals last longer.',costs:[4,3,4],bonuses:[25,50,75],effect:'duration'}
];
export const emptyShop=()=>({version:1,owned:{wand:0,staff:0},equipped:null});
export function readShop(raw){if(raw===null||raw===undefined)return emptyShop();let s;try{s=typeof raw==='string'?JSON.parse(raw):raw;}catch{throw Error('Invalid shop save.');}
 if(!s||s.version!==1||!s.owned||Object.keys(s).some(k=>!['version','owned','equipped','secondary','badgeClaims','rewards','economy','spellbook','orders','wiggle','trade','gather'].includes(k))||Object.keys(s.owned).some(k=>!shopItems.some(p=>p.id===k&&Number.isInteger(s.owned[k])&&s.owned[k]>=0&&s.owned[k]<=p.costs.length))||!['wand','staff'].every(k=>Number.isInteger(s.owned[k])&&s.owned[k]>=0&&s.owned[k]<=3)||!(s.equipped===null||shopItems.some(p=>p.id===s.equipped)&&s.owned[s.equipped]>0))throw Error('Invalid shop save.');
 if(s.owned.cloak!==undefined&&(!Number.isInteger(s.owned.cloak)||s.owned.cloak<0||s.owned.cloak>3))throw Error('Invalid cloak tier.');
 if(s.owned.pipe!==undefined&&(!Number.isInteger(s.owned.pipe)||s.owned.pipe<0||s.owned.pipe>1))throw Error('Invalid pipe ownership.');
 if(s.secondary!==undefined&&s.secondary!==null&&(!shopItems.some(i=>i.id===s.secondary)||!s.owned[s.secondary]||s.secondary===s.equipped))throw Error('Invalid second equipment item.');
 if(s.badgeClaims!==undefined&&(!Array.isArray(s.badgeClaims)||s.badgeClaims.length>badges.length||new Set(s.badgeClaims).size!==s.badgeClaims.length||s.badgeClaims.some(id=>!badges.some(b=>b.id===id))))throw Error('Invalid claimed badges.');
 const trade=readTradeWallet(s.trade);
 const out={version:1,owned:{wand:s.owned.wand,staff:s.owned.staff},equipped:s.equipped};if(s.secondary!==undefined)out.secondary=s.secondary;if(s.badgeClaims!==undefined)out.badgeClaims=[...s.badgeClaims];if(s.rewards!==undefined)out.rewards=readRewards(s.rewards);if(s.owned.cloak!==undefined)out.owned.cloak=s.owned.cloak;if(s.owned.pipe!==undefined)out.owned.pipe=s.owned.pipe;for(const item of extraShopItems)if(s.owned[item.id]!==undefined)out.owned[item.id]=s.owned[item.id];if(s.trade!==undefined)out.trade=trade;if(s.gather!==undefined)out.gather=readGather(s.gather);if(s.wiggle!==undefined)out.wiggle=readWiggle(s.wiggle,tradeDelta(trade,'Leaves'));if(s.economy!==undefined)out.economy=readEconomy(s.economy,tradeDelta(trade,'Scales')+extraPickups(s.gather,'scales')*5);if(s.spellbook!==undefined)out.spellbook=readSpellbook(s.spellbook);if(s.orders!==undefined)out.orders=readOrders(s.orders);return out;
}
export function earnedShards(raw){try{const a=typeof raw==='string'?JSON.parse(raw):raw;return Array.isArray(a)?new Set(a.filter(id=>typeof id==='string'&&/^moon-[0-6]-[0-2]$/.test(id))).size:0;}catch{return 0;}}
export function spentShards(shop){return shopItems.reduce((sum,item)=>sum+item.costs.slice(0,shop.owned[item.id]||0).reduce((a,b)=>a+b,0),0);}
export function shopView(save){const shop=readShop(save[SHOP_KEY]);spellbookView(save,shop.spellbook);const journey=orderJourney(save,shop.orders);readEconomy(shop.economy,tradeDelta(shop.trade,'Scales')+extraPickups(shop.gather,'scales')*5);readWiggle(shop.wiggle,tradeDelta(shop.trade,'Leaves'));const earned=earnedShards(save[SHARD_KEY])+(shop.economy?.exchanges||0)+tradeDelta(shop.trade,'Shards')+extraPickups(shop.gather,'shards'),spent=spentShards(shop)+(shop.trade?.sentGearCost||0)-(shop.trade?.receivedGearCost||0);if(shop.economy?.chests.some(n=>n>journey.overallLevel))throw Error('Invalid level chest.');if(spent<0||spent>earned)throw Error('Invalid shop balance.');const lizards=lizardInventory(save,shop);if(Object.values(lizards).some(n=>n<0))throw Error('Invalid lizard inventory.');return {...shop,lizards,earned,spent,balance:earned-spent,scales:scaleBalance(shop.economy)+tradeDelta(shop.trade,'Scales')+extraPickups(shop.gather,'scales')*5,leaves:(shop.wiggle?.harvests||0)*3-(shop.wiggle?.used||0)+tradeDelta(shop.trade,'Leaves')};}
export function applyShopAction(save,body){
 const {operation,item,expectedLevel,id,level}=body;
 const view=shopView(save),s=readShop(save[SHOP_KEY]);
 if(operation==='badge-claim'){const badge=badges.find(b=>b.id===body.id),earned=JSON.parse(save['pawtheon-achievements-v1']||'{}').earned||[];if(!badge||!earned.includes(badge.id))throw Error('Earn this badge before claiming its reward.');if(s.badgeClaims?.includes(badge.id))throw Error('This badge reward was already claimed.');const journey=orderJourney(save,s.orders),r=journey.record,orders=Object.keys(r.collectionXP),order=orders.includes(journey.active)?journey.active:'Flame';r.activityXP??=Object.fromEntries(orders.map(o=>[o,0]));r.activityXP[order]=Math.min(levelFloor(50),r.activityXP[order]+badgeReward(badge));s.orders=r;s.badgeClaims=[...(s.badgeClaims||[]),badge.id];return {...save,[SHOP_KEY]:JSON.stringify(s)};}
 if(operation?.startsWith('minigame-')){applyMinigameReward(save,s,body);return {...save,[SHOP_KEY]:JSON.stringify(s)};}
 if(operation==='gather'){const out=applyGather({...save},s,body);return {...out,[SHOP_KEY]:JSON.stringify(s)};}
 if(operation?.startsWith('wiggle-')){s.wiggle=applyWiggle(s,body);return {...save,[SHOP_KEY]:JSON.stringify(s)};}
 if(operation?.startsWith('order-')){s.orders=applyOrderAction(save,s.orders,body);return {...save,[SHOP_KEY]:JSON.stringify(s)};}
 if(operation?.startsWith('spell-')){s.spellbook=applySpellAction(save,s.spellbook,{operation,item,expectedLevel});return {...save,[SHOP_KEY]:JSON.stringify(s)};}
 if(['collect-scale','exchange','chest'].includes(operation)){const e=readEconomy(s.economy,tradeDelta(s.trade,'Scales')+extraPickups(s.gather,'scales')*5);if(operation==='collect-scale'){if(!/^scale-(?:[0-9]|[1-9][0-9]|1[01][0-9])$/.test(id)||e.collected.includes(id))throw Error('Scale already collected or unknown.');e.collected.push(id);}else if(operation==='exchange'){if(scaleBalance(e)+tradeDelta(s.trade,'Scales')+extraPickups(s.gather,'scales')*5<20)throw Error('You need 20 scales to trade.');e.exchanges++;}else{if(!Number.isInteger(level)||level<2||level>orderJourney(save,s.orders).overallLevel||e.chests.includes(level))throw Error('This level chest is not available.');e.chests.push(level);}s.economy=e;return {...save,[SHOP_KEY]:JSON.stringify(s)};}
 const equipPrimary=item=>{if(s.equipped!==item){const old=s.equipped;if(s.secondary===item)s.secondary=old;else if(!s.secondary&&old)s.secondary=old;s.equipped=item;}};
 if(operation==='swap'){if(body.expectedEquipped!==s.equipped||body.expectedSecondary!==(s.secondary||null))throw Error('Your carried items changed. Try swapping again.');if(!s.secondary)throw Error('Carry a second item before swapping.');[s.equipped,s.secondary]=[s.secondary,s.equipped];}
 else if(operation==='stow'){if(!shopItems.some(i=>i.id===item)||!s.owned[item]||s.equipped===item)throw Error('Choose a different owned item for your second slot.');s.secondary=item;}
 else if(operation==='unstow')s.secondary=null;
 else if(operation==='unequip')s.equipped=null;
 else{const product=shopItems.find(p=>p.id===item);if(!product)throw Error('Unknown shop item.');const level=s.owned[item]||0;
  if(operation==='equip'){if(!level)throw Error('Buy this item before equipping it.');equipPrimary(item);}
  else if(operation==='purchase'){
   if(expectedLevel!==level)throw Error('This item changed. Reopen the shop before buying.');if(level===product.costs.length)throw Error('This item is already fully upgraded.');const cost=product.costs[level];if(view.balance<cost)throw Error(`You need ${cost-view.balance} more Moon Shard${cost-view.balance===1?'':'s'}.`);
   s.owned[item]=level+1;equipPrimary(item);
  }else throw Error('Unknown shop action.');
 }
 return {...save,[SHOP_KEY]:JSON.stringify(s)};
}
export function gearOf(shop){return shop.equipped?{item:shop.equipped,level:shop.owned[shop.equipped]}:null;}
export function secondaryGearOf(shop){return shop.secondary?{item:shop.secondary,level:shop.owned[shop.secondary]}:null;}
export function gearModifiers(gear,order){const level=Number.isInteger(gear?.level)?Math.max(0,Math.min(3,gear.level)):0;const extra=extraGearModifiers(gear,order);return {...extra,cooldown:gear?.item==='wand'?1-level*.1:extra.cooldown,duration:gear?.item==='staff'?1+level*.25:extra.duration};}
// Account records survive old-client saves and conflict resolution. Spending is
// handled only by the shop endpoint, never by a general save-counter update.
export function preserveAccountShop(current,incoming){const out={...incoming};if(current[SHOP_KEY]){
 if(incoming[SHOP_KEY]&&JSON.stringify(readShop(incoming[SHOP_KEY]))!==JSON.stringify(readShop(current[SHOP_KEY])))throw Error('Invalid shop change: use the shop.');
 out[SHOP_KEY]=current[SHOP_KEY];out[SHARD_KEY]=JSON.stringify([...new Set([...JSON.parse(current[SHARD_KEY]||'[]'),...JSON.parse(incoming[SHARD_KEY]||'[]')])]);
 }else if(incoming[SHOP_KEY]&&(spentShards(readShop(incoming[SHOP_KEY]))||readShop(incoming[SHOP_KEY]).economy||readShop(incoming[SHOP_KEY]).spellbook||readShop(incoming[SHOP_KEY]).orders||readShop(incoming[SHOP_KEY]).wiggle||readShop(incoming[SHOP_KEY]).trade||readShop(incoming[SHOP_KEY]).gather||readShop(incoming[SHOP_KEY]).rewards||readShop(incoming[SHOP_KEY]).badgeClaims?.length))throw Error('Invalid shop change: use the shop.');return out;}
export function mergeShopImport(current,guest,merged){
 if(readShop(guest[SHOP_KEY]).trade)throw Error('Trade balances cannot be imported from a guest save.');
 // Existing account equipment wins; otherwise carry over the guest purchases.
 const existing=readShop(current[SHOP_KEY]);const hasProgress=!!existing.badgeClaims?.length||!!existing.rewards||!!existing.gather||!!existing.trade||!!existing.wiggle?.harvests||spentShards(existing)>0||(existing.economy&&(existing.economy.collected.length||existing.economy.chests.length||existing.economy.exchanges))||Object.values(existing.spellbook?.owned||{}).some(n=>n>0)||(existing.orders&&(existing.orders.creditedXP>0||Object.values(existing.orders.contracts).some(c=>c.completed||c.step)||Object.keys(existing.orders.upgrades).length));const raw=hasProgress?current[SHOP_KEY]:(guest[SHOP_KEY]??current[SHOP_KEY]);if(raw)merged[SHOP_KEY]=JSON.stringify(readShop(raw));shopView(merged);return merged;
}

export const chestReward=level=>[15,25,40,20,50][(level-2)%5];
export function readEconomy(raw,transferred=0){const e=raw??{collected:[],chests:[],exchanges:0};if(!e||Object.keys(e).some(k=>!['collected','chests','exchanges'].includes(k))||!Array.isArray(e.collected)||e.collected.length>120||e.collected.some(id=>!/^scale-(?:[0-9]|[1-9][0-9]|1[01][0-9])$/.test(id))||new Set(e.collected).size!==e.collected.length||!Array.isArray(e.chests)||e.chests.length>294||e.chests.some(n=>!Number.isInteger(n)||n<2||n>295)||new Set(e.chests).size!==e.chests.length||!Number.isInteger(e.exchanges)||e.exchanges<0)throw Error('Invalid scale wallet.');const out={collected:[...e.collected],chests:[...e.chests],exchanges:e.exchanges};if(scaleBalance(out)+transferred<0)throw Error('Invalid scale balance.');return out;}
export function scaleBalance(e){return e?e.collected.length*5+e.chests.reduce((s,n)=>s+chestReward(n),0)-e.exchanges*20:0;}
