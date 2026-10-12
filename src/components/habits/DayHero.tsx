import { hours } from '@/core/format';
import { useRoll } from '@/hooks/useRoll';

export interface DayHeroProps {
  pct: number; doneMin: number; plannedMin: number; doneCount: number; total: number;
  workMin: number; tripMin: number; streak: number; calm: boolean;
}

/** Message direct selon ce qu'il reste à faire ; le soir, le ton se calme. */
function heroMessage(left: number, calm: boolean): string {
  if (left === 0) return 'Journée bouclée. Bravo.';
  if (left <= 2) return `Plus que ${left}. Tu y es.`;
  return calm ? `Encore ${left}. Finis tranquille.` : `Encore ${left}. On y va.`;
}

/** Héros de l'écran Aujourd'hui : grand anneau dégradé, pourcentage qui défile, temps fait/prévu et série en cours. */
export function DayHero(p: DayHeroProps) {
  const shown = useRoll(p.pct);
  const r = 54, c = 2 * Math.PI * r;
  return (
    <section className="card dayhero" aria-label="Avancement du jour">
      <div className="ring" role="img" aria-label={`${p.pct} % de la journée faite`}>
        <svg viewBox="0 0 132 132" aria-hidden="true">
          <defs><linearGradient id="dayring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffb02e" /><stop offset="1" stopColor="#ff4d6d" /></linearGradient></defs>
          <circle className="tr" cx="66" cy="66" r={r} />
          <circle className="pg" cx="66" cy="66" r={r} strokeDasharray={`${(c * Math.min(100, p.pct)) / 100} ${c}`} />
        </svg>
        <div className="num"><b>{shown}%</b><span>{hours(p.doneMin)} / {hours(p.plannedMin)}</span></div>
      </div>
      <div className="txt">
        <b>{p.doneCount} / {p.total} faites</b>
        <span className="muted">{heroMessage(p.total - p.doneCount, p.calm)}</span>
        <span className="muted herosub">{hours(p.doneMin)} sur {hours(p.plannedMin)} pour toi · travail {hours(p.workMin)} · trajets {hours(p.tripMin)}</span>
        {p.streak >= 1 && <span className="streak"><span className="flame" aria-hidden="true">{p.streak >= 100 ? '🔥🔥' : '🔥'}</span> {p.streak} jour{p.streak > 1 ? 's' : ''} d'affilée</span>}
      </div>
    </section>
  );
}
