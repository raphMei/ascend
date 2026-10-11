import { useMemo } from 'react';
import { lastDays, type ISODate } from '@/core/dates';
import { planDay } from '@/domain/planner';
import { dayStats } from '@/domain/stats';
import type { DayAmount } from '@/components/charts/StackedBars';
import { useData } from '@/state/DataContext';
import { useClock } from './useClock';
import { useSchedule } from './useSchedule';

/** Minutes prévues / accomplies sur les n derniers jours : instantanés enregistrés, sauf aujourd'hui (calculé en direct). */
export function useDayAmounts(n: number): DayAmount[] {
  const { state, settings, tasks } = useData();
  const { today } = useClock();
  const sched = useSchedule();
  return useMemo(() => lastDays(n, today).map((d: ISODate) => {
    if (d === today) {
      const st = dayStats(planDay({ date: d, settings, progress: state.progress, day: state.days[d], today, tasks, schedule: sched ?? undefined }));
      return { d, pl: st.pl, done: st.done };
    }
    const s = state.days[d]?.stats;
    return s ? { d, pl: s.pl, done: s.done ?? {} } : { d, pl: 0, done: {} };
  }), [n, today, state.days, state.progress, settings, tasks, sched]);
}
