import {WORLD_RADIUS} from './geography.js';
import {reliefColor} from './world-appearance.js';
const cache=new Map();
export function mapTerrain(size=900,padding=1.09) {
  const key=size+':'+padding;
  if(cache.has(key))return cache.get(key);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
  const ctx=canvas.getContext('2d');if(!ctx)return canvas;
  const image=ctx.createImageData(size,size),span=WORLD_RADIUS*2*padding;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const wx=(x/size-.5)*span,wz=(y/size-.5)*span;
    const rgb=Math.hypot(wx,wz)<=WORLD_RADIUS?reliefColor(wx,wz):[20,40,42];
    const i=(y*size+x)*4;image.data.set([...rgb,255],i);
  }
  ctx.putImageData(image,0,0);
  cache.set(key,canvas);return canvas;
}
