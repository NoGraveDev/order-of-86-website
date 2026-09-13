const key='pawtheon-chess-player-v1';let fallback;
export function playerProfile(){
 try{let value=localStorage.getItem(key);if(!/^[a-f0-9]{64}$/.test(value||'')){value=crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');localStorage.setItem(key,value);}return value;}
 catch{return fallback??=crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');}
}
