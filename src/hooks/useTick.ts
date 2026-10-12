import { useCallback } from 'react';
import { merge } from '@/core/merge';
import type { ISODate } from '@/core/dates';
import { planDay } from '@/domain/planner';
import { dayStats } from '@/domain/stats';
import { timeCategory, timeEntry, timeKey } from '@/domain/calibration';
import type { Block, DayData, Progress } from '@/domain/types';
import { useData } from '@/state/DataContext';
import { useClock } from './useClock';
import { useSchedule } from './useSchedule';
import { takeElapsed, timerKey } from './useTimer';

export type TickTarget = { scope: 'day'; key: string } | { scope: 'prog'; key: string };

/** Coche / décoche un bloc (routine, sport…) ou une tâche (MIAGE, Java), puis enregistre l'instantané de stats du jour
    (lu plus tard par les graphiques). Le plan est recalculé avec la nouvelle valeur avant l'écriture.
    Si `block` est fourni et que son minuteur a tourné, le temps réel est enregistré (`days/{date}.time`) au moment de cocher. */
export function useTick() {
  const { state, settings, tasks, setDay, setProgress } = useData();
  const { today } = useClock();
  const sched = useSchedule();
  return useCallback((date: ISODate, target: TickTarget, value: boolean, block?: Block) => {
    const patch = { done: { [target.key]: value } };
    const elapsed = value && block ? takeElapsed(timerKey(date, block)) : null;
    const entry = elapsed != null && block ? timeEntry(timeCategory(block, tasks), block.end - block.start, elapsed) : null;
    // Décocher efface la mesure : un bloc décoché n'a pas été fait dans ce temps-là.
    const time = block && (entry || (!value && state.days[date]?.time?.[timeKey(block)])) ? { time: { [timeKey(block)]: entry } } : {};
    const progress: Progress = target.scope === 'prog' ? merge(state.progress, patch) : state.progress;
    const day: DayData | undefined = target.scope === 'day' ? merge(state.days[date], patch) : state.days[date];
    const st = dayStats(planDay({ date, settings, progress, day, today, tasks, schedule: sched ?? undefined }));
    const stats = { pct: st.pct, pl: st.pl, dn: st.dn, planned: st.planned, done: st.done };
    // Pour une tâche ou une étape, on note aussi le jour où elle a été terminée (rythme et prévisions).
    if (target.scope === 'prog') { setProgress({ ...patch, doneAt: { [target.key]: value ? date : null } }); setDay(date, { stats, ...time }); } else setDay(date, { ...patch, stats, ...time });
  }, [state, settings, tasks, today, sched, setDay, setProgress]);
}
