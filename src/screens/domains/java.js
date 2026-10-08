/* Domaine « Java backend » : liste des phases puis étapes d'une phase. */
import { PHASES, JKIND, phaseById } from '../../content/java/path.js';
import { todayISO } from '../../core/dates.js';
import { esc } from '../../core/format.js';
import { DOM } from '../../domain/domains.js';
import { jStats, phaseStats } from '../../domain/progress.js';
import { store } from '../../state/store.js';
import { cbox, bar, head, backLink, domCard } from '../../ui/components.js';
import { dc } from '../../ui/icons.js';

function card() {
  const js = jStats(store.prog);
  return domCard('java', js.level + ' · ' + js.pct + '%', bar(js.pct, 'java'));
}

function domJava(sub) {
  const today = todayISO(), js = jStats(store.prog);
  if (sub && phaseById[sub]) {
    const p = phaseById[sub], ps = phaseStats(p, store.prog);
    return `${backLink('#/dom/java', 'Parcours Java')}${head('Phase ' + p.n + ' sur 14 · ' + p.hours + ' h', p.title)}
    <section class="card"><p>${esc(p.goal)}</p><div style="margin-top:12px">${bar(100 * ps.d / ps.n, 'java')}</div><p class="muted" style="margin-top:8px">${ps.d} / ${ps.n} étapes${p.core ? ' · fait partie du socle' : ''}</p></section>
    <section class="card"><div class="list">${p.tasks.map((t) => { const d = !!(store.prog.done && store.prog.done[t.id]); return `<div class="item ${d ? 'done' : ''}">${cbox(d, `data-act="tick" data-scope="prog" data-task="${esc(t.id)}" data-date="${today}"`, 'java')}<div><div class="t">${esc(t.t)}</div><div class="sub"><span class="chip">${esc(JKIND[t.k] || t.k)}</span>${t.u ? `<a class="chip" href="${esc(t.u)}" target="_blank" rel="noopener" style="color:var(--accent)">Ressource ↗</a>` : ''}</div></div></div>`; }).join('')}</div></section>`;
  }
  const next = js.next ? 'Prochain statut : ' + js.next + '.' : 'Parcours terminé. Bravo.';
  const cards = PHASES.map((p) => { const ps = phaseStats(p, store.prog); return `<a class="go" style="${dc('java')}" href="#/dom/java/${p.id}"><div><div style="font-weight:700">${p.n}. ${esc(p.title)}</div><div class="muted" style="font-size:14px">${ps.d} / ${ps.n} étapes · ${p.hours} h${p.core ? ' · socle' : ''}${ps.status === 'done' ? ' · terminée' : ''}</div></div><span class="arrow">›</span>${bar(100 * ps.d / ps.n, 'java')}</a>`; }).join('');
  return `${backLink('#/domains', 'Domaines')}${head('Domaine', DOM.java.name)}
  <section class="card"><div class="sectionhead"><h2>${esc(js.level)}</h2><span class="mono muted">${js.pct}%</span></div>${bar(js.pct, 'java')}<p class="muted" style="margin-top:10px">${next} Socle : ${js.coreDone} / ${js.core} phases terminées.</p></section>
  <section class="grid">${cards}</section>`;
}

export default { id: 'java', card, page: domJava };