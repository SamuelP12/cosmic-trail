/* =====================================================
   Cosmic Trail — interactions
   ===================================================== */
(function () {
    'use strict';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Smooth scroll (Lenis) ---------- */
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

    /* ---------- Starfield ---------- */
    const canvas = document.getElementById('starfield');
    const ctx = canvas && canvas.getContext('2d');
    let stars = [], W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

    function buildStars() {
        W = window.innerWidth; H = window.innerHeight;
        canvas.width = W * dpr; canvas.height = H * dpr;
        canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.min(420, Math.round((W * H) / 4200));
        stars = [];
        for (let i = 0; i < count; i++) {
            const z = Math.pow(Math.random(), 1.6) * 0.85 + 0.15; // depth, weighted near
            stars.push({
                x: Math.random() * W,
                y: Math.random() * H,
                z: z,
                r: z * 1.5 + 0.2,
                tw: Math.random() * Math.PI * 2,                 // twinkle phase
                hue: Math.random() < 0.12 ? (Math.random() < 0.5 ? 'teal' : 'gold') : 'white'
            });
        }
    }
    const tint = { white: '255,255,255', teal: '120,235,205', gold: '245,200,120' };

    /* ---------- Scroll state shared by the loop ---------- */
    let lastY = window.scrollY || 0;
    let smoothVel = 0;
    const parallaxEls = Array.from(document.querySelectorAll('[data-depth]'));
    const trailLine = document.getElementById('trailLine');
    const trailSection = document.getElementById('trail');
    const comet = document.getElementById('comet');
    let trailLen = trailLine ? trailLine.getTotalLength() : 0;
    if (trailLine) { trailLine.style.strokeDasharray = trailLen; trailLine.style.strokeDashoffset = trailLen; }

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    function frame(t) {
        const y = window.scrollY || 0;
        const vel = y - lastY; lastY = y;
        smoothVel = smoothVel * 0.82 + vel * 0.18;
        const time = t * 0.001;

        /* Starfield — fades out as the sky brightens toward dawn */
        if (ctx) {
            ctx.clearRect(0, 0, W, H);
            const docMax = document.documentElement.scrollHeight - H;
            const prog = docMax > 0 ? y / docMax : 0;
            const skyFade = clamp(1 - prog / 0.46, 0, 1);   // stars gone by ~46% down
            if (skyFade <= 0.01) { /* daytime: no stars */ }
            else {
            const warp = clamp(Math.abs(smoothVel), 0, 90);
            const dir = smoothVel >= 0 ? 1 : -1;
            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                const off = (y * s.z * 0.45) % H;
                let yy = s.y - off; yy = ((yy % H) + H) % H;
                const twinkle = 0.55 + 0.45 * Math.sin(time * 1.5 + s.tw);
                const alpha = (0.25 + s.z * 0.6) * twinkle * skyFade;
                const streak = warp * s.z * 0.5;
                ctx.beginPath();
                if (streak > 1.5) {
                    ctx.strokeStyle = 'rgba(' + tint[s.hue] + ',' + alpha.toFixed(3) + ')';
                    ctx.lineWidth = s.r;
                    ctx.moveTo(s.x, yy);
                    ctx.lineTo(s.x, yy + streak * dir);
                    ctx.stroke();
                } else {
                    ctx.fillStyle = 'rgba(' + tint[s.hue] + ',' + alpha.toFixed(3) + ')';
                    ctx.arc(s.x, yy, s.r, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            }
        }

        /* Parallax orbs + mountain ranges */
        const vh = window.innerHeight;
        for (let i = 0; i < parallaxEls.length; i++) {
            const el = parallaxEls[i];
            const rect = el.getBoundingClientRect();
            const fromCenter = (rect.top + rect.height / 2) - vh / 2;
            const depth = parseFloat(el.dataset.depth) || 0.15;
            el.style.transform = 'translate3d(0,' + (-fromCenter * depth).toFixed(1) + 'px,0)';
        }

        /* Trail draws itself through its section */
        if (trailLine && trailSection) {
            const r = trailSection.getBoundingClientRect();
            const p = clamp((vh * 0.85 - r.top) / (r.height * 0.7), 0, 1);
            trailLine.style.strokeDashoffset = (trailLen * (1 - p)).toFixed(1);
        }

        /* Comet progress */
        if (comet) {
            const max = document.documentElement.scrollHeight - vh;
            comet.style.top = (max > 0 ? (y / max) * 100 : 0).toFixed(2) + '%';
        }

        requestAnimationFrame(frame);
    }

    if (ctx && !reduceMotion) {
        buildStars();
        let rt;
        window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(buildStars, 200); });
        requestAnimationFrame(frame);
    } else if (ctx) {
        // Reduced motion: a calm static starfield
        buildStars();
        ctx.clearRect(0, 0, W, H);
        stars.forEach((s) => {
            ctx.beginPath();
            ctx.fillStyle = 'rgba(' + tint[s.hue] + ',' + (0.25 + s.z * 0.5).toFixed(3) + ')';
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    /* ---------- Nav scrolled state ---------- */
    const nav = document.getElementById('nav');
    const onScroll = () => { if (nav) nav.classList.toggle('scrolled', (window.scrollY || 0) > 20); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ---------- Reveal on scroll (gentle stagger) ---------- */
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !reduceMotion) {
        reveals.forEach((el) => {
            const sibs = Array.from(el.parentElement.children).filter((c) => c.classList.contains('reveal'));
            const i = sibs.indexOf(el);
            if (sibs.length > 1 && i > 0) el.style.setProperty('--reveal-delay', Math.min(i * 110, 660) + 'ms');
        });
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
        }, { threshold: 0.15, rootMargin: '0px 0px -12% 0px' });
        reveals.forEach((el) => io.observe(el));
    } else {
        reveals.forEach((el) => el.classList.add('in'));
    }

    /* ---------- Count-up for facts (only when value is a real number) ---------- */
    if ('IntersectionObserver' in window && !reduceMotion) {
        const cio = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (!e.isIntersecting) return;
                const el = e.target;
                const target = parseInt(el.dataset.count, 10);
                cio.unobserve(el);
                if (!target) return; // placeholders (000) stay as-is
                const dur = 1200, t0 = performance.now();
                const tick = (now) => {
                    const p = clamp((now - t0) / dur, 0, 1);
                    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            });
        }, { threshold: 0.6 });
        document.querySelectorAll('.fact-num[data-count]').forEach((el) => cio.observe(el));
    }

    /* ---------- Photo reel: build, auto-pan, drag ---------- */
    const track = document.getElementById('reelTrack');
    const viewport = document.getElementById('reelViewport');
    if (track && viewport) {
        const items = (window.GALLERY && window.GALLERY.length) ? window.GALLERY : [];
        const makeCard = (item) => {
            if (!item) {
                const ph = document.createElement('div');
                ph.className = 'reel-card placeholder';
                ph.textContent = 'Add photos';
                return ph;
            }
            const fig = document.createElement('figure');
            fig.className = 'reel-card';
            const img = document.createElement('img');
            img.loading = 'lazy';
            img.alt = item.caption || '';
            img.src = /:\/\//.test(item.src) ? item.src : ('photos/' + item.src);
            fig.appendChild(img);
            if (item.caption) {
                const cap = document.createElement('figcaption');
                cap.textContent = item.caption;
                fig.appendChild(cap);
            }
            return fig;
        };

        const source = items.length ? items : [null, null, null, null];
        // Duplicate the set so the strip can loop seamlessly.
        source.concat(source).forEach((it) => track.appendChild(makeCard(it)));

        let offset = 0, half = 0, dragging = false, startX = 0, startOffset = 0, lastPX = 0, dragVel = 0;
        const measure = () => { half = track.scrollWidth / 2; };
        window.addEventListener('load', measure);
        setTimeout(measure, 400);
        window.addEventListener('resize', measure);

        const auto = 0.5; // px per frame drift
        function reelLoop() {
            if (!dragging) offset -= (auto + dragVel);
            dragVel *= 0.92;
            if (half > 0) {
                if (offset <= -half) offset += half;
                if (offset > 0) offset -= half;
            }
            track.style.transform = 'translate3d(' + offset.toFixed(1) + 'px,0,0)';
            requestAnimationFrame(reelLoop);
        }
        if (!reduceMotion) requestAnimationFrame(reelLoop);
        else { measure(); }

        const down = (x) => { dragging = true; viewport.classList.add('dragging'); startX = x; startOffset = offset; lastPX = x; dragVel = 0; };
        const move = (x) => { if (!dragging) return; offset = startOffset + (x - startX); dragVel = (lastPX - x) * 0.25; lastPX = x; };
        const up = () => { dragging = false; viewport.classList.remove('dragging'); };

        viewport.addEventListener('pointerdown', (e) => { down(e.clientX); });
        window.addEventListener('pointermove', (e) => { if (dragging) { e.preventDefault(); move(e.clientX); } });
        window.addEventListener('pointerup', up);
        viewport.addEventListener('pointerleave', () => { /* keep dragging if button held; up handled globally */ });
    }
})();
