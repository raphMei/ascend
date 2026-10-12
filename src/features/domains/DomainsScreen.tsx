import { Link } from 'react-router-dom';
import { PageHead } from '@/components/PageHead';
import { DOMAIN_MODULES } from './registry';

/** Domaines de suivi personnel (santé, routine, finances) : accessibles, mais en retrait : le cœur d'Ascend est l'apprentissage. */
const PERSONAL = new Set(['matin', 'sport', 'alim', 'sommeil', 'finances']);

export function DomainsScreen() {
  const learning = DOMAIN_MODULES.filter((d) => !PERSONAL.has(d.id));
  const personal = DOMAIN_MODULES.filter((d) => PERSONAL.has(d.id));
  return (
    <>
      <PageHead eyebrow="Mes domaines" title="Où je progresse" />
      <Link to="/month" className="card" style={{ textDecoration: 'none', display: 'block' }}>
        <div className="sectionhead"><h2>Mon mois</h2><span className="muted">Régler →</span></div>
        <p className="muted" style={{ marginTop: 4 }}>Choisis l'intensité de chaque domaine d'apprentissage pour ce mois : le planning de tous les jours s'adapte.</p>
      </Link>
      <div className="grid three">{learning.map(({ id, Card }) => <Card key={id} />)}</div>
      <details className="card flat">
        <summary><b>Mes suivis personnels</b> <span className="muted">· routine, sport, repas, sommeil, finances</span></summary>
        <p className="muted" style={{ margin: '6px 0 12px' }}>Ce sont des temps réservés dans ton planning : rien à cocher ici. Les mesures (poids, eau, nuit) restent saisissables pour tes graphiques.</p>
        <div className="grid three">{personal.map(({ id, Card }) => <Card key={id} />)}</div>
      </details>
    </>
  );
}
