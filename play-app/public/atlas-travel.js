import {realms} from './world-data.js';
import {biome} from './geography.js';
export function groupDestinations(destinations){
 return realms.map(realm=>({realm,destinations:destinations.filter(p=>(p.realm|| (realms.some(r=>r.id===p.id)?p.id:biome(p.x,p.z).id))===realm.id)}));
}
export function createAtlasTravel({container,search,status,destinations,travel}){
 const groups=groupDestinations(destinations),sections=[];
 for(const {realm,destinations:items} of groups){
  const section=document.createElement('details');section.className='atlas-realm';section.dataset.realm=realm.id;section.style.setProperty('--realm',realm.color);section.open=realm.id==='starter';
  const summary=document.createElement('summary'),name=document.createElement('strong'),count=document.createElement('span');name.textContent=realm.name;count.textContent=items.length+' destinations';summary.append(name,count);
  const list=document.createElement('div');list.className='atlas-destinations';
  const rows=items.map(p=>{const b=document.createElement('button'),title=document.createElement('strong'),note=document.createElement('small');b.dataset.destination=p.id;title.textContent=p.id===realm.id?p.landmark:p.name;note.textContent=p.id===realm.id?'Realm arrival':p.atlasNote||p.tag||'Landmark';b.append(title,note);b.onclick=()=>travel(p);list.append(b);return {b,text:[realm.name,p.name,p.landmark,p.tag,p.atlasNote].filter(Boolean).join(' ').toLowerCase()};});
  section.append(summary,list);container.append(section);sections.push({section,rows,count});
 }
 let previousOpen=null;
 function filter(){const query=search.value.trim().toLowerCase();if(query&&!previousOpen)previousOpen=sections.map(s=>s.section.open);let total=0;
  sections.forEach(({section,rows,count},i)=>{let visible=0;for(const row of rows){row.b.hidden=!!query&&!row.text.includes(query);if(!row.b.hidden)visible++;}section.hidden=!visible;if(query)section.open=!!visible;else if(previousOpen)section.open=previousOpen[i];count.textContent=visible+' destination'+(visible===1?'':'s');total+=visible;});
  if(!query)previousOpen=null;status.textContent=total?`${total} destination${total===1?'':'s'} · ${sections.filter(s=>!s.section.hidden).length} realm${sections.filter(s=>!s.section.hidden).length===1?'':'s'}`:'No destinations found. Try a realm or landmark name.';
 }
 search.addEventListener('input',filter);filter();
 return {openRealm(id){if(search.value)return;const section=sections.find(s=>s.section.dataset.realm===id)?.section;if(section)section.open=true;}};
}
