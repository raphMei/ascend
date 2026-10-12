/** Réajustement automatique du planning, calculé une seule fois pour toute l'application. */
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { buildSchedule, type Schedule } from '@/domain/schedule';
import { useData } from '@/state/DataContext';
import { useClock } from './useClock';

const Ctx = createContext<Schedule | null | undefined>(undefined);

/** Le calcul est refait à chaque changement de données, et tous les quarts d'heure pour la place restante aujourd'hui. */
export function ScheduleProvider({ children }: { children: ReactNode }) {
  const { state, settings, tasks } = useData();
  const { today, now } = useClock();
  const slot = Math.floor(now / 15) * 15;
  const schedule = useMemo(
    () => (state.user ? buildSchedule({ tasks, progress: state.progress, settings, days: state.days, today, now: slot }) : null),
    [state.user, tasks, state.progress, settings, state.days, today, slot]
  );
  return <Ctx.Provider value={schedule}>{children}</Ctx.Provider>;
}

/** null = ajustement automatique désactivé (ou pas connecté). */
export function useSchedule(): Schedule | null {
  const v = useContext(Ctx);
  if (v === undefined) throw new Error('useSchedule doit être utilisé dans <ScheduleProvider>');
  return v;
}
