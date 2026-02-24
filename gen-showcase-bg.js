const { createCanvas } = require('canvas');
const fs = require('fs');

// Draw at 200x200, upscale to 1600x1600 for a high-res wallpaper/background
const PX = 200;
const OUT = 1600;
const canvas = createCanvas(PX, PX);
const ctx = canvas.getContext('2d');

// Order of 86 — Arcane Citadel at Twilight
// Deep purple sky, golden tower, 7 moons, magical energy

function px(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
}

function rect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

// Seed random for consistency
let seed = 86;
function rng() { seed = (seed * 16807 + 0) % 2147483647; return seed / 2147483647; }

// === SKY GRADIENT (dark purple to deep blue) ===
for (let y = 0; y < 100; y++) {
    const t = y / 100;
    const r = Math.floor(8 + t * 15);
    const g = Math.floor(5 + t * 10);
    const b = Math.floor(30 + t * 40);
    rect(0, y, PX, 1, `rgb(${r},${g},${b})`);
}

// === AURORA / MAGICAL ENERGY BANDS ===
for (let x = 0; x < PX; x++) {
    const wave1 = Math.sin(x * 0.05) * 8 + 25;
    const wave2 = Math.sin(x * 0.08 + 2) * 6 + 30;
    const wave3 = Math.sin(x * 0.03 + 4) * 10 + 20;
    
    // Purple aurora
    for (let dy = -2; dy <= 2; dy++) {
        const y = Math.floor(wave1 + dy);
        const alpha = 1 - Math.abs(dy) * 0.3;
        if (y >= 0 && y < 100) {
            const existing = ctx.getImageData(x, y, 1, 1).data;
            const nr = Math.floor(existing[0] * (1-alpha*0.5) + 120 * alpha * 0.5);
            const ng = Math.floor(existing[1] * (1-alpha*0.3) + 40 * alpha * 0.3);
            const nb = Math.floor(existing[2] * (1-alpha*0.4) + 180 * alpha * 0.4);
            px(x, y, `rgb(${nr},${ng},${nb})`);
        }
    }
    
    // Gold aurora
    for (let dy = -1; dy <= 1; dy++) {
        const y = Math.floor(wave2 + dy);
        if (y >= 0 && y < 100) {
            const alpha = 1 - Math.abs(dy) * 0.4;
            const existing = ctx.getImageData(x, y, 1, 1).data;
            const nr = Math.floor(existing[0] * (1-alpha*0.4) + 200 * alpha * 0.4);
            const ng = Math.floor(existing[1] * (1-alpha*0.3) + 170 * alpha * 0.3);
            const nb = Math.floor(existing[2] * (1-alpha*0.2) + 30 * alpha * 0.2);
            px(x, y, `rgb(${nr},${ng},${nb})`);
        }
    }
}

// === STARS ===
for (let i = 0; i < 120; i++) {
    const x = Math.floor(rng() * PX);
    const y = Math.floor(rng() * 80);
    const bright = Math.floor(150 + rng() * 105);
    if (rng() > 0.85) {
        // Bright star with slight glow
        px(x, y, `rgb(${bright},${bright},${Math.min(255, bright + 30)})`);
        if (rng() > 0.5 && x > 0) px(x-1, y, `rgba(${bright},${bright},255,0.3)`);
        if (rng() > 0.5 && x < PX-1) px(x+1, y, `rgba(${bright},${bright},255,0.3)`);
    } else {
        px(x, y, `rgb(${bright},${bright},${bright})`);
    }
}

// === 7 MOONS (from Dogwarts lore) ===
const moons = [
    { x: 25, y: 12, r: 4, color: [255, 120, 30] },    // Emberhowl (orange)
    { x: 55, y: 8, r: 3, color: [255, 215, 50] },      // Solaris (yellow)  
    { x: 85, y: 15, r: 3, color: [30, 100, 220] },     // Deepwell (blue)
    { x: 115, y: 10, r: 3, color: [50, 180, 80] },     // Evergreen (green)
    { x: 145, y: 14, r: 4, color: [130, 80, 200] },    // Umbra (purple)
    { x: 170, y: 9, r: 3, color: [210, 100, 180] },    // Roseglow (pink)
    { x: 100, y: 5, r: 5, color: [220, 220, 230] },    // Palehowl (white, largest, center)
];

for (const moon of moons) {
    // Moon glow
    for (let dy = -moon.r - 3; dy <= moon.r + 3; dy++) {
        for (let dx = -moon.r - 3; dx <= moon.r + 3; dx++) {
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist <= moon.r + 3 && dist > moon.r) {
                const alpha = 0.15 * (1 - (dist - moon.r) / 3);
                const mx = moon.x + dx, my = moon.y + dy;
                if (mx >= 0 && mx < PX && my >= 0 && my < PX) {
                    const e = ctx.getImageData(mx, my, 1, 1).data;
                    const nr = Math.min(255, Math.floor(e[0] + moon.color[0] * alpha));
                    const ng = Math.min(255, Math.floor(e[1] + moon.color[1] * alpha));
                    const nb = Math.min(255, Math.floor(e[2] + moon.color[2] * alpha));
                    px(mx, my, `rgb(${nr},${ng},${nb})`);
                }
            }
        }
    }
    // Moon body
    for (let dy = -moon.r; dy <= moon.r; dy++) {
        for (let dx = -moon.r; dx <= moon.r; dx++) {
            if (dx*dx + dy*dy <= moon.r*moon.r) {
                const shade = 0.7 + 0.3 * (1 - Math.sqrt(dx*dx + dy*dy) / moon.r);
                const mx = moon.x + dx, my = moon.y + dy;
                // Slight crater/texture
                const tex = ((dx + dy) % 3 === 0) ? 0.9 : 1.0;
                px(mx, my, `rgb(${Math.floor(moon.color[0]*shade*tex)},${Math.floor(moon.color[1]*shade*tex)},${Math.floor(moon.color[2]*shade*tex)})`);
            }
        }
    }
}

// === DISTANT MOUNTAINS (silhouette) ===
for (let x = 0; x < PX; x++) {
    const h1 = Math.sin(x * 0.03) * 15 + Math.sin(x * 0.07) * 8 + 75;
    const h2 = Math.sin(x * 0.05 + 1) * 12 + Math.sin(x * 0.02) * 10 + 80;
    const mtnH = Math.min(h1, h2);
    
    for (let y = Math.floor(mtnH); y < 100; y++) {
        const depth = (y - mtnH) / (100 - mtnH);
        const r = Math.floor(15 + depth * 10);
        const g = Math.floor(10 + depth * 15);
        const b = Math.floor(35 + depth * 20);
        px(x, y, `rgb(${r},${g},${b})`);
    }
}

// === GROUND (dark earth with magical grass) ===
for (let y = 100; y < PX; y++) {
    const groundDepth = (y - 100) / 100;
    for (let x = 0; x < PX; x++) {
        const r = Math.floor(10 + groundDepth * 15 + rng() * 5);
        const g = Math.floor(15 + groundDepth * 10 + rng() * 8);
        const b = Math.floor(12 + groundDepth * 8 + rng() * 3);
        px(x, y, `rgb(${r},${g},${b})`);
    }
}

// Grass tufts at ground line
for (let x = 0; x < PX; x++) {
    if (rng() > 0.4) {
        const h = Math.floor(rng() * 4) + 1;
        const green = Math.floor(40 + rng() * 40);
        for (let dy = 0; dy < h; dy++) {
            px(x, 100 - dy, `rgb(${Math.floor(green*0.3)},${green},${Math.floor(green*0.2)})`);
        }
    }
}

// === CENTRAL WIZARD TOWER (LEFT SIDE) ===
const towerX = 30;
const towerBase = 130;
const towerTop = 45;

// Tower body — stone with golden windows
for (let y = towerTop; y < towerBase; y++) {
    const width = 8 + Math.floor((y - towerTop) / (towerBase - towerTop) * 6);
    for (let dx = -width/2; dx < width/2; dx++) {
        const x = towerX + Math.floor(dx);
        // Stone texture
        const stoneVar = ((x + y) % 4 === 0) ? 10 : 0;
        const shade = 40 + stoneVar + Math.floor(rng() * 8);
        px(x, y, `rgb(${shade + 5},${shade},${shade + 10})`);
    }
}

// Tower windows (golden glow)
for (let wy = towerTop + 10; wy < towerBase - 10; wy += 12) {
    for (let wx = -1; wx <= 1; wx += 2) {
        const x = towerX + wx * 2;
        px(x, wy, '#ffd700');
        px(x, wy + 1, '#ffaa00');
        px(x, wy + 2, '#ffd700');
        // Window glow
        px(x - 1, wy + 1, 'rgba(255,200,0,0.3)');
        px(x + 1, wy + 1, 'rgba(255,200,0,0.3)');
    }
}

// Tower spire
for (let dy = 0; dy < 15; dy++) {
    const w = Math.max(1, Math.floor((15 - dy) / 3));
    for (let dx = -w; dx <= w; dx++) {
        px(towerX + dx, towerTop - dy, `rgb(${50 + dy * 3},${40 + dy * 2},${60 + dy * 4})`);
    }
}
// Gold tip
px(towerX, towerTop - 15, '#ffd700');
px(towerX, towerTop - 16, '#ffee44');

// === SECOND TOWER (RIGHT SIDE) ===
const tower2X = 160;
const tower2Base = 120;
const tower2Top = 55;

for (let y = tower2Top; y < tower2Base; y++) {
    const width = 6 + Math.floor((y - tower2Top) / (tower2Base - tower2Top) * 5);
    for (let dx = -width/2; dx < width/2; dx++) {
        const x = tower2X + Math.floor(dx);
        const stoneVar = ((x + y) % 3 === 0) ? 8 : 0;
        const shade = 35 + stoneVar + Math.floor(rng() * 6);
        px(x, y, `rgb(${shade + 8},${shade},${shade + 15})`);
    }
}

// Tower 2 windows
for (let wy = tower2Top + 8; wy < tower2Base - 8; wy += 10) {
    px(tower2X, wy, '#7b54c9');
    px(tower2X, wy + 1, '#9966dd');
    px(tower2X, wy + 2, '#7b54c9');
}

// Tower 2 spire
for (let dy = 0; dy < 12; dy++) {
    const w = Math.max(1, Math.floor((12 - dy) / 3));
    for (let dx = -w; dx <= w; dx++) {
        px(tower2X + dx, tower2Top - dy, `rgb(${45 + dy * 2},${35 + dy * 2},${55 + dy * 3})`);
    }
}
px(tower2X, tower2Top - 12, '#7b54c9');
px(tower2X, tower2Top - 13, '#aa88ff');

// === TREES (dark silhouettes with slight detail) ===
function drawTree(cx, baseY, height, color1, color2) {
    // Trunk
    for (let y = baseY; y > baseY - height * 0.3; y--) {
        px(cx, y, '#1a1008');
        if (rng() > 0.5) px(cx + 1, y, '#1a1008');
    }
    // Canopy
    const canopyBase = baseY - height * 0.3;
    for (let dy = 0; dy < height * 0.7; dy++) {
        const w = Math.floor((1 - dy / (height * 0.7)) * (height * 0.3));
        const y = canopyBase - dy;
        for (let dx = -w; dx <= w; dx++) {
            const dither = (Math.abs(dx) + dy) % 2 === 0;
            px(cx + dx, y, dither ? color1 : color2);
        }
    }
}

drawTree(10, 105, 25, '#0a2a0a', '#153015');
drawTree(18, 108, 20, '#0c280c', '#162e16');
drawTree(50, 103, 18, '#0a250a', '#142c14');
drawTree(140, 106, 22, '#0b270b', '#152f15');
drawTree(180, 104, 20, '#0a2a0a', '#163016');
drawTree(190, 107, 16, '#0c280c', '#142c14');

// === MAGICAL PARTICLES (floating embers/motes) ===
for (let i = 0; i < 40; i++) {
    const x = Math.floor(rng() * PX);
    const y = Math.floor(rng() * 120);
    const colors = ['#ffd700', '#ff6600', '#7b54c9', '#c55bb7', '#4488ff'];
    const color = colors[Math.floor(rng() * colors.length)];
    px(x, y, color);
}

// === PATH (winding from bottom center upward) ===
for (let y = PX - 1; y > 105; y--) {
    const pathCenter = 100 + Math.sin((y - 100) * 0.08) * 15;
    const pathWidth = 3 + Math.floor((PX - y) / 30);
    for (let dx = -pathWidth; dx <= pathWidth; dx++) {
        const x = Math.floor(pathCenter + dx);
        if (x >= 0 && x < PX) {
            const edge = Math.abs(dx) / pathWidth;
            const r = Math.floor(30 + edge * 10 + rng() * 5);
            const g = Math.floor(25 + edge * 8 + rng() * 4);
            const b = Math.floor(20 + edge * 5 + rng() * 3);
            px(x, y, `rgb(${r},${g},${b})`);
        }
    }
}

// === "86" RUNE carved into ground (subtle) ===
// Just a subtle golden glow near bottom center
for (let i = 0; i < 8; i++) {
    const x = 95 + Math.floor(rng() * 12);
    const y = 180 + Math.floor(rng() * 10);
    px(x, y, 'rgba(255,200,0,0.4)');
}

// === UPSCALE with nearest-neighbor ===
const outCanvas = createCanvas(OUT, OUT);
const octx = outCanvas.getContext('2d');
octx.imageSmoothingEnabled = false;
octx.drawImage(canvas, 0, 0, OUT, OUT);

const outPath = '/tmp/order-of-86-arcane-citadel.png';
fs.writeFileSync(outPath, outCanvas.toBuffer('image/png'));
console.log(`Saved: ${outPath} (${fs.statSync(outPath).size} bytes)`);
