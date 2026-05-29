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

    /* Nav state + scroll progress bar */
    const nav = document.getElementById('nav');
    const progress = document.getElementById('progress');
    const onScroll = () => {
        const y = window.scrollY || 0;
        if (nav) nav.classList.toggle('scrolled', y > 24);
        if (progress) {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            progress.style.width = (max > 0 ? (y / max) * 100 : 0).toFixed(2) + '%';
        }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* Gallery: build the side-by-side photo row from the album */
    const photoRow = document.getElementById('photoRow');
    if (photoRow) {
        const items = (window.GALLERY && window.GALLERY.length) ? window.GALLERY.slice() : [];
        const N = items.length ? items.length : 7;
        for (let i = 0; i < N; i++) {
            const it = items.length ? items[i] : null;
            const fig = document.createElement('figure');
            const img = document.createElement('img');
            img.loading = 'lazy';
            if (it) { img.src = /:\/\//.test(it.src) ? it.src : ('photos/' + it.src); img.alt = it.caption || ''; }
            fig.appendChild(img);
            photoRow.appendChild(fig);
        }
    }

    /* Scroll-driven motion:
       - hero ranges parallax
       - trail intro: the trail draws + a marker descends, leading to the mountains
       - album (pinned): the mountains lift, then the photo row pans 3-at-a-time */
    const ranges = Array.from(document.querySelectorAll('.range[data-depth]'));
    const trailIntro = document.getElementById('trailIntro');
    const album = document.getElementById('album');
    const downPath = document.getElementById('downPath');
    const marker = document.getElementById('trailMarker');
    const risers = Array.from(document.querySelectorAll('.ridge'));
    const cap = document.querySelector('.reveal-cap');
    const albumHead = document.getElementById('albumHead');
    const pathLen = downPath ? downPath.getTotalLength() : 0;
    if (downPath) { downPath.style.strokeDasharray = pathLen; downPath.style.strokeDashoffset = pathLen; }

    if (!reduceMotion) {
        const frame = () => {
            const y = window.scrollY || 0;
            const vh = window.innerHeight;

            // hero ranges parallax
            for (let i = 0; i < ranges.length; i++) {
                const d = parseFloat(ranges[i].dataset.depth) || 0.1;
                ranges[i].style.transform = 'translate3d(0,' + (y * d * 0.32).toFixed(1) + 'px,0)';
            }

            // the trail leads down toward the mountains
            if (trailIntro && downPath) {
                const r = trailIntro.getBoundingClientRect();
                const tp = clamp((vh * 0.6 - r.top) / (r.height * 0.7), 0, 1);
                downPath.style.strokeDashoffset = (pathLen * (1 - tp)).toFixed(1);
                if (marker && pathLen) {
                    const pt = downPath.getPointAtLength(tp * pathLen);
                    marker.setAttribute('cx', pt.x.toFixed(2));
                    marker.setAttribute('cy', pt.y.toFixed(2));
                    marker.style.opacity = (tp > 0.02 && tp < 0.985) ? 1 : 0;
                }
                if (albumHead) albumHead.style.opacity = (1 - clamp((tp - 0.5) / 0.4, 0, 1)).toFixed(3);
            }

            // the mountains lift, then the photo row pans
            if (album) {
                const r = album.getBoundingClientRect();
                const total = album.offsetHeight - vh;
                const p = clamp(-r.top / total, 0, 1);
                const pSink = clamp(p / 0.62, 0, 1);             // layers sink away, hills → mountains
                const pPan  = clamp((p - 0.52) / 0.48, 0, 1);    // photos scroll as soon as they show

                // each layer sinks in turn (front hills first, far mountains last)
                for (let i = 0; i < risers.length; i++) {
                    const delay = parseFloat(risers[i].dataset.delay) || 0;
                    const local = clamp((pSink - delay) / 0.34, 0, 1);
                    risers[i].style.transform = 'translate3d(0,' + (local * vh * 1.25).toFixed(1) + 'px,0)';
                }
                if (photoRow) {
                    const maxPan = Math.max(0, photoRow.scrollWidth - window.innerWidth);
                    photoRow.style.transform = 'translate3d(' + (-maxPan * pPan).toFixed(1) + 'px,0,0)';
                }
                if (cap) cap.style.opacity = clamp((pSink - 0.62) / 0.2, 0, 1).toFixed(3);
            }

            requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
    } else if (cap) {
        cap.style.opacity = 1;
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
