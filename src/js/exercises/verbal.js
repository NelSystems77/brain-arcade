import { shuffle } from '../utils.js';
import { ChoiceRound } from './choiceRound.js';
import { REFRANES, BOMBAS, RETAHILAS } from './data.js';

const ROUND = 5;

function toOptions(correct, distractores) {
    return [
        { text: correct, correct: true },
        ...distractores.map((d) => ({ text: d, correct: false })),
    ];
}

export function makeRefranes(container, onComplete) {
    const questions = shuffle(REFRANES).slice(0, ROUND).map((it) => ({
        stem: `${it.inicio} …`,
        options: toOptions(it.fin, it.distractores),
    }));
    return new ChoiceRound(container, onComplete, {
        questions,
        introHtml: 'Elegí cómo termina el dicho.',
    });
}

export function makeBombas(container, onComplete) {
    const questions = shuffle(BOMBAS).slice(0, ROUND).map((it) => ({
        stem: `${it.versos.join('<br>')}<br><span class="bomba-blank">___</span>`,
        options: toOptions(it.fin, it.distractores),
    }));
    return new ChoiceRound(container, onComplete, {
        questions,
        introHtml: 'Elegí el verso que mejor cierra la bomba.',
    });
}

export function makeRetahilas(container, onComplete) {
    const questions = shuffle(RETAHILAS).slice(0, ROUND).map((it) => ({
        stem: it.texto.replace('___', '<span class="bomba-blank">___</span>'),
        options: toOptions(it.respuesta, it.distractores),
    }));
    return new ChoiceRound(container, onComplete, {
        questions,
        introHtml: 'Completá la parte que falta.',
    });
}
