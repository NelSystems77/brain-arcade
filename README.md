# BrainArcade 🎮🧠

Colección modular de puzzles en JavaScript vanilla: **anagramas**, **memoria visual**,
**sudoku**, **trivia** y **crucigrama**, con sistema de niveles, XP y progreso persistente.

## Estructura

```
src/
  index.html          # markup + <script defer src="./app.js">
  css/styles.css       # estilos (se empaqueta a dist/app.css)
  js/
    main.js            # punto de entrada: navegación, modales, tema
    config.js          # constantes (XP, recompensas, niveles de desbloqueo, trivia)
    data.js            # temáticas y contenidos (cine, rock, biblia, 80s): anagramas, memoria, crucigrama, trivia
    userManager.js     # XP / nivel / localStorage
    utils.js           # shuffle (Fisher–Yates), randomItem
    sfx.js             # efectos de sonido sintetizados (WebAudio)
    confetti.js        # confeti en canvas, sin dependencias
    fx.js              # fachada: sfx + celebrate + shake
    games/             # anagrams · memory · sudoku · trivia · crossword
                       #   API común: new Game(area, themeData, onWin).start() [+ destroy()]
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

## Diseño ("Playful 3D")

- Fondo con degradado animado y fuentes Fredoka / Nunito.
- Tarjetas tipo *tile*: relieve 3D, rebote al pasar el ratón, acento de color
  por temática, entrada escalonada.
- Barra de XP animada + insignia de nivel con pulso al subir; cronómetro de partida.
- **Efectos** (`sfx.js` / `confetti.js`): sonidos sintetizados con botón de silencio,
  confeti al ganar y al subir de nivel, sacudida en errores. Todo hecho a mano, sin
  librerías, y desactivado bajo `prefers-reduced-motion`.

## Juegos

- **Anagramas** — ordena las letras de un título/nombre del tema.
- **Memoria Visual** — encuentra los 6 pares.
- **Sudoku** — 9×9 generado (difícil desde nivel 5).
- **Trivia** — 5 preguntas al azar de opción múltiple; 12 XP por acierto.
- **Crucigrama** — palabras cruzadas (se desbloquea a nivel 10).

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
