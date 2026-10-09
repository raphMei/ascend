import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { DOM } from '@/domain/domains';
import type { DomainId } from '@/domain/types';
import { Icon, dc } from './Icon';

/** Carte d'un domaine dans « Mes domaines ». */
export function DomainCard({ id, stat, children }: { id: DomainId; stat: string; children?: ReactNode }) {
  const d = DOM[id];
  return (
    <Link className="domcard" style={dc(id)} to={`/dom/${id}`}>
      <div className="ico"><Icon name={d.ico} /></div>
      <h3>{d.name}</h3>
      <p className="muted" style={{ fontSize: 15 }}>{d.blurb}</p>
      <div className="stat">{stat}</div>
      {children}
    </Link>
  );
}
