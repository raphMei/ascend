import { useState } from 'react';
import type { ISODate } from '@/core/dates';
import { dur, hm } from '@/core/format';
import { emojiFor } from '@/domain/habit-meta';
import type { Block } from '@/domain/types';
import { useTick } from '@/hooks/useTick';
import { BlockEditor } from '../BlockEditor';
import { Checkbox } from '../Checkbox';
import { HowTo } from '../HowTo';
import { dc } from '../Icon';

/** Une habitude dans la liste du jour : emoji, titre, horaire, série 🔥, grande case ronde. Un toucher sur le titre déplie le détail. */
export function HabitRow({ block: b, date, streak, now }: { block: Block; date: ISODate; streak: number; now: number }) {
  const tick = useTick();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const isNow = b.start <= now && now < b.end;
  const onChange = (v: boolean) => {
    tick(date, b.scope === 'prog' ? { scope: 'prog', key: b.taskId! } : { scope: 'day', key: b.id }, v);
    if (v) try { navigator.vibrate?.(12); } catch { /* pas de vibration sur cet appareil */ }
  };
  const expandable = !!(b.detail || b.checkable);
  return (
    <div className={['habit', b.done && 'done', !b.checkable && 'info', isNow && 'now', b.blocked && 'blocked'].filter(Boolean).join(' ')} style={dc(b.domain)}>
      <span className="habit-ico" aria-hidden="true">{emojiFor(b)}</span>
      <button type="button" className="habit-main" aria-expanded={expandable ? open : undefined} onClick={() => expandable && setOpen(!open)} disabled={!expandable}>
        <span className="habit-title">{b.title}{b.cont && <span className="muted" style={{ fontWeight: 400 }}> (suite)</span>}</span>
        <span className="habit-sub">{hm(b.start)} · {dur(b.end - b.start)}{b.sub ? ` · ${b.sub}` : ''}</span>
      </button>
      {streak >= 2 && <span className="habit-streak" title={`${streak} jours d'affilée`} aria-label={`${streak} jours d'affilée`}>🔥 {streak}</span>}
      {b.checkable ? <Checkbox big checked={b.done} onChange={onChange} domain={b.domain} label={b.title} /> : null}
      {open && (
        <div className="habit-more">
          {b.detail && <HowTo text={b.detail} link={b.link} />}
          {!b.blocked && b.checkable && <button type="button" className="btn small" onClick={() => setEditing(true)} aria-label={`Modifier ${b.title}`}>✎ Modifier l'horaire</button>}
        </div>
      )}
      {editing && <BlockEditor block={b} date={date} onClose={() => setEditing(false)} />}
    </div>
  );
}
