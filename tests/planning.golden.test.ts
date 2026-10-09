/* Garde-fou de non-régression : empreinte du planning de chaque jour du 8 oct. 2026 au 28 févr. 2027
   (réglages par défaut). L'empreinte a été calculée sur la version JavaScript d'origine, avant la migration React :
   elle prouve que la logique n'a pas changé. Si tu modifies VOLONTAIREMENT le planificateur, mets à jour la valeur. */
import { createHash } from 'node:crypto';
import { range } from '@/core/dates';
import { planDay } from '@/domain/planner';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { dayStats } from '@/domain/stats';
import { adjustedTasks } from '@/domain/task-schedule';

const canon = (v: unknown): string => JSON.stringify(v, (_k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => (a < b ? -1 : 1))) : x));

it('le planning de la saison est inchangé', () => {
  const tasks = adjustedTasks(DEFAULT_SETTINGS);
  const progress = { done: { 'd:2026-10-08': true, p1t1: true } };
  const today = '2026-11-03';
  const lines = range('2026-10-08', '2027-02-28').map((d) => {
    const day = d === today ? { done: { tephila: true, sport: true } } : {};
    const plan = planDay({ date: d, settings: DEFAULT_SETTINGS, progress, day, today, tasks });
    return d + canon({ pl: plan, st: dayStats(plan) });
  });
  expect(createHash('sha256').update(lines.join('\n')).digest('hex')).toBe('87778a2f15417a172f8901d657b2a2b3113d5ac41bb41b3712f080141781842e');
});
