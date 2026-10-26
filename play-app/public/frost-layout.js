import {firstHowlStory} from './first-howl-story.js';
// The First Howl's mountain stays unnamed in canon. Its placement is V2 geography.
export const firstHowlMountain={x:770,z:-65,radius:104*1.75,rise:88*1.75};
export function mountainDistance(x,z){return Math.hypot(x-firstHowlMountain.x,z-firstHowlMountain.z)}
export function mountainLift(x,z){const t=Math.max(0,Math.min(1,(firstHowlMountain.radius-mountainDistance(x,z))/(firstHowlMountain.radius-14)));return firstHowlMountain.rise*t*t*(3-2*t)+1.75*Math.sin(Math.atan2(z+65,x-770)*7+t*2)*Math.sin(Math.PI*t)**2}
export function ascentPoint(t){const a=1.3+t*Math.PI*2.5,r=firstHowlMountain.radius*(1-t);return{x:770+Math.cos(a)*r,z:-65+Math.sin(a)*r}}
export const frostLoreSites=[
 {id:'frost-first-howl',name:'The First Howl',x:770,z:-71,interactionRadius:9,lore:firstHowlStory},
 {id:'frost-ascent',name:'The Unnamed Mountain',...ascentPoint(0),lore:'The First Howl traditions place the Gray Dog on an unnamed mountain. Some say the stone still hums. Follow the snow-worn spiral to the silent summit.'},
 {id:'frost-listeners',name:'Ice Speaker Circle',x:570,z:188,lore:'On clear nights, Frosthollow’s Ice Speakers sit upon the ice, listening for the voices of the dead in the aurora.'},
 {id:'frost-bones',name:'Old Pack Bone Niches',x:681,z:231,lore:'The northern Husky packs preserve bone niches and still perform the Circle Howl for new pups, keeping customs older than the First Howl.'},
 {id:'frost-garden',name:'Cold Growth Garden',x:595,z:83,lore:'Frostbark tends plants that thrive below freezing. Arctic moss and hardy food plants sustain the packs through the longest winters.'},
 {id:'frost-beacon',name:'Cold Light Beacon',x:610,z:105,lore:'Tancollar’s Cold Light illuminates the arctic dark without melting the delicate ice around it.'}
].map(p=>({...p,realm:'frost',landmark:p.name,tag:'FROSTHOLLOW · PACK MEMORY',customFrost:true}));
