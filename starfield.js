/* ── Animated Starfield + Shooting Stars ──────── */
(function(){
    const canvas = document.createElement('canvas');
    canvas.id = 'starfieldCanvas';
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let W, H;
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    // Stars
    const STAR_COUNT = 300;
    const stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * 2000 - 500,
            y: Math.random() * 2000 - 500,
            r: Math.random() * 1.8 + 0.3,
            twinkleSpeed: 0.5 + Math.random() * 2,
            twinkleOffset: Math.random() * Math.PI * 2,
            brightness: 0.4 + Math.random() * 0.6
        });
    }

    // Shooting stars
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

    function animate() {
        requestAnimationFrame(animate);
        time += 0.016;
        ctx.clearRect(0, 0, W, H);

        // Draw stars
        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            const twinkle = 0.5 + 0.5 * Math.sin(time * s.twinkleSpeed + s.twinkleOffset);
            const alpha = s.brightness * twinkle;

            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(((s.x % W) + W) % W, ((s.y % H) + H) % H, s.r, 0, Math.PI * 2);
            ctx.fill();

            // Some stars have a subtle color
            if (i % 7 === 0) ctx.fillStyle = '#ffd700';
            else if (i % 11 === 0) ctx.fillStyle = '#aaccff';
        }

        // Shooting stars
        shootTimer += 0.016;
        if (shootTimer > 2 + Math.random() * 5) {
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
            const tailX = s.x - (s.vx / Math.sqrt(s.vx*s.vx + s.vy*s.vy)) * s.length;
            const tailY = s.y - (s.vy / Math.sqrt(s.vx*s.vx + s.vy*s.vy)) * s.length;

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

            // Bright head
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
