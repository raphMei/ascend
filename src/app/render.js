/* Rendu : choisit l'écran selon l'état et la route, puis remplace le contenu de #root. */
import { store, S } from '../state/store.js';
import { shabbatNow } from '../state/selectors.js';
import { DEMO } from '../services/config.js';
import { adjustTasks } from '../domain/task-schedule.js';
import { ico } from '../ui/icons.js';
import { route } from './router.js';
import { screenHome } from '../screens/home.js';
import { screenToday } from '../screens/today.js';
import { screenDomains } from '../screens/domains.js';
import { domainPage } from '../screens/domains/index.js';
import { screenSettings } from '../screens/settings.js';
import { screenSignIn, screenShabbat } from '../screens/auth.js';

const NAV = [['home', 'Accueil', 'home'], ['today', 'Aujourd\'hui', 'today'], ['domains', 'Domaines', 'grid'], ['settings', 'Réglages', 'gear']];

let peek = false;
export const peekShabbat = () => { peek = true; render(); };

function applyTheme() {
  const t = S().theme;
  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t); else document.documentElement.removeAttribute('data-theme');
}

function screenFor(r) {
  if (r.tab === 'today') return screenToday(/^\d{4}-\d\d-\d\d$/.test(r.a || '') ? r.a : null);
  if (r.tab === 'domains') return screenDomains();
  if (r.tab === 'dom') { const d = domainPage(r.a); return d ? d.page(r.b) : screenDomains(); }
  if (r.tab === 'settings') return screenSettings();
  return screenHome();
}

export function render() {
  const root = document.getElementById('root'); if (!root) return;
  // On conserve les « Comment faire » ouverts, le défilement et la saisie en cours pendant le re-rendu.
  const open = [...document.querySelectorAll('details[open][data-k]')].map((d) => d.dataset.k);
  const y = window.scrollY;
  applyTheme();
  let html;
  const shab = store.user && !peek ? shabbatNow() : null;
  if (!store.authReady) html = '<div class="center"><p>Chargement…</p></div>';
  else if (!store.user) html = screenSignIn();
  else if (shab && (!DEMO || /shabbat/.test(location.search))) html = screenShabbat(shab);
  else {
    adjustTasks(S());
    const r = route();
    const cur = r.tab === 'dom' ? 'domains' : r.tab;
    html = `<div class="shell"><nav class="nav" aria-label="Navigation principale"><div class="brand"><img src="assets/icon.svg" alt="">Ascend</div>${NAV.map(([k, n, i]) => `<button data-nav="${k}" ${cur === k ? 'aria-current="page"' : ''}>${ico(i)}<span>${n}</span></button>`).join('')}</nav><main>${screenFor(r)}</main></div>`;
  }
  root.innerHTML = html;
  open.forEach((k) => { const d = [...document.querySelectorAll('details[data-k]')].find((x) => x.dataset.k === k); if (d) d.open = true; });
  window.scrollTo(0, y);
}
