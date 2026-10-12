/* Garde-fou de non-régression : empreinte du planning de chaque jour du 8 oct. 2026 au 28 févr. 2027
   (réglages par défaut). L'empreinte a été calculée sur la version JavaScript d'origine, avant la migration React :
   elle prouve que la logique n'a pas changé. Si tu modifies VOLONTAIREMENT le planificateur, mets à jour la valeur. */
import { createHash } from 'node:crypto';
import { range } from '@/core/dates';
import { planDay } from '@/domain/planner';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { dayStats } from '@/domain/stats';
import { genericTasks } from './fixtures';

// Les textes des blocs (sous-titres, détails, liens) viennent des contenus pédagogiques, qui évoluent : on ne compare que les horaires, durées, domaines et identifiants.
const CONTENT = new Set(['detail', 'sub', 'link', 'res']);
const canon = (v: unknown): string => JSON.stringify(v, (k, x) => (CONTENT.has(k) ? undefined : x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => (a < b ? -1 : 1))) : x));

it('le planning de la saison est inchangé', () => {
  const tasks = genericTasks(DEFAULT_SETTINGS);
  const progress = { done: { 'd:2026-10-08': true, p1t1: true } };
  const today = '2026-11-03';
  const lines = range('2026-10-08', '2027-02-28').map((d) => {
    const day = d === today ? { done: { tephila: true, sport: true } } : {};
    const plan = planDay({ date: d, settings: DEFAULT_SETTINGS, progress, day, today, tasks });
    return d + canon({ pl: plan, st: dayStats(plan) });
  });
  expect(createHash('sha256').update(lines.join('\n')).digest('hex')).toBe('2d59b48e21b29f7661163b98b7d873f9f3de72e1c765b8e84745901086194d86');
});
