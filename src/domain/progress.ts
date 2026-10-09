/** Progression MIAGE (par matière) et Java (par phase, niveau atteint). */
import type { ISODate } from '@/core/dates';
import { SUBJ } from '@/content/miage/subjects';
import { PHASES, JT, JAVA_HOURS } from '@/content/java/path';
import type { MiageTask, Phase } from '@/content/types';
import type { Progress } from './types';

export interface Counter { n: number; d: number; h: number; hd: number; late: number }

/** Avancement MIAGE : par matière (`per`), global (`g`) et pourcentage pondéré par les heures. `tasks` = tâches aux échéances ajustées. */
export function mStats(tasks: readonly MiageTask[], prog: Progress, today: ISODate) {
  const per: Record<string, Counter> = {}; SUBJ.forEach((s) => { per[s.id] = { n: 0, d: 0, h: 0, hd: 0, late: 0 }; });
  const g: Counter = { n: 0, d: 0, h: 0, hd: 0, late: 0 };
  tasks.forEach((t) => {
    const p = per[t.s], dn = !!(prog.done && prog.done[t.id]);
    p.n++; p.h += t.h; g.n++; g.h += t.h;
    if (dn) { p.d++; p.hd += t.h; g.d++; g.hd += t.h; } else if (t.due < today) { p.late++; g.late++; }
  });
  return { per, g, pct: g.h ? Math.round(100 * g.hd / g.h) : 0 };
}
export type PhaseStatus = 'todo' | 'doing' | 'done';
export function phaseStats(p: Phase, prog: Progress): { n: number; d: number; status: PhaseStatus } { const n = p.tasks.length; let d = 0; p.tasks.forEach((t) => { if (prog.done && prog.done[t.id]) d++; }); return { n, d, status: d === 0 ? 'todo' : d === n ? 'done' : 'doing' }; }
const LEVELS: string[] = ['Pas commencé', 'Démarrage', 'Bases acquises', 'Dev Spring opérationnel', 'Prêt pour l\'équipe', 'Junior solide', 'Backend Java confirmé'];
export function jStats(prog: Progress) {
  let done = 0, coreDone = 0, phasesDone = 0, w = 0;
  PHASES.forEach((p) => { const s = phaseStats(p, prog); done += s.d; w += p.hours * s.d / s.n; if (s.status === 'done') { phasesDone++; if (p.core) coreDone++; } });
  const core = PHASES.filter((p) => p.core).length;
  let lvl = 0; if (done > 0) lvl = 1; if (coreDone >= 2) lvl = 2; if (coreDone >= 4) lvl = 3; if (coreDone >= core) lvl = 4; if (coreDone >= core && phasesDone >= 11) lvl = 5; if (phasesDone >= PHASES.length) lvl = 6;
  return { done, n: JT.length, pct: Math.round(100 * w / JAVA_HOURS), phasesDone, coreDone, core, level: LEVELS[lvl], next: LEVELS[lvl + 1] || null };
}
