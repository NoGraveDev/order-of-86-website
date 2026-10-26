import {realms} from './world-data.js';
export const abyssAngle=realms.find(r=>r.id==='abyss').angle;
export const abyssPoint=(u,r)=>({x:Math.cos(abyssAngle)*u+Math.sin(abyssAngle)*r,z:Math.sin(abyssAngle)*u-Math.cos(abyssAngle)*r});
export const abyssLocal=(x,z)=>({u:x*Math.cos(abyssAngle)+z*Math.sin(abyssAngle),r:x*Math.sin(abyssAngle)-z*Math.cos(abyssAngle)});
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
export function abyssLift(x,z){const radius=Math.hypot(x,z),{u,r}=abyssLocal(x,z);if(r<235||Math.abs(u)>r*.44)return 0;
 const sector=1-smooth(.34,.44,Math.abs(Math.atan2(u,r)));
 // A broad walkable coastal rise; the final edge drops ~100m to the sea.
 const coast=smooth(730,860,radius)*(74-(radius-865)*.11);
 const ridge=18*Math.exp(-(((u+78)/57)**2)-((r-570)/115)**2);
 return sector*(coast+ridge);
}
export const abyssFalls=[{id:'western',angle:abyssAngle-.17,start:865,end:959,width:10},{id:'eastern',angle:abyssAngle+.13,start:868,end:959,width:8}];
export const fallPoint=(fall,r)=>({x:Math.sin(fall.angle)*r,z:-Math.cos(fall.angle)*r});
export function fallsClearance(x,z){let d=Infinity;for(const f of abyssFalls){const r=x*Math.sin(f.angle)-z*Math.cos(f.angle);if(r<f.start-10||r>960)continue;d=Math.min(d,Math.abs(x*Math.cos(f.angle)+z*Math.sin(f.angle))-f.width);}return d;}
export const abyssCaves=[
 {id:'abyss-mirror-cave',name:'Mirror Caves · Lower Gallery',...abyssPoint(-74,650),theme:'mirror',lore:'The Deep and Arcane Orders once disputed caves containing ancient howl-notation tablets. The Deep wished to scry their meaning; the Arcane wished to study their structure. Neither would share.\n\nHere, reflection asks the old question: are meaning and structure really separate? The gallery and its walking route are a playable interpretation of the Mirror Caves.'},
 {id:'abyss-tidal-cave',name:'Tidal Root Grotto',...abyssPoint(135,860),surfaceY:78,theme:'tidal',lore:'Tideseed grafted land plants onto underwater root systems, creating an amphibious forest. Coral Hounds have been transplanted into tidal forests with mixed success.\n\nThese roots and salt-crystal pools show the meeting of terrestrial and marine life. The grotto is an exploration setting inspired by that established lore.'}
];
export const abyssLoreSites=[
 {id:'abyss-falls',name:'Sea-Fall Overlook',...abyssPoint(-120,904),lore:'Jagged dark cliffs, churning water and salt spray define the Abyssal Reaches. Here fresh water falls toward the sea: two halves of the realm meeting beneath the cliff.\n\nThe Splits honor the Twin Currents with two memorial boats, one sent upstream and one downstream. They believe the spirit of the dead returns to both land and sea.'},
 {id:'abyss-fauna',name:'Tidepool Sanctuary',...abyssPoint(-44,535),lore:'Tide Crabs have one massive underwater crushing claw and one delicate land-working claw. Their dual nature mirrors the Twin Council.\n\nSpray Seals seem made from sea foam and salt spray. They hunt and raise pups on rocky shores, although a paw can pass through them. Mixedsight studies their paradoxes.'},
 {id:'abyss-forest',name:'Tideseed’s Tidal Grove',...abyssPoint(65,590),lore:'Tideseed grafted terrestrial plants onto underwater roots to create an amphibious forest. His shirt is woven from kelp fibers.\n\nCoral Hounds are living coral grown into a dog-like shape. Friendly but scratchy, they mimic dogs. Tideseed has tried moving them into tidal forests, with mixed success.'},
 {id:'abyss-salt',name:'Brine Crystal Shore',...abyssPoint(-48,742),lore:'Brine Flies leave perfect salt crystals wherever they land. A swarm can encrust a dock overnight. The Flame Order prizes their salt for preserving forge materials.\n\nWhirlpool Eels circle to trap prey. The realm’s account says the Divide was built to stop them swimming upstream and flooding villages.'},
 ...abyssCaves.map(c=>({...c,caveId:c.id}))
].map(p=>({...p,realm:'abyss',landmark:p.name,tag:'ABYSSAL REACHES · LAND & SEA',interactionRadius:10,customAbyss:true}));
