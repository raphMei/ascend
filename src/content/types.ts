/** Types des contenus : matières MIAGE, tâches, parcours d'apprentissage (Java, dev front). */
import type { ISODate } from '../core/dates';

export interface Subject { id: string; name: string; short: string; cr: number; ch: number }

/** Un lien vers un cours, un exercice ou une documentation. Le français est préféré : `lang` dit la vérité sur chaque lien. */
export interface Resource {
  title: string;
  url: string;
  lang: 'fr' | 'en';
  /** Source affichée (MDN, Wikipédia, OpenClassrooms…). */
  src: string;
}

export type TaskKind = 'setup' | 'daily' | 'fiche' | 'proj' | 'rev' | 'exam' | 'org';
/** Tâche MIAGE. `due` peut être décalée par `adjustedTasks` (Chabbat) ; `h` = durée en heures. `res` : liens du cours / de l'exercice. */
export interface MiageTask { id: string; s: string; k: TaskKind; t: string; d: string; due: ISODate; h: number; res?: Resource[]; step?: StepKind }

export type StepKind = 'cours' | 'exo' | 'projet' | 'valid';

/** Une étape d'un parcours : un chapitre à lire, un exercice, un projet ou une validation. `g` = titre de la section qui la regroupe. */
export interface PathStep {
  id: string;
  k: StepKind;
  t: string;
  /** Objectif ou critères de réussite. */
  d?: string;
  /** Liens, français d'abord. */
  res: Resource[];
  /** Durée estimée en minutes. */
  min: number;
  g?: string;
  phase: Phase;
}
export interface Phase { id: string; n: number; title: string; hours: number; core: boolean; goal: string; tasks: PathStep[] }
