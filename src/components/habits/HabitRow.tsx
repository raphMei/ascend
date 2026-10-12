import { useState } from 'react';
import { addDays, type ISODate } from '@/core/dates';
import { dur, hm } from '@/core/format';
import { emojiFor } from '@/domain/habit-meta';
import type { Block } from '@/domain/types';
import { haptic, tickSound } from '@/hooks/feedback';
import { useCardGestures } from '@/hooks/useCardGestures';
import { useTick } from '@/hooks/useTick';
import { startBlockTimer, timerKey } from '@/hooks/useTimer';
import { useData } from '@/state/DataContext';
import { BlockEditor } from '../BlockEditor';
import { Checkbox } from '../Checkbox';
import { HowTo } from '../HowTo';
import { dc } from '../Icon';
import { showUndo } from '../UndoToast';
import { sparks } from '../fx/sparks';
import { FocusTimer } from './FocusTimer';
import { HabitMenu } from './HabitMenu';

/** Une habitude dans la liste du jour : carte de verre, emoji, titre, horaire, série 🔥, grande case ronde.
    Case ou balayage vers la droite = fait (la couleur du domaine envahit la carte), balayage vers la gauche = passer,
    appui long (ou bouton « Options ») = menu, toucher le titre = détail. */
export function HabitRow({ block: b, date, streak, now, tag }: { block: Block; date: ISODate; streak: number; now: number; tag?: string | null }) {
  const tick = useTick();
  const { state, settings, setDay, setProgress } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [menu, setMenu] = useState(false);
  const isNow = b.start <= now && now < b.end;
  const interactive = b.checkable && !b.blocked;
  const expandable = !!(b.detail || b.res?.length || b.checkable);
  const key = timerKey(date, b);
  const meta = { block: b, date };
  const target = b.scope === 'prog' ? { scope: 'prog' as const, key: b.taskId! } : { scope: 'day' as const, key: b.id };

  const markDone = (v: boolean) => {
    tick(date, target, v, b);
    if (v) { haptic(12); tickSound(!!settings.ui?.sound); sparks(g.ref.current?.querySelector('.cb') ?? null); }
  };
  const skip = () => {
    setDay(date, { edits: { skip: { [b.id]: true } } });
    showUndo(`« ${b.title} » passée`, () => setDay(date, { edits: { skip: { [b.id]: null } } }));
  };
  const postpone = () => {
    const id = b.taskId!, before = state.progress.pins?.[id] ?? null;
    setProgress({ pins: { [id]: addDays(date, 1) } });
    showUndo(`« ${b.title} » reportée à demain`, () => setProgress({ pins: { [id]: before } }));
  };
  const g = useCardGestures({ enabled: interactive, canDone: interactive && !b.done, onDone: () => markDone(true), onSkip: skip, onMenu: () => { haptic(8); setMenu(true); } });

  const canTimer = interactive && !b.done && b.end - b.start >= 10;
  const actions = {
    timer: canTimer ? () => { startBlockTimer(key, b.end - b.start, Date.now(), meta); setOpen(true); } : undefined,
    edit: interactive ? () => setEditing(true) : undefined,
    postpone: interactive && b.scope === 'prog' && b.domain === 'miage' && b.taskId && !b.done ? postpone : undefined,
    skip: interactive && !b.done ? skip : undefined
  };
  const hasMenu = Object.values(actions).some(Boolean);

  return (
    <div className="habit-swipe" ref={g.ref} style={dc(b.domain)} {...g.handlers}>
      {interactive && <><div className="habit-under r" aria-hidden="true">Fait ✓</div><div className="habit-under l" aria-hidden="true">Passer</div></>}
      <div className={['habit', b.done && 'done', !b.checkable && 'info', isNow && 'now', b.blocked && 'blocked'].filter(Boolean).join(' ')}>
        <span className="habit-fill" aria-hidden="true" />
        <span className="habit-ico" aria-hidden="true">{emojiFor(b)}</span>
        <button type="button" className="habit-main" aria-expanded={expandable ? open : undefined} onClick={() => expandable && setOpen(!open)} disabled={!expandable}>
          <span className="habit-title">{b.title}{b.cont && <span className="muted" style={{ fontWeight: 400 }}> (suite)</span>}</span>
          <span className="habit-sub">{tag && <span className="ltag">{tag}</span>}{hm(b.start)} · {dur(b.end - b.start)}{b.sub ? ` · ${b.sub}` : ''}</span>
        </button>
        {streak >= 2 && <span className="habit-streak" title={`${streak} jours d'affilée`} aria-label={`${streak} jours d'affilée`}><span className="flame" aria-hidden="true">🔥</span> {streak}</span>}
        {b.checkable ? <Checkbox big checked={b.done} onChange={markDone} domain={b.domain} label={b.title} /> : null}
        {open && (
          <div className="habit-more">
            {(b.detail || b.res?.length) && <HowTo text={b.detail} res={b.res} />}
            {b.checkable && b.end - b.start >= 10 && <FocusTimer id={key} minutes={b.end - b.start} done={b.done} onComplete={() => markDone(true)} meta={meta} />}
            {interactive && <button type="button" className="btn small" onClick={() => setEditing(true)} aria-label={`Modifier ${b.title}`}>✎ Modifier l'horaire</button>}
            {hasMenu && <button type="button" className="btn small" onClick={() => setMenu(true)} aria-label={`Options de ${b.title}`}>⋯ Options</button>}
          </div>
        )}
      </div>
      {menu && <HabitMenu block={b} actions={actions} onClose={() => setMenu(false)} />}
      {editing && <BlockEditor block={b} date={date} onClose={() => setEditing(false)} />}
    </div>
  );
}
