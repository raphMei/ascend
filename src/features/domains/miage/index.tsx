import { Link } from 'react-router-dom';
import { fmt } from '@/core/dates';
import { hours } from '@/core/format';
import { SUBJ, byId } from '@/content/miage/subjects';
import type { MiageTask } from '@/content/types';
import { DOM } from '@/domain/domains';
import { mStats } from '@/domain/progress';
import { BackLink, PageHead } from '@/components/PageHead';
import { Bar } from '@/components/Bar';
import { Checkbox } from '@/components/Checkbox';
import { DomainCard } from '@/components/DomainCard';
import { HowTo } from '@/components/HowTo';
import { dc } from '@/components/Icon';
import { useClock } from '@/hooks/useClock';
import { useTick } from '@/hooks/useTick';
import { useData } from '@/state/DataContext';
import type { DomainModule } from '../types';

function useMiage() {
  const { state, tasks } = useData();
  const { today } = useClock();
  return { stats: mStats(tasks, state.progress, today), tasks, progress: state.progress, today };
}

function Card() {
  const { stats } = useMiage();
  return <DomainCard id="miage" stat={`${stats.pct}% · ${stats.g.late ? stats.g.late + ' en retard' : 'à jour'}`}><Bar pct={stats.pct} domain="miage" /></DomainCard>;
}

function TaskRow({ t, done, late, today }: { t: MiageTask; done: boolean; late: boolean; today: string }) {
  const tick = useTick();
  return (
    <div className={'item' + (done ? ' done' : '')}>
      <Checkbox checked={done} onChange={(v) => tick(today, { scope: 'prog', key: t.id }, v)} domain="miage" label={t.t} />
      <div>
        <div className="t">{t.t}</div>
        <div className="sub"><span className="chip">{fmt(t.due)}</span><span className="chip">{hours(t.h * 60)}</span>{late && <span className="chip" style={{ color: 'var(--c-sport)' }}>En retard</span>}</div>
        <HowTo text={t.d} />
      </div>
    </div>
  );
}

function SubjectPage({ id }: { id: string }) {
  const { stats: ms, tasks, progress, today } = useMiage();
  const sj = byId[id], p = ms.per[id];
  const mine = tasks.filter((t) => t.s === id);
  const isDone = (t: MiageTask) => !!progress.done[t.id];
  const todo = mine.filter((t) => !isDone(t)), done = mine.filter(isDone);
  const row = (t: MiageTask) => <TaskRow key={t.id} t={t} done={isDone(t)} late={!isDone(t) && t.due < today} today={today} />;
  return (
    <>
      <BackLink to="/dom/miage" label="Cours MIAGE" /><PageHead eyebrow={sj.cr ? `${sj.cr} crédits · ${sj.ch} h de cours` : 'Organisation'} title={sj.name} />
      <section className="card"><div className="sectionhead"><h2>Progression</h2><span className="mono muted">{p.n ? Math.round((100 * p.hd) / p.h) : 0}%</span></div><Bar pct={p.n ? (100 * p.hd) / p.h : 0} domain="miage" />
        <p className="muted" style={{ marginTop: 10 }}>{p.d} tâches sur {p.n} faites · {hours(p.h * 60 - p.hd * 60)} restantes{p.late ? <> · <b style={{ color: 'var(--c-sport)' }}>{p.late} en retard</b></> : null}.</p></section>
      <section className="card"><h2>À faire</h2><div className="list" style={{ marginTop: 8 }}>{todo.length ? todo.map(row) : <p className="muted">Tout est fait. Bravo.</p>}</div></section>
      {done.length > 0 && <section className="card"><h2>Terminé</h2><div className="list" style={{ marginTop: 8 }}>{done.map(row)}</div></section>}
    </>
  );
}

function Page({ sub }: { sub?: string }) {
  const { stats: ms } = useMiage();
  if (sub && byId[sub]) return <SubjectPage id={sub} />;
  return (
    <>
      <BackLink to="/domains" label="Domaines" /><PageHead eyebrow="Domaine" title={DOM.miage.name} />
      <section className="card"><div className="sectionhead"><h2>Progression globale</h2><span className="mono muted">{ms.pct}%</span></div><Bar pct={ms.pct} domain="miage" />
        <p className="muted" style={{ marginTop: 10 }}>{ms.g.d} tâches sur {ms.g.n} · {hours(ms.g.hd * 60)} faites sur {hours(ms.g.h * 60)}. Examens du 22 au 26 février 2027.</p></section>
      <section className="grid">
        {SUBJ.map((sj) => {
          const p = ms.per[sj.id], pc = p.h ? Math.round((100 * p.hd) / p.h) : 0;
          return (
            <Link key={sj.id} className="go" style={dc('miage')} to={`/dom/miage/${sj.id}`}>
              <div><div style={{ fontWeight: 700 }}>{sj.name}</div><div className="muted" style={{ fontSize: 14 }}>{p.d} / {p.n} tâches{p.late ? <> · <span style={{ color: 'var(--c-sport)' }}>{p.late} en retard</span></> : null}</div></div>
              <span className="arrow">›</span><Bar pct={pc} domain="miage" />
            </Link>
          );
        })}
      </section>
      <p className="muted">Quand tu m'enverras le contenu de chaque matière, je remplacerai ces tâches génériques par des tâches précises.</p>
    </>
  );
}

export const miage: DomainModule = { id: 'miage', Card, Page };
