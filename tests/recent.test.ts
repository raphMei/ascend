import { recentLearning } from '@/domain/recent';
import { genericTasks } from './fixtures';
import { DEFAULT_SETTINGS } from '@/domain/settings';

const tasks = genericTasks(DEFAULT_SETTINGS);

describe('derniers apprentissages', () => {
  it('vide sans rien de terminé, ou sans date de fin connue', () => {
    expect(recentLearning({ done: {} }, tasks)).toEqual([]);
    expect(recentLearning({ done: { p1t1: true } }, tasks)).toEqual([]);
  });
  it('les plus récents d\'abord, tous parcours et cours MIAGE confondus, limités à n', () => {
    const progress = { done: { p1t1: true, f1t1: true, c1t1: true, a1t1: true, 'dl:u1': true }, doneAt: { p1t1: '2026-11-01', f1t1: '2026-11-03', c1t1: '2026-11-02', a1t1: '2026-11-04', 'dl:u1': '2026-10-30' } };
    const r = recentLearning(progress, tasks, 4);
    expect(r.map((x) => x.id)).toEqual(['a1t1', 'f1t1', 'c1t1', 'p1t1']);
    expect(r.map((x) => x.domain)).toEqual(['archi', 'front', 'cloud', 'java']);
    expect(r[0].to).toBe('/dom/archi/a1');
  });
  it('ignore la mise en place et l\'organisation, garde les tâches de cours', () => {
    const doneAt = { 'dl:s1': '2026-11-02', 'o:nuit': '2026-11-02', 'd:2026-10-08': '2026-11-01' };
    const r = recentLearning({ done: { 'dl:s1': true, 'o:nuit': true, 'd:2026-10-08': true }, doneAt }, tasks);
    expect(r.map((x) => x.id)).not.toContain('dl:s1');
    expect(r.map((x) => x.id)).not.toContain('o:nuit');
  });
});
