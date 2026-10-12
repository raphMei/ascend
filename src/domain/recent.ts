/** Derniers apprentissages : les étapes de parcours et les tâches MIAGE terminées le plus récemment. Fonction pure. */
import { JT } from '@/content/java/path';
import { PATHS } from '@/content/paths';
import { byId } from '@/content/miage/subjects';
import type { MiageTask } from '@/content/types';
import type { ISODate } from '@/core/dates';
import type { DomainId, Progress } from './types';

export interface RecentItem { id: string; title: string; domain: DomainId; date: ISODate; to: string }

const STEPS = [
  ...JT.map((s) => ({ s, domain: 'java' as DomainId })),
  ...PATHS.flatMap((p) => p.tasks.map((s) => ({ s, domain: p.id as DomainId })))
];

/** Les `n` éléments terminés le plus récemment (dates connues uniquement), du plus récent au plus ancien. */
export function recentLearning(progress: Progress, tasks: readonly MiageTask[], n = 5): RecentItem[] {
  const at = progress.doneAt ?? {};
  const out: RecentItem[] = [];
  for (const { s, domain } of STEPS) if (progress.done[s.id] && at[s.id]) out.push({ id: s.id, title: s.t, domain, date: at[s.id]!, to: `/dom/${domain}/${s.phase.id}` });
  for (const t of tasks) if (progress.done[t.id] && at[t.id] && t.k !== 'setup' && t.k !== 'org') out.push({ id: t.id, title: t.t, domain: 'miage', date: at[t.id]!, to: byId[t.s] ? `/dom/miage/${t.s}` : '/dom/miage' });
  return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? -1 : 1)).slice(0, n);
}
