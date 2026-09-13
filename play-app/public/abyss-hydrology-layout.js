import {abyssPoint,abyssLocal,abyssFalls,fallPoint,abyssCaves} from './abyss-layout.js';
const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t)};
const point=([u,r,y])=>({...abyssPoint(u,r),y});
export const blueLakes=[
 {id:'crown',name:'Highland Source Lake',u:0,r:680,rx:35,rz:28,y:106},
 {id:'split',name:'Splitwater Lake',u:-48,r:495,rx:48,rz:38,y:24},
 {id:'lagoon',name:'Bluewater Lagoon',u:38,r:320,rx:40,rz:32,y:4},
 {id:'tidal',name:'High Tide Lake',u:-35,r:815,rx:58,rz:40,y:82},
 {id:'east',name:'Eastern Blue Lake',u:110,r:590,rx:30,rz:32,y:36},
 {id:'inlet',name:'Tidewatch Inlet',u:210,r:650,rx:26,rz:35,y:18}
].map(l=>({...l,...abyssPoint(l.u,l.r)}));
const paths=[
 ['mountain-cascade',10,[[0,680,106],[-15,654,106],[-35,620,91],[-85,585,57],[-105,560,45],[-78,522,24],[-48,495,24]]],
 ['highland-river',12,[[0,680,106],[-30,735,96],[-35,775,82],[-35,815,82]]],
 ['western-lake-outlet',11,[[-35,815,82],[-70,830,82],[-125,870,79]]],
 ['eastern-lake-outlet',9,[[-35,815,82],[20,825,82],[100,875,77]]],
 ['lower-river',10,[[-48,495,24],[-70,468,24],[-70,448,22],[-62,400,15],[0,360,7],[38,350,4],[38,320,4]]],
 ['eastern-cascade',8,[[20,670,106],[60,660,90],[90,650,76],[130,630,50],[125,615,36],[110,590,36]]],
 ['eastern-river',8,[[110,590,36],[102,550,31],[65,490,22],[95,430,15],[80,370,8],[60,340,4],[38,320,4]]],
 ['western-braid',8,[[-105,560,45],[-145,535,41],[-155,490,28],[-110,425,18],[-60,385,12],[0,360,7]]],
 ['tidal-inlet-stream',7,[[110,590,36],[150,610,30],[190,620,18],[210,650,18]]]
];
export const blueRivers=paths.map(([id,width,pts])=>({id,width,points:pts.map(point)}));
for(let i=0;i<2;i++){const river=blueRivers[2+i],f=abyssFalls[i],p=fallPoint(f,959);river.points.push({...p,y:i?67:68});}
export const blueSegments=[];
for(const river of blueRivers)for(let i=1;i<river.points.length;i++){const a=river.points[i-1],b=river.points[i],dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz);blueSegments.push({a,b,dx,dz,length,width:river.width,id:river.id});}
const cells=new Map();for(const s of blueSegments){const margin=s.width+48;for(let x=Math.floor((Math.min(s.a.x,s.b.x)-margin)/80);x<=Math.floor((Math.max(s.a.x,s.b.x)+margin)/80);x++)for(let z=Math.floor((Math.min(s.a.z,s.b.z)-margin)/80);z<=Math.floor((Math.max(s.a.z,s.b.z)+margin)/80);z++){const key=x+','+z;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(s);}}
export function segmentSample(s,x,z){const t=Math.max(0,Math.min(1,((x-s.a.x)*s.dx+(z-s.a.z)*s.dz)/(s.length*s.length)));return{distance:Math.hypot(x-s.a.x-s.dx*t,z-s.a.z-s.dz*t),y:s.a.y+(s.b.y-s.a.y)*t,t};}
export function waterSample(x,z){const local=abyssLocal(x,z);if(local.r<240||local.r>965||Math.abs(local.u)>local.r*.45)return{distance:Infinity,y:-Infinity};let best={distance:Infinity,y:-Infinity};
 for(const l of blueLakes){const d=(Math.hypot((local.u-l.u)/l.rx,(local.r-l.r)/l.rz)-1)*Math.min(l.rx,l.rz);if(d<best.distance)best={distance:d,y:l.y,id:l.id,lake:true};}
 for(const s of cells.get(Math.floor(x/80)+','+Math.floor(z/80))||[]){const p=segmentSample(s,x,z),d=p.distance-s.width;if(d<best.distance)best={distance:d,y:p.y,id:s.id,lake:false};}
 return best;
}
export const waterClearance=(x,z)=>waterSample(x,z).distance;
export function sculptWatershed(x,z,base){const {u,r}=abyssLocal(x,z);if(r<235||r>968||Math.abs(u)>r*.44)return base;const sector=1-smooth(.34,.44,Math.abs(Math.atan2(u,r)));
 const t=Math.max(0,1-Math.hypot((u+10)/155,(r-675)/215));let ground=base+112*t*t*(3-2*t)*sector;
 const w=waterSample(x,z);
 // Raise containing banks as well as carving the bed: a sheet below every centre
 // sample alone does not guarantee that its perimeter touches solid ground.
 if(w.distance<40){const depth=w.lake?4:3;let bed=w.y-depth+(depth+2.3)*smooth(-8,2,w.distance);
  // Deepen already-submerged eastern channel vertices, without moving the
  // wet/dry boundary or lowering dry banks. The old shallow shelves blocked
  // hulls inside the race gates despite a visibly open water surface.
  if(w.id==='eastern-river'||w.id==='eastern-cascade')bed-=6*smooth(0,.6,w.y-bed);
  const blend=1-smooth(8,40,w.distance);ground=ground*(1-blend)+bed*blend;
 }

 for(const c of abyssCaves){const dx=Math.max(0,Math.abs(x-c.x)-10),dz=Math.max(0,c.z-8-z,z-(c.z+23)),d=Math.hypot(dx,dz);if(d<16&&w.distance>16){const blend=1-smooth(0,16,d);ground=ground*(1-blend)+(c.surfaceY??88)*blend;}}
 return ground;
}
// Long connected routes across lakes, along the river banks, and to both galleries.
export const boardwalkRoutes=[
 [[38,276],[38,320],[0,355],[-35,400],[-48,450],[-48,495],[-48,535],[-130,560],[-130,595],[-20,600],[-20,628],[22,650],[0,680],[-8,730],[-12,775],[-35,815],[-65,850],[-100,895],[-130,930]],
 [[38,320],[90,365],[112,430],[85,490],[125,545],[110,590],[110,640],[65,674],[0,680]],
 [[110,590],[158,625],[210,650],[234,640]],
 [[-35,815],[30,825],[75,835],[105,875],[123,927]],
 [[-20,628],[-74,650]],
 [[-48,535],[-44,535]],
 [[110,590],[65,590]],
 [[-8,730],[-48,742]]
].map(path=>path.map(([u,r])=>abyssPoint(u,r)));
// End the Mirror approach before its doorway, not across the portal threshold.
const mirror=abyssCaves.find(c=>c.theme==='mirror');boardwalkRoutes[4][1]={x:mirror.x,z:mirror.z+14};
const tidal=abyssCaves.find(c=>c.theme==='tidal');
boardwalkRoutes.push([abyssPoint(75,835),{x:tidal.x,z:tidal.z+48},{x:tidal.x,z:tidal.z+40}]);
export const boardSegments=[];for(const path of boardwalkRoutes)for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],dx=b.x-a.x,dz=b.z-a.z;boardSegments.push({a,b,dx,dz,length:Math.hypot(dx,dz)});}
export function boardwalkDistance(x,z){let d=Infinity;for(const s of boardSegments)d=Math.min(d,segmentSample(s,x,z).distance);return d;}
