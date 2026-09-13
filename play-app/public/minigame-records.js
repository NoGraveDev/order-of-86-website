import {recordStorage,account} from './account-state.js';
export const MINIGAME_RECORD_KEY='pawtheon-minigame-records-v1';
export const SLED_BEST_KEY='pawtheon-sled-best-v3';
const kinds=['sled','maze9','maze13'];
const empty=()=>({count:0,totalTime:0,totalSteps:0,bestTime:null,bestSteps:null,bestGates:null,recent:[]});
const number=(v)=>typeof v==='number'&&Number.isFinite(v)&&v>=0;
export function createMinigameRecords(storage){
 let memory={};let saved=true,dirty=false;
 function read(){try{const raw=dirty?null:JSON.parse(storage.getItem(MINIGAME_RECORD_KEY)||'{}');if(raw&&typeof raw==='object'&&!Array.isArray(raw))memory=raw;}catch{saved=false;}
 const result={};for(const k of kinds){const old=memory[k]||{},v=empty();for(const key of ['count','totalTime','totalSteps','bestTime','bestSteps','bestGates'])if(number(old[key]))v[key]=old[key];v.recent=Array.isArray(old.recent)?old.recent.filter(r=>r&&number(r.time)&&number(r.finished)&&(k==='sled'?number(r.gates)&&number(r.penalty)&&number(r.hits):number(r.steps)&&number(r.seed))).slice(0,5):[];result[k]=v;}memory=result;
 let legacy=null;try{const n=Number(storage.getItem(SLED_BEST_KEY));if(Number.isFinite(n)&&n>0)legacy=n;}catch{saved=false;}
 if(legacy!==null)result.sled.bestTime=result.sled.bestTime===null?legacy:Math.min(legacy,result.sled.bestTime);
 return{records:structuredClone(result),saved};
 }
 function finish(kind,run){if(!kinds.includes(kind)||!number(run.time))throw Error('Invalid minigame result');if(kind!=='sled'&&(!Number.isInteger(run.steps)||run.steps<1))throw Error('Invalid maze steps');if(kind==='sled'&&(!Number.isInteger(run.gates)||run.gates<0||run.gates>9||!number(run.penalty)||!number(run.hits)))throw Error('Invalid sled result');
 const {records}=read(),r=records[kind];r.count++;r.totalTime+=run.time;r.bestTime=r.bestTime===null?run.time:Math.min(r.bestTime,run.time);
 const entry={time:run.time,finished:Date.now()};if(kind==='sled'){entry.gates=run.gates;entry.penalty=run.penalty;entry.hits=run.hits;r.bestGates=r.bestGates===null?run.gates:Math.max(r.bestGates,run.gates);}else{entry.steps=run.steps;entry.seed=run.seed>>>0;r.totalSteps+=run.steps;r.bestSteps=r.bestSteps===null?run.steps:Math.min(r.bestSteps,run.steps);}
 r.recent=[entry,...r.recent].slice(0,5);memory=records;try{storage.setItem(MINIGAME_RECORD_KEY,JSON.stringify(records));saved=true;dirty=false;}catch{saved=false;dirty=true;}return{records:structuredClone(records),saved};
 }
 return{read,finish};
}
const store=createMinigameRecords({getItem:key=>recordStorage.getItem(key),setItem:(key,value)=>recordStorage.setItem(key,value)});
export const readMinigameRecords=()=>store.read();
export function recordMinigame(kind,run){const result=store.finish(kind,run);globalThis.dispatchEvent(new CustomEvent('paw-minigame-record',{detail:result}));return result;}
