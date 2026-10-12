/** Recalibrage des durées : compare le temps prévu au temps réellement passé (mesuré au minuteur) et en tire un
    coefficient par type de tâche. Les tâches MIAGE sont ensuite planifiées avec leur durée réaliste.

    Fonctions pures. Rien n'est enregistré à part les mesures brutes (`days/{date}.time`) : les coefficients se
    recalculent à chaque changement, comme le réajustement automatique.

    Règles :
    - une mesure compte si le bloc durait au moins 5 min et si le rapport réel/prévu reste entre 0,25 et 3
      (au-delà : minuteur oublié ou coché par erreur) ;
    - on garde les 30 mesures les plus récentes par catégorie ;
    - estimation « rétrécie » vers une valeur de référence (3 mesures fictives) : un type de tâche peu mesuré suit
      le coefficient global de la MIAGE, qui suit lui-même 1 tant qu'il y a peu de mesures ;
    - pas de coefficient avant 3 mesures ; coefficient borné entre 0,7 et 1,8 et arrondi au dixième, pour que le
      planning ne bouge pas à chaque case cochée ;
    - les examens ne sont jamais ajustés (durée fixe). */
import { lastDays, type ISODate } from '@/core/dates';
import type { MiageTask, PathStep, TaskKind } from '@/content/types';
import type { Block, DayData, Progress, TimeEntry } from './types';

export const CALIB = {
  MIN_PLAN: 5,          // minutes prévues minimum pour qu'une mesure compte
  RATIO_MIN: 0.25,
  RATIO_MAX: 3,
  MAX_SAMPLES: 30,      // mesures gardées par catégorie (les plus récentes)
  MIN_N: 3,             // mesures nécessaires avant d'appliquer un coefficient
  PRIOR_N: 3,           // poids de la valeur de référence, en « mesures fictives »
  LO: 0.7,
  HI: 1.8
} as const;

const MIAGE = 'miage';

/** Catégorie d'un bloc : « miage:<type de tâche> » pour une tâche MIAGE, sinon le domaine (java, front, sport…). */
export function timeCategory(b: Pick<Block, 'domain' | 'scope' | 'taskId'>, tasks: readonly Pick<MiageTask, 'id' | 'k'>[]): string {
  if (b.domain === 'miage' && b.taskId) {
    const t = tasks.find((x) => x.id === b.taskId);
    return t ? `${MIAGE}:${t.k}` : MIAGE;
  }
  return b.domain;
}

/** Clé d'une mesure dans `days/{date}.time` : un même bloc découpé en morceaux donne une mesure par morceau. */
export const timeKey = (b: Pick<Block, 'id' | 'start'>): string => `${b.id}@${b.start}`;

/** Mesure à enregistrer quand un bloc est coché. `null` si le minuteur n'a pas assez tourné pour être parlant. */
export function timeEntry(category: string, plannedMin: number, elapsedMs: number): TimeEntry | null {
  const r = Math.round(elapsedMs / 60_000);
  if (plannedMin < CALIB.MIN_PLAN || r < 1) return null;
  return { c: category, p: Math.round(plannedMin), r };
}

export interface CalibRow {
  /** Catégorie (« miage », « miage:fiche », « java »…). */
  category: string;
  n: number;
  plannedMin: number;
  realMin: number;
  /** Coefficient appliqué (1 = pas d'ajustement). */
  coef: number;
  /** Vrai si le coefficient vient de ses propres mesures (sinon : hérité du global ou 1). */
  own: boolean;
}

export interface Calibration {
  /** Coefficient par catégorie (absent = 1). */
  coef: Readonly<Record<string, number>>;
  rows: CalibRow[];
  /** Nombre total de mesures retenues. */
  samples: number;
}

const clamp = (x: number) => Math.min(CALIB.HI, Math.max(CALIB.LO, x));
const round1 = (x: number) => Math.round(x * 10) / 10;

/** Toutes les mesures valides, de la plus récente à la plus ancienne. */
function samplesOf(days: Readonly<Record<ISODate, DayData>>): TimeEntry[] {
  const out: TimeEntry[] = [];
  for (const d of Object.keys(days).sort().reverse()) {
    const time = days[d]?.time;
    if (!time) continue;
    for (const k of Object.keys(time).sort()) {
      const e = time[k];
      if (!e || !(e.p >= CALIB.MIN_PLAN) || !(e.r > 0)) continue;
      const ratio = e.r / e.p;
      if (ratio < CALIB.RATIO_MIN || ratio > CALIB.RATIO_MAX) continue;
      out.push(e);
    }
  }
  return out;
}

/** Estimation rétrécie vers `prior` : (Σréel + K·prior·moyenne prévue) / (Σprévu + K·moyenne prévue). */
function shrink(list: readonly TimeEntry[], prior: number): { coef: number; plannedMin: number; realMin: number } {
  const P = list.reduce((a, e) => a + e.p, 0), R = list.reduce((a, e) => a + e.r, 0);
  const avg = list.length ? P / list.length : 0;
  const coef = P + CALIB.PRIOR_N * avg > 0 ? (R + CALIB.PRIOR_N * prior * avg) / (P + CALIB.PRIOR_N * avg) : prior;
  return { coef, plannedMin: P, realMin: R };
}

export function calibrate(days: Readonly<Record<ISODate, DayData>>): Calibration {
  const byCat = new Map<string, TimeEntry[]>();
  for (const e of samplesOf(days)) {
    const l = byCat.get(e.c) ?? [];
    if (l.length < CALIB.MAX_SAMPLES) { l.push(e); byCat.set(e.c, l); }
  }
  const coef: Record<string, number> = {};
  const rows: CalibRow[] = [];

  /* Niveau global MIAGE : toutes les mesures « miage:* » (et « miage » seul), plafonnées comme les autres. */
  const miageAll = [...byCat.entries()].filter(([c]) => c === MIAGE || c.startsWith(MIAGE + ':')).flatMap(([, l]) => l).slice(0, CALIB.MAX_SAMPLES * 2);
  const g = shrink(miageAll, 1);
  const global = miageAll.length >= CALIB.MIN_N ? round1(clamp(g.coef)) : 1;
  if (global !== 1) coef[MIAGE] = global;
  if (miageAll.length) rows.push({ category: MIAGE, n: miageAll.length, plannedMin: g.plannedMin, realMin: g.realMin, coef: global, own: miageAll.length >= CALIB.MIN_N });

  for (const [c, list] of [...byCat.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    if (c === MIAGE) continue;
    const isMiage = c.startsWith(MIAGE + ':');
    const prior = isMiage ? global : 1;
    const s = shrink(list, prior);
    const own = list.length >= CALIB.MIN_N;
    const value = own ? round1(clamp(s.coef)) : prior;
    if (value !== 1) coef[c] = value;
    rows.push({ category: c, n: list.length, plannedMin: s.plannedMin, realMin: s.realMin, coef: value, own });
  }
  return { coef, rows, samples: rows.filter((r) => r.category !== MIAGE).reduce((a, r) => a + r.n, 0) };
}

/** Coefficient d'un type de tâche MIAGE (le global à défaut, 1 sinon). */
export const coefFor = (c: Calibration, k: TaskKind): number => (k === 'exam' ? 1 : c.coef[`${MIAGE}:${k}`] ?? c.coef[MIAGE] ?? 1);

/** Tâches MIAGE aux durées ajustées. Une tâche inchangée garde la même identité (mémoïsation en aval). */
export function calibrateTasks(tasks: MiageTask[], c: Calibration): MiageTask[] {
  if (!Object.keys(c.coef).length) return tasks;
  return tasks.map((t) => {
    const k = coefFor(c, t.k);
    if (k === 1) return t;
    const h = Math.round(t.h * k * 12) / 12;      // au pas de 5 minutes
    return h === t.h ? t : { ...t, h, h0: t.h };
  });
}

/** Signature stable d'un étalonnage : sert de dépendance de mémoïsation (les tâches ne changent que si un coefficient change). */
export const calibKey = (c: Calibration): string => Object.entries(c.coef).sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([k, v]) => k + '=' + v).join(',');

export interface PathPace {
  /** Minutes de séance passées pour une minute d'étape validée. */
  ratio: number;
  sessionMin: number;
  stepMin: number;
  steps: number;
  window: number;
}

const PATH_WINDOW = 28;
const PATH_MIN_STEP_MIN = 120;
const PATH_MIN_STEPS = 3;

/** Rythme réel d'un parcours (Java, front) sur 28 jours : minutes de séances cochées (instantanés de stats du jour)
    rapportées aux minutes des étapes validées. Sans assez de données : `null` (rien n'est inventé). */
export function pathPace(steps: readonly PathStep[], days: Readonly<Record<ISODate, DayData>>, progress: Progress, domain: 'java' | 'front', today: ISODate, window = PATH_WINDOW): PathPace | null {
  const recent = new Set(lastDays(window, today));
  const sessionMin = [...recent].reduce((a, d) => a + (days[d]?.stats?.done?.[domain] ?? 0), 0);
  const done = steps.filter((s) => progress.done[s.id] && progress.doneAt?.[s.id] && recent.has(progress.doneAt[s.id]!));
  const stepMin = done.reduce((a, s) => a + s.min, 0);
  if (done.length < PATH_MIN_STEPS || stepMin < PATH_MIN_STEP_MIN || sessionMin <= 0) return null;
  return { ratio: round1(sessionMin / stepMin), sessionMin, stepMin, steps: done.length, window };
}
