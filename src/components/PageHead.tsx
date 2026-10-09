import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

/** En-tête de page : sur-titre, titre, contenu complémentaire. */
export function PageHead({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return <header className="pagehead"><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{children}</header>;
}

export function BackLink({ to, label }: { to: string; label: string }) {
  return <Link className="back" to={to}>← {label}</Link>;
}
