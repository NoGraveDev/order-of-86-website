/* ── Glowing Orb Cursor (Performance-Optimized) ──────────── */
(function(){
    if ('ontouchstart' in window && !window.matchMedia('(pointer:fine)').matches) return;

    const ORDER_COLORS = [
        { name: 'Flame',   rgb: '255,69,0' },
        { name: 'Radiant', rgb: '255,215,0' },
        { name: 'Deep',    rgb: '30,144,255' },
        { name: 'Wild',    rgb: '34,139,34' },
        { name: 'Arcane',  rgb: '123,84,201' },
        { name: 'Heart',   rgb: '197,91,183' },
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
            will-change: transform;
            opacity: 0;
            transition: opacity 0.2s;
            background: radial-gradient(circle, rgba(255,215,0,0.9) 0%, rgba(255,215,0,0) 100%);
        }
    `;
    document.head.appendChild(style);

    let mouseX = -100, mouseY = -100;
    let curX = -100, curY = -100;
    let lastColorSwitch = Date.now();
    let isVisible = false;
    let rafId = null;

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
        curX += (mouseX - curX) * 0.35;
        curY += (mouseY - curY) * 0.35;
        orb.style.transform = `translate(${curX - ORB_SIZE/2}px, ${curY - ORB_SIZE/2}px)`;

        // Color cycle — only update gradient when color changes (every 8s)
        const now = Date.now();
        if (now - lastColorSwitch >= COLOR_CYCLE_MS) {
            lastColorSwitch = now;
            colorIndex = (colorIndex + 1) % ORDER_COLORS.length;
            const rgb = ORDER_COLORS[colorIndex].rgb;
            orb.style.background = `radial-gradient(circle, rgba(${rgb},0.9) 0%, rgba(${rgb},0) 100%)`;
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
