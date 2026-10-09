import { useMemo } from 'react';
import type { ISODate } from '@/core/dates';
import { planDay } from '@/domain/planner';
import { dayStats } from '@/domain/stats';
import type { DayStats, Plan } from '@/domain/types';
import { useData } from '@/state/DataContext';
import { useClock } from './useClock';

/** Plan d'un jour + ses statistiques, recalculés quand les données, les réglages ou la date du jour changent. */
export function usePlan(date: ISODate): { plan: Plan; stats: DayStats } {
  const { state, settings, tasks } = useData();
  const { today } = useClock();
  const day = state.days[date];
  return useMemo(() => {
    const plan = planDay({ date, settings, progress: state.progress, day, today, tasks });
    return { plan, stats: dayStats(plan) };
  }, [date, settings, state.progress, day, today, tasks]);
}
