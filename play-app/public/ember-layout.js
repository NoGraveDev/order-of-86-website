import {realms} from './world-data.js';
const realm=realms.find(r=>r.id==='ember'),a=realm.angle;
export const emberPoint=(u,r)=>({x:Math.cos(a)*u+Math.sin(a)*r,z:Math.sin(a)*u-Math.cos(a)*r});
export const emberLocal=(x,z)=>({u:x*Math.cos(a)+z*Math.sin(a),r:x*Math.sin(a)-z*Math.cos(a)});
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
export const emberDomes=[{u:-145,r:735,radius:100,rise:65},{u:144,r:810,radius:112,rise:82},{u:115,r:540,radius:87,rise:43},{u:-95,r:370,radius:64,rise:28}];
export const emberRivers=[{id:'western',side:-1,start:300,end:897},{id:'eastern',side:1,start:338,end:915}];
export function riverPoint(r,side){const u=side*(63+Math.sin(r*.014+side)*22+Math.sin(r*.031)*6);return {...emberPoint(u,r),u,r,width:7+2*Math.sin(r*.019+side)**2};}
const originalSites=[realm,...[0,1,2].map(j=>{const angle=a+(j===1?.16:j===2?-.14:0),r=[440,780,850][j];return{x:Math.sin(angle)*r,z:-Math.cos(angle)*r}})];
export const emberLoreSites=[
 {id:'ember-moths',name:'Spark & Sulfur Moth Garden',...emberPoint(-38,602),lore:'Spark Moths are drawn to open flame but never burn. Their jagged wings carry ember-spark patterns; a sudden scattering warns the Forge Spire of an unstable forge.\n\nYellow Sulfur Moths leave trails of harmless, strongly scented sulfur powder. Their wings glow faintly at night. The Flame Order cultivates them near the Spire for forge-fire starters.'},
 {id:'ember-orbs',name:'Ash Orb Memorial',...emberPoint(40,711),lore:'The Tigers burn their dead on volcanic-stone pyres, then mix the ash with volcanic glass to shape small orbs. Packs strike the orbs against stone in times of need, believing their tones summon the courage of the dead.\n\nThe oldest are silent. These silent orbs are held most sacred: even their echoes have faded.'},
 {id:'ember-fauna',name:'Lava Bank Wildlife',...emberPoint(-35,523),lore:'Ash Rabbits have ember-orange eyes and fireproof gray fur. Their flight uphill can warn of a new lava flow. Magma Crabs reheat their claws in lava to crack fireproof nuts; apprentices keep them as forge pets.\n\nPumice Tortoises float on lava, grazing on heat-resistant algae. Cinder Swallows shed soot and reform from nearby fire after death. They cannot survive the cold outside the Ember Wastes.'},
 {id:'ember-seeds',name:'The Ember Path · Fire-seeds',...emberPoint(23,340),lore:'Pilgrims on the Ember Path carry fire-seeds from the Forge Spire toward Heartwood Spire, planting along the way.\n\nStripeheart carries Heartwood seeds through volcanic country and guides animals away from eruptions. Stripesight, the Wild Order’s recovery botanist, searches ruined ground for surviving seeds that can begin an ecosystem anew.'},
 {id:'ember-familiars',name:'Forge Familiars',...emberPoint(38,630),lore:'Forge Salamanders live in the coals of the Forge Spire, coal-black with an orange glow from within. Apprentices keep them close for warmth. They cannot survive outside the Ember Wastes.\n\nAnvil Beetles have dense anvil-shaped shells and feed on cooling slag, keeping the forges clean. Spark Moths flutter overhead, and Magma Crabs warm cold tools with their heated pincers. Even here, fire sustains a living world.'}
].map(p=>({...p,realm:'ember',landmark:p.name,tag:'EMBER WASTES · FIRE & RENEWAL',interactionRadius:11,customEmber:true}));
export const emberReserved=[...originalSites,...emberLoreSites];
export function riverClearance(x,z){const {u,r}=emberLocal(x,z);let distance=Infinity;
 for(const river of emberRivers){if(r<river.start||r>river.end)continue;const p=riverPoint(r,river.side);distance=Math.min(distance,Math.abs(u-p.u)-p.width);}
 return distance;
}
export function lavaVisible(x,z){const {r}=emberLocal(x,z);return riverClearance(x,z)<0&&Math.abs(r-440)>10&&Math.abs(r-780)>10&&!emberReserved.some(p=>Math.hypot(x-p.x,z-p.z)<27);}
export function emberLift(x,z){const {u,r}=emberLocal(x,z);if(r<240||r>970||Math.abs(u)>r*.46)return 0;
 let lift=0;for(const dome of emberDomes){const t=Math.max(0,1-Math.hypot(u-dome.u,r-dome.r)/dome.radius);lift+=dome.rise*t*t*(3-2*t);}
 // Low broken ridges, broad domes and shallow incised channels; compact support stays in this realm.
 lift+=(5+3*Math.sin(r*.03))*Math.sin(u*.026+r*.009)**2*smooth(250,320,r)*(1-smooth(880,950,r));
 const road= Math.min(Math.abs(u),Math.abs(Math.hypot(x,z)-440),Math.abs(Math.hypot(x,z)-780));
 lift*=.22+.78*smooth(6,30,road);
 if(lavaVisible(x,z))lift-=2*(1-smooth(-5,2,riverClearance(x,z)));
 return lift*smooth(0,28,r*.43-Math.abs(u))*(1-smooth(915,952,Math.hypot(x,z)));
}
