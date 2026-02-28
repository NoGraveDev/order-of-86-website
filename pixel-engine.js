/**
 * Professional Pixel Art Rendering Engine
 * 
 * Implements proper pixel art techniques:
 * - Discrete color ramps (no smooth gradients)
 * - Hand-crafted sprites with outlines and highlights
 * - Dithering for color transitions
 * - Proper depth layering and lighting
 */

const { createCanvas, createImageData } = require('canvas');

// ============================================================================
// COLOR RAMP SYSTEM
// ============================================================================

const RAMPS = {
  stone: ['#1a1a2e', '#2d2d44', '#44445a', '#5e5e74', '#78788e'],
  lava: ['#1a0000', '#4a0000', '#8b0000', '#ff4500', '#ff8c00', '#ffd700'],
  forest: ['#0a1a0a', '#1a3a1a', '#2a5a2a', '#3a7a3a', '#5a9a5a', '#7aba7a'],
  water: ['#0a0a2e', '#1a1a4e', '#2a3a6e', '#3a5a8e', '#4a7aae', '#6a9ace'],
  purple: ['#1a0a2e', '#2a1a4e', '#4a2a6e', '#6a3a8e', '#8a5aae', '#aa7ace'],
  gold: ['#2a1a00', '#5a3a00', '#8a6a10', '#ba9a30', '#dab050', '#ffd700'],
  pink: ['#2a0a1a', '#4a1a3a', '#6a2a5a', '#8a3a7a', '#aa5a9a', '#ca7aba'],
  sky_night: ['#050510', '#0a0a20', '#101030', '#161640', '#1c1c50'],
  sky_sunset: ['#1a0a00', '#3a1a10', '#5a2a20', '#8a4a30', '#ba6a40', '#da8a50'],
  wood: ['#1a0f08', '#2e1f14', '#3e2f1e', '#5a4530', '#6e5a42'],
  flesh: ['#2a1a1a', '#4a3030', '#6a4a3a', '#8a6a50', '#aa8a6a'],
  ice: ['#c9e5ff', '#a0d2ff', '#7bb8e8', '#5a9bd4', '#3e82c7'],
  rot: ['#2a1a0a', '#4a3520', '#6a4a30', '#5a2a1a', '#7a3a2a'],
  sand: ['#f4e4a6', '#e6d078', '#d4b942', '#c4a632', '#b8941a'],
  crystal: ['#ff99ff', '#cc66cc', '#994499', '#663366', '#442244']
};

// Helper function to get color from ramp
function getRampColor(ramp, index) {
  if (Array.isArray(ramp)) {
    return ramp[Math.min(index, ramp.length - 1)];
  }
  return RAMPS[ramp] ? RAMPS[ramp][Math.min(index, RAMPS[ramp].length - 1)] : '#ffffff';
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function setPixel(ctx, x, y, color) {
  if (x < 0 || y < 0 || x >= 200 || y >= 200) return;
  
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

// BUG FIX 1: Add fillBackground utility to prevent black lines at horizon
function fillBackground(ctx, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 200, 200);
}

function drawSprite(ctx, x, y, sprite, ramp = null) {
  for (let sy = 0; sy < sprite.length; sy++) {
    for (let sx = 0; sx < sprite[sy].length; sx++) {
      const cell = sprite[sy][sx];
      if (cell === null) continue; // transparent
      
      let color;
      if (typeof cell === 'string') {
        color = cell; // direct hex color
      } else if (typeof cell === 'number' && ramp) {
        color = getRampColor(ramp, cell);
      } else {
        continue; // skip invalid cells
      }
      
      setPixel(ctx, x + sx, y + sy, color);
    }
  }
}

// ============================================================================
// DITHERING FUNCTIONS
// ============================================================================

function ditherFill(ctx, x, y, w, h, color1, color2, pattern = 'checkerboard') {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      let useColor1 = false;
      
      switch (pattern) {
        case 'checkerboard':
          useColor1 = (dx + dy) % 2 === 0;
          break;
        case '33':
          useColor1 = (dx + dy * 3) % 3 !== 0;
          break;
        case 'horizontal':
          useColor1 = dy % 2 === 0;
          break;
        case 'vertical':
          useColor1 = dx % 2 === 0;
          break;
      }
      
      setPixel(ctx, x + dx, y + dy, useColor1 ? color1 : color2);
    }
  }
}

// BUG FIX 3: Improved dithering - less aggressive, more selective
function ditherGradient(ctx, x, y1, y2, w, ramp, ditherStrength = 0.33) {
  const rampColors = Array.isArray(ramp) ? ramp : RAMPS[ramp];
  if (!rampColors) return;
  
  const height = y2 - y1;
  for (let dy = 0; dy < height; dy++) {
    const progress = dy / height;
    const rampPos = progress * (rampColors.length - 1);
    const rampIndex = Math.floor(rampPos);
    const rampFrac = rampPos - rampIndex;
    
    const color1 = rampColors[Math.min(rampIndex, rampColors.length - 1)];
    const color2 = rampColors[Math.min(rampIndex + 1, rampColors.length - 1)];
    
    // Only use dithering in transition zones
    const isTransitionZone = rampFrac > 0.2 && rampFrac < 0.8;
    const colorDifference = Math.abs(rampIndex - (rampIndex + 1));
    
    for (let dx = 0; dx < w; dx++) {
      let useColor1 = rampFrac < 0.5;
      
      // Apply dithering only if in transition zone and colors differ significantly
      if (isTransitionZone && colorDifference > 0 && color1 !== color2) {
        const ditherPattern = (dx + dy) % 2 === 0;
        const shouldDither = Math.random() < ditherStrength;
        
        if (shouldDither) {
          useColor1 = ditherPattern ? (rampFrac < 0.67) : (rampFrac < 0.33);
        }
      }
      
      setPixel(ctx, x + dx, y1 + dy, useColor1 ? color1 : color2);
    }
  }
}

// ============================================================================
// SPRITE LIBRARY
// ============================================================================

function tree_pine(height = 24, ramp = 'forest') {
  const sprite = [];
  const width = Math.max(12, Math.floor(height * 0.6));
  const trunkHeight = Math.floor(height * 0.25);
  const crownHeight = height - trunkHeight;
  
  // Initialize sprite
  for (let y = 0; y < height; y++) {
    sprite[y] = new Array(width).fill(null);
  }
  
  const centerX = Math.floor(width / 2);
  
  // Draw crown (layers of triangular sections)
  for (let layer = 0; layer < 3; layer++) {
    const layerTop = layer * Math.floor(crownHeight / 3);
    const layerHeight = Math.floor(crownHeight / 2.5);
    const layerWidth = Math.max(3, width - layer * 2);
    
    for (let y = 0; y < layerHeight; y++) {
      const treeWidth = Math.max(1, Math.floor((layerHeight - y) * layerWidth / layerHeight));
      for (let x = 0; x < treeWidth; x++) {
        const pixelX = centerX - Math.floor(treeWidth / 2) + x;
        if (pixelX >= 0 && pixelX < width) {
          // Vary shades for depth
          let shadeIndex = 2;
          if (x === 0 || x === treeWidth - 1) shadeIndex = 1; // outline
          if (x === treeWidth - 2 && y < layerHeight / 2) shadeIndex = 3; // highlight
          
          sprite[layerTop + y][pixelX] = shadeIndex;
        }
      }
    }
  }
  
  // Draw trunk
  const trunkWidth = Math.max(2, Math.floor(width * 0.15));
  for (let y = crownHeight; y < height; y++) {
    for (let x = 0; x < trunkWidth; x++) {
      const pixelX = centerX - Math.floor(trunkWidth / 2) + x;
      if (pixelX >= 0 && pixelX < width) {
        sprite[y][pixelX] = x === 0 ? 0 : (x === trunkWidth - 1 ? 1 : 2); // Use wood colors
      }
    }
  }
  
  return sprite;
}

function tree_oak(height = 20, ramp = 'forest') {
  const sprite = [];
  const width = Math.max(16, Math.floor(height * 0.8));
  const trunkHeight = Math.floor(height * 0.3);
  const crownHeight = height - trunkHeight;
  
  // Initialize sprite
  for (let y = 0; y < height; y++) {
    sprite[y] = new Array(width).fill(null);
  }
  
  const centerX = Math.floor(width / 2);
  
  // Draw round crown
  const crownRadius = Math.floor(width / 2) - 1;
  for (let y = 0; y < crownHeight; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - crownHeight / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= crownRadius) {
        let shadeIndex = 2;
        if (dist >= crownRadius - 0.5) shadeIndex = 1; // outline
        if (dx > 0 && dy < 0 && dist < crownRadius * 0.7) shadeIndex = 3; // highlight
        
        sprite[y][x] = shadeIndex;
      }
    }
  }
  
  // Draw trunk
  const trunkWidth = Math.max(3, Math.floor(width * 0.2));
  for (let y = crownHeight; y < height; y++) {
    for (let x = 0; x < trunkWidth; x++) {
      const pixelX = centerX - Math.floor(trunkWidth / 2) + x;
      if (pixelX >= 0 && pixelX < width) {
        sprite[y][pixelX] = x === 0 ? 0 : (x === trunkWidth - 1 ? 1 : 2);
      }
    }
  }
  
  return sprite;
}

function tree_dead(height = 18) {
  const sprite = [];
  const width = Math.max(12, Math.floor(height * 0.6));
  const trunkHeight = Math.floor(height * 0.7);
  
  for (let y = 0; y < height; y++) {
    sprite[y] = new Array(width).fill(null);
  }
  
  const centerX = Math.floor(width / 2);
  
  // Draw main trunk
  const trunkWidth = Math.max(2, Math.floor(width * 0.15));
  for (let y = height - trunkHeight; y < height; y++) {
    for (let x = 0; x < trunkWidth; x++) {
      const pixelX = centerX - Math.floor(trunkWidth / 2) + x;
      if (pixelX >= 0 && pixelX < width) {
        sprite[y][pixelX] = x === 0 ? '#2a2a2a' : (x === trunkWidth - 1 ? '#1a1a1a' : '#3a3a3a');
      }
    }
  }
  
  // Add a few bare branches
  const branchY = height - Math.floor(trunkHeight * 0.7);
  if (branchY > 0) {
    // Left branch
    for (let x = centerX - 4; x < centerX; x++) {
      if (x >= 0) sprite[branchY][x] = '#2a2a2a';
    }
    // Right branch
    for (let x = centerX + 1; x < centerX + 5 && x < width; x++) {
      sprite[branchY + 1][x] = '#2a2a2a';
    }
  }
  
  return sprite;
}

function rock_cluster(size = 12, ramp = 'stone') {
  const sprite = [];
  for (let y = 0; y < size; y++) {
    sprite[y] = new Array(size).fill(null);
  }
  
  // Create irregular rock shape
  const centerX = size / 2;
  const centerY = size / 2;
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const noise = Math.sin(x * 0.8) * Math.cos(y * 0.6) * 0.8;
      
      if (dist + noise < size / 2.2) {
        let shadeIndex = 2;
        if (dist + noise >= size / 2.2 - 1) shadeIndex = 1; // outline
        if (x > centerX && y < centerY) shadeIndex = 3; // highlight
        if (x < centerX && y > centerY) shadeIndex = 1; // shadow
        
        sprite[y][x] = shadeIndex;
      }
    }
  }
  
  return sprite;
}

function crystal(height = 16, color = '#9966ff') {
  const sprite = [];
  const width = Math.max(8, Math.floor(height * 0.5));
  
  for (let y = 0; y < height; y++) {
    sprite[y] = new Array(width).fill(null);
  }
  
  const centerX = Math.floor(width / 2);
  const tipHeight = Math.floor(height * 0.3);
  const bodyHeight = height - tipHeight;
  
  // Draw crystal tip
  for (let y = 0; y < tipHeight; y++) {
    const crystalWidth = Math.max(1, Math.floor((tipHeight - y) * width / tipHeight));
    for (let x = 0; x < crystalWidth; x++) {
      const pixelX = centerX - Math.floor(crystalWidth / 2) + x;
      if (pixelX >= 0 && pixelX < width) {
        if (x === 0 || x === crystalWidth - 1) {
          sprite[y][pixelX] = '#663399'; // outline
        } else if (x === 1) {
          sprite[y][pixelX] = '#bb99ff'; // highlight
        } else {
          sprite[y][pixelX] = color;
        }
      }
    }
  }
  
  // Draw crystal body
  for (let y = tipHeight; y < height; y++) {
    const crystalWidth = Math.floor(width * 0.8);
    for (let x = 0; x < crystalWidth; x++) {
      const pixelX = centerX - Math.floor(crystalWidth / 2) + x;
      if (pixelX >= 0 && pixelX < width) {
        if (x === 0 || x === crystalWidth - 1) {
          sprite[y][pixelX] = '#663399'; // outline
        } else if (x === 1) {
          sprite[y][pixelX] = '#bb99ff'; // highlight
        } else {
          sprite[y][pixelX] = color;
        }
      }
    }
  }
  
  return sprite;
}

function torch(frame = 0) {
  const sprite = [
    [null, null, null, '#ff4400', '#ff6600', null, null, null],
    [null, null, '#ff6600', '#ff8800', '#ffaa00', '#ff6600', null, null],
    [null, '#ff6600', '#ff8800', '#ffcc00', '#ffdd00', '#ff8800', '#ff6600', null],
    [null, '#ff4400', '#ff8800', '#ffcc00', '#ffdd00', '#ff8800', '#ff4400', null],
    [null, null, '#ff6600', '#ff8800', '#ff8800', '#ff6600', null, null],
    [null, null, null, '#6a4530', '#6a4530', null, null, null],
    [null, null, null, '#5a4530', '#6a4530', null, null, null],
    [null, null, null, '#4a3520', '#5a4530', null, null, null],
    [null, null, null, '#3a2510', '#4a3520', null, null, null],
    [null, null, null, '#2a1500', '#3a2510', null, null, null]
  ];
  return sprite;
}

// BUG FIX 2: Improved bookshelf with randomized book heights, widths, gaps, and colors
function bookshelf(height = 20) {
  const sprite = [];
  const width = 16;
  
  for (let y = 0; y < height; y++) {
    sprite[y] = new Array(width).fill(null);
  }
  
  const shelfHeight = Math.floor(height / 4);
  // Expanded color palette with more variety
  const bookColors = [
    '#ff4444', '#4444ff', '#44ff44', '#ffff44', '#ff44ff', '#44ffff',
    '#ff8800', '#8844ff', '#88ff44', '#ff4488', '#4488ff', '#88ff88',
    '#cc4444', '#4444cc', '#44cc44', '#cccc44', '#cc44cc', '#44cccc',
    '#aa2222', '#2222aa', '#22aa22', '#aaaa22', '#aa22aa', '#22aaaa'
  ];
  
  for (let shelf = 0; shelf < 4; shelf++) {
    const shelfY = shelf * shelfHeight;
    
    // Draw shelf wood
    for (let x = 0; x < width; x++) {
      sprite[shelfY][x] = '#6a4530';
      if (shelfY + 1 < height) sprite[shelfY + 1][x] = '#5a4530';
    }
    
    // Draw randomized books
    if (shelfY + 3 < height) {
      let bookX = 1;
      const maxBooks = 3 + Math.floor(Math.random() * 4); // 3-6 books per shelf
      
      for (let book = 0; book < maxBooks && bookX < width - 2; book++) {
        // Random book width (1-3 pixels)
        const bookWidth = 1 + Math.floor(Math.random() * 3);
        // Random book height variation
        const baseHeight = shelfHeight - 3;
        const heightVariation = Math.floor(Math.random() * (baseHeight / 2));
        const bookHeight = Math.max(2, baseHeight - heightVariation);
        const bookStartY = shelfY + shelfHeight - 1 - bookHeight;
        
        // Random color from expanded palette
        const bookColor = bookColors[Math.floor(Math.random() * bookColors.length)];
        
        // Draw the book
        for (let bw = 0; bw < bookWidth && bookX + bw < width - 1; bw++) {
          for (let bh = 0; bh < bookHeight; bh++) {
            const drawY = bookStartY + bh;
            if (drawY >= shelfY + 2 && drawY < shelfY + shelfHeight) {
              // Add some shading - left edge darker, right edge lighter
              let pixelColor = bookColor;
              if (bw === 0 && bookWidth > 1) {
                // Darken left edge
                pixelColor = bookColor.replace(/#(..)(..)(..)/, (match, r, g, b) => {
                  return '#' + 
                    Math.max(0, parseInt(r, 16) - 20).toString(16).padStart(2, '0') +
                    Math.max(0, parseInt(g, 16) - 20).toString(16).padStart(2, '0') +
                    Math.max(0, parseInt(b, 16) - 20).toString(16).padStart(2, '0');
                });
              }
              sprite[drawY][bookX + bw] = pixelColor;
            }
          }
        }
        
        bookX += bookWidth;
        
        // Occasional gaps between books
        if (Math.random() < 0.4 && bookX < width - 2) {
          bookX += 1; // Add gap
        }
      }
    }
  }
  
  return sprite;
}

function pillar(height = 30, ramp = 'stone') {
  const sprite = [];
  const width = 12;
  
  for (let y = 0; y < height; y++) {
    sprite[y] = new Array(width).fill(null);
  }
  
  // Draw pillar body
  for (let y = 2; y < height - 2; y++) {
    for (let x = 1; x < width - 1; x++) {
      let shadeIndex = 2;
      if (x === 1 || x === width - 2) shadeIndex = 1; // sides
      if (x === 2) shadeIndex = 3; // highlight
      if (x >= width - 3) shadeIndex = 1; // shadow
      
      sprite[y][x] = shadeIndex;
    }
  }
  
  // Draw capital and base
  for (let capY = 0; capY < 2; capY++) {
    for (let x = 0; x < width; x++) {
      sprite[capY][x] = x < 2 || x >= width - 2 ? 1 : 2;
      sprite[height - 1 - capY][x] = x < 2 || x >= width - 2 ? 1 : 2;
    }
  }
  
  return sprite;
}

function window_arch(ramp = 'stone', glowColor = '#ffddaa') {
  const sprite = [];
  const width = 20;
  const height = 24;
  
  for (let y = 0; y < height; y++) {
    sprite[y] = new Array(width).fill(null);
  }
  
  const centerX = width / 2;
  const archRadius = 8;
  const windowTop = 4;
  
  // Draw arch outline
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - (windowTop + archRadius);
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (y >= windowTop) {
        if (y < windowTop + archRadius) {
          // Arch part
          if (dist >= archRadius - 2 && dist <= archRadius) {
            sprite[y][x] = 1; // stone outline
          } else if (dist < archRadius - 2) {
            sprite[y][x] = glowColor; // window glow
          }
        } else {
          // Rectangular part
          if ((x >= centerX - archRadius && x <= centerX - archRadius + 2) ||
              (x >= centerX + archRadius - 2 && x <= centerX + archRadius)) {
            sprite[y][x] = 1; // stone sides
          } else if (x > centerX - archRadius + 2 && x < centerX + archRadius - 2) {
            sprite[y][x] = glowColor; // window glow
          }
        }
      }
    }
  }
  
  return sprite;
}

function banner(color = '#ff4444', length = 20) {
  const sprite = [];
  const width = 8;
  const height = length;
  
  for (let y = 0; y < height; y++) {
    sprite[y] = new Array(width).fill(null);
  }
  
  // Draw banner rod
  for (let x = 0; x < width; x++) {
    sprite[0][x] = '#8a6a50';
  }
  
  // Draw banner fabric
  for (let y = 1; y < height - 2; y++) {
    for (let x = 0; x < width; x++) {
      if (x === 0 || x === width - 1) {
        sprite[y][x] = color; // edges
      } else {
        const brightness = 1.0 + 0.1 * Math.sin(y * 0.3); // subtle shading
        sprite[y][x] = color;
      }
    }
  }
  
  // Draw pointed bottom
  const bottomY = height - 2;
  for (let x = 1; x < width - 1; x++) {
    sprite[bottomY][x] = color;
  }
  sprite[height - 1][Math.floor(width / 2)] = color;
  
  return sprite;
}

function mushroom(size = 10, ramp = 'forest') {
  const sprite = [];
  const width = size;
  const height = size;
  
  for (let y = 0; y < height; y++) {
    sprite[y] = new Array(width).fill(null);
  }
  
  const centerX = Math.floor(width / 2);
  const capHeight = Math.floor(height * 0.6);
  const stemHeight = height - capHeight;
  
  // Draw cap
  for (let y = 0; y < capHeight; y++) {
    const capWidth = Math.max(1, Math.floor((capHeight - y) * width / capHeight));
    for (let x = 0; x < capWidth; x++) {
      const pixelX = centerX - Math.floor(capWidth / 2) + x;
      if (pixelX >= 0 && pixelX < width) {
        let shadeIndex = 2;
        if (x === 0 || x === capWidth - 1) shadeIndex = 1;
        if (x === 1 && y < capHeight / 2) shadeIndex = 3;
        
        sprite[y][pixelX] = shadeIndex;
      }
    }
  }
  
  // Draw stem
  const stemWidth = Math.max(2, Math.floor(width * 0.3));
  for (let y = capHeight; y < height; y++) {
    for (let x = 0; x < stemWidth; x++) {
      const pixelX = centerX - Math.floor(stemWidth / 2) + x;
      if (pixelX >= 0 && pixelX < width) {
        sprite[y][pixelX] = x === 0 ? '#f0f0e0' : (x === stemWidth - 1 ? '#d0d0c0' : '#e0e0d0');
      }
    }
  }
  
  return sprite;
}

function stalactite(length = 16, ramp = 'stone') {
  const sprite = [];
  const width = Math.max(4, Math.floor(length * 0.3));
  const height = length;
  
  for (let y = 0; y < height; y++) {
    sprite[y] = new Array(width).fill(null);
  }
  
  const centerX = Math.floor(width / 2);
  
  for (let y = 0; y < height; y++) {
    const stalaWidth = Math.max(1, width - Math.floor(y * width / height));
    for (let x = 0; x < stalaWidth; x++) {
      const pixelX = centerX - Math.floor(stalaWidth / 2) + x;
      if (pixelX >= 0 && pixelX < width) {
        let shadeIndex = 2;
        if (x === 0 || x === stalaWidth - 1) shadeIndex = 1;
        if (x === 1 && stalaWidth > 3) shadeIndex = 3;
        
        sprite[y][pixelX] = shadeIndex;
      }
    }
  }
  
  return sprite;
}

function fence_post(height = 12) {
  const sprite = [];
  const width = 4;
  
  for (let y = 0; y < height; y++) {
    sprite[y] = new Array(width).fill(null);
  }
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      sprite[y][x] = x === 0 ? '#3e2f1e' : (x === width - 1 ? '#2e1f14' : '#5a4530');
    }
  }
  
  return sprite;
}

function cauldron() {
  const sprite = [
    [null, null, '#8a6a50', '#8a6a50', '#8a6a50', '#8a6a50', null, null],
    [null, '#6a4530', '#44ff44', '#66ff66', '#66ff66', '#44ff44', '#6a4530', null],
    ['#6a4530', '#44ff44', '#88ff88', '#aaffaa', '#aaffaa', '#88ff88', '#44ff44', '#6a4530'],
    ['#6a4530', '#66ff66', '#aaffaa', '#ccffcc', '#ccffcc', '#aaffaa', '#66ff66', '#6a4530'],
    ['#6a4530', '#66ff66', '#aaffaa', '#ccffcc', '#ccffcc', '#aaffaa', '#66ff66', '#6a4530'],
    ['#6a4530', '#44ff44', '#88ff88', '#aaffaa', '#aaffaa', '#88ff88', '#44ff44', '#6a4530'],
    [null, '#5a4530', '#6a4530', '#6a4530', '#6a4530', '#6a4530', '#5a4530', null],
    [null, null, '#4a3520', '#5a4530', '#5a4530', '#4a3520', null, null]
  ];
  return sprite;
}

function lantern(color = '#ffddaa') {
  const sprite = [
    [null, null, '#8a6a50', '#8a6a50', null, null],
    [null, '#6a4530', color, color, '#6a4530', null],
    ['#6a4530', color, color, color, color, '#6a4530'],
    ['#6a4530', color, color, color, color, '#6a4530'],
    ['#6a4530', color, color, color, color, '#6a4530'],
    ['#6a4530', color, color, color, color, '#6a4530'],
    [null, '#6a4530', '#6a4530', '#6a4530', '#6a4530', null]
  ];
  return sprite;
}

// ============================================================================
// SCENE COMPOSITION FUNCTIONS
// ============================================================================

// BUG FIX 1: Updated drawSky to fill entire canvas height by default
function drawSky(ctx, ramp = 'sky_night', starDensity = 20, groundStartY = 200) {
  const rampColors = Array.isArray(ramp) ? ramp : RAMPS[ramp];
  if (!rampColors) return;
  
  // Draw sky gradient using dithering - fill to ground start or canvas bottom
  ditherGradient(ctx, 0, 0, groundStartY, 200, rampColors);
  
  // Add stars if it's a night sky
  if (ramp === 'sky_night' && starDensity > 0) {
    for (let i = 0; i < starDensity; i++) {
      const x = Math.floor(Math.random() * 200);
      const y = Math.floor(Math.random() * Math.min(80, groundStartY)); // Only in upper sky
      const brightness = Math.random();
      
      if (brightness > 0.7) {
        setPixel(ctx, x, y, '#ffffff');
      } else if (brightness > 0.4) {
        setPixel(ctx, x, y, '#cccccc');
      }
    }
  }
}

function drawGround(ctx, yStart, ramp = 'stone', texture = 'rough') {
  const rampColors = Array.isArray(ramp) ? ramp : RAMPS[ramp];
  if (!rampColors) return;
  
  for (let y = yStart; y < 200; y++) {
    for (let x = 0; x < 200; x++) {
      let colorIndex = 2; // base color
      
      // Add texture variation
      switch (texture) {
        case 'rough':
          const noise = Math.sin(x * 0.3) * Math.cos(y * 0.2) * 0.5 + 
                       Math.sin(x * 0.7) * Math.cos(y * 0.5) * 0.3;
          if (noise > 0.3) colorIndex = 3;
          if (noise < -0.3) colorIndex = 1;
          break;
        case 'cobblestone':
          const cobbleX = Math.floor(x / 4);
          const cobbleY = Math.floor((y - yStart) / 4);
          if ((cobbleX + cobbleY) % 2 === 0) colorIndex = 1;
          break;
        case 'smooth':
          // Minimal variation
          if ((x + y) % 8 === 0) colorIndex = 1;
          break;
      }
      
      const color = rampColors[Math.min(colorIndex, rampColors.length - 1)];
      setPixel(ctx, x, y, color);
    }
  }
}

function drawWalls(ctx, ramp = 'stone', leftFeatures = [], rightFeatures = []) {
  const rampColors = Array.isArray(ramp) ? ramp : RAMPS[ramp];
  if (!rampColors) return;
  
  // Draw left wall (0-66)
  for (let x = 0; x < 67; x++) {
    for (let y = 0; y < 200; y++) {
      let colorIndex = 2;
      if (x > 60) colorIndex = 1; // darker as we approach the center
      if (x < 3) colorIndex = 1; // edge outline
      if (x === 10 && y % 10 === 0) colorIndex = 3; // highlight details
      
      const color = rampColors[Math.min(colorIndex, rampColors.length - 1)];
      setPixel(ctx, x, y, color);
    }
  }
  
  // Draw right wall (134-199)
  for (let x = 133; x < 200; x++) {
    for (let y = 0; y < 200; y++) {
      let colorIndex = 2;
      if (x < 140) colorIndex = 1; // darker as we approach the center
      if (x > 196) colorIndex = 1; // edge outline
      if (x === 190 && y % 10 === 0) colorIndex = 3; // highlight details
      
      const color = rampColors[Math.min(colorIndex, rampColors.length - 1)];
      setPixel(ctx, x, y, color);
    }
  }
  
  // Add features to walls
  leftFeatures.forEach(feature => {
    if (feature.sprite && feature.x !== undefined && feature.y !== undefined) {
      drawSprite(ctx, feature.x, feature.y, feature.sprite, feature.ramp);
    }
  });
  
  rightFeatures.forEach(feature => {
    if (feature.sprite && feature.x !== undefined && feature.y !== undefined) {
      drawSprite(ctx, feature.x, feature.y, feature.sprite, feature.ramp);
    }
  });
}

function drawWater(ctx, yStart, ramp = 'water', depth = 40) {
  const rampColors = Array.isArray(ramp) ? ramp : RAMPS[ramp];
  if (!rampColors) return;
  
  for (let y = yStart; y < Math.min(yStart + depth, 200); y++) {
    for (let x = 0; x < 200; x++) {
      const depthProgress = (y - yStart) / depth;
      let colorIndex = Math.floor(depthProgress * (rampColors.length - 1));
      
      // Add ripple effects
      const ripple = Math.sin(x * 0.2 + y * 0.1) * 0.5;
      if (ripple > 0.3) colorIndex = Math.max(0, colorIndex - 1);
      
      // Add highlights for water surface reflection
      if (y === yStart && (x + Math.floor(y * 0.1)) % 4 === 0) {
        setPixel(ctx, x, y, '#ffffff');
      } else {
        const color = rampColors[Math.min(colorIndex, rampColors.length - 1)];
        setPixel(ctx, x, y, color);
      }
    }
  }
}

function drawLava(ctx, yStart) {
  const lavaRamp = RAMPS.lava;
  
  for (let y = yStart; y < 200; y++) {
    for (let x = 0; x < 200; x++) {
      const depth = (y - yStart) / (200 - yStart);
      let colorIndex = Math.floor(depth * (lavaRamp.length - 1));
      
      // Add bubbling effects
      const bubble = Math.sin(x * 0.4 + y * 0.3) * Math.cos(x * 0.2) * 0.7;
      if (bubble > 0.5) {
        colorIndex = Math.min(lavaRamp.length - 1, colorIndex + 1);
      }
      
      // Add bright lava highlights
      if (Math.random() < 0.02) {
        setPixel(ctx, x, y, lavaRamp[lavaRamp.length - 1]);
      } else {
        const color = lavaRamp[Math.min(colorIndex, lavaRamp.length - 1)];
        setPixel(ctx, x, y, color);
      }
    }
  }
  
  // Add glow effect above lava
  for (let y = Math.max(0, yStart - 10); y < yStart; y++) {
    for (let x = 0; x < 200; x++) {
      if (Math.random() < 0.1) {
        const glowAlpha = (yStart - y) / 10;
        if (glowAlpha > Math.random()) {
          setPixel(ctx, x, y, '#ff6600');
        }
      }
    }
  }
}

function drawParticles(ctx, type, count) {
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 200);
    const y = Math.floor(Math.random() * 200);
    
    switch (type) {
      case 'embers':
        if (Math.random() > 0.5) {
          setPixel(ctx, x, y, '#ff6600');
        } else {
          setPixel(ctx, x, y, '#ff4400');
        }
        break;
      case 'snow':
        setPixel(ctx, x, y, '#ffffff');
        if (Math.random() > 0.7) {
          setPixel(ctx, x + 1, y, '#f0f0f0');
        }
        break;
      case 'dust':
        setPixel(ctx, x, y, '#ccccaa');
        break;
      case 'fireflies':
        if (Math.random() > 0.8) {
          setPixel(ctx, x, y, '#ffff88');
        }
        break;
      case 'petals':
        const petalColors = ['#ffccdd', '#ff99cc', '#ffaacc'];
        const color = petalColors[Math.floor(Math.random() * petalColors.length)];
        setPixel(ctx, x, y, color);
        break;
    }
  }
}

function drawMoon(ctx, x, y, radius, color = '#ffffff', glowRadius = 0) {
  // Draw glow
  if (glowRadius > 0) {
    for (let gy = -glowRadius; gy <= glowRadius; gy++) {
      for (let gx = -glowRadius; gx <= glowRadius; gx++) {
        const dist = Math.sqrt(gx * gx + gy * gy);
        if (dist <= glowRadius && dist > radius) {
          const alpha = 1 - (dist - radius) / (glowRadius - radius);
          if (alpha > 0.3) {
            setPixel(ctx, x + gx, y + gy, color);
          }
        }
      }
    }
  }
  
  // Draw moon body
  for (let my = -radius; my <= radius; my++) {
    for (let mx = -radius; mx <= radius; mx++) {
      const dist = Math.sqrt(mx * mx + my * my);
      if (dist <= radius) {
        let moonColor = color;
        
        // Add some surface detail
        if (dist > radius * 0.8) {
          moonColor = '#e0e0e0'; // darker edge
        } else if (mx > 0 && my < 0 && dist < radius * 0.6) {
          moonColor = '#ffffff'; // bright highlight
        }
        
        setPixel(ctx, x + mx, y + my, moonColor);
      }
    }
  }
}

// ============================================================================
// EXPORT MODULE
// ============================================================================

module.exports = {
  // Color system
  RAMPS,
  getRampColor,
  
  // Utilities
  setPixel,
  drawSprite,
  fillBackground,
  
  // Dithering
  ditherFill,
  ditherGradient,
  
  // Sprites
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
  
  // Scene composition
  drawSky,
  drawGround,
  drawWalls,
  drawWater,
  drawLava,
  drawParticles,
  drawMoon
};