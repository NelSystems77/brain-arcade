import '../css/styles.css';

import { GAME_DATA } from './data.js';
import { UserManager } from './userManager.js';
import { GAME_UNLOCK_LEVEL, SUDOKU_HARD_LEVEL } from './config.js';
import { AnagramGame } from './games/anagrams.js';
import { MemoryGame } from './games/memory.js';
import { SudokuGame } from './games/sudoku.js';
import { CrosswordGame } from './games/crossword.js';

const GAME_FACTORY = {
    anagrams: (area, theme, onWin) => new AnagramGame(area, theme, onWin),
    memory: (area, theme, onWin) => new MemoryGame(area, theme, onWin),
    sudoku: (area, theme, onWin, level) =>
        new SudokuGame(area, level >= SUDOKU_HARD_LEVEL ? 'hard' : 'easy', onWin),
    crossword: (area, theme, onWin) => new CrosswordGame(area, theme, onWin),
};

const THEME_KEY = 'brainArcadeTheme';

function main() {
    const els = {
        themeSelector: document.getElementById('theme-selector'),
        gameSelector: document.getElementById('game-selector'),
        gameContainer: document.getElementById('game-container'),
        gameArea: document.getElementById('game-area'),
        themeGrid: document.getElementById('theme-grid'),
        gameGrid: document.getElementById('game-grid'),
        themeTitle: document.getElementById('selected-theme-title'),
        modal: document.getElementById('modal-reward'),
        levelDisplay: document.getElementById('level-display'),
        xpDisplay: document.getElementById('xp-display'),
        themeToggle: document.getElementById('theme-toggle'),
    };

    let currentThemeData = null;
    let currentGame = null;

    // ---- Progreso de usuario --------------------------------------------------
    const userManager = new UserManager({
        onChange: (data) => {
            els.levelDisplay.textContent = `Nivel: ${data.level}`;
            els.xpDisplay.textContent = `XP: ${data.xp} / ${data.level * 100}`;
            renderGameLocks(data.level);
        },
    });

    // ---- Modo oscuro (persistente + respeta el sistema) ----------------------
    initTheme();
    els.themeToggle.addEventListener('click', () => {
        const dark = document.body.classList.toggle('dark-mode');
        els.themeToggle.textContent = dark ? '☀️' : '🌙';
        try {
            localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
        } catch { /* almacenamiento no disponible */ }
    });

    function initTheme() {
        let stored = null;
        try {
            stored = localStorage.getItem(THEME_KEY);
        } catch { /* ignore */ }
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const dark = stored ? stored === 'dark' : prefersDark;
        document.body.classList.toggle('dark-mode', dark);
        els.themeToggle.textContent = dark ? '☀️' : '🌙';
    }

    // ---- Pantalla de temas --------------------------------------------------
    const themeKeys = Object.keys(GAME_DATA);
    if (themeKeys.length === 0) {
        els.gameArea.textContent = 'Error cargando datos.';
        return;
    }

    const themeFragment = document.createDocumentFragment();
    for (const key of themeKeys) {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'card';
        card.innerHTML = `<div class="icon" aria-hidden="true">📁</div><h3>${key.toUpperCase()}</h3>`;
        card.addEventListener('click', () => selectTheme(key));
        themeFragment.appendChild(card);
    }
    els.themeGrid.appendChild(themeFragment);

    // ---- Navegación --------------------------------------------------------
    function showView(view) {
        for (const el of document.querySelectorAll('.view')) {
            el.classList.toggle('active', el === view);
            el.classList.toggle('hidden', el !== view);
        }
    }

    function selectTheme(themeKey) {
        currentThemeData = GAME_DATA[themeKey];
        if (els.themeTitle) els.themeTitle.textContent = `TEMA: ${themeKey.toUpperCase()}`;
        renderGameLocks(userManager.data.level);
        showView(els.gameSelector);
    }

    function endGame() {
        currentGame?.destroy?.();
        currentGame = null;
        els.gameArea.innerHTML = '';
    }

    document.getElementById('back-to-themes').addEventListener('click', () => {
        showView(els.themeSelector);
        currentThemeData = null;
    });

    document.getElementById('exit-game').addEventListener('click', () => {
        const inProgress = currentGame && !currentGame.solved;
        if (inProgress && !confirm('¿Seguro que quieres salir? Perderás el progreso actual.')) return;
        endGame();
        showView(els.gameSelector);
    });

    // ---- Tarjetas de juego (bloqueo dinámico por nivel) --------------------
    function renderGameLocks(level) {
        for (const card of els.gameGrid.querySelectorAll('.game-card')) {
            const type = card.dataset.game;
            const required = GAME_UNLOCK_LEVEL[type] ?? 1;
            const locked = level < required;
            card.classList.toggle('locked', locked);
            card.disabled = locked;
            const hint = card.querySelector('.lock-hint');
            if (hint) hint.textContent = locked ? `Nivel ${required} requerido` : '';
        }
    }

    els.gameGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.game-card');
        if (!card) return;
        if (card.classList.contains('locked')) {
            const required = GAME_UNLOCK_LEVEL[card.dataset.game] ?? 1;
            alert(`Necesitas el nivel ${required} para desbloquear este juego.`);
            return;
        }
        startGame(card.dataset.game);
    });

    function startGame(type) {
        const factory = GAME_FACTORY[type];
        if (!factory) {
            els.gameArea.innerHTML = '<p>Este juego aún está en construcción 🚧</p>';
            showView(els.gameContainer);
            return;
        }

        if (type === 'crossword' && !(currentThemeData?.crossword?.length)) {
            alert("Este tema aún no tiene un crucigrama diseñado. Prueba con 'CINE'.");
            return;
        }

        showView(els.gameContainer);
        els.gameArea.innerHTML = '';

        const onWin = (xp) => {
            const prevLevel = userManager.data.level;
            userManager.addXP(xp);
            const leveledUp = userManager.data.level > prevLevel;
            showRewardModal(
                xp,
                leveledUp ? `¡Nivel ${userManager.data.level}!` : undefined,
                leveledUp ? `+${xp} XP · nuevos juegos desbloqueados 🔓` : undefined,
            );
        };

        try {
            currentGame = factory(els.gameArea, currentThemeData, onWin, userManager.data.level);
            currentGame.start();
        } catch (err) {
            console.error('Error iniciando el juego:', err);
            els.gameArea.innerHTML = '<p>Hubo un error interno. Revisa la consola.</p>';
            showView(els.gameSelector);
        }
    }

    // ---- Modal de recompensa ---------------------------------------------
    const REWARD_TITLES = ['¡Excelente!', '¡Genial!', '¡Asombroso!', '¡Bien hecho!'];

    function showRewardModal(xp, title, message) {
        document.getElementById('reward-title').textContent =
            title ?? REWARD_TITLES[Math.floor(Math.random() * REWARD_TITLES.length)];
        document.getElementById('reward-msg').textContent =
            message ?? `Has ganado +${xp} XP`;
        els.modal.classList.remove('hidden');
        document.getElementById('close-modal').focus();
    }

    document.getElementById('close-modal').addEventListener('click', () => {
        els.modal.classList.add('hidden');
        // Solo volvemos al menú si veníamos de terminar un juego.
        if (currentGame) {
            endGame();
            showView(els.gameSelector);
        }
    });

    els.modal.addEventListener('click', (e) => {
        if (e.target === els.modal) document.getElementById('close-modal').click();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}
