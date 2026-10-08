/* Domaine « Cours MIAGE » : liste des matières puis tâches d'une matière. */
import { SUBJ, byId } from '../../content/miage/subjects.js';
import { T } from '../../content/miage/tasks.js';
import { fmt, todayISO } from '../../core/dates.js';
import { hours, esc } from '../../core/format.js';
import { DOM } from '../../domain/domains.js';
import { mStats } from '../../domain/progress.js';
import { store } from '../../state/store.js';
import { cbox, bar, detailsHtml, head, backLink, domCard } from '../../ui/components.js';
import { dc } from '../../ui/icons.js';

function card() {
  const ms = mStats(store.prog, todayISO());
  return domCard('miage', ms.pct + '% · ' + (ms.g.late ? ms.g.late + ' en retard' : 'à jour'), bar(ms.pct, 'miage'));
}

function domMiage(sub) {
  const today = todayISO(), ms = mStats(store.prog, today);
  if (sub && byId[sub]) {
    const sj = byId[sub], p = ms.per[sub], tasks = T.filter((t) => t.s === sub);
    const todo = tasks.filter((t) => !(store.prog.done && store.prog.done[t.id])), done = tasks.filter((t) => store.prog.done && store.prog.done[t.id]);
    const row = (t) => { const d = !!(store.prog.done && store.prog.done[t.id]); const late = !d && t.due < today; return `<div class="item ${d ? 'done' : ''}">${cbox(d, `data-act="tick" data-scope="prog" data-task="${esc(t.id)}" data-date="${today}"`, 'miage')}<div><div class="t">${esc(t.t)}</div><div class="sub"><span class="chip">${fmt(t.due)}</span><span class="chip">${hours(t.h * 60)}</span>${late ? '<span class="chip" style="color:var(--c-sport)">En retard</span>' : ''}</div>${detailsHtml('t' + t.id, t.d)}</div></div>`; };
    return `${backLink('#/dom/miage', 'Cours MIAGE')}${head(sj.cr ? sj.cr + ' crédits · ' + sj.ch + ' h de cours' : 'Organisation', sj.name)}
    <section class="card"><div class="sectionhead"><h2>Progression</h2><span class="mono muted">${p.n ? Math.round(100 * p.hd / p.h) : 0}%</span></div>${bar(p.n ? 100 * p.hd / p.h : 0, 'miage')}<p class="muted" style="margin-top:10px">${p.d} tâches sur ${p.n} faites · ${hours(p.h * 60 - p.hd * 60)} restantes${p.late ? ` · <b style="color:var(--c-sport)">${p.late} en retard</b>` : ''}.</p></section>
    <section class="card"><h2>À faire</h2><div class="list" style="margin-top:8px">${todo.length ? todo.map(row).join('') : '<p class="muted">Tout est fait. Bravo.</p>'}</div></section>
    ${done.length ? `<section class="card"><h2>Terminé</h2><div class="list" style="margin-top:8px">${done.map(row).join('')}</div></section>` : ''}`;
  }
  const cards = SUBJ.map((sj) => { const p = ms.per[sj.id]; const pc = p.h ? Math.round(100 * p.hd / p.h) : 0; return `<a class="go" style="${dc('miage')}" href="#/dom/miage/${sj.id}"><div><div style="font-weight:700">${esc(sj.name)}</div><div class="muted" style="font-size:14px">${p.d} / ${p.n} tâches${p.late ? ` · <span style="color:var(--c-sport)">${p.late} en retard</span>` : ''}</div></div><span class="arrow">›</span>${bar(pc, 'miage')}</a>`; }).join('');
  return `${backLink('#/domains', 'Domaines')}${head('Domaine', DOM.miage.name)}
  <section class="card"><div class="sectionhead"><h2>Progression globale</h2><span class="mono muted">${ms.pct}%</span></div>${bar(ms.pct, 'miage')}<p class="muted" style="margin-top:10px">${ms.g.d} tâches sur ${ms.g.n} · ${hours(ms.g.hd * 60)} faites sur ${hours(ms.g.h * 60)}. Examens du 22 au 26 février 2027.</p></section>
  <section class="grid">${cards}</section>
  <p class="muted">Quand tu m'enverras le contenu de chaque matière, je remplacerai ces tâches génériques par des tâches précises.</p>`;
}

export default { id: 'miage', card, page: domMiage };