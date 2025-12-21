class MemoryGame {
    constructor(container, themeData, onComplete) {
        this.container = container;
        this.icons = themeData.memory; // Array de iconos
        this.onComplete = onComplete;
        this.flippedCards = [];
        this.matches = 0;
    }

    start() {
        // Duplicar y barajar cartas (4 pares para ejemplo rápido)
        let deck = [...this.icons.slice(0,4), ...this.icons.slice(0,4)]; 
        deck.sort(() => 0.5 - Math.random());

        this.container.innerHTML = `<div class="memory-grid" id="mem-grid"></div>`;
        const grid = document.getElementById('mem-grid');

        deck.forEach((icon, index) => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.value = icon;
            card.dataset.index = index;
            card.innerText = "?"; // Reverso
            card.addEventListener('click', (e) => this.flip(e.target, icon));
            grid.appendChild(card);
        });
    }

    flip(card, icon) {
        if (this.flippedCards.length < 2 && !card.classList.contains('flipped')) {
            card.classList.add('flipped');
            card.innerText = icon;
            this.flippedCards.push(card);

            if (this.flippedCards.length === 2) {
                this.checkMatch();
            }
        }
    }

    checkMatch() {
        const [c1, c2] = this.flippedCards;
        if (c1.dataset.value === c2.dataset.value) {
            c1.classList.add('matched');
            c2.classList.add('matched');
            this.matches++;
            this.flippedCards = [];
            if (this.matches === 4) this.onComplete(50); // Ganar
        } else {
            setTimeout(() => {
                c1.classList.remove('flipped'); c1.innerText = "?";
                c2.classList.remove('flipped'); c2.innerText = "?";
                this.flippedCards = [];
            }, 1000);
        }
    }
}