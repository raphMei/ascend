import { FILL_ORDER, GAP_MIN, MAX_ACTIVE, MIAGE_FLOOR, activeCount, breakdown, budgetMessage, budgetOf, canChoose, fillGap, miageNeed, monthFree, reservedOf, withLevel } from '@/domain/budget';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import type { MonthDomain, Settings } from '@/domain/types';
import { genericTasks } from './fixtures';

const M = '2026-11';
const S0: Settings = { ...DEFAULT_SETTINGS, months: { [M]: { java: 'off' } } };       // rien d'actif : tout le temps libre est à disposition
const FREE = 240;                                                                       // 4 h libres par jour

describe('budget du mois', () => {
  it('le temps libre moyen est mesuré sur les jours d\'étude du mois (hors samedi)', () => {
    const r = monthFree(DEFAULT_SETTINGS, M, { done: {} }, genericTasks(DEFAULT_SETTINGS));
    expect(r.days).toBeGreaterThan(20); expect(r.free).toBeGreaterThan(60);
  });

  it('réservé = minutes des domaines actifs (Java compris) ; un choix s\'ajoute au réservé', () => {
    expect(reservedOf(S0, M)).toBe(0);
    expect(reservedOf(DEFAULT_SETTINGS, M)).toBe(120);                                  // Java normal par défaut
    expect(reservedOf(withLevel(S0, M, 'cloud', 'normal'), M)).toBe(60);
    expect(breakdown(withLevel(S0, M, 'data', 'leger'), M)).toEqual([{ id: 'data', min: 30 }]);
  });

  it('le budget dit combien il reste à MIAGE, le plancher et le trou', () => {
    const b = budgetOf(withLevel(S0, M, 'cloud', 'normal'), M, FREE, 100);
    expect(b).toMatchObject({ free: 240, reserved: 60, miage: 180, floor: MIAGE_FLOOR.normal, need: 100, active: 1 });
    expect(b.gap).toBe(240 - 60 - 100);
    expect(b.room).toBe(240 - MIAGE_FLOOR.normal - 60);
  });

  it('besoin MIAGE : minutes restantes réparties sur les jours d\'étude jusqu\'à la dernière échéance', () => {
    const need = miageNeed(genericTasks(DEFAULT_SETTINGS), { done: {} }, '2026-11-01');
    expect(need).toBeGreaterThan(0);
    expect(miageNeed([], { done: {} }, '2026-11-01')).toBe(0);
  });
});

describe('limites', () => {
  it('plafond : un choix qui laisserait moins que le plancher à MIAGE est refusé, avec la raison', () => {
    const base = withLevel(S0, M, 'cloud', 'intensif');                                  // 120 min
    expect(canChoose(base, M, 'front', 'leger', FREE)).toEqual({ ok: true });            // 120 + 30 → il reste 90 = le plancher
    expect(canChoose(base, M, 'front', 'normal', FREE).ok).toBe(false);                   // 120 + 60 → il ne reste que 60
  });

  it('le plafond refuse ce qui dépasse libre − plancher', () => {
    const base = withLevel(withLevel(S0, M, 'cloud', 'intensif'), M, 'java', 'normal');   // 120 + 120 = 240
    const v = canChoose(base, M, 'front', 'leger', FREE);
    expect(v.ok).toBe(false); expect(v.reason).toMatch(/aux cours MIAGE \(minimum 90 min\)/);
  });

  it('désactiver est toujours permis, garder le choix actuel aussi, le sport n\'est pas concerné', () => {
    const full = withLevel(withLevel(S0, M, 'cloud', 'intensif'), M, 'java', 'normal');
    expect(canChoose(full, M, 'cloud', 'off', FREE).ok).toBe(true);
    expect(canChoose(full, M, 'cloud', 'intensif', FREE).ok).toBe(true);
    expect(canChoose(full, M, 'sport', 'intensif', FREE).ok).toBe(true);
  });

  it(`au plus ${MAX_ACTIVE} domaines actifs en plus de MIAGE`, () => {
    const five = (['java', 'front', 'cloud', 'archi', 'data'] as MonthDomain[]).reduce((s, id) => withLevel(s, M, id, 'leger'), S0);
    expect(activeCount(five, M)).toBe(MAX_ACTIVE);
    const v = canChoose(five, M, 'agile', 'leger', 1000);
    expect(v.ok).toBe(false); expect(v.reason).toMatch(/5 domaines actifs/);
    expect(canChoose(five, M, 'cloud', 'normal', 1000).ok).toBe(true);                   // changer l'intensité d'un domaine déjà actif : permis
  });

  it('choisir une intensité MIAGE plus haute exige assez de temps libre', () => {
    const busy = withLevel(S0, M, 'cloud', 'intensif');
    expect(canChoose(busy, M, 'miage', 'intensif', 240).ok).toBe(false);                 // 240 − 120 = 120 < 150
    expect(canChoose(busy, M, 'miage', 'normal', 240).ok).toBe(true);
  });
});

describe('combler le trou', () => {
  it('rien à faire sous le seuil, ou quand MIAGE a besoin de tout le temps', () => {
    expect(fillGap(S0, M, FREE, 240)).toEqual({});
    expect(fillGap(S0, M, GAP_MIN + MIAGE_FLOOR.normal - 1, 0)).toEqual({});
  });

  it('propose des domaines dans l\'ordre de tes priorités, sans dépasser le plafond ni la limite', () => {
    const out = fillGap(S0, M, 300, 60);
    expect(Object.keys(out).length).toBeGreaterThan(0);
    expect(FILL_ORDER).toContain(Object.keys(out)[0]);
    expect(Object.keys(out)[0]).toBe('java');                                            // la première priorité d'abord
    let s = S0;
    for (const [id, l] of Object.entries(out)) s = withLevel(s, M, id as MonthDomain, l!);
    const b = budgetOf(s, M, 300, 60);
    expect(b.miage).toBeGreaterThanOrEqual(b.floor); expect(b.active).toBeLessThanOrEqual(MAX_ACTIVE);
    expect(b.gap).toBeLessThan(GAP_MIN + 45);                                            // le trou est (presque) comblé
  });

  it('le message suit la situation : trou, MIAGE à l\'étroit, plafond, tout va bien', () => {
    expect(budgetMessage(budgetOf(S0, M, 300, 60)).tone).toBe('gap');
    expect(budgetMessage(budgetOf(S0, M, 120, 400)).tone).toBe('tight');
    expect(budgetMessage(budgetOf(withLevel(S0, M, 'cloud', 'intensif'), M, 120 + 90, 80)).tone).toBe('cap');
    expect(budgetMessage(budgetOf(withLevel(S0, M, 'cloud', 'normal'), M, 240, 150)).tone).toBe('ok');
  });
});
