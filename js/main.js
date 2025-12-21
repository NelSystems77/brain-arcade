document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar Gestor de Usuario (XP y Niveles)
    const userManager = new UserManager();
    
    // 2. Referencias al DOM (HTML)
    const themeSelector = document.getElementById('theme-selector');
    const gameSelector = document.getElementById('game-selector');
    const gameContainer = document.getElementById('game-container');
    const gameArea = document.getElementById('game-area');
    const themeGrid = document.getElementById('theme-grid');
    const modal = document.getElementById('modal-reward');
    const themeTitle = document.getElementById('selected-theme-title'); // Referencia al título del submenú

    // Estado interno
    let currentThemeData = null; // Datos del tema elegido (Cine, Rock, etc.)
    let currentGameInstance = null; // Instancia del juego activo

    // ---------------------------------------------------------
    // GENERACIÓN DE TEMAS (Pantalla de Inicio)
    // ---------------------------------------------------------
    if (typeof GAME_DATA !== 'undefined') {
        Object.keys(GAME_DATA).forEach(key => {
            const card = document.createElement('div');
            card.className = 'card';
            // Icono genérico de carpeta para temas
            card.innerHTML = `<div class="icon">📁</div><h3>${key.toUpperCase()}</h3>`; 
            card.onclick = () => selectTheme(key);
            themeGrid.appendChild(card);
        });
    } else {
        console.error("Error: data.js no ha cargado correctamente.");
        gameArea.innerHTML = "<p>Error cargando datos.</p>";
    }

    // ---------------------------------------------------------
    // NAVEGACIÓN ENTRE PANTALLAS
    // ---------------------------------------------------------
    
    function showView(viewElement) {
        // Ocultar todas las vistas
        document.querySelectorAll('.view').forEach(el => {
            el.classList.remove('active');
            el.classList.add('hidden');
        });
        // Mostrar la deseada
        viewElement.classList.remove('hidden');
        viewElement.classList.add('active');
    }

    // Paso 1: Elegir Tema
    function selectTheme(themeKey) {
        currentThemeData = GAME_DATA[themeKey];
        // Actualizar el título visualmente
        if(themeTitle) themeTitle.innerText = `TEMA: ${themeKey.toUpperCase()}`;
        showView(gameSelector);
    }

    // Botón Volver (de Juegos a Temas)
    document.getElementById('back-to-themes').onclick = () => {
        showView(themeSelector);
        currentThemeData = null;
    };

    // Botón Salir (del Juego al Menú)
    document.getElementById('exit-game').onclick = () => {
        if(confirm("¿Seguro que quieres salir? Perderás el progreso actual.")) {
            gameArea.innerHTML = ''; // Limpiar el juego visualmente
            currentGameInstance = null; // Borrar la instancia de memoria
            showView(gameSelector);
        }
    };

    // ---------------------------------------------------------
    // LÓGICA DE INICIO DE JUEGOS
    // ---------------------------------------------------------

    // Detectar click en cualquier tarjeta de juego
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', () => {
            // Verificar si está bloqueado visualmente
            if (card.classList.contains('locked')) {
                alert("¡Necesitas subir de nivel para desbloquear este juego!");
                return;
            }
            const gameType = card.dataset.game;
            startGame(gameType);
        });
    });

    function startGame(type) {
        showView(gameContainer);
        gameArea.innerHTML = ''; // Asegurar lienzo limpio

        // Callback: Qué pasa cuando el usuario gana
        const onWin = (xpAmount) => {
            userManager.addXP(xpAmount); // Sumar puntos
            showRewardModal(xpAmount);   // Mostrar modal
        };

        // Selector de Juegos (Factory Pattern)
        try {
            switch (type) {
                case 'anagrams':
                    if (typeof AnagramGame !== 'undefined') {
                        currentGameInstance = new AnagramGame(gameArea, currentThemeData, onWin);
                        currentGameInstance.start();
                    }
                    break;

                case 'memory':
                    if (typeof MemoryGame !== 'undefined') {
                        currentGameInstance = new MemoryGame(gameArea, currentThemeData, onWin);
                        currentGameInstance.start();
                    }
                    break;

                case 'sudoku':
                    if (typeof SudokuGame !== 'undefined') {
                        // Lógica dinámica: Si es nivel alto, Sudoku difícil
                        const difficulty = userManager.data.level >= 5 ? 'hard' : 'easy';
                        currentGameInstance = new SudokuGame(gameArea, difficulty, onWin);
                        currentGameInstance.start();
                    } else {
                        console.error("Falta cargar sudoku.js");
                    }
                    break;

                case 'crossword':
                    if (typeof CrosswordGame !== 'undefined') {
                        // Validación de seguridad: ¿Existe crucigrama para este tema?
                        if (!currentThemeData.crossword || currentThemeData.crossword.length === 0) {
                            alert("Este tema aún no tiene un crucigrama diseñado. Intenta con 'CINE'.");
                            document.getElementById('exit-game').click(); // Salir automáticamente
                            return;
                        }
                        currentGameInstance = new CrosswordGame(gameArea, currentThemeData, onWin);
                        currentGameInstance.start();
                    } else {
                        console.error("Falta cargar crossword.js");
                    }
                    break;

                default:
                    gameArea.innerHTML = '<p>Este juego aún está en construcción 🚧</p>';
            }
        } catch (e) {
            console.error("Error iniciando el juego:", e);
            alert("Hubo un error interno. Revisa la consola.");
            showView(gameSelector);
        }
    }

    // ---------------------------------------------------------
    // SISTEMA DE MODAL / RECOMPENSAS
    // ---------------------------------------------------------
    function showRewardModal(xp) {
        const titles = ["¡Excelente!", "¡Genial!", "¡Asombroso!", "¡Bien hecho!"];
        const randomTitle = titles[Math.floor(Math.random() * titles.length)];
        
        document.getElementById('reward-title').innerText = randomTitle;
        document.getElementById('reward-msg').innerText = `Has ganado +${xp} XP`;
        modal.classList.remove('hidden');
    }

    document.getElementById('close-modal').onclick = () => {
        modal.classList.add('hidden');
        // Volver al menú automáticamente tras cerrar el modal
        // simulamos click en salir para limpiar todo correctamente
        // Nota: Quitamos el confirm() del exit-game temporalmente o accedemos directo a showView
        gameArea.innerHTML = '';
        currentGameInstance = null;
        showView(gameSelector);
    };

    // ---------------------------------------------------------
    // MODO OSCURO
    // ---------------------------------------------------------
    const themeBtn = document.getElementById('theme-toggle');
    themeBtn.onclick = () => {
        document.body.classList.toggle('dark-mode');
        // Cambiar icono
        themeBtn.innerText = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    };
});