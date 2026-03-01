const GIFEncoder = require('gif-encoder-2');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = './content-bg';
const STILL_DIR = './content-bg/still';
const THUMB_DIR = './content-bg/thumbs';
const SMALL = 25;
const LARGE = 1000;
const FRAMES = 12;
const DELAY = 100;

// ==========================================
// HSL/RGB HELPERS
// ==========================================
function hsl(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r, g, b;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  return `rgb(${Math.round((r+m)*255)},${Math.round((g+m)*255)},${Math.round((b+m)*255)})`;
}

function hslObj(h, s, l) {
  return { h: ((h % 360) + 360) % 360, s: Math.max(0, Math.min(100, s)), l: Math.max(0, Math.min(100, l)) };
}

function hslToStr(o) { return hsl(o.h, o.s, o.l); }

function lerp(a, b, t) { return a + (b - a) * t; }

function lerpHSL(a, b, t) {
  return hsl(lerp(a.h, b.h, t), lerp(a.s, b.s, t), lerp(a.l, b.l, t));
}

function noise(x, y, seed) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 43.2341) * 43758.5453;
  return n - Math.floor(n);
}

function dither(x, y) {
  // Bayer 2x2
  const m = [[0, 2], [3, 1]];
  return m[y % 2][x % 2] / 4;
}

function dither4(x, y) {
  // Bayer 4x4
  const m = [
    [0,  8,  2, 10],
    [12, 4, 14,  6],
    [3, 11,  1,  9],
    [15, 7, 13,  5]
  ];
  return m[y % 4][x % 4] / 16;
}

// ==========================================
// UPSCALE + SAVE
// ==========================================
function upscaleCtx(smallCanvas) {
  const big = createCanvas(LARGE, LARGE);
  const ctx = big.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(smallCanvas, 0, 0, LARGE, LARGE);
  return ctx;
}

async function saveGIF(filename, drawFrame) {
  const encoder = new GIFEncoder(LARGE, LARGE);
  encoder.setDelay(DELAY);
  encoder.setRepeat(0);
  encoder.setQuality(10);
  const stream = encoder.createReadStream();
  const bufs = [];
  stream.on('data', d => bufs.push(d));
  return new Promise(resolve => {
    stream.on('end', () => {
      const buf = Buffer.concat(bufs);
      fs.writeFileSync(path.join(OUTPUT_DIR, filename), buf);
      console.log(`✅ GIF: ${filename} (${(buf.length/1024).toFixed(0)}KB)`);
      resolve();
    });
    encoder.start();
    for (let f = 0; f < FRAMES; f++) {
      const c = createCanvas(SMALL, SMALL);
      const ctx = c.getContext('2d');
      drawFrame(ctx, f, SMALL);
      encoder.addFrame(upscaleCtx(c));
    }
    encoder.finish();
  });
}

function saveStill(filename, draw) {
  const c = createCanvas(SMALL, SMALL);
  const ctx = c.getContext('2d');
  draw(ctx, 0, SMALL);
  const big = createCanvas(LARGE, LARGE);
  const bctx = big.getContext('2d');
  bctx.imageSmoothingEnabled = false;
  bctx.drawImage(c, 0, 0, LARGE, LARGE);
  const buf = big.toBuffer('image/png');
  fs.writeFileSync(path.join(STILL_DIR, filename), buf);
  console.log(`✅ Still: ${filename} (${(buf.length/1024).toFixed(0)}KB)`);
}

function saveThumbnail(srcPath, thumbName) {
  const { loadImage } = require('canvas');
  // For GIFs, just read first frame via our small canvas approach
  // We'll generate thumbs separately
}

// ==========================================
// SCENE DRAWING FUNCTIONS
// Each takes (ctx, frame, size) and fills a 25x25 canvas
// ==========================================

function drawMountainScene(ctx, f, S, palette) {
  // palette: {sky: [{h,s,l}...], mountain: [{h,s,l}...], ground: [{h,s,l}...], accent: {h,s,l}}
  const sky = palette.sky;
  const mtn = palette.mountain;
  const gnd = palette.ground;
  
  // Sky gradient with dithering
  for (let y = 0; y < 15; y++) {
    const t = y / 14;
    for (let x = 0; x < S; x++) {
      const d = dither4(x, y);
      const idx = t * (sky.length - 1);
      const lo = Math.floor(idx);
      const hi = Math.min(lo + 1, sky.length - 1);
      const frac = idx - lo;
      // Add noise for richness
      const n = noise(x, y, f * 7.3) * 8 - 4;
      const useHi = (frac + d * 0.3) > 0.5;
      const col = useHi ? sky[hi] : sky[lo];
      ctx.fillStyle = hsl(col.h + n * 0.5, col.s + n * 0.3, col.l + n);
      ctx.fillRect(x, y, 1, 1);
    }
  }
  
  // Mountains with per-pixel variation
  const peaks = [
    { cx: 4, top: 6, w: 8 },
    { cx: 12, top: 4, w: 10 },
    { cx: 20, top: 7, w: 9 },
  ];
  for (const peak of peaks) {
    for (let x = Math.max(0, peak.cx - peak.w/2); x < Math.min(S, peak.cx + peak.w/2); x++) {
      const dist = Math.abs(x - peak.cx) / (peak.w / 2);
      const top = Math.floor(peak.top + dist * dist * 8);
      for (let y = top; y < 18; y++) {
        const t = (y - top) / (18 - top);
        const shade = t * (mtn.length - 1);
        const lo = Math.floor(shade);
        const hi = Math.min(lo + 1, mtn.length - 1);
        const n = noise(x, y, f * 3.1 + peak.cx) * 6 - 3;
        const d = dither(x, y);
        const useHi = (shade - lo + d * 0.2) > 0.5;
        const col = useHi ? mtn[hi] : mtn[lo];
        ctx.fillStyle = hsl(col.h + n, col.s + n * 0.5, col.l + n);
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  
  // Ground
  for (let y = 18; y < S; y++) {
    const t = (y - 18) / (S - 18);
    for (let x = 0; x < S; x++) {
      const idx = t * (gnd.length - 1);
      const lo = Math.floor(idx);
      const hi = Math.min(lo + 1, gnd.length - 1);
      const n = noise(x, y, f * 2.7) * 10 - 5;
      const d = dither4(x, y);
      const useHi = (idx - lo + d * 0.3) > 0.5;
      const col = useHi ? gnd[hi] : gnd[lo];
      ctx.fillStyle = hsl(col.h + n * 0.3, col.s + n * 0.5, col.l + n);
      ctx.fillRect(x, y, 1, 1);
    }
  }
  
  // Animated particles
  if (palette.particles) {
    for (let i = 0; i < 8; i++) {
      const px = (i * 3 + f * 2) % S;
      const py = (i * 5 + f * 3 + Math.floor(Math.sin(f * 0.5 + i) * 3)) % (S - 5);
      ctx.fillStyle = hslToStr(palette.particles);
      ctx.fillRect(px, py, 1, 1);
    }
  }
}

function drawWaterScene(ctx, f, S, palette) {
  // Sky
  for (let y = 0; y < 10; y++) {
    const t = y / 9;
    for (let x = 0; x < S; x++) {
      const idx = t * (palette.sky.length - 1);
      const lo = Math.floor(idx);
      const hi = Math.min(lo + 1, palette.sky.length - 1);
      const n = noise(x, y, f * 5) * 6 - 3;
      const d = dither4(x, y);
      const col = (idx - lo + d * 0.3) > 0.5 ? palette.sky[hi] : palette.sky[lo];
      ctx.fillStyle = hsl(col.h + n * 0.3, col.s, col.l + n);
      ctx.fillRect(x, y, 1, 1);
    }
  }
  
  // Horizon / land strip
  for (let y = 10; y < 13; y++) {
    for (let x = 0; x < S; x++) {
      const n = noise(x, y, 42) * 6 - 3;
      const col = palette.land || hslObj(120, 30, 25);
      ctx.fillStyle = hsl(col.h + n, col.s, col.l + n);
      ctx.fillRect(x, y, 1, 1);
    }
  }
  
  // Water with sine waves
  for (let y = 13; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const wave = Math.sin(x * 0.5 + y * 0.3 + f * 0.5);
      const wave2 = Math.sin(x * 0.3 - y * 0.2 + f * 0.3 + 1.5);
      const t = (y - 13) / (S - 13);
      const idx = t * (palette.water.length - 1);
      const lo = Math.floor(idx);
      const hi = Math.min(lo + 1, palette.water.length - 1);
      const n = noise(x, y, f * 11) * 4 - 2;
      const waveShift = (wave + wave2) * 3;
      const d = dither4(x, y);
      const col = (idx - lo + d * 0.2 + wave * 0.15) > 0.5 ? palette.water[hi] : palette.water[lo];
      ctx.fillStyle = hsl(col.h + n, col.s + waveShift, col.l + n + waveShift * 0.5);
      ctx.fillRect(x, y, 1, 1);
    }
  }
  
  // Sparkles on water
  for (let i = 0; i < 6; i++) {
    const sx = (i * 4 + f * 3) % S;
    const sy = 14 + (i * 3 + f * 2) % (S - 15);
    if ((f + i) % 3 === 0) {
      ctx.fillStyle = 'rgb(255,255,255)';
      ctx.fillRect(sx, sy, 1, 1);
    }
  }
}

function drawForestScene(ctx, f, S, palette) {
  // Sky through canopy
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const t = y / (S - 1);
      const skyIdx = t * (palette.sky.length - 1);
      const lo = Math.floor(skyIdx);
      const hi = Math.min(lo + 1, palette.sky.length - 1);
      const n = noise(x, y, f * 3) * 8 - 4;
      const d = dither4(x, y);
      const col = (skyIdx - lo + d * 0.3) > 0.5 ? palette.sky[hi] : palette.sky[lo];
      ctx.fillStyle = hsl(col.h + n * 0.5, col.s + n * 0.3, col.l + n);
      ctx.fillRect(x, y, 1, 1);
    }
  }
  
  // Tree trunks
  const trunks = [3, 8, 14, 19, 23];
  for (const tx of trunks) {
    for (let y = 8; y < S; y++) {
      const n = noise(tx, y, 77) * 8 - 4;
      const col = palette.trunk;
      ctx.fillStyle = hsl(col.h + n, col.s, col.l + n);
      ctx.fillRect(tx, y, 1, 1);
    }
  }
  
  // Canopy layers with animation
  for (const tx of trunks) {
    for (let dy = -6; dy <= 0; dy++) {
      const w = Math.floor((6 + dy) * 0.7) + 1;
      const sway = Math.floor(Math.sin(f * 0.5 + tx * 0.3) * 1);
      for (let dx = -w; dx <= w; dx++) {
        const px = tx + dx + sway;
        const py = 8 + dy;
        if (px >= 0 && px < S && py >= 0) {
          const n = noise(px, py, f * 5 + tx) * 12 - 6;
          const leafIdx = Math.floor(noise(px, py, tx) * palette.leaves.length);
          const col = palette.leaves[Math.min(leafIdx, palette.leaves.length - 1)];
          ctx.fillStyle = hsl(col.h + n, col.s + n * 0.5, col.l + n);
          ctx.fillRect(px, py, 1, 1);
        }
      }
    }
  }
  
  // Ground
  for (let y = 20; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const n = noise(x, y, 99) * 10 - 5;
      const col = palette.ground;
      ctx.fillStyle = hsl(col.h + n, col.s + n * 0.3, col.l + n);
      ctx.fillRect(x, y, 1, 1);
    }
  }
  
  // Fireflies / particles
  for (let i = 0; i < 10; i++) {
    const px = (i * 3 + Math.floor(Math.sin(f * 0.7 + i * 1.5) * 2) + S) % S;
    const py = (i * 4 + Math.floor(Math.cos(f * 0.5 + i * 2) * 2) + 5) % (S - 5);
    if ((f + i) % 2 === 0) {
      ctx.fillStyle = hslToStr(palette.particles || hslObj(60, 100, 80));
      ctx.fillRect(px, py, 1, 1);
    }
  }
}

function drawCrystalScene(ctx, f, S, palette) {
  // Deep background
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const t = y / (S - 1);
      const idx = t * (palette.bg.length - 1);
      const lo = Math.floor(idx);
      const hi = Math.min(lo + 1, palette.bg.length - 1);
      const n = noise(x, y, f * 4) * 8 - 4;
      const d = dither4(x, y);
      const col = (idx - lo + d * 0.3) > 0.5 ? palette.bg[hi] : palette.bg[lo];
      ctx.fillStyle = hsl(col.h + n * 0.5, col.s + n * 0.3, col.l + n);
      ctx.fillRect(x, y, 1, 1);
    }
  }
  
  // Crystal spires
  const spires = palette.spires || [{cx:5,h:12},{cx:12,h:15},{cx:19,h:10},{cx:8,h:8},{cx:22,h:7}];
  for (const sp of spires) {
    const pulse = Math.sin(f * Math.PI / 6 + sp.cx) * 0.5 + 0.5;
    for (let dy = 0; dy < sp.h; dy++) {
      const w = Math.max(0, Math.floor((1 - dy / sp.h) * 2));
      const y = S - 5 - dy;
      for (let dx = -w; dx <= w; dx++) {
        const px = sp.cx + dx;
        if (px >= 0 && px < S && y >= 0) {
          const bright = pulse * 15 + dy * 2;
          const col = palette.crystal;
          ctx.fillStyle = hsl(col.h + dx * 5, col.s - dy, col.l + bright + noise(px, y, f) * 8);
          ctx.fillRect(px, y, 1, 1);
        }
      }
    }
  }
  
  // Sparkle particles
  for (let i = 0; i < 12; i++) {
    const px = (i * 3 + f * 2) % S;
    const py = (i * 5 + f * 4) % S;
    const pulse = Math.sin(f * Math.PI / 3 + i) > 0;
    if (pulse) {
      ctx.fillStyle = hslToStr(palette.sparkle || hslObj(200, 80, 90));
      ctx.fillRect(px, py, 1, 1);
    }
  }
}

function drawMeadowScene(ctx, f, S, palette) {
  // Sky with clouds
  for (let y = 0; y < 12; y++) {
    const t = y / 11;
    for (let x = 0; x < S; x++) {
      const idx = t * (palette.sky.length - 1);
      const lo = Math.floor(idx);
      const hi = Math.min(lo + 1, palette.sky.length - 1);
      const n = noise(x, y, f * 2) * 6 - 3;
      const d = dither4(x, y);
      const col = (idx - lo + d * 0.3) > 0.5 ? palette.sky[hi] : palette.sky[lo];
      ctx.fillStyle = hsl(col.h + n * 0.3, col.s, col.l + n);
      ctx.fillRect(x, y, 1, 1);
    }
  }
  
  // Clouds
  const cloudY = 3;
  for (let cx = 0; cx < 3; cx++) {
    const baseX = (cx * 9 + Math.floor(f * 0.5)) % (S + 4) - 2;
    for (let dy = 0; dy < 3; dy++) {
      const w = dy === 1 ? 4 : 2;
      for (let dx = 0; dx < w; dx++) {
        const px = baseX + dx - Math.floor(w / 2);
        const py = cloudY + dy - 1;
        if (px >= 0 && px < S && py >= 0 && py < S) {
          const n = noise(px, py, cx * 100) * 4;
          ctx.fillStyle = hsl(0, 0, 92 + n);
          ctx.fillRect(px, py, 1, 1);
        }
      }
    }
  }
  
  // Rolling hills
  for (let layer = 0; layer < 3; layer++) {
    const baseY = 11 + layer * 3;
    for (let x = 0; x < S; x++) {
      const hillY = baseY + Math.floor(Math.sin(x * 0.3 + layer * 2) * 1.5);
      for (let y = hillY; y < S; y++) {
        const t = (y - hillY) / (S - hillY);
        const grassIdx = Math.floor(t * (palette.grass.length - 1));
        const col = palette.grass[Math.min(grassIdx, palette.grass.length - 1)];
        const n = noise(x, y, layer * 50 + f * 3) * 10 - 5;
        const wave = Math.sin(x * 0.8 + f * 0.4 + layer) * 3;
        ctx.fillStyle = hsl(col.h + n * 0.5 + wave, col.s + n * 0.3, col.l + n + wave * 0.5);
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  
  // Flowers / particles
  for (let i = 0; i < 8; i++) {
    const px = (i * 4 + Math.floor(Math.sin(f * 0.3 + i) * 1)) % S;
    const py = 14 + (i * 3) % (S - 15);
    const col = palette.flowers[i % palette.flowers.length];
    ctx.fillStyle = hslToStr(col);
    ctx.fillRect(px, py, 1, 1);
    // Butterfly/petal animation
    if ((f + i) % 3 < 2) {
      const bx = (px + Math.floor(Math.sin(f * 0.8 + i * 2) * 2) + S) % S;
      const by = (py - 2 + Math.floor(Math.cos(f * 0.6 + i) * 2) + S) % S;
      ctx.fillStyle = hslToStr(palette.flowers[(i + 1) % palette.flowers.length]);
      ctx.fillRect(bx, by, 1, 1);
    }
  }
}

function drawAuroraScene(ctx, f, S, palette) {
  // Dark sky
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const t = y / (S - 1);
      const n = noise(x, y, 42) * 4 - 2;
      ctx.fillStyle = hsl(palette.skyHue, 30, 5 + t * 8 + n);
      ctx.fillRect(x, y, 1, 1);
    }
  }
  
  // Stars
  for (let i = 0; i < 20; i++) {
    const sx = (i * 7 + 3) % S;
    const sy = (i * 5 + 2) % 15;
    const twinkle = Math.sin(f * 0.8 + i * 1.3) > -0.3;
    if (twinkle) {
      ctx.fillStyle = hsl(0, 0, 80 + noise(sx, sy, i) * 20);
      ctx.fillRect(sx, sy, 1, 1);
    }
  }
  
  // Aurora bands with animation
  for (let band = 0; band < 4; band++) {
    const col = palette.aurora[band % palette.aurora.length];
    for (let x = 0; x < S; x++) {
      const y = Math.floor(5 + band * 3 + Math.sin(x * 0.25 + f * 0.4 + band * 1.5) * 3);
      if (y >= 0 && y < S - 5) {
        for (let dy = 0; dy < 2; dy++) {
          const py = y + dy;
          if (py < S) {
            const n = noise(x, py, f * 7 + band) * 10 - 5;
            ctx.fillStyle = hsl(col.h + n + x * 0.5, col.s + n, col.l + n - dy * 5);
            ctx.fillRect(x, py, 1, 1);
          }
        }
      }
    }
  }
  
  // Ground / snow
  for (let y = 20; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const n = noise(x, y, 123) * 8 - 4;
      const col = palette.ground;
      ctx.fillStyle = hsl(col.h + n * 0.3, col.s, col.l + n);
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function drawLavaScene(ctx, f, S, palette) {
  // Dark smoky sky
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < S; x++) {
      const t = y / 9;
      const n = noise(x, y, f * 3) * 8 - 4;
      const smoke = Math.sin(x * 0.4 + f * 0.3 + y * 0.5) * 3;
      ctx.fillStyle = hsl(palette.skyHue, 20 + smoke, 5 + t * 10 + n + smoke);
      ctx.fillRect(x, y, 1, 1);
    }
  }
  
  // Volcanic mountains
  for (let x = 0; x < S; x++) {
    const h1 = 10 - Math.floor(Math.abs(x - 12) * 0.6);
    const h2 = 12 - Math.floor(Math.abs(x - 6) * 0.8);
    const h3 = 11 - Math.floor(Math.abs(x - 20) * 0.7);
    const top = Math.min(h1, h2, h3);
    for (let y = Math.max(2, top); y < 18; y++) {
      const t = (y - top) / (18 - top);
      const n = noise(x, y, 55) * 10 - 5;
      const glow = Math.sin(f * 0.5 + x * 0.3 + y * 0.2) * 5;
      ctx.fillStyle = hsl(
        palette.rockHue + n * 0.5,
        20 + t * 15 + glow,
        10 + t * 15 + n + glow * 0.5
      );
      ctx.fillRect(x, y, 1, 1);
    }
  }
  
  // Lava flows
  for (let y = 16; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const wave = Math.sin(x * 0.4 + f * 0.6 + y * 0.3);
      const wave2 = Math.sin(x * 0.2 - f * 0.4 + y * 0.5 + 2);
      const n = noise(x, y, f * 11) * 8 - 4;
      const heat = Math.max(0, Math.min(1, (wave + wave2) * 0.25 + 0.5));
      const idx = Math.floor(heat * (palette.lava.length - 1));
      const col = palette.lava[Math.max(0, Math.min(idx, palette.lava.length - 1))];
      ctx.fillStyle = hsl(col.h + n, col.s + n * 0.5, col.l + n + wave * 5);
      ctx.fillRect(x, y, 1, 1);
    }
  }
  
  // Embers rising
  for (let i = 0; i < 12; i++) {
    const ex = (i * 3 + Math.floor(Math.sin(f * 0.3 + i) * 2) + S) % S;
    const ey = S - 1 - ((f * 2 + i * 4) % S);
    if (ey > 0) {
      ctx.fillStyle = hsl(30 + noise(ex, ey, i) * 20, 100, 60 + (f % 3) * 10);
      ctx.fillRect(ex, ey, 1, 1);
    }
  }
}

// ==========================================
// ALL SCENES TO GENERATE
// ==========================================

const SCENES = {
  // FLAME / CRUCIBLE (reds, oranges, blacks)
  'anim-flame-volcano-range': (ctx, f, S) => drawLavaScene(ctx, f, S, {
    skyHue: 10, rockHue: 15,
    lava: [hslObj(0,90,20), hslObj(10,95,30), hslObj(20,100,40), hslObj(30,100,50), hslObj(40,100,60), hslObj(50,90,65)],
  }),
  'anim-flame-lava-valley': (ctx, f, S) => drawLavaScene(ctx, f, S, {
    skyHue: 0, rockHue: 20,
    lava: [hslObj(5,85,15), hslObj(15,90,25), hslObj(25,95,35), hslObj(35,100,50), hslObj(45,100,60), hslObj(55,90,55)],
  }),
  'anim-flame-smoldering-peaks': (ctx, f, S) => drawLavaScene(ctx, f, S, {
    skyHue: 5, rockHue: 10,
    lava: [hslObj(350,80,15), hslObj(0,85,25), hslObj(10,90,35), hslObj(20,95,45), hslObj(30,100,55), hslObj(40,95,50)],
  }),
  'anim-flame-ash-clouds': (ctx, f, S) => {
    // Unique ash/fire scene
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const t = y / (S - 1);
        const ash = Math.sin(x * 0.5 + f * 0.3 + y * 0.4) * 0.5 + 0.5;
        const n = noise(x, y, f * 5) * 12 - 6;
        if (t < 0.5) {
          // Smoky sky with ash
          const fire = Math.sin(x * 0.3 + f * 0.5) * 0.3 + 0.3;
          ctx.fillStyle = hsl(10 + n, 20 + ash * 30, 8 + t * 15 + n + fire * 10);
        } else {
          // Glowing ground
          ctx.fillStyle = hsl(15 + n + ash * 10, 60 + ash * 30, 15 + (1 - t) * 20 + n);
        }
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Ash particles
    for (let i = 0; i < 15; i++) {
      const px = (i * 3 + f * 2 + Math.floor(Math.sin(f * 0.4 + i) * 3) + S) % S;
      const py = (S - (f * 2 + i * 5) % (S + 5));
      if (py >= 0 && py < S) {
        ctx.fillStyle = hsl(30, 60, 50 + noise(px, py, i) * 20);
        ctx.fillRect(px, py, 1, 1);
      }
    }
  },

  // RADIANT / AURELIUS (golds, yellows, whites)
  'anim-radiant-golden-peaks': (ctx, f, S) => drawMountainScene(ctx, f, S, {
    sky: [hslObj(40,70,75), hslObj(45,80,70), hslObj(50,85,65), hslObj(55,80,60), hslObj(35,70,55)],
    mountain: [hslObj(40,50,55), hslObj(38,45,45), hslObj(35,40,35), hslObj(30,35,25), hslObj(25,30,20)],
    ground: [hslObj(45,60,50), hslObj(50,55,45), hslObj(55,50,40), hslObj(40,45,35)],
    particles: hslObj(50, 90, 85),
  }),
  'anim-radiant-sun-ridges': (ctx, f, S) => drawMountainScene(ctx, f, S, {
    sky: [hslObj(50,90,85), hslObj(48,85,78), hslObj(45,80,70), hslObj(42,75,62), hslObj(38,70,55)],
    mountain: [hslObj(35,55,50), hslObj(33,50,42), hslObj(30,45,35), hslObj(28,40,28), hslObj(25,35,22)],
    ground: [hslObj(48,65,55), hslObj(52,60,48), hslObj(55,55,42)],
    particles: hslObj(55, 95, 90),
  }),
  'anim-radiant-wheat-mountains': (ctx, f, S) => {
    // Wheat fields with mountains behind
    // Sky
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < S; x++) {
        const t = y / 7;
        const n = noise(x, y, f) * 6 - 3;
        ctx.fillStyle = hsl(45 + n, 75 - t * 10, 80 - t * 15 + n);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Distant golden mountains
    for (let x = 0; x < S; x++) {
      const mh = 8 - Math.floor(Math.abs(x - 12) * 0.4 + Math.sin(x * 0.5) * 2);
      for (let y = Math.max(3, mh); y < 12; y++) {
        const n = noise(x, y, 77) * 8 - 4;
        ctx.fillStyle = hsl(38 + n, 40, 35 + n);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Wheat fields - animated swaying
    for (let y = 12; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const sway = Math.sin(x * 0.6 + f * 0.5 + y * 0.2) * 5;
        const n = noise(x, y, f * 3) * 10 - 5;
        const t = (y - 12) / (S - 12);
        ctx.fillStyle = hsl(45 + sway + n, 70 + sway * 2, 50 + n - t * 10);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Wheat tip highlights
    for (let i = 0; i < 10; i++) {
      const wx = (i * 3 + Math.floor(Math.sin(f * 0.5 + i) * 1)) % S;
      ctx.fillStyle = hsl(50, 90, 75);
      ctx.fillRect(wx, 12, 1, 1);
    }
  },
  'anim-sunrise-over-aurelius': (ctx, f, S) => drawMountainScene(ctx, f, S, {
    sky: [hslObj(30,90,80), hslObj(35,85,72), hslObj(40,80,65), hslObj(45,75,58), hslObj(50,70,50)],
    mountain: [hslObj(42,45,45), hslObj(40,40,38), hslObj(38,35,30), hslObj(35,30,22)],
    ground: [hslObj(50,60,45), hslObj(48,55,40), hslObj(45,50,35)],
    particles: hslObj(45, 100, 90),
  }),

  // DEEP / STILLWATER (blues, teals, whites)
  'anim-deep-coastal-cliffs': (ctx, f, S) => drawWaterScene(ctx, f, S, {
    sky: [hslObj(210,60,75), hslObj(215,65,68), hslObj(220,70,60), hslObj(225,65,52)],
    land: hslObj(30, 25, 30),
    water: [hslObj(200,70,45), hslObj(205,75,40), hslObj(210,80,35), hslObj(215,75,30), hslObj(220,70,25)],
  }),
  'anim-deep-ocean-trench': (ctx, f, S) => {
    // Deep underwater with bioluminescence
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const t = y / (S - 1);
        const n = noise(x, y, f * 4) * 8 - 4;
        const wave = Math.sin(x * 0.3 + f * 0.2 + y * 0.4) * 3;
        ctx.fillStyle = hsl(210 + n + wave, 60 + t * 20, 30 - t * 18 + n);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Bioluminescent particles
    for (let i = 0; i < 15; i++) {
      const px = (i * 4 + Math.floor(Math.sin(f * 0.5 + i * 2) * 3) + S) % S;
      const py = (i * 3 + Math.floor(Math.cos(f * 0.3 + i) * 2)) % S;
      const glow = Math.sin(f * 0.7 + i * 1.5) > -0.2;
      if (glow) {
        ctx.fillStyle = hsl(180 + i * 10, 80, 65 + (f % 3) * 5);
        ctx.fillRect(px, py, 1, 1);
      }
    }
  },
  'anim-deep-underwater-ridge': (ctx, f, S) => drawWaterScene(ctx, f, S, {
    sky: [hslObj(195,55,50), hslObj(200,60,45), hslObj(205,65,40), hslObj(210,70,35)],
    land: hslObj(200, 40, 25),
    water: [hslObj(190,60,35), hslObj(195,65,30), hslObj(200,70,25), hslObj(205,65,20), hslObj(210,60,15)],
  }),
  'anim-deep-tidal-waves': (ctx, f, S) => {
    // Dramatic tidal scene
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < S; x++) {
        const n = noise(x, y, f * 2) * 6 - 3;
        ctx.fillStyle = hsl(215 + n, 50, 60 - y * 3 + n);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Big waves
    for (let y = 8; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const wave1 = Math.sin(x * 0.5 + f * 0.7 + y * 0.2) * 8;
        const wave2 = Math.sin(x * 0.3 - f * 0.5 + y * 0.4) * 5;
        const wave3 = Math.sin(x * 0.8 + f * 0.9) * 3;
        const n = noise(x, y, f * 8) * 6 - 3;
        const combined = wave1 + wave2 + wave3;
        const t = (y - 8) / (S - 8);
        ctx.fillStyle = hsl(
          200 + combined * 0.5 + n,
          55 + combined * 2,
          35 + combined * 2 + n - t * 10
        );
        ctx.fillRect(x, y, 1, 1);
        // Foam on crests
        if (combined > 8) {
          ctx.fillStyle = hsl(200, 20, 85 + n);
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  },

  // WILD / ROOTHOLD (greens, browns)
  'anim-wild-forest-canopy': (ctx, f, S) => drawForestScene(ctx, f, S, {
    sky: [hslObj(120,40,65), hslObj(125,45,55), hslObj(130,50,45), hslObj(135,45,35), hslObj(140,40,25)],
    trunk: hslObj(25, 35, 22),
    leaves: [hslObj(100,60,35), hslObj(110,65,40), hslObj(120,70,45), hslObj(130,65,38), hslObj(115,55,30)],
    ground: hslObj(30, 30, 18),
    particles: hslObj(60, 90, 75),
  }),
  'anim-wild-mossy-range': (ctx, f, S) => drawMountainScene(ctx, f, S, {
    sky: [hslObj(140,40,70), hslObj(145,45,62), hslObj(150,50,55), hslObj(155,45,48)],
    mountain: [hslObj(120,50,40), hslObj(125,45,35), hslObj(130,40,28), hslObj(135,35,22), hslObj(140,30,18)],
    ground: [hslObj(90,55,35), hslObj(95,50,30), hslObj(100,45,25), hslObj(105,40,20)],
    particles: hslObj(80, 80, 70),
  }),
  'anim-wild-jungle-valley': (ctx, f, S) => drawForestScene(ctx, f, S, {
    sky: [hslObj(160,35,60), hslObj(150,40,50), hslObj(140,45,40), hslObj(130,50,30)],
    trunk: hslObj(20, 40, 20),
    leaves: [hslObj(90,70,30), hslObj(100,75,35), hslObj(110,80,40), hslObj(120,75,45), hslObj(80,65,28)],
    ground: hslObj(25, 35, 15),
    particles: hslObj(50, 85, 70),
  }),

  // ARCANE / ARCHIVUM (purples, cyans)
  'anim-arcane-crystal-mountains': (ctx, f, S) => drawCrystalScene(ctx, f, S, {
    bg: [hslObj(270,40,15), hslObj(265,45,20), hslObj(260,50,25), hslObj(255,55,30), hslObj(250,50,25)],
    crystal: hslObj(280, 70, 55),
    sparkle: hslObj(190, 90, 85),
  }),
  'anim-arcane-floating-peaks': (ctx, f, S) => {
    // Floating islands with arcane energy
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const t = y / (S - 1);
        const n = noise(x, y, f * 3) * 8 - 4;
        ctx.fillStyle = hsl(260 + n, 35, 10 + t * 12 + n);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Stars
    for (let i = 0; i < 15; i++) {
      const sx = (i * 5 + 2) % S, sy = (i * 3 + 1) % (S - 5);
      if (Math.sin(f * 0.6 + i) > -0.3) {
        ctx.fillStyle = hsl(0, 0, 80 + noise(sx, sy, i) * 15);
        ctx.fillRect(sx, sy, 1, 1);
      }
    }
    // Floating islands
    const islands = [{cx:6, cy:10, w:5}, {cx:16, cy:8, w:6}, {cx:22, cy:13, w:4}];
    for (const isl of islands) {
      const bob = Math.floor(Math.sin(f * 0.4 + isl.cx) * 1);
      for (let dy = 0; dy < 3; dy++) {
        const w = isl.w - dy;
        for (let dx = -Math.floor(w/2); dx <= Math.floor(w/2); dx++) {
          const px = isl.cx + dx, py = isl.cy + dy + bob;
          if (px >= 0 && px < S && py >= 0 && py < S) {
            const n = noise(px, py, isl.cx * 30) * 10 - 5;
            ctx.fillStyle = hsl(270 + n, 35 + dy * 5, 30 + n - dy * 5);
            ctx.fillRect(px, py, 1, 1);
          }
        }
      }
      // Crystal on top
      const n = noise(isl.cx, isl.cy, f) * 8;
      const pulse = Math.sin(f * Math.PI / 6 + isl.cx) * 10;
      ctx.fillStyle = hsl(200 + n, 80, 60 + pulse);
      ctx.fillRect(isl.cx, isl.cy - 1 + bob, 1, 1);
    }
    // Energy streams between islands
    for (let i = 0; i < 8; i++) {
      const px = (i * 3 + f * 2) % S;
      const py = (8 + Math.floor(Math.sin(px * 0.4 + f * 0.5) * 4));
      if (py >= 0 && py < S) {
        ctx.fillStyle = hsl(190 + noise(px, py, f) * 20, 80, 65);
        ctx.fillRect(px, py, 1, 1);
      }
    }
  },
  'anim-arcane-ruins-peaks': (ctx, f, S) => drawMountainScene(ctx, f, S, {
    sky: [hslObj(270,45,20), hslObj(265,50,25), hslObj(260,55,30), hslObj(255,50,35), hslObj(250,45,40)],
    mountain: [hslObj(275,35,30), hslObj(270,30,25), hslObj(265,25,20), hslObj(260,20,15)],
    ground: [hslObj(280,40,20), hslObj(275,35,18), hslObj(270,30,15)],
    particles: hslObj(190, 85, 80),
  }),

  // HEART / BONDSHEART (pinks, whites)
  'anim-heart-cherry-blossom-hills': (ctx, f, S) => drawMeadowScene(ctx, f, S, {
    sky: [hslObj(330,50,85), hslObj(335,55,80), hslObj(340,60,75), hslObj(345,55,70)],
    grass: [hslObj(100,50,50), hslObj(105,55,45), hslObj(110,50,40), hslObj(115,45,35)],
    flowers: [hslObj(340,70,75), hslObj(350,65,80), hslObj(330,60,70), hslObj(0,50,85)],
  }),
  'anim-heart-flower-mountains': (ctx, f, S) => drawMountainScene(ctx, f, S, {
    sky: [hslObj(320,45,80), hslObj(325,50,75), hslObj(330,55,70), hslObj(335,50,65), hslObj(340,45,60)],
    mountain: [hslObj(340,35,50), hslObj(335,30,42), hslObj(330,25,35), hslObj(325,20,28)],
    ground: [hslObj(345,50,55), hslObj(350,45,50), hslObj(355,40,45)],
    particles: hslObj(340, 80, 85),
  }),
  'anim-heart-peaceful-valley': (ctx, f, S) => drawMeadowScene(ctx, f, S, {
    sky: [hslObj(200,50,80), hslObj(210,55,75), hslObj(220,50,70), hslObj(230,45,65)],
    grass: [hslObj(95,55,48), hslObj(100,60,42), hslObj(105,55,38), hslObj(110,50,32)],
    flowers: [hslObj(340,65,75), hslObj(50,70,70), hslObj(280,55,70), hslObj(180,60,65)],
  }),
  'anim-springtime-bondsheart': (ctx, f, S) => drawMeadowScene(ctx, f, S, {
    sky: [hslObj(195,55,82), hslObj(200,60,77), hslObj(205,55,72), hslObj(210,50,67)],
    grass: [hslObj(110,60,50), hslObj(115,65,45), hslObj(120,60,40), hslObj(125,55,35)],
    flowers: [hslObj(350,70,78), hslObj(330,65,72), hslObj(10,60,75), hslObj(290,55,70)],
  }),

  // BRIGHT / HAPPY
  'anim-sunny-meadow-fireflies': (ctx, f, S) => drawMeadowScene(ctx, f, S, {
    sky: [hslObj(200,65,80), hslObj(205,60,75), hslObj(210,55,70), hslObj(215,50,65)],
    grass: [hslObj(90,65,50), hslObj(95,70,45), hslObj(100,65,40), hslObj(105,60,35)],
    flowers: [hslObj(60,80,65), hslObj(30,85,60), hslObj(0,70,65), hslObj(280,60,65)],
  }),
  'anim-crystal-clear-lake': (ctx, f, S) => drawWaterScene(ctx, f, S, {
    sky: [hslObj(200,60,82), hslObj(205,65,77), hslObj(210,60,72), hslObj(215,55,67)],
    land: hslObj(100, 45, 40),
    water: [hslObj(185,60,55), hslObj(190,65,50), hslObj(195,70,45), hslObj(200,65,40), hslObj(205,60,35)],
  }),
  'anim-rainbow-over-roothold': (ctx, f, S) => {
    // Sky
    for (let y = 0; y < 12; y++) {
      for (let x = 0; x < S; x++) {
        const n = noise(x, y, f * 2) * 6 - 3;
        ctx.fillStyle = hsl(210 + n, 55, 75 - y * 2 + n);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Rainbow arc
    const rainbowColors = [
      hslObj(0,80,55), hslObj(30,85,55), hslObj(60,80,55),
      hslObj(120,75,45), hslObj(210,80,55), hslObj(270,70,50)
    ];
    for (let x = 0; x < S; x++) {
      const dist = Math.abs(x - 12);
      const arcY = Math.floor(2 + dist * dist * 0.06);
      for (let b = 0; b < rainbowColors.length; b++) {
        const py = arcY + b;
        if (py >= 0 && py < 12 && py >= 0) {
          const col = rainbowColors[b];
          const shift = Math.sin(f * 0.3 + x * 0.2) * 5;
          ctx.fillStyle = hsl(col.h + shift, col.s, col.l + noise(x, py, b) * 8);
          ctx.fillRect(x, py, 1, 1);
        }
      }
    }
    // Green hills
    for (let y = 12; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const hill = Math.sin(x * 0.4 + 1) * 2;
        const n = noise(x, y, f * 3) * 10 - 5;
        const t = (y - 12) / (S - 12);
        ctx.fillStyle = hsl(110 + n, 55 + n, 42 - t * 8 + n + hill);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Trees
    for (const tx of [4, 10, 17, 22]) {
      ctx.fillStyle = hsl(25, 35, 22);
      ctx.fillRect(tx, 16, 1, 1); ctx.fillRect(tx, 17, 1, 1);
      for (let dy = -2; dy <= 0; dy++) {
        const w = 2 + dy;
        for (let dx = -w; dx <= w; dx++) {
          const px = tx + dx, py = 15 + dy;
          if (px >= 0 && px < S) {
            ctx.fillStyle = hsl(110 + noise(px, py, tx) * 15, 60, 35 + noise(px, py, tx * 2) * 10);
            ctx.fillRect(px, py, 1, 1);
          }
        }
      }
    }
  },
  'anim-sunny-wizard-tower': (ctx, f, S) => {
    // Bright sky
    for (let y = 0; y < 14; y++) {
      for (let x = 0; x < S; x++) {
        const n = noise(x, y, f) * 6 - 3;
        ctx.fillStyle = hsl(210 + n, 55, 78 - y * 1.5 + n);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Sun
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        if (dx*dx + dy*dy <= 5) {
          const px = 20 + dx, py = 3 + dy;
          if (px >= 0 && px < S) {
            ctx.fillStyle = hsl(45, 95, 80 + noise(px, py, f) * 8);
            ctx.fillRect(px, py, 1, 1);
          }
        }
      }
    }
    // Tower
    for (let y = 5; y < 20; y++) {
      for (let dx = -2; dx <= 2; dx++) {
        const px = 12 + dx;
        const n = noise(px, y, 42) * 8 - 4;
        ctx.fillStyle = hsl(30 + n, 25, 50 + n);
        ctx.fillRect(px, y, 1, 1);
      }
    }
    // Tower top (cone)
    for (let dy = 0; dy < 4; dy++) {
      const w = 3 - dy;
      for (let dx = -w; dx <= w; dx++) {
        const px = 12 + dx, py = 5 - dy;
        if (px >= 0 && px < S && py >= 0) {
          ctx.fillStyle = hsl(260 + noise(px, py, f) * 10, 50, 40);
          ctx.fillRect(px, py, 1, 1);
        }
      }
    }
    // Window glow (animated)
    const glow = Math.sin(f * Math.PI / 4) * 10;
    ctx.fillStyle = hsl(50, 90, 65 + glow);
    ctx.fillRect(12, 10, 1, 1);
    ctx.fillStyle = hsl(50, 85, 60 + glow);
    ctx.fillRect(12, 14, 1, 1);
    // Ground
    for (let y = 20; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const n = noise(x, y, 88) * 10 - 5;
        ctx.fillStyle = hsl(100 + n, 55, 42 + n);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Sparkles
    for (let i = 0; i < 5; i++) {
      if ((f + i) % 3 === 0) {
        const px = (i * 5 + f * 2) % S;
        const py = (i * 4 + f) % 15;
        ctx.fillStyle = hsl(45, 90, 85);
        ctx.fillRect(px, py, 1, 1);
      }
    }
  },
  'anim-golden-wheat-fields': (ctx, f, S) => {
    // Sky
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < S; x++) {
        const n = noise(x, y, f) * 5 - 2.5;
        ctx.fillStyle = hsl(210 + n, 50, 78 - y * 2 + n);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Wheat fields with wind animation
    for (let y = 10; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const wind = Math.sin(x * 0.5 + f * 0.6 + y * 0.15) * 6;
        const wind2 = Math.sin(x * 0.3 - f * 0.4) * 3;
        const n = noise(x, y, f * 5) * 8 - 4;
        const t = (y - 10) / (S - 10);
        ctx.fillStyle = hsl(45 + wind + n, 70 + wind2, 50 + n + wind * 0.5 - t * 8);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Wheat tips
    for (let x = 0; x < S; x++) {
      const tipY = 10 + Math.floor(Math.sin(x * 0.6 + f * 0.5) * 1);
      const n = noise(x, tipY, f * 7) * 8;
      ctx.fillStyle = hsl(50 + n, 85, 65 + n);
      ctx.fillRect(x, tipY, 1, 1);
    }
  },
  'anim-bright-aurora-moons': (ctx, f, S) => drawAuroraScene(ctx, f, S, {
    skyHue: 240,
    aurora: [hslObj(120,80,50), hslObj(160,75,55), hslObj(200,80,50), hslObj(280,70,55)],
    ground: hslObj(220, 20, 70),
  }),
  'anim-sunlit-forest-clearing': (ctx, f, S) => drawForestScene(ctx, f, S, {
    sky: [hslObj(200,55,78), hslObj(195,50,72), hslObj(190,45,66), hslObj(185,40,60)],
    trunk: hslObj(28, 40, 25),
    leaves: [hslObj(90,60,45), hslObj(100,65,50), hslObj(110,70,55), hslObj(120,65,48)],
    ground: hslObj(95, 45, 35),
    particles: hslObj(55, 85, 80),
  }),
  'anim-crystal-lizard-sunbathing': (ctx, f, S) => {
    // Sunny rock scene with crystal lizard
    for (let y = 0; y < 12; y++) {
      for (let x = 0; x < S; x++) {
        const n = noise(x, y, f) * 5 - 2.5;
        ctx.fillStyle = hsl(205 + n, 55, 78 - y * 2 + n);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Rocky ground
    for (let y = 12; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const n = noise(x, y, 42) * 12 - 6;
        ctx.fillStyle = hsl(30 + n, 25 + n * 0.5, 40 + n);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Crystal lizard (small sprite, animated shimmer)
    const lx = 12, ly = 16;
    const shimmer = Math.sin(f * Math.PI / 3) * 15;
    // Body
    for (let dx = -2; dx <= 2; dx++) {
      const n = noise(lx + dx, ly, f * 10) * 10;
      ctx.fillStyle = hsl(180 + n + shimmer, 70, 50 + n);
      ctx.fillRect(lx + dx, ly, 1, 1);
    }
    // Head
    ctx.fillStyle = hsl(190 + shimmer, 75, 55);
    ctx.fillRect(lx + 3, ly - 1, 1, 1);
    ctx.fillRect(lx + 3, ly, 1, 1);
    // Tail
    ctx.fillStyle = hsl(170 + shimmer, 65, 45);
    ctx.fillRect(lx - 3, ly + 1, 1, 1);
    // Crystal sparkles on body
    if (f % 2 === 0) {
      ctx.fillStyle = hsl(200, 50, 90);
      ctx.fillRect(lx, ly - 1, 1, 1);
    }
    if (f % 3 === 0) {
      ctx.fillStyle = hsl(180, 60, 88);
      ctx.fillRect(lx + 1, ly - 1, 1, 1);
    }
    // Sun rays
    for (let i = 0; i < 4; i++) {
      const rx = (i * 6 + 2) % S;
      const ry = (i * 3) % 10;
      ctx.fillStyle = hsl(50, 80, 85 + noise(rx, ry, f) * 10);
      ctx.fillRect(rx, ry, 1, 1);
    }
  },
  'anim-wizard-dog-park': (ctx, f, S) => drawMeadowScene(ctx, f, S, {
    sky: [hslObj(205,60,82), hslObj(210,55,77), hslObj(215,50,72), hslObj(220,45,67)],
    grass: [hslObj(95,65,48), hslObj(100,70,42), hslObj(105,65,38), hslObj(110,60,33)],
    flowers: [hslObj(30,75,60), hslObj(45,80,55), hslObj(340,65,70), hslObj(200,60,60)],
  }),
  'anim-owls-in-sunny-tree': (ctx, f, S) => {
    // Bright sky
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const n = noise(x, y, f) * 6 - 3;
        ctx.fillStyle = hsl(200 + n, 50, 75 - y * 1 + n);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Big tree
    const tx = 12;
    for (let y = 10; y < S; y++) {
      const n = noise(tx, y, 55) * 6 - 3;
      ctx.fillStyle = hsl(25 + n, 40, 25 + n);
      ctx.fillRect(tx - 1, y, 1, 1);
      ctx.fillRect(tx, y, 1, 1);
      ctx.fillRect(tx + 1, y, 1, 1);
    }
    // Canopy
    for (let dy = -8; dy <= 0; dy++) {
      const w = Math.floor((8 + dy) * 0.8) + 2;
      for (let dx = -w; dx <= w; dx++) {
        const px = tx + dx, py = 10 + dy;
        if (px >= 0 && px < S && py >= 0) {
          const n = noise(px, py, f * 3) * 12 - 6;
          ctx.fillStyle = hsl(105 + n, 60, 38 + n);
          ctx.fillRect(px, py, 1, 1);
        }
      }
    }
    // Owls (2 small sprites)
    const blink = f % 6 < 1;
    for (const ox of [10, 15]) {
      ctx.fillStyle = hsl(30, 45, 40);
      ctx.fillRect(ox, 6, 1, 1); ctx.fillRect(ox + 1, 6, 1, 1);
      ctx.fillStyle = hsl(30, 40, 45);
      ctx.fillRect(ox, 7, 1, 1); ctx.fillRect(ox + 1, 7, 1, 1);
      if (!blink) {
        ctx.fillStyle = hsl(50, 90, 70);
        ctx.fillRect(ox, 6, 1, 1); ctx.fillRect(ox + 1, 6, 1, 1);
      }
    }
    // Ground
    for (let y = 22; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const n = noise(x, y, 99) * 10 - 5;
        ctx.fillStyle = hsl(100 + n, 50, 40 + n);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Sun sparkles through leaves
    for (let i = 0; i < 6; i++) {
      if ((f + i) % 4 < 2) {
        const px = (i * 4 + 3) % S, py = (i * 3 + 2) % 10;
        ctx.fillStyle = hsl(50, 80, 85);
        ctx.fillRect(px, py, 1, 1);
      }
    }
  },
  'anim-sparkling-river': (ctx, f, S) => drawWaterScene(ctx, f, S, {
    sky: [hslObj(200,55,80), hslObj(205,60,75), hslObj(210,55,70)],
    land: hslObj(100, 50, 38),
    water: [hslObj(190,65,50), hslObj(195,70,45), hslObj(200,75,40), hslObj(205,70,35)],
  }),
  'anim-magic-garden-butterflies': (ctx, f, S) => drawMeadowScene(ctx, f, S, {
    sky: [hslObj(210,55,82), hslObj(215,50,77), hslObj(220,45,72)],
    grass: [hslObj(100,60,48), hslObj(110,65,42), hslObj(120,60,38), hslObj(130,55,32)],
    flowers: [hslObj(300,70,65), hslObj(340,75,70), hslObj(60,80,60), hslObj(180,65,55)],
  }),
  'anim-seven-moons-rising': (ctx, f, S) => {
    // Dark sky with 7 moons
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const n = noise(x, y, f * 2) * 6 - 3;
        ctx.fillStyle = hsl(240 + n, 30, 8 + (y / S) * 10 + n);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Stars
    for (let i = 0; i < 25; i++) {
      const sx = (i * 7 + 3) % S, sy = (i * 4 + 1) % S;
      if (Math.sin(f * 0.5 + i * 1.7) > -0.4) {
        ctx.fillStyle = hsl(0, 0, 75 + noise(sx, sy, i) * 20);
        ctx.fillRect(sx, sy, 1, 1);
      }
    }
    // 7 moons in arc
    const moonColors = [
      hslObj(0,60,70), hslObj(30,70,65), hslObj(60,80,70),
      hslObj(120,50,60), hslObj(210,60,65), hslObj(270,50,60), hslObj(330,55,68)
    ];
    for (let m = 0; m < 7; m++) {
      const angle = (m / 6) * Math.PI;
      const rise = Math.sin(f * 0.3 + m * 0.5) * 1;
      const mx = Math.floor(3 + m * 3);
      const my = Math.floor(6 + Math.sin(angle) * 4 + rise);
      const col = moonColors[m];
      ctx.fillStyle = hslToStr(col);
      ctx.fillRect(mx, my, 1, 1);
      // Glow
      const glowCol = hsl(col.h, col.s * 0.5, col.l + 15);
      if (mx > 0) ctx.fillStyle = glowCol, ctx.fillRect(mx - 1, my, 1, 1);
      if (mx < S - 1) ctx.fillStyle = glowCol, ctx.fillRect(mx + 1, my, 1, 1);
    }
    // Ground silhouette
    for (let y = 20; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const n = noise(x, y, 55) * 6 - 3;
        ctx.fillStyle = hsl(250 + n, 20, 10 + n);
        ctx.fillRect(x, y, 1, 1);
      }
    }
  },
  'anim-happy-crystal-cave': (ctx, f, S) => drawCrystalScene(ctx, f, S, {
    bg: [hslObj(200,40,25), hslObj(195,45,30), hslObj(190,50,35), hslObj(185,55,40), hslObj(180,50,35)],
    crystal: hslObj(180, 75, 60),
    sparkle: hslObj(60, 90, 85),
    spires: [{cx:3,h:8},{cx:8,h:12},{cx:13,h:10},{cx:18,h:14},{cx:23,h:9}],
  }),
  'anim-sunny-dock-morning': (ctx, f, S) => {
    // Sky
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < S; x++) {
        const n = noise(x, y, f) * 5 - 2.5;
        ctx.fillStyle = hsl(205 + n, 55, 80 - y * 2 + n);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Water
    for (let y = 10; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const wave = Math.sin(x * 0.5 + f * 0.5 + y * 0.3) * 4;
        const n = noise(x, y, f * 6) * 6 - 3;
        ctx.fillStyle = hsl(200 + wave + n, 55, 45 + wave + n);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Dock
    for (let x = 8; x < 18; x++) {
      const n = noise(x, 14, 77) * 6 - 3;
      ctx.fillStyle = hsl(25 + n, 40, 35 + n);
      ctx.fillRect(x, 14, 1, 1);
      ctx.fillRect(x, 15, 1, 1);
    }
    // Posts
    for (const px of [8, 12, 17]) {
      for (let y = 13; y < 18; y++) {
        ctx.fillStyle = hsl(25, 35, 30 + noise(px, y, 33) * 8);
        ctx.fillRect(px, y, 1, 1);
      }
    }
    // Sun reflection sparkles
    for (let i = 0; i < 6; i++) {
      if ((f + i) % 3 === 0) {
        const sx = (i * 4 + f * 2) % S;
        const sy = 16 + (i * 2) % 8;
        ctx.fillStyle = hsl(50, 80, 85);
        ctx.fillRect(sx, sy, 1, 1);
      }
    }
    // Sun
    ctx.fillStyle = hsl(45, 95, 82);
    ctx.fillRect(21, 3, 1, 1);
    ctx.fillRect(22, 3, 1, 1);
    ctx.fillRect(21, 4, 1, 1);
    ctx.fillRect(22, 4, 1, 1);
  },
  'anim-enchanted-meadow-dawn': (ctx, f, S) => drawMeadowScene(ctx, f, S, {
    sky: [hslObj(30,60,78), hslObj(35,55,72), hslObj(200,50,68), hslObj(210,45,62)],
    grass: [hslObj(90,55,45), hslObj(95,60,40), hslObj(100,55,35), hslObj(105,50,30)],
    flowers: [hslObj(50,80,65), hslObj(30,75,60), hslObj(330,65,68), hslObj(270,55,62)],
  }),
  'anim-cheerful-windmill': (ctx, f, S) => {
    // Sky
    for (let y = 0; y < 14; y++) {
      for (let x = 0; x < S; x++) {
        const n = noise(x, y, f) * 6 - 3;
        ctx.fillStyle = hsl(205 + n, 55, 80 - y * 1.5 + n);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Clouds
    for (let ci = 0; ci < 3; ci++) {
      const cx = (ci * 8 + Math.floor(f * 0.3)) % (S + 4);
      for (let dx = -2; dx <= 2; dx++) {
        const px = cx + dx;
        if (px >= 0 && px < S) {
          ctx.fillStyle = hsl(0, 0, 93 + noise(px, ci * 3 + 2, ci) * 5);
          ctx.fillRect(px, ci * 3 + 2, 1, 1);
        }
      }
    }
    // Windmill tower
    for (let y = 8; y < 20; y++) {
      const n = noise(12, y, 42) * 6;
      ctx.fillStyle = hsl(30 + n, 30, 55 + n);
      ctx.fillRect(12, y, 1, 1);
      ctx.fillRect(13, y, 1, 1);
    }
    // Rotating blades (4 directions based on frame)
    const angle = (f / FRAMES) * Math.PI * 2;
    for (let b = 0; b < 4; b++) {
      const a = angle + b * Math.PI / 2;
      const dx = Math.round(Math.cos(a) * 4);
      const dy = Math.round(Math.sin(a) * 4);
      const steps = Math.max(Math.abs(dx), Math.abs(dy));
      for (let s = 1; s <= steps; s++) {
        const px = 12 + Math.round(dx * s / steps);
        const py = 8 + Math.round(dy * s / steps);
        if (px >= 0 && px < S && py >= 0 && py < S) {
          ctx.fillStyle = hsl(25, 30, 45 + noise(px, py, b) * 10);
          ctx.fillRect(px, py, 1, 1);
        }
      }
    }
    // Ground - flower meadow
    for (let y = 20; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const n = noise(x, y, f * 2) * 10 - 5;
        const flower = noise(x, y, 123) > 0.75;
        if (flower) {
          ctx.fillStyle = hsl(340 + n * 3, 65, 65 + n);
        } else {
          ctx.fillStyle = hsl(100 + n, 55, 40 + n);
        }
        ctx.fillRect(x, y, 1, 1);
      }
    }
  },
  'anim-golden-hour-forest': (ctx, f, S) => drawForestScene(ctx, f, S, {
    sky: [hslObj(35,65,72), hslObj(40,60,65), hslObj(45,55,58), hslObj(50,50,50)],
    trunk: hslObj(20, 45, 20),
    leaves: [hslObj(35,55,40), hslObj(45,60,45), hslObj(55,65,50), hslObj(70,55,42)],
    ground: hslObj(30, 40, 22),
    particles: hslObj(45, 90, 78),
  }),

  // Additional needed GIFs
  'anim-northern-lights': (ctx, f, S) => drawAuroraScene(ctx, f, S, {
    skyHue: 230,
    aurora: [hslObj(130,80,48), hslObj(150,75,52), hslObj(170,80,45), hslObj(110,70,50)],
    ground: hslObj(210, 15, 75),
  }),
  'anim-spirit-wisps': (ctx, f, S) => {
    // Dark forest with spirit wisps
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const n = noise(x, y, f * 2) * 8 - 4;
        ctx.fillStyle = hsl(160 + n, 25, 8 + (y/S) * 10 + n);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Trees silhouettes
    for (const tx of [2, 7, 13, 18, 23]) {
      for (let y = 5; y < S; y++) {
        ctx.fillStyle = hsl(120 + noise(tx, y, 33) * 10, 20, 6);
        ctx.fillRect(tx, y, 1, 1);
      }
    }
    // Spirit wisps - multiple glowing orbs floating around
    for (let i = 0; i < 8; i++) {
      const wx = (10 + Math.floor(Math.sin(f * 0.5 + i * 1.8) * 8) + S) % S;
      const wy = (5 + i * 2 + Math.floor(Math.cos(f * 0.4 + i * 2.1) * 3) + S) % S;
      const pulse = Math.sin(f * 0.7 + i * 1.2) * 0.4 + 0.6;
      ctx.fillStyle = hsl(140 + i * 20, 60, 55 + pulse * 20);
      ctx.fillRect(wx, wy, 1, 1);
      // Glow trail
      const tx2 = (wx + Math.floor(Math.sin(f * 0.3 + i) * 1) + S) % S;
      const ty = (wy + 1) % S;
      ctx.fillStyle = hsl(140 + i * 20, 40, 35 + pulse * 10);
      ctx.fillRect(tx2, ty, 1, 1);
    }
  },
  'anim-clockwork-gears': (ctx, f, S) => {
    // Steampunk interior
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const n = noise(x, y, 42) * 8 - 4;
        ctx.fillStyle = hsl(25 + n, 25, 18 + n);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Gears (circles with teeth)
    const gears = [{cx:8,cy:10,r:5},{cx:18,cy:14,r:4},{cx:12,cy:20,r:3}];
    for (const g of gears) {
      for (let a = 0; a < 12; a++) {
        const angle = (a / 12) * Math.PI * 2 + f * Math.PI / 6 * (g.r > 4 ? 1 : -1);
        for (let r = 1; r <= g.r; r++) {
          const gx = g.cx + Math.round(Math.cos(angle) * r);
          const gy = g.cy + Math.round(Math.sin(angle) * r);
          if (gx >= 0 && gx < S && gy >= 0 && gy < S) {
            const n = noise(gx, gy, g.cx * 10) * 8;
            ctx.fillStyle = hsl(35 + n, 45, 40 + n + r * 3);
            ctx.fillRect(gx, gy, 1, 1);
          }
        }
      }
      // Hub
      ctx.fillStyle = hsl(40, 50, 55);
      ctx.fillRect(g.cx, g.cy, 1, 1);
    }
    // Steam particles
    for (let i = 0; i < 6; i++) {
      const px = (i * 4 + f * 2) % S;
      const py = (S - 1 - (f * 3 + i * 5) % S);
      if (py >= 0) {
        ctx.fillStyle = hsl(0, 0, 60 + noise(px, py, i) * 15);
        ctx.fillRect(px, py, 1, 1);
      }
    }
  },
  'anim-crystal-pulse': (ctx, f, S) => drawCrystalScene(ctx, f, S, {
    bg: [hslObj(250,45,12), hslObj(245,50,18), hslObj(240,55,24), hslObj(235,50,28), hslObj(230,45,22)],
    crystal: hslObj(200, 80, 60),
    sparkle: hslObj(180, 85, 88),
    spires: [{cx:4,h:10},{cx:10,h:14},{cx:16,h:11},{cx:21,h:13},{cx:7,h:7},{cx:24,h:6}],
  }),
  'anim-whirlpool': (ctx, f, S) => {
    // Ocean with whirlpool
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const cx = x - S/2, cy = y - S/2;
        const dist = Math.sqrt(cx*cx + cy*cy);
        const angle = Math.atan2(cy, cx) + f * 0.5 + dist * 0.3;
        const spiral = Math.sin(angle * 3 + dist * 0.5) * 0.5 + 0.5;
        const n = noise(x, y, f * 5) * 6 - 3;
        const t = dist / (S * 0.7);
        ctx.fillStyle = hsl(
          200 + spiral * 20 + n,
          55 + spiral * 20,
          25 + spiral * 20 + n - t * 5
        );
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Foam at center
    for (let i = 0; i < 5; i++) {
      const a = f * 0.8 + i * Math.PI * 2 / 5;
      const r = 2 + Math.sin(f * 0.5 + i) * 1;
      const fx = Math.floor(S/2 + Math.cos(a) * r);
      const fy = Math.floor(S/2 + Math.sin(a) * r);
      if (fx >= 0 && fx < S && fy >= 0 && fy < S) {
        ctx.fillStyle = hsl(200, 20, 85);
        ctx.fillRect(fx, fy, 1, 1);
      }
    }
  },
};

// STILL SCENE DEFINITIONS (for PNGs that need regeneration)
const STILL_SCENES = {
  'scene-wizard-dog-park': (ctx, f, S) => drawMeadowScene(ctx, 0, S, {
    sky: [hslObj(205,60,82), hslObj(210,55,77), hslObj(215,50,72)],
    grass: [hslObj(95,65,48), hslObj(100,70,42), hslObj(105,65,38), hslObj(110,60,33)],
    flowers: [hslObj(30,75,60), hslObj(45,80,55), hslObj(340,65,70), hslObj(200,60,60)],
  }),
  'scene-bondsheart-spring': (ctx, f, S) => drawMeadowScene(ctx, 0, S, {
    sky: [hslObj(195,55,82), hslObj(200,60,77), hslObj(205,55,72)],
    grass: [hslObj(110,60,50), hslObj(115,65,45), hslObj(120,60,40), hslObj(125,55,35)],
    flowers: [hslObj(350,70,78), hslObj(330,65,72), hslObj(10,60,75), hslObj(290,55,70)],
  }),
  'scene-enchanted-meadow': (ctx, f, S) => drawMeadowScene(ctx, 0, S, {
    sky: [hslObj(210,55,80), hslObj(215,50,75), hslObj(220,45,70)],
    grass: [hslObj(90,55,45), hslObj(95,60,40), hslObj(100,55,35), hslObj(105,50,30)],
    flowers: [hslObj(50,80,65), hslObj(30,75,60), hslObj(330,65,68), hslObj(270,55,62)],
  }),
  'scene-sparkling-river': (ctx, f, S) => drawWaterScene(ctx, 0, S, {
    sky: [hslObj(200,55,80), hslObj(205,60,75), hslObj(210,55,70)],
    land: hslObj(100, 50, 38),
    water: [hslObj(190,65,50), hslObj(195,70,45), hslObj(200,75,40), hslObj(205,70,35)],
  }),
  'scene-crystal-lizard-rock': (ctx, f, S) => {
    // Rocky scene with crystal lizard
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < S; x++) {
        const n = noise(x, y, 42) * 5 - 2.5;
        ctx.fillStyle = hsl(205 + n, 55, 78 - y * 2 + n);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    for (let y = 10; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const n = noise(x, y, 77) * 12 - 6;
        ctx.fillStyle = hsl(30 + n, 25, 38 + n);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Crystal lizard
    const lx = 12, ly = 15;
    for (let dx = -2; dx <= 3; dx++) {
      ctx.fillStyle = hsl(180 + noise(lx + dx, ly, 99) * 15, 70, 50);
      ctx.fillRect(lx + dx, ly, 1, 1);
    }
    ctx.fillStyle = hsl(190, 75, 55);
    ctx.fillRect(lx + 4, ly - 1, 1, 1);
    ctx.fillStyle = hsl(170, 65, 45);
    ctx.fillRect(lx - 3, ly + 1, 1, 1);
  },
};

// ==========================================
// MAIN
// ==========================================
async function main() {
  console.log('=== Quality Batch Generator ===\n');
  
  // Generate all GIFs
  const gifKeys = Object.keys(SCENES);
  console.log(`Generating ${gifKeys.length} animated backgrounds...`);
  for (const key of gifKeys) {
    await saveGIF(`${key}.gif`, SCENES[key]);
  }
  
  // Generate stills
  const stillKeys = Object.keys(STILL_SCENES);
  console.log(`\nGenerating ${stillKeys.length} still backgrounds...`);
  for (const key of stillKeys) {
    saveStill(`${key}.png`, STILL_SCENES[key]);
  }
  
  console.log('\n=== Generation complete! ===');
}

main().catch(console.error);
