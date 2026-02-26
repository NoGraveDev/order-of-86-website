const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');

const ORDER_COLORS = {
    Flame: '#ff4500', Radiant: '#ffd700', Deep: '#1e90ff',
    Wild: '#228b22', Arcane: '#7b54c9', Heart: '#c55bb7', Wanderer: '#7b54c9'
};

const ORDER_EMOJI = {
    Flame: '🔥', Radiant: '☀️', Deep: '🌊',
    Wild: '🌿', Arcane: '🔮', Heart: '💗', Wanderer: '🌀'
};

const cardCache = new Map();

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

async function generateOGCard(dog) {
    if (cardCache.has(dog.id)) return cardCache.get(dog.id);

    const W = 1200, H = 630;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');
    const orderColor = ORDER_COLORS[dog.order] || '#ffd700';
    const name = (dog.suggestedName || `Wizard #${dog.id}`).replace(/[-–—]/g, ' ');

    // Background with subtle gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#0a0a0f');
    bgGrad.addColorStop(1, '#12121a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle star dots
    for (let i = 0; i < 60; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.15 + 0.05})`;
        ctx.beginPath();
        ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 1.5 + 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Order color accent bar at top
    ctx.fillStyle = orderColor;
    ctx.fillRect(0, 0, W, 5);

    // Order color glow at top
    const topGlow = ctx.createLinearGradient(0, 0, 0, 80);
    topGlow.addColorStop(0, orderColor + '25');
    topGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, W, 80);

    // === LEFT SIDE: Dog image ===
    const imgSize = 360;
    const imgX = 70, imgY = (H - imgSize) / 2 + 10;

    // Glow behind image
    ctx.shadowColor = orderColor;
    ctx.shadowBlur = 40;
    ctx.fillStyle = '#1c1c1e';
    roundRect(ctx, imgX - 5, imgY - 5, imgSize + 10, imgSize + 10, 24);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Order color border
    ctx.strokeStyle = orderColor;
    ctx.lineWidth = 3;
    roundRect(ctx, imgX - 5, imgY - 5, imgSize + 10, imgSize + 10, 24);
    ctx.stroke();

    // Load and draw dog image
    try {
        const imgPath = path.join(__dirname, dog.image);
        if (fs.existsSync(imgPath)) {
            const img = await loadImage(imgPath);
            ctx.save();
            roundRect(ctx, imgX, imgY, imgSize, imgSize, 20);
            ctx.clip();
            ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
            ctx.restore();
        }
    } catch (e) { /* skip */ }

    // === RIGHT SIDE: Info ===
    const textX = 490;
    const rightW = W - textX - 60;

    // Name
    ctx.fillStyle = '#F5F5F7';
    let fontSize = 40;
    ctx.font = `bold ${fontSize}px sans-serif`;
    while (ctx.measureText(name).width > rightW && fontSize > 24) {
        fontSize -= 2;
        ctx.font = `bold ${fontSize}px sans-serif`;
    }
    ctx.fillText(name, textX, 80);

    // ID + Rank line
    ctx.fillStyle = '#8e8e93';
    ctx.font = '22px sans-serif';
    ctx.fillText(`#${dog.id}  ·  Rank ${dog.rank.toLocaleString()}`, textX, 115);

    // Order badge pill
    roundRect(ctx, textX, 132, ctx.measureText(`  ${dog.order} Order  `).width + 24, 36, 18);
    ctx.fillStyle = orderColor;
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`${dog.order} Order`, textX + 12, 157);

    // X handle (if exists)
    if (dog.twitter) {
        const badgeX = textX + ctx.measureText(`  ${dog.order} Order  `).width + 36;
        ctx.fillStyle = '#1c1c1e';
        ctx.strokeStyle = '#1DA1F2';
        ctx.lineWidth = 1.5;
        const handleText = `X ${dog.twitter}`;
        ctx.font = 'bold 18px sans-serif';
        const hw = ctx.measureText(handleText).width + 24;
        roundRect(ctx, badgeX, 132, hw, 36, 18);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#1DA1F2';
        ctx.fillText(handleText, badgeX + 12, 156);
    }

    // Trait pills - 2 columns
    const traits = [
        ['Fur', dog.fur],
        ['Pattern', dog.pattern],
        ['Eyes', dog.eyes],
        ['Clothes', dog.clothes || 'None'],
        ['Realm', dog.realm],
    ];
    if (dog.mouth) traits.push(['Mouth', dog.mouth]);

    const pillStartY = 195;
    const colW = (rightW - 16) / 2;

    traits.forEach(([label, value], i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const px = textX + col * (colW + 16);
        const py = pillStartY + row * 52;

        // Pill background
        ctx.fillStyle = '#1c1c1e';
        roundRect(ctx, px, py, colW, 42, 10);
        ctx.fill();

        // Border
        ctx.strokeStyle = '#2c2c2e';
        ctx.lineWidth = 1;
        roundRect(ctx, px, py, colW, 42, 10);
        ctx.stroke();

        // Label
        ctx.fillStyle = '#6e6e73';
        ctx.font = '13px sans-serif';
        ctx.fillText(label.toUpperCase(), px + 14, py + 17);

        // Value
        ctx.fillStyle = '#F5F5F7';
        ctx.font = 'bold 17px sans-serif';
        ctx.fillText(value, px + 14, py + 35);
    });

    // Lore snippet
    const loreY = pillStartY + Math.ceil(traits.length / 2) * 52 + 16;
    if (dog.suggestedStory && loreY < 520) {
        ctx.fillStyle = '#4a4a4e';
        ctx.fillRect(textX, loreY, rightW, 1);

        const storyClean = dog.suggestedStory.replace(/\*[^*]*\*\n?\n?/, '').replace(/[-–—]/g, ' ').trim();
        const snippet = storyClean.substring(0, 200) + '…';

        ctx.fillStyle = '#8e8e93';
        ctx.font = 'italic 16px sans-serif';

        // Word wrap
        const words = snippet.split(' ');
        let line = '', lineY = loreY + 24;
        const maxLoreY = H - 70;
        for (const word of words) {
            const test = line + word + ' ';
            if (ctx.measureText(test).width > rightW && line) {
                ctx.fillText(line.trim(), textX, lineY);
                line = word + ' ';
                lineY += 22;
                if (lineY > maxLoreY) break;
            } else {
                line = test;
            }
        }
        if (lineY <= maxLoreY) ctx.fillText(line.trim(), textX, lineY);
    }

    // Footer bar
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, H - 52, W, 52);
    ctx.fillStyle = '#2c2c2e';
    ctx.fillRect(0, H - 52, W, 1);

    // Footer left: site name
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('The Order of 86', 30, H - 20);

    // Footer right: URL
    ctx.fillStyle = '#6e6e73';
    ctx.font = '18px sans-serif';
    ctx.fillText('theorderof86.com/wizard/' + dog.id, W - ctx.measureText('theorderof86.com/wizard/' + dog.id).width - 30, H - 20);

    // Footer center: marketplace link hint
    if (dog.marketplace) {
        ctx.fillStyle = '#4a4a4e';
        ctx.font = '16px sans-serif';
        const mpText = 'Available on Doginal Dogs Marketplace';
        ctx.fillText(mpText, (W - ctx.measureText(mpText).width) / 2, H - 20);
    }

    const buf = canvas.toBuffer('image/png');
    cardCache.set(dog.id, buf);
    return buf;
}

module.exports = { generateOGCard };
