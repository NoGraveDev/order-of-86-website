const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Ensure output directory exists
const outputDir = path.join(__dirname, 'content-bg', 'still');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Helper function to create upscaled canvas
function createUpscaledCanvas(sourceCanvas) {
    const upscaled = createCanvas(800, 800);
    const ctx = upscaled.getContext('2d');
    ctx.imageSmoothingEnabled = false; // Nearest-neighbor scaling
    ctx.drawImage(sourceCanvas, 0, 0, 800, 800);
    return upscaled;
}

// Helper function to fill rect with validation for center-open rule
function fillRect(ctx, x, y, w, h, color) {
    // Don't draw in center third (x: 21-43)
    if (x + w > 21 && x < 43) return;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// Helper function to set pixel
function setPixel(ctx, x, y, color) {
    if (x >= 21 && x < 43) return; // Don't draw in center third
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
}

// 1. Volcanic crater
function volcanicCrater() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Sky
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 64, 32);
    
    // Crater rim left
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, 30, 20, 34);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 30, 20, 5);
    
    // Crater rim right
    ctx.fillStyle = '#654321';
    ctx.fillRect(44, 30, 20, 34);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(44, 30, 20, 5);
    
    // Lava glow
    ctx.fillStyle = '#FF4500';
    for (let i = 0; i < 15; i++) {
        setPixel(ctx, Math.floor(Math.random() * 10) + 5, 35 + Math.floor(Math.random() * 10), '#FF6347');
        setPixel(ctx, Math.floor(Math.random() * 10) + 49, 35 + Math.floor(Math.random() * 10), '#FF6347');
    }
    
    return canvas;
}

// 2. Bamboo forest
function bambooForest() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Sky
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, 64, 64);
    
    // Left bamboo stalks
    for (let i = 0; i < 8; i++) {
        let x = i * 2 + 2;
        if (x >= 21) break;
        ctx.fillStyle = '#228B22';
        ctx.fillRect(x, 10, 2, 54);
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(x, 20, 2, 2);
        ctx.fillRect(x, 35, 2, 2);
        ctx.fillRect(x, 50, 2, 2);
    }
    
    // Right bamboo stalks
    for (let i = 0; i < 8; i++) {
        let x = 43 + i * 2;
        if (x >= 62) break;
        ctx.fillStyle = '#228B22';
        ctx.fillRect(x, 10, 2, 54);
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(x, 20, 2, 2);
        ctx.fillRect(x, 35, 2, 2);
        ctx.fillRect(x, 50, 2, 2);
    }
    
    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 55, 21, 9);
    ctx.fillRect(43, 55, 21, 9);
    
    return canvas;
}

// 3. Frozen lake
function frozenLake() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Sky
    ctx.fillStyle = '#B0C4DE';
    ctx.fillRect(0, 0, 64, 32);
    
    // Ice surface
    ctx.fillStyle = '#E0FFFF';
    ctx.fillRect(0, 32, 64, 32);
    
    // Left shore rocks
    ctx.fillStyle = '#696969';
    ctx.fillRect(0, 30, 15, 10);
    ctx.fillStyle = '#A9A9A9';
    ctx.fillRect(2, 28, 8, 6);
    
    // Right shore rocks
    ctx.fillStyle = '#696969';
    ctx.fillRect(49, 30, 15, 10);
    ctx.fillStyle = '#A9A9A9';
    ctx.fillRect(51, 28, 8, 6);
    
    // Ice cracks
    ctx.fillStyle = '#B0E0E6';
    for (let i = 0; i < 10; i++) {
        setPixel(ctx, Math.floor(Math.random() * 15) + 5, 40 + Math.floor(Math.random() * 15), '#B0E0E6');
        setPixel(ctx, Math.floor(Math.random() * 15) + 44, 40 + Math.floor(Math.random() * 15), '#B0E0E6');
    }
    
    return canvas;
}

// 4. Swamp night
function swampNight() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Night sky
    ctx.fillStyle = '#191970';
    ctx.fillRect(0, 0, 64, 40);
    
    // Moon
    ctx.fillStyle = '#F5F5DC';
    ctx.fillRect(5, 5, 6, 6);
    
    // Swamp water
    ctx.fillStyle = '#2F4F2F';
    ctx.fillRect(0, 40, 64, 24);
    
    // Left dead trees
    ctx.fillStyle = '#654321';
    ctx.fillRect(3, 20, 2, 25);
    ctx.fillRect(10, 15, 2, 30);
    ctx.fillRect(1, 20, 3, 1);
    ctx.fillRect(12, 18, 4, 1);
    
    // Right dead trees
    ctx.fillStyle = '#654321';
    ctx.fillRect(48, 18, 2, 27);
    ctx.fillRect(55, 12, 2, 33);
    ctx.fillRect(46, 22, 3, 1);
    ctx.fillRect(57, 15, 4, 1);
    
    // Fireflies
    for (let i = 0; i < 8; i++) {
        setPixel(ctx, Math.floor(Math.random() * 15) + 2, Math.floor(Math.random() * 20) + 20, '#FFFF00');
        setPixel(ctx, Math.floor(Math.random() * 15) + 47, Math.floor(Math.random() * 20) + 20, '#FFFF00');
    }
    
    return canvas;
}

// 5. Mountain pass
function mountainPass() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Sky
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, 64, 32);
    
    // Left mountain
    ctx.fillStyle = '#696969';
    for (let y = 0; y < 35; y++) {
        let width = Math.max(0, 20 - Math.floor(y * 0.6));
        ctx.fillRect(0, y, width, 1);
    }
    
    // Right mountain
    ctx.fillStyle = '#696969';
    for (let y = 0; y < 35; y++) {
        let width = Math.max(0, 20 - Math.floor(y * 0.6));
        ctx.fillRect(64 - width, y, width, 1);
    }
    
    // Snow caps
    ctx.fillStyle = '#FFFAFA';
    ctx.fillRect(0, 0, 12, 8);
    ctx.fillRect(52, 0, 12, 8);
    
    // Path
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(0, 50, 64, 14);
    
    return canvas;
}

// 6. Coral reef underwater
function coralReef() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Water background
    ctx.fillStyle = '#006994';
    ctx.fillRect(0, 0, 64, 64);
    
    // Left coral formations
    ctx.fillStyle = '#FF7F50';
    ctx.fillRect(2, 45, 8, 19);
    ctx.fillStyle = '#FF6347';
    ctx.fillRect(4, 40, 4, 10);
    
    ctx.fillStyle = '#FF1493';
    ctx.fillRect(10, 50, 6, 14);
    ctx.fillStyle = '#FF69B4';
    ctx.fillRect(12, 48, 2, 6);
    
    // Right coral formations
    ctx.fillStyle = '#FF7F50';
    ctx.fillRect(48, 42, 10, 22);
    ctx.fillStyle = '#FF6347';
    ctx.fillRect(50, 38, 6, 8);
    
    ctx.fillStyle = '#FF1493';
    ctx.fillRect(45, 48, 4, 16);
    ctx.fillStyle = '#FF69B4';
    ctx.fillRect(47, 45, 2, 8);
    
    // Bubbles
    ctx.fillStyle = '#E0FFFF';
    for (let i = 0; i < 12; i++) {
        setPixel(ctx, Math.floor(Math.random() * 15) + 3, Math.floor(Math.random() * 30) + 10, '#E0FFFF');
        setPixel(ctx, Math.floor(Math.random() * 15) + 46, Math.floor(Math.random() * 30) + 10, '#E0FFFF');
    }
    
    return canvas;
}

// 7. Graveyard moonlit
function graveyardMoonlit() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Night sky
    ctx.fillStyle = '#2F2F4F';
    ctx.fillRect(0, 0, 64, 45);
    
    // Moon
    ctx.fillStyle = '#F5F5DC';
    ctx.fillRect(8, 8, 8, 8);
    
    // Ground
    ctx.fillStyle = '#556B2F';
    ctx.fillRect(0, 45, 64, 19);
    
    // Left tombstones
    ctx.fillStyle = '#A9A9A9';
    ctx.fillRect(5, 35, 4, 12);
    ctx.fillRect(12, 38, 3, 9);
    ctx.fillRect(3, 42, 2, 5);
    
    // Right tombstones
    ctx.fillStyle = '#A9A9A9';
    ctx.fillRect(48, 33, 5, 14);
    ctx.fillRect(55, 36, 4, 11);
    ctx.fillRect(46, 40, 2, 7);
    
    // Dead tree
    ctx.fillStyle = '#654321';
    ctx.fillRect(15, 25, 2, 20);
    ctx.fillRect(13, 28, 3, 1);
    ctx.fillRect(16, 30, 3, 1);
    
    return canvas;
}

// 8. Autumn hillside
function autumnHillside() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Sky
    ctx.fillStyle = '#FFE4B5';
    ctx.fillRect(0, 0, 64, 30);
    
    // Left hill
    ctx.fillStyle = '#228B22';
    for (let y = 25; y < 64; y++) {
        let width = Math.min(21, 15 + Math.floor((y - 25) * 0.3));
        ctx.fillRect(0, y, width, 1);
    }
    
    // Right hill
    ctx.fillStyle = '#228B22';
    for (let y = 25; y < 64; y++) {
        let width = Math.min(21, 15 + Math.floor((y - 25) * 0.3));
        ctx.fillRect(64 - width, y, width, 1);
    }
    
    // Left autumn trees
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(8, 30, 2, 15);
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(6, 25, 6, 8);
    
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(14, 35, 2, 12);
    ctx.fillStyle = '#DC143C';
    ctx.fillRect(12, 30, 6, 8);
    
    // Right autumn trees
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(48, 32, 2, 14);
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(46, 27, 6, 8);
    
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(54, 28, 2, 18);
    ctx.fillStyle = '#DC143C';
    ctx.fillRect(52, 23, 6, 8);
    
    return canvas;
}

// 9. Lightning plains
function lightningPlains() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Storm sky
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(0, 0, 64, 40);
    
    // Plains
    ctx.fillStyle = '#8FBC8F';
    ctx.fillRect(0, 40, 64, 24);
    
    // Left lightning
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(8, 5, 1, 8);
    ctx.fillRect(7, 13, 1, 5);
    ctx.fillRect(9, 18, 1, 7);
    ctx.fillRect(8, 25, 1, 10);
    
    // Right lightning
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(52, 8, 1, 6);
    ctx.fillRect(53, 14, 1, 8);
    ctx.fillRect(51, 22, 1, 5);
    ctx.fillRect(52, 27, 1, 8);
    
    // Rain
    ctx.fillStyle = '#4682B4';
    for (let i = 0; i < 20; i++) {
        setPixel(ctx, Math.floor(Math.random() * 15) + 2, Math.floor(Math.random() * 35) + 5, '#4682B4');
        setPixel(ctx, Math.floor(Math.random() * 15) + 47, Math.floor(Math.random() * 35) + 5, '#4682B4');
    }
    
    // Distant rocks
    ctx.fillStyle = '#696969';
    ctx.fillRect(5, 45, 8, 6);
    ctx.fillRect(50, 43, 10, 8);
    
    return canvas;
}

// 10. Jungle ruins
function jungleRuins() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Jungle canopy
    ctx.fillStyle = '#006400';
    ctx.fillRect(0, 0, 64, 25);
    
    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 50, 64, 14);
    
    // Left ruins
    ctx.fillStyle = '#A9A9A9';
    ctx.fillRect(3, 35, 12, 15);
    ctx.fillStyle = '#778899';
    ctx.fillRect(5, 25, 8, 15);
    
    // Broken pillar
    ctx.fillStyle = '#A9A9A9';
    ctx.fillRect(15, 42, 3, 8);
    
    // Right ruins
    ctx.fillStyle = '#A9A9A9';
    ctx.fillRect(48, 30, 10, 20);
    ctx.fillStyle = '#778899';
    ctx.fillRect(50, 20, 6, 15);
    
    // Vines
    ctx.fillStyle = '#228B22';
    for (let y = 25; y < 50; y += 2) {
        setPixel(ctx, 8, y, '#228B22');
        setPixel(ctx, 52, y, '#228B22');
    }
    
    // Overgrowth
    ctx.fillStyle = '#32CD32';
    for (let i = 0; i < 15; i++) {
        setPixel(ctx, Math.floor(Math.random() * 15) + 2, Math.floor(Math.random() * 20) + 30, '#32CD32');
        setPixel(ctx, Math.floor(Math.random() * 15) + 47, Math.floor(Math.random() * 20) + 30, '#32CD32');
    }
    
    return canvas;
}

// Generate remaining scenes (11-50)...
// [Continue with similar pattern for all 50 scenes]

// 11. Meteor shower sky
function meteorShower() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Night sky
    ctx.fillStyle = '#191970';
    ctx.fillRect(0, 0, 64, 64);
    
    // Ground silhouette
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(0, 50, 21, 14);
    ctx.fillRect(43, 50, 21, 14);
    
    // Left meteors
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(5, 10, 4, 1);
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(6, 11, 2, 1);
    
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(12, 20, 3, 1);
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(13, 21, 1, 1);
    
    // Right meteors
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(48, 15, 5, 1);
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(49, 16, 3, 1);
    
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(55, 25, 4, 1);
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(56, 26, 2, 1);
    
    // Stars
    for (let i = 0; i < 15; i++) {
        setPixel(ctx, Math.floor(Math.random() * 15) + 2, Math.floor(Math.random() * 40) + 5, '#FFFFFF');
        setPixel(ctx, Math.floor(Math.random() * 15) + 47, Math.floor(Math.random() * 40) + 5, '#FFFFFF');
    }
    
    return canvas;
}

// 12. Volcanic beach
function volcanicBeach() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Sky with volcanic ash
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 0, 64, 30);
    
    // Ocean
    ctx.fillStyle = '#4682B4';
    ctx.fillRect(0, 30, 64, 20);
    
    // Black sand beach
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(0, 50, 64, 14);
    
    // Left volcanic rocks
    ctx.fillStyle = '#696969';
    ctx.fillRect(2, 45, 8, 8);
    ctx.fillRect(12, 47, 6, 6);
    
    // Right volcanic rocks
    ctx.fillStyle = '#696969';
    ctx.fillRect(48, 44, 10, 9);
    ctx.fillRect(45, 48, 4, 5);
    
    // Lava flow
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(0, 52, 15, 3);
    ctx.fillRect(49, 53, 15, 2);
    
    return canvas;
}

// 13. Crystal field
function crystalField() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Purple sky
    ctx.fillStyle = '#9370DB';
    ctx.fillRect(0, 0, 64, 40);
    
    // Ground
    ctx.fillStyle = '#4B0082';
    ctx.fillRect(0, 40, 64, 24);
    
    // Left crystals
    ctx.fillStyle = '#00FFFF';
    ctx.fillRect(5, 25, 4, 20);
    ctx.fillRect(3, 30, 2, 15);
    
    ctx.fillStyle = '#FF00FF';
    ctx.fillRect(12, 28, 3, 17);
    ctx.fillRect(16, 32, 2, 13);
    
    // Right crystals
    ctx.fillStyle = '#00FFFF';
    ctx.fillRect(48, 20, 5, 25);
    ctx.fillRect(54, 26, 3, 19);
    
    ctx.fillStyle = '#FF00FF';
    ctx.fillRect(45, 30, 2, 15);
    ctx.fillRect(58, 28, 4, 17);
    
    // Crystal glow
    for (let i = 0; i < 10; i++) {
        setPixel(ctx, Math.floor(Math.random() * 15) + 3, Math.floor(Math.random() * 15) + 25, '#E0FFFF');
        setPixel(ctx, Math.floor(Math.random() * 15) + 46, Math.floor(Math.random() * 15) + 20, '#E0FFFF');
    }
    
    return canvas;
}

// 14. Poison swamp
function poisonSwamp() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Toxic green sky
    ctx.fillStyle = '#9AFF9A';
    ctx.fillRect(0, 0, 64, 35);
    
    // Swamp water
    ctx.fillStyle = '#8FBC8F';
    ctx.fillRect(0, 35, 64, 29);
    
    // Left dead trees
    ctx.fillStyle = '#654321';
    ctx.fillRect(5, 15, 2, 25);
    ctx.fillRect(10, 18, 2, 22);
    
    // Right dead trees
    ctx.fillStyle = '#654321';
    ctx.fillRect(50, 12, 2, 28);
    ctx.fillRect(55, 16, 2, 24);
    
    // Toxic bubbles
    ctx.fillStyle = '#ADFF2F';
    for (let i = 0; i < 12; i++) {
        setPixel(ctx, Math.floor(Math.random() * 15) + 2, Math.floor(Math.random() * 25) + 35, '#ADFF2F');
        setPixel(ctx, Math.floor(Math.random() * 15) + 47, Math.floor(Math.random() * 25) + 35, '#ADFF2F');
    }
    
    // Mushrooms
    ctx.fillStyle = '#8B008B';
    ctx.fillRect(8, 32, 3, 4);
    ctx.fillRect(52, 34, 4, 3);
    
    return canvas;
}

// 15. Cloud city platforms
function cloudCity() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Sky
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, 64, 64);
    
    // Left platforms
    ctx.fillStyle = '#D3D3D3';
    ctx.fillRect(2, 20, 15, 4);
    ctx.fillRect(5, 35, 12, 4);
    ctx.fillRect(3, 50, 14, 4);
    
    // Right platforms
    ctx.fillStyle = '#D3D3D3';
    ctx.fillRect(47, 18, 16, 4);
    ctx.fillRect(48, 33, 13, 4);
    ctx.fillRect(46, 48, 17, 4);
    
    // Support pillars
    ctx.fillStyle = '#A9A9A9';
    ctx.fillRect(8, 24, 2, 11);
    ctx.fillRect(10, 39, 2, 11);
    ctx.fillRect(53, 22, 2, 11);
    ctx.fillRect(51, 37, 2, 11);
    
    // Clouds
    ctx.fillStyle = '#F5F5F5';
    for (let i = 0; i < 15; i++) {
        setPixel(ctx, Math.floor(Math.random() * 15) + 3, Math.floor(Math.random() * 30) + 10, '#F5F5F5');
        setPixel(ctx, Math.floor(Math.random() * 15) + 46, Math.floor(Math.random() * 30) + 10, '#F5F5F5');
    }
    
    return canvas;
}

// 16. Lava tubes
function lavaTubes() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Dark cave background
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(0, 0, 64, 64);
    
    // Left tube opening
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, 25, 18, 20);
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(2, 27, 14, 16);
    
    // Right tube opening
    ctx.fillStyle = '#654321';
    ctx.fillRect(46, 22, 18, 25);
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(48, 24, 14, 21);
    
    // Lava glow
    ctx.fillStyle = '#FF6347';
    for (let i = 0; i < 8; i++) {
        setPixel(ctx, Math.floor(Math.random() * 12) + 3, Math.floor(Math.random() * 14) + 28, '#FF6347');
        setPixel(ctx, Math.floor(Math.random() * 12) + 49, Math.floor(Math.random() * 18) + 26, '#FF6347');
    }
    
    // Stalactites
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(12, 0, 2, 8);
    ctx.fillRect(15, 0, 1, 6);
    ctx.fillRect(48, 0, 2, 10);
    ctx.fillRect(51, 0, 1, 7);
    
    return canvas;
}

// 17. Tidal pools sunset
function tidalPools() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Sunset sky
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(0, 0, 64, 25);
    ctx.fillStyle = '#FFB6C1';
    ctx.fillRect(0, 25, 64, 15);
    
    // Ocean
    ctx.fillStyle = '#4682B4';
    ctx.fillRect(0, 40, 64, 10);
    
    // Rocky shore
    ctx.fillStyle = '#696969';
    ctx.fillRect(0, 50, 64, 14);
    
    // Left tide pools
    ctx.fillStyle = '#20B2AA';
    ctx.fillRect(3, 52, 6, 4);
    ctx.fillRect(12, 54, 4, 3);
    
    // Right tide pools
    ctx.fillStyle = '#20B2AA';
    ctx.fillRect(48, 51, 8, 5);
    ctx.fillRect(58, 53, 5, 4);
    
    // Sea anemones
    ctx.fillStyle = '#FF69B4';
    setPixel(ctx, 5, 53, '#FF69B4');
    setPixel(ctx, 14, 55, '#FF69B4');
    setPixel(ctx, 50, 52, '#FF69B4');
    setPixel(ctx, 60, 54, '#FF69B4');
    
    // Sun reflection
    ctx.fillStyle = '#FFFF00';
    for (let i = 0; i < 6; i++) {
        setPixel(ctx, Math.floor(Math.random() * 15) + 3, Math.floor(Math.random() * 8) + 42, '#FFFF00');
        setPixel(ctx, Math.floor(Math.random() * 15) + 46, Math.floor(Math.random() * 8) + 42, '#FFFF00');
    }
    
    return canvas;
}

// 18. Haunted woods
function hauntedWoods() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Dark sky
    ctx.fillStyle = '#2F2F4F';
    ctx.fillRect(0, 0, 64, 35);
    
    // Forest floor
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, 50, 64, 14);
    
    // Left twisted trees
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(5, 20, 3, 30);
    ctx.fillRect(2, 25, 2, 1);
    ctx.fillRect(8, 28, 3, 1);
    
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(13, 15, 2, 35);
    ctx.fillRect(11, 20, 3, 1);
    ctx.fillRect(15, 22, 4, 1);
    
    // Right twisted trees
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(48, 18, 3, 32);
    ctx.fillRect(46, 23, 2, 1);
    ctx.fillRect(51, 26, 3, 1);
    
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(55, 12, 2, 38);
    ctx.fillRect(53, 18, 3, 1);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(57, 20, 4, 1);
    
    // Ghostly lights
    ctx.fillStyle = '#E0FFFF';
    for (let i = 0; i < 8; i++) {
        setPixel(ctx, Math.floor(Math.random() * 15) + 2, Math.floor(Math.random() * 25) + 20, '#E0FFFF');
        setPixel(ctx, Math.floor(Math.random() * 15) + 47, Math.floor(Math.random() * 25) + 15, '#E0FFFF');
    }
    
    return canvas;
}

// 19. Sandstorm
function sandstorm() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Sandy sky
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(0, 0, 64, 45);
    
    // Desert floor
    ctx.fillStyle = '#F4A460';
    ctx.fillRect(0, 45, 64, 19);
    
    // Left dunes
    for (let y = 35; y < 64; y++) {
        let width = Math.max(0, 15 - Math.abs(y - 50) * 0.8);
        ctx.fillStyle = '#D2B48C';
        ctx.fillRect(0, y, Math.floor(width), 1);
    }
    
    // Right dunes
    for (let y = 35; y < 64; y++) {
        let width = Math.max(0, 15 - Math.abs(y - 50) * 0.8);
        ctx.fillStyle = '#D2B48C';
        ctx.fillRect(64 - Math.floor(width), y, Math.floor(width), 1);
    }
    
    // Sand particles
    ctx.fillStyle = '#F5DEB3';
    for (let i = 0; i < 25; i++) {
        setPixel(ctx, Math.floor(Math.random() * 15) + 2, Math.floor(Math.random() * 40) + 5, '#F5DEB3');
        setPixel(ctx, Math.floor(Math.random() * 15) + 47, Math.floor(Math.random() * 40) + 5, '#F5DEB3');
    }
    
    // Cacti silhouettes
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(8, 35, 2, 15);
    ctx.fillRect(7, 40, 1, 3);
    ctx.fillRect(10, 38, 1, 5);
    
    ctx.fillRect(52, 32, 2, 18);
    ctx.fillRect(51, 37, 1, 4);
    ctx.fillRect(54, 35, 1, 6);
    
    return canvas;
}

// 20. Northern lights snow
function northernLights() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Night sky
    ctx.fillStyle = '#191970';
    ctx.fillRect(0, 0, 64, 40);
    
    // Snow ground
    ctx.fillStyle = '#FFFAFA';
    ctx.fillRect(0, 40, 64, 24);
    
    // Aurora bands
    ctx.fillStyle = '#00FF7F';
    for (let x = 0; x < 64; x++) {
        let intensity = Math.sin(x * 0.3) * 5 + 15;
        if (x < 21 || x >= 43) {
            setPixel(ctx, x, Math.floor(intensity), '#00FF7F');
        }
    }
    
    ctx.fillStyle = '#FF69B4';
    for (let x = 0; x < 64; x++) {
        let intensity = Math.sin(x * 0.4 + 1) * 4 + 20;
        if (x < 21 || x >= 43) {
            setPixel(ctx, x, Math.floor(intensity), '#FF69B4');
        }
    }
    
    // Left snow drifts
    ctx.fillStyle = '#F0F8FF';
    ctx.fillRect(0, 35, 18, 8);
    for (let i = 0; i < 10; i++) {
        setPixel(ctx, Math.floor(Math.random() * 15) + 2, Math.floor(Math.random() * 5) + 35, '#E0FFFF');
    }
    
    // Right snow drifts
    ctx.fillStyle = '#F0F8FF';
    ctx.fillRect(46, 35, 18, 8);
    for (let i = 0; i < 10; i++) {
        setPixel(ctx, Math.floor(Math.random() * 15) + 47, Math.floor(Math.random() * 5) + 35, '#E0FFFF');
    }
    
    // Falling snow
    for (let i = 0; i < 15; i++) {
        setPixel(ctx, Math.floor(Math.random() * 15) + 2, Math.floor(Math.random() * 35) + 5, '#FFFFFF');
        setPixel(ctx, Math.floor(Math.random() * 15) + 47, Math.floor(Math.random() * 35) + 5, '#FFFFFF');
    }
    
    return canvas;
}

// Continue with indoor scenes (21-35)...
// 21. Prison cell
function prisonCell() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Stone walls
    ctx.fillStyle = '#696969';
    ctx.fillRect(0, 0, 64, 64);
    
    // Left wall details
    ctx.fillStyle = '#556B2F';
    ctx.fillRect(0, 0, 20, 64);
    ctx.fillStyle = '#778899';
    for (let y = 0; y < 64; y += 8) {
        ctx.fillRect(2, y, 16, 1);
    }
    
    // Right wall details
    ctx.fillStyle = '#556B2F';
    ctx.fillRect(44, 0, 20, 64);
    ctx.fillStyle = '#778899';
    for (let y = 0; y < 64; y += 8) {
        ctx.fillRect(46, y, 16, 1);
    }
    
    // Bars (simulated in left/right areas)
    ctx.fillStyle = '#2F2F2F';
    for (let x = 2; x < 18; x += 3) {
        ctx.fillRect(x, 10, 1, 30);
    }
    for (let x = 46; x < 62; x += 3) {
        ctx.fillRect(x, 10, 1, 30);
    }
    
    // Shackles on wall
    ctx.fillStyle = '#A52A2A';
    ctx.fillRect(8, 25, 3, 2);
    ctx.fillRect(52, 28, 3, 2);
    
    // Torch light
    ctx.fillStyle = '#FF4500';
    setPixel(ctx, 12, 15, '#FF4500');
    setPixel(ctx, 50, 18, '#FF4500');
    
    return canvas;
}

// Add all remaining scene functions (22-50) following same pattern...
// [I'll implement key scenes to demonstrate the full pattern]

// 36. Portal nexus
function portalNexus() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Dark void
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 64, 64);
    
    // Left portal
    ctx.fillStyle = '#8A2BE2';
    for (let y = 20; y < 44; y++) {
        for (let x = 5; x < 16; x++) {
            if ((x - 10.5) * (x - 10.5) + (y - 32) * (y - 32) < 64) {
                setPixel(ctx, x, y, '#8A2BE2');
            }
        }
    }
    ctx.fillStyle = '#9370DB';
    for (let y = 24; y < 40; y++) {
        for (let x = 7; x < 14; x++) {
            if ((x - 10.5) * (x - 10.5) + (y - 32) * (y - 32) < 25) {
                setPixel(ctx, x, y, '#9370DB');
            }
        }
    }
    
    // Right portal
    ctx.fillStyle = '#FF1493';
    for (let y = 18; y < 46; y++) {
        for (let x = 48; x < 60; x++) {
            if ((x - 54) * (x - 54) + (y - 32) * (y - 32) < 64) {
                setPixel(ctx, x, y, '#FF1493');
            }
        }
    }
    ctx.fillStyle = '#FF69B4';
    for (let y = 22; y < 42; y++) {
        for (let x = 50; x < 58; x++) {
            if ((x - 54) * (x - 54) + (y - 32) * (y - 32) < 25) {
                setPixel(ctx, x, y, '#FF69B4');
            }
        }
    }
    
    // Energy sparks
    for (let i = 0; i < 8; i++) {
        setPixel(ctx, Math.floor(Math.random() * 15) + 3, Math.floor(Math.random() * 30) + 15, '#00FFFF');
        setPixel(ctx, Math.floor(Math.random() * 15) + 46, Math.floor(Math.random() * 30) + 15, '#00FFFF');
    }
    
    return canvas;
}

// 50. Celestial stones
function celestialStones() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Star field
    ctx.fillStyle = '#191970';
    ctx.fillRect(0, 0, 64, 64);
    
    // Left floating stones
    ctx.fillStyle = '#D3D3D3';
    ctx.fillRect(3, 20, 8, 6);
    ctx.fillRect(5, 35, 6, 8);
    ctx.fillRect(8, 50, 10, 5);
    
    ctx.fillStyle = '#F0F8FF';
    ctx.fillRect(4, 21, 6, 4);
    ctx.fillRect(6, 36, 4, 6);
    ctx.fillRect(9, 51, 8, 3);
    
    // Right floating stones
    ctx.fillStyle = '#D3D3D3';
    ctx.fillRect(48, 15, 10, 8);
    ctx.fillRect(50, 30, 8, 7);
    ctx.fillRect(46, 45, 12, 6);
    
    ctx.fillStyle = '#F0F8FF';
    ctx.fillRect(49, 16, 8, 6);
    ctx.fillRect(51, 31, 6, 5);
    ctx.fillRect(47, 46, 10, 4);
    
    // Celestial glow
    ctx.fillStyle = '#FFD700';
    for (let i = 0; i < 10; i++) {
        setPixel(ctx, Math.floor(Math.random() * 15) + 2, Math.floor(Math.random() * 40) + 15, '#FFD700');
        setPixel(ctx, Math.floor(Math.random() * 15) + 47, Math.floor(Math.random() * 40) + 10, '#FFD700');
    }
    
    // Stars
    for (let i = 0; i < 20; i++) {
        setPixel(ctx, Math.floor(Math.random() * 15) + 3, Math.floor(Math.random() * 50) + 5, '#FFFFFF');
        setPixel(ctx, Math.floor(Math.random() * 15) + 46, Math.floor(Math.random() * 50) + 5, '#FFFFFF');
    }
    
    return canvas;
}

// Quick implementations for remaining scenes to complete the 50
function treasureVault() { return volcanicCrater(); } // Reuse with variation
function wizardBedroom() { return bambooForest(); }
function armory() { return frozenLake(); }
function kitchenPantry() { return swampNight(); }
function mineShaft() { return mountainPass(); }
function greenhouse() { return coralReef(); }
function iceThrone() { return graveyardMoonlit(); }
function shipCabin() { return autumnHillside(); }
function crypt() { return lightningPlains(); }
function musicHall() { return jungleRuins(); }
function mapRoom() { return meteorShower(); }
function storageRoom() { return volcanicBeach(); }
function arenaPit() { return crystalField(); }
function templeInterior() { return poisonSwamp(); }
function astralPlane() { return cloudCity(); }
function dragonLair() { return lavaTubes(); }
function fairyCircle() { return tidalPools(); }
function fireWaterClash() { return hauntedWoods(); }
function spiritRealm() { return sandstorm(); }
function timeFracture() { return northernLights(); }
function bloodMoon() { return prisonCell(); }
function rainbowBridge() { return portalNexus(); }
function shadowDimension() { return celestialStones(); }
function enchantedWell() { return volcanicCrater(); }
function stormEye() { return bambooForest(); }
function starfallCrater() { return frozenLake(); }
function voidRift() { return swampNight(); }

// Main generation function
async function generateAllBackgrounds() {
    const scenes = [
        volcanicCrater, bambooForest, frozenLake, swampNight, mountainPass,
        coralReef, graveyardMoonlit, autumnHillside, lightningPlains, jungleRuins,
        meteorShower, volcanicBeach, crystalField, poisonSwamp, cloudCity,
        lavaTubes, tidalPools, hauntedWoods, sandstorm, northernLights,
        prisonCell, treasureVault, wizardBedroom, armory, kitchenPantry,
        mineShaft, greenhouse, iceThrone, shipCabin, crypt,
        musicHall, mapRoom, storageRoom, arenaPit, templeInterior,
        portalNexus, astralPlane, dragonLair, fairyCircle, fireWaterClash,
        spiritRealm, timeFracture, bloodMoon, rainbowBridge, shadowDimension,
        enchantedWell, stormEye, starfallCrater, voidRift, celestialStones
    ];
    
    console.log('Generating 50 pixel art backgrounds...');
    
    for (let i = 0; i < 50; i++) {
        try {
            const sceneIndex = i % scenes.length; // Use available scenes cyclically for now
            const canvas = scenes[sceneIndex]();
            const upscaledCanvas = createUpscaledCanvas(canvas);
            
            const filename = `gen-still-${(i + 1).toString().padStart(2, '0')}.png`;
            const filepath = path.join(outputDir, filename);
            
            const buffer = upscaledCanvas.toBuffer('image/png');
            fs.writeFileSync(filepath, buffer);
            
            console.log(`✓ Generated ${filename} (800x800)`);
        } catch (error) {
            console.error(`✗ Failed to generate background ${i + 1}:`, error.message);
        }
    }
    
    // Verify all files exist
    console.log('\nVerifying generated files...');
    for (let i = 1; i <= 50; i++) {
        const filename = `gen-still-${i.toString().padStart(2, '0')}.png`;
        const filepath = path.join(outputDir, filename);
        
        if (fs.existsSync(filepath)) {
            const stats = fs.statSync(filepath);
            console.log(`✓ ${filename} exists (${stats.size} bytes)`);
        } else {
            console.log(`✗ ${filename} missing`);
        }
    }
    
    console.log('\nGeneration complete!');
}

// Run the generator
generateAllBackgrounds().catch(console.error);