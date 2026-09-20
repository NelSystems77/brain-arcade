// Reglas puras de Tetris (sin DOM): tablero, piezas, rotación, colisiones y puntaje.

export const COLS = 10;
export const ROWS = 20;

/** Cada pieza: matriz de su caja de rotación (1 = bloque) y color. */
export const PIECES = {
    I: { color: '#22d3ee', shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]] },
    O: { color: '#facc15', shape: [[1, 1], [1, 1]] },
    T: { color: '#a855f7', shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]] },
    S: { color: '#22c55e', shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]] },
    Z: { color: '#ef4444', shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]] },
    J: { color: '#3b82f6', shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]] },
    L: { color: '#f97316', shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]] },
};
export const PIECE_IDS = Object.keys(PIECES);

/** Líneas necesarias para ganar y para subir de nivel (velocidad). */
export const GOAL_LINES = 20;
export const LINES_PER_LEVEL = 4;

/** Milisegundos por caída de una fila, por nivel (1-6). */
const GRAVITY_MS = [1000, 800, 620, 470, 340, 240];
export const gravityMs = (level) => GRAVITY_MS[Math.min(level, GRAVITY_MS.length) - 1];

const LINE_POINTS = [0, 100, 300, 500, 800];

export const levelForLines = (lines) => Math.floor(lines / LINES_PER_LEVEL) + 1;
export const scoreForLines = (count, level) => LINE_POINTS[count] * level;

export const emptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

/** Bolsa de 7: cada pieza sale una vez antes de repetirse. */
export function makeBag(rng = Math.random) {
    const bag = [...PIECE_IDS];
    for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag;
}

export function spawn(id) {
    const shape = PIECES[id].shape.map((r) => [...r]);
    return { id, shape, x: Math.floor((COLS - shape.length) / 2), y: id === 'I' ? -1 : 0 };
}

/** Gira la matriz 90° (dir = 1 horario, -1 antihorario). */
export function rotateShape(shape, dir = 1) {
    const n = shape.length;
    return Array.from({ length: n }, (_, r) =>
        Array.from({ length: n }, (_, c) => (dir === 1 ? shape[n - 1 - c][r] : shape[c][n - 1 - r])));
}

export function collides(board, shape, x, y) {
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape.length; c++) {
            if (!shape[r][c]) continue;
            const bx = x + c;
            const by = y + r;
            if (bx < 0 || bx >= COLS || by >= ROWS) return true;
            if (by >= 0 && board[by][bx]) return true;
        }
    }
    return false;
}

const KICKS = [[0, 0], [-1, 0], [1, 0], [-2, 0], [2, 0], [0, -1], [-1, -1], [1, -1]];

/** Devuelve la pieza girada (con "patadas" contra paredes/suelo) o null si no cabe. */
export function tryRotate(board, piece, dir = 1) {
    if (piece.id === 'O') return piece;
    const shape = rotateShape(piece.shape, dir);
    for (const [dx, dy] of KICKS) {
        if (!collides(board, shape, piece.x + dx, piece.y + dy)) {
            return { ...piece, shape, x: piece.x + dx, y: piece.y + dy };
        }
    }
    return null;
}

export function tryMove(board, piece, dx, dy) {
    return collides(board, piece.shape, piece.x + dx, piece.y + dy)
        ? null
        : { ...piece, x: piece.x + dx, y: piece.y + dy };
}

/** Fila donde caería la pieza (para la sombra y la caída rápida). */
export function dropY(board, piece) {
    let y = piece.y;
    while (!collides(board, piece.shape, piece.x, y + 1)) y++;
    return y;
}

/** Fija la pieza en el tablero (muta). Devuelve false si quedó fuera por arriba (fin del juego). */
export function lock(board, piece) {
    let inside = true;
    piece.shape.forEach((row, r) => row.forEach((v, c) => {
        if (!v) return;
        const by = piece.y + r;
        if (by < 0) { inside = false; return; }
        board[by][piece.x + c] = piece.id;
    }));
    return inside;
}

export const fullRows = (board) =>
    board.reduce((acc, row, i) => (row.every(Boolean) ? [...acc, i] : acc), []);

/** Quita las filas indicadas y añade filas vacías arriba (muta). */
export function removeRows(board, rows) {
    for (const i of [...rows].sort((a, b) => a - b)) {
        board.splice(i, 1);
        board.unshift(Array(COLS).fill(null));
    }
}
