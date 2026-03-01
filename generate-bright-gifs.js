const GIFEncoder = require('gif-encoder-2');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = './content-bg';
const THUMB_DIR = './content-bg/thumbs';

function upscaleCanvas(smallCtx, targetWidth, targetHeight) {
    const smallCanvas = smallCtx.canvas;
    const scale = targetWidth / smallCanvas.width;
    const largeCanvas = createCanvas(targetWidth, targetHeight);
    const largeCtx = largeCanvas.getContext('2d');
    largeCtx.imageSmoothingEnabled = false;
    largeCtx.scale(scale, scale);
    largeCtx.drawImage(smallCanvas, 0, 0);
    return largeCtx;
}

async function saveGIF(filename, frameGeneratorFunc) {
    const encoder = new GIFEncoder(400, 400);
    encoder.setDelay(120);
    encoder.setRepeat(0);
    const stream = encoder.createReadStream();
    const bufs = [];
    stream.on('data', d => bufs.push(d));
    return new Promise((resolve) => {
        stream.on('end', () => {
            const outputPath = path.join(OUTPUT_DIR, filename);
            fs.writeFileSync(outputPath, Buffer.concat(bufs));
            console.log(`Generated ${filename}`);
            resolve();
        });
        encoder.start();
        for (let frame = 0; frame < 8; frame++) {
            const smallCanvas = createCanvas(48, 48);
            const smallCtx = smallCanvas.getContext('2d');
            frameGeneratorFunc(smallCtx, frame);
            const largeCtx = upscaleCanvas(smallCtx, 400, 400);
            encoder.addFrame(largeCtx);
        }
        encoder.finish();
    });
}

// Helper: random int
function rng(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// ===== 20 BRIGHT/HAPPY SCENES =====

function sunnyMeadowFireflies(ctx, frame) {
    // Bright blue sky
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, 48, 30);
    // Sun
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(36, 4, 6, 6);
    ctx.fillStyle = '#FFF176';
    ctx.fillRect(37, 5, 4, 4);
    // Green grass
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 30, 48, 18);
    ctx.fillStyle = '#66BB6A';
    for (let x = 0; x < 48; x += 3) ctx.fillRect(x, 29, 2, 2);
    // Flowers
    const colors = ['#FF6B6B', '#FFD93D', '#FF69B4', '#FF8A65'];
    for (let i = 0; i < 8; i++) {
        ctx.fillStyle = colors[i % 4];
        ctx.fillRect(3 + i * 6, 33 + (i % 3), 2, 2);
    }
    // Fireflies (animated)
    ctx.fillStyle = '#FFEB3B';
    for (let i = 0; i < 6; i++) {
        const x = (5 + i * 8 + frame * 2) % 44;
        const y = 10 + Math.sin((frame + i) * 0.8) * 5;
        if ((frame + i) % 3 !== 0) ctx.fillRect(x, Math.floor(y), 1, 1);
    }
}

function crystalClearLake(ctx, frame) {
    ctx.fillStyle = '#64B5F6';
    ctx.fillRect(0, 0, 48, 20);
    // Clouds
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5 + (frame % 4), 4, 8, 3);
    ctx.fillRect(25 - (frame % 3), 7, 6, 2);
    // Mountains
    ctx.fillStyle = '#81C784';
    for (let i = 0; i < 48; i++) {
        const h = 8 + Math.sin(i * 0.3) * 4;
        ctx.fillRect(i, 20 - h, 1, h);
    }
    // Lake
    ctx.fillStyle = '#29B6F6';
    ctx.fillRect(0, 20, 48, 15);
    // Sparkles on water
    ctx.fillStyle = '#E1F5FE';
    for (let i = 0; i < 5; i++) {
        const x = (3 + i * 10 + frame * 3) % 46;
        ctx.fillRect(x, 22 + (i % 3) * 3, 2, 1);
    }
    // Shore
    ctx.fillStyle = '#A5D6A7';
    ctx.fillRect(0, 35, 48, 13);
}

function rainbowOverRoothold(ctx, frame) {
    ctx.fillStyle = '#81D4FA';
    ctx.fillRect(0, 0, 48, 48);
    // Rainbow arc
    const rainbowColors = ['#F44336','#FF9800','#FFEB3B','#4CAF50','#2196F3','#9C27B0'];
    for (let c = 0; c < 6; c++) {
        ctx.fillStyle = rainbowColors[c];
        for (let a = 0; a < 48; a++) {
            const r = 20 - c;
            const y = 25 - Math.sqrt(Math.max(0, r*r - (a-24)*(a-24)));
            if (y > 0) ctx.fillRect(a, Math.floor(y), 1, 1);
        }
    }
    // Green ground with buildings (Roothold)
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 36, 48, 12);
    // Tree-houses
    ctx.fillStyle = '#795548';
    ctx.fillRect(10, 30, 3, 6);
    ctx.fillRect(30, 28, 3, 8);
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(8, 26, 7, 5);
    ctx.fillRect(28, 24, 7, 5);
    // Sparkle
    ctx.fillStyle = '#FFF9C4';
    const sx = (frame * 5) % 40 + 4;
    ctx.fillRect(sx, 15, 1, 1);
}

function sunnyWizardTower(ctx, frame) {
    // Bright sky
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, 48, 48);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(38, 3, 5, 5);
    // Tower
    ctx.fillStyle = '#E0E0E0';
    ctx.fillRect(18, 10, 12, 35);
    ctx.fillStyle = '#BDBDBD';
    ctx.fillRect(20, 10, 8, 35);
    // Roof
    ctx.fillStyle = '#7E57C2';
    for (let i = 0; i < 8; i++) ctx.fillRect(18 + i, 10 - i/2, 12 - i*2 > 0 ? 12 - i*2 : 1, 1);
    // Windows (glowing)
    ctx.fillStyle = (frame % 2 === 0) ? '#FFF176' : '#FFD54F';
    ctx.fillRect(22, 16, 3, 3);
    ctx.fillRect(22, 24, 3, 3);
    ctx.fillRect(22, 32, 3, 3);
    // Ground
    ctx.fillStyle = '#66BB6A';
    ctx.fillRect(0, 42, 48, 6);
    // Butterflies
    ctx.fillStyle = '#FF80AB';
    const bx = (frame * 3 + 5) % 40;
    const by = 20 + Math.sin(frame) * 3;
    ctx.fillRect(bx, Math.floor(by), 2, 1);
}

function goldenWheatFields(ctx, frame) {
    ctx.fillStyle = '#64B5F6';
    ctx.fillRect(0, 0, 48, 20);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(40, 5, 5, 5);
    // Wheat field
    for (let x = 0; x < 48; x++) {
        const sway = Math.sin((x + frame) * 0.5) * 1;
        ctx.fillStyle = '#F9A825';
        ctx.fillRect(x, 20, 1, 28);
        ctx.fillStyle = '#FDD835';
        ctx.fillRect(x, 20 + Math.floor(sway), 1, 2);
    }
    // Wheat tops swaying
    ctx.fillStyle = '#FFE082';
    for (let x = 0; x < 48; x += 2) {
        const sway = Math.sin((x + frame * 2) * 0.4) * 2;
        ctx.fillRect(x, 18 + Math.floor(sway), 2, 3);
    }
}

function brightAuroraMoons(ctx, frame) {
    ctx.fillStyle = '#1A237E';
    ctx.fillRect(0, 0, 48, 48);
    // Aurora bands (bright greens, pinks)
    const auroraColors = ['#69F0AE','#00E676','#B2FF59','#FF80AB','#EA80FC'];
    for (let i = 0; i < 5; i++) {
        ctx.fillStyle = auroraColors[i];
        const y = 10 + i * 4 + Math.sin(frame * 0.8 + i) * 2;
        ctx.fillRect(0, Math.floor(y), 48, 2);
    }
    // Multiple moons
    ctx.fillStyle = '#FFF9C4';
    ctx.fillRect(8, 4, 4, 4);
    ctx.fillStyle = '#FFCC80';
    ctx.fillRect(35, 6, 3, 3);
    ctx.fillStyle = '#CE93D8';
    ctx.fillRect(22, 3, 3, 3);
    // Snowy ground
    ctx.fillStyle = '#E8EAF6';
    ctx.fillRect(0, 40, 48, 8);
    // Stars
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 8; i++) {
        if ((frame + i) % 3 !== 0) ctx.fillRect(2 + i * 6, 2 + (i * 3) % 8, 1, 1);
    }
}

function sunlitForestClearing(ctx, frame) {
    ctx.fillStyle = '#81C784';
    ctx.fillRect(0, 0, 48, 48);
    // Sky through canopy
    ctx.fillStyle = '#AED581';
    ctx.fillRect(0, 0, 48, 15);
    ctx.fillStyle = '#C5E1A5';
    ctx.fillRect(10, 0, 28, 12);
    // Light rays
    ctx.fillStyle = 'rgba(255,255,200,0.3)';
    ctx.fillStyle = '#FFFDE7';
    for (let i = 0; i < 3; i++) {
        const x = 15 + i * 8 + (frame % 2);
        for (let y = 0; y < 35; y++) ctx.fillRect(x + (y > 15 ? 1 : 0), y, 1, 1);
    }
    // Trees on sides
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(2, 10, 3, 30);
    ctx.fillRect(42, 8, 3, 32);
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(0, 5, 8, 10);
    ctx.fillRect(40, 3, 8, 10);
    // Green floor
    ctx.fillStyle = '#66BB6A';
    ctx.fillRect(0, 40, 48, 8);
    // Butterflies
    ctx.fillStyle = '#FFF176';
    ctx.fillRect((frame * 4 + 20) % 38 + 5, 25 + Math.floor(Math.sin(frame) * 3), 2, 1);
}

function crystalLizardSunbathing(ctx, frame) {
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, 48, 30);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(36, 3, 6, 6);
    ctx.fillStyle = '#A5D6A7';
    ctx.fillRect(0, 30, 48, 18);
    // Rock
    ctx.fillStyle = '#9E9E9E';
    ctx.fillRect(15, 28, 18, 8);
    ctx.fillStyle = '#BDBDBD';
    ctx.fillRect(17, 27, 14, 2);
    // Crystal lizard on rock
    ctx.fillStyle = '#00BCD4';
    ctx.fillRect(20, 26, 8, 3);
    ctx.fillRect(28, 27, 3, 1); // tail
    ctx.fillRect(19, 28, 2, 2); // front legs
    ctx.fillRect(26, 28, 2, 2); // back legs
    // Crystal sparkle
    ctx.fillStyle = '#E0F7FA';
    const sparklePos = frame % 4;
    ctx.fillRect(21 + sparklePos * 2, 25, 1, 1);
    // Flowers
    ctx.fillStyle = '#FF80AB';
    ctx.fillRect(5, 34, 2, 2);
    ctx.fillRect(38, 32, 2, 2);
}

function wizardDogPark(ctx, frame) {
    ctx.fillStyle = '#64B5F6';
    ctx.fillRect(0, 0, 48, 25);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(38, 4, 5, 5);
    // Clouds
    ctx.fillStyle = '#FFF';
    ctx.fillRect(5 + (frame % 3), 5, 7, 3);
    // Green park
    ctx.fillStyle = '#66BB6A';
    ctx.fillRect(0, 25, 48, 23);
    // Path
    ctx.fillStyle = '#D7CCC8';
    ctx.fillRect(10, 28, 28, 3);
    // Dog 1 (running)
    ctx.fillStyle = '#795548';
    const dx = (frame * 3) % 30 + 5;
    ctx.fillRect(dx, 24, 4, 3);
    ctx.fillRect(dx+4, 23, 2, 2); // head
    ctx.fillRect(dx + (frame % 2), 27, 1, 2); // legs
    ctx.fillRect(dx + 3 - (frame % 2), 27, 1, 2);
    // Dog 2
    ctx.fillStyle = '#FFA726';
    ctx.fillRect(35, 32, 4, 3);
    ctx.fillRect(33, 31, 2, 2);
    // Wizard hat on dog 2
    ctx.fillStyle = '#7E57C2';
    ctx.fillRect(33, 29, 3, 2);
    ctx.fillRect(34, 28, 1, 1);
}

function sunriseOverAurelius(ctx, frame) {
    // Gradient sky sunrise
    ctx.fillStyle = '#FFE0B2';
    ctx.fillRect(0, 0, 48, 15);
    ctx.fillStyle = '#FFAB91';
    ctx.fillRect(0, 0, 48, 8);
    ctx.fillStyle = '#FF8A65';
    ctx.fillRect(0, 0, 48, 4);
    ctx.fillStyle = '#FFD54F';
    ctx.fillRect(20, 12, 8, 4);
    // City silhouette
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(5, 18, 6, 20);
    ctx.fillRect(14, 15, 4, 23);
    ctx.fillRect(22, 20, 8, 18);
    ctx.fillRect(34, 16, 5, 22);
    ctx.fillRect(42, 19, 4, 19);
    // Domes
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(6, 16, 4, 2);
    ctx.fillRect(23, 18, 6, 2);
    // Ground
    ctx.fillStyle = '#A5D6A7';
    ctx.fillRect(0, 38, 48, 10);
    // Light rays
    ctx.fillStyle = '#FFF9C4';
    if (frame % 2 === 0) {
        ctx.fillRect(22, 8, 1, 10);
        ctx.fillRect(25, 8, 1, 10);
    }
}

function owlsInSunnyTree(ctx, frame) {
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, 48, 48);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(38, 3, 5, 5);
    // Big tree
    ctx.fillStyle = '#795548';
    ctx.fillRect(20, 15, 8, 33);
    ctx.fillStyle = '#4E342E';
    ctx.fillRect(22, 15, 4, 33);
    // Branches & leaves
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(5, 8, 38, 12);
    ctx.fillStyle = '#43A047';
    ctx.fillRect(8, 5, 32, 8);
    // Owls sitting on branch
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(12, 12, 4, 4);
    ctx.fillRect(32, 11, 4, 4);
    // Owl eyes (blink)
    ctx.fillStyle = (frame % 4 === 0) ? '#8D6E63' : '#FFD700';
    ctx.fillRect(13, 13, 1, 1);
    ctx.fillRect(15, 13, 1, 1);
    ctx.fillRect(33, 12, 1, 1);
    ctx.fillRect(35, 12, 1, 1);
    // Green ground
    ctx.fillStyle = '#66BB6A';
    ctx.fillRect(0, 42, 48, 6);
}

function sparklingRiver(ctx, frame) {
    ctx.fillStyle = '#81D4FA';
    ctx.fillRect(0, 0, 48, 20);
    ctx.fillStyle = '#FFF';
    ctx.fillRect(8 + (frame % 3), 6, 7, 2);
    // Banks
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 20, 15, 28);
    ctx.fillRect(33, 20, 15, 28);
    // River
    ctx.fillStyle = '#29B6F6';
    ctx.fillRect(15, 20, 18, 28);
    // Water flow
    ctx.fillStyle = '#4FC3F7';
    for (let y = 20; y < 48; y += 4) {
        ctx.fillRect(16 + ((frame + y) % 3), y, 4, 1);
        ctx.fillRect(24 + ((frame + y + 2) % 3), y + 2, 3, 1);
    }
    // Sparkles
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 4; i++) {
        if ((frame + i) % 3 === 0) ctx.fillRect(17 + i * 4, 25 + i * 3, 1, 1);
    }
    // Flowers on banks
    ctx.fillStyle = '#FF80AB';
    ctx.fillRect(3, 25, 2, 2);
    ctx.fillRect(38, 28, 2, 2);
    ctx.fillStyle = '#FFD54F';
    ctx.fillRect(8, 32, 2, 2);
    ctx.fillRect(42, 35, 2, 2);
}

function magicGardenButterflies(ctx, frame) {
    ctx.fillStyle = '#E8F5E9';
    ctx.fillRect(0, 0, 48, 48);
    ctx.fillStyle = '#81C784';
    ctx.fillRect(0, 35, 48, 13);
    // Flowers all over
    const flowerColors = ['#F44336','#E91E63','#FF9800','#FFEB3B','#9C27B0','#2196F3'];
    for (let i = 0; i < 12; i++) {
        ctx.fillStyle = flowerColors[i % 6];
        ctx.fillRect(2 + (i * 4) % 44, 30 + (i * 3) % 10, 2, 2);
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(2 + (i * 4) % 44, 32 + (i * 3) % 10, 1, 3);
    }
    // Butterflies
    const bColors = ['#FF80AB','#CE93D8','#80DEEA','#FFF176'];
    for (let i = 0; i < 4; i++) {
        ctx.fillStyle = bColors[i];
        const bx = (frame * 3 + i * 12) % 42 + 3;
        const by = 10 + i * 5 + Math.floor(Math.sin(frame + i * 2) * 3);
        ctx.fillRect(bx, by, 1, 1);
        if (frame % 2 === 0) { ctx.fillRect(bx-1, by, 1, 1); ctx.fillRect(bx+1, by, 1, 1); }
        else { ctx.fillRect(bx-1, by-1, 1, 1); ctx.fillRect(bx+1, by-1, 1, 1); }
    }
}

function sevenMoonsRising(ctx, frame) {
    ctx.fillStyle = '#1A237E';
    ctx.fillRect(0, 0, 48, 35);
    ctx.fillStyle = '#283593';
    ctx.fillRect(0, 0, 48, 15);
    // 7 moons in arc
    const moonColors = ['#FFF9C4','#FFCC80','#CE93D8','#80CBC4','#EF9A9A','#A5D6A7','#90CAF9'];
    for (let i = 0; i < 7; i++) {
        ctx.fillStyle = moonColors[i];
        const x = 4 + i * 6;
        const y = 8 - Math.floor(3 * Math.sin((i + 0.5) / 7 * Math.PI)) + Math.floor(Math.sin(frame * 0.5 + i) * 1);
        ctx.fillRect(x, y, 3, 3);
    }
    // Green hills
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(0, 35, 48, 13);
    ctx.fillStyle = '#388E3C';
    for (let x = 0; x < 48; x++) {
        const h = Math.sin(x * 0.2) * 3;
        ctx.fillRect(x, 33 + Math.floor(h), 1, 2);
    }
    // Stars twinkling
    ctx.fillStyle = '#FFF';
    for (let i = 0; i < 10; i++) {
        if ((frame + i) % 3 !== 0) ctx.fillRect(1 + (i * 5) % 46, 15 + (i * 7) % 18, 1, 1);
    }
}

function springtimeBondsheart(ctx, frame) {
    ctx.fillStyle = '#81D4FA';
    ctx.fillRect(0, 0, 48, 25);
    ctx.fillStyle = '#FFF';
    ctx.fillRect(10 + (frame % 4), 4, 8, 3);
    ctx.fillRect(30 - (frame % 3), 7, 6, 2);
    // City buildings
    ctx.fillStyle = '#FFCC80';
    ctx.fillRect(5, 18, 8, 20);
    ctx.fillStyle = '#FFE0B2';
    ctx.fillRect(16, 15, 6, 23);
    ctx.fillStyle = '#FFCC80';
    ctx.fillRect(26, 20, 10, 18);
    ctx.fillStyle = '#FFE0B2';
    ctx.fillRect(40, 17, 6, 21);
    // Heart-shaped park in center
    ctx.fillStyle = '#E91E63';
    ctx.fillRect(22, 30, 2, 2);
    ctx.fillRect(24, 30, 2, 2);
    ctx.fillRect(21, 31, 6, 2);
    ctx.fillRect(22, 33, 4, 1);
    ctx.fillRect(23, 34, 2, 1);
    // Flowers falling
    ctx.fillStyle = '#FF80AB';
    for (let i = 0; i < 5; i++) {
        const fy = (frame * 2 + i * 8) % 38;
        const fx = 4 + i * 9;
        ctx.fillRect(fx, fy, 1, 1);
    }
    // Ground
    ctx.fillStyle = '#A5D6A7';
    ctx.fillRect(0, 38, 48, 10);
}

function happyCrystalCave(ctx, frame) {
    ctx.fillStyle = '#E1BEE7';
    ctx.fillRect(0, 0, 48, 48);
    // Cave walls
    ctx.fillStyle = '#9575CD';
    ctx.fillRect(0, 0, 5, 48);
    ctx.fillRect(43, 0, 5, 48);
    ctx.fillRect(0, 0, 48, 5);
    // Crystals (bright colors)
    const crystalColors = ['#00BCD4','#76FF03','#FF4081','#FFEA00','#651FFF'];
    for (let i = 0; i < 5; i++) {
        ctx.fillStyle = crystalColors[i];
        const cx = 8 + i * 8;
        ctx.fillRect(cx, 38 - i * 3, 3, 5 + i);
        ctx.fillRect(cx + 1, 36 - i * 3, 1, 2);
    }
    // Glow effect (pulsing)
    ctx.fillStyle = (frame % 2 === 0) ? '#E1F5FE' : '#F3E5F5';
    for (let i = 0; i < 5; i++) {
        const cx = 8 + i * 8;
        ctx.fillRect(cx - 1, 37 - i * 3, 5, 1);
    }
    // Sparkle particles
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 6; i++) {
        const sx = (frame * 3 + i * 7) % 36 + 6;
        const sy = (frame * 2 + i * 11) % 30 + 6;
        if ((frame + i) % 2 === 0) ctx.fillRect(sx, sy, 1, 1);
    }
}

function sunnyDockMorning(ctx, frame) {
    ctx.fillStyle = '#FFE0B2';
    ctx.fillRect(0, 0, 48, 15);
    ctx.fillStyle = '#81D4FA';
    ctx.fillRect(0, 15, 48, 5);
    // Sun rising
    ctx.fillStyle = '#FF8F00';
    ctx.fillRect(20, 10, 8, 5);
    ctx.fillStyle = '#FFD54F';
    ctx.fillRect(21, 11, 6, 3);
    // Ocean
    ctx.fillStyle = '#29B6F6';
    ctx.fillRect(0, 20, 48, 15);
    // Water shimmer
    ctx.fillStyle = '#4FC3F7';
    for (let i = 0; i < 6; i++) {
        ctx.fillRect((i * 8 + frame * 2) % 46, 22 + i * 2, 3, 1);
    }
    // Dock
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(0, 35, 48, 3);
    ctx.fillRect(5, 35, 2, 8);
    ctx.fillRect(20, 35, 2, 8);
    ctx.fillRect(38, 35, 2, 8);
    // Planks
    ctx.fillStyle = '#A1887F';
    ctx.fillRect(0, 35, 48, 1);
    ctx.fillRect(0, 37, 48, 1);
    // Ground
    ctx.fillStyle = '#D7CCC8';
    ctx.fillRect(0, 43, 48, 5);
}

function enchantedMeadowDawn(ctx, frame) {
    ctx.fillStyle = '#FFF8E1';
    ctx.fillRect(0, 0, 48, 25);
    ctx.fillStyle = '#FFF9C4';
    ctx.fillRect(0, 0, 48, 10);
    // Soft clouds
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5 + (frame % 3), 5, 8, 3);
    ctx.fillRect(28 + (frame % 2), 8, 6, 2);
    // Rolling hills
    ctx.fillStyle = '#AED581';
    for (let x = 0; x < 48; x++) {
        const h = 25 + Math.sin(x * 0.15) * 3;
        ctx.fillRect(x, Math.floor(h), 1, 48 - Math.floor(h));
    }
    ctx.fillStyle = '#C5E1A5';
    for (let x = 0; x < 48; x++) {
        const h = 28 + Math.sin(x * 0.2 + 1) * 2;
        ctx.fillRect(x, Math.floor(h), 1, 48 - Math.floor(h));
    }
    // Magic particles
    ctx.fillStyle = '#FFD700';
    for (let i = 0; i < 8; i++) {
        const px = (frame * 2 + i * 6) % 44 + 2;
        const py = 15 + Math.floor(Math.sin(frame + i) * 5);
        if ((frame + i) % 2 === 0) ctx.fillRect(px, py, 1, 1);
    }
}

function cheerfulWindmill(ctx, frame) {
    ctx.fillStyle = '#64B5F6';
    ctx.fillRect(0, 0, 48, 30);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(38, 3, 5, 5);
    ctx.fillStyle = '#FFF';
    ctx.fillRect(6, 5, 7, 3);
    // Windmill body
    ctx.fillStyle = '#FFCC80';
    ctx.fillRect(20, 18, 8, 22);
    ctx.fillStyle = '#FFE0B2';
    ctx.fillRect(22, 18, 4, 22);
    // Blades (rotating)
    ctx.fillStyle = '#8D6E63';
    const cx = 24, cy = 20;
    const angles = [0, 1, 2, 3];
    for (const a of angles) {
        const rot = (a + frame) % 4;
        if (rot === 0) { ctx.fillRect(cx, cy - 8, 1, 8); }
        else if (rot === 1) { ctx.fillRect(cx, cy, 8, 1); }
        else if (rot === 2) { ctx.fillRect(cx, cy, 1, 8); }
        else { ctx.fillRect(cx - 8, cy, 8, 1); }
    }
    // Green ground with flowers
    ctx.fillStyle = '#66BB6A';
    ctx.fillRect(0, 38, 48, 10);
    ctx.fillStyle = '#FFEB3B';
    for (let i = 0; i < 6; i++) ctx.fillRect(3 + i * 8, 40, 2, 2);
}

function goldenHourForest(ctx, frame) {
    ctx.fillStyle = '#FFE082';
    ctx.fillRect(0, 0, 48, 48);
    ctx.fillStyle = '#FFD54F';
    ctx.fillRect(0, 0, 48, 15);
    // Trees
    ctx.fillStyle = '#33691E';
    for (let i = 0; i < 5; i++) {
        const tx = 3 + i * 10;
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(tx + 2, 20, 2, 20);
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(tx, 12, 6, 10);
        ctx.fillStyle = '#43A047';
        ctx.fillRect(tx + 1, 10, 4, 4);
    }
    // Light filtering through
    ctx.fillStyle = '#FFF9C4';
    for (let i = 0; i < 4; i++) {
        const lx = 6 + i * 10 + (frame % 2);
        for (let y = 15; y < 38; y += 2) ctx.fillRect(lx, y, 1, 1);
    }
    // Ground
    ctx.fillStyle = '#8BC34A';
    ctx.fillRect(0, 40, 48, 8);
    // Fireflies
    ctx.fillStyle = '#FFEB3B';
    for (let i = 0; i < 3; i++) {
        if ((frame + i) % 2 === 0) {
            ctx.fillRect(8 + i * 14, 28 + Math.floor(Math.sin(frame + i) * 2), 1, 1);
        }
    }
}

// ===== MAIN =====
async function main() {
    const scenes = [
        ['anim-sunny-meadow-fireflies.gif', sunnyMeadowFireflies],
        ['anim-crystal-clear-lake.gif', crystalClearLake],
        ['anim-rainbow-over-roothold.gif', rainbowOverRoothold],
        ['anim-sunny-wizard-tower.gif', sunnyWizardTower],
        ['anim-golden-wheat-fields.gif', goldenWheatFields],
        ['anim-bright-aurora-moons.gif', brightAuroraMoons],
        ['anim-sunlit-forest-clearing.gif', sunlitForestClearing],
        ['anim-crystal-lizard-sunbathing.gif', crystalLizardSunbathing],
        ['anim-wizard-dog-park.gif', wizardDogPark],
        ['anim-sunrise-over-aurelius.gif', sunriseOverAurelius],
        ['anim-owls-in-sunny-tree.gif', owlsInSunnyTree],
        ['anim-sparkling-river.gif', sparklingRiver],
        ['anim-magic-garden-butterflies.gif', magicGardenButterflies],
        ['anim-seven-moons-rising.gif', sevenMoonsRising],
        ['anim-springtime-bondsheart.gif', springtimeBondsheart],
        ['anim-happy-crystal-cave.gif', happyCrystalCave],
        ['anim-sunny-dock-morning.gif', sunnyDockMorning],
        ['anim-enchanted-meadow-dawn.gif', enchantedMeadowDawn],
        ['anim-cheerful-windmill.gif', cheerfulWindmill],
        ['anim-golden-hour-forest.gif', goldenHourForest],
    ];

    for (const [filename, fn] of scenes) {
        await saveGIF(filename, fn);
    }
    console.log('\n✅ All 20 bright animated GIFs generated!');
}

main().catch(console.error);
