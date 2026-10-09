import { Link } from 'react-router-dom';
import { JKIND, PHASES, phaseById } from '@/content/java/path';
import type { JavaTask } from '@/content/types';
import { DOM } from '@/domain/domains';
import { jStats, phaseStats } from '@/domain/progress';
import { BackLink, PageHead } from '@/components/PageHead';
import { Bar } from '@/components/Bar';
import { Checkbox } from '@/components/Checkbox';
import { DomainCard } from '@/components/DomainCard';
import { dc } from '@/components/Icon';
import { useClock } from '@/hooks/useClock';
import { useTick } from '@/hooks/useTick';
import { useData } from '@/state/DataContext';
import type { DomainModule } from '../types';

function Card() {
  const { state } = useData();
  const js = jStats(state.progress);
  return <DomainCard id="java" stat={`${js.level} · ${js.pct}%`}><Bar pct={js.pct} domain="java" /></DomainCard>;
}

function StepRow({ t, done, today }: { t: JavaTask; done: boolean; today: string }) {
  const tick = useTick();
  return (
    <div className={'item' + (done ? ' done' : '')}>
      <Checkbox checked={done} onChange={(v) => tick(today, { scope: 'prog', key: t.id }, v)} domain="java" label={t.t} />
      <div>
        <div className="t">{t.t}</div>
        <div className="sub"><span className="chip">{JKIND[t.k] ?? t.k}</span>{t.u && <a className="chip" href={t.u} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Ressource ↗</a>}</div>
      </div>
    </div>
  );
}

function PhasePage({ id }: { id: string }) {
  const { state } = useData();
  const { today } = useClock();
  const p = phaseById[id], ps = phaseStats(p, state.progress);
  return (
    <>
      <BackLink to="/dom/java" label="Parcours Java" /><PageHead eyebrow={`Phase ${p.n} sur 14 · ${p.hours} h`} title={p.title} />
      <section className="card"><p>{p.goal}</p><div style={{ marginTop: 12 }}><Bar pct={(100 * ps.d) / ps.n} domain="java" /></div><p className="muted" style={{ marginTop: 8 }}>{ps.d} / {ps.n} étapes{p.core ? ' · fait partie du socle' : ''}</p></section>
      <section className="card"><div className="list">{p.tasks.map((t) => <StepRow key={t.id} t={t} done={!!state.progress.done[t.id]} today={today} />)}</div></section>
    </>
  );
}

function Page({ sub }: { sub?: string }) {
  const { state } = useData();
  if (sub && phaseById[sub]) return <PhasePage id={sub} />;
  const js = jStats(state.progress);
  const next = js.next ? 'Prochain statut : ' + js.next + '.' : 'Parcours terminé. Bravo.';
  return (
    <>
      <BackLink to="/domains" label="Domaines" /><PageHead eyebrow="Domaine" title={DOM.java.name} />
      <section className="card"><div className="sectionhead"><h2>{js.level}</h2><span className="mono muted">{js.pct}%</span></div><Bar pct={js.pct} domain="java" /><p className="muted" style={{ marginTop: 10 }}>{next} Socle : {js.coreDone} / {js.core} phases terminées.</p></section>
      <section className="grid">
        {PHASES.map((p) => {
          const ps = phaseStats(p, state.progress);
          return (
            <Link key={p.id} className="go" style={dc('java')} to={`/dom/java/${p.id}`}>
              <div><div style={{ fontWeight: 700 }}>{p.n}. {p.title}</div><div className="muted" style={{ fontSize: 14 }}>{ps.d} / {ps.n} étapes · {p.hours} h{p.core ? ' · socle' : ''}{ps.status === 'done' ? ' · terminée' : ''}</div></div>
              <span className="arrow">›</span><Bar pct={(100 * ps.d) / ps.n} domain="java" />
            </Link>
          );
        })}
      </section>
    </>
  );
}

export const java: DomainModule = { id: 'java', Card, Page };
