/** Domaines optionnels placés dans le planning : anglais, lecture, parcours (front, Cloud et DevOps, Architecture, métier assurance, data, agilité) et projets perso.
    Chacun est désactivé tant que ses minutes valent 0 (l'intensité du mois les fixe : voir `month.ts`). */
import type { ISODate } from '@/core/dates';
import { englishExerciseFor } from '@/content/english';
import { PATHS } from '@/content/paths';
import type { PlanItem, Progress, Settings } from './types';

type Minutes = Pick<Settings, 'anglaisMin' | 'lectureMin' | 'projetsMin' | 'javaHours' | typeof PATHS[number]['min']>;
/** Minutes par jour réservées aux domaines optionnels (hors Java). Moins de 5 minutes = désactivé. */
export const habitMinutes = (S: Minutes): number => [S.anglaisMin, S.lectureMin, S.projetsMin, ...PATHS.map((p) => S[p.min])].filter((x) => x >= 5).reduce((a, b) => a + b, 0);
/** Minutes par jour de Java (moins de 25 minutes = désactivé). */
export const javaMinutes = (S: Pick<Settings, 'javaHours'>): number => (S.javaHours * 60 >= 25 ? S.javaHours * 60 : 0);

export function habitItems(date: ISODate, S: Settings, prog: Progress): PlanItem[] {
  const out: PlanItem[] = [];
  if (S.anglaisMin >= 5) {
    const [name, text] = englishExerciseFor(date);
    out.push({ min: S.anglaisMin, blk: { id: 'anglais', fixed: false, checkable: true, title: 'Anglais', domain: 'anglais', sub: name, detail: text } });
  }
  if (S.lectureMin >= 5) {
    out.push({ min: S.lectureMin, blk: { id: 'lecture', fixed: false, checkable: true, title: 'Lecture', domain: 'lecture', sub: S.livre ? S.livre : 'Livre en cours', detail: 'Lis sans écran autour de toi. À la fin, note le nombre de pages lues dans le domaine Lecture : la courbe se remplit toute seule.' } });
  }
  for (const path of PATHS) {
    if (S[path.min] < 5) continue;
    const next = path.tasks.find((t) => !prog.done[t.id]);
    out.push({ min: S[path.min], blk: { id: path.id, fixed: false, checkable: true, title: path.name, domain: path.id, sub: next ? 'Phase ' + next.phase.n + ' : ' + next.phase.title : 'Parcours terminé', detail: next ? next.t : '', res: next?.res } });
  }
  if (S.projetsMin >= 5) {
    const active = Object.values(prog.projects ?? {}).filter((p): p is NonNullable<typeof p> => !!p && p.status === 'actif');
    const first = active[0];
    out.push({ min: S.projetsMin, blk: { id: 'projets', fixed: false, checkable: true, title: 'Projets perso', domain: 'projets', sub: first ? first.name : 'Aucun projet actif', detail: first ? 'Prochaine action : ' + first.next : 'Ajoute un projet dans le domaine « Projets perso », avec sa prochaine action concrète.' } });
  }
  return out;
}
