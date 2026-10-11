/** Séries (« jours d'affilée ») par habitude : une habitude = un bloc récurrent (routine, sport, Java, anglais, lecture, bilan…). */
import { addDays, range, type ISODate } from '@/core/dates';
import type { MiageTask } from '@/content/types';
import { APP_START } from './backfill';
import { planDay } from './planner';
import type { DayData, Progress, Settings } from './types';

export interface StreakInput {
  days: Record<ISODate, DayData>;
  settings: Settings;
  progress: Progress;
  tasks: readonly MiageTask[];
  today: ISODate;
  /** Jours regardés en arrière (60 par défaut). */
  back?: number;
}

/** Les tâches MIAGE et les blocs ajoutés à la main (identifiants `m:` et `x:`) n'ont pas de série : ce ne sont pas des habitudes. */
const isHabit = (id: string) => !id.startsWith('m:') && !id.startsWith('x:');

/** Série par identifiant de bloc. Un jour où l'habitude n'était pas prévue (repos, week-end) ne casse pas la série ;
    un jour prévu mais pas fait la casse ; aujourd'hui ne la casse jamais tant que la journée n'est pas finie. */
export function habitStreaks(inp: StreakInput): Record<string, number> {
  const first = [APP_START, addDays(inp.today, -(inp.back ?? 60))].reduce((a, b) => (a > b ? a : b));
  const streak: Record<string, number> = {};
  const broken = new Set<string>();
  for (const date of range(first, inp.today).reverse()) {
    const plan = planDay({ date, settings: inp.settings, progress: inp.progress, day: inp.days[date], today: inp.today, tasks: inp.tasks });
    for (const b of plan.blocks) {
      if (!b.checkable || !isHabit(b.id) || broken.has(b.id)) continue;
      if (b.done) streak[b.id] = (streak[b.id] ?? 0) + 1;
      else if (date !== inp.today) broken.add(b.id);
    }
  }
  return streak;
}
