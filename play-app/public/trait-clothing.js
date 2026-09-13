import * as T from 'three';

// Shared, static textile maps: no floating stripes and no per-frame texture work.
const textiles=new Map();
function textile(kind){
 if(textiles.has(kind))return textiles.get(kind);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
 const c=canvas.getContext('2d');
 if(kind==='plaid'){
  c.fillStyle='#659440';c.fillRect(0,0,256,256);
  for(let i=0;i<256;i+=64){c.fillStyle='#436d2c';c.fillRect(i,0,32,256);c.fillRect(0,i,256,32);}
  for(let x=0;x<256;x+=64)for(let y=0;y<256;y+=64){c.fillStyle='#294c21';c.fillRect(x,y,32,32);c.fillStyle='#80ad53';c.fillRect(x+36,y+36,24,24);}
 }else{
  c.fillStyle='#efc477';c.fillRect(0,0,256,256);
  // The NFT's diagonal red / teal / green woven sash, on a golden-tan blanket.
  const colors=['#e85630','#009989','#6aab3c','#f3a52e'];
  for(let y=0;y<256;y+=16)for(let x=0;x<256;x+=16){
   const diagonal=205-x*.72;
   if(y>=diagonal-25&&y<=diagonal+29||x>=208&&y>diagonal){c.fillStyle=colors[((x/16)+(y/16)*3)%4];c.fillRect(x,y,16,16);}
  }
  c.fillStyle='#ba843d';c.fillRect(0,248,256,8);
 }
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.magFilter=T.NearestFilter;map.minFilter=T.LinearMipmapLinearFilter;
 textiles.set(kind,map);return map;
}
export function addTraitClothing(d,root,limbs,{orb,mesh,beam,cube},wide=1){
 if(d.clothes==='Poncho'){
  const vertices=[],uv=[],indices=[],sides=64,rows=12;
  // Open neckline -> shoulders -> loose blanket hem. Side corners stay above
  // the paws, with a dropped front/back point instead of a capped cone/skirt.
  for(let j=0;j<=rows;j++)for(let i=0;i<=sides;i++){
   const t=j/rows,a=i/sides*Math.PI*2,s=Math.sin(a),co=Math.cos(a),shoulder=Math.min(t/.32,1),drop=Math.max(0,(t-.32)/.68);
   const rx=(.28+.38*shoulder+.13*drop)*wide,rz=.23+.17*shoulder+.075*drop;
   const x=s*rx,z=co*rz,y=1.77-.20*shoulder-drop*(.44+.34*Math.abs(co))+.022*Math.sin(a*6)*drop;
   vertices.push(x,y,z);uv.push(.5+x/(1.65*wide),(y-.74)/1.05);
  }
  for(let j=0;j<rows;j++)for(let i=0;i<sides;i++){const a=j*(sides+1)+i,b=a+sides+1;indices.push(a,a+1,b,b,a+1,b+1);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
  const blanket=new T.Mesh(g,new T.MeshToonMaterial({map:textile('poncho'),side:T.DoubleSide}));blanket.name='NFT_Poncho_Draped_Blanket';root.add(blanket);
  // Finished neckline; no shirt sleeves under a sleeveless blanket.
  const neck=new T.Mesh(new T.TorusGeometry(.275,.025,6,32),new T.MeshToonMaterial({color:'#ba843d'}));neck.rotation.x=Math.PI/2;neck.scale.y=.84;neck.position.y=1.77;neck.name='Poncho_Neck_Binding';root.add(neck);
  return true;
 }
 if(d.clothes==='Lumberjack'){
  const material=new T.MeshToonMaterial({map:textile('plaid')});
  const shirt=orb('#ffffff',0,1.27,.025,.55*wide,.60,.49,root);shirt.material=material;shirt.name='NFT_Lumberjack_Plaid_Shirt';
  for(const index of [1,3]){const sleeve=orb('#ffffff',index===1?-.04:.04,-.21,0,.19,.34,.19,limbs[index]);sleeve.material=material;sleeve.name='Lumberjack_Plaid_Sleeve';}
  // Collar flaps and a fitted front placket, laid against the curved shirt.
  for(const side of [-1,1]){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([side*.04,1.75,.33,side*.29,1.66,.33,side*.17,1.49,.46],3));g.computeVertexNormals();const collar=new T.Mesh(g,new T.MeshToonMaterial({color:'#365b27',side:T.DoubleSide}));collar.name='Lumberjack_Collar';root.add(collar);}
  for(let j=0;j<4;j++){const y=1.08+j*.15,z=.025+.49*Math.sqrt(1-((y-1.27)/.60)**2);orb('#d7c995',0,y,z+.012,.018,.018,.012,root).name='Lumberjack_Button';}
  return true;
 }
 return false;
}
