const GIFEncoder = require('gif-encoder-2');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = './content-bg';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper function to upscale with nearest-neighbor
function upscaleCanvas(smallCtx, targetWidth, targetHeight) {
    const smallCanvas = smallCtx.canvas;
    const scale = targetWidth / smallCanvas.width;
    
    const largeCanvas = createCanvas(targetWidth, targetHeight);
    const largeCtx = largeCanvas.getContext('2d');
    
    // Disable smoothing for nearest-neighbor
    largeCtx.imageSmoothingEnabled = false;
    largeCtx.scale(scale, scale);
    largeCtx.drawImage(smallCanvas, 0, 0);
    
    return largeCtx;
}

// Helper function to save GIF
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

// WEATHER & NATURE (1-15)

// 1. Rain
function generateRain(ctx, frame) {
    // Dark sky
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 48, 48);
    
    // Ground
    ctx.fillStyle = '#2a2a3e';
    ctx.fillRect(0, 40, 48, 8);
    
    // Rain drops (diagonal, animated)
    ctx.fillStyle = '#7f8c8d';
    const rainOffset = frame * 3;
    for (let i = 0; i < 20; i++) {
        const x = (i * 7 + rainOffset) % 48;
        const y = (i * 11 + rainOffset) % 40;
        if (x < 16 || x > 32) { // Keep center open
            ctx.fillRect(x, y, 1, 3);
            ctx.fillRect(x - 1, y + 1, 1, 3);
        }
    }
}

// 2. Heavy snow
function generateHeavySnow(ctx, frame) {
    // Dark winter sky
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, 48, 48);
    
    // Snow ground
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(0, 38, 48, 10);
    
    // Heavy snowflakes
    ctx.fillStyle = '#ffffff';
    const snowOffset = frame * 2;
    for (let i = 0; i < 15; i++) {
        const x = (i * 5 + snowOffset) % 48;
        const y = (i * 7 + snowOffset) % 40;
        if (x < 16 || x > 32) {
            ctx.fillRect(x, y, 2, 2);
            ctx.fillRect(x + 1, y - 1, 1, 1);
            ctx.fillRect(x + 1, y + 3, 1, 1);
        }
    }
}

// 3. Gentle snow
function generateGentleSnow(ctx, frame) {
    // Blue night sky
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 0, 48, 48);
    
    // Snow ground
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(0, 40, 48, 8);
    
    // Gentle snowflakes
    ctx.fillStyle = '#ffffff';
    const snowOffset = frame;
    for (let i = 0; i < 8; i++) {
        const x = (i * 8 + snowOffset) % 48;
        const y = (i * 9 + snowOffset) % 42;
        if (x < 16 || x > 32) {
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

// 4. Thunderstorm
function generateThunderstorm(ctx, frame) {
    // Dark storm sky
    const skyColor = (frame === 2 || frame === 3) ? '#f39c12' : '#16202a';
    ctx.fillStyle = skyColor;
    ctx.fillRect(0, 0, 48, 48);
    
    // Ground
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 42, 48, 6);
    
    // Rain
    ctx.fillStyle = '#7f8c8d';
    const rainOffset = frame * 4;
    for (let i = 0; i < 25; i++) {
        const x = (i * 5 + rainOffset) % 48;
        const y = (i * 7 + rainOffset) % 42;
        if (x < 16 || x > 32) {
            ctx.fillRect(x, y, 1, 2);
        }
    }
    
    // Lightning flash
    if (frame === 2 || frame === 3) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(5, 5, 2, 15);
        ctx.fillRect(7, 12, 3, 2);
        ctx.fillRect(38, 8, 2, 12);
        ctx.fillRect(35, 15, 3, 2);
    }
}

// 5. Fog rolling
function generateFogRolling(ctx, frame) {
    // Dark background
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, 48, 48);
    
    // Ground
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 35, 48, 13);
    
    // Rolling fog
    ctx.fillStyle = '#bdc3c7';
    const fogOffset = frame * 2;
    for (let i = 0; i < 6; i++) {
        const x = (i * 12 + fogOffset) % 60 - 12;
        const y = 25 + Math.sin(frame + i) * 2;
        if (x < 16 || x > 32) {
            ctx.fillRect(x, y, 8, 4);
            ctx.fillRect(x + 2, y - 1, 4, 6);
        }
    }
}

// 6. Sandstorm
function generateSandstorm(ctx, frame) {
    // Desert background
    ctx.fillStyle = '#d35400';
    ctx.fillRect(0, 0, 48, 48);
    
    // Dunes
    ctx.fillStyle = '#e67e22';
    ctx.fillRect(0, 30, 15, 18);
    ctx.fillRect(33, 25, 15, 23);
    
    // Sand particles
    ctx.fillStyle = '#f39c12';
    const windOffset = frame * 3;
    for (let i = 0; i < 30; i++) {
        const x = (i * 3 + windOffset) % 48;
        const y = (i * 5) % 35;
        if (x < 16 || x > 32) {
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

// 7. Fireflies
function generateFireflies(ctx, frame) {
    // Dark forest
    ctx.fillStyle = '#0f1419';
    ctx.fillRect(0, 0, 48, 48);
    
    // Trees on sides
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(2, 15, 8, 33);
    ctx.fillRect(38, 10, 8, 38);
    
    // Tree tops
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, 15, 12, 8);
    ctx.fillRect(36, 10, 12, 8);
    
    // Fireflies (moving randomly)
    const fireflies = [
        { x: 5 + Math.sin(frame + 0) * 3, y: 20 + Math.cos(frame * 1.2) * 5 },
        { x: 8 + Math.cos(frame + 2) * 4, y: 25 + Math.sin(frame * 0.8) * 3 },
        { x: 40 + Math.sin(frame + 4) * 4, y: 18 + Math.cos(frame * 1.1) * 4 },
        { x: 42 + Math.cos(frame + 1) * 3, y: 28 + Math.sin(frame * 0.9) * 5 }
    ];
    
    fireflies.forEach(fly => {
        if (Math.floor(fly.x) < 16 || Math.floor(fly.x) > 32) {
            ctx.fillStyle = frame % 2 === 0 ? '#f1c40f' : '#2ecc71';
            ctx.fillRect(fly.x, fly.y, 1, 1);
        }
    });
}

// 8. Falling leaves
function generateFallingLeaves(ctx, frame) {
    // Autumn sky
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(0, 0, 48, 48);
    
    // Ground
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(0, 40, 48, 8);
    
    // Trees
    ctx.fillStyle = '#654321';
    ctx.fillRect(5, 20, 4, 20);
    ctx.fillRect(39, 25, 4, 15);
    
    // Tree crowns
    ctx.fillStyle = '#d35400';
    ctx.fillRect(2, 15, 10, 10);
    ctx.fillRect(36, 20, 10, 10);
    
    // Falling leaves
    const leaves = ['#e67e22', '#d35400', '#c0392b'];
    const leafOffset = frame;
    for (let i = 0; i < 8; i++) {
        const x = (i * 7 + leafOffset) % 48;
        const y = (i * 11 + leafOffset * 2) % 40;
        if (x < 16 || x > 32) {
            ctx.fillStyle = leaves[i % 3];
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

// 9. Cherry blossoms
function generateCherryBlossoms(ctx, frame) {
    // Spring sky
    ctx.fillStyle = '#3498db';
    ctx.fillRect(0, 0, 48, 48);
    
    // Ground
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, 38, 48, 10);
    
    // Cherry trees
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(3, 25, 6, 13);
    ctx.fillRect(39, 20, 6, 18);
    
    // Pink blossoms on trees
    ctx.fillStyle = '#e91e63';
    ctx.fillRect(1, 20, 10, 8);
    ctx.fillRect(37, 15, 10, 8);
    
    // Falling petals
    ctx.fillStyle = '#ffc0cb';
    const petalOffset = frame;
    for (let i = 0; i < 6; i++) {
        const x = (i * 9 + petalOffset) % 48;
        const y = (i * 13 + petalOffset * 1.5) % 38;
        if (x < 16 || x > 32) {
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

// 10. Meteor shower
function generateMeteorShower(ctx, frame) {
    // Night sky
    ctx.fillStyle = '#0c0c1e';
    ctx.fillRect(0, 0, 48, 48);
    
    // Ground
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 40, 48, 8);
    
    // Stars
    ctx.fillStyle = '#ffffff';
    const stars = [[8, 5], [12, 12], [35, 8], [42, 15], [6, 18], [40, 25]];
    stars.forEach(([x, y]) => {
        if (x < 16 || x > 32) {
            ctx.fillRect(x, y, 1, 1);
        }
    });
    
    // Meteors
    ctx.fillStyle = '#f39c12';
    const meteorOffset = frame * 2;
    for (let i = 0; i < 4; i++) {
        const x = 5 + i * 10 + meteorOffset;
        const y = 5 + i * 3 + meteorOffset;
        if (x > 0 && x < 48 && y > 0 && y < 40) {
            if (x < 16 || x > 32) {
                ctx.fillRect(x, y, 2, 1);
                ctx.fillStyle = '#e74c3c';
                ctx.fillRect(x - 1, y, 1, 1);
                ctx.fillStyle = '#f39c12';
            }
        }
    }
}

// 11. Aurora borealis
function generateAurora(ctx, frame) {
    // Night sky
    ctx.fillStyle = '#0c0c1e';
    ctx.fillRect(0, 0, 48, 48);
    
    // Ground
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 35, 48, 13);
    
    // Aurora bands (shifting)
    const colors = ['#27ae60', '#9b59b6', '#2ecc71'];
    const auroraOffset = Math.sin(frame * 0.5) * 3;
    
    for (let i = 0; i < 3; i++) {
        ctx.fillStyle = colors[i];
        const y = 10 + i * 5 + auroraOffset;
        const leftX = 2 + Math.sin(frame + i) * 2;
        const rightX = 38 + Math.cos(frame + i) * 2;
        
        // Left side
        for (let x = leftX; x < 16; x += 2) {
            ctx.fillRect(x, y + Math.sin(x * 0.3 + frame) * 2, 2, 4);
        }
        
        // Right side
        for (let x = 33; x < rightX + 8; x += 2) {
            ctx.fillRect(x, y + Math.cos(x * 0.3 + frame) * 2, 2, 4);
        }
    }
}

// 12. Sunrise
function generateSunrise(ctx, frame) {
    // Sky gradient (brightening)
    const brightness = Math.min(255, 50 + frame * 25);
    const r = Math.min(255, 100 + frame * 20);
    const g = Math.min(255, 50 + frame * 15);
    const b = Math.min(255, 20 + frame * 10);
    
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, 48, 30);
    
    // Ground
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, 30, 48, 18);
    
    // Sun (if bright enough)
    if (frame > 3) {
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(6, 8, 4, 4);
        ctx.fillRect(7, 7, 2, 6);
        ctx.fillRect(5, 9, 6, 2);
    }
    
    // Mountains on sides
    ctx.fillStyle = '#8e44ad';
    ctx.fillRect(0, 20, 15, 10);
    ctx.fillRect(33, 25, 15, 5);
}

// 13. Tidal waves
function generateTidalWaves(ctx, frame) {
    // Sky
    ctx.fillStyle = '#3498db';
    ctx.fillRect(0, 0, 48, 25);
    
    // Water level (rising/falling)
    const waterLevel = 25 + Math.sin(frame * 0.8) * 8;
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(0, waterLevel, 48, 48 - waterLevel);
    
    // Waves on sides
    ctx.fillStyle = '#ffffff';
    const waveOffset = frame;
    for (let i = 0; i < 6; i++) {
        const x = i * 8 + waveOffset;
        const y = waterLevel - 2 + Math.sin(x * 0.3 + frame) * 2;
        if (x < 16 || x > 32) {
            ctx.fillRect(x, y, 3, 2);
        }
    }
    
    // Rocks on sides
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(2, waterLevel + 5, 6, 8);
    ctx.fillRect(40, waterLevel + 3, 6, 10);
}

// 14. Wind
function generateWind(ctx, frame) {
    // Sky
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, 48, 30);
    
    // Ground
    ctx.fillStyle = '#8fbc8f';
    ctx.fillRect(0, 30, 48, 18);
    
    // Grass swaying
    ctx.fillStyle = '#228b22';
    const sway = Math.sin(frame * 0.7) * 2;
    
    // Left grass
    for (let x = 2; x < 16; x += 3) {
        const height = 4 + Math.sin(x) * 2;
        ctx.fillRect(x + sway, 30 - height, 1, height);
        ctx.fillRect(x + sway + 1, 30 - height + 1, 1, height - 1);
    }
    
    // Right grass
    for (let x = 33; x < 46; x += 3) {
        const height = 4 + Math.cos(x) * 2;
        ctx.fillRect(x + sway, 30 - height, 1, height);
        ctx.fillRect(x + sway + 1, 30 - height + 1, 1, height - 1);
    }
    
    // Wind lines
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 4; i++) {
        const x = 5 + i * 10 + frame * 2;
        if ((x < 16 || x > 32) && x < 48) {
            ctx.fillRect(x, 10 + i * 3, 3, 1);
        }
    }
}

// 15. Volcanic ash
function generateVolcanicAsh(ctx, frame) {
    // Dark sky
    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(0, 0, 48, 35);
    
    // Volcanic glow at bottom
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(0, 35, 48, 13);
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(0, 38, 48, 10);
    
    // Falling ash
    ctx.fillStyle = '#95a5a6';
    const ashOffset = frame * 2;
    for (let i = 0; i < 20; i++) {
        const x = (i * 4 + ashOffset) % 48;
        const y = (i * 6 + ashOffset) % 35;
        if (x < 16 || x > 32) {
            ctx.fillRect(x, y, 1, 1);
        }
    }
    
    // Volcano silhouettes
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(2, 25, 12, 10);
    ctx.fillRect(34, 20, 12, 15);
}

// FIRE & LAVA (16-23)

// 16. Campfire
function generateCampfire(ctx, frame) {
    // Night background
    ctx.fillStyle = '#0c0c1e';
    ctx.fillRect(0, 0, 48, 48);
    
    // Ground
    ctx.fillStyle = '#2c1810';
    ctx.fillRect(0, 35, 48, 13);
    
    // Fire circle in center-left area (but not blocking center)
    const fireIntensity = 0.7 + Math.sin(frame * 0.5) * 0.3;
    
    // Fire base
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(8, 30, 6, 8);
    
    // Flickering flames
    ctx.fillStyle = '#f39c12';
    const flameHeight = 4 + Math.sin(frame) * 2;
    ctx.fillRect(9, 30 - flameHeight, 4, flameHeight);
    ctx.fillRect(10, 30 - flameHeight - 2, 2, 3);
    
    // Glow effect
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(6, 33, 10, 2);
    
    // Sparks
    ctx.fillStyle = '#f1c40f';
    for (let i = 0; i < 3; i++) {
        const x = 8 + i * 2 + Math.sin(frame + i) * 2;
        const y = 25 - Math.cos(frame + i) * 3;
        if (x < 16) {
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

// 17. Torch-lit hall
function generateTorchHall(ctx, frame) {
    // Dark hall
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 48, 48);
    
    // Stone walls
    ctx.fillStyle = '#4a4a5e';
    ctx.fillRect(0, 0, 12, 48);
    ctx.fillRect(36, 0, 12, 48);
    
    // Floor
    ctx.fillStyle = '#2a2a3e';
    ctx.fillRect(0, 40, 48, 8);
    
    // Left torch
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(8, 8, 2, 12);
    
    const leftFlame = 1 + Math.sin(frame * 0.8) * 0.5;
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(7, 6, 4, 3);
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(8, 4 - leftFlame, 2, 4);
    
    // Right torch
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(38, 8, 2, 12);
    
    const rightFlame = 1 + Math.cos(frame * 0.6) * 0.5;
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(37, 6, 4, 3);
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(38, 4 - rightFlame, 2, 4);
}

// 18. Lava flow
function generateLavaFlow(ctx, frame) {
    // Dark rocky background
    ctx.fillStyle = '#2c1810';
    ctx.fillRect(0, 0, 48, 48);
    
    // Rocky ground
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 30, 48, 18);
    
    // Lava stream flowing left to right at bottom
    const lavaOffset = frame * 2;
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(0, 38, 48, 6);
    
    // Animated lava bubbles
    ctx.fillStyle = '#f39c12';
    for (let i = 0; i < 8; i++) {
        const x = (i * 6 + lavaOffset) % 48;
        const y = 39 + Math.sin(x * 0.2 + frame) * 1;
        ctx.fillRect(x, y, 2, 2);
    }
    
    // Heat glow on sides
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(0, 35, 15, 3);
    ctx.fillRect(33, 35, 15, 3);
}

// 19. Bonfire
function generateBonfire(ctx, frame) {
    // Night sky
    ctx.fillStyle = '#0f1419';
    ctx.fillRect(0, 0, 48, 48);
    
    // Ground
    ctx.fillStyle = '#2c1810';
    ctx.fillRect(0, 35, 48, 13);
    
    // Large fire on left side
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(5, 30, 8, 8);
    
    // Main flames
    ctx.fillStyle = '#e74c3c';
    const flameVar = Math.sin(frame * 0.4) * 2;
    ctx.fillRect(6, 25, 6, 8);
    ctx.fillRect(7, 20 - flameVar, 4, 8);
    
    // Inner flames
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(7, 22 - flameVar, 4, 6);
    ctx.fillRect(8, 18 - flameVar, 2, 4);
    
    // Rising embers
    ctx.fillStyle = '#ff6b35';
    for (let i = 0; i < 4; i++) {
        const x = 7 + i + Math.sin(frame + i) * 2;
        const y = 15 - i * 3 - frame;
        if (x < 16 && y > 0) {
            ctx.fillRect(x, y % 20 + 5, 1, 1);
        }
    }
}

// 20. Candle room
function generateCandleRoom(ctx, frame) {
    // Dark room
    ctx.fillStyle = '#0c0c1e';
    ctx.fillRect(0, 0, 48, 48);
    
    // Floor
    ctx.fillStyle = '#2a2a3e';
    ctx.fillRect(0, 40, 48, 8);
    
    // Left candles
    ctx.fillStyle = '#f4d03f';
    ctx.fillRect(5, 20, 2, 15);
    ctx.fillRect(9, 18, 2, 17);
    
    // Right candles
    ctx.fillRect(37, 22, 2, 13);
    ctx.fillRect(41, 19, 2, 16);
    
    // Flickering flames
    const flicker1 = Math.sin(frame * 0.7) * 0.5;
    const flicker2 = Math.cos(frame * 0.9) * 0.5;
    const flicker3 = Math.sin(frame * 0.6) * 0.5;
    const flicker4 = Math.cos(frame * 0.8) * 0.5;
    
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(5, 18 - flicker1, 2, 3);
    ctx.fillRect(9, 16 - flicker2, 2, 3);
    ctx.fillRect(37, 20 - flicker3, 2, 3);
    ctx.fillRect(41, 17 - flicker4, 2, 3);
    
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(5, 17 - flicker1, 2, 2);
    ctx.fillRect(9, 15 - flicker2, 2, 2);
    ctx.fillRect(37, 19 - flicker3, 2, 2);
    ctx.fillRect(41, 16 - flicker4, 2, 2);
}

// 21. Fire rain
function generateFireRain(ctx, frame) {
    // Dark stormy sky
    ctx.fillStyle = '#2c1810';
    ctx.fillRect(0, 0, 48, 48);
    
    // Burning ground
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(0, 40, 48, 8);
    
    // Falling fire embers
    ctx.fillStyle = '#e74c3c';
    const fireOffset = frame * 3;
    for (let i = 0; i < 15; i++) {
        const x = (i * 4 + fireOffset) % 48;
        const y = (i * 7 + fireOffset) % 40;
        if (x < 16 || x > 32) {
            ctx.fillRect(x, y, 1, 2);
            // Glow effect
            ctx.fillStyle = '#f39c12';
            ctx.fillRect(x, y + 1, 1, 1);
            ctx.fillStyle = '#e74c3c';
        }
    }
}

// 22. Magma bubbles
function generateMagmaBubbles(ctx, frame) {
    // Dark cave
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 48, 25);
    
    // Magma pools on sides
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(0, 25, 15, 23);
    ctx.fillRect(33, 25, 15, 23);
    
    // Bubbling lava
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(2, 27, 11, 19);
    ctx.fillRect(35, 27, 11, 19);
    
    // Animated bubbles
    const bubbles = [
        { x: 5, y: 35, phase: 0 },
        { x: 8, y: 40, phase: 1 },
        { x: 11, y: 32, phase: 2 },
        { x: 38, y: 38, phase: 3 },
        { x: 41, y: 33, phase: 4 },
        { x: 44, y: 41, phase: 5 }
    ];
    
    bubbles.forEach(bubble => {
        const size = 1 + Math.sin(frame + bubble.phase) * 0.5;
        if (size > 0.8) {
            ctx.fillStyle = '#f39c12';
            ctx.fillRect(bubble.x, bubble.y - size, Math.ceil(size), Math.ceil(size));
        }
    });
}

// 23. Forge furnace
function generateForge(ctx, frame) {
    // Dark forge
    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(0, 0, 48, 48);
    
    // Stone furnace on left
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(2, 15, 12, 25);
    
    // Furnace opening
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(4, 20, 8, 8);
    
    // Pulsing fire inside
    const intensity = 0.5 + Math.sin(frame * 0.6) * 0.5;
    ctx.fillStyle = intensity > 0.7 ? '#f39c12' : '#e74c3c';
    ctx.fillRect(5, 21, 6, 6);
    
    if (intensity > 0.8) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(6, 22, 4, 4);
    }
    
    // Smoke/sparks rising
    ctx.fillStyle = '#7f8c8d';
    for (let i = 0; i < 3; i++) {
        const x = 6 + i * 2;
        const y = 15 - i * 2 - frame;
        if (y > 0) {
            ctx.fillRect(x, y % 15 + 2, 1, 1);
        }
    }
    
    // Anvil on right
    ctx.fillStyle = '#36454f';
    ctx.fillRect(36, 30, 8, 6);
    ctx.fillRect(38, 28, 4, 2);
}

// WATER & ICE (24-31)

// 24. Underwater bubbles
function generateUnderwaterBubbles(ctx, frame) {
    // Deep blue water
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(0, 0, 48, 48);
    
    // Seafloor
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(0, 40, 48, 8);
    
    // Underwater plants on sides
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(3, 32, 2, 8);
    ctx.fillRect(6, 28, 2, 12);
    ctx.fillRect(40, 30, 2, 10);
    ctx.fillRect(43, 35, 2, 5);
    
    // Rising bubbles
    ctx.fillStyle = '#87ceeb';
    const bubbleOffset = frame;
    for (let i = 0; i < 8; i++) {
        const x = 4 + i * 5;
        const y = 35 - (bubbleOffset + i * 3) % 35;
        if (x < 16 || x > 32) {
            const size = 1 + (i % 2);
            ctx.fillRect(x, y, size, size);
        }
    }
}

// 25. Waterfall
function generateWaterfall(ctx, frame) {
    // Sky
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, 48, 20);
    
    // Cliff on left
    ctx.fillStyle = '#708090';
    ctx.fillRect(0, 0, 15, 48);
    
    // Pool at bottom
    ctx.fillStyle = '#4682b4';
    ctx.fillRect(0, 35, 48, 13);
    
    // Falling water
    ctx.fillStyle = '#ffffff';
    const waterOffset = frame;
    for (let y = 0; y < 35; y += 2) {
        const variation = Math.sin(y * 0.2 + waterOffset) * 1;
        ctx.fillRect(12 + variation, y, 2, 2);
    }
    
    // Mist at bottom
    ctx.fillStyle = '#f0f8ff';
    for (let i = 0; i < 4; i++) {
        const x = 10 + i * 3 + Math.sin(frame + i) * 2;
        const y = 30 + Math.cos(frame + i) * 2;
        if (x < 16) {
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

// 26. Rippling pool
function generateRipplingPool(ctx, frame) {
    // Background
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, 48, 48);
    
    // Pool water
    ctx.fillStyle = '#4682b4';
    ctx.fillRect(8, 8, 32, 32);
    
    // Concentric ripples
    ctx.fillStyle = '#ffffff';
    for (let r = 1; r <= 6; r++) {
        const radius = r * 3 + frame;
        const alpha = Math.max(0, 1 - (radius / 20));
        if (alpha > 0.1) {
            // Draw ring pixels
            for (let angle = 0; angle < 360; angle += 20) {
                const x = 24 + Math.cos(angle * Math.PI / 180) * radius;
                const y = 24 + Math.sin(angle * Math.PI / 180) * radius;
                if (x >= 8 && x <= 40 && y >= 8 && y <= 40) {
                    ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
                }
            }
        }
    }
}

// 27. Ice cave drips
function generateIceCaveDrips(ctx, frame) {
    // Ice cave background
    ctx.fillStyle = '#4a90e2';
    ctx.fillRect(0, 0, 48, 48);
    
    // Cave walls
    ctx.fillStyle = '#2c5282';
    ctx.fillRect(0, 0, 12, 48);
    ctx.fillRect(36, 0, 12, 48);
    
    // Floor
    ctx.fillStyle = '#1a365d';
    ctx.fillRect(0, 40, 48, 8);
    
    // Stalactites
    ctx.fillStyle = '#e6f3ff';
    ctx.fillRect(5, 0, 3, 8);
    ctx.fillRect(8, 0, 2, 6);
    ctx.fillRect(38, 0, 3, 10);
    ctx.fillRect(42, 0, 2, 7);
    
    // Water drops falling
    ctx.fillStyle = '#87ceeb';
    const dropOffset = frame * 2;
    const drops = [
        { x: 6, startY: 8 },
        { x: 9, startY: 6 },
        { x: 39, startY: 10 },
        { x: 43, startY: 7 }
    ];
    
    drops.forEach(drop => {
        const y = (drop.startY + dropOffset) % 32 + drop.startY;
        if (drop.x < 16 || drop.x > 32) {
            ctx.fillRect(drop.x, y, 1, 2);
        }
    });
}

// 28. Rain on water
function generateRainOnWater(ctx, frame) {
    // Stormy sky
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 0, 48, 20);
    
    // Water surface
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(0, 20, 48, 28);
    
    // Rain drops
    ctx.fillStyle = '#bdc3c7';
    const rainOffset = frame * 4;
    for (let i = 0; i < 20; i++) {
        const x = (i * 5 + rainOffset) % 48;
        const y = (i * 3 + rainOffset) % 20;
        if (x < 16 || x > 32) {
            ctx.fillRect(x, y, 1, 2);
        }
    }
    
    // Ripples on water surface
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 8; i++) {
        const x = (i * 7 + frame) % 48;
        const y = 20;
        if (x < 16 || x > 32) {
            // Small ripple effect
            ctx.fillRect(x - 1, y, 3, 1);
            if (frame % 4 < 2) {
                ctx.fillRect(x, y + 1, 1, 1);
            }
        }
    }
}

// 29. Ocean waves
function generateOceanWaves(ctx, frame) {
    // Sky
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, 48, 25);
    
    // Ocean
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(0, 25, 48, 23);
    
    // Animated waves rolling in
    const waveOffset = frame;
    ctx.fillStyle = '#3498db';
    for (let x = 0; x < 48; x += 4) {
        const waveHeight = 2 + Math.sin(x * 0.3 + waveOffset * 0.5) * 3;
        const y = 25 + waveHeight;
        ctx.fillRect(x, y, 4, 48 - y);
    }
    
    // Wave foam
    ctx.fillStyle = '#ffffff';
    for (let x = 0; x < 48; x += 6) {
        const foamY = 28 + Math.sin(x * 0.2 + waveOffset) * 2;
        if (x < 16 || x > 32) {
            ctx.fillRect(x, foamY, 2, 1);
        }
    }
}

// 30. Stream flow
function generateStreamFlow(ctx, frame) {
    // Grass background
    ctx.fillStyle = '#8fbc8f';
    ctx.fillRect(0, 0, 48, 48);
    
    // Stream bed
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(0, 35, 48, 13);
    
    // Flowing water
    ctx.fillStyle = '#4682b4';
    ctx.fillRect(0, 38, 48, 6);
    
    // Water ripples flowing right
    ctx.fillStyle = '#87ceeb';
    const flowOffset = frame * 3;
    for (let i = 0; i < 12; i++) {
        const x = (i * 4 + flowOffset) % 48;
        const y = 39 + Math.sin(i + frame * 0.5) * 1;
        ctx.fillRect(x, y, 2, 1);
    }
    
    // Banks with grass
    ctx.fillStyle = '#228b22';
    for (let x = 2; x < 16; x += 4) {
        ctx.fillRect(x, 32, 1, 3);
    }
    for (let x = 33; x < 46; x += 4) {
        ctx.fillRect(x, 32, 1, 3);
    }
}

// 31. Frozen sparkle
function generateFrozenSparkle(ctx, frame) {
    // Ice cave background
    ctx.fillStyle = '#4a90e2';
    ctx.fillRect(0, 0, 48, 48);
    
    // Ice formations on sides
    ctx.fillStyle = '#e6f3ff';
    ctx.fillRect(0, 15, 12, 20);
    ctx.fillRect(36, 10, 12, 25);
    
    // Ice crystals
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(3, 18, 6, 8);
    ctx.fillRect(39, 13, 6, 10);
    
    // Twinkling sparkles
    const sparkles = [
        { x: 5, y: 20 },
        { x: 8, y: 24 },
        { x: 41, y: 16 },
        { x: 44, y: 20 },
        { x: 6, y: 28 },
        { x: 42, y: 28 }
    ];
    
    sparkles.forEach((sparkle, i) => {
        const twinkle = Math.sin(frame * 0.8 + i) > 0.5;
        if (twinkle) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(sparkle.x, sparkle.y, 1, 1);
            ctx.fillRect(sparkle.x - 1, sparkle.y, 1, 1);
            ctx.fillRect(sparkle.x + 1, sparkle.y, 1, 1);
            ctx.fillRect(sparkle.x, sparkle.y - 1, 1, 1);
            ctx.fillRect(sparkle.x, sparkle.y + 1, 1, 1);
        }
    });
}

// MAGIC & ENERGY (32-43)

// 32. Purple portal
function generatePurplePortal(ctx, frame) {
    // Dark mystical background
    ctx.fillStyle = '#1a0d2e';
    ctx.fillRect(0, 0, 48, 48);
    
    // Portal on left side
    ctx.fillStyle = '#4b0082';
    ctx.fillRect(6, 12, 8, 24);
    
    // Swirling vortex
    const swirl = frame * 0.3;
    ctx.fillStyle = '#8a2be2';
    for (let r = 1; r <= 4; r++) {
        for (let a = 0; a < 360; a += 30) {
            const angle = (a + swirl * r * 20) * Math.PI / 180;
            const x = 10 + Math.cos(angle) * r;
            const y = 24 + Math.sin(angle) * r * 1.5;
            if (x >= 6 && x <= 14) {
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
    
    // Spiraling particles
    ctx.fillStyle = '#da70d6';
    for (let i = 0; i < 6; i++) {
        const angle = (frame * 2 + i * 60) * Math.PI / 180;
        const radius = 5 + Math.sin(frame + i) * 2;
        const x = 10 + Math.cos(angle) * radius;
        const y = 24 + Math.sin(angle) * radius;
        if (x >= 0 && x < 16) {
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

// 33. Rune glow
function generateRuneGlow(ctx, frame) {
    // Stone floor
    ctx.fillStyle = '#36454f';
    ctx.fillRect(0, 0, 48, 48);
    
    // Floor runes in sequence
    const runes = [
        { x: 5, y: 35, phase: 0 },
        { x: 10, y: 38, phase: 1 },
        { x: 15, y: 35, phase: 2 },
        { x: 33, y: 37, phase: 3 },
        { x: 38, y: 35, phase: 4 },
        { x: 43, y: 38, phase: 5 }
    ];
    
    runes.forEach(rune => {
        const intensity = Math.sin(frame * 0.5 + rune.phase) * 0.5 + 0.5;
        if (intensity > 0.3) {
            const color = intensity > 0.7 ? '#ffffff' : '#4169e1';
            ctx.fillStyle = color;
            // Simple rune shape
            ctx.fillRect(rune.x, rune.y, 3, 3);
            ctx.fillRect(rune.x + 1, rune.y - 1, 1, 1);
            ctx.fillRect(rune.x + 1, rune.y + 3, 1, 1);
            ctx.fillRect(rune.x - 1, rune.y + 1, 1, 1);
            ctx.fillRect(rune.x + 3, rune.y + 1, 1, 1);
        }
    });
}

// 34. Crystal pulse - cycling through 6 Order colors
function generateCrystalPulse(ctx, frame) {
    // Dark crystal cave
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, 48, 48);
    
    // Crystal formations on sides
    ctx.fillStyle = '#4a4a6a';
    ctx.fillRect(2, 20, 10, 15);
    ctx.fillRect(36, 18, 10, 18);
    
    // 6 Order colors cycling
    const colors = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];
    const colorIndex = Math.floor(frame / 2) % 6;
    const nextColorIndex = (colorIndex + 1) % 6;
    const blend = (frame % 2) * 0.5;
    
    // Left crystal
    ctx.fillStyle = colors[colorIndex];
    ctx.fillRect(4, 22, 6, 11);
    ctx.fillRect(5, 20, 4, 2);
    ctx.fillRect(6, 18, 2, 2);
    
    // Right crystal
    ctx.fillStyle = colors[nextColorIndex];
    ctx.fillRect(38, 20, 6, 14);
    ctx.fillRect(39, 18, 4, 2);
    ctx.fillRect(40, 16, 2, 2);
    
    // Pulsing glow
    const glowIntensity = Math.sin(frame * 0.8) * 0.3 + 0.7;
    if (glowIntensity > 0.8) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(6, 24, 2, 6);
        ctx.fillRect(40, 22, 2, 8);
    }
}

// 35. Magic sparks
function generateMagicSparks(ctx, frame) {
    // Mystical purple background
    ctx.fillStyle = '#2e1065';
    ctx.fillRect(0, 0, 48, 48);
    
    // Random colored sparks popping
    const sparkColors = ['#e74c3c', '#f39c12', '#2ecc71', '#3498db', '#9b59b6', '#e91e63'];
    
    for (let i = 0; i < 12; i++) {
        const spark = {
            x: 5 + (i * 7) % 38,
            y: 8 + (i * 11) % 32,
            life: (frame + i * 2) % 16,
            colorIndex: i % sparkColors.length
        };
        
        if (spark.life < 8 && (spark.x < 16 || spark.x > 32)) {
            const size = spark.life < 4 ? spark.life : 8 - spark.life;
            if (size > 0) {
                ctx.fillStyle = sparkColors[spark.colorIndex];
                ctx.fillRect(spark.x, spark.y, Math.max(1, size), Math.max(1, size));
                
                // Sparkle effect
                if (size > 2) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(spark.x + 1, spark.y + 1, 1, 1);
                }
            }
        }
    }
}

// 36. Enchantment aura
function generateEnchantmentAura(ctx, frame) {
    // Dark enchanted background
    ctx.fillStyle = '#1a0d2e';
    ctx.fillRect(0, 0, 48, 48);
    
    // Glowing ring pulsing outward from center-left
    const centerX = 12;
    const centerY = 24;
    const maxRadius = 8 + Math.sin(frame * 0.4) * 4;
    
    ctx.fillStyle = '#da70d6';
    
    // Draw expanding rings
    for (let r = 2; r <= maxRadius; r += 2) {
        const alpha = 1 - (r / maxRadius);
        if (alpha > 0.2) {
            // Draw ring pixels
            for (let angle = 0; angle < 360; angle += 15) {
                const x = centerX + Math.cos(angle * Math.PI / 180) * r;
                const y = centerY + Math.sin(angle * Math.PI / 180) * r;
                if (x >= 0 && x < 16 && y >= 0 && y < 48) {
                    ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
                }
            }
        }
    }
    
    // Core glow
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(centerX - 1, centerY - 1, 2, 2);
}

// 37. Spirit wisps
function generateSpiritWisps(ctx, frame) {
    // Ethereal dark background
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, 48, 48);
    
    // Ghostly white dots floating in patterns
    ctx.fillStyle = '#f8f8ff';
    
    const wisps = [
        { baseX: 6, baseY: 15, pathRadius: 4, speed: 1.2 },
        { baseX: 10, baseY: 25, pathRadius: 3, speed: 0.8 },
        { baseX: 8, baseY: 35, pathRadius: 5, speed: 1.5 },
        { baseX: 38, baseY: 12, pathRadius: 4, speed: 0.9 },
        { baseX: 42, baseY: 22, pathRadius: 3, speed: 1.3 },
        { baseX: 40, baseY: 32, pathRadius: 4, speed: 1.1 }
    ];
    
    wisps.forEach((wisp, i) => {
        const angle = frame * wisp.speed * 0.3 + i;
        const x = wisp.baseX + Math.cos(angle) * wisp.pathRadius;
        const y = wisp.baseY + Math.sin(angle) * wisp.pathRadius * 0.5;
        
        if ((x < 16 || x > 32) && x >= 0 && x < 48) {
            const brightness = 0.7 + Math.sin(frame + i) * 0.3;
            if (brightness > 0.5) {
                ctx.fillStyle = brightness > 0.8 ? '#ffffff' : '#d3d3d3';
                ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
                
                // Faint trail
                const prevX = wisp.baseX + Math.cos(angle - 0.5) * wisp.pathRadius;
                const prevY = wisp.baseY + Math.sin(angle - 0.5) * wisp.pathRadius * 0.5;
                if ((prevX < 16 || prevX > 32) && prevX >= 0 && prevX < 48) {
                    ctx.fillStyle = '#696969';
                    ctx.fillRect(Math.floor(prevX), Math.floor(prevY), 1, 1);
                }
            }
        }
    });
}

// 38. Arcane lightning
function generateArcaneLightning(ctx, frame) {
    // Dark mystical hall
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 48, 48);
    
    // Stone pillars on sides
    ctx.fillStyle = '#4a4a5e';
    ctx.fillRect(4, 10, 6, 30);
    ctx.fillRect(38, 10, 6, 30);
    
    // Lightning bolts between pillars (but keeping center open)
    if (frame % 4 === 0 || frame % 4 === 1) {
        ctx.fillStyle = '#8a2be2';
        
        // Zigzag lightning path
        let currentX = 10;
        let currentY = 15;
        const segments = 6;
        
        for (let i = 0; i < segments; i++) {
            const nextX = Math.min(38, currentX + 4 + Math.random() * 4);
            const nextY = currentY + (Math.random() - 0.5) * 6;
            
            // Draw lightning segment
            const steps = Math.abs(nextX - currentX) + Math.abs(nextY - currentY);
            for (let step = 0; step <= steps; step++) {
                const t = step / steps;
                const x = Math.floor(currentX + (nextX - currentX) * t);
                const y = Math.floor(currentY + (nextY - currentY) * t);
                if (x >= 16 && x <= 32) break; // Keep center open
                ctx.fillRect(x, y, 1, 1);
            }
            
            currentX = nextX;
            currentY = nextY;
            
            if (currentX >= 38) break;
        }
        
        // Core lightning
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(7, 20, 1, 1);
        ctx.fillRect(41, 25, 1, 1);
    }
}

// 39. Potion bubbles
function generatePotionBubbles(ctx, frame) {
    // Alchemist's lab
    ctx.fillStyle = '#2c1810';
    ctx.fillRect(0, 0, 48, 48);
    
    // Table/surface
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(0, 35, 48, 13);
    
    // Cauldron on right side
    ctx.fillStyle = '#2f4f4f';
    ctx.fillRect(36, 25, 10, 10);
    ctx.fillRect(37, 24, 8, 2);
    
    // Bubbling potion
    ctx.fillStyle = '#32cd32';
    ctx.fillRect(37, 26, 8, 8);
    
    // Rising colored bubbles
    const bubbleColors = ['#32cd32', '#ff69b4', '#9370db', '#ff6347'];
    
    for (let i = 0; i < 6; i++) {
        const x = 38 + (i % 3) * 2;
        const y = 25 - ((frame + i * 2) % 15);
        const colorIndex = i % bubbleColors.length;
        
        if (y > 5 && x < 46) {
            ctx.fillStyle = bubbleColors[colorIndex];
            ctx.fillRect(x, y, 1, 1);
            
            // Larger bubbles occasionally
            if ((frame + i) % 8 === 0) {
                ctx.fillRect(x, y - 1, 1, 1);
                ctx.fillRect(x + 1, y, 1, 1);
            }
        }
    }
}

// 40. Spell circle
function generateSpellCircle(ctx, frame) {
    // Dark ritual chamber
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, 48, 48);
    
    // Stone floor
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(0, 35, 48, 13);
    
    // Rotating magical circle on ground
    const centerX = 24;
    const centerY = 40;
    const rotation = frame * 0.4;
    
    // Outer circle
    ctx.fillStyle = '#8a2be2';
    for (let angle = 0; angle < 360; angle += 10) {
        const rad = (angle + rotation) * Math.PI / 180;
        const x = centerX + Math.cos(rad) * 12;
        const y = centerY + Math.sin(rad) * 6;
        if (x >= 0 && x < 48 && y >= 35) {
            ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
        }
    }
    
    // Inner symbols rotating
    ctx.fillStyle = '#da70d6';
    for (let i = 0; i < 6; i++) {
        const angle = (rotation * 2 + i * 60) * Math.PI / 180;
        const x = centerX + Math.cos(angle) * 8;
        const y = centerY + Math.sin(angle) * 4;
        if (x >= 0 && x < 48 && y >= 35) {
            ctx.fillRect(Math.floor(x), Math.floor(y), 2, 2);
        }
    }
    
    // Core glow
    ctx.fillStyle = '#ffffff';
    if (frame % 4 < 2) {
        ctx.fillRect(centerX - 1, centerY - 1, 2, 2);
    }
}

// 41. Star twinkle
function generateStarTwinkle(ctx, frame) {
    // Night sky
    ctx.fillStyle = '#0c0c1e';
    ctx.fillRect(0, 0, 48, 35);
    
    // Ground
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 35, 48, 13);
    
    // Twinkling stars
    const stars = [
        { x: 5, y: 8, phase: 0 },
        { x: 12, y: 5, phase: 1 },
        { x: 8, y: 15, phase: 2 },
        { x: 10, y: 25, phase: 3 },
        { x: 35, y: 6, phase: 4 },
        { x: 42, y: 12, phase: 5 },
        { x: 38, y: 18, phase: 6 },
        { x: 44, y: 28, phase: 7 }
    ];
    
    stars.forEach(star => {
        const twinkle = Math.sin(frame * 0.6 + star.phase) * 0.5 + 0.5;
        if (twinkle > 0.3) {
            const brightness = twinkle > 0.8 ? '#ffffff' : '#d3d3d3';
            ctx.fillStyle = brightness;
            ctx.fillRect(star.x, star.y, 1, 1);
            
            if (twinkle > 0.9) {
                // Twinkle cross effect
                ctx.fillRect(star.x - 1, star.y, 1, 1);
                ctx.fillRect(star.x + 1, star.y, 1, 1);
                ctx.fillRect(star.x, star.y - 1, 1, 1);
                ctx.fillRect(star.x, star.y + 1, 1, 1);
            }
        }
    });
}

// 42. Moon phases
function generateMoonPhases(ctx, frame) {
    // Night sky
    ctx.fillStyle = '#191970';
    ctx.fillRect(0, 0, 48, 48);
    
    // Ground
    ctx.fillStyle = '#2f2f2f';
    ctx.fillRect(0, 38, 48, 10);
    
    // Moon cycling through phases
    const moonX = 8;
    const moonY = 12;
    const phase = frame % 8;
    
    // Moon base
    ctx.fillStyle = '#f5f5dc';
    ctx.fillRect(moonX, moonY, 6, 6);
    
    // Phase shadow
    ctx.fillStyle = '#191970';
    switch (phase) {
        case 0: // New moon
            ctx.fillRect(moonX, moonY, 6, 6);
            break;
        case 1: // Waxing crescent
            ctx.fillRect(moonX, moonY, 4, 6);
            break;
        case 2: // First quarter
            ctx.fillRect(moonX, moonY, 3, 6);
            break;
        case 3: // Waxing gibbous
            ctx.fillRect(moonX, moonY, 2, 6);
            break;
        case 4: // Full moon
            break;
        case 5: // Waning gibbous
            ctx.fillRect(moonX + 4, moonY, 2, 6);
            break;
        case 6: // Last quarter
            ctx.fillRect(moonX + 3, moonY, 3, 6);
            break;
        case 7: // Waning crescent
            ctx.fillRect(moonX + 2, moonY, 4, 6);
            break;
    }
}

// 43. Energy beam
function generateEnergyBeam(ctx, frame) {
    // Dark energy chamber
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, 48, 48);
    
    // Energy crystals on sides
    ctx.fillStyle = '#4169e1';
    ctx.fillRect(4, 18, 6, 12);
    ctx.fillRect(38, 18, 6, 12);
    
    // Crystal cores
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 22, 2, 4);
    ctx.fillRect(40, 22, 2, 4);
    
    // Pulsing energy beam between crystals
    const intensity = Math.sin(frame * 0.8) * 0.5 + 0.5;
    
    if (intensity > 0.3) {
        const beamColor = intensity > 0.8 ? '#ffffff' : '#87ceeb';
        ctx.fillStyle = beamColor;
        
        // Beam connecting crystals (but not in center)
        for (let x = 10; x < 16; x++) {
            const y = 24 + Math.sin(x + frame) * 1;
            ctx.fillRect(x, y, 1, 1);
        }
        for (let x = 33; x < 38; x++) {
            const y = 24 + Math.sin(x + frame) * 1;
            ctx.fillRect(x, y, 1, 1);
        }
        
        // Energy particles
        ctx.fillStyle = '#da70d6';
        for (let i = 0; i < 4; i++) {
            const x = 12 + i * 6 + Math.sin(frame + i) * 2;
            const y = 24 + Math.cos(frame + i) * 2;
            if ((x < 16 || x > 32) && x >= 0 && x < 48) {
                ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
            }
        }
    }
}

// ATMOSPHERIC (44-50)

// 44. Dust motes
function generateDustMotes(ctx, frame) {
    // Dusty background with sunbeam
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(0, 0, 48, 48);
    
    // Sunbeam area (diagonal)
    ctx.fillStyle = '#d2b48c';
    ctx.fillRect(5, 5, 8, 38);
    ctx.fillRect(6, 4, 6, 40);
    
    // Floating dust particles in sunbeam
    ctx.fillStyle = '#f5deb3';
    const dustOffset = frame * 0.5;
    for (let i = 0; i < 15; i++) {
        const x = 6 + (i % 6) + Math.sin(dustOffset + i) * 2;
        const y = (5 + i * 3 + dustOffset) % 43;
        if (x < 16) {
            ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
        }
    }
    
    // Some dust outside the beam too
    ctx.fillStyle = '#cd853f';
    for (let i = 0; i < 8; i++) {
        const x = 35 + (i % 4) + Math.cos(dustOffset + i) * 1;
        const y = (10 + i * 4 + dustOffset * 0.7) % 38;
        ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
    }
}

// 45. Smoke rising
function generateSmokeRising(ctx, frame) {
    // Dark background
    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(0, 0, 48, 48);
    
    // Ground
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 40, 48, 8);
    
    // Smoke sources on sides
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(6, 38, 4, 2);
    ctx.fillRect(38, 38, 4, 2);
    
    // Rising smoke columns
    ctx.fillStyle = '#808080';
    const smokeOffset = frame;
    
    // Left smoke
    for (let y = 38; y > 5; y -= 3) {
        const drift = Math.sin((y + smokeOffset) * 0.2) * 2;
        const x = 8 + drift;
        if (x < 16) {
            ctx.fillRect(Math.floor(x), y, 1, 2);
            ctx.fillRect(Math.floor(x) + 1, y + 1, 1, 1);
        }
    }
    
    // Right smoke
    for (let y = 38; y > 8; y -= 3) {
        const drift = Math.cos((y + smokeOffset) * 0.15) * 3;
        const x = 40 + drift;
        if (x > 32 && x < 48) {
            ctx.fillRect(Math.floor(x), y, 1, 2);
            ctx.fillRect(Math.floor(x) - 1, y + 1, 1, 1);
        }
    }
    
    // Dissipating smoke at top
    ctx.fillStyle = '#696969';
    for (let i = 0; i < 6; i++) {
        const x = 5 + i * 6 + Math.sin(frame + i) * 3;
        const y = 8 + Math.cos(frame + i) * 2;
        if ((x < 16 || x > 32) && x >= 0 && x < 48) {
            ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
        }
    }
}

// 46. Spore cloud
function generateSporeCloud(ctx, frame) {
    // Dark forest floor
    ctx.fillStyle = '#1a2612';
    ctx.fillRect(0, 0, 48, 48);
    
    // Mushroom areas on sides
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(3, 38, 10, 10);
    ctx.fillRect(35, 38, 10, 10);
    
    // Mushroom caps
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(5, 35, 6, 4);
    ctx.fillRect(37, 35, 6, 4);
    
    // Green glowing spores floating upward
    ctx.fillStyle = '#32cd32';
    const sporeOffset = frame;
    
    for (let i = 0; i < 20; i++) {
        const x = 4 + (i % 8) * 5 + Math.sin(sporeOffset + i) * 2;
        const y = 40 - ((sporeOffset + i * 2) % 35);
        
        if ((x < 16 || x > 32) && y > 5) {
            ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
            
            // Glow effect
            if (Math.sin(frame + i) > 0.5) {
                ctx.fillStyle = '#90ee90';
                ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
                ctx.fillStyle = '#32cd32';
            }
        }
    }
    
    // Mushroom glow
    ctx.fillStyle = '#228b22';
    if (frame % 3 === 0) {
        ctx.fillRect(6, 36, 4, 2);
        ctx.fillRect(38, 36, 4, 2);
    }
}

// 47. Ember drift
function generateEmberDrift(ctx, frame) {
    // Dark ashy background
    ctx.fillStyle = '#2f1b14';
    ctx.fillRect(0, 0, 48, 48);
    
    // Burnt ground
    ctx.fillStyle = '#1a0e0a';
    ctx.fillRect(0, 38, 48, 10);
    
    // Slowly floating embers
    const embers = [
        { x: 6, y: 30, drift: 0.5, phase: 0 },
        { x: 10, y: 25, drift: 0.7, phase: 1 },
        { x: 8, y: 15, drift: 0.3, phase: 2 },
        { x: 38, y: 28, drift: 0.6, phase: 3 },
        { x: 42, y: 20, drift: 0.4, phase: 4 },
        { x: 40, y: 12, drift: 0.8, phase: 5 }
    ];
    
    embers.forEach(ember => {
        const x = ember.x + Math.sin(frame * ember.drift + ember.phase) * 2;
        const y = ember.y - (frame * 0.3) % 25;
        
        if ((x < 16 || x > 32) && y > 5) {
            const brightness = 0.5 + Math.sin(frame + ember.phase) * 0.5;
            if (brightness > 0.3) {
                ctx.fillStyle = brightness > 0.8 ? '#ff6347' : '#cd5c5c';
                ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
                
                // Faint glow
                if (brightness > 0.7) {
                    ctx.fillStyle = '#ffa500';
                    ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
                }
            }
        }
    });
}

// 48. Shadow flicker
function generateShadowFlicker(ctx, frame) {
    // Stone chamber
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(0, 0, 48, 48);
    
    // Walls
    ctx.fillStyle = '#36454f';
    ctx.fillRect(0, 0, 15, 48);
    ctx.fillRect(33, 0, 15, 48);
    
    // Flickering light source effect on shadows
    const lightIntensity = 0.7 + Math.sin(frame * 0.9) * 0.3;
    const shadowColor = lightIntensity > 0.8 ? '#2f2f2f' : '#1a1a1a';
    
    // Moving shadows on walls
    ctx.fillStyle = shadowColor;
    const shadowOffset = Math.sin(frame * 0.5) * 3;
    
    // Left wall shadows
    ctx.fillRect(2, 10 + shadowOffset, 8, 15);
    ctx.fillRect(4, 28 + shadowOffset, 6, 10);
    
    // Right wall shadows
    ctx.fillRect(38, 8 - shadowOffset, 6, 20);
    ctx.fillRect(35, 30 - shadowOffset, 8, 12);
    
    // Floor shadows
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(5, 42 + Math.sin(frame) * 2, 8, 4);
    ctx.fillRect(35, 43 + Math.cos(frame) * 2, 10, 3);
}

// 49. Heartbeat pulse
function generateHeartbeatPulse(ctx, frame) {
    // Dark organic background
    ctx.fillStyle = '#2c1810';
    ctx.fillRect(0, 0, 48, 48);
    
    // Heartbeat pattern - double beat
    const beat1 = Math.sin(frame * 0.8) > 0.7;
    const beat2 = Math.sin(frame * 0.8 + 0.5) > 0.8;
    const pulse = beat1 || beat2;
    
    // Pulsing areas on sides
    const pulseColor = pulse ? '#ff1744' : '#8b0000';
    ctx.fillStyle = pulseColor;
    
    // Left pulse area
    ctx.fillRect(4, 20, 8, 8);
    ctx.fillRect(6, 18, 4, 12);
    
    // Right pulse area  
    ctx.fillRect(36, 20, 8, 8);
    ctx.fillRect(38, 18, 4, 12);
    
    // Pulse waves spreading out
    if (pulse) {
        ctx.fillStyle = '#ff6b6b';
        const waveSize = (frame % 8) * 2;
        
        // Left waves
        ctx.fillRect(4 - waveSize, 24, 1, 1);
        ctx.fillRect(4 - waveSize, 22, 1, 1);
        ctx.fillRect(4 - waveSize, 26, 1, 1);
        
        // Right waves
        if (44 + waveSize < 48) {
            ctx.fillRect(44 + waveSize, 24, 1, 1);
            ctx.fillRect(44 + waveSize, 22, 1, 1);
            ctx.fillRect(44 + waveSize, 26, 1, 1);
        }
    }
    
    // Core glow
    if (pulse) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(7, 23, 2, 2);
        ctx.fillRect(39, 23, 2, 2);
    }
}

// 50. Void static
function generateVoidStatic(ctx, frame) {
    // Pure black void
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 48, 48);
    
    // Random white static pixels glitching
    ctx.fillStyle = '#ffffff';
    
    for (let i = 0; i < 25; i++) {
        const x = Math.floor((i * 17 + frame * 23) % 48);
        const y = Math.floor((i * 13 + frame * 19) % 48);
        
        // Only show static in allowed areas
        if ((x < 16 || x > 32) && Math.random() > 0.6) {
            ctx.fillRect(x, y, 1, 1);
        }
    }
    
    // Glitch lines occasionally
    if (frame % 7 === 0) {
        const glitchY = Math.floor(Math.random() * 48);
        for (let x = 0; x < 16; x++) {
            if (Math.random() > 0.7) {
                ctx.fillRect(x, glitchY, 1, 1);
            }
        }
        for (let x = 33; x < 48; x++) {
            if (Math.random() > 0.7) {
                ctx.fillRect(x, glitchY, 1, 1);
            }
        }
    }
    
    // Occasional larger glitch blocks
    if (frame % 11 === 0) {
        const blockX = Math.random() > 0.5 ? Math.floor(Math.random() * 16) : 33 + Math.floor(Math.random() * 15);
        const blockY = Math.floor(Math.random() * 46);
        ctx.fillRect(blockX, blockY, 2, 2);
    }
}

// Main generation function
async function generateAllGIFs() {
    const scenes = [
        { name: 'gen-gif-01.gif', func: generateRain },
        { name: 'gen-gif-02.gif', func: generateHeavySnow },
        { name: 'gen-gif-03.gif', func: generateGentleSnow },
        { name: 'gen-gif-04.gif', func: generateThunderstorm },
        { name: 'gen-gif-05.gif', func: generateFogRolling },
        { name: 'gen-gif-06.gif', func: generateSandstorm },
        { name: 'gen-gif-07.gif', func: generateFireflies },
        { name: 'gen-gif-08.gif', func: generateFallingLeaves },
        { name: 'gen-gif-09.gif', func: generateCherryBlossoms },
        { name: 'gen-gif-10.gif', func: generateMeteorShower },
        { name: 'gen-gif-11.gif', func: generateAurora },
        { name: 'gen-gif-12.gif', func: generateSunrise },
        { name: 'gen-gif-13.gif', func: generateTidalWaves },
        { name: 'gen-gif-14.gif', func: generateWind },
        { name: 'gen-gif-15.gif', func: generateVolcanicAsh },
        { name: 'gen-gif-16.gif', func: generateCampfire },
        { name: 'gen-gif-17.gif', func: generateTorchHall },
        { name: 'gen-gif-18.gif', func: generateLavaFlow },
        { name: 'gen-gif-19.gif', func: generateBonfire },
        { name: 'gen-gif-20.gif', func: generateCandleRoom },
        { name: 'gen-gif-21.gif', func: generateFireRain },
        { name: 'gen-gif-22.gif', func: generateMagmaBubbles },
        { name: 'gen-gif-23.gif', func: generateForge },
        { name: 'gen-gif-24.gif', func: generateUnderwaterBubbles },
        { name: 'gen-gif-25.gif', func: generateWaterfall },
        { name: 'gen-gif-26.gif', func: generateRipplingPool },
        { name: 'gen-gif-27.gif', func: generateIceCaveDrips },
        { name: 'gen-gif-28.gif', func: generateRainOnWater },
        { name: 'gen-gif-29.gif', func: generateOceanWaves },
        { name: 'gen-gif-30.gif', func: generateStreamFlow },
        { name: 'gen-gif-31.gif', func: generateFrozenSparkle },
        { name: 'gen-gif-32.gif', func: generatePurplePortal },
        { name: 'gen-gif-33.gif', func: generateRuneGlow },
        { name: 'gen-gif-34.gif', func: generateCrystalPulse },
        { name: 'gen-gif-35.gif', func: generateMagicSparks },
        { name: 'gen-gif-36.gif', func: generateEnchantmentAura },
        { name: 'gen-gif-37.gif', func: generateSpiritWisps },
        { name: 'gen-gif-38.gif', func: generateArcaneLightning },
        { name: 'gen-gif-39.gif', func: generatePotionBubbles },
        { name: 'gen-gif-40.gif', func: generateSpellCircle },
        { name: 'gen-gif-41.gif', func: generateStarTwinkle },
        { name: 'gen-gif-42.gif', func: generateMoonPhases },
        { name: 'gen-gif-43.gif', func: generateEnergyBeam },
        { name: 'gen-gif-44.gif', func: generateDustMotes },
        { name: 'gen-gif-45.gif', func: generateSmokeRising },
        { name: 'gen-gif-46.gif', func: generateSporeCloud },
        { name: 'gen-gif-47.gif', func: generateEmberDrift },
        { name: 'gen-gif-48.gif', func: generateShadowFlicker },
        { name: 'gen-gif-49.gif', func: generateHeartbeatPulse },
        { name: 'gen-gif-50.gif', func: generateVoidStatic }
    ];
    
    console.log('Starting generation of 50 animated GIF backgrounds...\n');
    
    for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        try {
            await saveGIF(scene.name, scene.func);
        } catch (error) {
            console.error(`Error generating ${scene.name}:`, error);
        }
    }
    
    console.log('\n✨ Generation complete! Listing all generated files:\n');
    
    // List all generated files with sizes
    const files = fs.readdirSync(OUTPUT_DIR)
        .filter(file => file.startsWith('gen-gif-') && file.endsWith('.gif'))
        .sort();
    
    let totalSize = 0;
    files.forEach(file => {
        const filePath = path.join(OUTPUT_DIR, file);
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(1);
        totalSize += stats.size;
        console.log(`${file}: ${sizeKB} KB`);
    });
    
    console.log(`\nTotal: ${files.length} files, ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
}

// Run the generation
generateAllGIFs().catch(console.error);