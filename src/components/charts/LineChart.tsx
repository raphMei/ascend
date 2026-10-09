export interface Point { x: string; y: number | null }

/** Courbe avec objectif optionnel en pointillés. Les valeurs nulles interrompent le tracé. */
export function LineChart({ points, color = '--accent', goal, label = 'Courbe' }: { points: Point[]; color?: string; goal?: number; label?: string }) {
  const W = 640, H = 170, pl = 34, pb = 22, pt = 12, pr = 8;
  const vals = points.map((p) => p.y).filter((v): v is number => v != null);
  if (vals.length < 2) return <p className="muted">Pas encore assez de mesures. Ajoute-en quelques-unes et la courbe apparaîtra.</p>;
  let lo = Math.min(...vals, goal ?? Infinity), hi = Math.max(...vals, goal ?? -Infinity);
  if (hi - lo < 1) { hi += 0.5; lo -= 0.5; }
  const padv = (hi - lo) * 0.15; lo -= padv; hi += padv;
  const X = (i: number) => pl + (i * (W - pl - pr)) / Math.max(1, points.length - 1);
  const Y = (v: number) => H - pb - ((v - lo) / (hi - lo)) * (H - pb - pt);
  let d = '', pen = false;
  points.forEach((p, i) => { if (p.y == null) { pen = false; return; } d += (pen ? 'L' : 'M') + X(i) + ' ' + Y(p.y) + ' '; pen = true; });
  const stroke = `var(${color})`;
  const ticks = [0, Math.floor((points.length - 1) / 2), points.length - 1];
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      {[lo + padv, (lo + hi) / 2, hi - padv].map((v) => <g key={v}><line className="gl" x1={pl} x2={W - pr} y1={Y(v)} y2={Y(v)} /><text x="0" y={Y(v) + 4}>{(Math.round(v * 10) / 10).toString().replace('.', ',')}</text></g>)}
      {goal != null && <line x1={pl} x2={W - pr} y1={Y(goal)} y2={Y(goal)} stroke={stroke} strokeDasharray="5 5" opacity=".7" />}
      <path d={d} fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => p.y != null && <circle key={i} cx={X(i)} cy={Y(p.y)} r="3.5" fill={stroke} />)}
      {ticks.map((i, k) => <text key={k} x={X(i)} y={H - 5} textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}>{points[i].x}</text>)}
    </svg>
  );
}
