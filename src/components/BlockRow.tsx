import { fmtShort, type ISODate } from '@/core/dates';
import { dur, hm } from '@/core/format';
import { DOM } from '@/domain/domains';
import type { Block } from '@/domain/types';
import { useTick } from '@/hooks/useTick';
import { Checkbox } from './Checkbox';
import { HowTo } from './HowTo';
import { dc } from './Icon';

/** Un créneau de la frise du jour. `date` = jour affiché ; `today`/`now` servent à repérer le créneau en cours. */
export function BlockRow({ block: b, date, today, now }: { block: Block; date: ISODate; today: ISODate; now: number }) {
  const tick = useTick();
  const isNow = date === today && now >= b.start && now < b.end;
  const cls = ['blk', b.fixed && 'fixed', b.done && 'done', isNow && 'now', b.blocked && 'blocked'].filter(Boolean).join(' ');
  const onChange = (v: boolean) => tick(date, b.scope === 'prog' ? { scope: 'prog', key: b.taskId! } : { scope: 'day', key: b.id }, v);
  return (
    <div className={cls}>
      <div className="time">{hm(b.start)}<small>{dur(b.end - b.start)}</small></div>
      <div className="body" style={dc(b.domain)}>
        <div><div className="title">{b.title}{b.cont && <span className="muted" style={{ fontWeight: 400 }}> (suite)</span>}</div></div>
        {b.checkable ? <Checkbox checked={b.done} onChange={onChange} domain={b.domain} label={b.title} /> : <span />}
        <div className="meta">
          {isNow && <span className="tag-now">Maintenant</span>}
          <span className="chip dot" style={dc(b.domain)}>{DOM[b.domain].name}</span>
          {b.sub && <span>{b.sub}</span>}
          {b.due && b.due < date && <span className="chip" style={{ color: 'var(--c-sport)' }}>En retard · prévu {fmtShort(b.due)}</span>}
        </div>
        {b.detail && <div className="how"><HowTo text={b.detail} link={b.link} /></div>}
      </div>
    </div>
  );
}
