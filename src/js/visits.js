// Contador de visitas (opcional). Se activa solo si VISITS_ENDPOINT está
// configurado en config.js. Sin cookies: cuenta una visita por pestaña/sesión
// usando sessionStorage. El fallo es silencioso: el número es decorativo.
import { VISITS_ENDPOINT } from './config.js';

const SESSION_FLAG = 'brainArcadeVisitCounted';

export async function initVisitCounter() {
    const out = document.getElementById('visit-count');
    if (!out || !VISITS_ENDPOINT) return;

    let counted = false;
    try {
        counted = sessionStorage.getItem(SESSION_FLAG) === '1';
    } catch { /* almacenamiento no disponible */ }

    try {
        // GET si ya contamos esta sesión (solo leer); POST la primera vez (incrementa).
        const res = await fetch(VISITS_ENDPOINT, { method: counted ? 'GET' : 'POST' });
        if (!res.ok) return;

        const { total } = await res.json();
        if (typeof total !== 'number') return;

        try { sessionStorage.setItem(SESSION_FLAG, '1'); } catch { /* ignore */ }

        out.textContent = total.toLocaleString('es-CR');
        out.closest('.app-footer__visits')?.removeAttribute('hidden');
    } catch { /* red caída u otro error: no mostramos nada */ }
}
