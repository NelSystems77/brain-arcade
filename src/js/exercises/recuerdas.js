import { shuffle, calmMode } from '../utils.js';
import { sfx, shake } from '../fx.js';

// Objetos cotidianos y reconocibles.
const POOL = ['🍎', '🌂', '🔑', '👓', '☕', '🧦', '🕐', '📞', '🪑', '🌻',
    '🍞', '🐦', '✂️', '📖', '🧣', '🥄', '🍋', '🕯️', '🧢', '🥚', '🔔', '🎈', '🧅', '🍌'];

export class RecuerdasExercise {
    constructor(container, onComplete) {
        this.container = container;
        this.onComplete = onComplete;
        this.solved = false;
        this.locked = false;
        this.probeIndex = 0;
        this.correct = 0;
    }

    start() {
        const count = calmMode() ? 4 : 5;
        this.shown = shuffle(POOL).slice(0, count);
        this.renderStudy();
    }

    renderStudy() {
        this.container.innerHTML = `
            <div class="recuerda">
                <p class="choice__intro">Míralos con calma. Cuando los tengas, toca el botón.</p>
                <div class="recuerda__items" aria-label="Objetos para recordar">
                    ${this.shown.map((e) => `<span>${e}</span>`).join('')}
                </div>
                <button id="rec-ready" class="btn-primary">Ya los recuerdo</button>
            </div>
        `;
        this.container.querySelector('#rec-ready').addEventListener('click', () => this.buildProbes());
    }

    buildProbes() {
        const absent = shuffle(POOL.filter((e) => !this.shown.includes(e))).slice(0, 2);
        const present = shuffle(this.shown).slice(0, 2);
        this.probes = shuffle([
            ...present.map((emoji) => ({ emoji, was: true })),
            ...absent.map((emoji) => ({ emoji, was: false })),
        ]);
        this.probeIndex = 0;
        this.correct = 0;
        this.renderProbe();
    }

    renderProbe() {
        const p = this.probes[this.probeIndex];
        this.container.innerHTML = `
            <div class="recuerda">
                <div class="trivia__bar">
                    <span>${this.probeIndex + 1} / ${this.probes.length}</span>
                    <span>✔ ${this.correct}</span>
                </div>
                <p class="choice__intro">¿Estaba este objeto en la lista?</p>
                <div class="recuerda__probe" aria-hidden="true">${p.emoji}</div>
                <div class="trivia__opts">
                    <button type="button" class="trivia-opt" data-yes="1">Sí, estaba</button>
                    <button type="button" class="trivia-opt" data-yes="0">No estaba</button>
                </div>
                <p id="rec-fb" class="feedback" role="status" aria-live="polite"></p>
            </div>
        `;
        const opts = this.container.querySelectorAll('.trivia-opt');
        for (const b of opts) {
            b.addEventListener('click', () => this.answer(b.dataset.yes === '1', opts));
        }
        this.locked = false;
    }

    answer(saidYes, opts) {
        if (this.locked) return;
        this.locked = true;
        for (const b of opts) b.disabled = true;

        const p = this.probes[this.probeIndex];
        const fb = this.container.querySelector('#rec-fb');
        if (saidYes === p.was) {
            this.correct++;
            sfx.play('match');
            fb.className = 'feedback feedback--ok';
            fb.textContent = '¡Bien!';
        } else {
            sfx.play('wrong');
            shake(this.container);
            fb.className = 'feedback feedback--err';
            fb.textContent = p.was ? 'Sí estaba en la lista.' : 'Ese no estaba.';
        }

        this.timer = setTimeout(() => {
            this.probeIndex++;
            if (this.probeIndex < this.probes.length) {
                this.renderProbe();
            } else {
                this.solved = true;
                this.onComplete(this.correct, this.probes.length);
            }
        }, calmMode() ? 2800 : 1500);
    }

    destroy() {
        clearTimeout(this.timer);
    }
}
