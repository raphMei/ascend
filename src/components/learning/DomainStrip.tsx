import { Link } from 'react-router-dom';
import { DOM } from '@/domain/domains';
import { LEVEL_LABEL } from '@/domain/month';
import { useOverviews } from '@/hooks/useOverviews';
import { Bar } from '../Bar';
import { dc } from '../Icon';

/** Cartes des domaines actifs, à faire défiler : avancement, retard éventuel, prochaine leçon. Un toucher ouvre le domaine. */
export function DomainStrip() {
  const list = useOverviews().filter((o) => o.active && o.pct !== null);
  if (!list.length) return null;
  return (
    <section aria-label="Mes domaines">
      <div className="sectionhead"><h2 style={{ fontSize: 18 }}>Mes domaines</h2><Link to="/domains" className="muted">Tout voir →</Link></div>
      <div className="dstrip">
        {list.map((o) => (
          <Link key={o.id} to={`/dom/${o.id}`} className="dcard" style={dc(o.id)}>
            <b>{DOM[o.id].name}</b>
            <span className={o.late ? 'late' : 'muted'}>{o.late ? `En retard de ${o.late}` : o.level ? LEVEL_LABEL[o.level] : 'À jour'}</span>
            <Bar pct={o.pct ?? 0} domain={o.id} />
            <span className="muted">{o.pct}%{o.next ? ` · ${o.next}` : ''}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
