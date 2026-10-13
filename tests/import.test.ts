import { parseBackup } from '@/services/importData';

const valid = {
  days: { '2026-11-03': { pages: 25, done: { tephila: true }, journal: { 'dl:u1': { t: 'Perceptron', k: 'miage', rev: true, next: '2026-11-05', n: 0 } }, stats: { pct: 40, pl: 300, dn: 120, planned: { matin: 75 }, done: { matin: 20 } } } },
  settings: { theme: 'dark', onsite: [2, 4], workMin: 400, livre: 'Dune', months: { '2026-11': { anglais: 'normal' } } },
  progress: { done: { p1t1: true }, toeic: { '2026-11-01': 700 } }
};

describe('import d\'une sauvegarde', () => {
  it('accepte une sauvegarde valide et compte son contenu', () => {
    const r = parseBackup(JSON.stringify(valid));
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.counts).toEqual({ days: 1, settings: 5, tasks: 1 }); expect(r.data.days['2026-11-03'].pages).toBe(25); expect(r.data.days['2026-11-03'].journal?.['dl:u1']?.t).toBe('Perceptron'); expect(r.data.progress.toeic).toEqual({ '2026-11-01': 700 }); }
  });
  it('accepte une sauvegarde partielle (seulement les réglages)', () => {
    expect(parseBackup(JSON.stringify({ settings: { theme: 'light' } })).ok).toBe(true);
  });
  it('ignore les champs inconnus au lieu de les importer', () => {
    const r = parseBackup(JSON.stringify({ days: { '2026-11-03': { pages: 80, inconnu: 'x', weight: 70 } }, settings: { pirate: true }, extra: 1 }));
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.data.days['2026-11-03']).toEqual({ pages: 80 }); expect(r.data.settings).toEqual({}); }
  });
  it.each([
    ['texte qui n\'est pas du JSON', 'pas du json', /pas du JSON valide/],
    ['tableau au lieu d\'un objet', '[]', /objet/],
    ['objet vide sans rien de reconnaissable', '{}', /ne ressemble pas à une sauvegarde/],
    ['clé de jour invalide', JSON.stringify({ days: { demain: {} } }), /pas une date/],
    ['pages qui n\'est pas un nombre', JSON.stringify({ days: { '2026-11-03': { pages: 'beaucoup' } } }), /« pages » doit être un nombre/],
    ['bilan invalide dans le journal', JSON.stringify({ days: { '2026-11-03': { journal: { a: { t: 5 } } } } }), /bilan « a » est invalide/],
    ['case cochée non booléenne', JSON.stringify({ days: { '2026-11-03': { done: { tephila: 'oui' } } } }), /vrai ou faux/],
    ['thème inconnu', JSON.stringify({ settings: { theme: 'rose' } }), /theme/],
    ['jours sur site hors plage', JSON.stringify({ settings: { onsite: [0, 9] } }), /onsite/],
    ['nombre infini en réglage', '{"settings":{"workMin":"400"}}', /nombre attendu/],
    ['progression non objet', JSON.stringify({ progress: 5 }), /progress/]
  ])('refuse : %s', (_n, text, re) => {
    const r = parseBackup(text);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join(' ')).toMatch(re);
  });
  it('limite le nombre de problèmes affichés', () => {
    const days = Object.fromEntries(Array.from({ length: 20 }, (_, i) => ['mauvais' + i, {}]));
    const r = parseBackup(JSON.stringify({ days }));
    expect(r.ok).toBe(false);
    if (!r.ok) { expect(r.errors.length).toBeLessThanOrEqual(9); expect(r.errors.at(-1)).toMatch(/autre\(s\) problème/); }
  });
  it('refuse plus de 5 000 jours', () => {
    const days = Object.fromEntries(Array.from({ length: 5001 }, (_, i) => [new Date(Date.UTC(2000, 0, 1 + i)).toISOString().slice(0, 10), {}]));
    const r = parseBackup(JSON.stringify({ days }));
    expect(r.ok).toBe(false);
  });
});
