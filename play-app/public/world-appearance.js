import {sunRoadDistance} from './sunward-layout.js';
import {waterSample} from './abyss-hydrology-layout.js';
import {emberLift,lavaVisible} from './ember-layout.js';
import {firstHowlMountain,mountainDistance} from './frost-layout.js';
import {WORLD_SCALE,STARTER_RADIUS,TERRAIN_EXTENT,TERRAIN_SEGMENTS} from './world-scale.js';
// Shared visual sampling for terrain, atlas and mini-map. Gameplay geography is unchanged.
import {realms,sectorRealms} from './world-data.js';
import {height, pathDist} from './geography.js';
const colors = [realms[0],...sectorRealms].map(r => r.ground.match(/[a-f0-9]{2}/gi).map(c => parseInt(c, 16)));
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const smooth = (a, b, x) => {const t = Math.max(0, Math.min(1, (x-a)/(b-a)));return t*t*(3-2*t)};
export function groundColor(x, z) {
  const radius = Math.hypot(x, z), step = Math.PI * 2 / 7;
  const sector = ((Math.atan2(x, -z) / step) % 7 + 7) % 7;
  const index = Math.floor(sector + .5) % 7;
  const edge = sector - Math.floor(sector + .5);
  let color = colors[index + 1];
  const width = Math.min(.22, 18 / Math.max(radius, 1) / step);
  if (Math.abs(edge) > .5-width) {
    const next = (index + (edge > 0 ? 1 : 6)) % 7;
    color = mix(color, colors[next + 1], smooth(.5-width, .5+width, Math.abs(edge)));
  }
  const variation = 1 + .035*Math.sin(x*.071+Math.sin(z*.039)) + .026*Math.cos(z*.113-x*.029);
  color = color.map(c => c*variation);
  if(sectorRealms[index].id==='frost'){
    color=mix(color,[225,237,244],.78);
    if(mountainDistance(x,z)<firstHowlMountain.radius){const slope=Math.hypot(height(x+2,z)-height(x-2,z),height(x,z+2)-height(x,z-2))/4;const ribs=.5+.5*Math.sin(Math.atan2(z+65,x-770)*7+mountainDistance(x,z)*.02);color=mix(color,[92,116,136],smooth(.7,1.25,slope)*ribs*.85);}
  }
  if(sectorRealms[index].id==='ember'&&radius>220){color=mix(color,[49,43,43],.55);color=mix(color,[111,85,70],smooth(12,65,emberLift(x,z))*.7);if(lavaVisible(x,z))color=mix(color,[207,66,17],.85);}
  if(sectorRealms[index].id==='abyss'){color=mix(color,[72,112,136],.48);const w=waterSample(x,z);if(w.distance<0)color=mix(color,[35,137,192],.92);}
  if(sectorRealms[index].id==='sunward'&&radius>220){color=mix(color,[211,185,54],.68);if(sunRoadDistance(x,z)<5)color=[235,192,40];}
  const road = (1-smooth(2.2, 4.8, pathDist(x,z))) * (1-smooth(460*WORLD_SCALE,467*WORLD_SCALE,radius));
  const clearing = 1-smooth(8,12,radius);
  const regional=mix(color, sectorRealms[index].id==='frost'?[195,210,221]:sectorRealms[index].id==='sunward'?[235,192,40]:[184,176,136], Math.max(road,clearing));
  const starter=mix(colors[0].map(c=>c*variation),[184,176,136],Math.max(road,clearing));
  // Apply the sanctuary boundary LAST, including snow, water and road overrides.
  // One cell diagonal keeps interpolated outer terrain vertices outside Starter Lands.
  const buffer=TERRAIN_EXTENT/TERRAIN_SEGMENTS*Math.SQRT2;
  return mix(starter,regional,smooth(STARTER_RADIUS+buffer,112*WORLD_SCALE,radius));
}
export function reliefColor(x,z) {
  const color=groundColor(x,z);
  const dx=(height(x+2,z)-height(x-2,z))/4, dz=(height(x,z+2)-height(x,z-2))/4;
  const light=Math.max(.65,Math.min(1.22,1.02-dx*.38-dz*.26));
  const h=height(x,z), contour=Math.abs(h/4-Math.round(h/4));
  const ink=contour<.045?.86:1;
  return color.map(c=>Math.max(0,Math.min(255,Math.round(c*light*ink))));
}
