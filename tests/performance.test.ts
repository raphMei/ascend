/* Garde-fou de performance : les calculs de planning sur toute la saison doivent rester imperceptibles.
   Les budgets sont larges (machines lentes, CI) : ils attrapent une dérive de 10×, pas une variation de 20 %. */
import { range } from '@/core/dates';
import { planDay } from '@/domain/planner';
import { buildSchedule } from '@/domain/schedule';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { habitStreaks } from '@/domain/streaks';
import { adjustedTasks } from '@/domain/task-schedule';

const tasks = adjustedTasks(DEFAULT_SETTINGS);
const time = (f: () => void, n = 5) => { f(); const a = performance.now(); for (let i = 0; i < n; i++) f(); return (performance.now() - a) / n; };

describe('performance des calculs', () => {
  it('réajustement de toute la saison : moins de 100 ms', () => {
    expect(time(() => buildSchedule({ tasks, progress: { done: {} }, settings: DEFAULT_SETTINGS, days: {}, today: '2026-11-20', now: 600 }))).toBeLessThan(100);
  });
  it('séries de 60 jours : moins de 100 ms', () => {
    expect(time(() => habitStreaks({ days: {}, settings: DEFAULT_SETTINGS, progress: { done: {} }, tasks, today: '2026-11-20' }))).toBeLessThan(100);
  });
  it('planning de chacun des 144 jours de la saison : moins de 150 ms au total', () => {
    expect(time(() => range('2026-10-08', '2027-02-28').forEach((date) => planDay({ date, settings: DEFAULT_SETTINGS, progress: { done: {} }, day: undefined, today: '2026-10-08', tasks })))).toBeLessThan(150);
  });
});
