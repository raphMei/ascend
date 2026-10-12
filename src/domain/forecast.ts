/** Prévision d'achèvement d'un parcours, au rythme réellement tenu sur les derniers jours.
    Rien n'est inventé : sans étape terminée récemment, il n'y a pas de prévision. */
import { addDays, lastDays, type ISODate } from '@/core/dates';
import type { PathStep } from '@/content/types';
import type { Progress } from './types';

export interface Forecast {
  /** Minutes restantes dans le parcours. */
  remainingMin: number;
  /** Minutes terminées par jour (moyenne sur la fenêtre, jours sans activité compris). */
  perDayMin: number;
  /** Date estimée de fin, null s'il n'y a pas de rythme. */
  eta: ISODate | null;
  /** Nombre de jours jusqu'à la fin estimée. */
  days: number | null;
  finished: boolean;
}

const FORECAST_WINDOW = 14;

export function paceForecast(steps: readonly PathStep[], progress: Progress, today: ISODate, window = FORECAST_WINDOW): Forecast {
  const recent = new Set(lastDays(window, today));
  const remainingMin = steps.filter((s) => !progress.done[s.id]).reduce((a, s) => a + s.min, 0);
  if (remainingMin === 0) return { remainingMin: 0, perDayMin: 0, eta: null, days: null, finished: true };
  const doneMin = steps.filter((s) => progress.done[s.id] && progress.doneAt?.[s.id] && recent.has(progress.doneAt[s.id]!)).reduce((a, s) => a + s.min, 0);
  if (doneMin === 0) return { remainingMin, perDayMin: 0, eta: null, days: null, finished: false };
  const perDayMin = doneMin / window;
  const days = Math.ceil(remainingMin / perDayMin);
  return { remainingMin, perDayMin, eta: addDays(today, days), days, finished: false };
}
