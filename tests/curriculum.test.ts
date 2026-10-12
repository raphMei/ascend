import { JT, PHASES } from '@/content/java/path';
import { FRONT_PHASES, FRONT_TASKS } from '@/content/front/path';
import type { PathStep, Phase } from '@/content/types';

const tracks: [string, Phase[], PathStep[]][] = [['Java', PHASES, JT], ['Dev front', FRONT_PHASES, FRONT_TASKS]];

describe.each(tracks)('parcours %s : structure en chapitres', (_name, phases, steps) => {
  it('identifiants uniques et stables (p1t1…), durées positives', () => {
    expect(new Set(steps.map((s) => s.id)).size).toBe(steps.length);
    steps.forEach((s) => { expect(s.id).toMatch(/^[pf]\d+t\d+$/); expect(s.min, s.id).toBeGreaterThan(0); expect(s.t.length, s.id).toBeGreaterThan(5); });
  });

  it('chaque phase a un objectif, des chapitres, au moins un exercice ou un projet et une validation', () => {
    phases.forEach((p) => {
      expect(p.goal.length, p.id).toBeGreaterThan(20);
      const kinds = new Set(p.tasks.map((t) => t.k));
      expect(kinds.has('cours'), p.id).toBe(true);
      expect(kinds.has('exo') || kinds.has('projet'), p.id).toBe(true);
      expect(kinds.has('valid'), p.id).toBe(true);
      expect(p.tasks.length, p.id).toBeGreaterThanOrEqual(5);
      expect(p.hours, p.id).toBe(Math.max(1, Math.round(p.tasks.reduce((a, t) => a + t.min, 0) / 60)));
    });
  });

  it('chaque chapitre à lire a au moins un lien ; les liens sont des adresses https, sans doublon dans une étape', () => {
    steps.filter((s) => s.k === 'cours').forEach((s) => expect(s.res.length, s.id + ' ' + s.t).toBeGreaterThan(0));
    steps.flatMap((s) => s.res.map((r) => [s, r] as const)).forEach(([s, r]) => {
      expect(r.url, s.id).toMatch(/^https:\/\/[^\s]+$/);
      expect(['fr', 'en']).toContain(r.lang);
      expect(r.title.length).toBeGreaterThan(2); expect(r.src.length).toBeGreaterThan(1);
    });
    steps.forEach((s) => expect(new Set(s.res.map((r) => r.url)).size, s.id).toBe(s.res.length));
  });

  it('le français est privilégié : au moins les deux tiers des liens de cours', () => {
    const links = steps.filter((s) => s.k === 'cours').flatMap((s) => s.res);
    expect(links.filter((r) => r.lang === 'fr').length / links.length).toBeGreaterThan(0.6);
  });

  it('les sections (g) regroupent des étapes consécutives', () => {
    phases.forEach((p) => {
      const seen = new Set<string>(); let last: string | undefined;
      p.tasks.forEach((t) => { if (t.g && t.g !== last) { expect(seen.has(t.g), `${p.id} « ${t.g} » réapparaît`).toBe(false); seen.add(t.g); } last = t.g ?? last; });
    });
  });
});

describe('parcours Java', () => {
  it('14 phases, socle de 7 phases, plus de 100 étapes', () => {
    expect(PHASES).toHaveLength(14);
    expect(PHASES.filter((p) => p.core)).toHaveLength(7);
    expect(JT.length).toBeGreaterThan(100);
  });
});
