/** Charge d'un mois : temps libre moyen par jour (hors samedi) et temps déjà réservé aux domaines choisis. */
import { addDays, dow, range, type ISODate } from '@/core/dates';
import { dayType } from '@/content/calendar';
import type { MiageTask } from '@/content/types';
import { isFirstSunday } from './habits';
import { settingsForDate } from './month';
import { planDay } from './planner';
import type { Progress, Settings } from './types';

export interface MonthLoad {
  /** Jours comptés (hors samedi). */
  days: number;
  /** Minutes libres par jour en moyenne, après le sport. */
  freeAvg: number;
  /** Minutes par jour réservées aux domaines (anglais, lecture, front, projets, point finances, plancher Java). */
  reservedAvg: number;
  /** Part du temps libre déjà prise par les domaines (0 à 1+). */
  ratio: number;
}

export function monthLoad(S: Settings, month: string, progress: Progress, tasks: readonly MiageTask[]): MonthLoad {
  const first: ISODate = month + '-01';
  const last = range(first, addDays(first, 30)).filter((d) => d.startsWith(month)).pop() ?? first;
  let free = 0, reserved = 0, n = 0;
  for (const d of range(first, last)) {
    if (dow(d) === 6) continue;
    const Sd = settingsForDate(S, d);
    const m = planDay({ date: d, settings: S, progress, day: undefined, today: d, tasks, measure: {} });
    const habits = [Sd.anglaisMin, Sd.lectureMin, Sd.frontMin, Sd.cloudMin, Sd.archiMin, Sd.projetsMin].filter((x) => x >= 5).reduce((a, b) => a + b, 0)
      + (Sd.financesMin >= 5 && isFirstSunday(d) ? Sd.financesMin : 0);
    const java = Sd.javaHours * 60 >= 25 && dayType(d) !== 'exam' ? Sd.javaHours * 60 : 0;
    free += m.freeMin ?? 0; reserved += habits + java; n++;
  }
  const freeAvg = n ? Math.round(free / n) : 0, reservedAvg = n ? Math.round(reserved / n) : 0;
  return { days: n, freeAvg, reservedAvg, ratio: freeAvg ? reservedAvg / freeAvg : 0 };
}
