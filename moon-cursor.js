/* ── Animated Moon Phase Cursor ──────────────────────── */
(function(){
    const ORDER_COLORS = [
        { name: 'Flame',   color: '#ff4500' },
        { name: 'Radiant', color: '#ffd700' },
        { name: 'Deep',    color: '#1e90ff' },
        { name: 'Wild',    color: '#228b22' },
        { name: 'Arcane',  color: '#7b54c9' },
        { name: 'Heart',   color: '#c55bb7' },
    ];

    let colorIndex = 0;
    let phase = 0; // 0-7 (8 phases)
    const PHASE_DURATION = 1200; // ms per phase
    const MOON_SIZE = 24;

    // Create cursor element
    const moon = document.createElement('div');
    moon.id = 'moonCursor';
    moon.style.cssText = `
        position: fixed;
        width: ${MOON_SIZE}px;
        height: ${MOON_SIZE}px;
        pointer-events: none;
        z-index: 99999;
        transform: translate(-50%, -50%);
        transition: left 0.05s ease-out, top 0.05s ease-out;
        will-change: left, top;
    `;
    document.body.appendChild(moon);

    // Create canvas for moon rendering
    const canvas = document.createElement('canvas');
    canvas.width = MOON_SIZE * 2; // retina
    canvas.height = MOON_SIZE * 2;
    canvas.style.cssText = `width:${MOON_SIZE}px;height:${MOON_SIZE}px;`;
    moon.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Hide default cursor
    const style = document.createElement('style');
    style.textContent = `
        * { cursor: none !important; }
        #moonCursor { cursor: none !important; }
    `;
    document.head.appendChild(style);

    let mouseX = -100, mouseY = -100;
    let curX = -100, curY = -100;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Draw moon at given phase with given color
    // phase 0 = new moon (dark), 4 = full moon (bright)
    function drawMoon(phase, color) {
        const s = MOON_SIZE * 2; // canvas size (retina)
        const r = s / 2 - 2;
        const cx = s / 2, cy = s / 2;

        ctx.clearRect(0, 0, s, s);

        // Glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;

        // Dark base circle (always drawn)
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = '#1a1a1e';
        ctx.strokeStyle = color + '40';
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Lit portion - using clipping to create phase effect
        // Phase 0 = new (0% lit), 4 = full (100% lit)
        // We draw the lit crescent/gibbous using two arcs

        if (phase === 0) return; // new moon - all dark

        ctx.save();

        // Clip to circle
        ctx.beginPath();
        ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
        ctx.clip();

        if (phase === 4) {
            // Full moon
            ctx.beginPath();
            ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        } else if (phase < 4) {
            // Waxing: right side lit, left dark
            // phase 1: thin crescent, 2: quarter, 3: gibbous
            ctx.beginPath();
            // Right half arc
            ctx.arc(cx, cy, r - 1, -Math.PI / 2, Math.PI / 2, false);
            // Inner edge - elliptical curve
            const innerX = r * (1 - phase / 2); // narrows as phase increases
            ctx.ellipse(cx, cy, innerX, r - 1, 0, Math.PI / 2, -Math.PI / 2, false);
            ctx.fillStyle = color;
            ctx.fill();
        } else {
            // Waning: left side lit, right going dark
            // phase 5: gibbous, 6: quarter, 7: crescent
            const wanePhase = 8 - phase; // maps 5→3, 6→2, 7→1
            ctx.beginPath();
            // Left half arc
            ctx.arc(cx, cy, r - 1, Math.PI / 2, -Math.PI / 2, false);
            // Inner edge
            const innerX = r * (1 - wanePhase / 2);
            ctx.ellipse(cx, cy, innerX, r - 1, 0, -Math.PI / 2, Math.PI / 2, false);
            ctx.fillStyle = color;
            ctx.fill();
        }

        ctx.restore();

        // Subtle crater texture on lit areas
        if (phase > 0) {
            ctx.globalAlpha = 0.15;
            const craters = [[0.3, 0.35, 3], [0.6, 0.55, 2], [0.45, 0.7, 2.5], [0.55, 0.3, 1.8]];
            craters.forEach(([px, py, cr]) => {
                ctx.beginPath();
                ctx.arc(cx + (px - 0.5) * r * 1.4, cy + (py - 0.5) * r * 1.4, cr, 0, Math.PI * 2);
                ctx.fillStyle = '#000';
                ctx.fill();
            });
            ctx.globalAlpha = 1;
        }
    }

    // Phase cycling
    let lastPhaseTime = Date.now();

    function updatePhase() {
        const now = Date.now();
        if (now - lastPhaseTime >= PHASE_DURATION) {
            lastPhaseTime = now;
            phase = (phase + 1) % 8;

            // When we hit new moon (phase 0), cycle to next color
            if (phase === 0) {
                colorIndex = (colorIndex + 1) % ORDER_COLORS.length;
            }
        }
    }

    function animate() {
        requestAnimationFrame(animate);

        // Smooth follow
        curX += (mouseX - curX) * 0.3;
        curY += (mouseY - curY) * 0.3;

        moon.style.left = curX + 'px';
        moon.style.top = curY + 'px';

        updatePhase();
        drawMoon(phase, ORDER_COLORS[colorIndex].color);
    }

    animate();

    // Show/hide on enter/leave
    document.addEventListener('mouseenter', () => { moon.style.opacity = '1'; });
    document.addEventListener('mouseleave', () => { moon.style.opacity = '0'; });
    moon.style.opacity = '0';
    document.addEventListener('mousemove', () => { moon.style.opacity = '1'; }, { once: true });

    // Don't hide cursor on mobile (touch devices don't have cursors)
    if ('ontouchstart' in window && !window.matchMedia('(pointer:fine)').matches) {
        style.textContent = '';
        moon.style.display = 'none';
    }
})();
