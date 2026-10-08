/* Domaine « Sommeil ». */
import { lastDays, dow, JOURS, todayISO } from '../../core/dates.js';
import { hours, esc, toMin } from '../../core/format.js';
import { DOM } from '../../domain/domains.js';
import { sleepMinutes } from '../../state/selectors.js';
import { store, S } from '../../state/store.js';
import { barsChart } from '../../ui/charts.js';
import { bar, head, backLink, trackerFields, domCard } from '../../ui/components.js';

function card() {
  const today = todayISO(), s = S(), sl = sleepMinutes(today);
  return domCard('sommeil', sl != null ? 'Dernière nuit : ' + hours(sl) : 'Pas de nuit saisie', sl != null ? bar((sl / 60 / s.sleepGoal) * 100, 'sommeil') : '');
}

function domSommeil() {
  const today = todayISO(), s = S(), dates = lastDays(14, today);
  const durs = dates.map((d) => { const sl = store.days[d] && store.days[d].sleep; return sl && sl.bed && sl.wake ? ((toMin(sl.wake) - toMin(sl.bed) + 1440) % 1440) : null; });
  const ok = durs.filter((x) => x != null), avg = ok.length ? ok.reduce((a, b) => a + b, 0) / ok.length : null;
  const beds = dates.map((d) => { const sl = store.days[d] && store.days[d].sleep; return sl && sl.bed ? (toMin(sl.bed) < 360 ? toMin(sl.bed) + 1440 : toMin(sl.bed)) : null; }).filter((x) => x != null);
  const sd = beds.length > 2 ? Math.sqrt(beds.reduce((a, b) => a + Math.pow(b - beds.reduce((x, y) => x + y, 0) / beds.length, 2), 0) / beds.length) : null;
  return `${backLink('#/domains', 'Domaines')}${head('Domaine', DOM.sommeil.name)}
  <section class="card"><div class="kpis"><div class="kpi"><b>${avg != null ? hours(avg) : '–'}</b><span>moyenne sur 14 jours</span></div><div class="kpi"><b>${String(s.sleepGoal).replace('.', ',')} h</b><span>objectif</span></div><div class="kpi"><b>${sd != null ? Math.round(sd) + ' min' : '–'}</b><span>écart d'heure de coucher</span></div></div>
  <p class="muted" style="margin-top:12px">Couche-toi à ${esc(s.bed)} pour te lever à ${esc(s.wake)} avec ${String(s.sleepGoal).replace('.', ',')} h de sommeil. Plus l'écart d'heure de coucher est petit, meilleur est le sommeil.</p></section>
  <section class="card"><h2>Ma nuit</h2><p class="muted" style="margin:4px 0 14px">Saisis l'heure de coucher d'hier soir et l'heure de lever de ce matin.</p>${trackerFields(today, store.days[today] || {}, S())}</section>
  <section class="card"><h2>14 dernières nuits</h2><p class="muted" style="margin:4px 0 8px">heures de sommeil</p>${barsChart(dates.map((d, i) => ({ x: JOURS[dow(d)].slice(0, 2), y: durs[i] != null ? Math.round(durs[i] / 6) / 10 : null })), { c: '--c-sommeil', goal: s.sleepGoal, goalLabel: String(s.sleepGoal).replace('.', ',') + ' h', label: 'Sommeil' })}</section>`;
}

export default { id: 'sommeil', card, page: domSommeil };