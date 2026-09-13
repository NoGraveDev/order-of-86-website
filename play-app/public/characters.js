import * as T from 'three';
import {attachMouthTrait} from './mouth-traits.js';
import {addTraitClothing} from './trait-clothing.js';
import {artPalettes} from './art-palettes.js';
import {starterPalettes} from './starter-dogs.js';
import {furColors,orderColors} from './wizards.js';
export function createWizard(d,{orb,mesh,beam,torus,mat,cube}){
 const original=d,a=starterPalettes[d.id]||artPalettes[d.id]||{};d={...d,breed:a.visualBreed||d.breed,eyes:a.eyesOverride||d.eyes};
 const root=new T.Group();root.name=d.name+'_'+d.id;root.userData.wizardId=d.id;
 const f=a.fur||furColors[d.fur],hatColor=a.hat||orderColors[d.order],dark='#181818',light=a.muzzle||f,limbs=[];
 const wide=d.breed==='Bernard'?1.2:1;
 root.userData.sourceTraits={id:d.id,breed:d.breed,fur:d.fur,eyes:d.eyes,clothes:d.clothes,order:d.order,mouth:'unspecified in supplied bible'};
 function coat(o,part){o.name=part+'_'+d.breed;const geometry=new T.SphereGeometry(1,32,24),positions=geometry.attributes.position,colors=[];const base=new T.Color(f);const pattern=new T.Color(a.pattern||(d.fur==='Black'?'#555555':'#171717'));const pale=new T.Color(light);for(let i=0;i<positions.count;i++){const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);let color=base;
 if(d.breed==='Split'&&x<0)color=new T.Color(a.split||f).multiplyScalar(a.split?1:.55);
 if(d.breed==='Tiger'&&Math.sin(y*24+Math.abs(x)*8+z*3)>.64)color=pattern;
 if(['Spotted','Dalmatian','Blotted'].includes(d.breed)){let spot=false;const n=d.breed==='Blotted'?11:18;for(let k=0;k<n;k++){let a=k*2.399+Number(d.id)*.01,py=-.8+(k%5)*.39,px=Math.sin(a)*Math.sqrt(Math.max(0,1-py*py)),pz=Math.cos(a)*Math.sqrt(Math.max(0,1-py*py));if(Math.hypot(x-px,y-py,z-pz)<(d.breed==='Blotted'?.35:.17)){spot=true;break}}if(spot)color=pattern}
 if(d.breed==='Zombie'&&d.id!==1053&&Math.sin(x*19+y*11+z*13)*Math.cos(y*17-z*8)>.6)color=new T.Color(d.fur==='Black'?'#666666':d.fur==='Purple'?'#c3addc':'#456a30');
 if(d.breed==='Husky'&&z>.35&&((part==='Head'&&Math.abs(x)<.22)||part==='Body'))color=pale;
 if(d.breed==='Collie'&&z>.2&&(Math.abs(x)<.23||part==='Body'&&y>.25))color=pale;
 colors.push(color.r,color.g,color.b)}geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));o.geometry=geometry;o.material=new T.MeshToonMaterial({color:'#ffffff',vertexColors:true});return o}

 coat(orb(f,0,1.15,0,.5*wide,.72,.36,root),'Body');if(d.breed!=='Solid')orb(light,0,1.28,.29,.32,.48,.11,root);
 coat(orb(f,0,2.04,0,.57*wide,.53,.43,root),'Head');orb(light,0,1.86,.43,.4,.26,d.breed==='Collie'?.43:.31,root);orb(dark,0,1.96,d.breed==='Collie'?.81:.7,.15,.11,.09,root);

 const mouth=new T.Group();mouth.name='Mouth_Neutral_Unspecified';root.add(mouth);
 const reach=d.breed==='Collie'?.11:0;
 const jaw=orb(light,0,1.705,.46+reach,.3,.095,.23,mouth);jaw.name='Lower_Jaw';
 const seam=new T.CatmullRomCurve3([new T.Vector3(-.28,1.79,.61+reach),new T.Vector3(-.17,1.755,.69+reach),new T.Vector3(0,1.745,.714+reach),new T.Vector3(.17,1.755,.69+reach),new T.Vector3(.28,1.79,.61+reach)]);
 mesh(new T.TubeGeometry(seam,24,.013,6,false),dark,0,0,0,1,1,1,mouth).name='Closed_Mouth_Seam';
 beam([0,1.89,.755+reach],[0,1.755,.722+reach],.012,dark,mouth).name='Philtrum';
 for(const side of [-1,1]){orb(dark,side*.075,1.97,.779+reach,.032,.019,.014,mouth).name='Nostril';}
 for(const side of [-1,1]){
 if(['Husky','Tiger','Zombie'].includes(d.breed)){const ear=mesh(new T.ConeGeometry(.21,.57,4),f,side*.43,2.48,0,1,1,.7,root);ear.rotation.z=side*-.2;mesh(new T.ConeGeometry(.12,.34,4),'#bca5a0',side*.43,2.48,.1,1,1,.4,root)}else orb(d.breed==='Bernard'?'#776251':f,side*.48,2.1,-.02,.2,.48,.17,root);
 orb('#f0e9d3',side*.24,2.16,.375,.18,d.eyes==='Sleepy Eyes'?.09:.19,.05,root);
 const ec=a.iris&&a.iris!=='#ffffff'?a.iris:d.eyes.includes('Mixed')?(side===1?'#a9c894':'#d6b65e'):({'Red Eyes':'#d16e6d','Pink Eyes':'#eba8c3','Yellow Eyes':'#d9b44c','Green Eyes':'#7abb8c','Blue Eyes':'#79b6db'}[d.eyes]||dark);
 orb(ec,side*.24,2.15,.43,.065,d.eyes==='Sleepy Eyes'?.045:.09,.04,root);
 if(starterPalettes[d.id]){const lid=mesh(cube,f,side*.24,2.215,.435,.37,.11,.08,root);lid.name='Starter_Sleepy_Eyelid';}
 if(d.eyes==='Round Glasses')torus(a.glasses||'#b58b69',side*.24,2.16,.46,.205,.025,root);
 if(d.eyes==='Square Glasses'){for(const y of [1.96,2.35])beam([side*.24-.2,y,.46],[side*.24+.2,y,.46],.023,a.glasses||'#b58b69',root);for(const x of [side*.24-.2,side*.24+.2])beam([x,1.96,.46],[x,2.35,.46],.023,a.glasses||'#b58b69',root)}
 const leg=new T.Group();leg.position.set(side*.28,.72,0);root.add(leg);orb(f,0,-.26,0,.19,.43,.19,leg);orb(light,0,-.58,.13,.24,.14,.33,leg);limbs.push(leg);for(let toe of [-.07,.07])beam([toe,-.59,.42],[toe,-.51,.36],.007,dark,leg).name='Paw_Toe_Seam';
 const arm=new T.Group();arm.position.set(side*.49,1.58,0);root.add(arm);orb(f,side*.04,-.28,0,.16,.39,.16,arm);orb(light,side*.08,-.58,.02,.2,.21,.18,arm);limbs.push(arm);
 if(d.clothes.includes('Tracksuit')){orb('#4c6676',0,-.2,0,.205,.38,.2,leg);beam([side*.15,.03,.1],[side*.15,-.5,.1],.025,'#e1d9b6',leg)}
 }
 if(d.eyes.includes('Glasses'))beam([-.08,2.16,.47],[.08,2.16,.47],.018,dark,root);
 if(d.eyes==='Visor'){orb(a.iris||'#00a0ff',0,2.17,.41,.48,.17,.1,root);beam([-.38,2.23,.48],[.36,2.23,.48],.026,'#a9d6d7',root)}
 const brim=orb(hatColor,0,2.45,-.03,.85,.08,.66,root);brim.name=d.id===6164?'Upturned_Brim':'Hat_Brim';
 if(d.id===6164){const bg=brim.geometry.clone(),bp=bg.attributes.position;for(let i=0;i<bp.count;i++)bp.setY(i,bp.getY(i)+Math.pow(Math.abs(bp.getX(i)),3)*1.8);bg.computeVertexNormals();brim.geometry=bg;}
 const hatGroup=new T.Group();hatGroup.position.set(0,2.47,-.03);root.add(hatGroup);const vertices=[],indices=[],rings=14,sides=24;
 for(let j=0;j<=rings;j++){const t=j/rings,bend=d.id===6164?-.13*t:Math.pow(t,3)*.55;const cy=d.id===6164?t*1.25:t*1.08-Math.pow(t,5)*.3;const radius=.55*Math.pow(1-t,.9)+(d.id===6164?0:.025*t);for(let i=0;i<=sides;i++){const a=i/sides*Math.PI*2;vertices.push(bend+Math.cos(a)*radius,cy,Math.sin(a)*radius)} }
 for(let j=0;j<rings;j++)for(let i=0;i<sides;i++){const a=j*(sides+1)+i,b=a+sides+1;indices.push(a,b,a+1,b,b+1,a+1)}
 const hg=new T.BufferGeometry();hg.setAttribute('position',new T.Float32BufferAttribute(vertices,3));hg.setIndex(indices);hg.computeVertexNormals();const hat=mesh(hg,hatColor,0,0,0,1,1,1,hatGroup);hat.name=d.id===6164?'Sharp_Pointed_Hat':'Soft_Folded_Hat';
 if(d.id!==6164)orb(hatColor,.55,.78,0,.05,.045,.05,hatGroup);
 const tail=orb(f,0,.95,-.55,.16,.19,d.breed==='Husky'?.38:.5,root);tail.rotation.x=-.5;
 // Coat patterns are integrated vertex colors on the head and torso, avoiding floating patches.
 if(d.breed==='Collie'){for(let side of [-1,1])for(let j=0;j<3;j++){const tuft=mesh(new T.ConeGeometry(.14,.42,5),light,side*(.38+j*.06),1.76-j*.12,.04,1,1,1,root);tuft.rotation.z=side*.9;tuft.rotation.x=Math.PI}}
 if(d.breed==='Shiny'){root.traverse(o=>{if(o.isMesh&&(o.name==='Body_Shiny'||o.name==='Head_Shiny'||o.material.color.getHexString()===new T.Color(f).getHexString()))o.material=new T.MeshStandardMaterial({color:f,metalness:.65,roughness:.3})})}
 const tailored=addTraitClothing(d,root,limbs,{orb,mesh,beam,cube},wide);
 if(!tailored&&d.clothes!=='None'&&!['Scarf','Collar'].includes(d.clothes)){
 const cloth=a.clothing||(d.clothes.includes('Lumberjack')?'#915c54':d.clothes==='Poncho'?'#a48b65':d.clothes.includes('Hoodie')?'#596b77':d.clothes==='Turtleneck'?'#667964':d.id===3406?'#668fae':'#607988');
 orb(cloth,0,1.26,-.015,.52*wide,.56,.39,root);
 if(d.clothes.includes('Hoodie'))torus(cloth,0,1.73,-.12,.31,.11,root);
 if(d.clothes==='Turtleneck')mesh(new T.CylinderGeometry(.28,.28,.25,12),cloth,0,1.72,0,1,1,1,root);
 for(const index of [1,3]){const arm=limbs[index];orb(cloth,index===1?-.04:.04,-.2,0,.18,d.clothes==='Shirt'?.2:.32,.18,arm)}
 if(d.clothes.includes('Tracksuit'))beam([0,.88,.395],[0,1.72,.395],.015,'#d9dfd5',root);
 }
 if(!a.hideNeckwear&&['Scarf','Collar'].includes(d.clothes)){const ring=torus(a.neckwear||hatColor,0,1.75,0,.32,d.clothes==='Collar'?.06:.12,root);ring.rotation.x=Math.PI/2;if(d.clothes==='Scarf')mesh(cube,a.neckwear||hatColor,.21,1.48,.38,.18,.58,.08,root)}
 if(a.chain){const chain=new T.Group();chain.name='Gold_Chain';root.add(chain);const gold=new T.MeshStandardMaterial({color:a.chain,metalness:.65,roughness:.3});for(let i=0;i<28;i++){const angle=i*Math.PI*2/28,front=Math.max(0,Math.cos(angle));const link=new T.Mesh(new T.TorusGeometry(.052,.018,8,16),gold);link.name='Gold_Chain_Link_'+i;link.position.set(Math.sin(angle)*.4,1.7-front*.36,Math.cos(angle)*.45);link.rotation.y=angle+(i%2?Math.PI/3:0);link.scale.y=1.25;chain.add(link)}root.userData.sourceTraits.accessories=['Gold chain'];}
 if(d.clothes.includes('Ball')&&d.id!==9089){orb('#d0a86b',-.72,1.03,.17,.25,.25,.25,root);torus('#eee0b1',-.72,1.03,.17,.252,.018,root)}

 const band=torus(a.hatBand||'#c6aa77',0,2.64,-.03,.49,.085,root);band.rotation.x=Math.PI/2;if(starterPalettes[d.id]){
  // Open rectangular buckle, matching the starter art rather than a solid badge.
  for(const x of [-.10,.10])mesh(cube,a.buckle,x,2.65,.50,.045,.22,.04,root).name='Starter_Buckle_Side';
  for(const y of [2.55,2.75])mesh(cube,a.buckle,0,y,.50,.24,.04,.04,root).name='Starter_Buckle_Edge';
 }else mesh(cube,'#ffe654',0,2.65,.48,.18,.19,.035,root);
 if(a.mouth==='tongue'){orb('#241414',0,1.74,.69,.22,.12,.08,root);orb('#df7580',.07,1.66,.82,.12,.045,.22,root)}
 if(a.mouth==='bone'){beam([-.2,1.76,.83],[.68,1.76,.83],.065,a.mouthColor,root);for(const x of [-.2,.68])for(const y of [1.71,1.81])orb(a.mouthColor,x,y,.83,.105,.075,.08,root)}
 if(a.mouth==='pipe'){beam([.1,1.77,.8],[.72,1.69,.84],.045,'#cfc4a8',root);mesh(new T.CylinderGeometry(.12,.09,.27,16),'#946344',.74,1.74,.84,1,1,1,root)}
 if(a.mouth==='ball')orb(a.mouthColor||'#ffe32f',.08,1.72,.82,.16,.16,.16,root).name='Mouth_Ball';
 attachMouthTrait(root,a.mouth,reach);
 root.userData.artReference=a.source;root.userData.visualPalette=a;
 return {root,limbs,tail,hat};
}
