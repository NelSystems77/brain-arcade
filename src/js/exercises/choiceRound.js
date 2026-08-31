import { shuffle, calmMode } from '../utils.js';
import { sfx, shake } from '../fx.js';

/**
 * Ronda de opción múltiple compartida por los ejercicios verbales de Mente Activa.
 * Llama `onComplete(aciertos, total)` al terminar.
 */
export class ChoiceRound {
    constructor(container, onComplete, { questions, introHtml = '' }) {
        this.container = container;
        this.onComplete = onComplete;
        this.questions = questions ?? [];
        this.introHtml = introHtml;
        this.index = 0;
        this.correct = 0;
        this.locked = false;
        this.solved = false;
    }

    start() {
        if (this.questions.length === 0) {
            this.container.innerHTML = '<p>No hay contenido disponible todavía.</p>';
            return;
        }
        this.index = 0;
        this.correct = 0;
        this.renderQuestion();
    }

    renderQuestion() {
        const q = this.questions[this.index];
        const options = shuffle(q.options);

        this.container.innerHTML = `
            <div class="trivia">
                <div class="trivia__bar">
                    <span>${this.index + 1} / ${this.questions.length}</span>
                    <span>✔ ${this.correct}</span>
                </div>
                ${this.index === 0 && this.introHtml ? `<p class="choice__intro">${this.introHtml}</p>` : ''}
                <div class="trivia__q">${q.stem}</div>
                <div class="trivia__opts" id="c-opts"></div>
                <p id="c-fb" class="feedback" role="status" aria-live="polite"></p>
            </div>
        `;

        const optsEl = this.container.querySelector('#c-opts');
        for (const o of options) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'trivia-opt';
            btn.textContent = o.text;
            btn.dataset.correct = o.correct ? '1' : '0';
            btn.addEventListener('click', () => this.answer(btn, optsEl));
            optsEl.appendChild(btn);
        }
        this.locked = false;
    }

    answer(btn, optsEl) {
        if (this.locked) return;
        this.locked = true;

        for (const b of optsEl.children) b.disabled = true;
        const fb = this.container.querySelector('#c-fb');

        if (btn.dataset.correct === '1') {
            btn.classList.add('is-correct');
            this.correct++;
            sfx.play('match');
            fb.className = 'feedback feedback--ok';
            fb.textContent = '¡Muy bien!';
        } else {
            btn.classList.add('is-wrong');
            optsEl.querySelector('[data-correct="1"]')?.classList.add('is-correct');
            sfx.play('wrong');
            shake(this.container);
            fb.className = 'feedback feedback--err';
            fb.textContent = 'La respuesta está marcada en verde.';
        }

        this.timer = setTimeout(() => this.next(), calmMode() ? 3400 : 1600);
    }

    next() {
        this.index++;
        if (this.index < this.questions.length) {
            this.renderQuestion();
            return;
        }
        this.solved = true;
        this.onComplete(this.correct, this.questions.length);
    }

    destroy() {
        clearTimeout(this.timer);
    }
}
