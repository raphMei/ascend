import { dow, range } from '@/core/dates';
import { englishExerciseFor } from '@/content/english';
import { FRONT_PHASES, FRONT_TASKS, FRONT_LEVELS, FRONT_HOURS } from '@/content/front/path';
import { financeKey, habitItems, isFirstSunday } from '@/domain/habits';
import { planDay } from '@/domain/planner';
import { pathStats } from '@/domain/progress';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { dayStats } from '@/domain/stats';
import { genericTasks } from './fixtures';
import type { Progress, Settings } from '@/domain/types';

const tasks = genericTasks(DEFAULT_SETTINGS);
const ON: Settings = { ...DEFAULT_SETTINGS, anglaisMin: 20, lectureMin: 20, frontMin: 45, projetsMin: 30, financesMin: 30, livre: 'Dune' };
const plan = (date: string, S: Settings, progress: Progress = { done: {} }) => planDay({ date, settings: S, progress, day: undefined, today: '2026-10-13', tasks });

describe('domaines optionnels', () => {
  it('désactivés par défaut : aucun bloc ajouté', () => {
    expect(habitItems('2026-10-13', DEFAULT_SETTINGS, { done: {} })).toEqual([]);
  });

  it('activés : un bloc par domaine, avec sa durée, cochable', () => {
    const p = plan('2026-10-14', ON);   // mercredi, télétravail
    for (const [id, min] of [['anglais', 20], ['lecture', 20], ['front', 45], ['projets', 30]] as const) {
      const mine = p.blocks.filter((b) => b.id === id);
      expect(mine.reduce((a, b) => a + b.end - b.start, 0), id).toBe(min);
      expect(mine[0].checkable).toBe(true);
    }
    expect(p.blocks.find((b) => b.id === 'lecture')!.sub).toBe('Dune');
  });

  it('le point finances n\'apparaît que le premier dimanche du mois', () => {
    const sundays = range('2026-10-08', '2027-02-28').filter((d) => dow(d) === 0);
    sundays.forEach((d) => expect(plan(d, ON).blocks.some((b) => b.id === 'fin-point'), d).toBe(isFirstSunday(d)));
    expect(isFirstSunday('2026-11-01')).toBe(true); expect(isFirstSunday('2026-11-08')).toBe(false);
  });

  it('le point finances se coche via la progression du mois', () => {
    const p = plan('2026-11-01', ON, { done: { [financeKey('2026-11', 'point')]: true } });
    expect(p.blocks.find((b) => b.id === 'fin-point')!.done).toBe(true);
  });

  it('jamais de bloc cochable pendant Chabbat, domaines activés', () => {
    for (const d of range('2026-10-08', '2027-02-28')) {
      const p = plan(d, ON);
      p.blocks.forEach((b) => {
        if (p.sh && dow(d) === 6 && b.checkable) expect(b.start, `${d} ${b.id}`).toBeGreaterThanOrEqual(p.sh.havdalah);
        if (p.sh && dow(d) === 5 && b.checkable) expect(b.end, `${d} ${b.id}`).toBeLessThanOrEqual(p.sh.candle);
      });
    }
  });

  it('les domaines passent avant Java : Java prend le temps restant', () => {
    const off = plan('2026-10-14', DEFAULT_SETTINGS), on = plan('2026-10-14', ON);
    const java = (p: ReturnType<typeof plan>) => p.blocks.filter((b) => b.id === 'java').reduce((a, b) => a + b.end - b.start, 0);
    expect(java(on)).toBeLessThanOrEqual(java(off));
    expect(dayStats(on).planned.anglais).toBe(20);
  });

  it('projets : affiche la prochaine action du premier projet actif', () => {
    const progress: Progress = { done: {}, projects: { a: { name: 'Site client', next: 'Maquette de l\'accueil', status: 'actif', minutes: 0, created: '2026-10-01' }, b: null } };
    const b = plan('2026-10-14', ON, progress).blocks.find((x) => x.id === 'projets')!;
    expect(b.sub).toBe('Site client'); expect(b.detail).toContain('Maquette de l\'accueil');
  });

  it('anglais : l\'exercice tourne sur quatre jours', () => {
    const names = range('2026-10-08', '2026-10-15').map((d) => englishExerciseFor(d)[0]);
    expect(new Set(names.slice(0, 4)).size).toBe(4);
    expect(names[4]).toBe(names[0]);
  });
});

describe('parcours dev front', () => {
  it('9 phases, identifiants stables, niveaux', () => {
    expect(FRONT_PHASES).toHaveLength(9);
    expect(FRONT_TASKS[0].id).toBe('f1t1');
    expect(new Set(FRONT_TASKS.map((t) => t.id)).size).toBe(FRONT_TASKS.length);
    expect(pathStats(FRONT_PHASES, FRONT_LEVELS, FRONT_HOURS, { done: {} }).level).toBe('Pas commencé');
    expect(pathStats(FRONT_PHASES, FRONT_LEVELS, FRONT_HOURS, { done: { f1t1: true } }).level).toBe('Démarrage');
  });
  it('terminer tout le parcours donne le dernier niveau et 100 %', () => {
    const all = Object.fromEntries(FRONT_TASKS.map((t) => [t.id, true]));
    const s = pathStats(FRONT_PHASES, FRONT_LEVELS, FRONT_HOURS, { done: all });
    expect(s.level).toBe('Dev front confirmé'); expect(s.pct).toBe(100); expect(s.next).toBeNull();
  });
  it('le niveau monte avec les phases terminées', () => {
    const doneUpTo = (n: number) => ({ done: Object.fromEntries(FRONT_PHASES.slice(0, n).flatMap((p) => p.tasks.map((t) => [t.id, true]))) });
    const lv = (n: number) => FRONT_LEVELS.indexOf(pathStats(FRONT_PHASES, FRONT_LEVELS, FRONT_HOURS, doneUpTo(n)).level);
    for (let n = 1; n < 9; n++) expect(lv(n)).toBeGreaterThanOrEqual(lv(n - 1));
  });
  it('les liens sont des adresses https', () => {
    FRONT_TASKS.flatMap((t) => t.res).forEach((r) => expect(r.url).toMatch(/^https:\/\//));
  });
});
