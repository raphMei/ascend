/** Échéances effectives des tâches MIAGE : rien le samedi (déplacé au dimanche), vendredi décalé au jeudi
    quand la fenêtre avant l'allumage est trop courte. Fonction pure : les données brutes ne sont jamais modifiées. */
import { dow, addDays } from '@/core/dates';
import { toMin } from '@/core/format';
import { RAW_TASKS } from '@/content/miage/tasks';
import type { MiageTask } from '@/content/types';
import { shabbatFor } from './shabbat';
import type { Settings } from './types';

const key = (S: Settings) => [S.lat, S.lon, S.candle, S.havdalah, S.wake, S.workMin].join('|');
let cache: { k: string; tasks: MiageTask[] } | null = null;

export function adjustedTasks(S: Settings): MiageTask[] {
  const k = key(S);
  if (cache && cache.k === k) return cache.tasks;
  const tasks = RAW_TASKS.map((t) => {
    const w = dow(t.due);
    let due = t.due;
    if (w === 6) due = addDays(t.due, 1);
    else if (w === 5) {
      const sh = shabbatFor(t.due, S);
      const workEnd = toMin(S.wake) + 90 + S.workMin + 30; // télétravail le vendredi, 30 min de pause
      if (sh.candle - 60 - workEnd < 75) due = addDays(t.due, -1);
    }
    return due === t.due ? t : { ...t, due };
  }).sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : a.id < b.id ? -1 : 1));
  cache = { k, tasks };
  return tasks;
}
