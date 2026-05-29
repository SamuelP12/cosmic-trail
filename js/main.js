/* =====================================================
   Troop [000] — Field Guide interactions
   ===================================================== */
(function () {
    'use strict';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    /* ---------- Smooth scroll ---------- */
    if (!reduceMotion && window.Lenis) {
        const lenis = new Lenis({ duration: 1.05, lerp: 0.1, wheelMultiplier: 1.0, touchMultiplier: 1.6 });
        const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
        document.querySelectorAll('a[href^="#"]').forEach((a) => {
            a.addEventListener('click', (e) => {
                const id = a.getAttribute('href');
                if (id === '#' || id.length < 2) return;
                const target = document.querySelector(id);
                if (!target) return;
                e.preventDefault();
                lenis.scrollTo(target, { offset: -10, duration: 1.4 });
            });
        });
    }

    /* ---------- Footer year ---------- */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Nav state ---------- */
    const nav = document.getElementById('nav');
    const onScroll = () => { if (nav) nav.classList.toggle('scrolled', (window.scrollY || 0) > 20); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ---------- Build the photo wall (4 x 3) from the album ---------- */
    const wall = document.getElementById('photoWall');
    if (wall) {
        const items = (window.GALLERY && window.GALLERY.length) ? window.GALLERY.slice() : [];
        const TILES = 12;
        for (let i = 0; i < TILES; i++) {
            const it = items.length ? items[i % items.length] : null;
            const img = document.createElement('img');
            img.loading = 'lazy';
            if (it) {
                img.src = /:\/\//.test(it.src) ? it.src : ('photos/' + it.src);
                img.alt = it.caption || '';
            } else {
                img.alt = '';
                img.style.background = 'rgba(35,41,31,0.12)';
            }
            wall.appendChild(img);
        }
    }

    /* ---------- Scroll-driven motion (hero parallax + album reveal) ---------- */
    const hills = Array.from(document.querySelectorAll('.hill[data-depth]'));
    const album = document.getElementById('album');
    const ridges = Array.from(document.querySelectorAll('.ridge'));
    const caption = document.querySelector('.album-caption');

    function frame() {
        const y = window.scrollY || 0;
        const vh = window.innerHeight;

        // Hero hills: gentle parallax drift
        for (let i = 0; i < hills.length; i++) {
            const d = parseFloat(hills[i].dataset.depth) || 0.1;
            hills[i].style.transform = 'translate3d(0,' + (y * d * 0.35).toFixed(1) + 'px,0)';
        }

        // Album: ridgeline lifts to reveal the photo wall
        if (album && ridges.length) {
            const rect = album.getBoundingClientRect();
            const total = album.offsetHeight - vh;
            const p = clamp(-rect.top / total, 0, 1);
            for (let i = 0; i < ridges.length; i++) {
                const rise = parseFloat(ridges[i].dataset.rise) || 1;
                ridges[i].style.transform = 'translate3d(0,' + (-p * vh * rise).toFixed(1) + 'px,0)';
            }
            if (wall) wall.style.transform = 'scale(' + (1.12 - 0.12 * p).toFixed(3) + ')';
            if (caption) caption.style.opacity = clamp((p - 0.22) / 0.4, 0, 1).toFixed(3);
        }

        requestAnimationFrame(frame);
    }
    if (!reduceMotion) requestAnimationFrame(frame);
    else if (caption) caption.style.opacity = 1;

    /* ---------- Reveal on scroll (gentle stagger) ---------- */
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !reduceMotion) {
        reveals.forEach((el) => {
            const sibs = Array.from(el.parentElement.children).filter((c) => c.classList.contains('reveal'));
            const i = sibs.indexOf(el);
            if (sibs.length > 1 && i > 0) el.style.setProperty('--reveal-delay', Math.min(i * 100, 500) + 'ms');
        });
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
        }, { threshold: 0.16, rootMargin: '0px 0px -10% 0px' });
        reveals.forEach((el) => io.observe(el));
    } else {
        reveals.forEach((el) => el.classList.add('in'));
    }
})();
