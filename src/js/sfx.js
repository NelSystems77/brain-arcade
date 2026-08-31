// Efectos de sonido sintetizados con WebAudio. Sin archivos, sin dependencias.

const MUTE_KEY = 'brainArcadeMuted';

let ctx = null;
let muted = false;
try {
    muted = localStorage.getItem(MUTE_KEY) === '1';
} catch { /* almacenamiento no disponible */ }

/** Crea/reanuda el AudioContext (requiere un gesto previo del usuario). */
function audio() {
    if (!ctx) {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (!Ctor) return null;
        ctx = new Ctor();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
}

function tone({ freq = 440, type = 'sine', dur = 0.15, vol = 0.2, slideTo = null, delay = 0 }) {
    const c = audio();
    if (!c) return;
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
}

function arpeggio(freqs, opts = {}) {
    const step = opts.step ?? 0.09;
    freqs.forEach((f, i) => tone({ freq: f, type: opts.type ?? 'triangle', dur: opts.dur ?? 0.18, vol: opts.vol ?? 0.16, delay: i * step }));
}

const SOUNDS = {
    click: () => tone({ freq: 300, type: 'triangle', dur: 0.07, vol: 0.14, slideTo: 440 }),
    flip: () => tone({ freq: 520, type: 'sine', dur: 0.08, vol: 0.1, slideTo: 720 }),
    match: () => { tone({ freq: 660, dur: 0.1, vol: 0.16 }); tone({ freq: 990, dur: 0.13, vol: 0.16, delay: 0.09 }); },
    wrong: () => tone({ freq: 220, type: 'sawtooth', dur: 0.24, vol: 0.13, slideTo: 120 }),
    win: () => arpeggio([523, 659, 784, 1047]),
    levelup: () => arpeggio([392, 523, 659, 784, 1047], { type: 'square', step: 0.08, vol: 0.13 }),
};

export const sfx = {
    get muted() { return muted; },

    /** Debe llamarse desde un handler de evento de usuario para habilitar el audio. */
    unlock() { audio(); },

    play(name) {
        if (muted) return;
        try { SOUNDS[name]?.(); } catch { /* ignora fallos de audio */ }
    },

    toggle() {
        muted = !muted;
        try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch { /* noop */ }
        if (!muted) this.play('click');
        return muted;
    },
};
