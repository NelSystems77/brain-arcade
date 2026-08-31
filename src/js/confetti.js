// Confeti en canvas, sin dependencias. Se autolimpia cuando no quedan partículas.

const COLORS = ['#7c5cff', '#ff5da2', '#ffb703', '#22c55e', '#3b82f6', '#06b6d4', '#f472b6'];

let canvas = null;
let cctx = null;
let raf = null;
let particles = [];
let unavailable = false;

function reducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function ensureCanvas() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
        position: 'fixed', inset: '0', width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: '2000',
    });
    document.body.appendChild(canvas);
    cctx = canvas.getContext('2d');
    if (!cctx) {
        unavailable = true;
        canvas.remove();
        canvas = null;
        return;
    }
    resize();
    window.addEventListener('resize', resize);
}

function resize() {
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function spawn(count, ox, oy) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 8;
        particles.push({
            x: ox, y: oy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 7,
            g: 0.16 + Math.random() * 0.14,
            size: 6 + Math.random() * 8,
            color: COLORS[(Math.random() * COLORS.length) | 0],
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.35,
            life: 1,
            decay: 0.007 + Math.random() * 0.01,
            rect: Math.random() < 0.55,
        });
    }
}

function frame() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    cctx.clearRect(0, 0, w, h);

    particles = particles.filter((p) => p.life > 0 && p.y < h + 60);
    for (const p of particles) {
        p.vy += p.g;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= p.decay;

        cctx.save();
        cctx.globalAlpha = Math.max(0, p.life);
        cctx.translate(p.x, p.y);
        cctx.rotate(p.rot);
        cctx.fillStyle = p.color;
        if (p.rect) cctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        else { cctx.beginPath(); cctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); cctx.fill(); }
        cctx.restore();
    }

    if (particles.length) {
        raf = requestAnimationFrame(frame);
    } else {
        cancelAnimationFrame(raf);
        raf = null;
        cctx.clearRect(0, 0, w, h);
    }
}

/** Lanza una ráfaga de confeti. `x` / `y` son fracciones (0–1) de la ventana. */
export function celebrate({ x = 0.5, y = 0.4, count = 150 } = {}) {
    if (reducedMotion() || unavailable) return;
    ensureCanvas();
    if (!cctx) return;
    spawn(count, x * window.innerWidth, y * window.innerHeight);
    if (!raf) raf = requestAnimationFrame(frame);
}
