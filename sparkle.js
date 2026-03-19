/* ── Sparkle Trail (Ultra-Light) ──────────────────────── */
(function(){
    if ('ontouchstart' in window && !window.matchMedia('(pointer:fine)').matches) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9998;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let W, H;
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    const MAX = 40;
    const pool = new Float32Array(MAX * 7);
    const colors = ['#ffd700','#ffe066','#ffffff','#c9a86c','#7b54c9'];
    const colorArr = new Array(MAX);
    let count = 0;
    let mx = -100, my = -100, lx = -100, ly = -100;
    let active = false, idle = 0, raf = null;
    let tabVisible = true;

    document.addEventListener('visibilitychange', function() {
        tabVisible = !document.hidden;
        if (!tabVisible) { raf = null; }
        else if (active && !raf) { raf = requestAnimationFrame(tick); }
    });

    document.addEventListener('mousemove', function(e) {
        mx = e.clientX; my = e.clientY;
        active = true; idle = 0;
        if (!raf && tabVisible) raf = requestAnimationFrame(tick);
    });

    function spawn(x, y, n) {
        for (var i = 0; i < n && count < MAX; i++) {
            var a = Math.random() * 6.28;
            var s = Math.random() * 1.5 + 0.3;
            var o = count * 7;
            pool[o] = x; pool[o+1] = y;
            pool[o+2] = Math.cos(a)*s; pool[o+3] = Math.sin(a)*s - 0.5;
            pool[o+4] = Math.random() * 2 + 0.8;
            pool[o+5] = 12 + Math.random() * 10;
            pool[o+6] = 0;
            colorArr[count] = colors[(Math.random()*colors.length)|0];
            count++;
        }
    }

    document.addEventListener('click', function(e) { spawn(e.clientX, e.clientY, 5); });

    function tick() {
        if (!tabVisible) { raf = null; return; }
        ctx.clearRect(0, 0, W, H);

        var dx = mx - lx, dy = my - ly;
        if (dx*dx + dy*dy > 16) { spawn(mx, my, 1); lx = mx; ly = my; }

        for (var i = count - 1; i >= 0; i--) {
            var o = i * 7;
            pool[o] += pool[o+2];
            pool[o+1] += pool[o+3];
            pool[o+3] += 0.04;
            pool[o+6]++;

            if (pool[o+6] >= pool[o+5]) {
                var last = (count-1)*7;
                if (i < count-1) {
                    for (var j=0;j<7;j++) pool[o+j] = pool[last+j];
                    colorArr[i] = colorArr[count-1];
                }
                count--;
                continue;
            }

            var p = pool[o+6] / pool[o+5];
            var alpha = 1 - p;
            var sz = pool[o+4] * (1 - p * 0.5);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = colorArr[i];
            ctx.beginPath();
            ctx.arc(pool[o], pool[o+1], sz, 0, 6.28);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        idle++;
        if (count === 0 && idle > 60) { raf = null; return; }
        raf = requestAnimationFrame(tick);
    }
})();
