const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'content-bg', 'still');
fs.mkdirSync(OUT, { recursive: true });

// Pixel art at 160x160, upscaled 5x to 800x800
const PX = 160;
const SCALE = 5;
const SIZE = PX * SCALE;

function makeCanvas(bgColor = '#0a0a0a') {
  const c = createCanvas(PX, PX);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  // Fill entire canvas to prevent white gaps
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, PX, PX);
  return { c, ctx };
}

function save(name, canvas) {
  const out = createCanvas(SIZE, SIZE);
  const octx = out.getContext('2d');
  octx.imageSmoothingEnabled = false;
  octx.drawImage(canvas, 0, 0, SIZE, SIZE);
  const buf = out.toBuffer('image/png');
  fs.writeFileSync(path.join(OUT, name), buf);
  console.log(`✅ ${name} (${buf.length} bytes)`);
}

// Helpers
function setPixel(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
}

function dither(ctx, x, y, w, h, c1, c2, density = 0.5) {
  for (let py = y; py < y + h; py++) {
    for (let px = x; px < x + w; px++) {
      const use2 = ((px + py) % 2 === 0) ? (Math.random() < density) : (Math.random() < density * 0.5);
      setPixel(ctx, px, py, use2 ? c2 : c1);
    }
  }
}

function gradient(ctx, x, y, w, h, colors) {
  const segH = h / (colors.length - 1);
  for (let py = y; py < y + h; py++) {
    const seg = Math.min(Math.floor((py - y) / segH), colors.length - 2);
    const t = ((py - y) - seg * segH) / segH;
    for (let px = x; px < x + w; px++) {
      const useNext = ((px + py) % 2 === 0) ? (t > 0.5) : (t > 0.3);
      setPixel(ctx, px, py, useNext ? colors[seg + 1] : colors[seg]);
    }
  }
}

function fillRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawStar(ctx, x, y, color) {
  setPixel(ctx, x, y, color);
}

function drawStars(ctx, count, yMax, colors) {
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * PX);
    const y = Math.floor(Math.random() * yMax);
    setPixel(ctx, x, y, colors[Math.floor(Math.random() * colors.length)]);
  }
}

function drawMountain(ctx, peakX, peakY, width, height, c1, c2, cOutline) {
  for (let row = 0; row <= height; row++) {
    const t = row / height;
    const halfW = Math.floor(width * t / 2);
    const y = peakY + row;
    for (let dx = -halfW; dx <= halfW; dx++) {
      const x = peakX + dx;
      if (x < 0 || x >= PX) continue;
      if (dx === -halfW || dx === halfW) {
        setPixel(ctx, x, y, cOutline);
      } else {
        const shade = dx < 0 ? c1 : c2;
        setPixel(ctx, x, y, shade);
      }
    }
  }
}

function drawTree(ctx, x, baseY, height, trunkH, leafColor, trunkColor, outline) {
  // trunk
  for (let dy = 0; dy < trunkH; dy++) {
    setPixel(ctx, x, baseY - dy, trunkColor);
  }
  // leaves - triangle
  const leafH = height - trunkH;
  const startY = baseY - trunkH;
  for (let row = 0; row < leafH; row++) {
    const t = row / leafH;
    const halfW = Math.floor((1 - t) * (height / 3));
    const y = startY - (leafH - row);
    for (let dx = -halfW; dx <= halfW; dx++) {
      if (dx === -halfW || dx === halfW) {
        setPixel(ctx, x + dx, y, outline);
      } else {
        setPixel(ctx, x + dx, y, leafColor);
      }
    }
  }
}

function drawColumn(ctx, x, baseY, height, width, c1, cOutline) {
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      if (dx === 0 || dx === width - 1) {
        setPixel(ctx, x + dx, baseY - dy, cOutline);
      } else {
        setPixel(ctx, x + dx, baseY - dy, c1);
      }
    }
  }
  // cap
  for (let dx = -1; dx <= width; dx++) {
    setPixel(ctx, x + dx, baseY - height, cOutline);
  }
}

function drawCircle(ctx, cx, cy, r, color, outline) {
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= r) {
        const isEdge = dist > r - 1.2;
        setPixel(ctx, cx + dx, cy + dy, isEdge && outline ? outline : color);
      }
    }
  }
}

function drawGlow(ctx, cx, cy, r, color, alpha) {
  // simple glow - scattered pixels around center
  for (let i = 0; i < r * 8; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * r;
    const x = Math.floor(cx + Math.cos(angle) * dist);
    const y = Math.floor(cy + Math.sin(angle) * dist);
    if (Math.random() < 0.4 && x >= 0 && x < PX && y >= 0 && y < PX) {
      setPixel(ctx, x, y, color);
    }
  }
}

function drawTower(ctx, x, baseY, width, height, bodyColor, roofColor, outline, windowColor) {
  // body
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      if (dx === 0 || dx === width - 1) {
        setPixel(ctx, x + dx, baseY - dy, outline);
      } else {
        setPixel(ctx, x + dx, baseY - dy, bodyColor);
      }
    }
  }
  // pointed roof
  const roofH = Math.floor(width * 0.8);
  for (let row = 0; row < roofH; row++) {
    const t = row / roofH;
    const hw = Math.floor((1 - t) * (width / 2 + 2));
    const y = baseY - height - (roofH - row);
    for (let dx = -hw; dx <= hw; dx++) {
      if (Math.abs(dx) === hw) {
        setPixel(ctx, x + width / 2 + dx, y, outline);
      } else {
        setPixel(ctx, x + width / 2 + dx, y, roofColor);
      }
    }
  }
  // windows
  if (windowColor) {
    for (let wy = 0; wy < 3; wy++) {
      const wy2 = baseY - height * 0.2 - wy * (height * 0.25);
      setPixel(ctx, x + Math.floor(width / 2), Math.floor(wy2), windowColor);
      setPixel(ctx, x + Math.floor(width / 2) - 1, Math.floor(wy2), windowColor);
    }
  }
}

// ============================================
// BACKGROUNDS
// ============================================

function bg01_frosthollow() {
  const { c, ctx } = makeCanvas("#0a1a3a");
  // sky: dark blue to lighter blue
  gradient(ctx, 0, 0, PX, 60, ['#0a0a2e', '#1a1a4e', '#2a3a6e']);
  // aurora bands
  for (let band = 0; band < 4; band++) {
    const y = 8 + band * 12;
    for (let x = 0; x < PX; x++) {
      const wave = Math.sin(x * 0.1 + band * 2) * 3;
      if (Math.random() < 0.7) {
        setPixel(ctx, x, Math.floor(y + wave), ['#4eff8e', '#22cc66', '#66ffaa', '#88ffcc'][band]);
      }
      if (Math.random() < 0.3) {
        setPixel(ctx, x, Math.floor(y + wave + 1), '#2aff7744');
      }
    }
  }
  // stars
  drawStars(ctx, 40, 55, ['#ffffff', '#aaddff', '#eeeeff']);
  // ice cavern walls - left
  for (let y = 50; y < PX; y++) {
    const w = 20 + Math.sin(y * 0.15) * 8 + Math.sin(y * 0.05) * 5;
    for (let x = 0; x < w; x++) {
      const shade = x < w - 3 ? '#2a4a6e' : (x < w - 1 ? '#3a6a9e' : '#4a8abe');
      setPixel(ctx, x, y, (x + y) % 3 === 0 ? '#1a2a4e' : shade);
    }
  }
  // ice cavern walls - right
  for (let y = 50; y < PX; y++) {
    const w = 20 + Math.sin(y * 0.12 + 1) * 8;
    for (let x = PX - w; x < PX; x++) {
      const shade = x > PX - w + 3 ? '#2a4a6e' : (x > PX - w + 1 ? '#3a6a9e' : '#4a8abe');
      setPixel(ctx, x, y, (x + y) % 3 === 0 ? '#1a2a4e' : shade);
    }
  }
  // icicles hanging from cave top
  for (let i = 0; i < 12; i++) {
    const ix = 10 + i * 12 + Math.floor(Math.random() * 5);
    const len = 3 + Math.floor(Math.random() * 8);
    for (let dy = 0; dy < len; dy++) {
      setPixel(ctx, ix, 50 + dy, dy < 2 ? '#aaddff' : '#6699cc');
    }
  }
  // frozen lake floor
  for (let y = 130; y < PX; y++) {
    for (let x = 20; x < PX - 20; x++) {
      const ice = (x + y) % 2 === 0 ? '#88ccee' : '#aaddff';
      setPixel(ctx, x, y, ice);
    }
  }
  // ice crystals scattered
  for (let i = 0; i < 8; i++) {
    const cx = 30 + Math.floor(Math.random() * 100);
    const cy = 115 + Math.floor(Math.random() * 12);
    for (let dy = -3; dy <= 0; dy++) {
      setPixel(ctx, cx, cy + dy, '#bbddff');
    }
    setPixel(ctx, cx - 1, cy - 1, '#99bbdd');
    setPixel(ctx, cx + 1, cy - 1, '#99bbdd');
  }
  // ground reflective line
  for (let x = 20; x < PX - 20; x++) {
    if (Math.random() < 0.5) setPixel(ctx, x, 129, '#cceeff');
  }
  save('01-frosthollow.png', c);
}

function bg02_ember_wastes() {
  const { c, ctx } = makeCanvas("#2a1a0a");
  // smoky sky
  gradient(ctx, 0, 0, PX, 50, ['#1a0a0a', '#3a1a0a', '#5a2a0a']);
  // smoke particles
  for (let i = 0; i < 30; i++) {
    setPixel(ctx, Math.floor(Math.random() * PX), Math.floor(Math.random() * 50), 
             Math.random() < 0.5 ? '#4a3a2a' : '#3a2a1a');
  }
  // distant volcanoes silhouette
  drawMountain(ctx, 25, 35, 40, 25, '#2a1a0a', '#3a1a0a', '#1a0a00');
  drawMountain(ctx, 130, 38, 35, 22, '#2a1a0a', '#3a1a0a', '#1a0a00');
  // volcano glow at peaks
  drawGlow(ctx, 25, 33, 5, '#ff6600', 0.5);
  drawGlow(ctx, 130, 36, 4, '#ff4400', 0.5);
  // rocky ground
  for (let y = 90; y < PX; y++) {
    for (let x = 0; x < PX; x++) {
      const base = y > 130 ? '#2a1a0a' : '#3a2210';
      const detail = (x + y * 3) % 7 === 0 ? '#4a2a10' : base;
      setPixel(ctx, x, y, detail);
    }
  }
  // lava rivers
  for (let x = 0; x < PX; x++) {
    const lavaY = 120 + Math.sin(x * 0.08) * 5;
    for (let dy = -1; dy <= 1; dy++) {
      const y = Math.floor(lavaY + dy);
      const glow = dy === 0 ? '#ff8800' : (dy === -1 ? '#ffaa00' : '#cc4400');
      setPixel(ctx, x, y, glow);
    }
    // lava glow above
    if (Math.random() < 0.3) setPixel(ctx, x, Math.floor(lavaY - 2), '#ff660044');
  }
  // second lava stream
  for (let x = 0; x < PX; x++) {
    const lavaY = 145 + Math.sin(x * 0.12 + 2) * 3;
    setPixel(ctx, x, Math.floor(lavaY), '#ff6600');
    setPixel(ctx, x, Math.floor(lavaY) + 1, '#cc3300');
  }
  // obsidian formations left & right
  for (let i = 0; i < 3; i++) {
    const bx = 5 + i * 8;
    const bh = 15 + Math.floor(Math.random() * 10);
    for (let dy = 0; dy < bh; dy++) {
      const w = Math.max(1, Math.floor((1 - dy / bh) * 4));
      for (let dx = 0; dx < w; dx++) {
        setPixel(ctx, bx + dx, 90 - dy, dy % 3 === 0 ? '#1a1a2a' : '#0a0a1a');
      }
    }
  }
  for (let i = 0; i < 3; i++) {
    const bx = 140 + i * 7;
    const bh = 12 + Math.floor(Math.random() * 10);
    for (let dy = 0; dy < bh; dy++) {
      const w = Math.max(1, Math.floor((1 - dy / bh) * 3));
      for (let dx = 0; dx < w; dx++) {
        setPixel(ctx, bx + dx, 90 - dy, '#0a0a1a');
      }
    }
  }
  // ember particles floating up
  for (let i = 0; i < 25; i++) {
    const x = 30 + Math.floor(Math.random() * 100);
    const y = 50 + Math.floor(Math.random() * 70);
    setPixel(ctx, x, y, ['#ff8800', '#ffaa00', '#ff4400'][Math.floor(Math.random() * 3)]);
  }
  save('02-ember-wastes.png', c);
}

function bg03_sunward_heights() {
  const { c, ctx } = makeCanvas("#ffeea0");
  // golden sky
  gradient(ctx, 0, 0, PX, 70, ['#fff8e0', '#ffe8a0', '#ffd060', '#ffb830']);
  // sun
  drawCircle(ctx, 80, 20, 10, '#ffffff', '#fff4cc');
  drawGlow(ctx, 80, 20, 15, '#fff8cc', 0.3);
  // clouds below
  for (let y = 70; y < 85; y++) {
    for (let x = 0; x < PX; x++) {
      const cloud = Math.sin(x * 0.05 + y * 0.1) * 0.5 + 0.5;
      if (cloud > 0.3) {
        setPixel(ctx, x, y, (x + y) % 2 === 0 ? '#ffffff' : '#fff8ee');
      } else {
        setPixel(ctx, x, y, '#ffeedd');
      }
    }
  }
  // mountain peaks poking through clouds
  drawMountain(ctx, 15, 55, 30, 30, '#e0d8c8', '#f0e8d8', '#b0a898');
  drawMountain(ctx, 145, 58, 28, 27, '#e0d8c8', '#f0e8d8', '#b0a898');
  // snow caps
  for (let dx = -4; dx <= 4; dx++) {
    setPixel(ctx, 15 + dx, 55 + Math.abs(dx), '#ffffff');
    setPixel(ctx, 145 + dx, 58 + Math.abs(dx), '#ffffff');
  }
  // white stone platform (center ground)
  for (let y = 110; y < PX; y++) {
    for (let x = 15; x < PX - 15; x++) {
      const stone = (x + y) % 4 === 0 ? '#d8d0c0' : ((x * 3 + y) % 5 === 0 ? '#c8c0b0' : '#e8e0d0');
      setPixel(ctx, x, y, stone);
    }
  }
  // stone edges
  for (let x = 15; x < PX - 15; x++) {
    setPixel(ctx, x, 110, '#b0a898');
  }
  // golden pillars left and right
  drawColumn(ctx, 20, 109, 35, 4, '#ffd060', '#cc9930');
  drawColumn(ctx, 132, 109, 35, 4, '#ffd060', '#cc9930');
  // light beams
  for (let beam = 0; beam < 3; beam++) {
    const bx = 50 + beam * 25;
    for (let y = 0; y < 110; y++) {
      if ((y + beam) % 3 === 0) {
        setPixel(ctx, bx, y, '#ffffff');
        if (Math.random() < 0.3) setPixel(ctx, bx + 1, y, '#fff8cc');
      }
    }
  }
  save('03-sunward-heights.png', c);
}

function bg04_deepwood() {
  const { c, ctx } = makeCanvas("#0a1a0a");
  // dark canopy sky
  gradient(ctx, 0, 0, PX, 30, ['#0a1a0a', '#0a2a0a', '#0a3a15']);
  // massive tree trunks - left
  for (let y = 0; y < PX; y++) {
    const w = 25 + Math.sin(y * 0.04) * 5;
    for (let x = 0; x < w; x++) {
      const bark = (x + y) % 3 === 0 ? '#3a2a1a' : (y % 5 === 0 ? '#4a3a2a' : '#2a1a0a');
      setPixel(ctx, x, y, bark);
    }
    // moss
    if (Math.random() < 0.3) setPixel(ctx, Math.floor(w - 1), y, '#2a6a2a');
  }
  // massive tree trunk - right
  for (let y = 0; y < PX; y++) {
    const w = 22 + Math.sin(y * 0.05 + 1) * 4;
    for (let x = PX - w; x < PX; x++) {
      const bark = (x + y) % 3 === 0 ? '#3a2a1a' : '#2a1a0a';
      setPixel(ctx, x, y, bark);
    }
    if (Math.random() < 0.3) setPixel(ctx, PX - Math.floor(w), y, '#2a6a2a');
  }
  // canopy leaves top
  for (let y = 0; y < 35; y++) {
    for (let x = 20; x < PX - 20; x++) {
      if (Math.random() < 0.6) {
        setPixel(ctx, x, y, ['#0a3a0a', '#1a4a1a', '#0a2a0a', '#2a5a2a'][Math.floor(Math.random() * 4)]);
      }
    }
  }
  // light rays filtering through
  for (let ray = 0; ray < 4; ray++) {
    const rx = 40 + ray * 22;
    for (let y = 30; y < 120; y++) {
      if (Math.random() < 0.15) {
        setPixel(ctx, rx + Math.floor(Math.random() * 3), y, '#4a8a4a');
      }
    }
  }
  // forest floor
  for (let y = 120; y < PX; y++) {
    for (let x = 25; x < PX - 22; x++) {
      const ground = (x + y) % 2 === 0 ? '#1a2a0a' : '#2a3a1a';
      setPixel(ctx, x, y, Math.random() < 0.1 ? '#3a4a2a' : ground);
    }
  }
  // bioluminescent mushrooms
  const mushColors = ['#00ffaa', '#00ddff', '#44ff88', '#22eebb'];
  for (let i = 0; i < 10; i++) {
    const mx = 30 + Math.floor(Math.random() * 100);
    const my = 118 + Math.floor(Math.random() * 15);
    const mc = mushColors[i % mushColors.length];
    // stem
    setPixel(ctx, mx, my, '#888866');
    setPixel(ctx, mx, my - 1, '#888866');
    // cap
    setPixel(ctx, mx - 1, my - 2, mc);
    setPixel(ctx, mx, my - 2, mc);
    setPixel(ctx, mx + 1, my - 2, mc);
    setPixel(ctx, mx, my - 3, mc);
    // glow
    if (Math.random() < 0.5) {
      setPixel(ctx, mx, my - 4, mc);
      setPixel(ctx, mx - 1, my - 3, mc);
    }
  }
  // roots across floor
  for (let r = 0; r < 5; r++) {
    let rx = 25 + r * 25;
    let ry = 125 + Math.floor(Math.random() * 10);
    for (let seg = 0; seg < 15; seg++) {
      setPixel(ctx, rx, ry, '#3a2a1a');
      rx += Math.random() < 0.5 ? 1 : 0;
      ry += Math.random() < 0.3 ? 1 : 0;
    }
  }
  save('04-deepwood.png', c);
}

function bg05_abyssal_reaches() {
  const { c, ctx } = makeCanvas("#020a10");
  // deep ocean gradient
  gradient(ctx, 0, 0, PX, PX, ['#0a1a2a', '#0a2a3a', '#0a3a4a', '#051520', '#020a10']);
  // underwater cliff - left
  for (let y = 40; y < PX; y++) {
    const w = 30 + Math.sin(y * 0.08) * 8 - (y - 40) * 0.1;
    for (let x = 0; x < Math.max(5, w); x++) {
      const rock = (x + y) % 3 === 0 ? '#1a3a4a' : '#0a2a3a';
      setPixel(ctx, x, y, rock);
    }
  }
  // underwater cliff - right  
  for (let y = 40; y < PX; y++) {
    const w = 28 + Math.sin(y * 0.06 + 2) * 6 - (y - 40) * 0.1;
    for (let x = PX - Math.max(5, w); x < PX; x++) {
      setPixel(ctx, x, y, (x + y) % 3 === 0 ? '#1a3a4a' : '#0a2a3a');
    }
  }
  // cliff edge where it drops
  for (let x = 25; x < PX - 25; x++) {
    setPixel(ctx, x, 100, '#2a5a6a');
    setPixel(ctx, x, 101, '#1a3a4a');
  }
  // seafloor ledge
  for (let y = 95; y < 102; y++) {
    for (let x = 25; x < PX - 25; x++) {
      setPixel(ctx, x, y, (x + y) % 2 === 0 ? '#1a4a5a' : '#0a3a4a');
    }
  }
  // the abyss below - darkness
  for (let y = 102; y < PX; y++) {
    for (let x = 25; x < PX - 25; x++) {
      const depth = (y - 102) / (PX - 102);
      if (Math.random() < 0.05) {
        setPixel(ctx, x, y, '#0a1a2a');
      }
    }
  }
  // bioluminescent creatures in the abyss
  for (let i = 0; i < 15; i++) {
    const bx = 30 + Math.floor(Math.random() * 100);
    const by = 105 + Math.floor(Math.random() * 50);
    setPixel(ctx, bx, by, ['#00aaff', '#00ffcc', '#4488ff', '#22ddaa'][Math.floor(Math.random() * 4)]);
  }
  // bubbles rising
  for (let i = 0; i < 20; i++) {
    const bx = 35 + Math.floor(Math.random() * 90);
    const by = 20 + Math.floor(Math.random() * 70);
    setPixel(ctx, bx, by, '#4a8aaa');
  }
  // coral on cliff edges
  const coralColors = ['#ff4466', '#ff6644', '#ff8866', '#cc4488'];
  for (let i = 0; i < 12; i++) {
    const side = i < 6 ? 'left' : 'right';
    const cx = side === 'left' ? (20 + Math.floor(Math.random() * 10)) : (PX - 30 + Math.floor(Math.random() * 10));
    const cy = 45 + Math.floor(Math.random() * 50);
    for (let dy = 0; dy < 4; dy++) {
      setPixel(ctx, cx, cy - dy, coralColors[Math.floor(Math.random() * coralColors.length)]);
    }
    setPixel(ctx, cx - 1, cy - 2, coralColors[0]);
    setPixel(ctx, cx + 1, cy - 3, coralColors[1]);
  }
  // light rays from above
  for (let ray = 0; ray < 3; ray++) {
    const rx = 50 + ray * 25;
    for (let y = 0; y < 90; y++) {
      if ((y + ray) % 4 === 0) setPixel(ctx, rx, y, '#1a4a5a');
    }
  }
  save('05-abyssal-reaches.png', c);
}

function bg06_violet_highlands() {
  const { c, ctx } = makeCanvas("#1a0a2a");
  // purple twilight sky
  gradient(ctx, 0, 0, PX, 50, ['#1a0a2a', '#2a1a4a', '#3a2a5a']);
  drawStars(ctx, 25, 40, ['#ffffff', '#ddccff', '#eeddff']);
  // fortress buildings - left
  for (let y = 30; y < PX; y++) {
    for (let x = 0; x < 35; x++) {
      const stone = (x + y) % 4 === 0 ? '#4a3a5a' : ((x * 2 + y) % 5 === 0 ? '#6a5a7a' : '#3a2a4a');
      setPixel(ctx, x, y, stone);
    }
  }
  // rune inscriptions on left wall
  for (let i = 0; i < 8; i++) {
    const ry = 40 + i * 14;
    for (let dx = 0; dx < 6; dx++) {
      if (Math.random() < 0.5) setPixel(ctx, 28 + dx, ry, '#aa88ff');
      if (Math.random() < 0.3) setPixel(ctx, 28 + dx, ry + 1, '#8866dd');
    }
  }
  // fortress buildings - right
  for (let y = 35; y < PX; y++) {
    for (let x = PX - 32; x < PX; x++) {
      const stone = (x + y) % 4 === 0 ? '#4a3a5a' : '#3a2a4a';
      setPixel(ctx, x, y, stone);
    }
  }
  // rune inscriptions on right wall
  for (let i = 0; i < 7; i++) {
    const ry = 45 + i * 15;
    for (let dx = 0; dx < 5; dx++) {
      if (Math.random() < 0.5) setPixel(ctx, PX - 30 + dx, ry, '#aa88ff');
    }
  }
  // tower tops
  drawTower(ctx, 8, 30, 8, 25, '#3a2a4a', '#5a4a6a', '#2a1a3a', '#aa88ff');
  drawTower(ctx, PX - 18, 35, 8, 22, '#3a2a4a', '#5a4a6a', '#2a1a3a', '#aa88ff');
  // cobblestone street
  for (let y = 125; y < PX; y++) {
    for (let x = 35; x < PX - 32; x++) {
      const cobble = ((x + y) % 6 < 1) ? '#2a1a3a' : ((x * 2 + y) % 8 < 2 ? '#5a4a6a' : '#4a3a5a');
      setPixel(ctx, x, y, cobble);
    }
  }
  // glowing rune lines on street
  for (let x = 40; x < PX - 35; x++) {
    if (x % 8 < 3) {
      setPixel(ctx, x, 135, '#7744aa');
      setPixel(ctx, x, 145, '#6633aa');
    }
  }
  // floating magical particles
  for (let i = 0; i < 15; i++) {
    setPixel(ctx, 40 + Math.floor(Math.random() * 80), 50 + Math.floor(Math.random() * 70), '#bb99ff');
  }
  save('06-violet-highlands.png', c);
}

function bg07_shadowmire() {
  const { c, ctx } = makeCanvas("#0a0a0a");
  // dark murky sky
  gradient(ctx, 0, 0, PX, 50, ['#0a0a0a', '#0a1a0a', '#1a2a1a']);
  // fog
  for (let y = 40; y < 60; y++) {
    for (let x = 0; x < PX; x++) {
      if (Math.random() < 0.2) setPixel(ctx, x, y, '#1a2a1a');
    }
  }
  // twisted trees - left
  for (let i = 0; i < 3; i++) {
    const tx = 5 + i * 12;
    // trunk - twisted
    for (let dy = 0; dy < 50; dy++) {
      const twist = Math.sin(dy * 0.15) * 3;
      setPixel(ctx, Math.floor(tx + twist), 120 - dy, '#1a1a0a');
      setPixel(ctx, Math.floor(tx + twist) + 1, 120 - dy, '#2a2a1a');
    }
    // dead branches
    for (let b = 0; b < 4; b++) {
      const by = 80 + b * 8;
      const dir = b % 2 === 0 ? 1 : -1;
      for (let bx = 0; bx < 6; bx++) {
        setPixel(ctx, tx + bx * dir + Math.floor(Math.sin(by * 0.15) * 3), by - bx, '#1a1a0a');
      }
    }
  }
  // twisted trees - right
  for (let i = 0; i < 2; i++) {
    const tx = PX - 15 + i * 10;
    for (let dy = 0; dy < 45; dy++) {
      const twist = Math.sin(dy * 0.12 + 1) * 3;
      setPixel(ctx, Math.floor(tx + twist), 120 - dy, '#1a1a0a');
      setPixel(ctx, Math.floor(tx + twist) + 1, 120 - dy, '#2a2a1a');
    }
  }
  // swamp water
  for (let y = 120; y < PX; y++) {
    for (let x = 0; x < PX; x++) {
      const swamp = (x + y) % 2 === 0 ? '#0a2a0a' : '#1a3a1a';
      setPixel(ctx, x, y, Math.random() < 0.1 ? '#2a4a2a' : swamp);
    }
  }
  // glowing eyes in darkness
  const eyePairs = [[12, 85], [28, 95], [PX - 20, 90], [PX - 35, 100], [PX - 10, 80]];
  for (const [ex, ey] of eyePairs) {
    setPixel(ctx, ex, ey, '#ffff00');
    setPixel(ctx, ex + 3, ey, '#ffff00');
    // dim glow
    setPixel(ctx, ex + 1, ey, '#aaaa00');
    setPixel(ctx, ex + 2, ey, '#aaaa00');
  }
  // toxic bubbles in swamp
  for (let i = 0; i < 8; i++) {
    const bx = 30 + Math.floor(Math.random() * 100);
    const by = 125 + Math.floor(Math.random() * 30);
    setPixel(ctx, bx, by, '#4aaa4a');
    setPixel(ctx, bx, by - 1, '#2a6a2a');
  }
  // will-o-wisps
  for (let i = 0; i < 5; i++) {
    const wx = 40 + Math.floor(Math.random() * 80);
    const wy = 60 + Math.floor(Math.random() * 50);
    setPixel(ctx, wx, wy, '#88ff88');
    setPixel(ctx, wx + 1, wy, '#66cc66');
  }
  save('07-shadowmire.png', c);
}

function bg08_forge_spire() {
  const { c, ctx } = makeCanvas("#1a0a00");
  // smoky orange sky
  gradient(ctx, 0, 0, PX, 45, ['#1a0a00', '#3a1a00', '#5a2a00', '#7a3a00']);
  // smoke/ash particles
  for (let i = 0; i < 40; i++) {
    setPixel(ctx, Math.floor(Math.random() * PX), Math.floor(Math.random() * 45),
             Math.random() < 0.5 ? '#3a2a1a' : '#4a3a2a');
  }
  // the Forge Spire tower - center background (behind character)
  // thin black tower rising
  for (let y = 10; y < 80; y++) {
    const w = 4 + Math.floor((y - 10) * 0.05);
    const cx = 80;
    for (let dx = -w; dx <= w; dx++) {
      setPixel(ctx, cx + dx, y, dx === -w || dx === w ? '#1a1a2a' : '#0a0a1a');
    }
  }
  // tower peak - orange glow
  drawGlow(ctx, 80, 8, 8, '#ff6600', 0.5);
  setPixel(ctx, 80, 8, '#ffaa00');
  setPixel(ctx, 80, 9, '#ff8800');
  // caldera walls - left
  for (let y = 50; y < PX; y++) {
    const w = 25 + Math.sin(y * 0.06) * 5 + (y - 50) * 0.15;
    for (let x = 0; x < Math.min(w, 45); x++) {
      setPixel(ctx, x, y, (x + y) % 3 === 0 ? '#2a1a0a' : '#1a0a00');
    }
  }
  // caldera walls - right
  for (let y = 50; y < PX; y++) {
    const w = 22 + Math.sin(y * 0.07 + 1) * 4 + (y - 50) * 0.12;
    for (let x = PX - Math.min(w, 40); x < PX; x++) {
      setPixel(ctx, x, y, (x + y) % 3 === 0 ? '#2a1a0a' : '#1a0a00');
    }
  }
  // obsidian streets/floor
  for (let y = 125; y < PX; y++) {
    for (let x = 35; x < PX - 30; x++) {
      const obsidian = (x + y) % 2 === 0 ? '#0a0a15' : '#15152a';
      setPixel(ctx, x, y, obsidian);
    }
  }
  // lava glow under obsidian (cracks)
  for (let crack = 0; crack < 8; crack++) {
    const cx = 40 + Math.floor(Math.random() * 80);
    const cy = 130 + Math.floor(Math.random() * 25);
    setPixel(ctx, cx, cy, '#ff6600');
    setPixel(ctx, cx + 1, cy, '#ff4400');
  }
  // forges along the sides (small orange lights)
  for (let i = 0; i < 4; i++) {
    setPixel(ctx, 38 + i * 3, 123, '#ff8800');
    setPixel(ctx, PX - 35 + i * 3, 123, '#ff8800');
  }
  // ember particles
  for (let i = 0; i < 30; i++) {
    setPixel(ctx, 35 + Math.floor(Math.random() * 90), 45 + Math.floor(Math.random() * 80),
             ['#ff6600', '#ffaa00', '#ff4400', '#ff8800'][Math.floor(Math.random() * 4)]);
  }
  save('08-forge-spire.png', c);
}

function bg09_solar_spire() {
  const { c, ctx } = makeCanvas("#fff8d0");
  // bright golden sky - no darkness
  gradient(ctx, 0, 0, PX, PX, ['#fffef0', '#fff8d0', '#ffeea0', '#ffe880']);
  // the floating tower (background, upper area)
  const towerX = 72;
  for (let y = 5; y < 45; y++) {
    const w = 3 + Math.floor((45 - y) * 0.04);
    for (let dx = -w; dx <= w; dx++) {
      setPixel(ctx, towerX + dx, y, dx === -w || dx === w ? '#ddc880' : '#ffffff');
    }
  }
  // tower cap
  for (let dx = -5; dx <= 5; dx++) {
    setPixel(ctx, towerX + dx, 5, '#ffffff');
    setPixel(ctx, towerX + dx, 4, '#fff8cc');
  }
  setPixel(ctx, towerX, 3, '#ffd700');
  // light beams tethering tower
  for (let beam = 0; beam < 5; beam++) {
    const startX = towerX - 2 + beam;
    for (let y = 45; y < 110; y++) {
      if ((y + beam) % 3 === 0) {
        setPixel(ctx, startX + Math.floor((y - 45) * (beam - 2) * 0.02), y, '#ffd700');
      }
    }
  }
  // white stone platform
  for (let y = 110; y < PX; y++) {
    for (let x = 10; x < PX - 10; x++) {
      setPixel(ctx, x, y, (x + y) % 3 === 0 ? '#fff8ee' : '#ffffff');
    }
  }
  // golden trim on platform edge
  for (let x = 10; x < PX - 10; x++) {
    setPixel(ctx, x, 110, '#ffd700');
    setPixel(ctx, x, 111, '#ffcc00');
  }
  // no shadows (lore-accurate: Radiant magic prevents shadows)
  // light particles everywhere
  for (let i = 0; i < 30; i++) {
    setPixel(ctx, Math.floor(Math.random() * PX), Math.floor(Math.random() * 110), '#ffd700');
  }
  save('09-solar-spire.png', c);
}

function bg10_tidewatch() {
  const { c, ctx } = makeCanvas("#2a5a7a");
  // ocean sky
  gradient(ctx, 0, 0, PX, 40, ['#1a3a5a', '#2a5a7a', '#3a7a9a']);
  drawStars(ctx, 15, 25, ['#ffffff', '#aaddff']);
  // tower emerging from water (background center)
  const tx = 78;
  for (let y = 15; y < 95; y++) {
    const w = 3 + Math.floor((y - 15) * 0.03);
    for (let dx = -w; dx <= w; dx++) {
      if (dx === -w || dx === w) {
        setPixel(ctx, tx + dx, y, '#1a4a6a');
      } else {
        setPixel(ctx, tx + dx, y, (y % 4 < 2) ? '#2a6a8a' : '#3a7a9a');
      }
    }
  }
  // tower top
  for (let dx = -5; dx <= 5; dx++) {
    setPixel(ctx, tx + dx, 15, '#2a6a8a');
    setPixel(ctx, tx + dx, 14, '#4a9aba');
  }
  setPixel(ctx, tx, 13, '#88ddff');
  // ocean waves
  for (let y = 90; y < 115; y++) {
    for (let x = 0; x < PX; x++) {
      const wave = Math.sin(x * 0.12 + y * 0.3) * 0.5 + 0.5;
      if (wave > 0.5) {
        setPixel(ctx, x, y, '#4a9aba');
      } else {
        setPixel(ctx, x, y, '#2a6a8a');
      }
    }
  }
  // wave foam
  for (let x = 0; x < PX; x++) {
    const foamY = 92 + Math.floor(Math.sin(x * 0.1) * 2);
    if (Math.random() < 0.5) setPixel(ctx, x, foamY, '#ffffff');
  }
  // rocky shore/ground
  for (let y = 115; y < PX; y++) {
    for (let x = 0; x < PX; x++) {
      const rock = (x + y) % 3 === 0 ? '#3a5a6a' : '#2a4a5a';
      setPixel(ctx, x, y, rock);
    }
  }
  // tide pools
  for (let i = 0; i < 5; i++) {
    const px = 20 + Math.floor(Math.random() * 120);
    const py = 120 + Math.floor(Math.random() * 30);
    for (let dx = -2; dx <= 2; dx++) {
      setPixel(ctx, px + dx, py, '#4a8aaa');
    }
    setPixel(ctx, px, py - 1, '#5a9aba');
  }
  save('10-tidewatch.png', c);
}

function bg11_heartwood_spire() {
  const { c, ctx } = makeCanvas("#0a1a0a");
  // deep forest canopy
  gradient(ctx, 0, 0, PX, 25, ['#0a1a0a', '#1a3a1a', '#1a4a1a']);
  // THE massive ancient tree - fills background
  // trunk center (behind character area)
  for (let y = 20; y < PX; y++) {
    const w = 15 + Math.sin(y * 0.03) * 3;
    const cx = 80;
    for (let dx = -Math.floor(w); dx <= Math.floor(w); dx++) {
      const bark = Math.abs(dx) > w - 2 ? '#2a1a0a' : ((dx + y) % 4 === 0 ? '#4a3a2a' : '#3a2a1a');
      setPixel(ctx, cx + dx, y, bark);
    }
  }
  // tower growing from tree (intertwined)
  for (let y = 5; y < 60; y++) {
    const w = 2 + Math.floor((60 - y) * 0.02);
    for (let dx = -w; dx <= w; dx++) {
      setPixel(ctx, 80 + dx, y, dx === -w || dx === w ? '#2a4a2a' : '#3a6a3a');
    }
  }
  setPixel(ctx, 80, 4, '#44aa44');
  // massive roots spreading - left
  for (let r = 0; r < 4; r++) {
    let rx = 65 - r * 5;
    let ry = 110 + r * 5;
    for (let seg = 0; seg < 25; seg++) {
      setPixel(ctx, rx, ry, '#3a2a1a');
      setPixel(ctx, rx, ry + 1, '#2a1a0a');
      rx -= 1 + (Math.random() < 0.3 ? 1 : 0);
      ry += Math.random() < 0.4 ? 1 : 0;
    }
  }
  // roots - right
  for (let r = 0; r < 4; r++) {
    let rx = 95 + r * 5;
    let ry = 110 + r * 5;
    for (let seg = 0; seg < 25; seg++) {
      setPixel(ctx, rx, ry, '#3a2a1a');
      rx += 1 + (Math.random() < 0.3 ? 1 : 0);
      ry += Math.random() < 0.4 ? 1 : 0;
    }
  }
  // leafy canopy
  for (let y = 0; y < 30; y++) {
    for (let x = 0; x < PX; x++) {
      if (Math.random() < 0.5) {
        setPixel(ctx, x, y, ['#0a3a0a', '#1a5a1a', '#2a6a2a', '#0a4a0a'][Math.floor(Math.random() * 4)]);
      }
    }
  }
  // ground with moss
  for (let y = 130; y < PX; y++) {
    for (let x = 0; x < PX; x++) {
      setPixel(ctx, x, y, (x + y) % 2 === 0 ? '#1a3a1a' : '#2a4a2a');
    }
  }
  // glowing emerald accents on tree
  for (let i = 0; i < 10; i++) {
    const gy = 30 + Math.floor(Math.random() * 80);
    const side = Math.random() < 0.5 ? -1 : 1;
    const gx = 80 + side * (12 + Math.floor(Math.random() * 5));
    setPixel(ctx, gx, gy, '#44ff44');
  }
  save('11-heartwood-spire.png', c);
}

function bg12_inscription_walls() {
  const { c, ctx } = makeCanvas("#0a0a1a");
  // very dark sky
  gradient(ctx, 0, 0, PX, 30, ['#0a0a1a', '#0a0a2a', '#1a1a3a']);
  drawStars(ctx, 20, 25, ['#ffffff', '#ccbbff']);
  // dark tower - background center
  for (let y = 5; y < 80; y++) {
    const w = 5 + Math.floor((y - 5) * 0.06);
    for (let dx = -w; dx <= w; dx++) {
      setPixel(ctx, 80 + dx, y, dx === -w || dx === w ? '#1a1a3a' : '#0a0a2a');
    }
  }
  // glowing purple runes on tower
  for (let i = 0; i < 12; i++) {
    const ry = 10 + i * 6;
    const rx = 76 + Math.floor(Math.random() * 8);
    setPixel(ctx, rx, ry, '#aa66ff');
    setPixel(ctx, rx + 1, ry, '#8844dd');
    if (Math.random() < 0.5) setPixel(ctx, rx, ry + 1, '#6622bb');
  }
  // inscription walls - left
  for (let y = 30; y < PX; y++) {
    for (let x = 0; x < 35; x++) {
      setPixel(ctx, x, y, (x + y) % 3 === 0 ? '#1a1a3a' : '#0a0a2a');
    }
  }
  // runes on left wall
  for (let row = 0; row < 8; row++) {
    const ry = 35 + row * 15;
    for (let col = 0; col < 6; col++) {
      const rx = 5 + col * 5;
      if (Math.random() < 0.6) {
        setPixel(ctx, rx, ry, '#9966ee');
        setPixel(ctx, rx + 1, ry, '#7744cc');
        setPixel(ctx, rx, ry + 1, '#5522aa');
        if (Math.random() < 0.3) setPixel(ctx, rx + 1, ry + 1, '#5522aa');
      }
    }
  }
  // inscription walls - right
  for (let y = 35; y < PX; y++) {
    for (let x = PX - 30; x < PX; x++) {
      setPixel(ctx, x, y, (x + y) % 3 === 0 ? '#1a1a3a' : '#0a0a2a');
    }
  }
  // runes on right wall
  for (let row = 0; row < 7; row++) {
    const ry = 40 + row * 15;
    for (let col = 0; col < 5; col++) {
      const rx = PX - 28 + col * 5;
      if (Math.random() < 0.6) {
        setPixel(ctx, rx, ry, '#9966ee');
        setPixel(ctx, rx + 1, ry, '#7744cc');
      }
    }
  }
  // crystal lizards (small, on walls)
  const lizardSpots = [[30, 60], [32, 90], [PX - 28, 70], [PX - 25, 100]];
  for (const [lx, ly] of lizardSpots) {
    setPixel(ctx, lx, ly, '#bbaaff');
    setPixel(ctx, lx + 1, ly, '#bbaaff');
    setPixel(ctx, lx + 2, ly, '#9988dd');
    setPixel(ctx, lx + 2, ly + 1, '#9988dd'); // tail
  }
  // dark stone floor
  for (let y = 125; y < PX; y++) {
    for (let x = 35; x < PX - 30; x++) {
      setPixel(ctx, x, y, (x + y) % 2 === 0 ? '#0a0a2a' : '#1a1a3a');
    }
  }
  // purple glow on floor
  for (let x = 40; x < PX - 35; x++) {
    if (x % 5 < 2) setPixel(ctx, x, 125, '#4422aa');
  }
  save('12-inscription-walls.png', c);
}

function bg13_heartstring_tower() {
  const { c, ctx } = makeCanvas("#5a3535");
  // warm sunset sky
  gradient(ctx, 0, 0, PX, 50, ['#4a2040', '#6a3050', '#8a4060', '#aa5070']);
  // soft clouds
  for (let y = 15; y < 25; y++) {
    for (let x = 0; x < PX; x++) {
      if (Math.sin(x * 0.08 + y * 0.3) > 0.2 && Math.random() < 0.5) {
        setPixel(ctx, x, y, '#cc7090');
      }
    }
  }
  // the heartstring tower - center background, curves (no sharp angles per lore)
  // rounded tower shape
  for (let y = 15; y < 85; y++) {
    const t = (y - 15) / 70;
    const w = 3 + Math.floor(t * 5);
    for (let dx = -w; dx <= w; dx++) {
      const dist = Math.sqrt(dx * dx);
      if (dist <= w) {
        setPixel(ctx, 80 + dx, y, dist > w - 1 ? '#aa4070' : '#cc6090');
      }
    }
  }
  // tower pulsing glow (pink light threads from top)
  for (let thread = 0; thread < 8; thread++) {
    const angle = (thread / 8) * Math.PI * 2;
    for (let t = 0; t < 40; t++) {
      const x = 80 + Math.floor(Math.cos(angle) * t * 1.5);
      const y = 15 + Math.floor(Math.sin(angle * 0.5 + t * 0.1) * 3) - t * 0.3;
      if (x >= 0 && x < PX && y >= 0 && y < PX) {
        setPixel(ctx, x, Math.floor(y), '#ff88aa');
      }
    }
  }
  // threads going outward from tower apex
  for (let t = 0; t < 6; t++) {
    const tx = t < 3 ? (20 + t * 10) : (PX - 30 + (t - 3) * 10);
    for (let seg = 0; seg < 15; seg++) {
      const sx = 80 + Math.floor((tx - 80) * seg / 15);
      const sy = 15 + Math.floor(seg * 0.5 + Math.sin(seg * 0.5) * 2);
      if (sx >= 0 && sx < PX) setPixel(ctx, sx, sy, '#ff88bb');
    }
  }
  // warm valley floor
  for (let y = 110; y < PX; y++) {
    for (let x = 0; x < PX; x++) {
      const warm = (x + y) % 2 === 0 ? '#6a4040' : '#7a5050';
      setPixel(ctx, x, y, warm);
    }
  }
  // flowers
  for (let i = 0; i < 15; i++) {
    const fx = Math.floor(Math.random() * PX);
    const fy = 115 + Math.floor(Math.random() * 35);
    setPixel(ctx, fx, fy, ['#ff88aa', '#ffaacc', '#ff6688'][Math.floor(Math.random() * 3)]);
  }
  // gentle hills
  for (let x = 0; x < PX; x++) {
    const hillY = 108 + Math.floor(Math.sin(x * 0.04) * 4);
    for (let y = hillY; y < 112; y++) {
      setPixel(ctx, x, y, '#5a3535');
    }
  }
  save('13-heartstring-tower.png', c);
}

function bg14_the_crucible() {
  const { c, ctx } = makeCanvas("#1a0a00");
  // dark volcanic sky with orange glow
  gradient(ctx, 0, 0, PX, 35, ['#1a0a00', '#2a1000', '#4a2000']);
  // arena walls - circular (left and right)
  for (let y = 25; y < 120; y++) {
    // left wall
    const lw = 30 - Math.abs(y - 70) * 0.2;
    for (let x = 0; x < Math.max(10, lw); x++) {
      setPixel(ctx, x, y, (x + y) % 3 === 0 ? '#3a2a1a' : '#2a1a0a');
    }
    // right wall
    const rw = 28 - Math.abs(y - 70) * 0.2;
    for (let x = PX - Math.max(10, rw); x < PX; x++) {
      setPixel(ctx, x, y, (x + y) % 3 === 0 ? '#3a2a1a' : '#2a1a0a');
    }
  }
  // spectator ledges
  for (let ledge = 0; ledge < 3; ledge++) {
    const ly = 35 + ledge * 25;
    // left ledge
    for (let x = 0; x < 25 - ledge * 3; x++) {
      setPixel(ctx, x, ly, '#4a3a2a');
      setPixel(ctx, x, ly + 1, '#3a2a1a');
    }
    // right ledge
    for (let x = PX - 25 + ledge * 3; x < PX; x++) {
      setPixel(ctx, x, ly, '#4a3a2a');
      setPixel(ctx, x, ly + 1, '#3a2a1a');
    }
    // spectator dots
    for (let s = 0; s < 4 - ledge; s++) {
      setPixel(ctx, 5 + s * 5, ly - 1, '#8a7a6a');
      setPixel(ctx, PX - 10 - s * 5, ly - 1, '#8a7a6a');
    }
  }
  // lava floor (rising and falling)
  for (let y = 120; y < PX; y++) {
    for (let x = 10; x < PX - 10; x++) {
      const lava = Math.sin(x * 0.1 + y * 0.05) > 0;
      setPixel(ctx, x, y, lava ? '#ff6600' : '#ff4400');
      if (y < 125 && Math.random() < 0.3) setPixel(ctx, x, y, '#ffaa00');
    }
  }
  // lava bubbles
  for (let i = 0; i < 8; i++) {
    const bx = 20 + Math.floor(Math.random() * 120);
    const by = 122 + Math.floor(Math.random() * 15);
    setPixel(ctx, bx, by, '#ffcc00');
    setPixel(ctx, bx, by - 1, '#ffaa00');
  }
  // heat shimmer / embers
  for (let i = 0; i < 20; i++) {
    setPixel(ctx, 20 + Math.floor(Math.random() * 120), 35 + Math.floor(Math.random() * 80),
             ['#ff8800', '#ffaa00'][Math.floor(Math.random() * 2)]);
  }
  save('14-the-crucible.png', c);
}

function bg15_truth_mirror() {
  const { c, ctx } = makeCanvas("#0a1a3a");
  // deep ice cavern
  gradient(ctx, 0, 0, PX, PX, ['#0a1a3a', '#0a2a4a', '#1a3a5a', '#0a2a4a', '#0a1a3a']);
  // cavern ceiling
  for (let y = 0; y < 30; y++) {
    for (let x = 0; x < PX; x++) {
      if (Math.random() < 0.6) setPixel(ctx, x, y, '#1a3a5a');
    }
  }
  // icicles from ceiling
  for (let i = 0; i < 15; i++) {
    const ix = 8 + i * 10 + Math.floor(Math.random() * 5);
    const len = 5 + Math.floor(Math.random() * 12);
    for (let dy = 0; dy < len; dy++) {
      setPixel(ctx, ix, 25 + dy, dy < 3 ? '#88ccff' : '#4488cc');
    }
  }
  // ice walls - left
  for (let y = 25; y < PX; y++) {
    const w = 25 + Math.sin(y * 0.08) * 8;
    for (let x = 0; x < w; x++) {
      setPixel(ctx, x, y, (x + y) % 2 === 0 ? '#1a4a6a' : '#2a5a7a');
    }
  }
  // ice walls - right
  for (let y = 25; y < PX; y++) {
    const w = 22 + Math.sin(y * 0.06 + 2) * 6;
    for (let x = PX - w; x < PX; x++) {
      setPixel(ctx, x, y, (x + y) % 2 === 0 ? '#1a4a6a' : '#2a5a7a');
    }
  }
  // THE TRUTH MIRROR - smooth ice surface in back wall
  const mirrorX = 65, mirrorY = 55, mirrorW = 30, mirrorH = 40;
  for (let y = mirrorY; y < mirrorY + mirrorH; y++) {
    for (let x = mirrorX; x < mirrorX + mirrorW; x++) {
      // perfectly smooth - no dithering
      setPixel(ctx, x, y, '#88ccee');
    }
  }
  // mirror frame (ice)
  for (let x = mirrorX - 1; x <= mirrorX + mirrorW; x++) {
    setPixel(ctx, x, mirrorY - 1, '#aaddff');
    setPixel(ctx, x, mirrorY + mirrorH, '#aaddff');
  }
  for (let y = mirrorY; y < mirrorY + mirrorH; y++) {
    setPixel(ctx, mirrorX - 1, y, '#aaddff');
    setPixel(ctx, mirrorX + mirrorW, y, '#aaddff');
  }
  // eerie glow from mirror
  drawGlow(ctx, 80, 75, 20, '#66aadd', 0.3);
  // ice floor
  for (let y = 130; y < PX; y++) {
    for (let x = 25; x < PX - 22; x++) {
      setPixel(ctx, x, y, (x + y) % 2 === 0 ? '#3a7a9a' : '#4a8aaa');
    }
  }
  // reflection on floor
  for (let x = 60; x < 100; x++) {
    if (Math.random() < 0.3) setPixel(ctx, x, 130, '#88ccee');
  }
  save('15-truth-mirror.png', c);
}

function bg16_meadow_of_marks() {
  const { c, ctx } = makeCanvas("#338833");
  // bright peaceful sky
  gradient(ctx, 0, 0, PX, 50, ['#4488cc', '#66aadd', '#88ccee']);
  // fluffy clouds
  for (let ci = 0; ci < 4; ci++) {
    const cx = 10 + ci * 40;
    const cy = 15 + (ci % 2) * 10;
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -6; dx <= 6; dx++) {
        if (Math.sqrt(dx * dx * 0.3 + dy * dy) < 3) {
          setPixel(ctx, cx + dx, cy + dy, '#ffffff');
        }
      }
    }
  }
  // rolling green hills
  for (let x = 0; x < PX; x++) {
    const hillY = 65 + Math.sin(x * 0.03) * 8 + Math.sin(x * 0.07) * 4;
    for (let y = Math.floor(hillY); y < PX; y++) {
      const grass = (y - hillY < 3) ? '#44aa44' : ((x + y) % 2 === 0 ? '#338833' : '#2a7a2a');
      setPixel(ctx, x, y, grass);
    }
  }
  // wildflowers in MANY colors (matching dog coat patterns per lore)
  const flowerColors = [
    '#ff4444', '#ff8844', '#ffcc44', '#44ff44', '#4444ff', '#ff44ff',
    '#ffffff', '#ff6688', '#8844ff', '#44ddff', '#ffaa88', '#ff4400',
    '#cc44cc', '#88ff88', '#ffff44'
  ];
  for (let i = 0; i < 60; i++) {
    const fx = Math.floor(Math.random() * PX);
    const baseHill = 65 + Math.sin(fx * 0.03) * 8 + Math.sin(fx * 0.07) * 4;
    const fy = Math.floor(baseHill) + 2 + Math.floor(Math.random() * (PX - baseHill - 5));
    const fc = flowerColors[Math.floor(Math.random() * flowerColors.length)];
    setPixel(ctx, fx, fy, fc);
    // stem
    setPixel(ctx, fx, fy + 1, '#228822');
    // some flowers are bigger
    if (Math.random() < 0.3) {
      setPixel(ctx, fx - 1, fy, fc);
      setPixel(ctx, fx + 1, fy, fc);
    }
  }
  // distant trees on edges
  for (let i = 0; i < 4; i++) {
    const tx = 5 + i * 8;
    drawTree(ctx, tx, 68 + Math.floor(Math.sin(tx * 0.03) * 8), 12, 4, '#2a6a2a', '#4a3a2a', '#1a4a1a');
  }
  for (let i = 0; i < 3; i++) {
    const tx = PX - 10 - i * 10;
    drawTree(ctx, tx, 66 + Math.floor(Math.sin(tx * 0.03) * 8), 10, 3, '#2a6a2a', '#4a3a2a', '#1a4a1a');
  }
  // butterflies
  for (let i = 0; i < 5; i++) {
    const bx = 30 + Math.floor(Math.random() * 100);
    const by = 45 + Math.floor(Math.random() * 30);
    setPixel(ctx, bx, by, flowerColors[Math.floor(Math.random() * flowerColors.length)]);
    setPixel(ctx, bx + 1, by - 1, flowerColors[Math.floor(Math.random() * flowerColors.length)]);
  }
  save('16-meadow-of-marks.png', c);
}

function bg17_deep_shelf() {
  const { c, ctx } = makeCanvas("#020a10");
  // deep ocean
  gradient(ctx, 0, 0, PX, PX, ['#0a2a3a', '#0a3a4a', '#052025', '#030f15', '#010508']);
  // light rays from above
  for (let ray = 0; ray < 4; ray++) {
    const rx = 30 + ray * 30;
    for (let y = 0; y < 80; y++) {
      if ((y + ray * 3) % 4 === 0) {
        setPixel(ctx, rx + Math.floor(y * 0.1), y, '#1a5a6a');
      }
    }
  }
  // continental shelf - the ledge
  for (let y = 70; y < 80; y++) {
    for (let x = 0; x < PX; x++) {
      setPixel(ctx, x, y, (x + y) % 2 === 0 ? '#1a4a5a' : '#2a5a6a');
    }
  }
  // cliff face dropping into abyss
  for (let y = 80; y < PX; y++) {
    // left cliff face
    const lw = 30 + (y - 80) * 0.3;
    for (let x = 0; x < Math.min(lw, PX / 2 - 20); x++) {
      setPixel(ctx, x, y, (x + y) % 3 === 0 ? '#0a2a3a' : '#051520');
    }
    // right cliff face
    const rw = 28 + (y - 80) * 0.25;
    for (let x = PX - Math.min(rw, PX / 2 - 20); x < PX; x++) {
      setPixel(ctx, x, y, (x + y) % 3 === 0 ? '#0a2a3a' : '#051520');
    }
  }
  // prophecy echoes - glowing text-like lights rising from the deep
  for (let i = 0; i < 20; i++) {
    const px = 40 + Math.floor(Math.random() * 80);
    const py = 90 + Math.floor(Math.random() * 60);
    const glow = ['#44aacc', '#2288aa', '#66ccee', '#338899'][Math.floor(Math.random() * 4)];
    setPixel(ctx, px, py, glow);
    if (Math.random() < 0.4) setPixel(ctx, px + 1, py, glow);
    if (Math.random() < 0.2) setPixel(ctx, px, py - 1, glow);
  }
  // bioluminescent jellyfish
  for (let i = 0; i < 4; i++) {
    const jx = 35 + Math.floor(Math.random() * 90);
    const jy = 30 + Math.floor(Math.random() * 40);
    drawCircle(ctx, jx, jy, 2, '#44aadd', '#2288bb');
    // tentacles
    for (let t = 1; t < 5; t++) {
      setPixel(ctx, jx + (t % 2 === 0 ? -1 : 1), jy + t, '#2288bb');
    }
  }
  save('17-deep-shelf.png', c);
}

function bg18_septenary_alignment() {
  const { c, ctx } = makeCanvas("#050510");
  // deep night sky
  gradient(ctx, 0, 0, PX, PX, ['#050510', '#0a0a1a', '#050515']);
  // LOTS of stars
  drawStars(ctx, 120, PX, ['#ffffff', '#eeeeff', '#ddddff', '#aabbff']);
  // nebula hints
  for (let i = 0; i < 30; i++) {
    const nx = Math.floor(Math.random() * PX);
    const ny = Math.floor(Math.random() * PX);
    setPixel(ctx, nx, ny, ['#1a0a2a', '#0a1a2a', '#1a1a0a'][Math.floor(Math.random() * 3)]);
  }
  // THE 7 MOONS - arranged in arc across the sky
  // Moon colors per lore: Orange, Yellow, Blue, Green, Purple, Pink, White(Palehowl)
  const moons = [
    { name: 'Emberhowl', color: '#ff6600', glow: '#ff880044', x: 15, y: 25, r: 6 },
    { name: 'Solaris', color: '#ffd700', glow: '#ffee0044', x: 38, y: 12, r: 5 },
    { name: 'Deepwell', color: '#1e90ff', glow: '#4488ff44', x: 60, y: 8, r: 5 },
    { name: 'Evergreen', color: '#228b22', glow: '#44aa4444', x: 80, y: 8, r: 6 },
    { name: 'Umbra', color: '#7b54c9', glow: '#9966ee44', x: 100, y: 12, r: 5 },
    { name: 'Roseglow', color: '#c55bb7', glow: '#dd66cc44', x: 122, y: 20, r: 5 },
    { name: 'Palehowl', color: '#ccccdd', glow: '#ffffff22', x: 145, y: 30, r: 4 },
  ];
  for (const moon of moons) {
    // glow
    drawGlow(ctx, moon.x, moon.y, moon.r + 5, moon.color, 0.4);
    // moon body
    drawCircle(ctx, moon.x, moon.y, moon.r, moon.color, null);
    // highlight
    setPixel(ctx, moon.x - 1, moon.y - 1, '#ffffff');
  }
  // ground silhouette
  for (let x = 0; x < PX; x++) {
    const groundY = 130 + Math.floor(Math.sin(x * 0.05) * 5);
    for (let y = groundY; y < PX; y++) {
      setPixel(ctx, x, y, '#0a0a0a');
    }
  }
  // silhouette trees on ground
  for (let i = 0; i < 8; i++) {
    const tx = i * 20 + 5;
    const th = 8 + Math.floor(Math.random() * 10);
    const groundY = 130 + Math.floor(Math.sin(tx * 0.05) * 5);
    for (let dy = 0; dy < th; dy++) {
      setPixel(ctx, tx, groundY - dy, '#0a0a0a');
      if (dy > th / 2) {
        setPixel(ctx, tx - 1, groundY - dy, '#0a0a0a');
        setPixel(ctx, tx + 1, groundY - dy, '#0a0a0a');
      }
    }
  }
  save('18-septenary-alignment.png', c);
}

function bg19_moon_shard_grove() {
  const { c, ctx } = makeCanvas("#0a0a0a");
  // dark forest night
  gradient(ctx, 0, 0, PX, 40, ['#0a0a15', '#0a1a1a', '#1a2a2a']);
  drawStars(ctx, 20, 30, ['#ffffff', '#eeeeff']);
  // trees framing - left
  for (let i = 0; i < 3; i++) {
    const tx = 5 + i * 10;
    for (let y = 0; y < PX; y++) {
      if (y > 30) {
        setPixel(ctx, tx, y, '#1a1a0a');
        setPixel(ctx, tx + 1, y, '#2a2a1a');
      }
    }
    // branches
    for (let b = 0; b < 5; b++) {
      const by = 35 + b * 15;
      for (let bx = 0; bx < 8; bx++) {
        setPixel(ctx, tx + 2 + bx, by - Math.floor(bx * 0.5), '#1a3a1a');
      }
    }
  }
  // trees - right
  for (let i = 0; i < 3; i++) {
    const tx = PX - 8 - i * 10;
    for (let y = 0; y < PX; y++) {
      if (y > 25) {
        setPixel(ctx, tx, y, '#1a1a0a');
        setPixel(ctx, tx + 1, y, '#2a2a1a');
      }
    }
  }
  // forest floor
  for (let y = 120; y < PX; y++) {
    for (let x = 0; x < PX; x++) {
      setPixel(ctx, x, y, (x + y) % 2 === 0 ? '#1a2a1a' : '#0a1a0a');
    }
  }
  // MOON SHARDS - crystallized moonlight fragments, each in their moon's color
  const shardColors = ['#ff6600', '#ffd700', '#1e90ff', '#228b22', '#7b54c9', '#c55bb7', '#ccccdd'];
  const shardNames = ['Emberhowl', 'Solaris', 'Deepwell', 'Evergreen', 'Umbra', 'Roseglow', 'Palehowl'];
  for (let i = 0; i < 14; i++) {
    const sx = 30 + Math.floor(Math.random() * 100);
    const sy = 100 + Math.floor(Math.random() * 40);
    const color = shardColors[i % shardColors.length];
    // crystal shape (diamond)
    setPixel(ctx, sx, sy - 2, color);
    setPixel(ctx, sx - 1, sy - 1, color);
    setPixel(ctx, sx, sy - 1, '#ffffff');
    setPixel(ctx, sx + 1, sy - 1, color);
    setPixel(ctx, sx - 1, sy, color);
    setPixel(ctx, sx, sy, color);
    setPixel(ctx, sx + 1, sy, color);
    setPixel(ctx, sx, sy + 1, color);
    // glow around shard
    drawGlow(ctx, sx, sy, 4, color, 0.3);
  }
  // canopy with leaf gaps (light filtering)
  for (let y = 25; y < 45; y++) {
    for (let x = 20; x < PX - 20; x++) {
      if (Math.random() < 0.4) setPixel(ctx, x, y, '#0a2a0a');
    }
  }
  save('19-moon-shard-grove.png', c);
}

function bg20_great_rot() {
  const { c, ctx } = makeCanvas("#0a0a0a");
  // sickly sky
  gradient(ctx, 0, 0, PX, 45, ['#0a0a0a', '#1a1a0a', '#2a2a0a']);
  // toxic mist
  for (let y = 35; y < 55; y++) {
    for (let x = 0; x < PX; x++) {
      if (Math.random() < 0.15) setPixel(ctx, x, y, '#2a3a0a');
    }
  }
  // corrupted trees - black, twisted, weeping bark
  for (let i = 0; i < 4; i++) {
    const tx = 5 + i * 10;
    for (let dy = 0; dy < 60; dy++) {
      const twist = Math.sin(dy * 0.2) * 4;
      setPixel(ctx, Math.floor(tx + twist), 120 - dy, '#0a0a0a');
      setPixel(ctx, Math.floor(tx + twist) + 1, 120 - dy, '#1a1a0a');
      // weeping drops
      if (dy % 8 === 0 && Math.random() < 0.5) {
        setPixel(ctx, Math.floor(tx + twist) + 2, 120 - dy + 1, '#4a6a0a');
      }
    }
    // dead branches
    for (let b = 0; b < 3; b++) {
      const by = 75 + b * 12;
      for (let bx = 0; bx < 8; bx++) {
        setPixel(ctx, tx + bx + Math.floor(Math.sin(by * 0.2) * 4), by - bx, '#0a0a0a');
      }
    }
  }
  // corrupted trees - right
  for (let i = 0; i < 3; i++) {
    const tx = PX - 10 - i * 12;
    for (let dy = 0; dy < 55; dy++) {
      const twist = Math.sin(dy * 0.18 + 2) * 3;
      setPixel(ctx, Math.floor(tx + twist), 120 - dy, '#0a0a0a');
      setPixel(ctx, Math.floor(tx + twist) + 1, 120 - dy, '#1a1a0a');
    }
  }
  // corrupted ground
  for (let y = 120; y < PX; y++) {
    for (let x = 0; x < PX; x++) {
      const rot = Math.random();
      if (rot < 0.3) {
        setPixel(ctx, x, y, '#1a1a0a');
      } else if (rot < 0.6) {
        setPixel(ctx, x, y, '#2a2a0a');
      } else {
        setPixel(ctx, x, y, '#0a0a0a');
      }
    }
  }
  // rot spreading - dark patches with sickly green edges
  for (let i = 0; i < 8; i++) {
    const rx = 30 + Math.floor(Math.random() * 100);
    const ry = 80 + Math.floor(Math.random() * 50);
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const dist = Math.abs(dx) + Math.abs(dy);
        if (dist <= 3) {
          if (dist === 3) {
            setPixel(ctx, rx + dx, ry + dy, '#4a6a0a'); // sickly green edge
          } else {
            setPixel(ctx, rx + dx, ry + dy, '#0a0a0a'); // black rot center
          }
        }
      }
    }
  }
  // toxic magic swirls
  for (let swirl = 0; swirl < 5; swirl++) {
    const cx = 40 + Math.floor(Math.random() * 80);
    const cy = 50 + Math.floor(Math.random() * 60);
    for (let t = 0; t < 12; t++) {
      const angle = t * 0.5 + swirl;
      const dist = t * 1.5;
      const sx = cx + Math.floor(Math.cos(angle) * dist);
      const sy = cy + Math.floor(Math.sin(angle) * dist);
      if (sx >= 0 && sx < PX && sy >= 0 && sy < PX) {
        setPixel(ctx, sx, sy, t % 2 === 0 ? '#4a8a0a' : '#6aaa0a');
      }
    }
  }
  // hollow hound eyes (corrupted creatures)
  const hollowEyes = [[35, 100], [120, 95], [70, 85]];
  for (const [ex, ey] of hollowEyes) {
    setPixel(ctx, ex, ey, '#aa0000');
    setPixel(ctx, ex + 2, ey, '#aa0000');
  }
  save('20-great-rot.png', c);
}

// RUN ALL
console.log('Generating 20 pixel art backgrounds...\n');
bg01_frosthollow();
bg02_ember_wastes();
bg03_sunward_heights();
bg04_deepwood();
bg05_abyssal_reaches();
bg06_violet_highlands();
bg07_shadowmire();
bg08_forge_spire();
bg09_solar_spire();
bg10_tidewatch();
bg11_heartwood_spire();
bg12_inscription_walls();
bg13_heartstring_tower();
bg14_the_crucible();
bg15_truth_mirror();
bg16_meadow_of_marks();
bg17_deep_shelf();
bg18_septenary_alignment();
bg19_moon_shard_grove();
bg20_great_rot();
console.log('\n✅ All 20 backgrounds generated!');
