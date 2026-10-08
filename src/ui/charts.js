/* Graphiques SVG faits main. Fonctions pures : données en entrée, chaîne SVG en sortie. */
import { DOM } from '../domain/domains.js';
import { dow, JOURS } from '../core/dates.js';
import { hours, esc } from '../core/format.js';

/** Barres empilées par jour. rows : [{ d, pl, done:{domaine:minutes} }] (voir selectors.dayAmounts). */
export function stackedBars(rows, today) {
  const W = 640, H = 190, pl = 6, pb = 24, pt = 14, n = rows.length, bw = (W - pl * 2) / n;
  const max = Math.max(120, ...rows.map((r) => Math.max(r.pl, Object.values(r.done).reduce((a, b) => a + b, 0))));
  const y = (m) => H - pb - (m / max) * (H - pb - pt);
  let out = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Heures accomplies par jour et par domaine">`;
  [0, 0.5, 1].forEach((f) => { const yy = y(max * f); out += `<line class="gl" x1="0" x2="${W}" y1="${yy}" y2="${yy}"/><text x="0" y="${yy - 3}">${hours(max * f)}</text>`; });
  rows.forEach((r, i) => {
    const x = pl + i * bw + bw * 0.18, w = bw * 0.64;
    if (r.pl) out += `<rect x="${x}" y="${y(r.pl)}" width="${w}" height="${H - pb - y(r.pl)}" rx="6" fill="var(--surface2)"/>`;
    let acc = 0;
    Object.keys(r.done).forEach((k) => { const m = r.done[k]; if (!m) return; out += `<rect x="${x}" y="${y(acc + m)}" width="${w}" height="${Math.max(0, y(acc) - y(acc + m))}" rx="3" fill="var(${DOM[k] ? DOM[k].c : '--muted'})"/>`; acc += m; });
    const lab = r.d === today ? 'auj.' : JOURS[dow(r.d)].replace('.', '');
    out += `<text x="${x + w / 2}" y="${H - 6}" text-anchor="middle" ${r.d === today ? 'style="fill:var(--ink);font-weight:500"' : ''}>${lab}</text>`;
  });
  return out + '</svg>';
}

/** Courbe. points : [{ x:étiquette, y:nombre|null }]. */
export function lineChart(points, opts = {}) {
  const W = 640, H = 170, pl = 34, pb = 22, pt = 12, pr = 8;
  const vals = points.map((p) => p.y).filter((v) => v != null);
  if (vals.length < 2) return `<p class="muted">Pas encore assez de mesures. Ajoute-en quelques-unes et la courbe apparaîtra.</p>`;
  let lo = Math.min(...vals, opts.goal ?? Infinity), hi = Math.max(...vals, opts.goal ?? -Infinity);
  if (hi - lo < 1) { hi += 0.5; lo -= 0.5; } const padv = (hi - lo) * 0.15; lo -= padv; hi += padv;
  const X = (i) => pl + (i * (W - pl - pr)) / Math.max(1, points.length - 1), Y = (v) => H - pb - ((v - lo) / (hi - lo)) * (H - pb - pt);
  let out = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.label || 'Courbe')}">`;
  [lo + padv, (lo + hi) / 2, hi - padv].forEach((v) => { out += `<line class="gl" x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}"/><text x="0" y="${Y(v) + 4}">${(Math.round(v * 10) / 10).toString().replace('.', ',')}</text>`; });
  if (opts.goal != null) out += `<line x1="${pl}" x2="${W - pr}" y1="${Y(opts.goal)}" y2="${Y(opts.goal)}" stroke="var(${opts.c || '--accent'})" stroke-dasharray="5 5" opacity=".7"/>`;
  let d = '', pen = false;
  points.forEach((p, i) => { if (p.y == null) { pen = false; return; } d += (pen ? 'L' : 'M') + X(i) + ' ' + Y(p.y) + ' '; pen = true; });
  out += `<path d="${d}" fill="none" stroke="var(${opts.c || '--accent'})" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  points.forEach((p, i) => { if (p.y != null) out += `<circle cx="${X(i)}" cy="${Y(p.y)}" r="3.5" fill="var(${opts.c || '--accent'})"/>`; });
  [0, Math.floor((points.length - 1) / 2), points.length - 1].forEach((i) => { out += `<text x="${X(i)}" y="${H - 5}" text-anchor="${i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}">${esc(points[i].x)}</text>`; });
  return out + '</svg>';
}

/** Barres. items : [{ x:étiquette, y:nombre|null }]. */
export function barsChart(items, opts = {}) {
  const W = 640, H = 170, pl = 6, pb = 22, pt = 14, n = items.length, bw = (W - pl * 2) / n;
  const max = Math.max(opts.goal || 0, ...items.map((i) => i.y || 0), 1) * 1.1;
  const Y = (v) => H - pb - (v / max) * (H - pb - pt);
  let out = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.label || 'Barres')}">`;
  out += `<line class="gl" x1="0" x2="${W}" y1="${Y(0)}" y2="${Y(0)}"/>`;
  items.forEach((it, i) => {
    const x = pl + i * bw + bw * 0.2, w = bw * 0.6;
    if (it.y != null) out += `<rect x="${x}" y="${Y(it.y)}" width="${w}" height="${Y(0) - Y(it.y)}" rx="5" fill="var(${opts.c || '--accent'})" opacity="${opts.goal && it.y < opts.goal * 0.85 ? 0.55 : 1}"/>`;
    out += `<text x="${x + w / 2}" y="${H - 6}" text-anchor="middle">${esc(it.x)}</text>`;
  });
  if (opts.goal) out += `<line x1="0" x2="${W}" y1="${Y(opts.goal)}" y2="${Y(opts.goal)}" stroke="var(--ink)" stroke-dasharray="5 5" opacity=".55"/><text x="${W}" y="${Y(opts.goal) - 4}" text-anchor="end">objectif ${esc(opts.goalLabel || opts.goal)}</text>`;
  return out + '</svg>';
}

/** Anneau de progression (0-100). */
export function ringSvg(pct, color) {
  const r = 54, c = 2 * Math.PI * r;
  return `<svg viewBox="0 0 132 132" aria-hidden="true"><circle cx="66" cy="66" r="${r}" fill="none" stroke="var(--surface2)" stroke-width="14"/><circle cx="66" cy="66" r="${r}" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${(c * pct) / 100} ${c}"/></svg>`;
}
