import { shuffle, calmMode } from '../utils.js';
import { GAME_REWARDS } from '../config.js';
import { sfx } from '../fx.js';

export class MemoryGame {
    constructor(container, themeData, onComplete) {
        this.container = container;
        this.icons = themeData.memory;
        this.onComplete = onComplete;
        this.flipped = [];
        this.matches = 0;
        this.locked = false; // bloquea clicks mientras se resuelve un par fallido
        this.solved = false;
    }

    start() {
        this.pairs = Math.min(6, this.icons.length);
        this.matches = 0;
        this.flipped = [];
        this.locked = false;

        const deck = shuffle([
            ...this.icons.slice(0, this.pairs),
            ...this.icons.slice(0, this.pairs),
        ]);

        this.container.innerHTML = `<div class="memory-grid" id="mem-grid" role="grid"></div>`;
        const grid = this.container.querySelector('#mem-grid');

        deck.forEach((icon) => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'memory-card';
            card.dataset.value = icon;
            card.setAttribute('aria-label', 'Carta oculta');
            card.textContent = '?';
            card.addEventListener('click', () => this.flip(card));
            grid.appendChild(card);
        });
    }

    flip(card) {
        if (this.locked) return;
        if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
        if (this.flipped.length >= 2) return;

        card.classList.add('flipped');
        card.textContent = card.dataset.value;
        card.setAttribute('aria-label', `Carta ${card.dataset.value}`);
        sfx.play('flip');
        this.flipped.push(card);

        if (this.flipped.length === 2) this.checkMatch();
    }

    checkMatch() {
        const [c1, c2] = this.flipped;

        if (c1.dataset.value === c2.dataset.value) {
            c1.classList.add('matched');
            c2.classList.add('matched');
            this.flipped = [];
            this.matches++;
            sfx.play('match');
            if (this.matches === this.pairs) {
                this.solved = true;
                setTimeout(() => this.onComplete(GAME_REWARDS.memory), 400);
            }
        } else {
            this.locked = true;
            sfx.play('wrong');
            setTimeout(() => {
                for (const c of [c1, c2]) {
                    c.classList.remove('flipped');
                    c.textContent = '?';
                    c.setAttribute('aria-label', 'Carta oculta');
                }
                this.flipped = [];
                this.locked = false;
            }, calmMode() ? 1800 : 900);
        }
    }
}
