(()=>{
 try{
  if(localStorage.getItem('order86-analytics-opt-out')==='1'||navigator.globalPrivacyControl)return;
  const key='order86-visitor-v1';let visitor=localStorage.getItem(key);if(!/^[a-f0-9-]{36}$/.test(visitor||'')){visitor=crypto.randomUUID();localStorage.setItem(key,visitor);}
  const session=crypto.randomUUID(),path=location.pathname,game=/^\/play(?:\/|$)/.test(path);let seq=0,active=0,last=performance.now(),input=last;
  function tick(){const now=performance.now();if(game&&document.visibilityState==='visible'&&document.hasFocus()&&!document.querySelector('#loading')&&document.querySelector('canvas')&&now-input<60000)active+=Math.min(1500,Math.max(0,now-last));last=now;}
  function send(){tick();const body=JSON.stringify({visitor,session,path,seq:seq++,active:Math.floor(active)});if(!navigator.sendBeacon('/metrics/event',body))fetch('/metrics/event',{method:'POST',body,keepalive:true}).catch(()=>{});}
  for(const event of ['keydown','pointerdown','pointermove','touchstart','wheel'])addEventListener(event,e=>{if(e.isTrusted)input=performance.now();},{passive:true});
  setInterval(tick,1000);setInterval(send,15000);addEventListener('pagehide',send);document.addEventListener('visibilitychange',()=>{send();last=performance.now();});send();
 }catch{}
})();
