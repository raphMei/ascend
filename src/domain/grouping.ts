/** Regroupement des petites tâches consécutives (affichage seulement : les blocs et leurs cases restent individuels). */
import type { Block } from './types';

export type TimelineItem =
  | { kind: 'block'; block: Block }
  | { kind: 'group'; blocks: Block[]; start: number; end: number };

export interface GroupOptions { maxMin?: number; minRun?: number }

/** Regroupe les blocs MIAGE courts (≤ `maxMin` minutes) qui s'enchaînent sans pause, à partir de `minRun` blocs. */
export function groupSmallBlocks(blocks: Block[], { maxMin = 20, minRun = 2 }: GroupOptions = {}): TimelineItem[] {
  const small = (b: Block) => b.domain === 'miage' && b.checkable && b.end - b.start <= maxMin;
  const out: TimelineItem[] = [];
  let run: Block[] = [];
  const flush = () => {
    if (run.length >= minRun) out.push({ kind: 'group', blocks: run, start: run[0].start, end: run[run.length - 1].end });
    else run.forEach((block) => out.push({ kind: 'block', block }));
    run = [];
  };
  for (const b of blocks) {
    if (small(b) && (run.length === 0 || run[run.length - 1].end === b.start)) run.push(b);
    else { flush(); if (small(b)) run.push(b); else out.push({ kind: 'block', block: b }); }
  }
  flush();
  return out;
}
