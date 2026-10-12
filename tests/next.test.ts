import { nextBlock } from '@/domain/next';
import { momentOf } from '@/domain/moment';
import type { Block } from '@/domain/types';

const b = (id: string, start: number, end: number, extra: Partial<Block> = {}): Block => ({ id, title: id, start, end, domain: 'matin', checkable: true, done: false, fixed: false, scope: 'day', ...extra } as Block);

describe('prochaine action', () => {
  const blocks = [b('a', 360, 400), b('b', 420, 480), b('c', 600, 660)];
  it('la tâche en cours en premier', () => expect(nextBlock(blocks, 430)).toMatchObject({ kind: 'now', block: { id: 'b' } }));
  it('sinon la prochaine à venir', () => expect(nextBlock(blocks, 500)).toMatchObject({ kind: 'next', block: { id: 'c' } }));
  it('sinon la première encore à faire, en retard', () => expect(nextBlock(blocks, 900)).toMatchObject({ kind: 'late', block: { id: 'a' } }));
  it('un autre jour que aujourd\'hui : la première à faire', () => expect(nextBlock(blocks, -1)).toMatchObject({ kind: 'next', block: { id: 'a' } }));
  it('ignore ce qui est fait, bloqué ou non cochable', () => {
    const l = [b('a', 360, 400, { done: true }), b('i', 420, 480, { checkable: false }), b('x', 500, 560, { blocked: true }), b('d', 600, 660)];
    expect(nextBlock(l, 380)).toMatchObject({ block: { id: 'd' } });
  });
  it('tout est fait : rien', () => expect(nextBlock([b('a', 360, 400, { done: true })], 380)).toBeNull());
});

describe('moment de la journée', () => {
  it('matin avant 12 h, après-midi jusqu\'à 19 h, soir ensuite', () => {
    expect(momentOf(0)).toBe('matin'); expect(momentOf(719)).toBe('matin');
    expect(momentOf(720)).toBe('apres'); expect(momentOf(1139)).toBe('apres');
    expect(momentOf(1140)).toBe('soir'); expect(momentOf(1439)).toBe('soir');
  });
});
