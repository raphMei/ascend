/** Minuteur de concentration : logique pure (aucun accès à l'horloge ni au DOM : l'instant est toujours fourni). */
export type Timer =
  | { kind: 'running'; endAt: number; total: number }
  | { kind: 'paused'; remaining: number; total: number };

export const startTimer = (minutes: number, now: number): Timer => ({ kind: 'running', endAt: now + minutes * 60_000, total: minutes * 60_000 });
/** En pause après la fin, `remaining` devient négatif : le dépassement est conservé pour le temps réel. */
export const pauseTimer = (t: Timer, now: number): Timer => (t.kind === 'running' ? { kind: 'paused', remaining: t.endAt - now, total: t.total } : t);
export const resumeTimer = (t: Timer, now: number): Timer => (t.kind === 'paused' ? { kind: 'running', endAt: now + t.remaining, total: t.total } : t);
/** Millisecondes restantes (0 quand c'est fini). */
export const remainingMs = (t: Timer, now: number): number => Math.max(0, t.kind === 'running' ? t.endAt - now : t.remaining);
/** Temps réellement écoulé (pauses exclues), dépassement compris : sert au recalibrage des durées. */
export const elapsedMs = (t: Timer, now: number): number => t.total - (t.kind === 'running' ? t.endAt - now : t.remaining);
/** Dépassement après la fin (0 tant que ce n'est pas fini). */
export const overtimeMs = (t: Timer, now: number): number => Math.max(0, elapsedMs(t, now) - t.total);
/** Rallonge le minuteur (« +5 min » du mode concentration), qu'il tourne ou soit en pause. */
export const extendTimer = (t: Timer, ms: number): Timer => (t.kind === 'running' ? { ...t, endAt: t.endAt + ms, total: t.total + ms } : { ...t, remaining: t.remaining + ms, total: t.total + ms });
export const isFinished = (t: Timer, now: number): boolean => remainingMs(t, now) <= 0;
/** 1 499 000 ms → « 24:59 » ; arrondi à la seconde supérieure pour ne jamais afficher 00:00 avant la fin. */
export function clock(ms: number): string {
  const s = Math.ceil(ms / 1000);
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}
