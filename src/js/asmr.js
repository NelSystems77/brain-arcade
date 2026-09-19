// Sonidos suaves tipo ASMR para "Mi Dispensa", sintetizados con WebAudio.
// Agua que se vierte (el tono sube al llenarse), cristal, campanas pentatónicas
// y un ambiente cálido. Todo pasa por una reverb corta para sonar redondo.

import { sfx } from './sfx.js';

// Pentatónica mayor de Do: nunca suena disonante, se pueda tocar en el orden que sea.
const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];

let bus = null; // { ctx, out, send }
let noise = null;

function makeImpulse(ctx, secs = 2.4, decay = 2.6) {
    const len = Math.floor(ctx.sampleRate * secs);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** decay;
    }
    return buf;
}

function getBus() {
    const ctx = sfx.context();
    if (!ctx) return null;
    if (bus?.ctx === ctx) return bus;

    const out = ctx.createGain();
    out.gain.value = 0.9;
    out.connect(ctx.destination);

    const send = ctx.createGain();
    const verb = ctx.createConvolver();
    verb.buffer = makeImpulse(ctx);
    const wet = ctx.createGain();
    wet.gain.value = 0.32;
    send.connect(verb).connect(wet).connect(out);

    // Ruido blanco en bucle (base del agua).
    noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const nd = noise.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

    bus = { ctx, out, send };
    return bus;
}

/** Conecta un nodo al bus: señal directa + envío a la reverb. */
function route(b, node, wet = 0.6) {
    node.connect(b.out);
    const s = b.ctx.createGain();
    s.gain.value = wet;
    node.connect(s).connect(b.send);
}

/** Tono con ataque suave y caída exponencial. */
function ping(b, { freq, dur = 0.4, vol = 0.05, type = 'sine', delay = 0, slideTo = null, wet = 0.6 }) {
    const t0 = b.ctx.currentTime + delay;
    const osc = b.ctx.createOscillator();
    const g = b.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    route(b, g, wet);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
}

/** Campana de cristal: fundamental + parcial inarmónico. */
function bell(b, freq, { vol = 0.06, dur = 1.8, delay = 0 } = {}) {
    ping(b, { freq, dur, vol, delay, wet: 0.9 });
    ping(b, { freq: freq * 2.76, dur: dur * 0.45, vol: vol * 0.35, delay, wet: 0.9 });
}

/** Ráfaga corta de ruido filtrado (roce, "tac" de madera). */
function tick(b, { freq = 2200, dur = 0.05, vol = 0.05, delay = 0 } = {}) {
    const t0 = b.ctx.currentTime + delay;
    const src = b.ctx.createBufferSource();
    src.buffer = noise;
    const bp = b.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = freq;
    bp.Q.value = 1.4;
    const g = b.ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(bp).connect(g);
    route(b, g, 0.4);
    src.start(t0, Math.random());
    src.stop(t0 + dur + 0.02);
}

const rand = (a, z) => a + Math.random() * (z - a);

// ---- Ambiente -------------------------------------------------------------
let ambient = null;
let unsubMute = null;

function ambientLevel() {
    return sfx.muted ? 0 : 1;
}

function startAmbient() {
    if (ambient) return;
    const b = getBus();
    if (!b) return;
    const { ctx } = b;

    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.gain.linearRampToValueAtTime(0.05 * Math.max(ambientLevel(), 0.0001), ctx.currentTime + 4);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 800;
    lp.connect(master);
    route(b, master, 0.7);

    // Acorde abierto (Do-Sol-Do-Mi) con pequeña desafinación para un "coro" tibio.
    const oscs = [];
    for (const [f, detune] of [[130.81, -4], [196, 3], [261.63, -2], [329.63, 5], [65.41, 0]]) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        osc.detune.value = detune;
        const g = ctx.createGain();
        g.gain.value = f < 100 ? 0.5 : 0.28;
        // Respiración lenta, cada voz a su ritmo.
        const lfo = ctx.createOscillator();
        lfo.frequency.value = rand(0.05, 0.13);
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.14;
        lfo.connect(lfoGain).connect(g.gain);
        osc.connect(g).connect(lp);
        osc.start();
        lfo.start();
        oscs.push(osc, lfo);
    }

    const state = { ctx, master, oscs, timer: 0 };
    ambient = state;

    // Campanitas lejanas cada pocos segundos.
    const schedule = () => {
        state.timer = setTimeout(() => {
            if (ambient !== state) return;
            if (!sfx.muted) {
                const f = PENTA[Math.floor(Math.random() * 5)] / 2;
                bell(b, f, { vol: 0.03, dur: 3 });
            }
            schedule();
        }, rand(4500, 9000));
    };
    schedule();

    unsubMute = sfx.onMuteChange(() => {
        if (ambient !== state) return;
        const t = ctx.currentTime;
        master.gain.cancelScheduledValues(t);
        master.gain.setTargetAtTime(0.05 * ambientLevel() || 0.0001, t, 0.3);
    });
}

function stopAmbient() {
    const a = ambient;
    if (!a) return;
    ambient = null;
    clearTimeout(a.timer);
    unsubMute?.();
    unsubMute = null;
    const t = a.ctx.currentTime;
    a.master.gain.cancelScheduledValues(t);
    a.master.gain.setTargetAtTime(0.0001, t, 0.25);
    setTimeout(() => {
        for (const o of a.oscs) {
            try { o.stop(); } catch { /* ya detenido */ }
        }
        a.master.disconnect();
    }, 1500);
}

// ---- API ------------------------------------------------------------------
function guarded(fn) {
    return (...args) => {
        if (sfx.muted) return undefined;
        try {
            const b = getBus();
            return b ? fn(b, ...args) : undefined;
        } catch {
            return undefined;
        }
    };
}

export const asmr = {
    /** Levantar una botella: un "tink" de cristal. */
    pick: guarded((b) => {
        ping(b, { freq: 1760, dur: 0.28, vol: 0.045 });
        ping(b, { freq: 2637, dur: 0.16, vol: 0.02 });
        tick(b, { freq: 3000, dur: 0.03, vol: 0.02 });
    }),

    /** Soltarla sin verter: golpecito mullido. */
    place: guarded((b) => {
        ping(b, { freq: 520, dur: 0.14, vol: 0.06, slideTo: 390, wet: 0.3 });
        tick(b, { freq: 1800, dur: 0.05, vol: 0.03 });
    }),

    /** Movimiento no permitido: un "hum" grave y amable (nada de zumbidos). */
    deny: guarded((b) => {
        ping(b, { freq: 196, dur: 0.3, vol: 0.07, type: 'triangle', slideTo: 165, wet: 0.4 });
    }),

    /** Envase lleno "a tope": tres notas de cristal que suben, como un suspiro de satisfacción. */
    full: guarded((b) => {
        [2, 3, 5].forEach((n, i) => bell(b, PENTA[n], { vol: 0.045, dur: 1.5, delay: 0.32 + i * 0.11 }));
    }),

    /** Envase ya lleno, no cabe más: dos notas suaves que bajan, un "mmm" amable. */
    blocked: guarded((b) => {
        ping(b, { freq: 392, dur: 0.32, vol: 0.06, wet: 0.5 });
        ping(b, { freq: 330, dur: 0.42, vol: 0.055, delay: 0.13, wet: 0.5 });
        tick(b, { freq: 900, dur: 0.05, vol: 0.02 });
    }),

    /**
     * Agua cayendo. `from`/`to` = nivel de llenado (0-1) del destino: el tono
     * sube mientras se llena, como en la vida real.
     */
    pour: guarded((b, { dur = 1, from = 0, to = 0.5 } = {}) => {
        const { ctx } = b;
        const t0 = ctx.currentTime;
        const end = t0 + dur;

        const src = ctx.createBufferSource();
        src.buffer = noise;
        src.loop = true;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.Q.value = 1.1;
        bp.frequency.setValueAtTime(520 + from * 1500, t0);
        bp.frequency.linearRampToValueAtTime(520 + to * 1500, end);
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 3200;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(0.11, t0 + 0.12);
        g.gain.setValueAtTime(0.11, Math.max(t0 + 0.12, end - 0.15));
        g.gain.linearRampToValueAtTime(0.0001, end);
        src.connect(bp).connect(lp).connect(g);
        route(b, g, 0.35);
        src.start(t0, Math.random());
        src.stop(end + 0.05);

        // Burbujitas / "glug" repartidas por la duración.
        const bubbles = Math.max(3, Math.round(dur * 9));
        for (let i = 0; i < bubbles; i++) {
            const at = rand(0.05, Math.max(0.1, dur - 0.1));
            const base = 260 + (from + (to - from) * (at / dur)) * 380 + rand(-40, 60);
            ping(b, { freq: base, slideTo: base * 1.7, dur: rand(0.05, 0.1), vol: rand(0.02, 0.045), delay: at, wet: 0.5 });
        }
    }),

    /** Al terminar: gotitas que se asientan. */
    settle: guarded((b) => {
        ping(b, { freq: 700, slideTo: 1100, dur: 0.09, vol: 0.04 });
        ping(b, { freq: 940, slideTo: 1400, dur: 0.08, vol: 0.025, delay: 0.11 });
    }),

    /** Victoria: campanas de viento en cascada. */
    chime: guarded((b) => {
        const order = [0, 2, 3, 5, 7, 5, 6, 7];
        order.forEach((n, i) => bell(b, PENTA[n], { vol: 0.055, dur: 2.4, delay: i * 0.17 }));
        bell(b, PENTA[0] / 2, { vol: 0.05, dur: 3.5, delay: 0.1 });
    }),

    startAmbient,
    stopAmbient,
};
