import { emojiFor } from '@/domain/habit-meta';
import { planDay } from '@/domain/planner';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { habitStreaks } from '@/domain/streaks';
import { genericTasks } from './fixtures';
import type { DayData } from '@/domain/types';

const S = DEFAULT_SETTINGS;
const tasks = genericTasks(S);
const plan = (date: string, day?: DayData, settings = S) => planDay({ date, settings, progress: { done: {} }, day, today: '2026-10-01', tasks });

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
