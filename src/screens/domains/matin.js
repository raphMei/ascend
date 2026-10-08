/* Domaine « Routine du matin ». */
import { todayISO, nowMin } from '../../core/dates.js';
import { DOM } from '../../domain/domains.js';
import { planFor } from '../../state/selectors.js';
import { store } from '../../state/store.js';
import { blockHtml, head, backLink, strip14, domCard } from '../../ui/components.js';

function card() {
  const today = todayISO(), plan = planFor(today);
  const routine = plan.blocks.filter((b) => b.domain === 'matin' && b.checkable);
  return domCard('matin', routine.length ? routine.filter((b) => b.done).length + ' / ' + routine.length + ' aujourd\'hui' : 'Pas de routine aujourd\'hui');
}

function domMatin() {
  const today = todayISO(), plan = planFor(today), now = nowMin();
  const bl = plan.blocks.filter((b) => b.domain === 'matin');
  const rate = (d) => { const s = store.days[d] && store.days[d].stats; return s && s.planned && s.planned.matin ? (s.done.matin || 0) / s.planned.matin : 0; };
  return `${backLink('#/domains', 'Domaines')}${head('Domaine', DOM.matin.name)}
  <section class="card"><p>Le matin décide du reste de la journée. Quatre gestes, 75 minutes, avant tout écran.</p></section>
  <section class="tl">${bl.length ? bl.map((b) => blockHtml(b, today, today, now)).join('') : '<p class="muted">Pas de routine aujourd\'hui (Chabbat).</p>'}</section>
  <section class="card"><h2>14 derniers jours</h2><p class="muted" style="margin:4px 0 12px">Un carré plein = au moins 70% de la routine faite.</p>${strip14(today, (d) => rate(d) >= 0.7, 'matin')}</section>`;
}

export default { id: 'matin', card, page: domMatin };