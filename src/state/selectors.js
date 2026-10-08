/* Calculs dérivés de l'état (plan du jour, stats, séries de dates). */
import { store, S, setDay } from './store.js';
import { todayISO, nowMin } from '../core/dates.js';
import { planDay } from '../domain/planner.js';
import { dayStats } from '../domain/stats.js';
import { shabbatNow as shabbatAt } from '../domain/shabbat.js';

export const planFor = (date) => planDay(date, S(), store.prog, store.days[date] || {}, todayISO());
/** Fenêtre de Chabbat en cours maintenant, ou null. */
export const shabbatNow = () => shabbatAt(todayISO(), nowMin(), S());

/** Enregistre l'instantané de stats du jour (lu plus tard par les graphiques). */
export function saveStats(date) {
  const st = dayStats(planFor(date));
  setDay(date, { stats: { pct: st.pct, pl: st.pl, dn: st.dn, planned: st.planned, done: st.done } });
}

/** Minutes prévues / accomplies par jour et par domaine, pour le graphique des heures accomplies. */
export function dayAmounts(dates, today) {
  return dates.map((d) => {
    if (d === today) { const st = dayStats(planFor(d)); return { d, pl: st.pl, done: st.done }; }
    const s = store.days[d] && store.days[d].stats;
    return s ? { d, pl: s.pl, done: s.done || {} } : { d, pl: 0, done: {} };
  });
}

/** Durée de sommeil (minutes) d'une journée, ou null si coucher/lever non saisis. */
export function sleepMinutes(date) {
  const sl = store.days[date] && store.days[date].sleep;
  if (!sl || !sl.bed || !sl.wake) return null;
  const toMin = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + (m || 0); };
  return (toMin(sl.wake) - toMin(sl.bed) + 1440) % 1440;
}
