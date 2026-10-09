/** Types des contenus (matières MIAGE, tâches, parcours Java). */
import type { ISODate } from '../core/dates';

export type UEKey = 'f' | 'a' | 'l' | 'p' | 'o';
export interface Subject { id: string; name: string; short: string; cr: number; ch: number; ue: UEKey }
export interface UE { k: UEKey; name: string; cr: number }

export type TaskKind = 'setup' | 'daily' | 'fiche' | 'proj' | 'rev' | 'exam' | 'org';
/** Tâche MIAGE. `due` peut être décalée par `adjustedTasks` (Chabbat) ; `h` = durée en heures. */
export interface MiageTask { id: string; s: string; k: TaskKind; t: string; d: string; due: ISODate; h: number }

export type JavaKind = 'cours' | 'exo' | 'projet' | 'valid';
/** `u` = lien de ressource ; `d` = critères de validation (pas encore affichés dans l'interface). */
export interface JavaTask { id: string; k: JavaKind; t: string; u?: string; d?: string; phase: Phase }
export interface Phase { id: string; n: number; title: string; hours: number; core: boolean; goal: string; tasks: JavaTask[] }
