import { Link } from 'react-router-dom';
import { hours } from '@/core/format';
import { useRoll } from '@/hooks/useRoll';
import type { WeekDay } from '@/hooks/useWeek';

/** « Ma semaine » : anneau d'avancement des séances de la semaine, séances faites sur prévues, heures apprises sur heures prévues. */
export function WeekCard({ week }: { week: readonly WeekDay[] }) {
  const sessions = week.flatMap((d) => d.plan.blocks.filter((b) => b.checkable));
  const done = sessions.filter((b) => b.done).length;
  const planned = week.reduce((a, d) => a + d.stats.pl, 0), learned = week.reduce((a, d) => a + d.stats.dn, 0);
  const pct = sessions.length ? Math.round((100 * done) / sessions.length) : 0;
  const shown = useRoll(pct);
  const r = 26, c = 2 * Math.PI * r;
  return (
    <Link to="/week" className="card weekcard" aria-label={`Ma semaine : ${done} séances faites sur ${sessions.length}`}>
      <span className="wring" aria-hidden="true">
        <svg viewBox="0 0 64 64"><defs><linearGradient id="wkring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#6aa5ff" /><stop offset="1" stopColor="#c993ff" /></linearGradient></defs>
          <circle cx="32" cy="32" r={r} fill="none" stroke="var(--track)" strokeWidth="7" />
          <circle cx="32" cy="32" r={r} fill="none" stroke="url(#wkring)" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${(c * pct) / 100} ${c}`} transform="rotate(-90 32 32)" /></svg>
        <b>{shown}%</b>
      </span>
      <span className="wk-txt">
        <b>Ma semaine</b>
        <span className="muted">{done} séance{done > 1 ? 's' : ''} faite{done > 1 ? 's' : ''} sur {sessions.length}</span>
        <span className="muted">{hours(learned)} apprises sur {hours(planned)} prévues</span>
      </span>
      <span className="chev" aria-hidden="true">›</span>
    </Link>
  );
}
