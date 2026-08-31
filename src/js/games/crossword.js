import { GAME_REWARDS } from '../config.js';
import { randomItem } from '../utils.js';
import { sfx, shake } from '../fx.js';

export class CrosswordGame {
    constructor(container, themeData, onComplete) {
        this.container = container;
        // `crosswords` es un array de puzzles; se elige uno al azar por partida.
        this.puzzles = themeData.crosswords || [];
        this.onComplete = onComplete;
        this.gridSize = 10;
        this.logicalGrid = [];
        this.cellNumber = new Map(); // "x,y" -> nº de pista
        this.solved = false;
    }

    start() {
        if (this.puzzles.length === 0) {
            this.container.innerHTML = '<p>No hay crucigrama disponible para este tema aún.</p>';
            return;
        }
        this.words = randomItem(this.puzzles);
        this.initLogicalGrid();
        this.placeWordsOnGrid();
        this.computeBounds();
        this.assignNumbers();
        this.render();
    }

    /** Recorta el lienzo al rectángulo que ocupan las palabras (con 0 de margen). */
    computeBounds() {
        let minX = this.gridSize, minY = this.gridSize, maxX = 0, maxY = 0;
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (!this.logicalGrid[y][x]) continue;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
        this.minX = minX;
        this.minY = minY;
        this.cols = maxX - minX + 1;
        this.rows = maxY - minY + 1;
    }

    initLogicalGrid() {
        this.logicalGrid = Array.from({ length: this.gridSize }, () =>
            Array(this.gridSize).fill(null),
        );
    }

    placeWordsOnGrid() {
        for (const item of this.words) {
            let { startX: x, startY: y } = item;
            for (const char of item.word.toUpperCase()) {
                this.logicalGrid[y][x] = char;
                if (item.direction === 'horizontal') x++;
                else y++;
            }
        }
    }

    /** Numera las casillas de inicio en orden de lectura (fila, luego columna). */
    assignNumbers() {
        const starts = [...new Set(this.words.map((w) => `${w.startX},${w.startY}`))]
            .map((k) => k.split(',').map(Number))
            .sort((a, b) => a[1] - b[1] || a[0] - b[0]);

        this.cellNumber.clear();
        starts.forEach(([x, y], i) => this.cellNumber.set(`${x},${y}`, i + 1));

        for (const w of this.words) {
            w.number = this.cellNumber.get(`${w.startX},${w.startY}`);
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="crossword-container">
                <div class="crossword-grid" id="cw-grid"></div>
                <div class="clues-box" id="cw-clues"></div>
                <button id="cw-check-btn" class="btn-primary">Verificar</button>
                <p id="cw-feedback" class="feedback" role="status" aria-live="polite"></p>
            </div>
        `;

        const gridEl = this.container.querySelector('#cw-grid');
        const CELL = window.innerWidth < 420 ? 26 : 30;
        gridEl.style.gridTemplateColumns = `repeat(${this.cols}, ${CELL}px)`;
        gridEl.style.gridTemplateRows = `repeat(${this.rows}, ${CELL}px)`;

        for (let y = this.minY; y < this.minY + this.rows; y++) {
            for (let x = this.minX; x < this.minX + this.cols; x++) {
                const cell = document.createElement('div');
                const correctChar = this.logicalGrid[y][x];

                if (!correctChar) {
                    cell.className = 'cw-cell-empty';
                    gridEl.appendChild(cell);
                    continue;
                }

                cell.className = 'cw-cell';
                const number = this.cellNumber.get(`${x},${y}`);
                if (number) {
                    const tag = document.createElement('span');
                    tag.className = 'cw-num';
                    tag.textContent = number;
                    cell.appendChild(tag);
                }

                const input = document.createElement('input');
                input.maxLength = 1;
                input.className = 'cw-cell-input';
                input.dataset.x = x;
                input.dataset.y = y;
                input.dataset.correct = correctChar;
                input.setAttribute('aria-label',
                    number ? `Pista ${number}, fila ${y + 1}, columna ${x + 1}`
                        : `Fila ${y + 1}, columna ${x + 1}`);
                input.addEventListener('input', () => this.handleInput(x, y));
                input.addEventListener('keydown', (e) => this.handleNavigation(e, x, y));
                cell.appendChild(input);
                gridEl.appendChild(cell);
            }
        }

        this.renderClues();

        this.feedback = this.container.querySelector('#cw-feedback');
        this.container.querySelector('#cw-check-btn').addEventListener('click', () => this.checkWin());
    }

    renderClues() {
        const groups = [
            ['Horizontales', 'horizontal'],
            ['Verticales', 'vertical'],
        ];
        const box = this.container.querySelector('#cw-clues');

        for (const [title, dir] of groups) {
            const list = this.words
                .filter((w) => w.direction === dir)
                .sort((a, b) => a.number - b.number);
            if (list.length === 0) continue;

            const group = document.createElement('div');
            group.className = 'clues-group';
            group.innerHTML = `<h4>${title}</h4><ul></ul>`;
            const ul = group.querySelector('ul');
            for (const w of list) {
                const li = document.createElement('li');
                li.innerHTML = `<b>${w.number}.</b> ${w.clue}`;
                ul.appendChild(li);
            }
            box.appendChild(group);
        }
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
            sfx.play('wrong');
            shake(this.container);
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
