class AnagramGame {
    constructor(container, themeData, onComplete) {
        this.container = container;
        this.words = themeData.anagrams; // Array de palabras
        this.onComplete = onComplete;
        this.currentWord = "";
    }

    start() {
        // Seleccionar palabra aleatoria
        this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
        const scrambled = this.shuffle(this.currentWord);

        this.container.innerHTML = `
            <h3>Ordena la palabra:</h3>
            <div class="scrambled-word">${scrambled}</div>
            <input type="text" id="anagram-input" class="game-input" placeholder="Tu respuesta..." autocomplete="off">
            <button id="check-btn" class="btn-primary">Verificar</button>
            <p id="feedback"></p>
        `;

        document.getElementById('check-btn').addEventListener('click', () => this.check());
    }

    shuffle(word) {
        return word.split('').sort(() => 0.5 - Math.random()).join('');
    }

    check() {
        const input = document.getElementById('anagram-input').value.toUpperCase();
        const feedback = document.getElementById('feedback');
        
        if (input === this.currentWord) {
            feedback.style.color = 'green';
            feedback.innerText = "¡Correcto!";
            setTimeout(() => this.onComplete(20), 1000); // 20 XP de recompensa
        } else {
            feedback.style.color = 'red';
            feedback.innerText = "Intenta de nuevo.";
        }
    }
}