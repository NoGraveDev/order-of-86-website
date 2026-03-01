const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'content-bg', 'still');
fs.mkdirSync(OUT, { recursive: true });

const PX = 160;
const OUT_PX = 100;
const SCALE = 8;
const SIZE = OUT_PX * SCALE;

function makeCanvas(bgColor = '#87CEEB') {
    const c = createCanvas(PX, PX);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, PX, PX);
    return { c, ctx };
}

function save(name, canvas) {
    const mid = createCanvas(OUT_PX, OUT_PX);
    const mctx = mid.getContext('2d');
    mctx.imageSmoothingEnabled = false;
    mctx.drawImage(canvas, 0, 0, OUT_PX, OUT_PX);
    const out = createCanvas(SIZE, SIZE);
    const octx = out.getContext('2d');
    octx.imageSmoothingEnabled = false;
    octx.drawImage(mid, 0, 0, SIZE, SIZE);
    const buf = out.toBuffer('image/png');
    fs.writeFileSync(path.join(OUT, name), buf);
    console.log(`✅ ${name} (${buf.length} bytes)`);
}

function setPixel(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
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

// 1. Sunny Roothold Village
function sunnyRoothold() {
    const { c, ctx } = makeCanvas('#87CEEB');
    gradient(ctx, 0, 0, PX, 70, ['#64B5F6', '#81D4FA', '#B3E5FC']);
    // Sun
    ctx.fillStyle = '#FFD700'; ctx.fillRect(120, 10, 20, 20);
    ctx.fillStyle = '#FFF176'; ctx.fillRect(122, 12, 16, 16);
    // Green hills
    gradient(ctx, 0, 70, PX, 90, ['#66BB6A', '#4CAF50', '#388E3C']);
    // Tree houses
    ctx.fillStyle = '#795548';
    ctx.fillRect(30, 50, 5, 30); ctx.fillRect(80, 45, 5, 35); ctx.fillRect(120, 55, 5, 25);
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(22, 38, 20, 15); ctx.fillRect(72, 33, 20, 15); ctx.fillRect(112, 43, 20, 15);
    // Flowers
    const colors = ['#FF6B6B', '#FFD93D', '#FF69B4', '#FF8A65'];
    for (let i = 0; i < 20; i++) {
        ctx.fillStyle = colors[i % 4];
        ctx.fillRect(5 + i * 8, 85 + (i % 5) * 3, 3, 3);
    }
    save('scene-sunny-roothold.png', c);
}

// 2. Golden Aurelius Sunrise
function goldenAurelius() {
    const { c, ctx } = makeCanvas('#FFE0B2');
    gradient(ctx, 0, 0, PX, 80, ['#FF8A65', '#FFAB91', '#FFE0B2', '#FFF8E1']);
    ctx.fillStyle = '#FFD54F'; ctx.fillRect(60, 50, 40, 20);
    ctx.fillStyle = '#FFEB3B'; ctx.fillRect(65, 55, 30, 10);
    // City domes
    ctx.fillStyle = '#5D4037';
    for (let i = 0; i < 6; i++) {
        const x = 10 + i * 25; const h = 30 + (i % 3) * 15;
        ctx.fillRect(x, 80 - h, 12, h + 40);
    }
    ctx.fillStyle = '#FFD700';
    for (let i = 0; i < 6; i++) ctx.fillRect(12 + i * 25, 48 - (i % 3) * 15, 8, 4);
    gradient(ctx, 0, 120, PX, 40, ['#A5D6A7', '#81C784']);
    save('scene-golden-aurelius.png', c);
}

// 3. Crystal Lake Morning
function crystalLakeMorning() {
    const { c, ctx } = makeCanvas('#E3F2FD');
    gradient(ctx, 0, 0, PX, 60, ['#64B5F6', '#90CAF9', '#BBDEFB']);
    ctx.fillStyle = '#FFF'; ctx.fillRect(20, 15, 20, 6); ctx.fillRect(90, 20, 15, 5);
    // Mountains
    ctx.fillStyle = '#81C784';
    for (let x = 0; x < PX; x++) {
        const h = 20 + Math.sin(x * 0.05) * 15;
        ctx.fillRect(x, 60 - h, 1, h);
    }
    // Lake
    gradient(ctx, 0, 60, PX, 50, ['#4FC3F7', '#29B6F6', '#039BE5']);
    // Reflections
    ctx.fillStyle = '#B3E5FC';
    for (let i = 0; i < 10; i++) ctx.fillRect(10 + i * 14, 70 + (i % 3) * 8, 6, 1);
    gradient(ctx, 0, 110, PX, 50, ['#A5D6A7', '#66BB6A']);
    save('scene-crystal-lake-morning.png', c);
}

// 4. Wizard Dog Academy Garden
function wizardDogGarden() {
    const { c, ctx } = makeCanvas('#87CEEB');
    gradient(ctx, 0, 0, PX, 50, ['#64B5F6', '#87CEEB']);
    ctx.fillStyle = '#FFD700'; ctx.fillRect(130, 8, 15, 15);
    // Academy building
    ctx.fillStyle = '#E0E0E0'; ctx.fillRect(50, 30, 60, 50);
    ctx.fillStyle = '#7E57C2'; ctx.fillRect(50, 25, 60, 8);
    ctx.fillStyle = '#FFF176';
    ctx.fillRect(60, 40, 8, 8); ctx.fillRect(80, 40, 8, 8); ctx.fillRect(100, 40, 8, 8);
    // Garden
    gradient(ctx, 0, 80, PX, 80, ['#66BB6A', '#4CAF50']);
    // Dogs in garden
    ctx.fillStyle = '#795548'; ctx.fillRect(20, 90, 8, 6); ctx.fillRect(28, 88, 4, 4);
    ctx.fillStyle = '#FFA726'; ctx.fillRect(120, 95, 8, 6); ctx.fillRect(114, 93, 4, 4);
    // Path
    ctx.fillStyle = '#D7CCC8'; ctx.fillRect(60, 80, 40, 60);
    save('scene-wizard-dog-garden.png', c);
}

// 5. Bright Stillwater Harbor
function brightStillwater() {
    const { c, ctx } = makeCanvas('#81D4FA');
    gradient(ctx, 0, 0, PX, 60, ['#64B5F6', '#81D4FA']);
    // Harbor buildings
    ctx.fillStyle = '#FFCC80';
    ctx.fillRect(10, 40, 20, 30); ctx.fillRect(40, 35, 25, 35); ctx.fillRect(80, 42, 18, 28);
    ctx.fillStyle = '#FF8A65';
    ctx.fillRect(10, 37, 20, 4); ctx.fillRect(40, 32, 25, 4); ctx.fillRect(80, 39, 18, 4);
    // Water
    gradient(ctx, 0, 70, PX, 50, ['#29B6F6', '#0288D1']);
    // Boats
    ctx.fillStyle = '#8D6E63'; ctx.fillRect(110, 80, 20, 5);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(118, 70, 2, 10);
    ctx.fillRect(116, 72, 6, 3);
    gradient(ctx, 0, 120, PX, 40, ['#D7CCC8', '#BCAAA4']);
    save('scene-bright-stillwater.png', c);
}

// 6. Enchanted Flower Field
function enchantedFlowerField() {
    const { c, ctx } = makeCanvas('#E8F5E9');
    gradient(ctx, 0, 0, PX, 50, ['#81D4FA', '#B3E5FC', '#E1F5FE']);
    ctx.fillStyle = '#FFF'; ctx.fillRect(30, 10, 15, 5); ctx.fillRect(100, 15, 12, 4);
    gradient(ctx, 0, 50, PX, 110, ['#A5D6A7', '#81C784', '#66BB6A']);
    // Lots of flowers
    const fc = ['#F44336','#E91E63','#FF9800','#FFEB3B','#9C27B0','#2196F3','#FF4081','#FF6D00'];
    for (let i = 0; i < 60; i++) {
        ctx.fillStyle = fc[i % 8];
        const x = (i * 17) % (PX - 4) + 2;
        const y = 55 + (i * 13) % 80;
        ctx.fillRect(x, y, 3, 3);
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(x + 1, y + 3, 1, 4);
    }
    save('scene-enchanted-flower-field.png', c);
}

// 7. Bright Archivum Library
function brightArchivum() {
    const { c, ctx } = makeCanvas('#FFF8E1');
    // Warm interior
    gradient(ctx, 0, 0, PX, PX, ['#FFE0B2', '#FFF8E1', '#FFF3E0']);
    // Bookshelves
    const bookColors = ['#F44336','#2196F3','#4CAF50','#FF9800','#9C27B0','#795548'];
    for (let shelf = 0; shelf < 4; shelf++) {
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(10, 15 + shelf * 35, 140, 3);
        for (let b = 0; b < 15; b++) {
            ctx.fillStyle = bookColors[(shelf * 3 + b) % 6];
            ctx.fillRect(12 + b * 9, 5 + shelf * 35, 7, 10);
        }
    }
    // Window with sunlight
    ctx.fillStyle = '#87CEEB'; ctx.fillRect(60, 10, 40, 25);
    ctx.fillStyle = '#FFF9C4'; ctx.fillRect(65, 15, 30, 15);
    // Reading desk
    ctx.fillStyle = '#5D4037'; ctx.fillRect(40, 130, 80, 5);
    ctx.fillRect(50, 135, 5, 20); ctx.fillRect(105, 135, 5, 20);
    save('scene-bright-archivum.png', c);
}

// 8. Sunny Crucible Forge
function sunnyCrucible() {
    const { c, ctx } = makeCanvas('#FFE0B2');
    gradient(ctx, 0, 0, PX, 50, ['#FF8A65', '#FFAB91', '#FFE0B2']);
    // Mountains with lava glow
    ctx.fillStyle = '#8D6E63';
    for (let x = 0; x < PX; x++) {
        const h = 15 + Math.sin(x * 0.08) * 10;
        ctx.fillRect(x, 50 - h, 1, h);
    }
    // Bright forge building
    ctx.fillStyle = '#FF6F00'; ctx.fillRect(50, 50, 60, 50);
    ctx.fillStyle = '#FFD54F'; ctx.fillRect(60, 55, 10, 10); ctx.fillRect(90, 55, 10, 10);
    ctx.fillStyle = '#FF8F00'; ctx.fillRect(75, 40, 10, 15);
    gradient(ctx, 0, 100, PX, 60, ['#A1887F', '#8D6E63']);
    save('scene-sunny-crucible.png', c);
}

// 9. Rainbow Crystal Garden
function rainbowCrystalGarden() {
    const { c, ctx } = makeCanvas('#E8F5E9');
    gradient(ctx, 0, 0, PX, 60, ['#81D4FA', '#B3E5FC']);
    // Rainbow
    const rc = ['#F44336','#FF9800','#FFEB3B','#4CAF50','#2196F3','#9C27B0'];
    for (let ci = 0; ci < 6; ci++) {
        ctx.fillStyle = rc[ci];
        for (let a = 0; a < PX; a++) {
            const r = 60 - ci * 3;
            const y = 40 - Math.sqrt(Math.max(0, r*r - (a-80)*(a-80)));
            if (y > 0) ctx.fillRect(a, Math.floor(y), 1, 2);
        }
    }
    gradient(ctx, 0, 60, PX, 100, ['#A5D6A7', '#81C784']);
    // Crystals
    const cc = ['#00BCD4','#76FF03','#FF4081','#FFEA00','#651FFF'];
    for (let i = 0; i < 8; i++) {
        ctx.fillStyle = cc[i % 5];
        const x = 10 + i * 18;
        ctx.fillRect(x, 80, 5, 15); ctx.fillRect(x + 1, 75, 3, 5);
    }
    save('scene-rainbow-crystal-garden.png', c);
}

// 10. Owl Sanctuary Dawn
function owlSanctuaryDawn() {
    const { c, ctx } = makeCanvas('#FFF8E1');
    gradient(ctx, 0, 0, PX, 60, ['#FFE082', '#FFF8E1', '#E3F2FD']);
    // Trees
    for (let i = 0; i < 4; i++) {
        const tx = 15 + i * 40;
        ctx.fillStyle = '#5D4037'; ctx.fillRect(tx + 5, 40, 4, 50);
        ctx.fillStyle = '#2E7D32'; ctx.fillRect(tx, 25, 14, 20);
        ctx.fillStyle = '#43A047'; ctx.fillRect(tx + 2, 20, 10, 8);
    }
    // Owls
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(22, 35, 6, 6); ctx.fillRect(102, 33, 6, 6);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(23, 36, 2, 2); ctx.fillRect(26, 36, 2, 2);
    ctx.fillRect(103, 34, 2, 2); ctx.fillRect(106, 34, 2, 2);
    gradient(ctx, 0, 90, PX, 70, ['#66BB6A', '#4CAF50']);
    save('scene-owl-sanctuary-dawn.png', c);
}

// 11. Bright Moon Bridge
function brightMoonBridge() {
    const { c, ctx } = makeCanvas('#283593');
    gradient(ctx, 0, 0, PX, 80, ['#1A237E', '#283593', '#3949AB']);
    // Big bright moon
    ctx.fillStyle = '#FFF9C4'; ctx.fillRect(55, 10, 30, 30);
    ctx.fillStyle = '#FFFDE7'; ctx.fillRect(58, 13, 24, 24);
    // Bridge
    ctx.fillStyle = '#FFD54F';
    for (let x = 0; x < PX; x++) {
        const y = 80 - Math.floor(15 * Math.sin(x / PX * Math.PI));
        ctx.fillRect(x, y, 1, 3);
    }
    // Stars
    ctx.fillStyle = '#FFF';
    for (let i = 0; i < 30; i++) {
        setPixel(ctx, (i * 19) % PX, (i * 13) % 60, '#FFF');
    }
    gradient(ctx, 0, 100, PX, 60, ['#1B5E20', '#2E7D32']);
    save('scene-bright-moon-bridge.png', c);
}

// 12. Sunflower Meadow
function sunflowerMeadow() {
    const { c, ctx } = makeCanvas('#87CEEB');
    gradient(ctx, 0, 0, PX, 50, ['#64B5F6', '#87CEEB', '#B3E5FC']);
    ctx.fillStyle = '#FFD700'; ctx.fillRect(120, 8, 18, 18);
    gradient(ctx, 0, 50, PX, 110, ['#66BB6A', '#4CAF50']);
    // Sunflowers
    for (let i = 0; i < 8; i++) {
        const sx = 8 + i * 19;
        ctx.fillStyle = '#4CAF50'; ctx.fillRect(sx + 3, 55, 2, 30);
        ctx.fillStyle = '#FFD700'; ctx.fillRect(sx, 48, 8, 8);
        ctx.fillStyle = '#795548'; ctx.fillRect(sx + 2, 50, 4, 4);
    }
    save('scene-sunflower-meadow.png', c);
}

// 13. Happy Market Day
function happyMarketDay() {
    const { c, ctx } = makeCanvas('#87CEEB');
    gradient(ctx, 0, 0, PX, 40, ['#64B5F6', '#87CEEB']);
    ctx.fillStyle = '#FFD700'; ctx.fillRect(130, 5, 12, 12);
    // Market stalls
    const stallColors = ['#F44336','#FF9800','#4CAF50','#2196F3','#9C27B0'];
    for (let i = 0; i < 5; i++) {
        const sx = 5 + i * 30;
        ctx.fillStyle = stallColors[i]; ctx.fillRect(sx, 45, 25, 5);
        ctx.fillStyle = '#8D6E63'; ctx.fillRect(sx + 2, 50, 21, 25);
        ctx.fillRect(sx + 2, 50, 2, 30); ctx.fillRect(sx + 21, 50, 2, 30);
    }
    // Ground - cobblestone
    gradient(ctx, 0, 80, PX, 80, ['#D7CCC8', '#BCAAA4']);
    // Bunting
    ctx.fillStyle = '#FF80AB';
    for (let i = 0; i < 10; i++) ctx.fillRect(5 + i * 16, 38, 4, 4);
    save('scene-happy-market-day.png', c);
}

// 14. Peaceful Wizard Cottage
function peacefulCottage() {
    const { c, ctx } = makeCanvas('#87CEEB');
    gradient(ctx, 0, 0, PX, 60, ['#81D4FA', '#B3E5FC', '#E1F5FE']);
    ctx.fillStyle = '#FFF'; ctx.fillRect(20, 15, 18, 6); ctx.fillRect(100, 20, 12, 4);
    // Cottage
    ctx.fillStyle = '#FFCC80'; ctx.fillRect(45, 55, 70, 45);
    ctx.fillStyle = '#D84315';
    for (let x = 45; x < 115; x++) {
        const h = Math.abs(x - 80);
        ctx.fillRect(x, 55 - Math.floor(h * 0.5), 1, Math.floor(h * 0.5));
    }
    // Door & windows
    ctx.fillStyle = '#5D4037'; ctx.fillRect(72, 75, 16, 25);
    ctx.fillStyle = '#FFF176'; ctx.fillRect(52, 65, 10, 10); ctx.fillRect(98, 65, 10, 10);
    // Garden
    gradient(ctx, 0, 100, PX, 60, ['#66BB6A', '#4CAF50']);
    const fc = ['#FF6B6B','#FFD93D','#FF69B4'];
    for (let i = 0; i < 15; i++) {
        ctx.fillStyle = fc[i % 3];
        ctx.fillRect(5 + (i * 11) % 150, 105 + (i * 7) % 30, 3, 3);
    }
    save('scene-peaceful-wizard-cottage.png', c);
}

// 15. Bright Floating Islands
function brightFloatingIslands() {
    const { c, ctx } = makeCanvas('#81D4FA');
    gradient(ctx, 0, 0, PX, PX, ['#64B5F6', '#81D4FA', '#B3E5FC']);
    ctx.fillStyle = '#FFF'; ctx.fillRect(10, 20, 15, 5); ctx.fillRect(120, 30, 12, 4);
    // Floating islands
    const islands = [[30, 50, 40], [90, 70, 35], [60, 100, 30]];
    for (const [ix, iy, iw] of islands) {
        ctx.fillStyle = '#8D6E63'; ctx.fillRect(ix, iy + 8, iw, 10);
        ctx.fillStyle = '#66BB6A'; ctx.fillRect(ix - 3, iy, iw + 6, 10);
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(ix + iw/2 - 2, iy - 12, 4, 12);
        ctx.fillRect(ix + iw/2 - 6, iy - 18, 12, 8);
    }
    // Waterfalls from islands
    ctx.fillStyle = '#4FC3F7';
    for (const [ix, iy, iw] of islands) {
        ctx.fillRect(ix + iw/2, iy + 18, 2, 20);
    }
    save('scene-bright-floating-islands.png', c);
}

// 16. Crystal Lizard Meadow
function crystalLizardMeadow() {
    const { c, ctx } = makeCanvas('#87CEEB');
    gradient(ctx, 0, 0, PX, 50, ['#64B5F6', '#87CEEB']);
    ctx.fillStyle = '#FFD700'; ctx.fillRect(125, 8, 15, 15);
    gradient(ctx, 0, 50, PX, 110, ['#A5D6A7', '#66BB6A', '#4CAF50']);
    // Crystals growing from ground
    const cc = ['#00BCD4','#80DEEA','#26C6DA','#00ACC1','#0097A7'];
    for (let i = 0; i < 6; i++) {
        ctx.fillStyle = cc[i % 5];
        const x = 10 + i * 25;
        ctx.fillRect(x, 60, 4, 20); ctx.fillRect(x + 1, 55, 2, 5);
    }
    // Crystal lizards
    ctx.fillStyle = '#00BCD4';
    ctx.fillRect(40, 85, 12, 4); ctx.fillRect(52, 86, 5, 2);
    ctx.fillRect(100, 90, 12, 4); ctx.fillRect(96, 91, 4, 2);
    save('scene-crystal-lizard-meadow.png', c);
}

// 17. Spring Festival
function springFestival() {
    const { c, ctx } = makeCanvas('#81D4FA');
    gradient(ctx, 0, 0, PX, 40, ['#64B5F6', '#81D4FA']);
    // Bunting / streamers
    const bc = ['#F44336','#FF9800','#FFEB3B','#4CAF50','#2196F3','#9C27B0'];
    for (let i = 0; i < 16; i++) {
        ctx.fillStyle = bc[i % 6];
        ctx.fillRect(5 + i * 10, 30 + (i % 3) * 3, 5, 5);
    }
    // Tents/pavilions
    ctx.fillStyle = '#FF80AB'; ctx.fillRect(10, 50, 40, 5);
    ctx.fillStyle = '#FFE082'; ctx.fillRect(10, 55, 40, 30);
    ctx.fillStyle = '#80DEEA'; ctx.fillRect(80, 50, 40, 5);
    ctx.fillStyle = '#A5D6A7'; ctx.fillRect(80, 55, 40, 30);
    gradient(ctx, 0, 85, PX, 75, ['#66BB6A', '#4CAF50']);
    // Petals
    ctx.fillStyle = '#FF80AB';
    for (let i = 0; i < 20; i++) setPixel(ctx, (i * 19) % PX, 20 + (i * 7) % 60, '#FF80AB');
    save('scene-spring-festival.png', c);
}

// 18. Sunny Wizard Library Tower
function sunnyLibraryTower() {
    const { c, ctx } = makeCanvas('#87CEEB');
    gradient(ctx, 0, 0, PX, 50, ['#64B5F6', '#87CEEB']);
    ctx.fillStyle = '#FFD700'; ctx.fillRect(10, 8, 15, 15);
    // Tall tower
    ctx.fillStyle = '#E0E0E0'; ctx.fillRect(55, 20, 50, 120);
    ctx.fillStyle = '#BDBDBD'; ctx.fillRect(60, 20, 40, 120);
    // Pointed roof
    ctx.fillStyle = '#7E57C2';
    for (let i = 0; i < 20; i++) ctx.fillRect(55 + i * 1.25, 20 - i, Math.max(50 - i * 2.5, 1), 1);
    // Windows with warm light
    ctx.fillStyle = '#FFF176';
    for (let row = 0; row < 5; row++) {
        ctx.fillRect(65, 30 + row * 20, 8, 8);
        ctx.fillRect(85, 30 + row * 20, 8, 8);
    }
    gradient(ctx, 0, 130, PX, 30, ['#66BB6A', '#4CAF50']);
    save('scene-sunny-library-tower.png', c);
}

// 19. Golden Harvest Fields
function goldenHarvest() {
    const { c, ctx } = makeCanvas('#87CEEB');
    gradient(ctx, 0, 0, PX, 50, ['#64B5F6', '#87CEEB', '#B3E5FC']);
    ctx.fillStyle = '#FFD700'; ctx.fillRect(120, 8, 18, 18);
    ctx.fillStyle = '#FFF176'; ctx.fillRect(122, 10, 14, 14);
    // Wheat fields
    gradient(ctx, 0, 50, PX, 110, ['#F9A825', '#FBC02D', '#FDD835']);
    // Wheat texture
    ctx.fillStyle = '#FFE082';
    for (let i = 0; i < 40; i++) {
        ctx.fillRect((i * 9) % PX, 48 + (i * 7) % 5, 3, 5);
    }
    // Barn
    ctx.fillStyle = '#D32F2F'; ctx.fillRect(20, 55, 35, 25);
    ctx.fillStyle = '#B71C1C'; ctx.fillRect(20, 50, 35, 6);
    ctx.fillStyle = '#FFF176'; ctx.fillRect(30, 65, 8, 15);
    // Scarecrow
    ctx.fillStyle = '#5D4037'; ctx.fillRect(110, 50, 2, 20);
    ctx.fillRect(105, 55, 12, 2);
    ctx.fillStyle = '#FFE082'; ctx.fillRect(108, 47, 6, 5);
    save('scene-golden-harvest.png', c);
}

// 20. Bright Potion Garden
function brightPotionGarden() {
    const { c, ctx } = makeCanvas('#E8F5E9');
    gradient(ctx, 0, 0, PX, 40, ['#81D4FA', '#B3E5FC']);
    gradient(ctx, 0, 40, PX, 120, ['#A5D6A7', '#81C784', '#66BB6A']);
    // Potion bottles in garden
    const potionColors = ['#F44336','#2196F3','#4CAF50','#FF9800','#9C27B0','#00BCD4'];
    for (let i = 0; i < 6; i++) {
        const px = 10 + i * 25;
        ctx.fillStyle = potionColors[i];
        ctx.fillRect(px, 70, 8, 12);
        ctx.fillRect(px + 2, 65, 4, 5);
        ctx.fillRect(px + 3, 63, 2, 3);
    }
    // Herbs growing
    ctx.fillStyle = '#2E7D32';
    for (let i = 0; i < 12; i++) {
        ctx.fillRect(5 + i * 13, 90, 2, 15);
        ctx.fillStyle = '#43A047';
        ctx.fillRect(3 + i * 13, 88, 6, 4);
        ctx.fillStyle = '#2E7D32';
    }
    // Butterflies
    ctx.fillStyle = '#FF80AB'; ctx.fillRect(40, 50, 3, 2);
    ctx.fillStyle = '#CE93D8'; ctx.fillRect(100, 55, 3, 2);
    save('scene-bright-potion-garden.png', c);
}

// Generate all
sunnyRoothold();
goldenAurelius();
crystalLakeMorning();
wizardDogGarden();
brightStillwater();
enchantedFlowerField();
brightArchivum();
sunnyCrucible();
rainbowCrystalGarden();
owlSanctuaryDawn();
brightMoonBridge();
sunflowerMeadow();
happyMarketDay();
peacefulCottage();
brightFloatingIslands();
crystalLizardMeadow();
springFestival();
sunnyLibraryTower();
goldenHarvest();
brightPotionGarden();

console.log('\n✅ All 20 bright still backgrounds generated!');
