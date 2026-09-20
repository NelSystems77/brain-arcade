import { TETRIS_XP } from '../config.js';
import { sfx } from '../fx.js';
import { asmr } from '../asmr.js';
import {
    COLS, ROWS, PIECES, GOAL_LINES,
    gravityMs, levelForLines, scoreForLines,
    emptyBoard, makeBag, spawn, tryRotate, tryMove, dropY, collides,
    lock, fullRows, removeRows,
} from './tetrisLogic.js';

const CELL = 30; // píxeles internos por casilla del tablero
const LOCK_DELAY = 450; // ms apoyada antes de fijarse
const MAX_LOCK_RESETS = 12;
const CLEAR_MS = 300;
const SOFT_MS = 45;
const BEST_KEY = 'brainArcadeTetrisBest';

/** Dibuja un bloque con relieve (estilo "3D" de las tarjetas). */
function rounded(ctx, x, y, w, h, r) {
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
    else ctx.rect(x, y, w, h); // Safari antiguo
}

function drawBlock(ctx, px, py, size, color, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    const pad = 1;
    const s = size - pad * 2;
    ctx.fillStyle = color;
    ctx.beginPath();
    rounded(ctx, px + pad, py + pad, s, s, size * 0.16);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.38)';
    ctx.beginPath();
    rounded(ctx, px + pad + 2, py + pad + 2, s - 4, s * 0.3, size * 0.1);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.26)';
    ctx.fillRect(px + pad + 2, py + size - pad - s * 0.2 - 2, s - 4, s * 0.2);
    ctx.restore();
}

function forEachCell(shape, fn) {
    shape.forEach((row, r) => row.forEach((v, c) => { if (v) fn(c, r); }));
}

/**
 * Tetris: caen piezas de 4 bloques; completa filas para eliminarlas.
 * Meta: eliminar GOAL_LINES filas antes de que la pila llegue arriba.
 */
export class TetrisGame {
    constructor(container, onComplete) {
        this.container = container;
        this.onComplete = onComplete;
        this.dead = false;
        this.raf = 0;
        this.holdTimers = new Map();
    }

    start() {
        this.buildDom();
        this.bindEvents();
        this.reset();
        asmr.startMusic();
        this.last = performance.now();
        this.raf = requestAnimationFrame((t) => this.frame(t));
    }

    destroy() {
        this.dead = true;
        asmr.stopMusic();
        cancelAnimationFrame(this.raf);
        clearTimeout(this.winTimer);
        for (const t of this.holdTimers.values()) { clearTimeout(t.delay); clearInterval(t.rep); }
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        document.removeEventListener('visibilitychange', this.onVisibility);
        window.removeEventListener('blur', this.onHidden);
    }

    // ---- Estado -----------------------------------------------------------
    reset() {
        clearTimeout(this.winTimer);
        this.board = emptyBoard();
        this.queue = [];
        this.hold = null;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.phase = 'play'; // play | clearing | paused | over | won
        this.softDrop = false;
        this.clearRows = [];
        this.clearTimer = 0;
        this.spawnNext();
        this.showOverlay(null);
        this.updateHud();
        asmr.setMusicLevel(1);
        asmr.setMusicSoft(false);
    }

    nextId() {
        if (this.queue.length < 5) this.queue.push(...makeBag());
        return this.queue.shift();
    }

    spawnNext(id = this.nextId()) {
        this.piece = spawn(id);
        this.canHold = true;
        this.fall = 0;
        this.grounded = 0;
        this.lockResets = 0;
        if (collides(this.board, this.piece.shape, this.piece.x, this.piece.y)) this.gameOver();
    }

    gameOver() {
        this.phase = 'over';
        this.piece = null;
        asmr.over();
        asmr.setMusicSoft(true);
        this.showOverlay('over');
    }

    win() {
        this.phase = 'won';
        this.piece = null;
        asmr.chime();
        asmr.setMusicSoft(true);
        this.showOverlay('won');
        this.winTimer = setTimeout(() => { if (!this.dead) this.onComplete(TETRIS_XP); }, 1800);
    }

    // ---- Bucle ------------------------------------------------------------
    frame(now) {
        if (this.dead) return;
        const dt = Math.min(now - this.last, 100);
        this.last = now;
        this.update(dt);
        this.draw();
        this.raf = requestAnimationFrame((t) => this.frame(t));
    }

    update(dt) {
        if (this.phase === 'clearing') {
            this.clearTimer += dt;
            if (this.clearTimer >= CLEAR_MS) this.finishClear();
            return;
        }
        if (this.phase !== 'play') return;

        if (this.isGrounded()) {
            this.grounded += dt;
            if (this.grounded >= LOCK_DELAY) this.lockPiece();
            return;
        }
        this.grounded = 0;
        this.fall += dt;
        const step = this.softDrop ? Math.min(SOFT_MS, gravityMs(this.level)) : gravityMs(this.level);
        while (this.fall >= step && !this.isGrounded()) {
            this.fall -= step;
            this.piece = tryMove(this.board, this.piece, 0, 1);
            if (this.softDrop) this.score += 1;
        }
        if (this.softDrop) this.updateHud();
    }

    isGrounded() {
        return collides(this.board, this.piece.shape, this.piece.x, this.piece.y + 1);
    }

    lockPiece() {
        const inside = lock(this.board, this.piece);
        this.piece = null;
        if (!inside) { this.gameOver(); return; }
        const rows = fullRows(this.board);
        if (rows.length === 0) {
            asmr.lock();
            this.spawnNext();
            return;
        }
        asmr.line(rows.length);
        this.phase = 'clearing';
        this.clearRows = rows;
        this.clearTimer = 0;
    }

    finishClear() {
        const count = this.clearRows.length;
        removeRows(this.board, this.clearRows);
        this.clearRows = [];
        this.score += scoreForLines(count, this.level);
        this.lines += count;
        const prevLevel = this.level;
        this.level = levelForLines(this.lines);
        this.updateHud();
        if (this.lines >= GOAL_LINES) { this.win(); return; }
        if (this.level > prevLevel) {
            asmr.rise();
            asmr.setMusicLevel(this.level);
        }
        this.phase = 'play';
        this.spawnNext();
    }

    // ---- Acciones del jugador ----------------------------------------------
    get playing() { return this.phase === 'play' && this.piece; }

    /** Tras un movimiento exitoso con la pieza apoyada, reinicia el retardo de fijado. */
    touched() {
        if (this.grounded > 0 && this.lockResets < MAX_LOCK_RESETS) {
            this.grounded = 0;
            this.lockResets++;
        }
    }

    move(dx) {
        if (!this.playing) return;
        const p = tryMove(this.board, this.piece, dx, 0);
        if (!p) return;
        this.piece = p;
        this.touched();
        asmr.move();
    }

    rotate(dir = 1) {
        if (!this.playing) return;
        const p = tryRotate(this.board, this.piece, dir);
        if (!p) return;
        this.piece = p;
        this.touched();
        asmr.rotate();
    }

    stepDown() {
        if (!this.playing) return;
        const p = tryMove(this.board, this.piece, 0, 1);
        if (!p) return;
        this.piece = p;
        this.fall = 0;
        this.score += 1;
        this.updateHud();
    }

    hardDrop() {
        if (!this.playing) return;
        const y = dropY(this.board, this.piece);
        this.score += (y - this.piece.y) * 2;
        this.piece = { ...this.piece, y };
        this.lockPiece();
        this.updateHud();
    }

    holdPiece() {
        if (!this.playing || !this.canHold) return;
        const cur = this.piece.id;
        asmr.pick();
        const swap = this.hold;
        this.hold = cur;
        this.spawnNext(swap ?? undefined);
        this.canHold = false;
        this.updateHud();
    }

    togglePause() {
        if (this.phase === 'play') {
            this.phase = 'paused';
            asmr.setMusicSoft(true);
            this.showOverlay('paused');
        } else if (this.phase === 'paused') {
            this.phase = 'play';
            asmr.setMusicSoft(false);
            this.showOverlay(null);
            this.last = performance.now();
        }
        sfx.play('click');
    }

    restart() {
        sfx.play('click');
        this.reset();
    }

    // ---- DOM --------------------------------------------------------------
    buildDom() {
        this.container.innerHTML = `
            <div class="ttr">
                <div class="ttr-stage">
                    <div class="ttr-board-wrap">
                        <canvas class="ttr-board" width="${COLS * CELL}" height="${ROWS * CELL}" aria-label="Tablero de Tetris"></canvas>
                        <div class="ttr-overlay" hidden>
                            <h3></h3><p></p>
                            <button type="button" class="btn-small" data-act="overlay"></button>
                        </div>
                    </div>
                    <aside class="ttr-side">
                        <div class="ttr-box"><span>Guardada</span><canvas class="ttr-hold" width="80" height="64"></canvas></div>
                        <div class="ttr-box"><span>Siguiente</span><canvas class="ttr-next" width="80" height="192"></canvas></div>
                        <div class="ttr-stat"><span>Filas</span><b class="ttr-lines"></b></div>
                        <div class="ttr-stat"><span>Nivel</span><b class="ttr-level"></b></div>
                        <div class="ttr-stat"><span>Puntos</span><b class="ttr-score"></b></div>
                        <div class="ttr-stat"><span>Récord</span><b class="ttr-best"></b></div>
                        <button type="button" class="btn-small ttr-pause" data-act="pause">⏸ Pausa</button>
                    </aside>
                </div>
                <div class="ttr-pad" role="group" aria-label="Controles">
                    <button type="button" data-hold="left" aria-label="Izquierda">◀</button>
                    <button type="button" data-hold="down" aria-label="Bajar">▼</button>
                    <button type="button" data-hold="right" aria-label="Derecha">▶</button>
                    <button type="button" data-act="rotate" aria-label="Girar">⟳</button>
                    <button type="button" data-act="drop" aria-label="Caída rápida">⤓</button>
                    <button type="button" data-act="hold" aria-label="Guardar pieza">📥</button>
                </div>
                <p class="ttr-hint">Elimina ${GOAL_LINES} filas. Teclado: ← → mover · ↑ girar · ↓ bajar ·
                    Espacio caída rápida · C guardar · P pausa. En pantalla táctil: toca el tablero para girar
                    o desliza hacia abajo para soltar.</p>
            </div>`;
        const q = (s) => this.container.querySelector(s);
        this.root = q('.ttr');
        this.canvas = q('.ttr-board');
        this.ctx = this.canvas.getContext('2d');
        this.holdCtx = q('.ttr-hold').getContext('2d');
        this.nextCtx = q('.ttr-next').getContext('2d');
        this.hud = {
            lines: q('.ttr-lines'), level: q('.ttr-level'), score: q('.ttr-score'), best: q('.ttr-best'),
            pause: q('.ttr-pause'),
        };
        this.overlay = q('.ttr-overlay');
    }

    bindEvents() {
        const actions = {
            rotate: () => this.rotate(1),
            drop: () => this.hardDrop(),
            hold: () => this.holdPiece(),
            pause: () => this.togglePause(),
            overlay: () => (this.phase === 'paused' ? this.togglePause() : this.restart()),
        };
        this.root.addEventListener('click', (e) => {
            const b = e.target.closest('[data-act]');
            if (b) actions[b.dataset.act]?.();
        });

        // Botones que se repiten al mantenerlos (izquierda / derecha / bajar).
        const repeatAction = {
            left: () => this.move(-1),
            right: () => this.move(1),
            down: () => this.stepDown(),
        };
        const stopHold = (name) => {
            const t = this.holdTimers.get(name);
            if (!t) return;
            clearTimeout(t.delay);
            clearInterval(t.rep);
            this.holdTimers.delete(name);
        };
        this.root.querySelectorAll('[data-hold]').forEach((btn) => {
            const name = btn.dataset.hold;
            btn.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                sfx.unlock();
                stopHold(name);
                repeatAction[name]();
                const t = { delay: setTimeout(() => { t.rep = setInterval(repeatAction[name], 65); }, 190) };
                this.holdTimers.set(name, t);
            });
            for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) {
                btn.addEventListener(ev, () => stopHold(name));
            }
        });

        // Sobre el tablero: toque = girar, deslizar hacia abajo = caída rápida.
        let touch = null;
        this.canvas.addEventListener('pointerdown', (e) => { touch = { x: e.clientX, y: e.clientY }; });
        this.canvas.addEventListener('pointerup', (e) => {
            if (!touch) return;
            const dx = e.clientX - touch.x;
            const dy = e.clientY - touch.y;
            if (Math.hypot(dx, dy) < 12) this.rotate(1);
            else if (dy > 60 && dy > Math.abs(dx)) this.hardDrop();
            touch = null;
        });

        const KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' ', 'x', 'X', 'z', 'Z', 'c', 'C', 'p', 'P'];
        this.onKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey || !KEYS.includes(e.key)) return;
            if (e.target.closest?.('input, textarea, select')) return;
            e.preventDefault();
            const k = e.key;
            if (k === 'ArrowLeft') this.move(-1);
            else if (k === 'ArrowRight') this.move(1);
            else if (k === 'ArrowDown') { this.softDrop = true; this.stepDown(); }
            else if (e.repeat) return;
            else if (k === 'p' || k === 'P') this.togglePause();
            else if (k === 'ArrowUp' || k === 'x' || k === 'X') this.rotate(1);
            else if (k === 'z' || k === 'Z') this.rotate(-1);
            else if (k === ' ') this.hardDrop();
            else this.holdPiece();
        };
        this.onKeyUp = (e) => { if (e.key === 'ArrowDown') this.softDrop = false; };
        this.onHidden = () => { if (this.phase === 'play') this.togglePause(); };
        this.onVisibility = () => { if (document.hidden) this.onHidden(); };
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
        document.addEventListener('visibilitychange', this.onVisibility);
        window.addEventListener('blur', this.onHidden);
    }

    best() {
        try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; }
    }

    updateHud() {
        const prev = this.best();
        const best = Math.max(prev, this.score);
        if (best > prev) {
            try { localStorage.setItem(BEST_KEY, String(best)); } catch { /* noop */ }
        }
        this.hud.lines.textContent = `${this.lines}/${GOAL_LINES}`;
        this.hud.level.textContent = this.level;
        this.hud.score.textContent = this.score;
        this.hud.best.textContent = best;
    }

    showOverlay(kind) {
        const o = this.overlay;
        this.hud.pause.textContent = kind === 'paused' ? '▶ Seguir' : '⏸ Pausa';
        if (!kind) { o.hidden = true; return; }
        const text = {
            paused: ['Pausa', 'Respira un momento.', 'Seguir jugando'],
            over: ['¡Se llenó!', `Lograste ${this.lines} de ${GOAL_LINES} filas.`, 'Intentar de nuevo'],
            won: ['¡Meta lograda!', `${GOAL_LINES} filas eliminadas · ${this.score} puntos.`, ''],
        }[kind];
        o.querySelector('h3').textContent = text[0];
        o.querySelector('p').textContent = text[1];
        const btn = o.querySelector('button');
        btn.textContent = text[2];
        btn.hidden = !text[2];
        o.hidden = false;
        if (text[2]) btn.focus({ preventScroll: true });
    }

    // ---- Dibujo -----------------------------------------------------------
    draw() {
        const { ctx } = this;
        const W = COLS * CELL;
        const H = ROWS * CELL;
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#1b1748');
        bg.addColorStop(1, '#0f0c2c');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let c = 1; c < COLS; c++) { ctx.moveTo(c * CELL + 0.5, 0); ctx.lineTo(c * CELL + 0.5, H); }
        for (let r = 1; r < ROWS; r++) { ctx.moveTo(0, r * CELL + 0.5); ctx.lineTo(W, r * CELL + 0.5); }
        ctx.stroke();

        const flash = this.phase === 'clearing' && Math.floor(this.clearTimer / 75) % 2 === 0;
        this.board.forEach((row, r) => row.forEach((id, c) => {
            if (!id) return;
            const color = flash && this.clearRows.includes(r) ? '#ffffff' : PIECES[id].color;
            drawBlock(ctx, c * CELL, r * CELL, CELL, color);
        }));

        const { piece } = this;
        if (piece) {
            const color = PIECES[piece.id].color;
            const gy = dropY(this.board, piece);
            forEachCell(piece.shape, (c, r) => {
                if (gy + r >= 0) drawBlock(ctx, (piece.x + c) * CELL, (gy + r) * CELL, CELL, color, 0.22);
            });
            forEachCell(piece.shape, (c, r) => {
                if (piece.y + r >= 0) drawBlock(ctx, (piece.x + c) * CELL, (piece.y + r) * CELL, CELL, color);
            });
        }

        this.drawPreview(this.holdCtx, this.hold ? [this.hold] : [], this.canHold ? 1 : 0.35);
        this.drawPreview(this.nextCtx, this.queue.slice(0, 3), 1);
    }

    /** Dibuja piezas pequeñas centradas, apiladas verticalmente (64px cada una). */
    drawPreview(ctx, ids, alpha) {
        const { width, height } = ctx.canvas;
        ctx.clearRect(0, 0, width, height);
        const size = 18;
        ids.forEach((id, i) => {
            const cells = [];
            forEachCell(PIECES[id].shape, (c, r) => cells.push([c, r]));
            const cs = cells.map((p) => p[0]);
            const rs = cells.map((p) => p[1]);
            const minC = Math.min(...cs);
            const minR = Math.min(...rs);
            const ox = (width - (Math.max(...cs) - minC + 1) * size) / 2;
            const oy = i * 64 + (64 - (Math.max(...rs) - minR + 1) * size) / 2;
            for (const [c, r] of cells) drawBlock(ctx, ox + (c - minC) * size, oy + (r - minR) * size, size, PIECES[id].color, alpha);
        });
    }
}
