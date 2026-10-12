import { planDay } from '@/domain/planner';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { buildSchedule } from '@/domain/schedule';
import { dayStats } from '@/domain/stats';
import type { DayData } from '@/domain/types';
import { genericTasks } from './fixtures';

const S = DEFAULT_SETTINGS;
const tasks = genericTasks(S);
const plan = (date: string, day?: DayData) => planDay({ date, settings: S, progress: { done: {} }, day, today: '2026-10-01', tasks });
const MON = '2026-10-19', TUE = '2026-10-20';     // lundi : télétravail ; mardi : sur site (réglages par défaut)
const work = (p: ReturnType<typeof plan>) => p.blocks.filter((b) => b.domain === 'pro' || b.domain === 'trajet');

describe('journées exceptionnelles', () => {
  it('sans modification : le calendrier et les réglages décident', () => {
    expect(plan(MON).onsite).toBe(false); expect(plan(TUE).onsite).toBe(true);
    expect(plan(MON).dayEdit).toBeUndefined();
  });

  it('congé : ni travail ni trajet, le temps est libéré', () => {
    const normal = plan(TUE), conge = plan(TUE, { edits: { day: 'conge' } });
    expect(work(normal).length).toBeGreaterThan(0);
    expect(work(conge)).toEqual([]);
    expect(conge.dayEdit).toBe('conge');
    expect(dayStats(conge).pl).toBeGreaterThanOrEqual(dayStats(normal).pl);
  });

  it('congé un jour de cours : plus de cours ni de trajet', () => {
    expect(work(plan('2026-11-03', { edits: { day: 'conge' } }))).toEqual([]);
  });

  it('télétravail : plus de trajet, le travail reste', () => {
    const p = plan(TUE, { edits: { day: 'remote' } });
    expect(p.blocks.filter((b) => b.domain === 'trajet')).toEqual([]);
    expect(p.blocks.some((b) => b.domain === 'pro')).toBe(true);
    expect(p.onsite).toBe(false);
  });

  it('sur site un jour de télétravail : deux trajets d\'une heure', () => {
    const p = plan(MON, { edits: { day: 'onsite' } });
    const trips = p.blocks.filter((b) => b.domain === 'trajet');
    expect(trips).toHaveLength(2); trips.forEach((b) => expect(b.end - b.start).toBe(60));
    expect(p.onsite).toBe(true);
  });

  it('une valeur annulée (null) ne change rien', () => {
    expect(JSON.stringify(plan(TUE, { edits: { day: null } }))).toBe(JSON.stringify(plan(TUE)));
  });

  it('le week-end n\'est pas concerné', () => {
    expect(plan('2026-10-18', { edits: { day: 'conge' } }).dayEdit).toBeUndefined();
  });

  it('le réajustement profite d\'un congé : plus de place ce jour-là', () => {
    const cap = (day?: DayData) => buildSchedule({ tasks, progress: { done: {} }, settings: S, days: day ? { [TUE]: day } : {}, today: '2026-10-19', now: 360 })!.capacity[TUE];
    expect(cap({ edits: { day: 'conge' } })).toBeGreaterThan(cap());
  });
});
