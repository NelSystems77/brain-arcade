import { GAME_REWARDS } from '../config.js';
import { shake } from '../fx.js';
import { asmr } from '../asmr.js';
import {
    BOTTLE_CAP, SIDE_SLOTS, UNITS_PER_COLOR, LIQUIDS,
    colorsForLevel, generate, planPour,
} from './dispensaLogic.js';

const LIQUID = Object.fromEntries(LIQUIDS.map((l) => [l.id, l]));
const TILT = 62; // grados al verter
const DRAG_PX = 7; // movimiento mínimo para considerarlo arrastre
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Mi Dispensa: 24 botellas (12 + 12) y un envase gigante al centro.
 * Objetivo: pasar todo el líquido del color pedido al envase central.
 * Se arrastra una botella sobre otra (o se toca una y luego la otra).
 */
export class DispensaGame {
    constructor(container, onComplete, level = 1) {
        this.container = container;
        this.onComplete = onComplete;
        this.colors = colorsForLevel(level);
        this.solved = false;
        this.busy = false;
        this.dead = false;
        this.target = null;
        this.selected = null;
    }

    start() {
        this.newLayout(null);
        this.buildDom();
        this.render();
        asmr.startAmbient();
    }

    destroy() {
        this.dead = true;
        asmr.stopAmbient();
        this.stream?.remove();
    }

    // ---- Estado -----------------------------------------------------------
    newLayout(prevTarget) {
        const g = generate(this.colors, prevTarget);
        this.target = g.target;
        this.initial = JSON.stringify(g.bottles);
        this.loadBottles(g.bottles, []);
    }

    loadBottles(bottles, giantUnits) {
        this.side = bottles.map((units) => ({ units: [...units], cap: BOTTLE_CAP }));
        this.giant = { units: [...giantUnits], cap: UNITS_PER_COLOR, only: this.target, isGiant: true };
        this.all = [...this.side, this.giant];
        this.moves = 0;
        this.history = [];
        this.solved = false;
    }

    // ---- DOM --------------------------------------------------------------
    buildDom() {
        const liq = LIQUID[this.target];
        this.container.innerHTML = `
            <div class="dsp">
                <div class="dsp-bar">
                    <div class="dsp-target">Llena el frasco grande de
                        <span class="dsp-swatch"></span><b class="dsp-target-name"></b></div>
                    <div class="dsp-moves" aria-live="polite"></div>
                </div>
                <div class="dsp-stage">
                    <div class="dsp-side dsp-left"></div>
                    <div class="dsp-mid"></div>
                    <div class="dsp-side dsp-right"></div>
                </div>
                <div class="dsp-actions">
                    <button type="button" class="btn-small" data-act="undo">↩ Deshacer</button>
                    <button type="button" class="btn-small" data-act="reset">🔄 Reiniciar</button>
                    <button type="button" class="btn-small" data-act="new">🎲 Nueva mezcla</button>
                </div>
                <p class="dsp-hint">Arrastra una botella sobre otra para verter, o toca una y luego la otra.
                    Solo se vierte sobre el mismo color o sobre una botella vacía.</p>
            </div>`;
        this.root = this.container.querySelector('.dsp');
        this.stage = this.root.querySelector('.dsp-stage');
        this.movesEl = this.root.querySelector('.dsp-moves');
        this.root.querySelector('.dsp-swatch').style.background = liq.color;
        this.root.querySelector('.dsp-target-name').textContent = liq.name;

        const makeSlot = (parent, cont, i) => {
            const slot = document.createElement('div');
            slot.className = 'dsp-slot';
            slot.innerHTML = `<div class="bt${cont.isGiant ? ' giant' : ''}" role="button" tabindex="0">
                <div class="bt-neck"></div><div class="bt-body"><div class="bt-liquid"></div></div>
                ${cont.isGiant ? '<span class="bt-count"></span>' : ''}</div>`;
            const el = slot.firstElementChild;
            el.dataset.i = i;
            cont.el = el;
            cont.liquid = el.querySelector('.bt-liquid');
            parent.appendChild(slot);
        };
        this.side.forEach((c, i) => {
            makeSlot(this.root.querySelector(i < 12 ? '.dsp-left' : '.dsp-right'), c, i);
        });
        makeSlot(this.root.querySelector('.dsp-mid'), this.giant, SIDE_SLOTS);

        this.bindEvents();
    }

    /** Dibuja las porciones de un recipiente (rachas del mismo color fusionadas). */
    renderContainer(c) {
        c.liquid.innerHTML = '';
        let i = 0;
        while (i < c.units.length) {
            let j = i;
            while (j < c.units.length && c.units[j] === c.units[i]) j++;
            c.liquid.appendChild(this.makeRun(c.units[i], (j - i) / c.cap));
            i = j;
        }
        c.el.setAttribute('aria-label', this.describe(c));
        if (c.isGiant) c.el.querySelector('.bt-count').textContent = `${c.units.length}/${c.cap}`;
    }

    makeRun(color, fraction) {
        const run = document.createElement('div');
        run.className = 'bt-run';
        run.dataset.color = color;
        run.style.background = LIQUID[color].color;
        run.style.height = `${fraction * 100}%`;
        return run;
    }

    describe(c) {
        const name = c.isGiant ? 'Frasco grande' : `Botella ${this.side.indexOf(c) + 1}`;
        if (!c.units.length) return `${name}, vacío`;
        return `${name}: ${c.units.map((u) => LIQUID[u].name).reverse().join(', ')} (de arriba a abajo)`;
    }

    render() {
        for (const c of this.all) this.renderContainer(c);
        this.movesEl.textContent = `Movimientos: ${this.moves}`;
        this.root.querySelector('[data-act="undo"]').disabled = !this.history.length;
    }

    // ---- Entrada ----------------------------------------------------------
    bindEvents() {
        const stage = this.stage;
        let drag = null;

        stage.addEventListener('pointerdown', (e) => {
            const el = e.target.closest('.bt');
            if (!el || this.busy || this.solved || drag) return;
            const c = this.all[+el.dataset.i];
            drag = { c, el, id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false, base: el.getBoundingClientRect() };
            try { stage.setPointerCapture(e.pointerId); } catch { /* ignore */ }
        });

        stage.addEventListener('pointermove', (e) => {
            if (!drag || e.pointerId !== drag.id) return;
            const dx = e.clientX - drag.x0;
            const dy = e.clientY - drag.y0;
            if (!drag.moved) {
                if (Math.hypot(dx, dy) < DRAG_PX) return;
                if (!drag.c.units.length) return; // una botella vacía no se arrastra
                drag.moved = true;
                this.dragSource = drag.c;
                this.setSelected(null);
                drag.el.classList.add('dragging');
                asmr.pick();
            }
            drag.el.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * 0.05}deg) scale(1.06)`;
            this.markHover(this.bottleAt(e.clientX, e.clientY, drag.c));
        });

        const finish = (e, cancelled) => {
            if (!drag || e.pointerId !== drag.id) return;
            const d = drag;
            drag = null;
            this.markHover(null);
            this.dragSource = null;
            if (!d.moved) {
                if (!cancelled) this.tap(d.c);
                return;
            }
            d.el.classList.remove('dragging');
            const over = cancelled ? null : this.bottleAt(e.clientX, e.clientY, d.c);
            if (over && planPour(d.c, over)) {
                this.pour(d.c, over, d.base);
            } else {
                this.returnHome(d.el);
                if (over) this.deny(over);
                else asmr.place();
            }
        };
        stage.addEventListener('pointerup', (e) => finish(e, false));
        stage.addEventListener('pointercancel', (e) => finish(e, true));

        stage.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            const el = e.target.closest('.bt');
            if (!el || this.busy || this.solved) return;
            e.preventDefault();
            this.tap(this.all[+el.dataset.i]);
        });

        this.root.querySelector('.dsp-actions').addEventListener('click', (e) => {
            const act = e.target.closest('button')?.dataset.act;
            if (!act || this.busy) return;
            if (act === 'undo') this.undo();
            else if (act === 'reset') this.reset();
            else if (act === 'new') this.reshuffle();
        });
    }

    /** Recipiente bajo el puntero (el arrastrado no cuenta). */
    bottleAt(x, y, except) {
        for (const node of document.elementsFromPoint(x, y)) {
            const el = node.closest?.('.bt');
            if (!el || el === except.el) continue;
            return this.all[+el.dataset.i];
        }
        return null;
    }

    markHover(c) {
        if (this.hover === c) return;
        this.hover?.el.classList.remove('drop-ok', 'drop-no');
        this.hover = c;
        if (!c || !this.dragSource) return;
        c.el.classList.add(planPour(this.dragSource, c) ? 'drop-ok' : 'drop-no');
    }

    setSelected(c) {
        this.selected?.el.classList.remove('selected');
        this.selected = c;
        c?.el.classList.add('selected');
    }

    tap(c) {
        const sel = this.selected;
        if (!sel) {
            if (!c.units.length) return asmr.place();
            this.setSelected(c);
            asmr.pick();
        } else if (sel === c) {
            this.setSelected(null);
            asmr.place();
        } else if (planPour(sel, c)) {
            this.setSelected(null);
            this.pour(sel, c);
        } else if (c.units.length) {
            // Cambia la selección a otra botella con contenido.
            this.deny(c);
            this.setSelected(c);
        } else {
            this.deny(c);
        }
    }

    deny(c) {
        asmr.deny();
        shake(c.el);
    }

    returnHome(el) {
        el.classList.add('returning');
        el.style.transform = '';
        setTimeout(() => el.classList.remove('returning'), 300);
    }

    // ---- Trasvase ---------------------------------------------------------
    async pour(src, dst, dragBase) {
        const plan = planPour(src, dst);
        if (!plan || this.busy) return;
        this.busy = true;
        this.history.push({ bottles: this.side.map((c) => [...c.units]), giant: [...this.giant.units], moves: this.moves });

        const { color, n } = plan;
        const el = src.el;
        const dstEl = dst.el;
        const sr = dragBase ?? el.getBoundingClientRect();
        const dr = dstEl.getBoundingClientRect();
        const dir = dr.left + dr.width / 2 >= sr.left + sr.width / 2 ? 1 : -1;
        const rad = (TILT * Math.PI) / 180;
        const half = sr.height / 2;

        // Cuello de la botella justo sobre la boca del destino.
        const cx = dr.left + dr.width / 2 - dir * half * Math.sin(rad);
        const cy = dr.top - 4 + half * Math.cos(rad);
        const tx = cx - (sr.left + sr.width / 2);
        const ty = cy - (sr.top + sr.height / 2);

        el.classList.add('pouring');
        asmr.pick();
        el.style.transform = `translate(${tx}px, ${ty}px) rotate(${dir * TILT}deg)`;
        await sleep(this.moveMs());
        if (this.dead) return;

        // Modelo + animación de niveles.
        const before = dst.units.length / dst.cap;
        src.units.splice(src.units.length - n, n);
        dst.units.push(...Array(n).fill(color));
        const after = dst.units.length / dst.cap;
        const pourMs = 520 + n * 230;

        this.animateLevels(src, dst, color, n, pourMs);
        this.showStream(dstEl, color, after, pourMs);
        asmr.pour({ dur: pourMs / 1000, from: before, to: after });
        await sleep(pourMs + 60);
        if (this.dead) return;

        this.stream?.remove();
        asmr.settle();
        el.style.transform = '';
        await sleep(this.moveMs());
        if (this.dead) return;
        el.classList.remove('pouring');

        this.moves++;
        this.busy = false;
        this.render();
        this.checkWin();
    }

    moveMs() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 30 : 420;
    }

    animateLevels(src, dst, color, n, ms) {
        // Longitud de la racha superior de `color` (ya con el modelo actualizado).
        const runOf = (c) => {
            let len = 0;
            for (let i = c.units.length - 1; i >= 0 && c.units[i] === color; i--) len++;
            return len;
        };

        const srcRun = src.liquid.lastElementChild;
        if (srcRun) {
            srcRun.style.transition = `height ${ms}ms linear`;
            srcRun.style.height = `${(runOf(src) / src.cap) * 100}%`;
        }

        let last = dst.liquid.lastElementChild;
        if (!last || last.dataset.color !== color) {
            last = this.makeRun(color, 0);
            dst.liquid.appendChild(last);
        }
        last.style.transition = `height ${ms}ms linear`;
        void last.offsetHeight; // fija el alto inicial antes de animar
        last.style.height = `${(runOf(dst) / dst.cap) * 100}%`;
        if (dst.isGiant) dst.el.querySelector('.bt-count').textContent = `${dst.units.length}/${dst.cap}`;
    }

    /** Hilo de líquido desde la boca de la botella inclinada hasta la superficie. */
    showStream(dstEl, color, fillAfter, ms) {
        const dr = dstEl.getBoundingClientRect();
        const liquid = dstEl.querySelector('.bt-liquid').getBoundingClientRect();
        const top = dr.top - 4;
        const surface = liquid.bottom - liquid.height * fillAfter;
        const s = document.createElement('div');
        s.className = 'dsp-stream';
        s.style.cssText = `left:${dr.left + dr.width / 2 - 3}px;top:${top}px;height:${Math.max(8, surface - top)}px;background:${LIQUID[color].color}`;
        document.body.appendChild(s);
        this.stream = s;
        setTimeout(() => s.classList.add('ending'), Math.max(0, ms - 120));
    }

    // ---- Acciones ---------------------------------------------------------
    undo() {
        const h = this.history.pop();
        if (!h) return;
        this.side.forEach((c, i) => { c.units = [...h.bottles[i]]; });
        this.giant.units = [...h.giant];
        this.moves = h.moves;
        this.setSelected(null);
        asmr.pick();
        this.render();
    }

    reset() {
        this.loadBottles(JSON.parse(this.initial), []);
        this.setSelected(null);
        asmr.settle();
        this.render();
    }

    reshuffle() {
        this.newLayout(this.target);
        this.setSelected(null);
        this.buildDom();
        this.render();
        asmr.settle();
    }

    checkWin() {
        if (this.giant.units.length < this.giant.cap) return;
        this.solved = true;
        this.giant.el.classList.add('done');
        asmr.chime();
        setTimeout(() => {
            if (!this.dead) this.onComplete(GAME_REWARDS.dispensa);
        }, 2000);
    }
}
