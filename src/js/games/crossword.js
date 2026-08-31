import { GAME_REWARDS } from '../config.js';

export class CrosswordGame {
    constructor(container, themeData, onComplete) {
        this.container = container;
        this.wordsData = themeData.crossword || [];
        this.onComplete = onComplete;
        this.gridSize = 10;
        this.logicalGrid = [];
        this.solved = false;
    }

    start() {
        if (this.wordsData.length === 0) {
            this.container.innerHTML = '<p>No hay crucigrama disponible para este tema aún.</p>';
            return;
        }
        this.initLogicalGrid();
        this.placeWordsOnGrid();
        this.render();
    }

    initLogicalGrid() {
        this.logicalGrid = Array.from({ length: this.gridSize }, () =>
            Array(this.gridSize).fill(null),
        );
    }

    placeWordsOnGrid() {
        for (const item of this.wordsData) {
            let { startX: x, startY: y } = item;
            const word = item.word.toUpperCase();
            for (const char of word) {
                this.logicalGrid[y][x] = char;
                if (item.direction === 'horizontal') x++;
                else y++;
            }
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="crossword-container">
                <div class="crossword-grid" id="cw-grid"></div>
                <div class="clues-box">
                    <h4>Pistas:</h4>
                    <ul id="cw-clues"></ul>
                </div>
                <button id="cw-check-btn" class="btn-primary">Verificar</button>
                <p id="cw-feedback" class="feedback" role="status" aria-live="polite"></p>
            </div>
        `;

        const gridEl = this.container.querySelector('#cw-grid');
        const cluesEl = this.container.querySelector('#cw-clues');

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const cell = document.createElement('div');
                const correctChar = this.logicalGrid[y][x];

                if (correctChar) {
                    const input = document.createElement('input');
                    input.maxLength = 1;
                    input.className = 'cw-cell-input';
                    input.dataset.x = x;
                    input.dataset.y = y;
                    input.dataset.correct = correctChar;
                    input.setAttribute('aria-label', `Fila ${y + 1}, columna ${x + 1}`);
                    input.addEventListener('input', () => this.handleInput(x, y));
                    input.addEventListener('keydown', (e) => this.handleNavigation(e, x, y));
                    cell.appendChild(input);
                } else {
                    cell.className = 'cw-cell-empty';
                }
                gridEl.appendChild(cell);
            }
        }

        this.wordsData.forEach((w, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${index + 1}.</strong> ${w.clue} (${
                w.direction === 'horizontal' ? 'Horiz.' : 'Vert.'
            })`;
            cluesEl.appendChild(li);
        });

        this.feedback = this.container.querySelector('#cw-feedback');
        this.container.querySelector('#cw-check-btn').addEventListener('click', () => this.checkWin());
    }

    cellInput(x, y) {
        return this.container.querySelector(`input[data-x="${x}"][data-y="${y}"]`);
    }

    handleInput(x, y) {
        const current = this.cellInput(x, y);
        if (current.value.length !== 1) return;
        const next = this.cellInput(x + 1, y) || this.cellInput(x, y + 1);
        if (next) next.focus();
    }

    handleNavigation(e, x, y) {
        const moves = {
            ArrowUp: [x, y - 1],
            ArrowDown: [x, y + 1],
            ArrowLeft: [x - 1, y],
            ArrowRight: [x + 1, y],
        };
        const target = moves[e.key];
        if (!target) return;
        const next = this.cellInput(target[0], target[1]);
        if (next) {
            e.preventDefault();
            next.focus();
        }
    }

    checkWin() {
        if (this.solved) return;
        let errors = 0;
        let empty = 0;

        for (const input of this.container.querySelectorAll('.cw-cell-input')) {
            const val = input.value.toUpperCase();
            input.classList.remove('correct', 'error');

            if (val === '') empty++;
            else if (val === input.dataset.correct) input.classList.add('correct');
            else {
                errors++;
                input.classList.add('error');
            }
        }

        if (empty > 0) {
            this.feedback.className = 'feedback feedback--warn';
            this.feedback.textContent = 'Faltan letras por llenar.';
        } else if (errors > 0) {
            this.feedback.className = 'feedback feedback--err';
            this.feedback.textContent = `Tienes ${errors} ${errors === 1 ? 'error' : 'errores'}.`;
        } else {
            this.solved = true;
            this.feedback.className = 'feedback feedback--ok';
            this.feedback.textContent = '¡Excelente! Crucigrama completado.';
            this.onComplete(GAME_REWARDS.crossword);
        }
    }
}
