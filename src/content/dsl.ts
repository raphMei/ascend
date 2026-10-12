/** Petits constructeurs pour écrire un parcours lisiblement, et assemblage en phases avec identifiants stables (p1t1, p1t2…). */
import type { PathStep, Phase, Resource, StepKind } from './types';

export type RawStep = Omit<PathStep, 'id' | 'phase'>;
export interface RawPhase { id: string; title: string; core: boolean; goal: string; steps: RawStep[] }

const step = (k: StepKind) => (t: string, res: Resource[], min: number, extra: { d?: string; g?: string } = {}): RawStep => ({ k, t, res, min, ...extra });
/** Un chapitre à lire ou à regarder. */
export const cours = step('cours');
/** Un exercice à faire soi-même. */
export const exo = step('exo');
/** Un projet de la phase. */
export const projet = step('projet');
/** Une validation : on vérifie qu'on sait expliquer ou refaire. */
export const valid = (t: string, d?: string, min = 20): RawStep => ({ k: 'valid', t, res: [], min, ...(d ? { d } : {}) });

/** Assemble les phases : numéros, identifiants `<phase>t<n>`, durée de la phase = somme des étapes. Ne modifie pas les données brutes. */
export function buildPhases(raw: RawPhase[]): Phase[] {
  return raw.map((p, pi) => {
    const phase: Phase = { id: p.id, n: pi + 1, title: p.title, core: p.core, goal: p.goal, hours: 0, tasks: [] };
    phase.tasks = p.steps.map((s, i): PathStep => ({ ...s, id: `${p.id}t${i + 1}`, phase }));
    phase.hours = Math.max(1, Math.round(p.steps.reduce((a, s) => a + s.min, 0) / 60));
    return phase;
  });
}
