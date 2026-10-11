import { Link } from 'react-router-dom';
import { PageHead } from '@/components/PageHead';
import { DOMAIN_MODULES } from './registry';

export function DomainsScreen() {
  return (
    <>
      <PageHead eyebrow="Mes domaines" title="Où je progresse" />
      <Link to="/month" className="card" style={{ textDecoration: 'none', display: 'block' }}>
        <div className="sectionhead"><h2>Mon mois</h2><span className="muted">Régler →</span></div>
        <p className="muted" style={{ marginTop: 4 }}>Choisis l'intensité de chaque domaine pour ce mois : le planning de tous les jours s'adapte.</p>
      </Link>
      <div className="grid three">{DOMAIN_MODULES.map(({ id, Card }) => <Card key={id} />)}</div>
    </>
  );
}
