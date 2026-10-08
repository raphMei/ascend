/* Composants d'interface réutilisables (retournent du HTML). */
import { DOM } from '../domain/domains.js';
import { dow, fmtShort, JOURS, lastDays } from '../core/dates.js';
import { hm, dur, hours, esc, toMin } from '../core/format.js';
import { ico, dc } from './icons.js';

export const cbox = (checked, attrs, domain) => `<label class="cb" style="${dc(domain)}"><input type="checkbox" class="sr" ${checked ? 'checked' : ''} ${attrs}><span class="box">${ico('check', 3)}</span></label>`;
export const bar = (pct, domain) => `<div class="bar" style="${dc(domain)}"><i style="width:${Math.max(0, Math.min(100, pct))}%"></i></div>`;
export const detailsHtml = (key, text, link) => text ? `<details class="how" data-k="${esc(key)}"><summary>Comment faire</summary><div class="txt">${esc(text)}${link ? `\n<a href="${esc(link)}" target="_blank" rel="noopener" style="color:var(--accent);font-weight:700">Ouvrir la ressource ↗</a>` : ''}</div></details>`.replace(/\n<a/, '<br><a') : '';

export function blockHtml(b, date, today, now) {
  const isNow = date === today && now >= b.start && now < b.end;
  const cls = ['blk', b.fixed ? 'fixed' : '', b.done ? 'done' : '', isNow ? 'now' : '', b.blocked ? 'blocked' : ''].join(' ');
  const attrs = b.scope === 'prog' ? `data-act="tick" data-scope="prog" data-task="${esc(b.taskId)}" data-date="${date}"` : `data-act="tick" data-scope="day" data-key="${esc(b.id)}" data-date="${date}"`;
  const lateTag = b.due && b.due < date ? `<span class="chip" style="color:var(--c-sport)">En retard · prévu ${fmtShort(b.due)}</span>` : '';
  return `<div class="${cls}"><div class="time">${hm(b.start)}<small>${dur(b.end - b.start)}</small></div>
    <div class="body" style="${dc(b.domain)}">
      <div><div class="title">${esc(b.title)}${b.cont ? ' <span class="muted" style="font-weight:400">(suite)</span>' : ''}</div></div>
      ${b.checkable ? cbox(b.done, attrs, b.domain) : '<span></span>'}
      <div class="meta">${isNow ? '<span class="tag-now">Maintenant</span>' : ''}<span class="chip dot" style="${dc(b.domain)}">${esc(DOM[b.domain].name)}</span>${b.sub ? `<span>${esc(b.sub)}</span>` : ''}${lateTag}</div>
      ${b.detail ? `<div class="how">${detailsHtml(date + b.id + (b.cont ? 'c' : ''), b.detail, b.link)}</div>` : ''}
    </div></div>`;
}

/** Page : en-tête avec sur-titre et titre. */
export function head(eyebrow, title, extra = '') { return `<header class="pagehead"><div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(title)}</h1>${extra}</header>`; }
export function backLink(href, label) { return `<a class="back" href="${href}">← ${esc(label)}</a>`; }

/** Frise des 14 derniers jours : un carré plein quand pred(date) est vrai. */
export function strip14(today, pred, domain) {
  const days = lastDays(14, today);
  return `<div class="days7" style="grid-template-columns:repeat(14,1fr);gap:4px;${dc(domain)}">${days.map((d) => `<div><i class="${pred(d) ? 'on' : ''}"></i>${JOURS[dow(d)].slice(0, 1).toUpperCase()}</div>`).join('')}</div>`;
}

/** Formulaire de saisie des mesures du jour. D = données du jour, s = réglages effectifs. */
export function trackerFields(date, D, s) {
  const sl = D.sleep || {};
  const slDur = sl.bed && sl.wake ? ((toMin(sl.wake) - toMin(sl.bed) + 1440) % 1440) : null;
  return `<div class="fields">
    <label class="f">Poids (kg)<input type="number" inputmode="decimal" step="0.1" min="30" max="250" data-save="weight" data-date="${date}" value="${D.weight ?? ''}" placeholder="87,0"></label>
    <label class="f">Eau (ml)<input type="number" inputmode="numeric" step="50" min="0" data-save="water" data-date="${date}" value="${D.water ?? ''}" placeholder="${s.waterGoal}"></label>
    <label class="f">Calories<input type="number" inputmode="numeric" step="10" min="0" data-save="kcal" data-date="${date}" value="${D.kcal ?? ''}" placeholder="${s.kcalGoal}"></label>
    <label class="f">Protéines (g)<input type="number" inputmode="numeric" step="1" min="0" data-save="protein" data-date="${date}" value="${D.protein ?? ''}" placeholder="${s.protGoal}"></label>
    <label class="f">Coucher (la veille)<input type="time" data-save="sleep.bed" data-date="${date}" value="${sl.bed || ''}"></label>
    <label class="f">Lever<input type="time" data-save="sleep.wake" data-date="${date}" value="${sl.wake || ''}"></label>
    ${slDur != null ? `<div class="f">Sommeil<div style="font:700 22px DM Sans;color:var(--ink);padding-top:8px">${hours(slDur)}</div></div>` : ''}
  </div>
  <div class="quick"><button class="btn small" data-act="water" data-date="${date}" data-ml="250">+ 250 ml</button><button class="btn small" data-act="water" data-date="${date}" data-ml="500">+ 500 ml</button><button class="btn small" data-act="water" data-date="${date}" data-ml="1000">+ 1 L</button></div>`;
}

/** Carte d'un domaine dans la grille « Mes domaines ». */
export const domCard = (k, stat, extra) => `<a class="domcard" style="${dc(k)}" href="#/dom/${k}"><div class="ico">${ico(DOM[k].ico)}</div><h3>${DOM[k].name}</h3><p class="muted" style="font-size:15px">${DOM[k].blurb}</p><div class="stat">${stat}</div>${extra || ''}</a>`;
