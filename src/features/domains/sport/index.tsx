import { JOURSL, lastDays } from '@/core/dates';
import { BackLink, PageHead } from '@/components/PageHead';
import { Bar } from '@/components/Bar';
import { BlockRow } from '@/components/BlockRow';
import { DomainCard } from '@/components/DomainCard';
import { Strip14 } from '@/components/Strip14';
import { DOM } from '@/domain/domains';
import { SPORT, SPORT_WEEK } from '@/domain/sport';
import { useClock } from '@/hooks/useClock';
import { usePlan } from '@/hooks/usePlan';
import { useData } from '@/state/DataContext';
import type { DomainModule } from '../types';

/** Séances de sport cochées sur les 7 derniers jours. */
function useSessions(): number {
  const { state } = useData();
  const { today } = useClock();
  return lastDays(7, today).filter((d) => state.days[d]?.done?.sport).length;
}

function Card() {
  const sessions = useSessions();
  return <DomainCard id="sport" stat={`${sessions} / 6 séances sur 7 jours`}><Bar pct={(sessions / 6) * 100} domain="sport" /></DomainCard>;
}

function Page() {
  const { today, now } = useClock();
  const { state } = useData();
  const { plan } = usePlan(today);
  const sessions = useSessions();
  const blocks = plan.blocks.filter((x) => x.domain === 'sport');
  const kind = blocks[0]?.sport;
  const session = kind ? SPORT[kind] : null;
  return (
    <>
      <BackLink to="/domains" label="Domaines" /><PageHead eyebrow="Domaine" title={DOM.sport.name} />
      <section className="card"><div className="sectionhead"><h2>Cette semaine</h2><span className="mono muted">{sessions} / 6</span></div><Bar pct={(sessions / 6) * 100} domain="sport" /><p className="muted" style={{ marginTop: 10 }}>Six séances : pousser, tirer, jambes, deux fois. Les jambes passent en priorité, sans charge lourde sur le bas du dos.</p></section>
      <section className="tl">{blocks.length ? blocks.map((x) => <BlockRow key={x.id} block={x} date={today} today={today} now={now} />) : <p className="muted">Pas de séance aujourd'hui.</p>}</section>
      {session && (
        <section className="card"><h2>{session.name}</h2><p className="muted" style={{ margin: '4px 0 8px' }}>{session.sub}</p>
          {session.ex.map((e) => <div className="ex" key={e[0]}><b>{e[0]}</b><span className="mono muted">{e[1]}</span></div>)}
          <div className="ex"><b>Finisher : corde à sauter</b><span className="mono muted">3 × 2 min</span></div>
          <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>Adapte les exercices et les charges à ton programme habituel.</p>
        </section>
      )}
      <section className="card"><h2>Programme de la semaine</h2>
        <div style={{ marginTop: 6 }}>
          {[1, 2, 3, 4, 5, 6, 0].map((w) => { const k = SPORT_WEEK[w]; return <div className="row" key={w} style={{ padding: '10px 0', borderTop: '1px solid var(--line)' }}><span>{JOURSL[w][0].toUpperCase() + JOURSL[w].slice(1)}</span><span className="muted">{k ? SPORT[k].name : 'Repos (Chabbat)'}</span></div>; })}
        </div>
      </section>
      <section className="card"><h2>14 derniers jours</h2><div style={{ marginTop: 12 }}><Strip14 today={today} on={(d) => !!state.days[d]?.done?.sport} domain="sport" /></div></section>
    </>
  );
}

export const sport: DomainModule = { id: 'sport', Card, Page };
