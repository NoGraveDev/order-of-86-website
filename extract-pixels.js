const { createCanvas, loadImage } = require('canvas');

(async () => {
  const img = await loadImage('header-hat.png');
  const w = img.width, h = img.height;
  console.error(`Image size: ${w}x${h}`);
  // The art is roughly 14x10 actual pixel blocks in a 20x20 grid
  const gridSize = 20;
  const cellW = w / gridSize, cellH = h / gridSize;
  const pixels = [];
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      const sx = Math.floor(gx * cellW + cellW / 2);
      const sy = Math.floor(gy * cellH + cellH / 2);
      const [r, g, b, a] = ctx.getImageData(sx, sy, 1, 1).data;
      if (a < 128) continue;
      // Filter out teal/green background and edge artifacts
      if (g > 100 && b > 80 && g > r * 1.2) continue;
      // Filter near-black with green tint
      if (r < 40 && g > 40 && b > 30) continue;
      const hex = '#' + [r,g,b].map(c => c.toString(16).padStart(2,'0')).join('');
      pixels.push({x: gx, y: gy, color: hex});
    }
  }
  
  console.log(JSON.stringify(pixels));
  console.error(`Total hat pixels: ${pixels.length}`);
})();
