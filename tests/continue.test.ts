import { FRONT_TASKS } from '@/content/front/path';
import { JT } from '@/content/java/path';
import { continueCards, nextStepOf } from '@/domain/continue';
import { DEFAULT_SETTINGS } from '@/domain/settings';

const doneUpTo = (steps: { id: string }[], n: number) => ({ done: Object.fromEntries(steps.slice(0, n).map((s) => [s.id, true])) });

describe('continuer là où je me suis arrêté', () => {
  it('première étape quand rien n\'est fait, puis la suivante au fil de l\'avancement', () => {
    expect(nextStepOf(JT, { done: {} })).toBe(JT[0]);
    expect(nextStepOf(JT, doneUpTo(JT, 3))).toBe(JT[3]);
  });
  it('saute les étapes faites dans le désordre : c\'est la première non faite', () => {
    expect(nextStepOf(JT, { done: { [JT[0].id]: true, [JT[2].id]: true } })).toBe(JT[1]);
  });
  it('null quand le parcours est terminé', () => {
    expect(nextStepOf(JT, doneUpTo(JT, JT.length))).toBeNull();
  });
  it('passe à la phase suivante en changeant de phase', () => {
    const firstPhase = JT[0].phase.tasks.length;
    const c = continueCards(doneUpTo(JT, firstPhase), DEFAULT_SETTINGS).find((x) => x.domain === 'java')!;
    expect(c.step.phase.n).toBe(2); expect(c.phaseDone).toBe(0); expect(c.phaseTotal).toBe(JT[firstPhase].phase.tasks.length);
  });
  it('le lien proposé est le premier en français', () => {
    const step = JT.find((s) => s.res.length > 1 && s.res[0].lang === 'en')!;
    const c = continueCards({ done: Object.fromEntries(JT.slice(0, JT.indexOf(step)).map((s) => [s.id, true])) }, DEFAULT_SETTINGS).find((x) => x.domain === 'java');
    // l'étape suivante a un lien : s'il existe un lien en français, c'est lui
    const expected = (c!.step.res.find((r) => r.lang === 'fr') ?? c!.step.res[0])?.url;
    expect(c!.link).toBe(expected);
  });
  it('Java toujours présent ; dev front seulement quand il est activé ou commencé', () => {
    expect(continueCards({ done: {} }, DEFAULT_SETTINGS).map((c) => c.domain)).toEqual(['java']);
    expect(continueCards({ done: {} }, { ...DEFAULT_SETTINGS, frontMin: 30 }).map((c) => c.domain)).toEqual(['java', 'front']);
    expect(continueCards({ done: { [FRONT_TASKS[0].id]: true } }, DEFAULT_SETTINGS).map((c) => c.domain)).toContain('front');
    expect(continueCards({ done: {} }, { ...DEFAULT_SETTINGS, cloudMin: 30, archiMin: 30 }).map((c) => c.domain)).toEqual(['java', 'cloud', 'archi']);
  });
  it('plus de carte pour un parcours terminé', () => {
    const all = { done: { ...doneUpTo(JT, JT.length).done } };
    expect(continueCards(all, DEFAULT_SETTINGS)).toEqual([]);
  });
});
