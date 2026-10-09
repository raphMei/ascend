import { Link } from 'react-router-dom';
import { JOURS, addDays, diffDays, dow, fmt, fmtLong, fmtShort, lastDays } from '@/core/dates';
import { hm, hours, sleepDuration } from '@/core/format';
import { KEY_DATES } from '@/content/calendar';
import { byId } from '@/content/miage/subjects';
import { DOM } from '@/domain/domains';
import { coachLine } from '@/domain/coach';
import { jStats, mStats } from '@/domain/progress';
import { shabbatFor } from '@/domain/shabbat';
import { streak } from '@/domain/stats';
import { Bar } from '@/components/Bar';
import { dc } from '@/components/Icon';
import { PageHead } from '@/components/PageHead';
import { BarsChart } from '@/components/charts/BarsChart';
import { LineChart } from '@/components/charts/LineChart';
import { Ring } from '@/components/charts/Ring';
import { StackedBars } from '@/components/charts/StackedBars';
import { useClock } from '@/hooks/useClock';
import { usePlan } from '@/hooks/usePlan';
import { useDayAmounts } from '@/hooks/useWeekAmounts';
import { useData } from '@/state/DataContext';
import { useShabbat } from '@/features/shell/useShabbat';
import { dayTypeLabel } from './labels';

const LEGEND = ['matin', 'sport', 'sommeil', 'miage', 'java'] as const;

export function HomeScreen() {
  const { state, settings: s, tasks } = useData();
  const { today, now } = useClock();
  const { plan, stats: st } = usePlan(today);
  const amounts = useDayAmounts(7);
  const shab = useShabbat();
  const stk = streak(state.days, today);
  const routine = plan.blocks.filter((b) => b.domain === 'matin' && b.checkable);
  const [line, sub] = coachLine({
    pct: st.pct, streak: stk, late: plan.late, now, routineDone: routine.length ? routine.every((b) => b.done) : true,
    shabbat: !!shab || dow(today) === 6, planned: st.pl
  });
  const nextB = plan.blocks.find((b) => b.checkable && !b.done && b.end > now);
  const week = lastDays(7, today).reduce((a, d) => a + (d === today ? st.dn : (state.days[d]?.stats?.dn ?? 0)), 0);
  const ms = mStats(tasks, state.progress, today), js = jStats(state.progress);
  const upcoming = KEY_DATES.filter((k) => k[0] >= today).slice(0, 4);
  const projects = tasks.filter((t) => t.k === 'proj' && !state.progress.done[t.id] && t.due >= today).slice(0, 3);
  const friday = dow(today) === 6 ? addDays(today, -1) : addDays(today, (5 - dow(today) + 7) % 7);
  const shT = shabbatFor(friday, s);
  const proMin = plan.blocks.filter((b) => b.domain === 'pro').reduce((a, b) => a + b.end - b.start, 0);
  const trMin = plan.blocks.filter((b) => b.domain === 'trajet').reduce((a, b) => a + b.end - b.start, 0);
  const dates14 = lastDays(14, today);
  const wPts = dates14.map((d) => {
    const w = state.days[d]?.weight;
    const parts = fmtShort(d).split(' ');
    return { x: parts[0] + ' ' + parts[1].slice(0, 3), y: w != null ? +w : null };
  });
  const slItems = dates14.slice(-10).map((d) => {
    const sl = state.days[d]?.sleep;
    return { x: JOURS[dow(d)].slice(0, 2), y: sl?.bed && sl.wake ? Math.round(sleepDuration(sl.bed, sl.wake) / 6) / 10 : null };
  });
  const goalTxt = String(s.sleepGoal).replace('.', ',');
  const plural = (n: number) => (n > 1 ? 's' : '');

  return (
    <>
      <PageHead eyebrow={fmtLong(today)} title="Salut Raphaël">
        <div className="row" style={{ justifyContent: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
          <span className="chip">{dayTypeLabel(plan, today, 'long')}</span>
          <SyncBadge sync={state.sync} error={state.error} />
        </div>
      </PageHead>
      <section className="card coach" aria-label="Message du coach"><div className="eyebrow">Ton coach</div><p className="big">{line}</p><p className="small">{sub}</p></section>
      <section className="card hero">
        <div className="ring"><Ring pct={st.pct} color="var(--accent)" /><div className="num"><b>{st.pct}%</b><span>du jour</span></div></div>
        <div className="grid" style={{ gap: 14 }}>
          <div className="kpis">
            <div className="kpi"><b>{stk}</b><span>jour{plural(stk)} d'affilée</span></div>
            <div className="kpi"><b>{hours(st.dn)}</b><span>faites sur {hours(st.pl)}</span></div>
            <div className="kpi"><b>{hours(week)}</b><span>sur 7 jours</span></div>
          </div>
          {nextB && !shab && <div className="next" style={dc(nextB.domain)}><div><div className="eyebrow">À suivre · {hm(nextB.start)}</div><div className="t">{nextB.title}</div></div></div>}
          <div className="muted" style={{ fontSize: 14 }}>Travail {hours(proMin)} · Trajets {hours(trMin)} · Pour toi {hours(st.pl)}</div>
          <Link className="btn primary" style={{ textAlign: 'center', textDecoration: 'none', display: 'block' }} to="/today">Voir ma journée heure par heure</Link>
        </div>
      </section>
      <section className="card">
        <div className="sectionhead"><h2>Heures accomplies</h2><span className="muted" style={{ fontSize: 14 }}>7 derniers jours</span></div>
        <StackedBars rows={amounts} today={today} />
        <div className="legend" style={{ marginTop: 8 }}>{LEGEND.map((d) => <span key={d}><i style={dc(d)} />{DOM[d].name}</span>)}</div>
      </section>
      <div className="grid two">
        <section className="card">
          <div className="sectionhead"><h2>Cours MIAGE</h2><span className="mono muted">{ms.pct}%</span></div><Bar pct={ms.pct} domain="miage" />
          <p className="muted" style={{ marginTop: 10 }}>{ms.g.d} tâches sur {ms.g.n} faites{ms.g.late ? <> · <b style={{ color: 'var(--c-sport)' }}>{ms.g.late} en retard</b></> : ' · à jour'}.</p>
          <Link className="btn small" style={{ display: 'inline-block', marginTop: 12, textDecoration: 'none' }} to="/dom/miage">Ouvrir mes cours</Link>
        </section>
        <section className="card">
          <div className="sectionhead"><h2>Java backend</h2><span className="mono muted">{js.pct}%</span></div><Bar pct={js.pct} domain="java" />
          <p className="muted" style={{ marginTop: 10 }}>Statut : <b style={{ color: 'var(--ink)' }}>{js.level}</b>. {js.phasesDone} phase{plural(js.phasesDone)} terminée{plural(js.phasesDone)} sur 14.</p>
          <Link className="btn small" style={{ display: 'inline-block', marginTop: 12, textDecoration: 'none' }} to="/dom/java">Ouvrir mon parcours</Link>
        </section>
      </div>
      <div className="grid two">
        <section className="card"><h2>Poids</h2><p className="muted" style={{ margin: '4px 0 8px' }}>14 derniers jours</p><LineChart points={wPts} color="--c-alim" label="Poids" /></section>
        <section className="card"><h2>Sommeil</h2><p className="muted" style={{ margin: '4px 0 8px' }}>Heures par nuit, objectif {goalTxt} h</p><BarsChart items={slItems} color="--c-sommeil" goal={s.sleepGoal} goalLabel={goalTxt + ' h'} label="Sommeil" /></section>
      </div>
      <div className="grid two">
        <section className="card"><h2>Projets en cours</h2>
          <div className="list" style={{ marginTop: 8 }}>
            {projects.length ? projects.map((t) => <div key={t.id}><div style={{ fontWeight: 500 }}>{t.t}</div><div className="muted" style={{ fontSize: 14 }}>{byId[t.s]?.short ?? ''} · pour {fmt(t.due)} · {hours(t.h * 60)}</div></div>) : <p className="muted">Aucun projet de week-end à venir.</p>}
          </div>
        </section>
        <section className="card"><h2>Prochaines échéances</h2>
          <div className="list" style={{ marginTop: 8 }}>
            {upcoming.map((k) => { const n = diffDays(today, k[0]); return <div className="row" key={k[0] + k[1]}><span>{k[1]}</span><span className="mono muted">{n === 0 ? "aujourd'hui" : 'dans ' + n + ' j'}</span></div>; })}
            <div className="row"><span>Chabbat {fmtShort(friday)}</span><span className="mono muted">{hm(shT.candle)} → {hm(shT.havdalah)}</span></div>
          </div>
        </section>
      </div>
    </>
  );
}

function SyncBadge({ sync, error }: { sync: string; error: string }) {
  if (sync === 'error') return <span className="sync bad">Synchronisation interrompue ({error})</span>;
  if (sync === 'demo') return <span className="sync">Mode démo, données locales</span>;
  return <span className="sync">● Synchronisé</span>;
}
