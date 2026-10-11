import { toMin } from '@/core/format';
import { emojiFor } from '@/domain/habit-meta';
import { buildGoals } from '@/domain/goals';
import { groupBlocks, groupProgress, momentOf } from '@/domain/groups';
import { planDay } from '@/domain/planner';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { habitStreaks } from '@/domain/streaks';
import { adjustedTasks } from '@/domain/task-schedule';
import type { Block, DayData } from '@/domain/types';

const S = DEFAULT_SETTINGS;
const tasks = adjustedTasks(S);
const BED = toMin(S.bed);
const plan = (date: string, day?: DayData, settings = S) => planDay({ date, settings, progress: { done: {} }, day, today: '2026-10-01', tasks });
const mk = (id: string, start: number, end: number, domain: Block['domain'], checkable = true): Block => ({ id, start, end, title: id, domain, fixed: !checkable, checkable, done: false });

describe('groupes par moments', () => {
  it('répartit matin / après-midi / soirée / avant de dormir, trajets et travail à part', () => {
    expect(momentOf(mk('a', 360, 380, 'matin'), BED)).toBe('matin');
    expect(momentOf(mk('a', 720, 780, 'alim', false), BED)).toBe('apresmidi');
    expect(momentOf(mk('a', 1080, 1100, 'java'), BED)).toBe('soiree');
    expect(momentOf(mk('a', BED - 50, BED - 40, 'sommeil'), BED)).toBe('nuit');
    expect(momentOf(mk('a', 450, 510, 'trajet', false), BED)).toBe('trajet');
    expect(momentOf(mk('a', 510, 750, 'pro', false), BED)).toBe('travail');
    expect(momentOf(mk('a', 0, 1440, 'chabbat', false), BED)).toBe('chabbat');
  });

  it('jour de travail sur site : les groupes arrivent dans l\'ordre de la journée, sans groupe vide', () => {
    const groups = groupBlocks(plan('2026-10-13').blocks, 'moments', BED);
    expect(groups.map((g) => g.id)).toEqual(['matin', 'trajet', 'travail', 'apresmidi', 'soiree', 'nuit']);
    groups.forEach((g) => expect(g.blocks.length).toBeGreaterThan(0));
    for (let i = 1; i < groups.length; i++) expect(groups[i].start).toBeGreaterThanOrEqual(groups[i - 1].start);
  });

  it('aucun bloc perdu ni dupliqué, quel que soit le regroupement', () => {
    for (const mode of ['moments', 'themes'] as const) {
      const p = plan('2026-10-14');
      const flat = groupBlocks(p.blocks, mode, BED).flatMap((g) => g.blocks);
      expect(flat).toHaveLength(p.blocks.length);
      expect(new Set(flat).size).toBe(p.blocks.length);
    }
  });

  it('Chabbat : le groupe « Chabbat » arrive toujours en dernier', () => {
    const sam = groupBlocks(plan('2026-11-07').blocks, 'moments', BED).map((g) => g.id);
    expect(sam).toContain('chabbat'); expect(sam[sam.length - 1]).toBe('chabbat');
    const ven = groupBlocks(plan('2026-11-06').blocks, 'moments', BED).map((g) => g.id);
    expect(ven[ven.length - 1]).toBe('chabbat');
  });
});

describe('groupes par thèmes', () => {
  it('ordre fixe : routine, productivité, santé, repas, sommeil…', () => {
    const ids = groupBlocks(plan('2026-10-14').blocks, 'themes', BED).map((g) => g.id);
    expect(ids).toEqual(expect.arrayContaining(['routine', 'productivite', 'sante', 'repas', 'sommeil', 'trajets']));
    expect(ids.indexOf('routine')).toBeLessThan(ids.indexOf('productivite'));
    expect(ids.indexOf('productivite')).toBeLessThan(ids.indexOf('sante'));
  });
  it('Java, MIAGE, front et projets sont ensemble dans « Productivité »', () => {
    const S2 = { ...S, frontMin: 45, projetsMin: 30, anglaisMin: 20 };
    const g = groupBlocks(plan('2026-10-14', undefined, S2).blocks, 'themes', BED);
    const prod = g.find((x) => x.id === 'productivite')!;
    expect(new Set(prod.blocks.map((b) => b.domain))).toEqual(new Set(['miage', 'java', 'front', 'projets']));
    expect(g.find((x) => x.id === 'apprentissage')!.blocks.map((b) => b.domain)).toContain('anglais');
  });
  it('l\'avancement d\'un groupe ne compte que les blocs à cocher', () => {
    const g = groupBlocks(plan('2026-10-13', { done: { tephila: true } }).blocks, 'moments', BED).find((x) => x.id === 'matin')!;
    expect(groupProgress(g)).toEqual({ done: 1, total: 4 });
    const travail = groupBlocks(plan('2026-10-13').blocks, 'moments', BED).find((x) => x.id === 'travail')!;
    expect(groupProgress(travail)).toEqual({ done: 0, total: 0 });
  });
});

describe('emoji', () => {
  it('chaque bloc d\'une saison a un emoji', () => {
    for (const d of ['2026-10-13', '2026-11-03', '2026-11-06', '2026-11-07']) plan(d).blocks.forEach((b) => expect(emojiFor(b), b.id).toBeTruthy());
  });
});

describe('séries par habitude', () => {
  const done = { tephila: true, pompes: true, stretch: true, petitdej: true };
  const run = (days: Record<string, DayData>, today = '2026-11-05') => habitStreaks({ days, settings: S, progress: { done: {} }, tasks, today });

  it('compte les jours d\'affilée où l\'habitude prévue est faite', () => {
    expect(run({ '2026-11-04': { done }, '2026-11-03': { done }, '2026-11-02': { done } }).tephila).toBe(3);
  });
  it('aujourd\'hui ne casse pas la série tant qu\'il n\'est pas fini, et s\'ajoute une fois fait', () => {
    const before = { '2026-11-04': { done }, '2026-11-03': { done } };
    expect(run(before).tephila).toBe(2);
    expect(run({ ...before, '2026-11-05': { done } }).tephila).toBe(3);
  });
  it('un jour prévu mais manqué casse la série', () => {
    expect(run({ '2026-11-04': { done }, '2026-11-02': { done } }).tephila).toBe(1);
  });
  it('un jour sans l\'habitude (samedi) ne casse pas la série', () => {
    // ven. 6 et dim. 8 faits, samedi 7 = Chabbat sans routine
    expect(run({ '2026-11-06': { done }, '2026-11-08': { done } }, '2026-11-09').tephila).toBe(2);
  });
  it('pas de série pour les tâches MIAGE ni les blocs ajoutés à la main', () => {
    const s = run({ '2026-11-04': { done: { ...done, 'x:abc': true } } });
    expect(Object.keys(s).some((k) => k.startsWith('m:') || k.startsWith('x:'))).toBe(false);
  });
});

describe('objectifs', () => {
  const base = { days: {} as Record<string, DayData>, settings: S, progress: { done: {} }, tasks, today: '2026-11-05' };
  it('poids : progression du premier poids vers l\'objectif', () => {
    const g = buildGoals({ ...base, settings: { ...S, weightGoal: 80 }, days: { '2026-10-20': { weight: 90 }, '2026-11-05': { weight: 85 } } }).find((x) => x.id === 'poids')!;
    expect(g).toMatchObject({ value: '85 → 80 kg', pct: 50 });
  });
  it('poids : pas d\'objectif ou pas de mesure → pas de ligne', () => {
    expect(buildGoals(base).some((g) => g.id === 'poids')).toBe(false);
    expect(buildGoals({ ...base, settings: { ...S, weightGoal: 80 } }).some((g) => g.id === 'poids')).toBe(false);
  });
  it('TOEIC : meilleur score vers le score visé, borné à 100 %', () => {
    const g = buildGoals({ ...base, settings: { ...S, toeicGoal: 800 }, progress: { done: {}, toeic: { '2026-10-01': 600, '2026-11-01': 700 } } }).find((x) => x.id === 'toeic')!;
    expect(g).toMatchObject({ value: '700 / 800', pct: 88 });
    expect(buildGoals({ ...base, settings: { ...S, toeicGoal: 800 }, progress: { done: {}, toeic: { a: 900 } } }).find((x) => x.id === 'toeic')!.pct).toBe(100);
  });
  it('les domaines inactifs n\'apparaissent pas (front, lecture) ; MIAGE, Java et sport toujours', () => {
    const ids = buildGoals(base).map((g) => g.id);
    expect(ids).toEqual(expect.arrayContaining(['miage', 'java', 'sport']));
    expect(ids).not.toContain('front'); expect(ids).not.toContain('lecture');
    expect(buildGoals({ ...base, settings: { ...S, frontMin: 45, lectureMin: 20 } }).map((g) => g.id)).toEqual(expect.arrayContaining(['front', 'lecture']));
  });
  it('tous les pourcentages sont entre 0 et 100', () => {
    buildGoals({ ...base, settings: { ...S, weightGoal: 80, toeicGoal: 800, frontMin: 10, lectureMin: 10 }, days: { '2026-11-05': { weight: 70, pages: 999, sleep: { bed: '22:00', wake: '07:00' } } } })
      .forEach((g) => { expect(g.pct, g.id).toBeGreaterThanOrEqual(0); expect(g.pct, g.id).toBeLessThanOrEqual(100); });
  });
});
