/**
 * High-Quality Background Generator for Order of 86
 * 
 * Generates 15 professional pixel art backgrounds using the pixel engine.
 * Each background is drawn at 200x200 and upscaled to 1600x1600 using nearest-neighbor.
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Import our pixel art engine
const {
  RAMPS,
  setPixel,
  drawSprite,
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

// Ensure output directory exists
const outputDir = path.join(process.env.HOME, '.openclaw/workspace/order-of-86-website/content-bg/still');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Utility function to upscale canvas using nearest-neighbor
function upscaleCanvas(sourceCanvas, targetSize) {
  const scale = targetSize / sourceCanvas.width;
  const upscaledCanvas = createCanvas(targetSize, targetSize);
  const upscaledCtx = upscaledCanvas.getContext('2d');
  
  // Disable smoothing for pixel-perfect upscaling
  upscaledCtx.imageSmoothingEnabled = false;
  upscaledCtx.scale(scale, scale);
  upscaledCtx.drawImage(sourceCanvas, 0, 0);
  
  return upscaledCanvas;
}

// Save background to file
function saveBackground(canvas, filename) {
  const upscaled = upscaleCanvas(canvas, 1600);
  const buffer = upscaled.toBuffer('image/png');
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, buffer);
  console.log(`✅ Generated: ${filename} (${buffer.length} bytes)`);
}

// ============================================================================
// BACKGROUND GENERATORS
// ============================================================================

function generateCrucibleGates() {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  
  // Orange/red sky with embers
  drawSky(ctx, 'sky_sunset', 0);
  
  // Ground with lava channels
  drawGround(ctx, 160, 'stone', 'cobblestone');
  
  // Lava channels
  for (let x = 80; x < 120; x += 10) {
    drawLava(ctx, 170 + Math.sin(x * 0.1) * 5);
  }
  
  // Massive iron gates on left and right
  const gateSprite = pillar(40, 'stone');
  drawSprite(ctx, 10, 120, gateSprite, 'stone');
  drawSprite(ctx, 175, 120, gateSprite, 'stone');
  
  // Gate bars
  for (let y = 130; y < 160; y += 3) {
    for (let x = 20; x < 35; x++) setPixel(ctx, x, y, '#2a2a2a');
    for (let x = 180; x < 195; x++) setPixel(ctx, x, y, '#2a2a2a');
  }
  
  // Forge towers in background
  const towerSprite = pillar(25, 'stone');
  drawSprite(ctx, 30, 100, towerSprite, 'stone');
  drawSprite(ctx, 155, 95, towerSprite, 'stone');
  
  // Ember particles
  drawParticles(ctx, 'embers', 30);
  
  return canvas;
}

function generateRootholdVillage() {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  
  // Forest canopy sky
  drawSky(ctx, 'forest', 0);
  
  // Forest ground with mushrooms
  drawGround(ctx, 170, 'forest', 'rough');
  
  // Large trees on sides
  const leftTree = tree_oak(35, 'forest');
  const rightTree = tree_pine(40, 'forest');
  drawSprite(ctx, 5, 125, leftTree, 'forest');
  drawSprite(ctx, 160, 120, rightTree, 'forest');
  
  // Treehouses in the trees
  const housePlatform = [
    ['#6a4530', '#6a4530', '#6a4530', '#6a4530', '#6a4530', '#6a4530'],
    ['#5a4530', '#5a4530', '#5a4530', '#5a4530', '#5a4530', '#5a4530']
  ];
  drawSprite(ctx, 20, 140, housePlatform);
  drawSprite(ctx, 170, 135, housePlatform);
  
  // Rope bridges
  for (let x = 50; x < 150; x += 2) {
    setPixel(ctx, x, 142, '#8a6a50');
  }
  
  // Mushrooms on ground
  for (let i = 0; i < 5; i++) {
    const mushroomX = 70 + i * 15;
    const mushroomSprite = mushroom(8, 'forest');
    drawSprite(ctx, mushroomX, 185, mushroomSprite, 'forest');
  }
  
  // Soft green light filtering through
  drawParticles(ctx, 'fireflies', 15);
  
  return canvas;
}

function generateArchivumEntrance() {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  
  // Starry night sky
  drawSky(ctx, 'sky_night', 25);
  
  // Stone ground
  drawGround(ctx, 180, 'stone', 'smooth');
  
  // Huge purple archway on left
  const archSprite = window_arch('purple', '#aa7ace');
  drawSprite(ctx, 15, 100, archSprite, 'purple');
  
  // Crystal lanterns on right pillar
  const rightPillar = pillar(30, 'purple');
  drawSprite(ctx, 175, 150, rightPillar, 'purple');
  
  const lanternSprite = lantern('#aa7ace');
  drawSprite(ctx, 177, 140, lanternSprite);
  drawSprite(ctx, 177, 160, lanternSprite);
  
  // Floating runes
  const runePositions = [[80, 60], [120, 45], [90, 80], [110, 70]];
  runePositions.forEach(([x, y]) => {
    setPixel(ctx, x, y, '#aa7ace');
    setPixel(ctx, x+1, y, '#aa7ace');
    setPixel(ctx, x, y+1, '#aa7ace');
  });
  
  // Mystical fog at ground level
  ditherFill(ctx, 0, 175, 200, 10, '#aa7ace', '#1a0a2e', 'horizontal');
  
  return canvas;
}

function generateMoonlitCliffs() {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  
  // Night sky
  drawSky(ctx, 'sky_night', 20);
  
  // Large Palehowl moon
  drawMoon(ctx, 100, 40, 25, '#e0e0ff', 35);
  
  // Rocky cliffs on sides
  const leftCliff = rock_cluster(25, 'stone');
  const rightCliff = rock_cluster(30, 'stone');
  drawSprite(ctx, 5, 100, leftCliff, 'stone');
  drawSprite(ctx, 165, 90, rightCliff, 'stone');
  
  // Ocean far below (dithered blue)
  drawWater(ctx, 185, 'water', 15);
  
  // Windswept grass
  for (let x = 70; x < 130; x += 3) {
    for (let y = 0; y < 5; y++) {
      if (Math.random() > 0.5) setPixel(ctx, x, 180 + y, '#2a5a2a');
    }
  }
  
  return canvas;
}

function generateCherryBlossomPath() {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  
  // Soft evening sky
  drawSky(ctx, 'sky_sunset', 3);
  
  // Stone path
  drawGround(ctx, 170, 'stone', 'cobblestone');
  
  // Cherry trees on sides
  const leftTree = tree_oak(30, 'wood');
  const rightTree = tree_oak(35, 'wood');
  drawSprite(ctx, 10, 140, leftTree, 'wood');
  drawSprite(ctx, 165, 135, rightTree, 'wood');
  
  // Roseglow moon above
  drawMoon(ctx, 100, 50, 20, '#ffddcc', 25);
  
  // Lanterns hanging from branches
  const lanternSprite = lantern('#ffddaa');
  drawSprite(ctx, 25, 155, lanternSprite);
  drawSprite(ctx, 175, 150, lanternSprite);
  
  // Pink blossoms falling
  drawParticles(ctx, 'petals', 25);
  
  return canvas;
}

function generateFrozenFortress() {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  
  // Aurora sky
  drawSky(ctx, 'sky_night', 15);
  
  // Aurora bands using dithering
  ditherFill(ctx, 0, 30, 200, 15, '#44ff88', '#6644ff', 'horizontal');
  ditherFill(ctx, 0, 50, 200, 10, '#6644ff', '#050510', 'horizontal');
  
  // Ice castle walls
  const leftWall = pillar(40, 'ice');
  const rightWall = pillar(45, 'ice');
  drawSprite(ctx, 15, 120, leftWall, 'ice');
  drawSprite(ctx, 170, 115, rightWall, 'ice');
  
  // Snowdrifts
  drawGround(ctx, 180, 'ice', 'smooth');
  
  // Icicle stalactites
  const icicle = stalactite(15, 'ice');
  drawSprite(ctx, 30, 0, icicle, 'ice');
  drawSprite(ctx, 180, 0, icicle, 'ice');
  drawSprite(ctx, 50, 0, icicle, 'ice');
  
  // Snow particles
  drawParticles(ctx, 'snow', 20);
  
  return canvas;
}

function generateRotBorder() {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  
  // Sky transitions from healthy to corrupted
  const healthySky = RAMPS.sky_night;
  const corruptedSky = RAMPS.rot;
  
  for (let x = 0; x < 200; x++) {
    const progress = x / 200;
    const rampToUse = progress < 0.5 ? healthySky : corruptedSky;
    ditherGradient(ctx, x, 0, 100, 1, rampToUse);
  }
  
  // Ground changes at midpoint
  for (let x = 0; x < 100; x++) {
    drawGround(ctx, 170, 'forest', 'rough');
  }
  for (let x = 100; x < 200; x++) {
    drawGround(ctx, 170, 'rot', 'rough');
  }
  
  // Healthy forest on left
  const healthyTree1 = tree_oak(25, 'forest');
  const healthyTree2 = tree_pine(30, 'forest');
  drawSprite(ctx, 10, 145, healthyTree1, 'forest');
  drawSprite(ctx, 35, 140, healthyTree2, 'forest');
  
  // Dead/corrupted trees on right
  const deadTree1 = tree_dead(25);
  const deadTree2 = tree_dead(30);
  drawSprite(ctx, 155, 145, deadTree1);
  drawSprite(ctx, 175, 140, deadTree2);
  
  return canvas;
}

function generateDesertRuins() {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  
  // Harsh yellow sun and hot sky
  drawSky(ctx, 'sky_sunset', 0);
  
  // Bright sun
  drawMoon(ctx, 160, 30, 15, '#ffff88', 20);
  
  // Golden sand
  drawGround(ctx, 170, 'sand', 'rough');
  
  // Ancient broken pillars
  const leftRuin = pillar(35, 'stone');
  const rightRuin = pillar(25, 'stone');
  drawSprite(ctx, 15, 135, leftRuin, 'stone');
  drawSprite(ctx, 175, 145, rightRuin, 'stone');
  
  // Heat shimmer effect (dithered air distortion)
  for (let y = 100; y < 170; y += 10) {
    ditherFill(ctx, 0, y, 200, 3, '#ffdd88', '#ffcc77', 'horizontal');
  }
  
  // Dead plants/cactus
  const deadPlant = fence_post(12);
  drawSprite(ctx, 40, 158, deadPlant);
  drawSprite(ctx, 150, 160, deadPlant);
  
  return canvas;
}

function generateGrandLibrary() {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  
  // Interior walls with purple ambient light
  drawWalls(ctx, 'stone');
  
  // Stone floor with runic patterns
  drawGround(ctx, 180, 'stone', 'cobblestone');
  
  // Runic patterns on floor
  for (let x = 75; x < 125; x += 10) {
    for (let y = 185; y < 195; y += 5) {
      setPixel(ctx, x, y, '#aa7ace');
    }
  }
  
  // Towering bookshelves stacked
  const shelf1 = bookshelf(25);
  const shelf2 = bookshelf(25);
  const shelf3 = bookshelf(20);
  
  drawSprite(ctx, 5, 155, shelf1);
  drawSprite(ctx, 5, 130, shelf2);
  drawSprite(ctx, 5, 110, shelf3);
  
  drawSprite(ctx, 175, 155, shelf1);
  drawSprite(ctx, 175, 130, shelf2);
  drawSprite(ctx, 175, 110, shelf3);
  
  // Floating candles
  const candlePositions = [[80, 60], [120, 65], [100, 45]];
  candlePositions.forEach(([x, y]) => {
    setPixel(ctx, x, y, '#aa7ace');
    setPixel(ctx, x, y-1, '#ffddaa');
  });
  
  return canvas;
}

function generatePotionWorkshop() {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  
  // Interior walls
  drawWalls(ctx, 'wood');
  
  // Wooden floor
  drawGround(ctx, 180, 'wood', 'smooth');
  
  // Shelves of potion bottles on left
  const shelfSprite = bookshelf(20);
  drawSprite(ctx, 5, 140, shelfSprite);
  
  // Colorful potion bottles
  const bottleColors = ['#ff4444', '#4444ff', '#44ff44', '#ff44ff'];
  for (let i = 0; i < 4; i++) {
    setPixel(ctx, 10 + i * 3, 145, bottleColors[i]);
    setPixel(ctx, 10 + i * 3, 155, bottleColors[i]);
  }
  
  // Cauldron on right
  const cauldronSprite = cauldron();
  drawSprite(ctx, 165, 160, cauldronSprite);
  
  // Green/purple steam rising
  for (let y = 140; y > 100; y -= 5) {
    if (Math.random() > 0.5) {
      setPixel(ctx, 170 + Math.sin(y * 0.2) * 3, y, '#44ff44');
      setPixel(ctx, 172 + Math.cos(y * 0.3) * 2, y, '#aa44aa');
    }
  }
  
  // Ingredient jars
  for (let i = 0; i < 3; i++) {
    const jarSprite = lantern(bottleColors[i]);
    drawSprite(ctx, 180, 140 + i * 10, jarSprite);
  }
  
  return canvas;
}

function generateThroneHall() {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  
  // Stone interior
  drawWalls(ctx, 'stone');
  drawGround(ctx, 180, 'stone', 'smooth');
  
  // Stone pillars on sides
  const leftPillar = pillar(40, 'stone');
  const rightPillar = pillar(40, 'stone');
  drawSprite(ctx, 25, 140, leftPillar, 'stone');
  drawSprite(ctx, 175, 140, rightPillar, 'stone');
  
  // Order banners on walls
  const bannerColors = ['#ff4444', '#44ff44', '#aa44aa']; // Flame, Wild, Arcane
  const bannerColors2 = ['#4444ff', '#ffff44', '#ff44ff']; // Deep, Radiant, Heart
  
  for (let i = 0; i < 3; i++) {
    const leftBanner = banner(bannerColors[i], 20);
    const rightBanner = banner(bannerColors2[i], 20);
    drawSprite(ctx, 5, 40 + i * 25, leftBanner);
    drawSprite(ctx, 190, 40 + i * 25, rightBanner);
  }
  
  // Golden throne in far background (small, centered)
  for (let y = 110; y < 120; y++) {
    for (let x = 95; x < 105; x++) {
      setPixel(ctx, x, y, '#ffd700');
    }
  }
  
  return canvas;
}

function generateCrystalCavern() {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  
  // Dark cave walls
  drawWalls(ctx, 'stone');
  
  // Reflective floor
  drawGround(ctx, 180, 'stone', 'smooth');
  
  // Crystal formations with different Order colors
  const crystalColors = ['#ff4444', '#44ff44', '#aa44aa', '#4444ff', '#ffff44', '#ff44ff'];
  
  for (let i = 0; i < 3; i++) {
    const leftCrystal = crystal(20 + i * 5, crystalColors[i]);
    const rightCrystal = crystal(18 + i * 4, crystalColors[i + 3]);
    drawSprite(ctx, 10 + i * 15, 140 - i * 10, leftCrystal);
    drawSprite(ctx, 170 - i * 10, 145 - i * 8, rightCrystal);
  }
  
  // Dim ambient glow
  for (let i = 0; i < crystalColors.length; i++) {
    const glowX = i < 3 ? 20 + i * 15 : 170 - (i-3) * 10;
    const glowY = i < 3 ? 150 - i * 10 : 155 - (i-3) * 8;
    
    for (let r = 1; r < 8; r++) {
      for (let angle = 0; angle < 8; angle++) {
        const x = glowX + Math.cos(angle) * r;
        const y = glowY + Math.sin(angle) * r;
        if (Math.random() > 0.7) {
          setPixel(ctx, Math.floor(x), Math.floor(y), crystalColors[i]);
        }
      }
    }
  }
  
  return canvas;
}

function generateTavernInterior() {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  
  // Wooden tavern walls
  drawWalls(ctx, 'wood');
  drawGround(ctx, 180, 'wood', 'smooth');
  
  // Bar counter on left
  for (let x = 5; x < 50; x++) {
    for (let y = 160; y < 170; y++) {
      setPixel(ctx, x, y, '#5a4530');
    }
  }
  
  // Mugs on bar
  const mugPositions = [[15, 158], [25, 158], [35, 158]];
  mugPositions.forEach(([x, y]) => {
    setPixel(ctx, x, y, '#8a6a50');
    setPixel(ctx, x+1, y, '#8a6a50');
  });
  
  // Tables and chairs on right
  for (let x = 160; x < 185; x++) {
    for (let y = 160; y < 165; y++) {
      setPixel(ctx, x, y, '#5a4530');
    }
  }
  
  // Chair legs
  setPixel(ctx, 155, 165, '#4a3520');
  setPixel(ctx, 155, 175, '#4a3520');
  setPixel(ctx, 190, 165, '#4a3520');
  setPixel(ctx, 190, 175, '#4a3520');
  
  // Hanging lanterns
  const lanternSprite = lantern('#ffddaa');
  drawSprite(ctx, 30, 100, lanternSprite);
  drawSprite(ctx, 170, 100, lanternSprite);
  drawSprite(ctx, 100, 90, lanternSprite);
  
  return canvas;
}

function generateDungeonCells() {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  
  // Dark stone walls
  drawWalls(ctx, 'stone');
  
  // Wet stone floor
  drawGround(ctx, 180, 'stone', 'cobblestone');
  
  // Add water puddles
  for (let i = 0; i < 3; i++) {
    const puddleX = 70 + i * 20;
    drawWater(ctx, 185, 'water', 5);
  }
  
  // Iron bar cells on left and right
  for (let y = 120; y < 175; y += 3) {
    for (let x = 15; x < 45; x += 4) {
      setPixel(ctx, x, y, '#444444');
      setPixel(ctx, x, y+1, '#333333');
    }
    for (let x = 155; x < 185; x += 4) {
      setPixel(ctx, x, y, '#444444');
      setPixel(ctx, x, y+1, '#333333');
    }
  }
  
  // Torch on left wall with warm glow
  const torchSprite = torch();
  drawSprite(ctx, 5, 100, torchSprite);
  
  // Warm glow circle
  for (let r = 1; r < 15; r++) {
    for (let angle = 0; angle < 16; angle++) {
      const x = 8 + Math.cos(angle * Math.PI / 8) * r;
      const y = 105 + Math.sin(angle * Math.PI / 8) * r;
      if (Math.random() > 0.8) {
        setPixel(ctx, Math.floor(x), Math.floor(y), '#ff8844');
      }
    }
  }
  
  // Chains
  for (let i = 0; i < 3; i++) {
    const chainX = 20 + i * 10;
    for (let y = 130; y < 160; y += 2) {
      setPixel(ctx, chainX, y, '#666666');
    }
  }
  
  // Dripping water
  for (let i = 0; i < 5; i++) {
    const dropX = 50 + i * 30;
    setPixel(ctx, dropX, 120 + i * 5, '#6a9ace');
  }
  
  return canvas;
}

function generateObservatory() {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  
  // Open dome ceiling showing starry sky
  drawSky(ctx, 'sky_night', 30);
  
  // Stone walls only on sides (not top)
  for (let x = 0; x < 67; x++) {
    for (let y = 80; y < 200; y++) {
      setPixel(ctx, x, y, RAMPS.stone[2]);
    }
  }
  for (let x = 133; x < 200; x++) {
    for (let y = 80; y < 200; y++) {
      setPixel(ctx, x, y, RAMPS.stone[2]);
    }
  }
  
  // Stone floor
  drawGround(ctx, 180, 'stone', 'smooth');
  
  // Telescope on left
  const telescopeBase = pillar(15, 'stone');
  drawSprite(ctx, 15, 165, telescopeBase, 'stone');
  
  // Telescope tube
  for (let x = 25; x < 45; x++) {
    setPixel(ctx, x, 155, '#6a4530');
    setPixel(ctx, x, 156, '#5a4530');
  }
  
  // Star charts on right wall
  for (let i = 0; i < 4; i++) {
    const chartX = 160;
    const chartY = 100 + i * 20;
    for (let x = 0; x < 12; x++) {
      for (let y = 0; y < 8; y++) {
        if ((x + y) % 3 === 0) setPixel(ctx, chartX + x, chartY + y, '#ffddaa');
      }
    }
    // Add star points
    setPixel(ctx, chartX + 3, chartY + 2, '#ffffff');
    setPixel(ctx, chartX + 8, chartY + 5, '#ffffff');
  }
  
  // Brass instruments
  const instrumentPositions = [[170, 160], [180, 165]];
  instrumentPositions.forEach(([x, y]) => {
    setPixel(ctx, x, y, '#ffd700');
    setPixel(ctx, x+1, y, '#dab050');
    setPixel(ctx, x, y+1, '#ba9a30');
  });
  
  // Arcane purple accents
  for (let i = 0; i < 6; i++) {
    const runeX = 75 + i * 10;
    setPixel(ctx, runeX, 185, '#aa7ace');
  }
  
  return canvas;
}

// ============================================================================
// GENERATE ALL BACKGROUNDS
// ============================================================================

console.log('🎨 Starting Order of 86 HQ Background Generation...\n');

const backgrounds = [
  { func: generateCrucibleGates, file: 'hq-crucible-gates.png', name: 'Crucible Gates' },
  { func: generateRootholdVillage, file: 'hq-roothold-village.png', name: 'Roothold Village' },
  { func: generateArchivumEntrance, file: 'hq-archivum-entrance.png', name: 'Archivum Entrance' },
  { func: generateMoonlitCliffs, file: 'hq-moonlit-cliffs.png', name: 'Moonlit Cliffs' },
  { func: generateCherryBlossomPath, file: 'hq-cherry-blossom-path.png', name: 'Cherry Blossom Path' },
  { func: generateFrozenFortress, file: 'hq-frozen-fortress.png', name: 'Frozen Fortress' },
  { func: generateRotBorder, file: 'hq-rot-border.png', name: 'Rot Border' },
  { func: generateDesertRuins, file: 'hq-desert-ruins.png', name: 'Desert Ruins' },
  { func: generateGrandLibrary, file: 'hq-grand-library.png', name: 'Grand Library' },
  { func: generatePotionWorkshop, file: 'hq-potion-workshop.png', name: 'Potion Workshop' },
  { func: generateThroneHall, file: 'hq-throne-hall.png', name: 'Throne Hall' },
  { func: generateCrystalCavern, file: 'hq-crystal-cavern.png', name: 'Crystal Cavern' },
  { func: generateTavernInterior, file: 'hq-tavern-interior.png', name: 'Tavern Interior' },
  { func: generateDungeonCells, file: 'hq-dungeon-cells.png', name: 'Dungeon Cells' },
  { func: generateObservatory, file: 'hq-observatory.png', name: 'Observatory' }
];

backgrounds.forEach(({ func, file, name }, index) => {
  console.log(`[${index + 1}/15] Generating ${name}...`);
  try {
    const canvas = func();
    saveBackground(canvas, file);
  } catch (error) {
    console.error(`❌ Failed to generate ${name}:`, error.message);
  }
});

console.log('\n🎉 Background generation complete!');
console.log(`📁 Output directory: ${outputDir}`);