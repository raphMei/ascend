/** Constructeurs pour écrire un plan de matière : un chapitre à lire, un exercice, un projet, une validation (révision chronométrée).
    Les projets datés des matières sans plan précis sont décrits dans `tasks.ts` (les plans y ajoutent leurs liens via `projects`). */
import type { Resource, StepKind } from '../../types';
import type { PlanUnit } from './types';

const unit = (kind: StepKind) => (title: string, detail: string, hours: number, res: Resource[] = []): PlanUnit => ({ kind, title, detail, hours, ...(res.length ? { res } : {}) });
export const cours = unit('cours');
export const exo = unit('exo');
export const projet = unit('projet');
export const valid = unit('valid');
/** Séance anticipée, pas encore confirmée par un support du cours. */
export const provisoire = (u: PlanUnit): PlanUnit => ({ ...u, provisional: true });
