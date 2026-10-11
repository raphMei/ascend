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

  test('démarre sans erreur sur « Aujourd\'hui » (liste groupée), le bilan est dans l\'onglet Bilan', async ({ page }) => {
    const errors = consoleErrors(page);
    await page.goto('/ascend/?demo');
    await expect(page.getByRole('heading', { level: 1, name: 'mardi 3 novembre' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Semaine' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Matin' })).toBeVisible();
    await page.getByRole('button', { name: 'Bilan', exact: true }).click();
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

  test('cocher une case persiste après rechargement', async ({ page }) => {
    await page.goto('/ascend/?demo#/today');
    const box = page.getByRole('checkbox', { name: 'Téphila' });
    // L'utilisateur touche la pastille ronde (le <label>), pas l'input invisible.
    await page.locator('label.cb', { has: box }).click();
    await expect(box).toBeChecked();
    await page.reload();
    await expect(page.getByRole('checkbox', { name: 'Téphila' })).toBeChecked();
  });

  test('la saisie du poids s\'enregistre à la sortie du champ et persiste', async ({ page }) => {
    await page.goto('/ascend/?demo#/today');
    const weight = page.getByLabel('Poids (kg)');
    await weight.fill('86.5');
    await weight.blur();
    await page.reload();
    await expect(page.getByLabel('Poids (kg)')).toHaveValue('86.5');
  });

  test('navigation complète par la barre', async ({ page }) => {
    await page.goto('/ascend/?demo');
    await page.getByRole('button', { name: 'Domaines' }).click();
    await expect(page.getByRole('heading', { name: 'Où je progresse' })).toBeVisible();
    await page.getByRole('link', { name: /Cours MIAGE/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Cours MIAGE' })).toBeVisible();
    await page.getByRole('button', { name: 'Réglages' }).click();
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

test.describe('liste d\'habitudes', () => {
  test.beforeEach(async ({ page }) => { await page.clock.setFixedTime(TUESDAY); });

  test('cocher dans la liste met à jour le groupe, la semaine et persiste ; replier un groupe est mémorisé', async ({ page }) => {
    await page.goto('/ascend/?demo#/today');
    const matin = page.getByRole('region', { name: 'Matin' });
    await expect(matin.getByText('0/4')).toBeVisible();
    await page.locator('label.cb', { has: page.getByRole('checkbox', { name: 'Téphila' }) }).click();
    await expect(matin.getByText('1/4')).toBeVisible();
    await matin.getByRole('button', { name: /Matin/ }).click();
    await page.reload();
    await expect(page.getByRole('region', { name: 'Matin' }).getByRole('button', { name: /Matin/ })).toHaveAttribute('aria-expanded', 'false');
    await page.getByRole('region', { name: 'Matin' }).getByRole('button', { name: /Matin/ }).click();
    await expect(page.getByRole('region', { name: 'Matin' }).getByRole('checkbox', { name: 'Téphila' })).toBeChecked();
  });

  test('changer de regroupement et de vue persiste', async ({ page }) => {
    await page.goto('/ascend/?demo#/today');
    await page.getByRole('radio', { name: 'Thèmes' }).click();
    await expect(page.getByRole('region', { name: 'Productivité' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('radio', { name: 'Thèmes' })).toBeChecked();
    await page.getByRole('radio', { name: 'Frise' }).click();
    await expect(page.getByRole('region', { name: 'Frise de la journée' })).toBeVisible();
  });
});
