/** Réajustement automatique du planning : ce qui n'a pas été fait est redistribué sur les jours à venir, selon la place
    réellement disponible chaque jour, la priorité des tâches, le sport manqué et l'intensité choisie pour le mois.

    Fonction pure et déterministe : le résultat se recalcule à chaque changement de données (rien n'est enregistré, sauf les
    dates imposées par l'utilisateur dans `progress.pins`). Chaque déplacement est expliqué (`changes`).

    Règles :
    - la place d'un jour = temps libre mesuré par le planificateur, moins ce que les domaines du mois réservent, moins 10 % de marge ;
    - jamais de tâche le samedi (Chabbat), l'examen reste à sa date ;
    - ordre de priorité : type d'abord (révision/projet, fiche, mise en place, tâche du jour), puis échéance la plus ancienne ;
    - les petites tâches de routine en retard depuis plus de 2 jours sont abandonnées (la suite du programme les remplace) ;
    - mois « léger » : pas de tâches du jour ; mois « intensif » : on avance les tâches des 7 jours suivants s'il reste de la place ;
    - sport : une séance de jambes manquée est rattrapée une fois, à la place de la prochaine séance qui n'est pas des jambes. */
import { addDays, dow, fmt, fmtShort, lastDays, range, type ISODate } from '@/core/dates';
import { dayType } from '@/content/calendar';
import type { MiageTask, TaskKind } from '@/content/types';
import { isFirstSunday } from './habits';
import { settingsForDate } from './month';
import { planDay, type PlanSchedule } from './planner';
import { SPORT, SPORT_WEEK } from './sport';
import type { DayData, Progress, Settings, SportKind } from './types';

type ChangeReason = 'retard' | 'charge' | 'avance' | 'epingle' | 'abandon';

export interface Change {
  taskId: string; title: string; subject: string; minutes: number;
  /** Échéance d'origine. */
  from: ISODate;
  /** Nouveau jour, ou null si la tâche est abandonnée. */
  to: ISODate | null;
  reason: ChangeReason;
  /** Explication en une phrase. */
  why: string;
}

export interface Schedule extends PlanSchedule {
  changes: Change[];
  /** Tâches abandonnées automatiquement (trop anciennes) : exclues du compte « en retard ». */
  dropped: string[];
  /** Tâches « du jour » écartées parce que le mois MIAGE est en mode léger. */
  lightened: number;
  /** Tâches en retard qui ne trouvent plus de place avant la dernière échéance. */
  unplaced: string[];
  /** Explications sur le sport (séance rattrapée, etc.). */
  notes: string[];
  /** Place disponible pour les tâches MIAGE, par jour (minutes). */
  capacity: Readonly<Record<ISODate, number>>;
}

export interface ScheduleInput {
  /** Tâches MIAGE avec échéances ajustées (Chabbat). */
  tasks: readonly MiageTask[];
  progress: Progress;
  settings: Settings;
  days: Record<ISODate, DayData>;
  today: ISODate;
  /** Minutes depuis minuit : la place d'aujourd'hui ne compte que ce qui reste de la journée. */
  now: number;
}

/** Priorité par type de tâche (0 = la plus importante). */
export const WEIGHT: Record<TaskKind, number> = { exam: 0, rev: 1, proj: 1, fiche: 2, setup: 3, daily: 4, org: 5 };
const MARGIN = 0.9;                // 10 % de marge : les créneaux trop courts ne servent à rien
const JAVA_FLOOR_MIN = 30;         // on réserve toujours un peu de temps pour Java s'il est actif
const STALE_DAYS = 2;              // une tâche de routine plus ancienne que ça est abandonnée
const AHEAD_DAYS = 7;              // mois intensif : on peut avancer les tâches des 7 prochains jours
const MIN_HORIZON = 14;
const MAX_HORIZON = 200;

/** Tâches de routine (révision quotidienne, relecture du soir, revue de la semaine) : sans effet si elles sautent. */
const isRoutine = (t: MiageTask) => t.k === 'daily' || t.id.startsWith('o:r:') || t.id.startsWith('o:w:') || t.id.startsWith('o:x:');
/** Valeur de `progress.pins` quand l'utilisateur laisse tomber une tâche. */
export const SKIP = 'skip';
const minutesOf = (t: MiageTask) => Math.max(15, Math.round(t.h * 60));

/** Séances de sport à remplacer : une séance de jambes manquée est rattrapée une fois. */
export function sportRescue(S: Settings, days: Record<ISODate, DayData>, today: ISODate): { sport: Record<ISODate, { kind: SportKind; reason: string }>; notes: string[] } {
  const sport: Record<ISODate, { kind: SportKind; reason: string }> = {};
  const notes: string[] = [];
  const base = (d: ISODate) => (settingsForDate(S, d).sportWeek ?? SPORT_WEEK)[dow(d)];
  const past = lastDays(7, addDays(today, -1)).filter((d) => d >= '2026-10-08');
  const missed = past.filter((d) => base(d) === 'legs' && !days[d]?.done?.sport && !days[d]?.edits?.skip?.sport);
  const legsDone = past.filter((d) => base(d) === 'legs' && days[d]?.done?.sport).length;
  const planned = past.filter((d) => base(d) === 'legs').length;
  if (!missed.length || legsDone >= planned) return { sport, notes };
  const lost = missed[missed.length - 1];
  for (let i = 0; i < 4; i++) {
    const d = addDays(today, i);
    const k = base(d);
    if (!k || k === 'legs' || dow(d) === 6) continue;
    if (d === today && days[today]?.done?.sport) continue;
    sport[d] = { kind: 'legs', reason: `Jambes manquées ${fmt(lost)} : rattrapées ici à la place de « ${SPORT[k].name} ».` };
    notes.push(`Jambes manquées ${fmt(lost)} : rattrapées ${fmt(d)} à la place de « ${SPORT[k].name} ».`.replace(/\.\s*»/, ' »'));
    break;
  }
  return { sport, notes };
}

/** Calcule le réajustement. Retourne `null` quand l'utilisateur l'a désactivé. */
export function buildSchedule(inp: ScheduleInput): Schedule | null {
  const { settings: S, progress, days, today, now } = inp;
  if (S.autoReschedule === false) return null;

  const { sport, notes } = sportRescue(S, days, today);
  const pins = progress.pins ?? {};
  const pending = inp.tasks.filter((t) => !progress.done[t.id]);
  const maxDue = pending.reduce((m, t) => (t.due > m ? t.due : m), today);
  const end = [maxDue, addDays(today, MIN_HORIZON)].reduce((a, b) => (a > b ? a : b));
  const horizon = range(today, end > addDays(today, MAX_HORIZON) ? addDays(today, MAX_HORIZON) : end);

  /* Place disponible par jour. */
  const capacity: Record<ISODate, number> = {};
  for (const d of horizon) {
    if (dow(d) === 6) { capacity[d] = 0; continue; }          // Chabbat : aucune tâche
    const Sd = settingsForDate(S, d);
    const m = planDay({ date: d, settings: S, progress, day: days[d], today, tasks: [], schedule: { dayOf: {}, sport }, measure: { fromMin: d === today ? now : 0 } });
    const habits = [Sd.anglaisMin, Sd.lectureMin, Sd.frontMin, Sd.projetsMin].filter((x) => x >= 5).reduce((a, b) => a + b, 0)
      + (Sd.financesMin >= 5 && isFirstSunday(d) ? Sd.financesMin : 0);
    const java = Sd.javaHours * 60 >= 25 && dayType(d) !== 'exam' ? Math.min(JAVA_FLOOR_MIN, Sd.javaHours * 60) : 0;
    const extras = Object.values(days[d]?.edits?.extra ?? {}).reduce((a, x) => a + (x && x.checkable !== false ? x.end - x.start : 0), 0);
    capacity[d] = Math.max(0, Math.floor(((m.freeMin ?? 0) - habits - java - extras) * MARGIN));
  }

  const initialCapacity: Readonly<Record<ISODate, number>> = { ...capacity };
  const maxCap = Math.max(0, ...Object.values(initialCapacity));
  const dayOf: Record<string, ISODate> = {};
  const changes: Change[] = [];
  const dropped: string[] = [];
  let lightened = 0;
  const lightToday = settingsForDate(S, today).miageLevel === 'leger';
  const sentence = (x: string) => x.replace(/\.+$/, '.');         // fmt() finit par « . » (« oct. ») : pas de double point
  const change = (t: MiageTask, to: ISODate | null, reason: ChangeReason, why: string) =>
    changes.push({ taskId: t.id, title: t.t, subject: t.s, minutes: minutesOf(t), from: t.due, to, reason, why: sentence(why) });

  /* 1. Tâches imposées : examens (à leur date) et dates choisies par l'utilisateur. */
  const free = new Set<string>();
  for (const t of pending) {
    const pin = pins[t.id];
    if (pin === SKIP) { dropped.push(t.id); continue; }          // laissée tomber par l'utilisateur
    if (t.k === 'exam') {
      if (t.due >= today && horizon.includes(t.due)) { dayOf[t.id] = t.due; capacity[t.due] = Math.max(0, capacity[t.due] - minutesOf(t)); }
      continue;                                              // un examen passé n'est plus à planifier
    }
    if (pin) {
      const d = pin < today ? today : pin;
      if (horizon.includes(d)) {
        dayOf[t.id] = d; capacity[d] = Math.max(0, capacity[d] - minutesOf(t));
        if (d !== t.due) change(t, d, 'epingle', `Tu l'as placée le ${fmt(d)}.`);
        continue;
      }
    }
    if (isRoutine(t) && t.due < addDays(today, -STALE_DAYS)) {
      dropped.push(t.id);
      change(t, null, 'abandon', `Trop ancienne (prévue ${fmt(t.due)}) : abandonnée, la suite du programme prend le relais.`);
      continue;
    }
    if (lightToday && t.k === 'daily') { lightened++; dropped.push(t.id); continue; }
    free.add(t.id);
  }

  /** Une tâche entre si elle tient dans la place restante du jour. Une tâche plus longue que n'importe quelle journée
      n'a de place que dans une journée presque entièrement libre (le week-end), qu'elle occupe alors presque entièrement. */
  const fits = (m: number, d: ISODate) =>
    m <= capacity[d] || (m > maxCap && capacity[d] >= initialCapacity[d] * 0.9 && initialCapacity[d] >= maxCap * 0.8);

  /* 2. Le reste, jour après jour, par priorité. */
  const byId = new Map(inp.tasks.map((t) => [t.id, t]));
  const queue = [...free].map((id) => byId.get(id)!).sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : WEIGHT[a.k] - WEIGHT[b.k] || (a.id < b.id ? -1 : 1)));
  const left = new Set(queue.map((t) => t.id));
  for (const d of horizon) {
    if (!left.size) break;
    const intensif = settingsForDate(S, d).miageLevel === 'intensif';
    const ready = queue.filter((t) => left.has(t.id) && (t.due <= d || (intensif && t.due <= addDays(d, AHEAD_DAYS))));
    ready.sort((a, b) => {
      const la = a.due <= d ? 0 : 1, lb = b.due <= d ? 0 : 1;             // le retard et l'échéance du jour passent avant l'avance
      // À place égale, l'important d'abord (révisions, projets, fiches), puis le plus ancien : quand tout ne tient plus,
      // ce sont les tâches de routine qui sautent, pas la préparation des examens.
      return la - lb || WEIGHT[a.k] - WEIGHT[b.k] || (a.due < b.due ? -1 : a.due > b.due ? 1 : a.id < b.id ? -1 : 1);
    });
    for (const t of ready) {
      const m = minutesOf(t);
      if (!fits(m, d)) continue;
      dayOf[t.id] = d; capacity[d] = Math.max(0, capacity[d] - m); left.delete(t.id);
      if (t.due < today) change(t, d, 'retard', d === today ? `En retard depuis ${fmt(t.due)} : à faire aujourd'hui.` : `En retard depuis ${fmt(t.due)} : aujourd'hui est complet, reprogrammée ${fmt(d)}.`);
      else if (d > t.due) change(t, d, 'charge', `Le ${fmt(t.due)} est trop chargé : décalée au ${fmt(d)}.`);
      else if (d < t.due) change(t, d, 'avance', `Mois intensif : avancée du ${fmtShort(t.due)} au ${fmtShort(d)}.`);
    }
  }
  const unplaced = [...left];

  const order = { epingle: 0, retard: 1, charge: 2, avance: 3, abandon: 4 } as const;
  changes.sort((a, b) => order[a.reason] - order[b.reason] || ((a.to ?? 'z') < (b.to ?? 'z') ? -1 : 1) || (a.taskId < b.taskId ? -1 : 1));
  return { dayOf, sport, changes, dropped, lightened, unplaced, notes, capacity: initialCapacity };
}
