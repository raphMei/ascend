/* Ajuste les échéances des tâches MIAGE à la vie réelle : rien le samedi, vendredi décalé au jeudi en hiver. */
import { dow, addDays } from '../core/dates.js';
import { toMin } from '../core/format.js';
import { shabbatFor } from './shabbat.js';
import { T } from '../content/miage/tasks.js';

let adjusted = false;
export function adjustTasks(S) {
  if (adjusted) return; adjusted = true;
  T.forEach((t) => {
    t.due0 = t.due;
    const w = dow(t.due);
    if (w === 6) t.due = addDays(t.due, 1);
    else if (w === 5) {
      const sh = shabbatFor(t.due, S);
      const workEnd = toMin(S.wake) + 90 + S.workMin + 30; // télétravail le vendredi, 30 min de pause
      if (sh.candle - 60 - workEnd < 75) t.due = addDays(t.due, -1);
    }
  });
  T.sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : a.id < b.id ? -1 : 1));
}
