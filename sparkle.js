/* ── Magic Sparkle Trail ──────────────────────── */
(function(){
    // Auto-inject canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'sparkleCanvas';
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let W, H;
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const colors = ['#ffd700','#ffb800','#ffe066','#fff5cc','#ffffff','#ff9500','#c55bb7','#7b54c9'];
    let rawMouseX = -100, rawMouseY = -100;
    let mouseX = -100, mouseY = -100, lastX = -100, lastY = -100;

    document.addEventListener('mousemove', e => { rawMouseX = e.clientX; rawMouseY = e.clientY; });
    document.addEventListener('touchmove', e => {
        rawMouseX = e.touches[0].clientX;
        rawMouseY = e.touches[0].clientY;
    }, { passive: true });

    function spawn(x, y, burst) {
        const count = burst ? 8 : 2;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = burst ? Math.random() * 3 + 1 : Math.random() * 1.5 + 0.3;
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - (burst ? 1 : 0.5),
                size: Math.random() * (burst ? 4 : 2.5) + 1,
                life: burst ? 40 + Math.random() * 30 : 20 + Math.random() * 20,
                age: 0,
                color: colors[Math.floor(Math.random() * colors.length)],
                type: Math.random() > 0.6 ? 'star' : 'circle',
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.15
            });
        }
    }

    document.addEventListener('click', e => { spawn(e.clientX, e.clientY, true); });

    function drawStar(cx, cy, r, rot) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const a = (i / 4) * Math.PI * 2;
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.stroke();
        ctx.restore();
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, W, H);

        // Smooth follow to match orb cursor position
        mouseX += (rawMouseX - mouseX) * 0.35;
        mouseY += (rawMouseY - mouseY) * 0.35;

        const dx = mouseX - lastX, dy = mouseY - lastY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > 3) {
            spawn(mouseX, mouseY, false);
            lastX = mouseX; lastY = mouseY;
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.04;
            p.vx *= 0.98;
            p.age++;
            p.rotation += p.rotSpeed;

            if (p.age >= p.life) { particles.splice(i, 1); continue; }

            const progress = p.age / p.life;
            const alpha = 1 - progress;
            const size = p.size * (1 - progress * 0.5);

            ctx.globalAlpha = alpha;

            if (p.type === 'star') {
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 1.5;
                drawStar(p.x, p.y, size * 1.5, p.rotation);
            } else {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
        if (particles.length > 200) particles.splice(0, particles.length - 200);
    }
    animate();
})();
