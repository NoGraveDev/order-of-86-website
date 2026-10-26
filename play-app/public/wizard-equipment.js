import {extraShopItems} from './extra-shop-items.js';
import * as T from 'three';
const appearances=new WeakMap(),stowedAppearances=new WeakMap();
import {marketModels} from './moon-market.js';
export function makeWizardEquipment(item,level=1){const source=marketModels[item+'-'+level];const g=source?source.clone(true):new T.Group();g.name='Equipped_'+item+'_tier_'+level;g.userData.gear={item,level};if(item==='wand')g.rotation.x=.65;if(item==='ember-lantern'){const light=new T.PointLight('#ffbd66',5,22,1.4);light.position.y=.3;g.add(light);}return g;}
function dispose(g){g.removeFromParent();}
export function setWizardEquipment(owner,rig,gear,custom=false,secondary=null){setStowedEquipment(owner,rig,secondary?.item!==gear?.item?secondary:null,custom);const body=gear?.item==='cloak'||extraShopItems.find(i=>i.id===gear?.item)?.mount==='body',hand=!body&&!custom&&rig?.limbs?.[3],target=body&&!custom?rig.root:hand||owner,key=gear?gear.item+':'+gear.level:'none',old=appearances.get(owner);if(old?.key===key&&old.target===target)return old.mesh;if(old?.mesh)dispose(old.mesh);let mesh=null;
 if(gear&&['wand','staff','cloak','pipe',...extraShopItems.map(i=>i.id)].includes(gear.item)&&Number.isInteger(gear.level)&&gear.level>=1&&gear.level<=(['wand','staff','cloak'].includes(gear.item)?3:1)){mesh=makeWizardEquipment(gear.item,gear.level);if(body)mesh.position.set(0,0,0);else mesh.position.set(hand ? .08 : .75,hand?-.56:1.04,.13);target.add(mesh);}
 appearances.set(owner,{key,target,mesh});return mesh;
}
export function clearWizardEquipment(owner){const stowed=stowedAppearances.get(owner);stowed?.mesh?.removeFromParent();stowedAppearances.delete(owner);const old=appearances.get(owner);if(old?.mesh)dispose(old.mesh);appearances.delete(owner);}

function setStowedEquipment(owner,rig,gear,custom){
 const key=gear?gear.item+':'+gear.level:'none',target=!custom&&rig?.root||owner,old=stowedAppearances.get(owner);if(old?.key===key&&old.target===target)return;
 old?.mesh?.removeFromParent();let mesh=null;
 if(gear&&marketModels[gear.item+'-'+gear.level]){mesh=makeWizardEquipment(gear.item,gear.level);mesh.name='Stowed_'+gear.item+'_tier_'+gear.level;mesh.traverse(o=>{if(o.isLight)o.visible=false;});
 const long=['staff','trail-cane','harvest-crook','star-scepter'].includes(gear.item),body=gear.item==='cloak'||extraShopItems.find(i=>i.id===gear.item)?.mount==='body';
 if(gear.item==='cloak'){mesh.position.set(0,0,0);mesh.rotation.set(0,0,0);}else if(long){mesh.position.set(-.12,1.25,-.42);mesh.rotation.set(.1,0,-.4);}else if(body){mesh.scale.setScalar(.4);mesh.position.set(0,.55,-.48);mesh.rotation.set(0,Math.PI,0);}else{mesh.position.set(.5,.85,-.12);mesh.rotation.set(-.3,0,-.25);mesh.scale.setScalar(.8);}target.add(mesh);}
 stowedAppearances.set(owner,{key,target,mesh});
}
