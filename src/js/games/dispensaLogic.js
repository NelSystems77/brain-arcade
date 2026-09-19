// Lógica pura de "Mi Dispensa" (sin DOM): generación y reglas de trasvase.

import { shuffle } from '../utils.js';

export const BOTTLE_CAP = 4; // porciones por botella
export const SIDE_SLOTS = 24; // 12 a cada lado del envase central
export const UNITS_PER_COLOR = 16; // = capacidad del envase central

/** Líquidos disponibles (orden = orden de aparición según dificultad). */
export const LIQUIDS = [
    { id: 'leche', name: 'Leche', color: '#fbfaf3' },
    { id: 'chocolate', name: 'Chocolate', color: '#4b2416' },
    { id: 'mango', name: 'Mango', color: '#ffc233' },
    { id: 'fresa', name: 'Fresa', color: '#ff6b8b' },
    { id: 'matcha', name: 'Matcha', color: '#7ccf8f' },
];

/** Cantidad de colores según el nivel del jugador (más colores = más reto). */
export function colorsForLevel(level) {
    if (level >= 8) return 5;
    if (level >= 3) return 4;
    return 3;
}

/**
 * Crea una mezcla: 24 botellas (cap 4) con `colors` líquidos y un color objetivo.
 * Los huecos libres (botellas vacías) garantizan que siempre haya maniobra.
 */
export function generate(colors, prevTarget = null) {
    const ids = LIQUIDS.slice(0, colors).map((l) => l.id);
    const units = [];
    for (const id of ids) for (let i = 0; i < UNITS_PER_COLOR; i++) units.push(id);

    const mixed = shuffle(units);
    const filled = mixed.length / BOTTLE_CAP;
    const slots = shuffle([...Array(SIDE_SLOTS).keys()]).slice(0, filled);

    const bottles = Array.from({ length: SIDE_SLOTS }, () => []);
    slots.forEach((slot, i) => {
        bottles[slot] = mixed.slice(i * BOTTLE_CAP, (i + 1) * BOTTLE_CAP);
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
