/* Small dependency-free GIF89a writer. Palette is derived from rendered frames. */
function encodeGIF(frames,width,height,delay){
 const bytes=[],put=(...v)=>bytes.push(...v),word=v=>put(v&255,v>>8&255),str=s=>{for(const c of s)put(c.charCodeAt(0))};
 const palette=[],colors=new Map();for(const frame of frames)for(let i=0;i<frame.length;i+=4){const rgb=(frame[i]<<16)|(frame[i+1]<<8)|frame[i+2];if(!colors.has(rgb)){if(palette.length===256)throw Error('Too many colors for a lossless GIF.');colors.set(rgb,palette.length);palette.push(rgb)}}
 let bits=1;while((1<<bits)<palette.length)bits++;bits=Math.max(bits,2);const size=1<<bits;str('GIF89a');word(width);word(height);put(0x80|0x70|(bits-1),0,0);for(let i=0;i<size;i++){const c=palette[i]||0;put(c>>16&255,c>>8&255,c&255)}put(0x21,0xff,11);str('NETSCAPE2.0');put(3,1,0,0,0);
 for(let frameIndex=0;frameIndex<frames.length;frameIndex++){const rgba=frames[frameIndex];put(0x21,0xf9,4,4);word(Math.max(1,Math.round((frameIndex+1)*delay)-Math.round(frameIndex*delay)));put(0,0,0x2c);word(0);word(0);word(width);word(height);put(0,bits);
  const clear=1<<bits,end=clear+1;let dict=new Map(),next=end+1,codeSize=bits+1,acc=0,n=0,out=[];
  const emit=code=>{acc|=code<<n;n+=codeSize;while(n>=8){out.push(acc&255);acc>>>=8;n-=8}};
  const idx=i=>colors.get((rgba[i]<<16)|(rgba[i+1]<<8)|rgba[i+2]);
  emit(clear);let prefix=idx(0);for(let i=4;i<rgba.length;i+=4){const c=idx(i),key=prefix*256+c;if(dict.has(key)){prefix=dict.get(key);continue}emit(prefix);if(next<(1<<12)){if(next===(1<<codeSize)&&codeSize<12)codeSize++;dict.set(key,next++)}else{emit(clear);dict=new Map();next=end+1;codeSize=bits+1}prefix=c}emit(prefix);if(next===(1<<codeSize)&&codeSize<12)codeSize++;emit(end);if(n)out.push(acc&255);for(let i=0;i<out.length;i+=255){const block=out.slice(i,i+255);put(block.length);for(const b of block)put(b)}put(0);
 }put(0x3b);return new Uint8Array(bytes)
}
if(typeof module!=='undefined')module.exports={encodeGIF};
