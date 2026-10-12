import type { ISODate } from '@/core/dates';
import type { Resource, StepKind } from '../../types';

/** Une séance de travail sur la matière : un chapitre à lire, un exercice, un projet. Remplace une tâche générique du jour.
    `res` : liens vers le cours correspondant (français d'abord). */
export interface PlanUnit { title: string; detail: string; /** durée en heures (45 min par défaut) */ hours?: number; kind?: StepKind; res?: Resource[];
  /** Séance non confirmée par un support du cours (plan anticipé) : à réaligner dès que le professeur publie le contenu. */
  provisional?: boolean }
/** Rendu ou oral à produire, daté d'après une séance du plan (date officielle inconnue : à corriger quand elle est connue). */
interface Deliverable { title: string; detail: string; hours: number; /** rang (à partir de 1) de la séance après laquelle il est dû */ after: number; res?: Resource[] }
/** Date importante : contrôle continu, rendu, soutenance. */
interface PlanMilestone { date: ISODate; label: string; hours?: number }

/** Plan précis d'une matière, rempli à partir du programme réel du cours. */
export interface SubjectPlan {
  /** Identifiant de la matière (voir subjects.ts) : dl, qa, sec, llm, big, ri, gov, eth, toeic, proj. */
  subject: string;
  /** Séances dans l'ordre. Sans `paced` : réparties régulièrement sur les créneaux « tâche du jour » de la matière. */
  units: PlanUnit[];
  /** Plan précis : les séances deviennent des tâches « séance » (identifiants `<matière>:u<n>`), calées sur la place réellement
      disponible (voir `pacing.ts`) et jamais abandonnées automatiquement. */
  paced?: boolean;
  /** Rendus et oraux, dus après la séance indiquée. */
  deliverables?: Deliverable[];
  /** Liens ajoutés aux projets datés de la matière, par identifiant de tâche (ex. « dl:p5 »). Les projets eux-mêmes sont décrits dans `tasks.ts`. */
  projects?: Record<string, Resource[]>;
  /** Contrôles continus et rendus : une tâche « préparer » la veille de chaque date. */
  milestones?: PlanMilestone[];
  /** Modalités de l'examen final, affichées dans la tâche d'examen. */
  exam?: { date?: ISODate; format: string; allowed: string };
}
