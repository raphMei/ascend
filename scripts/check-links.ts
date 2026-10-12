/* Vérifie que chaque lien des cours (Java, dev front, plans MIAGE) répond. Usage : npm run check:links
   - 404 / erreur réseau : échec (code de sortie 1)
   - 403 / 429 : avertissement (le site bloque les robots mais existe)
   Les liens sont dédoublonnés et testés 8 par 8. Nécessite l'accès au réseau. */
import { FRONT_TASKS } from '../src/content/front/path';
import { JT } from '../src/content/java/path';
import { PLANS } from '../src/content/miage/plans';
import type { Resource } from '../src/content/types';

const all: { where: string; r: Resource }[] = [];
JT.forEach((t) => t.res.forEach((r) => all.push({ where: `Java ${t.id}`, r })));
FRONT_TASKS.forEach((t) => t.res.forEach((r) => all.push({ where: `Front ${t.id}`, r })));
for (const [sid, plan] of Object.entries(PLANS)) {
  plan.units.forEach((u, i) => (u.res ?? []).forEach((r) => all.push({ where: `MIAGE ${sid} unité ${i + 1}`, r })));
  Object.entries(plan.projects ?? {}).forEach(([id, rs]) => rs.forEach((r) => all.push({ where: `MIAGE ${id}`, r })));
}
const urls = [...new Set(all.map((a) => a.r.url))];
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

async function status(u: string): Promise<number | string> {
  // Un échec réseau isolé arrive (certains sites sont capricieux) : jusqu'à trois essais avant de déclarer un lien cassé.
  let r: number | string = 'inconnu';
  for (let i = 0; i < 3 && typeof r !== 'number'; i++) r = await attempt(u);
  return r;
}

async function attempt(u: string): Promise<number | string> {
  for (const method of ['HEAD', 'GET']) {
    try {
      const r = await fetch(u, { method, redirect: 'follow', headers: { 'user-agent': UA, 'accept-language': 'fr' }, signal: AbortSignal.timeout(20000) });
      if (method === 'HEAD' && (r.status === 405 || r.status >= 400)) continue;
      return r.status;
    } catch (e) { if (method === 'GET') return e instanceof Error ? e.message : String(e); }
  }
  return 'inconnu';
}

const results = new Map<string, number | string>();
const queue = [...urls];
await Promise.all(Array.from({ length: 8 }, async () => { while (queue.length) { const u = queue.shift()!; results.set(u, await status(u)); } }));

let bad = 0, warn = 0;
for (const u of urls) {
  const s = results.get(u)!;
  if (typeof s === 'number' && s < 400) continue;
  const where = all.filter((a) => a.r.url === u).map((a) => a.where).slice(0, 3).join(', ');
  if (s === 403 || s === 429) { warn++; console.log(`⚠ ${s}  ${u}   (${where})`); } else { bad++; console.log(`✗ ${s}  ${u}   (${where})`); }
}
const fr = all.filter((a) => a.r.lang === 'fr').length;
console.log(`\n${urls.length} liens distincts (${all.length} références, ${Math.round((100 * fr) / all.length)} % en français) : ${bad} cassé(s), ${warn} avertissement(s).`);
process.exit(bad ? 1 : 0);
