/** Horloge de l'application : date du jour et minutes depuis minuit, rafraîchies chaque minute. */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { nowMin, todayISO, type ISODate } from '@/core/dates';

export interface Clock { today: ISODate; now: number }
const read = (): Clock => ({ today: todayISO(), now: nowMin() });
const Ctx = createContext<Clock | null>(null);

/** `fixed` permet aux tests d'imposer une date et une heure. */
export function ClockProvider({ children, fixed }: { children: ReactNode; fixed?: Clock }) {
  const [clock, setClock] = useState<Clock>(fixed ?? read);
  useEffect(() => {
    if (fixed) return;
    const id = setInterval(() => setClock(read()), 60_000);
    return () => clearInterval(id);
  }, [fixed]);
  return <Ctx.Provider value={fixed ?? clock}>{children}</Ctx.Provider>;
}

export function useClock(): Clock {
  const v = useContext(Ctx);
  if (!v) throw new Error('useClock doit être utilisé dans <ClockProvider>');
  return v;
}
