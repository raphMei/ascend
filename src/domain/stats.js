/* Statistiques d'un plan de jour et série (streak) de jours réussis. */
import { dow, addDays } from '../core/dates.js';

/* ---------- Statistiques d'un plan ---------- */
export function dayStats(plan) {
  const planned = {}, doneM = {}; let pl = 0, dn = 0;
  plan.blocks.forEach((b) => {
    if (!b.checkable) return; const m = b.end - b.start;
    planned[b.domain] = (planned[b.domain] || 0) + m; pl += m;
    if (b.done) { doneM[b.domain] = (doneM[b.domain] || 0) + m; dn += m; }
  });
  return { pl, dn, pct: pl ? Math.round(100 * dn / pl) : 0, planned, done: doneM };
}

export function streak(days, today, S) {
  let n = 0, d = today;
  const first = days[d] && days[d].stats && days[d].stats.pct >= 70;
  if (!first) d = addDays(d, -1);
  for (let i = 0; i < 400; i++) {
    if (dow(d) === 6) { d = addDays(d, -1); continue; }
    const st = days[d] && days[d].stats;
    if (st && st.pct >= 70) { n++; d = addDays(d, -1); } else break;
  }
  return n;
}
