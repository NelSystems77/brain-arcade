// js/games/crossword.js

class CrosswordGame {
    constructor(container, themeData, onComplete) {
        this.container = container;
        this.wordsData = themeData.crossword || []; // Fallback si no hay datos
        this.onComplete = onComplete;
        this.gridSize = 10; // Tamaño fijo 10x10 para este ejemplo
        this.logicalGrid = []; // Matriz de soluciones
        this.inputs = []; // Referencias a los inputs HTML
    }

    start() {
        if (this.wordsData.length === 0) {
            this.container.innerHTML = "<p>No hay crucigrama disponible para este tema aún.</p>";
            return;
        }

        // 1. Inicializar la matriz lógica vacía
        this.initLogicalGrid();

        // 2. Colocar las palabras en la matriz lógica
        this.placeWordsOnGrid();

        // 3. Renderizar la interfaz
        this.render();
    }

    initLogicalGrid() {
        // Crea un array 10x10 lleno de null
        this.logicalGrid = Array(this.gridSize).fill(null)
            .map(() => Array(this.gridSize).fill(null));
    }

    placeWordsOnGrid() {
        this.wordsData.forEach(item => {
            let x = item.startX;
            let y = item.startY;
            const word = item.word.toUpperCase();

            for (let i = 0; i < word.length; i++) {
                // Guardamos la letra correcta en la posición
                this.logicalGrid[y][x] = word[i];

                // Avanzamos coordenadas según dirección
                if (item.direction === "horizontal") x++;
                else y++;
            }
        });
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
                <p id="cw-feedback"></p>
            </div>
        `;

        const gridEl = document.getElementById('cw-grid');
        const cluesEl = document.getElementById('cw-clues');

        // A. Dibujar el Grid
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const cell = document.createElement('div');
                const correctChar = this.logicalGrid[y][x];

                if (correctChar) {
                    // Es una casilla jugable
                    const input = document.createElement('input');
                    input.maxLength = 1;
                    input.className = 'cw-cell-input';
                    input.dataset.x = x;
                    input.dataset.y = y;
                    input.dataset.correct = correctChar;
                    
                    // Evento para mover el foco automáticamente
                    input.addEventListener('input', (e) => this.handleInput(e, x, y));
                    input.addEventListener('keydown', (e) => this.handleNavigation(e, x, y));
                    
                    cell.appendChild(input);
                    this.inputs.push(input);
                } else {
                    // Es un bloque negro
                    cell.className = 'cw-cell-empty';
                }
                gridEl.appendChild(cell);
            }
        }

        // B. Listar Pistas
        this.wordsData.forEach((w, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${index + 1}.</strong> ${w.clue} (${w.direction === 'horizontal' ? 'Horiz.' : 'Vert.'})`;
            cluesEl.appendChild(li);
        });

        // C. Botón Verificar
        document.getElementById('cw-check-btn').addEventListener('click', () => this.checkWin());
    }

    // UX: Mueve el foco al siguiente input al escribir
    handleInput(e, x, y) {
        if (e.target.value.length === 1) {
            // Intenta buscar el siguiente input en horizontal, si no, vertical (lógica simple)
            let nextInput = document.querySelector(`input[data-x="${x + 1}"][data-y="${y}"]`);
            if (!nextInput) {
                nextInput = document.querySelector(`input[data-x="${x}"][data-y="${y + 1}"]`);
            }
            if (nextInput) nextInput.focus();
        }
    }
    
    // UX: Flechas del teclado
    handleNavigation(e, x, y) {
        let targetX = x;
        let targetY = y;
        
        switch(e.key) {
            case "ArrowUp": targetY--; break;
            case "ArrowDown": targetY++; break;
            case "ArrowLeft": targetX--; break;
            case "ArrowRight": targetX++; break;
            default: return; 
        }

        const nextInput = document.querySelector(`input[data-x="${targetX}"][data-y="${targetY}"]`);
        if (nextInput) nextInput.focus();
    }

    checkWin() {
        let errors = 0;
        let empty = 0;

        const inputs = document.querySelectorAll('.cw-cell-input');
        inputs.forEach(input => {
            const val = input.value.toUpperCase();
            const correct = input.dataset.correct;

            if (val === "") {
                empty++;
                input.style.backgroundColor = "white";
            } else if (val === correct) {
                input.classList.add('correct');
            } else {
                errors++;
                input.style.backgroundColor = "#ffcdd2"; // Rojo claro
            }
        });

        const feedback = document.getElementById('cw-feedback');
        if (empty > 0) {
            feedback.innerText = "Faltan letras por llenar.";
            feedback.style.color = "orange";
        } else if (errors > 0) {
            feedback.innerText = `Tienes ${errors} errores.`;
            feedback.style.color = "red";
        } else {
            feedback.innerText = "¡Excelente! Crucigrama completado.";
            feedback.style.color = "green";
            this.onComplete(100); // 100 XP por ser más difícil
        }
    }
}