class UserManager {
    constructor() {
        this.loadProgress();
    }

    loadProgress() {
        const saved = localStorage.getItem('brainArcadeUser');
        this.data = saved ? JSON.parse(saved) : { xp: 0, level: 1, unlockedThemes: ['cine', 'biblia'] };
        this.updateUI();
    }

    addXP(amount) {
        this.data.xp += amount;
        // Lógica simple de subida de nivel (cada 100 XP)
        if (this.data.xp >= this.data.level * 100) {
            this.data.level++;
            alert(`¡Nivel ${this.data.level} alcanzado! Nuevos juegos desbloqueados.`);
        }
        this.save();
    }

    save() {
        localStorage.setItem('brainArcadeUser', JSON.stringify(this.data));
        this.updateUI();
    }

    updateUI() {
        document.getElementById('level-display').innerText = `Nivel: ${this.data.level}`;
        document.getElementById('xp-display').innerText = `XP: ${this.data.xp} / ${this.data.level * 100}`;
    }
}