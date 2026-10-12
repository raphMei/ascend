import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { isFinished, pauseTimer, remainingMs, resumeTimer, startTimer, type Timer } from '@/domain/timer';

/* Les minuteurs vivent en mémoire pour toute la session : replier une ligne ou changer de page ne les arrête pas. */
const timers = new Map<string, Timer>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

/** Minuteur d'un bloc (`key` = jour + identifiant du bloc). `now` est rafraîchi chaque seconde tant qu'il tourne. */
export function useTimer(key: string, minutes: number) {
  const timer = useSyncExternalStore(subscribe, () => timers.get(key));
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (timer?.kind !== 'running') return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const set = (t: Timer | undefined) => { if (t) timers.set(key, t); else timers.delete(key); emit(); };
  const start = useCallback(() => set(startTimer(minutes, Date.now())), [key, minutes]);           // eslint-disable-line react-hooks/exhaustive-deps
  const pause = useCallback(() => { const t = timers.get(key); if (t) set(pauseTimer(t, Date.now())); }, [key]);   // eslint-disable-line react-hooks/exhaustive-deps
  const resume = useCallback(() => { const t = timers.get(key); if (t) set(resumeTimer(t, Date.now())); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const reset = useCallback(() => set(undefined), [key]);                                          // eslint-disable-line react-hooks/exhaustive-deps
  const finished = !!timer && isFinished(timer, now);
  return { timer, finished, remaining: timer ? remainingMs(timer, now) : minutes * 60_000, start, pause, resume, reset };
}

/** Pour les tests : efface tous les minuteurs. */
export const clearTimers = () => { timers.clear(); emit(); };
