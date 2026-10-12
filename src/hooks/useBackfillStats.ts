import { useEffect, useRef } from 'react';
import { statsToBackfill } from '@/domain/backfill';
import { useData } from '@/state/DataContext';
import { useClock } from './useClock';

/** Une fois les trois collections chargées, enregistre l'instantané des jours passés qui n'en ont pas (une fois par jour et par session, en une écriture groupée). */
export function useBackfillStats(): void {
  const { state, settings, tasks, setDays } = useData();
  const { today } = useClock();
  const done = useRef<string | null>(null);
  const ready = !!state.user && state.loaded.days && state.loaded.settings && state.loaded.progress;
  useEffect(() => {
    if (!ready || done.current === today) return;
    done.current = today;
    // Une seule écriture groupée, même pour 60 jours.
    setDays(statsToBackfill({ days: state.days, today, settings, progress: state.progress, tasks, loadedFrom: state.historyFrom }).map(({ date, stats }) => ({ date, patch: { stats } })));
    // On ne relance pas à chaque changement de données : une passe par jour suffit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, today]);
}
