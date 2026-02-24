const { createCanvas } = require('canvas');
const { GifWriter } = require('omggif');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'content-bg');
const PX = 100; // internal resolution
const FRAMES = 12;
const DELAY = 10; // centiseconds (100ms per frame)

function makeFrame() {
  const c = createCanvas(PX, PX);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return { c, ctx };
}

function getPixels(canvas) {
  const ctx = canvas.getContext('2d');
  return ctx.getImageData(0, 0, PX, PX);
}

// Quantize RGBA pixels to 256-color palette and return {palette, indexed}
function quantize(imageData) {
  const pixels = imageData.data;
  const colorMap = new Map();
  const palette = [];
  const indexed = new Uint8Array(PX * PX);
  
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
    // Reduce to 5-bit per channel for palette compression
    const qr = (r >> 3) << 3, qg = (g >> 3) << 3, qb = (b >> 3) << 3;
    const key = (qr << 16) | (qg << 8) | qb;
    
    if (!colorMap.has(key)) {
      if (palette.length >= 256) {
        // Find closest existing color
        let best = 0, bestDist = Infinity;
        for (let j = 0; j < palette.length; j++) {
          const dr = palette[j][0] - qr, dg = palette[j][1] - qg, db = palette[j][2] - qb;
          const d = dr*dr + dg*dg + db*db;
          if (d < bestDist) { bestDist = d; best = j; }
        }
        colorMap.set(key, best);
      } else {
        colorMap.set(key, palette.length);
        palette.push([qr, qg, qb]);
      }
    }
    indexed[i / 4] = colorMap.get(key);
  }
  
  // Pad palette to power of 2 (min 4 for safety)
  let size = 4;
  while (size < palette.length) size *= 2;
  if (size > 256) size = 256;
  while (palette.length < size) palette.push([0,0,0]);
  palette.length = size; // trim if over
  
  return { palette, indexed, paletteSize: size };
}

function saveGif(name, frames) {
  // Quantize first frame to get global palette
  const firstQ = quantize(frames[0]);
  
  const buf = Buffer.alloc(PX * PX * FRAMES * 5 + 100000);
  const writer = new GifWriter(buf, PX, PX, { loop: 0 });
  
  for (let i = 0; i < frames.length; i++) {
    const q = quantize(frames[i]);
    writer.addFrame(0, 0, PX, PX, q.indexed, { 
      delay: DELAY, 
      palette: q.palette,
      dispose: 2 
    });
  }
  
  const output = buf.slice(0, writer.end());
  fs.writeFileSync(path.join(OUT, name), output);
  console.log(`✅ ${name} (${output.length} bytes, ${frames.length} frames)`);
}

function setPixel(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
}

function fillBg(ctx, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, PX, PX);
}

// ============================================
// 10 ANIMATED BACKGROUNDS
// ============================================

function anim01_lava_falls() {
  const frames = [];
  for (let f = 0; f < FRAMES; f++) {
    const { c, ctx } = makeFrame();
    fillBg(ctx, '#1a0a00');
    // Dark rocky walls
    for (let y = 0; y < PX; y++) {
      for (let x = 0; x < 20; x++) setPixel(ctx, x, y, (x+y)%3===0?'#2a1a0a':'#1a0a00');
      for (let x = PX-18; x < PX; x++) setPixel(ctx, x, y, (x+y)%3===0?'#2a1a0a':'#1a0a00');
    }
    // Lava waterfall - left side
    for (let y = 0; y < PX; y++) {
      const flow = (y + f * 3) % PX;
      const x = 18 + Math.sin(y * 0.1 + f * 0.5) * 2;
      setPixel(ctx, Math.floor(x), y, '#ff6600');
      setPixel(ctx, Math.floor(x)+1, y, flow%4<2?'#ffaa00':'#ff4400');
      setPixel(ctx, Math.floor(x)+2, y, '#cc3300');
    }
    // Lava waterfall - right side
    for (let y = 0; y < PX; y++) {
      const x = PX-20 + Math.sin(y * 0.08 + f * 0.3 + 2) * 2;
      setPixel(ctx, Math.floor(x), y, '#ff4400');
      setPixel(ctx, Math.floor(x)-1, y, (y+f*2)%5<2?'#ffaa00':'#ff6600');
    }
    // Lava pool at bottom
    for (let y = 80; y < PX; y++) {
      for (let x = 15; x < PX-15; x++) {
        const wave = Math.sin(x*0.15 + f*0.5 + y*0.1);
        setPixel(ctx, x, y, wave>0.3?'#ff6600':(wave>-0.2?'#ff4400':'#cc2200'));
      }
    }
    // Embers floating up
    for (let i = 0; i < 10; i++) {
      const ex = 25 + (i * 7 + f * 3) % 50;
      const ey = PX - ((f * 4 + i * 11) % PX);
      setPixel(ctx, ex, ey, '#ffaa00');
    }
    frames.push(getPixels(c));
  }
  saveGif('lava-falls.gif', frames);
}

function anim02_northern_lights() {
  const frames = [];
  for (let f = 0; f < FRAMES; f++) {
    const { c, ctx } = makeFrame();
    fillBg(ctx, '#050515');
    // Stars
    for (let i = 0; i < 40; i++) {
      const sx = (i * 17 + 3) % PX;
      const sy = (i * 13 + 7) % 70;
      setPixel(ctx, sx, sy, i%3===0?'#ffffff':'#aabbff');
    }
    // Aurora bands
    const auroraColors = ['#00ff88', '#22cc66', '#44ffaa', '#00ddaa', '#88ffcc'];
    for (let band = 0; band < 5; band++) {
      for (let x = 0; x < PX; x++) {
        const baseY = 15 + band * 8;
        const wave = Math.sin(x * 0.08 + f * 0.5 + band * 1.5) * 5;
        const y = Math.floor(baseY + wave);
        if (y >= 0 && y < 60) {
          setPixel(ctx, x, y, auroraColors[band]);
          if (Math.random() < 0.4) setPixel(ctx, x, y+1, auroraColors[(band+1)%5]);
        }
      }
    }
    // Snow ground
    for (let y = 75; y < PX; y++) {
      for (let x = 0; x < PX; x++) {
        setPixel(ctx, x, y, (x+y)%2===0?'#ddeeff':'#ccddef');
      }
    }
    // Snow-covered hills
    for (let x = 0; x < PX; x++) {
      const hillY = 72 + Math.floor(Math.sin(x*0.06)*4);
      for (let y = hillY; y < 76; y++) setPixel(ctx, x, y, '#eef4ff');
    }
    // Snowflakes
    for (let i = 0; i < 15; i++) {
      const sx = (i * 11 + f * 3) % PX;
      const sy = (i * 8 + f * 5) % PX;
      setPixel(ctx, sx, sy, '#ffffff');
    }
    frames.push(getPixels(c));
  }
  saveGif('northern-lights.gif', frames);
}

function anim03_enchanted_rain() {
  const frames = [];
  for (let f = 0; f < FRAMES; f++) {
    const { c, ctx } = makeFrame();
    fillBg(ctx, '#0a1a2a');
    // Dark forest bg
    for (let y = 0; y < 30; y++) {
      for (let x = 0; x < PX; x++) {
        if (Math.random()<0.4) setPixel(ctx, x, y, '#0a2a0a');
      }
    }
    // Trees
    for (let t = 0; t < 6; t++) {
      const tx = t < 3 ? (5 + t * 12) : (PX - 10 - (t-3) * 12);
      for (let dy = 0; dy < 40; dy++) setPixel(ctx, tx, 75 - dy, '#2a1a0a');
      for (let row = 0; row < 15; row++) {
        const hw = Math.floor((15-row) * 0.6);
        for (let dx = -hw; dx <= hw; dx++) {
          setPixel(ctx, tx+dx, 40-row, '#1a4a1a');
        }
      }
    }
    // Ground
    for (let y = 75; y < PX; y++) {
      for (let x = 0; x < PX; x++) {
        setPixel(ctx, x, y, (x+y)%2===0?'#1a3a1a':'#0a2a0a');
      }
    }
    // Magical rain - glowing drops
    const rainColors = ['#44aaff', '#66ccff', '#88ddff', '#aaeeff'];
    for (let i = 0; i < 30; i++) {
      const rx = (i * 4 + f) % PX;
      const ry = (i * 7 + f * 8) % PX;
      setPixel(ctx, rx, ry, rainColors[i%4]);
      setPixel(ctx, rx, ry+1, rainColors[(i+1)%4]);
    }
    // Puddle reflections
    for (let i = 0; i < 8; i++) {
      const px = 20 + i * 8;
      const py = 80 + (f + i) % 5;
      setPixel(ctx, px, py, '#3366aa');
    }
    frames.push(getPixels(c));
  }
  saveGif('enchanted-rain.gif', frames);
}

function anim04_crystal_cavern() {
  const frames = [];
  for (let f = 0; f < FRAMES; f++) {
    const { c, ctx } = makeFrame();
    fillBg(ctx, '#0a0a2a');
    // Cavern walls
    for (let y = 0; y < PX; y++) {
      const lw = 15 + Math.sin(y*0.1)*5;
      const rw = 12 + Math.sin(y*0.08+1)*4;
      for (let x = 0; x < lw; x++) setPixel(ctx, x, y, (x+y)%3===0?'#2a2a4a':'#1a1a3a');
      for (let x = PX-rw; x < PX; x++) setPixel(ctx, x, y, (x+y)%3===0?'#2a2a4a':'#1a1a3a');
    }
    // Ceiling
    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < PX; x++) {
        if (Math.random()<0.5) setPixel(ctx, x, y, '#1a1a3a');
      }
    }
    // Crystals with pulsing glow
    const pulse = Math.sin(f * Math.PI / 6) * 0.5 + 0.5; // 0-1
    const crystalColors = [
      [`rgb(${100+Math.floor(pulse*100)},50,${200+Math.floor(pulse*55)})`, '#8844dd'],
      [`rgb(50,${150+Math.floor(pulse*100)},${200+Math.floor(pulse*55)})`, '#2288cc'],
      [`rgb(${200+Math.floor(pulse*55)},${100+Math.floor(pulse*100)},50)`, '#cc8822'],
    ];
    const crystalPositions = [[20,50],[35,60],[25,70],[PX-25,45],[PX-30,65],[PX-20,55]];
    for (let ci = 0; ci < crystalPositions.length; ci++) {
      const [cx, cy] = crystalPositions[ci];
      const [cMain, cDark] = crystalColors[ci % crystalColors.length];
      // Crystal shape
      for (let dy = -6; dy <= 0; dy++) {
        const w = Math.max(0, Math.floor((6+dy) * 0.4));
        for (let dx = -w; dx <= w; dx++) {
          setPixel(ctx, cx+dx, cy+dy, dy < -3 ? cMain : cDark);
        }
      }
    }
    // Floor
    for (let y = 80; y < PX; y++) {
      for (let x = 12; x < PX-10; x++) {
        setPixel(ctx, x, y, (x+y)%2===0?'#1a1a3a':'#2a2a4a');
      }
    }
    // Sparkle particles
    for (let i = 0; i < 8; i++) {
      const sx = (i * 13 + f * 5) % (PX-30) + 15;
      const sy = (i * 9 + f * 3) % 60 + 20;
      setPixel(ctx, sx, sy, f%2===0?'#ffffff':'#aabbff');
    }
    frames.push(getPixels(c));
  }
  saveGif('crystal-cavern.gif', frames);
}

function anim05_starfall() {
  const frames = [];
  for (let f = 0; f < FRAMES; f++) {
    const { c, ctx } = makeFrame();
    fillBg(ctx, '#050510');
    // Static stars
    for (let i = 0; i < 50; i++) {
      const sx = (i * 17 + 5) % PX;
      const sy = (i * 11 + 3) % PX;
      setPixel(ctx, sx, sy, i%4===0?'#ffffff':'#8899cc');
    }
    // Shooting stars / meteors
    for (let m = 0; m < 3; m++) {
      const startX = (m * 30 + f * 8) % PX;
      const startY = (m * 15 + f * 4) % 40;
      for (let t = 0; t < 8; t++) {
        const mx = startX + t * 2;
        const my = startY + t;
        if (mx < PX && my < PX) {
          setPixel(ctx, mx, my, t < 2 ? '#ffffff' : (t < 5 ? '#ffdd88' : '#886644'));
        }
      }
    }
    // Ground silhouette with hills
    for (let x = 0; x < PX; x++) {
      const gy = 78 + Math.floor(Math.sin(x*0.06)*5);
      for (let y = gy; y < PX; y++) setPixel(ctx, x, y, '#0a0a0a');
    }
    // Twinkling - some stars blink
    for (let i = 0; i < 5; i++) {
      if ((f + i) % 3 === 0) {
        const tx = (i * 23 + 11) % PX;
        const ty = (i * 19 + 7) % 70;
        setPixel(ctx, tx, ty, '#ffffff');
        setPixel(ctx, tx+1, ty, '#ffffff');
        setPixel(ctx, tx, ty+1, '#ffffff');
      }
    }
    frames.push(getPixels(c));
  }
  saveGif('starfall.gif', frames);
}

function anim06_fireflies() {
  const frames = [];
  for (let f = 0; f < FRAMES; f++) {
    const { c, ctx } = makeFrame();
    fillBg(ctx, '#0a0a0a');
    // Dark forest
    for (let t = 0; t < 5; t++) {
      const tx = t * 22 + 5;
      for (let dy = 0; dy < 50; dy++) setPixel(ctx, tx, 80-dy, '#1a1a0a');
      for (let dy = 0; dy < 50; dy++) setPixel(ctx, tx+1, 80-dy, '#2a2a1a');
      // Canopy
      for (let row = 0; row < 12; row++) {
        const hw = Math.floor((12-row)*0.8);
        for (let dx = -hw; dx <= hw; dx++) {
          setPixel(ctx, tx+dx, 32-row, '#0a2a0a');
        }
      }
    }
    // Ground
    for (let y = 80; y < PX; y++) {
      for (let x = 0; x < PX; x++) {
        setPixel(ctx, x, y, (x+y)%2===0?'#0a1a0a':'#1a2a1a');
      }
    }
    // Fireflies - orbiting paths
    for (let i = 0; i < 12; i++) {
      const cx = 20 + (i * 7) % 60;
      const cy = 30 + (i * 11) % 50;
      const angle = f * Math.PI / 6 + i * Math.PI / 3;
      const r = 3 + (i % 4);
      const fx = Math.floor(cx + Math.cos(angle) * r);
      const fy = Math.floor(cy + Math.sin(angle) * r);
      if (fx >= 0 && fx < PX && fy >= 0 && fy < PX) {
        setPixel(ctx, fx, fy, (f+i)%2===0?'#ffff44':'#aaaa22');
        // Glow
        if (fx+1 < PX) setPixel(ctx, fx+1, fy, '#444400');
        if (fy+1 < PX) setPixel(ctx, fx, fy+1, '#444400');
      }
    }
    frames.push(getPixels(c));
  }
  saveGif('fireflies.gif', frames);
}

function anim07_ocean_waves() {
  const frames = [];
  for (let f = 0; f < FRAMES; f++) {
    const { c, ctx } = makeFrame();
    // Sunset sky
    for (let y = 0; y < 35; y++) {
      const t = y / 35;
      const color = t < 0.3 ? '#ff8844' : (t < 0.6 ? '#ff6633' : '#cc4422');
      for (let x = 0; x < PX; x++) {
        setPixel(ctx, x, y, (x+y)%2===0?color:(t<0.3?'#ffaa66':'#dd5533'));
      }
    }
    // Sun
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        if (dx*dx+dy*dy <= 16) setPixel(ctx, 50+dx, 12+dy, '#ffcc00');
      }
    }
    // Ocean
    for (let y = 35; y < PX; y++) {
      for (let x = 0; x < PX; x++) {
        const wave = Math.sin(x*0.12 + f*0.5 + y*0.08);
        const color = wave > 0.3 ? '#2a6a8a' : (wave > -0.2 ? '#1a5a7a' : '#0a4a6a');
        setPixel(ctx, x, y, color);
      }
    }
    // Wave crests (white foam)
    for (let wl = 0; wl < 4; wl++) {
      const waveY = 40 + wl * 15;
      for (let x = 0; x < PX; x++) {
        const crestY = waveY + Math.floor(Math.sin(x*0.1 + f*0.5 + wl*2)*3);
        if (Math.random() < 0.6) setPixel(ctx, x, crestY, '#ffffff');
      }
    }
    frames.push(getPixels(c));
  }
  saveGif('ocean-waves.gif', frames);
}

function anim08_magic_portal() {
  const frames = [];
  for (let f = 0; f < FRAMES; f++) {
    const { c, ctx } = makeFrame();
    fillBg(ctx, '#0a0a1a');
    // Stone floor
    for (let y = 70; y < PX; y++) {
      for (let x = 0; x < PX; x++) {
        setPixel(ctx, x, y, (x+y)%3===0?'#3a3a4a':'#2a2a3a');
      }
    }
    // Stone pillars
    for (let dx = 0; dx < 6; dx++) {
      for (let dy = 0; dy < 45; dy++) {
        setPixel(ctx, 15+dx, 70-dy, dx===0||dx===5?'#1a1a2a':'#3a3a4a');
        setPixel(ctx, PX-21+dx, 70-dy, dx===0||dx===5?'#1a1a2a':'#3a3a4a');
      }
    }
    // Portal - rotating energy ring in center-back
    const portalCX = 50, portalCY = 40, portalR = 12;
    const portalColors = ['#ff44ff', '#aa22ff', '#ff66aa', '#cc44dd', '#8822cc'];
    for (let a = 0; a < 40; a++) {
      const angle = (a / 40) * Math.PI * 2 + f * Math.PI / 6;
      const px = Math.floor(portalCX + Math.cos(angle) * portalR);
      const py = Math.floor(portalCY + Math.sin(angle) * (portalR * 0.7));
      if (px >= 0 && px < PX && py >= 0 && py < PX) {
        setPixel(ctx, px, py, portalColors[a % portalColors.length]);
      }
    }
    // Portal center glow
    for (let dy = -5; dy <= 5; dy++) {
      for (let dx = -5; dx <= 5; dx++) {
        if (dx*dx+dy*dy <= 20 && Math.random()<0.5) {
          setPixel(ctx, portalCX+dx, portalCY+dy, '#dd88ff');
        }
      }
    }
    // Energy particles
    for (let i = 0; i < 8; i++) {
      const angle = f * 0.5 + i * Math.PI / 4;
      const dist = 15 + Math.sin(f * 0.3 + i) * 5;
      const px = Math.floor(portalCX + Math.cos(angle) * dist);
      const py = Math.floor(portalCY + Math.sin(angle) * dist * 0.6);
      if (px >= 0 && px < PX && py >= 0 && py < PX) {
        setPixel(ctx, px, py, '#ff88ff');
      }
    }
    frames.push(getPixels(c));
  }
  saveGif('magic-portal.gif', frames);
}

function anim09_moonrise() {
  const frames = [];
  for (let f = 0; f < FRAMES; f++) {
    const { c, ctx } = makeFrame();
    // Night sky getting lighter as moon rises
    const moonY = 35 - Math.floor(f * 2);
    fillBg(ctx, '#0a0a1a');
    // Stars
    for (let i = 0; i < 35; i++) {
      const sx = (i * 17 + 5) % PX;
      const sy = (i * 11 + 3) % 65;
      if (sy < moonY - 10 || Math.abs(sx - 50) > 15) {
        setPixel(ctx, sx, sy, '#ffffff');
      }
    }
    // Moon (rises over frames)
    if (moonY >= -6) {
      for (let dy = -6; dy <= 6; dy++) {
        for (let dx = -6; dx <= 6; dx++) {
          if (dx*dx+dy*dy <= 36) {
            const my = moonY + dy;
            if (my >= 0 && my < PX) setPixel(ctx, 50+dx, my, '#eeeedd');
          }
        }
      }
      // Moon glow
      for (let dy = -10; dy <= 10; dy++) {
        for (let dx = -10; dx <= 10; dx++) {
          if (dx*dx+dy*dy <= 100 && dx*dx+dy*dy > 36 && Math.random()<0.15) {
            const my = moonY + dy;
            if (my >= 0 && my < PX) setPixel(ctx, 50+dx, my, '#333344');
          }
        }
      }
    }
    // Water reflection
    for (let y = 70; y < PX; y++) {
      for (let x = 0; x < PX; x++) {
        const wave = Math.sin(x*0.1 + f*0.4 + y*0.15);
        setPixel(ctx, x, y, wave>0?'#0a1a3a':'#0a0a2a');
      }
    }
    // Moon reflection on water
    for (let y = 72; y < PX; y++) {
      const reflX = 50 + Math.floor(Math.sin(y*0.2 + f*0.5) * 2);
      setPixel(ctx, reflX, y, '#aaaaaa');
      if (Math.random()<0.3) setPixel(ctx, reflX+1, y, '#888888');
    }
    frames.push(getPixels(c));
  }
  saveGif('moonrise.gif', frames);
}

function anim10_rot_spread() {
  const frames = [];
  for (let f = 0; f < FRAMES; f++) {
    const { c, ctx } = makeFrame();
    fillBg(ctx, '#0a0a0a');
    // Healthy forest on right
    for (let y = 0; y < PX; y++) {
      for (let x = 60; x < PX; x++) {
        if (y < 30) setPixel(ctx, x, y, (x+y)%2===0?'#0a3a0a':'#1a4a1a');
        else if (y > 70) setPixel(ctx, x, y, (x+y)%2===0?'#1a3a1a':'#2a4a2a');
      }
    }
    // Trees on right
    for (let t = 0; t < 3; t++) {
      const tx = 70 + t * 12;
      for (let dy = 0; dy < 35; dy++) setPixel(ctx, tx, 70-dy, '#3a2a1a');
      for (let row = 0; row < 10; row++) {
        const hw = Math.floor((10-row)*0.6);
        for (let dx = -hw; dx <= hw; dx++) setPixel(ctx, tx+dx, 38-row, '#1a5a1a');
      }
    }
    // Rot boundary - creeping left to right over frames
    const rotEdge = 35 + Math.floor(f * 2);
    // Corrupted area
    for (let y = 0; y < PX; y++) {
      for (let x = 0; x < rotEdge; x++) {
        if (y < 25) setPixel(ctx, x, y, '#0a0a0a');
        else if (y > 70) {
          const rot = Math.random();
          setPixel(ctx, x, y, rot<0.3?'#1a1a0a':(rot<0.6?'#2a2a0a':'#0a0a0a'));
        }
      }
    }
    // Twisted dead trees on left
    for (let t = 0; t < 3; t++) {
      const tx = 10 + t * 15;
      for (let dy = 0; dy < 40; dy++) {
        const twist = Math.sin(dy*0.2)*3;
        setPixel(ctx, Math.floor(tx+twist), 70-dy, '#0a0a0a');
      }
    }
    // Rot edge - sickly green glow
    for (let y = 0; y < PX; y++) {
      const edgeX = rotEdge + Math.floor(Math.sin(y*0.15 + f*0.3)*3);
      if (edgeX >= 0 && edgeX < PX) {
        setPixel(ctx, edgeX, y, '#4a8a0a');
        if (edgeX+1 < PX) setPixel(ctx, edgeX+1, y, '#2a4a0a');
      }
    }
    // Toxic particles
    for (let i = 0; i < 6; i++) {
      const px = rotEdge - 10 + (i*8+f*3)%20;
      const py = (i * 13 + f * 5) % PX;
      if (px >= 0 && px < PX) setPixel(ctx, px, py, '#6aaa0a');
    }
    frames.push(getPixels(c));
  }
  saveGif('rot-spread.gif', frames);
}

// RUN ALL
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
