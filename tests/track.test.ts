import type { MiageTask } from '@/content/types';
import { subjectTracks } from '@/domain/track';

const t = (id: string, due: string, s = 'dl'): MiageTask => ({ id, s, k: 'daily', t: id, d: '', due, h: 0.5 });
const TODAY = '2026-11-10';
const mk = (n: number) => Array.from({ length: n }, (_, i) => t('a' + i, '2026-11-0' + (1 + (i % 9))));
const doneFirst = (tasks: MiageTask[], k: number) => ({ done: Object.fromEntries(tasks.slice(0, k).map((x) => [x.id, true])) });

describe('sur la bonne voie ?', () => {
  it('tout fait : à jour', () => {
    const tasks = mk(10);
    expect(subjectTracks(tasks, doneFirst(tasks, 10), TODAY).dl).toMatchObject({ planned: 10, done: 10, late: 0, status: 'a-jour' });
  });
  it('seuils : 90 % à jour, en dessous en retard, sous 60 % retard important', () => {
    const tasks = mk(10);
    expect(subjectTracks(tasks, doneFirst(tasks, 9), TODAY).dl.status).toBe('a-jour');
    expect(subjectTracks(tasks, doneFirst(tasks, 8), TODAY).dl.status).toBe('retard');
    expect(subjectTracks(tasks, doneFirst(tasks, 6), TODAY).dl.status).toBe('retard');
    expect(subjectTracks(tasks, doneFirst(tasks, 5), TODAY).dl.status).toBe('grand-retard');
    expect(subjectTracks(tasks, doneFirst(tasks, 0), TODAY)).toMatchObject({ dl: { late: 10, status: 'grand-retard' } });
  });
  it('seules les tâches prévues jusqu\'à aujourd\'hui comptent ; les futures faites donnent de l\'avance', () => {
    const tasks = [...mk(4), t('f1', '2026-11-20'), t('f2', '2026-11-21'), t('f3', '2026-11-22'), t('f4', '2026-11-23')];
    const progress = { done: { a0: true, a1: true, a2: true, a3: true, f1: true, f2: true, f3: true } };
    const r = subjectTracks(tasks, progress, TODAY).dl;
    expect(r).toMatchObject({ planned: 4, done: 4, ahead: 3, status: 'avance' });
  });
  it('deux tâches d\'avance ne suffisent pas pour être « en avance »', () => {
    const tasks = [...mk(4), t('f1', '2026-11-20'), t('f2', '2026-11-21')];
    expect(subjectTracks(tasks, { done: { a0: true, a1: true, a2: true, a3: true, f1: true, f2: true } }, TODAY).dl.status).toBe('a-jour');
  });
  it('les tâches abandonnées sont exclues', () => {
    const tasks = mk(10);
    const r = subjectTracks(tasks, doneFirst(tasks, 5), TODAY, new Set(tasks.slice(5).map((x) => x.id))).dl;
    expect(r).toMatchObject({ planned: 5, done: 5, status: 'a-jour' });
  });
  it('une matière sans tâche prévue encore : à jour', () => {
    expect(subjectTracks([t('x', '2027-01-01', 'qa')], { done: {} }, TODAY).qa).toMatchObject({ planned: 0, status: 'a-jour' });
  });
  it('les matières sont indépendantes', () => {
    const tasks = [t('d1', '2026-11-01', 'dl'), t('q1', '2026-11-01', 'qa')];
    const r = subjectTracks(tasks, { done: { d1: true } }, TODAY);
    expect(r.dl.status).toBe('a-jour'); expect(r.qa.status).toBe('grand-retard');
  });
});
