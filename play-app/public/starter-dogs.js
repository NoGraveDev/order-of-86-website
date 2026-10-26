// Original content-generator starter artwork, not additional members of the Order of 86.
// Runtime geometry uses the same articulated character rig as V2's existing dogs.
const hats=[
 [1,'Yellow','Radiant','#faee3d','#ffd49d','#ffff75'],
 [2,'Orange','Flame','#d9783e','#df7ddf','#ffe655'],
 [3,'Blue','Deep','#408dc5','#68c3cb','#ffe85b'],
 [5,'Green','Wild','#9fc53e','#cec77e','#ffe85b'],
 [6,'Magenta','Dream','#bf59b7','#b58bc5','#ffe85b'],
 [8,'Purple','Arcane','#8052c5','#8694ce','#ffe85b'],
];
export const starterDogs=hats.map(([n,color,trainingOrder,hat,hatBand,buckle])=>({
 id:'starter-'+n,name:color+' Hat Starter',color,trainingOrder,
 breed:'Classic',fur:'Brown',eyes:'Sleepy Eyes',clothes:'None',order:'Starter',
 portrait:n===2?'starters/orange-hat-starter.png':'starters/starter-'+n+'.png',
 palette:{fur:'#8b6b49',muzzle:'#e9be83',hat,hatBand,buckle,iris:'#181818',
  visualBreed:'Classic',source:n===2?'starters/orange-hat-starter.png':'starters/starter-'+n+'.png'},
}));
export const starterPalettes=Object.fromEntries(starterDogs.map(d=>[d.id,d.palette]));
export const STARTER_SAVE_KEY='pawtheon-starter-look-v1';
export function findStarter(id){return starterDogs.find(d=>d.id===id)||null;}
export function savedStarter(id){return ['starter-4','starter-7'].includes(id)?starterDogs[0]:findStarter(id);}
export function readStarter(storage){try{return savedStarter(JSON.parse(storage.getItem(STARTER_SAVE_KEY)||'null'));}catch{return null;}}

export function initialStarter(storage){const saved=readStarter(storage);if(saved)return saved;try{return storage.getItem('pawtheon-dog')?null:starterDogs[0];}catch{return starterDogs[0];}}
