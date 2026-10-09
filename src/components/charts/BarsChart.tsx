export interface Bar { x: string; y: number | null }

/** Barres par jour avec ligne d'objectif ; les barres sous 85 % de l'objectif sont atténuées. */
export function BarsChart({ items, color = '--accent', goal, goalLabel, label = 'Barres' }: { items: Bar[]; color?: string; goal?: number; goalLabel?: string; label?: string }) {
  const W = 640, H = 170, pl = 6, pb = 22, pt = 14, bw = (W - pl * 2) / items.length;
  const max = Math.max(goal || 0, ...items.map((i) => i.y || 0), 1) * 1.1;
  const Y = (v: number) => H - pb - (v / max) * (H - pb - pt);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      <line className="gl" x1="0" x2={W} y1={Y(0)} y2={Y(0)} />
      {items.map((it, i) => {
        const x = pl + i * bw + bw * 0.2, w = bw * 0.6;
        return (
          <g key={i}>
            {it.y != null && <rect x={x} y={Y(it.y)} width={w} height={Y(0) - Y(it.y)} rx="5" fill={`var(${color})`} opacity={goal && it.y < goal * 0.85 ? 0.55 : 1} />}
            <text x={x + w / 2} y={H - 6} textAnchor="middle">{it.x}</text>
          </g>
        );
      })}
      {goal ? <><line x1="0" x2={W} y1={Y(goal)} y2={Y(goal)} stroke="var(--ink)" strokeDasharray="5 5" opacity=".55" /><text x={W} y={Y(goal) - 4} textAnchor="end">objectif {goalLabel ?? goal}</text></> : null}
    </svg>
  );
}
