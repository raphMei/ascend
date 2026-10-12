/** Constructeurs pour écrire un plan de matière : un chapitre à lire, un exercice. Les projets datés sont décrits dans `tasks.ts` (les plans y ajoutent leurs liens via `projects`). */
import type { Resource, StepKind } from '../../types';
import type { PlanUnit } from './types';

const unit = (kind: StepKind) => (title: string, detail: string, hours: number, res: Resource[] = []): PlanUnit => ({ kind, title, detail, hours, ...(res.length ? { res } : {}) });
export const cours = unit('cours');
export const exo = unit('exo');
