// Original owl sayings paired with canon facts, not quotations from the bibles.
// Sources: Master Bible sections V–VII; Worldbuilding Bible: Old Pack Way,
// Pre-Howl History (Heartwood) and First Howl Hymn.
export const owlWisdom={
 'Common Owl':[
  ['A journey does not ask you to be extraordinary. It asks you to take the next step.','The Starter Lands are the ancestral home of all dogs: green-gold meadows gathered around a single ancient oak.'],
  ['Belonging is not the same as being alike. Leave room in your circle for a different song.','The Old Packs welcomed a newborn with a Circle Howl. Each dog contributed one note; the chord was a welcome, not a spell.'],
  ['Small things can carry a great light. Do not judge a gift by the size of the paw holding it.','The Wanderer carries Palehowl’s Tear, a silver-white crystal that amplifies common magic.'],
  ['Look up before you decide the world has nothing left to show you.','Before the First Howl, the seven moons were known as the Silent Gods. Moon-Watchers kept their vigils beneath them.']
 ],
 'Great Horned Owl':[
  ['Listen long enough, and what seemed like silence will become a place full of lives.','The oldest Deepwood trees are said to hold pack-memory from before the First Howl. Collie Wardens tend them and claim to hear the Old Packs in their leaves.'],
  ['Strength need not stand alone. Even the tallest tree reaches outward with its roots.','Heartwood Spire is grown from living wood. The Wild Order’s great tower belongs to the forest rather than replacing it.'],
  ['Guard what is small before it becomes what everyone admires.','The Heartwood Seed is only acorn-sized: dark bark around a green glow, with sprouts already emerging.'],
  ['A good messenger carries another’s meaning without making it smaller.','Great Horned Owls serve as messengers and scouts around Heartwood Spire, distinguished by green-tipped feathers and horn-like tufts.']
 ],
 'Spectacled Owl':[
  ['An answer worth keeping can survive another question.','Archivum is the Violet Highlands’ intellectual capital, a fortress-city of stone and parchment with runes inscribed across its surfaces.'],
  ['Before you correct a story, learn how it reached the teller.','The First Howl Hymn lived in oral tradition for four hundred years before the first Scribepack attempted to record it in the Violet Highlands.'],
  ['Not everything understood can be translated. Listen for what the words leave out.','Urfic howl-notation records pitch, duration and breath. Some tones in the First Howl Hymn have no equivalent in spoken language.'],
  ['Books can open a door. Your own paws must still cross the threshold.','The scholarly Spectacled Owls of the Violet Citadel really do wear tiny round spectacles.']
 ],
 'Snowy Owl':[
  ['Stillness is not emptiness. Sometimes it is the careful keeping of a sound.','Frosthollow preserves echoes in its Frozen Lake and within the glacial passages of the Ice Hall.'],
  ['Ask for truth only when you are willing to meet it without a disguise.','Bernardguard guards the Truth Mirror: an oval glacial-ice frame surrounding a dark, depthless surface that shows absolute truth.'],
  ['Endurance is not refusing warmth. It is knowing when to seek shelter.','Northern Husky packs preserve old customs alongside practical magic, including bone niches and the Circle Howl for newborn pups.'],
  ['A quiet observer may see farther than a hurried traveler.','Snowy Owls are silent arctic hunters. Their pale blue eyes can see through ice.']
 ],
 'Ember Owl':[
  ['Heat can shape or destroy. The difference is where you place your care.','The Forge Hammer is obsidian black, glowing orange within, with a lava-leather handle. It is kept at Forge Spire.'],
  ['Courage does not require a witness. Choose your next act as carefully as your last.','The Crucible is a natural volcanic arena in the Ember Wastes, with an obsidian-walled circular pit and a lava floor.'],
  ['What you carry can become a gift to those who follow you.','In the Current’s cycle, a Flame Wizard’s fire returns to Emberhowl at death and is redistributed among the living Flame Wizards.'],
  ['Knowing what you can endure is wiser than pretending nothing can harm you.','Ember Owls have heat-resistant dark feathers and glowing orange eyes, allowing them to survive the extreme heat around the Forge.']
 ],
 'Barn Owl':[
  ['Gentleness is a way of approaching what fear would drive away.','Dream Spire stands in Shadowmire: a tall ivory castle with midnight-blue roofs, silver moon crests and dream-threads extending from its highest tower.'],
  ['When the path changes beneath you, stay close to those you do not wish to lose.','The Shifting Grounds of Shadowmire rearrange themselves. Buildings sink and rise among bioluminescent fungi.'],
  ['You need not be loud to make another traveler feel less alone.','Barn Owls are gentle guides of the Dream Spire, with heart-shaped faces and plumage that shifts from white to magenta.'],
  ['Do not mistake a wounded place for a place beyond caring.','The Great Rot resists magic itself. Deathforge of the Flame Order and Blotbark of the Wild Order are among its primary defenders.']
 ]
};
export const wisdomEntries=Object.entries(owlWisdom).flatMap(([owl,lessons])=>lessons.map(([wisdom,lore],index)=>({id:owl.toLowerCase().replaceAll(' ','-')+':'+index,owl,number:index+1,wisdom,lore})));
export function createOwlWisdom(storage){
 let counts={},unlocked=new Set();try{const saved=JSON.parse(storage.getItem('pawtheon-owl-journal-v1')||'{}');if(saved?.counts&&typeof saved.counts==='object'&&!Array.isArray(saved.counts))counts=saved.counts;if(Array.isArray(saved?.unlocked))unlocked=new Set(saved.unlocked.filter(id=>wisdomEntries.some(e=>e.id===id)))}catch{}
 return {get entries(){return wisdomEntries.filter(e=>unlocked.has(e.id))},next(name){const owl=Object.hasOwn(owlWisdom,name)?name:'Common Owl',entries=wisdomEntries.filter(e=>e.owl===owl);const n=Number.isSafeInteger(counts[owl])&&counts[owl]>=0?counts[owl]:0,index=n%entries.length,entry=entries[index],isNew=!unlocked.has(entry.id);counts[owl]=(index+1)%entries.length;unlocked.add(entry.id);let saved=true;try{storage.setItem('pawtheon-owl-journal-v1',JSON.stringify({counts,unlocked:[...unlocked]}))}catch{saved=false}return {...entry,total:entries.length,isNew,saved}}};
}
