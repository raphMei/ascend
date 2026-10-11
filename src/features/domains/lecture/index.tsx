import { JOURS, dow, lastDays } from '@/core/dates';
import { DOM } from '@/domain/domains';
import { Bar } from '@/components/Bar';
import { BlockRow } from '@/components/BlockRow';
import { CommitInput } from '@/components/CommitInput';
import { DomainCard } from '@/components/DomainCard';
import { BackLink, PageHead } from '@/components/PageHead';
import { Strip14 } from '@/components/Strip14';
import { BarsChart } from '@/components/charts/BarsChart';
import { useClock } from '@/hooks/useClock';
import { usePlan } from '@/hooks/usePlan';
import { useData } from '@/state/DataContext';
import type { DomainModule } from '../types';
import { DisabledNotice } from '../shared/DisabledNotice';

function usePages(n: number): number[] {
  const { state } = useData();
  const { today } = useClock();
  return lastDays(n, today).map((d) => state.days[d]?.pages ?? 0);
}

function Card() {
  const { settings } = useData();
  const week = usePages(7).reduce((a, b) => a + b, 0);
  return <DomainCard id="lecture" stat={settings.lectureMin >= 5 || week ? `${week} pages sur 7 jours` : 'Pas encore activé'}>{week > 0 && <Bar pct={Math.min(100, (week / 140) * 100)} domain="lecture" />}</DomainCard>;
}

function Page() {
  const { today, now } = useClock();
  const { state, settings, setDay, setSettings } = useData();
  const { plan } = usePlan(today);
  const blocks = plan.blocks.filter((b) => b.domain === 'lecture');
  const pages14 = usePages(14), pages30 = usePages(30);
  const total30 = pages30.reduce((a, b) => a + b, 0);
  const dates = lastDays(14, today);
  return (
    <>
      <BackLink to="/domains" label="Domaines" /><PageHead eyebrow="Domaine" title={DOM.lecture.name} />
      {settings.lectureMin < 5 && <DisabledNotice what="la séance de lecture" />}
      {blocks.length > 0 && <section className="tl">{blocks.map((b) => <BlockRow key={b.id} block={b} date={today} today={today} now={now} />)}</section>}
      <section className="card"><h2>Aujourd'hui</h2>
        <div className="fields" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 10 }}>
          <label className="f">Livre en cours<CommitInput type="text" value={settings.livre} placeholder="Titre" onCommit={(v) => setSettings({ livre: String(v ?? '') })} /></label>
          <label className="f">Pages lues aujourd'hui<CommitInput type="number" min={0} step={1} value={state.days[today]?.pages} onCommit={(v) => setDay(today, { pages: v })} /></label>
        </div>
        <div className="kpis" style={{ marginTop: 14 }}>
          <div className="kpi"><b>{total30}</b><span>pages sur 30 jours</span></div>
          <div className="kpi"><b>{Math.round(total30 / 30)}</b><span>pages par jour</span></div>
          <div className="kpi"><b>{pages30.filter((p) => p > 0).length}</b><span>jours de lecture</span></div>
        </div>
      </section>
      <section className="card"><h2>Pages par jour</h2><p className="muted" style={{ margin: '4px 0 8px' }}>14 derniers jours</p>
        <BarsChart items={dates.map((d, i) => ({ x: JOURS[dow(d)].slice(0, 2), y: pages14[i] || null }))} color="--c-lecture" label="Pages lues" /></section>
      <section className="card"><h2>14 derniers jours</h2><div style={{ marginTop: 12 }}><Strip14 today={today} on={(d) => (state.days[d]?.pages ?? 0) > 0 || !!state.days[d]?.done?.lecture} domain="lecture" /></div></section>
    </>
  );
}

export const lecture: DomainModule = { id: 'lecture', Card, Page };
