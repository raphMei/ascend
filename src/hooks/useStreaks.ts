import { useMemo } from 'react';
import { habitStreaks } from '@/domain/streaks';
import { useData } from '@/state/DataContext';
import { useClock } from './useClock';

/** Série (jours d'affilée) de chaque habitude, par identifiant de bloc. */
export function useStreaks(): Record<string, number> {
  const { state, settings, tasks } = useData();
  const { today } = useClock();
  return useMemo(() => habitStreaks({ days: state.days, settings, progress: state.progress, tasks, today }), [state.days, settings, state.progress, tasks, today]);
}
