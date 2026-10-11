import { Link } from 'react-router-dom';
import type { Goal } from '@/domain/goals';
import { dc } from '../Icon';

/** « Objectifs » : où tu en es vers chaque cible. Un toucher ouvre la page du domaine. */
export function GoalsSection({ goals }: { goals: Goal[] }) {
  if (!goals.length) return null;
  return (
    <section className="group goals" style={dc('autre')} aria-label="Objectifs">
      <div className="group-head static">
        <span className="group-ico" aria-hidden="true">🏆</span><span className="group-name">Objectifs</span>
      </div>
      <div className="group-body">
        {goals.map((g) => (
          <Link key={g.id} to={g.to} className="goal" style={dc(g.domain)}>
            <span className="habit-ico" aria-hidden="true">{g.emoji}</span>
            <span className="habit-main"><span className="habit-title">{g.label}</span><span className="habit-sub">{g.value}</span></span>
            <span className="goal-pct" aria-label={`${g.pct} %`}>{g.pct}%</span>
            <span className="goal-bar" aria-hidden="true"><i style={{ width: `${g.pct}%` }} /></span>
          </Link>
        ))}
      </div>
    </section>
  );
}
