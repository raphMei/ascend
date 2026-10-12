/** Rattrapage des statistiques : un jour passé sans case cochée n'a pas d'instantané `stats`. Sans lui, les graphiques
    n'affichent pas ce qui était prévu et la série ne distingue pas « rien fait » de « pas de donnée ». */
import { addDays, range, type ISODate } from '@/core/dates';
import type { MiageTask } from '@/content/types';
import { planDay } from './planner';
import { dayStats } from './stats';
import type { DayData, DayStatsSnapshot, Progress, Settings } from './types';

/** Premier jour de l'application : on ne calcule rien avant. */
export const APP_START: ISODate = '2026-10-08';
/** On ne rattrape que les jours récents pour limiter le nombre d'écritures. */
const BACKFILL_DAYS = 60;

export interface BackfillInput {
  days: Record<ISODate, DayData>;
  today: ISODate;
  settings: Settings;
  progress: Progress;
  tasks: readonly MiageTask[];
  /** Début de la fenêtre chargée : on ne peut pas savoir ce qui existe avant. */
  loadedFrom: ISODate;
}

/** Jours passés (hier et avant) sans `stats`, avec l'instantané calculé. Les jours sans rien de prévu sont ignorés. */
export function statsToBackfill(inp: BackfillInput): { date: ISODate; stats: DayStatsSnapshot }[] {
  const last = addDays(inp.today, -1);
  const first = [APP_START, inp.loadedFrom, addDays(last, -(BACKFILL_DAYS - 1))].reduce((a, b) => (a > b ? a : b));
  if (first > last) return [];
  const out: { date: ISODate; stats: DayStatsSnapshot }[] = [];
  for (const date of range(first, last)) {
    if (inp.days[date]?.stats) continue;
    const st = dayStats(planDay({ date, settings: inp.settings, progress: inp.progress, day: inp.days[date], today: inp.today, tasks: inp.tasks }));
    if (st.pl === 0) continue;
    out.push({ date, stats: { pct: st.pct, pl: st.pl, dn: st.dn, planned: st.planned, done: st.done } });
  }
  return out;
}
