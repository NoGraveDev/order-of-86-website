/* ── Glowing Orb Cursor (Performance-Optimized) ──────────── */
(function(){
    if ('ontouchstart' in window && !window.matchMedia('(pointer:fine)').matches) return;

    var ORDER_COLORS = [
        { name: 'Flame',   rgb: '255,69,0' },
        { name: 'Radiant', rgb: '255,215,0' },
        { name: 'Deep',    rgb: '30,144,255' },
        { name: 'Wild',    rgb: '34,139,34' },
        { name: 'Arcane',  rgb: '123,84,201' },
        { name: 'Heart',   rgb: '197,91,183' },
    ];

    var colorIndex = 0;
    var COLOR_CYCLE_MS = 8000;
    var ORB_SIZE = 14;

    var orb = document.createElement('div');
    orb.id = 'orbCursor';
    document.body.appendChild(orb);

    var style = document.createElement('style');
    style.textContent =
        '* { cursor: none !important; }' +
        '#orbCursor {' +
            'position: fixed;' +
            'width: ' + ORB_SIZE + 'px;' +
            'height: ' + ORB_SIZE + 'px;' +
            'border-radius: 50%;' +
            'pointer-events: none;' +
            'z-index: 99999;' +
            'will-change: transform;' +
            'opacity: 0;' +
            'transition: opacity 0.2s;' +
            'background: radial-gradient(circle, rgba(255,215,0,0.9) 0%, rgba(255,215,0,0) 100%);' +
        '}';
    document.head.appendChild(style);

    var mouseX = -100, mouseY = -100;
    var curX = -100, curY = -100;
    var lastColorSwitch = Date.now();
    var isVisible = false;
    var rafId = null;
    var tabVisible = true;

    document.addEventListener('visibilitychange', function() {
        tabVisible = !document.hidden;
        if (!tabVisible) {
            rafId = null;
        } else if (isVisible && !rafId) {
            rafId = requestAnimationFrame(animate);
        }
    });

    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!isVisible) {
            isVisible = true;
            orb.style.opacity = '1';
            if (!rafId && tabVisible) rafId = requestAnimationFrame(animate);
        }
    });

    function animate() {
        if (!tabVisible) { rafId = null; return; }
        curX += (mouseX - curX) * 0.35;
        curY += (mouseY - curY) * 0.35;
        orb.style.transform = 'translate(' + (curX - ORB_SIZE/2) + 'px, ' + (curY - ORB_SIZE/2) + 'px)';

        var now = Date.now();
        if (now - lastColorSwitch >= COLOR_CYCLE_MS) {
            lastColorSwitch = now;
            colorIndex = (colorIndex + 1) % ORDER_COLORS.length;
            var rgb = ORDER_COLORS[colorIndex].rgb;
            orb.style.background = 'radial-gradient(circle, rgba(' + rgb + ',0.9) 0%, rgba(' + rgb + ',0) 100%)';
        }

        if (isVisible) {
            rafId = requestAnimationFrame(animate);
        }
    }

    document.addEventListener('mouseenter', function() {
        isVisible = true;
        orb.style.opacity = '1';
        if (!rafId && tabVisible) rafId = requestAnimationFrame(animate);
    });
    document.addEventListener('mouseleave', function() {
        isVisible = false;
        orb.style.opacity = '0';
        rafId = null;
    });
})();
