// Budget de taille : échoue si le JavaScript chargé au démarrage (fichier principal + fichiers préchargés par index.html) dépasse la limite compressée.
// Usage : npm run build && npm run size
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const LIMIT_KB = Number(process.env.SIZE_LIMIT_KB ?? 130);   // démarrage, compressé
const dist = 'dist';
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const entry = html.match(/src="[^"]*\/(assets\/[^"]+\.js)"/)?.[1];
if (!entry) { console.error('Fichier principal introuvable dans dist/index.html : lance d\'abord npm run build.'); process.exit(2); }
const kb = (n) => Math.round((n / 1024) * 10) / 10;
const gz = (f) => gzipSync(readFileSync(join(dist, f))).length;

const js = readdirSync(join(dist, 'assets')).filter((f) => f.endsWith('.js'));
const total = js.reduce((a, f) => a + gz('assets/' + f), 0);
const preload = [...html.matchAll(/rel="modulepreload"[^>]*href="[^"]*\/(assets\/[^"]+\.js)"/g)].map((m) => m[1]);
const main = [entry, ...preload].reduce((a, f) => a + gz(f), 0);
console.log(`Chargé au démarrage : ${kb(main)} Ko compressés (${1 + preload.length} fichiers, limite ${LIMIT_KB} Ko)`);
console.log(`${js.length} fichiers JavaScript, ${kb(total)} Ko compressés au total ; le SDK Firebase n'est chargé qu'à la connexion.`);
for (const f of js.sort((a, b) => statSync(join(dist, 'assets', b)).size - statSync(join(dist, 'assets', a)).size).slice(0, 6)) console.log(`  ${kb(gz('assets/' + f))} Ko  ${f}`);
if (main / 1024 > LIMIT_KB) { console.error(`✗ Le démarrage dépasse ${LIMIT_KB} Ko.`); process.exit(1); }
