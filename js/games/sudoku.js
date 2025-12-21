class SudokuGame {
    constructor(container, difficulty, onComplete) {
        this.container = container;
        // Dificultad: cuántas celdas vacías dejar (ej: 30 fácil, 40 medio, 50 difícil)
        this.emptyCells = difficulty === 'hard' ? 50 : 30; 
        this.onComplete = onComplete;
        this.board = [];     // El tablero solución
        this.puzzle = [];    // El tablero con huecos que ve el usuario
        this.selectedCell = null; // Coordenadas {r, c} de la celda seleccionada
    }

    start() {
        this.generateBoard();
        this.createPuzzle();
        this.render();
    }

    // --- Lógica del Algoritmo (Generador) ---
    generateBoard() {
        // Inicializar tablero 9x9 vacío
        this.board = Array.from({ length: 9 }, () => Array(9).fill(0));
        this.fillBoard(this.board);
    }

    fillBoard(board) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (board[r][c] === 0) {
                    let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
                    for (let num of numbers) {
                        if (this.isValid(board, r, c, num)) {
                            board[r][c] = num;
                            if (this.fillBoard(board)) return true;
                            board[r][c] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    isValid(board, row, col, num) {
        for (let i = 0; i < 9; i++) {
            // Verificar fila y columna
            if (board[row][i] === num || board[i][col] === num) return false;
            // Verificar cuadrante 3x3
            const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
            const boxCol = 3 * Math.floor(col / 3) + i % 3;
            if (board[boxRow][boxCol] === num) return false;
        }
        return true;
    }

    createPuzzle() {
        // Copiar el tablero solución
        this.puzzle = this.board.map(row => [...row]);
        let attempts = this.emptyCells;
        while (attempts > 0) {
            let r = Math.floor(Math.random() * 9);
            let c = Math.floor(Math.random() * 9);
            if (this.puzzle[r][c] !== 0) {
                this.puzzle[r][c] = 0; // Vaciar celda
                attempts--;
            }
        }
    }

    // --- Lógica de Interfaz (UI) ---
    render() {
        this.container.innerHTML = `
            <div class="sudoku-container">
                <div class="sudoku-grid" id="sudoku-grid"></div>
                <div class="numpad" id="numpad"></div>
                <div class="game-controls">
                     <button id="check-sudoku" class="btn-primary">Verificar</button>
                     <p id="sudoku-msg"></p>
                </div>
            </div>
        `;

        const gridEl = document.getElementById('sudoku-grid');
        const numpadEl = document.getElementById('numpad');

        // Renderizar Celdas
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = document.createElement('div');
                cell.classList.add('sudoku-cell');
                
                // Estilos para los bordes gruesos cada 3 celdas
                if ((c + 1) % 3 === 0 && c < 8) cell.classList.add('border-right');
                if ((r + 1) % 3 === 0 && r < 8) cell.classList.add('border-bottom');

                if (this.puzzle[r][c] !== 0) {
                    cell.innerText = this.puzzle[r][c];
                    cell.classList.add('fixed');
                } else {
                    cell.onclick = () => this.selectCell(r, c, cell);
                }
                
                cell.dataset.r = r;
                cell.dataset.c = c;
                gridEl.appendChild(cell);
            }
        }

        // Renderizar Teclado Numérico (Mejor para móviles)
        for (let i = 1; i <= 9; i++) {
            const btn = document.createElement('button');
            btn.innerText = i;
            btn.classList.add('num-btn');
            btn.onclick = () => this.fillNumber(i);
            numpadEl.appendChild(btn);
        }
        
        // Botón Borrar
        const delBtn = document.createElement('button');
        delBtn.innerText = '⌫';
        delBtn.classList.add('num-btn', 'del-btn');
        delBtn.onclick = () => this.fillNumber(0);
        numpadEl.appendChild(delBtn);

        document.getElementById('check-sudoku').onclick = () => this.checkWin();
    }

    selectCell(r, c, cellElement) {
        // Quitar selección previa
        document.querySelectorAll('.sudoku-cell.selected').forEach(el => el.classList.remove('selected'));
        
        this.selectedCell = { r, c };
        cellElement.classList.add('selected');
    }

    fillNumber(num) {
        if (!this.selectedCell) return;
        const { r, c } = this.selectedCell;
        
        // Actualizar modelo
        this.puzzle[r][c] = num;
        
        // Actualizar vista
        const cell = document.querySelector(`.sudoku-cell[data-r="${r}"][data-c="${c}"]`);
        cell.innerText = num === 0 ? '' : num;
        
        if(num !== 0) cell.classList.add('user-filled');
        else cell.classList.remove('user-filled');
    }

    checkWin() {
        const msg = document.getElementById('sudoku-msg');
        // Comparar puzzle actual con el board solución original
        let isCorrect = true;
        for(let r=0; r<9; r++){
            for(let c=0; c<9; c++){
                if(this.puzzle[r][c] !== this.board[r][c]) {
                    isCorrect = false;
                    break;
                }
            }
        }

        if (isCorrect) {
            msg.style.color = 'green';
            msg.innerText = "¡Sudoku Resuelto!";
            this.onComplete(100); // 100 XP por Sudoku
        } else {
            msg.style.color = 'red';
            msg.innerText = "Hay errores, revisa los números.";
        }
    }
}