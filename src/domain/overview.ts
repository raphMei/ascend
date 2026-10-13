/** Vue d'ensemble des domaines d'apprentissage : où en est chaque domaine (avancement, retard, prochaine leçon, fin estimée, heures par semaine).
    Fonctions pures, calculées à chaque affichage : rien n'est enregistré. */
import { addDays, type ISODate } from '@/core/dates';
import { JT } from '@/content/java/path';
import { pathById } from '@/content/paths';
import type { MiageTask } from '@/content/types';
import { nextStepOf } from './continue';
import { paceForecast } from './forecast';
import { monthPlanFor } from './month';
import { jStats, mStats, pathStats } from './progress';
import type { DayData, Level, MonthDomain, Progress, Settings } from './types';

/** Domaines d'apprentissage, dans l'ordre d'affichage. */
export const LEARNING: readonly MonthDomain[] = ['miage', 'java', 'front', 'cloud', 'archi', 'assurance', 'data', 'agile', 'anglais', 'lecture', 'projets'];

export interface Overview {
  id: MonthDomain;
  /** Intensité choisie pour le mois (undefined : réglage par défaut). */
  level?: Level;
  /** Avancement 0-100, null pour les domaines sans parcours (anglais, lecture, projets). */
  pct: number | null;
  done: number; total: number;
  /** Séances ou tâches en retard (échéance passée, pas faites). */
  late: number;
  /** Titre de la prochaine leçon, null si tout est fait ou s'il n'y a pas de parcours. */
  next: string | null;
  /** Fin estimée d'après le rythme des 14 derniers jours, null sans rythme. */
  eta: ISODate | null;
  /** Minutes apprises par semaine, les 8 dernières semaines (la plus récente en dernier). */
  spark: number[];
  /** Le domaine est-il actif (minutes ou intensité > 0, ou déjà commencé) ? */
  active: boolean;
}

/** Minutes apprises par semaine glissante (7 jours chacune), `weeks` semaines, la plus récente en dernier. */
export function weeklyMinutes(days: Readonly<Record<ISODate, DayData>>, domain: string, today: ISODate, weeks = 8): number[] {
  return Array.from({ length: weeks }, (_, w) => {
    let sum = 0;
    for (let i = 0; i < 7; i++) sum += days[addDays(today, -((weeks - 1 - w) * 7 + i))]?.stats?.done?.[domain] ?? 0;
    return sum;
  });
}

export interface OverviewInput {
  settings: Settings; progress: Progress; tasks: readonly MiageTask[]; days: Readonly<Record<ISODate, DayData>>;
  today: ISODate; dropped?: ReadonlySet<string>;
}

export function overviewOf(id: MonthDomain, i: OverviewInput): Overview {
  const { settings: S, progress, tasks, days, today } = i;
  const level = monthPlanFor(S, today)?.[id] ?? undefined;
  const spark = weeklyMinutes(days, id, today);
  const base = { id, ...(level ? { level } : {}), spark };
  if (id === 'miage') {
    const ms = mStats(tasks, progress, today, i.dropped);
    const next = tasks.find((t) => !progress.done[t.id] && t.k !== 'setup' && t.k !== 'org');
    return { ...base, pct: ms.pct, done: ms.g.d, total: ms.g.n, late: ms.g.late, next: next?.t ?? null, eta: null, active: level !== 'off' };
  }
  if (id === 'java') {
    const js = jStats(progress);
    return { ...base, pct: js.pct, done: js.done, total: js.n, late: 0, next: nextStepOf(JT, progress)?.t ?? null, eta: paceForecast(JT, progress, today).eta, active: level ? level !== 'off' : S.javaHours > 0 || js.done > 0 };
  }
  const path = pathById(id);
  if (path) {
    const ps = pathStats(path.phases, path.levels, path.hours, progress);
    return { ...base, pct: ps.pct, done: ps.done, total: ps.n, late: 0, next: nextStepOf(path.tasks, progress)?.t ?? null, eta: paceForecast(path.tasks, progress, today).eta, active: level ? level !== 'off' : S[path.min] >= 5 || ps.done > 0 };
  }
  const minutes = id === 'anglais' ? S.anglaisMin : id === 'lecture' ? S.lectureMin : S.projetsMin;
  return { ...base, pct: null, done: 0, total: 0, late: 0, next: null, eta: null, active: level ? level !== 'off' : minutes >= 5 };
}

export const overviews = (i: OverviewInput): Overview[] => LEARNING.map((id) => overviewOf(id, i));
