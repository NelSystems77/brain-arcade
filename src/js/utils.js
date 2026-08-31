// Utilidades compartidas entre juegos.

/**
 * Baraja Fisher–Yates (sin sesgo). Devuelve un array nuevo, no muta el original.
 * El `.sort(() => 0.5 - Math.random())` que se usaba antes reparte las
 * posiciones de forma no uniforme y depende de la implementación del sort.
 */
export function shuffle(array) {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/** Elemento al azar del array, evitando (si se puede) repetir `exclude`. */
export function randomItem(array, exclude) {
    if (array.length <= 1) return array[0];
    let item;
    do {
        item = array[Math.floor(Math.random() * array.length)];
    } while (item === exclude);
    return item;
}
