/* ── Magic Sparkle Trail (Optimized) ──────────────────────── */
(function(){
    // Skip on mobile — saves significant GPU
    if ('ontouchstart' in window && !window.matchMedia('(pointer:fine)').matches) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'sparkleCanvas';
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d', { alpha: true });
    let W, H;
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    const MAX_PARTICLES = 80; // Reduced from 200
    const particles = [];
    const colors = ['#ffd700','#ffb800','#ffe066','#fff5cc','#ffffff','#ff9500','#c55bb7','#7b54c9'];
    let rawMouseX = -100, rawMouseY = -100;
    let mouseX = -100, mouseY = -100, lastX = -100, lastY = -100;
    let isActive = false;
    let idleFrames = 0;
    let rafId = null;

    document.addEventListener('mousemove', e => {
        rawMouseX = e.clientX;
        rawMouseY = e.clientY;
        isActive = true;
        idleFrames = 0;
        if (!rafId) rafId = requestAnimationFrame(animate);
    });

    function spawn(x, y, burst) {
        const count = burst ? 6 : 1; // Reduced counts
        for (let i = 0; i < count; i++) {
            if (particles.length >= MAX_PARTICLES) return;
            const angle = Math.random() * Math.PI * 2;
            const speed = burst ? Math.random() * 3 + 1 : Math.random() * 1.5 + 0.3;
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - (burst ? 1 : 0.5),
                size: Math.random() * (burst ? 4 : 2.5) + 1,
                life: burst ? 30 + Math.random() * 20 : 15 + Math.random() * 15,
                age: 0,
                color: colors[Math.floor(Math.random() * colors.length)],
                isCircle: Math.random() > 0.7 // Simplified — skip star drawing mostly
            });
        }
    }

    document.addEventListener('click', e => { spawn(e.clientX, e.clientY, true); });

    function animate() {
        ctx.clearRect(0, 0, W, H);

        mouseX += (rawMouseX - mouseX) * 0.35;
        mouseY += (rawMouseY - mouseY) * 0.35;

        const dx = mouseX - lastX, dy = mouseY - lastY;
        const dist = dx*dx + dy*dy; // Skip sqrt
        if (dist > 9) { // was > 3 (now squared)
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

            if (p.age >= p.life) { particles.splice(i, 1); continue; }

            const progress = p.age / p.life;
            const alpha = 1 - progress;
            const size = p.size * (1 - progress * 0.5);

            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Stop animation loop when idle and no particles
        idleFrames++;
        if (particles.length === 0 && idleFrames > 60) {
            rafId = null;
            return;
        }
        rafId = requestAnimationFrame(animate);
    }
})();
