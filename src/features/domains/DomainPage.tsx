import { Navigate, useParams } from 'react-router-dom';
import { findDomain } from './registry';

/** Route /dom/:id/:sub? → page du domaine ; domaine inconnu → liste des domaines. */
export function DomainPage() {
  const { id, sub } = useParams();
  const mod = findDomain(id);
  if (!mod) return <Navigate to="/domains" replace />;
  return <mod.Page sub={sub} />;
}
