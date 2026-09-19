// Lógica pura de "Mi Dispensa" (sin DOM): generación y reglas de trasvase.

import { shuffle } from '../utils.js';

export const BOTTLE_CAP = 4; // porciones por botella
export const SIDE_SLOTS = 24; // 12 a cada lado del envase central

/** Líquidos disponibles (orden = orden de aparición según dificultad). */
export const LIQUIDS = [
    { id: 'leche', name: 'Leche', color: '#fbfaf3' },
    { id: 'chocolate', name: 'Chocolate', color: '#4b2416' },
    { id: 'mango', name: 'Mango', color: '#ffc233' },
    { id: 'fresa', name: 'Fresa', color: '#ff6b8b' },
    { id: 'matcha', name: 'Matcha', color: '#7ccf8f' },
];

/**
 * Niveles de dificultad (los elige el jugador con el botón). Cada uno define
 * cuántos colores hay, cuántas porciones de cada color (= capacidad del envase
 * central) y en cuántas botellas se reparte (el resto quedan vacías: menos
 * huecos libres = menos margen de maniobra).
 */
export const DIFFICULTIES = [
    { name: 'Relajado', colors: 3, units: 8, filled: 8 },
    { name: 'Fácil', colors: 3, units: 16, filled: 12 },
    { name: 'Medio', colors: 4, units: 16, filled: 16 },
    { name: 'Difícil', colors: 5, units: 16, filled: 20 },
    { name: 'Experto', colors: 5, units: 16, filled: 22 },
];

/** Dificultad automática (1-5) según el nivel del jugador, si no eligió ninguna. */
export function difficultyForLevel(level) {
    if (level >= 8) return 4;
    if (level >= 3) return 3;
    return 2;
}

/**
 * Crea una mezcla según `cfg` (una entrada de DIFFICULTIES): 24 botellas
 * (cap 4) con líquidos revueltos y un color objetivo. Las porciones se reparten
 * lo más parejo posible entre las botellas usadas.
 */
export function generate(cfg, prevTarget = null) {
    const ids = LIQUIDS.slice(0, cfg.colors).map((l) => l.id);
    const units = [];
    for (const id of ids) for (let i = 0; i < cfg.units; i++) units.push(id);

    const mixed = shuffle(units);
    const slots = shuffle([...Array(SIDE_SLOTS).keys()]).slice(0, cfg.filled);
    const base = Math.floor(mixed.length / cfg.filled);
    const extra = new Set(shuffle([...Array(cfg.filled).keys()]).slice(0, mixed.length - base * cfg.filled));

    const bottles = Array.from({ length: SIDE_SLOTS }, () => []);
    let at = 0;
    slots.forEach((slot, i) => {
        const size = base + (extra.has(i) ? 1 : 0);
        bottles[slot] = mixed.slice(at, at + size);
        at += size;
    });

    const choices = ids.filter((id) => id !== prevTarget);
    const target = shuffle(choices.length ? choices : ids)[0];
    return { bottles, giant: [], target };
}

/** Color y cantidad de la racha superior de un recipiente. */
export function topRun(units) {
    if (!units.length) return null;
    const color = units[units.length - 1];
    let n = 0;
    for (let i = units.length - 1; i >= 0 && units[i] === color; i--) n++;
    return { color, n };
}

/**
 * ¿Se puede verter `src` en `dst`? Devuelve { color, n } o null.
 * `dst.only` (envase central): solo admite ese color.
 */
export function planPour(src, dst) {
    if (src === dst) return null;
    const run = topRun(src.units);
    if (!run) return null;
    if (dst.only && dst.only !== run.color) return null;
    const room = dst.cap - dst.units.length;
    if (room <= 0) return null;
    const top = topRun(dst.units);
    if (top && top.color !== run.color) return null;
    return { color: run.color, n: Math.min(run.n, room) };
}
