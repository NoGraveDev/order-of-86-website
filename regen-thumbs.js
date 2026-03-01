const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
let omggif;
try { omggif = require('omggif'); } catch(e) {
  require('child_process').execSync('npm install omggif', {stdio:'inherit'});
  omggif = require('omggif');
}

const BG_DIR = path.join(__dirname, 'content-bg');
const STILL_DIR = path.join(BG_DIR, 'still');
const THUMB_DIR = path.join(BG_DIR, 'thumbs');
const THUMB_SIZE = 120;

if (!fs.existsSync(THUMB_DIR)) fs.mkdirSync(THUMB_DIR, { recursive: true });

// Get list of files that were regenerated
const regenGifs = [
  'anim-flame-volcano-range.gif', 'anim-flame-lava-valley.gif', 'anim-flame-smoldering-peaks.gif',
  'anim-flame-ash-clouds.gif', 'anim-radiant-golden-peaks.gif', 'anim-radiant-sun-ridges.gif',
  'anim-radiant-wheat-mountains.gif', 'anim-sunrise-over-aurelius.gif', 'anim-deep-coastal-cliffs.gif',
  'anim-deep-ocean-trench.gif', 'anim-deep-underwater-ridge.gif', 'anim-deep-tidal-waves.gif',
  'anim-wild-forest-canopy.gif', 'anim-wild-mossy-range.gif', 'anim-wild-jungle-valley.gif',
  'anim-arcane-crystal-mountains.gif', 'anim-arcane-floating-peaks.gif', 'anim-arcane-ruins-peaks.gif',
  'anim-heart-cherry-blossom-hills.gif', 'anim-heart-flower-mountains.gif', 'anim-heart-peaceful-valley.gif',
  'anim-springtime-bondsheart.gif', 'anim-sunny-meadow-fireflies.gif', 'anim-crystal-clear-lake.gif',
  'anim-rainbow-over-roothold.gif', 'anim-sunny-wizard-tower.gif', 'anim-golden-wheat-fields.gif',
  'anim-bright-aurora-moons.gif', 'anim-sunlit-forest-clearing.gif', 'anim-crystal-lizard-sunbathing.gif',
  'anim-wizard-dog-park.gif', 'anim-owls-in-sunny-tree.gif', 'anim-sparkling-river.gif',
  'anim-magic-garden-butterflies.gif', 'anim-seven-moons-rising.gif', 'anim-happy-crystal-cave.gif',
  'anim-sunny-dock-morning.gif', 'anim-enchanted-meadow-dawn.gif', 'anim-cheerful-windmill.gif',
  'anim-golden-hour-forest.gif', 'anim-northern-lights.gif', 'anim-spirit-wisps.gif',
  'anim-clockwork-gears.gif', 'anim-crystal-pulse.gif', 'anim-whirlpool.gif',
];

const regenStills = [
  'scene-wizard-dog-park.png', 'scene-bondsheart-spring.png', 'scene-enchanted-meadow.png',
  'scene-sparkling-river.png', 'scene-crystal-lizard-rock.png',
];

function gifThumb(gifFile) {
  const buf = fs.readFileSync(path.join(BG_DIR, gifFile));
  const reader = new omggif.GifReader(buf);
  const w = reader.width, h = reader.height;
  const pixels = new Uint8Array(w * h * 4);
  reader.decodeAndBlitFrameRGBA(0, pixels);
  
  // Create canvas from first frame
  const src = createCanvas(w, h);
  const sctx = src.getContext('2d');
  const imgData = sctx.createImageData(w, h);
  imgData.data.set(pixels);
  sctx.putImageData(imgData, 0, 0);
  
  // Nearest-neighbor downscale to 120x120
  const thumb = createCanvas(THUMB_SIZE, THUMB_SIZE);
  const tctx = thumb.getContext('2d');
  tctx.imageSmoothingEnabled = false;
  tctx.drawImage(src, 0, 0, THUMB_SIZE, THUMB_SIZE);
  
  // Check if thumb should be PNG or GIF - use PNG for consistency
  const thumbName = gifFile.replace('.gif', '-thumb.png');
  // But check if the old thumb was just the gif name
  const possibleNames = [thumbName, gifFile];
  
  fs.writeFileSync(path.join(THUMB_DIR, gifFile), thumb.toBuffer('image/png'));
  console.log(`✅ Thumb: ${gifFile}`);
}

async function stillThumb(pngFile) {
  const img = await loadImage(path.join(STILL_DIR, pngFile));
  const thumb = createCanvas(THUMB_SIZE, THUMB_SIZE);
  const tctx = thumb.getContext('2d');
  tctx.imageSmoothingEnabled = false;
  tctx.drawImage(img, 0, 0, THUMB_SIZE, THUMB_SIZE);
  
  fs.writeFileSync(path.join(THUMB_DIR, pngFile), thumb.toBuffer('image/png'));
  console.log(`✅ Thumb: ${pngFile}`);
}

async function main() {
  console.log('Regenerating thumbnails...\n');
  
  for (const gif of regenGifs) {
    try { gifThumb(gif); } catch(e) { console.error(`Failed: ${gif}: ${e.message}`); }
  }
  
  for (const png of regenStills) {
    try { await stillThumb(png); } catch(e) { console.error(`Failed: ${png}: ${e.message}`); }
  }
  
  console.log('\nDone!');
}

main();
