import { Link } from 'react-router-dom';
import { JOURS, addDays, dow, type ISODate } from '@/core/dates';
import { useClock } from '@/hooks/useClock';
import { usePlan } from '@/hooks/usePlan';
import { useData } from '@/state/DataContext';

/** Les 7 jours de la semaine (lundi → dimanche) : anneau d'avancement, jour affiché en surbrillance, un toucher pour y aller. */
export function WeekStrip({ date }: { date: ISODate }) {
  const { today } = useClock();
  const { state } = useData();
  const live = usePlan(today).stats.pct;
  const monday = addDays(date, -((dow(date) + 6) % 7));
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  return (
    <nav className="week" aria-label="Semaine">
      {days.map((d) => {
        const pct = d === today ? live : d < today ? state.days[d]?.stats?.pct : undefined;
        const r = 15, c = 2 * Math.PI * r;
        return (
          <Link key={d} to={d === today ? '/today' : `/today/${d}`} className={'wd' + (d === date ? ' on' : '') + (d === today ? ' today' : '')} aria-current={d === date ? 'date' : undefined} aria-label={`${JOURS[dow(d)]} ${+d.slice(8)}${pct != null ? `, ${pct} % fait` : ''}`}>
            <span className="l">{JOURS[dow(d)].slice(0, 1).toUpperCase()}</span>
            <span className="ring" aria-hidden="true">
              <svg viewBox="0 0 36 36"><circle cx="18" cy="18" r={r} fill="none" stroke="var(--surface2)" strokeWidth="4" />
                {pct != null && pct > 0 && <circle cx="18" cy="18" r={r} fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(c * Math.min(100, pct)) / 100} ${c}`} transform="rotate(-90 18 18)" />}
              </svg>
              <b>{+d.slice(8)}</b>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
