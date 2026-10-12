import { badges, longestStreak } from '@/domain/badges';
import { habitStats, heatmap, weekReview } from '@/domain/habit-stats';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import type { DayData, DayStatsSnapshot } from '@/domain/types';
import { PHASES } from '@/content/java/path';
import { genericTasks } from './fixtures';

const S = DEFAULT_SETTINGS;
const tasks = genericTasks(S);
const morning = { tephila: true, pompes: true, stretch: true, petitdej: true };
const snap = (pct: number, done: Record<string, number> = {}): DayStatsSnapshot => ({ pct, pl: 100, dn: pct, planned: {}, done });
const stats = (inp: Partial<Parameters<typeof habitStats>[0]> & { days: Record<string, DayData>; today: string }) => habitStats({ settings: S, progress: { done: {} }, tasks, ...inp });
const find = (list: ReturnType<typeof habitStats>, id: string) => list.find((h) => h.id === id)!;

describe('taux de réussite par habitude', () => {
  const TODAY = '2026-11-10';     // mardi
  it('compte les jours prévus et faits sur 7 et 30 jours', () => {
    const days = { '2026-11-09': { done: morning }, '2026-11-06': { done: morning }, '2026-11-05': { done: morning } };
    const t = find(stats({ days, today: TODAY }), 'tephila');
    expect(t.done7).toBe(3);
    expect(t.planned7).toBe(5);                      // 4–9 nov. hors samedi 7, aujourd'hui non compté car pas fait
    expect(t.rate7).toBe(60);
  });
  it('aujourd\'hui compte seulement s\'il est fait', () => {
    const before = find(stats({ days: {}, today: TODAY }), 'tephila');
    const after = find(stats({ days: { [TODAY]: { done: morning } }, today: TODAY }), 'tephila');
    expect(after.planned7).toBe(before.planned7 + 1); expect(after.done7).toBe(before.done7 + 1);
  });
  it('série courante et meilleure série', () => {
    const days = Object.fromEntries(['2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-11-08', '2026-11-09'].map((d) => [d, { done: morning }]));
    const t = find(stats({ days, today: TODAY }), 'tephila');
    expect(t.current).toBe(2);                       // 8 et 9 nov. ; le 10 (aujourd'hui) n'est pas encore fait
    expect(t.best).toBe(4);                          // 20 → 23 oct.
  });
  it('les jours sans rien de prévu ne comptent pas (aucune division par zéro)', () => {
    const list = stats({ days: {}, today: '2026-10-08' });
    list.forEach((h) => { expect(h.planned7 >= h.done7).toBe(true); if (h.planned7 === 0) expect(h.rate7).toBeNull(); });
  });
  it('pas d\'habitude pour les tâches MIAGE ni les blocs ajoutés', () => {
    const list = stats({ days: { [TODAY]: { edits: { extra: { a: { title: 'x', start: 1200, end: 1230, domain: 'autre' } } } } }, today: TODAY });
    expect(list.some((h) => h.id.startsWith('m:') || h.id.startsWith('x:'))).toBe(false);
  });
  it('triées par nombre de jours prévus puis par titre', () => {
    const list = stats({ days: {}, today: TODAY });
    for (let i = 1; i < list.length; i++) expect(list[i - 1].planned30 >= list[i].planned30).toBe(true);
  });
});

describe('calendrier de chaleur', () => {
  it('12 semaines de 7 jours, du lundi au dimanche, la dernière contient aujourd\'hui', () => {
    const h = heatmap({}, '2026-11-11', 12);
    expect(h).toHaveLength(12); h.forEach((w) => expect(w).toHaveLength(7));
    expect(h[11][0].date).toBe('2026-11-09');         // lundi de la semaine en cours
    expect(h[11][2].date).toBe('2026-11-11');
  });
  it('avancement connu pour le passé, null pour les jours sans donnée et le futur ; aujourd\'hui en direct', () => {
    const h = heatmap({ '2026-11-10': { stats: snap(80) }, '2026-11-11': { stats: snap(10) } }, '2026-11-11', 2, 55);
    const cell = (d: string) => h.flat().find((c) => c.date === d)!;
    expect(cell('2026-11-10').pct).toBe(80);
    expect(cell('2026-11-11').pct).toBe(55);          // la valeur en direct l'emporte
    expect(cell('2026-11-09').pct).toBeNull();
    expect(cell('2026-11-12')).toMatchObject({ pct: null, future: true });
  });
});

describe('bilan de la semaine', () => {
  const TODAY = '2026-11-11';        // mercredi
  const days = {
    '2026-11-02': { stats: snap(80, { matin: 60, miage: 90 }) }, '2026-11-03': { stats: snap(50, { matin: 30 }) },    // semaine précédente
    '2026-11-09': { stats: snap(75, { matin: 60, java: 120 }) }, '2026-11-10': { stats: snap(90, { matin: 75, miage: 30 }) }
  };
  it('totaux par domaine, jours réussis et moyenne de la semaine en cours', () => {
    const r = weekReview(days, TODAY);
    expect(r.current.minutes).toEqual({ matin: 135, java: 120, miage: 30 });
    expect(r.current.totalMin).toBe(285); expect(r.current.okDays).toBe(2); expect(r.current.days).toBe(2); expect(r.current.avgPct).toBe(83);
  });
  it('compare à la semaine précédente', () => {
    const r = weekReview(days, TODAY);
    expect(r.previous.totalMin).toBe(180); expect(r.previous.okDays).toBe(1);
    expect(r.deltaMin).toBe(285 - 180);
  });
  it('intègre aujourd\'hui en direct', () => {
    const r = weekReview(days, TODAY, snap(60, { sport: 75 }));
    expect(r.current.minutes.sport).toBe(75); expect(r.current.days).toBe(3);
  });
  it('semaine vide : zéros partout', () => {
    expect(weekReview({}, TODAY).current).toMatchObject({ totalMin: 0, okDays: 0, avgPct: 0, days: 0 });
  });
});

describe('badges', () => {
  const run = (n: number, pct = 80) => Object.fromEntries(Array.from({ length: n }, (_, i) => [new Date(Date.UTC(2026, 9, 12 + i)).toISOString().slice(0, 10), { stats: snap(pct) }]));
  it('plus longue série : le samedi ne la casse pas, un trou la casse', () => {
    // lun 12 → ven 16, (sam 17 ignoré), dim 18 → mar 20 : 5 + 3 = 8 d'affilée
    expect(longestStreak(run(9))).toBe(8);
    const gap = { ...run(9) }; delete (gap as Record<string, unknown>)['2026-10-14'];
    expect(longestStreak(gap)).toBe(5);              // 15 → 20 : jeudi, vendredi, (sam), dim, lun, mar = 5
    expect(longestStreak({})).toBe(0);
    expect(longestStreak(run(9, 60))).toBe(0);       // sous 70 %
  });
  it('seuils de série : 7 jours, 30 jours, 100 jours', () => {
    const b = (n: number) => Object.fromEntries(badges(run(n), { done: {} }).map((x) => [x.id, x.earned]));
    // 8 jours calendaires du lundi 12 au lundi 19 oct. = 7 jours comptés (le samedi 17 ne compte pas)
    expect(b(8)['serie-7']).toBe(true);
    expect(b(7)['serie-7']).toBe(false);
    expect(b(35)['serie-30']).toBe(true); expect(b(35)['serie-100']).toBe(false);
  });
  it('avancement vers le seuil, plafonné', () => {
    const x = badges(run(3), { done: {} }).find((y) => y.id === 'serie-7')!;
    expect(x).toMatchObject({ value: 3, target: 7, earned: false });
    expect(badges(run(50), { done: {} }).find((y) => y.id === 'serie-7')).toMatchObject({ value: 7, earned: true });
  });
  it('sport, anglais et lecture', () => {
    const d: Record<string, DayData> = {};
    for (let i = 0; i < 20; i++) d[`2026-10-${String(1 + i).padStart(2, '0')}`] = { done: { sport: true }, pages: 25 };
    const r = Object.fromEntries(badges(d, { done: {} }).map((x) => [x.id, x.earned]));
    expect(r['sport-20']).toBe(true); expect(r['lecteur-500']).toBe(true); expect(r['anglais-30']).toBe(false);
  });
  it('parcours Java : première phase puis socle', () => {
    const p1 = Object.fromEntries(PHASES[0].tasks.map((t) => [t.id, true]));
    expect(badges({}, { done: p1 }).find((x) => x.id === 'java-1')!.earned).toBe(true);
    expect(badges({}, { done: p1 }).find((x) => x.id === 'java-socle')!.earned).toBe(false);
    const core = Object.fromEntries(PHASES.filter((p) => p.core).flatMap((p) => p.tasks.map((t) => [t.id, true])));
    expect(badges({}, { done: core }).find((x) => x.id === 'java-socle')!.earned).toBe(true);
  });
  it('aucun badge au départ', () => {
    expect(badges({}, { done: {} }).every((b) => !b.earned)).toBe(true);
  });
});
