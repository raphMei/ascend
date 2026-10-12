/** Libellé d'une séance dans l'agenda : « Nouvelle leçon », « Révision », « Projet »… Fonction pure. */
import type { MiageTask } from '@/content/types';
import type { Block } from './types';

const BY_KIND: Record<string, string> = { seance: 'Leçon', rev: 'Révision', proj: 'Projet', exam: 'Examen', fiche: 'Fiche', setup: 'Mise en place', org: 'Organisation' };
const BY_DOMAIN: Record<string, string> = { java: 'Leçon', front: 'Leçon', cloud: 'Leçon', archi: 'Leçon', anglais: 'Pratique', lecture: 'Lecture', projets: 'Projet' };

export function lessonTag(b: Pick<Block, 'taskId' | 'domain' | 'checkable'>, tasks: readonly MiageTask[]): string | null {
  if (!b.checkable) return null;
  const kind = b.taskId ? tasks.find((t) => t.id === b.taskId)?.k : undefined;
  return (kind && BY_KIND[kind]) ?? BY_DOMAIN[b.domain] ?? null;
}
