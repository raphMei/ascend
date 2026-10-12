import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import type { ISODate } from '@/core/dates';
import { elapsedMs, extendTimer, isFinished, overtimeMs, pauseTimer, remainingMs, resumeTimer, startTimer, type Timer } from '@/domain/timer';
import type { Block } from '@/domain/types';

/* Les minuteurs vivent en mémoire pour toute la session : replier une ligne ou changer de page ne les arrête pas. */
const timers = new Map<string, Timer>();
/** À quel bloc appartient un minuteur : sert au mini-lecteur et au mode concentration (titre, couleur, cocher à la fin). */
export interface TimerMeta { block: Block; date: ISODate }
const metas = new Map<string, TimerMeta>();
export interface ActiveTimer { key: string; timer: Timer; meta: TimerMeta }
let active: ActiveTimer[] = [];
const listeners = new Set<() => void>();
const emit = () => {
  active = [...timers].flatMap(([key, timer]) => (metas.has(key) ? [{ key, timer, meta: metas.get(key)! }] : []));
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

/** Clé du minuteur d'un bloc : la même en vue Liste et en vue Frise. */
export const timerKey = (date: ISODate, b: Pick<Block, 'id' | 'start'>): string => `${date}:${b.id}:${b.start}`;

const put = (key: string, t: Timer | undefined, meta?: TimerMeta) => {
  if (t) { timers.set(key, t); if (meta) metas.set(key, meta); } else { timers.delete(key); metas.delete(key); }
  emit();
};

/** Lance le minuteur d'un bloc sans passer par le composant (menu d'appui long, carte « maintenant »). */
export function startBlockTimer(key: string, minutes: number, now = Date.now(), meta?: TimerMeta): void { put(key, startTimer(minutes, now), meta); }
export function pauseBlockTimer(key: string, now = Date.now()): void { const t = timers.get(key); if (t) put(key, pauseTimer(t, now)); }
export function resumeBlockTimer(key: string, now = Date.now()): void { const t = timers.get(key); if (t) put(key, resumeTimer(t, now)); }
export function extendBlockTimer(key: string, minutes: number): void { const t = timers.get(key); if (t) put(key, extendTimer(t, minutes * 60_000)); }
export function cancelBlockTimer(key: string): void { put(key, undefined); }

/** Temps écoulé sur le minuteur d'un bloc puis arrêt du minuteur ; `null` s'il n'a pas été lancé. Appelé au moment de cocher. */
export function takeElapsed(key: string, now = Date.now()): number | null {
  const t = timers.get(key);
  if (!t) return null;
  put(key, undefined);
  return elapsedMs(t, now);
}

/** Minuteurs lancés avec leur bloc (mini-lecteur). */
export const useActiveTimers = (): ActiveTimer[] => useSyncExternalStore(subscribe, () => active);

/** Date courante rafraîchie chaque seconde tant qu'au moins un minuteur tourne. */
export function useSecondTick(running: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);
  return now;
}

/** Minuteur d'un bloc (`key` = jour + identifiant du bloc). `now` est rafraîchi chaque seconde tant qu'il tourne.
    `meta` : si fourni, le minuteur apparaît dans le mini-lecteur. */
export function useTimer(key: string, minutes: number, meta?: TimerMeta) {
  const timer = useSyncExternalStore(subscribe, () => timers.get(key));
  const now = useSecondTick(timer?.kind === 'running');
  const start = useCallback(() => startBlockTimer(key, minutes, Date.now(), meta), [key, minutes, meta]);
  const pause = useCallback(() => pauseBlockTimer(key), [key]);
  const resume = useCallback(() => resumeBlockTimer(key), [key]);
  const reset = useCallback(() => cancelBlockTimer(key), [key]);
  const finished = !!timer && isFinished(timer, now);
  return { timer, finished, remaining: timer ? remainingMs(timer, now) : minutes * 60_000, overtime: timer ? overtimeMs(timer, now) : 0, start, pause, resume, reset };
}

/** Pour les tests : efface tous les minuteurs. */
export const clearTimers = () => { timers.clear(); metas.clear(); emit(); };
