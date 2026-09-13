export const CYCLE_SECONDS=720;
export function daylightAt(seconds,mode='cycle'){
 if(mode==='day')return 1;if(mode==='night')return 0;
 const x=Math.max(0,Math.min(1,(Math.cos(seconds/CYCLE_SECONDS*Math.PI*2)+.25)/.5));return x*x*(3-2*x);
}
