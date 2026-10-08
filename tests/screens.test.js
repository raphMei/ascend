/* Test de fumée : chaque écran se génère sans erreur et sans « undefined » / « NaN » dans le HTML. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { store } from '../src/state/store.js';
import { S } from '../src/state/store.js';
import { adjustTasks } from '../src/domain/task-schedule.js';
import { screenHome } from '../src/screens/home.js';
import { screenToday } from '../src/screens/today.js';
import { screenDomains } from '../src/screens/domains.js';
import { DOMAIN_PAGES } from '../src/screens/domains/index.js';
import { screenSettings } from '../src/screens/settings.js';
import { screenSignIn, screenShabbat } from '../src/screens/auth.js';
import { todayISO } from '../src/core/dates.js';
import { SUBJ } from '../src/content/miage/subjects.js';
import { PHASES } from '../src/content/java/path.js';
import { shabbatFor } from '../src/domain/shabbat.js';

const today = todayISO();
store.user = { displayName: 'Test', email: 't@test' }; store.authReady = true; store.sync = 'ok';
store.days[today] = { weight: 87, water: 1500, kcal: 2400, protein: 120, sleep: { bed: '22:30', wake: '06:00' }, done: { tephila: true } };
adjustTasks(S());

const clean = (name, html) => {
  assert.ok(typeof html === 'string' && html.length > 50, name + ' vide');
  assert.ok(!/undefined|NaN|\[object/.test(html), name + ' contient undefined/NaN/[object]');
};

test('écrans principaux', () => {
  clean('home', screenHome());
  clean('today', screenToday(null));
  ['2026-11-03', '2026-11-06', '2026-11-07', '2026-12-18', '2027-02-22'].forEach((d) => clean('today ' + d, screenToday(d)));
  clean('domains', screenDomains());
  clean('settings', screenSettings());
  clean('signin', screenSignIn());
  clean('shabbat', screenShabbat(shabbatFor('2026-11-06', S())));
});

test('pages de domaine : carte, page, sous-pages', () => {
  assert.ok(DOMAIN_PAGES.length >= 6);
  DOMAIN_PAGES.forEach((d) => { clean('carte ' + d.id, d.card()); clean('page ' + d.id, d.page(null)); });
  const by = (id) => DOMAIN_PAGES.find((d) => d.id === id);
  SUBJ.forEach((s) => clean('miage ' + s.id, by('miage').page(s.id)));
  PHASES.forEach((p) => clean('java ' + p.id, by('java').page(p.id)));
});
