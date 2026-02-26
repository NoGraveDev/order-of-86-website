const ORDER_COLORS = {
    Flame: '#ff4500', Radiant: '#ffd700', Deep: '#1e90ff',
    Wild: '#228b22', Arcane: '#7b54c9', Heart: '#c55bb7', Wanderer: '#7b54c9'
};

function renderWizardPage(dog, baseUrl) {
    const col = ORDER_COLORS[dog.order] || '#ffd700';
    const name = dog.suggestedName || `Wizard #${dog.id}`;
    const desc = dog.suggestedStory
        ? dog.suggestedStory.replace(/\*[^*]*\*/g, '').trim().substring(0, 200) + '…'
        : `${name} — a ${dog.fur} ${dog.pattern} of the ${dog.order} Order from ${dog.realm}.`;
    const ogImage = `${baseUrl}/wizard/${dog.id}/og.png`;
    const canonicalUrl = `${baseUrl}/wizard/${dog.id}`;
    const storyHtml = (dog.suggestedStory || '').replace(/\n/g, '<br>').replace(/\*([^*]+)\*/g, '<em>$1</em>');

    const links = [];
    if (dog.marketplace) links.push(`<a href="${dog.marketplace}" target="_blank" class="pill pill-gold">🐕 View on Marketplace</a>`);
    if (dog.twitter) links.push(`<a href="https://x.com/${dog.twitter.replace('@','')}" target="_blank" class="pill pill-blue">𝕏 ${dog.twitter}</a>`);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${name} — The Order of 86</title>
    <meta name="description" content="${desc.replace(/"/g, '&quot;')}">
    <link rel="canonical" href="${canonicalUrl}">

    <!-- Open Graph -->
    <meta property="og:title" content="${name} — The Order of 86">
    <meta property="og:description" content="${desc.replace(/"/g, '&quot;')}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:type" content="profile">
    <meta property="og:site_name" content="The Order of 86">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${name} — The Order of 86">
    <meta name="twitter:description" content="${desc.replace(/"/g, '&quot;')}">
    <meta name="twitter:image" content="${ogImage}">
    <meta name="twitter:site" content="@hBUDS_">

    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:#0a0a0c;color:#F5F5F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;min-height:100vh}
        .back{display:inline-flex;align-items:center;gap:6px;color:#ffd700;text-decoration:none;padding:20px 24px;font-size:0.95rem;transition:opacity 0.2s}
        .back:hover{opacity:0.7}
        .container{max-width:900px;margin:0 auto;padding:0 24px 60px}
        .hero-card{display:flex;gap:32px;align-items:flex-start;margin-bottom:40px;flex-wrap:wrap}
        .dog-img{width:280px;height:280px;border-radius:20px;border:3px solid ${col};object-fit:cover;background:#1c1c1e;image-rendering:pixelated}
        .info{flex:1;min-width:260px}
        .name{font-size:clamp(1.6rem,4vw,2.4rem);font-weight:800;margin-bottom:4px}
        .id-rank{color:#8e8e93;font-size:1rem;margin-bottom:12px}
        .order-badge{display:inline-block;padding:6px 16px;border-radius:20px;font-weight:700;font-size:0.9rem;color:#fff;background:${col};margin-bottom:20px}
        .traits{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin-bottom:24px}
        .trait{background:#1c1c1e;border-radius:12px;padding:12px 16px}
        .trait-label{color:#8e8e93;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px}
        .trait-value{font-weight:600;font-size:0.95rem}
        .links{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:32px}
        .pill{display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border-radius:10px;text-decoration:none;font-size:0.9rem;font-weight:600;transition:border-color 0.2s;border:1px solid #333;background:#1c1c1e}
        .pill-gold{color:#ffd700}.pill-gold:hover{border-color:#ffd700}
        .pill-blue{color:#1DA1F2}.pill-blue:hover{border-color:#1DA1F2}
        .story-section{margin-top:20px}
        .story-title{font-size:1.2rem;font-weight:700;color:#ffd700;margin-bottom:16px}
        .story{color:#c7c7cc;line-height:1.8;font-size:1rem}
        .share-section{margin-top:40px;padding-top:24px;border-top:1px solid #2c2c2e}
        .share-title{font-size:0.9rem;color:#8e8e93;margin-bottom:12px}
        .share-btns{display:flex;gap:10px;flex-wrap:wrap}
        .share-btn{padding:10px 20px;border-radius:10px;border:1px solid #333;background:#1c1c1e;color:#F5F5F7;font-size:0.85rem;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:6px;transition:border-color 0.2s}
        .share-btn:hover{border-color:#ffd700}
        @media(max-width:600px){
            .hero-card{flex-direction:column;align-items:center;text-align:center}
            .dog-img{width:200px;height:200px}
            .traits{grid-template-columns:repeat(2,1fr)}
            .links,.share-btns{justify-content:center}
        }
    </style>
</head>
<body>
    <a href="/" class="back">← Back to all wizards</a>
    <div class="container">
        <div class="hero-card">
            <img src="/${dog.image}" alt="${name}" class="dog-img">
            <div class="info">
                <div class="name">${name}</div>
                <div class="id-rank">#${dog.id} · Rank ${dog.rank.toLocaleString()}</div>
                <div class="order-badge">${dog.order} Order</div>
                <div class="traits">
                    <div class="trait"><div class="trait-label">Fur</div><div class="trait-value">${dog.fur}</div></div>
                    <div class="trait"><div class="trait-label">Pattern</div><div class="trait-value">${dog.pattern}</div></div>
                    <div class="trait"><div class="trait-label">Eyes</div><div class="trait-value">${dog.eyes}</div></div>
                    <div class="trait"><div class="trait-label">Clothes</div><div class="trait-value">${dog.clothes}</div></div>
                    ${dog.mouth ? `<div class="trait"><div class="trait-label">Mouth</div><div class="trait-value">${dog.mouth}</div></div>` : ''}
                    <div class="trait"><div class="trait-label">Realm</div><div class="trait-value">${dog.realm}</div></div>
                </div>
                ${links.length ? `<div class="links">${links.join('')}</div>` : ''}
            </div>
        </div>

        ${storyHtml ? `<div class="story-section">
            <div class="story-title">📜 Lore</div>
            <div class="story">${storyHtml}</div>
        </div>` : ''}

        <div class="share-section">
            <div class="share-title">Share this wizard</div>
            <div class="share-btns">
                <a class="share-btn" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(`Meet ${name} — ${dog.order} Order wizard from ${dog.realm} 🧙‍♂️\n\n`)}&url=${encodeURIComponent(canonicalUrl)}" target="_blank">𝕏 Share on X</a>
                <button class="share-btn" onclick="navigator.clipboard.writeText('${canonicalUrl}');this.textContent='✓ Copied!'">📋 Copy Link</button>
            </div>
        </div>
    </div>

    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "name": "${name}",
        "description": "${desc.replace(/"/g, '\\"')}",
        "image": "${ogImage}",
        "url": "${canonicalUrl}",
        "isPartOf": {
            "@type": "CreativeWorkSeries",
            "name": "The Order of 86",
            "url": "${baseUrl}"
        }
    }
    </script>
</body>
</html>`;
}

module.exports = { renderWizardPage };
