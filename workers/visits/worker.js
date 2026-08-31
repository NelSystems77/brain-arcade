/**
 * Contador de visitas de BrainArcade — Cloudflare Worker.
 *
 *   GET   -> { total }            (solo lectura, no modifica nada)
 *   POST  -> { total }            (incrementa en 1 y devuelve el nuevo valor)
 *   OPTIONS -> 204                 (preflight CORS)
 *
 * Estado en Workers KV (binding "VISITS"). No usa cookies ni guarda datos
 * personales: solo un entero global. El front (src/js/visits.js) hace un POST
 * por sesión de pestaña y GET en recargas.
 *
 * Nota: KV no tiene incremento atómico; con escrituras muy concurrentes se
 * puede perder alguna cuenta. Para este volumen es irrelevante.
 */

const KEY = 'total';

const ALLOWED_ORIGINS = [
    'https://nelsystems77.github.io',
    'http://localhost:5173',
];

function corsHeaders(origin) {
    const headers = {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        vary: 'Origin',
        'access-control-allow-methods': 'GET, POST, OPTIONS',
        'access-control-allow-headers': 'content-type',
    };
    if (ALLOWED_ORIGINS.includes(origin)) {
        headers['access-control-allow-origin'] = origin;
    }
    return headers;
}

export default {
    async fetch(request, env) {
        const origin = request.headers.get('Origin') ?? '';
        const headers = corsHeaders(origin);

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers });
        }

        if (request.method !== 'GET' && request.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'method not allowed' }), {
                status: 405,
                headers,
            });
        }

        const current = Number(await env.VISITS.get(KEY)) || 0;
        let total = current;

        if (request.method === 'POST') {
            total = current + 1;
            await env.VISITS.put(KEY, String(total));
        }

        return new Response(JSON.stringify({ total }), { headers });
    },
};
