import { BackLink, PageHead } from '@/components/PageHead';
import { BlockRow } from '@/components/BlockRow';
import { DomainCard } from '@/components/DomainCard';
import { Strip14 } from '@/components/Strip14';
import { DOM } from '@/domain/domains';
import { useClock } from '@/hooks/useClock';
import { usePlan } from '@/hooks/usePlan';
import { useData } from '@/state/DataContext';
import type { DomainModule } from '../types';

function Card() {
  const { today } = useClock();
  const { plan } = usePlan(today);
  const routine = plan.blocks.filter((b) => b.domain === 'matin' && b.checkable);
  return <DomainCard id="matin" stat={routine.length ? `${routine.filter((b) => b.done).length} / ${routine.length} aujourd'hui` : "Pas de routine aujourd'hui"} />;
}

function Page() {
  const { today, now } = useClock();
  const { state } = useData();
  const { plan } = usePlan(today);
  const blocks = plan.blocks.filter((b) => b.domain === 'matin');
  const rate = (d: string) => { const s = state.days[d]?.stats; return s && s.planned?.matin ? (s.done?.matin ?? 0) / s.planned.matin : 0; };
  return (
    <>
      <BackLink to="/domains" label="Domaines" /><PageHead eyebrow="Domaine" title={DOM.matin.name} />
      <section className="card"><p>Le matin décide du reste de la journée. Quatre gestes, 75 minutes, avant tout écran.</p></section>
      <section className="tl">{blocks.length ? blocks.map((b) => <BlockRow key={b.id} block={b} date={today} today={today} now={now} />) : <p className="muted">Pas de routine aujourd'hui (Chabbat).</p>}</section>
      <section className="card"><h2>14 derniers jours</h2><p className="muted" style={{ margin: '4px 0 12px' }}>Un carré plein = au moins 70% de la routine faite.</p><Strip14 today={today} on={(d) => rate(d) >= 0.7} domain="matin" /></section>
    </>
  );
}

export const matin: DomainModule = { id: 'matin', Card, Page };
