/**
 * New Batch Generator for Order of 86 Website
 * Generates 10 new still PNG backgrounds (800x800) and 10 new animated GIF backgrounds (400x400)
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
  'scene-emberhowl-sunrise': {
    name: "Emberhowl Sunrise",
    generator: (ctx) => {
      fillBackground(ctx, '#ff4500'); // Orange base
      
      // Dawn sky with orange gradient
      drawSky(ctx, 'sky_sunset', 15, 80);
      
      // Volcanic peaks in background
      for (let x = 0; x < 200; x += 30) {
        const peakHeight = 60 + Math.sin(x * 0.05) * 20;
        const peakX = x + Math.sin(x * 0.1) * 10;
        for (let y = 80 - peakHeight; y < 80; y++) {
          for (let px = 0; px < 25; px++) {
            const dist = Math.abs(px - 12.5);
            if (dist < (25 - (y - (80 - peakHeight))) / 2) {
              setPixel(ctx, peakX + px, y, RAMPS.stone[Math.floor(Math.random() * 3) + 1]);
            }
          }
        }
        // Lava glow at peaks
        if (Math.random() > 0.5) {
          setPixel(ctx, peakX + 12, 80 - peakHeight, RAMPS.lava[4]);
        }
      }
      
      // Ground layer
      drawGround(ctx, 140, 'stone', 'rocky');
      
      // Scattered rocks and crystals
      drawSprite(ctx, 20, 130, rock_cluster(), 'stone');
      drawSprite(ctx, 160, 125, crystal(), 'lava');
      drawSprite(ctx, 80, 135, rock_cluster(), 'stone');
      
      // Embers in the air
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * 180 + 10;
        const y = Math.random() * 120 + 20;
        setPixel(ctx, x, y, RAMPS.lava[3 + Math.floor(Math.random() * 2)]);
      }
    }
  },

  'scene-deepwell-depths': {
    name: "Deepwell Depths",
    generator: (ctx) => {
      fillBackground(ctx, '#0a0a2e'); // Deep blue base
      
      // Dark underwater sky
      for (let y = 0; y < 60; y++) {
        for (let x = 0; x < 200; x++) {
          const depth = y / 60;
          const colorIndex = Math.floor(depth * 4);
          setPixel(ctx, x, y, RAMPS.water[colorIndex]);
        }
      }
      
      // Cavern walls
      drawWalls(ctx, 'stone', 40, 160);
      
      // Cavern floor
      drawGround(ctx, 160, 'stone', 'cave');
      
      // Bioluminescent crystals
      const crystalColors = ['#00ffff', '#0080ff', '#8000ff', '#ff00ff'];
      for (let i = 0; i < 8; i++) {
        const x = Math.random() * 160 + 20;
        const y = Math.random() * 40 + 120;
        const color = crystalColors[Math.floor(Math.random() * crystalColors.length)];
        
        // Draw crystal with glow
        for (let cy = 0; cy < 8; cy++) {
          for (let cx = 0; cx < 6; cx++) {
            const dist = Math.sqrt((cx - 3) * (cx - 3) + (cy - 4) * (cy - 4));
            if (dist < 3) {
              setPixel(ctx, x + cx, y + cy, color);
            }
          }
        }
        
        // Glow effect
        for (let gy = -3; gy < 12; gy++) {
          for (let gx = -3; gx < 10; gx++) {
            const glowDist = Math.sqrt(gx * gx + gy * gy);
            if (glowDist > 3 && glowDist < 8 && Math.random() > 0.7) {
              const alpha = 1 - (glowDist - 3) / 5;
              if (alpha > 0) {
                setPixel(ctx, x + gx + 3, y + gy + 4, color);
              }
            }
          }
        }
      }
      
      // Stalactites
      drawSprite(ctx, 40, 60, stalactite(), 'stone');
      drawSprite(ctx, 120, 50, stalactite(), 'stone');
      drawSprite(ctx, 160, 65, stalactite(), 'stone');
    }
  },

  'scene-roseglow-garden': {
    name: "Roseglow Garden",
    generator: (ctx) => {
      fillBackground(ctx, '#aa5a9a'); // Pink base
      
      // Pink magical sky
      drawSky(ctx, 'pink', 12, 100);
      
      // Garden ground
      drawGround(ctx, 140, 'forest', 'moss');
      
      // Rose bushes and magical plants
      for (let x = 20; x < 180; x += 25) {
        const bushY = 130 + Math.sin(x * 0.1) * 5;
        
        // Rose bush base
        for (let by = 0; by < 15; by++) {
          for (let bx = 0; bx < 12; bx++) {
            if (Math.random() > 0.3) {
              setPixel(ctx, x + bx, bushY + by, RAMPS.forest[2 + Math.floor(Math.random() * 2)]);
            }
          }
        }
        
        // Pink roses
        for (let r = 0; r < 3; r++) {
          const roseX = x + Math.random() * 10 + 1;
          const roseY = bushY + Math.random() * 8;
          setPixel(ctx, roseX, roseY, RAMPS.pink[4]);
          setPixel(ctx, roseX + 1, roseY, RAMPS.pink[3]);
          setPixel(ctx, roseX, roseY + 1, RAMPS.pink[4]);
        }
      }
      
      // Magical lanterns
      drawSprite(ctx, 50, 110, lantern(), 'pink');
      drawSprite(ctx, 130, 105, lantern(), 'pink'); 
      drawSprite(ctx, 170, 115, lantern(), 'pink');
      
      // Sparkles in the air
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * 180 + 10;
        const y = Math.random() * 100 + 20;
        setPixel(ctx, x, y, '#ffb3e6');
        if (Math.random() > 0.5) {
          setPixel(ctx, x + 1, y, '#ffb3e6');
          setPixel(ctx, x, y + 1, '#ffb3e6');
        }
      }
    }
  },

  'scene-umbra-void': {
    name: "Umbra Void",
    generator: (ctx) => {
      fillBackground(ctx, '#050510'); // Deep space black
      
      // Cosmic void sky
      drawSky(ctx, 'sky_night', 8, 200);
      
      // Purple nebula in background
      for (let y = 20; y < 80; y++) {
        for (let x = 60; x < 140; x++) {
          const noise = Math.sin(x * 0.05) * Math.sin(y * 0.03) * Math.sin((x + y) * 0.02);
          if (noise > 0.2) {
            const intensity = Math.floor((noise - 0.2) * 10);
            setPixel(ctx, x, y, RAMPS.purple[Math.min(intensity, RAMPS.purple.length - 1)]);
          }
        }
      }
      
      // Distant stars
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * 200;
        const y = Math.random() * 120;
        const brightness = Math.random();
        if (brightness > 0.8) {
          setPixel(ctx, x, y, '#ffffff');
        } else if (brightness > 0.6) {
          setPixel(ctx, x, y, '#cccccc');
        } else if (brightness > 0.4) {
          setPixel(ctx, x, y, '#999999');
        }
      }
      
      // Floating void platforms
      for (let i = 0; i < 3; i++) {
        const px = 30 + i * 60;
        const py = 150 + Math.sin(i * 2) * 20;
        
        // Platform
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 25; x++) {
            if (y < 3 || Math.random() > 0.3) {
              setPixel(ctx, px + x, py + y, RAMPS.stone[1 + Math.floor(Math.random() * 2)]);
            }
          }
        }
        
        // Purple crystals on platforms
        if (Math.random() > 0.5) {
          drawSprite(ctx, px + 5, py - 8, crystal(), 'purple');
        }
      }
    }
  },

  'scene-solaris-beacon': {
    name: "Solaris Beacon",
    generator: (ctx) => {
      fillBackground(ctx, '#ffd700'); // Golden base
      
      // Sunset sky
      drawSky(ctx, 'sky_sunset', 12, 90);
      
      // Ocean horizon
      drawWater(ctx, 90);
      
      // Rocky coast
      drawGround(ctx, 140, 'stone', 'rocky');
      
      // Lighthouse tower
      const towerX = 85;
      const towerWidth = 30;
      const towerHeight = 80;
      
      // Tower base
      for (let y = 0; y < towerHeight; y++) {
        for (let x = 0; x < towerWidth; x++) {
          const dist = Math.abs(x - towerWidth/2);
          const width = towerWidth - (y / 20); // Slight taper
          if (dist < width/2) {
            setPixel(ctx, towerX + x, 140 - y, RAMPS.stone[2 + Math.floor(y / 20)]);
          }
        }
      }
      
      // Lighthouse beacon (golden light)
      for (let y = 0; y < 12; y++) {
        for (let x = 0; x < towerWidth + 4; x++) {
          const beaconY = 65 + y;
          const beaconX = towerX - 2 + x;
          if (y < 8 && x > 1 && x < towerWidth + 1) {
            setPixel(ctx, beaconX, beaconY, RAMPS.gold[3 + Math.floor(y / 3)]);
          }
        }
      }
      
      // Light beams
      for (let angle = 0; angle < 8; angle++) {
        const beamAngle = (angle / 8) * Math.PI * 2;
        for (let r = 10; r < 40; r++) {
          const beamX = towerX + 15 + Math.cos(beamAngle) * r;
          const beamY = 70 + Math.sin(beamAngle) * r;
          if (beamX >= 0 && beamX < 200 && beamY >= 0 && beamY < 200 && Math.random() > 0.7) {
            setPixel(ctx, beamX, beamY, RAMPS.gold[4]);
          }
        }
      }
      
      // Rocks around lighthouse
      drawSprite(ctx, 40, 130, rock_cluster(), 'stone');
      drawSprite(ctx, 140, 135, rock_cluster(), 'stone');
    }
  },

  'scene-crystal-throne': {
    name: "Crystal Throne",
    generator: (ctx) => {
      fillBackground(ctx, '#c9e5ff'); // Ice blue base
      
      // Ice cave ceiling
      for (let y = 0; y < 50; y++) {
        for (let x = 0; x < 200; x++) {
          const caveShape = Math.sin(x * 0.02) * 20 + 30;
          if (y < caveShape) {
            setPixel(ctx, x, y, RAMPS.ice[Math.floor(Math.random() * 3)]);
          }
        }
      }
      
      // Ice walls
      drawWalls(ctx, 'ice', 30, 170);
      
      // Ice floor
      drawGround(ctx, 170, 'ice', 'smooth');
      
      // Crystal throne in center
      const throneX = 85;
      const throneY = 120;
      
      // Throne back
      for (let y = 0; y < 40; y++) {
        for (let x = 0; x < 30; x++) {
          const backShape = Math.abs(x - 15);
          if (backShape < 15 - y/3 && y < 35) {
            setPixel(ctx, throneX + x, throneY - y, RAMPS.ice[2 + Math.floor(Math.random() * 2)]);
          }
        }
      }
      
      // Throne seat
      for (let y = 0; y < 12; y++) {
        for (let x = 5; x < 25; x++) {
          setPixel(ctx, throneX + x, throneY + y, RAMPS.ice[3]);
        }
      }
      
      // Throne arms
      for (let y = 5; y < 20; y++) {
        setPixel(ctx, throneX + 2, throneY - y, RAMPS.ice[2]);
        setPixel(ctx, throneX + 27, throneY - y, RAMPS.ice[2]);
      }
      
      // Frozen pillars
      drawSprite(ctx, 20, 80, pillar(90, 'ice'), 'ice');
      drawSprite(ctx, 160, 75, pillar(95, 'ice'), 'ice');
      
      // Ice crystals
      drawSprite(ctx, 50, 150, crystal(), 'ice');
      drawSprite(ctx, 130, 145, crystal(), 'ice');
      drawSprite(ctx, 40, 160, crystal(), 'ice');
      drawSprite(ctx, 150, 155, crystal(), 'ice');
    }
  },

  'scene-witchs-market': {
    name: "Witch's Market", 
    generator: (ctx) => {
      fillBackground(ctx, '#2a1a0a'); // Dark brown base
      
      // Dark market sky
      drawSky(ctx, 'sky_night', 8, 80);
      
      // Cobblestone ground
      drawGround(ctx, 140, 'stone', 'cobblestone');
      
      // Market stalls
      for (let i = 0; i < 3; i++) {
        const stallX = 20 + i * 60;
        
        // Stall frame
        for (let y = 0; y < 30; y++) {
          for (let x = 0; x < 40; x++) {
            if (x < 3 || x > 36 || y > 25) {
              setPixel(ctx, stallX + x, 110 + y, RAMPS.wood[2 + Math.floor(Math.random() * 2)]);
            }
          }
        }
        
        // Stall roof
        for (let y = 0; y < 8; y++) {
          for (let x = -2; x < 44; x++) {
            if (x >= -2 + y && x < 44 - y) {
              setPixel(ctx, stallX + x, 102 + y, RAMPS.wood[1]);
            }
          }
        }
        
        // Goods in stalls
        drawSprite(ctx, stallX + 5, 125, cauldron());
        drawSprite(ctx, stallX + 20, 120, bookshelf(15), 'wood');
        
        // Bottles and potions
        for (let j = 0; j < 5; j++) {
          const bottleX = stallX + 8 + j * 5;
          const bottleY = 130;
          setPixel(ctx, bottleX, bottleY, RAMPS.purple[2 + Math.floor(Math.random() * 3)]);
          setPixel(ctx, bottleX, bottleY + 1, RAMPS.purple[2 + Math.floor(Math.random() * 3)]);
        }
      }
      
      // Hanging lanterns
      drawSprite(ctx, 35, 95, lantern(), 'gold');
      drawSprite(ctx, 95, 90, lantern(), 'gold');
      drawSprite(ctx, 155, 93, lantern(), 'gold');
      
      // Scroll racks
      for (let i = 0; i < 2; i++) {
        const scrollX = 30 + i * 90;
        for (let j = 0; j < 6; j++) {
          const scrollY = 115 + j * 3;
          setPixel(ctx, scrollX + 45, scrollY, '#fff8dc');
          setPixel(ctx, scrollX + 46, scrollY, '#fff8dc');
        }
      }
    }
  },

  'scene-moonlit-dock': {
    name: "Moonlit Dock",
    generator: (ctx) => {
      fillBackground(ctx, '#0a0a2e'); // Dark night blue
      
      // Night sky
      drawSky(ctx, 'sky_night', 10, 100);
      
      // Full moon
      drawMoon(ctx, 160, 30, 12, '#ffffff');
      
      // Calm water
      drawWater(ctx, 100);
      
      // Wooden dock extending into water
      const dockY = 120;
      const dockWidth = 16;
      
      // Main dock structure
      for (let x = 50; x < 150; x++) {
        for (let y = 0; y < dockWidth; y++) {
          if (y < 2 || y > dockWidth - 3) {
            setPixel(ctx, x, dockY + y, RAMPS.wood[1]); // Side planks
          } else {
            setPixel(ctx, x, dockY + y, RAMPS.wood[2 + Math.floor(Math.random() * 2)]);
          }
        }
      }
      
      // Dock posts in water
      for (let postX = 60; postX < 140; postX += 20) {
        for (let y = 0; y < 25; y++) {
          for (let x = 0; x < 4; x++) {
            setPixel(ctx, postX + x, dockY + dockWidth + y, RAMPS.wood[1]);
          }
        }
      }
      
      // Rope and barrel on dock
      drawSprite(ctx, 80, 115, cauldron()); // Use as barrel
      
      // Wooden posts with ropes
      for (let x = 55; x < 145; x += 30) {
        for (let y = 0; y < 12; y++) {
          setPixel(ctx, x, dockY - y, RAMPS.wood[2]);
        }
        
        // Rope between posts
        if (x < 130) {
          for (let rx = x + 3; rx < x + 27; rx += 3) {
            setPixel(ctx, rx, dockY - 6, RAMPS.wood[0]);
          }
        }
      }
      
      // Moon reflection in water
      for (let y = 0; y < 30; y++) {
        for (let x = 0; x < 8; x++) {
          const reflectY = 140 + y;
          const reflectX = 157 + x + Math.sin(y * 0.3) * 2; // Wavy reflection
          if (Math.random() > 0.4) {
            setPixel(ctx, reflectX, reflectY, '#cccccc');
          }
        }
      }
    }
  },

  'scene-bone-crypt': {
    name: "Bone Crypt",
    generator: (ctx) => {
      fillBackground(ctx, '#1a0f08'); // Dark brown base
      
      // Underground ceiling
      for (let y = 0; y < 40; y++) {
        for (let x = 0; x < 200; x++) {
          const ceiling = 40 - Math.abs(Math.sin(x * 0.02)) * 20;
          if (y < ceiling) {
            setPixel(ctx, x, y, RAMPS.stone[0 + Math.floor(Math.random() * 2)]);
          }
        }
      }
      
      // Crypt walls
      drawWalls(ctx, 'stone', 35, 165);
      
      // Stone floor
      drawGround(ctx, 165, 'stone', 'smooth');
      
      // Stone sarcophagi
      for (let i = 0; i < 3; i++) {
        const sarcX = 40 + i * 50;
        const sarcY = 130;
        
        // Sarcophagus base
        for (let y = 0; y < 20; y++) {
          for (let x = 0; x < 30; x++) {
            if (y < 15 || x < 3 || x > 26) {
              setPixel(ctx, sarcX + x, sarcY + y, RAMPS.stone[2 + Math.floor(y / 8)]);
            }
          }
        }
        
        // Sarcophagus lid (slightly raised)
        for (let y = 0; y < 8; y++) {
          for (let x = 2; x < 28; x++) {
            setPixel(ctx, sarcX + x, sarcY - 3 + y, RAMPS.stone[3]);
          }
        }
      }
      
      // Scattered bones on floor
      for (let i = 0; i < 15; i++) {
        const boneX = 20 + Math.random() * 160;
        const boneY = 155 + Math.random() * 20;
        setPixel(ctx, boneX, boneY, '#fff8dc');
        setPixel(ctx, boneX + 1, boneY, '#fff8dc');
        if (Math.random() > 0.5) {
          setPixel(ctx, boneX, boneY + 1, '#fff8dc');
        }
      }
      
      // Torch sconces on walls
      drawSprite(ctx, 25, 80, torch());
      drawSprite(ctx, 175, 85, torch());
      
      // Ancient symbols on walls (simple dots)
      for (let i = 0; i < 8; i++) {
        const symX = 30 + Math.random() * 140;
        const symY = 60 + Math.random() * 40;
        setPixel(ctx, symX, symY, '#8b4513');
        setPixel(ctx, symX + 1, symY, '#8b4513');
        setPixel(ctx, symX, symY + 1, '#8b4513');
      }
    }
  },

  'scene-canopy-village': {
    name: "Canopy Village",
    generator: (ctx) => {
      fillBackground(ctx, '#2a5a2a'); // Forest green base
      
      // Forest sky
      drawSky(ctx, 'forest', 8, 70);
      
      // Tree trunks (multiple large trees)
      const trees = [
        { x: 30, width: 20, height: 130 },
        { x: 90, width: 25, height: 140 },
        { x: 150, width: 18, height: 125 }
      ];
      
      for (const tree of trees) {
        for (let y = 0; y < tree.height; y++) {
          for (let x = 0; x < tree.width; x++) {
            const trunkX = tree.x + x;
            const trunkY = 180 - y;
            if (x < 3 || x > tree.width - 4) {
              setPixel(ctx, trunkX, trunkY, RAMPS.wood[1]); // Darker edges
            } else {
              setPixel(ctx, trunkX, trunkY, RAMPS.wood[2 + Math.floor(Math.random() * 2)]);
            }
          }
        }
        
        // Tree canopy
        const canopyRadius = tree.width + 15;
        for (let y = -canopyRadius; y < canopyRadius/2; y++) {
          for (let x = -canopyRadius; x < canopyRadius; x++) {
            const dist = Math.sqrt(x*x + y*y);
            if (dist < canopyRadius && Math.random() > 0.3) {
              const leafX = tree.x + tree.width/2 + x;
              const leafY = 60 + y;
              setPixel(ctx, leafX, leafY, RAMPS.forest[3 + Math.floor(Math.random() * 2)]);
            }
          }
        }
      }
      
      // Treehouses on platforms
      for (let i = 0; i < 2; i++) {
        const houseX = 35 + i * 80;
        const houseY = 90;
        
        // Platform
        for (let x = 0; x < 25; x++) {
          for (let y = 0; y < 4; y++) {
            setPixel(ctx, houseX + x, houseY + y, RAMPS.wood[2]);
          }
        }
        
        // House walls
        for (let y = 0; y < 15; y++) {
          for (let x = 3; x < 22; x++) {
            if (y > 12 || x < 5 || x > 19) {
              setPixel(ctx, houseX + x, houseY - y, RAMPS.wood[3]);
            }
          }
        }
        
        // Roof
        for (let y = 0; y < 8; y++) {
          for (let x = 2 - y; x < 23 + y; x++) {
            if (x >= 2 && x <= 22) {
              setPixel(ctx, houseX + x, houseY - 15 - y, RAMPS.wood[1]);
            }
          }
        }
        
        // Window
        setPixel(ctx, houseX + 15, houseY - 8, '#ffff99');
        setPixel(ctx, houseX + 16, houseY - 8, '#ffff99');
        setPixel(ctx, houseX + 15, houseY - 9, '#ffff99');
        setPixel(ctx, houseX + 16, houseY - 9, '#ffff99');
      }
      
      // Rope bridges between treehouses
      for (let x = 60; x < 115; x++) {
        const bridgeY = 95 + Math.sin(x * 0.2) * 2; // Sagging rope
        setPixel(ctx, x, bridgeY, RAMPS.wood[0]);
        if (x % 3 === 0) {
          setPixel(ctx, x, bridgeY + 1, RAMPS.wood[0]); // Rope slats
        }
      }
      
      // Hanging lanterns
      drawSprite(ctx, 70, 80, lantern(), 'gold');
      drawSprite(ctx, 130, 75, lantern(), 'gold');
      
      // Ground vegetation
      drawGround(ctx, 180, 'forest', 'moss');
      drawSprite(ctx, 10, 170, mushroom());
      drawSprite(ctx, 180, 165, mushroom());
    }
  }
};

// ============================================================================
// ANIMATED GIF SCENES
// ============================================================================

const animatedScenes = {
  'anim-lava-falls': {
    name: "Lava Falls",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#1a0000');
        
        // Rocky cliff background
        drawSky(ctx, 'lava', 6, 60);
        drawWalls(ctx, 'stone', 20, 180);
        
        // Lava pool at bottom
        drawLava(ctx, 160);
        
        // Animated lava fall
        const fallX = 80;
        const fallWidth = 25;
        const fallSpeed = frame * 8;
        
        for (let y = 60; y < 160; y++) {
          for (let x = 0; x < fallWidth; x++) {
            const waveOffset = Math.sin((y + fallSpeed) * 0.3 + x * 0.5) * 3;
            const lavaX = fallX + x + waveOffset;
            const lavaIntensity = Math.sin((y + fallSpeed) * 0.2) * 0.5 + 0.5;
            const colorIndex = Math.floor(lavaIntensity * (RAMPS.lava.length - 1)) + 1;
            setPixel(ctx, lavaX, y, RAMPS.lava[Math.min(colorIndex, RAMPS.lava.length - 1)]);
          }
        }
        
        // Floating ember particles
        for (let i = 0; i < 20; i++) {
          const emberX = 20 + Math.random() * 160;
          const emberY = (60 + Math.random() * 100 + frame * 10) % 140 + 20;
          const flicker = Math.sin(frame * 0.5 + i) > 0.3;
          if (flicker) {
            setPixel(ctx, emberX, emberY, RAMPS.lava[4]);
          }
        }
      };
    }
  },

  'anim-northern-lights': {
    name: "Northern Lights",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#050510');
        
        // Snowy ground
        drawGround(ctx, 140, 'ice', 'smooth');
        
        // Dark sky
        drawSky(ctx, 'sky_night', 6, 120);
        
        // Animated aurora
        const time = frame * 0.3;
        for (let y = 20; y < 80; y++) {
          for (let x = 0; x < 200; x++) {
            const wave1 = Math.sin(x * 0.02 + time) * 20;
            const wave2 = Math.sin(x * 0.015 + time * 1.2) * 15;
            const wave3 = Math.sin(x * 0.025 + time * 0.8) * 10;
            const waveY = y + wave1 + wave2 + wave3;
            
            const distance = Math.abs(waveY - (y + 30));
            if (distance < 8) {
              const intensity = 1 - (distance / 8);
              const colors = ['#00ff88', '#00ccff', '#8844ff', '#ff4488'];
              const colorIndex = Math.floor((x * 0.01 + time) % colors.length);
              
              if (intensity > 0.4) {
                setPixel(ctx, x, y, colors[colorIndex]);
              }
            }
          }
        }
        
        // Snow particles
        for (let i = 0; i < 30; i++) {
          const snowX = (50 + i * 5 + frame * 2) % 200;
          const snowY = (30 + i * 7 + frame * 3) % 120 + 20;
          setPixel(ctx, snowX, snowY, '#ffffff');
        }
      };
    }
  },

  'anim-firefly-meadow': {
    name: "Firefly Meadow",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#0a1a0a');
        
        // Night sky
        drawSky(ctx, 'sky_night', 6, 100);
        
        // Grass meadow
        drawGround(ctx, 140, 'forest', 'grass');
        
        // Scattered trees
        drawSprite(ctx, 20, 100, tree_oak(), 'forest');
        drawSprite(ctx, 160, 95, tree_pine(), 'forest');
        
        // Animated fireflies
        const fireflies = [];
        for (let i = 0; i < 25; i++) {
          const time = frame * 0.2 + i;
          const x = 100 + Math.sin(time * 0.7 + i) * 80;
          const y = 80 + Math.cos(time * 0.5 + i * 2) * 40;
          const brightness = Math.sin(time * 2 + i * 3) > 0.2;
          
          if (brightness && x > 10 && x < 190 && y > 40 && y < 130) {
            // Firefly glow
            setPixel(ctx, x, y, '#ffff99');
            setPixel(ctx, x + 1, y, '#aaaa44');
            setPixel(ctx, x, y + 1, '#aaaa44');
            
            // Dim glow around firefly
            for (let gy = -2; gy <= 2; gy++) {
              for (let gx = -2; gx <= 2; gx++) {
                const dist = Math.sqrt(gx*gx + gy*gy);
                if (dist > 1 && dist < 2.5 && Math.random() > 0.6) {
                  setPixel(ctx, x + gx, y + gy, '#444422');
                }
              }
            }
          }
        }
      };
    }
  },

  'anim-tidal-pool': {
    name: "Tidal Pool",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#4a7aae');
        
        // Sky
        drawSky(ctx, 'water', 8, 80);
        
        // Rocky pool edges
        drawGround(ctx, 160, 'stone', 'rocky');
        
        // Animated water level
        const tideHeight = Math.sin(frame * 0.4) * 15 + 120;
        
        // Water surface with animation
        for (let y = tideHeight; y < 160; y++) {
          for (let x = 30; x < 170; x++) {
            const poolShape = Math.sin(x * 0.02) * 10 + 20;
            if (y > tideHeight + poolShape) {
              setPixel(ctx, x, y, RAMPS.water[2 + Math.floor(Math.random() * 2)]);
            }
          }
        }
        
        // Foam and bubbles
        const wavePhase = frame * 0.5;
        for (let x = 30; x < 170; x++) {
          const foamY = tideHeight + Math.sin(x * 0.1 + wavePhase) * 3;
          if (Math.random() > 0.5) {
            setPixel(ctx, x, foamY, '#ffffff');
            setPixel(ctx, x, foamY + 1, '#cccccc');
          }
        }
        
        // Pool creatures (small dots)
        for (let i = 0; i < 10; i++) {
          const creatureX = 40 + Math.sin(frame * 0.3 + i) * 60 + 50;
          const creatureY = 130 + Math.cos(frame * 0.2 + i * 2) * 15;
          setPixel(ctx, creatureX, creatureY, '#ff6699');
        }
      };
    }
  },

  'anim-clockwork-gears': {
    name: "Clockwork Gears",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#2a1a00');
        
        // Mechanical background
        drawWalls(ctx, 'gold', 30, 170);
        drawGround(ctx, 170, 'gold', 'smooth');
        
        // Spinning gears
        const gears = [
          { x: 60, y: 80, radius: 20, speed: frame * 0.3 },
          { x: 120, y: 100, radius: 15, speed: -frame * 0.4 },
          { x: 150, y: 60, radius: 12, speed: frame * 0.6 }
        ];
        
        for (const gear of gears) {
          // Gear center
          for (let gy = -gear.radius; gy <= gear.radius; gy++) {
            for (let gx = -gear.radius; gx <= gear.radius; gx++) {
              const dist = Math.sqrt(gx*gx + gy*gy);
              if (dist < gear.radius - 3) {
                setPixel(ctx, gear.x + gx, gear.y + gy, RAMPS.gold[2]);
              } else if (dist < gear.radius) {
                // Gear teeth
                const angle = Math.atan2(gy, gx) + gear.speed;
                const toothPattern = Math.sin(angle * 8) > 0.5;
                if (toothPattern) {
                  setPixel(ctx, gear.x + gx, gear.y + gy, RAMPS.gold[4]);
                }
              }
            }
          }
        }
        
        // Steam puffs
        for (let i = 0; i < 8; i++) {
          const steamX = 40 + Math.sin(frame * 0.2 + i) * 20 + i * 15;
          const steamY = 50 - (frame * 2 + i * 8) % 40;
          if (steamY > 10 && steamY < 90) {
            setPixel(ctx, steamX, steamY, '#cccccc');
            setPixel(ctx, steamX + 1, steamY, '#aaaaaa');
          }
        }
        
        // Connecting rods
        for (let rod = 0; rod < 2; rod++) {
          const rodX = 80 + rod * 40;
          const rodY = 90 + Math.sin(frame * 0.3 + rod) * 5;
          for (let x = 0; x < 20; x++) {
            setPixel(ctx, rodX + x, rodY, RAMPS.gold[1]);
            setPixel(ctx, rodX + x, rodY + 1, RAMPS.gold[1]);
          }
        }
      };
    }
  },

  'anim-spirit-wisps': {
    name: "Spirit Wisps",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#1a0f08');
        
        // Ruined walls
        drawWalls(ctx, 'stone', 20, 180);
        drawGround(ctx, 180, 'stone', 'broken');
        
        // Ruined structures
        for (let i = 0; i < 3; i++) {
          const ruinX = 30 + i * 60;
          const ruinHeight = 40 + i * 10;
          for (let y = 0; y < ruinHeight; y++) {
            for (let x = 0; x < 15; x++) {
              if (Math.random() > 0.4) {
                setPixel(ctx, ruinX + x, 180 - y, RAMPS.stone[1 + Math.floor(Math.random() * 2)]);
              }
            }
          }
        }
        
        // Floating spirit wisps
        const spirits = [
          { baseX: 50, baseY: 100, radius: 30, speed: 0.3, phase: 0 },
          { baseX: 100, baseY: 80, radius: 25, speed: -0.4, phase: 2 },
          { baseX: 150, baseY: 120, radius: 35, speed: 0.25, phase: 4 }
        ];
        
        for (const spirit of spirits) {
          const time = frame * spirit.speed + spirit.phase;
          const spiritX = spirit.baseX + Math.sin(time) * spirit.radius;
          const spiritY = spirit.baseY + Math.cos(time * 1.3) * (spirit.radius * 0.5);
          
          // Wisp glow
          for (let gy = -6; gy <= 6; gy++) {
            for (let gx = -6; gx <= 6; gx++) {
              const dist = Math.sqrt(gx*gx + gy*gy);
              if (dist < 6) {
                const alpha = 1 - (dist / 6);
                const intensity = alpha * (0.5 + 0.5 * Math.sin(frame * 0.6 + spirit.phase));
                if (intensity > 0.3) {
                  const colors = ['#88ffff', '#ff88ff', '#ffff88'];
                  const colorIndex = Math.floor(spirit.phase / 2) % colors.length;
                  setPixel(ctx, spiritX + gx, spiritY + gy, colors[colorIndex]);
                }
              }
            }
          }
          
          // Wisp trail
          for (let t = 1; t <= 5; t++) {
            const trailTime = frame * spirit.speed + spirit.phase - t * 0.3;
            const trailX = spirit.baseX + Math.sin(trailTime) * spirit.radius;
            const trailY = spirit.baseY + Math.cos(trailTime * 1.3) * (spirit.radius * 0.5);
            const trailAlpha = 1 - (t / 5);
            
            if (trailAlpha > 0.2 && Math.random() > 0.5) {
              setPixel(ctx, trailX, trailY, '#666666');
            }
          }
        }
      };
    }
  },

  'anim-sandstorm': {
    name: "Sandstorm",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#f4e4a6');
        
        // Desert sky with storm
        const stormIntensity = 0.7 + 0.3 * Math.sin(frame * 0.1);
        for (let y = 0; y < 100; y++) {
          for (let x = 0; x < 200; x++) {
            const noise = Math.sin(x * 0.01 + frame * 0.5) * Math.sin(y * 0.02 + frame * 0.3);
            if (Math.random() < stormIntensity * 0.6) {
              const sandColor = RAMPS.sand[Math.floor(Math.random() * RAMPS.sand.length)];
              setPixel(ctx, x, y, sandColor);
            }
          }
        }
        
        // Desert ruins
        for (let i = 0; i < 3; i++) {
          const ruinX = 40 + i * 50;
          const ruinHeight = 30 + Math.random() * 20;
          
          for (let y = 0; y < ruinHeight; y++) {
            for (let x = 0; x < 20; x++) {
              if (Math.random() > 0.3) {
                setPixel(ctx, ruinX + x, 150 - y, RAMPS.sand[2 + Math.floor(Math.random() * 2)]);
              }
            }
          }
        }
        
        // Sand dunes
        drawGround(ctx, 150, 'sand', 'dunes');
        
        // Blowing sand particles
        for (let i = 0; i < 50; i++) {
          const sandX = (i * 15 + frame * 8 + Math.sin(i * 0.5) * 10) % 220 - 10;
          const sandY = 50 + Math.sin(i * 0.7 + frame * 0.3) * 60;
          const sandSpeed = Math.sin(frame * 0.2 + i) * 3;
          
          if (sandX > 0 && sandX < 200 && sandY > 0 && sandY < 200) {
            setPixel(ctx, sandX + sandSpeed, sandY, RAMPS.sand[3]);
          }
        }
        
        // Wind lines
        for (let line = 0; line < 20; line++) {
          const lineY = 30 + line * 7;
          for (let x = 0; x < 180; x += 4) {
            const windX = x + Math.sin(frame * 0.4 + line * 0.5) * 20;
            if (windX > 0 && windX < 200 && Math.random() > 0.7) {
              setPixel(ctx, windX, lineY, '#e6d078');
            }
          }
        }
      };
    }
  },

  'anim-rain-on-cobblestone': {
    name: "Rain on Cobblestone",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#2d2d44');
        
        // Stormy sky
        drawSky(ctx, 'stone', 8, 90);
        
        // Cobblestone street
        drawGround(ctx, 120, 'stone', 'cobblestone');
        
        // Buildings on sides
        for (let side = 0; side < 2; side++) {
          const buildingX = side * 160 + 20;
          for (let y = 60; y < 120; y++) {
            for (let x = 0; x < 20; x++) {
              setPixel(ctx, buildingX + x, y, RAMPS.stone[2 + Math.floor(Math.random() * 2)]);
            }
          }
          
          // Windows
          for (let w = 0; w < 2; w++) {
            const winX = buildingX + 5 + w * 8;
            const winY = 70 + w * 15;
            setPixel(ctx, winX, winY, '#ffff99');
            setPixel(ctx, winX + 1, winY, '#ffff99');
            setPixel(ctx, winX, winY + 1, '#ffff99');
            setPixel(ctx, winX + 1, winY + 1, '#ffff99');
          }
        }
        
        // Rain drops
        for (let i = 0; i < 100; i++) {
          const rainX = (i * 7 + frame * 15) % 200;
          const rainY = (i * 11 + frame * 20) % 150 + 20;
          
          // Rain streak
          setPixel(ctx, rainX, rainY, '#a0c8ff');
          setPixel(ctx, rainX - 1, rainY + 1, '#80a8df');
          setPixel(ctx, rainX - 2, rainY + 2, '#6088bf');
          
          // Splash on ground
          if (rainY > 115) {
            const splashFrame = (frame + i) % 8;
            if (splashFrame < 4) {
              for (let sx = -1; sx <= 1; sx++) {
                setPixel(ctx, rainX + sx, 120, '#ffffff');
              }
            }
          }
        }
        
        // Puddle reflections
        for (let puddle = 0; puddle < 3; puddle++) {
          const puddleX = 30 + puddle * 60;
          for (let x = 0; x < 30; x++) {
            for (let y = 0; y < 8; y++) {
              const reflectY = 125 + y + Math.sin(frame * 0.5 + x * 0.2) * 1;
              if (Math.random() > 0.5) {
                setPixel(ctx, puddleX + x, reflectY, '#4a5a8e');
              }
            }
          }
        }
      };
    }
  },

  'anim-crystal-pulse': {
    name: "Crystal Pulse",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#1a0a2e');
        
        // Crystal cave walls
        drawWalls(ctx, 'crystal', 30, 170);
        drawGround(ctx, 170, 'crystal', 'crystalline');
        
        // Large central crystal formation
        const centerX = 100;
        const centerY = 100;
        const pulsePhase = frame * 0.3;
        const pulseIntensity = 0.5 + 0.5 * Math.sin(pulsePhase);
        
        // Main crystal
        for (let y = -25; y <= 25; y++) {
          for (let x = -15; x <= 15; x++) {
            const dist = Math.sqrt(x*x + (y*2)*(y*2));
            if (dist < 15) {
              const crystalIntensity = pulseIntensity * (1 - dist / 15);
              const colorIndex = Math.floor(crystalIntensity * (RAMPS.crystal.length - 1));
              setPixel(ctx, centerX + x, centerY + y, RAMPS.crystal[Math.max(0, colorIndex)]);
            }
          }
        }
        
        // Surrounding crystal clusters
        const clusters = [
          { x: 50, y: 130, phase: 0 },
          { x: 150, y: 120, phase: 2 },
          { x: 30, y: 80, phase: 4 },
          { x: 170, y: 90, phase: 1 },
          { x: 80, y: 150, phase: 3 },
          { x: 130, y: 160, phase: 5 }
        ];
        
        for (const cluster of clusters) {
          const clusterPulse = 0.3 + 0.7 * Math.sin(pulsePhase + cluster.phase);
          
          // Small crystals in cluster
          for (let c = 0; c < 4; c++) {
            const crystalX = cluster.x + (c % 2) * 6 - 3;
            const crystalY = cluster.y + Math.floor(c / 2) * 8 - 4;
            
            for (let y = 0; y < 8; y++) {
              for (let x = 0; x < 4; x++) {
                const dist = Math.sqrt((x-2)*(x-2) + (y-4)*(y-4));
                if (dist < 3) {
                  const intensity = clusterPulse * (1 - dist / 3);
                  const colorIndex = Math.floor(intensity * (RAMPS.crystal.length - 1));
                  setPixel(ctx, crystalX + x, crystalY + y, RAMPS.crystal[Math.max(0, colorIndex)]);
                }
              }
            }
          }
          
          // Glow around cluster
          for (let gy = -8; gy <= 8; gy++) {
            for (let gx = -8; gx <= 8; gx++) {
              const glowDist = Math.sqrt(gx*gx + gy*gy);
              if (glowDist > 5 && glowDist < 8 && Math.random() < clusterPulse * 0.3) {
                setPixel(ctx, cluster.x + gx, cluster.y + gy, RAMPS.purple[1]);
              }
            }
          }
        }
        
        // Energy particles flowing between crystals
        for (let i = 0; i < 10; i++) {
          const particlePhase = frame * 0.2 + i * 0.6;
          const particleX = 100 + Math.sin(particlePhase) * 60;
          const particleY = 100 + Math.cos(particlePhase * 1.3) * 30;
          
          setPixel(ctx, particleX, particleY, '#ffffff');
          setPixel(ctx, particleX - 1, particleY, RAMPS.crystal[4]);
        }
      };
    }
  },

  'anim-volcanic-smoke': {
    name: "Volcanic Smoke",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#4a0000');
        
        // Volcanic crater rim
        for (let x = 0; x < 200; x++) {
          const rimHeight = 80 + Math.sin(x * 0.02) * 20;
          for (let y = rimHeight; y < 200; y++) {
            if (Math.random() > 0.2) {
              setPixel(ctx, x, y, RAMPS.stone[1 + Math.floor(Math.random() * 2)]);
            }
          }
        }
        
        // Lava pool in crater
        const lavaLevel = 140;
        for (let y = lavaLevel; y < 180; y++) {
          for (let x = 40; x < 160; x++) {
            const bubblePhase = Math.sin(frame * 0.4 + x * 0.05) * Math.sin(y * 0.03);
            let colorIndex = 2;
            if (bubblePhase > 0.3) {
              colorIndex = 4 + Math.floor(Math.random() * 2); // Hot spots
            }
            setPixel(ctx, x, y, RAMPS.lava[colorIndex]);
          }
        }
        
        // Billowing smoke columns
        for (let smokeCol = 0; smokeCol < 4; smokeCol++) {
          const baseX = 60 + smokeCol * 20;
          const smokePhase = frame * 0.3 + smokeCol;
          
          for (let y = 0; y < 100; y++) {
            const smokeY = lavaLevel - y * 2;
            if (smokeY < 0) break;
            
            const windOffset = Math.sin(smokePhase + y * 0.1) * (y * 0.3);
            const smokeWidth = 5 + y * 0.2;
            
            for (let x = -smokeWidth; x < smokeWidth; x++) {
              const smokeX = baseX + x + windOffset;
              const density = Math.sin(frame * 0.4 + smokeCol + y * 0.05) * 0.5 + 0.5;
              
              if (smokeX > 0 && smokeX < 200 && Math.random() < density * 0.7) {
                const smokeIntensity = 1 - (y / 100);
                const grayValue = Math.floor(smokeIntensity * 255);
                const smokeColor = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
                setPixel(ctx, smokeX, smokeY, smokeColor);
              }
            }
          }
        }
        
        // Ash particles
        for (let i = 0; i < 30; i++) {
          const ashX = (50 + i * 7 + frame * 3 + Math.sin(i * 0.3) * 10) % 200;
          const ashY = 150 - (frame * 5 + i * 10) % 140;
          
          if (ashY > 10) {
            const ashColor = Math.random() > 0.5 ? '#666666' : '#999999';
            setPixel(ctx, ashX, ashY, ashColor);
          }
        }
        
        // Volcanic lightning (rare)
        if (frame % 20 === 0 && Math.random() > 0.7) {
          for (let bolt = 0; bolt < 3; bolt++) {
            const boltX = 80 + Math.random() * 40;
            const boltY = 30 + bolt * 15;
            const boltLength = 10 + Math.random() * 15;
            
            for (let b = 0; b < boltLength; b++) {
              const lightX = boltX + Math.random() * 6 - 3;
              const lightY = boltY + b * 2;
              setPixel(ctx, lightX, lightY, '#ffffff');
            }
          }
        }
      };
    }
  }
};

// ============================================================================
// MAIN GENERATION FUNCTIONS
// ============================================================================

async function generateStillBackgrounds() {
  console.log('🎨 Generating 10 new still backgrounds...');
  
  let totalSize = 0;
  let count = 0;
  
  for (const [filename, scene] of Object.entries(stillScenes)) {
    try {
      console.log(`  Creating ${filename}...`);
      
      // Generate at work size
      const { canvas, ctx } = createWorkCanvas();
      scene.generator(ctx);
      
      // Upscale to final size
      const finalCanvas = upscaleCanvas(canvas, 4); // 200->800
      
      // Save PNG
      const outputPath = path.join(STILL_DIR, `${filename}.png`);
      const size = await savePNG(outputPath, finalCanvas);
      
      totalSize += size;
      count++;
      
      console.log(`  ✅ ${filename}.png (${(size/1024).toFixed(1)}KB)`);
      
    } catch (error) {
      console.error(`  ❌ Failed to generate ${filename}:`, error.message);
    }
  }
  
  console.log(`📸 Generated ${count} still backgrounds (${(totalSize/1024/1024).toFixed(2)}MB total)`);
  return { count, totalSize };
}

async function generateAnimatedBackgrounds() {
  console.log('🎞️ Generating 10 new animated GIF backgrounds...');
  
  let totalSize = 0;
  let count = 0;
  
  for (const [filename, scene] of Object.entries(animatedScenes)) {
    try {
      console.log(`  Creating ${filename}...`);
      
      const frames = [];
      
      // Generate all frames
      for (let frame = 0; frame < FRAMES; frame++) {
        const { canvas, ctx } = createWorkCanvas();
        const frameGenerator = scene.generator(frame);
        frameGenerator(ctx);
        
        // Upscale frame
        const upscaledFrame = upscaleCanvas(canvas, 2); // 200->400
        frames.push(upscaledFrame);
      }
      
      // Save GIF
      const outputPath = path.join(GIF_DIR, `${filename}.gif`);
      const size = await saveGIF(outputPath, frames);
      
      totalSize += size;
      count++;
      
      console.log(`  ✅ ${filename}.gif (${(size/1024).toFixed(1)}KB, ${FRAMES} frames)`);
      
    } catch (error) {
      console.error(`  ❌ Failed to generate ${filename}:`, error.message);
    }
  }
  
  console.log(`🎬 Generated ${count} animated backgrounds (${(totalSize/1024/1024).toFixed(2)}MB total)`);
  return { count, totalSize };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🚀 Starting new batch generation for Order of 86...\n');
  
  try {
    // Ensure output directories exist
    await fs.mkdir(STILL_DIR, { recursive: true });
    await fs.mkdir(GIF_DIR, { recursive: true });
    
    // Generate still backgrounds
    const stillResults = await generateStillBackgrounds();
    console.log('');
    
    // Generate animated backgrounds  
    const animatedResults = await generateAnimatedBackgrounds();
    console.log('');
    
    // Summary
    const totalFiles = stillResults.count + animatedResults.count;
    const totalSize = stillResults.totalSize + animatedResults.totalSize;
    
    console.log('📊 GENERATION SUMMARY:');
    console.log(`   Still backgrounds: ${stillResults.count}`);
    console.log(`   Animated backgrounds: ${animatedResults.count}`);
    console.log(`   Total files: ${totalFiles}`);
    console.log(`   Total size: ${(totalSize/1024/1024).toFixed(2)}MB`);
    console.log('');
    console.log('✨ Batch generation complete!');
    
  } catch (error) {
    console.error('💥 Generation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generateStillBackgrounds,
  generateAnimatedBackgrounds
};