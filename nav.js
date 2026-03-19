/* ── Shared Navigation Logic ──────────────────────── */
(function(){
    'use strict';
    const nav = document.getElementById('nav');
    const hamburger = document.getElementById('hamburger') || document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    // Scroll effect
    if (nav) {
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    nav.classList.toggle('scrolled', window.scrollY > 40);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // Mobile hamburger toggle
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('open');
            mobileMenu.classList.toggle('open');
        });
        mobileMenu.querySelectorAll('a').forEach(function(a) {
            a.addEventListener('click', function() {
                hamburger.classList.remove('open');
                mobileMenu.classList.remove('open');
            });
        });
    }
})();
