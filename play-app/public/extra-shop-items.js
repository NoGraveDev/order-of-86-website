import {orderShopItems} from './order-shop-items.js';
export const extraShopItems=[...orderShopItems,
 {id:'trail-cane',name:'Trailwalker Cane',kind:'Travel tool',description:'Walk and sprint 15% faster while equipped. Does not affect flight or minigames.',costs:[3],bonuses:[15],effect:'travel',benefit:'15% faster walking and sprinting',mount:'hand'},
 {id:'cloud-baton',name:'Cloudstep Baton',kind:'Leaping focus',description:'Jump 25% higher while exploring. Does not affect flight or minigames.',costs:[3],bonuses:[25],effect:'jump',benefit:'25% higher exploration jumps',mount:'hand'},
 {id:'moon-ring',name:'Moonstone Ring',kind:'Casting focus',description:'A silver moonstone ring that reduces every Order spell cooldown by 15%.',costs:[4],bonuses:[15],effect:'quick',benefit:'15% shorter Order spell cooldowns',mount:'hand'},
 {id:'sun-mantle',name:'Sunwoven Mantle',kind:'Lasting enchantment',description:'Makes spell lights, trails, reveals and gatherings last 35% longer. Water walking is unchanged.',costs:[5],bonuses:[35],effect:'lasting',benefit:'35% longer spell effects',mount:'body'},
 {id:'survey-compass',name:'Surveyor’s Compass',kind:'Exploration tool',description:'Increases discovery-reveal and survey-trail spell range by 30%. Does not extend teleportation.',costs:[5],bonuses:[30],effect:'survey',benefit:'30% more reveal and trail range',mount:'hand'},
 {id:'lizard-whistle',name:'Lizardcall Whistle',kind:'Wild magic tool',description:'Living Grove and Sanctuary Call attract Crystal Lizards from 40% farther away.',costs:[4],bonuses:[40],effect:'lure',benefit:'40% larger lizard-luring radius',mount:'hand'},
 {id:'ember-lantern',name:'Ember Lantern',kind:'Pathfinder’s light',description:'Carries a warm light while equipped and sends Measured Flame 25% farther.',costs:[3],bonuses:[25],effect:'lantern',benefit:'Portable light · 25% farther Measured Flame',mount:'hand'},
 {id:'tide-pendant',name:'Tideglass Pendant',kind:'Water enchantment',description:'Safe Passage and Sevenfold Journey let you walk on river water 35% longer. Does not grant water walking by itself.',costs:[5],bonuses:[35],effect:'water',benefit:'35% longer water-walking spells',mount:'body'},
 {id:'dream-catcher',name:'Dreamcatcher Focus',kind:'Dream enchantment',description:'Dream Threads, Dream Compass and Still World last 45% longer.',costs:[6],bonuses:[45],effect:'dream',benefit:'45% longer Dream Order effects',mount:'hand'},
 {id:'star-scepter',name:'Starfall Scepter',kind:'Masterwork focus',description:'Combines 20% shorter Order spell cooldowns with 30% longer lights, trails, reveals and gatherings.',costs:[11],bonuses:[30],effect:'star',benefit:'20% shorter cooldowns · 30% longer effects',mount:'hand'}
];
export function extraGearModifiers(gear,order){
 const id=gear?.level===1?gear.item:null,focus=orderShopItems.find(i=>i.id===id&&i.order===order&&i.order);
 return {cooldown:focus?.75:id==='moon-ring'?.85:id==='star-scepter'?.8:1,
 duration:id==='sun-mantle'?1.35:id==='star-scepter'?1.3:id==='dream-catcher'&&order==='Dream'?1.45:1,
 travel:id==='trail-cane'?1.15:id==='windrunner-charm'?1.1:1,
 jump:id==='cloud-baton'?Math.sqrt(1.25):id==='windrunner-charm'?Math.sqrt(1.2):1,
 range:id==='survey-compass'?1.3:1,lure:id==='lizard-whistle'?1.4:1,flame:id==='ember-lantern'?1.25:1,water:id==='tide-pendant'?1.35:1,
 blink:id==='rift-key'?1.35:1,still:id==='still-hourglass'?1.4:1,lureDuration:id==='harvest-crook'?1.6:1};
}
