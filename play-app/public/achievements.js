export const badges=[
 ['first-place','First Steps','Listen at your first landmark.','places',1,'Exploration'],
 ['ten-places','Trail Reader','Discover 10 landmarks.','places',10,'Exploration'],
 ['all-places','Keeper of the Map','Discover all 29 landmarks.','places',29,'Exploration'],
 ['all-realms','Seven Realms, One World','Visit all seven realms and the Starter Lands.','realms',8,'Exploration'],
 ['first-friend','A New Packmate','Speak to your first wizard.','wizards',1,'The Pack'],
 ['twenty-friends','A Growing Pack','Speak to 20 different wizards.','wizards',20,'The Pack'],
 ['all-friends','The Order of 86','Speak to every wizard.','wizards',86,'The Pack'],
 ['first-lizard','Little Companion','Collect your first Crystal Lizard.','lizards',1,'Collection'],
 ['lizard-types','Prismatic Keeper','Collect all nine lizard varieties.','lizardTypes',9,'Collection'],
 ['all-lizards','Lizard Sanctuary','Collect all 36 Crystal Lizards.','lizards',36,'Collection'],
 ['first-shard','Borrowed Moonlight','Collect your first Moon Shard.','shards',1,'Collection'],
 ['moon-types','Seven Tones','Collect a shard from each moon.','moonTypes',7,'Collection'],
 ['all-shards','Lunar Treasury','Collect all 21 Moon Shards.','shards',21,'Collection'],
 ['first-owl','A Quiet Guide','Ask a Wisdom Owl for guidance.','owls',1,'Discovery'],
 ['all-owls','Wisdom of the Realms','Ask all six Wisdom Owls for guidance.','owls',6,'Discovery'],
 ['first-build','Make Yourself at Home','Place a workshop object.','builds',1,'Craft & Magic'],
 ['build-types','Realm Architect','Place 10 different workshop object types.','builds',10,'Craft & Magic'],
 ['first-spell','Touch the Current','Successfully cast an Order spell.','spells',1,'Craft & Magic'],
 ['all-spells','Many Ways to Howl','Cast spells from all six Orders and the Wanderer.','spells',7,'Craft & Magic'],
 ['flight','Skyward Goldforge','Take flight as Goldforge, dog #8667.','flights',1,'Craft & Magic']
].map(([id,name,description,metric,target,category])=>({id,name,description,metric,target,category}));
export function createAchievements(storage){let saved={};try{saved=JSON.parse(storage.getItem('pawtheon-achievements-v1')||'{}')||{}}catch{}const valid=new Set(badges.map(b=>b.id));const earned=new Set(Array.isArray(saved.earned)?saved.earned.filter(id=>valid.has(id)):[]),events={};for(const k of ['realms','owls','builds','spells','flights'])events[k]=new Set(Array.isArray(saved[k])?saved[k].filter(v=>typeof v==='string').slice(0,100):[]);
 let metrics={};let sessionOnly=false;function save(){try{storage.setItem('pawtheon-achievements-v1',JSON.stringify({earned:[...earned],...Object.fromEntries(Object.entries(events).map(([k,v])=>[k,[...v]]))}));sessionOnly=false}catch{sessionOnly=true}}
 return {earned,events,get sessionOnly(){return sessionOnly},record(key,value){if(!events[key]||events[key].has(String(value)))return;events[key].add(String(value));save()},evaluate(current){metrics={...current,...Object.fromEntries(Object.entries(events).map(([k,v])=>[k,v.size]))};const unlocked=badges.filter(b=>!earned.has(b.id)&&(metrics[b.metric]||0)>=b.target);for(const b of unlocked)earned.add(b.id);if(unlocked.length)save();return unlocked},progress(b){return Math.min(b.target,Math.max(0,metrics[b.metric]||0))}};
}

export const badgeReward=badge=>badge.target===1?50:badge.target<10?100:badge.target<29?150:250;
