// Punto único de acceso a los efectos (sonido, confeti, sacudida).

export { sfx } from './sfx.js';
export { celebrate } from './confetti.js';

/** Sacude brevemente un elemento (feedback de error). */
export function shake(el) {
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.classList.remove('fx-shake');
    void el.offsetWidth; // reinicia la animación
    el.classList.add('fx-shake');
    el.addEventListener('animationend', function done(e) {
        if (e.target !== el || e.animationName !== 'fx-shake') return;
        el.classList.remove('fx-shake');
        el.removeEventListener('animationend', done);
    });
}
