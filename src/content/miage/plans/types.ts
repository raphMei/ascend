import type { ISODate } from '@/core/dates';
import type { Resource, StepKind } from '../../types';

/** Une séance de travail sur la matière : un chapitre à lire, un exercice, un projet. Remplace une tâche générique du jour.
    `res` : liens vers le cours correspondant (français d'abord). */
export interface PlanUnit { title: string; detail: string; /** durée en heures (45 min par défaut) */ hours?: number; kind?: StepKind; res?: Resource[] }
/** Date importante : contrôle continu, rendu, soutenance. */
interface PlanMilestone { date: ISODate; label: string; hours?: number }

/** Plan précis d'une matière, rempli à partir du programme réel du cours. */
export interface SubjectPlan {
  /** Identifiant de la matière (voir subjects.ts) : dl, qa, sec, llm, big, ri, gov, eth, toeic, proj. */
  subject: string;
  /** Séances dans l'ordre, réparties régulièrement sur les créneaux de la matière jusqu'aux examens. */
  units: PlanUnit[];
  /** Liens ajoutés aux projets datés de la matière, par identifiant de tâche (ex. « dl:p5 »). Les projets eux-mêmes sont décrits dans `tasks.ts`. */
  projects?: Record<string, Resource[]>;
  /** Contrôles continus et rendus : une tâche « préparer » la veille de chaque date. */
  milestones?: PlanMilestone[];
  /** Modalités de l'examen final, affichées dans la tâche d'examen. */
  exam?: { date?: ISODate; format: string; allowed: string };
}
