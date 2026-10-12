import { statsToBackfill } from '@/domain/backfill';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { genericTasks } from './fixtures';
import type { DayData } from '@/domain/types';

const tasks = genericTasks(DEFAULT_SETTINGS);
const base = { today: '2026-11-05', settings: DEFAULT_SETTINGS, progress: { done: {} }, tasks, loadedFrom: '2026-01-01' };
const snap: DayData = { stats: { pct: 90, pl: 100, dn: 90, planned: {}, done: {} } };

describe('rattrapage des statistiques', () => {
  it('calcule les jours passés sans instantané, pas ceux qui en ont, pas aujourd\'hui', () => {
    const out = statsToBackfill({ ...base, days: { '2026-11-04': snap } });
    const dates = out.map((o) => o.date);
    expect(dates).toContain('2026-11-03');
    expect(dates).not.toContain('2026-11-04');   // déjà présent
    expect(dates).not.toContain('2026-11-05');   // aujourd'hui
    expect(dates.every((d) => d >= '2026-10-08')).toBe(true);  // pas avant le début de l'application
  });
  it('un jour sans rien de coché compte 0 % de ce qui était prévu', () => {
    const o = statsToBackfill({ ...base, days: {} }).find((x) => x.date === '2026-11-03')!;
    expect(o.stats.pl).toBeGreaterThan(0); expect(o.stats.pct).toBe(0);
  });
  it('utilise les cases cochées du jour', () => {
    const o = statsToBackfill({ ...base, today: '2026-11-12', days: { '2026-11-10': { done: { java: true } } } }).find((x) => x.date === '2026-11-10')!;
    expect(o.stats.dn).toBeGreaterThan(0);
  });
  it('ne remonte pas au-delà de la fenêtre chargée ni de 60 jours', () => {
    expect(statsToBackfill({ ...base, loadedFrom: '2026-11-04', days: {} }).map((o) => o.date)).toEqual(['2026-11-04']);
    expect(statsToBackfill({ ...base, today: '2027-02-10', days: {} }).length).toBeLessThanOrEqual(60);
  });
});
