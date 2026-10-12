import { hours } from '@/core/format';

/** Petites barres : minutes apprises par semaine, la plus récente à droite. */
export function Spark({ values, label }: { values: readonly number[]; label: string }) {
  const max = Math.max(60, ...values);
  const total = values.reduce((a, b) => a + b, 0);
  return (
    <div className="spark" role="img" aria-label={`${label} : ${hours(total)} sur ${values.length} semaines`}>
      {values.map((v, i) => <i key={i} style={{ height: `${Math.max(6, (v / max) * 100)}%`, opacity: v ? 0.55 + 0.45 * (i / (values.length - 1)) : 0.18 }} />)}
    </div>
  );
}
