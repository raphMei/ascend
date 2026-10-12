import type { ISODate } from '@/core/dates';
import { dur, hm } from '@/core/format';
import { emojiFor } from '@/domain/habit-meta';
import type { Next } from '@/domain/next';
import { haptic, tickSound } from '@/hooks/feedback';
import { useTick } from '@/hooks/useTick';
import { startBlockTimer, timerKey } from '@/hooks/useTimer';
import { useData } from '@/state/DataContext';
import { dc } from '../Icon';
import { sparks } from '../fx/sparks';

const LABEL = { now: 'Maintenant', next: 'À suivre', late: 'En retard' } as const;

/** Grande carte « Maintenant » : la tâche en cours (ou la prochaine) avec « Fait » et « Démarrer » (le minuteur). */
export function NextCard({ next, date }: { next: Next; date: ISODate }) {
  const tick = useTick();
  const { settings } = useData();
  const b = next.block;
  const target = b.scope === 'prog' ? { scope: 'prog' as const, key: b.taskId! } : { scope: 'day' as const, key: b.id };
  const canTimer = b.end - b.start >= 10;
  return (
    <section className={'card nextcard k-' + next.kind} style={dc(b.domain)} aria-label="Prochaine action">
      <span className="pill">{LABEL[next.kind]}</span>
      <div className="nm"><span aria-hidden="true">{emojiFor(b)}</span> {b.title}</div>
      <div className="row">
        <span className="muted">{hm(b.start)} · {dur(b.end - b.start)}{b.sub ? ` · ${b.sub}` : ''}</span>
        <span className="acts">
          <button type="button" className="btn" onClick={(e) => { tick(date, target, true, b); haptic(12); tickSound(!!settings.ui?.sound); sparks(e.currentTarget, 14); }}>Fait</button>
          {canTimer && <button type="button" className="btn main" onClick={() => { startBlockTimer(timerKey(date, b), b.end - b.start, Date.now(), { block: b, date }); haptic(8); }}>▶ Démarrer</button>}
        </span>
      </div>
    </section>
  );
}
