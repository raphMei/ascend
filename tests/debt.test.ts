import { addDays, range } from '@/core/dates';
import type { MiageTask } from '@/content/types';
import { DEBT, debtOf, resetPatch, resetProposal, undoResetPatch } from '@/domain/debt';
import { SKIP } from '@/domain/schedule';
import { merge } from '@/core/merge';
import type { Progress } from '@/domain/types';

const TODAY = '2026-11-16';                               // un lundi
const t = (id: string, k: MiageTask['k'], due: string, h = 1): MiageTask => ({ id, s: 'bdd', k, t: id, d: '', due, h });
/** 120 min de place par jour (le samedi ne compte pas). */
const capacity = Object.fromEntries(range(TODAY, addDays(TODAY, 20)).map((d) => [d, 120]));
const sched = (dropped: string[] = []) => ({ capacity, dropped });

describe('dette de retard', () => {
  it('rien en retard : 0 jour, pas d\'alerte', () => {
    const d = debtOf([t('a', 'fiche', TODAY), t('b', 'rev', addDays(TODAY, 2))], { done: {} }, sched(), TODAY);
    expect(d).toMatchObject({ min: 0, days: 0, over: false, late: [] });
  });

  it('ne compte ni les tâches faites, ni les abandonnées, ni les examens, ni celles laissées tomber', () => {
    const tasks = [t('fait', 'fiche', '2026-11-10'), t('auto', 'daily', '2026-11-10'), t('exam', 'exam', '2026-11-10'), t('skip', 'org', '2026-11-10'), t('reste', 'fiche', '2026-11-12')];
    const p: Progress = { done: { fait: true }, pins: { skip: SKIP } };
    const d = debtOf(tasks, p, sched(['auto']), TODAY);
    expect(d.late.map((x) => x.id)).toEqual(['reste']);
    expect(d.min).toBe(60);
  });

  it('exprime le retard en jours de travail et alerte au-delà de 3 jours', () => {
    const late = Array.from({ length: 8 }, (_, i) => t('f' + i, 'fiche', addDays(TODAY, -1 - i)));   // 8 h
    const d = debtOf(late, { done: {} }, sched(), TODAY);
    expect(d.dayCapacity).toBe(120);
    expect(d.days).toBe(4);
    expect(d.over).toBe(true);
    expect(debtOf(late.slice(0, 6), { done: {} }, sched(), TODAY).over).toBe(false);                  // 3 jours pile : pas d'alerte
  });

  it('sans place mesurable : seuil en minutes', () => {
    const late = Array.from({ length: 11 }, (_, i) => t('f' + i, 'fiche', addDays(TODAY, -1 - i)));
    const d = debtOf(late, { done: {} }, { capacity: {}, dropped: [] }, TODAY);
    expect(d.days).toBeNull();
    expect(d.over).toBe(d.min > DEBT.ALERT_MIN_FALLBACK);
  });
});

describe('repartir à zéro', () => {
  const late = [
    t('rev1', 'rev', '2026-11-01', 2), t('proj1', 'proj', '2026-11-02', 3),
    t('fiche-ancienne', 'fiche', '2026-11-03'), t('fiche-recente', 'fiche', '2026-11-12'),
    t('org1', 'org', '2026-11-11', 0.5), t('setup1', 'setup', '2026-11-05', 0.25)
  ];
  const debt = () => debtOf(late, { done: {} }, sched(), TODAY);

  it('ne propose jamais révisions, projets ni examens', () => {
    const p = resetProposal(debt());
    const ids = p.drop.map((x) => x.id);
    expect(ids).not.toContain('rev1'); expect(ids).not.toContain('proj1');
  });

  it('les moins prioritaires d\'abord (organisation, mise en place, puis fiches les plus anciennes)', () => {
    expect(resetProposal(debt()).drop.map((x) => x.id)).toEqual(['org1', 'setup1', 'fiche-ancienne', 'fiche-recente']);
  });

  it('s\'arrête dès que le retard revient à 1 jour', () => {
    const light = [t('org1', 'org', '2026-11-11', 0.5), t('f1', 'fiche', '2026-11-10'), t('f2', 'fiche', '2026-11-12'), t('f3', 'fiche', '2026-11-13')];
    const p = resetProposal(debtOf(light, { done: {} }, sched(), TODAY));        // 210 min → objectif 120
    expect(p.drop.map((x) => x.id)).toEqual(['org1', 'f1']);
    expect(p.afterMin).toBe(120);
    expect(p.keep.map((x) => x.id)).toEqual(['f2', 'f3']);
  });

  it('valider puis annuler revient exactement à l\'état de départ', () => {
    const start: Progress = { done: {}, pins: { autre: '2026-11-20' } };
    const after = merge(start, resetPatch(['org1', 'setup1'], TODAY)) as Progress;
    expect(after.pins).toMatchObject({ org1: SKIP, setup1: SKIP, autre: '2026-11-20' });
    expect(debtOf(late, after, sched(), TODAY).late.map((x) => x.id)).not.toContain('org1');
    const undone = merge(after, undoResetPatch(after, TODAY)!) as Progress;
    expect(debtOf(late, undone, sched(), TODAY).late.length).toBe(late.length);
    expect(undoResetPatch(undone, TODAY)).toBeNull();
  });
});
