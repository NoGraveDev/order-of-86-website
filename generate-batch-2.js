/**
 * Batch 2 Generator for Order of 86 Website
 * Generates 20 new still PNG backgrounds (800x800) and 20 new animated GIF backgrounds (400x400)
 * Using the fixed pixel-engine.js with proper layering and selective dithering
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
// STILL BACKGROUND SCENES
// ============================================================================

const stillScenes = {
  'scene-flame-altar': {
    name: "Flame Altar",
    generator: (ctx) => {
      fillBackground(ctx, '#8b0000'); // Dark red base
      
      // Stone chamber sky
      drawSky(ctx, 'stone', 10, 60);
      
      // Stone chamber walls
      drawWalls(ctx, 'stone', 20, 180);
      
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

  'scene-wild-thicket': {
    name: "Wild Thicket",
    generator: (ctx) => {
      fillBackground(ctx, '#1a3a1a'); // Forest green base
      
      // Dense forest sky
      drawSky(ctx, 'forest', 8, 80);
      
      // Overgrown forest path
      drawGround(ctx, 160, 'forest', 'moss');
      
      // Dense thicket of trees
      for (let i = 0; i < 8; i++) {
        const treeX = 20 + i * 22;
        const treeY = 100 + Math.sin(i) * 20;
        if (i % 3 === 0) {
          drawSprite(ctx, treeX, treeY, tree_oak(), 'forest');
        } else {
          drawSprite(ctx, treeX, treeY, tree_pine(), 'forest');
        }
      }
      
      // Undergrowth and bushes
      for (let x = 10; x < 190; x += 15) {
        for (let y = 140; y < 170; y += 10) {
          if (Math.random() > 0.4) {
            for (let by = 0; by < 8; by++) {
              for (let bx = 0; bx < 10; bx++) {
                if (Math.random() > 0.5) {
                  setPixel(ctx, x + bx, y + by, RAMPS.forest[2 + Math.floor(Math.random() * 2)]);
                }
              }
            }
          }
        }
      }
      
      // Vines hanging down
      for (let v = 0; v < 12; v++) {
        const vineX = 30 + v * 15;
        for (let vy = 60; vy < 120; vy += 3) {
          if (Math.random() > 0.4) {
            setPixel(ctx, vineX, vy, RAMPS.forest[1]);
          }
        }
      }
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
      drawWalls(ctx, 'purple', 60, 180);
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

  'scene-deep-trench': {
    name: "Deep Trench",
    generator: (ctx) => {
      fillBackground(ctx, '#0a0a2e'); // Deep blue base
      
      // Deep ocean sky
      drawSky(ctx, 'water', 15, 200);
      
      // Trench walls
      for (let y = 80; y < 200; y++) {
        for (let x = 0; x < 200; x++) {
          const trenchShape = 100 + Math.sin(y * 0.05) * 40;
          const leftWall = trenchShape - 50;
          const rightWall = trenchShape + 50;
          
          if (x < leftWall || x > rightWall) {
            setPixel(ctx, x, y, RAMPS.stone[1 + Math.floor(Math.random() * 2)]);
          }
        }
      }
      
      // Glowing anglerfish
      const anglerfish = [
        { x: 60, y: 120, dir: 1 },
        { x: 140, y: 160, dir: -1 },
        { x: 100, y: 100, dir: 1 }
      ];
      
      for (const fish of anglerfish) {
        // Fish body
        for (let fy = 0; fy < 8; fy++) {
          for (let fx = 0; fx < 12; fx++) {
            const dist = Math.sqrt((fx - 6) * (fx - 6) + (fy - 4) * (fy - 4));
            if (dist < 4) {
              setPixel(ctx, fish.x + fx, fish.y + fy, RAMPS.water[4]);
            }
          }
        }
        
        // Glowing lure
        const lureX = fish.x + (fish.dir > 0 ? 15 : -3);
        const lureY = fish.y - 5;
        setPixel(ctx, lureX, lureY, '#00ff00');
        
        // Lure glow
        for (let gy = -2; gy <= 2; gy++) {
          for (let gx = -2; gx <= 2; gx++) {
            const dist = Math.sqrt(gx*gx + gy*gy);
            if (dist > 1 && dist < 2.5 && Math.random() > 0.7) {
              setPixel(ctx, lureX + gx, lureY + gy, '#004400');
            }
          }
        }
      }
      
      // Kelp and seaweed
      for (let k = 0; k < 8; k++) {
        const kelpX = 30 + k * 20;
        for (let ky = 120; ky < 200; ky += 4) {
          setPixel(ctx, kelpX + Math.sin(ky * 0.1) * 3, ky, RAMPS.forest[2]);
        }
      }
    }
  },

  'scene-radiant-sunrise-temple': {
    name: "Radiant Sunrise Temple",
    generator: (ctx) => {
      fillBackground(ctx, '#ffd700'); // Golden base
      
      // Sunrise sky
      drawSky(ctx, 'sky_sunset', 18, 100);
      
      // Temple structure
      drawGround(ctx, 160, 'gold', 'smooth');
      
      // Temple pillars
      for (let p = 0; p < 5; p++) {
        const pillarX = 30 + p * 35;
        drawSprite(ctx, pillarX, 100, pillar(), 'gold');
      }
      
      // Temple roof
      for (let y = 80; y < 100; y++) {
        for (let x = 20; x < 180; x++) {
          const roofShape = Math.abs(x - 100) < (100 - y);
          if (roofShape) {
            setPixel(ctx, x, y, RAMPS.gold[4]);
          }
        }
      }
      
      // Golden dome
      for (let dy = -15; dy <= 0; dy++) {
        for (let dx = -20; dx <= 20; dx++) {
          const dist = Math.sqrt(dx*dx + dy*dy*2);
          if (dist < 20 && dist > 17) {
            setPixel(ctx, 100 + dx, 80 + dy, RAMPS.gold[5]);
          } else if (dist <= 17) {
            setPixel(ctx, 100 + dx, 80 + dy, RAMPS.gold[4]);
          }
        }
      }
      
      // Sun rays
      for (let r = 0; r < 12; r++) {
        const angle = (r / 12) * Math.PI * 2;
        for (let len = 0; len < 40; len++) {
          const rayX = 100 + Math.cos(angle) * len;
          const rayY = 50 + Math.sin(angle) * len * 0.5;
          if (rayX > 0 && rayX < 200 && rayY > 0 && rayY < 80) {
            setPixel(ctx, rayX, rayY, RAMPS.gold[5]);
          }
        }
      }
      
      // Golden altar
      for (let y = 150; y < 165; y++) {
        for (let x = 90; x < 110; x++) {
          setPixel(ctx, x, y, RAMPS.gold[3]);
        }
      }
    }
  },

  'scene-heart-garden-pavilion': {
    name: "Heart Garden Pavilion",
    generator: (ctx) => {
      fillBackground(ctx, '#aa5a9a'); // Pink base
      
      // Pink magical sky
      drawSky(ctx, 'pink', 12, 100);
      
      // Garden ground
      drawGround(ctx, 140, 'forest', 'grass');
      
      // Pink gazebo structure
      for (let p = 0; p < 6; p++) {
        const angle = (p / 6) * Math.PI * 2;
        const pillarX = 100 + Math.cos(angle) * 30;
        const pillarY = 100 + Math.sin(angle) * 15;
        
        // Gazebo pillars
        for (let h = 0; h < 40; h++) {
          setPixel(ctx, pillarX, pillarY + h, RAMPS.pink[3]);
        }
      }
      
      // Gazebo roof
      for (let ry = 0; ry < 20; ry++) {
        for (let rx = 0; rx < 80; rx++) {
          const centerDist = Math.sqrt((rx - 40) * (rx - 40) + ry * ry * 4);
          if (centerDist < 40 && centerDist > 35) {
            setPixel(ctx, 60 + rx, 90 - ry, RAMPS.pink[4]);
          }
        }
      }
      
      // Heart-shaped flower beds
      for (let h = 0; h < 8; h++) {
        const heartAngle = (h / 8) * Math.PI * 2;
        const heartX = 100 + Math.cos(heartAngle) * 60;
        const heartY = 120 + Math.sin(heartAngle) * 30;
        
        // Flower bed
        for (let fy = 0; fy < 12; fy++) {
          for (let fx = 0; fx < 12; fx++) {
            const heartDist = Math.sqrt((fx - 6) * (fx - 6) + (fy - 6) * (fy - 6));
            if (heartDist < 6) {
              setPixel(ctx, heartX + fx - 6, heartY + fy - 6, RAMPS.pink[2]);
            }
          }
        }
        
        // Pink flowers
        setPixel(ctx, heartX, heartY, RAMPS.pink[5]);
        setPixel(ctx, heartX + 1, heartY, RAMPS.pink[4]);
        setPixel(ctx, heartX, heartY + 1, RAMPS.pink[4]);
      }
      
      // Floating pink petals
      for (let i = 0; i < 15; i++) {
        const petalX = Math.random() * 180 + 10;
        const petalY = Math.random() * 100 + 20;
        setPixel(ctx, petalX, petalY, RAMPS.pink[4]);
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
      drawWalls(ctx, 'ice', 30, 180);
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

  'scene-lava-bridge': {
    name: "Lava Bridge",
    generator: (ctx) => {
      fillBackground(ctx, '#ff4500'); // Lava orange base
      
      // Volcanic sky
      drawSky(ctx, 'lava', 12, 60);
      
      // Molten lava river
      for (let y = 120; y < 200; y++) {
        for (let x = 0; x < 200; x++) {
          const lavaColor = RAMPS.lava[3 + Math.floor(Math.random() * 3)];
          setPixel(ctx, x, y, lavaColor);
        }
      }
      
      // Stone bridge across lava
      for (let y = 115; y < 125; y++) {
        for (let x = 30; x < 170; x++) {
          setPixel(ctx, x, y, RAMPS.stone[3]);
        }
      }
      
      // Bridge supports
      for (let s = 0; s < 3; s++) {
        const supportX = 50 + s * 50;
        for (let y = 125; y < 140; y++) {
          for (let x = 0; x < 8; x++) {
            setPixel(ctx, supportX + x, y, RAMPS.stone[2]);
          }
        }
      }
      
      // Bridge railings
      for (let x = 30; x < 170; x++) {
        if (x % 10 < 2) {
          setPixel(ctx, x, 110, RAMPS.stone[4]);
          setPixel(ctx, x, 111, RAMPS.stone[3]);
        }
      }
      
      // Lava bubbles
      for (let b = 0; b < 15; b++) {
        const bubbleX = Math.random() * 200;
        const bubbleY = 140 + Math.random() * 40;
        
        // Bubble
        for (let by = -3; by <= 3; by++) {
          for (let bx = -3; bx <= 3; bx++) {
            const dist = Math.sqrt(bx*bx + by*by);
            if (dist < 3) {
              setPixel(ctx, bubbleX + bx, bubbleY + by, RAMPS.lava[5]);
            }
          }
        }
      }
      
      // Volcanic rocks
      drawSprite(ctx, 20, 100, rock_cluster(), 'lava');
      drawSprite(ctx, 170, 105, rock_cluster(), 'lava');
    }
  },

  'scene-mushroom-cavern': {
    name: "Mushroom Cavern",
    generator: (ctx) => {
      fillBackground(ctx, '#1a0f08'); // Dark brown base
      
      // Cave ceiling
      drawSky(ctx, 'stone', 8, 70);
      
      // Cave walls
      drawWalls(ctx, 'stone', 40, 180);
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

  'scene-shipwreck-cove': {
    name: "Shipwreck Cove",
    generator: (ctx) => {
      fillBackground(ctx, '#4a7aae'); // Ocean blue base
      
      // Stormy sky
      drawSky(ctx, 'water', 12, 100);
      
      // Rocky shore
      drawGround(ctx, 160, 'stone', 'rocky');
      
      // Wrecked ship hull
      const shipX = 80;
      const shipY = 130;
      
      // Ship hull
      for (let y = 0; y < 30; y++) {
        for (let x = 0; x < 40; x++) {
          const hullShape = Math.abs(x - 20) < (30 - y) / 2;
          if (hullShape) {
            setPixel(ctx, shipX + x, shipY + y, RAMPS.wood[2 + Math.floor(Math.random() * 2)]);
          }
        }
      }
      
      // Broken mast
      for (let m = 0; m < 25; m++) {
        setPixel(ctx, shipX + 20, shipY - m, RAMPS.wood[3]);
        if (m < 15) {
          setPixel(ctx, shipX + 21, shipY - m, RAMPS.wood[2]);
        }
      }
      
      // Torn sails
      for (let s = 0; s < 8; s++) {
        for (let x = 0; x < 12; x++) {
          if (Math.random() > 0.4) {
            setPixel(ctx, shipX + 25 + x, shipY - 15 + s, '#cccccc');
          }
        }
      }
      
      // Rocks around shore
      for (let r = 0; r < 6; r++) {
        const rockX = 20 + r * 30;
        const rockY = 150 + Math.sin(r) * 10;
        drawSprite(ctx, rockX, rockY, rock_cluster(), 'stone');
      }
      
      // Seaweed and debris
      for (let d = 0; d < 10; d++) {
        const debrisX = 40 + d * 15;
        const debrisY = 165 + Math.random() * 10;
        
        if (d % 2 === 0) {
          // Seaweed
          for (let wy = 0; wy < 8; wy++) {
            setPixel(ctx, debrisX, debrisY + wy, RAMPS.forest[2]);
          }
        } else {
          // Wood debris
          for (let wy = 0; wy < 4; wy++) {
            for (let wx = 0; wx < 6; wx++) {
              setPixel(ctx, debrisX + wx, debrisY + wy, RAMPS.wood[1]);
            }
          }
        }
      }
      
      // Foam on shore
      for (let f = 0; f < 20; f++) {
        const foamX = 20 + f * 8;
        const foamY = 158 + Math.sin(f * 0.5) * 3;
        setPixel(ctx, foamX, foamY, '#ffffff');
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
      drawWalls(ctx, 'wood', 40, 180);
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
      drawWalls(ctx, 'stone', 30, 180);
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

  'scene-training-grounds': {
    name: "Training Grounds",
    generator: (ctx) => {
      fillBackground(ctx, '#7aba7a'); // Green base
      
      // Training ground sky
      drawSky(ctx, 'sky_sunset', 12, 80);
      
      // Grassy ground
      drawGround(ctx, 160, 'forest', 'grass');
      
      // Practice dummies
      for (let dummy = 0; dummy < 3; dummy++) {
        const dummyX = 50 + dummy * 50;
        const dummyY = 140;
        
        // Dummy post
        for (let y = 0; y < 20; y++) {
          setPixel(ctx, dummyX + 2, dummyY + y, RAMPS.wood[3]);
          setPixel(ctx, dummyX + 3, dummyY + y, RAMPS.wood[2]);
        }
        
        // Dummy body
        for (let y = 0; y < 12; y++) {
          for (let x = 0; x < 8; x++) {
            setPixel(ctx, dummyX + x, dummyY + 5 + y, '#deb887');
          }
        }
        
        // Dummy arms
        for (let x = 0; x < 12; x++) {
          setPixel(ctx, dummyX - 2 + x, dummyY + 10, '#deb887');
        }
        
        // Weapon strikes on dummy
        for (let strike = 0; strike < 3; strike++) {
          const strikeX = dummyX + 1 + strike * 2;
          const strikeY = dummyY + 8 + strike;
          setPixel(ctx, strikeX, strikeY, RAMPS.lava[3]);
        }
      }
      
      // Target rings
      for (let target = 0; target < 2; target++) {
        const targetX = 30 + target * 140;
        const targetY = 110;
        
        // Target rings
        for (let ring = 0; ring < 4; ring++) {
          const radius = 8 + ring * 4;
          const ringColor = ring % 2 === 0 ? '#ff0000' : '#ffffff';
          
          for (let angle = 0; angle < 360; angle += 10) {
            const x = targetX + Math.cos(angle * Math.PI / 180) * radius;
            const y = targetY + Math.sin(angle * Math.PI / 180) * radius;
            setPixel(ctx, x, y, ringColor);
          }
        }
        
        // Target post
        for (let y = 0; y < 40; y++) {
          setPixel(ctx, targetX, targetY + 20 + y, RAMPS.wood[3]);
        }
        
        // Arrows in target
        for (let arrow = 0; arrow < 2; arrow++) {
          const arrowX = targetX + (arrow - 0.5) * 6;
          const arrowY = targetY + arrow * 4;
          
          // Arrow shaft
          for (let s = 0; s < 8; s++) {
            setPixel(ctx, arrowX + s, arrowY, RAMPS.wood[4]);
          }
          
          // Arrow head
          setPixel(ctx, arrowX - 1, arrowY, RAMPS.stone[4]);
          
          // Fletching
          setPixel(ctx, arrowX + 8, arrowY - 1, '#ffffff');
          setPixel(ctx, arrowX + 8, arrowY + 1, '#ffffff');
        }
      }
      
      // Training weapons rack
      for (let y = 120; y < 140; y++) {
        setPixel(ctx, 180, y, RAMPS.wood[3]);
        setPixel(ctx, 181, y, RAMPS.wood[2]);
      }
      
      // Weapons on rack
      const weapons = ['sword', 'spear', 'axe'];
      for (let w = 0; w < weapons.length; w++) {
        const weaponY = 125 + w * 5;
        
        // Weapon handle
        for (let h = 0; h < 8; h++) {
          setPixel(ctx, 175 + h, weaponY, RAMPS.wood[4]);
        }
        
        // Weapon blade
        for (let b = 0; b < 4; b++) {
          setPixel(ctx, 170 + b, weaponY, RAMPS.stone[4]);
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
      drawWalls(ctx, 'stone', 30, 180);
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

  'scene-owl-roost': {
    name: "Owl Roost",
    generator: (ctx) => {
      fillBackground(ctx, '#050510'); // Night black base
      
      // Night sky with stars
      drawSky(ctx, 'sky_night', 8, 120);
      
      // Add many stars
      for (let i = 0; i < 50; i++) {
        const starX = Math.random() * 200;
        const starY = Math.random() * 120;
        const brightness = Math.random();
        if (brightness > 0.7) {
          setPixel(ctx, starX, starY, '#ffffff');
        } else if (brightness > 0.4) {
          setPixel(ctx, starX, starY, '#cccccc');
        }
      }
      
      // Large ancient tree
      const treeX = 100;
      const treeY = 120;
      
      // Tree trunk
      for (let y = 0; y < 80; y++) {
        const trunkWidth = 15 + Math.sin(y * 0.1) * 5;
        for (let x = 0; x < trunkWidth; x++) {
          setPixel(ctx, treeX - trunkWidth/2 + x, treeY + y, RAMPS.wood[2 + Math.floor(Math.random() * 2)]);
        }
      }
      
      // Tree branches
      for (let branch = 0; branch < 8; branch++) {
        const angle = (branch / 8) * Math.PI * 2;
        const branchLength = 25 + Math.random() * 15;
        
        for (let len = 0; len < branchLength; len++) {
          const branchX = treeX + Math.cos(angle) * len;
          const branchY = treeY + 20 + Math.sin(angle) * len * 0.5;
          
          if (branchX > 0 && branchX < 200 && branchY > 0 && branchY < 200) {
            setPixel(ctx, branchX, branchY, RAMPS.wood[3]);
            setPixel(ctx, branchX, branchY + 1, RAMPS.wood[2]);
          }
        }
      }
      
      // Owl nests in branches
      for (let nest = 0; nest < 6; nest++) {
        const angle = (nest / 6) * Math.PI * 2;
        const nestDist = 20 + nest * 5;
        const nestX = treeX + Math.cos(angle) * nestDist;
        const nestY = treeY + 15 + Math.sin(angle) * nestDist * 0.3;
        
        // Nest
        for (let ny = 0; ny < 6; ny++) {
          for (let nx = 0; nx < 8; nx++) {
            const nestShape = Math.sqrt((nx - 4) * (nx - 4) + (ny - 3) * (ny - 3));
            if (nestShape < 4 && ny > 1) {
              setPixel(ctx, nestX + nx - 4, nestY + ny, RAMPS.wood[1]);
            }
          }
        }
        
        // Owl in nest
        if (nest % 2 === 0) {
          // Owl body
          for (let oy = 0; oy < 4; oy++) {
            for (let ox = 0; ox < 3; ox++) {
              setPixel(ctx, nestX + ox - 1, nestY + oy - 2, RAMPS.wood[4]);
            }
          }
          
          // Owl eyes
          setPixel(ctx, nestX - 1, nestY - 1, '#ffff00');
          setPixel(ctx, nestX + 1, nestY - 1, '#ffff00');
          
          // Owl beak
          setPixel(ctx, nestX, nestY, '#ffa500');
        }
      }
      
      // Flying owls
      for (let flyingOwl = 0; flyingOwl < 3; flyingOwl++) {
        const owlX = 30 + flyingOwl * 60;
        const owlY = 60 + Math.sin(flyingOwl * 2) * 20;
        
        // Owl body
        for (let oy = 0; oy < 5; oy++) {
          for (let ox = 0; ox < 4; ox++) {
            setPixel(ctx, owlX + ox, owlY + oy, RAMPS.wood[4]);
          }
        }
        
        // Wings spread
        for (let wing = 0; wing < 2; wing++) {
          const wingDir = wing === 0 ? -1 : 1;
          for (let w = 0; w < 8; w++) {
            setPixel(ctx, owlX + 2 + wingDir * (3 + w), owlY + 2, RAMPS.wood[3]);
          }
        }
        
        // Eyes
        setPixel(ctx, owlX + 1, owlY + 1, '#ffff00');
        setPixel(ctx, owlX + 3, owlY + 1, '#ffff00');
      }
      
      // Moon in background
      drawMoon(ctx, 160, 40, 15);
      
      // Ground with fallen leaves
      drawGround(ctx, 180, 'wood', 'natural');
      
      // Fallen leaves
      for (let leaf = 0; leaf < 20; leaf++) {
        const leafX = Math.random() * 180 + 10;
        const leafY = 175 + Math.random() * 15;
        const leafColor = [RAMPS.forest[3], RAMPS.wood[3], '#8b4513'][Math.floor(Math.random() * 3)];
        
        setPixel(ctx, leafX, leafY, leafColor);
        setPixel(ctx, leafX + 1, leafY, leafColor);
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
      drawWalls(ctx, 'crystal', 30, 180);
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
      drawWalls(ctx, 'stone', 40, 180);
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

  'scene-healing-springs': {
    name: "Healing Springs",
    generator: (ctx) => {
      fillBackground(ctx, '#4a7aae'); // Blue base
      
      // Peaceful sky
      drawSky(ctx, 'water', 10, 100);
      
      // Rocky pool edges
      drawGround(ctx, 160, 'stone', 'smooth');
      
      // Natural spring pools
      for (let pool = 0; pool < 3; pool++) {
        const poolX = 40 + pool * 60;
        const poolY = 140;
        const poolRadius = 15 + pool * 5;
        
        // Pool water
        for (let py = -poolRadius; py <= poolRadius; py++) {
          for (let px = -poolRadius; px <= poolRadius; px++) {
            const poolDist = Math.sqrt(px*px + py*py);
            if (poolDist < poolRadius) {
              const depth = 1 - (poolDist / poolRadius);
              const waterColor = RAMPS.water[2 + Math.floor(depth * 3)];
              setPixel(ctx, poolX + px, poolY + py, waterColor);
            }
          }
        }
        
        // Pool rim
        for (let angle = 0; angle < 360; angle += 15) {
          const rimX = poolX + Math.cos(angle * Math.PI / 180) * poolRadius;
          const rimY = poolY + Math.sin(angle * Math.PI / 180) * poolRadius;
          setPixel(ctx, rimX, rimY, RAMPS.stone[4]);
        }
        
        // Steam rising from hot springs
        for (let steam = 0; steam < 8; steam++) {
          const steamAngle = (steam / 8) * Math.PI * 2;
          const steamX = poolX + Math.cos(steamAngle) * 5;
          const steamY = poolY - 10 - steam * 4;
          
          if (steamY > 60) {
            setPixel(ctx, steamX, steamY, '#ffffff');
            setPixel(ctx, steamX + 1, steamY, '#e6e6e6');
          }
        }
      }
      
      // Healing moss around springs
      for (let moss = 0; moss < 20; moss++) {
        const mossX = 20 + Math.random() * 160;
        const mossY = 150 + Math.random() * 30;
        
        // Check if near a spring
        let nearSpring = false;
        for (let pool = 0; pool < 3; pool++) {
          const poolX = 40 + pool * 60;
          const poolY = 140;
          const dist = Math.sqrt((mossX - poolX) * (mossX - poolX) + (mossY - poolY) * (mossY - poolY));
          if (dist < 35) {
            nearSpring = true;
            break;
          }
        }
        
        if (nearSpring) {
          // Glowing moss
          for (let my = 0; my < 4; my++) {
            for (let mx = 0; mx < 4; mx++) {
              setPixel(ctx, mossX + mx, mossY + my, '#90ee90');
            }
          }
          
          // Moss glow
          if (Math.random() > 0.7) {
            setPixel(ctx, mossX + 2, mossY + 2, '#98fb98');
          }
        }
      }
      
      // Healing crystals near springs
      for (let crystal = 0; crystal < 6; crystal++) {
        const crystalX = 30 + crystal * 30;
        const crystalY = 165 + Math.sin(crystal) * 10;
        
        // Crystal formation
        for (let cy = 0; cy < 8; cy++) {
          for (let cx = 0; cx < 4; cx++) {
            const crystalDist = Math.sqrt((cx - 2) * (cx - 2) + (cy - 4) * (cy - 4));
            if (crystalDist < 4) {
              setPixel(ctx, crystalX + cx, crystalY + cy, '#00ff7f');
            }
          }
        }
        
        // Crystal glow
        setPixel(ctx, crystalX + 2, crystalY + 4, '#00ffff');
      }
      
      // Peaceful flowers
      for (let flower = 0; flower < 12; flower++) {
        const flowerX = 25 + flower * 15;
        const flowerY = 170 + Math.sin(flower * 0.7) * 8;
        
        // Flower petals
        const flowerColor = [RAMPS.pink[4], '#ffffff', '#ffb3e6'][flower % 3];
        
        for (let petal = 0; petal < 5; petal++) {
          const petalAngle = (petal / 5) * Math.PI * 2;
          const petalX = flowerX + Math.cos(petalAngle) * 2;
          const petalY = flowerY + Math.sin(petalAngle) * 2;
          setPixel(ctx, petalX, petalY, flowerColor);
        }
        
        // Flower center
        setPixel(ctx, flowerX, flowerY, RAMPS.gold[5]);
        
        // Stem
        for (let stem = 0; stem < 6; stem++) {
          setPixel(ctx, flowerX, flowerY + 1 + stem, RAMPS.forest[3]);
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
      for (let lantern = 0; lantern < 2; lantern++) {
        const lanternX = 40 + lantern * 120;
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
  },

  'scene-wanderer-camp': {
    name: "Wanderer's Camp",
    generator: (ctx) => {
      fillBackground(ctx, '#050510'); // Night black base
      
      // Starry night sky
      drawSky(ctx, 'sky_night', 12, 120);
      
      // Many stars
      for (let i = 0; i < 60; i++) {
        const starX = Math.random() * 200;
        const starY = Math.random() * 120;
        const brightness = Math.random();
        if (brightness > 0.8) {
          setPixel(ctx, starX, starY, '#ffffff');
        } else if (brightness > 0.5) {
          setPixel(ctx, starX, starY, '#cccccc');
        } else if (brightness > 0.3) {
          setPixel(ctx, starX, starY, '#999999');
        }
      }
      
      // Ground
      drawGround(ctx, 170, 'forest', 'natural');
      
      // Small campfire in center
      const fireX = 100;
      const fireY = 155;
      
      // Fire ring
      for (let angle = 0; angle < 360; angle += 30) {
        const ringX = fireX + Math.cos(angle * Math.PI / 180) * 8;
        const ringY = fireY + Math.sin(angle * Math.PI / 180) * 4;
        setPixel(ctx, ringX, ringY, RAMPS.stone[4]);
      }
      
      // Campfire flames
      for (let flame = 0; flame < 8; flame++) {
        const flameX = fireX + Math.sin(flame * 0.7) * 3;
        const flameY = fireY - 5 - flame * 2;
        const flameColor = RAMPS.lava[5 - flame % 2];
        setPixel(ctx, flameX, flameY, flameColor);
        setPixel(ctx, flameX + 1, flameY, RAMPS.lava[4 - flame % 2]);
      }
      
      // Fire glow
      for (let gy = -10; gy <= 5; gy++) {
        for (let gx = -12; gx <= 12; gx++) {
          const glowDist = Math.sqrt(gx*gx + gy*gy);
          if (glowDist > 6 && glowDist < 15 && Math.random() > 0.8) {
            setPixel(ctx, fireX + gx, fireY + gy, RAMPS.lava[1]);
          }
        }
      }
      
      // Logs for fuel
      for (let log = 0; log < 4; log++) {
        const logAngle = (log / 4) * Math.PI * 2;
        const logX = fireX + Math.cos(logAngle) * 12;
        const logY = fireY + Math.sin(logAngle) * 6;
        
        // Log
        for (let l = 0; l < 8; l++) {
          const logPieceX = logX + Math.cos(logAngle) * l;
          const logPieceY = logY + Math.sin(logAngle) * l;
          setPixel(ctx, logPieceX, logPieceY, RAMPS.wood[2]);
          setPixel(ctx, logPieceX, logPieceY + 1, RAMPS.wood[1]);
        }
      }
      
      // Bedroll
      const bedrollX = 130;
      const bedrollY = 160;
      
      for (let by = 0; by < 12; by++) {
        for (let bx = 0; bx < 20; bx++) {
          if (by < 2 || by > 9) {
            setPixel(ctx, bedrollX + bx, bedrollY + by, '#8b4513');
          } else {
            setPixel(ctx, bedrollX + bx, bedrollY + by, '#654321');
          }
        }
      }
      
      // Pillow
      for (let py = 0; py < 4; py++) {
        for (let px = 0; px < 8; px++) {
          setPixel(ctx, bedrollX + px, bedrollY + py, '#daa520');
        }
      }
      
      // Traveler's pack
      const packX = 60;
      const packY = 160;
      
      for (let py = 0; py < 15; py++) {
        for (let px = 0; px < 10; px++) {
          setPixel(ctx, packX + px, packY + py, RAMPS.wood[2]);
        }
      }
      
      // Pack straps
      for (let strap = 0; strap < 3; strap++) {
        for (let x = 0; x < 10; x++) {
          setPixel(ctx, packX + x, packY + 3 + strap * 4, '#8b4513');
        }
      }
      
      // Walking stick
      for (let stick = 0; stick < 25; stick++) {
        setPixel(ctx, packX - 2, packY - stick, RAMPS.wood[4]);
      }
      
      // Water bottle
      for (let bottle = 0; bottle < 8; bottle++) {
        for (let x = 0; x < 4; x++) {
          setPixel(ctx, packX + 12 + x, packY + 5 + bottle, RAMPS.water[4]);
        }
      }
      
      // Scattered supplies
      for (let supply = 0; supply < 6; supply++) {
        const supplyX = 40 + supply * 25;
        const supplyY = 170 + Math.sin(supply) * 3;
        
        if (supply % 3 === 0) {
          // Food pouch
          for (let fy = 0; fy < 4; fy++) {
            for (let fx = 0; fx < 6; fx++) {
              setPixel(ctx, supplyX + fx, supplyY + fy, '#deb887');
            }
          }
        } else if (supply % 3 === 1) {
          // Rope coil
          for (let ry = 0; ry < 3; ry++) {
            for (let rx = 0; rx < 5; rx++) {
              setPixel(ctx, supplyX + rx, supplyY + ry, '#8b7355');
            }
          }
        } else {
          // Tool
          for (let ty = 0; ty < 6; ty++) {
            setPixel(ctx, supplyX + 2, supplyY + ty, RAMPS.stone[4]);
          }
          for (let tx = 0; tx < 4; tx++) {
            setPixel(ctx, supplyX + tx, supplyY + 6, RAMPS.wood[4]);
          }
        }
      }
      
      // Moon
      drawMoon(ctx, 50, 30, 12);
    }
  }
};

// ============================================================================
// ANIMATED BACKGROUND SCENES 
// ============================================================================

const animatedScenes = {
  'anim-meteor-shower': {
    name: "Meteor Shower",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#050510');
        
        // Night sky with stars
        drawSky(ctx, 'sky_night', 8, 200);
        
        // Background stars
        for (let i = 0; i < 40; i++) {
          const starX = (i * 17) % 200;
          const starY = (i * 23) % 120;
          setPixel(ctx, starX, starY, '#ffffff');
        }
        
        // Meteor streaks
        for (let meteor = 0; meteor < 8; meteor++) {
          const meteorSpeed = 3 + meteor * 0.5;
          const meteorX = (frame * meteorSpeed + meteor * 40) % 250 - 50;
          const meteorY = 20 + meteor * 15 + (frame + meteor * 3) % 30;
          
          if (meteorX > -20 && meteorX < 220 && meteorY > 0 && meteorY < 120) {
            // Meteor head
            setPixel(ctx, meteorX, meteorY, '#ffffff');
            setPixel(ctx, meteorX + 1, meteorY, '#ffff99');
            
            // Meteor trail
            for (let trail = 1; trail < 12; trail++) {
              const trailX = meteorX - trail * 3;
              const trailY = meteorY - trail;
              const trailIntensity = 1 - (trail / 12);
              
              if (trailX > 0 && trailX < 200 && trailY > 0 && trailY < 200) {
                if (trailIntensity > 0.7) {
                  setPixel(ctx, trailX, trailY, '#ffff99');
                } else if (trailIntensity > 0.4) {
                  setPixel(ctx, trailX, trailY, '#ff9900');
                } else if (trailIntensity > 0.2) {
                  setPixel(ctx, trailX, trailY, '#ff6600');
                }
              }
            }
          }
        }
        
        // Ground silhouette
        for (let x = 0; x < 200; x++) {
          const groundHeight = 160 + Math.sin(x * 0.05) * 10;
          for (let y = groundHeight; y < 200; y++) {
            setPixel(ctx, x, y, '#1a1a1a');
          }
        }
      };
    }
  },

  'anim-whirlpool': {
    name: "Whirlpool",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#4a7aae');
        
        // Water background
        drawSky(ctx, 'water', 10, 200);
        
        // Whirlpool center
        const centerX = 100;
        const centerY = 100;
        const maxRadius = 80;
        
        for (let y = 20; y < 180; y++) {
          for (let x = 20; x < 180; x++) {
            const distance = Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY));
            
            if (distance < maxRadius) {
              // Calculate spiral angle
              const angle = Math.atan2(y - centerY, x - centerX) + (frame * 0.1) + (maxRadius - distance) * 0.05;
              const spiralX = centerX + Math.cos(angle) * distance;
              const spiralY = centerY + Math.sin(angle) * distance;
              
              // Water depth based on distance from center
              const depth = 1 - (distance / maxRadius);
              const colorIndex = Math.floor(depth * 4);
              const waterColor = RAMPS.water[Math.min(colorIndex, RAMPS.water.length - 1)];
              
              setPixel(ctx, x, y, waterColor);
            } else {
              // Outer water
              setPixel(ctx, x, y, RAMPS.water[4]);
            }
          }
        }
        
        // Foam and bubbles in the whirlpool
        for (let bubble = 0; bubble < 15; bubble++) {
          const bubbleAngle = (bubble / 15) * Math.PI * 2 + frame * 0.2;
          const bubbleRadius = 20 + bubble * 3;
          const bubbleX = centerX + Math.cos(bubbleAngle) * bubbleRadius;
          const bubbleY = centerY + Math.sin(bubbleAngle) * bubbleRadius;
          
          setPixel(ctx, bubbleX, bubbleY, '#ffffff');
          if (bubble % 2 === 0) {
            setPixel(ctx, bubbleX + 1, bubbleY, '#cccccc');
          }
        }
        
        // Debris caught in whirlpool
        for (let debris = 0; debris < 6; debris++) {
          const debrisAngle = (debris / 6) * Math.PI * 2 + frame * 0.15;
          const debrisRadius = 40 + debris * 8;
          const debrisX = centerX + Math.cos(debrisAngle) * debrisRadius;
          const debrisY = centerY + Math.sin(debrisAngle) * debrisRadius;
          
          // Small piece of wood or flotsam
          for (let dy = 0; dy < 3; dy++) {
            for (let dx = 0; dx < 5; dx++) {
              setPixel(ctx, debrisX + dx, debrisY + dy, RAMPS.wood[2]);
            }
          }
        }
      };
    }
  },

  'anim-flame-tornado': {
    name: "Flame Tornado",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#8b0000');
        
        // Hot volcanic sky
        drawSky(ctx, 'lava', 12, 80);
        drawGround(ctx, 160, 'lava', 'cracked');
        
        // Tornado center
        const centerX = 100;
        const baseY = 160;
        const topY = 40;
        const tornadoHeight = baseY - topY;
        
        for (let y = topY; y < baseY; y++) {
          const heightRatio = (y - topY) / tornadoHeight;
          const radius = 5 + heightRatio * 25; // Wider at bottom
          
          // Spiral flames
          for (let angle = 0; angle < 360; angle += 15) {
            const spiralAngle = angle + (frame * 5) + (heightRatio * 180);
            const flameRadius = radius + Math.sin(spiralAngle * Math.PI / 45) * 3;
            
            const flameX = centerX + Math.cos(spiralAngle * Math.PI / 180) * flameRadius;
            const flameY = y;
            
            if (flameX > 0 && flameX < 200 && flameY > 0 && flameY < 200) {
              // Flame color intensity
              const intensity = Math.random();
              let flameColor;
              if (intensity > 0.8) {
                flameColor = RAMPS.lava[5];
              } else if (intensity > 0.5) {
                flameColor = RAMPS.lava[4];
              } else if (intensity > 0.2) {
                flameColor = RAMPS.lava[3];
              } else {
                flameColor = RAMPS.lava[2];
              }
              
              setPixel(ctx, flameX, flameY, flameColor);
            }
          }
        }
        
        // Fire sparks being thrown out
        for (let spark = 0; spark < 20; spark++) {
          const sparkAngle = (spark / 20) * Math.PI * 2 + frame * 0.3;
          const sparkDist = 40 + (frame + spark * 5) % 60;
          const sparkX = centerX + Math.cos(sparkAngle) * sparkDist;
          const sparkY = 100 + Math.sin(sparkAngle + frame * 0.1) * 20;
          
          if (sparkX > 10 && sparkX < 190 && sparkY > 50 && sparkY < 150) {
            setPixel(ctx, sparkX, sparkY, RAMPS.lava[4 + spark % 2]);
          }
        }
        
        // Ground fire
        for (let x = 50; x < 150; x++) {
          const flameY = 150 + Math.sin(x * 0.2 + frame * 0.5) * 8;
          const flameHeight = 5 + Math.random() * 10;
          
          for (let fy = 0; fy < flameHeight; fy++) {
            setPixel(ctx, x + Math.sin(fy * 0.5 + frame * 0.3) * 2, flameY - fy, RAMPS.lava[3 + fy % 3]);
          }
        }
      };
    }
  },

  'anim-pollen-drift': {
    name: "Pollen Drift",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#7aba7a');
        
        // Bright sunny sky
        drawSky(ctx, 'sky_sunset', 15, 100);
        
        // Meadow ground
        drawGround(ctx, 150, 'forest', 'grass');
        
        // Flowers releasing pollen
        for (let flower = 0; flower < 12; flower++) {
          const flowerX = 20 + flower * 15;
          const flowerY = 140 + Math.sin(flower) * 10;
          
          // Flower stem
          for (let stem = 0; stem < 8; stem++) {
            setPixel(ctx, flowerX, flowerY + stem, RAMPS.forest[3]);
          }
          
          // Flower head
          for (let petal = 0; petal < 6; petal++) {
            const petalAngle = (petal / 6) * Math.PI * 2;
            const petalX = flowerX + Math.cos(petalAngle) * 3;
            const petalY = flowerY + Math.sin(petalAngle) * 2;
            setPixel(ctx, petalX, petalY, RAMPS.gold[4]);
          }
          
          // Flower center
          setPixel(ctx, flowerX, flowerY, RAMPS.gold[5]);
          setPixel(ctx, flowerX + 1, flowerY, RAMPS.gold[4]);
        }
        
        // Sunbeams
        for (let ray = 0; ray < 8; ray++) {
          const rayAngle = (ray / 8) * Math.PI * 2 + frame * 0.01;
          for (let len = 0; len < 100; len++) {
            const rayX = 160 + Math.cos(rayAngle) * len;
            const rayY = 30 + Math.sin(rayAngle) * len * 0.3;
            
            if (rayX > 0 && rayX < 200 && rayY > 0 && rayY < 100 && len % 8 < 4) {
              setPixel(ctx, rayX, rayY, '#ffff99');
            }
          }
        }
        
        // Floating pollen particles
        for (let pollen = 0; pollen < 50; pollen++) {
          const pollenLife = (frame + pollen * 3) % 120;
          const pollenX = 20 + ((pollen * 7 + frame * 0.5) % 160);
          const pollenY = 140 - pollenLife + Math.sin((pollen + frame) * 0.1) * 10;
          
          if (pollenY > 20 && pollenY < 140) {
            // Pollen particle
            setPixel(ctx, pollenX, pollenY, '#ffff00');
            
            // Some pollen clumps
            if (pollen % 5 === 0) {
              setPixel(ctx, pollenX + 1, pollenY, '#ffff99');
              setPixel(ctx, pollenX, pollenY + 1, '#ffff99');
            }
            
            // Pollen trail
            if (pollenLife > 20) {
              for (let trail = 1; trail < 4; trail++) {
                const trailY = pollenY + trail * 3;
                if (trailY < 140 && Math.random() > 0.5) {
                  setPixel(ctx, pollenX, trailY, '#ffffaa');
                }
              }
            }
          }
        }
        
        // Tree releasing pollen
        const treeX = 160;
        const treeY = 120;
        
        drawSprite(ctx, treeX, treeY, tree_oak(), 'forest');
        
        // Pollen clouds from tree
        for (let cloud = 0; cloud < 6; cloud++) {
          const cloudAngle = (cloud / 6) * Math.PI * 2 + frame * 0.02;
          const cloudX = treeX + Math.cos(cloudAngle) * 20;
          const cloudY = treeY + Math.sin(cloudAngle) * 10;
          
          // Pollen cloud
          for (let py = -3; py <= 3; py++) {
            for (let px = -5; px <= 5; px++) {
              const cloudDist = Math.sqrt(px*px + py*py);
              if (cloudDist < 4 && Math.random() > 0.4) {
                setPixel(ctx, cloudX + px, cloudY + py, '#ffff88');
              }
            }
          }
        }
      };
    }
  },

  'anim-ice-storm': {
    name: "Ice Storm",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#c9e5ff');
        
        // Stormy sky
        drawSky(ctx, 'ice', 15, 120);
        
        // Frozen ground
        drawGround(ctx, 160, 'ice', 'frozen');
        
        // Horizontal ice shards
        for (let shard = 0; shard < 30; shard++) {
          const shardSpeed = 4 + shard % 3;
          const shardX = (frame * shardSpeed + shard * 15) % 250 - 50;
          const shardY = 20 + shard * 4;
          const shardSize = 2 + shard % 4;
          
          if (shardX > -20 && shardX < 220 && shardY < 140) {
            // Ice shard
            for (let sy = 0; sy < 2; sy++) {
              for (let sx = 0; sx < shardSize; sx++) {
                setPixel(ctx, shardX + sx, shardY + sy, RAMPS.ice[4]);
              }
            }
            
            // Shard trail
            for (let trail = 1; trail < 6; trail++) {
              const trailX = shardX - trail * 2;
              if (trailX > 0 && Math.random() > 0.6) {
                setPixel(ctx, trailX, shardY, RAMPS.ice[3]);
              }
            }
          }
        }
        
        // Vertical ice spikes
        for (let spike = 0; spike < 15; spike++) {
          const spikeSpeed = 3;
          const spikeX = 20 + spike * 12;
          const spikeY = (frame * spikeSpeed + spike * 20) % 200 - 40;
          const spikeLength = 8 + spike % 6;
          
          if (spikeY > -20 && spikeY < 180) {
            // Ice spike
            for (let len = 0; len < spikeLength; len++) {
              const spikeWidth = Math.max(1, spikeLength - len);
              for (let w = 0; w < spikeWidth; w++) {
                setPixel(ctx, spikeX + w, spikeY + len, RAMPS.ice[4]);
              }
            }
          }
        }
        
        // Snow swirling
        for (let snow = 0; snow < 40; snow++) {
          const snowAngle = (snow / 40) * Math.PI * 2 + frame * 0.1;
          const snowRadius = 30 + Math.sin(frame * 0.05 + snow) * 20;
          const snowX = 100 + Math.cos(snowAngle) * snowRadius;
          const snowY = 80 + Math.sin(snowAngle) * snowRadius * 0.5;
          
          if (snowX > 10 && snowX < 190 && snowY > 10 && snowY < 150) {
            setPixel(ctx, snowX, snowY, '#ffffff');
            if (snow % 3 === 0) {
              setPixel(ctx, snowX + 1, snowY, '#e6e6e6');
            }
          }
        }
        
        // Ice crystals forming on ground
        for (let crystal = 0; crystal < 12; crystal++) {
          const crystalX = 20 + crystal * 15;
          const crystalY = 155;
          const crystalPhase = (frame + crystal * 10) % 60;
          
          if (crystalPhase < 40) {
            const crystalSize = Math.floor(crystalPhase / 10);
            
            // Growing ice crystal
            for (let cy = 0; cy < crystalSize + 1; cy++) {
              for (let cx = 0; cx < crystalSize + 1; cx++) {
                setPixel(ctx, crystalX + cx, crystalY + cy, RAMPS.ice[4]);
              }
            }
            
            // Crystal spikes
            if (crystalSize > 1) {
              for (let spike = 0; spike < 4; spike++) {
                const spikeAngle = (spike / 4) * Math.PI * 2;
                const spikeLen = crystalSize;
                const spikeTipX = crystalX + crystalSize/2 + Math.cos(spikeAngle) * spikeLen;
                const spikeTipY = crystalY + crystalSize/2 + Math.sin(spikeAngle) * spikeLen;
                setPixel(ctx, spikeTipX, spikeTipY, RAMPS.ice[4]);
              }
            }
          }
        }
        
        // Wind effect lines
        for (let wind = 0; wind < 20; wind++) {
          const windY = 40 + wind * 6;
          const windX = (frame * 6 + wind * 8) % 220 - 20;
          
          if (windX > 0 && windX < 190) {
            for (let wx = 0; wx < 15; wx++) {
              if (wx % 3 === 0) {
                setPixel(ctx, windX + wx, windY, RAMPS.ice[2]);
              }
            }
          }
        }
      };
    }
  },

  'anim-heartbeat-tree': {
    name: "Heartbeat Tree",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#aa5a9a');
        
        // Pink magical sky
        drawSky(ctx, 'pink', 12, 100);
        
        // Heart garden ground
        drawGround(ctx, 150, 'pink', 'soft');
        
        // Central heartbeat tree
        const treeX = 100;
        const treeY = 120;
        const heartbeat = Math.sin(frame * 0.8) * 0.5 + 0.5; // Pulsing 0-1
        
        // Tree trunk (pulses slightly)
        const trunkWidth = 12 + heartbeat * 4;
        for (let y = 0; y < 50; y++) {
          for (let x = 0; x < trunkWidth; x++) {
            setPixel(ctx, treeX - trunkWidth/2 + x, treeY + y, RAMPS.wood[2]);
          }
        }
        
        // Tree heart (pulsing core)
        const heartSize = 8 + heartbeat * 6;
        for (let hy = -heartSize/2; hy <= heartSize/2; hy++) {
          for (let hx = -heartSize/2; hx <= heartSize/2; hx++) {
            const heartDist = Math.sqrt(hx*hx + hy*hy);
            if (heartDist < heartSize/2) {
              const heartIntensity = 1 - (heartDist / (heartSize/2));
              const colorIndex = Math.floor(heartIntensity * 4 + heartbeat * 2);
              setPixel(ctx, treeX + hx, treeY + 20 + hy, RAMPS.pink[Math.min(colorIndex, RAMPS.pink.length - 1)]);
            }
          }
        }
        
        // Pulsing branches
        for (let branch = 0; branch < 8; branch++) {
          const branchAngle = (branch / 8) * Math.PI * 2;
          const branchLength = 20 + heartbeat * 10;
          
          for (let len = 0; len < branchLength; len++) {
            const branchX = treeX + Math.cos(branchAngle) * len;
            const branchY = treeY + 15 + Math.sin(branchAngle) * len * 0.3;
            
            if (branchX > 0 && branchX < 200 && branchY > 0 && branchY < 200) {
              setPixel(ctx, branchX, branchY, RAMPS.wood[3]);
            }
          }
          
          // Heart leaves at branch tips
          const leafX = treeX + Math.cos(branchAngle) * branchLength;
          const leafY = treeY + 15 + Math.sin(branchAngle) * branchLength * 0.3;
          
          if (leafX > 0 && leafX < 200 && leafY > 0 && leafY < 200) {
            // Heart-shaped leaf
            setPixel(ctx, leafX, leafY, RAMPS.pink[4]);
            setPixel(ctx, leafX + 1, leafY - 1, RAMPS.pink[4]);
            setPixel(ctx, leafX - 1, leafY - 1, RAMPS.pink[4]);
            setPixel(ctx, leafX, leafY - 2, RAMPS.pink[3]);
          }
        }
        
        // Pulsing energy rings
        for (let ring = 0; ring < 3; ring++) {
          const ringRadius = 30 + ring * 15 + heartbeat * 10;
          const ringIntensity = 1 - (ring * 0.3);
          
          for (let angle = 0; angle < 360; angle += 20) {
            const ringX = treeX + Math.cos(angle * Math.PI / 180) * ringRadius;
            const ringY = treeY + 20 + Math.sin(angle * Math.PI / 180) * ringRadius * 0.5;
            
            if (ringX > 10 && ringX < 190 && ringY > 50 && ringY < 160 && Math.random() < ringIntensity) {
              setPixel(ctx, ringX, ringY, RAMPS.pink[3 + Math.floor(heartbeat * 2)]);
            }
          }
        }
        
        // Heart particles floating up
        for (let particle = 0; particle < 12; particle++) {
          const particleLife = (frame + particle * 8) % 80;
          const particleAngle = (particle / 12) * Math.PI * 2 + frame * 0.02;
          const particleX = treeX + Math.cos(particleAngle) * 15;
          const particleY = treeY - particleLife + Math.sin(particleAngle + frame * 0.05) * 8;
          
          if (particleY > 30 && particleY < treeY + 20) {
            // Heart particle
            setPixel(ctx, particleX, particleY, RAMPS.pink[4]);
            setPixel(ctx, particleX + 1, particleY - 1, RAMPS.pink[4]);
            setPixel(ctx, particleX - 1, particleY - 1, RAMPS.pink[4]);
            setPixel(ctx, particleX, particleY - 2, RAMPS.pink[3]);
            
            // Particle glow
            if (particleLife % 20 < 10) {
              setPixel(ctx, particleX, particleY + 1, RAMPS.pink[2]);
            }
          }
        }
        
        // Ground heart flowers pulsing in sync
        for (let flower = 0; flower < 8; flower++) {
          const flowerAngle = (flower / 8) * Math.PI * 2;
          const flowerDist = 60 + flower * 5;
          const flowerX = treeX + Math.cos(flowerAngle) * flowerDist;
          const flowerY = 140 + Math.sin(flowerAngle) * 10;
          
          if (flowerX > 20 && flowerX < 180) {
            // Flower pulses with tree
            const flowerSize = 2 + heartbeat * 2;
            
            for (let fy = 0; fy < flowerSize; fy++) {
              for (let fx = 0; fx < flowerSize; fx++) {
                setPixel(ctx, flowerX + fx, flowerY + fy, RAMPS.pink[3 + Math.floor(heartbeat * 2)]);
              }
            }
            
            // Flower stem
            for (let stem = 0; stem < 6; stem++) {
              setPixel(ctx, flowerX + 1, flowerY + flowerSize + stem, RAMPS.forest[3]);
            }
          }
        }
      };
    }
  },

  'anim-dripping-cave': {
    name: "Dripping Cave",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#1a0f08');
        
        // Dark cave ceiling
        drawSky(ctx, 'stone', 6, 80);
        
        // Cave walls
        drawWalls(ctx, 'stone', 40, 180);
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
        drawWalls(ctx, 'purple', 40, 180);
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

  'anim-magma-bubbles': {
    name: "Magma Bubbles",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#ff4500');
        
        // Hot volcanic sky
        drawSky(ctx, 'lava', 12, 80);
        drawGround(ctx, 120, 'lava', 'molten');
        
        // Magma surface
        for (let y = 120; y < 200; y++) {
          for (let x = 0; x < 200; x++) {
            const depth = (y - 120) / 80;
            const colorIndex = Math.floor(depth * 3) + Math.floor(Math.random() * 2);
            setPixel(ctx, x, y, RAMPS.lava[Math.min(colorIndex, RAMPS.lava.length - 1)]);
          }
        }
        
        // Bubbling magma bubbles
        for (let bubble = 0; bubble < 12; bubble++) {
          const bubbleLife = (frame + bubble * 8) % 80;
          const bubbleX = 30 + bubble * 15;
          const bubbleStartY = 140 + bubble % 20;
          const bubbleY = bubbleStartY - bubbleLife * 0.8;
          const bubbleSize = 3 + Math.sin(bubbleLife * 0.2) * 2;
          
          if (bubbleY > 120 && bubbleY < 180) {
            // Magma bubble
            for (let by = -bubbleSize/2; by <= bubbleSize/2; by++) {
              for (let bx = -bubbleSize/2; bx <= bubbleSize/2; bx++) {
                const bubbleDist = Math.sqrt(bx*bx + by*by);
                if (bubbleDist < bubbleSize/2) {
                  setPixel(ctx, bubbleX + bx, bubbleY + by, RAMPS.lava[5]);
                }
              }
            }
            
            // Bubble rim
            for (let angle = 0; angle < 360; angle += 30) {
              const rimX = bubbleX + Math.cos(angle * Math.PI / 180) * bubbleSize/2;
              const rimY = bubbleY + Math.sin(angle * Math.PI / 180) * bubbleSize/2;
              setPixel(ctx, rimX, rimY, RAMPS.lava[3]);
            }
          } else if (bubbleY <= 120) {
            // Bubble pops at surface
            const popSize = Math.min(8, bubbleLife - 60);
            if (popSize > 0) {
              for (let pop = 0; pop < popSize; pop++) {
                const popAngle = (pop / popSize) * Math.PI * 2;
                const popX = bubbleX + Math.cos(popAngle) * popSize;
                const popY = 120 + Math.sin(popAngle) * popSize * 0.3;
                setPixel(ctx, popX, popY, RAMPS.lava[4]);
              }
            }
          }
        }
        
        // Heat distortion effect
        for (let distort = 0; distort < 30; distort++) {
          const distortX = Math.random() * 200;
          const distortY = 100 + Math.random() * 40;
          const distortPhase = frame * 0.3 + distort;
          
          if (Math.sin(distortPhase) > 0.5) {
            setPixel(ctx, distortX, distortY, RAMPS.lava[2]);
          }
        }
        
        // Lava splashes
        for (let splash = 0; splash < 8; splash++) {
          const splashPhase = (frame + splash * 15) % 60;
          const splashX = 40 + splash * 20;
          
          if (splashPhase < 30) {
            const splashHeight = splashPhase;
            const splashY = 120 - splashHeight;
            
            // Splash droplet
            setPixel(ctx, splashX, splashY, RAMPS.lava[5]);
            setPixel(ctx, splashX + 1, splashY, RAMPS.lava[4]);
            
            // Splash trail
            for (let trail = 1; trail < 6; trail++) {
              const trailY = splashY + trail * 2;
              if (trailY < 120) {
                setPixel(ctx, splashX, trailY, RAMPS.lava[3]);
              }
            }
          }
        }
      };
    }
  },

  'anim-swaying-lanterns': {
    name: "Swaying Lanterns",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#2a1a00');
        
        // Evening sky
        drawSky(ctx, 'sky_sunset', 10, 100);
        
        // Street or courtyard
        drawGround(ctx, 160, 'stone', 'smooth');
        
        // Hanging lanterns swaying in wind
        for (let lantern = 0; lantern < 6; lantern++) {
          const lanternX = 30 + lantern * 30;
          const baseY = 60;
          const swayAmount = Math.sin(frame * 0.1 + lantern * 0.8) * 8;
          const lanternY = baseY + swayAmount;
          
          // Chain/rope
          for (let chain = 0; chain < 15; chain++) {
            const chainX = lanternX + Math.sin((chain + frame) * 0.2 + lantern) * 2;
            const chainY = 40 + chain * 2;
            setPixel(ctx, chainX, chainY, RAMPS.wood[1]);
          }
          
          // Lantern body
          for (let ly = 0; ly < 12; ly++) {
            for (let lx = 0; lx < 8; lx++) {
              setPixel(ctx, lanternX + lx + swayAmount * 0.5, lanternY + ly, RAMPS.gold[2]);
            }
          }
          
          // Lantern light
          for (let ly = 2; ly < 10; ly++) {
            for (let lx = 1; lx < 7; lx++) {
              setPixel(ctx, lanternX + lx + swayAmount * 0.5, lanternY + ly, RAMPS.lava[4]);
            }
          }
          
          // Lantern glow
          const glowRadius = 15 + Math.sin(frame * 0.2 + lantern) * 3;
          for (let gy = -glowRadius; gy <= glowRadius; gy++) {
            for (let gx = -glowRadius; gx <= glowRadius; gx++) {
              const glowDist = Math.sqrt(gx*gx + gy*gy);
              if (glowDist < glowRadius && glowDist > 10 && Math.random() > 0.7) {
                const glowX = lanternX + 4 + gx + swayAmount * 0.5;
                const glowY = lanternY + 6 + gy;
                if (glowX > 10 && glowX < 190 && glowY > 80 && glowY < 150) {
                  setPixel(ctx, glowX, glowY, RAMPS.lava[2]);
                }
              }
            }
          }
          
          // Wind effect particles
          if (Math.abs(swayAmount) > 4) {
            for (let wind = 0; wind < 3; wind++) {
              const windX = lanternX + 10 + wind * 5;
              const windY = lanternY + 6;
              setPixel(ctx, windX, windY, '#cccccc');
            }
          }
        }
        
        // Support posts
        for (let post = 0; post < 3; post++) {
          const postX = 50 + post * 80;
          
          for (let py = 40; py < 160; py++) {
            for (let px = 0; px < 4; px++) {
              setPixel(ctx, postX + px, py, RAMPS.wood[3]);
            }
          }
          
          // Cross beam
          for (let beam = 0; beam < 60; beam++) {
            setPixel(ctx, postX - 30 + beam, 50, RAMPS.wood[3]);
            setPixel(ctx, postX - 30 + beam, 51, RAMPS.wood[2]);
          }
        }
        
        // Shadows moving with lanterns
        for (let shadow = 0; shadow < 6; shadow++) {
          const shadowLantern = 30 + shadow * 30;
          const swayAmount = Math.sin(frame * 0.1 + shadow * 0.8) * 8;
          
          // Object shadows
          for (let sx = 0; sx < 15; sx++) {
            for (let sy = 0; sy < 8; sy++) {
              const shadowX = shadowLantern + 10 + sx - swayAmount;
              const shadowY = 155 + sy;
              if (shadowX > 20 && shadowX < 180) {
                setPixel(ctx, shadowX, shadowY, RAMPS.stone[1]);
              }
            }
          }
        }
      };
    }
  },

  'anim-rising-tide': {
    name: "Rising Tide",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#4a7aae');
        
        // Ocean sky
        drawSky(ctx, 'water', 12, 100);
        
        // Beach/shore
        drawGround(ctx, 160, 'sand', 'beach');
        
        // Tide level (rises and falls)
        const tideLevel = 140 + Math.sin(frame * 0.05) * 20;
        
        // Water surface
        for (let y = tideLevel; y < 200; y++) {
          for (let x = 0; x < 200; x++) {
            const depth = (y - tideLevel) / (200 - tideLevel);
            const colorIndex = Math.floor(depth * 4);
            setPixel(ctx, x, y, RAMPS.water[Math.min(colorIndex + 1, RAMPS.water.length - 1)]);
          }
        }
        
        // Wave crests
        for (let wave = 0; wave < 5; wave++) {
          const waveX = wave * 40;
          const wavePhase = frame * 0.2 + wave;
          const waveHeight = Math.sin(wavePhase) * 8;
          const waveY = tideLevel + waveHeight;
          
          // Wave peak
          for (let wx = 0; wx < 30; wx++) {
            const localHeight = Math.sin(wx * 0.3) * 4;
            setPixel(ctx, waveX + wx, waveY + localHeight, RAMPS.water[5]);
            setPixel(ctx, waveX + wx, waveY + localHeight + 1, RAMPS.water[4]);
          }
          
          // Foam
          if (waveHeight > 4) {
            for (let foam = 0; foam < 20; foam++) {
              const foamX = waveX + Math.random() * 30;
              const foamY = waveY + Math.random() * 4;
              setPixel(ctx, foamX, foamY, '#ffffff');
            }
          }
        }
        
        // Beach items revealed/hidden by tide
        for (let item = 0; item < 8; item++) {
          const itemX = 30 + item * 20;
          const itemY = 150 + item % 3 * 10;
          
          if (itemY > tideLevel + 5) {
            // Item visible - seashell, driftwood, etc.
            if (item % 3 === 0) {
              // Seashell
              for (let sy = 0; sy < 4; sy++) {
                for (let sx = 0; sx < 4; sx++) {
                  setPixel(ctx, itemX + sx, itemY + sy, RAMPS.sand[4]);
                }
              }
            } else if (item % 3 === 1) {
              // Driftwood
              for (let dy = 0; dy < 3; dy++) {
                for (let dx = 0; dx < 8; dx++) {
                  setPixel(ctx, itemX + dx, itemY + dy, RAMPS.wood[2]);
                }
              }
            } else {
              // Rock
              for (let ry = 0; ry < 5; ry++) {
                for (let rx = 0; rx < 6; rx++) {
                  setPixel(ctx, itemX + rx, itemY + ry, RAMPS.stone[3]);
                }
              }
            }
          } else if (itemY > tideLevel - 5) {
            // Item partially submerged
            const submergeAmount = tideLevel - itemY + 5;
            for (let sy = submergeAmount; sy < 4; sy++) {
              for (let sx = 0; sx < 4; sx++) {
                setPixel(ctx, itemX + sx, itemY + sy, RAMPS.water[3]);
              }
            }
          }
        }
        
        // Seabirds following the tide
        for (let bird = 0; bird < 4; bird++) {
          const birdX = 40 + bird * 40;
          const birdY = tideLevel - 10 + Math.sin(frame * 0.3 + bird) * 5;
          
          // Bird body
          for (let by = 0; by < 3; by++) {
            for (let bx = 0; bx < 5; bx++) {
              setPixel(ctx, birdX + bx, birdY + by, '#ffffff');
            }
          }
          
          // Wings
          const wingFlap = Math.sin(frame * 0.5 + bird) > 0;
          if (wingFlap) {
            for (let wing = 0; wing < 2; wing++) {
              const wingDir = wing === 0 ? -1 : 1;
              for (let w = 0; w < 6; w++) {
                setPixel(ctx, birdX + 2 + wingDir * (2 + w), birdY + 1, '#e6e6e6');
              }
            }
          }
          
          // Beak
          setPixel(ctx, birdX - 1, birdY + 1, '#ffa500');
        }
        
        // Wet sand reflections
        if (tideLevel > 155) {
          for (let ref = 0; ref < 20; ref++) {
            const refX = Math.random() * 200;
            const refY = 165 + Math.random() * 5;
            if (refY < tideLevel) {
              setPixel(ctx, refX, refY, RAMPS.water[4]);
            }
          }
        }
        
        // Tide pools left behind
        if (tideLevel < 130) {
          for (let pool = 0; pool < 3; pool++) {
            const poolX = 50 + pool * 50;
            const poolY = 155 + pool * 5;
            
            // Small tide pool
            for (let py = 0; py < 8; py++) {
              for (let px = 0; px < 12; px++) {
                const poolDist = Math.sqrt((px - 6) * (px - 6) + (py - 4) * (py - 4));
                if (poolDist < 4) {
                  setPixel(ctx, poolX + px, poolY + py, RAMPS.water[3]);
                }
              }
            }
            
            // Small creatures in pools
            setPixel(ctx, poolX + 6, poolY + 4, RAMPS.pink[4]);
            setPixel(ctx, poolX + 8, poolY + 3, RAMPS.purple[4]);
          }
        }
      };
    }
  },

  'anim-smoke-signals': {
    name: "Smoke Signals",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#7aba7a');
        
        // Clear sky
        drawSky(ctx, 'forest', 12, 120);
        
        // Hilltop ground
        drawGround(ctx, 160, 'forest', 'natural');
        
        // Signal fires
        for (let fire = 0; fire < 3; fire++) {
          const fireX = 50 + fire * 60;
          const fireY = 155;
          
          // Fire base
          for (let fy = 0; fy < 8; fy++) {
            const flameWidth = 8 - fy;
            for (let fx = 0; fx < flameWidth; fx++) {
              setPixel(ctx, fireX + fx + fy/2, fireY + fy, RAMPS.lava[3 + fy % 3]);
            }
          }
          
          // Smoke puffs rising in patterns
          const signalPattern = [1, 0, 1, 1, 0, 1, 0, 0]; // Encoded message
          const puffCycle = Math.floor((frame + fire * 20) / 15) % signalPattern.length;
          
          if (signalPattern[puffCycle] === 1) {
            // Large puff
            const puffPhase = ((frame + fire * 20) % 15);
            const puffY = fireY - 20 - puffPhase * 3;
            const puffSize = 8 + puffPhase;
            
            if (puffY > 40) {
              for (let py = -puffSize/2; py <= puffSize/2; py++) {
                for (let px = -puffSize/2; px <= puffSize/2; px++) {
                  const puffDist = Math.sqrt(px*px + py*py);
                  if (puffDist < puffSize/2) {
                    const smokeIntensity = 1 - (puffDist / (puffSize/2));
                    const smokeColor = smokeIntensity > 0.7 ? '#cccccc' : '#999999';
                    setPixel(ctx, fireX + 4 + px, puffY + py, smokeColor);
                  }
                }
              }
            }
          } else {
            // Small continuous smoke
            for (let smoke = 0; smoke < 12; smoke++) {
              const smokeX = fireX + 4 + Math.sin(frame * 0.1 + smoke + fire) * 2;
              const smokeY = fireY - 10 - smoke * 4;
              
              if (smokeY > 40) {
                setPixel(ctx, smokeX, smokeY, '#aaaaaa');
                setPixel(ctx, smokeX + 1, smokeY, '#999999');
              }
            }
          }
        }
        
        // Watch towers/platforms
        for (let tower = 0; tower < 3; tower++) {
          const towerX = 50 + tower * 60;
          const towerY = 140;
          
          // Platform
          for (let px = 0; px < 16; px++) {
            for (let py = 0; py < 4; py++) {
              setPixel(ctx, towerX + px - 8, towerY + py, RAMPS.wood[3]);
            }
          }
          
          // Support posts
          for (let post = 0; post < 4; post++) {
            const postX = towerX - 6 + post * 4;
            for (let py = 0; py < 20; py++) {
              setPixel(ctx, postX, towerY + 4 + py, RAMPS.wood[2]);
            }
          }
          
          // Signal operator
          if (tower === 1) {
            // Person tending fire
            for (let py = 0; py < 8; py++) {
              for (let px = 0; px < 4; px++) {
                setPixel(ctx, towerX + px - 2, towerY - 8 + py, RAMPS.flesh[3]);
              }
            }
            
            // Staff/poker
            for (let staff = 0; staff < 6; staff++) {
              setPixel(ctx, towerX + 3, towerY - 4 + staff, RAMPS.wood[4]);
            }
          }
        }
        
        // Distant observers
        for (let observer = 0; observer < 2; observer++) {
          const obsX = 20 + observer * 160;
          const obsY = 150;
          
          // Small figure watching signals
          for (let oy = 0; oy < 6; oy++) {
            for (let ox = 0; ox < 3; ox++) {
              setPixel(ctx, obsX + ox, obsY + oy, RAMPS.flesh[2]);
            }
          }
          
          // Telescope/spyglass
          for (let scope = 0; scope < 4; scope++) {
            setPixel(ctx, obsX + 4 + scope, obsY + 2, RAMPS.gold[4]);
          }
        }
        
        // Wind effect on smoke
        const windStrength = Math.sin(frame * 0.05) * 3;
        for (let wisp = 0; wisp < 20; wisp++) {
          const wispX = 60 + wisp * 8 + windStrength;
          const wispY = 60 + Math.sin(wisp * 0.5 + frame * 0.1) * 30;
          
          if (wispX > 10 && wispX < 190 && wispY > 40 && wispY < 120) {
            setPixel(ctx, wispX, wispY, '#dddddd');
          }
        }
        
        // Birds disturbed by smoke
        for (let bird = 0; bird < 6; bird++) {
          const birdLife = (frame + bird * 10) % 100;
          const birdX = 40 + birdLife + bird * 5;
          const birdY = 80 + Math.sin(birdLife * 0.1 + bird) * 15;
          
          if (birdX < 200) {
            // Flying bird
            setPixel(ctx, birdX, birdY, '#333333');
            setPixel(ctx, birdX + 1, birdY, '#333333');
            
            // Wing flap
            if (birdLife % 10 < 5) {
              setPixel(ctx, birdX - 1, birdY - 1, '#333333');
              setPixel(ctx, birdX + 2, birdY - 1, '#333333');
            }
          }
        }
      };
    }
  },

  'anim-dancing-flames': {
    name: "Dancing Flames",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#2a1a00');
        
        // Dark evening sky
        drawSky(ctx, 'lava', 8, 100);
        
        // Hearth or campfire area
        drawGround(ctx, 160, 'stone', 'hearth');
        
        // Central campfire
        const fireX = 100;
        const fireY = 150;
        
        // Fire base logs
        for (let log = 0; log < 4; log++) {
          const logAngle = (log / 4) * Math.PI * 2;
          for (let len = 0; len < 15; len++) {
            const logPieceX = fireX + Math.cos(logAngle) * (8 + len);
            const logPieceY = fireY + Math.sin(logAngle) * (4 + len * 0.3);
            setPixel(ctx, logPieceX, logPieceY, RAMPS.wood[2]);
            setPixel(ctx, logPieceX, logPieceY + 1, RAMPS.wood[1]);
          }
        }
        
        // Dancing flames
        for (let flame = 0; flame < 12; flame++) {
          const flameAngle = (flame / 12) * Math.PI * 2;
          const flameRadius = 8 + Math.sin(frame * 0.3 + flame) * 4;
          const flameHeight = 20 + Math.sin(frame * 0.2 + flame * 1.5) * 8;
          
          const baseX = fireX + Math.cos(flameAngle) * flameRadius;
          const baseY = fireY;
          
          // Flame tongue
          for (let h = 0; h < flameHeight; h++) {
            const flameWidth = Math.max(1, (flameHeight - h) / 3);
            const wavyOffset = Math.sin(h * 0.2 + frame * 0.4 + flame) * 2;
            
            for (let w = 0; w < flameWidth; w++) {
              const flameX = baseX + w - flameWidth/2 + wavyOffset;
              const flameY = baseY - h;
              
              // Flame color by height
              let flameColor;
              const heightRatio = h / flameHeight;
              if (heightRatio < 0.3) {
                flameColor = RAMPS.lava[5];
              } else if (heightRatio < 0.6) {
                flameColor = RAMPS.lava[4];
              } else if (heightRatio < 0.8) {
                flameColor = RAMPS.lava[3];
              } else {
                flameColor = RAMPS.lava[2];
              }
              
              setPixel(ctx, flameX, flameY, flameColor);
            }
          }
        }
        
        // Fire sparks floating up
        for (let spark = 0; spark < 20; spark++) {
          const sparkLife = (frame + spark * 5) % 80;
          const sparkAngle = (spark / 20) * Math.PI * 2;
          const sparkX = fireX + Math.cos(sparkAngle + frame * 0.02) * (10 + sparkLife * 0.5);
          const sparkY = fireY - 10 - sparkLife;
          
          if (sparkY > 60) {
            // Spark intensity
            const sparkIntensity = 1 - (sparkLife / 80);
            if (sparkIntensity > 0.3) {
              let sparkColor;
              if (sparkIntensity > 0.8) {
                sparkColor = '#ffffff';
              } else if (sparkIntensity > 0.6) {
                sparkColor = RAMPS.lava[5];
              } else {
                sparkColor = RAMPS.lava[4];
              }
              
              setPixel(ctx, sparkX, sparkY, sparkColor);
              
              // Spark trail
              if (sparkLife > 20) {
                setPixel(ctx, sparkX, sparkY + 1, RAMPS.lava[3]);
              }
            }
          }
        }
        
        // Fire glow on surrounding objects
        const glowRadius = 40 + Math.sin(frame * 0.15) * 8;
        
        // Surrounding stones
        for (let stone = 0; stone < 8; stone++) {
          const stoneAngle = (stone / 8) * Math.PI * 2;
          const stoneX = fireX + Math.cos(stoneAngle) * 25;
          const stoneY = fireY + Math.sin(stoneAngle) * 12;
          
          // Stone
          for (let sy = 0; sy < 6; sy++) {
            for (let sx = 0; sx < 8; sx++) {
              setPixel(ctx, stoneX + sx, stoneY + sy, RAMPS.stone[3]);
            }
          }
          
          // Glow on stone
          const distToFire = Math.sqrt((stoneX - fireX) * (stoneX - fireX) + (stoneY - fireY) * (stoneY - fireY));
          if (distToFire < glowRadius) {
            const glowIntensity = 1 - (distToFire / glowRadius);
            if (glowIntensity > 0.5) {
              for (let gx = 0; gx < 4; gx++) {
                setPixel(ctx, stoneX + gx, stoneY, RAMPS.lava[2]);
              }
            }
          }
        }
        
        // Heat shimmer effect
        for (let shimmer = 0; shimmer < 15; shimmer++) {
          const shimmerX = fireX + Math.sin(frame * 0.2 + shimmer) * 20;
          const shimmerY = fireY - 30 + shimmer * 3;
          
          if (shimmerY > 80 && shimmerX > 60 && shimmerX < 140) {
            if (Math.sin(frame * 0.3 + shimmer * 2) > 0.3) {
              setPixel(ctx, shimmerX, shimmerY, RAMPS.lava[1]);
            }
          }
        }
        
        // People around fire
        for (let person = 0; person < 3; person++) {
          const personAngle = (person / 3) * Math.PI * 2 + Math.PI/6;
          const personDist = 50;
          const personX = fireX + Math.cos(personAngle) * personDist;
          const personY = fireY - 5;
          
          if (personX > 20 && personX < 180) {
            // Person silhouette
            for (let py = 0; py < 15; py++) {
              for (let px = 0; px < 6; px++) {
                setPixel(ctx, personX + px, personY + py, '#1a1a1a');
              }
            }
            
            // Fire glow on person
            for (let glow = 0; glow < 3; glow++) {
              setPixel(ctx, personX + glow, personY + 5, RAMPS.lava[2]);
            }
          }
        }
        
        // Embers on ground
        for (let ember = 0; ember < 12; ember++) {
          const emberAngle = (ember / 12) * Math.PI * 2 + frame * 0.01;
          const emberDist = 15 + ember * 2;
          const emberX = fireX + Math.cos(emberAngle) * emberDist;
          const emberY = fireY + 5 + Math.sin(emberAngle) * 3;
          
          const emberPhase = (frame + ember * 8) % 60;
          if (emberPhase < 30) {
            const emberIntensity = 1 - (emberPhase / 30);
            let emberColor;
            if (emberIntensity > 0.7) {
              emberColor = RAMPS.lava[4];
            } else if (emberIntensity > 0.4) {
              emberColor = RAMPS.lava[3];
            } else {
              emberColor = RAMPS.lava[2];
            }
            
            setPixel(ctx, emberX, emberY, emberColor);
          }
        }
      };
    }
  },

  'anim-snowdrift': {
    name: "Snowdrift",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#c9e5ff');
        
        // Snowy sky
        drawSky(ctx, 'ice', 12, 100);
        
        // Snow-covered ground
        drawGround(ctx, 150, 'ice', 'snow');
        
        // Ledges and surfaces where snow accumulates
        for (let ledge = 0; ledge < 6; ledge++) {
          const ledgeX = 30 + ledge * 30;
          const ledgeY = 120 + ledge % 3 * 15;
          const ledgeWidth = 20;
          
          // Ledge
          for (let lx = 0; lx < ledgeWidth; lx++) {
            for (let ly = 0; ly < 4; ly++) {
              setPixel(ctx, ledgeX + lx, ledgeY + ly, RAMPS.stone[3]);
            }
          }
          
          // Snow accumulation on ledge (growing over time)
          const snowPhase = (frame + ledge * 20) % 200;
          const snowDepth = Math.min(8, snowPhase / 10);
          
          for (let sx = 0; sx < ledgeWidth; sx++) {
            const localDepth = snowDepth + Math.sin(sx * 0.3) * 2;
            for (let sy = 0; sy < localDepth; sy++) {
              setPixel(ctx, ledgeX + sx, ledgeY - sy, '#ffffff');
            }
          }
          
          // Snow blowing off ledge
          if (snowDepth > 4) {
            const blowAmount = (snowPhase % 40) / 10;
            
            for (let blow = 0; blow < blowAmount * 5; blow++) {
              const blowX = ledgeX + ledgeWidth + blow * 3;
              const blowY = ledgeY - blow + Math.sin(blow * 0.5 + frame * 0.1) * 2;
              
              if (blowX < 200 && blowY > 100) {
                setPixel(ctx, blowX, blowY, '#ffffff');
              }
            }
          }
          
          // Reset cycle - snow slides off
          if (snowPhase > 160) {
            const slideAmount = snowPhase - 160;
            
            // Sliding snow
            for (let slide = 0; slide < slideAmount; slide++) {
              const slideX = ledgeX + slide;
              const slideY = ledgeY + 5 + slide * 0.3;
              
              if (slideX < ledgeX + ledgeWidth + 20 && slideY < 180) {
                setPixel(ctx, slideX, slideY, '#e6e6e6');
                setPixel(ctx, slideX, slideY + 1, '#cccccc');
              }
            }
          }
        }
        
        // Falling snow
        for (let snow = 0; snow < 50; snow++) {
          const snowLife = (frame + snow * 3) % 120;
          const snowX = (snow * 7) % 200;
          const snowY = snowLife + Math.sin(snowLife * 0.1 + snow) * 5;
          
          if (snowY < 180) {
            setPixel(ctx, snowX, snowY, '#ffffff');
            
            // Some larger flakes
            if (snow % 5 === 0) {
              setPixel(ctx, snowX + 1, snowY, '#f5f5f5');
              setPixel(ctx, snowX, snowY + 1, '#f5f5f5');
            }
          }
        }
        
        // Wind gusts affecting snow
        const windStrength = Math.sin(frame * 0.03) * 10;
        
        for (let gust = 0; gust < 30; gust++) {
          const gustX = (frame * 2 + gust * 8) % 220 - 20;
          const gustY = 50 + gust % 3 * 20;
          
          if (gustX > 0 && gustX < 200) {
            // Wind-blown snow
            for (let particle = 0; particle < 5; particle++) {
              const particleX = gustX + particle * 4 + windStrength;
              const particleY = gustY + Math.sin(particle + frame * 0.2) * 3;
              
              if (particleX > 10 && particleX < 190) {
                setPixel(ctx, particleX, particleY, '#f0f0f0');
              }
            }
          }
        }
        
        // Snow-covered trees swaying
        for (let tree = 0; tree < 4; tree++) {
          const treeX = 40 + tree * 40;
          const treeY = 140;
          const treeSway = Math.sin(frame * 0.1 + tree) * 3;
          
          // Tree trunk
          for (let trunk = 0; trunk < 20; trunk++) {
            setPixel(ctx, treeX + treeSway * 0.3, treeY + trunk, RAMPS.wood[2]);
            setPixel(ctx, treeX + 1 + treeSway * 0.3, treeY + trunk, RAMPS.wood[1]);
          }
          
          // Snow-laden branches
          for (let branch = 0; branch < 6; branch++) {
            const branchY = treeY + 5 + branch * 3;
            const branchLength = 8 - branch;
            
            // Branch
            for (let bx = 0; bx < branchLength; bx++) {
              setPixel(ctx, treeX - branchLength/2 + bx + treeSway, branchY, RAMPS.wood[3]);
            }
            
            // Snow on branch
            for (let sx = 0; sx < branchLength; sx++) {
              setPixel(ctx, treeX - branchLength/2 + sx + treeSway, branchY - 1, '#ffffff');
            }
            
            // Snow occasionally falls from branches
            if (Math.abs(treeSway) > 2 && Math.random() > 0.8) {
              const fallX = treeX + treeSway + (Math.random() - 0.5) * 10;
              const fallY = branchY + 5 + Math.random() * 10;
              setPixel(ctx, fallX, fallY, '#ffffff');
            }
          }
        }
        
        // Footprints in snow (being covered)
        for (let track = 0; track < 8; track++) {
          const trackX = 20 + track * 20;
          const trackY = 165 + Math.sin(track * 0.5) * 5;
          const trackAge = (frame + track * 15) % 100;
          
          if (trackAge < 60) {
            const trackDepth = 1 - (trackAge / 60);
            
            // Footprint shape
            for (let fy = 0; fy < 4; fy++) {
              for (let fx = 0; fx < 3; fx++) {
                const trackColor = trackDepth > 0.5 ? RAMPS.ice[2] : RAMPS.ice[3];
                setPixel(ctx, trackX + fx, trackY + fy, trackColor);
              }
            }
          }
        }
      };
    }
  },

  'anim-lightning-storm': {
    name: "Lightning Storm",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#1a1a2e');
        
        // Storm clouds
        drawSky(ctx, 'sky_night', 15, 140);
        
        // Rain
        for (let rain = 0; rain < 80; rain++) {
          const rainX = (rain * 11 + frame * 3) % 200;
          const rainY = (rain * 7 + frame * 4) % 200;
          setPixel(ctx, rainX, rainY, RAMPS.water[4]);
        }
        
        // Lightning strikes
        const lightningFrame = frame % 40;
        
        if (lightningFrame < 3) {
          // Main lightning bolt
          const boltX = 80 + Math.random() * 40;
          
          for (let y = 20; y < 120; y += 2) {
            const zigzag = Math.sin(y * 0.3) * (3 + Math.random() * 3);
            const boltPosX = boltX + zigzag;
            
            setPixel(ctx, boltPosX, y, '#ffffff');
            setPixel(ctx, boltPosX + 1, y, '#ccccff');
            
            // Branch lightning
            if (Math.random() > 0.8) {
              const branchDir = Math.random() > 0.5 ? 1 : -1;
              for (let branch = 1; branch < 8; branch++) {
                const branchX = boltPosX + branchDir * branch;
                const branchY = y + branch;
                if (branchY < 120) {
                  setPixel(ctx, branchX, branchY, '#aaaaff');
                }
              }
            }
          }
          
          // Lightning illumination
          for (let illum = 0; illum < 200; illum++) {
            for (let y = 0; y < 140; y++) {
              if (Math.random() > 0.95) {
                setPixel(ctx, illum, y, '#4444aa');
              }
            }
          }
        }
        
        // Thunder clouds
        for (let cloud = 0; cloud < 40; cloud++) {
          const cloudX = cloud * 5;
          const cloudY = 30 + Math.sin(cloud * 0.2 + frame * 0.05) * 10;
          
          for (let cy = 0; cy < 6; cy++) {
            for (let cx = 0; cx < 8; cx++) {
              setPixel(ctx, cloudX + cx, cloudY + cy, RAMPS.sky_night[2]);
            }
          }
        }
        
        // Ground
        drawGround(ctx, 160, 'stone', 'wet');
        
        // Puddles reflecting lightning
        for (let puddle = 0; puddle < 8; puddle++) {
          const puddleX = 20 + puddle * 20;
          const puddleY = 170;
          
          for (let py = 0; py < 4; py++) {
            for (let px = 0; px < 12; px++) {
              setPixel(ctx, puddleX + px, puddleY + py, RAMPS.water[2]);
            }
          }
          
          // Lightning reflection
          if (lightningFrame < 3) {
            for (let ref = 0; ref < 3; ref++) {
              setPixel(ctx, puddleX + 6, puddleY + ref, '#ffffff');
            }
          }
        }
        
        // Wind-blown objects
        const windForce = Math.sin(frame * 0.1) * 5;
        
        for (let debris = 0; debris < 6; debris++) {
          const debrisX = 30 + debris * 30 + windForce;
          const debrisY = 150 + Math.sin(debris + frame * 0.2) * 8;
          
          // Blown leaves/debris
          setPixel(ctx, debrisX, debrisY, RAMPS.forest[2]);
          setPixel(ctx, debrisX + 1, debrisY, RAMPS.wood[2]);
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
        drawWalls(ctx, 'purple', 40, 180);
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

  'anim-waterwheel': {
    name: "Waterwheel",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#4a7aae');
        
        // Stream/river scene
        drawSky(ctx, 'water', 10, 100);
        
        // Mill building
        for (let my = 0; my < 50; my++) {
          for (let mx = 0; mx < 40; mx++) {
            if (mx === 0 || mx === 39 || my === 0 || my === 49) {
              setPixel(ctx, 140 + mx, 90 + my, RAMPS.wood[4]);
            } else {
              setPixel(ctx, 140 + mx, 90 + my, RAMPS.wood[2]);
            }
          }
        }
        
        // Mill roof
        for (let roof = 0; roof < 20; roof++) {
          for (let rx = 0; rx < 40 - roof; rx++) {
            setPixel(ctx, 140 + roof/2 + rx, 70 + roof, RAMPS.wood[3]);
          }
        }
        
        // Water wheel
        const wheelX = 120;
        const wheelY = 120;
        const wheelRadius = 25;
        const wheelRotation = frame * 0.1;
        
        // Wheel spokes
        for (let spoke = 0; spoke < 8; spoke++) {
          const spokeAngle = (spoke / 8) * Math.PI * 2 + wheelRotation;
          for (let len = 0; len < wheelRadius; len++) {
            const spokeX = wheelX + Math.cos(spokeAngle) * len;
            const spokeY = wheelY + Math.sin(spokeAngle) * len;
            setPixel(ctx, spokeX, spokeY, RAMPS.wood[4]);
          }
        }
        
        // Wheel rim
        for (let angle = 0; angle < 360; angle += 10) {
          const rimAngle = (angle * Math.PI / 180) + wheelRotation;
          const rimX = wheelX + Math.cos(rimAngle) * wheelRadius;
          const rimY = wheelY + Math.sin(rimAngle) * wheelRadius;
          setPixel(ctx, rimX, rimY, RAMPS.wood[3]);
        }
        
        // Water buckets on wheel
        for (let bucket = 0; bucket < 8; bucket++) {
          const bucketAngle = (bucket / 8) * Math.PI * 2 + wheelRotation;
          const bucketX = wheelX + Math.cos(bucketAngle) * (wheelRadius - 5);
          const bucketY = wheelY + Math.sin(bucketAngle) * (wheelRadius - 5);
          
          // Bucket
          for (let by = 0; by < 4; by++) {
            for (let bx = 0; bx < 6; bx++) {
              setPixel(ctx, bucketX + bx - 3, bucketY + by, RAMPS.wood[2]);
            }
          }
          
          // Water in bucket (if in lower half)
          if (bucketAngle % (Math.PI * 2) > Math.PI) {
            for (let water = 0; water < 2; water++) {
              for (let wx = 0; wx < 4; wx++) {
                setPixel(ctx, bucketX + wx - 2, bucketY + water, RAMPS.water[4]);
              }
            }
          }
          
          // Water spilling from bucket
          if (bucketAngle % (Math.PI * 2) < Math.PI && bucketAngle % (Math.PI * 2) > Math.PI * 0.5) {
            for (let spill = 0; spill < 8; spill++) {
              const spillX = bucketX + spill;
              const spillY = bucketY + 4 + spill * 2;
              if (spillY < 180) {
                setPixel(ctx, spillX, spillY, RAMPS.water[4]);
              }
            }
          }
        }
        
        // Wheel axle
        for (let axle = 0; axle < 20; axle++) {
          setPixel(ctx, 110 + axle, wheelY, RAMPS.wood[4]);
          setPixel(ctx, 110 + axle, wheelY + 1, RAMPS.wood[3]);
        }
        
        // Stream
        for (let y = 140; y < 200; y++) {
          for (let x = 0; x < 150; x++) {
            const streamFlow = Math.sin(x * 0.05 + frame * 0.2) * 3;
            if (y > 145 + streamFlow && y < 175 + streamFlow) {
              setPixel(ctx, x, y, RAMPS.water[3 + Math.floor(Math.random() * 2)]);
            }
          }
        }
        
        // Water flowing over wheel
        for (let flow = 0; flow < 15; flow++) {
          const flowX = wheelX - 10 + flow;
          const flowY = wheelY - wheelRadius - 5;
          
          // Falling water
          for (let fall = 0; fall < 10; fall++) {
            const fallY = flowY + fall * 3;
            if (fallY < wheelY + wheelRadius) {
              setPixel(ctx, flowX, fallY, RAMPS.water[5]);
            }
          }
        }
        
        // Water splash at bottom of wheel
        const splashIntensity = Math.sin(frame * 0.3) * 3 + 3;
        for (let splash = 0; splash < splashIntensity; splash++) {
          const splashAngle = (splash / splashIntensity) * Math.PI;
          const splashX = wheelX + Math.cos(splashAngle) * 8;
          const splashY = wheelY + wheelRadius + Math.sin(splashAngle) * 4;
          setPixel(ctx, splashX, splashY, '#ffffff');
        }
        
        // Stream banks
        for (let bank = 0; bank < 200; bank++) {
          const bankHeight = 140 + Math.sin(bank * 0.03) * 5;
          for (let bh = 0; bh < 8; bh++) {
            setPixel(ctx, bank, bankHeight - bh, RAMPS.forest[3]);
          }
        }
        
        // Mill output - flour or grain
        for (let grain = 0; grain < 6; grain++) {
          const grainX = 165 + grain;
          const grainY = 140 + grain;
          setPixel(ctx, grainX, grainY, '#daa520');
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
        drawWalls(ctx, 'stone', 40, 180);
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

  'anim-bat-swarm': {
    name: "Bat Swarm",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#050510');
        
        // Night sky
        drawSky(ctx, 'sky_night', 8, 120);
        
        // Moon
        drawMoon(ctx, 160, 40, 15);
        
        // Cave mouth or cliff
        for (let cliff = 0; cliff < 60; cliff++) {
          const cliffHeight = 80 + Math.sin(cliff * 0.1) * 20;
          for (let ch = 0; ch < cliffHeight; ch++) {
            setPixel(ctx, 20 + cliff, 120 + ch, RAMPS.stone[2]);
          }
        }
        
        // Cave opening
        for (let cave = 0; cave < 15; cave++) {
          const caveHeight = Math.sin(cave * 0.3) * 8 + 8;
          for (let ch = 0; ch < caveHeight; ch++) {
            setPixel(ctx, 40 + cave, 140 + ch, '#000000');
          }
        }
        
        // Swarm of bats flying out
        for (let bat = 0; bat < 30; bat++) {
          const batLife = (frame + bat * 5) % 120;
          const swarmRadius = batLife * 1.5;
          const swarmAngle = (bat / 30) * Math.PI * 2 + batLife * 0.05;
          
          // Bat starts at cave mouth
          const startX = 47;
          const startY = 145;
          
          const batX = startX + Math.cos(swarmAngle) * swarmRadius;
          const batY = startY + Math.sin(swarmAngle) * swarmRadius * 0.4 - batLife * 0.5;
          
          if (batX > 10 && batX < 190 && batY > 30 && batY < 180) {
            // Bat body
            setPixel(ctx, batX, batY, '#333333');
            setPixel(ctx, batX + 1, batY, '#333333');
            
            // Wing flap animation
            const wingPhase = (frame + bat) % 8;
            if (wingPhase < 4) {
              // Wings spread
              setPixel(ctx, batX - 1, batY, '#222222');
              setPixel(ctx, batX + 2, batY, '#222222');
              setPixel(ctx, batX - 2, batY + 1, '#222222');
              setPixel(ctx, batX + 3, batY + 1, '#222222');
            } else {
              // Wings folded
              setPixel(ctx, batX - 1, batY + 1, '#222222');
              setPixel(ctx, batX + 2, batY + 1, '#222222');
            }
          }
        }
        
        // Moonlight silhouettes of bats
        for (let silhouette = 0; silhouette < 8; silhouette++) {
          const silLife = (frame + silhouette * 15) % 80;
          const silX = 120 + silLife;
          const silY = 50 + Math.sin(silLife * 0.1 + silhouette) * 15;
          
          if (silX < 200 && silY > 30 && silY < 80) {
            // Silhouette against moon
            setPixel(ctx, silX, silY, '#000000');
            setPixel(ctx, silX + 1, silY, '#000000');
            
            // Wing silhouette
            const moonWingPhase = (frame + silhouette) % 6;
            if (moonWingPhase < 3) {
              setPixel(ctx, silX - 1, silY, '#000000');
              setPixel(ctx, silX + 2, silY, '#000000');
            }
          }
        }
        
        // Ground and trees
        drawGround(ctx, 170, 'forest', 'dark');
        
        // Dead trees
        for (let tree = 0; tree < 4; tree++) {
          const treeX = 120 + tree * 30;
          const treeY = 150;
          
          // Tree trunk
          for (let trunk = 0; trunk < 20; trunk++) {
            setPixel(ctx, treeX, treeY + trunk, RAMPS.wood[1]);
            setPixel(ctx, treeX + 1, treeY + trunk, RAMPS.wood[0]);
          }
          
          // Bare branches
          for (let branch = 0; branch < 6; branch++) {
            const branchAngle = (branch / 6) * Math.PI * 2;
            const branchLength = 8 + branch % 4;
            
            for (let len = 0; len < branchLength; len++) {
              const branchX = treeX + Math.cos(branchAngle) * len;
              const branchY = treeY + 5 + Math.sin(branchAngle) * len * 0.3;
              
              if (branchX > treeX - 15 && branchX < treeX + 15) {
                setPixel(ctx, branchX, branchY, RAMPS.wood[1]);
              }
            }
          }
        }
        
        // Fireflies for contrast
        for (let firefly = 0; firefly < 8; firefly++) {
          const flyLife = (frame + firefly * 12) % 60;
          const flyX = 30 + firefly * 20 + Math.sin(flyLife * 0.1) * 10;
          const flyY = 140 + Math.cos(flyLife * 0.15) * 15;
          
          if (flyLife % 20 < 10) {
            setPixel(ctx, flyX, flyY, '#ffff99');
          }
        }
        
        // Disturbed wildlife
        for (let owl = 0; owl < 2; owl++) {
          const owlX = 90 + owl * 40;
          const owlY = 135;
          
          // Owl silhouette
          for (let oy = 0; oy < 5; oy++) {
            for (let ox = 0; ox < 4; ox++) {
              setPixel(ctx, owlX + ox, owlY + oy, '#444444');
            }
          }
          
          // Glowing eyes
          setPixel(ctx, owlX + 1, owlY + 1, '#ffff00');
          setPixel(ctx, owlX + 3, owlY + 1, '#ffff00');
        }
        
        // Atmospheric mist
        for (let mist = 0; mist < 25; mist++) {
          const mistX = mist * 8 + Math.sin(frame * 0.02 + mist) * 5;
          const mistY = 160 + Math.cos(frame * 0.03 + mist) * 8;
          
          if (mistX > 0 && mistX < 200) {
            setPixel(ctx, mistX, mistY, '#333333');
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
        drawWalls(ctx, 'wood', 40, 180);
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
  console.log('Generating 20 still backgrounds...');
  const results = [];
  
  for (const [sceneId, scene] of Object.entries(stillScenes)) {
    console.log(`Generating ${scene.name}...`);
    
    try {
      // Generate at work size
      const { canvas, ctx } = createWorkCanvas();
      scene.generator(ctx);
      
      // Upscale to final size
      const finalCanvas = upscaleCanvas(canvas, STILL_SIZE / WORK_SIZE);
      
      // Save
      const filename = path.join(STILL_DIR, `${sceneId}.png`);
      const fileSize = await savePNG(filename, finalCanvas);
      
      results.push({ 
        scene: scene.name, 
        filename: `${sceneId}.png`, 
        size: fileSize,
        success: true 
      });
      
    } catch (error) {
      console.error(`Failed to generate ${scene.name}:`, error.message);
      results.push({ 
        scene: scene.name, 
        filename: `${sceneId}.png`, 
        error: error.message,
        success: false 
      });
    }
  }
  
  return results;
}

async function generateAnimatedBackgrounds() {
  console.log('Generating 20 animated GIF backgrounds...');
  const results = [];
  
  for (const [sceneId, scene] of Object.entries(animatedScenes)) {
    console.log(`Generating ${scene.name}...`);
    
    try {
      // Generate all frames at work size
      const frames = [];
      
      for (let frame = 0; frame < FRAMES; frame++) {
        const { canvas, ctx } = createWorkCanvas();
        const generator = scene.generator(frame);
        generator(ctx);
        
        // Upscale frame
        const scaledFrame = upscaleCanvas(canvas, GIF_SIZE / WORK_SIZE);
        frames.push(scaledFrame);
      }
      
      // Save GIF
      const filename = path.join(GIF_DIR, `${sceneId}.gif`);
      const fileSize = await saveGIF(filename, frames);
      
      results.push({ 
        scene: scene.name, 
        filename: `${sceneId}.gif`, 
        size: fileSize,
        success: true 
      });
      
    } catch (error) {
      console.error(`Failed to generate ${scene.name}:`, error.message);
      results.push({ 
        scene: scene.name, 
        filename: `${sceneId}.gif`, 
        error: error.message,
        success: false 
      });
    }
  }
  
  return results;
}

async function main() {
  try {
    console.log('Starting Order of 86 Background Generation - Batch 2');
    console.log('='.repeat(60));
    
    // Generate still backgrounds
    const stillResults = await generateStillBackgrounds();
    
    // Generate animated backgrounds  
    const animatedResults = await generateAnimatedBackgrounds();
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('BATCH 2 GENERATION COMPLETE');
    console.log('='.repeat(60));
    
    const stillSuccess = stillResults.filter(r => r.success);
    const stillFailed = stillResults.filter(r => !r.success);
    const animatedSuccess = animatedResults.filter(r => r.success);
    const animatedFailed = animatedResults.filter(r => !r.success);
    
    console.log(`\nSTILL BACKGROUNDS (${stillSuccess.length}/${stillResults.length} successful):`);
    stillSuccess.forEach(r => {
      console.log(`  ✓ ${r.scene} (${(r.size / 1024).toFixed(1)}KB)`);
    });
    
    if (stillFailed.length > 0) {
      console.log(`\nSTILL BACKGROUND FAILURES (${stillFailed.length}):`);
      stillFailed.forEach(r => {
        console.log(`  ✗ ${r.scene}: ${r.error}`);
      });
    }
    
    console.log(`\nANIMATED BACKGROUNDS (${animatedSuccess.length}/${animatedResults.length} successful):`);
    animatedSuccess.forEach(r => {
      console.log(`  ✓ ${r.scene} (${(r.size / 1024).toFixed(1)}KB)`);
    });
    
    if (animatedFailed.length > 0) {
      console.log(`\nANIMATED BACKGROUND FAILURES (${animatedFailed.length}):`);
      animatedFailed.forEach(r => {
        console.log(`  ✗ ${r.scene}: ${r.error}`);
      });
    }
    
    const totalSuccess = stillSuccess.length + animatedSuccess.length;
    const totalFiles = stillResults.length + animatedResults.length;
    const totalSize = [...stillSuccess, ...animatedSuccess].reduce((sum, r) => sum + r.size, 0);
    
    console.log(`\nTOTAL: ${totalSuccess}/${totalFiles} files generated`);
    console.log(`TOTAL SIZE: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
    
    if (totalSuccess === totalFiles) {
      console.log('🎉 ALL BACKGROUNDS GENERATED SUCCESSFULLY!');
    } else {
      console.log(`⚠️  ${totalFiles - totalSuccess} files failed to generate`);
    }
    
  } catch (error) {
    console.error('Fatal error during generation:', error);
    process.exit(1);
  }
}

// Run the generator
if (require.main === module) {
  main();
}