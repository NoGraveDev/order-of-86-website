/* ── Animated Starfield + Shooting Stars (Optimized) ──────── */
(function(){
    const canvas = document.createElement('canvas');
    canvas.id = 'starfieldCanvas';
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d', { alpha: true });
    let W, H;
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    // Reduced star count
    const STAR_COUNT = 150; // Was 300
    const stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * 2000 - 500,
            y: Math.random() * 2000 - 500,
            r: Math.random() * 1.8 + 0.3,
            twinkleSpeed: 0.5 + Math.random() * 2,
            twinkleOffset: Math.random() * Math.PI * 2,
            brightness: 0.4 + Math.random() * 0.6,
            color: i % 7 === 0 ? '#ffd700' : i % 11 === 0 ? '#aaccff' : '#ffffff'
        });
    }

    const shooters = [];
    function spawnShooter() {
        shooters.push({
            x: Math.random() * W * 1.2 - W * 0.1,
            y: Math.random() * H * 0.4,
            vx: 4 + Math.random() * 6,
            vy: 2 + Math.random() * 4,
            life: 30 + Math.random() * 40,
            age: 0,
            length: 40 + Math.random() * 80,
            width: 1 + Math.random() * 1.5
        });
    }

    let time = 0;
    let shootTimer = 0;
    let frameSkip = 0;

    // Pre-render static stars to offscreen canvas (they barely change)
    let staticCanvas = null;
    let lastStaticTime = -1;

    function renderStaticStars(t) {
        if (!staticCanvas) {
            staticCanvas = document.createElement('canvas');
        }
        staticCanvas.width = W;
        staticCanvas.height = H;
        const sCtx = staticCanvas.getContext('2d');

        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            const twinkle = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset);
            const alpha = s.brightness * twinkle;

            sCtx.globalAlpha = alpha;
            sCtx.fillStyle = s.color;
            sCtx.beginPath();
            sCtx.arc(((s.x % W) + W) % W, ((s.y % H) + H) % H, s.r, 0, Math.PI * 2);
            sCtx.fill();
        }
        sCtx.globalAlpha = 1;
    }

    function animate() {
        requestAnimationFrame(animate);
        time += 0.016;

        // Only re-render stars every 6th frame (~10fps for twinkle is fine)
        frameSkip++;
        if (frameSkip >= 6 || !staticCanvas) {
            frameSkip = 0;
            renderStaticStars(time);
        }

        ctx.clearRect(0, 0, W, H);
        if (staticCanvas) ctx.drawImage(staticCanvas, 0, 0);

        // Shooting stars (these need smooth animation)
        shootTimer += 0.016;
        if (shootTimer > 3 + Math.random() * 6) { // Less frequent
            spawnShooter();
            shootTimer = 0;
        }

        for (let i = shooters.length - 1; i >= 0; i--) {
            const s = shooters[i];
            s.x += s.vx;
            s.y += s.vy;
            s.age++;

            if (s.age >= s.life) { shooters.splice(i, 1); continue; }

            const progress = s.age / s.life;
            const alpha = Math.sin(progress * Math.PI);
            const mag = Math.sqrt(s.vx*s.vx + s.vy*s.vy);
            const tailX = s.x - (s.vx / mag) * s.length;
            const tailY = s.y - (s.vy / mag) * s.length;

            const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
            grad.addColorStop(0, 'rgba(255,255,255,0)');
            grad.addColorStop(0.7, `rgba(255,255,255,${alpha * 0.4})`);
            grad.addColorStop(1, `rgba(255,255,255,${alpha})`);

            ctx.globalAlpha = 1;
            ctx.strokeStyle = grad;
            ctx.lineWidth = s.width;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(s.x, s.y);
            ctx.stroke();

            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.width, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;
    }
    animate();
})();
