/* Oubli d'une séance : le réajustement doit replacer ce qui n'a pas été fait, dans l'ordre du cours, sans jamais déborder. */
import { dow } from '@/core/dates';
import { FULL_TASKS } from '@/content/miage/full';
import { MAX_DAY_MIN, buildSchedule, type Schedule } from '@/domain/schedule';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { adjustedTasks } from '@/domain/task-schedule';

const S = DEFAULT_SETTINGS;
const tasks = adjustedTasks(S, FULL_TASKS);
const minutes = (id: string) => { const t = tasks.find((x) => x.id === id)!; return Math.max(15, Math.round(t.h * 60)); };
const run = (today: string, done: Record<string, boolean> = {}, now = 360): Schedule => buildSchedule({ tasks, progress: { done }, settings: S, days: {}, today, now })!;
/** Même ordre que le planificateur : échéance d'origine, puis numéro de séance. */
const natural = (a: string, b: string) => a.localeCompare(b, 'fr', { numeric: true });
const chain = (s: Schedule, done: Record<string, boolean> = {}) => {
  const bySubject = new Map<string, typeof tasks>();
  for (const t of tasks) if (/^[a-z]+:[ur]\d/.test(t.id) && !done[t.id] && s.dayOf[t.id]) (bySubject.get(t.s) ?? bySubject.set(t.s, []).get(t.s)!).push(t);
  return [...bySubject.values()].flatMap((list) => {
    const seq = [...list].sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : natural(a.id, b.id)));
    return seq.slice(1).filter((t, i) => s.dayOf[t.id] < s.dayOf[seq[i].id]).map((t) => t.id);
  });
};

describe('oubli d\'une séance : réajustement sur le vrai contenu', () => {
  const start = run('2026-10-13');
  it('au départ, aucune séance n\'est placée avant celle qui la précède dans sa matière, et rien le samedi', () => {
    expect(chain(start)).toEqual([]);
    Object.values(start.dayOf).forEach((d) => expect(dow(d), d).not.toBe(6));
  });

  it('deux jours sans rien faire : le retard est repris à partir d\'aujourd\'hui, dans l\'ordre du cours', () => {
    const s = run('2026-10-15');
    const late = tasks.filter((t) => t.due < '2026-10-15' && t.k !== 'exam');
    expect(late.length).toBeGreaterThan(0);
    late.forEach((t) => { expect(s.dayOf[t.id], t.id).toBeDefined(); expect(s.dayOf[t.id] >= '2026-10-15', t.id).toBe(true); });
    expect(chain(s)).toEqual([]);
    expect(s.changes.filter((c) => c.reason === 'retard').length).toBe(late.length);
  });

  it('ce qui était prévu et a été fait n\'est jamais replacé, et rien de plus n\'est déclaré en retard', () => {
    const planned = Object.entries(start.dayOf).filter(([, d]) => d <= '2026-10-14').map(([id]) => id);
    const done = Object.fromEntries(planned.map((id) => [id, true]));
    const s = run('2026-10-15', done);
    planned.forEach((id) => expect(s.dayOf[id], id).toBeUndefined());
    // Seules sont « en retard » les tâches que le planning de départ avait déjà repoussées après le 14 : rien de ce qui était prévu et fait.
    s.changes.filter((c) => c.reason === 'retard').forEach((c) => expect(start.dayOf[c.taskId] > '2026-10-14', c.taskId).toBe(true));
    expect(chain(s, done)).toEqual([]);
  });

  it('jamais plus que la place d\'un jour, plafond de la journée compris', () => {
    const s = run('2026-10-15');
    const used: Record<string, number> = {};
    for (const [id, d] of Object.entries(s.dayOf)) if (tasks.find((t) => t.id === id)!.k !== 'exam') used[d] = (used[d] ?? 0) + minutes(id);
    for (const [d, m] of Object.entries(used)) { expect(m, d).toBeLessThanOrEqual(Math.max(s.capacity[d], 0) + 60); expect(m, d).toBeLessThanOrEqual(MAX_DAY_MIN + 60); }
  });

  it('en fin de soirée il ne reste presque rien d\'aujourd\'hui : le retard passe au lendemain', () => {
    const s = run('2026-10-15', {}, 21 * 60);
    const today = Object.keys(s.dayOf).filter((id) => s.dayOf[id] === '2026-10-15').reduce((a, id) => a + minutes(id), 0);
    expect(today).toBeLessThanOrEqual(Math.max(s.capacity['2026-10-15'], 15));
  });

  it('déterministe : mêmes données, même réajustement', () => {
    expect(JSON.stringify(run('2026-10-15'))).toBe(JSON.stringify(run('2026-10-15')));
  });

  it('une séance laissée tomber disparaît du planning et ne bloque pas la suivante', () => {
    const first = tasks.find((t) => /^[a-z]+:u1$/.test(t.id))!;
    const second = tasks.find((t) => t.s === first.s && /:u1\.2$|:u2/.test(t.id))!;
    const s = buildSchedule({ tasks, progress: { done: {}, pins: { [first.id]: 'skip' } }, settings: S, days: {}, today: '2026-10-13', now: 360 })!;
    expect(s.dayOf[first.id]).toBeUndefined(); expect(s.dropped).toContain(first.id);
    expect(s.dayOf[second.id]).toBeDefined();
  });
});
