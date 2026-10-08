/* Écran d'accueil : coach, anneau du jour, graphiques, échéances. */
import { KEY_DATES } from '../content/calendar.js';
import { byId } from '../content/miage/subjects.js';
import { T } from '../content/miage/tasks.js';
import { lastDays, dow, addDays, diffDays, fmt, fmtLong, fmtShort, JOURS, todayISO, nowMin } from '../core/dates.js';
import { hm, hours, esc, toMin } from '../core/format.js';
import { coachLine } from '../domain/coach.js';
import { DOM } from '../domain/domains.js';
import { mStats, jStats } from '../domain/progress.js';
import { shabbatFor } from '../domain/shabbat.js';
import { dayStats, streak } from '../domain/stats.js';
import { planFor, shabbatNow, dayAmounts } from '../state/selectors.js';
import { store, S } from '../state/store.js';
import { stackedBars, lineChart, barsChart, ringSvg } from '../ui/charts.js';
import { bar, head } from '../ui/components.js';
import { dc } from '../ui/icons.js';

export function screenHome() {
  const today = todayISO(), s = S(), now = nowMin();
  const plan = planFor(today), st = dayStats(plan);
  const shab = shabbatNow();
  const stk = streak(store.days, today, s);
  const routine = plan.blocks.filter((b) => b.domain === 'matin' && b.checkable);
  const [line, sub] = coachLine({ pct: st.pct, streak: stk, late: plan.late, now, routineDone: routine.length ? routine.every((b) => b.done) : true, shabbat: !!shab || dow(today) === 6, planned: st.pl });
  const nextB = plan.blocks.find((b) => b.checkable && !b.done && b.end > now);
  const week = lastDays(7, today).reduce((a, d) => a + (d === today ? st.dn : (store.days[d] && store.days[d].stats ? store.days[d].stats.dn : 0)), 0);
  const ms = mStats(store.prog, today), js = jStats(store.prog);
  const upcoming = KEY_DATES.filter((k) => k[0] >= today).slice(0, 4);
  const projects = T.filter((t) => t.k === 'proj' && !(store.prog.done && store.prog.done[t.id]) && t.due >= today).slice(0, 3);
  const friday = dow(today) === 6 ? addDays(today, -1) : addDays(today, (5 - dow(today) + 7) % 7);
  const shT = shabbatFor(friday, s);
  const typeLbl = plan.type === 'ent' ? (plan.onsite ? 'Journée AXA sur site' : 'Journée AXA en télétravail') : plan.type === 'ecole' ? 'Journée de cours' : plan.type === 'exam' ? 'Journée d\'examen' : plan.type === 'ferie' ? 'Jour férié' : dow(today) === 6 ? 'Chabbat' : 'Dimanche';
  const proMin = plan.blocks.filter((b) => b.domain === 'pro').reduce((a, b) => a + b.end - b.start, 0);
  const trMin = plan.blocks.filter((b) => b.domain === 'trajet').reduce((a, b) => a + b.end - b.start, 0);
  const syncTxt = store.sync === 'error' ? `<span class="sync bad">Synchronisation interrompue (${esc(store.error)})</span>` : store.sync === 'demo' ? '<span class="sync">Mode démo, données locales</span>' : '<span class="sync">● Synchronisé</span>';
  const dates14 = lastDays(14, today);
  const wPts = dates14.map((d) => ({ x: fmtShort(d).split(' ')[0] + ' ' + fmtShort(d).split(' ')[1].slice(0, 3), y: store.days[d] && store.days[d].weight != null && store.days[d].weight !== '' ? +store.days[d].weight : null }));
  const slItems = dates14.slice(-10).map((d) => { const sl = store.days[d] && store.days[d].sleep; return { x: JOURS[dow(d)].slice(0, 2), y: sl && sl.bed && sl.wake ? Math.round(((toMin(sl.wake) - toMin(sl.bed) + 1440) % 1440) / 6) / 10 : null }; });
  const legendDoms = ['matin', 'sport', 'sommeil', 'miage', 'java'];

  return `${head(fmtLong(today), 'Salut Raphaël', `<div class="row" style="justify-content:flex-start;gap:10px;flex-wrap:wrap"><span class="chip">${esc(typeLbl)}</span>${syncTxt}</div>`)}
  <section class="card coach" aria-label="Message du coach"><div class="eyebrow">Ton coach</div><p class="big">${esc(line)}</p><p class="small">${esc(sub)}</p></section>
  <section class="card hero"><div class="ring">${ringSvg(st.pct, 'var(--accent)')}<div class="num"><b>${st.pct}%</b><span>du jour</span></div></div>
    <div class="grid" style="gap:14px">
      <div class="kpis"><div class="kpi"><b>${stk}</b><span>jour${stk > 1 ? 's' : ''} d'affilée</span></div><div class="kpi"><b>${hours(st.dn)}</b><span>faites sur ${hours(st.pl)}</span></div><div class="kpi"><b>${hours(week)}</b><span>sur 7 jours</span></div></div>
      ${nextB && !shab ? `<div class="next" style="${dc(nextB.domain)}"><div><div class="eyebrow">À suivre · ${hm(nextB.start)}</div><div class="t">${esc(nextB.title)}</div></div></div>` : ''}
      <div class="muted" style="font-size:14px">Travail ${hours(proMin)} · Trajets ${hours(trMin)} · Pour toi ${hours(st.pl)}</div>
      <a class="btn primary" style="text-align:center;text-decoration:none;display:block" href="#/today">Voir ma journée heure par heure</a>
    </div></section>
  <section class="card"><div class="sectionhead"><h2>Heures accomplies</h2><span class="muted" style="font-size:14px">7 derniers jours</span></div>
    ${stackedBars(dayAmounts(lastDays(7, today), today), today)}
    <div class="legend" style="margin-top:8px">${legendDoms.map((d) => `<span><i style="${dc(d)}"></i>${DOM[d].name}</span>`).join('')}</div></section>
  <div class="grid two">
    <section class="card"><div class="sectionhead"><h2>Cours MIAGE</h2><span class="mono muted">${ms.pct}%</span></div>${bar(ms.pct, 'miage')}
      <p class="muted" style="margin-top:10px">${ms.g.d} tâches sur ${ms.g.n} faites${ms.g.late ? ` · <b style="color:var(--c-sport)">${ms.g.late} en retard</b>` : ' · à jour'}.</p>
      <a class="btn small" style="display:inline-block;margin-top:12px;text-decoration:none" href="#/dom/miage">Ouvrir mes cours</a></section>
    <section class="card"><div class="sectionhead"><h2>Java backend</h2><span class="mono muted">${js.pct}%</span></div>${bar(js.pct, 'java')}
      <p class="muted" style="margin-top:10px">Statut : <b style="color:var(--ink)">${esc(js.level)}</b>. ${js.phasesDone} phase${js.phasesDone > 1 ? 's' : ''} terminée${js.phasesDone > 1 ? 's' : ''} sur 14.</p>
      <a class="btn small" style="display:inline-block;margin-top:12px;text-decoration:none" href="#/dom/java">Ouvrir mon parcours</a></section>
  </div>
  <div class="grid two">
    <section class="card"><h2>Poids</h2><p class="muted" style="margin:4px 0 8px">14 derniers jours</p>${lineChart(wPts, { c: '--c-alim', label: 'Poids' })}</section>
    <section class="card"><h2>Sommeil</h2><p class="muted" style="margin:4px 0 8px">Heures par nuit, objectif ${String(s.sleepGoal).replace('.', ',')} h</p>${barsChart(slItems, { c: '--c-sommeil', goal: s.sleepGoal, goalLabel: String(s.sleepGoal).replace('.', ',') + ' h', label: 'Sommeil' })}</section>
  </div>
  <div class="grid two">
    <section class="card"><h2>Projets en cours</h2><div class="list" style="margin-top:8px">${projects.length ? projects.map((t) => `<div><div style="font-weight:500">${esc(t.t)}</div><div class="muted" style="font-size:14px">${esc(byId[t.s] ? byId[t.s].short : '')} · pour ${fmt(t.due)} · ${hours(t.h * 60)}</div></div>`).join('') : '<p class="muted">Aucun projet de week-end à venir.</p>'}</div></section>
    <section class="card"><h2>Prochaines échéances</h2><div class="list" style="margin-top:8px">${upcoming.map((k) => { const n = diffDays(today, k[0]); return `<div class="row"><span>${esc(k[1])}</span><span class="mono muted">${n === 0 ? 'aujourd\'hui' : 'dans ' + n + ' j'}</span></div>`; }).join('')}
      <div class="row"><span>Chabbat ${fmtShort(friday)}</span><span class="mono muted">${hm(shT.candle)} → ${hm(shT.havdalah)}</span></div></div></section>
  </div>`;
}
