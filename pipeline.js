/**
 * Production Pixel Art Pipeline for Order of 86 Website
 * 
 * Generates 12 key scenes for Order of 86 lore:
 * - 6 Cities: Crucible, Aurelius, Stillwater, Roothold, Archivum, Bondsheart
 * - 6 Special Locations: Wizard Tower Interior, The Wanderer's Path, Sorting Ceremony Hall, Moon Bridge, Dragon's Lair, Enchanted Forest
 */

const { createCanvas } = require('canvas');
const fs = require('fs').promises;
const path = require('path');

// Import the fixed pixel engine
const {
  RAMPS,
  setPixel,
  drawSprite,
  fillBackground,
  ditherFill,
  ditherGradient,
  tree_pine,
  tree_oak,
  tree_dead,
  rock_cluster,
  crystal,
  torch,
  bookshelf,
  pillar,
  window_arch,
  banner,
  mushroom,
  stalactite,
  fence_post,
  cauldron,
  lantern,
  drawSky,
  drawGround,
  drawWalls,
  drawWater,
  drawLava,
  drawParticles,
  drawMoon
} = require('./pixel-engine.js');

// Utility function to upscale canvas with nearest-neighbor
function upscaleCanvas(sourceCanvas, scale) {
  const targetCanvas = createCanvas(sourceCanvas.width * scale, sourceCanvas.height * scale);
  const targetCtx = targetCanvas.getContext('2d');
  targetCtx.imageSmoothingEnabled = false;
  targetCtx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width * scale, sourceCanvas.height * scale);
  return targetCanvas;
}

// Scene definitions
const scenes = {
  // ====== THE SIX CITIES ======
  
  crucible: {
    name: "Crucible - The Forge City",
    generator: (ctx) => {
      // Industrial forge city with lava forges and smoke
      fillBackground(ctx, '#1a0a0a');
      drawSky(ctx, 'sky_sunset', 5, 120); // Smoky sunset sky
      
      // Background mountains with forges
      for (let x = 0; x < 200; x += 20) {
        const mountainHeight = 40 + Math.sin(x * 0.1) * 20;
        for (let y = 120 - mountainHeight; y < 120; y++) {
          setPixel(ctx, x + Math.floor(Math.random() * 20), y, RAMPS.stone[1 + Math.floor(Math.random() * 2)]);
        }
      }
      
      drawGround(ctx, 150, 'stone', 'cobblestone');
      
      // Add forge structures
      drawSprite(ctx, 30, 100, pillar(50, 'stone'), 'stone');
      drawSprite(ctx, 80, 120, torch());
      drawSprite(ctx, 120, 110, cauldron());
      drawSprite(ctx, 160, 100, pillar(50, 'stone'), 'stone');
      
      // Lava forges
      drawLava(ctx, 170);
      
      // Embers and smoke particles
      drawParticles(ctx, 'embers', 30);
    }
  },

  aurelius: {
    name: "Aurelius - The Golden Citadel",
    generator: (ctx) => {
      // Majestic golden city with spires and banners
      fillBackground(ctx, '#ffd700');
      drawSky(ctx, 'sky_sunset', 10, 100);
      
      drawGround(ctx, 140, 'gold', 'smooth');
      
      // Golden spires and architecture
      drawSprite(ctx, 20, 60, pillar(80, 'gold'), 'gold');
      drawSprite(ctx, 60, 50, pillar(90, 'gold'), 'gold');
      drawSprite(ctx, 100, 70, pillar(70, 'gold'), 'gold');
      drawSprite(ctx, 140, 55, pillar(85, 'gold'), 'gold');
      drawSprite(ctx, 180, 65, pillar(75, 'gold'), 'gold');
      
      // Golden banners
      drawSprite(ctx, 40, 30, banner('#ffd700', 25));
      drawSprite(ctx, 120, 25, banner('#ffaa00', 30));
      
      // Glowing windows
      drawSprite(ctx, 25, 80, window_arch('gold', '#ffddaa'));
      drawSprite(ctx, 105, 90, window_arch('gold', '#ffddaa'));
      
      // Golden particles (sunlight)
      drawParticles(ctx, 'dust', 15);
    }
  },

  stillwater: {
    name: "Stillwater - The Lake Village",
    generator: (ctx) => {
      // Peaceful lakeside village with wooden docks
      fillBackground(ctx, '#4a7aae');
      drawSky(ctx, 'water', 15, 80);
      
      // Background hills
      for (let x = 0; x < 200; x += 15) {
        const hillHeight = 30 + Math.sin(x * 0.08) * 15;
        for (let y = 80 - hillHeight; y < 80; y++) {
          setPixel(ctx, x + Math.floor(Math.random() * 15), y, RAMPS.forest[2 + Math.floor(Math.random() * 2)]);
        }
      }
      
      drawWater(ctx, 80, 'water', 120);
      
      // Wooden docks and structures
      drawSprite(ctx, 20, 60, fence_post(40));
      drawSprite(ctx, 40, 60, fence_post(40));
      drawSprite(ctx, 60, 60, fence_post(40));
      
      // Lake village elements
      drawSprite(ctx, 100, 50, tree_oak(30, 'forest'), 'forest');
      drawSprite(ctx, 150, 40, tree_pine(40, 'forest'), 'forest');
      
      // Lanterns for evening ambiance
      drawSprite(ctx, 35, 45, lantern('#ffddaa'));
      drawSprite(ctx, 55, 45, lantern('#ffddaa'));
      
      // Water reflections as particles
      drawParticles(ctx, 'fireflies', 8);
    }
  },

  roothold: {
    name: "Roothold - The Forest Fortress",
    generator: (ctx) => {
      // Dense forest city built into and around massive trees
      fillBackground(ctx, '#0a1a0a');
      drawSky(ctx, 'forest', 20, 60);
      
      drawGround(ctx, 160, 'forest', 'rough');
      
      // Massive ancient trees forming the city
      drawSprite(ctx, 10, 20, tree_oak(140, 'forest'), 'forest');
      drawSprite(ctx, 80, 30, tree_pine(130, 'forest'), 'forest');
      drawSprite(ctx, 140, 10, tree_oak(150, 'forest'), 'forest');
      
      // Tree houses and platforms
      drawSprite(ctx, 30, 80, fence_post(20));
      drawSprite(ctx, 45, 80, fence_post(20));
      drawSprite(ctx, 60, 80, fence_post(20));
      
      // Mushroom houses
      drawSprite(ctx, 25, 140, mushroom(20, 'forest'));
      drawSprite(ctx, 160, 130, mushroom(30, 'forest'));
      
      // Forest magic particles
      drawParticles(ctx, 'fireflies', 25);
      drawParticles(ctx, 'petals', 10);
    }
  },

  archivum: {
    name: "Archivum - The Great Library",
    generator: (ctx) => {
      // Towering library with countless books and scrolls
      fillBackground(ctx, '#2a1a1a');
      drawSky(ctx, 'purple', 5, 50);
      
      drawGround(ctx, 180, 'stone', 'smooth');
      
      // Library walls with bookshelves
      drawWalls(ctx, 'stone', [
        { sprite: bookshelf(40), x: 10, y: 60, ramp: 'wood' },
        { sprite: bookshelf(50), x: 10, y: 110, ramp: 'wood' },
        { sprite: window_arch('stone', '#ddddff'), x: 15, y: 20 }
      ], [
        { sprite: bookshelf(45), x: 150, y: 70, ramp: 'wood' },
        { sprite: bookshelf(55), x: 150, y: 115, ramp: 'wood' },
        { sprite: lantern('#ddddff'), x: 175, y: 40 }
      ]);
      
      // Central reading area
      drawSprite(ctx, 80, 120, pillar(60, 'stone'), 'stone');
      drawSprite(ctx, 120, 120, pillar(60, 'stone'), 'stone');
      
      // Floating magical books as particles
      drawParticles(ctx, 'dust', 20);
    }
  },

  bondsheart: {
    name: "Bondsheart - The Mountain Stronghold",
    generator: (ctx) => {
      // Fortress carved into mountain peaks
      fillBackground(ctx, '#1a1a2e');
      drawSky(ctx, 'sky_night', 30, 80);
      
      // Mountain backdrop
      for (let x = 0; x < 200; x += 25) {
        const mountainHeight = 60 + Math.sin(x * 0.06) * 40;
        for (let y = 80 - mountainHeight; y < 80; y++) {
          setPixel(ctx, x + Math.floor(Math.random() * 25), y, RAMPS.stone[Math.floor(Math.random() * 3)]);
        }
      }
      
      drawGround(ctx, 150, 'stone', 'rough');
      
      // Fortress structures
      drawSprite(ctx, 40, 60, pillar(90, 'stone'), 'stone');
      drawSprite(ctx, 80, 50, pillar(100, 'stone'), 'stone');
      drawSprite(ctx, 120, 55, pillar(95, 'stone'), 'stone');
      drawSprite(ctx, 160, 65, pillar(85, 'stone'), 'stone');
      
      // Defensive elements
      drawSprite(ctx, 60, 30, banner('#cc4444', 25));
      drawSprite(ctx, 140, 25, banner('#cc4444', 30));
      
      // Torches for illumination
      drawSprite(ctx, 30, 100, torch());
      drawSprite(ctx, 170, 105, torch());
      
      // Mountain snow
      drawParticles(ctx, 'snow', 15);
    }
  },

  // ====== SPECIAL LOCATIONS ======

  wizardTowerInterior: {
    name: "Wizard Tower Interior",
    generator: (ctx) => {
      fillBackground(ctx, '#2a1a4e');
      
      // No sky - we're inside
      drawWalls(ctx, 'purple', [
        { sprite: bookshelf(60), x: 5, y: 40, ramp: 'wood' },
        { sprite: cauldron(), x: 20, y: 160 },
        { sprite: crystal(25, '#9966ff'), x: 10, y: 120 }
      ], [
        { sprite: bookshelf(70), x: 160, y: 30, ramp: 'wood' },
        { sprite: lantern('#ddddff'), x: 175, y: 80 },
        { sprite: crystal(30, '#ff66cc'), x: 165, y: 130 }
      ]);
      
      drawGround(ctx, 170, 'stone', 'smooth');
      
      // Central magical apparatus
      drawSprite(ctx, 80, 120, pillar(50, 'purple'), 'purple');
      drawSprite(ctx, 120, 115, crystal(35, '#ccaaff'));
      
      // Floating magical particles
      drawParticles(ctx, 'fireflies', 40);
      drawParticles(ctx, 'dust', 15);
    }
  },

  wanderersPath: {
    name: "The Wanderer's Path",
    generator: (ctx) => {
      fillBackground(ctx, '#1a3a1a');
      drawSky(ctx, 'forest', 25, 100);
      
      // Winding forest path
      drawGround(ctx, 140, 'wood', 'rough');
      
      // Path through forest
      for (let y = 140; y < 200; y += 5) {
        const pathCenter = 100 + Math.sin(y * 0.1) * 20;
        for (let x = pathCenter - 10; x < pathCenter + 10; x++) {
          if (x >= 0 && x < 200) {
            setPixel(ctx, x, y, RAMPS.sand[2]);
          }
        }
      }
      
      // Forest on both sides
      drawSprite(ctx, 20, 60, tree_pine(80, 'forest'), 'forest');
      drawSprite(ctx, 40, 70, tree_oak(70, 'forest'), 'forest');
      drawSprite(ctx, 160, 50, tree_pine(90, 'forest'), 'forest');
      drawSprite(ctx, 180, 65, tree_oak(75, 'forest'), 'forest');
      
      // Mushrooms and undergrowth
      drawSprite(ctx, 15, 130, mushroom(15, 'forest'));
      drawSprite(ctx, 170, 125, mushroom(20, 'forest'));
      
      // Path markers
      drawSprite(ctx, 60, 120, fence_post(25));
      drawSprite(ctx, 140, 115, fence_post(25));
      
      drawParticles(ctx, 'fireflies', 20);
      drawParticles(ctx, 'petals', 8);
    }
  },

  sortingCeremonyHall: {
    name: "Sorting Ceremony Hall",
    generator: (ctx) => {
      fillBackground(ctx, '#4a2a6e');
      
      // Grand hall interior
      drawWalls(ctx, 'stone', [
        { sprite: pillar(80, 'stone'), x: 20, y: 40, ramp: 'stone' },
        { sprite: banner('#ff4444', 40), x: 30, y: 20 },
        { sprite: torch(), x: 35, y: 60 }
      ], [
        { sprite: pillar(80, 'stone'), x: 160, y: 40, ramp: 'stone' },
        { sprite: banner('#4444ff', 40), x: 150, y: 20 },
        { sprite: torch(), x: 155, y: 60 }
      ]);
      
      drawGround(ctx, 170, 'stone', 'smooth');
      
      // Central ceremonial area
      drawSprite(ctx, 80, 100, pillar(70, 'gold'), 'gold');
      drawSprite(ctx, 120, 105, pillar(65, 'gold'), 'gold');
      
      // Magical sorting crystal
      drawSprite(ctx, 100, 80, crystal(40, '#ffffff'));
      
      // Ceremony candles
      drawSprite(ctx, 60, 140, lantern('#ffddaa'));
      drawSprite(ctx, 140, 140, lantern('#ffddaa'));
      
      drawParticles(ctx, 'fireflies', 35);
    }
  },

  moonBridge: {
    name: "Moon Bridge",
    generator: (ctx) => {
      fillBackground(ctx, '#050510');
      drawSky(ctx, 'sky_night', 50, 200);
      
      // No ground - we're on a bridge in the sky
      
      // Bridge structure
      for (let x = 0; x < 200; x += 20) {
        drawSprite(ctx, x, 140, pillar(60, 'stone'), 'stone');
      }
      
      // Bridge deck
      for (let x = 0; x < 200; x++) {
        for (let y = 160; y < 170; y++) {
          setPixel(ctx, x, y, RAMPS.stone[2]);
        }
      }
      
      // Moon in the sky
      drawMoon(ctx, 150, 40, 25, '#ffffff', 15);
      
      // Bridge lanterns
      drawSprite(ctx, 30, 120, lantern('#ddddff'));
      drawSprite(ctx, 90, 120, lantern('#ddddff'));
      drawSprite(ctx, 150, 120, lantern('#ddddff'));
      
      // Stars and moonlight
      drawParticles(ctx, 'fireflies', 30);
    }
  },

  dragonsLair: {
    name: "Dragon's Lair",
    generator: (ctx) => {
      fillBackground(ctx, '#1a0000');
      
      // Cave ceiling with stalactites
      for (let x = 0; x < 200; x += 30) {
        drawSprite(ctx, x + 10, 0, stalactite(40 + Math.floor(Math.random() * 20), 'stone'), 'stone');
      }
      
      // Lava pools
      drawLava(ctx, 160);
      
      // Cave walls
      drawWalls(ctx, 'stone', [
        { sprite: crystal(30, '#ff4444'), x: 20, y: 100 },
        { sprite: crystal(25, '#ff6666'), x: 30, y: 130 }
      ], [
        { sprite: crystal(35, '#ff4444'), x: 160, y: 90 },
        { sprite: crystal(20, '#ff6666'), x: 170, y: 120 }
      ]);
      
      // Treasure pile
      drawSprite(ctx, 80, 120, rock_cluster(40, 'gold'), 'gold');
      drawSprite(ctx, 100, 110, crystal(50, '#ffd700'));
      drawSprite(ctx, 120, 125, rock_cluster(30, 'gold'), 'gold');
      
      // Dragon fire particles
      drawParticles(ctx, 'embers', 50);
    }
  },

  enchantedForest: {
    name: "Enchanted Forest",
    generator: (ctx) => {
      fillBackground(ctx, '#0a1a0a');
      drawSky(ctx, 'forest', 30, 80);
      
      drawGround(ctx, 150, 'forest', 'rough');
      
      // Magical trees with crystals
      drawSprite(ctx, 20, 30, tree_oak(120, 'forest'), 'forest');
      drawSprite(ctx, 60, 40, tree_pine(110, 'forest'), 'forest');
      drawSprite(ctx, 120, 20, tree_oak(130, 'forest'), 'forest');
      drawSprite(ctx, 160, 35, tree_pine(115, 'forest'), 'forest');
      
      // Magical crystals growing from trees
      drawSprite(ctx, 35, 100, crystal(25, '#88ff88'));
      drawSprite(ctx, 75, 90, crystal(20, '#8888ff'));
      drawSprite(ctx, 135, 80, crystal(30, '#ff88ff'));
      drawSprite(ctx, 175, 95, crystal(22, '#88ffff'));
      
      // Enchanted mushrooms
      drawSprite(ctx, 15, 135, mushroom(25, 'crystal'));
      drawSprite(ctx, 170, 130, mushroom(30, 'crystal'));
      
      // Magical particles
      drawParticles(ctx, 'fireflies', 60);
      drawParticles(ctx, 'petals', 20);
    }
  }
};

async function generateScene(sceneName, sceneConfig) {
  console.log(`Generating scene: ${sceneConfig.name}`);
  
  // Create 200x200 canvas
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  
  // Generate the scene
  sceneConfig.generator(ctx);
  
  // Upscale to 800x800 with nearest-neighbor
  const upscaledCanvas = upscaleCanvas(canvas, 4);
  
  // Save the PNG
  const outputPath = path.join(__dirname, 'content-bg', 'pipeline', `${sceneName}.png`);
  const buffer = upscaledCanvas.toBuffer('image/png');
  await fs.writeFile(outputPath, buffer);
  
  console.log(`✓ Saved ${sceneConfig.name} (${buffer.length} bytes)`);
  return { name: sceneConfig.name, filename: `${sceneName}.png`, size: buffer.length };
}

async function generatePreviewHTML(results) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order of 86 - Pipeline Preview</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            background: #0a0a0a;
            color: #ffffff;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            text-align: center;
            color: #ffd700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            margin-bottom: 30px;
        }
        .scenes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .scene-card {
            background: #1a1a2e;
            border: 2px solid #333;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        .scene-card h3 {
            color: #66ccff;
            margin: 0 0 10px 0;
            font-size: 14px;
        }
        .scene-card img {
            width: 200px;
            height: 200px;
            border: 1px solid #666;
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
        }
        .scene-card p {
            margin: 8px 0 0 0;
            font-size: 12px;
            color: #999;
        }
        .stats {
            background: #2a2a4e;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        .stats h3 {
            margin-top: 0;
            color: #ff6666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Order of 86 - Pixel Art Pipeline Preview</h1>
        
        <div class="scenes-grid">
            ${results.map(result => `
            <div class="scene-card">
                <h3>${result.name}</h3>
                <img src="${result.filename}" alt="${result.name}" />
                <p>Size: ${Math.round(result.size / 1024)}KB</p>
            </div>
            `).join('')}
        </div>
        
        <div class="stats">
            <h3>Pipeline Statistics</h3>
            <p>Total Scenes: ${results.length}</p>
            <p>Total Size: ${Math.round(results.reduce((acc, r) => acc + r.size, 0) / 1024)}KB</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p>Resolution: 800×800 (upscaled from 200×200)</p>
        </div>
    </div>
</body>
</html>`;

  const previewPath = path.join(__dirname, 'content-bg', 'pipeline', 'preview.html');
  await fs.writeFile(previewPath, html);
  console.log('✓ Generated preview.html');
}

async function main() {
  console.log('🎨 Order of 86 Pixel Art Pipeline Starting...\n');
  
  // Ensure output directory exists
  const outputDir = path.join(__dirname, 'content-bg', 'pipeline');
  await fs.mkdir(outputDir, { recursive: true });
  
  const results = [];
  
  // Generate all scenes
  for (const [sceneName, sceneConfig] of Object.entries(scenes)) {
    try {
      const result = await generateScene(sceneName, sceneConfig);
      results.push(result);
    } catch (error) {
      console.error(`❌ Failed to generate ${sceneName}:`, error);
    }
  }
  
  // Generate preview HTML
  if (results.length > 0) {
    await generatePreviewHTML(results);
  }
  
  console.log(`\n🎉 Pipeline Complete!`);
  console.log(`📊 Generated ${results.length} scenes`);
  console.log(`📂 Output: content-bg/pipeline/`);
  console.log(`🌐 Preview: content-bg/pipeline/preview.html`);
  
  // Report results
  const totalSize = results.reduce((acc, r) => acc + r.size, 0);
  console.log(`📏 Total size: ${Math.round(totalSize / 1024)}KB`);
  console.log(`📐 Average size: ${Math.round(totalSize / results.length / 1024)}KB per scene`);
  
  return results;
}

// Run the pipeline
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, scenes };