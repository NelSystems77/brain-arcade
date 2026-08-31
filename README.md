# BrainArcade 🎮🧠

Colección modular de puzzles en JavaScript vanilla: **anagramas**, **memoria visual**,
**sudoku** y **crucigrama**, con sistema de niveles, XP y progreso persistente.

## Estructura

```
src/
  index.html          # markup + <script defer src="./app.js">
  css/styles.css       # estilos (se empaqueta a dist/app.css)
  js/
    main.js            # punto de entrada: navegación, modales, tema
    config.js          # constantes (XP, recompensas, niveles de desbloqueo)
    data.js            # temáticas y contenidos (cine, rock, biblia, 80s)
    userManager.js     # XP / nivel / localStorage
    utils.js           # shuffle (Fisher–Yates), randomItem
    games/             # una clase por juego, con API común: new Game(area, data, onWin).start()
scripts/build.mjs      # build / dev server con esbuild (sin config)
.github/workflows/deploy.yml   # CI: build + deploy a GitHub Pages
```

Cada juego expone `start()` y, opcionalmente, `destroy()` (limpieza de listeners).

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173 con recarga al guardar
npm run build    # genera ./dist (minificado)
```

`dist/` es artefacto de build y está en `.gitignore`.

## Despliegue (GitHub Pages)

El workflow `deploy.yml` compila y publica `dist/` en cada push a `main`.
**Requiere un cambio único de configuración:** en el repo, `Settings → Pages → Build and
deployment → Source` debe estar en **GitHub Actions** (antes servía la raíz de la rama).

## Qué se optimizó

- **Empaquetado**: fuentes en `src/`, bundle+minificado con esbuild, scripts `defer`
  (antes 8 `<script>` bloqueantes con clases globales).
- **Barajado justo**: Fisher–Yates en lugar de `sort(() => 0.5 - Math.random())`
  (sesgado) en memoria, sudoku y anagramas.
- **Subida de nivel**: ahora sube varios niveles de golpe si la recompensa lo permite.
- **Modo oscuro persistente** y que respeta `prefers-color-scheme`.
- **Desbloqueo real por nivel** (config en `config.js`) en vez de una clase `locked` fija.
- **Anagramas**: el resultado barajado nunca coincide con la palabra original; la
  comparación ignora espacios y mayúsculas; se evita repetir palabra.
- **Fugas de listeners**: `destroy()` limpia el teclado físico del sudoku entre partidas.
- **Accesibilidad**: tarjetas como `<button>`, `aria-live` en feedback, `role="dialog"`
  en el modal, `:focus-visible`, `prefers-reduced-motion`.
- **Robustez**: `localStorage` envuelto en try/catch; carga de datos vacía controlada.
