import { range } from '@/core/dates';
import { MINUTES, SPORT_PROGRAMS, monthPlanFor, settingsForDate } from '@/domain/month';
import { monthLoad } from '@/domain/month-load';
import { planDay } from '@/domain/planner';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { genericTasks } from './fixtures';
import type { Progress, Settings } from '@/domain/types';

const S0 = DEFAULT_SETTINGS;
const tasks = genericTasks(S0);
const prog: Progress = { done: {} };
const plan = (date: string, S: Settings) => planDay({ date, settings: S, progress: prog, day: undefined, today: '2026-10-01', tasks });
const sum = (p: ReturnType<typeof plan>, id: string) => p.blocks.filter((b) => b.id === id).reduce((a, b) => a + b.end - b.start, 0);

describe('Mon mois : intensité par domaine', () => {
  it('sans réglage de mois : les réglages par défaut s\'appliquent tels quels (même objet)', () => {
    expect(settingsForDate(S0, '2026-10-14')).toBe(S0);
  });

  it('l\'intensité règle les minutes par jour du mois', () => {
    const S: Settings = { ...S0, months: { '2026-10': { anglais: 'intensif', lecture: 'leger', front: 'normal', projets: 'normal' } } };
    const p = plan('2026-10-14', S);
    expect(sum(p, 'anglais')).toBe(MINUTES.anglais.intensif);
    expect(sum(p, 'lecture')).toBe(MINUTES.lecture.leger);
    expect(sum(p, 'front')).toBe(MINUTES.front.normal);
    expect(sum(p, 'projets')).toBe(MINUTES.projets.normal);
  });

  it('le mois suivant reprend le réglage précédent, sauf ce qu\'il change', () => {
    const S: Settings = { ...S0, months: { '2026-10': { anglais: 'intensif', lecture: 'normal' }, '2026-11': { anglais: 'leger' } } };
    expect(monthPlanFor(S, '2026-11-10')).toEqual({ anglais: 'leger', lecture: 'normal' });
    expect(monthPlanFor(S, '2026-10-10')).toEqual({ anglais: 'intensif', lecture: 'normal' });
    expect(monthPlanFor(S, '2026-09-10')).toBeUndefined();
  });

  it('null = comme le mois précédent (ne remplace pas la valeur héritée)', () => {
    const S: Settings = { ...S0, months: { '2026-10': { anglais: 'intensif' }, '2026-11': { anglais: null } } };
    expect(monthPlanFor(S, '2026-11-10')).toEqual({ anglais: 'intensif' });
  });

  it('changer d\'intensité change le planning, un domaine désactivé disparaît', () => {
    const S: Settings = { ...S0, anglaisMin: 20, months: { '2026-10': { anglais: 'off' }, '2026-11': { anglais: 'normal' } } };
    expect(sum(plan('2026-10-14', S), 'anglais')).toBe(0);
    expect(sum(plan('2026-11-11', S), 'anglais')).toBe(20);
  });

  it('Java : la durée quotidienne suit l\'intensité', () => {
    const j = (level: 'leger' | 'normal' | 'intensif') => sum(plan('2026-10-14', { ...S0, months: { '2026-10': { java: level } } }), 'java');
    expect(j('leger')).toBeLessThanOrEqual(45);
    expect(j('intensif')).toBeGreaterThanOrEqual(j('normal'));
  });

  it('sport : 3, 5 ou 6 séances par semaine, jamais de séance le samedi', () => {
    const count = (level: 'leger' | 'normal' | 'intensif') => Object.keys(SPORT_PROGRAMS[level]).length;
    expect([count('leger'), count('normal'), count('intensif')]).toEqual([3, 5, 6]);
    for (const level of ['leger', 'normal', 'intensif'] as const) expect(SPORT_PROGRAMS[level][6]).toBeUndefined();
    const week = range('2026-10-12', '2026-10-18');
    const sessions = (level: 'leger' | 'normal' | 'intensif') => week.filter((d) => plan(d, { ...S0, months: { '2026-10': { sport: level } } }).blocks.some((b) => b.id === 'sport')).length;
    expect(sessions('leger')).toBe(3); expect(sessions('normal')).toBe(5); expect(sessions('intensif')).toBe(6);
  });

  it('sport désactivé : aucune séance', () => {
    const none = range('2026-10-12', '2026-10-18').filter((d) => plan(d, { ...S0, months: { '2026-10': { sport: 'off' } } }).blocks.some((b) => b.id === 'sport'));
    expect(none).toEqual([]);
  });
});

describe('charge du mois', () => {
  it('plus de domaines intensifs : plus de temps réservé, même temps libre', () => {
    const light = monthLoad(S0, '2026-10', prog, tasks);
    const heavy = monthLoad({ ...S0, months: { '2026-10': { anglais: 'intensif', lecture: 'intensif', front: 'intensif', projets: 'intensif' } } }, '2026-10', prog, tasks);
    expect(heavy.reservedAvg).toBeGreaterThan(light.reservedAvg);
    expect(heavy.ratio).toBeGreaterThan(light.ratio);
    expect(light.days).toBeGreaterThan(20);
    expect(light.freeAvg).toBeGreaterThan(0);
  });
});
