import { useMemo } from 'react';
import { overviews, type Overview } from '@/domain/overview';
import { useData } from '@/state/DataContext';
import { useClock } from './useClock';
import { useSchedule } from './useSchedule';

/** Avancement de chaque domaine d'apprentissage (voir `domain/overview.ts`), recalculé avec les données. */
export function useOverviews(): Overview[] {
  const { state, settings, tasks } = useData();
  const { today } = useClock();
  const sched = useSchedule();
  return useMemo(() => overviews({ settings, progress: state.progress, tasks, days: state.days, today, dropped: new Set(sched?.dropped ?? []) }), [settings, state.progress, state.days, tasks, today, sched]);
}
