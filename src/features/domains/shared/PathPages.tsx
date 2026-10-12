/** Pages communes aux parcours en phases (Java, dev front) : vue d'ensemble et détail d'une phase, en chapitres avec liens. */
import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { dur } from '@/core/format';
import { paceForecast } from '@/domain/forecast';
import { pathPace } from '@/domain/calibration';
import { ForecastCard } from '@/components/ForecastCard';
import type { PathStep, Phase } from '@/content/types';
import { STEP_LABEL } from '@/content/labels';
import { phaseStats } from '@/domain/progress';
import { DOM } from '@/domain/domains';
import type { DomainId } from '@/domain/types';
import { Bar } from '@/components/Bar';
import { Checkbox } from '@/components/Checkbox';
import { dc } from '@/components/Icon';
import { BackLink, PageHead } from '@/components/PageHead';
import { ResourceLinks } from '@/components/ResourceLinks';
import { useClock } from '@/hooks/useClock';
import { useTick } from '@/hooks/useTick';
import { useData } from '@/state/DataContext';

export interface PathStats { pct: number; level: string; next: string | null; coreDone: number; core: number; phasesDone: number }

function StepRow({ t, done, today, domain }: { t: PathStep; done: boolean; today: string; domain: DomainId }) {
  const tick = useTick();
  return (
    <div className={'item' + (done ? ' done' : '')}>
      <Checkbox checked={done} onChange={(v) => tick(today, { scope: 'prog', key: t.id }, v)} domain={domain} label={t.t} />
      <div>
        <div className="t">{t.t}</div>
        <div className="sub"><span className="chip">{STEP_LABEL[t.k] ?? t.k}</span><span className="chip">{dur(t.min)}</span></div>
        {t.d && <p className="muted" style={{ fontSize: 14, marginTop: 6 }}>{t.d}</p>}
        <ResourceLinks res={t.res} />
      </div>
    </div>
  );
}

export function PathPhasePage({ domain, phase, total }: { domain: DomainId; phase: Phase; total: number }) {
  const { state } = useData();
  const { today } = useClock();
  const ps = phaseStats(phase, state.progress);
  // Les étapes gardent leur ordre ; un titre de section apparaît quand `g` change.
  let last: string | undefined;
  const rows: ReactNode[] = [];
  phase.tasks.forEach((t) => {
    if (t.g && t.g !== last) rows.push(<div className="stepgroup" key={'g' + t.g + t.id}>{t.g}</div>);
    last = t.g ?? last;
    rows.push(<StepRow key={t.id} t={t} done={!!state.progress.done[t.id]} today={today} domain={domain} />);
  });
  const minutesLeft = phase.tasks.filter((t) => !state.progress.done[t.id]).reduce((a, t) => a + t.min, 0);
  return (
    <>
      <BackLink to={`/dom/${domain}`} label={`Parcours ${DOM[domain].name}`} />
      <PageHead eyebrow={`Phase ${phase.n} sur ${total} · ${phase.hours} h`} title={phase.title} />
      <section className="card"><p>{phase.goal}</p><div style={{ marginTop: 12 }}><Bar pct={(100 * ps.d) / ps.n} domain={domain} /></div>
        <p className="muted" style={{ marginTop: 8 }}>{ps.d} / {ps.n} étapes{phase.core ? ' · fait partie du socle' : ''}{minutesLeft > 0 ? ` · reste environ ${dur(minutesLeft)}` : ''}</p></section>
      <section className="card"><div className="list">{rows.map((r, i) => <Fragment key={i}>{r}</Fragment>)}</div></section>
    </>
  );
}

export function PathOverviewPage({ domain, phases, stats, notice }: { domain: DomainId; phases: Phase[]; stats: PathStats; notice?: ReactNode }) {
  const { state } = useData();
  const { today } = useClock();
  const steps = phases.flatMap((p) => p.tasks);
  const forecast = paceForecast(steps, state.progress, today);
  const pace = domain === 'java' || domain === 'front' ? pathPace(steps, state.days, state.progress, domain, today) : null;
  const next = stats.next ? 'Prochain statut : ' + stats.next + '.' : 'Parcours terminé. Bravo.';
  return (
    <>
      <BackLink to="/domains" label="Domaines" /><PageHead eyebrow="Domaine" title={DOM[domain].name} />
      {notice}
      <section className="card"><div className="sectionhead"><h2>{stats.level}</h2><span className="mono muted">{stats.pct}%</span></div><Bar pct={stats.pct} domain={domain} /><p className="muted" style={{ marginTop: 10 }}>{next} Socle : {stats.coreDone} / {stats.core} phases terminées.</p></section>
      <ForecastCard forecast={forecast} pace={pace} />
      <section className="grid">
        {phases.map((p) => {
          const ps = phaseStats(p, state.progress);
          return (
            <Link key={p.id} className="go" style={dc(domain)} to={`/dom/${domain}/${p.id}`}>
              <div><div style={{ fontWeight: 700 }}>{p.n}. {p.title}</div><div className="muted" style={{ fontSize: 14 }}>{ps.d} / {ps.n} étapes · {p.hours} h{p.core ? ' · socle' : ''}{ps.status === 'done' ? ' · terminée' : ''}</div></div>
              <span className="arrow">›</span><Bar pct={(100 * ps.d) / ps.n} domain={domain} />
            </Link>
          );
        })}
      </section>
    </>
  );
}
