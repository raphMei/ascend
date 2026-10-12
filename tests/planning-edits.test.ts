import { hm } from '@/core/format';
import { groupSmallBlocks } from '@/domain/small-blocks';
import { planDay } from '@/domain/planner';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { dayStats } from '@/domain/stats';
import { genericTasks } from './fixtures';
import type { Block, DayData } from '@/domain/types';

const tasks = genericTasks(DEFAULT_SETTINGS);
const plan = (date: string, day?: DayData) => planDay({ date, settings: DEFAULT_SETTINGS, progress: { done: {} }, day, today: '2026-10-13', tasks });
const TUE = '2026-10-13';

describe('édition libre du planning', () => {
  it('sans modification : plan identique, pas de champ « skipped »', () => {
    const p = plan(TUE);
    expect(p.skipped).toBeUndefined();
    expect(JSON.stringify(plan(TUE, { edits: {} }))).toBe(JSON.stringify(p));
  });

  it('déplace un bloc libre', () => {
    const before = plan(TUE).blocks.find((b) => b.id === 'sport')!;
    const p = plan(TUE, { edits: { move: { sport: { start: 1200, end: 1260 } } } });
    const b = p.blocks.find((x) => x.id === 'sport')!;
    expect([b.start, b.end]).toEqual([1200, 1260]);
    expect(before.start).not.toBe(1200);
    expect(hm(b.start)).toBe('20:00');
  });

  it('passe un bloc : il sort du plan et des statistiques, et reste listé dans « skipped »', () => {
    const full = dayStats(plan(TUE));
    const first = plan(TUE).blocks.find((b) => b.checkable)!;
    const p = plan(TUE, { edits: { skip: { [first.id]: true } } });
    expect(p.blocks.some((b) => b.id === first.id)).toBe(false);
    expect(p.skipped?.map((b) => b.id)).toEqual([first.id]);
    expect(dayStats(p).pl).toBe(full.pl - (first.end - first.start));
  });

  it('un « skip » ou « move » annulé (null) n\'a aucun effet', () => {
    const p = plan(TUE, { edits: { skip: { sport: null }, move: { sport: null } } });
    expect(JSON.stringify(p)).toBe(JSON.stringify(plan(TUE)));
  });

  it('ajoute un bloc, cochable et comptabilisé ; supprimé quand null', () => {
    const extra = { a1: { title: 'Dentiste', start: 1230, end: 1260, domain: 'autre' as const } };
    const p = plan(TUE, { edits: { extra } });
    const b = p.blocks.find((x) => x.id === 'x:a1')!;
    expect(b).toMatchObject({ title: 'Dentiste', checkable: true, domain: 'autre' });
    expect(dayStats(plan(TUE, { edits: { extra }, done: { 'x:a1': true } })).done.autre).toBe(30);
    expect(plan(TUE, { edits: { extra: { a1: null } } }).blocks.some((x) => x.id === 'x:a1')).toBe(false);
  });

  it('prévient quand un bloc modifié chevauche un autre, sans bloquer', () => {
    const p = plan(TUE, { edits: { extra: { a1: { title: 'Réunion', start: 540, end: 600, domain: 'autre' as const } } } });
    expect(p.warnings.some((w) => w.includes('Réunion') && w.includes('chevauche'))).toBe(true);
    expect(p.blocks.some((b) => b.id === 'x:a1')).toBe(true);
  });

  it('prévient quand un bloc tombe pendant Chabbat', () => {
    const p = plan('2026-11-06', { edits: { extra: { a1: { title: 'Courses', start: 1200, end: 1230, domain: 'autre' as const } } } });
    expect(p.warnings.some((w) => w.includes('Chabbat'))).toBe(true);
  });

  it('ne permet pas de passer ni déplacer un bloc de Chabbat', () => {
    const p = plan('2026-11-06', { edits: { skip: { 'chabbat-ven': true }, move: { 'chabbat-ven': { start: 0, end: 10 } } } });
    const b = p.blocks.find((x) => x.id === 'chabbat-ven')!;
    expect(b.end).toBe(1440); expect(b.start).toBeGreaterThan(900);
  });
});

describe('regroupement des petites tâches', () => {
  const mk = (id: string, start: number, end: number, domain: Block['domain'] = 'miage', checkable = true): Block => ({ id, start, end, title: id, domain, fixed: false, checkable, done: false });
  it('regroupe les blocs MIAGE courts qui s\'enchaînent (≥ 2)', () => {
    const items = groupSmallBlocks([mk('a', 0, 15), mk('b', 15, 30), mk('c', 30, 45), mk('d', 60, 120, 'sport')]);
    expect(items.map((i) => i.kind)).toEqual(['group', 'block']);
    expect(items[0].kind === 'group' && items[0].blocks.map((b) => b.id)).toEqual(['a', 'b', 'c']);
  });
  it('ne regroupe pas avec une pause, un bloc long ou un autre domaine', () => {
    expect(groupSmallBlocks([mk('a', 0, 15), mk('b', 20, 35)]).every((i) => i.kind === 'block')).toBe(true);
    expect(groupSmallBlocks([mk('a', 0, 45), mk('b', 45, 60)]).every((i) => i.kind === 'block')).toBe(true);
    expect(groupSmallBlocks([mk('a', 0, 15, 'java'), mk('b', 15, 30, 'java')]).every((i) => i.kind === 'block')).toBe(true);
  });
  it('conserve l\'ordre et tous les blocs', () => {
    const blocks = [mk('a', 0, 15), mk('b', 15, 30), mk('x', 30, 100, 'sport'), mk('c', 100, 115)];
    const flat = groupSmallBlocks(blocks).flatMap((i) => (i.kind === 'group' ? i.blocks : [i.block]));
    expect(flat.map((b) => b.id)).toEqual(['a', 'b', 'x', 'c']);
  });
});
