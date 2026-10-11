import { useState } from 'react';
import type { ISODate } from '@/core/dates';
import { groupProgress, type BlockGroup } from '@/domain/groups';
import { dc } from '../Icon';
import { HabitRow } from './HabitRow';

const KEY = 'ascend-collapsed';
const read = (): string[] => { try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; } };
const write = (v: string[]) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* stockage indisponible : on ignore */ } };

/** Un groupe de la liste (Matin, Productivité…) : en-tête repliable avec avancement, puis les habitudes. L'état replié est mémorisé sur l'appareil.
    `now` : minute courante si le jour affiché est aujourd'hui, sinon -1 (aucun créneau « en cours »). */
export function GroupSection({ group, date, streaks, now }: { group: BlockGroup; date: ISODate; streaks: Record<string, number>; now: number }) {
  const [collapsed, setCollapsed] = useState(() => read().includes(group.id));
  const { done, total } = groupProgress(group);
  const toggle = () => { const next = !collapsed; setCollapsed(next); const cur = read().filter((x) => x !== group.id); write(next ? [...cur, group.id] : cur); };
  const complete = total > 0 && done === total;
  return (
    <section className={'group' + (complete ? ' complete' : '')} style={dc(group.color)} aria-label={group.name}>
      <button type="button" className="group-head" aria-expanded={!collapsed} onClick={toggle}>
        <span className="group-ico" aria-hidden="true">{group.emoji}</span>
        <span className="group-name">{group.name}</span>
        <span className="group-count">{total > 0 ? (complete ? '✓ ' : '') + `${done}/${total}` : `${group.blocks.length}`}</span>
        <span className="chev" aria-hidden="true">{collapsed ? '›' : '⌄'}</span>
      </button>
      {total > 0 && <div className="group-bar" aria-hidden="true"><i style={{ width: `${(done / total) * 100}%` }} /></div>}
      {!collapsed && <div className="group-body">{group.blocks.map((b) => <HabitRow key={b.id + b.start} block={b} date={date} streak={streaks[b.id] ?? 0} now={now} />)}</div>}
    </section>
  );
}

