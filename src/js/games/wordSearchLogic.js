// Reglas puras de la Sopa de letras (sin DOM): elegir palabras, generar la cuadrícula y validar selecciones.

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const DIRS_EASY = [[0, 1], [1, 0]];
export const DIRS_MEDIUM = [[0, 1], [1, 0], [1, 1]];
export const DIRS_HARD = [[0, 1], [1, 0], [1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1], [-1, 1]];

/** Mayúsculas y sin tildes; devuelve solo si queda una palabra de A-Z entre min y max letras. */
export function toPuzzleWord(text, min = 4, max = 8) {
    const w = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    return /^[A-Z]+$/.test(w) && w.length >= min && w.length <= max ? w : null;
}

/** Palabras válidas (únicas) de una lista de textos del tema. */
export function candidateWords(list, min, max) {
    const set = new Set();
    for (const t of list) {
        const w = toPuzzleWord(t, min, max);
        if (w) set.add(w);
    }
    return [...set];
}

/**
 * Coloca las palabras en una cuadrícula size×size y rellena el resto con letras al azar.
 * Devuelve { grid, placed: [{ word, cells: [[r,c],…] }] } (`placed` puede tener menos palabras si alguna no cupo).
 */
export function buildPuzzle(words, size, dirs, rand = Math.random) {
    const grid = Array.from({ length: size }, () => Array(size).fill(''));
    const placed = [];
    const ordered = [...words].sort((a, b) => b.length - a.length);

    for (const word of ordered) {
        for (let attempt = 0; attempt < 300; attempt++) {
            const [dr, dc] = dirs[Math.floor(rand() * dirs.length)];
            const r0 = Math.floor(rand() * size);
            const c0 = Math.floor(rand() * size);
            const rEnd = r0 + dr * (word.length - 1);
            const cEnd = c0 + dc * (word.length - 1);
            if (rEnd < 0 || rEnd >= size || cEnd < 0 || cEnd >= size) continue;

            const cells = [];
            let fits = true;
            for (let i = 0; i < word.length; i++) {
                const r = r0 + dr * i;
                const c = c0 + dc * i;
                if (grid[r][c] && grid[r][c] !== word[i]) { fits = false; break; }
                cells.push([r, c]);
            }
            if (!fits) continue;

            cells.forEach(([r, c], i) => { grid[r][c] = word[i]; });
            placed.push({ word, cells });
            break;
        }
    }

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (!grid[r][c]) grid[r][c] = ALPHABET[Math.floor(rand() * ALPHABET.length)];
        }
    }
    return { grid, placed };
}

/**
 * Ajusta el arrastre (start→end) a la línea recta más cercana en una de las 8 direcciones.
 * Devuelve las celdas [[r,c],…] desde start hasta el punto ajustado (siempre incluye start).
 */
export function snapLine(start, end, size) {
    const dr = end[0] - start[0];
    const dc = end[1] - start[1];
    if (dr === 0 && dc === 0) return [start];

    const angle = Math.atan2(dr, dc); // eje x = columnas
    const step = Math.round(angle / (Math.PI / 4));
    const sr = Math.round(Math.sin(step * Math.PI / 4));
    const sc = Math.round(Math.cos(step * Math.PI / 4));
    const len = sr !== 0 && sc !== 0
        ? Math.min(Math.abs(dr), Math.abs(dc)) || Math.max(Math.abs(dr), Math.abs(dc))
        : Math.max(Math.abs(dr), Math.abs(dc));

    const cells = [];
    for (let i = 0; i <= len; i++) {
        const r = start[0] + sr * i;
        const c = start[1] + sc * i;
        if (r < 0 || r >= size || c < 0 || c >= size) break;
        cells.push([r, c]);
    }
    return cells;
}

/** ¿Las celdas seleccionadas forman alguna palabra aún no encontrada (en cualquier sentido)? */
export function matchSelection(grid, cells, placed, foundWords) {
    const text = cells.map(([r, c]) => grid[r][c]).join('');
    const rev = [...text].reverse().join('');
    return placed.find((p) => !foundWords.has(p.word) && (p.word === text || p.word === rev)) ?? null;
}
