/* Écran « Aujourd'hui » : frise heure par heure et saisie des mesures. */
import { dow, addDays, fmtLong, todayISO, nowMin } from '../core/dates.js';
import { dur, hours, esc } from '../core/format.js';
import { DOM } from '../domain/domains.js';
import { dayStats } from '../domain/stats.js';
import { planFor } from '../state/selectors.js';
import { store, S } from '../state/store.js';
import { bar, blockHtml, head, trackerFields } from '../ui/components.js';
import { dc } from '../ui/icons.js';

export function screenToday(dateArg) {
  const today = todayISO(), date = dateArg || today, now = nowMin();
  const plan = planFor(date), st = dayStats(plan), s = S();
  const typeLbl = plan.type === 'ent' ? (plan.onsite ? 'AXA sur site' : 'AXA en télétravail') : plan.type === 'ecole' ? 'Cours' : plan.type === 'exam' ? 'Examen' : plan.type === 'ferie' ? 'Férié' : dow(date) === 6 ? 'Chabbat' : 'Week-end';
  const proMin = plan.blocks.filter((b) => b.domain === 'pro').reduce((a, b) => a + b.end - b.start, 0);
  const trMin = plan.blocks.filter((b) => b.domain === 'trajet').reduce((a, b) => a + b.end - b.start, 0);
  const doms = {}; plan.blocks.filter((b) => b.checkable).forEach((b) => { doms[b.domain] = (doms[b.domain] || 0) + (b.end - b.start); });
  const trackable = dow(date) !== 6;
  return `${head(date === today ? 'Aujourd\'hui' : 'Planning', fmtLong(date))}
  <div class="daynav"><a class="icon" href="#/today/${addDays(date, -1)}" aria-label="Jour précédent">‹</a><span class="chip">${typeLbl}</span>${date !== today ? `<a class="btn small" style="text-decoration:none" href="#/today">Revenir à aujourd'hui</a>` : ''}<a class="icon" href="#/today/${addDays(date, 1)}" aria-label="Jour suivant" style="margin-left:auto">›</a></div>
  <section class="card"><div class="kpis"><div class="kpi"><b>${hours(st.pl)}</b><span>pour toi</span></div><div class="kpi"><b>${hours(proMin)}</b><span>travail / cours</span></div><div class="kpi"><b>${hours(trMin)}</b><span>trajets</span></div></div>
    <div class="legend" style="margin-top:12px">${Object.keys(doms).map((d) => `<span><i style="${dc(d)}"></i>${DOM[d].name} ${dur(doms[d])}</span>`).join('')}</div>
    <div style="margin-top:12px">${bar(st.pct, 'sport').replace('--dc:var(--c-sport)', '--dc:var(--accent)')}<p class="muted" style="margin-top:6px;font-size:14px">${st.pct}% fait (${hours(st.dn)} sur ${hours(st.pl)})</p></div></section>
  ${plan.warnings.map((w) => `<div class="warn">${esc(w)}</div>`).join('')}
  ${plan.overflow.n ? `<div class="warn"><b>Trop chargé aujourd'hui.</b> ${plan.overflow.n} élément${plan.overflow.n > 1 ? 's' : ''} n'ont pas trouvé de place (≈ ${hours(plan.overflow.min)}). Ils restent en retard et reviennent demain : décide ce que tu coupes ou ce que tu déplaces.</div>` : ''}
  <section class="tl" aria-label="Frise de la journée">${plan.blocks.map((b) => blockHtml(b, date, today, now)).join('')}</section>
  ${trackable ? `<section class="card"><h2>Mes mesures du jour</h2><p class="muted" style="margin:4px 0 14px">Quelques chiffres suffisent. Ils alimentent tes graphiques.</p>${trackerFields(date, store.days[date] || {}, S())}</section>` : ''}`;
}
