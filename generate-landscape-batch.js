const GIFEncoder = require('gif-encoder-2');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = './content-bg';
const STILL_DIR = './content-bg/still';

const SMALL = 25;
const LARGE = 1000;
const FRAMES = 12;
const DELAY = 100;

function upscale(smallCtx) {
    const big = createCanvas(LARGE, LARGE);
    const ctx = big.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(smallCtx.canvas, 0, 0, LARGE, LARGE);
    return ctx;
}

async function saveGIF(filename, drawFrame) {
    const encoder = new GIFEncoder(LARGE, LARGE);
    encoder.setDelay(DELAY);
    encoder.setRepeat(0);
    const stream = encoder.createReadStream();
    const bufs = [];
    stream.on('data', d => bufs.push(d));
    return new Promise(resolve => {
        stream.on('end', () => {
            fs.writeFileSync(path.join(OUTPUT_DIR, filename), Buffer.concat(bufs));
            console.log(`GIF: ${filename}`);
            resolve();
        });
        encoder.start();
        for (let f = 0; f < FRAMES; f++) {
            const c = createCanvas(SMALL, SMALL);
            const ctx = c.getContext('2d');
            drawFrame(ctx, f);
            encoder.addFrame(upscale(ctx));
        }
        encoder.finish();
    });
}

function saveStill(filename, draw) {
    const c = createCanvas(SMALL, SMALL);
    const ctx = c.getContext('2d');
    draw(ctx);
    const big = createCanvas(LARGE, LARGE);
    const bctx = big.getContext('2d');
    bctx.imageSmoothingEnabled = false;
    bctx.drawImage(c, 0, 0, LARGE, LARGE);
    fs.writeFileSync(path.join(STILL_DIR, filename), big.toBuffer('image/png'));
    console.log(`Still: ${filename}`);
}

// ========== 20 ANIMATED LANDSCAPE GIFs ==========
const gifs = [
    // FLAME ORDER (3)
    { name: 'anim-flame-volcano-range.gif', fn: (ctx, f) => {
        // Dark red sky
        ctx.fillStyle = '#4A0000'; ctx.fillRect(0,0,25,8);
        ctx.fillStyle = '#8B0000'; ctx.fillRect(0,8,25,2);
        // Volcano peaks
        ctx.fillStyle = '#3E2723'; ctx.fillRect(0,10,25,15);
        ctx.fillStyle = '#5D4037'; ctx.fillRect(2,8,4,3); ctx.fillRect(10,6,5,5); ctx.fillRect(18,7,5,4);
        ctx.fillStyle = '#4E342E'; ctx.fillRect(3,8,2,3); ctx.fillRect(11,7,3,4); ctx.fillRect(19,8,3,3);
        // Lava glow at peaks
        ctx.fillStyle = '#FF6D00'; ctx.fillRect(12,6,1,1); ctx.fillRect(4,8,1,1); ctx.fillRect(20,7,1,1);
        // Eruption particles
        ctx.fillStyle = f%2===0?'#FF3D00':'#FFAB00';
        ctx.fillRect(12, 5-f%3, 1, 1);
        ctx.fillRect(11+f%3, 4-f%2, 1, 1);
        // Lava rivers
        ctx.fillStyle = '#FF6D00';
        ctx.fillRect(13, 11+f%2, 1, 3); ctx.fillRect(5, 12, 1, 2);
        ctx.fillStyle = '#FF3D00';
        ctx.fillRect(13, 14+f%3, 1, 2);
        // Ash particles
        ctx.fillStyle = '#757575';
        ctx.fillRect((3+f*2)%25, 2+f%4, 1, 1);
        ctx.fillRect((17+f)%25, 1+f%3, 1, 1);
    }},
    { name: 'anim-flame-lava-valley.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#1A0000'; ctx.fillRect(0,0,25,6);
        ctx.fillStyle = '#4A0000'; ctx.fillRect(0,6,25,4);
        // Mountain walls on sides
        ctx.fillStyle = '#3E2723'; ctx.fillRect(0,5,7,20); ctx.fillRect(18,5,7,20);
        ctx.fillStyle = '#5D4037'; ctx.fillRect(0,6,5,19); ctx.fillRect(20,6,5,19);
        // Valley floor - lava river
        ctx.fillStyle = '#FF6D00'; ctx.fillRect(7,12,11,13);
        ctx.fillStyle = f%3===0?'#FFAB00':'#FF8F00';
        ctx.fillRect(8,14,9,3);
        ctx.fillStyle = '#FF3D00'; ctx.fillRect(9,18,7,4);
        // Lava bubbles
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(10+(f%5), 15+f%3, 1, 1);
        ctx.fillRect(14-(f%4), 19+f%2, 1, 1);
        // Smoke
        ctx.fillStyle = '#616161';
        ctx.fillRect(12, 10-f%4, 1, 1);
        ctx.fillRect(10, 8-f%3, 1, 1);
    }},
    { name: 'anim-flame-smoldering-peaks.gif', fn: (ctx, f) => {
        // Sunset sky
        ctx.fillStyle = '#FF6F00'; ctx.fillRect(0,0,25,4);
        ctx.fillStyle = '#E65100'; ctx.fillRect(0,4,25,3);
        ctx.fillStyle = '#BF360C'; ctx.fillRect(0,7,25,3);
        // Mountain range
        for(let i=0;i<5;i++){
            const x=i*5; const h=8+i%3;
            ctx.fillStyle='#3E2723'; ctx.fillRect(x,25-h,5,h);
            ctx.fillStyle='#4E342E'; ctx.fillRect(x+1,25-h+1,3,h-1);
        }
        // Ember glow on peaks
        ctx.fillStyle = f%2===0?'#FF6D00':'#FF8F00';
        ctx.fillRect(2,17,1,1); ctx.fillRect(7,15,1,1); ctx.fillRect(12,17,1,1); ctx.fillRect(17,16,1,1); ctx.fillRect(22,17,1,1);
        // Floating embers
        ctx.fillStyle = '#FFAB00';
        ctx.fillRect((4+f*2)%25, 8-f%5, 1, 1);
        ctx.fillRect((18+f)%25, 6-f%4, 1, 1);
        ctx.fillRect((10+f*3)%25, 7-f%3, 1, 1);
    }},
    // FLAME extra
    { name: 'anim-flame-ash-clouds.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#260000'; ctx.fillRect(0,0,25,25);
        // Ash clouds
        ctx.fillStyle = '#424242';
        for(let x=0;x<25;x++){
            const y = 3+Math.round(Math.sin((x+f)*0.5)*2);
            ctx.fillRect(x,y,1,2);
        }
        ctx.fillStyle = '#616161';
        for(let x=0;x<25;x++){
            const y = 7+Math.round(Math.cos((x+f)*0.4)*2);
            ctx.fillRect(x,y,1,1);
        }
        // Volcano below
        ctx.fillStyle = '#3E2723'; ctx.fillRect(0,14,25,11);
        ctx.fillStyle = '#5D4037'; ctx.fillRect(8,11,9,4);
        ctx.fillStyle = '#FF6D00'; ctx.fillRect(11,10,3,2);
        ctx.fillStyle = f%2===0?'#FF3D00':'#FFAB00'; ctx.fillRect(12,9,1,1);
        // Lightning
        if(f%4===0){ ctx.fillStyle='#FFF'; ctx.fillRect(18,3,1,4); ctx.fillRect(17,5,1,2); }
    }},
    // RADIANT ORDER (3)
    { name: 'anim-radiant-golden-peaks.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#FFF8E1'; ctx.fillRect(0,0,25,5);
        ctx.fillStyle = '#FFECB3'; ctx.fillRect(0,5,25,3);
        ctx.fillStyle = '#FFE082'; ctx.fillRect(0,8,25,2);
        // Sun
        const sy = 3-Math.floor(f/4);
        ctx.fillStyle = '#FFD700'; ctx.fillRect(10,Math.max(0,sy),5,4);
        ctx.fillStyle = '#FFF176'; ctx.fillRect(11,Math.max(0,sy)+1,3,2);
        // Golden mountains
        ctx.fillStyle = '#FFB300'; ctx.fillRect(0,12,8,13); ctx.fillRect(6,10,7,15); ctx.fillRect(15,11,10,14);
        ctx.fillStyle = '#FFC107'; ctx.fillRect(1,13,6,12); ctx.fillRect(7,11,5,14); ctx.fillRect(16,12,8,13);
        // Snow caps (golden-white)
        ctx.fillStyle = '#FFFDE7'; ctx.fillRect(3,12,2,1); ctx.fillRect(8,10,3,1); ctx.fillRect(19,11,3,1);
        // Light sparkle
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(9+f%5, 10, 1, 1);
        // Meadow
        ctx.fillStyle = '#FFD54F'; ctx.fillRect(0,22,25,3);
    }},
    { name: 'anim-radiant-sun-ridges.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#FFFDE7'; ctx.fillRect(0,0,25,10);
        // Sun rays
        ctx.fillStyle = '#FFD700';
        for(let i=0;i<6;i++){
            const x = 4*i+1+f%4;
            ctx.fillRect(x%25, 0, 1, 10);
        }
        // Ridge layers
        ctx.fillStyle = '#F9A825'; ctx.fillRect(0,10,25,3);
        ctx.fillStyle = '#F57F17'; ctx.fillRect(0,13,25,3);
        ctx.fillStyle = '#E65100'; ctx.fillRect(0,16,25,3);
        // Ridge detail
        for(let x=0;x<25;x++){
            ctx.fillStyle = '#FFB300';
            ctx.fillRect(x, 10+Math.round(Math.sin(x*0.6)*1), 1, 1);
            ctx.fillStyle = '#FF8F00';
            ctx.fillRect(x, 13+Math.round(Math.cos(x*0.5)*1), 1, 1);
        }
        ctx.fillStyle = '#FFD54F'; ctx.fillRect(0,19,25,6);
        // Glitter
        ctx.fillStyle = '#FFF';
        ctx.fillRect((5+f*3)%25, 11, 1, 1);
        ctx.fillRect((15+f*2)%25, 14, 1, 1);
    }},
    { name: 'anim-radiant-wheat-mountains.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#87CEEB'; ctx.fillRect(0,0,25,8);
        ctx.fillStyle = '#FFD700'; ctx.fillRect(20,1,3,3);
        // Distant golden mountains
        ctx.fillStyle = '#FFB300'; ctx.fillRect(0,8,8,3); ctx.fillRect(10,7,7,4); ctx.fillRect(19,8,6,3);
        ctx.fillStyle = '#FFFDE7'; ctx.fillRect(3,8,2,1); ctx.fillRect(12,7,3,1); ctx.fillRect(21,8,2,1);
        // Wheat field
        for(let x=0;x<25;x++){
            const sway = Math.sin((x+f)*0.5)*1;
            const h = 10+Math.round(sway);
            ctx.fillStyle = x%2===0?'#F9A825':'#FDD835';
            ctx.fillRect(x, 25-h, 1, h);
            ctx.fillStyle = '#FFD54F';
            ctx.fillRect(x, 25-h, 1, 1);
        }
    }},
    // DEEP ORDER (3)
    { name: 'anim-deep-coastal-cliffs.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#B3E5FC'; ctx.fillRect(0,0,25,8);
        // Cliffs
        ctx.fillStyle = '#607D8B'; ctx.fillRect(0,8,10,17);
        ctx.fillStyle = '#78909C'; ctx.fillRect(1,9,8,16);
        ctx.fillStyle = '#455A64'; ctx.fillRect(0,8,3,5);
        // Ocean
        ctx.fillStyle = '#1565C0'; ctx.fillRect(10,12,15,13);
        ctx.fillStyle = '#0D47A1'; ctx.fillRect(10,18,15,7);
        // Waves crashing
        ctx.fillStyle = '#E3F2FD';
        const waveY = 12+f%2;
        ctx.fillRect(10, waveY, 3, 1);
        ctx.fillRect(15, waveY+1, 2, 1);
        ctx.fillRect(20, waveY, 2, 1);
        // Spray
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(10, 11-f%3, 1, 1);
        ctx.fillRect(9, 10-f%2, 1, 1);
        // Seabirds
        ctx.fillStyle = '#333';
        ctx.fillRect((15+f)%25, 4, 1, 1);
        ctx.fillRect((20+f)%25, 5, 1, 1);
    }},
    { name: 'anim-deep-ocean-trench.gif', fn: (ctx, f) => {
        // All underwater
        ctx.fillStyle = '#0D47A1'; ctx.fillRect(0,0,25,8);
        ctx.fillStyle = '#0A3A7A'; ctx.fillRect(0,8,25,8);
        ctx.fillStyle = '#062B5C'; ctx.fillRect(0,16,25,9);
        // Trench walls
        ctx.fillStyle = '#37474F'; ctx.fillRect(0,5,6,20); ctx.fillRect(19,5,6,20);
        ctx.fillStyle = '#455A64'; ctx.fillRect(1,7,4,18); ctx.fillRect(20,7,4,18);
        // Trench floor
        ctx.fillStyle = '#263238'; ctx.fillRect(6,22,13,3);
        // Bioluminescent spots
        ctx.fillStyle = f%2===0?'#00E5FF':'#18FFFF';
        ctx.fillRect(8,15,1,1); ctx.fillRect(16,12,1,1);
        ctx.fillStyle = f%3===0?'#76FF03':'#00E676';
        ctx.fillRect(12,20,1,1); ctx.fillRect(14,18,1,1);
        // Bubbles rising
        ctx.fillStyle = '#B3E5FC';
        ctx.fillRect(10, 10-f%8, 1, 1);
        ctx.fillRect(15, 8-(f+3)%8, 1, 1);
    }},
    { name: 'anim-deep-underwater-ridge.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#1565C0'; ctx.fillRect(0,0,25,25);
        ctx.fillStyle = '#0D47A1'; ctx.fillRect(0,10,25,15);
        // Underwater mountain ridge
        ctx.fillStyle = '#455A64';
        for(let i=0;i<5;i++){
            const x=i*5; const h=6+i%3*2;
            ctx.fillRect(x,25-h,5,h);
        }
        ctx.fillStyle = '#546E7A';
        for(let i=0;i<5;i++){
            const x=i*5+1; const h=5+i%3*2;
            ctx.fillRect(x,25-h,3,h);
        }
        // Coral
        ctx.fillStyle = '#FF5722'; ctx.fillRect(3,20,1,2); ctx.fillRect(13,19,1,2);
        ctx.fillStyle = '#FF9800'; ctx.fillRect(8,21,1,1); ctx.fillRect(20,20,1,1);
        // Fish
        ctx.fillStyle = '#FFEB3B';
        ctx.fillRect((5+f*2)%25, 7, 2, 1);
        ctx.fillStyle = '#FF4081';
        ctx.fillRect((18-f)%25, 12, 2, 1);
        // Light rays from above
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(8+f%3, 0, 1, 10);
        ctx.fillRect(16-f%3, 0, 1, 8);
    }},
    // WILD ORDER (3)
    { name: 'anim-wild-forest-canopy.gif', fn: (ctx, f) => {
        // Sky peeking
        ctx.fillStyle = '#87CEEB'; ctx.fillRect(0,0,25,3);
        // Dense canopy
        ctx.fillStyle = '#1B5E20'; ctx.fillRect(0,3,25,22);
        ctx.fillStyle = '#2E7D32';
        for(let x=0;x<25;x+=3) ctx.fillRect(x, 3+x%4, 3, 5);
        ctx.fillStyle = '#388E3C';
        for(let x=1;x<25;x+=4) ctx.fillRect(x, 5+x%3, 3, 4);
        ctx.fillStyle = '#4CAF50';
        for(let x=0;x<25;x+=5) ctx.fillRect(x, 8, 4, 3);
        // Trunks below
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(4,15,2,10); ctx.fillRect(12,14,2,11); ctx.fillRect(20,16,2,9);
        // Leaves falling
        ctx.fillStyle = '#81C784';
        ctx.fillRect((3+f)%25, (5+f*2)%15+3, 1, 1);
        ctx.fillRect((15+f*2)%25, (8+f)%15+3, 1, 1);
        // Sunlight patches
        ctx.fillStyle = '#C8E6C9';
        ctx.fillRect(8+f%4, 6, 1, 1);
    }},
    { name: 'anim-wild-mossy-range.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#87CEEB'; ctx.fillRect(0,0,25,8);
        ctx.fillStyle = '#B0BEC5';
        ctx.fillRect(2,4,3,1); ctx.fillRect(15,3,4,1); // clouds
        // Mossy mountains
        ctx.fillStyle = '#2E7D32'; ctx.fillRect(0,8,7,7); ctx.fillRect(5,6,8,9); ctx.fillRect(15,7,10,8);
        ctx.fillStyle = '#388E3C'; ctx.fillRect(1,9,5,6); ctx.fillRect(6,7,6,8); ctx.fillRect(16,8,8,7);
        // Moss detail
        ctx.fillStyle = '#81C784';
        ctx.fillRect(3,8,1,1); ctx.fillRect(8,7,1,1); ctx.fillRect(19,8,1,1);
        // Valley
        ctx.fillStyle = '#4CAF50'; ctx.fillRect(0,15,25,10);
        ctx.fillStyle = '#66BB6A'; ctx.fillRect(0,15,25,2);
        // Mist
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(0, 14+f%2, 25, 1);
        // Birds
        ctx.fillStyle = '#333';
        ctx.fillRect((7+f)%25, 3, 1, 1);
    }},
    { name: 'anim-wild-jungle-valley.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#87CEEB'; ctx.fillRect(0,0,25,5);
        // Jungle hills on sides
        ctx.fillStyle = '#1B5E20'; ctx.fillRect(0,5,8,20); ctx.fillRect(17,5,8,20);
        ctx.fillStyle = '#2E7D32'; ctx.fillRect(1,7,6,18); ctx.fillRect(18,7,6,18);
        // Valley center
        ctx.fillStyle = '#4CAF50'; ctx.fillRect(8,10,9,15);
        ctx.fillStyle = '#66BB6A'; ctx.fillRect(9,11,7,14);
        // River through valley
        ctx.fillStyle = '#29B6F6'; ctx.fillRect(11,12,3,13);
        ctx.fillStyle = '#4FC3F7'; ctx.fillRect(12,13,1,12);
        // Waterfall
        ctx.fillStyle = '#E3F2FD';
        ctx.fillRect(12, 10+f%2, 1, 2);
        // Parrots
        ctx.fillStyle = '#FF1744';
        ctx.fillRect((5+f)%8+1, 8, 1, 1);
        ctx.fillStyle = '#00E676';
        ctx.fillRect((20-f)%7+17, 7, 1, 1);
    }},
    // ARCANE ORDER (3)
    { name: 'anim-arcane-crystal-mountains.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#1A0033'; ctx.fillRect(0,0,25,25);
        ctx.fillStyle = '#2A0052'; ctx.fillRect(0,6,25,4);
        // Purple aurora
        ctx.fillStyle = '#7C4DFF';
        for(let x=0;x<25;x++){
            const y = 3+Math.round(Math.sin((x+f)*0.5)*2);
            ctx.fillRect(x,y,1,1);
        }
        // Crystal mountains
        ctx.fillStyle = '#4A148C'; ctx.fillRect(0,12,8,13); ctx.fillRect(9,10,7,15); ctx.fillRect(18,11,7,14);
        ctx.fillStyle = '#6A1B9A'; ctx.fillRect(1,13,6,12); ctx.fillRect(10,11,5,14); ctx.fillRect(19,12,5,13);
        // Crystal glints
        ctx.fillStyle = f%2===0?'#E040FB':'#EA80FC';
        ctx.fillRect(4,12,1,1); ctx.fillRect(12,10,1,1); ctx.fillRect(21,11,1,1);
        ctx.fillStyle = '#B388FF';
        ctx.fillRect(3+f%3,14,1,1); ctx.fillRect(15-f%3,13,1,1);
        // Stars
        ctx.fillStyle = '#FFF';
        ctx.fillRect(5,1,1,1); ctx.fillRect(14,2,1,1); ctx.fillRect(22,1,1,1);
    }},
    { name: 'anim-arcane-floating-peaks.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#1A0033'; ctx.fillRect(0,0,25,25);
        // Stars
        ctx.fillStyle = '#FFF';
        ctx.fillRect(2,1,1,1); ctx.fillRect(10,2,1,1); ctx.fillRect(18,0,1,1); ctx.fillRect(23,3,1,1);
        // Floating islands (bob up and down)
        const bob = Math.round(Math.sin(f*0.5)*1);
        ctx.fillStyle = '#4A148C'; ctx.fillRect(2,8+bob,6,3); ctx.fillRect(10,12-bob,5,3); ctx.fillRect(18,9+bob,5,3);
        // Bottom terrain
        ctx.fillStyle = '#311B92'; ctx.fillRect(3,9+bob,4,2); ctx.fillRect(11,13-bob,3,2); ctx.fillRect(19,10+bob,3,2);
        // Crystals on islands
        ctx.fillStyle = '#E040FB'; ctx.fillRect(4,7+bob,1,1); ctx.fillRect(12,11-bob,1,1); ctx.fillRect(20,8+bob,1,1);
        // Ground below
        ctx.fillStyle = '#4A148C'; ctx.fillRect(0,20,25,5);
        ctx.fillStyle = '#6A1B9A'; ctx.fillRect(0,21,25,4);
        // Magic energy lines connecting
        ctx.fillStyle = '#B388FF';
        ctx.fillRect(8, 10+bob, 2, 1);
        ctx.fillRect(15, 11-bob, 3, 1);
        // Sparkles
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect((5+f*2)%25, 5, 1, 1);
    }},
    { name: 'anim-arcane-ruins-peaks.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#0D0033'; ctx.fillRect(0,0,25,25);
        // Purple sky
        ctx.fillStyle = '#2A0052'; ctx.fillRect(0,0,25,8);
        // Moon
        ctx.fillStyle = '#E1BEE7'; ctx.fillRect(20,2,3,3);
        ctx.fillStyle = '#F3E5F5'; ctx.fillRect(21,3,1,1);
        // Mountain with ruins
        ctx.fillStyle = '#4A148C'; ctx.fillRect(0,12,25,13);
        ctx.fillStyle = '#6A1B9A'; ctx.fillRect(5,9,15,16);
        ctx.fillStyle = '#7B1FA2'; ctx.fillRect(7,10,11,15);
        // Ruins - pillars
        ctx.fillStyle = '#9E9E9E'; ctx.fillRect(9,8,1,4); ctx.fillRect(12,7,1,5); ctx.fillRect(15,8,1,4);
        ctx.fillStyle = '#BDBDBD'; ctx.fillRect(9,7,3,1); ctx.fillRect(12,6,4,1);
        // Magic glow
        ctx.fillStyle = f%3===0?'#E040FB':'#B388FF';
        ctx.fillRect(11,8,1,1); ctx.fillRect(14,9,1,1);
        // Magical particles rising
        ctx.fillStyle = '#CE93D8';
        ctx.fillRect(10, 6-f%4, 1, 1);
        ctx.fillRect(13, 5-(f+2)%4, 1, 1);
    }},
    // HEART ORDER (4)
    { name: 'anim-heart-cherry-blossom-hills.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#FCE4EC'; ctx.fillRect(0,0,25,8);
        ctx.fillStyle = '#F8BBD0'; ctx.fillRect(0,5,25,3);
        // Gentle rolling hills
        ctx.fillStyle = '#81C784';
        for(let x=0;x<25;x++){
            const h = 12+Math.round(Math.sin(x*0.3)*3);
            ctx.fillRect(x,h,1,25-h);
        }
        ctx.fillStyle = '#A5D6A7';
        for(let x=0;x<25;x++){
            const h = 12+Math.round(Math.sin(x*0.3)*3);
            ctx.fillRect(x,h,1,2);
        }
        // Cherry trees
        ctx.fillStyle = '#5D4037'; ctx.fillRect(6,11,1,5); ctx.fillRect(16,10,1,5);
        ctx.fillStyle = '#F48FB1'; ctx.fillRect(4,9,5,3); ctx.fillRect(14,8,5,3);
        ctx.fillStyle = '#F06292'; ctx.fillRect(5,10,3,1); ctx.fillRect(15,9,3,1);
        // Falling petals
        ctx.fillStyle = '#F8BBD0';
        ctx.fillRect((3+f)%25, (4+f*2)%10+5, 1, 1);
        ctx.fillRect((12+f*2)%25, (6+f)%10+5, 1, 1);
        ctx.fillRect((20+f)%25, (3+f*2)%10+5, 1, 1);
    }},
    { name: 'anim-heart-flower-mountains.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#F3E5F5'; ctx.fillRect(0,0,25,6);
        ctx.fillStyle = '#FCE4EC'; ctx.fillRect(0,6,25,2);
        // Pink-green mountains
        ctx.fillStyle = '#81C784'; ctx.fillRect(0,10,8,15); ctx.fillRect(8,8,9,17); ctx.fillRect(19,9,6,16);
        ctx.fillStyle = '#A5D6A7'; ctx.fillRect(1,11,6,14); ctx.fillRect(9,9,7,16); ctx.fillRect(20,10,4,15);
        // Flowers on mountains
        ctx.fillStyle = '#F06292'; ctx.fillRect(3,11,1,1); ctx.fillRect(11,9,1,1); ctx.fillRect(21,10,1,1);
        ctx.fillStyle = '#FF4081'; ctx.fillRect(5,12,1,1); ctx.fillRect(14,10,1,1); ctx.fillRect(23,11,1,1);
        ctx.fillStyle = '#E91E63'; ctx.fillRect(2,13,1,1); ctx.fillRect(16,11,1,1);
        // Heart shapes floating
        ctx.fillStyle = '#F48FB1';
        ctx.fillRect((8+f)%25, 4+f%3, 1, 1);
        ctx.fillRect((18+f*2)%25, 3+f%2, 1, 1);
        // Butterflies
        ctx.fillStyle = '#FF80AB';
        ctx.fillRect((5+f)%20+2, 5+Math.round(Math.sin(f)*1), 1, 1);
    }},
    { name: 'anim-heart-peaceful-valley.gif', fn: (ctx, f) => {
        // Dawn sky
        ctx.fillStyle = '#FCE4EC'; ctx.fillRect(0,0,25,4);
        ctx.fillStyle = '#F8BBD0'; ctx.fillRect(0,4,25,2);
        ctx.fillStyle = '#FFCCBC'; ctx.fillRect(0,6,25,2);
        // Soft mountains on sides
        ctx.fillStyle = '#C8E6C9'; ctx.fillRect(0,8,7,17); ctx.fillRect(18,8,7,17);
        ctx.fillStyle = '#A5D6A7'; ctx.fillRect(1,9,5,16); ctx.fillRect(19,9,5,16);
        // Valley floor
        ctx.fillStyle = '#81C784'; ctx.fillRect(7,14,11,11);
        ctx.fillStyle = '#A5D6A7'; ctx.fillRect(8,15,9,10);
        // Small stream
        ctx.fillStyle = '#B3E5FC'; ctx.fillRect(11,16,3,9);
        ctx.fillStyle = '#E1F5FE'; ctx.fillRect(12,17,1,8);
        // Flowers dotting valley
        ctx.fillStyle = '#F48FB1'; ctx.fillRect(9,18,1,1); ctx.fillRect(14,19,1,1);
        ctx.fillStyle = '#CE93D8'; ctx.fillRect(10,20,1,1);
        // Morning mist
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(7, 13+f%2, 11, 1);
    }},
];

// ========== 20 STILL LANDSCAPE PNGs ==========
const stills = [
    // FLAME (3-4)
    { name: 'scene-flame-erupting-range.png', fn: (ctx) => {
        ctx.fillStyle='#4A0000'; ctx.fillRect(0,0,25,8);
        ctx.fillStyle='#3E2723'; ctx.fillRect(0,10,25,15);
        ctx.fillStyle='#5D4037'; ctx.fillRect(2,8,4,3); ctx.fillRect(10,6,5,5); ctx.fillRect(18,7,5,4);
        ctx.fillStyle='#FF6D00'; ctx.fillRect(12,5,1,2); ctx.fillRect(11,4,1,1); ctx.fillRect(13,4,1,1);
        ctx.fillStyle='#FF3D00'; ctx.fillRect(13,11,1,4); ctx.fillRect(5,12,1,3);
    }},
    { name: 'scene-flame-lava-flow.png', fn: (ctx) => {
        ctx.fillStyle='#1A0000'; ctx.fillRect(0,0,25,25);
        ctx.fillStyle='#3E2723'; ctx.fillRect(0,5,7,20); ctx.fillRect(18,5,7,20);
        ctx.fillStyle='#FF6D00'; ctx.fillRect(7,10,11,15);
        ctx.fillStyle='#FF8F00'; ctx.fillRect(8,12,9,5);
        ctx.fillStyle='#FFAB00'; ctx.fillRect(10,15,5,2);
        ctx.fillStyle='#FF3D00'; ctx.fillRect(9,18,7,7);
    }},
    { name: 'scene-flame-smoldering-sunset.png', fn: (ctx) => {
        ctx.fillStyle='#FF6F00'; ctx.fillRect(0,0,25,4);
        ctx.fillStyle='#E65100'; ctx.fillRect(0,4,25,3);
        ctx.fillStyle='#BF360C'; ctx.fillRect(0,7,25,3);
        for(let i=0;i<5;i++){
            ctx.fillStyle='#3E2723'; ctx.fillRect(i*5,25-(8+i%3),5,8+i%3);
        }
        ctx.fillStyle='#FF6D00'; ctx.fillRect(2,17,1,1); ctx.fillRect(12,17,1,1); ctx.fillRect(22,17,1,1);
    }},
    // RADIANT (3-4)
    { name: 'scene-radiant-golden-summit.png', fn: (ctx) => {
        ctx.fillStyle='#FFF8E1'; ctx.fillRect(0,0,25,5);
        ctx.fillStyle='#FFECB3'; ctx.fillRect(0,5,25,3);
        ctx.fillStyle='#FFD700'; ctx.fillRect(10,1,5,4);
        ctx.fillStyle='#FFB300'; ctx.fillRect(0,12,8,13); ctx.fillRect(9,10,7,15); ctx.fillRect(18,11,7,14);
        ctx.fillStyle='#FFC107'; ctx.fillRect(1,13,6,12); ctx.fillRect(10,11,5,14);
        ctx.fillStyle='#FFFDE7'; ctx.fillRect(3,12,2,1); ctx.fillRect(12,10,3,1);
        ctx.fillStyle='#FFD54F'; ctx.fillRect(0,22,25,3);
    }},
    { name: 'scene-radiant-sun-valley.png', fn: (ctx) => {
        ctx.fillStyle='#FFFDE7'; ctx.fillRect(0,0,25,10);
        ctx.fillStyle='#FFD700'; ctx.fillRect(11,2,3,3);
        ctx.fillStyle='#FFB300'; ctx.fillRect(0,8,8,5); ctx.fillRect(17,8,8,5);
        ctx.fillStyle='#FFC107'; ctx.fillRect(1,9,6,4); ctx.fillRect(18,9,6,4);
        ctx.fillStyle='#F9A825'; ctx.fillRect(8,13,9,12);
        ctx.fillStyle='#FDD835'; ctx.fillRect(9,14,7,11);
        ctx.fillStyle='#FFFF8D'; ctx.fillRect(12,10,1,3);
    }},
    { name: 'scene-radiant-wheat-plains.png', fn: (ctx) => {
        ctx.fillStyle='#87CEEB'; ctx.fillRect(0,0,25,8);
        ctx.fillStyle='#FFD700'; ctx.fillRect(20,1,3,3);
        ctx.fillStyle='#FFB300'; ctx.fillRect(0,8,8,2); ctx.fillRect(14,7,6,2);
        for(let x=0;x<25;x++){
            ctx.fillStyle=x%2===0?'#F9A825':'#FDD835';
            ctx.fillRect(x,10,1,15);
        }
        ctx.fillStyle='#D7CCC8'; ctx.fillRect(10,16,5,9);
    }},
    { name: 'scene-radiant-celestial-peak.png', fn: (ctx) => {
        ctx.fillStyle='#FFF8E1'; ctx.fillRect(0,0,25,25);
        ctx.fillStyle='#FFD700'; ctx.fillRect(10,0,5,5);
        ctx.fillStyle='#FFEB3B'; ctx.fillRect(11,1,3,3);
        ctx.fillStyle='#FFB300'; ctx.fillRect(7,10,11,15);
        ctx.fillStyle='#FFC107'; ctx.fillRect(8,11,9,14);
        ctx.fillStyle='#FFFDE7'; ctx.fillRect(10,10,5,2);
        ctx.fillStyle='#FFF'; ctx.fillRect(11,10,3,1);
        ctx.fillStyle='#FFD54F'; ctx.fillRect(0,20,7,5); ctx.fillRect(18,20,7,5);
    }},
    // DEEP (3-4)
    { name: 'scene-deep-coastal-vista.png', fn: (ctx) => {
        ctx.fillStyle='#B3E5FC'; ctx.fillRect(0,0,25,8);
        ctx.fillStyle='#607D8B'; ctx.fillRect(0,8,10,17);
        ctx.fillStyle='#78909C'; ctx.fillRect(1,9,8,16);
        ctx.fillStyle='#1565C0'; ctx.fillRect(10,12,15,13);
        ctx.fillStyle='#0D47A1'; ctx.fillRect(10,18,15,7);
        ctx.fillStyle='#E3F2FD'; ctx.fillRect(10,12,3,1); ctx.fillRect(18,13,2,1);
    }},
    { name: 'scene-deep-ocean-canyon.png', fn: (ctx) => {
        ctx.fillStyle='#0D47A1'; ctx.fillRect(0,0,25,8);
        ctx.fillStyle='#0A3A7A'; ctx.fillRect(0,8,25,8);
        ctx.fillStyle='#062B5C'; ctx.fillRect(0,16,25,9);
        ctx.fillStyle='#37474F'; ctx.fillRect(0,5,6,20); ctx.fillRect(19,5,6,20);
        ctx.fillStyle='#263238'; ctx.fillRect(6,22,13,3);
        ctx.fillStyle='#00E5FF'; ctx.fillRect(8,15,1,1); ctx.fillRect(16,12,1,1);
        ctx.fillStyle='#76FF03'; ctx.fillRect(12,20,1,1);
    }},
    { name: 'scene-deep-tidal-cliffs.png', fn: (ctx) => {
        ctx.fillStyle='#87CEEB'; ctx.fillRect(0,0,25,6);
        ctx.fillStyle='#B0BEC5'; ctx.fillRect(3,2,4,2); ctx.fillRect(16,3,3,1);
        ctx.fillStyle='#607D8B'; ctx.fillRect(0,6,25,6);
        ctx.fillStyle='#78909C'; ctx.fillRect(0,7,25,4);
        ctx.fillStyle='#1565C0'; ctx.fillRect(0,12,25,13);
        ctx.fillStyle='#0D47A1'; ctx.fillRect(0,18,25,7);
        ctx.fillStyle='#E3F2FD'; ctx.fillRect(2,12,3,1); ctx.fillRect(12,12,2,1); ctx.fillRect(20,12,3,1);
    }},
    // WILD (3)
    { name: 'scene-wild-endless-canopy.png', fn: (ctx) => {
        ctx.fillStyle='#87CEEB'; ctx.fillRect(0,0,25,3);
        ctx.fillStyle='#1B5E20'; ctx.fillRect(0,3,25,22);
        ctx.fillStyle='#2E7D32'; for(let x=0;x<25;x+=3) ctx.fillRect(x,3+x%4,3,5);
        ctx.fillStyle='#388E3C'; for(let x=1;x<25;x+=4) ctx.fillRect(x,5+x%3,3,4);
        ctx.fillStyle='#4CAF50'; for(let x=0;x<25;x+=5) ctx.fillRect(x,8,4,3);
        ctx.fillStyle='#5D4037'; ctx.fillRect(4,15,2,10); ctx.fillRect(12,14,2,11); ctx.fillRect(20,16,2,9);
    }},
    { name: 'scene-wild-mossy-peaks.png', fn: (ctx) => {
        ctx.fillStyle='#87CEEB'; ctx.fillRect(0,0,25,8);
        ctx.fillStyle='#2E7D32'; ctx.fillRect(0,8,7,7); ctx.fillRect(5,6,8,9); ctx.fillRect(15,7,10,8);
        ctx.fillStyle='#388E3C'; ctx.fillRect(1,9,5,6); ctx.fillRect(6,7,6,8); ctx.fillRect(16,8,8,7);
        ctx.fillStyle='#81C784'; ctx.fillRect(3,8,1,1); ctx.fillRect(8,7,1,1); ctx.fillRect(19,8,1,1);
        ctx.fillStyle='#4CAF50'; ctx.fillRect(0,15,25,10);
        ctx.fillStyle='#E8F5E9'; ctx.fillRect(0,14,25,1);
    }},
    { name: 'scene-wild-jungle-river.png', fn: (ctx) => {
        ctx.fillStyle='#87CEEB'; ctx.fillRect(0,0,25,5);
        ctx.fillStyle='#1B5E20'; ctx.fillRect(0,5,8,20); ctx.fillRect(17,5,8,20);
        ctx.fillStyle='#2E7D32'; ctx.fillRect(1,7,6,18); ctx.fillRect(18,7,6,18);
        ctx.fillStyle='#4CAF50'; ctx.fillRect(8,10,9,15);
        ctx.fillStyle='#29B6F6'; ctx.fillRect(11,12,3,13);
        ctx.fillStyle='#E3F2FD'; ctx.fillRect(12,10,1,2);
    }},
    // ARCANE (3)
    { name: 'scene-arcane-crystal-spires.png', fn: (ctx) => {
        ctx.fillStyle='#1A0033'; ctx.fillRect(0,0,25,25);
        ctx.fillStyle='#7C4DFF'; for(let x=0;x<25;x++) ctx.fillRect(x,3+Math.round(Math.sin(x*0.5)*2),1,1);
        ctx.fillStyle='#4A148C'; ctx.fillRect(0,12,8,13); ctx.fillRect(9,10,7,15); ctx.fillRect(18,11,7,14);
        ctx.fillStyle='#6A1B9A'; ctx.fillRect(1,13,6,12); ctx.fillRect(10,11,5,14); ctx.fillRect(19,12,5,13);
        ctx.fillStyle='#E040FB'; ctx.fillRect(4,12,1,1); ctx.fillRect(12,10,1,1); ctx.fillRect(21,11,1,1);
        ctx.fillStyle='#FFF'; ctx.fillRect(5,1,1,1); ctx.fillRect(14,2,1,1); ctx.fillRect(22,1,1,1);
    }},
    { name: 'scene-arcane-floating-isles.png', fn: (ctx) => {
        ctx.fillStyle='#1A0033'; ctx.fillRect(0,0,25,25);
        ctx.fillStyle='#FFF'; ctx.fillRect(2,1,1,1); ctx.fillRect(10,2,1,1); ctx.fillRect(18,0,1,1);
        ctx.fillStyle='#4A148C'; ctx.fillRect(2,9,6,3); ctx.fillRect(10,13,5,3); ctx.fillRect(18,10,5,3);
        ctx.fillStyle='#E040FB'; ctx.fillRect(4,8,1,1); ctx.fillRect(12,12,1,1); ctx.fillRect(20,9,1,1);
        ctx.fillStyle='#B388FF'; ctx.fillRect(8,10,2,1); ctx.fillRect(15,12,3,1);
        ctx.fillStyle='#4A148C'; ctx.fillRect(0,20,25,5);
        ctx.fillStyle='#6A1B9A'; ctx.fillRect(0,21,25,4);
    }},
    { name: 'scene-arcane-ruins-mountain.png', fn: (ctx) => {
        ctx.fillStyle='#0D0033'; ctx.fillRect(0,0,25,25);
        ctx.fillStyle='#2A0052'; ctx.fillRect(0,0,25,8);
        ctx.fillStyle='#E1BEE7'; ctx.fillRect(20,2,3,3);
        ctx.fillStyle='#4A148C'; ctx.fillRect(0,12,25,13);
        ctx.fillStyle='#6A1B9A'; ctx.fillRect(5,9,15,16);
        ctx.fillStyle='#9E9E9E'; ctx.fillRect(9,8,1,4); ctx.fillRect(12,7,1,5); ctx.fillRect(15,8,1,4);
        ctx.fillStyle='#BDBDBD'; ctx.fillRect(9,7,3,1); ctx.fillRect(12,6,4,1);
        ctx.fillStyle='#E040FB'; ctx.fillRect(11,8,1,1); ctx.fillRect(14,9,1,1);
    }},
    // HEART (3)
    { name: 'scene-heart-blossom-hillside.png', fn: (ctx) => {
        ctx.fillStyle='#FCE4EC'; ctx.fillRect(0,0,25,8);
        ctx.fillStyle='#81C784';
        for(let x=0;x<25;x++) ctx.fillRect(x,12+Math.round(Math.sin(x*0.3)*3),1,25);
        ctx.fillStyle='#5D4037'; ctx.fillRect(6,11,1,5); ctx.fillRect(16,10,1,5);
        ctx.fillStyle='#F48FB1'; ctx.fillRect(4,9,5,3); ctx.fillRect(14,8,5,3);
        ctx.fillStyle='#F8BBD0'; ctx.fillRect(8,6,1,1); ctx.fillRect(20,5,1,1);
    }},
    { name: 'scene-heart-rolling-flowers.png', fn: (ctx) => {
        ctx.fillStyle='#F3E5F5'; ctx.fillRect(0,0,25,6);
        ctx.fillStyle='#81C784'; ctx.fillRect(0,10,8,15); ctx.fillRect(8,8,9,17); ctx.fillRect(19,9,6,16);
        ctx.fillStyle='#A5D6A7'; ctx.fillRect(1,11,6,14); ctx.fillRect(9,9,7,16);
        ctx.fillStyle='#F06292'; ctx.fillRect(3,11,1,1); ctx.fillRect(11,9,1,1); ctx.fillRect(21,10,1,1);
        ctx.fillStyle='#FF4081'; ctx.fillRect(5,12,1,1); ctx.fillRect(14,10,1,1);
        ctx.fillStyle='#E91E63'; ctx.fillRect(16,11,1,1); ctx.fillRect(2,13,1,1);
    }},
    { name: 'scene-heart-dawn-valley.png', fn: (ctx) => {
        ctx.fillStyle='#FCE4EC'; ctx.fillRect(0,0,25,4);
        ctx.fillStyle='#FFCCBC'; ctx.fillRect(0,4,25,2);
        ctx.fillStyle='#C8E6C9'; ctx.fillRect(0,8,7,17); ctx.fillRect(18,8,7,17);
        ctx.fillStyle='#A5D6A7'; ctx.fillRect(1,9,5,16); ctx.fillRect(19,9,5,16);
        ctx.fillStyle='#81C784'; ctx.fillRect(7,14,11,11);
        ctx.fillStyle='#B3E5FC'; ctx.fillRect(11,16,3,9);
        ctx.fillStyle='#F48FB1'; ctx.fillRect(9,18,1,1); ctx.fillRect(14,19,1,1);
    }},
];

async function main() {
    console.log('Generating 20 animated landscape GIFs (25x25 → 1000x1000)...');
    for (const g of gifs) await saveGIF(g.name, g.fn);
    console.log('\nGenerating 20 still landscape PNGs (25x25 → 1000x1000)...');
    for (const s of stills) saveStill(s.name, s.fn);
    console.log('\nDone! 20 GIFs + 20 stills.');
}

main().catch(console.error);
