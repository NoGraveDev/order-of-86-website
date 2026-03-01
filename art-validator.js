const fs = require('fs');
const path = require('path');
const { createCanvas, createImageData } = require('canvas');
const GIFEncoder = require('gif-encoder-2');

// We need to decode GIFs - use omggif
let omggif;
try { omggif = require('omggif'); } catch(e) {
  console.log('Installing omggif...');
  require('child_process').execSync('npm install omggif', {stdio:'inherit'});
  omggif = require('omggif');
}

const BG_DIR = path.join(__dirname, 'content-bg');
const STILL_DIR = path.join(BG_DIR, 'still');

function analyzeGIF(filepath) {
  const buf = fs.readFileSync(filepath);
  let reader;
  try { reader = new omggif.GifReader(buf); } catch(e) { return null; }
  
  const numFrames = reader.numFrames();
  const w = reader.width, h = reader.height;
  
  let totalUniqueColors = 0;
  let totalPixelChanges = 0;
  let prevPixels = null;
  let allColors = new Set();
  let frameColorCounts = [];
  
  for (let f = 0; f < numFrames; f++) {
    const pixels = new Uint8Array(w * h * 4);
    try { reader.decodeAndBlitFrameRGBA(f, pixels); } catch(e) { continue; }
    
    const frameColors = new Set();
    for (let i = 0; i < pixels.length; i += 4) {
      const key = (pixels[i] << 16) | (pixels[i+1] << 8) | pixels[i+2];
      frameColors.add(key);
      allColors.add(key);
    }
    frameColorCounts.push(frameColors.size);
    
    if (prevPixels) {
      let changes = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] !== prevPixels[i] || pixels[i+1] !== prevPixels[i+1] || pixels[i+2] !== prevPixels[i+2]) {
          changes++;
        }
      }
      totalPixelChanges += changes;
    }
    prevPixels = new Uint8Array(pixels);
  }
  
  const avgColorsPerFrame = frameColorCounts.length > 0 ? frameColorCounts.reduce((a,b)=>a+b,0) / frameColorCounts.length : 0;
  const avgPixelChanges = numFrames > 1 ? totalPixelChanges / (numFrames - 1) : 0;
  
  // Score components
  // Color richness: 0-40 points. 200+ colors = 40, 8 colors = 2
  const colorScore = Math.min(40, (avgColorsPerFrame / 200) * 40);
  
  // Animation: 0-40 points. 500K+ changes = 40, 30K = 2
  const totalPixels = w * h;
  const changeRatio = avgPixelChanges / totalPixels;
  const animScore = Math.min(40, changeRatio * 80);
  
  // Composition/variety: 0-20 points based on total unique colors across all frames
  const compScore = Math.min(20, (allColors.size / 300) * 20);
  
  const score = Math.round(colorScore + animScore + compScore);
  
  return {
    file: path.basename(filepath),
    frames: numFrames,
    avgColorsPerFrame: Math.round(avgColorsPerFrame),
    totalUniqueColors: allColors.size,
    avgPixelChanges: Math.round(avgPixelChanges),
    colorScore: Math.round(colorScore),
    animScore: Math.round(animScore),
    compScore: Math.round(compScore),
    score,
    fileSize: buf.length,
  };
}

function analyzePNG(filepath) {
  const { loadImage } = require('canvas');
  // Sync approach: use canvas to load
  const buf = fs.readFileSync(filepath);
  
  // Simple PNG analysis using raw buffer pixel counting
  // We'll use a simpler approach - check file size as proxy + use canvas
  const fileSize = buf.length;
  
  // For PNGs, score based on file size (larger = more detail) and actual pixel analysis
  // Good PNGs from gen-animated at 400x400 are 50-150KB
  // Good PNGs at 1000x1000 should be even larger
  // Bad PNGs with flat colors compress very small
  
  // File size score: <20KB = bad, >100KB = good
  const sizeScore = Math.min(50, (fileSize / 100000) * 50);
  
  // We can't easily decode PNG synchronously without sharp, so use file size as main metric
  // plus check if it's a reasonable size for 1000x1000
  const score = Math.min(100, Math.round(sizeScore * 2));
  
  return {
    file: path.basename(filepath),
    fileSize,
    score,
    note: fileSize < 20000 ? 'Very small file - likely flat colors' : 'OK',
  };
}

async function main() {
  // Use canvas loadImage for PNGs
  const { loadImage } = require('canvas');
  
  console.log('Analyzing backgrounds...\n');
  const results = [];
  
  // Analyze GIFs
  const gifs = fs.readdirSync(BG_DIR).filter(f => f.endsWith('.gif'));
  for (const gif of gifs) {
    const r = analyzeGIF(path.join(BG_DIR, gif));
    if (r) results.push(r);
  }
  
  // Analyze PNGs (stills)
  if (fs.existsSync(STILL_DIR)) {
    const pngs = fs.readdirSync(STILL_DIR).filter(f => f.endsWith('.png'));
    for (const png of pngs) {
      // For PNGs, do a proper analysis using canvas
      try {
        const img = await loadImage(path.join(STILL_DIR, png));
        const c = createCanvas(img.width, img.height);
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, img.width, img.height).data;
        
        const colors = new Set();
        // Sample every 40th pixel (since upscaled 40x, adjacent pixels are same)
        const step = Math.max(1, Math.floor(img.width / 25));
        let regions = new Set();
        for (let y = 0; y < img.height; y += step) {
          for (let x = 0; x < img.width; x += step) {
            const i = (y * img.width + x) * 4;
            const key = (data[i] << 16) | (data[i+1] << 8) | data[i+2];
            colors.add(key);
            // Region: quantize to 4x4 grid
            const ry = Math.floor(y / (img.height/4));
            const rx = Math.floor(x / (img.width/4));
            regions.add(`${rx},${ry},${data[i]>>5},${data[i+1]>>5},${data[i+2]>>5}`);
          }
        }
        
        const colorScore = Math.min(50, (colors.size / 100) * 50);
        const regionScore = Math.min(50, (regions.size / 40) * 50);
        const score = Math.round(colorScore + regionScore);
        
        results.push({
          file: png,
          type: 'still',
          uniqueColors: colors.size,
          colorScore: Math.round(colorScore),
          regionScore: Math.round(regionScore),
          score,
          fileSize: fs.statSync(path.join(STILL_DIR, png)).size,
        });
      } catch(e) {
        console.error(`Error analyzing ${png}: ${e.message}`);
      }
    }
  }
  
  // Sort worst first
  results.sort((a, b) => a.score - b.score);
  
  // Build report
  let report = `ART QUALITY REPORT\n${'='.repeat(60)}\n`;
  report += `Generated: ${new Date().toISOString()}\n`;
  report += `Total files: ${results.length}\n\n`;
  
  const needsRegen = results.filter(r => r.score < 40);
  report += `FILES NEEDING REGENERATION (score < 40): ${needsRegen.length}\n`;
  report += `${'='.repeat(60)}\n\n`;
  
  for (const r of results) {
    const flag = r.score < 40 ? '❌ NEEDS REGEN' : r.score < 60 ? '⚠️  MEDIOCRE' : '✅ GOOD';
    report += `${flag} | Score: ${String(r.score).padStart(3)} | ${r.file}\n`;
    if (r.avgColorsPerFrame !== undefined) {
      report += `  Colors/frame: ${r.avgColorsPerFrame} | Pixel changes: ${r.avgPixelChanges} | Size: ${(r.fileSize/1024).toFixed(0)}KB\n`;
    } else if (r.uniqueColors !== undefined) {
      report += `  Unique colors: ${r.uniqueColors} | Size: ${(r.fileSize/1024).toFixed(0)}KB\n`;
    }
  }
  
  fs.writeFileSync(path.join(__dirname, 'art-quality-report.txt'), report);
  console.log(report);
  console.log(`\nReport saved to art-quality-report.txt`);
  
  // Also output JSON for programmatic use
  fs.writeFileSync(path.join(__dirname, 'art-quality-report.json'), JSON.stringify(results, null, 2));
}

main().catch(console.error);
