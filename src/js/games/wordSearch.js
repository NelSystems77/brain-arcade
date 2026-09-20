import { shuffle, calmMode } from '../utils.js';
import { WORDSEARCH_XP } from '../config.js';
import { sfx, shake } from '../fx.js';
import {
    candidateWords, buildPuzzle, snapLine, matchSelection,
    DIRS_EASY, DIRS_MEDIUM, DIRS_HARD,
} from './wordSearchLogic.js';

const SIZE = 10;
const WORD_COUNT = 7;
const FOUND_COLORS = ['#ff5da2', '#3b82f6', '#f59e0b', '#22c55e', '#8b5cf6', '#14b8a6', '#ef4444'];

export class WordSearchGame {
    constructor(container, themeData, onComplete, level = 1) {
        this.container = container;
        this.words = candidateWords(themeData.anagrams, 4, 8);
        this.onComplete = onComplete;
        this.level = level;
        this.solved = false;
        this.found = new Set();
        this.dragStart = null;
        this.pendingTap = null;
        this.tapMode = false;
    }

    /** Más direcciones (y palabras al revés) según el nivel; en Mente Activa solo → y ↓. */
    directions() {
        if (calmMode() || this.level < 4) return DIRS_EASY;
        if (this.level < 8) return DIRS_MEDIUM;
        return DIRS_HARD;
    }

    start() {
        const picked = shuffle(this.words).slice(0, WORD_COUNT);
        this.puzzle = buildPuzzle(picked, SIZE, this.directions());
        this.found.clear();
        this.solved = false;

        const cells = this.puzzle.grid.map((row, r) =>
            row.map((ch, c) => `<div class="ws-cell" data-r="${r}" data-c="${c}">${ch}</div>`).join('')).join('');
        const list = this.puzzle.placed.map((p) =>
            `<li data-word="${p.word}">${p.word}</li>`).join('');

        this.container.innerHTML = `
            <h3>Encuentra las palabras:</h3>
            <div class="ws">
                <div class="ws-grid" style="--n:${SIZE}" role="application"
                     aria-label="Sopa de letras. Arrastra o toca la primera y la última letra de una palabra.">${cells}</div>
                <ul class="ws-words">${list}</ul>
                <p id="ws-count" class="ws-count" role="status" aria-live="polite"></p>
            </div>
        `;
        this.grid = this.container.querySelector('.ws-grid');
        this.countEl = this.container.querySelector('#ws-count');
        this.updateCount();

        this.grid.addEventListener('pointerdown', (e) => this.onDown(e));
        this.grid.addEventListener('pointermove', (e) => this.onMove(e));
        this.grid.addEventListener('pointerup', (e) => this.onUp(e));
        this.grid.addEventListener('pointercancel', () => this.clearSelection());
    }

    cellAt(e) {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const cell = el?.closest?.('.ws-cell');
        return cell && this.grid.contains(cell) ? [+cell.dataset.r, +cell.dataset.c] : null;
    }

    cellEl(r, c) {
        return this.grid.children[r * SIZE + c];
    }

    onDown(e) {
        if (this.solved) return;
        const pos = this.cellAt(e);
        if (!pos) return;
        e.preventDefault();
        this.grid.setPointerCapture?.(e.pointerId);
        this.tapMode = !!this.pendingTap; // segundo toque: el inicio es el primero
        this.dragStart = this.pendingTap ?? pos;
        this.paint(snapLine(this.dragStart, pos, SIZE));
        sfx.play('click');
    }

    onMove(e) {
        if (!this.dragStart) return;
        const pos = this.cellAt(e);
        if (pos) this.paint(snapLine(this.dragStart, pos, SIZE));
    }

    onUp(e) {
        if (!this.dragStart) return;
        const pos = this.cellAt(e) ?? this.dragStart;
        const line = snapLine(this.dragStart, pos, SIZE);

        if (line.length === 1 && !this.tapMode) {
            // Toque simple: la celda queda marcada y espera un segundo toque para cerrar la palabra.
            this.pendingTap = this.dragStart;
            this.dragStart = null;
            return;
        }
        this.pendingTap = null;
        this.dragStart = null;
        this.tapMode = false;
        this.check(line);
    }

    paint(cells) {
        for (const el of this.grid.querySelectorAll('.ws-cell.sel')) el.classList.remove('sel');
        for (const [r, c] of cells) this.cellEl(r, c).classList.add('sel');
    }

    clearSelection() {
        this.dragStart = null;
        this.pendingTap = null;
        this.tapMode = false;
        this.paint([]);
    }

    check(line) {
        const hit = matchSelection(this.puzzle.grid, line, this.puzzle.placed, this.found);
        this.paint([]);

        if (!hit) {
            if (line.length > 1) { sfx.play('wrong'); shake(this.grid); }
            return;
        }

        this.found.add(hit.word);
        const color = FOUND_COLORS[this.found.size % FOUND_COLORS.length];
        for (const [r, c] of hit.cells) {
            const el = this.cellEl(r, c);
            el.classList.add('found');
            el.style.setProperty('--fc', color);
        }
        this.container.querySelector(`li[data-word="${hit.word}"]`)?.classList.add('done');
        sfx.play('match');
        this.updateCount();

        if (this.found.size === this.puzzle.placed.length) {
            this.solved = true;
            sfx.play('win');
            setTimeout(() => this.onComplete(WORDSEARCH_XP), 900);
        }
    }

    updateCount() {
        this.countEl.textContent = `${this.found.size} de ${this.puzzle.placed.length} palabras`;
    }
}
