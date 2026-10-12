import { useEffect, useRef, useState } from 'react';
import type { ISODate } from '@/core/dates';
import { groupProgress, type BlockGroup } from '@/domain/groups';
import { haptic, tickSound } from '@/hooks/feedback';
import { useData } from '@/state/DataContext';
import { dc } from '../Icon';
import { sparks } from '../fx/sparks';
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
  const { settings } = useData();
  const [pulse, setPulse] = useState(false);
  const wasComplete = useRef(complete);
  const tile = useRef<HTMLSpanElement>(null);
  // Quand le dernier élément du groupe est fait : le groupe pulse, étincelles et vibration (jamais au chargement).
  useEffect(() => {
    if (complete && !wasComplete.current) {
      setPulse(true); haptic([20, 40, 20]); tickSound(!!settings.ui?.sound, 1100); sparks(tile.current, 22);
      const id = setTimeout(() => setPulse(false), 1400);
      wasComplete.current = complete;
      return () => clearTimeout(id);
    }
    wasComplete.current = complete;
  }, [complete, settings.ui?.sound]);
  return (
    <section className={'group' + (complete ? ' complete' : '') + (pulse ? ' pulse' : '')} style={dc(group.color)} aria-label={group.name}>
      <button type="button" className="group-head" aria-expanded={!collapsed} onClick={toggle}>
        <span className="group-ico" aria-hidden="true" ref={tile}>{group.emoji}</span>
        <span className="group-name">{group.name}</span>
        <span className="group-count">{total > 0 ? (complete ? '✓ ' : '') + `${done}/${total}` : `${group.blocks.length}`}</span>
        <span className="chev" aria-hidden="true">{collapsed ? '›' : '⌄'}</span>
      </button>
      {total > 0 && <div className="group-bar" aria-hidden="true"><i style={{ width: `${(done / total) * 100}%` }} /></div>}
      {!collapsed && <div className="group-body">{group.blocks.map((b) => <HabitRow key={b.id + b.start} block={b} date={date} streak={streaks[b.id] ?? 0} now={now} />)}</div>}
    </section>
  );
}

