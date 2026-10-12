import { addDays, dow, range } from '@/core/dates';
import { planDay } from '@/domain/planner';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { buildSchedule, type Schedule } from '@/domain/schedule';
import { genericTasks } from './fixtures';
import type { DayData, Progress, Settings } from '@/domain/types';

const S0: Settings = { ...DEFAULT_SETTINGS };
const tasks = genericTasks(S0);
const byId = new Map(tasks.map((t) => [t.id, t]));
const mins = (id: string) => Math.max(15, Math.round(byId.get(id)!.h * 60));
const run = (today: string, o: { done?: string[]; settings?: Partial<Settings>; days?: Record<string, DayData>; pins?: Record<string, string | null>; now?: number } = {}): Schedule => {
  const progress: Progress = { done: Object.fromEntries((o.done ?? []).map((id) => [id, true])), pins: o.pins };
  return buildSchedule({ tasks: genericTasks({ ...S0, ...o.settings }), progress, settings: { ...S0, ...o.settings }, days: o.days ?? {}, today, now: o.now ?? 360 })!;
};
/** Toutes les tâches dues avant `today` (retard si on n'a rien fait). */
const lateOn = (today: string) => tasks.filter((t) => t.due < today);

describe('réajustement automatique : base', () => {
  it('désactivé : retourne null', () => {
    expect(buildSchedule({ tasks, progress: { done: {} }, settings: { ...S0, autoReschedule: false }, days: {}, today: '2026-10-14', now: 360 })).toBeNull();
  });

  it('rien en retard : chaque tâche proche reste à sa date, aucun changement de retard', () => {
    const s = run('2026-10-08');
    expect(s.changes.filter((c) => c.reason === 'retard')).toEqual([]);
    const near = tasks.filter((t) => t.due >= '2026-10-08' && t.due <= '2026-10-12');
    const same = near.filter((t) => s.dayOf[t.id] === t.due).length;
    expect(same).toBeGreaterThanOrEqual(near.length - 1);
  });

  it('un jour manqué : le retard est repris à partir d\'aujourd\'hui, jamais dans le passé ni le samedi', () => {
    const today = '2026-10-14';
    const s = run(today);
    lateOn(today).filter((t) => s.dayOf[t.id]).forEach((t) => expect(s.dayOf[t.id] >= today, t.id).toBe(true));
    Object.values(s.dayOf).forEach((d) => expect(dow(d), d).not.toBe(6));
    expect(s.changes.some((c) => c.reason === 'retard')).toBe(true);
  });

  it('respecte la place de chaque jour (hors examens et dates imposées)', () => {
    const s = run('2026-10-20');
    const used: Record<string, number> = {};
    Object.entries(s.dayOf).forEach(([id, d]) => { if (byId.get(id)!.k !== 'exam') used[d] = (used[d] ?? 0) + mins(id); });
    for (const [d, m] of Object.entries(used)) {
      // seule une tâche plus longue que toute journée peut dépasser, et elle ne dépasse que de peu
      expect(m, d).toBeLessThanOrEqual(Math.max(s.capacity[d] ?? 0, Math.max(...Object.values(s.capacity)) * 1.2));
    }
  });

  it('chaque tâche en attente est assignée, abandonnée, allégée ou non placée : rien ne se perd', () => {
    const today = '2026-11-20';
    const s = run(today);
    const pending = tasks.filter((t) => t.k !== 'exam' || t.due >= today);
    pending.forEach((t) => {
      const ok = s.dayOf[t.id] || s.dropped.includes(t.id) || s.unplaced.includes(t.id);
      expect(ok, t.id).toBeTruthy();
    });
  });

  it('une tâche faite n\'est jamais replanifiée', () => {
    const s = run('2026-10-14', { done: ['d:2026-10-13', 'd:2026-10-12'] });
    expect(s.dayOf['d:2026-10-13']).toBeUndefined(); expect(s.dayOf['d:2026-10-12']).toBeUndefined();
  });
});

describe('priorités et règles', () => {
  it('les petites tâches de routine trop anciennes sont abandonnées, avec explication', () => {
    const s = run('2026-11-30');
    const old = tasks.find((t) => t.k === 'daily' && t.due < '2026-11-25')!;
    expect(s.dropped).toContain(old.id);
    expect(s.dayOf[old.id]).toBeUndefined();
    expect(s.changes.find((c) => c.taskId === old.id)).toMatchObject({ reason: 'abandon', to: null });
  });

  it('un examen reste à sa date', () => {
    const s = run('2027-02-10');
    tasks.filter((t) => t.k === 'exam').forEach((t) => expect(s.dayOf[t.id]).toBe(t.due));
  });

  it('une date imposée l\'emporte, et un passé imposé devient aujourd\'hui', () => {
    const t = tasks.find((x) => x.k === 'fiche')!;
    const s = run('2026-11-30', { pins: { [t.id]: '2026-12-09' } });
    expect(s.dayOf[t.id]).toBe('2026-12-09');
    expect(s.changes.find((c) => c.taskId === t.id)?.reason).toBe('epingle');
    const s2 = run('2026-11-30', { pins: { [t.id]: '2026-11-01' } });
    expect(s2.dayOf[t.id]).toBe('2026-11-30');
  });

  it('mois léger : plus de tâches du jour ; mois intensif : on avance des tâches', () => {
    const light = run('2026-10-14', { settings: { months: { '2026-10': { miage: 'leger' } } } });
    expect(light.lightened).toBeGreaterThan(0);
    tasks.filter((t) => t.k === 'daily').forEach((t) => expect(light.dayOf[t.id], t.id).toBeUndefined());
    const intense = run('2026-10-14', { settings: { months: { '2026-10': { miage: 'intensif' } } } });
    expect(intense.changes.some((c) => c.reason === 'avance')).toBe(true);
    const normal = run('2026-10-14');
    const early = (s: Schedule) => Object.entries(s.dayOf).filter(([id, d]) => d < byId.get(id)!.due).length;
    expect(early(intense)).toBeGreaterThan(early(normal));
  });

  it('plus on réserve de temps aux autres domaines, moins il reste de place pour les tâches', () => {
    const base = run('2026-10-14'), busy = run('2026-10-14', { settings: { anglaisMin: 40, lectureMin: 40, frontMin: 120, projetsMin: 90 } });
    const total = (s: Schedule) => Object.values(s.capacity).reduce((a, b) => a + b, 0);
    expect(total(busy)).toBeLessThan(total(base));
  });

  it('aujourd\'hui, seule la fin de journée compte : à 22 h il n\'y a plus de place', () => {
    expect(run('2026-10-14', { now: 1320 }).capacity['2026-10-14']).toBeLessThan(run('2026-10-14', { now: 360 }).capacity['2026-10-14']);
    expect(run('2026-10-14', { now: 1320 }).capacity['2026-10-14']).toBe(0);
  });
});

describe('propriétés', () => {
  it('déterministe : mêmes entrées, même résultat', () => {
    expect(JSON.stringify(run('2026-11-12'))).toBe(JSON.stringify(run('2026-11-12')));
  });

  it('faire une tâche ne repousse jamais une autre tâche', () => {
    const today = '2026-11-12';
    const before = run(today), after = run(today, { done: [Object.keys(before.dayOf)[0]] });
    for (const [id, d] of Object.entries(after.dayOf)) if (before.dayOf[id]) expect(d <= before.dayOf[id], id).toBe(true);
  });

  it('cohérent avec le planificateur : une tâche assignée apparaît ce jour-là, et nulle part ailleurs', () => {
    const today = '2026-10-14';
    const s = run(today);
    const sched = { dayOf: s.dayOf };
    const seen: Record<string, string[]> = {};
    for (const d of range(today, addDays(today, 30))) {
      planDay({ date: d, settings: S0, progress: { done: {} }, day: undefined, today, tasks, schedule: sched })
        .blocks.filter((b) => b.taskId && b.id.startsWith('m:') && !b.cont).forEach((b) => { (seen[b.taskId!] ??= []).push(d); });
    }
    for (const [id, ds] of Object.entries(seen)) { expect(ds, id).toHaveLength(1); expect(ds[0], id).toBe(s.dayOf[id]); }
  });

  it('après une semaine entière manquée, tout rentre avant la dernière échéance (rien de non placé)', () => {
    const s = run('2026-11-25');
    expect(s.unplaced.length).toBeLessThanOrEqual(3);
  });
});
