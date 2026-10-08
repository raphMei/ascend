/* Domaine « Alimentation ». */
import { lastDays, dow, fmtShort, JOURS, todayISO } from '../../core/dates.js';
import { DOM } from '../../domain/domains.js';
import { store, S } from '../../state/store.js';
import { lineChart, barsChart } from '../../ui/charts.js';
import { bar, head, backLink, trackerFields, domCard } from '../../ui/components.js';

function card() {
  const today = todayISO(), s = S(), D = store.days[today] || {};
  return domCard('alim', (D.water || 0) + ' / ' + s.waterGoal + ' ml d\'eau', bar(((D.water || 0) / s.waterGoal) * 100, 'alim'));
}

function domAlim() {
  const today = todayISO(), s = S(), dates = lastDays(10, today);
  const mk = (key, scale = 1) => dates.map((d) => { const v = store.days[d] && store.days[d][key]; return { x: JOURS[dow(d)].slice(0, 2), y: v != null && v !== '' ? +v / scale : null }; });
  return `${backLink('#/domains', 'Domaines')}${head('Domaine', DOM.alim.name)}
  <section class="card"><h2>Aujourd'hui</h2><p class="muted" style="margin:4px 0 14px">Objectifs : ${s.kcalGoal} kcal, ${s.protGoal} g de protéines, ${s.waterGoal / 1000} L d'eau. Modifiables dans les réglages.</p>${trackerFields(today, store.days[today] || {}, S())}</section>
  <div class="grid two">
    <section class="card"><h2>Protéines</h2><p class="muted" style="margin:4px 0 8px">grammes par jour</p>${barsChart(mk('protein'), { c: '--c-alim', goal: s.protGoal, goalLabel: s.protGoal + ' g', label: 'Protéines' })}</section>
    <section class="card"><h2>Eau</h2><p class="muted" style="margin:4px 0 8px">litres par jour</p>${barsChart(mk('water', 1000), { c: '--c-sommeil', goal: s.waterGoal / 1000, goalLabel: s.waterGoal / 1000 + ' L', label: 'Eau' })}</section>
    <section class="card"><h2>Calories</h2><p class="muted" style="margin:4px 0 8px">par jour</p>${barsChart(mk('kcal'), { c: '--c-java', goal: s.kcalGoal, goalLabel: s.kcalGoal + '', label: 'Calories' })}</section>
    <section class="card"><h2>Poids</h2><p class="muted" style="margin:4px 0 8px">30 derniers jours</p>${lineChart(lastDays(30, today).map((d) => ({ x: fmtShort(d), y: store.days[d] && store.days[d].weight != null && store.days[d].weight !== '' ? +store.days[d].weight : null })), { c: '--c-alim', label: 'Poids' })}</section>
  </div>`;
}

export default { id: 'alim', card, page: domAlim };