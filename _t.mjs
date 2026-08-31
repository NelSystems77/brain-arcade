import { JSDOM } from 'jsdom'; import fs from 'node:fs';
import { GAME_DATA } from './src/js/data.js';
const html=fs.readFileSync('dist/index.html','utf8'), js=fs.readFileSync('dist/app.js','utf8');
const d=new JSDOM(html,{runScripts:'outside-only',url:'http://localhost/',pretendToBeVisual:true});const w=d.window;
w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.requestAnimationFrame=()=>0;w.cancelAnimationFrame=()=>{};
w.confirm=()=>true;w.alert=(m)=>console.log('ALERT',m);const E=[];w.console.error=(...a)=>E.push(a.join(' '));
w.addEventListener('error',e=>E.push('winerr '+(e.error?.stack||e.message)));
w.localStorage.setItem('brainArcadeUser', JSON.stringify({xp:1250, level:12}));
w.eval(js);const doc=w.document;await new Promise(r=>w.addEventListener('load',r));
const key=s=>s.toUpperCase().replace(/\s+/g,'').split('').sort().join('');
const L=[];
const themeCards=doc.querySelectorAll('#theme-grid .card');
L.push(['temas en pantalla', themeCards.length, [...themeCards].map(c=>c.querySelector('h3').textContent).join(',')]);
const sci=[...themeCards].find(c=>c.querySelector('h3').textContent==='CIENCIA');
L.push(['ciencia accent', sci.style.getPropertyValue('--acc')]);
sci.click();
L.push(['título', doc.getElementById('selected-theme-title').textContent]);
// anagram
doc.querySelector('.game-card[data-game="anagrams"]').click();
const scr=doc.querySelector('.scrambled-word').textContent;
const ans=GAME_DATA.ciencia.anagrams.find(x=>key(x)===key(scr));
L.push(['anagram resoluble', !!ans, ans]);
doc.getElementById('anagram-input').value=ans; doc.getElementById('check-btn').click();
await new Promise(r=>setTimeout(r,1000));
L.push(['anagram win modal', !doc.getElementById('modal-reward').classList.contains('hidden')]);
doc.getElementById('close-modal').click();
// trivia
doc.querySelector('.game-card[data-game="trivia"]').click();
L.push(['trivia q', !!doc.querySelector('.trivia__q')]);
for(let n=0;n<5;n++){doc.querySelector('.trivia-opt[data-correct="1"]').click();await new Promise(r=>setTimeout(r,1600));}
await new Promise(r=>setTimeout(r,1000));
L.push(['trivia score+modal', doc.querySelector('.trivia__score')?.textContent, !doc.getElementById('modal-reward').classList.contains('hidden')]);
doc.getElementById('close-modal').click();
// crossword
doc.querySelector('.game-card[data-game="crossword"]').click();
L.push(['cw nums', doc.querySelectorAll('.cw-num').length, 'grupos', [...doc.querySelectorAll('.clues-group h4')].map(h=>h.textContent).join('+')]);
for(const inp of doc.querySelectorAll('.cw-cell-input')) inp.value=inp.dataset.correct;
doc.querySelector('#cw-check-btn').click(); await new Promise(r=>setTimeout(r,60));
L.push(['cw win', !doc.getElementById('modal-reward').classList.contains('hidden'), doc.getElementById('cw-feedback').textContent]);
// memory
doc.getElementById('close-modal').click();
doc.querySelector('.game-card[data-game="memory"]').click();
L.push(['memory cards', doc.querySelectorAll('.memory-card').length]);
console.log(L.map(r=>'  ✓ '+r.map(String).join('  |  ')).join('\n'));
const real=E.filter(e=>!/Not implemented|Could not parse CSS|getContext/i.test(e));
console.log('ERRORS:', real.length?real:'none');
