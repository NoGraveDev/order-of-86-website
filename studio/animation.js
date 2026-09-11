/* Deterministic, whole-pixel animation. Frame 24 wraps exactly to frame 0. */
function animatePixels(source,scene,frame){
 const out=new Uint8ClampedArray(source),t=((frame%24)+24)%24,e=scene.effect;
 const hex=s=>[parseInt(s.slice(1,3),16),parseInt(s.slice(3,5),16),parseInt(s.slice(5,7),16)];
 const accent=hex(scene.color||'#d9fa87'),warm=[[255,176,76],[239,101,43],[255,223,125]],cool=[[129,229,231],[90,169,199],[206,243,250]],pink=[[255,171,210],[206,105,176],[255,214,230]],green=[[103,238,197],[68,174,158],[190,247,205]],violet=[[199,161,240],[149,107,204],[231,211,250]];
 const dot=(x,y,color=accent,w=1,h=1)=>{for(let dy=0;dy<h;dy++)for(let dx=0;dx<w;dx++){const px=Math.round(x)+dx,py=Math.round(y)+dy;if(px<0||py<0||px>24||py>24)continue;const j=(py*25+px)*4;out[j]=color[0];out[j+1]=color[1];out[j+2]=color[2];out[j+3]=255}};
 const colored=(x,y)=>{const i=(y*25+x)*4,r=source[i],g=source[i+1],b=source[i+2];return {r,g,b,i}};
 if(['fire','lava','aurora','roots','fungi','runes','heart','shimmer','beacon','pulse'].includes(e)){
  for(let y=0;y<25;y++)for(let x=0;x<25;x++){const {r,g,b}=colored(x,y);let on=false,palette=cool;
   if(e==='fire'||e==='lava'){on=r>g*1.25&&r>b*1.4&&r>180&&g>60&&(y>10||Math.abs(x-15)<2);palette=warm}
   if(e==='aurora'){on=y<12&&g>r*1.2&&g>b*.85;palette=green}
   if(e==='roots'){on=y>9&&g>r*1.15&&g>b*.95;palette=green}
   if(e==='fungi'){on=y>8&&((g>r*1.12&&g>110)||(b>r*1.2&&b>110));palette=green}
   if(e==='runes'){on=b>g*1.2&&r>g*1.08&&b>145;palette=violet}
   if(e==='heart'){on=r>g*1.22&&b>g*1.07&&r>135;palette=pink}
   if(e==='shimmer'){on=b>r*1.1&&g>r*1.08&&g>145;palette=cool}
   if(e==='beacon'){on=g>140&&b>125&&g>r*1.05;palette=cool}
   if(e==='pulse'){on=r>155&&g>130&&b<g*.9&&x>7&&x<18&&y<14;palette=warm}
   const phase=(Math.floor(t/4)+Math.floor((x+y)/3))%3;if(on)dot(x,y,palette[phase]);
  }
 }
 if(['water','tide'].includes(e)){
  for(let y=15;y<25;y++){const shift=Math.round(Math.sin(2*Math.PI*(t/24+y/8)));for(let x=0;x<25;x++){const from=(y*25+Math.max(0,Math.min(24,x+shift)))*4;out.set(source.subarray(from,from+4),(y*25+x)*4)}}
  for(let i=0;i<6;i++)dot((i*7+t)%24,17+i%7,cool[(i+Math.floor(t/4))%3],2)
 }
 if(e==='echo'){for(let y=2;y<24;y++)for(let x=1;x<24;x++){const d=Math.abs(x-12)+Math.abs(y-12);if((d+Math.floor(t/2))%6===0&&(x<6||x>18||y<7))dot(x,y,violet[Math.floor(t/4)%3])}}
 if(e==='rays'){for(let x=1;x<24;x+=5)for(let y=1;y<16;y++){if((y+t)%8<2)dot(x,y,warm[Math.floor(t/4)%3])}}
 if(e==='books'){for(let i=0;i<5;i++){const x=i%2?20:2,y=4+i*4+Math.round(Math.sin(2*Math.PI*t/24+i));dot(x,y,violet[i%3],3,1);dot(x+1,y+1,[231,211,250],2,1)}}
 if(e==='mist'){for(let i=0;i<4;i++){const x=(i*7+t)%24;dot(x,17+i*2,[95,133,131],3,1)}}
 if(e==='lanterns'){for(let i=0;i<5;i++){const x=2+i*5+Math.round(Math.sin(2*Math.PI*t/24+i)),y=3+i%3;dot(x,y,[120,147,141]);dot(x,y+1,warm[(Math.floor(t/4)+i)%3],1,2)}}
 if(e==='sparkles'){const colors=['#ed8b48','#f9d367','#679bdc','#76c984','#a383d6','#e59dce'].map(hex);for(let i=0;i<6;i++){if((t+i*3)%12<4)dot(2+i*4,12+(i%2)*3,colors[i])}}
 for(let i=0;i<8;i++){
  let x=(i*7+3)%24,y=(i*11+2)%24;
  if(e==='snow')dot(x,(y+t)%24);
  else if(e==='embers'||e==='fire'){const yy=(y-t+24)%24;if(yy>6)dot(x,yy,warm[i%3]);}
  else if(e==='leaves')dot((x+t)%24,(y+t)%24,[136,201,91]);
  else if(e==='pollen')dot((x+t)%24,3+(y+Math.round(Math.sin(t*Math.PI/12)))%19);
  else if(e==='drips'){y=(i*4+t)%24;dot(x,y);if(y>19&&t%4===0)dot(x-1,23,cool[1],3)}
  else if(['stars','light'].includes(e)){if((t+i*3)%12<3)dot(x,1+i%6)}
  else if(['pulse','roots','beacon','fungi','shimmer','aurora','runes','heart','lava'].includes(e)){if((t+i*3)%12<3)dot(x,2+i*3%21)}
 }
 // New scenes use bounded surface motion and fading particles, all on the same pixel grid.
 const phase=t/24,turn=phase*Math.PI*2;
 const blend=(x,y,c,a=1)=>{x=Math.round(x);y=Math.round(y);if(x<0||x>24||y<0||y>24)return;const j=(y*25+x)*4;dot(x,y,c.map((v,k)=>Math.round(out[j+k]*(1-a)+v*a)))};
 const glow=(x,y,c,a)=>{blend(x,y,c,a);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])blend(x+dx,y+dy,c,a*.16)};
 const wave=(top,c)=>{for(let y=top;y<25;y++)for(let x=0;x<25;x++){const here=colored(x,y);if(here.g<here.r*1.06||here.b<here.r*1.08)continue;const shift=Math.round(Math.sin(turn+(y-top)*.9));const xx=Math.max(0,Math.min(24,x+shift)),j=(y*25+xx)*4;if(source[j+1]>source[j]*1.06&&source[j+2]>source[j]*1.08)out.set(source.subarray(j,j+4),(y*25+x)*4);if((x+Math.floor(t/3)+y*3)%11===0)blend(x,y,c,.28)}};
 if(e==='cascade'||e==='gateway'){
  const left=4,right=e==='cascade'?6:9;
  for(let y=4;y<16;y++)for(let x=left;x<=right;x++){const {r,g,b}=colored(x,y);if(g>r*1.05&&b>r*1.1){const a=.12+.48*(.5+.5*Math.sin(turn*2+y*1.1+x));blend(x,y,cool[2],a)}}
  wave(16,cool[2]);for(let i=0;i<3;i++){const q=(phase+i/3)%1;blend(left+1+i*2,16-Math.sin(q*Math.PI)*2,cool[2],Math.sin(q*Math.PI)*.75);blend(left-1+i*3,17,cool[2],.2+.4*Math.sin(q*Math.PI))}
 }
 if(e==='foundry'){
  for(let y=8;y<25;y++)for(let x=0;x<25;x++){const {r,g,b}=colored(x,y);if(r>g*1.2&&g>b*1.2&&r>130&&(x>15||y>20))blend(x,y,warm[2],.1+.35*(.5+.5*Math.sin(turn*2-y*.8+x*.4)))}
  for(let i=0;i<6;i++){const q=(phase+i/6)%1,x=20+i%3+Math.sin(q*Math.PI*2+i)*.6;glow(x,10-q*8,warm[i%3],Math.sin(q*Math.PI)*.8)}
 }
 if(e==='sunwheel'){
  for(let i=0;i<8;i++){const a=turn+i*Math.PI/4;glow(19+Math.cos(a)*3.5,4+Math.sin(a)*3.5,warm[2],.45+.35*Math.sin(i+turn)**2)}
  for(let y=10;y<18;y++)blend(18-Math.floor((y-10)/3),y,warm[2],(.1+.12*Math.sin(turn+y*.4)**2)*(18-y)/8);
 }
 if(e==='fireflies'||e==='wisps'){
  const c=e==='wisps'?green[2]:[239,246,154];
  for(let i=0;i<8;i++){const a=turn+i*2.39,x=2+(i*5)%21+Math.sin(a)*1.4,y=(e==='wisps'?12:5)+(i*3)%9+Math.cos(a)*1.3;glow(x,y,c,.15+.75*(.5+.5*Math.sin(turn+i*1.7))**2)}
  if(e==='wisps')for(let x=0;x<25;x++)for(let y=18;y<23;y++)blend(x,y,[116,163,169],.06+.1*(.5+.5*Math.sin(turn+x*.35+y)));
 }
 if(e==='harbor'){
  wave(14,cool[1]);
  for(let i=0;i<15;i++){const q=(phase+i/15)%1,x=(i*7-Math.floor(q*4)+25)%25,y=q*24;blend(x,y,cool[2],.32*Math.sin(q*Math.PI));blend(x,y+1,cool[1],.16*Math.sin(q*Math.PI))}
  const sweep=3+9*(.5+.5*Math.sin(turn));for(let x=5;x<23;x++){const y=4+(22-x)*.08;blend(x,y,[240,236,183],Math.max(0,1-Math.abs(x-sweep)/6)*.3)}glow(22,4,[240,236,183],.45+.3*Math.sin(turn)**2);
 }
 if(e==='spellfall'){
  for(let y=0;y<23;y++)for(let x=0;x<25;x++){const {r,g,b}=colored(x,y);if((y<7||x<5||x>20)&&r>g*1.02&&g>b*1.2&&g>120)blend(x,y,warm[2],.12+.3*(.5+.5*Math.sin(turn+y*.6)))}
  for(let i=0;i<5;i++){const q=(phase+i/5)%1,x=6+i*3+Math.sin(turn+i),y=3+q*10,a=Math.sin(q*Math.PI)*.8;glow(x,y,violet[2],a);blend(x+1,y-1,violet[0],a*.7);if(i%2===0)blend(x-1,y+1,warm[2],a*.6)}
 }
 if(e==='wishes'){
  for(let i=0;i<6;i++){const q=(phase+i/6)%1,x=2+i*4+Math.sin(turn+i)*.7,y=14-q*15,a=Math.sin(q*Math.PI);glow(x,y,warm[0],a*.95);blend(x,y+1,warm[2],a*.9)}
 }
 if(e==='petals'){
  for(let i=0;i<10;i++){const q=(phase+i/10)%1,x=(i*7+q*6)%25,y=q*24,a=Math.sin(q*Math.PI);blend(x+Math.sin(turn+i),y,pink[i%3],a*.95);if((t+i)%8<3)blend(x+1+Math.sin(turn+i),y,pink[2],a*.6)}
 }
 if(scene.frames===48){
  // Fixed palette across the loop keeps GIFs lossless and the original dog colors intact.
  const palette=[],seen=new Set();
  const add=c=>{const key=c.join(',');if(!seen.has(key)){seen.add(key);palette.push(c)}};
  for(let i=0;i<source.length;i+=4){const c=Array.from(source.slice(i,i+3));add(c);for(const a of [.3,.6])add(c.map((v,k)=>Math.round(v*(1-a)+accent[k]*a)))}
  [...warm,...cool,...pink,...green,...violet,accent,[239,246,154]].forEach(add);
  const cache=new Map();for(let j=0;j<out.length;j+=4){const key=(out[j]<<16)|(out[j+1]<<8)|out[j+2];let c=cache.get(key);if(!c){let best=Infinity;for(const p of palette){const d=(p[0]-out[j])**2+(p[1]-out[j+1])**2+(p[2]-out[j+2])**2;if(d<best){best=d;c=p}}cache.set(key,c)}out.set(c,j)}
 }
 return out;
}
if(typeof module!=='undefined')module.exports={animatePixels};
