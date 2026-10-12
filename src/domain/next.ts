/** Prochaine action du jour : la tâche en cours, sinon la prochaine à venir, sinon la première encore à faire (en retard). Fonction pure. */
import type { Block } from './types';

type NextKind = 'now' | 'next' | 'late';
export interface Next { block: Block; kind: NextKind }

/** `now` : minutes depuis minuit si le jour affiché est aujourd'hui, sinon -1 (on propose alors la première tâche à faire). */
export function nextBlock(blocks: readonly Block[], now: number): Next | null {
  const todo = blocks.filter((b) => b.checkable && !b.done && !b.blocked);
  if (!todo.length) return null;
  if (now >= 0) {
    const current = todo.find((b) => b.start <= now && now < b.end);
    if (current) return { block: current, kind: 'now' };
    const upcoming = todo.find((b) => b.start >= now);
    if (upcoming) return { block: upcoming, kind: 'next' };
    return { block: todo[0], kind: 'late' };
  }
  return { block: todo[0], kind: 'next' };
}
