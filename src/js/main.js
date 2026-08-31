import '../css/styles.css';

import { GAME_DATA } from './data.js';
import { UserManager } from './userManager.js';
import { GAME_UNLOCK_LEVEL, SUDOKU_HARD_LEVEL, XP_PER_LEVEL } from './config.js';
import { sfx, celebrate } from './fx.js';
import { speak, stopSpeaking, speechAvailable } from './speech.js';
import { AnagramGame } from './games/anagrams.js';
import { MemoryGame } from './games/memory.js';
import { SudokuGame } from './games/sudoku.js';
import { CrosswordGame } from './games/crossword.js';
import { TriviaGame } from './games/trivia.js';
import { makeRefranes, makeBombas, makeRetahilas } from './exercises/verbal.js';
import { RecuerdasExercise } from './exercises/recuerdas.js';

const GAME_FACTORY = {
    anagrams: (area, theme, onWin) => new AnagramGame(area, theme, onWin),
    memory: (area, theme, onWin) => new MemoryGame(area, theme, onWin),
    sudoku: (area, theme, onWin, level) =>
        new SudokuGame(area, level >= SUDOKU_HARD_LEVEL ? 'hard' : 'easy', onWin),
    trivia: (area, theme, onWin) => new TriviaGame(area, theme, onWin),
    crossword: (area, theme, onWin) => new CrosswordGame(area, theme, onWin),
};

/** Ejercicios de Mente Activa: reciben (contenedor, onComplete(aciertos, total)). */
const EXERCISE_FACTORY = {
    refranes: makeRefranes,
    bombas: makeBombas,
    retahilas: makeRetahilas,
    recuerdas: (area, done) => new RecuerdasExercise(area, done),
};

/** Icono y color de acento por temática (fallback para temas nuevos). */
const THEME_STYLE = {
    cine: { icon: '🎬', acc: '#ef4444' },
    rock: { icon: '🎸', acc: '#7c5cff' },
    biblia: { icon: '📖', acc: '#3b82f6' },
    ochentas: { icon: '📼', acc: '#06b6d4' },
    ciencia: { icon: '🔬', acc: '#10b981' },
};
const DEFAULT_STYLE = { icon: '🎲', acc: '#7c5cff' };

const THEME_KEY = 'brainArcadeTheme';
const MA_KEY = 'brainArcadeMenteActiva';

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
        timer: document.getElementById('game-timer'),
        levelDisplay: document.getElementById('level-display'),
        levelBadge: document.getElementById('level-badge'),
        xpDisplay: document.getElementById('xp-display'),
        xpFill: document.getElementById('xp-fill'),
        soundToggle: document.getElementById('sound-toggle'),
        themeToggle: document.getElementById('theme-toggle'),
        menteActivaCta: document.getElementById('mente-activa-cta'),
        menteActivaView: document.getElementById('mente-activa'),
        maGrid: document.getElementById('ma-grid'),
        speakBtn: document.getElementById('speak-btn'),
    };

    let currentThemeData = null;
    let currentGame = null;
    let lastLevel = null;
    let returnView = els.gameSelector; // a dónde volver al salir de un juego/ejercicio

    // ---- Cronómetro del juego ---------------------------------------------
    let timerId = null;
    let timerStart = 0;
    function startTimer() {
        stopTimer();
        // "Mente Activa": sin prisa, no se muestra cronómetro.
        if (document.body.classList.contains('accessible')) {
            els.timer.textContent = '';
            return;
        }
        timerStart = Date.now();
        els.timer.textContent = '00:00';
        timerId = setInterval(() => {
            const s = Math.floor((Date.now() - timerStart) / 1000);
            const mm = String(Math.floor(s / 60)).padStart(2, '0');
            const ss = String(s % 60).padStart(2, '0');
            els.timer.textContent = `${mm}:${ss}`;
        }, 1000);
    }
    function stopTimer() {
        if (timerId) clearInterval(timerId);
        timerId = null;
    }

    // Habilita el audio en el primer gesto del usuario (política de autoplay).
    window.addEventListener('pointerdown', () => sfx.unlock(), { once: true });

    // ---- Progreso de usuario --------------------------------------------------
    const userManager = new UserManager({
        onChange: (data) => {
            els.levelDisplay.textContent = data.level;

            const floor = (data.level - 1) * XP_PER_LEVEL;
            const inLevel = Math.max(0, Math.min(XP_PER_LEVEL, data.xp - floor));
            els.xpDisplay.textContent = `${inLevel} / ${XP_PER_LEVEL}`;
            els.xpFill.style.width = `${(inLevel / XP_PER_LEVEL) * 100}%`;

            if (lastLevel !== null && data.level > lastLevel) {
                els.levelBadge.classList.remove('pulse');
                void els.levelBadge.offsetWidth;
                els.levelBadge.classList.add('pulse');
            }
            lastLevel = data.level;

            renderGameLocks(data.level);
        },
    });

    // ---- Sonido -------------------------------------------------------------
    const syncSoundIcon = () => {
        els.soundToggle.textContent = sfx.muted ? '🔇' : '🔊';
        els.soundToggle.classList.toggle('is-off', sfx.muted);
    };
    syncSoundIcon();
    els.soundToggle.addEventListener('click', () => {
        sfx.toggle();
        syncSoundIcon();
    });

    // ---- Modo oscuro (persistente + respeta el sistema) ----------------------
    initTheme();
    els.themeToggle.addEventListener('click', () => {
        const dark = document.body.classList.toggle('dark-mode');
        els.themeToggle.textContent = dark ? '☀️' : '🌙';
        sfx.play('click');
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

    // ---- Mente Activa (sección accesible: texto grande, voz, sin prisa) -----
    els.menteActivaCta.innerHTML =
        '🧠 Mente Activa<small>Ejercicios tranquilos, texto grande y con voz</small>';

    /** Activa/desactiva la presentación accesible (texto grande, sin animaciones). */
    function applyAccessible(on) {
        document.body.classList.toggle('accessible', on);
        els.speakBtn.hidden = !on || !speechAvailable();
    }

    function enterMenteActiva() {
        applyAccessible(true);
        try { localStorage.setItem(MA_KEY, '1'); } catch { /* ignore */ }
        showView(els.menteActivaView);
    }

    function exitMenteActiva() {
        stopSpeaking();
        applyAccessible(false);
        try { localStorage.setItem(MA_KEY, '0'); } catch { /* ignore */ }
        showView(els.themeSelector);
    }

    els.menteActivaCta.addEventListener('click', () => {
        sfx.play('click');
        enterMenteActiva();
    });
    document.getElementById('ma-back').addEventListener('click', () => {
        sfx.play('click');
        exitMenteActiva();
    });

    els.speakBtn.addEventListener('click', () => {
        const raw = els.gameArea.innerText || els.gameArea.textContent || '';
        speak(raw.replace(/\s+/g, ' ').trim());
    });

    // Arranca dentro de Mente Activa si así quedó la última vez.
    let startInMenteActiva = false;
    try {
        // Migración de la clave anterior (modo accesible suelto → sección).
        if (localStorage.getItem('brainArcadeAccessible') === '1') {
            localStorage.setItem(MA_KEY, '1');
            localStorage.removeItem('brainArcadeAccessible');
        }
        startInMenteActiva = localStorage.getItem(MA_KEY) === '1';
    } catch { /* ignore */ }
    if (startInMenteActiva) enterMenteActiva();
    else applyAccessible(false);

    // ---- Pantalla de temas --------------------------------------------------
    const themeKeys = Object.keys(GAME_DATA);
    if (themeKeys.length === 0) {
        els.gameArea.textContent = 'Error cargando datos.';
        return;
    }

    const themeFragment = document.createDocumentFragment();
    for (const key of themeKeys) {
        const { icon, acc } = THEME_STYLE[key] ?? DEFAULT_STYLE;
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'card';
        card.style.setProperty('--acc', acc);
        card.innerHTML = `<div class="icon" aria-hidden="true">${icon}</div><h3>${key.toUpperCase()}</h3>`;
        card.addEventListener('click', () => {
            sfx.play('click');
            selectTheme(key);
        });
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
        stopTimer();
        stopSpeaking();
        currentGame?.destroy?.();
        currentGame = null;
        els.gameArea.innerHTML = '';
    }

    document.getElementById('back-to-themes').addEventListener('click', () => {
        sfx.play('click');
        showView(els.themeSelector);
        currentThemeData = null;
    });

    document.getElementById('exit-game').addEventListener('click', () => {
        // En Mente Activa no preguntamos (más amable); en los juegos sí si hay progreso.
        const inProgress = currentGame && !currentGame.solved;
        const ask = inProgress && returnView === els.gameSelector;
        if (ask && !confirm('¿Seguro que quieres salir? Perderás el progreso actual.')) return;
        sfx.play('click');
        endGame();
        showView(returnView);
    });

    // ---- Ejercicios de Mente Activa --------------------------------------
    els.maGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.ex-card');
        if (!card) return;
        sfx.play('click');
        startExercise(card.dataset.ex);
    });

    function startExercise(type) {
        const factory = EXERCISE_FACTORY[type];
        if (!factory) return;

        returnView = els.menteActivaView;
        showView(els.gameContainer);
        stopSpeaking();
        stopTimer();
        els.gameArea.innerHTML = '';

        const done = (correct, total) => {
            const xp = 10 + correct * 5;
            userManager.addXP(xp);
            sfx.play('win');
            celebrate({ y: 0.4, count: 120 });
            showRewardModal(
                xp,
                '¡Muy bien! 🌟',
                `Acertaste ${correct} de ${total} · +${xp} XP`,
            );
        };

        try {
            currentGame = factory(els.gameArea, done);
            currentGame.start();
        } catch (err) {
            console.error('Error iniciando el ejercicio:', err);
            els.gameArea.innerHTML = '<p>Hubo un error interno.</p>';
            showView(els.menteActivaView);
        }
    }

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
        if (!card || card.classList.contains('locked')) return;
        sfx.play('click');
        startGame(card.dataset.game);
    });

    function startGame(type) {
        const factory = GAME_FACTORY[type];
        if (!factory) {
            els.gameArea.innerHTML = '<p>Este juego aún está en construcción 🚧</p>';
            showView(els.gameContainer);
            return;
        }

        if (type === 'crossword' && !(currentThemeData?.crosswords?.length)) {
            alert("Este tema aún no tiene un crucigrama diseñado. Prueba con 'CINE'.");
            return;
        }
        if (type === 'trivia' && !(currentThemeData?.trivia?.length)) {
            alert('Este tema aún no tiene preguntas de trivia.');
            return;
        }

        returnView = els.gameSelector;
        showView(els.gameContainer);
        stopSpeaking();
        els.gameArea.innerHTML = '';
        startTimer();

        const onWin = (xp) => {
            stopTimer();
            const prevLevel = userManager.data.level;
            userManager.addXP(xp);
            const leveledUp = userManager.data.level > prevLevel;

            if (xp <= 0) {
                sfx.play('click');
                showRewardModal(0, 'Ronda terminada', 'Sin aciertos esta vez — ¡inténtalo de nuevo!');
                return;
            }

            sfx.play(leveledUp ? 'levelup' : 'win');
            celebrate({ y: 0.35, count: leveledUp ? 220 : 150 });

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
        sfx.play('click');
        els.modal.classList.add('hidden');
        if (currentGame) {
            endGame();
            showView(returnView);
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
