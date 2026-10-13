/** Budget de temps d'un mois : combien de temps libre par jour, combien les domaines choisis en réservent, combien il reste à MIAGE,
    et les limites qui évitent d'en mettre trop (ou trop peu).

    Règles (toutes pures et testées) :
    - temps libre par jour = ce que le planificateur mesure après le travail, les trajets, les repas et le sport (hors Chabbat) ;
    - **plafond** : les autres domaines ne peuvent pas prendre plus que (temps libre − minutes gardées à MIAGE), qui dépendent de l'intensité MIAGE ;
    - **limite de domaines** : au plus `MAX_ACTIVE` domaines actifs en plus de MIAGE (au-delà, on se disperse) ;
    - **trou** : le temps libre qui ne sert à rien (ni domaine, ni besoin MIAGE) ; au-dessus de `GAP_MIN` on propose de le combler. */
import { addDays, dow, range, type ISODate } from '@/core/dates';
import { dayType } from '@/content/calendar';
import type { MiageTask } from '@/content/types';
import { habitMinutes, javaMinutes } from './habits';
import { LEVELS, MINUTES, levelOf, settingsForDate } from './month';
import { planDay } from './planner';
import type { Level, MonthDomain, MonthPlan, Progress, Settings } from './types';

/** Domaines actifs au plus, MIAGE non compté. */
export const MAX_ACTIVE = 5;
/** Minutes par jour gardées pour les cours MIAGE selon leur intensité : les autres domaines ne peuvent pas les entamer. */
export const MIAGE_FLOOR: Record<Level, number> = { off: 45, leger: 45, normal: 90, intensif: 150 };
/** Trou minimal (minutes par jour) à partir duquel on propose de le combler. */
export const GAP_MIN = 45;
/** Ordre dans lequel on propose de combler le trou : tes priorités d'abord. */
export const FILL_ORDER: readonly MonthDomain[] = ['java', 'front', 'cloud', 'archi', 'assurance', 'data', 'agile', 'anglais', 'lecture', 'projets'];

type Choosable = keyof typeof MINUTES;
const mid = (month: string): ISODate => month + '-15';

/** Temps libre moyen par jour du mois (hors samedi), mesuré par le planificateur : travail, trajets, repas et sport déjà retirés. */
export function monthFree(S: Settings, month: string, progress: Progress, tasks: readonly MiageTask[]): { free: number; days: number } {
  const first: ISODate = month + '-01';
  const last = range(first, addDays(first, 30)).filter((d) => d.startsWith(month)).pop() ?? first;
  let free = 0, n = 0;
  for (const d of range(first, last)) {
    if (dow(d) === 6) continue;
    free += planDay({ date: d, settings: S, progress, day: undefined, today: d, tasks, measure: {} }).freeMin ?? 0;
    n++;
  }
  return { free: n ? Math.round(free / n) : 0, days: n };
}

/** Besoin quotidien des cours MIAGE : minutes restantes (hors examens) réparties sur les jours d'étude jusqu'à la dernière échéance. */
export function miageNeed(tasks: readonly MiageTask[], progress: Progress, from: ISODate): number {
  const pending = tasks.filter((t) => !progress.done[t.id] && t.k !== 'exam');
  if (!pending.length) return 0;
  const end = pending.reduce((m, t) => (t.due > m ? t.due : m), from);
  const days = range(from, end > from ? end : from).filter((d) => dow(d) !== 6 && dayType(d) !== 'exam').length;
  const minutes = pending.reduce((a, t) => a + Math.max(15, Math.round(t.h * 60)), 0);
  return days ? Math.round(minutes / days) : 0;
}

/** Réglages du mois avec une intensité de plus (ou de moins) : sert à juger un choix avant de l'enregistrer. */
export function withLevel(S: Settings, month: string, id: MonthDomain, level: Level): Settings {
  const plan: MonthPlan = { ...(S.months?.[month] ?? {}), [id]: level };
  return { ...S, months: { ...(S.months ?? {}), [month]: plan } };
}

/** Minutes par jour réservées aux domaines (hors MIAGE) avec ces réglages, un jour moyen du mois. */
export function reservedOf(S: Settings, month: string): number {
  const Sd = settingsForDate(S, mid(month));
  return habitMinutes(Sd) + javaMinutes(Sd);
}

const NON_MIAGE: readonly Choosable[] = ['java', 'front', 'cloud', 'archi', 'assurance', 'data', 'agile', 'anglais', 'lecture', 'projets'];
/** Nombre de domaines actifs (MIAGE non compté) pour le mois. */
export function activeCount(S: Settings, month: string): number {
  return NON_MIAGE.filter((id) => levelOf(S, id, mid(month)) !== 'off').length;
}

export interface Budget {
  /** Temps libre par jour. */
  free: number;
  /** Minutes par jour réservées aux domaines (hors MIAGE). */
  reserved: number;
  /** Minutes par jour gardées à MIAGE au minimum, selon son intensité. */
  floor: number;
  /** Minutes par jour qui restent à MIAGE (temps libre − réservé). */
  miage: number;
  /** Minutes par jour dont MIAGE a besoin pour finir à temps. */
  need: number;
  /** Temps libre sans usage : ni domaine ni besoin MIAGE (0 si rien ne manque). */
  gap: number;
  /** Place restante avant le plafond. */
  room: number;
  active: number;
}

export function budgetOf(S: Settings, month: string, free: number, need: number): Budget {
  const reserved = reservedOf(S, month);
  const floor = MIAGE_FLOOR[levelOf(S, 'miage', mid(month))];
  const miage = Math.max(0, free - reserved);
  return { free, reserved, floor, miage, need, gap: Math.max(0, free - reserved - Math.max(need, floor)), room: Math.max(0, free - floor - reserved), active: activeCount(S, month) };
}

export interface Verdict { ok: boolean; reason?: string }

/** Peut-on choisir cette intensité ? Désactiver est toujours permis ; garder le choix actuel aussi. */
export function canChoose(S: Settings, month: string, id: MonthDomain, level: Level, free: number): Verdict {
  if (id === 'sport' || levelOf(S, id, mid(month)) === level) return { ok: true };
  if (id === 'miage') {
    const left = free - reservedOf(S, month);
    return left < MIAGE_FLOOR[level] ? { ok: false, reason: `Les autres domaines ne laissent que ${Math.max(0, left)} min par jour (il en faudrait ${MIAGE_FLOOR[level]}) : réduis-en un d'abord.` } : { ok: true };
  }
  if (level === 'off') return { ok: true };
  const S2 = withLevel(S, month, id, level);
  if (levelOf(S, id, mid(month)) === 'off' && activeCount(S2, month) > MAX_ACTIVE) return { ok: false, reason: `Déjà ${MAX_ACTIVE} domaines actifs : désactive-en un pour en ajouter un autre.` };
  const left = free - reservedOf(S2, month), floor = MIAGE_FLOOR[levelOf(S, 'miage', mid(month))];
  if (left < floor) return { ok: false, reason: `Il ne resterait que ${Math.max(0, left)} min par jour aux cours MIAGE (minimum ${floor} min).` };
  return { ok: true };
}

/** Intensités à enregistrer pour combler le trou, dans l'ordre de tes priorités, sans dépasser le plafond ni la limite de domaines.
    Renvoie seulement ce qui change. Rien si le trou est inférieur à `GAP_MIN`. */
export function fillGap(S: Settings, month: string, free: number, need: number): Partial<Record<MonthDomain, Level>> {
  const out: Partial<Record<MonthDomain, Level>> = {};
  let cur = S;
  for (let guard = 0; guard < 40; guard++) {
    const b = budgetOf(cur, month, free, need);
    if (b.gap < GAP_MIN) break;
    let moved = false;
    for (const id of FILL_ORDER) {
      const lv = levelOf(cur, id, mid(month));
      const next = LEVELS[LEVELS.indexOf(lv) + 1];
      if (!next) continue;
      const added = MINUTES[id as Choosable][next] - MINUTES[id as Choosable][lv];
      if (added > b.gap + 15 || !canChoose(cur, month, id, next, free).ok) continue;
      cur = withLevel(cur, month, id, next); out[id] = next; moved = true;
      break;
    }
    if (!moved) break;
  }
  return out;
}

/** Ce que dit le budget en une phrase, et le ton (ok, trou à combler, plafond atteint). */
export function budgetMessage(b: Budget): { tone: 'ok' | 'gap' | 'cap' | 'tight'; text: string } {
  const h = (m: number) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
  if (b.gap >= GAP_MIN) return { tone: 'gap', text: `Il te reste ${h(b.gap)} par jour sans leçon prévue : tu peux en exploiter une partie.` };
  if (b.need > b.miage) return { tone: 'tight', text: `Les cours MIAGE ont besoin d'environ ${h(b.need)} par jour pour finir à temps, tu leur en laisses ${h(b.miage)} : chaque domaine ajouté retarde des leçons.` };
  if (b.room < 15) return { tone: 'cap', text: `Plafond atteint : MIAGE garde au moins ${b.floor} minutes par jour.` };
  return { tone: 'ok', text: 'Ton temps libre est bien utilisé.' };
}

/** Minutes par jour réservées à chaque domaine actif (hors MIAGE), un jour moyen du mois. */
export function breakdown(S: Settings, month: string): { id: MonthDomain; min: number }[] {
  const Sd = settingsForDate(S, mid(month));
  const rows: [MonthDomain, number][] = [['java', javaMinutes(Sd)], ['front', Sd.frontMin], ['cloud', Sd.cloudMin], ['archi', Sd.archiMin], ['assurance', Sd.assuranceMin], ['data', Sd.dataMin], ['agile', Sd.agileMin], ['anglais', Sd.anglaisMin], ['lecture', Sd.lectureMin], ['projets', Sd.projetsMin]];
  return rows.filter(([, m]) => m >= 5).map(([id, min]) => ({ id, min }));
}
