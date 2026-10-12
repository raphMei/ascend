/** La prochaine étape non faite d'un parcours (utilisée par la vue d'ensemble des domaines). */
import type { PathStep } from '@/content/types';
import type { Progress } from './types';

/** Première étape non faite, dans l'ordre du parcours (null si tout est fait). */
export const nextStepOf = (steps: readonly PathStep[], progress: Progress): PathStep | null => steps.find((s) => !progress.done[s.id]) ?? null;
