/** Rythme des séances d'un plan précis : à quelle date placer chaque séance pour que la journée ne déborde pas.

    Le réajustement automatique (`domain/schedule.ts`) place des tâches entières dans la place libre de chaque jour. Une séance de 2 h
    ne tient pas une soirée de semaine (≈ 1 h 30 de libre) : elle va le dimanche ou un jour sans travail. On simule donc ici, avec une
    place type par sorte de jour, ce que le réajustement ferait, pour que les échéances soient déjà réalistes (peu de déplacements
    à expliquer ensuite). Fonction pure et déterministe ; les vrais réglages de l'utilisateur ne changent que le réajustement.

    Quand les séances demandent plus de temps que la place type (c'est le cas d'un semestre chargé), la place est élargie
    proportionnellement : les échéances restent réparties sur toute la période au lieu de s'empiler à la fin. Le réajustement dit
    ensuite la vérité (tâches déplacées, en retard, ou sans place) avec les vrais temps libres de chaque jour.

    Règles : les matières avancent chacune proportionnellement à leur propre durée, les plus prioritaires (rang 1 à 3) finissant
    plus tôt ; les séances d'une matière restent dans l'ordre ; le samedi (Chabbat) et la semaine d'examens sont exclus. */
import { dow, range, type ISODate } from '../../core/dates';
import { dayType } from '../calendar';

/** Place type (minutes) pour les séances, par sorte de jour. */
const CAPACITY = { ent: 90, ecole: 0, ferie: 420, dimanche: 540 } as const;
/** Part de la place réservée aux séances : le reste sert aux fiches, aux rendus, aux révisions de fin et à la routine. */
const RESERVE = 0.75;
/** Part de la période à laquelle chaque palier doit avoir fini : les matières prioritaires d'abord. */
const SPAN: Record<1 | 2 | 3, number> = { 1: 0.8, 2: 0.9, 3: 1 };

/** Durée maximale d'une tâche de séance (heures) : une soirée de semaine offre ≈ 1 h 15 à 1 h 40, une séance de 2 h ou plus n'y tient pas. */
const PART_MAX_H = 1.25;
/** Découpe une séance en parties qui tiennent une soirée de semaine : 2 h → 2 × 1 h, 3 h → 3 × 1 h, 1 h 30 → 2 × 45 min. Les durées sont arrondies à 5 minutes. */
export function splitHours(hours: number): number[] {
  const n = Math.max(1, Math.ceil(hours / PART_MAX_H - 1e-9));
  const each = Math.round(((hours / n) * 60) / 5) * 5 / 60;
  return Array.from({ length: n }, () => each);
}

export interface PaceInput { id: string; tier: 1 | 2 | 3; /** durée de chaque séance, en minutes */ minutes: number[] }

/** Palier d'une matière d'après son rang : 1 à 3, puis 4 à 6, puis le reste. */
export const tierOf = (rank: number | undefined): 1 | 2 | 3 => (rank == null || rank > 6 ? 3 : rank > 3 ? 2 : 1);

/** Place type d'un jour (0 = rien de prévu : samedi, examens, jours de cours chargés). */
function modelCapacity(d: ISODate): number {
  if (dow(d) === 6) return 0;
  const ty = dayType(d);
  if (ty === 'exam') return 0;
  if (dow(d) === 0) return CAPACITY.dimanche;
  return ty === 'ent' ? CAPACITY.ent : ty === 'ferie' ? CAPACITY.ferie : CAPACITY.ecole;
}

/** Échéance de chaque séance, par matière : `{ dl: ['2026-10-13', …] }`. */
export function paceSessions(subjects: readonly PaceInput[], from: ISODate, to: ISODate): Record<string, ISODate[]> {
  const days = range(from, to).filter((d) => modelCapacity(d) > 0);
  const demand = subjects.reduce((a, s) => a + s.minutes.reduce((x, y) => x + y, 0), 0);
  const supply = days.reduce((a, d) => a + modelCapacity(d), 0) * RESERVE;
  const scale = Math.max(1, (demand / Math.max(1, supply)) * 1.05);        // surcharge : on étire la place, on n'empile pas
  const left = new Map(days.map((d) => [d, modelCapacity(d) * RESERVE * scale]));
  const order: { s: PaceInput; i: number; key: number }[] = [];
  for (const s of subjects) {
    const total = s.minutes.reduce((a, b) => a + b, 0);
    let before = 0;
    s.minutes.forEach((m, i) => { order.push({ s, i, key: ((before + m / 2) / total) * SPAN[s.tier] }); before += m; });
  }
  order.sort((a, b) => a.key - b.key || a.s.tier - b.s.tier || (a.s.id < b.s.id ? -1 : a.s.id > b.s.id ? 1 : a.i - b.i));
  const out: Record<string, ISODate[]> = Object.fromEntries(subjects.map((s) => [s.id, []]));
  const pointer = new Map(subjects.map((s) => [s.id, 0]));
  for (const { s, i } of order) {
    const m = s.minutes[i];
    let k = pointer.get(s.id)!;
    while (k < days.length && (left.get(days[k]) ?? 0) < m) k++;
    // Plus de place nulle part (surcharge) : on prend la dernière journée, le réajustement dira la vérité.
    const at = k < days.length ? k : days.length - 1;
    left.set(days[at], Math.max(0, (left.get(days[at]) ?? 0) - m));
    pointer.set(s.id, at);
    out[s.id][i] = days[at];
  }
  return out;
}
