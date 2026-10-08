/* Événements délégués : un seul écouteur par type, les actions se lisent dans les attributs data-*.
   data-nav       → navigation
   data-act       → clic (ACTIONS) ; sur une case : data-act="tick"
   data-save      → saisie d'une mesure du jour (chemin « sleep.bed » possible)
   data-set       → réglage ; data-set-onsite → jours sur site */
import { store, S, setDay, setSettings, setProg, getBackend } from '../state/store.js';
import { saveStats } from '../state/selectors.js';
import { todayISO } from '../core/dates.js';
import { go } from './router.js';
import { render, peekShabbat } from './render.js';

const ACTIONS = {
  signin: () => getBackend().signIn(),
  signout: () => getBackend().signOut(),
  peek: () => peekShabbat(),
  water: (a) => { const d = a.dataset.date, cur = +((store.days[d] && store.days[d].water) || 0); setDay(d, { water: cur + +a.dataset.ml }); render(); },
  theme: (a) => { setSettings({ theme: a.dataset.theme }); render(); },
  export: () => {
    const blob = new Blob([JSON.stringify({ days: store.days, settings: store.settings, progress: store.prog }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), l = document.createElement('a'); l.href = url; l.download = 'ascend-' + todayISO() + '.json'; l.click(); URL.revokeObjectURL(url);
  }
};

function onTick(t) {
  const val = t.checked, date = t.dataset.date;
  if (t.dataset.scope === 'prog') setProg({ done: { [t.dataset.task]: val } });
  else setDay(date, { done: { [t.dataset.key]: val } });
  saveStats(date); render();
}

function onSave(t) {
  const path = t.dataset.save.split('.'), date = t.dataset.date; let v = t.value;
  if (t.type === 'number') v = v === '' ? null : Number(v);
  const patch = {}; let o = patch;
  path.forEach((k, i) => { if (i === path.length - 1) o[k] = v; else { o[k] = {}; o = o[k]; } });
  setDay(date, patch); render();
}

function onOnsite(t) {
  const w = Number(t.dataset.setOnsite), cur = new Set(S().onsite);
  if (t.checked) cur.add(w); else cur.delete(w);
  cur.add(4); // le jeudi est toujours sur site
  setSettings({ onsite: [...cur].sort() }); render();
}

export function bindEvents() {
  document.addEventListener('click', async (e) => {
    const nav = e.target.closest('[data-nav]'); if (nav) { go(nav.dataset.nav); window.scrollTo(0, 0); return; }
    const a = e.target.closest('[data-act]'); if (!a) return;
    const fn = ACTIONS[a.dataset.act]; if (fn) await fn(a);
  });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.act === 'tick') onTick(t);
    else if (t.dataset.save) onSave(t);
    else if (t.dataset.set) { setSettings({ [t.dataset.set]: t.type === 'number' ? Number(t.value) : t.value }); render(); }
    else if (t.dataset.setOnsite) onOnsite(t);
  });
  window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
  window.addEventListener('online', () => render());
  setInterval(() => { if (store.user) render(); }, 60000);
}
