import { JOURS, dow, type ISODate } from '@/core/dates';
import { hours } from '@/core/format';
import { DOM } from '@/domain/domains';
import type { DomainId } from '@/domain/types';

export interface DayAmount { d: ISODate; pl: number; done: Record<string, number> }

/** Heures accomplies par jour, empilées par domaine, sur fond « prévu ». */
export function StackedBars({ rows, today }: { rows: DayAmount[]; today: ISODate }) {
  const W = 640, H = 190, pl = 6, pb = 24, pt = 14, bw = (W - pl * 2) / rows.length;
  const max = Math.max(120, ...rows.map((r) => Math.max(r.pl, Object.values(r.done).reduce((a, b) => a + b, 0))));
  const y = (m: number) => H - pb - (m / max) * (H - pb - pt);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Heures accomplies par jour et par domaine">
      {[0, 0.5, 1].map((f) => <g key={f}><line className="gl" x1="0" x2={W} y1={y(max * f)} y2={y(max * f)} /><text x="0" y={y(max * f) - 3}>{hours(max * f)}</text></g>)}
      {rows.map((r, i) => {
        const x = pl + i * bw + bw * 0.18, w = bw * 0.64;
        let acc = 0;
        return (
          <g key={r.d}>
            {r.pl > 0 && <rect x={x} y={y(r.pl)} width={w} height={H - pb - y(r.pl)} rx="6" fill="var(--surface2)" />}
            {Object.keys(r.done).map((k) => {
              const m = r.done[k]; if (!m) return null;
              const y0 = acc; acc += m;
              return <rect key={k} x={x} y={y(y0 + m)} width={w} height={Math.max(0, y(y0) - y(y0 + m))} rx="3" fill={`var(${DOM[k as DomainId] ? DOM[k as DomainId].c : '--muted'})`} />;
            })}
            <text x={x + w / 2} y={H - 6} textAnchor="middle" style={r.d === today ? { fill: 'var(--ink)', fontWeight: 500 } : undefined}>{r.d === today ? 'auj.' : JOURS[dow(r.d)].replace('.', '')}</text>
          </g>
        );
      })}
    </svg>
  );
}
