/** Anneau de progression (0-100). */
export function Ring({ pct, color }: { pct: number; color: string }) {
  const r = 54, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 132 132" aria-hidden="true">
      <circle cx="66" cy="66" r={r} fill="none" stroke="var(--surface2)" strokeWidth="14" />
      <circle cx="66" cy="66" r={r} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" strokeDasharray={`${(c * pct) / 100} ${c}`} />
    </svg>
  );
}
