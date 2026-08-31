// Lectura en voz alta con la Web Speech API (sin dependencias, sin red).

let preferred = null;

function pickVoice() {
    const voices = window.speechSynthesis?.getVoices?.() ?? [];
    preferred =
        voices.find((v) => /^es[-_]/i.test(v.lang)) ||
        voices.find((v) => v.lang?.toLowerCase().startsWith('es')) ||
        null;
}

if ('speechSynthesis' in window) {
    pickVoice();
    // Algunas plataformas cargan las voces de forma asíncrona.
    window.speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

export function speechAvailable() {
    return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/** Lee `text` en voz alta (español), cancelando cualquier lectura anterior. */
export function speak(text) {
    if (!speechAvailable() || !text) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-ES';
    if (preferred) u.voice = preferred;
    u.rate = 0.95;
    try {
        synth.speak(u);
    } catch { /* algunos navegadores lanzan si no hay interacción previa */ }
}

export function stopSpeaking() {
    if (speechAvailable()) window.speechSynthesis.cancel();
}
