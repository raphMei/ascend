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
  /** Objectif de poids (kg), optionnel : affiché en pointillés sur la courbe. */
  weightGoal?: number | null;
  /** Minutes par jour consacrées aux nouveaux domaines (0 = désactivé : aucun bloc dans le planning). */
  anglaisMin: number; lectureMin: number; frontMin: number; cloudMin: number; archiMin: number; projetsMin: number;
  /** Durée du « point finances » le premier dimanche de chaque mois (0 = désactivé). */
  financesMin: number;
  /** Livre en cours (affiché dans le bloc de lecture) et score visé au TOEIC. */
  livre?: string; toeicGoal?: number | null;
  /** Rappels activés par type (absent = activé). Ne sert qu'une fois les notifications autorisées sur un appareil. */
  reminders?: Partial<Record<'seance' | 'routine' | 'sport' | 'bilan' | 'saisie', boolean>>;
  /** Intensité de chaque domaine, par mois (« AAAA-MM »). Un mois sans réglage reprend celui du mois précédent. */
  months?: Record<string, MonthPlan>;
  /** Réajuste automatiquement le planning après un retard (activé si absent). */
  autoReschedule?: boolean;
  /** Ajuste la durée des tâches MIAGE à ton rythme réel, mesuré au minuteur (activé si absent). */
  calibrate?: boolean;
  /** Préférences d'affichage (synchronisées entre appareils). */
  ui?: { today?: 'liste' | 'frise'; group?: 'moments' | 'themes'; onboarded?: boolean; sound?: boolean };
}

/** Intensité d'un domaine pour un mois. */
export type Level = 'off' | 'leger' | 'normal' | 'intensif';
/** Domaines réglables mois par mois. */
export type MonthDomain = 'miage' | 'sport' | 'java' | 'front' | 'cloud' | 'archi' | 'anglais' | 'lecture' | 'projets' | 'finances';
/** `null` : retour au réglage du mois précédent (une fusion Firestore ne peut pas supprimer une clé). */
export type MonthPlan = Partial<Record<MonthDomain, Level | null>>;

/** Instantané recalculé à chaque case cochée (alimente les graphiques). */
export interface DayStatsSnapshot {
  pct: number; pl: number; dn: number;
  planned: Record<string, number>; done: Record<string, number>;
}

/** Bloc ajouté à la main sur une journée. */
type DayOverride = 'conge' | 'remote' | 'onsite';
interface ExtraBlock { title: string; start: number; end: number; domain: DomainId; checkable?: boolean }

/** Modifications libres du planning d'un jour. `null` = annulé (une fusion Firestore ne peut pas supprimer une clé). */
export interface DayEdits {
  /** Journée exceptionnelle : congé (ni travail ni trajet), télétravail ou sur site, quel que soit le calendrier. `null` = journée normale. */
  day?: DayOverride | null;
  /** Blocs passés (non faits volontairement), par identifiant de bloc. */
  skip?: Record<string, boolean | null>;
  /** Horaire déplacé d'un bloc, par identifiant de bloc. */
  move?: Record<string, { start: number; end: number } | null>;
  /** Blocs ajoutés, par identifiant libre. */
  extra?: Record<string, ExtraBlock | null>;
}

/** Temps réellement passé sur un bloc, mesuré au minuteur au moment où il est coché.
    `c` : catégorie (« miage:fiche », « java »…), `p` : minutes prévues, `r` : minutes réelles. */
export interface TimeEntry { c: string; p: number; r: number }

/** users/{uid}/days/{AAAA-MM-JJ}. `done` : blocs cochés (routine, sport, java, bilan, coucher). */
export interface DayData {
  done?: Record<string, boolean>;
  weight?: number | null; water?: number | null; kcal?: number | null; protein?: number | null;
  /** Pages lues ce jour-là (domaine Lecture). */
  pages?: number | null;
  sleep?: { bed?: string | null; wake?: string | null };
  stats?: DayStatsSnapshot;
  edits?: DayEdits;
  /** Temps réels mesurés, par bloc (« identifiant@début »). `null` = mesure effacée. */
  time?: Record<string, TimeEntry | null>;
}

export type ProjectStatus = 'actif' | 'pause' | 'fini';
/** Projet perso / freelance (users/{uid}/progress/main → projects). */
export interface Project { name: string; next: string; status: ProjectStatus; minutes: number; created: string }
/** Versements du mois (finances) — chiffres saisis par toi, jamais de conseil d'investissement. */
interface MonthFinance { savings?: number | null; invested?: number | null }

/** users/{uid}/progress/main : tâches MIAGE (d:…, s:…), Java (p1t1…), dev front (f1t1…), Cloud et DevOps (c1t1…), Architecture (a1t1…) et points finances (fin:AAAA-MM:…) cochés. */
export interface Progress {
  done: Record<string, boolean>;
  /** Dates imposées par toi pour une tâche MIAGE (annule le réajustement automatique). */
  pins?: Record<string, string | null>;
  /** Jour où chaque étape ou tâche a été terminée (sert à estimer le rythme). */
  doneAt?: Record<string, string | null>;
  projects?: Record<string, Project | null>;
  finance?: Record<string, MonthFinance>;      // clé « AAAA-MM »
  toeic?: Record<string, number | null>;       // clé = date du test blanc, valeur = score /990
  /** « Repartir à zéro » : tâches laissées tomber en bloc, par jour (permet d'annuler). `null` = annulé. */
  resets?: Record<string, string[] | null>;
}

export type DomainId = 'matin' | 'sport' | 'alim' | 'sommeil' | 'miage' | 'java' | 'pro' | 'trajet' | 'chabbat' | 'autre'
  | 'anglais' | 'lecture' | 'front' | 'cloud' | 'archi' | 'finances' | 'projets';
export type SportKind = 'push' | 'pull' | 'legs';

/** Un créneau de la journée. `fixed` : imposé (travail, repas) ; sinon placé dans un créneau libre. */
export interface Block {
  id: string; start: number; end: number; title: string; domain: DomainId;
  fixed: boolean; checkable: boolean; done: boolean;
  blocked?: boolean; sub?: string; detail?: string;
  /** Liens du cours ou de l'exercice (français d'abord). */
  res?: import('@/content/types').Resource[];
  scope?: 'prog'; taskId?: string; due?: ISODate; cont?: boolean; sport?: SportKind;
}

/** Élément à placer dans les créneaux libres : durée voulue + modèle de bloc. */
export interface PlanItem { min: number; left?: number; blk: Partial<Block> & Pick<Block, 'id' | 'title' | 'domain'> }

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
  /** Blocs que l'utilisateur a passés ce jour-là (absent si aucun). */
  skipped?: Block[];
  /** Journée exceptionnelle choisie par l'utilisateur (absent = journée normale). */
  dayEdit?: DayOverride;
  /** Minutes libres après le sport (uniquement quand le plan est demandé en mode « mesure », pour le réajustement). */
  freeMin?: number;
}

export interface DayStats {
  pl: number; dn: number; pct: number;
  planned: Record<string, number>; done: Record<string, number>;
}
