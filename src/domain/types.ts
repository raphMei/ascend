/** Modèle de données : ce qui est stocké dans Firestore (users/{uid}/…) et ce que calcule le planning.
    Règle de compatibilité : on AJOUTE des champs, on ne renomme jamais ceux qui existent. */
import type { ISODate } from '@/core/dates';

export type ThemeMode = 'auto' | 'light' | 'dark';

/** users/{uid}/settings/main (les valeurs enregistrées surchargent DEFAULT_SETTINGS). */
export interface Settings {
  lat: number; lon: number;
  onsite: number[];            // jours sur site (1 = lundi … 5 = vendredi)
  javaHours: number;
  waterGoal: number; protGoal: number; kcalGoal: number; sleepGoal: number;
  wake: string; bed: string;   // « HH:MM »
  workMin: number;
  candle: number; havdalah: number; // minutes avant le coucher / après le coucher du soleil
  theme: ThemeMode;
}

/** Instantané recalculé à chaque case cochée (alimente les graphiques). */
export interface DayStatsSnapshot {
  pct: number; pl: number; dn: number;
  planned: Record<string, number>; done: Record<string, number>;
}

/** users/{uid}/days/{AAAA-MM-JJ}. `done` : blocs cochés (routine, sport, java, bilan, coucher). */
export interface DayData {
  done?: Record<string, boolean>;
  weight?: number | null; water?: number | null; kcal?: number | null; protein?: number | null;
  sleep?: { bed?: string | null; wake?: string | null };
  stats?: DayStatsSnapshot;
}

/** users/{uid}/progress/main : tâches MIAGE (d:…, s:…) et Java (p1t1…) cochées. */
export interface Progress { done: Record<string, boolean> }

export type DomainId = 'matin' | 'sport' | 'alim' | 'sommeil' | 'miage' | 'java' | 'pro' | 'trajet' | 'chabbat';
export type SportKind = 'push' | 'pull' | 'legs';

/** Un créneau de la journée. `fixed` : imposé (travail, repas) ; sinon placé dans un créneau libre. */
export interface Block {
  id: string; start: number; end: number; title: string; domain: DomainId;
  fixed: boolean; checkable: boolean; done: boolean;
  blocked?: boolean; sub?: string; detail?: string; link?: string;
  scope?: 'prog'; taskId?: string; due?: ISODate; cont?: boolean; sport?: SportKind;
}

export interface ShabbatWindow { candle: number; havdalah: number }

export interface Plan {
  date: ISODate;
  type: 'ent' | 'ecole' | 'exam' | 'ferie' | 'we';
  onsite: boolean;
  blocks: Block[];
  warnings: string[];
  overflow: { n: number; min: number };
  sh: ShabbatWindow | null;
  late: number;
  isShabbatDay: boolean;
}

export interface DayStats {
  pl: number; dn: number; pct: number;
  planned: Record<string, number>; done: Record<string, number>;
}
