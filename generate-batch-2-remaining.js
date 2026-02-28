/**
 * Batch 2 Remaining Generator for Order of 86 Website
 * Generates ONLY the missing still PNG backgrounds (800x800) and animated GIF backgrounds (400x400)
 * that were not completed in the previous run that timed out.
 */

const { createCanvas } = require('canvas');
const GIFEncoder = require('gif-encoder-2');
const fs = require('fs').promises;
const path = require('path');

// Import the fixed pixel engine
const {
  RAMPS,
  getRampColor,
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

const WORK_SIZE = 200; // Generate at 200x200
const STILL_SIZE = 800; // Upscale stills to 800x800  
const GIF_SIZE = 400;   // Upscale GIFs to 400x400
const FRAMES = 12;      // 12 frames for animations
const DELAY_MS = 100;   // 100ms delay between frames

// Output directories
const STILL_DIR = path.join(__dirname, 'content-bg', 'still');
const GIF_DIR = path.join(__dirname, 'content-bg');

// Utility function to create canvas
function createWorkCanvas() {
  const canvas = createCanvas(WORK_SIZE, WORK_SIZE);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}

// Utility function to upscale canvas
function upscaleCanvas(sourceCanvas, scale) {
  const targetCanvas = createCanvas(sourceCanvas.width * scale, sourceCanvas.height * scale);
  const targetCtx = targetCanvas.getContext('2d');
  targetCtx.imageSmoothingEnabled = false;
  targetCtx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width * scale, sourceCanvas.height * scale);
  return targetCanvas;
}

// Save PNG utility
async function savePNG(filename, canvas) {
  const buffer = canvas.toBuffer('image/png');
  await fs.writeFile(filename, buffer);
  return buffer.length;
}

// Save GIF utility
function saveGIF(filename, frames) {
  return new Promise((resolve, reject) => {
    const encoder = new GIFEncoder(GIF_SIZE, GIF_SIZE);
    encoder.setDelay(DELAY_MS);
    encoder.setRepeat(0);
    encoder.setQuality(10);
    
    encoder.start();
    
    for (const frame of frames) {
      encoder.addFrame(frame.getContext('2d'));
    }
    
    encoder.finish();
    const buffer = encoder.out.getData();
    require('fs').writeFileSync(filename, buffer);
    resolve(buffer.length);
  });
}

// ============================================================================
// MISSING STILL BACKGROUND SCENES (10 scenes)
// ============================================================================

const stillScenes = {
  'scene-flame-altar': {
    name: "Flame Altar",
    generator: (ctx) => {
      fillBackground(ctx, '#8b0000'); // Dark red base
      
      // Stone chamber sky
      drawSky(ctx, 'stone', 10, 60);
      
      // Stone chamber walls
      drawWalls(ctx, 'stone');
      
      // Stone floor
      drawGround(ctx, 160, 'stone', 'smooth');
      
      // Central stone altar
      for (let y = 140; y < 160; y++) {
        for (let x = 80; x < 120; x++) {
          setPixel(ctx, x, y, RAMPS.stone[3]);
        }
      }
      // Altar top
      for (let x = 75; x < 125; x++) {
        setPixel(ctx, x, 140, RAMPS.stone[4]);
        setPixel(ctx, x, 141, RAMPS.stone[3]);
      }
      
      // Eternal flame on altar
      for (let f = 0; f < 8; f++) {
        const flameX = 95 + Math.sin(f) * 5;
        const flameY = 130 - f * 2;
        setPixel(ctx, flameX, flameY, RAMPS.lava[5 - f % 2]);
        setPixel(ctx, flameX + 1, flameY, RAMPS.lava[4 - f % 2]);
        setPixel(ctx, flameX + 2, flameY, RAMPS.lava[3]);
      }
      
      // Flame glow
      for (let y = 120; y < 145; y++) {
        for (let x = 90; x < 110; x++) {
          const dist = Math.sqrt((x - 100) * (x - 100) + (y - 135) * (y - 135));
          if (dist < 15 && Math.random() > 0.6) {
            setPixel(ctx, x, y, RAMPS.lava[2]);
          }
        }
      }
      
      // Stone pillars
      drawSprite(ctx, 40, 120, pillar(), 'stone');
      drawSprite(ctx, 140, 120, pillar(), 'stone');
    }
  },

  'scene-arcane-observatory': {
    name: "Arcane Observatory",
    generator: (ctx) => {
      fillBackground(ctx, '#1a0a2e'); // Purple base
      
      // Night sky with stars
      drawSky(ctx, 'sky_night', 12, 60);
      
      // Add stars
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * 200;
        const y = Math.random() * 60;
        setPixel(ctx, x, y, '#ffffff');
      }
      
      // Observatory walls
      drawWalls(ctx, 'purple');
      drawGround(ctx, 180, 'purple', 'smooth');
      
      // Telescope in center
      for (let t = 0; t < 15; t++) {
        setPixel(ctx, 90 + t, 150, RAMPS.gold[3]);
        setPixel(ctx, 90 + t, 151, RAMPS.gold[2]);
      }
      // Telescope lens
      for (let l = 0; l < 8; l++) {
        setPixel(ctx, 105, 140 - l, RAMPS.gold[4]);
      }
      
      // Star maps on walls
      for (let map = 0; map < 4; map++) {
        const mapX = 30 + map * 40;
        const mapY = 90 + Math.sin(map) * 10;
        
        // Map frame
        for (let y = 0; y < 25; y++) {
          for (let x = 0; x < 20; x++) {
            if (x === 0 || x === 19 || y === 0 || y === 24) {
              setPixel(ctx, mapX + x, mapY + y, RAMPS.gold[3]);
            } else {
              setPixel(ctx, mapX + x, mapY + y, RAMPS.purple[1]);
            }
          }
        }
        
        // Stars on map
        for (let s = 0; s < 8; s++) {
          const starX = mapX + 2 + Math.random() * 16;
          const starY = mapY + 2 + Math.random() * 21;
          setPixel(ctx, starX, starY, '#ffffff');
        }
      }
      
      // Magical orbs
      for (let o = 0; o < 5; o++) {
        const orbX = 40 + o * 30;
        const orbY = 160 + Math.sin(o) * 5;
        setPixel(ctx, orbX, orbY, RAMPS.purple[4]);
        setPixel(ctx, orbX + 1, orbY, RAMPS.purple[3]);
        setPixel(ctx, orbX, orbY + 1, RAMPS.purple[3]);
      }
    }
  },

  'scene-frozen-library': {
    name: "Frozen Library",
    generator: (ctx) => {
      fillBackground(ctx, '#c9e5ff'); // Ice blue base
      
      // Icy chamber sky
      drawSky(ctx, 'ice', 10, 80);
      
      // Ice-covered walls
      drawWalls(ctx, 'ice');
      drawGround(ctx, 180, 'ice', 'smooth');
      
      // Frozen bookshelves
      for (let shelf = 0; shelf < 4; shelf++) {
        const shelfX = 20 + shelf * 45;
        
        // Bookshelf structure
        for (let y = 100; y < 170; y++) {
          for (let x = 0; x < 25; x++) {
            if (x === 0 || x === 24 || y % 20 === 0) {
              setPixel(ctx, shelfX + x, y, RAMPS.ice[4]);
            } else {
              // Books with ice
              const bookColor = Math.random() > 0.5 ? RAMPS.ice[2] : RAMPS.ice[3];
              setPixel(ctx, shelfX + x, y, bookColor);
            }
          }
        }
      }
      
      // Icicles hanging from ceiling
      for (let i = 0; i < 12; i++) {
        const iceX = 30 + i * 15;
        const iceLength = 5 + Math.random() * 15;
        
        for (let l = 0; l < iceLength; l++) {
          const width = Math.max(1, 3 - l / 3);
          for (let w = 0; w < width; w++) {
            setPixel(ctx, iceX + w - width/2, 80 + l, RAMPS.ice[4]);
          }
        }
      }
      
      // Frost patterns on books
      for (let f = 0; f < 20; f++) {
        const frostX = 20 + Math.random() * 160;
        const frostY = 110 + Math.random() * 50;
        
        // Frost crystal
        for (let fy = -2; fy <= 2; fy++) {
          for (let fx = -2; fx <= 2; fx++) {
            if (Math.abs(fx) + Math.abs(fy) < 3) {
              setPixel(ctx, frostX + fx, frostY + fy, '#ffffff');
            }
          }
        }
      }
      
      // Ice reading desk
      for (let y = 150; y < 165; y++) {
        for (let x = 85; x < 115; x++) {
          setPixel(ctx, x, y, RAMPS.ice[3]);
        }
      }
    }
  },

  'scene-mushroom-cavern': {
    name: "Mushroom Cavern",
    generator: (ctx) => {
      fillBackground(ctx, '#1a0f08'); // Dark brown base
      
      // Cave ceiling
      drawSky(ctx, 'stone', 8, 70);
      
      // Cave walls
      drawWalls(ctx, 'stone');
      drawGround(ctx, 180, 'stone', 'cave');
      
      // Giant glowing mushrooms
      const mushrooms = [
        { x: 50, y: 140, size: 20, color: 'purple' },
        { x: 100, y: 130, size: 25, color: 'pink' },
        { x: 150, y: 145, size: 18, color: 'purple' }
      ];
      
      for (const mush of mushrooms) {
        // Mushroom stem
        for (let y = 0; y < mush.size; y++) {
          for (let x = 0; x < 8; x++) {
            setPixel(ctx, mush.x + x, mush.y + y, RAMPS.wood[2]);
          }
        }
        
        // Mushroom cap
        for (let cy = -10; cy <= 5; cy++) {
          for (let cx = -mush.size/2; cx <= mush.size/2; cx++) {
            const capDist = Math.sqrt(cx*cx + cy*cy*2);
            if (capDist < mush.size/2 && cy > -8) {
              setPixel(ctx, mush.x + 4 + cx, mush.y + cy, RAMPS[mush.color][3]);
            }
          }
        }
        
        // Glowing spots
        for (let spot = 0; spot < 6; spot++) {
          const spotX = mush.x + 4 + Math.sin(spot) * mush.size/4;
          const spotY = mush.y - 5 + Math.cos(spot) * 4;
          setPixel(ctx, spotX, spotY, RAMPS[mush.color][5]);
          setPixel(ctx, spotX + 1, spotY, RAMPS[mush.color][4]);
        }
        
        // Glow around mushroom
        for (let gy = -15; gy <= 15; gy++) {
          for (let gx = -15; gx <= 15; gx++) {
            const glowDist = Math.sqrt(gx*gx + gy*gy);
            if (glowDist > 10 && glowDist < 15 && Math.random() > 0.8) {
              setPixel(ctx, mush.x + 4 + gx, mush.y + gy, RAMPS[mush.color][1]);
            }
          }
        }
      }
      
      // Smaller mushrooms
      for (let small = 0; small < 8; small++) {
        const smallX = 30 + small * 20;
        const smallY = 170 + Math.sin(small) * 5;
        
        drawSprite(ctx, smallX, smallY, mushroom(), 'purple');
      }
    }
  },

  'scene-wizards-kitchen': {
    name: "Wizard's Kitchen",
    generator: (ctx) => {
      fillBackground(ctx, '#2a1a00'); // Warm brown base
      
      // Kitchen ceiling
      drawSky(ctx, 'wood', 8, 70);
      
      // Kitchen walls
      drawWalls(ctx, 'wood');
      drawGround(ctx, 180, 'wood', 'smooth');
      
      // Stone hearth
      for (let y = 120; y < 180; y++) {
        for (let x = 20; x < 60; x++) {
          if (y > 160 || x === 20 || x === 59) {
            setPixel(ctx, x, y, RAMPS.stone[3]);
          }
        }
      }
      
      // Fire in hearth
      for (let f = 0; f < 12; f++) {
        const flameX = 30 + Math.sin(f * 0.5) * 8;
        const flameY = 150 - f * 2;
        setPixel(ctx, flameX, flameY, RAMPS.lava[4 + f % 2]);
        setPixel(ctx, flameX + 1, flameY, RAMPS.lava[3 + f % 2]);
      }
      
      // Cauldrons
      drawSprite(ctx, 80, 150, cauldron(), 'stone');
      drawSprite(ctx, 120, 155, cauldron(), 'gold');
      
      // Hanging herbs
      for (let h = 0; h < 8; h++) {
        const herbX = 70 + h * 15;
        
        // Herb bundle
        for (let hy = 0; hy < 12; hy++) {
          for (let hx = 0; hx < 4; hx++) {
            if (Math.random() > 0.3) {
              setPixel(ctx, herbX + hx, 80 + hy, RAMPS.forest[2 + Math.floor(Math.random() * 2)]);
            }
          }
        }
        
        // String
        setPixel(ctx, herbX + 2, 70, '#8b4513');
        setPixel(ctx, herbX + 2, 75, '#8b4513');
      }
      
      // Shelves with bottles
      for (let shelf = 0; shelf < 3; shelf++) {
        const shelfY = 100 + shelf * 25;
        
        // Shelf
        for (let x = 140; x < 190; x++) {
          setPixel(ctx, x, shelfY, RAMPS.wood[4]);
          setPixel(ctx, x, shelfY + 1, RAMPS.wood[3]);
        }
        
        // Bottles
        for (let bottle = 0; bottle < 4; bottle++) {
          const bottleX = 145 + bottle * 10;
          const bottleColor = [RAMPS.purple[4], RAMPS.forest[4], RAMPS.lava[4], RAMPS.water[4]][bottle];
          
          // Bottle
          for (let by = 0; by < 8; by++) {
            for (let bx = 0; bx < 3; bx++) {
              setPixel(ctx, bottleX + bx, shelfY - by, bottleColor);
            }
          }
        }
      }
      
      // Cooking utensils
      for (let u = 0; u < 6; u++) {
        const utilX = 70 + u * 8;
        setPixel(ctx, utilX, 170, RAMPS.gold[3]);
        setPixel(ctx, utilX, 171, RAMPS.wood[3]);
      }
    }
  },

  'scene-moonstone-mine': {
    name: "Moonstone Mine",
    generator: (ctx) => {
      fillBackground(ctx, '#1a1a2e'); // Dark blue base
      
      // Mine tunnel ceiling
      drawSky(ctx, 'stone', 6, 60);
      
      // Mine walls
      drawWalls(ctx, 'stone');
      drawGround(ctx, 180, 'stone', 'rocky');
      
      // Glowing moonstone veins in walls
      for (let vein = 0; vein < 12; vein++) {
        const veinX = 30 + vein * 14;
        const veinHeight = 40 + Math.random() * 80;
        
        for (let v = 0; v < veinHeight; v += 3) {
          const veinY = 70 + v;
          const veinWidth = 2 + Math.sin(v * 0.1) * 2;
          
          for (let w = 0; w < veinWidth; w++) {
            setPixel(ctx, veinX + w, veinY, '#e6e6fa');
          }
        }
      }
      
      // Moonstone crystal formations
      for (let crystal = 0; crystal < 8; crystal++) {
        const crystalX = 40 + crystal * 20;
        const crystalY = 160 + Math.sin(crystal) * 10;
        
        // Crystal cluster
        for (let cy = 0; cy < 12; cy++) {
          for (let cx = 0; cx < 8; cx++) {
            const crystalDist = Math.sqrt((cx - 4) * (cx - 4) + (cy - 6) * (cy - 6));
            if (crystalDist < 4 + Math.sin(cx + cy) * 2) {
              setPixel(ctx, crystalX + cx, crystalY + cy, '#e6e6fa');
            }
          }
        }
        
        // Crystal glow
        for (let gy = -5; gy <= 15; gy++) {
          for (let gx = -5; gx <= 10; gx++) {
            const glowDist = Math.sqrt(gx*gx + gy*gy);
            if (glowDist > 6 && glowDist < 10 && Math.random() > 0.7) {
              setPixel(ctx, crystalX + 4 + gx, crystalY + 6 + gy, '#9370db');
            }
          }
        }
      }
      
      // Mining cart
      for (let y = 165; y < 175; y++) {
        for (let x = 80; x < 100; x++) {
          if (y === 165 || y === 174 || x === 80 || x === 99) {
            setPixel(ctx, x, y, RAMPS.stone[4]);
          } else {
            setPixel(ctx, x, y, RAMPS.stone[2]);
          }
        }
      }
      
      // Cart wheels
      setPixel(ctx, 85, 175, RAMPS.wood[4]);
      setPixel(ctx, 95, 175, RAMPS.wood[4]);
      
      // Moonstones in cart
      for (let m = 0; m < 6; m++) {
        const moonX = 82 + m * 3;
        const moonY = 167 + Math.random() * 4;
        setPixel(ctx, moonX, moonY, '#e6e6fa');
      }
      
      // Mine support beams
      for (let beam = 0; beam < 4; beam++) {
        const beamX = 50 + beam * 40;
        
        // Vertical beam
        for (let y = 60; y < 180; y++) {
          setPixel(ctx, beamX, y, RAMPS.wood[3]);
          setPixel(ctx, beamX + 1, y, RAMPS.wood[2]);
        }
        
        // Horizontal beam
        for (let x = 0; x < 20; x++) {
          setPixel(ctx, beamX - 10 + x, 100, RAMPS.wood[3]);
        }
      }
    }
  },

  'scene-potion-cellar': {
    name: "Potion Cellar",
    generator: (ctx) => {
      fillBackground(ctx, '#1a0f08'); // Dark brown base
      
      // Stone cellar ceiling
      drawSky(ctx, 'stone', 6, 60);
      
      // Dripping ceiling
      for (let drip = 0; drip < 15; drip++) {
        const dripX = 20 + drip * 12;
        const dripLength = 3 + Math.random() * 8;
        
        for (let d = 0; d < dripLength; d++) {
          setPixel(ctx, dripX, 60 + d, '#006400');
        }
      }
      
      // Cellar walls
      drawWalls(ctx, 'stone');
      drawGround(ctx, 180, 'stone', 'damp');
      
      // Shelves with colorful potion bottles
      for (let shelf = 0; shelf < 4; shelf++) {
        const shelfY = 90 + shelf * 22;
        
        // Shelf planks
        for (let x = 20; x < 180; x++) {
          setPixel(ctx, x, shelfY, RAMPS.wood[4]);
          setPixel(ctx, x, shelfY + 1, RAMPS.wood[3]);
        }
        
        // Bottles on shelf
        for (let bottle = 0; bottle < 12; bottle++) {
          const bottleX = 25 + bottle * 13;
          const potionColors = [
            RAMPS.purple[4], RAMPS.forest[4], RAMPS.lava[4], 
            RAMPS.water[4], RAMPS.pink[4], '#ff00ff',
            '#00ff00', '#ffff00', '#ff8c00', '#00ffff'
          ];
          const bottleColor = potionColors[bottle % potionColors.length];
          
          // Bottle shape
          for (let by = 0; by < 12; by++) {
            const bottleWidth = by < 8 ? 3 : 2;
            for (let bx = 0; bx < bottleWidth; bx++) {
              setPixel(ctx, bottleX + bx, shelfY - by, bottleColor);
            }
          }
          
          // Bottle neck
          setPixel(ctx, bottleX + 1, shelfY - 13, RAMPS.wood[3]);
          
          // Magical glow
          if (Math.random() > 0.6) {
            for (let gy = -2; gy <= 2; gy++) {
              for (let gx = -2; gx <= 2; gx++) {
                if (Math.abs(gx) + Math.abs(gy) < 3 && Math.random() > 0.5) {
                  setPixel(ctx, bottleX + 1 + gx, shelfY - 6 + gy, bottleColor);
                }
              }
            }
          }
          
          // Labels
          setPixel(ctx, bottleX + 1, shelfY - 6, '#ffffff');
        }
      }
      
      // Cauldron brewing
      drawSprite(ctx, 90, 160, cauldron(), 'stone');
      
      // Bubbling potion
      for (let bubble = 0; bubble < 8; bubble++) {
        const bubbleX = 95 + Math.sin(bubble) * 4;
        const bubbleY = 155 + Math.cos(bubble * 1.5) * 3;
        setPixel(ctx, bubbleX, bubbleY, '#00ff00');
      }
      
      // Steam rising
      for (let steam = 0; steam < 6; steam++) {
        const steamX = 96 + Math.sin(steam) * 2;
        const steamY = 145 - steam * 8;
        setPixel(ctx, steamX, steamY, '#cccccc');
      }
      
      // Ingredient jars on floor
      for (let jar = 0; jar < 4; jar++) {
        const jarX = 140 + jar * 15;
        const jarY = 170;
        
        // Jar
        for (let jy = 0; jy < 8; jy++) {
          for (let jx = 0; jx < 6; jx++) {
            setPixel(ctx, jarX + jx, jarY + jy, RAMPS.wood[2]);
          }
        }
        
        // Lid
        for (let lx = 0; lx < 6; lx++) {
          setPixel(ctx, jarX + lx, jarY, RAMPS.gold[3]);
        }
        
        // Contents
        const contents = [RAMPS.purple[3], RAMPS.forest[3], RAMPS.lava[3], '#ffffff'][jar];
        for (let cy = 2; cy < 6; cy++) {
          for (let cx = 1; cx < 5; cx++) {
            setPixel(ctx, jarX + cx, jarY + cy, contents);
          }
        }
      }
    }
  },

  'scene-crystal-lizard-den': {
    name: "Crystal Lizard Den",
    generator: (ctx) => {
      fillBackground(ctx, '#442244'); // Purple cave base
      
      // Cave ceiling
      drawSky(ctx, 'crystal', 8, 70);
      
      // Cave walls with crystal formations
      drawWalls(ctx, 'crystal');
      drawGround(ctx, 180, 'crystal', 'rocky');
      
      // Large crystal formations
      for (let formation = 0; formation < 6; formation++) {
        const crystalX = 30 + formation * 25;
        const crystalY = 120 + Math.sin(formation) * 20;
        const crystalHeight = 25 + Math.random() * 20;
        
        // Crystal cluster
        for (let cy = 0; cy < crystalHeight; cy++) {
          const crystalWidth = Math.max(1, (crystalHeight - cy) / 3);
          for (let cx = 0; cx < crystalWidth; cx++) {
            setPixel(ctx, crystalX + cx - crystalWidth/2, crystalY + cy, RAMPS.crystal[3 + cy % 3]);
          }
        }
        
        // Crystal glow
        for (let gy = -5; gy <= crystalHeight + 5; gy++) {
          for (let gx = -8; gx <= 8; gx++) {
            const glowDist = Math.sqrt(gx*gx + gy*gy);
            if (glowDist > 6 && glowDist < 12 && Math.random() > 0.8) {
              setPixel(ctx, crystalX + gx, crystalY + gy, RAMPS.crystal[1]);
            }
          }
        }
      }
      
      // Lizard tracks in the ground
      for (let track = 0; track < 8; track++) {
        const trackX = 50 + track * 15;
        const trackY = 170 + Math.sin(track * 0.5) * 5;
        
        // Four-toed lizard print
        setPixel(ctx, trackX, trackY, RAMPS.stone[4]);
        setPixel(ctx, trackX + 1, trackY - 1, RAMPS.stone[4]);
        setPixel(ctx, trackX + 2, trackY, RAMPS.stone[4]);
        setPixel(ctx, trackX + 1, trackY + 1, RAMPS.stone[4]);
        
        // Tail drag mark
        if (track % 2 === 0) {
          for (let tail = 0; tail < 8; tail++) {
            setPixel(ctx, trackX + 3 + tail, trackY, RAMPS.stone[3]);
          }
        }
      }
      
      // Crystal lizard hidden in shadows
      const lizardX = 160;
      const lizardY = 160;
      
      // Lizard body
      for (let ly = 0; ly < 8; ly++) {
        for (let lx = 0; lx < 15; lx++) {
          const lizardShape = Math.abs(lx - 7.5) < (8 - ly) / 2;
          if (lizardShape) {
            setPixel(ctx, lizardX + lx, lizardY + ly, RAMPS.crystal[2]);
          }
        }
      }
      
      // Lizard legs
      for (let leg = 0; leg < 4; leg++) {
        const legX = lizardX + 3 + leg * 3;
        const legY = lizardY + 8;
        
        for (let ly = 0; ly < 4; ly++) {
          setPixel(ctx, legX, legY + ly, RAMPS.crystal[2]);
        }
      }
      
      // Lizard tail
      for (let tail = 0; tail < 12; tail++) {
        const tailX = lizardX + 15 + tail;
        const tailY = lizardY + 4 + Math.sin(tail * 0.3) * 2;
        const tailWidth = Math.max(1, 3 - tail / 4);
        
        for (let tw = 0; tw < tailWidth; tw++) {
          setPixel(ctx, tailX, tailY + tw - tailWidth/2, RAMPS.crystal[2]);
        }
      }
      
      // Lizard crystal scales (glowing)
      for (let scale = 0; scale < 8; scale++) {
        const scaleX = lizardX + 2 + scale * 2;
        const scaleY = lizardY + 3 + scale % 3;
        setPixel(ctx, scaleX, scaleY, RAMPS.crystal[4]);
      }
      
      // Lizard eyes (glowing)
      setPixel(ctx, lizardX + 2, lizardY + 2, '#00ff00');
      setPixel(ctx, lizardX + 4, lizardY + 2, '#00ff00');
      
      // Small crystal shards scattered around
      for (let shard = 0; shard < 15; shard++) {
        const shardX = 20 + Math.random() * 160;
        const shardY = 160 + Math.random() * 20;
        
        setPixel(ctx, shardX, shardY, RAMPS.crystal[4]);
        setPixel(ctx, shardX + 1, shardY, RAMPS.crystal[3]);
      }
    }
  },

  'scene-war-room': {
    name: "War Room",
    generator: (ctx) => {
      fillBackground(ctx, '#2a1a00'); // Dark brown base
      
      // Stone chamber ceiling
      drawSky(ctx, 'stone', 8, 60);
      
      // War room walls
      drawWalls(ctx, 'stone');
      drawGround(ctx, 180, 'stone', 'smooth');
      
      // Large strategy table in center
      for (let y = 140; y < 160; y++) {
        for (let x = 60; x < 140; x++) {
          if (y === 140 || y === 159 || x === 60 || x === 139) {
            setPixel(ctx, x, y, RAMPS.wood[4]);
          } else {
            setPixel(ctx, x, y, RAMPS.wood[3]);
          }
        }
      }
      
      // Map on table
      for (let y = 142; y < 158; y++) {
        for (let x = 62; x < 138; x++) {
          setPixel(ctx, x, y, '#f5deb3');
        }
      }
      
      // Map features (mountains, rivers, cities)
      // Mountains
      for (let m = 0; m < 4; m++) {
        const mountX = 70 + m * 15;
        const mountY = 148;
        
        for (let my = 0; my < 6; my++) {
          for (let mx = 0; mx < 8 - my; mx++) {
            setPixel(ctx, mountX + mx + my/2, mountY + my, RAMPS.stone[3]);
          }
        }
      }
      
      // River
      for (let r = 0; r < 60; r++) {
        const riverX = 65 + r;
        const riverY = 150 + Math.sin(r * 0.1) * 4;
        setPixel(ctx, riverX, riverY, RAMPS.water[4]);
        setPixel(ctx, riverX, riverY + 1, RAMPS.water[3]);
      }
      
      // Cities (dots)
      const cities = [{x: 80, y: 145}, {x: 110, y: 152}, {x: 125, y: 147}];
      for (const city of cities) {
        for (let cy = -1; cy <= 1; cy++) {
          for (let cx = -1; cx <= 1; cx++) {
            setPixel(ctx, city.x + cx, city.y + cy, '#8b4513');
          }
        }
      }
      
      // Candles around the table
      for (let candle = 0; candle < 6; candle++) {
        const angle = (candle / 6) * Math.PI * 2;
        const candleX = 100 + Math.cos(angle) * 50;
        const candleY = 150 + Math.sin(angle) * 25;
        
        // Candle base
        for (let cy = 0; cy < 8; cy++) {
          setPixel(ctx, candleX, candleY + cy, '#8b4513');
        }
        
        // Flame
        setPixel(ctx, candleX, candleY - 2, RAMPS.lava[5]);
        setPixel(ctx, candleX, candleY - 1, RAMPS.lava[4]);
        
        // Flame glow
        for (let gy = -3; gy <= 1; gy++) {
          for (let gx = -2; gx <= 2; gx++) {
            const glowDist = Math.sqrt(gx*gx + gy*gy);
            if (glowDist > 1 && glowDist < 3 && Math.random() > 0.6) {
              setPixel(ctx, candleX + gx, candleY + gy, RAMPS.lava[2]);
            }
          }
        }
      }
      
      // Banners on walls
      for (let banner = 0; banner < 4; banner++) {
        const bannerX = 50 + banner * 40;
        const bannerY = 80;
        
        // Banner pole
        for (let by = 0; by < 40; by++) {
          setPixel(ctx, bannerX, bannerY + by, RAMPS.wood[4]);
        }
        
        // Banner cloth
        const bannerColors = [RAMPS.lava[4], RAMPS.water[4], RAMPS.forest[4], RAMPS.purple[4]];
        const bannerColor = bannerColors[banner];
        
        for (let by = 0; by < 25; by++) {
          for (let bx = 0; bx < 15; bx++) {
            setPixel(ctx, bannerX + 2 + bx, bannerY + by, bannerColor);
          }
        }
        
        // Banner emblem
        for (let ey = 0; ey < 5; ey++) {
          for (let ex = 0; ex < 5; ex++) {
            setPixel(ctx, bannerX + 7 + ex, bannerY + 8 + ey, RAMPS.gold[4]);
          }
        }
      }
      
      // Weapon rack
      for (let y = 100; y < 140; y++) {
        setPixel(ctx, 180, y, RAMPS.wood[3]);
        setPixel(ctx, 181, y, RAMPS.wood[2]);
      }
      
      // Weapons on rack
      for (let weapon = 0; weapon < 3; weapon++) {
        const weaponY = 110 + weapon * 10;
        
        // Weapon handle
        for (let h = 0; h < 12; h++) {
          setPixel(ctx, 170 + h, weaponY, RAMPS.wood[4]);
        }
        
        // Weapon blade
        for (let b = 0; b < 6; b++) {
          setPixel(ctx, 164 + b, weaponY, RAMPS.stone[4]);
        }
      }
    }
  },

  'scene-ghost-ship-deck': {
    name: "Ghost Ship Deck",
    generator: (ctx) => {
      fillBackground(ctx, '#1a0f08'); // Dark ghostly base
      
      // Ghostly fog sky
      drawSky(ctx, 'sky_night', 12, 100);
      
      // Fog effects
      for (let fog = 0; fog < 30; fog++) {
        const fogX = Math.random() * 200;
        const fogY = Math.random() * 100;
        setPixel(ctx, fogX, fogY, '#e6e6fa');
      }
      
      // Ship deck planks
      for (let plank = 0; plank < 12; plank++) {
        const plankY = 160 + plank * 3;
        
        for (let x = 0; x < 200; x++) {
          if (x % 40 < 35) {
            setPixel(ctx, x, plankY, RAMPS.wood[2 + Math.floor(Math.random() * 2)]);
            setPixel(ctx, x, plankY + 1, RAMPS.wood[1]);
          }
        }
      }
      
      // Ship masts
      for (let mast = 0; mast < 3; mast++) {
        const mastX = 60 + mast * 40;
        
        // Mast pole
        for (let y = 60; y < 160; y++) {
          setPixel(ctx, mastX, y, RAMPS.wood[3]);
          setPixel(ctx, mastX + 1, y, RAMPS.wood[2]);
        }
        
        // Crossbeam
        for (let x = 0; x < 20; x++) {
          setPixel(ctx, mastX - 10 + x, 100 + mast * 10, RAMPS.wood[3]);
        }
      }
      
      // Tattered spectral sails
      for (let sail = 0; sail < 3; sail++) {
        const sailX = 50 + sail * 40;
        const sailY = 80;
        
        for (let sy = 0; sy < 40; sy++) {
          for (let sx = 0; sx < 20; sx++) {
            // Torn sail pattern
            if (Math.random() > 0.3 && (sx + sy) % 8 !== 0) {
              const sailAlpha = Math.random() > 0.2 ? 0.7 : 0.4;
              const sailColor = sailAlpha > 0.5 ? '#e6e6fa' : '#9370db';
              setPixel(ctx, sailX + sx, sailY + sy, sailColor);
            }
          }
        }
        
        // Sail holes
        for (let hole = 0; hole < 4; hole++) {
          const holeX = sailX + 5 + hole * 4;
          const holeY = sailY + 10 + hole * 7;
          
          for (let hy = 0; hy < 3; hy++) {
            for (let hx = 0; hx < 3; hx++) {
              setPixel(ctx, holeX + hx, holeY + hy, '#050510');
            }
          }
        }
      }
      
      // Ghostly crew
      for (let ghost = 0; ghost < 4; ghost++) {
        const ghostX = 30 + ghost * 45;
        const ghostY = 140;
        
        // Ghost body
        for (let gy = 0; gy < 15; gy++) {
          for (let gx = 0; gx < 8; gx++) {
            const ghostShape = Math.abs(gx - 4) < (8 - gy / 2);
            if (ghostShape && Math.random() > 0.3) {
              setPixel(ctx, ghostX + gx, ghostY + gy, '#e6e6fa');
            }
          }
        }
        
        // Ghost eyes
        setPixel(ctx, ghostX + 2, ghostY + 4, '#00ffff');
        setPixel(ctx, ghostX + 6, ghostY + 4, '#00ffff');
        
        // Wispy trails
        for (let wisp = 0; wisp < 8; wisp++) {
          const wispX = ghostX + 4 + Math.sin(wisp) * 3;
          const wispY = ghostY + 15 + wisp * 2;
          if (Math.random() > 0.5) {
            setPixel(ctx, wispX, wispY, '#dda0dd');
          }
        }
      }
      
      // Ship's wheel
      const wheelX = 170;
      const wheelY = 140;
      
      // Wheel spokes
      for (let spoke = 0; spoke < 8; spoke++) {
        const spokeAngle = (spoke / 8) * Math.PI * 2;
        for (let len = 0; len < 8; len++) {
          const spokeX = wheelX + Math.cos(spokeAngle) * len;
          const spokeY = wheelY + Math.sin(spokeAngle) * len;
          setPixel(ctx, spokeX, spokeY, RAMPS.wood[4]);
        }
      }
      
      // Wheel rim
      for (let angle = 0; angle < 360; angle += 15) {
        const rimX = wheelX + Math.cos(angle * Math.PI / 180) * 8;
        const rimY = wheelY + Math.sin(angle * Math.PI / 180) * 8;
        setPixel(ctx, rimX, rimY, RAMPS.wood[3]);
      }
      
      // Barrels and cargo (ghostly)
      for (let barrel = 0; barrel < 3; barrel++) {
        const barrelX = 20 + barrel * 25;
        const barrelY = 150;
        
        // Barrel
        for (let by = 0; by < 12; by++) {
          for (let bx = 0; bx < 8; bx++) {
            if (Math.random() > 0.2) {
              setPixel(ctx, barrelX + bx, barrelY + by, RAMPS.wood[1]);
            }
          }
        }
        
        // Barrel hoops (ghostly)
        for (let hoop = 0; hoop < 3; hoop++) {
          for (let x = 0; x < 8; x++) {
            setPixel(ctx, barrelX + x, barrelY + 3 + hoop * 3, '#9370db');
          }
        }
      }
      
      // Ghostly lanterns
      for (let i = 0; i < 2; i++) {
        const lanternX = 40 + i * 120;
        const lanternY = 120;
        
        drawSprite(ctx, lanternX, lanternY, lantern(), 'purple');
        
        // Spectral glow
        for (let gy = -5; gy <= 5; gy++) {
          for (let gx = -5; gx <= 5; gx++) {
            const glowDist = Math.sqrt(gx*gx + gy*gy);
            if (glowDist > 2 && glowDist < 5 && Math.random() > 0.7) {
              setPixel(ctx, lanternX + 5 + gx, lanternY + 5 + gy, '#dda0dd');
            }
          }
        }
      }
    }
  }
};

// ============================================================================
// MISSING ANIMATED BACKGROUND SCENES (5 scenes)
// ============================================================================

const animatedScenes = {
  'anim-dripping-cave': {
    name: "Dripping Cave",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#1a0f08');
        
        // Dark cave ceiling
        drawSky(ctx, 'stone', 6, 80);
        
        // Cave walls
        drawWalls(ctx, 'stone');
        drawGround(ctx, 180, 'stone', 'wet');
        
        // Stalactites on ceiling
        for (let stalactite = 0; stalactite < 12; stalactite++) {
          const stalaX = 30 + stalactite * 15;
          const stalaLength = 8 + stalactite % 8;
          
          // Stalactite shape
          for (let len = 0; len < stalaLength; len++) {
            const width = Math.max(1, stalaLength - len);
            for (let w = 0; w < width; w++) {
              setPixel(ctx, stalaX + w - width/2, 80 + len, RAMPS.stone[3]);
            }
          }
        }
        
        // Water drops falling
        for (let drop = 0; drop < 15; drop++) {
          const dropLife = (frame + drop * 7) % 60;
          const dropX = 35 + drop * 12;
          const dropY = 90 + dropLife * 1.5;
          
          if (dropY < 175) {
            // Water drop
            setPixel(ctx, dropX, dropY, RAMPS.water[4]);
            setPixel(ctx, dropX, dropY + 1, RAMPS.water[3]);
            
            // Drop trail
            if (dropLife > 10) {
              for (let trail = 1; trail < 4; trail++) {
                const trailY = dropY - trail * 3;
                if (trailY > 85 && Math.random() > 0.6) {
                  setPixel(ctx, dropX, trailY, RAMPS.water[2]);
                }
              }
            }
          } else {
            // Drop hits ground - splash
            if (dropLife > 55) {
              const splashSize = 60 - dropLife;
              for (let splash = 0; splash < splashSize; splash++) {
                const splashAngle = (splash / splashSize) * Math.PI * 2;
                const splashX = dropX + Math.cos(splashAngle) * splashSize;
                const splashY = 175 + Math.sin(splashAngle) * splashSize * 0.3;
                
                if (splashX > 20 && splashX < 180) {
                  setPixel(ctx, splashX, splashY, RAMPS.water[3]);
                }
              }
            }
          }
        }
        
        // Underground pool
        for (let y = 170; y < 185; y++) {
          for (let x = 60; x < 140; x++) {
            const poolShape = Math.sin((x - 60) * 0.1) * 5;
            if (y > 175 + poolShape) {
              setPixel(ctx, x, y, RAMPS.water[2 + Math.floor(Math.random() * 2)]);
            }
          }
        }
        
        // Ripples in pool from drops
        for (let ripple = 0; ripple < 8; ripple++) {
          const ripplePhase = (frame + ripple * 15) % 60;
          const rippleX = 80 + ripple * 8;
          const rippleY = 177;
          
          if (ripplePhase < 30) {
            const rippleRadius = ripplePhase / 2;
            
            for (let angle = 0; angle < 360; angle += 45) {
              const rX = rippleX + Math.cos(angle * Math.PI / 180) * rippleRadius;
              const rY = rippleY + Math.sin(angle * Math.PI / 180) * rippleRadius * 0.3;
              
              if (rX > 60 && rX < 140 && rY > 170 && rY < 185) {
                setPixel(ctx, rX, rY, RAMPS.water[4]);
              }
            }
          }
        }
        
        // Cave crystals with water drops
        for (let crystal = 0; crystal < 6; crystal++) {
          const crystalX = 50 + crystal * 25;
          const crystalY = 160 + Math.sin(crystal) * 8;
          
          // Crystal formation
          for (let cy = 0; cy < 6; cy++) {
            for (let cx = 0; cx < 4; cx++) {
              const crystalDist = Math.sqrt((cx - 2) * (cx - 2) + (cy - 3) * (cy - 3));
              if (crystalDist < 3) {
                setPixel(ctx, crystalX + cx, crystalY + cy, RAMPS.water[4]);
              }
            }
          }
          
          // Water drop on crystal
          const dropPhase = (frame + crystal * 10) % 40;
          if (dropPhase < 20) {
            setPixel(ctx, crystalX + 2, crystalY - 1, RAMPS.water[4]);
          }
        }
        
        // Moisture on walls
        for (let moisture = 0; moisture < 25; moisture++) {
          const moistX = 30 + moisture * 7;
          const moistY = 100 + Math.sin(moisture * 0.3 + frame * 0.05) * 30;
          
          if (moistY > 90 && moistY < 170) {
            setPixel(ctx, moistX, moistY, RAMPS.water[3]);
            
            // Moisture trail
            for (let trail = 1; trail < 8; trail++) {
              const trailY = moistY + trail * 2;
              if (trailY < 175 && Math.random() > 0.7) {
                setPixel(ctx, moistX, trailY, RAMPS.water[2]);
              }
            }
          }
        }
      };
    }
  },

  'anim-spinning-portal': {
    name: "Spinning Portal",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#1a0a2e');
        
        // Dark mystical chamber
        drawSky(ctx, 'purple', 8, 60);
        drawWalls(ctx, 'purple');
        drawGround(ctx, 180, 'purple', 'mystical');
        
        // Portal center
        const portalX = 100;
        const portalY = 100;
        const portalRadius = 35;
        
        // Portal rings spinning
        for (let ring = 0; ring < 4; ring++) {
          const ringRadius = 10 + ring * 8;
          const ringSpeed = 0.1 + ring * 0.05;
          const ringAngle = frame * ringSpeed * (ring % 2 === 0 ? 1 : -1);
          
          for (let segment = 0; segment < 12; segment++) {
            const segmentAngle = (segment / 12) * Math.PI * 2 + ringAngle;
            const segmentX = portalX + Math.cos(segmentAngle) * ringRadius;
            const segmentY = portalY + Math.sin(segmentAngle) * ringRadius * 0.7;
            
            // Ring colors
            const ringColors = [RAMPS.purple[4], RAMPS.water[4], '#ff00ff', '#00ffff'];
            const ringColor = ringColors[ring];
            
            setPixel(ctx, segmentX, segmentY, ringColor);
            setPixel(ctx, segmentX + 1, segmentY, ringColor);
          }
        }
        
        // Portal vortex effect
        for (let y = portalY - portalRadius; y <= portalY + portalRadius; y++) {
          for (let x = portalX - portalRadius; x <= portalX + portalRadius; x++) {
            const distance = Math.sqrt((x - portalX) * (x - portalX) + (y - portalY) * (y - portalY) * 2);
            
            if (distance < portalRadius) {
              // Spiral pattern
              const angle = Math.atan2(y - portalY, x - portalX) + distance * 0.1 + frame * 0.2;
              const spiralIntensity = Math.sin(angle * 4 + distance * 0.3) * 0.5 + 0.5;
              
              // Portal depth
              const depth = 1 - (distance / portalRadius);
              
              if (spiralIntensity > 0.3 && depth > 0.2) {
                let portalColor;
                if (depth > 0.8) {
                  portalColor = '#ffffff'; // Center brightness
                } else if (depth > 0.6) {
                  portalColor = RAMPS.purple[5];
                } else if (depth > 0.4) {
                  portalColor = RAMPS.water[5];
                } else {
                  portalColor = RAMPS.purple[3];
                }
                
                setPixel(ctx, x, y, portalColor);
              }
            }
          }
        }
        
        // Energy bolts around portal
        for (let bolt = 0; bolt < 8; bolt++) {
          const boltAngle = (bolt / 8) * Math.PI * 2 + frame * 0.3;
          const boltDist = 45 + Math.sin(frame * 0.2 + bolt) * 8;
          const boltX = portalX + Math.cos(boltAngle) * boltDist;
          const boltY = portalY + Math.sin(boltAngle) * boltDist * 0.6;
          
          // Lightning bolt effect
          for (let seg = 0; seg < 6; seg++) {
            const segX = boltX + Math.sin(frame * 0.5 + bolt + seg) * 3;
            const segY = boltY + seg * 2;
            
            if (segX > 20 && segX < 180 && segY > 60 && segY < 140) {
              setPixel(ctx, segX, segY, '#00ffff');
              setPixel(ctx, segX + 1, segY, '#0088ff');
            }
          }
        }
        
        // Portal stones/pillars
        for (let pillar = 0; pillar < 6; pillar++) {
          const pillarAngle = (pillar / 6) * Math.PI * 2;
          const pillarDist = 70;
          const pillarX = portalX + Math.cos(pillarAngle) * pillarDist;
          const pillarY = portalY + Math.sin(pillarAngle) * pillarDist * 0.6;
          
          if (pillarX > 20 && pillarX < 180 && pillarY > 120 && pillarY < 170) {
            // Pillar
            for (let py = 0; py < 25; py++) {
              for (let px = 0; px < 6; px++) {
                setPixel(ctx, pillarX + px - 3, pillarY + py, RAMPS.stone[3]);
              }
            }
            
            // Glowing rune on pillar
            const runeY = pillarY + 10;
            for (let ry = 0; ry < 4; ry++) {
              for (let rx = 0; rx < 4; rx++) {
                if ((rx + ry) % 2 === 0) {
                  setPixel(ctx, pillarX + rx - 2, runeY + ry, RAMPS.purple[5]);
                }
              }
            }
          }
        }
        
        // Magical particles being sucked into portal
        for (let particle = 0; particle < 15; particle++) {
          const particleLife = (frame + particle * 8) % 120;
          const particleAngle = (particle / 15) * Math.PI * 2 + particleLife * 0.02;
          const particleDist = 80 - particleLife * 0.6;
          
          if (particleDist > 10) {
            const particleX = portalX + Math.cos(particleAngle) * particleDist;
            const particleY = portalY + Math.sin(particleAngle) * particleDist * 0.6;
            
            if (particleX > 10 && particleX < 190 && particleY > 50 && particleY < 150) {
              // Particle color based on distance
              let particleColor;
              if (particleDist < 30) {
                particleColor = '#ffffff';
              } else if (particleDist < 50) {
                particleColor = RAMPS.purple[5];
              } else {
                particleColor = RAMPS.water[4];
              }
              
              setPixel(ctx, particleX, particleY, particleColor);
              
              // Particle trail
              const trailX = particleX + Math.cos(particleAngle + Math.PI) * 3;
              const trailY = particleY + Math.sin(particleAngle + Math.PI) * 3 * 0.6;
              if (trailX > 10 && trailX < 190 && trailY > 50 && trailY < 150) {
                setPixel(ctx, trailX, trailY, RAMPS.purple[3]);
              }
            }
          }
        }
      };
    }
  },

  'anim-floating-books': {
    name: "Floating Books",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#1a0a2e');
        
        // Magical library
        drawSky(ctx, 'purple', 8, 80);
        drawWalls(ctx, 'purple');
        drawGround(ctx, 180, 'purple', 'mystical');
        
        // Floating, orbiting books
        for (let book = 0; book < 12; book++) {
          const orbitRadius = 30 + book * 8;
          const orbitSpeed = 0.1 - book * 0.005;
          const angle = frame * orbitSpeed + (book / 12) * Math.PI * 2;
          
          const bookX = 100 + Math.cos(angle) * orbitRadius;
          const bookY = 100 + Math.sin(angle) * orbitRadius * 0.6;
          
          // Book
          for (let by = 0; by < 6; by++) {
            for (let bx = 0; bx < 8; bx++) {
              const bookColors = [RAMPS.lava[4], RAMPS.water[4], RAMPS.forest[4], RAMPS.purple[4]];
              const bookColor = bookColors[book % 4];
              setPixel(ctx, bookX + bx, bookY + by, bookColor);
            }
          }
          
          // Book spine
          for (let spine = 0; spine < 6; spine++) {
            setPixel(ctx, bookX, bookY + spine, RAMPS.gold[4]);
          }
          
          // Magical trail
          for (let trail = 1; trail < 8; trail++) {
            const trailAngle = angle - trail * 0.1;
            const trailX = 100 + Math.cos(trailAngle) * orbitRadius;
            const trailY = 100 + Math.sin(trailAngle) * orbitRadius * 0.6;
            const trailIntensity = 1 - (trail / 8);
            
            if (trailIntensity > 0.3) {
              setPixel(ctx, trailX + 4, trailY + 3, RAMPS.purple[2]);
            }
          }
        }
        
        // Central lectern
        for (let ly = 0; ly < 15; ly++) {
          for (let lx = 0; lx < 20; lx++) {
            if (ly < 3 || lx === 0 || lx === 19) {
              setPixel(ctx, 90 + lx, 165 + ly, RAMPS.wood[4]);
            }
          }
        }
        
        // Open book on lectern
        for (let page = 0; page < 2; page++) {
          const pageX = 95 + page * 10;
          const pageY = 163;
          
          for (let py = 0; py < 8; py++) {
            for (let px = 0; px < 8; px++) {
              setPixel(ctx, pageX + px, pageY + py, '#f5f5dc');
            }
          }
          
          // Text lines
          for (let line = 0; line < 3; line++) {
            for (let char = 0; char < 6; char++) {
              setPixel(ctx, pageX + 1 + char, pageY + 2 + line * 2, '#333333');
            }
          }
        }
        
        // Magical sparkles around books
        for (let sparkle = 0; sparkle < 20; sparkle++) {
          const sparkleAngle = (sparkle / 20) * Math.PI * 2 + frame * 0.05;
          const sparkleRadius = 50 + Math.sin(frame * 0.03 + sparkle) * 20;
          const sparkleX = 100 + Math.cos(sparkleAngle) * sparkleRadius;
          const sparkleY = 100 + Math.sin(sparkleAngle) * sparkleRadius * 0.5;
          
          if (sparkleX > 20 && sparkleX < 180 && sparkleY > 60 && sparkleY < 140) {
            const sparklePhase = (frame + sparkle * 7) % 30;
            if (sparklePhase < 15) {
              setPixel(ctx, sparkleX, sparkleY, '#ffffff');
              if (sparklePhase < 8) {
                setPixel(ctx, sparkleX + 1, sparkleY, '#ffff99');
                setPixel(ctx, sparkleX, sparkleY + 1, '#ffff99');
              }
            }
          }
        }
        
        // Bookshelves
        for (let shelf = 0; shelf < 4; shelf++) {
          const shelfX = 20 + shelf * 45;
          
          for (let sy = 0; sy < 60; sy++) {
            for (let sx = 0; sx < 15; sx++) {
              if (sx === 0 || sx === 14 || sy % 15 === 0) {
                setPixel(ctx, shelfX + sx, 100 + sy, RAMPS.wood[4]);
              } else {
                // Books on shelf
                const bookColor = RAMPS[['lava', 'water', 'forest', 'purple'][Math.floor(sx / 4)]][3];
                setPixel(ctx, shelfX + sx, 100 + sy, bookColor);
              }
            }
          }
        }
        
        // Mystical energy emanating from center
        for (let energy = 0; energy < 8; energy++) {
          const energyAngle = (energy / 8) * Math.PI * 2 + frame * 0.2;
          for (let len = 0; len < 40; len++) {
            const energyX = 100 + Math.cos(energyAngle) * len;
            const energyY = 100 + Math.sin(energyAngle) * len * 0.3;
            
            if (len % 6 < 3 && energyX > 20 && energyX < 180 && energyY > 80 && energyY < 120) {
              setPixel(ctx, energyX, energyY, RAMPS.purple[4]);
            }
          }
        }
      };
    }
  },

  'anim-glowing-runes': {
    name: "Glowing Runes",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#1a0a2e');
        
        // Ancient chamber
        drawSky(ctx, 'purple', 6, 60);
        drawWalls(ctx, 'stone');
        drawGround(ctx, 180, 'stone', 'ancient');
        
        // Runic circle pattern on floor
        const centerX = 100;
        const centerY = 130;
        const runeRadius = 40;
        
        // Outer circle
        for (let angle = 0; angle < 360; angle += 5) {
          const outerX = centerX + Math.cos(angle * Math.PI / 180) * runeRadius;
          const outerY = centerY + Math.sin(angle * Math.PI / 180) * runeRadius * 0.6;
          setPixel(ctx, outerX, outerY, RAMPS.stone[4]);
        }
        
        // Inner circle
        for (let angle = 0; angle < 360; angle += 8) {
          const innerX = centerX + Math.cos(angle * Math.PI / 180) * (runeRadius * 0.6);
          const innerY = centerY + Math.sin(angle * Math.PI / 180) * (runeRadius * 0.6) * 0.6;
          setPixel(ctx, innerX, innerY, RAMPS.stone[4]);
        }
        
        // Runes lighting up in sequence
        const runeCount = 12;
        const activeRune = Math.floor(frame * 0.2) % runeCount;
        
        for (let rune = 0; rune < runeCount; rune++) {
          const runeAngle = (rune / runeCount) * Math.PI * 2;
          const runeX = centerX + Math.cos(runeAngle) * runeRadius * 0.8;
          const runeY = centerY + Math.sin(runeAngle) * runeRadius * 0.8 * 0.6;
          
          // Rune symbol (simplified)
          const runeSymbols = [
            [[1,0,1],[0,1,0],[1,1,1]], // Plus shape
            [[1,1,1],[1,0,1],[1,1,1]], // Square with hole
            [[0,1,0],[1,1,1],[0,1,0]], // Cross
            [[1,0,1],[1,1,1],[1,0,1]], // X
          ];
          
          const symbol = runeSymbols[rune % 4];
          const isActive = (rune === activeRune) || (rune === (activeRune - 1 + runeCount) % runeCount && frame % 5 < 3);
          const runeColor = isActive ? RAMPS.purple[5] : RAMPS.stone[4];
          
          for (let sy = 0; sy < 3; sy++) {
            for (let sx = 0; sx < 3; sx++) {
              if (symbol[sy][sx]) {
                setPixel(ctx, runeX + sx - 1, runeY + sy - 1, runeColor);
              }
            }
          }
          
          // Glow effect for active runes
          if (isActive) {
            for (let gy = -2; gy <= 4; gy++) {
              for (let gx = -2; gx <= 4; gx++) {
                const glowDist = Math.sqrt(gx*gx + gy*gy);
                if (glowDist > 2 && glowDist < 4 && Math.random() > 0.6) {
                  setPixel(ctx, runeX + gx, runeY + gy, RAMPS.purple[3]);
                }
              }
            }
          }
        }
        
        // Central activation when sequence completes
        if (activeRune === 0 && frame % (runeCount * 5) < 20) {
          const centralPulse = Math.sin(frame * 0.8) * 0.5 + 0.5;
          
          // Central rune
          for (let cy = -3; cy <= 3; cy++) {
            for (let cx = -3; cx <= 3; cx++) {
              const centerDist = Math.sqrt(cx*cx + cy*cy);
              if (centerDist < 3) {
                const intensity = 1 - (centerDist / 3);
                const colorIndex = Math.floor(intensity * 3 + centralPulse * 2);
                setPixel(ctx, centerX + cx, centerY + cy, RAMPS.purple[Math.min(colorIndex + 2, RAMPS.purple.length - 1)]);
              }
            }
          }
          
          // Energy emanation
          for (let ray = 0; ray < 8; ray++) {
            const rayAngle = (ray / 8) * Math.PI * 2;
            const rayLength = 15 + centralPulse * 10;
            
            for (let len = 0; len < rayLength; len++) {
              const rayX = centerX + Math.cos(rayAngle) * len;
              const rayY = centerY + Math.sin(rayAngle) * len * 0.6;
              
              if (len % 4 < 2) {
                setPixel(ctx, rayX, rayY, RAMPS.purple[4]);
              }
            }
          }
        }
        
        // Floating rune particles
        for (let particle = 0; particle < 15; particle++) {
          const particleLife = (frame + particle * 8) % 100;
          const particleAngle = (particle / 15) * Math.PI * 2 + particleLife * 0.02;
          const particleRadius = 20 + Math.sin(particleLife * 0.1) * 15;
          
          const particleX = centerX + Math.cos(particleAngle) * particleRadius;
          const particleY = centerY + Math.sin(particleAngle) * particleRadius * 0.4;
          
          if (particleX > 20 && particleX < 180 && particleY > 80 && particleY < 160) {
            setPixel(ctx, particleX, particleY, RAMPS.purple[4]);
            
            if (particleLife % 20 < 10) {
              setPixel(ctx, particleX + 1, particleY, RAMPS.purple[3]);
              setPixel(ctx, particleX, particleY + 1, RAMPS.purple[3]);
            }
          }
        }
        
        // Ancient pillars with runes
        for (let pillar = 0; pillar < 4; pillar++) {
          const pillarX = 40 + pillar * 40;
          const pillarY = 120;
          
          // Pillar
          for (let py = 0; py < 60; py++) {
            for (let px = 0; px < 8; px++) {
              setPixel(ctx, pillarX + px, pillarY + py, RAMPS.stone[3]);
            }
          }
          
          // Runes on pillar (glowing if sequence active)
          const pillarActive = activeRune >= pillar * 3 && activeRune < (pillar + 1) * 3;
          const pillarRuneColor = pillarActive ? RAMPS.purple[5] : RAMPS.stone[4];
          
          for (let pr = 0; pr < 3; pr++) {
            const runeY = pillarY + 10 + pr * 15;
            
            // Simple rune pattern
            for (let ry = 0; ry < 3; ry++) {
              for (let rx = 0; rx < 3; rx++) {
                if ((rx + ry) % 2 === pr % 2) {
                  setPixel(ctx, pillarX + 3 + rx, runeY + ry, pillarRuneColor);
                }
              }
            }
          }
        }
        
        // Mystical ambient lighting
        for (let ambient = 0; ambient < 30; ambient++) {
          const ambientX = 20 + ambient * 6;
          const ambientY = 70 + Math.sin(ambient * 0.4 + frame * 0.1) * 20;
          
          if (ambientY > 60 && ambientY < 100) {
            setPixel(ctx, ambientX, ambientY, RAMPS.purple[2]);
          }
        }
      };
    }
  },

  'anim-bubbling-cauldron': {
    name: "Bubbling Cauldron",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#1a0f08');
        
        // Witch's hut interior
        drawSky(ctx, 'wood', 6, 80);
        drawWalls(ctx, 'wood');
        drawGround(ctx, 180, 'wood', 'smooth');
        
        // Large cauldron
        const cauldronX = 90;
        const cauldronY = 140;
        
        // Cauldron base and sides
        for (let cy = 0; cy < 20; cy++) {
          const cauldronWidth = 20 + Math.sin(cy * 0.1) * 4;
          for (let cx = 0; cx < cauldronWidth; cx++) {
            if (cx === 0 || cx === cauldronWidth - 1 || cy === 19) {
              setPixel(ctx, cauldronX + cx - cauldronWidth/2, cauldronY + cy, RAMPS.stone[4]);
            }
          }
        }
        
        // Cauldron legs
        for (let leg = 0; leg < 3; leg++) {
          const legAngle = (leg / 3) * Math.PI * 2;
          const legX = cauldronX + Math.cos(legAngle) * 15;
          const legY = cauldronY + 20;
          
          for (let ly = 0; ly < 8; ly++) {
            setPixel(ctx, legX, legY + ly, RAMPS.stone[4]);
            setPixel(ctx, legX + 1, legY + ly, RAMPS.stone[3]);
          }
        }
        
        // Fire under cauldron
        for (let fire = 0; fire < 12; fire++) {
          const fireAngle = (fire / 12) * Math.PI * 2;
          const fireRadius = 18 + Math.sin(frame * 0.3 + fire) * 4;
          const fireHeight = 8 + Math.sin(frame * 0.2 + fire * 1.2) * 4;
          
          const fireBaseX = cauldronX + Math.cos(fireAngle) * fireRadius;
          const fireBaseY = cauldronY + 28;
          
          // Flame tongue
          for (let h = 0; h < fireHeight; h++) {
            const flameWidth = Math.max(1, (fireHeight - h) / 2);
            const flameWave = Math.sin(h * 0.3 + frame * 0.5 + fire) * 2;
            
            for (let w = 0; w < flameWidth; w++) {
              const flameX = fireBaseX + w - flameWidth/2 + flameWave;
              const flameY = fireBaseY - h;
              
              // Flame color
              let flameColor;
              const heightRatio = h / fireHeight;
              if (heightRatio < 0.3) {
                flameColor = RAMPS.lava[5];
              } else if (heightRatio < 0.7) {
                flameColor = RAMPS.lava[4];
              } else {
                flameColor = RAMPS.lava[3];
              }
              
              setPixel(ctx, flameX, flameY, flameColor);
            }
          }
        }
        
        // Bubbling potion inside cauldron
        const potionSurface = cauldronY + 8;
        const bubbleIntensity = Math.sin(frame * 0.2) * 0.3 + 0.7;
        
        // Potion liquid
        for (let py = 8; py < 18; py++) {
          const potionWidth = 16 + Math.sin(py * 0.2) * 2;
          for (let px = 0; px < potionWidth; px++) {
            const potionColor = '#00ff00'; // Green potion
            setPixel(ctx, cauldronX + px - potionWidth/2, cauldronY + py, potionColor);
          }
        }
        
        // Bubbles rising from bottom
        for (let bubble = 0; bubble < 8; bubble++) {
          const bubbleLife = (frame + bubble * 8) % 40;
          const bubbleX = cauldronX + (bubble - 4) * 2;
          const bubbleY = potionSurface + 8 - bubbleLife;
          const bubbleSize = 1 + Math.sin(bubbleLife * 0.2) * 2;
          
          if (bubbleY > potionSurface && bubbleY < cauldronY + 18) {
            // Bubble
            for (let by = -bubbleSize/2; by <= bubbleSize/2; by++) {
              for (let bx = -bubbleSize/2; bx <= bubbleSize/2; bx++) {
                const bubbleDist = Math.sqrt(bx*bx + by*by);
                if (bubbleDist < bubbleSize/2) {
                  setPixel(ctx, bubbleX + bx, bubbleY + by, '#88ff88');
                }
              }
            }
          } else if (bubbleY <= potionSurface) {
            // Bubble pops at surface
            const popSize = Math.min(4, bubbleLife - 32);
            if (popSize > 0) {
              for (let pop = 0; pop < popSize * 3; pop++) {
                const popAngle = (pop / (popSize * 3)) * Math.PI * 2;
                const popX = bubbleX + Math.cos(popAngle) * popSize;
                const popY = potionSurface + Math.sin(popAngle) * popSize * 0.3;
                setPixel(ctx, popX, popY, '#66ff66');
              }
            }
          }
        }
        
        // Steam rising from cauldron
        for (let steam = 0; steam < 15; steam++) {
          const steamLife = (frame + steam * 4) % 60;
          const steamX = cauldronX + Math.sin(steam + frame * 0.1) * 8;
          const steamY = potionSurface - steamLife;
          
          if (steamY > 60) {
            const steamIntensity = 1 - (steamLife / 60);
            let steamColor;
            if (steamIntensity > 0.7) {
              steamColor = '#ffffff';
            } else if (steamIntensity > 0.4) {
              steamColor = '#e6e6e6';
            } else {
              steamColor = '#cccccc';
            }
            
            setPixel(ctx, steamX, steamY, steamColor);
            
            // Steam wisps
            if (steam % 3 === 0) {
              setPixel(ctx, steamX + 1, steamY, steamColor);
              setPixel(ctx, steamX - 1, steamY, steamColor);
            }
          }
        }
        
        // Ingredients floating in potion
        for (let ingredient = 0; ingredient < 6; ingredient++) {
          const ingAngle = (ingredient / 6) * Math.PI * 2 + frame * 0.05;
          const ingRadius = 4 + Math.sin(frame * 0.1 + ingredient) * 2;
          const ingX = cauldronX + Math.cos(ingAngle) * ingRadius;
          const ingY = potionSurface + 4 + Math.sin(ingAngle) * 2;
          
          // Different ingredient types
          const ingColors = ['#ff6600', '#660066', '#006600', '#000066'];
          const ingColor = ingColors[ingredient % 4];
          
          setPixel(ctx, ingX, ingY, ingColor);
          setPixel(ctx, ingX + 1, ingY, ingColor);
        }
        
        // Spell books nearby
        for (let book = 0; book < 3; book++) {
          const bookX = 50 + book * 25;
          const bookY = 170;
          
          // Book
          for (let by = 0; by < 8; by++) {
            for (let bx = 0; bx < 12; bx++) {
              setPixel(ctx, bookX + bx, bookY + by, RAMPS.purple[3]);
            }
          }
          
          // Book spine
          for (let spine = 0; spine < 8; spine++) {
            setPixel(ctx, bookX, bookY + spine, RAMPS.gold[4]);
          }
        }
        
        // Ingredient jars on shelves
        for (let jar = 0; jar < 4; jar++) {
          const jarX = 140 + jar * 15;
          const jarY = 100;
          
          // Jar
          for (let jy = 0; jy < 12; jy++) {
            for (let jx = 0; jx < 6; jx++) {
              if (jx === 0 || jx === 5 || jy === 0 || jy === 11) {
                setPixel(ctx, jarX + jx, jarY + jy, RAMPS.wood[3]);
              } else {
                // Jar contents
                const jarColors = [RAMPS.purple[4], '#ff6600', RAMPS.forest[4], '#ffffff'];
                setPixel(ctx, jarX + jx, jarY + jy, jarColors[jar]);
              }
            }
          }
        }
        
        // Magical sparkles around cauldron
        for (let sparkle = 0; sparkle < 12; sparkle++) {
          const sparkleAngle = (sparkle / 12) * Math.PI * 2 + frame * 0.1;
          const sparkleRadius = 30 + Math.sin(frame * 0.05 + sparkle) * 8;
          const sparkleX = cauldronX + Math.cos(sparkleAngle) * sparkleRadius;
          const sparkleY = cauldronY + Math.sin(sparkleAngle) * sparkleRadius * 0.3;
          
          const sparklePhase = (frame + sparkle * 7) % 30;
          if (sparklePhase < 15 && sparkleX > 20 && sparkleX < 180 && sparkleY > 80 && sparkleY < 160) {
            setPixel(ctx, sparkleX, sparkleY, '#ffffff');
            if (sparklePhase < 8) {
              setPixel(ctx, sparkleX + 1, sparkleY, '#ffff99');
              setPixel(ctx, sparkleX, sparkleY + 1, '#ffff99');
            }
          }
        }
      };
    }
  }
};

// ============================================================================
// GENERATION FUNCTIONS
// ============================================================================

async function generateStillBackgrounds() {
  console.log('\n🖼️ Generating still backgrounds...');
  
  for (const [key, scene] of Object.entries(stillScenes)) {
    console.log(`\n📷 Generating ${scene.name}...`);
    
    const { canvas, ctx } = createWorkCanvas();
    scene.generator(ctx);
    
    const finalCanvas = upscaleCanvas(canvas, 4);
    const filename = path.join(STILL_DIR, `${key}.png`);
    const size = await savePNG(filename, finalCanvas);
    
    console.log(`   ✅ Saved ${filename} (${Math.round(size/1024)}KB)`);
  }
}

async function generateAnimatedBackgrounds() {
  console.log('\n🎬 Generating animated backgrounds...');
  
  for (const [key, scene] of Object.entries(animatedScenes)) {
    console.log(`\n🎞️ Generating ${scene.name}...`);
    
    const frames = [];
    for (let frame = 0; frame < FRAMES; frame++) {
      const { canvas, ctx } = createWorkCanvas();
      const frameGenerator = scene.generator(frame);
      frameGenerator(ctx);
      
      const upscaled = upscaleCanvas(canvas, 2);
      frames.push(upscaled);
    }
    
    const filename = path.join(GIF_DIR, `${key}.gif`);
    const size = await saveGIF(filename, frames);
    
    console.log(`   ✅ Saved ${filename} (${Math.round(size/1024)}KB)`);
  }
}

async function main() {
  console.log('🎨 Starting Order of 86 Batch 2 REMAINING generation...');
  console.log(`📊 Generating ${Object.keys(stillScenes).length} still backgrounds and ${Object.keys(animatedScenes).length} animated backgrounds`);
  
  try {
    await generateStillBackgrounds();
    await generateAnimatedBackgrounds();
    
    console.log('\n✨ All remaining backgrounds generated successfully!');
    console.log('🚀 Ready to deploy with git add -A && git commit && git push!');
  } catch (error) {
    console.error('\n❌ Generation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}