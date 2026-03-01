const GIFEncoder = require('gif-encoder-2');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = './content-bg';
const STILL_DIR = './content-bg/still';

// Correct format: 25x25 → 1000x1000
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

// Color helpers
function hsl(h,s,l){ return `hsl(${h},${s}%,${l}%)`; }

// ========== 20 ANIMATED GIF DEFINITIONS ==========

const gifs = [
    // 1. Sunny meadow with fireflies
    { name: 'anim-sunny-meadow-fireflies.gif', fn: (ctx, f) => {
        // Sky gradient
        ctx.fillStyle = '#87CEEB'; ctx.fillRect(0,0,25,12);
        ctx.fillStyle = '#98D8C8'; ctx.fillRect(0,12,25,3);
        // Sun
        ctx.fillStyle = '#FFD700'; ctx.fillRect(20,2,3,3);
        ctx.fillStyle = '#FFEB3B'; ctx.fillRect(21,3,1,1);
        // Green grass
        ctx.fillStyle = '#4CAF50'; ctx.fillRect(0,15,25,10);
        ctx.fillStyle = '#66BB6A'; for(let i=0;i<25;i+=3) ctx.fillRect(i,14,1,1);
        // Flowers
        ctx.fillStyle = '#FF6B6B'; ctx.fillRect(3,17,1,1); ctx.fillRect(10,16,1,1); ctx.fillRect(18,18,1,1);
        ctx.fillStyle = '#FFD93D'; ctx.fillRect(7,17,1,1); ctx.fillRect(15,16,1,1);
        // Fireflies (animated)
        ctx.fillStyle = f%2===0 ? '#FFFF00' : '#FFEB3B';
        ctx.fillRect((5+f)%25, 8+(f%3), 1, 1);
        ctx.fillRect((15+f*2)%25, 10-(f%4), 1, 1);
        ctx.fillRect((22+f*3)%25, 6+(f%3), 1, 1);
    }},
    // 2. Crystal clear lake
    { name: 'anim-crystal-clear-lake.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#87CEEB'; ctx.fillRect(0,0,25,10);
        ctx.fillStyle = '#FFD700'; ctx.fillRect(2,1,3,3);
        // Mountains
        ctx.fillStyle = '#8BC34A'; ctx.fillRect(0,7,8,3); ctx.fillRect(15,6,10,4);
        ctx.fillStyle = '#689F38'; ctx.fillRect(2,7,4,2); ctx.fillRect(17,6,6,3);
        // Lake
        ctx.fillStyle = '#4FC3F7'; ctx.fillRect(0,10,25,8);
        ctx.fillStyle = '#29B6F6'; ctx.fillRect(0,13,25,5);
        // Shore
        ctx.fillStyle = '#FFE0B2'; ctx.fillRect(0,18,25,2);
        ctx.fillStyle = '#4CAF50'; ctx.fillRect(0,20,25,5);
        // Water shimmer
        ctx.fillStyle = '#B3E5FC';
        ctx.fillRect((3+f)%25, 11, 2, 1);
        ctx.fillRect((12+f*2)%25, 14, 2, 1);
        ctx.fillRect((20+f)%25, 12, 1, 1);
    }},
    // 3. Rainbow over Roothold
    { name: 'anim-rainbow-over-roothold.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#87CEEB'; ctx.fillRect(0,0,25,15);
        // Rainbow arcs
        const colors = ['#FF0000','#FF7F00','#FFFF00','#00FF00','#0000FF','#4B0082','#8F00FF'];
        for(let i=0;i<colors.length;i++){
            ctx.fillStyle = colors[i];
            const y = 3+i;
            for(let x=3;x<22;x++) {
                const dy = Math.round(Math.sin((x-3)/18*Math.PI)*6);
                if(y-dy >= 0) ctx.fillRect(x, y-dy, 1, 1);
            }
        }
        // Roothold (tree city)
        ctx.fillStyle = '#4CAF50'; ctx.fillRect(0,15,25,10);
        ctx.fillStyle = '#795548'; ctx.fillRect(10,11,5,9);
        ctx.fillStyle = '#2E7D32'; ctx.fillRect(7,8,11,5);
        ctx.fillStyle = '#388E3C'; ctx.fillRect(8,9,9,3);
        // Sparkle on rainbow
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect((8+f*2)%20+3, 4-(f%3), 1, 1);
    }},
    // 4. Sunny wizard tower
    { name: 'anim-sunny-wizard-tower.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#87CEEB'; ctx.fillRect(0,0,25,18);
        ctx.fillStyle = '#FFD700'; ctx.fillRect(20,1,3,3);
        // Tower
        ctx.fillStyle = '#B0BEC5'; ctx.fillRect(9,5,7,15);
        ctx.fillStyle = '#90A4AE'; ctx.fillRect(10,6,5,13);
        // Roof
        ctx.fillStyle = '#7B1FA2'; ctx.fillRect(10,3,5,3);
        ctx.fillStyle = '#9C27B0'; ctx.fillRect(11,2,3,2);
        ctx.fillStyle = '#CE93D8'; ctx.fillRect(12,1,1,2);
        // Windows (glow)
        ctx.fillStyle = f%3===0?'#FFFF00':'#FFF176';
        ctx.fillRect(11,8,1,1); ctx.fillRect(13,8,1,1);
        ctx.fillRect(11,12,1,1); ctx.fillRect(13,12,1,1);
        // Ground
        ctx.fillStyle = '#4CAF50'; ctx.fillRect(0,20,25,5);
        ctx.fillStyle = '#66BB6A'; ctx.fillRect(0,19,9,1); ctx.fillRect(16,19,9,1);
        // Birds
        ctx.fillStyle = '#333';
        ctx.fillRect((3+f)%25, 4, 1, 1);
    }},
    // 5. Golden wheat fields
    { name: 'anim-golden-wheat-fields.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#87CEEB'; ctx.fillRect(0,0,25,10);
        ctx.fillStyle = '#FFD700'; ctx.fillRect(21,2,2,2);
        // Wheat
        for(let x=0;x<25;x++){
            const sway = Math.sin((x+f)*0.5)*1;
            const h = 8+Math.round(sway);
            ctx.fillStyle = x%2===0?'#F9A825':'#FDD835';
            ctx.fillRect(x, 25-h, 1, h);
            ctx.fillStyle = '#FFD54F';
            ctx.fillRect(x, 25-h, 1, 1);
        }
        // Path
        ctx.fillStyle = '#D7CCC8';
        ctx.fillRect(10,18,5,7);
        ctx.fillStyle = '#BCAAA4';
        ctx.fillRect(11,18,3,7);
    }},
    // 6. Bright aurora (7 moons themed)
    { name: 'anim-bright-aurora-moons.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#1A237E'; ctx.fillRect(0,0,25,25);
        // Stars
        ctx.fillStyle = '#FFF';
        ctx.fillRect(3,2,1,1); ctx.fillRect(10,1,1,1); ctx.fillRect(20,3,1,1); ctx.fillRect(15,2,1,1);
        // 7 moons
        const moonColors = ['#FFF','#FFE0B2','#B3E5FC','#C8E6C9','#F8BBD0','#E1BEE7','#FFECB3'];
        for(let i=0;i<7;i++){
            ctx.fillStyle = moonColors[i];
            ctx.fillRect(2+i*3, 4+(f+i)%3, 1, 1);
        }
        // Aurora bands
        const auColors = ['#00E676','#00BCD4','#7C4DFF','#FF4081'];
        for(let i=0;i<auColors.length;i++){
            ctx.fillStyle = auColors[i];
            for(let x=0;x<25;x++){
                const y = 10+i*2+Math.round(Math.sin((x+f*2+i*3)*0.6));
                ctx.fillRect(x, y, 1, 1);
            }
        }
        // Ground
        ctx.fillStyle = '#1B5E20'; ctx.fillRect(0,22,25,3);
    }},
    // 7. Sunlit forest clearing
    { name: 'anim-sunlit-forest-clearing.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#81C784'; ctx.fillRect(0,0,25,25);
        // Sky peek
        ctx.fillStyle = '#87CEEB'; ctx.fillRect(8,0,9,5);
        ctx.fillStyle = '#FFD700'; ctx.fillRect(11,1,3,2);
        // Trees left/right
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(0,0,8,20); ctx.fillRect(17,0,8,20);
        ctx.fillStyle = '#1B5E20';
        ctx.fillRect(1,3,6,15); ctx.fillRect(18,3,6,15);
        // Tree trunks
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(3,15,2,10); ctx.fillRect(20,15,2,10);
        // Clearing floor
        ctx.fillStyle = '#A5D6A7'; ctx.fillRect(6,18,13,7);
        ctx.fillStyle = '#C8E6C9'; ctx.fillRect(8,19,9,5);
        // Sun rays
        ctx.fillStyle = 'rgba(255,255,0,0.3)';
        ctx.fillRect(10+f%3, 5, 1, 13);
        ctx.fillRect(13-f%3, 5, 1, 13);
        // Flowers
        ctx.fillStyle = '#FF7043'; ctx.fillRect(9,20,1,1);
        ctx.fillStyle = '#FFCA28'; ctx.fillRect(14,21,1,1);
    }},
    // 8. Crystal lizard sunbathing
    { name: 'anim-crystal-lizard-sunbathing.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#87CEEB'; ctx.fillRect(0,0,25,12);
        ctx.fillStyle = '#FFD700'; ctx.fillRect(19,1,3,3);
        // Ground
        ctx.fillStyle = '#FFE0B2'; ctx.fillRect(0,12,25,13);
        ctx.fillStyle = '#FFCC80'; ctx.fillRect(0,18,25,7);
        // Rock
        ctx.fillStyle = '#9E9E9E'; ctx.fillRect(8,14,9,4);
        ctx.fillStyle = '#BDBDBD'; ctx.fillRect(9,13,7,2);
        // Crystal lizard
        ctx.fillStyle = '#00BCD4'; ctx.fillRect(10,12,4,2);
        ctx.fillStyle = '#26C6DA'; ctx.fillRect(14,12,2,1);
        ctx.fillStyle = '#00ACC1'; ctx.fillRect(9,13,1,1);
        // Crystal sparkles
        ctx.fillStyle = f%2===0?'#E0F7FA':'#FFFFFF';
        ctx.fillRect(11,11,1,1); ctx.fillRect(13,11,1,1);
        // Tail wag
        ctx.fillStyle = '#00BCD4';
        ctx.fillRect(14+f%2, 13, 1, 1);
    }},
    // 9. Wizard dog park
    { name: 'anim-wizard-dog-park.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#87CEEB'; ctx.fillRect(0,0,25,13);
        ctx.fillStyle = '#FFD700'; ctx.fillRect(21,1,2,2);
        // Grass
        ctx.fillStyle = '#4CAF50'; ctx.fillRect(0,13,25,12);
        ctx.fillStyle = '#66BB6A'; for(let i=0;i<25;i+=2) ctx.fillRect(i,12,1,1);
        // Fence
        ctx.fillStyle = '#8D6E63';
        for(let x=0;x<25;x+=4){ ctx.fillRect(x,10,1,5); }
        ctx.fillRect(0,11,25,1);
        // Dog 1 (running)
        const dx = (3+f)%20;
        ctx.fillStyle = '#8D6E63'; ctx.fillRect(dx,16,3,2); ctx.fillRect(dx+3,15,1,1);
        ctx.fillStyle = '#6D4C41'; ctx.fillRect(dx,18,1,1); ctx.fillRect(dx+2,18,1,1);
        // Dog 2 (sitting)
        ctx.fillStyle = '#FFF176'; ctx.fillRect(15,16,2,2); ctx.fillRect(15,15,1,1);
        // Wizard hat on dog
        ctx.fillStyle = '#7B1FA2'; ctx.fillRect(15,14,1,1); ctx.fillRect(14,15,1,1);
        // Tail wag
        ctx.fillStyle = '#FFF176'; ctx.fillRect(17, 15+f%2, 1, 1);
    }},
    // 10. Sunrise over Aurelius
    { name: 'anim-sunrise-over-aurelius.gif', fn: (ctx, f) => {
        // Sky gradient with sunrise
        ctx.fillStyle = '#FF7043'; ctx.fillRect(0,0,25,5);
        ctx.fillStyle = '#FFAB91'; ctx.fillRect(0,5,25,3);
        ctx.fillStyle = '#FFE0B2'; ctx.fillRect(0,8,25,2);
        ctx.fillStyle = '#87CEEB'; ctx.fillRect(0,10,25,3);
        // Rising sun
        const sy = 5 - Math.floor(f/3);
        ctx.fillStyle = '#FFD700'; ctx.fillRect(10,sy,5,4);
        ctx.fillStyle = '#FFF176'; ctx.fillRect(11,sy+1,3,2);
        // City skyline (Aurelius - golden city)
        ctx.fillStyle = '#FFB300'; ctx.fillRect(2,12,4,8); ctx.fillRect(8,10,3,10); ctx.fillRect(14,11,5,9); ctx.fillRect(20,12,4,8);
        ctx.fillStyle = '#FFA000'; ctx.fillRect(3,13,2,7); ctx.fillRect(9,11,1,9); ctx.fillRect(15,12,3,8); ctx.fillRect(21,13,2,7);
        // Spires
        ctx.fillStyle = '#FFD54F'; ctx.fillRect(4,10,1,2); ctx.fillRect(16,9,1,2); ctx.fillRect(22,10,1,2);
        ctx.fillStyle = '#4CAF50'; ctx.fillRect(0,20,25,5);
        // Sun rays
        ctx.fillStyle = '#FFFF8D';
        ctx.fillRect(8+f%5, sy-1, 1, 1); ctx.fillRect(15-f%4, sy-1, 1, 1);
    }},
    // 11. Owls in sunny tree
    { name: 'anim-owls-in-sunny-tree.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#87CEEB'; ctx.fillRect(0,0,25,25);
        ctx.fillStyle = '#FFD700'; ctx.fillRect(20,2,3,3);
        // Tree
        ctx.fillStyle = '#5D4037'; ctx.fillRect(10,10,5,15);
        ctx.fillStyle = '#2E7D32'; ctx.fillRect(4,3,17,10);
        ctx.fillStyle = '#388E3C'; ctx.fillRect(6,4,13,8);
        // Branches
        ctx.fillStyle = '#5D4037'; ctx.fillRect(6,9,4,1); ctx.fillRect(15,8,5,1);
        // Owl 1
        ctx.fillStyle = '#8D6E63'; ctx.fillRect(7,7,2,2);
        ctx.fillStyle = '#FFD700'; ctx.fillRect(7,7,1,1); ctx.fillRect(8,7,1,1);
        // Owl 2
        ctx.fillStyle = '#A1887F'; ctx.fillRect(16,6,2,2);
        ctx.fillStyle = '#FFD700'; ctx.fillRect(16,6,1,1); ctx.fillRect(17,6,1,1);
        // Blink
        if(f%6===0){ ctx.fillStyle='#5D4037'; ctx.fillRect(7,7,2,1); ctx.fillRect(16,6,2,1); }
        // Grass
        ctx.fillStyle = '#4CAF50'; ctx.fillRect(0,22,25,3);
    }},
    // 12. Sparkling river
    { name: 'anim-sparkling-river.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#87CEEB'; ctx.fillRect(0,0,25,8);
        ctx.fillStyle = '#FFD700'; ctx.fillRect(2,1,3,3);
        // Banks
        ctx.fillStyle = '#4CAF50'; ctx.fillRect(0,8,25,5); ctx.fillRect(0,18,25,7);
        ctx.fillStyle = '#66BB6A'; ctx.fillRect(0,8,25,2); ctx.fillRect(0,18,25,2);
        // River
        ctx.fillStyle = '#29B6F6'; ctx.fillRect(0,13,25,5);
        ctx.fillStyle = '#4FC3F7'; ctx.fillRect(0,14,25,3);
        // Sparkles
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect((2+f*2)%25, 14, 1, 1);
        ctx.fillRect((10+f*3)%25, 15, 1, 1);
        ctx.fillRect((18+f)%25, 14, 1, 1);
        ctx.fillRect((6+f*2)%25, 16, 1, 1);
        // Flowers on bank
        ctx.fillStyle = '#FF4081'; ctx.fillRect(3,10,1,1); ctx.fillRect(20,10,1,1);
        ctx.fillStyle = '#FFEB3B'; ctx.fillRect(8,9,1,1); ctx.fillRect(16,20,1,1);
    }},
    // 13. Magic garden butterflies
    { name: 'anim-magic-garden-butterflies.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#87CEEB'; ctx.fillRect(0,0,25,10);
        // Garden
        ctx.fillStyle = '#4CAF50'; ctx.fillRect(0,10,25,15);
        ctx.fillStyle = '#66BB6A'; ctx.fillRect(0,10,25,3);
        // Flowers
        const flowerColors = ['#E91E63','#FF5722','#FF9800','#FFEB3B','#9C27B0','#2196F3'];
        for(let i=0;i<6;i++){
            ctx.fillStyle = '#388E3C'; ctx.fillRect(2+i*4,12,1,4);
            ctx.fillStyle = flowerColors[i]; ctx.fillRect(1+i*4,11,3,2);
        }
        // Butterflies
        ctx.fillStyle = '#FF4081';
        const bx1 = (5+Math.round(Math.sin(f*0.8)*3))%25;
        const by1 = 6+Math.round(Math.sin(f*0.5)*2);
        ctx.fillRect(bx1,by1,1,1); ctx.fillRect(bx1+1,by1+f%2,1,1);
        ctx.fillStyle = '#7C4DFF';
        const bx2 = (18+Math.round(Math.cos(f*0.7)*3))%25;
        const by2 = 7+Math.round(Math.cos(f*0.4)*2);
        ctx.fillRect(bx2,by2,1,1); ctx.fillRect(bx2-1,by2+f%2,1,1);
    }},
    // 14. Seven moons rising
    { name: 'anim-seven-moons-rising.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#0D47A1'; ctx.fillRect(0,0,25,25);
        // Stars
        ctx.fillStyle = '#FFF';
        for(let i=0;i<8;i++) ctx.fillRect((i*7+3)%25, (i*5+1)%10, 1, 1);
        // 7 moons rising progressively
        const moonColors = ['#FFFDE7','#FFE0B2','#B3E5FC','#DCEDC8','#F8BBD0','#E1BEE7','#FFF9C4'];
        for(let i=0;i<7;i++){
            const baseY = 18 - Math.floor(f * 1.2) - i;
            const y = Math.max(2+i, baseY);
            ctx.fillStyle = moonColors[i];
            ctx.fillRect(1+i*3, y, 2, 2);
            ctx.fillStyle = '#FFF';
            ctx.fillRect(1+i*3, y, 1, 1);
        }
        // Horizon
        ctx.fillStyle = '#1B5E20'; ctx.fillRect(0,21,25,4);
        ctx.fillStyle = '#2E7D32'; ctx.fillRect(0,20,25,1);
    }},
    // 15. Springtime Bondsheart
    { name: 'anim-springtime-bondsheart.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#87CEEB'; ctx.fillRect(0,0,25,12);
        ctx.fillStyle = '#FFD700'; ctx.fillRect(20,2,2,2);
        // Rolling hills
        ctx.fillStyle = '#66BB6A'; ctx.fillRect(0,12,25,13);
        ctx.fillStyle = '#4CAF50';
        for(let x=0;x<25;x++){
            const h = 12+Math.round(Math.sin(x*0.4)*2);
            ctx.fillRect(x,h,1,25-h);
        }
        // Bondsheart (heart-shaped building)
        ctx.fillStyle = '#E91E63';
        ctx.fillRect(10,10,2,3); ctx.fillRect(13,10,2,3); ctx.fillRect(11,9,3,2); ctx.fillRect(12,12,1,2);
        // Cherry blossoms falling
        ctx.fillStyle = '#F8BBD0';
        ctx.fillRect((3+f)%25, (5+f*2)%12, 1, 1);
        ctx.fillRect((15+f)%25, (3+f*2)%12, 1, 1);
        ctx.fillRect((9+f*2)%25, (7+f)%12, 1, 1);
        // Flowers
        ctx.fillStyle = '#FF4081'; ctx.fillRect(5,15,1,1); ctx.fillRect(19,14,1,1);
        ctx.fillStyle = '#FFEB3B'; ctx.fillRect(8,16,1,1);
    }},
    // 16. Happy crystal cave
    { name: 'anim-happy-crystal-cave.gif', fn: (ctx, f) => {
        // Cave walls
        ctx.fillStyle = '#5D4037'; ctx.fillRect(0,0,25,25);
        ctx.fillStyle = '#4E342E'; ctx.fillRect(3,3,19,19);
        ctx.fillStyle = '#3E2723'; ctx.fillRect(5,5,15,15);
        // Crystals (colorful, glowing)
        const crystals = [
            {x:6,y:6,c:'#E040FB'},{x:10,y:4,c:'#00E5FF'},{x:15,y:5,c:'#76FF03'},
            {x:8,y:18,c:'#FF6D00'},{x:13,y:17,c:'#FFFF00'},{x:18,y:7,c:'#448AFF'},
            {x:7,y:12,c:'#FF4081'},{x:17,y:14,c:'#69F0AE'}
        ];
        for(const cr of crystals){
            ctx.fillStyle = cr.c;
            ctx.fillRect(cr.x, cr.y, 1, 3);
            ctx.fillRect(cr.x-1, cr.y+1, 1, 1);
        }
        // Sparkle animation
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(crystals[f%crystals.length].x, crystals[f%crystals.length].y-1, 1, 1);
        // Ground
        ctx.fillStyle = '#6D4C41'; ctx.fillRect(5,20,15,2);
    }},
    // 17. Sunny dock morning
    { name: 'anim-sunny-dock-morning.gif', fn: (ctx, f) => {
        // Sky
        ctx.fillStyle = '#FFAB91'; ctx.fillRect(0,0,25,5);
        ctx.fillStyle = '#FFCCBC'; ctx.fillRect(0,5,25,3);
        ctx.fillStyle = '#87CEEB'; ctx.fillRect(0,8,25,2);
        // Sun
        ctx.fillStyle = '#FFD700'; ctx.fillRect(3,2,4,3);
        ctx.fillStyle = '#FFF176'; ctx.fillRect(4,3,2,1);
        // Water
        ctx.fillStyle = '#4FC3F7'; ctx.fillRect(0,10,25,10);
        ctx.fillStyle = '#29B6F6'; ctx.fillRect(0,14,25,6);
        // Dock
        ctx.fillStyle = '#8D6E63'; ctx.fillRect(10,8,5,12);
        ctx.fillStyle = '#A1887F'; ctx.fillRect(11,9,3,10);
        // Dock posts
        ctx.fillStyle = '#5D4037'; ctx.fillRect(10,8,1,12); ctx.fillRect(14,8,1,12);
        // Water ripples
        ctx.fillStyle = '#B3E5FC';
        ctx.fillRect((2+f)%10, 12, 2, 1);
        ctx.fillRect((15+f*2)%25, 15, 2, 1);
        // Boat
        ctx.fillStyle = '#795548'; ctx.fillRect(18,11,5,2);
        ctx.fillStyle = '#FFF'; ctx.fillRect(20,9,1,2);
        // Shore
        ctx.fillStyle = '#4CAF50'; ctx.fillRect(0,20,25,5);
    }},
    // 18. Enchanted meadow dawn
    { name: 'anim-enchanted-meadow-dawn.gif', fn: (ctx, f) => {
        // Dawn sky
        ctx.fillStyle = '#FFE0B2'; ctx.fillRect(0,0,25,4);
        ctx.fillStyle = '#FFECB3'; ctx.fillRect(0,4,25,3);
        ctx.fillStyle = '#C8E6C9'; ctx.fillRect(0,7,25,3);
        // Meadow
        ctx.fillStyle = '#81C784'; ctx.fillRect(0,10,25,15);
        ctx.fillStyle = '#A5D6A7'; ctx.fillRect(0,10,25,3);
        // Mushroom ring
        ctx.fillStyle = '#FF5722';
        ctx.fillRect(8,14,1,1); ctx.fillRect(11,13,1,1); ctx.fillRect(14,14,1,1);
        ctx.fillRect(15,16,1,1); ctx.fillRect(13,18,1,1); ctx.fillRect(10,18,1,1);
        ctx.fillRect(7,16,1,1);
        // Stems
        ctx.fillStyle = '#FFECB3';
        ctx.fillRect(8,15,1,1); ctx.fillRect(11,14,1,1); ctx.fillRect(14,15,1,1);
        // Magic sparkles in ring
        ctx.fillStyle = f%2===0?'#E040FB':'#7C4DFF';
        ctx.fillRect(10+f%4, 15+f%3, 1, 1);
        ctx.fillRect(12-f%3, 16+f%2, 1, 1);
        // Mist
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(0,9,25,2);
    }},
    // 19. Cheerful windmill
    { name: 'anim-cheerful-windmill.gif', fn: (ctx, f) => {
        ctx.fillStyle = '#87CEEB'; ctx.fillRect(0,0,25,15);
        ctx.fillStyle = '#FFD700'; ctx.fillRect(20,2,2,2);
        // Grass
        ctx.fillStyle = '#4CAF50'; ctx.fillRect(0,15,25,10);
        // Windmill body
        ctx.fillStyle = '#ECEFF1'; ctx.fillRect(10,10,5,10);
        ctx.fillStyle = '#CFD8DC'; ctx.fillRect(11,11,3,8);
        // Door
        ctx.fillStyle = '#5D4037'; ctx.fillRect(11,17,3,3);
        // Blades (rotating)
        const cx = 12, cy = 9;
        const angles = [0, 3, 6, 9]; // 4 blades at quarter positions
        ctx.fillStyle = '#795548';
        for(const a of angles){
            const r = (a + f) % 12;
            const dx = Math.round(Math.cos(r*Math.PI/6)*4);
            const dy = Math.round(Math.sin(r*Math.PI/6)*4);
            // Draw blade as line
            for(let s=1;s<=4;s++){
                const px = cx+Math.round(dx*s/4);
                const py = cy+Math.round(dy*s/4);
                if(px>=0&&px<25&&py>=0&&py<25) ctx.fillRect(px,py,1,1);
            }
        }
        // Flowers
        ctx.fillStyle = '#FF4081'; ctx.fillRect(3,17,1,1); ctx.fillRect(22,16,1,1);
        ctx.fillStyle = '#FFEB3B'; ctx.fillRect(6,18,1,1);
    }},
    // 20. Golden hour forest
    { name: 'anim-golden-hour-forest.gif', fn: (ctx, f) => {
        // Golden sky
        ctx.fillStyle = '#FF8F00'; ctx.fillRect(0,0,25,5);
        ctx.fillStyle = '#FFB300'; ctx.fillRect(0,5,25,3);
        ctx.fillStyle = '#FFCA28'; ctx.fillRect(0,8,25,2);
        // Sun low
        ctx.fillStyle = '#FFD700'; ctx.fillRect(1,4,4,3);
        ctx.fillStyle = '#FFFF00'; ctx.fillRect(2,5,2,1);
        // Trees (silhouettes with golden edges)
        for(let i=0;i<5;i++){
            const tx = i*5+1;
            ctx.fillStyle = '#2E7D32'; ctx.fillRect(tx,6,4,6);
            ctx.fillStyle = '#1B5E20'; ctx.fillRect(tx+1,7,2,5);
            ctx.fillStyle = '#5D4037'; ctx.fillRect(tx+1,12,2,13);
            // Golden edge
            ctx.fillStyle = '#FFD54F'; ctx.fillRect(tx,6,1,5);
        }
        // Ground
        ctx.fillStyle = '#33691E'; ctx.fillRect(0,18,25,7);
        ctx.fillStyle = '#558B2F'; ctx.fillRect(0,18,25,2);
        // Light rays
        ctx.fillStyle = '#FFFF8D';
        ctx.fillRect(5+f%3, 8, 1, 10);
        ctx.fillRect(15-f%3, 8, 1, 10);
    }},
];

// ========== 20 STILL DEFINITIONS ==========

const stills = [
    { name: 'scene-sunny-meadow.png', fn: (ctx) => {
        ctx.fillStyle='#87CEEB'; ctx.fillRect(0,0,25,12);
        ctx.fillStyle='#FFD700'; ctx.fillRect(20,2,3,3);
        ctx.fillStyle='#4CAF50'; ctx.fillRect(0,12,25,13);
        ctx.fillStyle='#66BB6A'; for(let i=0;i<25;i+=2) ctx.fillRect(i,11,1,1);
        ctx.fillStyle='#FF6B6B'; ctx.fillRect(5,15,1,1); ctx.fillRect(12,14,1,1);
        ctx.fillStyle='#FFEB3B'; ctx.fillRect(8,16,1,1); ctx.fillRect(20,15,1,1);
        ctx.fillStyle='#E91E63'; ctx.fillRect(16,14,1,1);
    }},
    { name: 'scene-crystal-lake-shore.png', fn: (ctx) => {
        ctx.fillStyle='#87CEEB'; ctx.fillRect(0,0,25,8);
        ctx.fillStyle='#8BC34A'; ctx.fillRect(0,8,25,4);
        ctx.fillStyle='#4FC3F7'; ctx.fillRect(0,12,25,6);
        ctx.fillStyle='#29B6F6'; ctx.fillRect(0,15,25,3);
        ctx.fillStyle='#FFE0B2'; ctx.fillRect(0,18,25,2);
        ctx.fillStyle='#4CAF50'; ctx.fillRect(0,20,25,5);
        ctx.fillStyle='#FFF'; ctx.fillRect(5,13,1,1); ctx.fillRect(15,14,1,1);
    }},
    { name: 'scene-roothold-gates.png', fn: (ctx) => {
        ctx.fillStyle='#87CEEB'; ctx.fillRect(0,0,25,10);
        ctx.fillStyle='#4CAF50'; ctx.fillRect(0,10,25,15);
        ctx.fillStyle='#795548'; ctx.fillRect(8,6,9,14);
        ctx.fillStyle='#2E7D32'; ctx.fillRect(5,3,15,8);
        ctx.fillStyle='#388E3C'; ctx.fillRect(7,4,11,6);
        ctx.fillStyle='#5D4037'; ctx.fillRect(11,12,3,8);
        ctx.fillStyle='#3E2723'; ctx.fillRect(12,13,1,7);
    }},
    { name: 'scene-wizard-tower-morning.png', fn: (ctx) => {
        ctx.fillStyle='#FFCCBC'; ctx.fillRect(0,0,25,5);
        ctx.fillStyle='#87CEEB'; ctx.fillRect(0,5,25,8);
        ctx.fillStyle='#B0BEC5'; ctx.fillRect(9,3,7,17);
        ctx.fillStyle='#9C27B0'; ctx.fillRect(10,1,5,3); ctx.fillRect(11,0,3,2);
        ctx.fillStyle='#FFF176'; ctx.fillRect(11,6,1,1); ctx.fillRect(13,6,1,1);
        ctx.fillStyle='#4CAF50'; ctx.fillRect(0,20,25,5);
    }},
    { name: 'scene-golden-fields.png', fn: (ctx) => {
        ctx.fillStyle='#87CEEB'; ctx.fillRect(0,0,25,8);
        ctx.fillStyle='#FFD700'; ctx.fillRect(21,2,2,2);
        for(let x=0;x<25;x++){
            ctx.fillStyle=x%2===0?'#F9A825':'#FDD835';
            ctx.fillRect(x,8,1,17);
        }
        ctx.fillStyle='#D7CCC8'; ctx.fillRect(10,15,5,10);
    }},
    { name: 'scene-aurora-night.png', fn: (ctx) => {
        ctx.fillStyle='#1A237E'; ctx.fillRect(0,0,25,25);
        ctx.fillStyle='#FFF'; ctx.fillRect(3,2,1,1); ctx.fillRect(10,1,1,1); ctx.fillRect(20,3,1,1);
        const c=['#00E676','#00BCD4','#7C4DFF'];
        for(let i=0;i<c.length;i++){ ctx.fillStyle=c[i]; for(let x=0;x<25;x++) ctx.fillRect(x,10+i*2+Math.round(Math.sin(x*0.5)),1,1); }
        ctx.fillStyle='#FFFDE7'; ctx.fillRect(5,4,2,2);
        ctx.fillStyle='#1B5E20'; ctx.fillRect(0,22,25,3);
    }},
    { name: 'scene-forest-clearing.png', fn: (ctx) => {
        ctx.fillStyle='#81C784'; ctx.fillRect(0,0,25,25);
        ctx.fillStyle='#87CEEB'; ctx.fillRect(8,0,9,5);
        ctx.fillStyle='#2E7D32'; ctx.fillRect(0,0,8,20); ctx.fillRect(17,0,8,20);
        ctx.fillStyle='#5D4037'; ctx.fillRect(3,15,2,10); ctx.fillRect(20,15,2,10);
        ctx.fillStyle='#A5D6A7'; ctx.fillRect(6,18,13,7);
        ctx.fillStyle='#FF7043'; ctx.fillRect(9,20,1,1);
    }},
    { name: 'scene-crystal-lizard-rock.png', fn: (ctx) => {
        ctx.fillStyle='#87CEEB'; ctx.fillRect(0,0,25,12);
        ctx.fillStyle='#FFD700'; ctx.fillRect(19,1,3,3);
        ctx.fillStyle='#FFE0B2'; ctx.fillRect(0,12,25,13);
        ctx.fillStyle='#9E9E9E'; ctx.fillRect(8,14,9,4);
        ctx.fillStyle='#00BCD4'; ctx.fillRect(10,12,4,2); ctx.fillRect(14,12,2,1);
        ctx.fillStyle='#E0F7FA'; ctx.fillRect(11,11,1,1); ctx.fillRect(13,11,1,1);
    }},
    { name: 'scene-wizard-dog-park.png', fn: (ctx) => {
        ctx.fillStyle='#87CEEB'; ctx.fillRect(0,0,25,13);
        ctx.fillStyle='#4CAF50'; ctx.fillRect(0,13,25,12);
        ctx.fillStyle='#8D6E63'; for(let x=0;x<25;x+=4) ctx.fillRect(x,10,1,5);
        ctx.fillRect(0,11,25,1);
        ctx.fillStyle='#8D6E63'; ctx.fillRect(5,16,3,2); ctx.fillRect(8,15,1,1);
        ctx.fillStyle='#FFF176'; ctx.fillRect(15,16,2,2); ctx.fillRect(15,15,1,1);
        ctx.fillStyle='#7B1FA2'; ctx.fillRect(15,14,1,1);
    }},
    { name: 'scene-aurelius-skyline.png', fn: (ctx) => {
        ctx.fillStyle='#FFAB91'; ctx.fillRect(0,0,25,5);
        ctx.fillStyle='#87CEEB'; ctx.fillRect(0,5,25,7);
        ctx.fillStyle='#FFB300'; ctx.fillRect(2,12,4,8); ctx.fillRect(8,10,3,10); ctx.fillRect(14,11,5,9); ctx.fillRect(20,12,4,8);
        ctx.fillStyle='#FFD54F'; ctx.fillRect(4,10,1,2); ctx.fillRect(16,9,1,2);
        ctx.fillStyle='#4CAF50'; ctx.fillRect(0,20,25,5);
    }},
    { name: 'scene-owl-tree.png', fn: (ctx) => {
        ctx.fillStyle='#87CEEB'; ctx.fillRect(0,0,25,25);
        ctx.fillStyle='#5D4037'; ctx.fillRect(10,10,5,15);
        ctx.fillStyle='#2E7D32'; ctx.fillRect(4,3,17,10);
        ctx.fillStyle='#5D4037'; ctx.fillRect(6,9,4,1); ctx.fillRect(15,8,5,1);
        ctx.fillStyle='#8D6E63'; ctx.fillRect(7,7,2,2);
        ctx.fillStyle='#FFD700'; ctx.fillRect(7,7,1,1); ctx.fillRect(8,7,1,1);
        ctx.fillStyle='#A1887F'; ctx.fillRect(16,6,2,2);
        ctx.fillStyle='#FFD700'; ctx.fillRect(16,6,1,1); ctx.fillRect(17,6,1,1);
        ctx.fillStyle='#4CAF50'; ctx.fillRect(0,22,25,3);
    }},
    { name: 'scene-sparkling-river.png', fn: (ctx) => {
        ctx.fillStyle='#87CEEB'; ctx.fillRect(0,0,25,8);
        ctx.fillStyle='#4CAF50'; ctx.fillRect(0,8,25,5); ctx.fillRect(0,18,25,7);
        ctx.fillStyle='#29B6F6'; ctx.fillRect(0,13,25,5);
        ctx.fillStyle='#FFF'; ctx.fillRect(5,14,1,1); ctx.fillRect(12,15,1,1); ctx.fillRect(20,14,1,1);
        ctx.fillStyle='#FF4081'; ctx.fillRect(3,10,1,1);
    }},
    { name: 'scene-magic-garden.png', fn: (ctx) => {
        ctx.fillStyle='#87CEEB'; ctx.fillRect(0,0,25,10);
        ctx.fillStyle='#4CAF50'; ctx.fillRect(0,10,25,15);
        const fc=['#E91E63','#FF5722','#FF9800','#FFEB3B','#9C27B0','#2196F3'];
        for(let i=0;i<6;i++){ ctx.fillStyle='#388E3C'; ctx.fillRect(2+i*4,12,1,4); ctx.fillStyle=fc[i]; ctx.fillRect(1+i*4,11,3,2); }
        ctx.fillStyle='#FF4081'; ctx.fillRect(8,7,1,1);
    }},
    { name: 'scene-seven-moons.png', fn: (ctx) => {
        ctx.fillStyle='#0D47A1'; ctx.fillRect(0,0,25,25);
        ctx.fillStyle='#FFF'; for(let i=0;i<8;i++) ctx.fillRect((i*7+3)%25,(i*5+1)%10,1,1);
        const mc=['#FFFDE7','#FFE0B2','#B3E5FC','#DCEDC8','#F8BBD0','#E1BEE7','#FFF9C4'];
        for(let i=0;i<7;i++){ ctx.fillStyle=mc[i]; ctx.fillRect(1+i*3,3+i%3,2,2); }
        ctx.fillStyle='#1B5E20'; ctx.fillRect(0,21,25,4);
    }},
    { name: 'scene-bondsheart-spring.png', fn: (ctx) => {
        ctx.fillStyle='#87CEEB'; ctx.fillRect(0,0,25,12);
        ctx.fillStyle='#4CAF50'; ctx.fillRect(0,12,25,13);
        ctx.fillStyle='#E91E63'; ctx.fillRect(10,10,2,3); ctx.fillRect(13,10,2,3); ctx.fillRect(11,9,3,2); ctx.fillRect(12,12,1,2);
        ctx.fillStyle='#F8BBD0'; ctx.fillRect(5,8,1,1); ctx.fillRect(18,7,1,1);
        ctx.fillStyle='#FF4081'; ctx.fillRect(7,15,1,1); ctx.fillRect(19,14,1,1);
    }},
    { name: 'scene-crystal-cave-glow.png', fn: (ctx) => {
        ctx.fillStyle='#5D4037'; ctx.fillRect(0,0,25,25);
        ctx.fillStyle='#3E2723'; ctx.fillRect(5,5,15,15);
        const cr=[{x:6,y:6,c:'#E040FB'},{x:10,y:4,c:'#00E5FF'},{x:15,y:5,c:'#76FF03'},{x:8,y:18,c:'#FF6D00'},{x:13,y:17,c:'#FFFF00'},{x:18,y:7,c:'#448AFF'}];
        for(const c of cr){ ctx.fillStyle=c.c; ctx.fillRect(c.x,c.y,1,3); }
    }},
    { name: 'scene-dock-sunrise.png', fn: (ctx) => {
        ctx.fillStyle='#FFAB91'; ctx.fillRect(0,0,25,5);
        ctx.fillStyle='#87CEEB'; ctx.fillRect(0,5,25,5);
        ctx.fillStyle='#FFD700'; ctx.fillRect(3,2,4,3);
        ctx.fillStyle='#4FC3F7'; ctx.fillRect(0,10,25,10);
        ctx.fillStyle='#8D6E63'; ctx.fillRect(10,8,5,12);
        ctx.fillStyle='#5D4037'; ctx.fillRect(10,8,1,12); ctx.fillRect(14,8,1,12);
        ctx.fillStyle='#4CAF50'; ctx.fillRect(0,20,25,5);
    }},
    { name: 'scene-enchanted-meadow.png', fn: (ctx) => {
        ctx.fillStyle='#FFE0B2'; ctx.fillRect(0,0,25,4);
        ctx.fillStyle='#C8E6C9'; ctx.fillRect(0,4,25,6);
        ctx.fillStyle='#81C784'; ctx.fillRect(0,10,25,15);
        ctx.fillStyle='#FF5722'; ctx.fillRect(8,14,1,1); ctx.fillRect(14,14,1,1);
        ctx.fillStyle='#E040FB'; ctx.fillRect(11,15,1,1);
    }},
    { name: 'scene-windmill-hill.png', fn: (ctx) => {
        ctx.fillStyle='#87CEEB'; ctx.fillRect(0,0,25,15);
        ctx.fillStyle='#FFD700'; ctx.fillRect(20,2,2,2);
        ctx.fillStyle='#4CAF50'; ctx.fillRect(0,15,25,10);
        ctx.fillStyle='#ECEFF1'; ctx.fillRect(10,10,5,10);
        ctx.fillStyle='#5D4037'; ctx.fillRect(11,17,3,3);
        ctx.fillStyle='#795548'; ctx.fillRect(12,5,1,4); ctx.fillRect(8,9,9,1); ctx.fillRect(12,9,1,1);
        ctx.fillStyle='#FF4081'; ctx.fillRect(3,17,1,1);
    }},
    { name: 'scene-golden-forest.png', fn: (ctx) => {
        ctx.fillStyle='#FF8F00'; ctx.fillRect(0,0,25,5);
        ctx.fillStyle='#FFB300'; ctx.fillRect(0,5,25,3);
        ctx.fillStyle='#FFD700'; ctx.fillRect(1,4,4,3);
        for(let i=0;i<5;i++){
            const tx=i*5+1;
            ctx.fillStyle='#2E7D32'; ctx.fillRect(tx,6,4,6);
            ctx.fillStyle='#5D4037'; ctx.fillRect(tx+1,12,2,13);
            ctx.fillStyle='#FFD54F'; ctx.fillRect(tx,6,1,5);
        }
        ctx.fillStyle='#33691E'; ctx.fillRect(0,18,25,7);
    }},
];

async function main() {
    console.log('Generating 20 animated GIFs (25x25 → 1000x1000, 12 frames, 100ms)...');
    for (const g of gifs) {
        await saveGIF(g.name, g.fn);
    }
    console.log('\nGenerating 20 still PNGs (25x25 → 1000x1000)...');
    for (const s of stills) {
        saveStill(s.name, s.fn);
    }
    console.log('\nDone! Generated 20 GIFs + 20 stills in correct format.');
}

main().catch(console.error);
