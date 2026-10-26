// Joystick input is independent of action pointers, allowing real multitouch.
export function createWalkControls({joystick,sprintButton,stopButton,onVector,blocked}){
 let pointer=null,down=null,lastTap=-Infinity,lastDirection={x:0,y:1},vector={x:0,y:0},auto=false,sprint=false;
 function emit(){onVector(vector);joystick.firstElementChild.style.transform=`translate(${vector.x*28}px,${-vector.y*28}px)`;joystick.classList.toggle('auto-walking',auto);stopButton.hidden=!auto;sprintButton.setAttribute('aria-pressed',String(sprint));sprintButton.textContent=sprint?'Sprinting':'Sprint';}
 function stop(){auto=false;vector={x:0,y:0};lastTap=-Infinity;emit();}
 function reset(){const id=pointer;pointer=null;down=null;auto=false;sprint=false;vector={x:0,y:0};lastTap=-Infinity;if(id!==null&&joystick.hasPointerCapture(id))joystick.releasePointerCapture(id);emit();}
 function move(e){if(e.pointerId!==pointer)return;const r=joystick.getBoundingClientRect(),radius=r.width*.38,x=(e.clientX-r.left-r.width/2)/radius,y=-(e.clientY-r.top-r.height/2)/radius,l=Math.max(1,Math.hypot(x,y));vector=Math.hypot(x,y)<.12?{x:0,y:0}:{x:x/l,y:y/l};if(Math.hypot(vector.x,vector.y)>.2){const n=Math.hypot(vector.x,vector.y);lastDirection={x:vector.x/n,y:vector.y/n};}if(down)down.distance=Math.max(down.distance,Math.hypot(e.clientX-down.x,e.clientY-down.y));emit();}
 joystick.onpointerdown=e=>{if(pointer!==null||blocked())return;e.preventDefault();const wasAuto=auto;if(wasAuto)stop();pointer=e.pointerId;down={x:e.clientX,y:e.clientY,time:e.timeStamp,distance:0,wasAuto};joystick.setPointerCapture(pointer);move(e);};
 joystick.onpointermove=move;
 joystick.onpointerup=e=>{if(e.pointerId!==pointer)return;e.preventDefault();const now=e.timeStamp,tap=down&&now-down.time<280&&down.distance<18&&!down.wasAuto;pointer=null;down=null;if(tap&&now-lastTap<340){auto=true;vector={...lastDirection};lastTap=-Infinity;}else{lastTap=tap?now:-Infinity;vector={x:0,y:0};}emit();};
 for(const type of ['pointercancel','lostpointercapture'])joystick.addEventListener(type,e=>{if(e.pointerId===pointer)reset();});
 stopButton.onclick=stop;sprintButton.onclick=()=>{if(blocked())return;sprint=!sprint;emit();};
 addEventListener('blur',reset);document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});document.addEventListener('focusin',e=>{if(e.target.closest?.('input,textarea,select,[contenteditable="true"]'))reset();});
 new MutationObserver(records=>{if(records.some(r=>r.target.tagName==='DIALOG'&&r.target.open))reset();}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
 emit();return{reset,stop,get auto(){return auto},get sprint(){return sprint},get vector(){return vector}};
}
// Safari can suppress compatibility clicks for a second finger. Act immediately,
// preserving existing handlers and keyboard clicks, and suppress a later duplicate.
export function enableMovingActions(){
 const selector='#interact,#castBtn,#howlBtn,#flyBtn,#riseBtn,#descendBtn,#sunwardCharge,#mazeEnter,#sledRaceStart,#sprintBtn,#walkStop';
 const recent=new WeakMap();
 document.addEventListener('pointerdown',e=>{const b=e.target.closest?.(selector);if(!b||b.disabled||e.pointerType==='mouse')return;e.preventDefault();e.stopPropagation();recent.set(b,performance.now());b.click();},true);
 document.addEventListener('click',e=>{const b=e.target.closest?.(selector);if(b&&e.isTrusted&&e.detail>0&&performance.now()-(recent.get(b)??-Infinity)<900){e.preventDefault();e.stopImmediatePropagation();}},true);
}
