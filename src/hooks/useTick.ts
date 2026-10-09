import { useCallback } from 'react';
import { merge } from '@/core/merge';
import type { ISODate } from '@/core/dates';
import { planDay } from '@/domain/planner';
import { dayStats } from '@/domain/stats';
import type { DayData, Progress } from '@/domain/types';
import { useData } from '@/state/DataContext';
import { useClock } from './useClock';

export type TickTarget = { scope: 'day'; key: string } | { scope: 'prog'; key: string };

/** Coche / décoche un bloc (routine, sport…) ou une tâche (MIAGE, Java), puis enregistre l'instantané de stats du jour
    (lu plus tard par les graphiques). Le plan est recalculé avec la nouvelle valeur avant l'écriture. */
export function useTick() {
  const { state, settings, tasks, setDay, setProgress } = useData();
  const { today } = useClock();
  return useCallback((date: ISODate, target: TickTarget, value: boolean) => {
    const patch = { done: { [target.key]: value } };
    const progress: Progress = target.scope === 'prog' ? merge(state.progress, patch) : state.progress;
    const day: DayData | undefined = target.scope === 'day' ? merge(state.days[date], patch) : state.days[date];
    const st = dayStats(planDay({ date, settings, progress, day, today, tasks }));
    const stats = { pct: st.pct, pl: st.pl, dn: st.dn, planned: st.planned, done: st.done };
    if (target.scope === 'prog') { setProgress(patch); setDay(date, { stats }); } else setDay(date, { ...patch, stats });
  }, [state, settings, tasks, today, setDay, setProgress]);
}
