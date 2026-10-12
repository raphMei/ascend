/** Dette de retard MIAGE et « Repartir à zéro ».

    Le réajustement automatique reporte le retard sur les jours suivants. Après plusieurs jours ratés, ce report
    remplit toutes les journées à venir (effet avalanche). On mesure donc le retard en « jours de travail » : minutes en
    retard divisées par la place moyenne d'une journée. Au-delà de 3 jours, l'outil propose de repartir à zéro.

    Rien n'est abandonné sans toi : la proposition liste les tâches les moins prioritaires (organisation, cours du
    jour, mise en place, puis fiches et séances ; à type égal, les matières classées en dernier d'abord, puis les plus anciennes) jusqu'à revenir à 1 jour de retard. Les révisions,
    les projets et les examens ne sont jamais proposés. Valider écrit `progress.pins[id] = 'skip'` (mécanisme existant,
    réversible) et garde la liste dans `progress.resets[jour]` pour pouvoir tout annuler d'un coup.

    Fonctions pures. */
import { addDays, dow, range, type ISODate } from '@/core/dates';
import type { MiageTask, TaskKind } from '@/content/types';
import { tierOf } from '@/content/miage/pacing';
import { byId } from '@/content/miage/subjects';
import { SKIP, WEIGHT, type Schedule } from './schedule';
import type { Progress } from './types';

export const DEBT = {
  /** Au-delà de ce nombre de jours de retard, on propose de repartir à zéro. */
  ALERT_DAYS: 3,
  /** Objectif après remise à zéro. */
  TARGET_DAYS: 1,
  /** Jours à venir pris en compte pour la place moyenne d'une journée. */
  HORIZON: 14,
  /** Sans place mesurable (vacances…), seuil en minutes. */
  ALERT_MIN_FALLBACK: 600
} as const;

/** Types jamais proposés à l'abandon : ils préparent directement les examens. */
const PROTECTED: ReadonlySet<TaskKind> = new Set<TaskKind>(['exam', 'rev', 'proj']);
const minutesOf = (t: MiageTask) => Math.max(15, Math.round(t.h * 60));

export interface Debt {
  /** Tâches en retard (échéance passée, ni faites, ni abandonnées), les plus anciennes d'abord. */
  late: MiageTask[];
  /** Minutes en retard. */
  min: number;
  /** Place moyenne d'une journée à venir (minutes), 0 si inconnue. */
  dayCapacity: number;
  /** Retard exprimé en jours de travail (au dixième), null si la place est inconnue. */
  days: number | null;
  /** Vrai quand il faut proposer de repartir à zéro. */
  over: boolean;
}

export function debtOf(tasks: readonly MiageTask[], progress: Progress, schedule: Pick<Schedule, 'capacity' | 'dropped'>, today: ISODate): Debt {
  const dropped = new Set(schedule.dropped);
  const late = tasks
    .filter((t) => t.k !== 'exam' && t.due < today && !progress.done[t.id] && !dropped.has(t.id) && progress.pins?.[t.id] !== SKIP)
    .sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : a.id < b.id ? -1 : 1));
  const min = late.reduce((a, t) => a + minutesOf(t), 0);
  const caps = range(today, addDays(today, DEBT.HORIZON - 1)).filter((d) => dow(d) !== 6).map((d) => schedule.capacity[d]).filter((c): c is number => c != null && c > 0);
  const dayCapacity = caps.length ? Math.round(caps.reduce((a, b) => a + b, 0) / caps.length) : 0;
  const days = dayCapacity > 0 ? Math.round((10 * min) / dayCapacity) / 10 : null;
  const over = days != null ? days > DEBT.ALERT_DAYS : min > DEBT.ALERT_MIN_FALLBACK;
  return { late, min, dayCapacity, days, over };
}

export interface ResetProposal {
  /** Tâches proposées à l'abandon (cochées par défaut dans la fenêtre). */
  drop: MiageTask[];
  /** Tâches gardées (protégées, ou inutiles à abandonner une fois l'objectif atteint). */
  keep: MiageTask[];
  /** Minutes de retard qui resteraient après abandon. */
  afterMin: number;
}

/** Les moins prioritaires d'abord, les plus anciennes d'abord, jusqu'à revenir à `TARGET_DAYS` de retard. */
export function resetProposal(debt: Debt): ResetProposal {
  const target = debt.dayCapacity > 0 ? DEBT.TARGET_DAYS * debt.dayCapacity : 0;
  const candidates = debt.late
    .filter((t) => !PROTECTED.has(t.k))
    .sort((a, b) => WEIGHT[b.k] - WEIGHT[a.k] || tierOf(byId[b.s]?.rank) - tierOf(byId[a.s]?.rank) || (a.due < b.due ? -1 : a.due > b.due ? 1 : a.id < b.id ? -1 : 1));
  const drop: MiageTask[] = [];
  let rest = debt.min;
  for (const t of candidates) {
    if (rest <= target) break;
    drop.push(t); rest -= minutesOf(t);
  }
  const ids = new Set(drop.map((t) => t.id));
  return { drop, keep: debt.late.filter((t) => !ids.has(t.id)), afterMin: rest };
}

/** Écriture Firestore (progress/main) pour abandonner les tâches choisies, et celle qui l'annule. */
export function resetPatch(ids: readonly string[], today: ISODate): Record<string, unknown> {
  return { pins: Object.fromEntries(ids.map((id) => [id, SKIP])), resets: { [today]: [...ids] } };
}
export function undoResetPatch(progress: Progress, day: ISODate): Record<string, unknown> | null {
  const ids = progress.resets?.[day];
  if (!ids?.length) return null;
  return { pins: Object.fromEntries(ids.map((id) => [id, null])), resets: { [day]: null } };
}
