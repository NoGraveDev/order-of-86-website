const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const W = 1200, H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// Background
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, W, H);

// Border
ctx.strokeStyle = 'rgba(255,215,0,0.2)';
ctx.lineWidth = 2;
ctx.roundRect(16, 16, W - 32, H - 32, 12);
ctx.stroke();

// Title
ctx.fillStyle = '#ffd700';
ctx.font = 'bold 80px sans-serif';
ctx.textAlign = 'center';
ctx.fillText('Order of 86', W / 2, H / 2 - 20);

// Subtitle
ctx.fillStyle = '#98989D';
ctx.font = '28px sans-serif';
ctx.fillText('The 86 Most Powerful Wizard Dogs in Pawtheon', W / 2, H / 2 + 40);

// Save
const out = path.join(__dirname, 'og-image.png');
fs.writeFileSync(out, canvas.toBuffer('image/png'));
console.log('Generated:', out);
