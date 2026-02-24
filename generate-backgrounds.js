const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Ensure output directory exists
const outputDir = path.join(__dirname, 'content-bg', 'still');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Color palettes for different themes
const colors = {
    flame: ['#ff4500', '#ff6b1a', '#ff8533', '#cc3600', '#b32800', '#991f00'],
    wild: ['#228b22', '#32a532', '#42bf42', '#1a6b1a', '#145214', '#0e390e'],
    arcane: ['#7b54c9', '#9970d9', '#b78ce9', '#5c3f96', '#432a6b', '#2a1540'],
    deep: ['#1e90ff', '#4aa3ff', '#76b6ff', '#1670cc', '#0e4f99', '#062e66'],
    radiant: ['#ffd700', '#ffdf33', '#ffe766', '#ccac00', '#998100', '#665600'],
    heart: ['#c55bb7', '#d575c7', '#e58fd7', '#9e4693', '#76346f', '#4e224b'],
    palehowl: ['#e8e8e8', '#d0d0d0', '#b8b8b8', '#a0a0a0', '#888888', '#707070'],
    neutral: ['#8b7355', '#a0865f', '#b59969', '#70583f', '#55412a', '#3a2a15']
};

// Utility functions
function hslToRgb(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }

    return [
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255)
    ];
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [0, 0, 0];
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function lerpColor(color1, color2, t) {
    const [r1, g1, b1] = hexToRgb(color1);
    const [r2, g2, b2] = hexToRgb(color2);
    return rgbToHex(
        Math.round(lerp(r1, r2, t)),
        Math.round(lerp(g1, g2, t)),
        Math.round(lerp(b1, b2, t))
    );
}

function dither50(x, y) {
    return (x + y) % 2 === 0;
}

function dither33(x, y) {
    return (x + y) % 3 === 0;
}

function addShadow(baseColor, isCool = false) {
    const [r, g, b] = hexToRgb(baseColor);
    if (isCool) {
        return rgbToHex(
            Math.max(0, r - 40),
            Math.max(0, g - 20),
            Math.min(255, b + 20)
        );
    } else {
        return rgbToHex(
            Math.min(255, r + 20),
            Math.max(0, g - 20),
            Math.max(0, b - 40)
        );
    }
}

// Background generation functions
function drawBackground(name, drawFunc) {
    console.log(`Generating ${name}...`);
    
    // Create base canvas at 200x200
    const baseCanvas = createCanvas(200, 200);
    const baseCtx = baseCanvas.getContext('2d');
    
    // Create imageData for pixel-perfect drawing
    const imageData = baseCtx.createImageData(200, 200);
    const data = imageData.data;
    
    // Initialize with transparent pixels
    for (let i = 0; i < data.length; i += 4) {
        data[i + 3] = 255; // Alpha
    }
    
    // Draw the background
    drawFunc(data);
    
    // Put image data
    baseCtx.putImageData(imageData, 0, 0);
    
    // Create upscaled canvas at 1600x1600
    const finalCanvas = createCanvas(1600, 1600);
    const finalCtx = finalCanvas.getContext('2d');
    
    // Disable smoothing for nearest-neighbor upscaling
    finalCtx.imageSmoothingEnabled = false;
    
    // Draw upscaled
    finalCtx.drawImage(baseCanvas, 0, 0, 1600, 1600);
    
    // Save as PNG
    const buffer = finalCanvas.toBuffer('image/png');
    const filename = path.join(outputDir, `${name}.png`);
    fs.writeFileSync(filename, buffer);
    
    console.log(`✓ ${name}.png (${Math.round(buffer.length / 1024)}KB)`);
}

function setPixel(data, x, y, color) {
    if (x >= 0 && x < 200 && y >= 0 && y < 200) {
        const [r, g, b] = hexToRgb(color);
        const index = (y * 200 + x) * 4;
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = 255;
    }
}

function drawGradientRect(data, x1, y1, x2, y2, color1, color2, vertical = true) {
    for (let x = x1; x < x2; x++) {
        for (let y = y1; y < y2; y++) {
            const t = vertical ? (y - y1) / (y2 - y1) : (x - x1) / (x2 - x1);
            const color = lerpColor(color1, color2, t);
            setPixel(data, x, y, color);
        }
    }
}

function addParticles(data, count, color, minY = 0, maxY = 200) {
    for (let i = 0; i < count; i++) {
        const x = Math.floor(Math.random() * 200);
        const y = Math.floor(Math.random() * (maxY - minY) + minY);
        setPixel(data, x, y, color);
    }
}

// Background drawing functions
const backgrounds = [
    // CITIES & LANDMARKS
    ['v2-crucible-forge', (data) => {
        // Sky gradient - orange to dark red
        drawGradientRect(data, 0, 0, 200, 80, '#ff4500', '#cc1100');
        
        // Distant mountains
        for (let x = 0; x < 200; x++) {
            const height = 40 + Math.sin(x * 0.1) * 10;
            for (let y = height; y < 80; y++) {
                if (dither50(x, y)) {
                    setPixel(data, x, y, '#661100');
                }
            }
        }
        
        // Buildings on sides (keep center open)
        // Left buildings
        for (let x = 0; x < 60; x++) {
            for (let y = 80; y < 200; y++) {
                const building = Math.floor(x / 15);
                const height = 120 + building * 10;
                if (y > height) {
                    const baseColor = '#554433';
                    if ((x + y) % 4 === 0) {
                        setPixel(data, x, y, '#ff6600'); // Forge glow
                    } else {
                        setPixel(data, x, y, baseColor);
                    }
                }
            }
        }
        
        // Right buildings
        for (let x = 140; x < 200; x++) {
            for (let y = 80; y < 200; y++) {
                const building = Math.floor((x - 140) / 15);
                const height = 110 + building * 15;
                if (y > height) {
                    const baseColor = '#443322';
                    if ((x + y) % 5 === 0) {
                        setPixel(data, x, y, '#ff8800'); // Forge glow
                    } else {
                        setPixel(data, x, y, baseColor);
                    }
                }
            }
        }
        
        // Lava rivers on bottom edges
        for (let x = 0; x < 200; x++) {
            if (x < 50 || x > 150) {
                for (let y = 180; y < 200; y++) {
                    if (dither33(x, y)) {
                        setPixel(data, x, y, '#ff3300');
                    } else {
                        setPixel(data, x, y, '#cc2200');
                    }
                }
            }
        }
        
        // Embers
        addParticles(data, 30, '#ff6600', 0, 160);
        addParticles(data, 20, '#ffaa00', 0, 120);
    }],

    ['v2-aurelius-golden-spires', (data) => {
        // Golden sky
        drawGradientRect(data, 0, 0, 200, 100, '#ffd700', '#ffaa00');
        
        // Sunbeams
        for (let i = 0; i < 5; i++) {
            const centerX = 100 + (i - 2) * 40;
            for (let y = 0; y < 100; y++) {
                for (let x = centerX - y/3; x < centerX + y/3; x++) {
                    if (x >= 0 && x < 200 && dither33(x, y)) {
                        setPixel(data, x, y, '#ffff88');
                    }
                }
            }
        }
        
        // Golden spires on sides
        // Left spires
        for (let s = 0; s < 3; s++) {
            const spireX = 10 + s * 20;
            const height = 60 + s * 20;
            for (let y = height; y < 200; y++) {
                for (let x = spireX; x < spireX + 12; x++) {
                    if (y > 100 + (x - spireX) * 2) {
                        setPixel(data, x, y, '#ccaa00');
                        if (dither50(x, y)) {
                            setPixel(data, x, y, '#ffdd22');
                        }
                    }
                }
            }
        }
        
        // Right spires
        for (let s = 0; s < 3; s++) {
            const spireX = 150 + s * 15;
            const height = 50 + s * 25;
            for (let y = height; y < 200; y++) {
                for (let x = spireX; x < spireX + 10; x++) {
                    if (y > 100) {
                        setPixel(data, x, y, '#b39900');
                        if (dither50(x, y)) {
                            setPixel(data, x, y, '#e6cc00');
                        }
                    }
                }
            }
        }
        
        // Golden ground
        for (let x = 0; x < 200; x++) {
            for (let y = 170; y < 200; y++) {
                const t = (y - 170) / 30.0;
                const color = lerpColor('#ffdd00', '#cc9900', t);
                setPixel(data, x, y, color);
            }
        }
        
        // Light particles
        addParticles(data, 40, '#ffff99', 0, 150);
    }],

    ['v2-stillwater-depths', (data) => {
        // Deep blue water gradient
        drawGradientRect(data, 0, 0, 200, 200, '#003366', '#001122');
        
        // Light filtering from above
        for (let x = 80; x < 120; x++) {
            for (let y = 0; y < 100; y++) {
                const intensity = 1.0 - (y / 100.0);
                if (Math.random() < intensity * 0.3) {
                    setPixel(data, x, y, '#0066cc');
                }
            }
        }
        
        // Coral structures on sides
        // Left coral
        for (let x = 0; x < 50; x++) {
            for (let y = 100; y < 200; y++) {
                const coralHeight = 150 + Math.sin(x * 0.2) * 20 + Math.cos(y * 0.1) * 10;
                if (y > coralHeight) {
                    if (dither50(x, y)) {
                        setPixel(data, x, y, '#cc66aa');
                    } else {
                        setPixel(data, x, y, '#aa4488');
                    }
                }
            }
        }
        
        // Right coral
        for (let x = 150; x < 200; x++) {
            for (let y = 120; y < 200; y++) {
                const coralHeight = 160 + Math.sin(x * 0.15) * 15;
                if (y > coralHeight) {
                    if (dither33(x, y)) {
                        setPixel(data, x, y, '#66ccaa');
                    } else {
                        setPixel(data, x, y, '#448866');
                    }
                }
            }
        }
        
        // Underwater architecture fragments
        for (let x = 60; x < 80; x++) {
            for (let y = 160; y < 200; y++) {
                setPixel(data, x, y, '#445566');
            }
        }
        
        for (let x = 120; x < 140; x++) {
            for (let y = 150; y < 200; y++) {
                setPixel(data, x, y, '#334455');
            }
        }
        
        // Bioluminescent particles
        addParticles(data, 35, '#00ffcc', 50, 200);
        addParticles(data, 25, '#0088ff', 0, 150);
    }],

    ['v2-roothold-canopy', (data) => {
        // Green canopy gradient
        drawGradientRect(data, 0, 0, 200, 120, '#228b22', '#0f4f0f');
        
        // Tree trunks on sides (massive)
        // Left trunk
        for (let x = 0; x < 40; x++) {
            for (let y = 0; y < 200; y++) {
                const trunkWidth = 35 - Math.abs(x - 20);
                if (x < trunkWidth && y > 40) {
                    setPixel(data, x, y, '#4d2d1a');
                    if (dither50(x, y)) {
                        setPixel(data, x, y, '#5c3520');
                    }
                }
            }
        }
        
        // Right trunk
        for (let x = 160; x < 200; x++) {
            for (let y = 0; y < 200; y++) {
                const trunkWidth = 35 - Math.abs((x - 160) - 20);
                if ((x - 160) < trunkWidth && y > 30) {
                    setPixel(data, x, y, '#3d1f0f');
                    if (dither33(x, y)) {
                        setPixel(data, x, y, '#4a2515');
                    }
                }
            }
        }
        
        // Hanging bridges (thin lines)
        for (let x = 40; x < 160; x++) {
            if (dither50(x, 80)) {
                setPixel(data, x, 80, '#8b6914');
                setPixel(data, x, 81, '#8b6914');
            }
        }
        
        for (let x = 50; x < 150; x++) {
            if (dither33(x, 120)) {
                setPixel(data, x, 120, '#654c0f');
                setPixel(data, x, 121, '#654c0f');
            }
        }
        
        // Forest floor far below
        for (let x = 0; x < 200; x++) {
            for (let y = 180; y < 200; y++) {
                if (dither50(x, y)) {
                    setPixel(data, x, y, '#1a4a1a');
                } else {
                    setPixel(data, x, y, '#0f330f');
                }
            }
        }
        
        // Leaves falling
        addParticles(data, 30, '#33aa33', 120, 180);
        addParticles(data, 20, '#44bb44', 80, 150);
    }],

    ['v2-archivum-halls', (data) => {
        // Purple corridor perspective
        drawGradientRect(data, 0, 0, 200, 200, '#7b54c9', '#2a1540');
        
        // Corridor walls with perspective
        // Left wall
        for (let y = 0; y < 200; y++) {
            const wallWidth = 30 + (y * 0.3);
            for (let x = 0; x < wallWidth; x++) {
                if (x < 25) {
                    setPixel(data, x, y, '#432a6b');
                    if (dither50(x, y)) {
                        setPixel(data, x, y, '#5c3f96');
                    }
                }
            }
        }
        
        // Right wall
        for (let y = 0; y < 200; y++) {
            const wallWidth = 30 + (y * 0.3);
            for (let x = 200 - wallWidth; x < 200; x++) {
                if (x > 175) {
                    setPixel(data, x, y, '#372358');
                    if (dither33(x, y)) {
                        setPixel(data, x, y, '#4d3070');
                    }
                }
            }
        }
        
        // Floating runes
        const runePositions = [
            {x: 20, y: 50}, {x: 180, y: 70}, {x: 30, y: 120}, {x: 170, y: 140}
        ];
        
        runePositions.forEach(pos => {
            for (let dx = -2; dx <= 2; dx++) {
                for (let dy = -2; dy <= 2; dy++) {
                    if (Math.abs(dx) + Math.abs(dy) <= 2) {
                        setPixel(data, pos.x + dx, pos.y + dy, '#bb88ff');
                    }
                }
            }
        });
        
        // Book stacks on walls
        for (let i = 0; i < 5; i++) {
            const x = 5 + i * 8;
            const y = 100 + i * 15;
            for (let bx = 0; bx < 6; bx++) {
                for (let by = 0; by < 4; by++) {
                    setPixel(data, x + bx, y + by, '#2d1b47');
                }
            }
        }
        
        for (let i = 0; i < 4; i++) {
            const x = 185 - i * 10;
            const y = 90 + i * 20;
            for (let bx = 0; bx < 7; bx++) {
                for (let by = 0; by < 5; by++) {
                    setPixel(data, x + bx, y + by, '#241638');
                }
            }
        }
        
        // Magical particles
        addParticles(data, 25, '#aa77dd', 0, 200);
    }],

    ['v2-bondsheart-gardens', (data) => {
        // Pink sky gradient
        drawGradientRect(data, 0, 0, 200, 100, '#ffb3d9', '#c55bb7');
        
        // Heart-shaped archways on sides
        // Left archway
        for (let x = 0; x < 50; x++) {
            for (let y = 50; y < 150; y++) {
                // Heart shape math
                const centerX = 25;
                const centerY = 100;
                const dx = x - centerX;
                const dy = y - centerY;
                const heart = Math.pow(dx*dx + dy*dy - 400, 3) - dx*dx*dy*dy*dy;
                if (heart < 0 && (x < 10 || x > 40)) {
                    setPixel(data, x, y, '#e68ad6');
                }
            }
        }
        
        // Right archway
        for (let x = 150; x < 200; x++) {
            for (let y = 40; y < 140; y++) {
                const centerX = 175;
                const centerY = 90;
                const dx = x - centerX;
                const dy = y - centerY;
                const heart = Math.pow(dx*dx + dy*dy - 300, 3) - dx*dx*dy*dy*dy;
                if (heart < 0 && (x < 160 || x > 190)) {
                    setPixel(data, x, y, '#d975c7');
                }
            }
        }
        
        // Crystal gardens
        for (let x = 0; x < 200; x++) {
            for (let y = 140; y < 200; y++) {
                const t = (y - 140) / 60.0;
                const color = lerpColor('#ff99cc', '#cc4499', t);
                setPixel(data, x, y, color);
                
                // Crystal formations
                if ((x + y) % 15 === 0) {
                    setPixel(data, x, y, '#ffccee');
                    setPixel(data, x, y-1, '#ffccee');
                }
            }
        }
        
        // Warm glow particles
        addParticles(data, 35, '#ffb3f0', 0, 140);
    }],

    ['v2-wanderer-path', (data) => {
        // Purple twilight sky
        drawGradientRect(data, 0, 0, 200, 120, '#6633aa', '#2a1547');
        
        // Rolling hills on sides
        for (let x = 0; x < 200; x++) {
            const leftHill = 100 + Math.sin(x * 0.05) * 20;
            const rightHill = 110 + Math.cos(x * 0.04) * 15;
            
            for (let y = leftHill; y < 200; y++) {
                if (x < 70) {
                    setPixel(data, x, y, '#2d5a2d');
                }
            }
            
            for (let y = rightHill; y < 200; y++) {
                if (x > 130) {
                    setPixel(data, x, y, '#254a25');
                }
            }
        }
        
        // Winding path (keep center mostly clear)
        for (let x = 70; x < 130; x++) {
            for (let y = 150; y < 200; y++) {
                const pathCenter = 100 + Math.sin(y * 0.1) * 10;
                if (Math.abs(x - pathCenter) < 8) {
                    setPixel(data, x, y, '#6b5b4a');
                    if (dither50(x, y)) {
                        setPixel(data, x, y, '#7a6a59');
                    }
                }
            }
        }
        
        // Footprints on path
        const footprints = [{x: 95, y: 170}, {x: 105, y: 180}, {x: 98, y: 190}];
        footprints.forEach(fp => {
            setPixel(data, fp.x, fp.y, '#4a3a29');
            setPixel(data, fp.x+1, fp.y, '#4a3a29');
        });
        
        // Stars
        addParticles(data, 20, '#ddccff', 0, 100);
    }],

    ['v2-septenary-convergence', (data) => {
        // Dark sky with rainbow convergence
        drawGradientRect(data, 0, 0, 200, 200, '#1a1a2e', '#0a0a14');
        
        // Seven moon beams converging to center
        const moonColors = ['#ff4500', '#ffd700', '#1e90ff', '#228b22', '#7b54c9', '#c55bb7', '#e8e8e8'];
        
        for (let i = 0; i < 7; i++) {
            const angle = (i * Math.PI * 2) / 7;
            const startX = 100 + Math.cos(angle) * 80;
            const startY = 100 + Math.sin(angle) * 80;
            
            for (let t = 0; t < 1; t += 0.02) {
                const x = Math.floor(startX + (100 - startX) * t);
                const y = Math.floor(startY + (100 - startY) * t);
                
                if (x >= 0 && x < 200 && y >= 0 && y < 200) {
                    setPixel(data, x, y, moonColors[i]);
                    if (t < 0.7) { // Don't overwhelm center
                        setPixel(data, x+1, y, moonColors[i]);
                        setPixel(data, x, y+1, moonColors[i]);
                    }
                }
            }
        }
        
        // Sacred ground circle at bottom
        for (let x = 50; x < 150; x++) {
            for (let y = 150; y < 200; y++) {
                const dx = x - 100;
                const dy = y - 175;
                if (dx*dx + dy*dy < 1600) { // Circle
                    setPixel(data, x, y, '#3a3a5a');
                    if (dither50(x, y)) {
                        setPixel(data, x, y, '#4a4a6a');
                    }
                }
            }
        }
        
        // Energy particles
        addParticles(data, 40, '#ffffff', 0, 200);
    }],

    ['v2-palehowl-academy', (data) => {
        // Pale moonlit sky
        drawGradientRect(data, 0, 0, 200, 120, '#e8e8f8', '#c0c0d0');
        
        // Simple stone building on sides
        // Left wing
        for (let x = 0; x < 60; x++) {
            for (let y = 80; y < 180; y++) {
                setPixel(data, x, y, '#888888');
                if (dither50(x, y)) {
                    setPixel(data, x, y, '#999999');
                }
            }
        }
        
        // Right wing
        for (let x = 140; x < 200; x++) {
            for (let y = 90; y < 180; y++) {
                setPixel(data, x, y, '#777777');
                if (dither33(x, y)) {
                    setPixel(data, x, y, '#888888');
                }
            }
        }
        
        // Windows with warm light
        const windows = [
            {x: 20, y: 120}, {x: 40, y: 100}, {x: 160, y: 110}, {x: 180, y: 130}
        ];
        
        windows.forEach(win => {
            for (let dx = 0; dx < 6; dx++) {
                for (let dy = 0; dy < 8; dy++) {
                    setPixel(data, win.x + dx, win.y + dy, '#ffffaa');
                }
            }
        });
        
        // Courtyard ground
        for (let x = 60; x < 140; x++) {
            for (let y = 160; y < 200; y++) {
                setPixel(data, x, y, '#aaaaaa');
                if ((x + y) % 3 === 0) {
                    setPixel(data, x, y, '#bbbbbb');
                }
            }
        }
        
        // Hopeful atmosphere - soft lights
        addParticles(data, 15, '#ffffcc', 0, 160);
    }],

    ['v2-loyalty-war-memorial', (data) => {
        // Somber sky
        drawGradientRect(data, 0, 0, 200, 100, '#6a6a7a', '#4a4a5a');
        
        // Stone monument in center-left and center-right
        // Left monument piece
        for (let x = 20; x < 80; x++) {
            for (let y = 60; y < 180; y++) {
                setPixel(data, x, y, '#555555');
                if (y < 70) { // Top carved section
                    if ((x + y) % 4 === 0) {
                        setPixel(data, x, y, '#ff4500'); // Flame symbol
                    }
                }
                if (y > 90 && y < 100) {
                    if ((x + y) % 4 === 1) {
                        setPixel(data, x, y, '#228b22'); // Wild symbol
                    }
                }
                if (y > 110 && y < 120) {
                    if ((x + y) % 4 === 2) {
                        setPixel(data, x, y, '#7b54c9'); // Arcane symbol
                    }
                }
            }
        }
        
        // Right monument piece
        for (let x = 120; x < 180; x++) {
            for (let y = 70; y < 190; y++) {
                setPixel(data, x, y, '#4a4a4a');
                if (y < 80) {
                    if ((x + y) % 4 === 0) {
                        setPixel(data, x, y, '#1e90ff'); // Deep symbol
                    }
                }
                if (y > 100 && y < 110) {
                    if ((x + y) % 4 === 1) {
                        setPixel(data, x, y, '#ffd700'); // Radiant symbol
                    }
                }
                if (y > 130 && y < 140) {
                    if ((x + y) % 4 === 2) {
                        setPixel(data, x, y, '#c55bb7'); // Heart symbol
                    }
                }
            }
        }
        
        // Overgrown vines
        for (let i = 0; i < 50; i++) {
            const x = 20 + Math.floor(Math.random() * 160);
            const y = 100 + Math.floor(Math.random() * 80);
            if (dither33(x, y)) {
                setPixel(data, x, y, '#2d4a2d');
            }
        }
        
        // Ground
        for (let x = 0; x < 200; x++) {
            for (let y = 180; y < 200; y++) {
                setPixel(data, x, y, '#3a3a3a');
                if (dither50(x, y)) {
                    setPixel(data, x, y, '#4a4a4a');
                }
            }
        }
    }],

    // NATURE & ENVIRONMENTS
    ['v2-emberhowl-volcano', (data) => {
        // Orange sky with volcano
        drawGradientRect(data, 0, 0, 200, 200, '#ff4500', '#aa2200');
        
        // Volcano sides (not center)
        // Left slope
        for (let x = 0; x < 80; x++) {
            for (let y = 0; y < 200; y++) {
                const slopeHeight = 50 + (x * 1.5);
                if (y > slopeHeight) {
                    setPixel(data, x, y, '#332222');
                    if (dither50(x, y)) {
                        setPixel(data, x, y, '#442222');
                    }
                }
            }
        }
        
        // Right slope
        for (let x = 120; x < 200; x++) {
            for (let y = 0; y < 200; y++) {
                const slopeHeight = 40 + ((200 - x) * 1.8);
                if (y > slopeHeight) {
                    setPixel(data, x, y, '#2a1a1a');
                    if (dither33(x, y)) {
                        setPixel(data, x, y, '#3a1a1a');
                    }
                }
            }
        }
        
        // Lava flows on slopes
        for (let x = 10; x < 70; x += 8) {
            for (let y = 100; y < 200; y++) {
                if ((x + y) % 6 === 0) {
                    setPixel(data, x, y, '#ff6600');
                    setPixel(data, x+1, y, '#ff3300');
                }
            }
        }
        
        for (let x = 130; x < 190; x += 10) {
            for (let y = 80; y < 200; y++) {
                if ((x + y) % 7 === 0) {
                    setPixel(data, x, y, '#ff5500');
                    setPixel(data, x+1, y, '#cc3300');
                }
            }
        }
        
        // Ash particles
        addParticles(data, 50, '#666666', 0, 150);
        addParticles(data, 30, '#ff8800', 50, 200);
    }],

    ['v2-deepwell-ocean-floor', (data) => {
        // Deep blue darkness
        drawGradientRect(data, 0, 0, 200, 200, '#001133', '#000811');
        
        // Ancient ruins on sides
        // Left ruins
        for (let x = 0; x < 60; x++) {
            for (let y = 120; y < 200; y++) {
                if (y > 140 + Math.sin(x * 0.2) * 10) {
                    setPixel(data, x, y, '#223344');
                    if (dither50(x, y)) {
                        setPixel(data, x, y, '#334455');
                    }
                }
            }
        }
        
        // Right ruins
        for (let x = 140; x < 200; x++) {
            for (let y = 100; y < 200; y++) {
                if (y > 130 + Math.cos(x * 0.15) * 15) {
                    setPixel(data, x, y, '#1a2a3a');
                    if (dither33(x, y)) {
                        setPixel(data, x, y, '#2a3a4a');
                    }
                }
            }
        }
        
        // Bioluminescent plants
        for (let i = 0; i < 20; i++) {
            const x = Math.floor(Math.random() * 60);
            const y = 150 + Math.floor(Math.random() * 50);
            for (let dx = 0; dx < 3; dx++) {
                for (let dy = 0; dy < 8; dy++) {
                    setPixel(data, x + dx, y + dy, '#00ffcc');
                }
            }
        }
        
        for (let i = 0; i < 15; i++) {
            const x = 140 + Math.floor(Math.random() * 60);
            const y = 120 + Math.floor(Math.random() * 80);
            for (let dx = 0; dx < 4; dx++) {
                for (let dy = 0; dy < 6; dy++) {
                    setPixel(data, x + dx, y + dy, '#0088ff');
                }
            }
        }
        
        // Sand/sediment floor
        for (let x = 0; x < 200; x++) {
            for (let y = 180; y < 200; y++) {
                setPixel(data, x, y, '#1a2a1a');
                if (dither50(x, y)) {
                    setPixel(data, x, y, '#2a3a2a');
                }
            }
        }
        
        // Glowing particles
        addParticles(data, 40, '#004488', 0, 180);
    }],

    ['v2-evergreen-ancient-forest', (data) => {
        // Green misty atmosphere
        drawGradientRect(data, 0, 0, 200, 200, '#1a4a1a', '#0a2a0a');
        
        // Massive trees on sides
        // Left tree
        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 200; y++) {
                if (x < 30) {
                    setPixel(data, x, y, '#2d1a0f');
                    if (dither50(x, y)) {
                        setPixel(data, x, y, '#3d2a1f');
                    }
                    // Tree face
                    if (x > 10 && x < 25 && y > 60 && y < 90) {
                        if ((x - 15) * (x - 15) + (y - 75) * (y - 75) < 25) {
                            setPixel(data, x, y, '#4d3a2f');
                        }
                    }
                }
            }
        }
        
        // Right tree
        for (let x = 150; x < 200; x++) {
            for (let y = 0; y < 200; y++) {
                if (x > 170) {
                    setPixel(data, x, y, '#261509');
                    if (dither33(x, y)) {
                        setPixel(data, x, y, '#361519');
                    }
                    // Tree face
                    if (x > 175 && x < 190 && y > 80 && y < 110) {
                        if ((x - 182) * (x - 182) + (y - 95) * (y - 95) < 30) {
                            setPixel(data, x, y, '#463529');
                        }
                    }
                }
            }
        }
        
        // Green mist
        for (let x = 0; x < 200; x++) {
            for (let y = 80; y < 160; y++) {
                if (dither33(x, y)) {
                    setPixel(data, x, y, '#2a5a2a');
                }
            }
        }
        
        // Mushrooms scattered
        const mushrooms = [{x: 20, y: 180}, {x: 170, y: 170}, {x: 30, y: 190}];
        mushrooms.forEach(m => {
            for (let dx = 0; dx < 6; dx++) {
                for (let dy = 0; dy < 4; dy++) {
                    if (dy < 2) {
                        setPixel(data, m.x + dx, m.y + dy, '#aa5533'); // Cap
                    } else {
                        setPixel(data, m.x + 2, m.y + dy, '#ccccaa'); // Stem
                        setPixel(data, m.x + 3, m.y + dy, '#ccccaa');
                    }
                }
            }
        });
        
        // Spores
        addParticles(data, 25, '#44aa44', 100, 180);
    }],

    ['v2-umbra-shadow-caves', (data) => {
        // Dark purple cave
        drawGradientRect(data, 0, 0, 200, 200, '#2a1540', '#1a0a30');
        
        // Cave walls with crystals
        // Left wall
        for (let x = 0; x < 60; x++) {
            for (let y = 0; y < 200; y++) {
                if (x < 40 + Math.sin(y * 0.1) * 10) {
                    setPixel(data, x, y, '#3a2555');
                    if (dither50(x, y)) {
                        setPixel(data, x, y, '#4a3565');
                    }
                }
            }
        }
        
        // Right wall
        for (let x = 140; x < 200; x++) {
            for (let y = 0; y < 200; y++) {
                if (x > 160 - Math.cos(y * 0.08) * 12) {
                    setPixel(data, x, y, '#2f1f4a');
                    if (dither33(x, y)) {
                        setPixel(data, x, y, '#3f2f5a');
                    }
                }
            }
        }
        
        // Purple crystals on walls
        const crystals = [
            {x: 20, y: 60}, {x: 35, y: 120}, {x: 160, y: 80}, {x: 175, y: 140}
        ];
        
        crystals.forEach(crystal => {
            for (let dx = -3; dx <= 3; dx++) {
                for (let dy = -4; dy <= 4; dy++) {
                    if (Math.abs(dx) + Math.abs(dy) <= 5) {
                        setPixel(data, crystal.x + dx, crystal.y + dy, '#aa77dd');
                        if (Math.abs(dx) + Math.abs(dy) <= 2) {
                            setPixel(data, crystal.x + dx, crystal.y + dy, '#cc99ff');
                        }
                    }
                }
            }
        });
        
        // Living shadows
        for (let i = 0; i < 30; i++) {
            const x = 60 + Math.floor(Math.random() * 80);
            const y = 100 + Math.floor(Math.random() * 100);
            if (dither50(x, y)) {
                setPixel(data, x, y, '#1a0a25');
            }
        }
        
        // Purple glow particles
        addParticles(data, 35, '#7755aa', 0, 200);
    }],

    ['v2-roseglow-cherry-blossoms', (data) => {
        // Pink night sky
        drawGradientRect(data, 0, 0, 200, 150, '#4a2a4a', '#2a1a2a');
        
        // Cherry blossom trees on sides
        // Left tree
        for (let x = 0; x < 60; x++) {
            for (let y = 80; y < 200; y++) {
                // Trunk
                if (x > 25 && x < 35) {
                    setPixel(data, x, y, '#3a2a1a');
                }
                // Branches
                if (y > 80 && y < 120) {
                    if (Math.abs(x - (25 + y/4)) < 2) {
                        setPixel(data, x, y, '#2a1a0a');
                    }
                }
            }
        }
        
        // Right tree
        for (let x = 140; x < 200; x++) {
            for (let y = 60; y < 200; y++) {
                // Trunk
                if (x > 165 && x < 175) {
                    setPixel(data, x, y, '#3a2a1a');
                }
                // Branches
                if (y > 60 && y < 100) {
                    if (Math.abs(x - (170 - y/5)) < 2) {
                        setPixel(data, x, y, '#2a1a0a');
                    }
                }
            }
        }
        
        // Cherry blossoms on branches
        for (let i = 0; i < 40; i++) {
            const x = Math.random() < 0.5 ? 
                10 + Math.floor(Math.random() * 50) : 
                150 + Math.floor(Math.random() * 50);
            const y = 70 + Math.floor(Math.random() * 50);
            
            setPixel(data, x, y, '#ffb3d9');
            setPixel(data, x+1, y, '#ff99cc');
            setPixel(data, x, y+1, '#ffb3d9');
        }
        
        // Falling petals
        addParticles(data, 60, '#ffccdd', 0, 200);
        addParticles(data, 40, '#ff99cc', 0, 160);
        
        // Ground
        for (let x = 0; x < 200; x++) {
            for (let y = 170; y < 200; y++) {
                setPixel(data, x, y, '#2a3a2a');
                if (dither50(x, y)) {
                    setPixel(data, x, y, '#3a4a3a');
                }
            }
        }
    }],

    ['v2-solaris-desert-oasis', (data) => {
        // Golden desert sky
        drawGradientRect(data, 0, 0, 200, 120, '#ffd700', '#ffaa00');
        
        // Sand dunes on sides
        // Left dune
        for (let x = 0; x < 70; x++) {
            for (let y = 120; y < 200; y++) {
                const duneHeight = 140 + Math.sin(x * 0.08) * 20;
                if (y > duneHeight) {
                    setPixel(data, x, y, '#e6b800');
                    if (dither50(x, y)) {
                        setPixel(data, x, y, '#ffcc00');
                    }
                }
            }
        }
        
        // Right dune
        for (let x = 130; x < 200; x++) {
            for (let y = 110; y < 200; y++) {
                const duneHeight = 130 + Math.cos(x * 0.06) * 25;
                if (y > duneHeight) {
                    setPixel(data, x, y, '#cc9900');
                    if (dither33(x, y)) {
                        setPixel(data, x, y, '#e6b300');
                    }
                }
            }
        }
        
        // Oasis water in center
        for (let x = 80; x < 120; x++) {
            for (let y = 160; y < 200; y++) {
                const dx = x - 100;
                const dy = y - 180;
                if (dx*dx + dy*dy < 300) {
                    setPixel(data, x, y, '#0099cc');
                    if (dither50(x, y)) {
                        setPixel(data, x, y, '#00aadd');
                    }
                }
            }
        }
        
        // Palm trees near oasis
        const palms = [{x: 85, y: 140}, {x: 115, y: 145}];
        palms.forEach(palm => {
            // Trunk
            for (let y = palm.y; y < palm.y + 20; y++) {
                setPixel(data, palm.x, y, '#8b4513');
                setPixel(data, palm.x+1, y, '#8b4513');
            }
            // Leaves
            for (let dx = -4; dx <= 4; dx++) {
                for (let dy = -2; dy <= 2; dy++) {
                    setPixel(data, palm.x + dx, palm.y - 5 + dy, '#228b22');
                }
            }
        });
        
        // Heat shimmer
        addParticles(data, 25, '#ffff99', 0, 120);
    }],

    ['v2-frozen-tundra', (data) => {
        // Cold blue-white sky
        drawGradientRect(data, 0, 0, 200, 120, '#e6f3ff', '#b3d9ff');
        
        // Aurora borealis
        for (let x = 0; x < 200; x++) {
            for (let y = 20; y < 80; y++) {
                const wave = Math.sin(x * 0.05 + y * 0.1) * 10;
                if (Math.abs(y - 50 - wave) < 3) {
                    if (dither33(x, y)) {
                        setPixel(data, x, y, '#00ff88');
                    }
                }
                if (Math.abs(y - 30 - wave) < 2) {
                    if (dither50(x, y)) {
                        setPixel(data, x, y, '#8800ff');
                    }
                }
            }
        }
        
        // Ice formations on sides
        // Left ice wall
        for (let x = 0; x < 50; x++) {
            for (let y = 100; y < 200; y++) {
                if (x < 30 + Math.sin(y * 0.1) * 8) {
                    setPixel(data, x, y, '#ccddff');
                    if (dither50(x, y)) {
                        setPixel(data, x, y, '#ddddff');
                    }
                }
            }
        }
        
        // Right ice formations
        for (let x = 150; x < 200; x++) {
            for (let y = 120; y < 200; y++) {
                if (x > 170 - Math.cos(y * 0.08) * 10) {
                    setPixel(data, x, y, '#bbccff');
                    if (dither33(x, y)) {
                        setPixel(data, x, y, '#ccddff');
                    }
                }
            }
        }
        
        // Frost crystals
        for (let i = 0; i < 30; i++) {
            const x = Math.floor(Math.random() * 200);
            const y = 120 + Math.floor(Math.random() * 80);
            setPixel(data, x, y, '#ffffff');
        }
        
        // Snow ground
        for (let x = 0; x < 200; x++) {
            for (let y = 180; y < 200; y++) {
                setPixel(data, x, y, '#f0f8ff');
                if (dither50(x, y)) {
                    setPixel(data, x, y, '#ffffff');
                }
            }
        }
        
        // Snow particles
        addParticles(data, 40, '#ffffff', 0, 180);
    }],

    ['v2-mushroom-hollow', (data) => {
        // Dark blue-green cave atmosphere
        drawGradientRect(data, 0, 0, 200, 200, '#1a2a3a', '#0a1a2a');
        
        // Giant mushrooms on sides
        // Left mushroom cluster
        const leftMushrooms = [{x: 20, y: 120, size: 25}, {x: 35, y: 140, size: 20}];
        leftMushrooms.forEach(m => {
            // Cap
            for (let dx = -m.size; dx <= m.size; dx++) {
                for (let dy = -m.size/2; dy <= 0; dy++) {
                    if (dx*dx + dy*dy*4 < m.size*m.size) {
                        setPixel(data, m.x + dx, m.y + dy, '#ff6699');
                        if (dither50(m.x + dx, m.y + dy)) {
                            setPixel(data, m.x + dx, m.y + dy, '#ff88bb');
                        }
                    }
                }
            }
            // Stem
            for (let y = m.y; y < m.y + m.size; y++) {
                for (let x = m.x - 3; x < m.x + 3; x++) {
                    setPixel(data, x, y, '#ccccaa');
                }
            }
        });
        
        // Right mushroom cluster
        const rightMushrooms = [{x: 170, y: 100, size: 30}, {x: 180, y: 130, size: 18}];
        rightMushrooms.forEach(m => {
            // Cap
            for (let dx = -m.size; dx <= m.size; dx++) {
                for (let dy = -m.size/2; dy <= 0; dy++) {
                    if (dx*dx + dy*dy*4 < m.size*m.size) {
                        setPixel(data, m.x + dx, m.y + dy, '#66aaff');
                        if (dither33(m.x + dx, m.y + dy)) {
                            setPixel(data, m.x + dx, m.y + dy, '#88ccff');
                        }
                    }
                }
            }
            // Stem
            for (let y = m.y; y < m.y + m.size; y++) {
                for (let x = m.x - 2; x < m.x + 2; x++) {
                    setPixel(data, x, y, '#aaccaa');
                }
            }
        });
        
        // Bioluminescent glow
        for (let x = 0; x < 200; x++) {
            for (let y = 100; y < 200; y++) {
                if ((x + y) % 8 === 0) {
                    setPixel(data, x, y, '#004466');
                }
            }
        }
        
        // Spore particles
        addParticles(data, 45, '#88ffcc', 80, 200);
        addParticles(data, 35, '#ff99cc', 60, 180);
    }],

    ['v2-crystal-canyon', (data) => {
        // Prismatic sky
        drawGradientRect(data, 0, 0, 200, 100, '#6644aa', '#332255');
        
        // Crystal canyon walls
        // Left wall
        for (let x = 0; x < 60; x++) {
            for (let y = 80; y < 200; y++) {
                if (x < 40 + Math.sin(y * 0.12) * 8) {
                    const crystalColor = ['#ff66aa', '#66aaff', '#aaff66', '#ffaa66'][Math.floor((x + y) / 10) % 4];
                    setPixel(data, x, y, crystalColor);
                    if (dither50(x, y)) {
                        setPixel(data, x, y, '#ffffff');
                    }
                }
            }
        }
        
        // Right wall
        for (let x = 140; x < 200; x++) {
            for (let y = 70; y < 200; y++) {
                if (x > 160 - Math.cos(y * 0.1) * 10) {
                    const crystalColor = ['#aa66ff', '#66ffaa', '#ffaa88', '#88aaff'][Math.floor((x + y) / 12) % 4];
                    setPixel(data, x, y, crystalColor);
                    if (dither33(x, y)) {
                        setPixel(data, x, y, '#ffffff');
                    }
                }
            }
        }
        
        // Light reflections
        for (let i = 0; i < 20; i++) {
            const x = Math.floor(Math.random() * 200);
            const y = 100 + Math.floor(Math.random() * 100);
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    setPixel(data, x + dx, y + dy, '#ffffff');
                }
            }
        }
        
        // Prismatic light particles
        addParticles(data, 50, '#ff88cc', 0, 200);
        addParticles(data, 30, '#88ccff', 0, 150);
    }],

    ['v2-rot-wasteland', (data) => {
        // Sickly green-brown sky
        drawGradientRect(data, 0, 0, 200, 120, '#6b4423', '#4a3018');
        
        // Dead trees on sides
        // Left dead trees
        const leftTrees = [{x: 25, y: 100}, {x: 40, y: 110}];
        leftTrees.forEach(tree => {
            // Trunk
            for (let y = tree.y; y < tree.y + 40; y++) {
                setPixel(data, tree.x, y, '#2a1a0a');
                setPixel(data, tree.x+1, y, '#2a1a0a');
            }
            // Dead branches
            for (let i = 0; i < 3; i++) {
                const branchY = tree.y + 10 + i * 8;
                for (let x = tree.x; x < tree.x + 8; x++) {
                    setPixel(data, x, branchY, '#1a0a00');
                }
                for (let x = tree.x; x > tree.x - 6; x--) {
                    setPixel(data, x, branchY + 3, '#1a0a00');
                }
            }
        });
        
        // Right dead trees
        const rightTrees = [{x: 170, y: 90}, {x: 185, y: 105}];
        rightTrees.forEach(tree => {
            // Trunk
            for (let y = tree.y; y < tree.y + 50; y++) {
                setPixel(data, tree.x, y, '#2a1505');
                setPixel(data, tree.x+1, y, '#2a1505');
            }
            // Dead branches
            for (let i = 0; i < 4; i++) {
                const branchY = tree.y + 8 + i * 10;
                for (let x = tree.x; x < tree.x + 6; x++) {
                    setPixel(data, x, branchY, '#1a0f00');
                }
            }
        });
        
        // Corrupted ground
        for (let x = 0; x < 200; x++) {
            for (let y = 150; y < 200; y++) {
                const corruption = ['#3a3a1a', '#4a2a1a', '#2a4a2a', '#5a3a0a'][Math.floor((x + y) / 8) % 4];
                setPixel(data, x, y, corruption);
                if (dither50(x, y)) {
                    setPixel(data, x, y, '#1a1a0a');
                }
            }
        }
        
        // Corruption spreading (sickly particles)
        addParticles(data, 40, '#6a4a2a', 0, 200);
        addParticles(data, 25, '#4a6a3a', 100, 200);
    }],

    // INTERIORS & SCENES
    ['v2-wizard-tower-top', (data) => {
        // Night sky with stars
        drawGradientRect(data, 0, 0, 200, 120, '#1a1a3a', '#0a0a2a');
        
        // Stars
        addParticles(data, 35, '#ffffff', 0, 100);
        addParticles(data, 25, '#ffffaa', 0, 80);
        
        // Tower walls on sides
        // Left wall
        for (let x = 0; x < 40; x++) {
            for (let y = 80; y < 200; y++) {
                setPixel(data, x, y, '#444444');
                if (dither50(x, y)) {
                    setPixel(data, x, y, '#555555');
                }
            }
        }
        
        // Right wall
        for (let x = 160; x < 200; x++) {
            for (let y = 90; y < 200; y++) {
                setPixel(data, x, y, '#383838');
                if (dither33(x, y)) {
                    setPixel(data, x, y, '#484848');
                }
            }
        }
        
        // Magical instruments on walls
        const instruments = [
            {x: 15, y: 120}, {x: 25, y: 140}, {x: 175, y: 110}, {x: 185, y: 130}
        ];
        
        instruments.forEach(inst => {
            for (let dx = 0; dx < 8; dx++) {
                for (let dy = 0; dy < 6; dy++) {
                    if (dx < 3 || dx > 5) {
                        setPixel(data, inst.x + dx, inst.y + dy, '#aa8866');
                    } else {
                        setPixel(data, inst.x + dx, inst.y + dy, '#6699aa'); // Crystal/glass part
                    }
                }
            }
        });
        
        // Stone floor
        for (let x = 40; x < 160; x++) {
            for (let y = 180; y < 200; y++) {
                setPixel(data, x, y, '#666666');
                if ((x + y) % 3 === 0) {
                    setPixel(data, x, y, '#777777');
                }
            }
        }
        
        // Magical particles
        addParticles(data, 30, '#aa88ff', 40, 180);
    }],

    ['v2-alchemy-lab', (data) => {
        // Dim laboratory lighting
        drawGradientRect(data, 0, 0, 200, 200, '#2a2a1a', '#1a1a0a');
        
        // Shelves on walls
        // Left shelves
        for (let shelf = 0; shelf < 4; shelf++) {
            const y = 40 + shelf * 35;
            for (let x = 0; x < 50; x++) {
                for (let sy = y; sy < y + 6; sy++) {
                    setPixel(data, x, sy, '#5a4a3a');
                }
            }
        }
        
        // Right shelves
        for (let shelf = 0; shelf < 3; shelf++) {
            const y = 50 + shelf * 40;
            for (let x = 150; x < 200; x++) {
                for (let sy = y; sy < y + 8; sy++) {
                    setPixel(data, x, sy, '#4a3a2a');
                }
            }
        }
        
        // Potion bottles
        const potions = [
            {x: 10, y: 35, color: '#ff3366'},
            {x: 25, y: 70, color: '#33ff66'},
            {x: 35, y: 105, color: '#3366ff'},
            {x: 160, y: 45, color: '#ff6633'},
            {x: 175, y: 85, color: '#6633ff'},
            {x: 185, y: 125, color: '#33ff99'}
        ];
        
        potions.forEach(potion => {
            for (let dx = 0; dx < 4; dx++) {
                for (let dy = 0; dy < 8; dy++) {
                    if (dy < 6) {
                        setPixel(data, potion.x + dx, potion.y + dy, potion.color);
                    } else {
                        setPixel(data, potion.x + dx, potion.y + dy, '#8a7a6a'); // Cork
                    }
                }
            }
        });
        
        // Steam wisps
        for (let i = 0; i < 15; i++) {
            const x = 50 + Math.floor(Math.random() * 100);
            const y = 50 + Math.floor(Math.random() * 60);
            if (dither33(x, y)) {
                setPixel(data, x, y, '#cccccc');
            }
        }
        
        // Floor
        for (let x = 0; x < 200; x++) {
            for (let y = 180; y < 200; y++) {
                setPixel(data, x, y, '#3a3a2a');
                if (dither50(x, y)) {
                    setPixel(data, x, y, '#4a4a3a');
                }
            }
        }
    }],

    ['v2-throne-room', (data) => {
        // Majestic purple ceiling
        drawGradientRect(data, 0, 0, 200, 100, '#4a3a6a', '#2a1a4a');
        
        // Six Order banners hanging from sides
        const orderColors = ['#ff4500', '#228b22', '#7b54c9', '#1e90ff', '#ffd700', '#c55bb7'];
        
        // Left banners
        for (let i = 0; i < 3; i++) {
            const x = 5 + i * 15;
            for (let y = 20; y < 80; y++) {
                for (let bx = x; bx < x + 8; bx++) {
                    setPixel(data, bx, y, orderColors[i]);
                }
            }
        }
        
        // Right banners
        for (let i = 3; i < 6; i++) {
            const x = 155 + (i - 3) * 15;
            for (let y = 25; y < 85; y++) {
                for (let bx = x; bx < x + 8; bx++) {
                    setPixel(data, bx, y, orderColors[i]);
                }
            }
        }
        
        // Golden throne (partial, on right side)
        for (let x = 140; x < 180; x++) {
            for (let y = 120; y < 180; y++) {
                if (x > 150 && y > 140) { // Back of throne
                    setPixel(data, x, y, '#ffdd00');
                    if (dither50(x, y)) {
                        setPixel(data, x, y, '#ffee33');
                    }
                }
                if (x > 145 && x < 155 && y > 160) { // Armrest
                    setPixel(data, x, y, '#e6c200');
                }
            }
        }
        
        // Red carpet leading to throne
        for (let x = 60; x < 140; x++) {
            for (let y = 170; y < 185; y++) {
                setPixel(data, x, y, '#aa2222');
                if (dither50(x, y)) {
                    setPixel(data, x, y, '#cc3333');
                }
            }
        }
        
        // Stone floor
        for (let x = 0; x < 200; x++) {
            for (let y = 185; y < 200; y++) {
                setPixel(data, x, y, '#555555');
                if ((x + y) % 4 === 0) {
                    setPixel(data, x, y, '#666666');
                }
            }
        }
    }],

    ['v2-crystal-lizard-den', (data) => {
        // Crystal cave
        drawGradientRect(data, 0, 0, 200, 200, '#1a2a4a', '#0a1a3a');
        
        // Crystalline walls
        // Left wall
        for (let x = 0; x < 60; x++) {
            for (let y = 0; y < 200; y++) {
                if (x < 40 + Math.sin(y * 0.1) * 8) {
                    const crystalColors = ['#4466aa', '#6699cc', '#88bbff'];
                    const color = crystalColors[Math.floor((x + y) / 10) % 3];
                    setPixel(data, x, y, color);
                    if (dither50(x, y)) {
                        setPixel(data, x, y, '#aaccff');
                    }
                }
            }
        }
        
        // Right wall
        for (let x = 140; x < 200; x++) {
            for (let y = 0; y < 200; y++) {
                if (x > 160 - Math.cos(y * 0.08) * 10) {
                    const crystalColors = ['#aa4466', '#cc6699', '#ff88bb'];
                    const color = crystalColors[Math.floor((x + y) / 12) % 3];
                    setPixel(data, x, y, color);
                    if (dither33(x, y)) {
                        setPixel(data, x, y, '#ffaacc');
                    }
                }
            }
        }
        
        // Glowing eggs scattered
        const eggs = [
            {x: 80, y: 160, color: '#ffcc66'},
            {x: 120, y: 170, color: '#66ccff'},
            {x: 100, y: 150, color: '#cc66ff'},
            {x: 90, y: 180, color: '#66ffcc'},
            {x: 110, y: 185, color: '#ff6699'}
        ];
        
        eggs.forEach(egg => {
            for (let dx = -2; dx <= 2; dx++) {
                for (let dy = -3; dy <= 3; dy++) {
                    if (dx*dx + dy*dy < 6) {
                        setPixel(data, egg.x + dx, egg.y + dy, egg.color);
                        if (dx*dx + dy*dy < 3) {
                            setPixel(data, egg.x + dx, egg.y + dy, '#ffffff');
                        }
                    }
                }
            }
        });
        
        // Crystal floor
        for (let x = 60; x < 140; x++) {
            for (let y = 180; y < 200; y++) {
                setPixel(data, x, y, '#334466');
                if (dither50(x, y)) {
                    setPixel(data, x, y, '#445577');
                }
            }
        }
        
        // Magical sparkles
        addParticles(data, 40, '#ffffff', 0, 180);
    }],

    ['v2-owl-roost', (data) => {
        // Tower interior with moonlight
        drawGradientRect(data, 0, 0, 200, 200, '#2a2a4a', '#1a1a3a');
        
        // Windows with moonlight
        // Left window
        for (let x = 10; x < 30; x++) {
            for (let y = 20; y < 60; y++) {
                setPixel(data, x, y, '#ccccff');
                if ((x + y) % 3 === 0) {
                    setPixel(data, x, y, '#ffffff');
                }
            }
        }
        
        // Right window
        for (let x = 170; x < 190; x++) {
            for (let y = 30; y < 70; y++) {
                setPixel(data, x, y, '#bbbbee');
                if ((x + y) % 4 === 0) {
                    setPixel(data, x, y, '#eeeeff');
                }
            }
        }
        
        // Perches on walls
        const perches = [
            {x: 5, y: 100}, {x: 25, y: 120}, {x: 175, y: 90}, {x: 185, y: 110}
        ];
        
        perches.forEach(perch => {
            for (let px = perch.x; px < perch.x + 15; px++) {
                setPixel(data, px, perch.y, '#8b6914');
                setPixel(data, px, perch.y + 1, '#8b6914');
            }
        });
        
        // Floating feathers
        const feathers = [
            {x: 50, y: 80}, {x: 120, y: 100}, {x: 80, y: 60}, {x: 150, y: 120}
        ];
        
        feathers.forEach(feather => {
            for (let dx = 0; dx < 4; dx++) {
                for (let dy = 0; dy < 6; dy++) {
                    setPixel(data, feather.x + dx, feather.y + dy, '#eeeeee');
                }
            }
        });
        
        // Stone floor
        for (let x = 0; x < 200; x++) {
            for (let y = 180; y < 200; y++) {
                setPixel(data, x, y, '#444444');
                if (dither50(x, y)) {
                    setPixel(data, x, y, '#555555');
                }
            }
        }
        
        // Moonbeam particles
        addParticles(data, 25, '#eeeeff', 0, 150);
    }],

    ['v2-underground-library', (data) => {
        // Candlelit atmosphere
        drawGradientRect(data, 0, 0, 200, 200, '#3a2a1a', '#2a1a0a');
        
        // Bookshelf walls
        // Left bookshelves
        for (let shelf = 0; shelf < 6; shelf++) {
            const y = 20 + shelf * 25;
            for (let x = 0; x < 50; x++) {
                // Shelf
                for (let sy = y; sy < y + 4; sy++) {
                    setPixel(data, x, sy, '#6a4a2a');
                }
                // Books
                for (let by = y + 4; by < y + 20; by++) {
                    const bookColor = ['#aa3333', '#33aa33', '#3333aa', '#aa6633'][Math.floor(x / 5) % 4];
                    setPixel(data, x, by, bookColor);
                }
            }
        }
        
        // Right bookshelves
        for (let shelf = 0; shelf < 5; shelf++) {
            const y = 30 + shelf * 30;
            for (let x = 150; x < 200; x++) {
                // Shelf
                for (let sy = y; sy < y + 5; sy++) {
                    setPixel(data, x, sy, '#5a3a1a');
                }
                // Books
                for (let by = y + 5; by < y + 25; by++) {
                    const bookColor = ['#6633aa', '#aa3366', '#33aa66', '#aa9933'][Math.floor(x / 6) % 4];
                    setPixel(data, x, by, bookColor);
                }
            }
        }
        
        // Candles providing light
        const candles = [
            {x: 70, y: 50}, {x: 130, y: 40}, {x: 90, y: 80}, {x: 110, y: 70}
        ];
        
        candles.forEach(candle => {
            // Flame
            setPixel(data, candle.x, candle.y, '#ffaa00');
            setPixel(data, candle.x, candle.y + 1, '#ff6600');
            // Candle
            for (let cy = candle.y + 2; cy < candle.y + 12; cy++) {
                setPixel(data, candle.x, cy, '#ffffcc');
            }
            // Glow
            for (let dx = -3; dx <= 3; dx++) {
                for (let dy = -3; dy <= 3; dy++) {
                    if (dx*dx + dy*dy < 8 && dither50(candle.x + dx, candle.y + dy)) {
                        setPixel(data, candle.x + dx, candle.y + dy, '#ffdd66');
                    }
                }
            }
        });
        
        // Ancient scrolls on floor
        for (let x = 80; x < 120; x++) {
            for (let y = 170; y < 190; y++) {
                if ((x + y) % 8 < 5) {
                    setPixel(data, x, y, '#ccaa88');
                }
            }
        }
        
        // Dust motes in candlelight
        addParticles(data, 35, '#ddbb77', 50, 150);
    }],

    ['v2-potion-market', (data) => {
        // Market atmosphere
        drawGradientRect(data, 0, 0, 200, 120, '#4a3a5a', '#3a2a4a');
        
        // Market stalls on sides
        // Left stalls
        for (let stall = 0; stall < 2; stall++) {
            const x = stall * 25;
            // Stall structure
            for (let sx = x; sx < x + 20; sx++) {
                for (let sy = 100; sy < 180; sy++) {
                    if (sx < x + 3 || sx > x + 17 || sy < 110) {
                        setPixel(data, sx, sy, '#6a4a3a');
                    }
                }
            }
        }
        
        // Right stalls
        for (let stall = 0; stall < 2; stall++) {
            const x = 155 + stall * 25;
            // Stall structure
            for (let sx = x; sx < x + 20; sx++) {
                for (let sy = 110; sy < 180; sy++) {
                    if (sx < x + 3 || sx > x + 17 || sy < 120) {
                        setPixel(data, sx, sy, '#5a3a2a');
                    }
                }
            }
        }
        
        // Colorful potion bottles on stalls
        const potionColors = ['#ff3366', '#33ff66', '#3366ff', '#ff6633', '#6633ff', '#33ff99'];
        const potionStands = [
            {x: 8, y: 105}, {x: 15, y: 107}, {x: 30, y: 106},
            {x: 160, y: 115}, {x: 170, y: 117}, {x: 180, y: 114}
        ];
        
        potionStands.forEach((pos, i) => {
            const color = potionColors[i % potionColors.length];
            for (let dx = 0; dx < 3; dx++) {
                for (let dy = 0; dy < 6; dy++) {
                    setPixel(data, pos.x + dx, pos.y + dy, color);
                }
            }
        });
        
        // Hanging lanterns
        const lanterns = [{x: 60, y: 80}, {x: 140, y: 85}];
        lanterns.forEach(lantern => {
            // Lantern body
            for (let dx = -2; dx <= 2; dx++) {
                for (let dy = 0; dy < 8; dy++) {
                    setPixel(data, lantern.x + dx, lantern.y + dy, '#ffaa33');
                }
            }
            // Light glow
            for (let dx = -4; dx <= 4; dx++) {
                for (let dy = -2; dy <= 10; dy++) {
                    if (dx*dx + dy*dy < 15 && dither33(lantern.x + dx, lantern.y + dy)) {
                        setPixel(data, lantern.x + dx, lantern.y + dy, '#ffdd88');
                    }
                }
            }
        });
        
        // Cobblestone floor
        for (let x = 50; x < 150; x++) {
            for (let y = 170; y < 200; y++) {
                setPixel(data, x, y, '#555555');
                if ((x + y) % 5 === 0) {
                    setPixel(data, x, y, '#666666');
                }
            }
        }
    }],

    ['v2-moonstone-altar', (data) => {
        // Sacred twilight
        drawGradientRect(data, 0, 0, 200, 100, '#3a2a5a', '#2a1a4a');
        
        // Sacred altar (keeping center area open but adding altar edges)
        // Left altar edge
        for (let x = 40; x < 60; x++) {
            for (let y = 120; y < 150; y++) {
                setPixel(data, x, y, '#888888');
                if (dither50(x, y)) {
                    setPixel(data, x, y, '#999999');
                }
            }
        }
        
        // Right altar edge
        for (let x = 140; x < 160; x++) {
            for (let y = 120; y < 150; y++) {
                setPixel(data, x, y, '#777777');
                if (dither33(x, y)) {
                    setPixel(data, x, y, '#888888');
                }
            }
        }
        
        // Seven moonstones in circle formation
        const moonPositions = [
            {x: 100, y: 90, color: '#ff4500'},  // Emberhowl (top)
            {x: 125, y: 105, color: '#ffd700'}, // Solaris
            {x: 135, y: 130, color: '#1e90ff'}, // Deepwell
            {x: 125, y: 155, color: '#228b22'}, // Evergreen
            {x: 100, y: 165, color: '#7b54c9'}, // Umbra (bottom)
            {x: 75, y: 155, color: '#c55bb7'},  // Roseglow
            {x: 65, y: 130, color: '#e8e8e8'},  // Palehowl
            {x: 75, y: 105, color: '#e8e8e8'}   // Palehowl continues circle
        ];
        
        moonPositions.forEach((moon, i) => {
            if (i < 7) { // Only 7 moons
                for (let dx = -3; dx <= 3; dx++) {
                    for (let dy = -3; dy <= 3; dy++) {
                        if (dx*dx + dy*dy < 9) {
                            setPixel(data, moon.x + dx, moon.y + dy, moon.color);
                            if (dx*dx + dy*dy < 4) {
                                setPixel(data, moon.x + dx, moon.y + dy, '#ffffff');
                            }
                        }
                    }
                }
            }
        });
        
        // Energy connecting the stones
        for (let i = 0; i < 7; i++) {
            const curr = moonPositions[i];
            const next = moonPositions[(i + 1) % 7];
            
            for (let t = 0; t < 1; t += 0.1) {
                const x = Math.floor(curr.x + (next.x - curr.x) * t);
                const y = Math.floor(curr.y + (next.y - curr.y) * t);
                if (dither50(x, y)) {
                    setPixel(data, x, y, '#aaaaff');
                }
            }
        }
        
        // Sacred ground
        for (let x = 0; x < 200; x++) {
            for (let y = 170; y < 200; y++) {
                setPixel(data, x, y, '#444466');
                if (dither50(x, y)) {
                    setPixel(data, x, y, '#555577');
                }
            }
        }
        
        // Magical energy particles
        addParticles(data, 40, '#ccccff', 0, 170);
    }],

    ['v2-training-grounds', (data) => {
        // Training arena atmosphere
        drawGradientRect(data, 0, 0, 200, 120, '#5a4a3a', '#4a3a2a');
        
        // Arena walls/stands on sides
        // Left stands
        for (let x = 0; x < 50; x++) {
            for (let y = 80; y < 180; y++) {
                const tier = Math.floor((y - 80) / 20);
                if (x < 40 - tier * 5) {
                    setPixel(data, x, y, '#6a5a4a');
                    if (dither50(x, y)) {
                        setPixel(data, x, y, '#7a6a5a');
                    }
                }
            }
        }
        
        // Right stands
        for (let x = 150; x < 200; x++) {
            for (let y = 90; y < 180; y++) {
                const tier = Math.floor((y - 90) / 20);
                if (x > 160 + tier * 5) {
                    setPixel(data, x, y, '#5a4a3a');
                    if (dither33(x, y)) {
                        setPixel(data, x, y, '#6a5a4a');
                    }
                }
            }
        }
        
        // Training dummies on sides
        const dummies = [{x: 30, y: 140}, {x: 170, y: 130}];
        dummies.forEach(dummy => {
            // Post
            for (let y = dummy.y; y < dummy.y + 25; y++) {
                setPixel(data, dummy.x, y, '#8b4513');
                setPixel(data, dummy.x + 1, y, '#8b4513');
            }
            // Dummy body
            for (let dx = -3; dx <= 3; dx++) {
                for (let dy = 0; dy < 12; dy++) {
                    setPixel(data, dummy.x + dx, dummy.y + dy, '#ccaa88');
                }
            }
        });
        
        // Spell scorch marks on ground
        const scorchMarks = [
            {x: 80, y: 160}, {x: 120, y: 170}, {x: 60, y: 180}, {x: 140, y: 165}
        ];
        
        scorchMarks.forEach(scorch => {
            for (let dx = -4; dx <= 4; dx++) {
                for (let dy = -2; dy <= 2; dy++) {
                    if (dx*dx + dy*dy < 12) {
                        setPixel(data, scorch.x + dx, scorch.y + dy, '#2a1a0a');
                    }
                }
            }
        });
        
        // Combat ring marking
        for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
            const x = 100 + Math.cos(angle) * 35;
            const y = 160 + Math.sin(angle) * 20;
            if (x >= 50 && x < 150) { // Keep in open center area
                setPixel(data, Math.floor(x), Math.floor(y), '#ffffff');
            }
        }
        
        // Sandy arena floor
        for (let x = 50; x < 150; x++) {
            for (let y = 150; y < 200; y++) {
                setPixel(data, x, y, '#d2b48c');
                if (dither50(x, y)) {
                    setPixel(data, x, y, '#ddc49a');
                }
            }
        }
    }],

    ['v2-great-hall-feast', (data) => {
        // Warm feast hall lighting
        drawGradientRect(data, 0, 0, 200, 120, '#6a4a2a', '#5a3a1a');
        
        // Great hall pillars/walls on sides
        // Left pillars
        for (let pillar = 0; pillar < 2; pillar++) {
            const x = pillar * 20;
            for (let px = x; px < x + 8; px++) {
                for (let py = 60; py < 200; py++) {
                    setPixel(data, px, py, '#7a5a3a');
                    if (dither50(px, py)) {
                        setPixel(data, px, py, '#8a6a4a');
                    }
                }
            }
        }
        
        // Right pillars
        for (let pillar = 0; pillar < 2; pillar++) {
            const x = 175 + pillar * 15;
            for (let px = x; px < x + 8; px++) {
                for (let py = 70; py < 200; py++) {
                    setPixel(data, px, py, '#6a4a2a');
                    if (dither33(px, py)) {
                        setPixel(data, px, py, '#7a5a3a');
                    }
                }
            }
        }
        
        // Feast tables on sides
        // Left table
        for (let x = 10; x < 50; x++) {
            for (let y = 160; y < 175; y++) {
                setPixel(data, x, y, '#8b4513');
            }
        }
        
        // Right table
        for (let x = 150; x < 190; x++) {
            for (let y = 165; y < 180; y++) {
                setPixel(data, x, y, '#7a3f0f');
            }
        }
        
        // Floating candles above
        const candles = [
            {x: 60, y: 50}, {x: 80, y: 45}, {x: 100, y: 40}, {x: 120, y: 45}, {x: 140, y: 50}
        ];
        
        candles.forEach(candle => {
            // Flame
            setPixel(data, candle.x, candle.y, '#ffaa00');
            setPixel(data, candle.x, candle.y + 1, '#ff6600');
            // Candle body
            for (let cy = candle.y + 2; cy < candle.y + 8; cy++) {
                setPixel(data, candle.x, cy, '#ffffcc');
            }
            // Warm glow
            for (let dx = -5; dx <= 5; dx++) {
                for (let dy = -3; dy <= 8; dy++) {
                    if (dx*dx + dy*dy < 20 && dither33(candle.x + dx, candle.y + dy)) {
                        setPixel(data, candle.x + dx, candle.y + dy, '#ffcc66');
                    }
                }
            }
        });
        
        // Food items on tables
        const foods = [
            {x: 20, y: 155, color: '#cc6633'}, // Bread
            {x: 30, y: 157, color: '#66aa33'}, // Vegetables
            {x: 160, y: 160, color: '#aa3333'}, // Meat
            {x: 175, y: 162, color: '#ffaa00'}  // Cheese
        ];
        
        foods.forEach(food => {
            for (let dx = 0; dx < 4; dx++) {
                for (let dy = 0; dy < 3; dy++) {
                    setPixel(data, food.x + dx, food.y + dy, food.color);
                }
            }
        });
        
        // Stone floor with carpet runner
        for (let x = 0; x < 200; x++) {
            for (let y = 180; y < 200; y++) {
                if (x > 60 && x < 140) { // Center carpet
                    setPixel(data, x, y, '#aa2222');
                    if (dither50(x, y)) {
                        setPixel(data, x, y, '#cc3333');
                    }
                } else {
                    setPixel(data, x, y, '#555555');
                    if (dither50(x, y)) {
                        setPixel(data, x, y, '#666666');
                    }
                }
            }
        }
        
        // Firelight particles
        addParticles(data, 30, '#ffaa44', 0, 150);
    }]
];

// Generate all backgrounds
console.log('🎨 Generating 30 Order of 86 pixel art backgrounds...\n');

backgrounds.forEach(([name, drawFunc]) => {
    drawBackground(name, drawFunc);
});

console.log('\n✅ All backgrounds generated successfully!');

// List files with sizes
console.log('\n📁 Generated files:');
const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.png')).sort();
let totalSize = 0;

files.forEach(file => {
    const filePath = path.join(outputDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = Math.round(stats.size / 1024);
    totalSize += stats.size;
    console.log(`   ${file.padEnd(35)} ${sizeKB.toString().padStart(4)}KB`);
});

console.log(`\n📊 Total: ${files.length} files, ${Math.round(totalSize / 1024)}KB`);
console.log(`📍 Location: ${outputDir}`);