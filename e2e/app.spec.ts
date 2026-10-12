import { expect, test, type Page } from '@playwright/test';

const consoleErrors = (page: Page) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
};

// Mardi 3 novembre 2026, 10 h (jour de cours) : date figée pour des tests reproductibles.
const TUESDAY = new Date('2026-11-03T10:00:00');

test.describe('application (mode démo)', () => {
  test.beforeEach(async ({ page }) => { await page.clock.setFixedTime(TUESDAY); });

  test('démarre sans erreur sur « Aujourd\'hui » (agenda), le bilan est accessible depuis la semaine', async ({ page }) => {
    const errors = consoleErrors(page);
    await page.goto('/ascend/?demo');
    await expect(page.getByRole('heading', { level: 1, name: 'mardi 3 novembre' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Semaine' })).toBeVisible();
    await expect(page.getByRole('list', { name: 'Agenda du jour' })).toBeVisible();
    await page.evaluate(() => { location.hash = '#/home'; });
    await expect(page.getByRole('heading', { level: 1, name: 'Salut Raphaël' })).toBeVisible();
    await expect(page.getByText('Mode démo')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('pas de défilement horizontal sur aucun écran', async ({ page }) => {
    await page.goto('/ascend/?demo');
    for (const hash of ['#/home', '#/today', '#/domains', '#/dom/sport', '#/dom/miage/dl', '#/dom/java/p1', '#/settings']) {
      await page.evaluate((h) => { location.hash = h; }, hash);
      await page.waitForTimeout(150);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, hash).toBeLessThanOrEqual(0);
    }
  });

  test('terminer une séance persiste après rechargement', async ({ page }) => {
    await page.goto('/ascend/?demo#/today');
    const box = page.getByRole('checkbox', { name: 'Java backend' });
    // L'utilisateur touche la pastille ronde (le <label>), pas l'input invisible.
    await page.locator('label.cb', { has: box }).click();
    await expect(box).toBeChecked();
    await page.reload();
    await expect(page.getByRole('checkbox', { name: 'Java backend' })).toBeChecked();
  });

  test('la saisie du poids (domaine Alimentation) s\'enregistre à la sortie du champ et persiste', async ({ page }) => {
    await page.goto('/ascend/?demo#/dom/alim');
    const weight = page.getByLabel('Poids (kg)');
    await weight.fill('86.5');
    await weight.blur();
    await page.reload();
    await expect(page.getByLabel('Poids (kg)')).toHaveValue('86.5');
  });

  test('navigation complète par la barre', async ({ page }) => {
    await page.goto('/ascend/?demo');
    await page.getByRole('button', { name: 'Domaines' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Novembre 2026' })).toBeVisible();
    await page.getByRole('link', { name: /Cours MIAGE/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Cours MIAGE' })).toBeVisible();
    await page.getByRole('link', { name: 'Réglages' }).click();
    await expect(page.getByRole('heading', { name: 'Mon Ascend' })).toBeVisible();
  });

  test('les anciennes adresses #/today/AAAA-MM-JJ fonctionnent', async ({ page }) => {
    await page.goto('/ascend/?demo#/today/2026-11-06');
    await expect(page.getByRole('heading', { level: 1, name: 'vendredi 6 novembre' })).toBeVisible();
  });
});

test.describe('Chabbat', () => {
  test('vendredi soir : écran de repos, sans tâche cochable', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-06T20:00:00'));
    await page.goto('/ascend/?demo&shabbat');
    await expect(page.getByRole('heading', { name: 'Chabbat shalom' })).toBeVisible();
    await expect(page.getByRole('checkbox')).toHaveCount(0);
  });
});

test.describe('PWA', () => {
  test('manifest valide, icônes servies sous /ascend/, thème', async ({ page, request }) => {
    await page.goto('/ascend/?demo');
    const href = await page.locator('link[rel=manifest]').getAttribute('href');
    expect(href).toBe('/ascend/manifest.webmanifest');
    const manifest = await (await request.get(href!)).json();
    expect(manifest).toMatchObject({ name: 'Ascend', display: 'standalone', lang: 'fr' });
    for (const icon of manifest.icons) expect((await request.get('/ascend/' + icon.src)).status(), icon.src).toBe(200);
    expect((await request.get(await page.locator('link[rel=apple-touch-icon]').getAttribute('href') ?? '')).status()).toBe(200);
  });
});

test.describe('hors mode démo', () => {
  test('sans connexion, l\'écran de connexion Google s\'affiche (SDK Firebase chargé)', async ({ page }) => {
    const errors = consoleErrors(page);
    await page.goto('/ascend/');
    await expect(page.getByRole('button', { name: 'Continuer avec Google' })).toBeVisible({ timeout: 15000 });
    expect(errors.filter((e) => !/favicon|fonts\.g/.test(e))).toEqual([]);
  });
});

test.describe('planning modifiable et nouveaux domaines', () => {
  test.beforeEach(async ({ page }) => { await page.clock.setFixedTime(TUESDAY); });

  test('ajouter un bloc à la main : il apparaît, se coche et survit au rechargement', async ({ page }) => {
    await page.goto('/ascend/?demo#/today/2026-10-14');
    await page.getByRole('button', { name: '+ Ajouter un bloc' }).click();
    await page.getByLabel('Titre').fill('Appeler le dentiste');
    await page.getByLabel('Début').fill('21:00');
    await page.getByRole('button', { name: 'Ajouter', exact: true }).click();
    await expect(page.getByRole('checkbox', { name: 'Appeler le dentiste' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('checkbox', { name: 'Appeler le dentiste' })).toBeVisible();
  });

  test('activer l\'anglais dans les réglages ajoute un bloc au planning', async ({ page }) => {
    await page.goto('/ascend/?demo#/settings');
    const input = page.getByLabel('Anglais (min)');
    await input.fill('20');
    await input.blur();
    await page.evaluate(() => { location.hash = '#/today/2026-10-14'; });
    await expect(page.getByRole('checkbox', { name: 'Anglais' })).toBeVisible();
  });

  test('le service worker des notifications est servi (sans cache hors-ligne)', async ({ request }) => {
    const res = await request.get('/ascend/sw.js');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("addEventListener('push'");
    expect(body).not.toContain('caches.open');
  });
});

test.describe('ajustement automatique et Mon mois', () => {
  test.beforeEach(async ({ page }) => { await page.clock.setFixedTime(TUESDAY); });

  test('le retard est redistribué et expliqué, et « Laisser tomber » est mémorisé', async ({ page }) => {
    await page.goto('/ascend/?demo#/today');
    const card = page.getByRole('region', { name: 'Ajustements automatiques du planning' });
    await expect(card).toBeVisible();
    await expect(card.getByText(/En retard depuis/).first()).toBeHidden();       // replié par défaut : rien à valider
    await card.getByText(/Planning ajusté automatiquement/).click();
    await expect(card.getByText(/En retard depuis/).first()).toBeVisible();
    const before = await card.getByRole('button', { name: 'Laisser tomber' }).count();
    await card.getByRole('button', { name: 'Laisser tomber' }).first().click();
    await page.reload();
    const after = await page.getByRole('region', { name: 'Ajustements automatiques du planning' }).getByRole('button', { name: 'Laisser tomber' }).count();
    expect(after).toBeLessThanOrEqual(before);
  });

  test('Mon mois : choisir une intensité change le planning du mois et persiste', async ({ page }) => {
    await page.goto('/ascend/?demo#/month');
    await page.getByRole('radiogroup', { name: 'Intensité : Anglais' }).getByRole('radio', { name: 'Normal' }).click();
    await page.reload();
    await expect(page.getByRole('radiogroup', { name: 'Intensité : Anglais' }).getByRole('radio', { name: 'Normal' })).toBeChecked();
    await page.evaluate(() => { location.hash = '#/today/2026-11-11'; });
    await expect(page.getByRole('checkbox', { name: 'Anglais' })).toBeVisible();
  });
});

test.describe('agenda et bilan', () => {
  test.beforeEach(async ({ page }) => { await page.clock.setFixedTime(TUESDAY); });

  test('terminer une séance met à jour le compteur du jour et persiste ; le bilan est proposé puis rangé dans le journal', async ({ page }) => {
    await page.goto('/ascend/?demo#/today');
    await expect(page.getByText(/0 \/ 2 séances/)).toBeVisible();
    await page.locator('label.cb', { has: page.getByRole('checkbox', { name: 'Java backend' }) }).click();
    const bilan = page.getByRole('dialog', { name: 'Bilan de séance' });
    await expect(bilan).toBeVisible();
    await bilan.getByLabel(/Ce que j'ai compris/).fill('Un conteneur partage le noyau');
    await bilan.getByRole('button', { name: 'Enregistrer la séance' }).click();
    await expect(bilan).toHaveCount(0);
    await expect(page.getByText(/1 \/ 2 séances/)).toBeVisible();
    await page.reload();
    await expect(page.getByRole('checkbox', { name: 'Java backend' })).toBeChecked();
    await page.getByRole('button', { name: 'Journal' }).click();
    await expect(page.getByText('Un conteneur partage le noyau')).toBeVisible();
  });

  test('le temps réservé (routine, sport, repas…) est dans l\'agenda, sans case à cocher', async ({ page }) => {
    await page.goto('/ascend/?demo#/today');
    const agenda = page.getByRole('list', { name: 'Agenda du jour' });
    await expect(agenda.getByText('Routine du matin')).toBeVisible();
    await expect(agenda.getByRole('checkbox', { name: /Routine du matin/ })).toHaveCount(0);
  });

  test('la navigation flottante reste dans l\'écran, au-dessus de la zone sûre, et ne cache pas la fin de page', async ({ page }) => {
    await page.goto('/ascend/?demo#/today');
    const nav = page.getByRole('navigation', { name: 'Navigation principale' });
    await expect(nav).toBeVisible();
    const box = (await nav.boundingBox())!;
    const vp = page.viewportSize()!;
    if (vp.width < 900) {
      expect(box.y + box.height).toBeLessThanOrEqual(vp.height - 4);
      expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(vp.width);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const last = page.getByRole('button', { name: '+ Ajouter un bloc' });
      const lb = (await last.boundingBox())!;
      expect(lb.y + lb.height).toBeLessThanOrEqual(box.y);   // le dernier bouton de la page est visible au-dessus de la barre
    }
  });

  test('le pincement et le double toucher ne zooment pas (événements de geste annulés)', async ({ page }) => {
    await page.goto('/ascend/?demo#/today');
    const prevented = await page.evaluate(() => {
      const e = new Event('gesturestart', { cancelable: true });
      document.dispatchEvent(e);
      return e.defaultPrevented;
    });
    expect(prevented).toBe(true);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).touchAction)).toBe('manipulation');
  });
});

test.describe('performance et confidentialité', () => {
  test('aucune requête vers un service tiers de polices, et les polices de l\'application sont chargées', async ({ page }) => {
    const external: string[] = [];
    page.on('request', (r) => { if (/googleapis|gstatic/.test(r.url())) external.push(r.url()); });
    await page.goto('/ascend/?demo');
    // L'application doit être affichée avant de regarder les polices : sinon, sur une machine chargée, rien n'a encore demandé de police.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(external).toEqual([]);
    const loaded = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')));
    expect(loaded).toEqual(expect.arrayContaining(['DM Sans', 'Syne']));
  });

  test('les écrans secondaires sont chargés à la demande (fichiers séparés)', async ({ page }) => {
    const scripts: string[] = [];
    page.on('request', (r) => { if (r.url().endsWith('.js')) scripts.push(r.url().split('/').pop()!); });
    await page.goto('/ascend/?demo#/today');
    await expect(page.getByRole('navigation', { name: 'Semaine' })).toBeVisible();
    expect(scripts.some((s) => /^SettingsScreen/.test(s))).toBe(false);
    await page.getByRole('link', { name: 'Réglages' }).click();
    await expect(page.getByRole('heading', { name: 'Mon Ascend' })).toBeVisible();
    expect(scripts.some((s) => /^SettingsScreen/.test(s))).toBe(true);
  });
});

test.describe('progression et usage', () => {
  test.beforeEach(async ({ page }) => { await page.clock.setFixedTime(TUESDAY); });

  test('les statistiques s\'ouvrent depuis le Bilan et affichent calendrier et badges', async ({ page }) => {
    await page.goto('/ascend/?demo#/home');
    await page.getByRole('link', { name: /Statistiques/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Statistiques' })).toBeVisible();
    await expect(page.getByRole('group', { name: 'Calendrier des 12 dernières semaines' }).getByRole('img')).toHaveCount(84);
    await expect(page.getByRole('region', { name: 'Badges' })).toContainText('0 / 11');
  });

  test('changer de jour au clavier et revenir à aujourd\'hui', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'clavier : bureau seulement');
    await page.goto('/ascend/?demo#/today');
    await expect(page.getByRole('heading', { level: 1, name: 'mardi 3 novembre' })).toBeVisible();   // l'application doit être montée
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('heading', { level: 1, name: 'mercredi 4 novembre' })).toBeVisible();
    await page.keyboard.press('t');
    await expect(page.getByRole('heading', { level: 1, name: 'mardi 3 novembre' })).toBeVisible();
  });

  test('le type de journée « Congé » libère la journée', async ({ page }) => {
    await page.goto('/ascend/?demo#/today/2026-10-20');
    const agenda = page.getByRole('list', { name: 'Agenda du jour' });
    await expect(agenda.getByText(/Trajet/).first()).toBeVisible();
    await page.getByLabel('Type de journée').selectOption('conge');
    await expect(agenda.getByText(/Trajet/)).toHaveCount(0);
  });

  test('exporter puis importer : la sauvegarde exportée est reconnue', async ({ page }) => {
    await page.goto('/ascend/?demo#/dom/alim');
    await page.getByLabel('Poids (kg)').fill('86.5'); await page.getByLabel('Poids (kg)').blur();
    await page.evaluate(() => { location.hash = '#/settings'; });
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Exporter mes données' }).click();
    const file = await download;
    const path = await file.path();
    await page.getByLabel('Importer une sauvegarde').setInputFiles(path);
    await expect(page.getByText(/Importer \?/)).toBeVisible();
    await expect(page.getByText(/\d+ jour/).first()).toBeVisible();
  });
});

test.describe('minuteur de concentration', () => {
  test('démarre, décompte avec le temps qui passe, se met en pause et reprend', async ({ page }) => {
    await page.clock.install({ time: TUESDAY });          // horloge pilotée : le temps n'avance que quand on le dit
    await page.goto('/ascend/?demo#/today');
    await page.getByRole('list', { name: 'Agenda du jour' }).getByRole('button', { name: /Java backend/ }).first().click();
    await expect(page.getByRole('timer')).toHaveText('45:00');
    await page.getByRole('button', { name: /Démarrer \(45 min\)/ }).click();
    await page.clock.runFor(65_000);
    await expect(page.getByRole('timer')).toHaveText('43:55');
    await page.getByRole('button', { name: /Pause/ }).click();
    await page.clock.runFor(60_000);
    await expect(page.getByRole('timer')).toHaveText('43:55');
    await page.getByRole('button', { name: /Reprendre/ }).click();
    await page.clock.runFor(55_000);
    await expect(page.getByRole('timer')).toHaveText('43:00');
  });
});
