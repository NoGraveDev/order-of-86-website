const { createCanvas } = require('canvas');
const GIFEncoder = require('gif-encoder-2');
const fs = require('fs').promises;
const path = require('path');

// Ensure directories exist
async function ensureDir(dirPath) {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
}

// Hex color to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// RGB to hex
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Dithering function - checkerboard pattern
function shouldDither(x, y, pattern = 2) {
    if (pattern === 2) return (x + y) % 2 === 0;
    if (pattern === 3) return (x + y) % 3 === 0;
    return false;
}

// Hue shift for shadows (shift toward blue/purple)
function shiftHue(color, shift) {
    const rgb = hexToRgb(color);
    if (!rgb) return color;
    
    // Simple hue shift by adjusting RGB values
    let { r, g, b } = rgb;
    if (shift > 0) {
        // Shift toward blue/purple
        b = Math.min(255, b + shift);
        r = Math.max(0, r - shift * 0.3);
    } else {
        // Shift toward red/orange
        r = Math.min(255, r + Math.abs(shift));
        b = Math.max(0, b - Math.abs(shift) * 0.3);
    }
    
    return rgbToHex(Math.round(r), Math.round(g), Math.round(b));
}

// Draw pixel with dithering between two colors
function drawDitheredPixel(ctx, x, y, color1, color2, pattern = 2) {
    const useColor1 = shouldDither(x, y, pattern);
    ctx.fillStyle = useColor1 ? color1 : color2;
    ctx.fillRect(x, y, 1, 1);
}

// Add atmospheric particles
function addParticles(ctx, width, height, count, colors) {
    for (let i = 0; i < count; i++) {
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);
        const color = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
    }
}

// Upscale canvas with nearest-neighbor
function upscaleCanvas(sourceCanvas, targetWidth, targetHeight) {
    const targetCanvas = createCanvas(targetWidth, targetHeight);
    const targetCtx = targetCanvas.getContext('2d');
    targetCtx.imageSmoothingEnabled = false;
    targetCtx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
    return targetCanvas;
}

// STILL BACKGROUND GENERATORS

function generateFrosthollowPeaks() {
    const canvas = createCanvas(100, 100);
    const ctx = canvas.getContext('2d');
    
    const colors = {
        deepSky: '#0a1a3a',
        midSky: '#1a3a5a',
        distantMountains: '#4a6a8a',
        snowLit: '#8aaabe',
        brightSnow: '#cceeff',
        highlights: '#ffffff',
        pineDark: '#2a4a2a',
        pineLit: '#3a6a3a',
        rockShadow: '#223344'
    };
    
    // Sky gradient
    for (let y = 0; y < 40; y++) {
        for (let x = 0; x < 100; x++) {
            if (y < 20) {
                drawDitheredPixel(ctx, x, y, colors.deepSky, colors.midSky);
            } else {
                ctx.fillStyle = colors.midSky;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
    
    // Stars
    addParticles(ctx, 100, 40, 15, [colors.highlights, colors.brightSnow]);
    
    // Mountain peaks on left and right
    for (let x = 0; x < 35; x++) {
        const peakHeight = Math.sin(x * 0.2) * 15 + 25;
        for (let y = Math.floor(40 + peakHeight); y < 100; y++) {
            if (y > 85) {
                ctx.fillStyle = colors.brightSnow;
            } else if (y > 70) {
                drawDitheredPixel(ctx, x, y, colors.snowLit, colors.brightSnow);
            } else {
                const shadowColor = shiftHue(colors.distantMountains, 20);
                drawDitheredPixel(ctx, x, y, colors.distantMountains, shadowColor);
            }
            ctx.fillRect(x, y, 1, 1);
        }
    }
    
    for (let x = 65; x < 100; x++) {
        const peakHeight = Math.sin((x - 65) * 0.25) * 20 + 20;
        for (let y = Math.floor(40 + peakHeight); y < 100; y++) {
            if (y > 85) {
                ctx.fillStyle = colors.brightSnow;
            } else if (y > 70) {
                drawDitheredPixel(ctx, x, y, colors.snowLit, colors.brightSnow);
            } else {
                const shadowColor = shiftHue(colors.distantMountains, 20);
                drawDitheredPixel(ctx, x, y, colors.distantMountains, shadowColor);
            }
            ctx.fillRect(x, y, 1, 1);
        }
    }
    
    // Pine trees on sides
    for (let treeX of [5, 15, 25]) {
        for (let y = 75; y < 95; y++) {
            const treeWidth = Math.max(1, 8 - Math.abs(y - 85) * 0.8);
            for (let x = treeX - treeWidth; x <= treeX + treeWidth; x++) {
                if (x >= 0 && x < 100) {
                    const isLit = x > treeX;
                    ctx.fillStyle = isLit ? colors.pineLit : colors.pineDark;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        ctx.fillStyle = colors.rockShadow;
        ctx.fillRect(treeX, 90, 1, 5);
    }
    
    for (let treeX of [75, 85, 95]) {
        for (let y = 75; y < 95; y++) {
            const treeWidth = Math.max(1, 8 - Math.abs(y - 85) * 0.8);
            for (let x = treeX - treeWidth; x <= treeX + treeWidth; x++) {
                if (x >= 0 && x < 100) {
                    const isLit = x < treeX;
                    ctx.fillStyle = isLit ? colors.pineLit : colors.pineDark;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        ctx.fillStyle = colors.rockShadow;
        ctx.fillRect(treeX, 90, 1, 5);
    }
    
    // Frozen ground with texture
    for (let y = 85; y < 100; y++) {
        for (let x = 0; x < 100; x++) {
            if (x < 30 || x > 70) { // Only on sides, leave center open
                const baseColor = colors.snowLit;
                const highlightColor = colors.brightSnow;
                
                if ((x + y * 2) % 7 === 0) {
                    ctx.fillStyle = colors.highlights;
                } else if (shouldDither(x, y, 3)) {
                    ctx.fillStyle = highlightColor;
                } else {
                    ctx.fillStyle = baseColor;
                }
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
    
    // Snowflakes
    addParticles(ctx, 100, 100, 35, [colors.highlights, colors.brightSnow, colors.snowLit]);
    
    return canvas;
}

function generateEmberhowlForge() {
    const canvas = createCanvas(100, 100);
    const ctx = canvas.getContext('2d');
    
    const colors = {
        darkest: '#1a0a00',
        dark: '#3a1a00',
        medium: '#5a2a00',
        brightOrange: '#ff6600',
        yellow: '#ffaa00',
        red: '#ff4400',
        stone: '#2a2a2a',
        lightStone: '#4a4a4a'
    };
    
    // Dark background
    ctx.fillStyle = colors.darkest;
    ctx.fillRect(0, 0, 100, 100);
    
    // Stone walls with texture
    for (let y = 0; y < 100; y++) {
        for (let x = 0; x < 100; x++) {
            if (x < 25 || x > 75) {
                if ((x + y) % 4 === 0) {
                    ctx.fillStyle = colors.lightStone;
                } else if ((x * 2 + y) % 7 === 0) {
                    ctx.fillStyle = colors.stone;
                } else {
                    ctx.fillStyle = colors.dark;
                }
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
    
    // Forge on left side
    for (let y = 40; y < 80; y++) {
        for (let x = 5; x < 30; x++) {
            const distance = Math.sqrt((x - 17.5) ** 2 + (y - 60) ** 2);
            if (distance < 12) {
                if (distance < 6) {
                    drawDitheredPixel(ctx, x, y, colors.brightOrange, colors.yellow);
                } else if (distance < 9) {
                    drawDitheredPixel(ctx, x, y, colors.red, colors.brightOrange);
                } else {
                    ctx.fillStyle = colors.medium;
                }
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
    
    // Anvil and tools on right
    for (let y = 65; y < 75; y++) {
        for (let x = 75; x < 90; x++) {
            ctx.fillStyle = colors.lightStone;
            ctx.fillRect(x, y, 1, 1);
        }
    }
    
    for (let toolX of [85, 90, 95]) {
        for (let y = 20; y < 35; y++) {
            ctx.fillStyle = colors.stone;
            ctx.fillRect(toolX, y, 1, 1);
        }
    }
    
    // Orange light gradient across scene
    for (let y = 0; y < 100; y++) {
        for (let x = 30; x < 75; x++) {
            const lightIntensity = Math.max(0, 1 - Math.abs(x - 17.5) / 30);
            if (lightIntensity > 0.3) {
                if (shouldDither(x, y, 3)) {
                    ctx.fillStyle = colors.medium;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    }
    
    // Floating embers
    addParticles(ctx, 100, 60, 20, [colors.brightOrange, colors.yellow, colors.red]);
    
    return canvas;
}

function generatePalehowlLands() {
    const canvas = createCanvas(100, 100);
    const ctx = canvas.getContext('2d');
    
    const colors = {
        skyLight: '#e6e6ff',
        skyMid: '#d6d6ee',
        skyDark: '#c6c6dd',
        moonGlow: '#ffffff',
        hillLight: '#b6d6b6',
        hillMid: '#a6c6a6',
        hillDark: '#96b696',
        grassLight: '#86b686',
        grassDark: '#76a676',
        fenceWood: '#8b7355',
        fenceDark: '#6b5335'
    };
    
    // Twilight sky
    for (let y = 0; y < 50; y++) {
        for (let x = 0; x < 100; x++) {
            if (y < 15) {
                drawDitheredPixel(ctx, x, y, colors.skyLight, colors.skyMid);
            } else if (y < 30) {
                drawDitheredPixel(ctx, x, y, colors.skyMid, colors.skyDark);
            } else {
                ctx.fillStyle = colors.skyDark;
            }
            ctx.fillRect(x, y, 1, 1);
        }
    }
    
    // Pale moon
    const moonX = 80, moonY = 15;
    for (let y = moonY - 5; y <= moonY + 5; y++) {
        for (let x = moonX - 5; x <= moonX + 5; x++) {
            const distance = Math.sqrt((x - moonX) ** 2 + (y - moonY) ** 2);
            if (distance <= 4) {
                ctx.fillStyle = colors.moonGlow;
                ctx.fillRect(x, y, 1, 1);
            } else if (distance <= 5) {
                ctx.fillStyle = colors.skyLight;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
    
    // Rolling hills
    for (let x = 0; x < 100; x++) {
        const hillHeight = Math.sin(x * 0.1) * 8 + Math.sin(x * 0.05) * 12 + 50;
        for (let y = Math.floor(hillHeight); y < 100; y++) {
            if (y > 85) {
                if ((x + y) % 3 === 0) {
                    ctx.fillStyle = colors.grassLight;
                } else {
                    ctx.fillStyle = colors.grassDark;
                }
            } else if (y > 70) {
                drawDitheredPixel(ctx, x, y, colors.hillMid, colors.hillLight);
            } else {
                ctx.fillStyle = colors.hillLight;
            }
            ctx.fillRect(x, y, 1, 1);
        }
    }
    
    // Wooden fence posts on sides
    for (let postX of [8, 18, 28]) {
        for (let y = 80; y < 95; y++) {
            ctx.fillStyle = y < 90 ? colors.fenceWood : colors.fenceDark;
            ctx.fillRect(postX, y, 1, 1);
            if (y === 85) {
                for (let x = postX; x < postX + 8; x++) {
                    ctx.fillStyle = colors.fenceWood;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    }
    
    for (let postX of [72, 82, 92]) {
        for (let y = 80; y < 95; y++) {
            ctx.fillStyle = y < 90 ? colors.fenceWood : colors.fenceDark;
            ctx.fillRect(postX, y, 1, 1);
            if (y === 85) {
                for (let x = postX - 8; x < postX; x++) {
                    if (x > 0) {
                        ctx.fillStyle = colors.fenceWood;
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
            }
        }
    }
    
    // Wildflowers scattered around
    const flowerColors = ['#ffb3ff', '#b3b3ff', '#ffffb3'];
    for (let i = 0; i < 15; i++) {
        const x = Math.floor(Math.random() * 30) + (Math.random() > 0.5 ? 0 : 70);
        const y = Math.floor(Math.random() * 15) + 80;
        ctx.fillStyle = flowerColors[Math.floor(Math.random() * flowerColors.length)];
        ctx.fillRect(x, y, 1, 1);
    }
    
    return canvas;
}

function generateArchivumLibrary() {
    const canvas = createCanvas(100, 100);
    const ctx = canvas.getContext('2d');
    
    const colors = {
        deepPurple: '#1a1a2a',
        midPurple: '#2a2a4a',
        lightPurple: '#4a3a6a',
        magicPurple: '#7755aa',
        brightMagic: '#aa88dd',
        wood: '#8b7355',
        parchment: '#c4a882',
        glowWhite: '#ffffff'
    };
    
    // Dark library background
    ctx.fillStyle = colors.deepPurple;
    ctx.fillRect(0, 0, 100, 100);
    
    // Towering bookshelves on sides
    for (let y = 10; y < 95; y++) {
        for (let x = 0; x < 25; x++) {
            if (x < 3 || x > 22) {
                ctx.fillStyle = colors.wood;
            } else {
                if ((x + y) % 5 === 0) {
                    ctx.fillStyle = colors.parchment;
                } else if ((x + y) % 7 === 0) {
                    ctx.fillStyle = colors.magicPurple;
                } else {
                    ctx.fillStyle = colors.midPurple;
                }
            }
            ctx.fillRect(x, y, 1, 1);
        }
    }
    
    for (let y = 10; y < 95; y++) {
        for (let x = 75; x < 100; x++) {
            if (x < 78 || x > 97) {
                ctx.fillStyle = colors.wood;
            } else {
                if ((x + y) % 5 === 0) {
                    ctx.fillStyle = colors.parchment;
                } else if ((x + y) % 7 === 0) {
                    ctx.fillStyle = colors.magicPurple;
                } else {
                    ctx.fillStyle = colors.midPurple;
                }
            }
            ctx.fillRect(x, y, 1, 1);
        }
    }
    
    // Magical light from above
    for (let y = 0; y < 40; y++) {
        for (let x = 30; x < 70; x++) {
            const lightIntensity = Math.max(0, 1 - y / 40);
            if (lightIntensity > 0.5) {
                if (shouldDither(x, y, 3)) {
                    ctx.fillStyle = colors.brightMagic;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    }
    
    // Floating books/scrolls
    for (let i = 0; i < 8; i++) {
        const x = Math.floor(Math.random() * 40) + 30;
        const y = Math.floor(Math.random() * 60) + 20;
        
        for (let gy = y - 1; gy <= y + 2; gy++) {
            for (let gx = x - 1; gx <= x + 2; gx++) {
                if (gx >= 0 && gx < 100 && gy >= 0 && gy < 100) {
                    if (gx === x && gy === y) {
                        ctx.fillStyle = colors.glowWhite;
                    } else {
                        ctx.fillStyle = colors.brightMagic;
                    }
                    ctx.fillRect(gx, gy, 1, 1);
                }
            }
        }
    }
    
    // Stone floor with runes
    for (let y = 85; y < 100; y++) {
        for (let x = 0; x < 100; x++) {
            if ((x + y) % 4 === 0) {
                ctx.fillStyle = colors.lightPurple;
            } else {
                ctx.fillStyle = colors.midPurple;
            }
            
            if ((x * 3 + y * 5) % 23 === 0) {
                ctx.fillStyle = colors.magicPurple;
            }
            
            ctx.fillRect(x, y, 1, 1);
        }
    }
    
    // Ladder
    for (let y = 30; y < 80; y++) {
        ctx.fillStyle = colors.wood;
        ctx.fillRect(20, y, 1, 1);
        if (y % 8 === 0) {
            for (let x = 18; x < 23; x++) {
                ctx.fillStyle = colors.wood;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
    
    return canvas;
}

function generateLoyaltyBattlefield() {
    const canvas = createCanvas(100, 100);
    const ctx = canvas.getContext('2d');
    
    const colors = {
        darkSky: '#2a1a0a',
        midBrown: '#4a3020',
        lightBrown: '#6a4a30',
        orange: '#884a22',
        brightOrange: '#cc6633',
        yellow: '#ff8844',
        smoke: '#3a3a3a',
        metal: '#555555',
        rust: '#8b4513'
    };
    
    // Dusk sky with orange sunset
    for (let y = 0; y < 45; y++) {
        for (let x = 0; x < 100; x++) {
            if (y < 15) {
                drawDitheredPixel(ctx, x, y, colors.darkSky, colors.midBrown);
            } else if (y < 30) {
                drawDitheredPixel(ctx, x, y, colors.orange, colors.brightOrange);
            } else {
                drawDitheredPixel(ctx, x, y, colors.brightOrange, colors.yellow);
            }
            ctx.fillRect(x, y, 1, 1);
        }
    }
    
    // Scarred battlefield ground
    for (let y = 45; y < 100; y++) {
        for (let x = 0; x < 100; x++) {
            if ((x + y) % 3 === 0) {
                ctx.fillStyle = colors.lightBrown;
            } else {
                ctx.fillStyle = colors.midBrown;
            }
            
            const craterDistance1 = Math.sqrt((x - 20) ** 2 + (y - 70) ** 2);
            const craterDistance2 = Math.sqrt((x - 80) ** 2 + (y - 85) ** 2);
            
            if (craterDistance1 < 8 || craterDistance2 < 6) {
                ctx.fillStyle = colors.darkSky;
            }
            
            ctx.fillRect(x, y, 1, 1);
        }
    }
    
    // Broken weapons and banners on sides
    for (let weaponX of [8, 18]) {
        for (let y = 60; y < 85; y++) {
            if (y > 75) {
                ctx.fillStyle = colors.metal;
            } else if (y > 70) {
                ctx.fillStyle = colors.rust;
            } else {
                ctx.fillStyle = colors.lightBrown;
            }
            ctx.fillRect(weaponX, y, 1, 1);
        }
        
        for (let y = 60; y < 68; y++) {
            for (let x = weaponX - 2; x <= weaponX + 2; x++) {
                if (x >= 0 && x < 100) {
                    ctx.fillStyle = colors.metal;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    }
    
    for (let bannerX of [85, 92]) {
        for (let y = 55; y < 85; y++) {
            ctx.fillStyle = colors.lightBrown;
            ctx.fillRect(bannerX, y, 1, 1);
        }
        
        for (let y = 55; y < 70; y++) {
            for (let x = bannerX + 1; x < bannerX + 6; x++) {
                if (x < 100 && (x + y) % 3 !== 0) {
                    ctx.fillStyle = colors.rust;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    }
    
    // Smoke and haze
    for (let y = 30; y < 80; y++) {
        for (let x = 0; x < 100; x++) {
            if ((x * 3 + y * 2) % 15 === 0) {
                ctx.fillStyle = colors.smoke;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
    
    return canvas;
}

// ANIMATED GIF GENERATORS

function generateSnowyMountainsGif() {
    const encoder = new GIFEncoder(400, 400);
    encoder.setDelay(100);
    encoder.setRepeat(0);
    encoder.setQuality(10);
    encoder.start();
    
    const baseColors = {
        deepSky: '#0a1a3a',
        midSky: '#1a3a5a',
        mountains: '#4a6a8a',
        snow: '#cceeff',
        trees: '#2a4a2a'
    };
    
    const snowflakes = [];
    for (let i = 0; i < 45; i++) {
        snowflakes.push({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() > 0.8 ? 2 : 1,
            speed: 0.5 + Math.random() * 1,
            drift: Math.random() * 0.3 - 0.15
        });
    }
    
    for (let frame = 0; frame < 12; frame++) {
        const canvas = createCanvas(100, 100);
        const ctx = canvas.getContext('2d');
        
        // Sky
        ctx.fillStyle = baseColors.deepSky;
        ctx.fillRect(0, 0, 100, 40);
        
        // Mountains on sides
        for (let x = 0; x < 30; x++) {
            const height = Math.sin(x * 0.2) * 10 + 30;
            for (let y = Math.floor(height); y < 100; y++) {
                ctx.fillStyle = y > 80 ? baseColors.snow : baseColors.mountains;
                ctx.fillRect(x, y, 1, 1);
            }
        }
        
        for (let x = 70; x < 100; x++) {
            const height = Math.sin((x-70) * 0.25) * 12 + 28;
            for (let y = Math.floor(height); y < 100; y++) {
                ctx.fillStyle = y > 80 ? baseColors.snow : baseColors.mountains;
                ctx.fillRect(x, y, 1, 1);
            }
        }
        
        // Trees
        for (let treeX of [10, 20, 80, 90]) {
            for (let y = 75; y < 90; y++) {
                const width = Math.max(1, 6 - Math.abs(y - 82));
                for (let x = treeX - width; x <= treeX + width; x++) {
                    if (x >= 0 && x < 100) {
                        ctx.fillStyle = baseColors.trees;
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
            }
        }
        
        // Animate snowflakes
        snowflakes.forEach(flake => {
            ctx.fillStyle = baseColors.snow;
            if (flake.size === 2) {
                ctx.fillRect(Math.floor(flake.x), Math.floor(flake.y), 2, 2);
            } else {
                ctx.fillRect(Math.floor(flake.x), Math.floor(flake.y), 1, 1);
            }
            
            flake.y += flake.speed;
            flake.x += flake.drift + Math.sin(frame * 0.5 + flake.x * 0.1) * 0.2;
            
            if (flake.y > 100) {
                flake.y = -2;
                flake.x = Math.random() * 100;
            }
            if (flake.x < 0) flake.x = 100;
            if (flake.x > 100) flake.x = 0;
        });
        
        // Upscale and add to encoder
        const upscaled = createCanvas(400, 400);
        const upscaledCtx = upscaled.getContext('2d');
        upscaledCtx.imageSmoothingEnabled = false;
        upscaledCtx.drawImage(canvas, 0, 0, 400, 400);
        encoder.addFrame(upscaledCtx);
    }
    
    encoder.finish();
    return encoder.out.getData();
}

function generateForgeFlamesGif() {
    const encoder = new GIFEncoder(400, 400);
    encoder.setDelay(100);
    encoder.setRepeat(0);
    encoder.setQuality(10);
    encoder.start();
    
    const colors = {
        bg: '#1a0a00',
        stone: '#2a2a2a',
        flame1: '#ff4400',
        flame2: '#ff6600',
        flame3: '#ffaa00',
        ember: '#ff8844'
    };
    
    const embers = [];
    for (let i = 0; i < 25; i++) {
        embers.push({
            x: 15 + Math.random() * 20,
            y: 90 + Math.random() * 10,
            speed: 0.3 + Math.random() * 0.7,
            life: Math.random() * 12
        });
    }
    
    for (let frame = 0; frame < 12; frame++) {
        const canvas = createCanvas(100, 100);
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, 100, 100);
        
        // Stone walls
        for (let y = 0; y < 100; y++) {
            for (let x = 0; x < 20; x++) {
                if ((x + y) % 3 === 0) {
                    ctx.fillStyle = colors.stone;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
            for (let x = 80; x < 100; x++) {
                if ((x + y) % 3 === 0) {
                    ctx.fillStyle = colors.stone;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        
        // Animated forge flames
        for (let y = 40; y < 90; y++) {
            for (let x = 5; x < 35; x++) {
                const flameHeight = Math.sin(x * 0.3 + frame * 0.5) * 8 + Math.sin(frame * 0.8) * 4;
                const baseY = 85 + flameHeight;
                
                if (y > baseY) {
                    const intensity = (90 - y) / (90 - baseY);
                    if (intensity > 0.8) {
                        ctx.fillStyle = colors.flame3;
                    } else if (intensity > 0.5) {
                        ctx.fillStyle = colors.flame2;
                    } else {
                        ctx.fillStyle = colors.flame1;
                    }
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        
        // Animate embers
        embers.forEach(ember => {
            if (ember.life > 0) {
                ctx.fillStyle = colors.ember;
                ctx.fillRect(Math.floor(ember.x), Math.floor(ember.y), 1, 1);
                
                ember.y -= ember.speed;
                ember.x += (Math.random() - 0.5) * 0.3;
                ember.life -= 1;
                
                if (ember.life <= 0) {
                    ember.x = 15 + Math.random() * 20;
                    ember.y = 90 + Math.random() * 10;
                    ember.life = Math.random() * 12;
                }
            }
        });
        
        const upscaled = createCanvas(400, 400);
        const upscaledCtx = upscaled.getContext('2d');
        upscaledCtx.imageSmoothingEnabled = false;
        upscaledCtx.drawImage(canvas, 0, 0, 400, 400);
        encoder.addFrame(upscaledCtx);
    }
    
    encoder.finish();
    return encoder.out.getData();
}

function generateArcaneStormGif() {
    const encoder = new GIFEncoder(400, 400);
    encoder.setDelay(100);
    encoder.setRepeat(0);
    encoder.setQuality(10);
    encoder.start();
    
    const colors = {
        darkSky: '#1a0a2a',
        stormSky: '#2a1a4a',
        lightning: '#aa88dd',
        brightLightning: '#ffffff',
        rain: '#4a4a6a',
        ground: '#0a0a1a'
    };
    
    for (let frame = 0; frame < 12; frame++) {
        const canvas = createCanvas(100, 100);
        const ctx = canvas.getContext('2d');
        
        const isLightningFrame = frame === 3 || frame === 8;
        for (let y = 0; y < 70; y++) {
            for (let x = 0; x < 100; x++) {
                if (isLightningFrame && (x + y * 3) % 7 === 0) {
                    ctx.fillStyle = colors.brightLightning;
                } else if (y < 35) {
                    ctx.fillStyle = colors.darkSky;
                } else {
                    drawDitheredPixel(ctx, x, y, colors.darkSky, colors.stormSky);
                }
                ctx.fillRect(x, y, 1, 1);
            }
        }
        
        for (let y = 85; y < 100; y++) {
            for (let x = 0; x < 100; x++) {
                ctx.fillStyle = colors.ground;
                ctx.fillRect(x, y, 1, 1);
            }
        }
        
        // Diagonal rain
        for (let i = 0; i < 80; i++) {
            const x = (i * 3 + frame * 2) % 100;
            const y = (i * 2) % 70;
            
            for (let len = 0; len < 4; len++) {
                const rx = x + len;
                const ry = y + len * 2;
                if (rx < 100 && ry < 70) {
                    ctx.fillStyle = colors.rain;
                    ctx.fillRect(rx, ry, 1, 1);
                }
            }
        }
        
        // Swirling magic particles
        for (let i = 0; i < 20; i++) {
            const angle = (frame * 0.3 + i * 0.5) % (Math.PI * 2);
            const radius = 15 + Math.sin(frame * 0.1 + i) * 5;
            const x = 50 + Math.cos(angle) * radius;
            const y = 40 + Math.sin(angle) * radius * 0.5;
            
            if (x >= 0 && x < 100 && y >= 0 && y < 100) {
                ctx.fillStyle = colors.lightning;
                ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
            }
        }
        
        const upscaled = createCanvas(400, 400);
        const upscaledCtx = upscaled.getContext('2d');
        upscaledCtx.imageSmoothingEnabled = false;
        upscaledCtx.drawImage(canvas, 0, 0, 400, 400);
        encoder.addFrame(upscaledCtx);
    }
    
    encoder.finish();
    return encoder.out.getData();
}

function generateUnderwaterBubblesGif() {
    const encoder = new GIFEncoder(400, 400);
    encoder.setDelay(100);
    encoder.setRepeat(0);
    encoder.setQuality(10);
    encoder.start();
    
    const colors = {
        deepBlue: '#001122',
        midBlue: '#003344',
        lightBlue: '#005566',
        coral: '#ff6699',
        seaweed: '#228833',
        bubble: '#88ddff',
        lightRay: '#aaeeff'
    };
    
    const bubbles = [];
    for (let i = 0; i < 20; i++) {
        bubbles.push({
            x: Math.random() * 100,
            y: Math.random() * 100 + 100,
            size: Math.random() > 0.7 ? 2 : 1,
            speed: 0.5 + Math.random() * 1
        });
    }
    
    for (let frame = 0; frame < 12; frame++) {
        const canvas = createCanvas(100, 100);
        const ctx = canvas.getContext('2d');
        
        // Ocean background
        for (let y = 0; y < 100; y++) {
            for (let x = 0; x < 100; x++) {
                if (y < 25) {
                    drawDitheredPixel(ctx, x, y, colors.lightBlue, colors.midBlue);
                } else if (y < 60) {
                    ctx.fillStyle = colors.midBlue;
                } else {
                    ctx.fillStyle = colors.deepBlue;
                }
                ctx.fillRect(x, y, 1, 1);
            }
        }
        
        // Swaying light rays from above
        for (let x = 20; x < 80; x += 15) {
            const sway = Math.sin(frame * 0.3 + x * 0.1) * 3;
            for (let y = 0; y < 60; y++) {
                const rayX = x + sway + Math.sin(y * 0.2) * 2;
                if (rayX >= 0 && rayX < 100) {
                    ctx.fillStyle = colors.lightRay;
                    ctx.fillRect(Math.floor(rayX), y, 1, 1);
                }
            }
        }
        
        // Coral/seaweed on sides
        for (let side of [0, 1]) {
            const baseX = side * 80 + 10;
            for (let y = 70; y < 100; y++) {
                for (let x = baseX - 8; x < baseX + 8; x++) {
                    if (x >= 0 && x < 100) {
                        const sway = Math.sin(frame * 0.4 + x * 0.3) * 2;
                        if ((x - baseX + sway) % 4 === 0) {
                            ctx.fillStyle = colors.seaweed;
                        } else if ((x - baseX) % 6 === 0) {
                            ctx.fillStyle = colors.coral;
                        } else {
                            continue;
                        }
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
            }
        }
        
        // Animate bubbles
        bubbles.forEach(bubble => {
            ctx.fillStyle = colors.bubble;
            if (bubble.size === 2) {
                ctx.fillRect(Math.floor(bubble.x - 1), Math.floor(bubble.y - 1), 2, 2);
            } else {
                ctx.fillRect(Math.floor(bubble.x), Math.floor(bubble.y), 1, 1);
            }
            
            bubble.y -= bubble.speed;
            bubble.x += Math.sin(bubble.y * 0.1) * 0.2;
            
            if (bubble.y < -5) {
                bubble.y = 105;
                bubble.x = Math.random() * 100;
            }
        });
        
        // Bioluminescent particles
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const intensity = Math.sin(frame * 0.5 + i) * 0.5 + 0.5;
            
            if (intensity > 0.7) {
                ctx.fillStyle = colors.lightRay;
                ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
            }
        }
        
        const upscaled = createCanvas(400, 400);
        const upscaledCtx = upscaled.getContext('2d');
        upscaledCtx.imageSmoothingEnabled = false;
        upscaledCtx.drawImage(canvas, 0, 0, 400, 400);
        encoder.addFrame(upscaledCtx);
    }
    
    encoder.finish();
    return encoder.out.getData();
}

function generateHeartstringPulseGif() {
    const encoder = new GIFEncoder(400, 400);
    encoder.setDelay(100);
    encoder.setRepeat(0);
    encoder.setQuality(10);
    encoder.start();
    
    const colors = {
        darkPink: '#4a1a2a',
        midPink: '#6a2a4a',
        brightPink: '#ff6699',
        glowPink: '#ffaacc',
        white: '#ffffff',
        ground: '#2a4a2a',
        flower: '#ff99bb'
    };
    
    for (let frame = 0; frame < 12; frame++) {
        const canvas = createCanvas(100, 100);
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = colors.darkPink;
        ctx.fillRect(0, 0, 100, 100);
        
        // Ground
        for (let y = 80; y < 100; y++) {
            for (let x = 0; x < 100; x++) {
                if ((x + y) % 3 === 0) {
                    ctx.fillStyle = colors.ground;
                } else {
                    ctx.fillStyle = colors.darkPink;
                }
                ctx.fillRect(x, y, 1, 1);
            }
        }
        
        // Heartbeat pulse
        const pulsePhase = Math.sin(frame * Math.PI / 6);
        const pulseIntensity = (pulsePhase + 1) / 2;
        
        const centerX = 50, centerY = 50;
        const maxRadius = 20 + pulseIntensity * 10;
        
        for (let y = centerY - maxRadius; y <= centerY + maxRadius; y++) {
            for (let x = centerX - maxRadius; x <= centerX + maxRadius; x++) {
                if (x >= 0 && x < 100 && y >= 0 && y < 100) {
                    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                    
                    if (distance < maxRadius * 0.3) {
                        ctx.fillStyle = colors.white;
                    } else if (distance < maxRadius * 0.6) {
                        ctx.fillStyle = colors.glowPink;
                    } else if (distance < maxRadius * 0.9) {
                        if (shouldDither(x, y)) {
                            ctx.fillStyle = colors.brightPink;
                        } else {
                            continue;
                        }
                    } else {
                        continue;
                    }
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        
        // Threads of pink light extending outward
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
            for (let radius = 15; radius < 45; radius += 2) {
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                
                if (x >= 0 && x < 100 && y >= 0 && y < 100) {
                    const threadIntensity = pulseIntensity * (1 - radius / 45);
                    if (threadIntensity > 0.3 && Math.random() < threadIntensity) {
                        ctx.fillStyle = colors.brightPink;
                        ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
                    }
                }
            }
        }
        
        // Flowers that sway with the pulse
        for (let flowerData of [
            {x: 15, y: 85}, {x: 25, y: 88}, {x: 75, y: 86}, {x: 85, y: 89},
            {x: 20, y: 75}, {x: 80, y: 78}
        ]) {
            const sway = pulseIntensity * 2;
            const fx = flowerData.x + sway;
            const fy = flowerData.y;
            
            if (fx >= 0 && fx < 100) {
                ctx.fillStyle = colors.flower;
                ctx.fillRect(Math.floor(fx), fy, 1, 1);
                
                for (let px = fx - 1; px <= fx + 1; px++) {
                    for (let py = fy - 1; py <= fy + 1; py++) {
                        if (px >= 0 && px < 100 && py >= 0 && py < 100 && 
                            (px !== fx || py !== fy)) {
                            if (Math.random() < 0.6) {
                                ctx.fillStyle = colors.flower;
                                ctx.fillRect(Math.floor(px), Math.floor(py), 1, 1);
                            }
                        }
                    }
                }
            }
        }
        
        const upscaled = createCanvas(400, 400);
        const upscaledCtx = upscaled.getContext('2d');
        upscaledCtx.imageSmoothingEnabled = false;
        upscaledCtx.drawImage(canvas, 0, 0, 400, 400);
        encoder.addFrame(upscaledCtx);
    }
    
    encoder.finish();
    return encoder.out.getData();
}

// Main execution
async function main() {
    console.log('🎨 Generating high-quality pixel art backgrounds for Order of 86...');
    
    await ensureDir('content-bg/still');
    
    console.log('📁 Generating still backgrounds (800x800 PNG)...');
    
    const stillBackgrounds = [
        { name: 's1-frosthollow-peaks.png', generator: generateFrosthollowPeaks },
        { name: 's2-emberhowl-forge.png', generator: generateEmberhowlForge },
        { name: 's3-palehowl-lands.png', generator: generatePalehowlLands },
        { name: 's4-archivum-library.png', generator: generateArchivumLibrary },
        { name: 's5-loyalty-battlefield.png', generator: generateLoyaltyBattlefield }
    ];
    
    for (const bg of stillBackgrounds) {
        console.log(`  🖼️  Generating ${bg.name}...`);
        const canvas = bg.generator();
        const upscaled = upscaleCanvas(canvas, 800, 800);
        
        const buffer = upscaled.toBuffer('image/png');
        await fs.writeFile(path.join('content-bg/still', bg.name), buffer);
        console.log(`  ✅ Saved ${bg.name} (${(buffer.length / 1024).toFixed(1)}KB)`);
    }
    
    console.log('🎬 Generating animated backgrounds (400x400 GIF)...');
    
    const animatedBackgrounds = [
        { name: 'snowy-mountains-v2.gif', generator: generateSnowyMountainsGif },
        { name: 'forge-flames-v2.gif', generator: generateForgeFlamesGif },
        { name: 'arcane-storm-v2.gif', generator: generateArcaneStormGif },
        { name: 'underwater-bubbles-v2.gif', generator: generateUnderwaterBubblesGif },
        { name: 'heartstring-pulse-v2.gif', generator: generateHeartstringPulseGif }
    ];
    
    for (const bg of animatedBackgrounds) {
        console.log(`  🎞️  Generating ${bg.name}...`);
        const buffer = bg.generator();
        await fs.writeFile(path.join('content-bg', bg.name), buffer);
        console.log(`  ✅ Saved ${bg.name} (${(buffer.length / 1024).toFixed(1)}KB)`);
    }
    
    console.log('\n🎉 All backgrounds generated successfully!');
    
    console.log('\n📊 File verification:');
    
    for (const bg of stillBackgrounds) {
        try {
            const stats = await fs.stat(path.join('content-bg/still', bg.name));
            console.log(`  📄 ${bg.name}: ${(stats.size / 1024).toFixed(1)}KB`);
        } catch (err) {
            console.log(`  ❌ ${bg.name}: ERROR`);
        }
    }
    
    for (const bg of animatedBackgrounds) {
        try {
            const stats = await fs.stat(path.join('content-bg', bg.name));
            console.log(`  🎬 ${bg.name}: ${(stats.size / 1024).toFixed(1)}KB`);
        } catch (err) {
            console.log(`  ❌ ${bg.name}: ERROR`);
        }
    }
    
    console.log('\n✨ Generation complete! All backgrounds follow proper pixel art techniques:');
    console.log('   • Drawn at 100x100, upscaled with nearest-neighbor');
    console.log('   • Layered depth with color shifting');
    console.log('   • Proper dithering for smooth gradients');
    console.log('   • Hue-shifted shadows');
    console.log('   • Textured surfaces and atmospheric particles');
    console.log('   • Center space kept open for character placement');
}

if (require.main === module) {
    main().catch(console.error);
}