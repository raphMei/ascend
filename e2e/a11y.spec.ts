import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Audit automatique d'accessibilité (axe) : aucune violation « grave » ou « critique » sur les écrans principaux, en clair et en sombre.
const SCREENS = ['#/home', '#/today', '#/today/2026-10-14', '#/today/2026-11-06', '#/domains', '#/week', '#/journal', '#/dom/cloud/c1', '#/dom/archi', '#/dom/sport', '#/dom/miage/dl', '#/dom/java/p1', '#/dom/alim', '#/dom/projets', '#/dom/finances', '#/dom/anglais', '#/dom/lecture', '#/dom/front/f1', '#/stats', '#/settings'];

for (const scheme of ['light', 'dark'] as const) {
  test(`accessibilité (axe), thème ${scheme}`, async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-03T10:00:00'));
    // Animations d'entrée coupées : axe mesurerait sinon des couleurs en cours de fondu.
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
    await page.goto('/ascend/?demo');
    for (const hash of SCREENS) {
      await page.evaluate((h) => { location.hash = h; }, hash);
      await page.waitForTimeout(250);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(bad.map((v) => `${hash} · ${v.id} (${v.impact}) : ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`), hash).toEqual([]);
    }
  });
}
