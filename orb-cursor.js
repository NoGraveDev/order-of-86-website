/* ── Glowing Orb Cursor (Optimized) ──────────────────────── */
(function(){
    // Skip entirely on mobile/touch devices
    if ('ontouchstart' in window && !window.matchMedia('(pointer:fine)').matches) return;

    const ORDER_COLORS = [
        { name: 'Flame',   color: '#ff4500', glow: 'rgba(255,69,0,' },
        { name: 'Radiant', color: '#ffd700', glow: 'rgba(255,215,0,' },
        { name: 'Deep',    color: '#1e90ff', glow: 'rgba(30,144,255,' },
        { name: 'Wild',    color: '#228b22', glow: 'rgba(34,139,34,' },
        { name: 'Arcane',  color: '#7b54c9', glow: 'rgba(123,84,201,' },
        { name: 'Heart',   color: '#c55bb7', glow: 'rgba(197,91,183,' },
    ];

    let colorIndex = 0;
    const COLOR_CYCLE_MS = 8000;
    const ORB_SIZE = 14;

    const orb = document.createElement('div');
    orb.id = 'orbCursor';
    document.body.appendChild(orb);

    const style = document.createElement('style');
    style.textContent = `
        * { cursor: none !important; }
        #orbCursor {
            position: fixed;
            width: ${ORB_SIZE}px;
            height: ${ORB_SIZE}px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 99999;
            transform: translate(-50%, -50%);
            will-change: transform;
            mix-blend-mode: screen;
            opacity: 0;
            transition: opacity 0.2s;
        }
    `;
    document.head.appendChild(style);

    let mouseX = -100, mouseY = -100;
    let curX = -100, curY = -100;
    let lastColorSwitch = Date.now();
    let isVisible = false;
    let rafId = null;
    let lastColor = '';
    let frameSkip = 0;
    let tabVisible = true;
    document.addEventListener('visibilitychange', () => { tabVisible = !document.hidden; });

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!isVisible) {
            isVisible = true;
            orb.style.opacity = '1';
            if (!rafId) rafId = requestAnimationFrame(animate);
        }
    });

    function animate() {
        if (!tabVisible) { rafId = requestAnimationFrame(animate); return; }
        // Smooth follow using transform (GPU-accelerated, no layout thrash)
        curX += (mouseX - curX) * 0.35;
        curY += (mouseY - curY) * 0.35;
        orb.style.transform = `translate(${curX - ORB_SIZE/2}px, ${curY - ORB_SIZE/2}px)`;

        // Only update colors every 3rd frame (visual effect doesn't need 60fps updates)
        frameSkip++;
        if (frameSkip >= 3) {
            frameSkip = 0;
            const now = Date.now();
            if (now - lastColorSwitch >= COLOR_CYCLE_MS) {
                lastColorSwitch = now;
                colorIndex = (colorIndex + 1) % ORDER_COLORS.length;
            }

            const c = ORDER_COLORS[colorIndex];
            const pulse = 0.7 + Math.sin(now * 0.005) * 0.3;
            const ia = (0.9 * pulse).toFixed(2);
            const ma = (0.5 * pulse).toFixed(2);
            const oa = (0.2 * pulse).toFixed(2);

            const newColor = c.name + ia;
            if (newColor !== lastColor) {
                lastColor = newColor;
                orb.style.background = `radial-gradient(circle, ${c.glow}${ia}) 0%, ${c.glow}${ma}) 40%, ${c.glow}0) 100%)`;
                orb.style.boxShadow = `0 0 ${6 + pulse * 4}px ${2 + pulse * 2}px ${c.glow}${oa}), 0 0 ${12 + pulse * 8}px ${c.glow}${(0.1 * pulse).toFixed(2)})`;
            }
        }

        if (isVisible) {
            rafId = requestAnimationFrame(animate);
        }
    }

    document.addEventListener('mouseenter', () => {
        isVisible = true;
        orb.style.opacity = '1';
        if (!rafId) rafId = requestAnimationFrame(animate);
    });
    document.addEventListener('mouseleave', () => {
        isVisible = false;
        orb.style.opacity = '0';
        rafId = null;
    });
})();
