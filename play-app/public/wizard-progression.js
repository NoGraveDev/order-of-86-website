import {readGather,extraPickups} from './gather-core.js';
import {realms} from './world-data.js';
import {places} from './geography.js';
import {wizards} from './wizards.js';
// XP is derived from unique saved accomplishments, never a client-supplied total.
// Importing, reloading, changing dogs or revisiting an objective cannot pay twice.
const lizardIds=['common','moss','script','frost','magma','prism','ghost','purr','rot'].flatMap(t=>[0,1,2,3].map(i=>`${t}-${i}`));
const fields=[
 {key:'pawtheon-lizards-v1',metric:'lizards',xp:25,ids:new Set(lizardIds)},
 {key:'pawtheon-shards-v1',metric:'shards',xp:20,ids:new Set(Array.from({length:7},(_,t)=>[0,1,2].map(i=>`moon-${t}-${i}`)).flat())},
 {key:'pawtheon-discovered',metric:'places',xp:15,ids:new Set([...realms,...places].map(p=>p.id))},
 {key:'pawtheon-met-wizards-v1',metric:'wizards',xp:10,ids:new Set(wizards.map(w=>w.id))}
];
export const wizardQuests=[
 ['first-lizard','A little companion','Collect your first Crystal Lizard.','lizards',1,50],
 ['five-lizards','Growing sanctuary','Collect 5 different Crystal Lizards.','lizards',5,100],
 ['fifteen-lizards','Crystal trail','Collect 15 different Crystal Lizards.','lizards',15,150],
 ['nine-varieties','Every crystal color','Collect all 9 Crystal Lizard varieties.','lizardTypes',9,200],
 ['all-lizards','A sanctuary for all','Collect all 36 Crystal Lizards.','lizards',36,350],
 ['three-shards','Pieces of moonlight','Collect 3 different Moon Shards.','shards',3,75],
 ['all-shards','Gather the moons','Collect all 21 Moon Shards.','shards',21,250],
 ['five-places','Read the world','Listen at 5 different landmarks.','places',5,75],
 ['fifteen-places','Beyond the familiar','Listen at 15 different landmarks.','places',15,150],
 ['five-wizards','Find your pack','Meet 5 different wizards.','wizards',5,75],
 ['twenty-wizards','A circle of friends','Meet 20 different wizards.','wizards',20,150],
 ['all-wizards','One pack, 86 stories','Meet all 86 wizards.','wizards',86,350]
].map(([id,name,description,metric,target,xp])=>({id,name,description,metric,target,xp}));
export function levelFloor(level){const n=Math.max(0,Math.floor(level)-1);return 100*n+25*n*(n-1);}
export function levelFromXP(xp){xp=Number.isFinite(xp)?Math.max(0,Math.floor(xp)):0;const level=1+Math.floor((-75+Math.sqrt(5625+100*xp))/50);return {level,xp,intoLevel:xp-levelFloor(level),needed:100+50*(level-1),nextLevelXP:levelFloor(level+1)};}
export function wizardProgress(source){
 const get=typeof source?.getItem==='function'?k=>source.getItem(k):k=>source?.[k];let xp=0;const metrics={};
 for(const f of fields){let values=[];try{const parsed=JSON.parse(get(f.key)||'[]');if(Array.isArray(parsed))values=[...new Set(parsed.filter(id=>f.ids.has(id)))];}catch{}
  metrics[f.metric]=values.length;xp+=values.length*f.xp;if(f.metric==='lizards')metrics.lizardTypes=new Set(values.map(id=>id.split('-')[0])).size;
 }
 let scalePickups=0;try{const shop=JSON.parse(get('pawtheon-moon-shop-v1')||'{}');scalePickups=(shop.economy?.collected?.length||0)+extraPickups(readGather(shop.gather),'scales');}catch{}metrics.scales=scalePickups;xp+=scalePickups*10;
 const quests=wizardQuests.map(q=>({...q,current:Math.min(q.target,metrics[q.metric]||0),complete:(metrics[q.metric]||0)>=q.target}));
 xp+=quests.filter(q=>q.complete).reduce((n,q)=>n+q.xp,0);
 return {...levelFromXP(xp),metrics,quests,completed:quests.filter(q=>q.complete).length};
}
