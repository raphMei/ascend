import type { ISODate } from '@/core/dates';

/** Une séance de travail sur la matière (chapitre, TD, notion). Remplace une tâche générique du jour. */
export interface PlanUnit { title: string; detail: string; /** durée en heures (sinon : 20 à 45 min selon les crédits) */ hours?: number }
/** Date importante : contrôle continu, rendu, soutenance. */
export interface PlanMilestone { date: ISODate; label: string; hours?: number }

/** Plan précis d'une matière, rempli à partir du programme réel du cours. */
export interface SubjectPlan {
  /** Identifiant de la matière (voir subjects.ts) : dl, qa, sec, llm, big, ri, gov, eth, toeic, proj. */
  subject: string;
  /** Séances dans l'ordre : la première prend le premier créneau de la matière, etc. Quand elles sont épuisées, les tâches de révision génériques reprennent. */
  units: PlanUnit[];
  /** Contrôles continus et rendus : une tâche « préparer » la veille de chaque date. */
  milestones?: PlanMilestone[];
  /** Modalités de l'examen final, affichées dans la tâche d'examen. */
  exam?: { date?: ISODate; format: string; allowed: string };
}
