/* Domaine « Sport ». */
import { lastDays, JOURSL, todayISO, nowMin } from '../../core/dates.js';
import { esc } from '../../core/format.js';
import { DOM } from '../../domain/domains.js';
import { SPORT, SPORT_WEEK } from '../../domain/sport.js';
import { planFor } from '../../state/selectors.js';
import { store } from '../../state/store.js';
import { bar, blockHtml, head, backLink, strip14, domCard } from '../../ui/components.js';

const sportSessions = (today) => lastDays(7, today).filter((d) => store.days[d] && store.days[d].done && store.days[d].done.sport).length;

function card() {
  const today = todayISO(), sessions = sportSessions(today);
  return domCard('sport', sessions + ' / 6 séances sur 7 jours', bar(sessions / 6 * 100, 'sport'));
}

function domSport() {
  const today = todayISO(), plan = planFor(today), now = nowMin();
  const b = plan.blocks.filter((x) => x.domain === 'sport');
  const sessions = sportSessions(today);
  const week = [1, 2, 3, 4, 5, 6, 0].map((w) => { const k = SPORT_WEEK[w]; return `<div class="row" style="padding:10px 0;border-top:1px solid var(--line)"><span>${JOURSL[w][0].toUpperCase() + JOURSL[w].slice(1)}</span><span class="muted">${k ? SPORT[k].name : 'Repos (Chabbat)'}</span></div>`; }).join('');
  const rate = (d) => store.days[d] && store.days[d].done && store.days[d].done.sport;
  return `${backLink('#/domains', 'Domaines')}${head('Domaine', DOM.sport.name)}
  <section class="card"><div class="sectionhead"><h2>Cette semaine</h2><span class="mono muted">${sessions} / 6</span></div>${bar(sessions / 6 * 100, 'sport')}<p class="muted" style="margin-top:10px">Six séances : pousser, tirer, jambes, deux fois. Les jambes passent en priorité, sans charge lourde sur le bas du dos.</p></section>
  <section class="tl">${b.length ? b.map((x) => blockHtml(x, today, today, now)).join('') : '<p class="muted">Pas de séance aujourd\'hui.</p>'}</section>
  ${b[0] && b[0].sport ? `<section class="card"><h2>${SPORT[b[0].sport].name}</h2><p class="muted" style="margin:4px 0 8px">${SPORT[b[0].sport].sub}</p>${SPORT[b[0].sport].ex.map((e) => `<div class="ex"><b>${esc(e[0])}</b><span class="mono muted">${esc(e[1])}</span></div>`).join('')}<div class="ex"><b>Finisher : corde à sauter</b><span class="mono muted">3 × 2 min</span></div><p class="muted" style="margin-top:8px;font-size:14px">Adapte les exercices et les charges à ton programme habituel.</p></section>` : ''}
  <section class="card"><h2>Programme de la semaine</h2><div style="margin-top:6px">${week}</div></section>
  <section class="card"><h2>14 derniers jours</h2><div style="margin-top:12px">${strip14(today, rate, 'sport')}</div></section>`;
}

export default { id: 'sport', card, page: domSport };