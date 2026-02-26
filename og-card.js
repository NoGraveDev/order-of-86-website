const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const fs = require('fs');

const ORDER_COLORS = {
    Flame: '#ff4500', Radiant: '#ffd700', Deep: '#1e90ff',
    Wild: '#228b22', Arcane: '#7b54c9', Heart: '#c55bb7', Wanderer: '#7b54c9'
};

// Cache generated cards
const cardCache = new Map();

async function generateOGCard(dog) {
    if (cardCache.has(dog.id)) return cardCache.get(dog.id);

    const W = 1200, H = 630;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');

    // Dark background
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, W, H);

    // Order color accent bar at top
    const orderColor = ORDER_COLORS[dog.order] || '#ffd700';
    ctx.fillStyle = orderColor;
    ctx.fillRect(0, 0, W, 6);

    // Subtle gradient overlay
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(255,215,0,0.03)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Load dog image
    try {
        const imgPath = path.join(__dirname, dog.image);
        if (fs.existsSync(imgPath)) {
            const img = await loadImage(imgPath);
            // Draw dog image with rounded area on left
            const imgSize = 400;
            const imgX = 60, imgY = (H - imgSize) / 2;

            // Dark circle background behind dog
            ctx.fillStyle = '#1c1c1e';
            ctx.beginPath();
            ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2 + 10, 0, Math.PI * 2);
            ctx.fill();

            // Order color ring
            ctx.strokeStyle = orderColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2 + 10, 0, Math.PI * 2);
            ctx.stroke();

            // Clip to circle and draw
            ctx.save();
            ctx.beginPath();
            ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
            ctx.restore();
        }
    } catch (e) { /* skip image */ }

    // Text area - right side
    const textX = 520;

    // Name
    ctx.fillStyle = '#F5F5F7';
    ctx.font = 'bold 42px sans-serif';
    const name = dog.suggestedName || `Wizard #${dog.id}`;
    // Word wrap name if too long
    const maxNameWidth = W - textX - 60;
    if (ctx.measureText(name).width > maxNameWidth) {
        ctx.font = 'bold 34px sans-serif';
    }
    ctx.fillText(name, textX, 120, maxNameWidth);

    // ID + Rank
    ctx.fillStyle = '#8e8e93';
    ctx.font = '24px sans-serif';
    ctx.fillText(`#${dog.id} · Rank ${dog.rank.toLocaleString()}`, textX, 160);

    // Order badge
    ctx.fillStyle = orderColor;
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(`${dog.order} Order`, textX, 210);

    // Traits
    ctx.fillStyle = '#c7c7cc';
    ctx.font = '22px sans-serif';
    const traits = [
        `Fur: ${dog.fur}`, `Pattern: ${dog.pattern}`,
        `Eyes: ${dog.eyes}`, `Clothes: ${dog.clothes}`,
        `Realm: ${dog.realm}`
    ];
    traits.forEach((t, i) => {
        ctx.fillText(t, textX, 270 + i * 34);
    });

    // Lore snippet (first 150 chars of story)
    if (dog.suggestedStory) {
        ctx.fillStyle = '#6e6e73';
        ctx.font = 'italic 18px sans-serif';
        const storyClean = dog.suggestedStory.replace(/\*[^*]*\*\n?\n?/, '').trim();
        const snippet = storyClean.substring(0, 140) + '…';
        // Simple word wrap
        const words = snippet.split(' ');
        let line = '', lineY = 470;
        for (const word of words) {
            const test = line + word + ' ';
            if (ctx.measureText(test).width > maxNameWidth && line) {
                ctx.fillText(line.trim(), textX, lineY);
                line = word + ' ';
                lineY += 24;
                if (lineY > 540) break;
            } else {
                line = test;
            }
        }
        if (lineY <= 540) ctx.fillText(line.trim(), textX, lineY);
    }

    // Footer
    ctx.fillStyle = '#3a3a3c';
    ctx.fillRect(0, H - 50, W, 50);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('The Order of 86', 60, H - 18);
    ctx.fillStyle = '#8e8e93';
    ctx.font = '18px sans-serif';
    ctx.fillText('theorderof86.com', W - 220, H - 18);

    const buf = canvas.toBuffer('image/png');
    cardCache.set(dog.id, buf);
    return buf;
}

module.exports = { generateOGCard };
