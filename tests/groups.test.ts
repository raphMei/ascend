import { toMin } from '@/core/format';
import { emojiFor } from '@/domain/habit-meta';
import { buildGoals } from '@/domain/goals';
import { groupBlocks, groupProgress, momentOf } from '@/domain/groups';
import { planDay } from '@/domain/planner';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { habitStreaks } from '@/domain/streaks';
import { genericTasks } from './fixtures';
import type { Block, DayData } from '@/domain/types';

const S = DEFAULT_SETTINGS;
const tasks = genericTasks(S);
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
  it('ordre fixe : un thème par sujet d\'apprentissage, le temps réservé ensuite', () => {
    const ids = groupBlocks(plan('2026-10-14').blocks, 'themes', BED).map((g) => g.id);
    expect(ids).toEqual(expect.arrayContaining(['miage', 'java', 'reserve']));
    expect(ids.indexOf('miage')).toBeLessThan(ids.indexOf('java'));
    expect(ids.indexOf('java')).toBeLessThan(ids.indexOf('reserve'));
  });
  it('front, projets et anglais ont chacun leur thème ; routine, sport, repas, travail et trajet sont du temps réservé', () => {
    const S2 = { ...S, frontMin: 45, projetsMin: 30, anglaisMin: 20 };
    const g = groupBlocks(plan('2026-10-14', undefined, S2).blocks, 'themes', BED);
    const of = (id: string) => new Set(g.find((x) => x.id === id)!.blocks.map((b) => b.domain));
    expect(of('miage')).toEqual(new Set(['miage'])); expect(of('front')).toEqual(new Set(['front'])); expect(of('projets')).toEqual(new Set(['projets']));
    expect(of('langues')).toContain('anglais');
    expect(of('reserve')).toContain('matin'); expect(of('reserve')).toContain('sport');
  });
  it('l\'avancement d\'un groupe compte les séances faites ; le temps réservé ne compte jamais', () => {
    const g = groupBlocks(plan('2026-10-14', { done: { java: true } }).blocks, 'themes', BED);
    const j = groupProgress(g.find((x) => x.id === 'java')!);
    expect(j.total).toBeGreaterThan(0); expect(j.done).toBe(j.total);
    expect(groupProgress(g.find((x) => x.id === 'reserve')!)).toEqual({ done: 0, total: 0 });
  });
});

describe('emoji', () => {
  it('chaque bloc d\'une saison a un emoji', () => {
    for (const d of ['2026-10-13', '2026-11-03', '2026-11-06', '2026-11-07']) plan(d).blocks.forEach((b) => expect(emojiFor(b), b.id).toBeTruthy());
  });
});

describe('séries par habitude', () => {
  const done = { java: true };
  const run = (days: Record<string, DayData>, today = '2026-11-12') => habitStreaks({ days, settings: S, progress: { done: {} }, tasks: [], today });

  it('compte les jours d\'affilée où l\'habitude prévue est faite', () => {
    expect(run({ '2026-11-11': { done }, '2026-11-10': { done }, '2026-11-09': { done } }).java).toBe(3);
  });
  it('aujourd\'hui ne casse pas la série tant qu\'il n\'est pas fini, et s\'ajoute une fois fait', () => {
    const before = { '2026-11-11': { done }, '2026-11-10': { done } };
    expect(run(before).java).toBe(2);
    expect(run({ ...before, '2026-11-12': { done } }).java).toBe(3);
  });
  it('un jour prévu mais manqué casse la série', () => {
    expect(run({ '2026-11-11': { done }, '2026-11-09': { done } }).java).toBe(1);
  });
  it('un jour sans l\'habitude (samedi) ne casse pas la série', () => {
    // jeudi 12, samedi 14 (après la sortie de Chabbat) et dimanche 15 faits ; le vendredi 13 n'a pas de séance
    expect(run({ '2026-11-12': { done }, '2026-11-14': { done }, '2026-11-15': { done } }, '2026-11-16').java).toBe(3);
  });
  it('pas de série pour les tâches MIAGE ni les blocs ajoutés à la main', () => {
    const s = run({ '2026-11-04': { done: { ...done, 'x:abc': true } } });
    expect(Object.keys(s).some((k) => k.startsWith('m:') || k.startsWith('x:'))).toBe(false);
  });
});

describe('objectifs', () => {
  const base = { days: {} as Record<string, DayData>, settings: S, progress: { done: {} }, tasks, today: '2026-11-05' };
  it('seul l\'apprentissage a des objectifs : ni poids, ni sport, ni sommeil', () => {
    const ids = buildGoals({ ...base, settings: { ...S, weightGoal: 80 }, days: { '2026-10-20': { weight: 90, sleep: { bed: '22:00', wake: '06:00' } }, '2026-11-05': { weight: 85, done: { sport: true } } } }).map((g) => g.id);
    for (const id of ['poids', 'sport', 'sommeil']) expect(ids).not.toContain(id);
  });
  it('TOEIC : meilleur score vers le score visé, borné à 100 %', () => {
    const g = buildGoals({ ...base, settings: { ...S, toeicGoal: 800 }, progress: { done: {}, toeic: { '2026-10-01': 600, '2026-11-01': 700 } } }).find((x) => x.id === 'toeic')!;
    expect(g).toMatchObject({ value: '700 / 800', pct: 88 });
    expect(buildGoals({ ...base, settings: { ...S, toeicGoal: 800 }, progress: { done: {}, toeic: { a: 900 } } }).find((x) => x.id === 'toeic')!.pct).toBe(100);
  });
  it('les domaines inactifs n\'apparaissent pas (front, lecture) ; MIAGE et Java toujours', () => {
    const ids = buildGoals(base).map((g) => g.id);
    expect(ids).toEqual(expect.arrayContaining(['miage', 'java']));
    expect(ids).not.toContain('front'); expect(ids).not.toContain('lecture');
    expect(buildGoals({ ...base, settings: { ...S, frontMin: 45, lectureMin: 20 } }).map((g) => g.id)).toEqual(expect.arrayContaining(['front', 'lecture']));
    expect(ids).not.toContain('cloud'); expect(ids).not.toContain('archi');
    expect(buildGoals({ ...base, settings: { ...S, cloudMin: 30, archiMin: 30 } }).map((g) => g.id)).toEqual(expect.arrayContaining(['cloud', 'archi']));
  });
  it('tous les pourcentages sont entre 0 et 100', () => {
    buildGoals({ ...base, settings: { ...S, weightGoal: 80, toeicGoal: 800, frontMin: 10, lectureMin: 10 }, days: { '2026-11-05': { weight: 70, pages: 999, sleep: { bed: '22:00', wake: '07:00' } } } })
      .forEach((g) => { expect(g.pct, g.id).toBeGreaterThanOrEqual(0); expect(g.pct, g.id).toBeLessThanOrEqual(100); });
  });
});
