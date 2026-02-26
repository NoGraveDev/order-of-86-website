/* ── Glowing Orb Cursor ──────────────────────── */
(function(){
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

    // Create orb element
    const orb = document.createElement('div');
    orb.id = 'orbCursor';
    document.body.appendChild(orb);

    // Styles
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
            will-change: left, top, box-shadow, background;
            mix-blend-mode: screen;
            opacity: 0;
        }
    `;
    document.head.appendChild(style);

    let mouseX = -100, mouseY = -100;
    let curX = -100, curY = -100;
    let lastColorSwitch = Date.now();

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animate() {
        requestAnimationFrame(animate);

        // Smooth follow
        curX += (mouseX - curX) * 0.35;
        curY += (mouseY - curY) * 0.35;

        orb.style.left = curX + 'px';
        orb.style.top = curY + 'px';

        // Cycle colors
        const now = Date.now();
        if (now - lastColorSwitch >= COLOR_CYCLE_MS) {
            lastColorSwitch = now;
            colorIndex = (colorIndex + 1) % ORDER_COLORS.length;
        }

        const c = ORDER_COLORS[colorIndex];
        const t = (now - lastColorSwitch) / COLOR_CYCLE_MS;

        // Pulsing glow intensity
        const pulse = 0.7 + Math.sin(now * 0.005) * 0.3;
        const innerAlpha = (0.9 * pulse).toFixed(2);
        const midAlpha = (0.5 * pulse).toFixed(2);
        const outerAlpha = (0.2 * pulse).toFixed(2);

        orb.style.background = `radial-gradient(circle, ${c.glow}${innerAlpha}) 0%, ${c.glow}${midAlpha}) 40%, ${c.glow}0) 100%)`;
        orb.style.boxShadow = `0 0 ${6 + pulse * 4}px ${2 + pulse * 2}px ${c.glow}${outerAlpha}), 0 0 ${12 + pulse * 8}px ${c.glow}${(0.1 * pulse).toFixed(2)})`;
    }

    animate();

    // Show/hide
    document.addEventListener('mouseenter', () => { orb.style.opacity = '1'; });
    document.addEventListener('mouseleave', () => { orb.style.opacity = '0'; });
    document.addEventListener('mousemove', () => { orb.style.opacity = '1'; }, { once: true });

    // Hide on pure touch devices
    if ('ontouchstart' in window && !window.matchMedia('(pointer:fine)').matches) {
        style.textContent = '';
        orb.style.display = 'none';
    }
})();
