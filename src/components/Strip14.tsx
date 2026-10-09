import { JOURS, dow, lastDays, type ISODate } from '@/core/dates';
import { dc } from './Icon';

/** Frise des 14 derniers jours : un carré plein quand `on(date)` est vrai. */
export function Strip14({ today, on, domain }: { today: ISODate; on: (d: ISODate) => boolean; domain: string }) {
  return (
    <div className="days7" style={{ gridTemplateColumns: 'repeat(14,1fr)', gap: 4, ...dc(domain) }}>
      {lastDays(14, today).map((d) => <div key={d}><i className={on(d) ? 'on' : ''} />{JOURS[dow(d)].slice(0, 1).toUpperCase()}</div>)}
    </div>
  );
}
