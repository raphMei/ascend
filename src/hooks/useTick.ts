import { useCallback } from 'react';
import { merge } from '@/core/merge';
import type { ISODate } from '@/core/dates';
import { planDay } from '@/domain/planner';
import { dayStats } from '@/domain/stats';
import type { DayData, Progress } from '@/domain/types';
import { useData } from '@/state/DataContext';
import { useClock } from './useClock';
import { useSchedule } from './useSchedule';

export type TickTarget = { scope: 'day'; key: string } | { scope: 'prog'; key: string };

/** Coche / décoche un bloc (routine, sport…) ou une tâche (MIAGE, Java), puis enregistre l'instantané de stats du jour
    (lu plus tard par les graphiques). Le plan est recalculé avec la nouvelle valeur avant l'écriture. */
export function useTick() {
  const { state, settings, tasks, setDay, setProgress } = useData();
  const { today } = useClock();
  const sched = useSchedule();
  return useCallback((date: ISODate, target: TickTarget, value: boolean) => {
    const patch = { done: { [target.key]: value } };
    const progress: Progress = target.scope === 'prog' ? merge(state.progress, patch) : state.progress;
    const day: DayData | undefined = target.scope === 'day' ? merge(state.days[date], patch) : state.days[date];
    const st = dayStats(planDay({ date, settings, progress, day, today, tasks, schedule: sched ?? undefined }));
    const stats = { pct: st.pct, pl: st.pl, dn: st.dn, planned: st.planned, done: st.done };
    // Pour une tâche ou une étape, on note aussi le jour où elle a été terminée (rythme et prévisions).
    if (target.scope === 'prog') { setProgress({ ...patch, doneAt: { [target.key]: value ? date : null } }); setDay(date, { stats }); } else setDay(date, { ...patch, stats });
  }, [state, settings, tasks, today, sched, setDay, setProgress]);
}
