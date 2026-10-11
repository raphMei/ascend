import { useEffect, useRef } from 'react';
import { statsToBackfill } from '@/domain/backfill';
import { useData } from '@/state/DataContext';
import { useClock } from './useClock';

/** Une fois les trois collections chargées, enregistre l'instantané des jours passés qui n'en ont pas (une seule fois par jour et par session). */
export function useBackfillStats(): void {
  const { state, settings, tasks, setDay } = useData();
  const { today } = useClock();
  const done = useRef<string | null>(null);
  const ready = !!state.user && state.loaded.days && state.loaded.settings && state.loaded.progress;
  useEffect(() => {
    if (!ready || done.current === today) return;
    done.current = today;
    statsToBackfill({ days: state.days, today, settings, progress: state.progress, tasks, loadedFrom: state.historyFrom })
      .forEach(({ date, stats }) => setDay(date, { stats }));
    // On ne relance pas à chaque changement de données : une passe par jour suffit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, today]);
}
