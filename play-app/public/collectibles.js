import {spreadRealm} from './realm-placement.js';
export const lizardTypes=[
{id:'common',name:'Common',realm:0,color:'#c9d2bd',note:'Opalescent scales. The smallest and most widespread lizard.'},
{id:'moss',name:'Moss',realm:1,color:'#8aba81',note:'Leaf-shaped scales with tiny patches of moss.'},
{id:'script',name:'Script',realm:2,color:'#b297d4',note:'Violet scales carry shifting arcane symbols.'},
{id:'frost',name:'Frost',realm:3,color:'#b7e3ef',note:'Snowflake-shaped scales, cold to the touch.'},
{id:'magma',name:'Magma',realm:4,color:'#efa365',note:'Molten orange scales. Completely fireproof.'},
{id:'prism',name:'Prism',realm:5,color:'#f0e7c9',note:'A white body refracting a rainbow of light.'},
{id:'ghost',name:'Ghost',realm:6,color:'#96ccd9',note:'Translucent blue scales with a water affinity.'},
{id:'purr',name:'Purr',realm:7,color:'#ed8eed',note:'Soft magenta, heart-patterned scales. The only lizard that makes a sound.'},
{id:'rot',name:'Rot',realm:7,color:'#819c67',note:'Dark scales with green veins. Feeds on decay magic.'}
];
export function spawnLocations(realms,obstacles=[],occupied=[]){const positions=new Map();for(const r of realms){const types=lizardTypes.filter(t=>realms[t.realm].id===r.id),points=spreadRealm(r,types.length*4,realms.indexOf(r)+324,obstacles,occupied);types.forEach((t,j)=>positions.set(t.id,points.filter((p,i)=>i%types.length===j)))}return lizardTypes.flatMap((type,t)=>positions.get(type.id).map((p,i)=>({id:type.id+'-'+i,type:type.id,...p,phase:t*.7+i*1.4})))}
export function readCollection(raw,spawns){try{const valid=new Set(spawns.map(s=>s.id));const ids=JSON.parse(raw||'[]');return new Set(Array.isArray(ids)?ids.filter(id=>valid.has(id)):[])}catch{return new Set()}}
export function nearbyLizard(critters,position,collected,radius=2.8){let found=null,best=radius;for(const c of critters){if(c.g.visible===false)continue;const d=Math.hypot(c.g.position.x-position.x,c.g.position.z-position.z);if(d<best&&Math.abs(c.g.position.y-position.y)<1.4){found=c;best=d}}return found}
export function collectLizard(c,collected){if(!c||collected.has(c.id))return false;collected.add(c.id);c.g.visible=false;return true}
