import { XP_PER_LEVEL } from './config.js';

const STORAGE_KEY = 'brainArcadeUser';

/**
 * Gestiona XP, nivel y persistencia. No toca el DOM: notifica cambios por
 * callbacks para poder testearlo y reutilizarlo.
 */
export class UserManager {
    constructor({ onChange = () => {}, onLevelUp = () => {} } = {}) {
        this.onChange = onChange;
        this.onLevelUp = onLevelUp;
        this.data = this.load();
        this.onChange(this.data);
    }

    load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return { xp: 0, level: 1, ...JSON.parse(saved) };
        } catch (e) {
            console.warn('No se pudo leer el progreso guardado:', e);
        }
        return { xp: 0, level: 1 };
    }

    /** XP total acumulada necesaria para pasar al siguiente nivel. */
    get xpForNextLevel() {
        return this.data.level * XP_PER_LEVEL;
    }

    addXP(amount) {
        this.data.xp += amount;

        // Bucle: una recompensa grande puede subir varios niveles de golpe
        // (el código anterior solo subía uno).
        let newLevels = 0;
        while (this.data.xp >= this.xpForNextLevel) {
            this.data.level++;
            newLevels++;
        }

        this.save();
        if (newLevels > 0) this.onLevelUp(this.data.level);
    }

    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.warn('No se pudo guardar el progreso:', e);
        }
        this.onChange(this.data);
    }
}
