import { JOURS, dow, fmtLong } from '@/core/dates';
import type { HeatCell } from '@/domain/habit-stats';

const level = (pct: number | null): 0 | 1 | 2 | 3 | 4 => (pct == null ? 0 : pct >= 90 ? 4 : pct >= 70 ? 3 : pct >= 40 ? 2 : 1);

/** Calendrier de chaleur : une colonne par semaine (lundi en haut), une case par jour. L'intensité = avancement du jour. */
export function Heatmap({ weeks }: { weeks: HeatCell[][] }) {
  const labels = [1, 2, 3, 4, 5, 6, 0].map((w) => JOURS[w].slice(0, 1).toUpperCase());
  return (
    <div className="heat" role="group" aria-label="Calendrier des 12 dernières semaines">
      <div className="heat-days" aria-hidden="true">{labels.map((l, i) => <span key={i}>{l}</span>)}</div>
      <div className="heat-grid">
        {weeks.map((w) => (
          <div className="heat-col" key={w[0].date}>
            {[1, 2, 3, 4, 5, 6, 0].map((wd) => {
              const c = w.find((x) => dow(x.date) === wd)!;
              const text = c.future ? 'à venir' : c.pct == null ? 'pas de donnée' : `${c.pct} %`;
              return <span key={c.date} className={`heat-cell l${level(c.pct)}${c.future ? ' future' : ''}`} role="img" aria-label={`${fmtLong(c.date)} : ${text}`} title={`${fmtLong(c.date)} : ${text}`} />;
            })}
          </div>
        ))}
      </div>
      <div className="heat-legend" aria-hidden="true"><span>moins</span>{[0, 1, 2, 3, 4].map((l) => <i key={l} className={`heat-cell l${l}`} />)}<span>plus</span></div>
    </div>
  );
}
