// Genera src/assets/favicon.ico envolviendo el PNG del logo (sin dependencias).
// El formato ICO admite incrustar un PNG tal cual; los navegadores lo reescalan.
// Uso: node scripts/gen-favicon.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = 'src/assets/logo.png';
const OUT = 'src/assets/favicon.ico';

const png = readFileSync(SRC);
if (png.readUInt32BE(0) !== 0x89504e47) throw new Error(`${SRC} no es un PNG`);

let w = png.readUInt32BE(16);
let h = png.readUInt32BE(20);
// En ICO el ancho/alto van en 1 byte; 256 se representa como 0.
const wb = w >= 256 ? 0 : w;
const hb = h >= 256 ? 0 : h;

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reservado
header.writeUInt16LE(1, 2); // tipo: icono
header.writeUInt16LE(1, 4); // nº de imágenes

const entry = Buffer.alloc(16);
entry.writeUInt8(wb, 0);
entry.writeUInt8(hb, 1);
entry.writeUInt8(0, 2); // paleta
entry.writeUInt8(0, 3); // reservado
entry.writeUInt16LE(1, 4); // planos
entry.writeUInt16LE(32, 6); // bits por píxel
entry.writeUInt32LE(png.length, 8); // tamaño de la imagen
entry.writeUInt32LE(6 + 16, 12); // offset a los datos

writeFileSync(OUT, Buffer.concat([header, entry, png]));
console.log(`${OUT} generado (${w}x${h}, ${png.length + 22} bytes)`);
