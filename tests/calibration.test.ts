import { addDays } from '@/core/dates';
import { JT } from '@/content/java/path';
import type { MiageTask } from '@/content/types';
import { CALIB, calibKey, calibrate, calibrateTasks, coefFor, pathPace, timeCategory, timeEntry, timeKey } from '@/domain/calibration';
import { elapsedMs, overtimeMs, pauseTimer, remainingMs, resumeTimer, startTimer } from '@/domain/timer';
import { parseBackup } from '@/services/importData';
import type { DayData, TimeEntry } from '@/domain/types';

/** Jours fictifs : une mesure par jour à partir du 1er octobre. */
const daysWith = (entries: TimeEntry[], from = '2026-10-01'): Record<string, DayData> =>
  Object.fromEntries(entries.map((e, i) => [addDays(from, i), { time: { ['m:x@' + i]: e } }]));
const fiche = (p: number, r: number): TimeEntry => ({ c: 'miage:fiche', p, r });
const task = (id: string, k: MiageTask['k'], h: number): MiageTask => ({ id, s: 'bdd', k, t: id, d: '', due: '2026-10-20', h });

describe('minuteur : temps réel écoulé', () => {
  it('compte le temps passé, pauses exclues, dépassement compris', () => {
    const t = startTimer(25, 0);
    expect(elapsedMs(t, 10 * 60_000)).toBe(10 * 60_000);
    const p = pauseTimer(t, 10 * 60_000);
    expect(elapsedMs(p, 99 * 60_000)).toBe(10 * 60_000);                 // en pause, rien ne s'ajoute
    const r = resumeTimer(p, 50 * 60_000);
    expect(elapsedMs(r, 85 * 60_000)).toBe(45 * 60_000);                 // 10 + 35 : 20 min de dépassement
    expect(overtimeMs(r, 85 * 60_000)).toBe(20 * 60_000);
    expect(remainingMs(r, 85 * 60_000)).toBe(0);
  });
  it('une pause après la fin garde le dépassement et l\'affichage reste à zéro', () => {
    const p = pauseTimer(startTimer(10, 0), 14 * 60_000);
    expect(remainingMs(p, 0)).toBe(0);
    expect(elapsedMs(p, 0)).toBe(14 * 60_000);
  });
});

describe('mesures', () => {
  it('catégorie : type de tâche pour la MIAGE, domaine sinon', () => {
    const tasks = [task('a', 'fiche', 1)];
    expect(timeCategory({ domain: 'miage', scope: 'prog', taskId: 'a' }, tasks)).toBe('miage:fiche');
    expect(timeCategory({ domain: 'miage', scope: 'prog', taskId: 'inconnue' }, tasks)).toBe('miage');
    expect(timeCategory({ domain: 'java' }, tasks)).toBe('java');
  });
  it('clé par morceau de bloc', () => { expect(timeKey({ id: 'm:a', start: 600 })).toBe('m:a@600'); });
  it('une mesure trop courte ou sur un bloc minuscule n\'est pas gardée', () => {
    expect(timeEntry('java', 60, 20_000)).toBeNull();                    // moins d'une minute
    expect(timeEntry('java', 4, 10 * 60_000)).toBeNull();                // bloc de 4 min
    expect(timeEntry('java', 60, 75 * 60_000)).toEqual({ c: 'java', p: 60, r: 75 });
  });
});

describe('étalonnage', () => {
  it('sans mesures : aucun coefficient, les tâches restent identiques (même référence)', () => {
    const c = calibrate({});
    expect(c.coef).toEqual({}); expect(c.rows).toEqual([]);
    const tasks = [task('a', 'fiche', 1)];
    expect(calibrateTasks(tasks, c)).toBe(tasks);
  });

  it(`moins de ${CALIB.MIN_N} mesures : pas d'ajustement`, () => {
    const c = calibrate(daysWith([fiche(60, 120), fiche(60, 120)]));
    expect(coefFor(c, 'fiche')).toBe(1);
    expect(c.rows.find((r) => r.category === 'miage:fiche')).toMatchObject({ n: 2, own: false, coef: 1 });
  });

  it('fiches systématiquement 1,5× plus longues : coefficient rétréci vers 1, au dixième', () => {
    const c = calibrate(daysWith(Array.from({ length: 10 }, () => fiche(60, 90))));
    // global : (900 + 3·60) / (600 + 3·60) = 1,38 → 1,4 ; fiches : (900 + 3·1,4·60) / (600 + 180) = 1,48 → 1,5
    expect(c.coef.miage).toBe(1.4);
    expect(coefFor(c, 'fiche')).toBe(1.5);
  });

  it('un type peu mesuré suit le coefficient global de la MIAGE', () => {
    const c = calibrate(daysWith([...Array.from({ length: 6 }, () => fiche(60, 90)), { c: 'miage:rev', p: 60, r: 60 }]));
    expect(c.rows.find((r) => r.category === 'miage:rev')).toMatchObject({ own: false });
    expect(coefFor(c, 'rev')).toBe(c.coef.miage);
    expect(coefFor(c, 'proj')).toBe(c.coef.miage);   // jamais mesuré : global aussi
  });

  it('les examens ne sont jamais ajustés', () => {
    const c = calibrate(daysWith(Array.from({ length: 10 }, () => fiche(60, 90))));
    expect(coefFor(c, 'exam')).toBe(1);
    const exam = task('e', 'exam', 2);
    expect(calibrateTasks([exam], c)[0]).toBe(exam);
  });

  it('bornes : jamais au-delà de ×1,8 ni en dessous de ×0,7', () => {
    const slow = calibrate(daysWith(Array.from({ length: 30 }, () => fiche(30, 89))));
    const fast = calibrate(daysWith(Array.from({ length: 30 }, () => fiche(60, 16))));
    expect(coefFor(slow, 'fiche')).toBe(CALIB.HI);
    expect(coefFor(fast, 'fiche')).toBe(CALIB.LO);
  });

  it('les mesures aberrantes (minuteur oublié, coche par erreur) sont ignorées', () => {
    const c = calibrate(daysWith([fiche(60, 60), fiche(60, 60), fiche(60, 60), fiche(60, 600), fiche(60, 5)]));
    expect(c.rows.find((r) => r.category === 'miage:fiche')!.n).toBe(3);
    expect(coefFor(c, 'fiche')).toBe(1);
  });

  it('seules les 30 mesures les plus récentes comptent', () => {
    const old = Array.from({ length: 30 }, () => fiche(60, 120));       // septembre : très lent
    const recent = Array.from({ length: 30 }, () => fiche(60, 60));     // depuis : conforme
    const c = calibrate({ ...daysWith(old, '2026-08-01'), ...daysWith(recent, '2026-09-15') });
    expect(coefFor(c, 'fiche')).toBe(1);
  });

  it('les mesures effacées (null) sont ignorées', () => {
    const days: Record<string, DayData> = { '2026-10-01': { time: { a: null, b: fiche(60, 60) } } };
    expect(calibrate(days).rows.find((r) => r.category === 'miage:fiche')!.n).toBe(1);
  });

  it('durées ajustées au pas de 5 minutes, durée d\'origine gardée', () => {
    const c = calibrate(daysWith(Array.from({ length: 10 }, () => fiche(60, 90))));
    const [t] = calibrateTasks([task('a', 'fiche', 1)], c);
    expect(t.h0).toBe(1);
    expect(Math.round(t.h * 60)).toBe(90);
    expect(Math.round(t.h * 60) % 5).toBe(0);
  });

  it('clé stable : identique tant que les coefficients ne changent pas', () => {
    const a = calibrate(daysWith(Array.from({ length: 10 }, () => fiche(60, 90))));
    const b = calibrate(daysWith(Array.from({ length: 11 }, () => fiche(60, 90))));
    expect(calibKey(a)).toBe(calibKey(b));
  });

  it('les autres domaines sont mesurés mais n\'influencent pas la MIAGE', () => {
    const c = calibrate(daysWith(Array.from({ length: 5 }, () => ({ c: 'java', p: 60, r: 90 }))));
    expect(c.coef.java).toBeGreaterThan(1);
    expect(coefFor(c, 'fiche')).toBe(1);
  });
});

describe('rythme réel d\'un parcours', () => {
  const TODAY = '2026-11-20';
  const steps = JT.slice(0, 6);
  const stepMin = steps.reduce((a, s) => a + s.min, 0);
  const progress = { done: Object.fromEntries(steps.map((s) => [s.id, true])), doneAt: Object.fromEntries(steps.map((s) => [s.id, '2026-11-10'])) };
  it('minutes de séances / minutes d\'étapes validées sur 28 jours', () => {
    const days: Record<string, DayData> = { '2026-11-10': { stats: { pct: 0, pl: 0, dn: 0, planned: {}, done: { java: stepMin * 1.3 } } } };
    const p = pathPace(JT, days, progress, 'java', TODAY)!;
    expect(p.ratio).toBe(1.3); expect(p.steps).toBe(6);
  });
  it('pas assez d\'étapes validées : pas de rythme', () => {
    const one = { done: { [JT[0].id]: true }, doneAt: { [JT[0].id]: '2026-11-10' } };
    expect(pathPace(JT, { '2026-11-10': { stats: { pct: 0, pl: 0, dn: 0, planned: {}, done: { java: 600 } } } }, one, 'java', TODAY)).toBeNull();
  });
});

describe('sauvegarde', () => {
  it('importe les mesures de temps, le réglage et les remises à zéro', () => {
    const r = parseBackup(JSON.stringify({ days: { '2026-10-01': { time: { 'm:a@600': { c: 'miage:fiche', p: 60, r: 80 }, x: null } } }, settings: { calibrate: false }, progress: { done: {}, resets: { '2026-10-02': ['a'] } } }));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.days['2026-10-01'].time).toEqual({ 'm:a@600': { c: 'miage:fiche', p: 60, r: 80 }, x: null });
    expect(r.data.settings.calibrate).toBe(false);
    expect(r.data.progress.resets).toEqual({ '2026-10-02': ['a'] });
  });
  it('refuse une mesure mal formée', () => {
    const r = parseBackup(JSON.stringify({ days: { '2026-10-01': { time: { a: { c: 'java', p: 'soixante', r: 1 } } } } }));
    expect(r.ok).toBe(false);
  });
});
