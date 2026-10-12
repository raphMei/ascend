import { dueReviews, journalItems, journalKey, newEntry, reviewPatch, REVIEW_STEPS } from '@/domain/journal';
import { LEARNING, overviewOf, weeklyMinutes } from '@/domain/overview';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import type { DayData } from '@/domain/types';
import { genericTasks } from './fixtures';

const block = { id: 'm:dl:u1', taskId: 'dl:u1', title: 'Perceptron', domain: 'miage' as const };

describe('journal d\'apprentissage', () => {
  it('la clé suit la tâche pour un cours, le bloc sinon', () => {
    expect(journalKey(block)).toBe('dl:u1');
    expect(journalKey({ id: 'java' })).toBe('java');
  });
  it('un bilan « à revoir » reviendra dans 2 jours ; sans « à revoir », aucune date', () => {
    expect(newEntry(block, '2026-11-03', { note: ' compris ', diff: 2, rev: true })).toEqual({ t: 'Perceptron', k: 'miage', note: 'compris', diff: 2, rev: true, n: 0, next: '2026-11-05' });
    expect(newEntry(block, '2026-11-03', { note: '  ' })).toEqual({ t: 'Perceptron', k: 'miage' });
  });
  it('liste tous les bilans, du plus récent au plus ancien, sans les effacés', () => {
    const days: Record<string, DayData> = {
      '2026-11-01': { journal: { a: { t: 'A', k: 'java' } } },
      '2026-11-03': { journal: { b: { t: 'B', k: 'cloud' }, c: null } },
      '2026-11-02': {}
    };
    expect(journalItems(days).map((i) => i.id)).toEqual(['b', 'a']);
  });
  it('révisions dues : date atteinte ou dépassée, les plus anciennes d\'abord', () => {
    const days: Record<string, DayData> = { '2026-11-01': { journal: {
      a: { t: 'A', k: 'java', rev: true, next: '2026-11-03', n: 0 }, b: { t: 'B', k: 'java', rev: true, next: '2026-11-02', n: 0 },
      c: { t: 'C', k: 'java', rev: true, next: '2026-11-09', n: 0 }, d: { t: 'D', k: 'java', rev: false, next: '2026-11-01' } } } };
    expect(dueReviews(journalItems(days), '2026-11-03').map((i) => i.id)).toEqual(['b', 'a']);
  });
  it('« Je sais » passe à l\'intervalle suivant, « Flou » repart de demain, la dernière révision clôt', () => {
    expect(reviewPatch({ n: 0 }, true, '2026-11-03')).toEqual({ n: 1, next: '2026-11-06', rev: true });
    expect(reviewPatch({ n: 3 }, false, '2026-11-03')).toEqual({ n: 0, next: '2026-11-04', rev: true });
    expect(reviewPatch({ n: REVIEW_STEPS.length - 1 }, true, '2026-11-03')).toEqual({ n: REVIEW_STEPS.length, next: null, rev: false });
  });
});

describe('vue d\'ensemble des domaines', () => {
  const S = DEFAULT_SETTINGS, tasks = genericTasks(S);
  const input = { settings: S, progress: { done: {} }, tasks, days: {}, today: '2026-11-03' };
  it('un aperçu par domaine d\'apprentissage ; un parcours non commencé et non activé est inactif', () => {
    expect(LEARNING.map((id) => overviewOf(id, input).id)).toEqual([...LEARNING]);
    expect(overviewOf('cloud', input)).toMatchObject({ pct: 0, active: false, next: 'Le terminal et le shell : pourquoi et comment' });
    expect(overviewOf('java', input).active).toBe(true);
  });
  it('un parcours terminé ou commencé est actif, avec avancement et prochaine étape', () => {
    const o = overviewOf('cloud', { ...input, progress: { done: { c1t1: true } } });
    expect(o.active).toBe(true); expect(o.done).toBe(1); expect(o.pct).toBeGreaterThan(0); expect(o.next).not.toBeNull();
  });
  it('l\'intensité du mois fait foi : « off » désactive même Java', () => {
    const off = { ...S, months: { '2026-11': { java: 'off' as const, cloud: 'normal' as const } } };
    expect(overviewOf('java', { ...input, settings: off })).toMatchObject({ level: 'off', active: false });
    expect(overviewOf('cloud', { ...input, settings: off })).toMatchObject({ level: 'normal', active: true });
  });
  it('anglais, lecture et projets n\'ont pas de pourcentage', () => {
    for (const id of ['anglais', 'lecture', 'projets'] as const) expect(overviewOf(id, input).pct).toBeNull();
  });
  it('minutes apprises par semaine : huit semaines, la plus récente en dernier', () => {
    const days: Record<string, DayData> = { '2026-11-03': { stats: { pct: 0, pl: 0, dn: 0, planned: {}, done: { java: 45 } } }, '2026-10-28': { stats: { pct: 0, pl: 0, dn: 0, planned: {}, done: { java: 30 } } } };
    const w = weeklyMinutes(days, 'java', '2026-11-03');
    expect(w).toHaveLength(8);
    expect(w[7]).toBe(75);   // 28 oct. → 3 nov. : sept jours glissants
    expect(w.slice(0, 7).every((x) => x === 0)).toBe(true);
  });
});
