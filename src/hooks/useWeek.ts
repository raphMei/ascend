import { useMemo } from 'react';
import { addDays, dow, type ISODate } from '@/core/dates';
import { planDay } from '@/domain/planner';
import { dayStats } from '@/domain/stats';
import type { DayStats, Plan } from '@/domain/types';
import { useData } from '@/state/DataContext';
import { useClock } from './useClock';
import { useSchedule } from './useSchedule';

export interface WeekDay { date: ISODate; plan: Plan; stats: DayStats }

/** Les sept jours (lundi → dimanche) de la semaine qui contient `anchor` : plan et statistiques de chacun, recalculés avec les données. */
export function useWeek(anchor: ISODate): WeekDay[] {
  const { state, settings, tasks } = useData();
  const { today } = useClock();
  const sched = useSchedule();
  return useMemo(() => {
    const monday = addDays(anchor, -((dow(anchor) + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(monday, i);
      const plan = planDay({ date, settings, progress: state.progress, day: state.days[date], today, tasks, schedule: sched ?? undefined });
      return { date, plan, stats: dayStats(plan) };
    });
  }, [anchor, settings, state.progress, state.days, today, tasks, sched]);
}
