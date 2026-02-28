/**
 * Fix for failing scenes - patch the generator with corrected implementations
 */

const { createCanvas } = require('canvas');
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

const WORK_SIZE = 200;
const STILL_SIZE = 800;
const GIF_SIZE = 400;
const FRAMES = 12;

function createWorkCanvas() {
  const canvas = createCanvas(WORK_SIZE, WORK_SIZE);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}

function upscaleCanvas(sourceCanvas, scale) {
  const targetCanvas = createCanvas(sourceCanvas.width * scale, sourceCanvas.height * scale);
  const targetCtx = targetCanvas.getContext('2d');
  targetCtx.imageSmoothingEnabled = false;
  targetCtx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width * scale, sourceCanvas.height * scale);
  return targetCanvas;
}

async function savePNG(filename, canvas) {
  const buffer = canvas.toBuffer('image/png');
  await fs.writeFile(filename, buffer);
  return buffer.length;
}

// Manual wall drawing function to avoid the leftFeatures issue
function drawSimpleWalls(ctx, ramp, leftWidth = 30, rightWidth = 30) {
  const rampColors = Array.isArray(ramp) ? ramp : RAMPS[ramp];
  
  // Left wall
  for (let x = 0; x < leftWidth; x++) {
    for (let y = 0; y < 200; y++) {
      let colorIndex = 2;
      if (x > leftWidth - 5) colorIndex = 1;
      if (x < 3) colorIndex = 1;
      setPixel(ctx, x, y, rampColors[Math.min(colorIndex, rampColors.length - 1)]);
    }
  }
  
  // Right wall
  for (let x = 200 - rightWidth; x < 200; x++) {
    for (let y = 0; y < 200; y++) {
      let colorIndex = 2;
      if (x < 200 - rightWidth + 5) colorIndex = 1;
      if (x > 196) colorIndex = 1;
      setPixel(ctx, x, y, rampColors[Math.min(colorIndex, rampColors.length - 1)]);
    }
  }
}

// Fixed still scenes
const fixedStillScenes = {
  'scene-deepwell-depths': {
    name: "Deepwell Depths",
    generator: (ctx) => {
      fillBackground(ctx, '#0a0a2e');
      
      // Dark underwater sky
      for (let y = 0; y < 60; y++) {
        for (let x = 0; x < 200; x++) {
          const depth = y / 60;
          const colorIndex = Math.floor(depth * 4);
          setPixel(ctx, x, y, RAMPS.water[colorIndex]);
        }
      }
      
      // Cavern walls using simple method
      drawSimpleWalls(ctx, 'stone', 40, 40);
      
      // Cavern floor
      drawGround(ctx, 160, 'stone', 'cave');
      
      // Bioluminescent crystals
      const crystalColors = ['#00ffff', '#0080ff', '#8000ff', '#ff00ff'];
      for (let i = 0; i < 8; i++) {
        const x = Math.random() * 120 + 40;
        const y = Math.random() * 40 + 120;
        const color = crystalColors[Math.floor(Math.random() * crystalColors.length)];
        
        // Crystal with glow
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
              setPixel(ctx, x + gx + 3, y + gy + 4, color);
            }
          }
        }
      }
      
      // Stalactites
      drawSprite(ctx, 60, 60, stalactite(), 'stone');
      drawSprite(ctx, 120, 50, stalactite(), 'stone');
      drawSprite(ctx, 160, 65, stalactite(), 'stone');
    }
  },

  'scene-crystal-throne': {
    name: "Crystal Throne",
    generator: (ctx) => {
      fillBackground(ctx, '#c9e5ff');
      
      // Ice cave ceiling
      for (let y = 0; y < 50; y++) {
        for (let x = 0; x < 200; x++) {
          const caveShape = Math.sin(x * 0.02) * 20 + 30;
          if (y < caveShape) {
            setPixel(ctx, x, y, RAMPS.ice[Math.floor(Math.random() * 3)]);
          }
        }
      }
      
      // Ice walls using simple method
      drawSimpleWalls(ctx, 'ice', 30, 30);
      
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

  'scene-bone-crypt': {
    name: "Bone Crypt",
    generator: (ctx) => {
      fillBackground(ctx, '#1a0f08');
      
      // Underground ceiling
      for (let y = 0; y < 40; y++) {
        for (let x = 0; x < 200; x++) {
          const ceiling = 40 - Math.abs(Math.sin(x * 0.02)) * 20;
          if (y < ceiling) {
            setPixel(ctx, x, y, RAMPS.stone[0 + Math.floor(Math.random() * 2)]);
          }
        }
      }
      
      // Crypt walls using simple method
      drawSimpleWalls(ctx, 'stone', 35, 35);
      
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
        
        // Sarcophagus lid
        for (let y = 0; y < 8; y++) {
          for (let x = 2; x < 28; x++) {
            setPixel(ctx, sarcX + x, sarcY - 3 + y, RAMPS.stone[3]);
          }
        }
      }
      
      // Scattered bones
      for (let i = 0; i < 15; i++) {
        const boneX = 35 + Math.random() * 130;
        const boneY = 155 + Math.random() * 20;
        setPixel(ctx, boneX, boneY, '#fff8dc');
        setPixel(ctx, boneX + 1, boneY, '#fff8dc');
        if (Math.random() > 0.5) {
          setPixel(ctx, boneX, boneY + 1, '#fff8dc');
        }
      }
      
      // Torch sconces
      drawSprite(ctx, 25, 80, torch());
      drawSprite(ctx, 175, 85, torch());
    }
  }
};

// Fixed animated scenes
function saveGIF(filename, frames) {
  const GIFEncoder = require('gif-encoder-2');
  
  return new Promise((resolve, reject) => {
    const encoder = new GIFEncoder(GIF_SIZE, GIF_SIZE);
    encoder.setDelay(100);
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

const fixedAnimatedScenes = {
  'anim-lava-falls': {
    name: "Lava Falls",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#1a0000');
        
        // Rocky cliff background
        drawSky(ctx, 'lava', 6, 60);
        drawSimpleWalls(ctx, 'stone', 20, 20);
        
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

  'anim-clockwork-gears': {
    name: "Clockwork Gears",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#2a1a00');
        
        // Mechanical background
        drawSimpleWalls(ctx, 'gold', 30, 30);
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
        
        // Ruined walls using simple method
        drawSimpleWalls(ctx, 'stone', 20, 20);
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
        }
      };
    }
  },

  'anim-crystal-pulse': {
    name: "Crystal Pulse",
    generator: (frame) => {
      return (ctx) => {
        fillBackground(ctx, '#1a0a2e');
        
        // Crystal cave walls using simple method
        drawSimpleWalls(ctx, 'crystal', 30, 30);
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
        
        // Energy particles
        for (let i = 0; i < 10; i++) {
          const particlePhase = frame * 0.2 + i * 0.6;
          const particleX = 100 + Math.sin(particlePhase) * 60;
          const particleY = 100 + Math.cos(particlePhase * 1.3) * 30;
          
          setPixel(ctx, particleX, particleY, '#ffffff');
          setPixel(ctx, particleX - 1, particleY, RAMPS.crystal[4]);
        }
      };
    }
  }
};

// Generate the fixed scenes
async function generateFixedScenes() {
  console.log('🔧 Generating fixed scenes...');
  
  const STILL_DIR = path.join(__dirname, 'content-bg', 'still');
  const GIF_DIR = path.join(__dirname, 'content-bg');
  
  let results = { stills: 0, gifs: 0, totalSize: 0 };
  
  // Generate fixed still backgrounds
  for (const [filename, scene] of Object.entries(fixedStillScenes)) {
    try {
      console.log(`  Fixing ${filename}...`);
      
      const { canvas, ctx } = createWorkCanvas();
      scene.generator(ctx);
      
      const finalCanvas = upscaleCanvas(canvas, 4);
      const outputPath = path.join(STILL_DIR, `${filename}.png`);
      const size = await savePNG(outputPath, finalCanvas);
      
      results.stills++;
      results.totalSize += size;
      
      console.log(`  ✅ ${filename}.png (${(size/1024).toFixed(1)}KB)`);
    } catch (error) {
      console.error(`  ❌ Failed to fix ${filename}:`, error.message);
    }
  }
  
  // Generate fixed animated backgrounds
  for (const [filename, scene] of Object.entries(fixedAnimatedScenes)) {
    try {
      console.log(`  Fixing ${filename}...`);
      
      const frames = [];
      for (let frame = 0; frame < FRAMES; frame++) {
        const { canvas, ctx } = createWorkCanvas();
        const frameGenerator = scene.generator(frame);
        frameGenerator(ctx);
        const upscaledFrame = upscaleCanvas(canvas, 2);
        frames.push(upscaledFrame);
      }
      
      const outputPath = path.join(GIF_DIR, `${filename}.gif`);
      const size = await saveGIF(outputPath, frames);
      
      results.gifs++;
      results.totalSize += size;
      
      console.log(`  ✅ ${filename}.gif (${(size/1024).toFixed(1)}KB, ${FRAMES} frames)`);
    } catch (error) {
      console.error(`  ❌ Failed to fix ${filename}:`, error.message);
    }
  }
  
  console.log(`\n🎨 Fixed scenes summary:`);
  console.log(`   Still backgrounds: ${results.stills}`);
  console.log(`   Animated backgrounds: ${results.gifs}`);
  console.log(`   Total size: ${(results.totalSize/1024/1024).toFixed(2)}MB`);
  
  return results;
}

if (require.main === module) {
  generateFixedScenes().catch(console.error);
}

module.exports = { generateFixedScenes };