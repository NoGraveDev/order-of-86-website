import * as T from 'three';
import {createMoon} from './moon-models.js';
import {moons} from './world-data.js';

const overlay=document.getElementById('loading'),mount=document.getElementById('loadingMoons');
const bar=document.getElementById('moonProgress'),status=document.getElementById('loadingStatus'),count=document.getElementById('loadingCount');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer,frame,shown=0,target=0,lastStep=0,stopped=false;
const scene=new T.Scene(),camera=new T.OrthographicCamera(-112,112,25,-25,.1,200);camera.position.set(0,0,100);
scene.add(new T.AmbientLight('#aebfda',1.3));const key=new T.DirectionalLight('#fff1d5',3.5);key.position.set(-40,70,100);scene.add(key);
const models=moons.map((_,i)=>{const model=createMoon(i);model.position.x=-96+i*32;model.rotation.x=.16;model.rotation.y=-.18;scene.add(model);model.traverse(o=>{if(o.isMesh)o.userData.originalColor=o.material.color.clone()});return model});
const labels=document.createElement('div');labels.className='moon-labels';moons.forEach(([name,color])=>{const span=document.createElement('span');span.textContent=name;span.style.setProperty('--moon-color',color);labels.append(span)});
try{
 renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0);mount.append(renderer.domElement,labels);
}catch{mount.append(labels)}
function resize(){if(!renderer)return;const width=mount.clientWidth;renderer.setSize(width,width*50/224,false)}
resize();addEventListener('resize',resize);
function paint(now=performance.now()){
 if(stopped)return;
 if(shown<target&&(reduced||now-lastStep>=130)){shown++;lastStep=now;bar.setAttribute('aria-valuenow',shown);bar.setAttribute('aria-valuetext',`${shown} of 7 moons lit`);count.textContent=`${shown} / 7`;}
 models.forEach((model,i)=>{const lit=i<shown;labels.children[i].classList.toggle('lit',lit);model.rotation.y=-.18+(reduced?0:Math.sin(now*.0005+i)*.15);model.traverse(o=>{if(o.isMesh){o.material.color.copy(o.userData.originalColor).multiplyScalar(lit?1:.13);o.material.emissive.copy(o.userData.originalColor).multiplyScalar(lit?.2:0);}})});
 if(renderer){renderer.render(scene,camera);mount.classList.add('has-3d')}frame=requestAnimationFrame(paint);
}
function dispose(){stopped=true;cancelAnimationFrame(frame);removeEventListener('resize',resize);scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose()}});renderer?.dispose();renderer?.forceContextLoss();}
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
globalThis.pawLoading={
 set(value,message){target=Math.max(target,Math.min(7,Math.floor(value)));if(message)status.textContent=message},
 paint:()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))),
 async finish(){this.set(7,'The seven moons are awake');while(shown<7)await delay(40);await delay(reduced?150:550);overlay.classList.add('ready');await delay(reduced?0:300);dispose();}
};
paint();
try{await import('./game.js')}catch(error){
 dispose();
 // Preserve a specific WebGL/download error supplied by the game itself.
 if(document.getElementById('loadingError')){status.textContent='The world could not finish loading';document.getElementById('loadingError').hidden=false;document.getElementById('loadingError').textContent='The game could not start. Reload to fetch the latest game files. Your saved account progress will be kept.';document.getElementById('loadingRetry').hidden=false;}
 console.error(error);
}
