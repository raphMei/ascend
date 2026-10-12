import { JT } from '@/content/java/path';
import { nextStepOf } from '@/domain/continue';

const doneUpTo = (steps: { id: string }[], n: number) => ({ done: Object.fromEntries(steps.slice(0, n).map((s) => [s.id, true])) });

describe('prochaine étape d\'un parcours', () => {
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
});
