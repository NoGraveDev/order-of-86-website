const { createCanvas } = require('canvas');
const GIFEncoder = require('gif-encoder-2');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'content-bg');
const PX = 100; // draw resolution
const SIZE = 400; // output resolution (4x upscale, chunky pixels)
const FRAMES = 12;
const DELAY_MS = 100;

function makeFrame() {
  const c = createCanvas(PX, PX);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return { c, ctx };
}

function setPixel(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
}

function fillBg(ctx, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, PX, PX);
}

function saveGif(name, frameCanvases) {
  const encoder = new GIFEncoder(SIZE, SIZE);
  encoder.setDelay(DELAY_MS);
  encoder.setRepeat(0);
  encoder.setQuality(10);
  encoder.start();
  
  for (const fc of frameCanvases) {
    const out = createCanvas(SIZE, SIZE);
    const octx = out.getContext('2d');
    octx.imageSmoothingEnabled = false;
    octx.drawImage(fc, 0, 0, SIZE, SIZE);
    encoder.addFrame(octx);
  }
  
  encoder.finish();
  const buf = encoder.out.getData();
  fs.writeFileSync(path.join(OUT, name), buf);
  console.log(`✅ ${name} (${buf.length} bytes, ${frameCanvases.length} frames)`);
}

// ============================================
// 10 ANIMATED BACKGROUNDS
// ============================================

function anim01_lava_falls() {
  const frames = [];
  for (let f = 0; f < FRAMES; f++) {
    const { c, ctx } = makeFrame();
    fillBg(ctx, '#1a0a00');
    for (let y = 0; y < PX; y++) {
      for (let x = 0; x < 20; x++) setPixel(ctx, x, y, (x+y)%3===0?'#2a1a0a':'#1a0a00');
      for (let x = PX-18; x < PX; x++) setPixel(ctx, x, y, (x+y)%3===0?'#2a1a0a':'#1a0a00');
    }
    for (let y = 0; y < PX; y++) {
      const x = 18 + Math.sin(y * 0.1 + f * 0.5) * 2;
      setPixel(ctx, Math.floor(x), y, '#ff6600');
      setPixel(ctx, Math.floor(x)+1, y, (y+f*3)%4<2?'#ffaa00':'#ff4400');
      setPixel(ctx, Math.floor(x)+2, y, '#cc3300');
    }
    for (let y = 0; y < PX; y++) {
      const x = PX-20 + Math.sin(y * 0.08 + f * 0.3 + 2) * 2;
      setPixel(ctx, Math.floor(x), y, '#ff4400');
      setPixel(ctx, Math.floor(x)-1, y, (y+f*2)%5<2?'#ffaa00':'#ff6600');
    }
    for (let y = 80; y < PX; y++) {
      for (let x = 15; x < PX-15; x++) {
        const wave = Math.sin(x*0.15 + f*0.5 + y*0.1);
        setPixel(ctx, x, y, wave>0.3?'#ff6600':(wave>-0.2?'#ff4400':'#cc2200'));
      }
    }
    for (let i = 0; i < 10; i++) {
      const ex = 25 + (i * 7 + f * 3) % 50;
      const ey = PX - ((f * 4 + i * 11) % PX);
      setPixel(ctx, ex, ey, '#ffaa00');
    }
    frames.push(c);
  }
  saveGif('lava-falls.gif', frames);
}

function anim02_northern_lights() {
  const frames = [];
  for (let f = 0; f < FRAMES; f++) {
    const { c, ctx } = makeFrame();
    fillBg(ctx, '#050515');
    for (let i = 0; i < 40; i++) {
      setPixel(ctx, (i*17+3)%PX, (i*13+7)%70, i%3===0?'#ffffff':'#aabbff');
    }
    const colors = ['#00ff88','#22cc66','#44ffaa','#00ddaa','#88ffcc'];
    for (let band = 0; band < 5; band++) {
      for (let x = 0; x < PX; x++) {
        const y = Math.floor(15 + band*8 + Math.sin(x*0.08+f*0.5+band*1.5)*5);
        if (y >= 0 && y < 60) {
          setPixel(ctx, x, y, colors[band]);
          if (Math.random()<0.4) setPixel(ctx, x, y+1, colors[(band+1)%5]);
        }
      }
    }
    for (let y = 75; y < PX; y++)
      for (let x = 0; x < PX; x++)
        setPixel(ctx, x, y, (x+y)%2===0?'#ddeeff':'#ccddef');
    for (let x = 0; x < PX; x++) {
      const hy = 72 + Math.floor(Math.sin(x*0.06)*4);
      for (let y = hy; y < 76; y++) setPixel(ctx, x, y, '#eef4ff');
    }
    for (let i = 0; i < 15; i++)
      setPixel(ctx, (i*11+f*3)%PX, (i*8+f*5)%PX, '#ffffff');
    frames.push(c);
  }
  saveGif('northern-lights.gif', frames);
}

function anim03_enchanted_rain() {
  const frames = [];
  for (let f = 0; f < FRAMES; f++) {
    const { c, ctx } = makeFrame();
    fillBg(ctx, '#0a1a2a');
    for (let y = 0; y < 30; y++)
      for (let x = 0; x < PX; x++)
        if (Math.random()<0.4) setPixel(ctx, x, y, '#0a2a0a');
    for (let t = 0; t < 6; t++) {
      const tx = t < 3 ? (5+t*12) : (PX-10-(t-3)*12);
      for (let dy = 0; dy < 40; dy++) setPixel(ctx, tx, 75-dy, '#2a1a0a');
      for (let row = 0; row < 15; row++) {
        const hw = Math.floor((15-row)*0.6);
        for (let dx = -hw; dx <= hw; dx++) setPixel(ctx, tx+dx, 40-row, '#1a4a1a');
      }
    }
    for (let y = 75; y < PX; y++)
      for (let x = 0; x < PX; x++)
        setPixel(ctx, x, y, (x+y)%2===0?'#1a3a1a':'#0a2a0a');
    const rc = ['#44aaff','#66ccff','#88ddff','#aaeeff'];
    for (let i = 0; i < 30; i++) {
      const rx = (i*4+f)%PX, ry = (i*7+f*8)%PX;
      setPixel(ctx, rx, ry, rc[i%4]);
      setPixel(ctx, rx, ry+1, rc[(i+1)%4]);
    }
    frames.push(c);
  }
  saveGif('enchanted-rain.gif', frames);
}

function anim04_crystal_cavern() {
  const frames = [];
  for (let f = 0; f < FRAMES; f++) {
    const { c, ctx } = makeFrame();
    fillBg(ctx, '#0a0a2a');
    for (let y = 0; y < PX; y++) {
      const lw = 15+Math.sin(y*0.1)*5, rw = 12+Math.sin(y*0.08+1)*4;
      for (let x = 0; x < lw; x++) setPixel(ctx, x, y, (x+y)%3===0?'#2a2a4a':'#1a1a3a');
      for (let x = PX-rw; x < PX; x++) setPixel(ctx, x, y, (x+y)%3===0?'#2a2a4a':'#1a1a3a');
    }
    for (let y = 0; y < 15; y++)
      for (let x = 0; x < PX; x++)
        if (Math.random()<0.5) setPixel(ctx, x, y, '#1a1a3a');
    const pulse = Math.sin(f*Math.PI/6)*0.5+0.5;
    const cColors = [
      [`rgb(${100+Math.floor(pulse*100)},50,${200+Math.floor(pulse*55)})`, '#8844dd'],
      [`rgb(50,${150+Math.floor(pulse*100)},${200+Math.floor(pulse*55)})`, '#2288cc'],
      [`rgb(${200+Math.floor(pulse*55)},${100+Math.floor(pulse*100)},50)`, '#cc8822'],
    ];
    const cPos = [[20,50],[35,60],[25,70],[PX-25,45],[PX-30,65],[PX-20,55]];
    for (let ci = 0; ci < cPos.length; ci++) {
      const [cx,cy] = cPos[ci];
      const [cMain,cDark] = cColors[ci%cColors.length];
      for (let dy = -6; dy <= 0; dy++) {
        const w = Math.max(0, Math.floor((6+dy)*0.4));
        for (let dx = -w; dx <= w; dx++) setPixel(ctx, cx+dx, cy+dy, dy<-3?cMain:cDark);
      }
    }
    for (let y = 80; y < PX; y++)
      for (let x = 12; x < PX-10; x++)
        setPixel(ctx, x, y, (x+y)%2===0?'#1a1a3a':'#2a2a4a');
    for (let i = 0; i < 8; i++) {
      const sx = (i*13+f*5)%(PX-30)+15, sy = (i*9+f*3)%60+20;
      setPixel(ctx, sx, sy, f%2===0?'#ffffff':'#aabbff');
    }
    frames.push(c);
  }
  saveGif('crystal-cavern.gif', frames);
}

function anim05_starfall() {
  const frames = [];
  for (let f = 0; f < FRAMES; f++) {
    const { c, ctx } = makeFrame();
    fillBg(ctx, '#050510');
    for (let i = 0; i < 50; i++)
      setPixel(ctx, (i*17+5)%PX, (i*11+3)%PX, i%4===0?'#ffffff':'#8899cc');
    for (let m = 0; m < 3; m++) {
      const sx = (m*30+f*8)%PX, sy = (m*15+f*4)%40;
      for (let t = 0; t < 8; t++) {
        const mx = sx+t*2, my = sy+t;
        if (mx < PX && my < PX) setPixel(ctx, mx, my, t<2?'#ffffff':(t<5?'#ffdd88':'#886644'));
      }
    }
    for (let x = 0; x < PX; x++) {
      const gy = 78+Math.floor(Math.sin(x*0.06)*5);
      for (let y = gy; y < PX; y++) setPixel(ctx, x, y, '#0a0a0a');
    }
    for (let i = 0; i < 5; i++) {
      if ((f+i)%3===0) {
        const tx=(i*23+11)%PX, ty=(i*19+7)%70;
        setPixel(ctx, tx, ty, '#ffffff'); setPixel(ctx, tx+1, ty, '#ffffff');
      }
    }
    frames.push(c);
  }
  saveGif('starfall.gif', frames);
}

function anim06_fireflies() {
  const frames = [];
  for (let f = 0; f < FRAMES; f++) {
    const { c, ctx } = makeFrame();
    fillBg(ctx, '#0a0a0a');
    for (let t = 0; t < 5; t++) {
      const tx = t*22+5;
      for (let dy = 0; dy < 50; dy++) { setPixel(ctx, tx, 80-dy, '#1a1a0a'); setPixel(ctx, tx+1, 80-dy, '#2a2a1a'); }
      for (let row = 0; row < 12; row++) {
        const hw = Math.floor((12-row)*0.8);
        for (let dx = -hw; dx <= hw; dx++) setPixel(ctx, tx+dx, 32-row, '#0a2a0a');
      }
    }
    for (let y = 80; y < PX; y++)
      for (let x = 0; x < PX; x++)
        setPixel(ctx, x, y, (x+y)%2===0?'#0a1a0a':'#1a2a1a');
    for (let i = 0; i < 12; i++) {
      const cx = 20+(i*7)%60, cy = 30+(i*11)%50;
      const angle = f*Math.PI/6+i*Math.PI/3, r = 3+(i%4);
      const fx = Math.floor(cx+Math.cos(angle)*r), fy = Math.floor(cy+Math.sin(angle)*r);
      if (fx >= 0 && fx < PX && fy >= 0 && fy < PX) {
        setPixel(ctx, fx, fy, (f+i)%2===0?'#ffff44':'#aaaa22');
        if (fx+1<PX) setPixel(ctx, fx+1, fy, '#444400');
        if (fy+1<PX) setPixel(ctx, fx, fy+1, '#444400');
      }
    }
    frames.push(c);
  }
  saveGif('fireflies.gif', frames);
}

function anim07_ocean_waves() {
  const frames = [];
  for (let f = 0; f < FRAMES; f++) {
    const { c, ctx } = makeFrame();
    for (let y = 0; y < 35; y++) {
      const t = y/35;
      for (let x = 0; x < PX; x++)
        setPixel(ctx, x, y, (x+y)%2===0?(t<0.3?'#ff8844':'#cc4422'):(t<0.3?'#ffaa66':'#dd5533'));
    }
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++)
        if (dx*dx+dy*dy<=16) setPixel(ctx, 50+dx, 12+dy, '#ffcc00');
    for (let y = 35; y < PX; y++)
      for (let x = 0; x < PX; x++) {
        const wave = Math.sin(x*0.12+f*0.5+y*0.08);
        setPixel(ctx, x, y, wave>0.3?'#2a6a8a':(wave>-0.2?'#1a5a7a':'#0a4a6a'));
      }
    for (let wl = 0; wl < 4; wl++) {
      const wy = 40+wl*15;
      for (let x = 0; x < PX; x++) {
        const cy = wy+Math.floor(Math.sin(x*0.1+f*0.5+wl*2)*3);
        if (Math.random()<0.6) setPixel(ctx, x, cy, '#ffffff');
      }
    }
    frames.push(c);
  }
  saveGif('ocean-waves.gif', frames);
}

function anim08_magic_portal() {
  const frames = [];
  for (let f = 0; f < FRAMES; f++) {
    const { c, ctx } = makeFrame();
    fillBg(ctx, '#0a0a1a');
    for (let y = 70; y < PX; y++)
      for (let x = 0; x < PX; x++)
        setPixel(ctx, x, y, (x+y)%3===0?'#3a3a4a':'#2a2a3a');
    for (let dx = 0; dx < 6; dx++)
      for (let dy = 0; dy < 45; dy++) {
        setPixel(ctx, 15+dx, 70-dy, dx===0||dx===5?'#1a1a2a':'#3a3a4a');
        setPixel(ctx, PX-21+dx, 70-dy, dx===0||dx===5?'#1a1a2a':'#3a3a4a');
      }
    const pcx = 50, pcy = 40, pr = 12;
    const pc = ['#ff44ff','#aa22ff','#ff66aa','#cc44dd','#8822cc'];
    for (let a = 0; a < 40; a++) {
      const angle = (a/40)*Math.PI*2+f*Math.PI/6;
      const px = Math.floor(pcx+Math.cos(angle)*pr), py = Math.floor(pcy+Math.sin(angle)*(pr*0.7));
      if (px>=0&&px<PX&&py>=0&&py<PX) setPixel(ctx, px, py, pc[a%pc.length]);
    }
    for (let dy = -5; dy <= 5; dy++)
      for (let dx = -5; dx <= 5; dx++)
        if (dx*dx+dy*dy<=20&&Math.random()<0.5) setPixel(ctx, pcx+dx, pcy+dy, '#dd88ff');
    for (let i = 0; i < 8; i++) {
      const angle = f*0.5+i*Math.PI/4, dist = 15+Math.sin(f*0.3+i)*5;
      const px = Math.floor(pcx+Math.cos(angle)*dist), py = Math.floor(pcy+Math.sin(angle)*dist*0.6);
      if (px>=0&&px<PX&&py>=0&&py<PX) setPixel(ctx, px, py, '#ff88ff');
    }
    frames.push(c);
  }
  saveGif('magic-portal.gif', frames);
}

function anim09_moonrise() {
  const frames = [];
  for (let f = 0; f < FRAMES; f++) {
    const { c, ctx } = makeFrame();
    fillBg(ctx, '#0a0a1a');
    const moonY = 35 - Math.floor(f*2);
    for (let i = 0; i < 35; i++) {
      const sx=(i*17+5)%PX, sy=(i*11+3)%65;
      if (sy < moonY-10 || Math.abs(sx-50)>15) setPixel(ctx, sx, sy, '#ffffff');
    }
    if (moonY >= -6) {
      for (let dy = -6; dy <= 6; dy++)
        for (let dx = -6; dx <= 6; dx++)
          if (dx*dx+dy*dy<=36 && moonY+dy>=0 && moonY+dy<PX) setPixel(ctx, 50+dx, moonY+dy, '#eeeedd');
      for (let dy = -10; dy <= 10; dy++)
        for (let dx = -10; dx <= 10; dx++)
          if (dx*dx+dy*dy<=100&&dx*dx+dy*dy>36&&Math.random()<0.15&&moonY+dy>=0&&moonY+dy<PX)
            setPixel(ctx, 50+dx, moonY+dy, '#333344');
    }
    for (let y = 70; y < PX; y++)
      for (let x = 0; x < PX; x++) {
        const wave = Math.sin(x*0.1+f*0.4+y*0.15);
        setPixel(ctx, x, y, wave>0?'#0a1a3a':'#0a0a2a');
      }
    for (let y = 72; y < PX; y++) {
      const rx = 50+Math.floor(Math.sin(y*0.2+f*0.5)*2);
      setPixel(ctx, rx, y, '#aaaaaa');
      if (Math.random()<0.3) setPixel(ctx, rx+1, y, '#888888');
    }
    frames.push(c);
  }
  saveGif('moonrise.gif', frames);
}

function anim10_rot_spread() {
  const frames = [];
  for (let f = 0; f < FRAMES; f++) {
    const { c, ctx } = makeFrame();
    fillBg(ctx, '#0a0a0a');
    for (let y = 0; y < PX; y++) {
      for (let x = 60; x < PX; x++) {
        if (y<30) setPixel(ctx, x, y, (x+y)%2===0?'#0a3a0a':'#1a4a1a');
        else if (y>70) setPixel(ctx, x, y, (x+y)%2===0?'#1a3a1a':'#2a4a2a');
      }
    }
    for (let t = 0; t < 3; t++) {
      const tx = 70+t*12;
      for (let dy = 0; dy < 35; dy++) setPixel(ctx, tx, 70-dy, '#3a2a1a');
      for (let row = 0; row < 10; row++) {
        const hw = Math.floor((10-row)*0.6);
        for (let dx = -hw; dx <= hw; dx++) setPixel(ctx, tx+dx, 38-row, '#1a5a1a');
      }
    }
    const rotEdge = 35+Math.floor(f*2);
    for (let y = 0; y < PX; y++) {
      for (let x = 0; x < rotEdge; x++) {
        if (y < 25) setPixel(ctx, x, y, '#0a0a0a');
        else if (y > 70) setPixel(ctx, x, y, Math.random()<0.3?'#1a1a0a':(Math.random()<0.5?'#2a2a0a':'#0a0a0a'));
      }
    }
    for (let t = 0; t < 3; t++) {
      const tx = 10+t*15;
      for (let dy = 0; dy < 40; dy++) {
        const twist = Math.sin(dy*0.2)*3;
        setPixel(ctx, Math.floor(tx+twist), 70-dy, '#0a0a0a');
      }
    }
    for (let y = 0; y < PX; y++) {
      const ex = rotEdge+Math.floor(Math.sin(y*0.15+f*0.3)*3);
      if (ex>=0&&ex<PX) { setPixel(ctx, ex, y, '#4a8a0a'); if(ex+1<PX) setPixel(ctx, ex+1, y, '#2a4a0a'); }
    }
    for (let i = 0; i < 6; i++) {
      const px = rotEdge-10+(i*8+f*3)%20, py = (i*13+f*5)%PX;
      if (px>=0&&px<PX) setPixel(ctx, px, py, '#6aaa0a');
    }
    frames.push(c);
  }
  saveGif('rot-spread.gif', frames);
}

console.log('Generating 10 animated backgrounds...\n');
anim01_lava_falls();
anim02_northern_lights();
anim03_enchanted_rain();
anim04_crystal_cavern();
anim05_starfall();
anim06_fireflies();
anim07_ocean_waves();
anim08_magic_portal();
anim09_moonrise();
anim10_rot_spread();
console.log('\n✅ All 10 animated backgrounds generated!');
