/* =====================================================
   Troop [000] — Mountain interactions
   ===================================================== */
(function () {
    'use strict';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    /* Smooth scroll */
    if (!reduceMotion && window.Lenis) {
        const lenis = new Lenis({ duration: 1.05, lerp: 0.1, wheelMultiplier: 1.0, touchMultiplier: 1.6 });
        const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
        document.querySelectorAll('a[href^="#"]').forEach((a) => {
            a.addEventListener('click', (e) => {
                const id = a.getAttribute('href');
                if (id === '#' || id.length < 2) return;
                const t = document.querySelector(id);
                if (!t) return;
                e.preventDefault();
                lenis.scrollTo(t, { offset: -10, duration: 1.4 });
            });
        });
    }

    /* Footer year */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* Nav state */
    const nav = document.getElementById('nav');
    const onScroll = () => { if (nav) nav.classList.toggle('scrolled', (window.scrollY || 0) > 24); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* Gallery — 7 photo bubbles that slide in along a winding trail */
    const bubblesWrap = document.getElementById('bubbles');
    if (bubblesWrap) {
        const items = (window.GALLERY && window.GALLERY.length) ? window.GALLERY.slice() : [];
        const POS = [
            { l: 30, t: 9.2,  s: -72, max: 230 },
            { l: 70, t: 23.3, s:  72, max: 185 },
            { l: 28, t: 37.5, s: -72, max: 205 },
            { l: 72, t: 51.7, s:  72, max: 175 },
            { l: 30, t: 65.8, s: -72, max: 215 },
            { l: 68, t: 80.0, s:  72, max: 190 },
            { l: 40, t: 92.5, s: -72, max: 235 }
        ];
        POS.forEach((p, i) => {
            const it = items.length ? items[i % items.length] : null;
            const fig = document.createElement('figure');
            fig.className = 'bubble';
            fig.style.cssText = 'left:' + p.l + '%;top:' + p.t + '%;--slide:' + p.s + 'px;--size:clamp(120px,21vw,' + p.max + 'px)';
            const img = document.createElement('img');
            img.loading = 'lazy';
            if (it) { img.src = /:\/\//.test(it.src) ? it.src : ('photos/' + it.src); img.alt = it.caption || ''; }
            fig.appendChild(img);
            bubblesWrap.appendChild(fig);
        });
        const bubbleEls = bubblesWrap.querySelectorAll('.bubble');
        if ('IntersectionObserver' in window && !reduceMotion) {
            const bio = new IntersectionObserver((es) => {
                es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); bio.unobserve(e.target); } });
            }, { threshold: 0.35 });
            bubbleEls.forEach((b) => bio.observe(b));
        } else {
            bubbleEls.forEach((b) => b.classList.add('in'));
        }
    }

    /* Parallax (hero ranges + trail peak) + the trail drawing itself */
    const parallaxEls = Array.from(document.querySelectorAll('[data-depth]'));
    const trailmap = document.getElementById('trailmap');
    const galPath = document.getElementById('galPath');
    if (!reduceMotion && (parallaxEls.length || trailmap)) {
        const frame = () => {
            const vh = window.innerHeight;
            for (let i = 0; i < parallaxEls.length; i++) {
                const el = parallaxEls[i];
                const r = el.getBoundingClientRect();
                const fromCenter = (r.top + r.height / 2) - vh / 2;
                const d = parseFloat(el.dataset.depth) || 0.1;
                el.style.transform = 'translate3d(0,' + (-fromCenter * d * 0.14).toFixed(1) + 'px,0)';
            }
            if (trailmap && galPath) {
                const r = trailmap.getBoundingClientRect();
                const p = clamp((vh * 0.82 - r.top) / (r.height * 0.78), 0, 1);
                galPath.style.strokeDashoffset = (1000 * (1 - p)).toFixed(1);
            }
            requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
    }

    /* Reveal on scroll (gentle stagger) */
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
