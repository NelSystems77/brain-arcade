import { shuffle, calmMode } from '../utils.js';
import { TRIVIA } from '../config.js';
import { sfx, shake } from '../fx.js';

export class TriviaGame {
    constructor(container, themeData, onComplete) {
        this.container = container;
        this.pool = themeData.trivia || [];
        this.onComplete = onComplete;
        this.questions = [];
        this.index = 0;
        this.correct = 0;
        this.locked = false;
        this.solved = false;
    }

    start() {
        if (this.pool.length === 0) {
            this.container.innerHTML = '<p>Este tema aún no tiene preguntas de trivia.</p>';
            return;
        }
        this.questions = shuffle(this.pool).slice(0, Math.min(TRIVIA.roundSize, this.pool.length));
        this.index = 0;
        this.correct = 0;
        this.renderQuestion();
    }

    renderQuestion() {
        const q = this.questions[this.index];
        const options = shuffle(q.options.map((text, i) => ({ text, correct: i === q.answer })));

        this.container.innerHTML = `
            <div class="trivia">
                <div class="trivia__bar">
                    <span>Pregunta ${this.index + 1} / ${this.questions.length}</span>
                    <span>✔ ${this.correct}</span>
                </div>
                <h3 class="trivia__q">${q.question}</h3>
                <div class="trivia__opts" id="trivia-opts"></div>
                <p id="trivia-fb" class="feedback" role="status" aria-live="polite"></p>
            </div>
        `;

        const optsEl = this.container.querySelector('#trivia-opts');
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
        const fb = this.container.querySelector('#trivia-fb');
        const isCorrect = btn.dataset.correct === '1';

        if (isCorrect) {
            btn.classList.add('is-correct');
            this.correct++;
            sfx.play('match');
            fb.className = 'feedback feedback--ok';
            fb.textContent = '¡Correcto!';
        } else {
            btn.classList.add('is-wrong');
            optsEl.querySelector('[data-correct="1"]')?.classList.add('is-correct');
            sfx.play('wrong');
            shake(this.container);
            fb.className = 'feedback feedback--err';
            fb.textContent = 'La respuesta correcta está en verde.';
        }

        this.timer = setTimeout(() => this.next(), calmMode() ? 3200 : 1500);
    }

    next() {
        this.index++;
        if (this.index < this.questions.length) {
            this.renderQuestion();
            return;
        }

        this.solved = true;
        const xp = this.correct * TRIVIA.xpPerCorrect;
        this.container.innerHTML = `
            <div class="trivia trivia--done">
                <div class="trivia__score">${this.correct} / ${this.questions.length}</div>
                <p>${this.verdict()}</p>
            </div>
        `;
        setTimeout(() => this.onComplete(xp), 900);
    }

    verdict() {
        const ratio = this.correct / this.questions.length;
        if (ratio === 1) return '¡Ronda perfecta! 🏆';
        if (ratio >= 0.6) return '¡Bien jugado! 🎉';
        if (ratio > 0) return 'Vas mejorando 💪';
        return 'La próxima será mejor 🙂';
    }

    destroy() {
        clearTimeout(this.timer);
    }
}
