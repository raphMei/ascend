import { PageHead } from '@/components/PageHead';
import { DOMAIN_MODULES } from './registry';

export function DomainsScreen() {
  return (
    <>
      <PageHead eyebrow="Mes domaines" title="Où je progresse" />
      <div className="grid three">{DOMAIN_MODULES.map(({ id, Card }) => <Card key={id} />)}</div>
    </>
  );
}
