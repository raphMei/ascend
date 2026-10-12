/** Statistiques de régularité : taux de réussite par habitude, séries, calendrier de chaleur, bilan de la semaine. Fonctions pures. */
import { addDays, dow, lastDays, range, type ISODate } from '@/core/dates';
import type { MiageTask } from '@/content/types';
import { APP_START } from './backfill';
import { planDay } from './planner';
import type { DayData, DayStatsSnapshot, DomainId, Progress, Settings } from './types';

export interface HabitStat {
  id: string; title: string; domain: DomainId;
  /** Jours où l'habitude était prévue / faite sur 7 et 30 jours (aujourd'hui ne compte que s'il est fait). */
  planned7: number; done7: number; planned30: number; done30: number;
  rate7: number | null; rate30: number | null;
  current: number; best: number;
}

export interface HabitStatsInput {
  days: Record<ISODate, DayData>; settings: Settings; progress: Progress;
  tasks: readonly MiageTask[]; today: ISODate;
  /** Jours analysés pour la meilleure série (90 par défaut). */
  back?: number;
}

const isHabit = (id: string) => !id.startsWith('m:') && !id.startsWith('x:');
const rate = (d: number, p: number) => (p ? Math.round((100 * d) / p) : null);

export function habitStats(inp: HabitStatsInput): HabitStat[] {
  const first = [APP_START, addDays(inp.today, -((inp.back ?? 90) - 1))].reduce((a, b) => (a > b ? a : b));
  const w7 = new Set(lastDays(7, inp.today)), w30 = new Set(lastDays(30, inp.today));
  const acc = new Map<string, HabitStat & { run: number; broken: boolean }>();
  // On remonte du plus récent au plus ancien : la série courante s'arrête à la première rupture.
  for (const date of range(first, inp.today).reverse()) {
    const plan = planDay({ date, settings: inp.settings, progress: inp.progress, day: inp.days[date], today: inp.today, tasks: inp.tasks });
    for (const b of plan.blocks) {
      if (!b.checkable || !isHabit(b.id)) continue;
      const a = acc.get(b.id) ?? acc.set(b.id, { id: b.id, title: b.title, domain: b.domain, planned7: 0, done7: 0, planned30: 0, done30: 0, rate7: null, rate30: null, current: 0, best: 0, run: 0, broken: false }).get(b.id)!;
      const counts = date !== inp.today || b.done;                  // aujourd'hui : seulement s'il est fait
      if (counts && w7.has(date)) { a.planned7++; if (b.done) a.done7++; }
      if (counts && w30.has(date)) { a.planned30++; if (b.done) a.done30++; }
      if (b.done) { a.run++; a.best = Math.max(a.best, a.run); if (!a.broken) a.current = a.run; }
      else if (date !== inp.today) { a.run = 0; a.broken = true; }
    }
  }
  return [...acc.values()].map(({ run: _r, broken: _b, ...a }) => ({ ...a, rate7: rate(a.done7, a.planned7), rate30: rate(a.done30, a.planned30) }))
    .sort((x, y) => (y.planned30 - x.planned30) || (x.title < y.title ? -1 : 1));
}

/* ---------- Calendrier de chaleur ---------- */
export interface HeatCell { date: ISODate; pct: number | null; future: boolean }

/** `weeks` semaines (lundi → dimanche) se terminant par celle d'aujourd'hui. `livePct` : avancement d'aujourd'hui en direct. */
export function heatmap(days: Record<ISODate, DayData>, today: ISODate, weeks = 12, livePct?: number): HeatCell[][] {
  const monday = addDays(today, -((dow(today) + 6) % 7));
  const start = addDays(monday, -7 * (weeks - 1));
  return Array.from({ length: weeks }, (_, w) => Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, w * 7 + i);
    const pct = date === today ? (livePct ?? days[date]?.stats?.pct ?? null) : date < today ? (days[date]?.stats?.pct ?? null) : null;
    return { date, pct, future: date > today };
  }));
}

/* ---------- Bilan de la semaine ---------- */
interface WeekTotals { start: ISODate; minutes: Record<string, number>; totalMin: number; okDays: number; days: number; avgPct: number }
export interface WeekReview { current: WeekTotals; previous: WeekTotals; deltaMin: number }

function totalsFor(days: Record<ISODate, DayData>, start: ISODate, today: ISODate, live?: DayStatsSnapshot): WeekTotals {
  const minutes: Record<string, number> = {};
  let okDays = 0, counted = 0, sumPct = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(start, i);
    if (d > today) break;
    const s = d === today && live ? live : days[d]?.stats;
    if (!s) continue;
    counted++; sumPct += s.pct; if (s.pct >= 70) okDays++;
    for (const [k, m] of Object.entries(s.done ?? {})) minutes[k] = (minutes[k] ?? 0) + m;
  }
  return { start, minutes, totalMin: Object.values(minutes).reduce((a, b) => a + b, 0), okDays, days: counted, avgPct: counted ? Math.round(sumPct / counted) : 0 };
}

/** Semaine en cours (lundi → aujourd'hui) contre la semaine précédente entière. */
export function weekReview(days: Record<ISODate, DayData>, today: ISODate, live?: DayStatsSnapshot): WeekReview {
  const monday = addDays(today, -((dow(today) + 6) % 7));
  const current = totalsFor(days, monday, today, live), previous = totalsFor(days, addDays(monday, -7), today);
  return { current, previous, deltaMin: current.totalMin - previous.totalMin };
}
