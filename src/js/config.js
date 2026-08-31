// Constantes de juego centralizadas (antes estaban repartidas como números mágicos).

export const XP_PER_LEVEL = 100;

/** XP que otorga cada juego al completarse. */
export const GAME_REWARDS = {
    anagrams: 20,
    memory: 50,
    sudoku: 100,
    crossword: 100,
};

/** Nivel mínimo para desbloquear cada juego. */
export const GAME_UNLOCK_LEVEL = {
    anagrams: 1,
    memory: 1,
    sudoku: 1,
    trivia: 1,
    crossword: 10,
};

/** A partir de este nivel el Sudoku se genera en modo difícil. */
export const SUDOKU_HARD_LEVEL = 5;

/** Trivia: preguntas por ronda y XP por acierto. */
export const TRIVIA = {
    roundSize: 5,
    xpPerCorrect: 12,
};
