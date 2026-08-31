import { shuffle } from '../utils.js';
import { GAME_REWARDS } from '../config.js';
import { sfx, shake } from '../fx.js';

export class SudokuGame {
    constructor(container, difficulty, onComplete) {
        this.container = container;
        this.emptyCells = difficulty === 'hard' ? 50 : 30;
        this.onComplete = onComplete;
        this.board = [];   // solución completa
        this.puzzle = [];  // tablero visible con huecos
        this.selectedCell = null;
        this.solved = false;
    }

    start() {
        this.generateBoard();
        this.createPuzzle();
        this.render();
    }

    // --- Generador ---
    generateBoard() {
        this.board = Array.from({ length: 9 }, () => Array(9).fill(0));
        this.fillBoard(this.board);
    }

    fillBoard(board) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (board[r][c] !== 0) continue;
                for (const num of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
                    if (this.isValid(board, r, c, num)) {
                        board[r][c] = num;
                        if (this.fillBoard(board)) return true;
                        board[r][c] = 0;
                    }
                }
                return false;
            }
        }
        return true;
    }

    isValid(board, row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num || board[i][col] === num) return false;
            const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
            const boxCol = 3 * Math.floor(col / 3) + (i % 3);
            if (board[boxRow][boxCol] === num) return false;
        }
        return true;
    }

    createPuzzle() {
        this.puzzle = this.board.map((row) => [...row]);
        let toRemove = this.emptyCells;
        while (toRemove > 0) {
            const r = Math.floor(Math.random() * 9);
            const c = Math.floor(Math.random() * 9);
            if (this.puzzle[r][c] !== 0) {
                this.puzzle[r][c] = 0;
                toRemove--;
            }
        }
    }

    // --- Interfaz ---
    render() {
        this.container.innerHTML = `
            <div class="sudoku-container">
                <div class="sudoku-grid" id="sudoku-grid"></div>
                <div class="numpad" id="numpad"></div>
                <div class="game-controls">
                    <button id="check-sudoku" class="btn-primary">Verificar</button>
                    <p id="sudoku-msg" class="feedback" role="status" aria-live="polite"></p>
                </div>
            </div>
        `;

        const gridEl = this.container.querySelector('#sudoku-grid');
        const numpadEl = this.container.querySelector('#numpad');

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                if ((c + 1) % 3 === 0 && c < 8) cell.classList.add('border-right');
                if ((r + 1) % 3 === 0 && r < 8) cell.classList.add('border-bottom');
                cell.dataset.r = r;
                cell.dataset.c = c;

                if (this.puzzle[r][c] !== 0) {
                    cell.textContent = this.puzzle[r][c];
                    cell.classList.add('fixed');
                } else {
                    cell.addEventListener('click', () => this.selectCell(r, c, cell));
                }
                gridEl.appendChild(cell);
            }
        }

        for (let i = 1; i <= 9; i++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = i;
            btn.className = 'num-btn';
            btn.addEventListener('click', () => this.fillNumber(i));
            numpadEl.appendChild(btn);
        }
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.textContent = '⌫';
        delBtn.className = 'num-btn del-btn';
        delBtn.setAttribute('aria-label', 'Borrar');
        delBtn.addEventListener('click', () => this.fillNumber(0));
        numpadEl.appendChild(delBtn);

        this.msg = this.container.querySelector('#sudoku-msg');
        this.container.querySelector('#check-sudoku').addEventListener('click', () => this.checkWin());

        // Teclado físico. Se guarda la referencia para poder quitarlo en destroy()
        // (el contenedor se reutiliza entre juegos y el listener no se limpiaría solo).
        this._onKeyDown = (e) => {
            if (e.key >= '1' && e.key <= '9') this.fillNumber(Number(e.key));
            else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') this.fillNumber(0);
        };
        this.container.addEventListener('keydown', this._onKeyDown);
    }

    destroy() {
        if (this._onKeyDown) this.container.removeEventListener('keydown', this._onKeyDown);
    }

    selectCell(r, c, cellElement) {
        this.container.querySelectorAll('.sudoku-cell.selected')
            .forEach((el) => el.classList.remove('selected'));
        this.selectedCell = { r, c };
        cellElement.classList.add('selected');
    }

    fillNumber(num) {
        if (!this.selectedCell) return;
        const { r, c } = this.selectedCell;
        this.puzzle[r][c] = num;

        const cell = this.container.querySelector(`.sudoku-cell[data-r="${r}"][data-c="${c}"]`);
        cell.textContent = num === 0 ? '' : num;
        cell.classList.toggle('user-filled', num !== 0);
        if (num !== 0) sfx.play('flip');
    }

    checkWin() {
        if (this.solved) return;
        const correct = this.puzzle.every((row, r) => row.every((v, c) => v === this.board[r][c]));

        if (correct) {
            this.solved = true;
            this.msg.className = 'feedback feedback--ok';
            this.msg.textContent = '¡Sudoku Resuelto!';
            this.onComplete(GAME_REWARDS.sudoku);
        } else {
            sfx.play('wrong');
            shake(this.container);
            this.msg.className = 'feedback feedback--err';
            this.msg.textContent = 'Hay errores, revisa los números.';
        }
    }
}
