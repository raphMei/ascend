/** « Continuer là où je me suis arrêté » : la prochaine étape non faite de chaque parcours. */
import { FRONT_TASKS } from '@/content/front/path';
import { JT } from '@/content/java/path';
import type { PathStep } from '@/content/types';
import type { DomainId, Progress, Settings } from './types';

export interface ContinueCard {
  domain: DomainId;
  label: string;
  step: PathStep;
  /** Étapes faites / total dans la phase de cette étape. */
  phaseDone: number; phaseTotal: number;
  /** Lien à ouvrir en premier : le premier en français, sinon le premier. */
  link?: string;
}

/** Première étape non faite, dans l'ordre du parcours (null si tout est fait). */
export const nextStepOf = (steps: readonly PathStep[], progress: Progress): PathStep | null => steps.find((s) => !progress.done[s.id]) ?? null;

const card = (domain: DomainId, label: string, steps: readonly PathStep[], progress: Progress): ContinueCard | null => {
  const step = nextStepOf(steps, progress);
  if (!step) return null;
  const mates = step.phase.tasks;
  const link = (step.res.find((r) => r.lang === 'fr') ?? step.res[0])?.url;
  return { domain, label, step, phaseDone: mates.filter((s) => progress.done[s.id]).length, phaseTotal: mates.length, ...(link ? { link } : {}) };
};

/** Java toujours ; dev front dès qu'il est activé ou commencé. */
export function continueCards(progress: Progress, settings: Settings): ContinueCard[] {
  const out: (ContinueCard | null)[] = [];
  if (settings.javaHours > 0 || JT.some((s) => progress.done[s.id])) out.push(card('java', 'Java backend', JT, progress));
  if (settings.frontMin >= 5 || FRONT_TASKS.some((s) => progress.done[s.id])) out.push(card('front', 'Dev front', FRONT_TASKS, progress));
  return out.filter((c): c is ContinueCard => !!c);
}
