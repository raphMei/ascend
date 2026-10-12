/** Domaines optionnels placés dans le planning : anglais, lecture, dev front, projets perso, point finances mensuel.
    Chacun est désactivé tant que ses minutes valent 0 dans les réglages. */
import { dow, type ISODate } from '@/core/dates';
import { englishExerciseFor } from '@/content/english';
import { FRONT_TASKS } from '@/content/front/path';
import { frNum } from '@/core/format';
import type { PlanItem, Progress, Settings } from './types';

export { monthOf } from './month';
import { monthOf } from './month';
/** Premier dimanche du mois ? */
export const isFirstSunday = (date: ISODate): boolean => dow(date) === 0 && +date.slice(8, 10) <= 7;
/** Identifiant de la tâche « point du mois » (clé dans progress.done). */
export const financeKey = (month: string, item: 'point' | 'budget' | 'epargne' | 'invest'): string => `fin:${month}:${item}`;

export function habitItems(date: ISODate, S: Settings, prog: Progress): PlanItem[] {
  const out: PlanItem[] = [];
  if (S.anglaisMin >= 5) {
    const [name, text] = englishExerciseFor(date);
    out.push({ min: S.anglaisMin, blk: { id: 'anglais', fixed: false, checkable: true, title: 'Anglais', domain: 'anglais', sub: name, detail: text } });
  }
  if (S.lectureMin >= 5) {
    out.push({ min: S.lectureMin, blk: { id: 'lecture', fixed: false, checkable: true, title: 'Lecture', domain: 'lecture', sub: S.livre ? S.livre : 'Livre en cours', detail: 'Lis sans écran autour de toi. À la fin, note le nombre de pages lues dans « Mes mesures du jour » : la courbe de lecture se remplit toute seule.' } });
  }
  if (S.frontMin >= 5) {
    const next = FRONT_TASKS.find((t) => !prog.done[t.id]);
    out.push({ min: S.frontMin, blk: { id: 'front', fixed: false, checkable: true, title: 'Dev front', domain: 'front', sub: next ? 'Phase ' + next.phase.n + ' : ' + next.phase.title : 'Parcours terminé', detail: next ? next.t : '', res: next?.res } });
  }
  if (S.projetsMin >= 5) {
    const active = Object.values(prog.projects ?? {}).filter((p): p is NonNullable<typeof p> => !!p && p.status === 'actif');
    const first = active[0];
    out.push({ min: S.projetsMin, blk: { id: 'projets', fixed: false, checkable: true, title: 'Projets perso', domain: 'projets', sub: first ? first.name : 'Aucun projet actif', detail: first ? 'Prochaine action : ' + first.next : 'Ajoute un projet dans le domaine « Projets perso », avec sa prochaine action concrète.' } });
  }
  if (S.financesMin >= 5 && isFirstSunday(date)) {
    const month = monthOf(date);
    out.push({ min: S.financesMin, blk: { id: 'fin-point', scope: 'prog', taskId: financeKey(month, 'point'), fixed: false, checkable: true, title: 'Point finances du mois', domain: 'finances', sub: 'Budget, épargne, versements', detail: 'Relis le mois écoulé : où est parti l\'argent, ce que tu as épargné (' + frNum(S.financesMin) + ' minutes suffisent), ce que tu verses ce mois-ci. Note les chiffres dans le domaine « Finances ».' } });
  }
  return out;
}
