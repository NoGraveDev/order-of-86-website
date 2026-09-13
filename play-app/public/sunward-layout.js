import {realms} from './world-data.js';
export const sunAngle=realms.find(r=>r.id==='sunward').angle;
export const sunPoint=(u,r)=>({x:Math.cos(sunAngle)*u+Math.sin(sunAngle)*r,z:Math.sin(sunAngle)*u-Math.cos(sunAngle)*r});
export const sunwardSites=[
 ['sun-labyrinth','The Golden Labyrinth',-50,605,'A golden maze trial: guide a wizard dog to the exit with the entire labyrinth visible from above.'],
 ['sun-crystals','The Yellow Crystal Gardens',-80,435,'Sunlight breaks into a thousand gold reflections. Walk between the crystals to see how a single light can reveal many faces.'],
 ['sun-pyramids','Pyramids of Light',100,745,'Broad golden steps lead the eye toward the sky. These monuments are a playable interpretation of Sunward’s Radiant architecture, not a new account of its ancient history.'],
 ['sun-obelisks','The Obelisk Walk',-125,760,'Golden pillars mark an open walking route. The Radiant Order’s search for clarity begins with looking closely, not looking away.'],
 ['sun-charging','Solar Charging Court',0,530,'Stand beside a charging stone to restore your spell. Each stone needs thirty seconds to gather its light again.'],
 ['sun-grove','Golden Canopy Grove',110,550,'Yellow leaves shelter small grazing creatures and drifting pollinators. Light sustains life here as much as it reveals the land.']
].map(([id,name,u,r,lore])=>({id,name,landmark:name,...sunPoint(u,r),realm:'sunward',tag:'SUNWARD HEIGHTS · GOLDEN LIGHT',lore,customSunward:true}));
export const sunwardRoads=[[[0,230],[0,330],[-80,435],[0,530],[0,648],[100,745],[75,840],[0,918]],[[0,530],[110,550],[155,650],[100,745]],[[-80,435],[-140,565],[-125,760],[0,840],[75,840]],[[-125,760],[-50,690],[0,648]]].map(p=>p.map(([u,r])=>sunPoint(u,r)));
export const sunRoadSegments=[];for(const path of sunwardRoads)for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],dx=b.x-a.x,dz=b.z-a.z;sunRoadSegments.push({a,b,dx,dz,length:Math.hypot(dx,dz)});}
export function sunRoadDistance(x,z){let d=Infinity;for(const s of sunRoadSegments){const t=Math.max(0,Math.min(1,((x-s.a.x)*s.dx+(z-s.a.z)*s.dz)/(s.length*s.length)));d=Math.min(d,Math.hypot(x-s.a.x-s.dx*t,z-s.a.z-s.dz*t));}return d;}
export const chargingSites=[[0,530],[-125,760],[100,745]].map(([u,r],i)=>({id:'solar-charge-'+i,...sunPoint(u+10,r+8)}));
