export const ORDER_IDS=['Flame','Wild','Arcane','Deep','Radiant','Dream'];
export const ORDER_REALMS={Flame:'ember',Wild:'deepwood',Arcane:'violet',Deep:'abyss',Radiant:'sunward',Dream:'shadow'};
export const ORDER_COLORS={Flame:'#efa165',Wild:'#96cf83',Arcane:'#bb9ce5',Deep:'#9bd9ec',Radiant:'#f5dd85',Dream:'#ee8fee',Wanderer:'#e0e6dc'};
const rows=[
 ['Flame','measured-flame','Measured Flame',1,'flame','Send a fire orb that collects Crystal Lizards, Moon Shards and scales in its path and lights braziers. Tier 1: 24m. Tier 2: 36m. Tier 3: 50m, splitting into three directions mid-flight. Equipment can extend range.',[12,18,25],4],
 ['Flame','hearthlight','Hearthlight',20,'lantern-scales','Carry warm light and reveal nearby loose scales.',[65,100,150],15],
 ['Flame','phoenix-stride','Phoenix Stride',40,'speed','Travel faster on foot in a trail of embers.',[1.35,1.6,1.9],30],
 ['Wild','living-grove','Living Grove',1,'lure','Grow a grove that draws nearby uncollected lizards toward you.',[22,32,45],12],
 ['Wild','scale-bloom','Scale Bloom',20,'scales','Reveal nearby Crystal Lizard Scales with green beacons.',[90,150,220],12],
 ['Wild','sanctuary-call','Sanctuary Call',40,'lure','Call distant uncollected lizards into a gathering around you.',[100,150,220],35],
 ['Arcane','folded-step','Folded Step',1,'blink','Step forward into clear space. Solid obstacles and unsafe water stop the step.',[9,12,15],6],
 ['Arcane','far-sight','Far Sight',20,'trail','Trace a path to your next Order survey landmark, or an undiscovered place.',[300,600,1200],14],
 ['Arcane','waystone','Waystone',40,'anchor','First cast marks this spot; the next returns you safely to it.',[1,1,1],20],
 ['Deep','water-sight','Water Sight',1,'trail','Follow a blue trail to the next survey landmark or an undiscovered place.',[250,400,700],10],
 ['Deep','tide-beacon','Tide Beacon',20,'shards','Find uncollected Moon Shards with blue beacons.',[150,230,350],14],
 ['Deep','safe-passage','Safe Passage',40,'water','Walk across river water temporarily. Return to safe ground when the spell ends.',[12,18,25],40],
 ['Radiant','revealing-light','Revealing Light',1,'lizards','Reveal uncollected Crystal Lizards nearby.',[65,100,150],8],
 ['Radiant','owl-lantern','Owl Lantern',20,'owls','Illuminate the world and mark nearby wisdom owls.',[140,220,320],16],
 ['Radiant','dawn-renewal','Dawn Renewal',40,'renew','Refresh your other two equipped Order spells and brighten your surroundings.',[1,1,1],45],
 ['Dream','dream-threads','Dream Threads',1,'calm','Calm nearby wandering wizards so they are easier to approach.',[25,40,60],10],
 ['Dream','dream-compass','Dream Compass',20,'wizards','Mark nearby wizards you have not yet met.',[150,250,400],15],
 ['Dream','still-world','Still World',40,'still','Still nearby wizards and lizards, making rare companions easier to collect.',[100,160,230],35],
 ['Wanderer','palehowl-possibility','Palehowl’s Possibility',1,'all','Reveal uncollected lizards, scales and Moon Shards together.',[180,250,350],12],
 ['Wanderer','between-paths','Between Paths',20,'blink','Fold a longer path through clear, safe space.',[16,20,25],8],
 ['Wanderer','sevenfold-journey','Sevenfold Journey',40,'journey','Travel swiftly and walk over river water for a time.',[18,24,30],45]
];
export const orderSpells=rows.map(([order,id,name,unlock,kind,description,power,cooldown])=>({order,id,name,unlock,kind,description,power,cooldown,color:ORDER_COLORS[order]}));
export const spellsForOrder=order=>orderSpells.filter(s=>s.order===order);
export const slotsAtLevel=level=>level>=50?3:level>=20?2:1;
export const upgradeCost=tier=>tier===1?2:3;
export const tierLevel=(spell,tier)=>Math.min(50,spell.unlock+(tier-1)*5);
