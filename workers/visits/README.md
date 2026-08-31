# Contador de visitas (Cloudflare Worker)

Endpoint propio para contabilizar visitas sin terceros, sin cookies y sin datos
personales. Guarda un único entero en Workers KV.

- `GET`  → `{ "total": N }` (solo lectura)
- `POST` → incrementa y devuelve `{ "total": N+1 }`

El front (`src/js/visits.js`) hace **un POST por sesión de pestaña** y GET en las
recargas, y muestra el número en el footer. Si `VISITS_ENDPOINT` está vacío en
`src/js/config.js`, el contador queda desactivado y no se hace ninguna petición.

## Plan gratuito de Cloudflare

Workers: 100 000 peticiones/día. KV: 100 000 lecturas + 1 000 escrituras/día,
1 GB. Sobra de largo. No pide tarjeta.

---

## Opción A — Desde el panel de Cloudflare (sin instalar nada)

1. Crea una cuenta en <https://dash.cloudflare.com> y entra a **Workers & Pages**.
2. **Create application → Create Worker**. Nombre: `brain-arcade-visits`. Deploy.
3. **Edit code**: borra el ejemplo y pega el contenido de [`worker.js`](./worker.js). Deploy.
4. **KV**: en el menú lateral, **Storage & Databases → KV → Create a namespace**,
   nombre `brain-arcade-visits`.
5. Vuelve al Worker → **Settings → Bindings → Add → KV namespace**:
   - Variable name: `VISITS`
   - KV namespace: el que creaste
   - Deploy.
6. Copia la URL del Worker (`https://brain-arcade-visits.TU-SUBDOMINIO.workers.dev`)
   y pégala en `VISITS_ENDPOINT` de [`../../src/js/config.js`](../../src/js/config.js).
7. `npm run build`, commit y push. Al desplegar Pages, el footer mostrará las visitas.

## Opción B — Con Wrangler (CLI)

```bash
cd workers/visits
npx wrangler login
npx wrangler kv namespace create VISITS      # copia el id a wrangler.toml
npx wrangler deploy
```

Luego pon la URL resultante en `VISITS_ENDPOINT` (paso 6 de arriba).

---

## Ajustes

- **Orígenes permitidos (CORS)**: edita `ALLOWED_ORIGINS` en `worker.js` si cambias
  de dominio o pruebas en otro puerto local.
- **Ver el total sin abrir la web**: `curl https://…workers.dev` (GET no incrementa).
- **Reiniciar el contador**: en el panel, KV → namespace → edita/borra la clave `total`.
- **Ocultar el número del footer**: deja `VISITS_ENDPOINT` con valor pero quita el
  bloque `.app-footer__visits` de `src/index.html` (el POST se sigue haciendo).
