import { shuffle, randomItem } from '../utils.js';
import { GAME_REWARDS } from '../config.js';

export class AnagramGame {
    constructor(container, themeData, onComplete) {
        this.container = container;
        this.words = themeData.anagrams;
        this.onComplete = onComplete;
        this.currentWord = '';
        this.solved = false;
    }

    start() {
        this.currentWord = randomItem(this.words, this.currentWord);
        this.solved = false;

        this.container.innerHTML = `
            <h3>Ordena la palabra:</h3>
            <div class="scrambled-word">${this.scramble(this.currentWord)}</div>
            <input type="text" id="anagram-input" class="game-input" placeholder="Tu respuesta..."
                   autocomplete="off" autocapitalize="characters" spellcheck="false"
                   aria-label="Tu respuesta">
            <button id="check-btn" class="btn-primary">Verificar</button>
            <p id="feedback" class="feedback" role="status" aria-live="polite"></p>
        `;

        this.input = this.container.querySelector('#anagram-input');
        this.feedback = this.container.querySelector('#feedback');
        this.container.querySelector('#check-btn').addEventListener('click', () => this.check());
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.check();
        });
        this.input.focus();
    }

    /** Baraja las letras garantizando que el resultado difiera del original. */
    scramble(word) {
        const letters = word.split('');
        if (new Set(letters).size === 1) return word; // p.ej. "AAA": no hay otra permutación
        let out = word;
        while (out === word) out = shuffle(letters).join('');
        return out;
    }

    normalize(text) {
        return text.toUpperCase().replace(/\s+/g, ' ').trim();
    }

    check() {
        if (this.solved) return;

        if (this.normalize(this.input.value) === this.normalize(this.currentWord)) {
            this.solved = true;
            this.feedback.className = 'feedback feedback--ok';
            this.feedback.textContent = '¡Correcto!';
            setTimeout(() => this.onComplete(GAME_REWARDS.anagrams), 900);
        } else {
            this.feedback.className = 'feedback feedback--err';
            this.feedback.textContent = 'Intenta de nuevo.';
        }
    }
}
