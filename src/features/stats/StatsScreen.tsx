import { useMemo } from 'react';
import { fmt, fmtShort } from '@/core/dates';
import { dur, hours } from '@/core/format';
import { badges } from '@/domain/badges';
import { DOM } from '@/domain/domains';
import { habitStats, heatmap, weekReview } from '@/domain/habit-stats';
import type { DomainId } from '@/domain/types';
import { Bar } from '@/components/Bar';
import { PageHead, BackLink } from '@/components/PageHead';
import { Heatmap } from '@/components/habits/Heatmap';
import { useClock } from '@/hooks/useClock';
import { usePlan } from '@/hooks/usePlan';
import { useData } from '@/state/DataContext';

const ok = (n: number | null) => (n == null ? '–' : n + ' %');

/** Statistiques : régularité par habitude, calendrier de chaleur, bilan de la semaine, badges. */
export function StatsScreen() {
  const { state, settings, tasks } = useData();
  const { today } = useClock();
  const { stats: live } = usePlan(today);
  const liveSnap = useMemo(() => ({ pct: live.pct, pl: live.pl, dn: live.dn, planned: live.planned, done: live.done }), [live]);
  const habits = useMemo(() => habitStats({ days: state.days, settings, progress: state.progress, tasks, today }), [state.days, settings, state.progress, tasks, today]);
  const weeks = useMemo(() => heatmap(state.days, today, 12, live.pct), [state.days, today, live.pct]);
  const review = useMemo(() => weekReview(state.days, today, liveSnap), [state.days, today, liveSnap]);
  const earned = useMemo(() => badges(state.days, state.progress), [state.days, state.progress]);
  const { current: cur, previous: prev, deltaMin } = review;
  const sign = deltaMin > 0 ? '+' : deltaMin < 0 ? '−' : '';

  return (
    <>
      <BackLink to="/home" label="Bilan" /><PageHead eyebrow="Progression" title="Statistiques" />

      <section className="card" aria-label="Bilan de la semaine">
        <div className="sectionhead"><h2>Cette semaine</h2><span className="muted" style={{ fontSize: 14 }}>depuis le {fmt(cur.start)}</span></div>
        <div className="kpis" style={{ marginTop: 10 }}>
          <div className="kpi"><b>{hours(cur.totalMin)}</b><span>accomplies</span></div>
          <div className="kpi"><b>{cur.okDays}</b><span>jour{cur.okDays > 1 ? 's' : ''} à 70 % +</span></div>
          <div className="kpi"><b>{cur.avgPct} %</b><span>en moyenne</span></div>
        </div>
        <p className="muted" style={{ marginTop: 10 }}>
          {prev.totalMin === 0 && cur.totalMin === 0 ? 'Pas encore de données pour comparer.' : <>Semaine précédente : {hours(prev.totalMin)} et {prev.okDays} jour{prev.okDays > 1 ? 's' : ''} à 70 % +. {deltaMin === 0 ? 'Identique.' : <b style={{ color: 'var(--ink)' }}>{sign}{dur(Math.abs(deltaMin))} par rapport à la semaine dernière.</b>}</>}
        </p>
        {Object.keys(cur.minutes).length > 0 && (
          <div className="list" style={{ marginTop: 8 }}>
            {(Object.entries(cur.minutes).sort((a, b) => b[1] - a[1]) as [DomainId, number][]).map(([d, m]) => (
              <div className="rate" key={d}><span>{DOM[d]?.name ?? d}</span><span className="mono muted">{hours(m)}{prev.minutes[d] ? ` · avant ${hours(prev.minutes[d])}` : ''}</span></div>
            ))}
          </div>
        )}
      </section>

      <section className="card" aria-label="Calendrier de régularité">
        <h2>12 dernières semaines</h2><p className="muted" style={{ margin: '4px 0 12px' }}>Une case par jour : plus elle est foncée, plus tu as avancé.</p>
        <Heatmap weeks={weeks} />
      </section>

      <section className="card" aria-label="Régularité par habitude">
        <h2>Régularité par habitude</h2><p className="muted" style={{ margin: '4px 0 6px' }}>Part des jours prévus où l'habitude a été faite. Aujourd'hui ne compte que s'il est fait.</p>
        <div className="list">
          {habits.map((h) => (
            <div className="rate" key={h.id} style={{ ['--dc' as string]: `var(${DOM[h.domain].c})` }}>
              <span style={{ fontWeight: 500 }}>{h.title}</span>
              <span className="mono muted" aria-label={`7 jours : ${ok(h.rate7)}, 30 jours : ${ok(h.rate30)}`}>7 j {ok(h.rate7)} · 30 j {ok(h.rate30)}</span>
              <Bar pct={h.rate30 ?? 0} domain={h.domain} />
              <span className="muted" style={{ fontSize: 13, gridColumn: '1 / -1' }}>Série actuelle {h.current} jour{h.current > 1 ? 's' : ''} · meilleure {h.best}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card" aria-label="Badges">
        <div className="sectionhead"><h2>Badges</h2><span className="muted" style={{ fontSize: 14 }}>{earned.filter((b) => b.earned).length} / {earned.length}</span></div>
        <div className="badges" style={{ marginTop: 10 }}>
          {earned.map((b) => (
            <div key={b.id} className={'badge' + (b.earned ? '' : ' locked')}>
              <span className="big" aria-hidden="true">{b.emoji}</span>
              <b>{b.title}</b>
              <small>{b.earned ? 'Obtenu' : `${b.value} / ${b.target}`} · {b.description}</small>
            </div>
          ))}
        </div>
      </section>
      <p className="muted" style={{ fontSize: 13 }}>Données arrêtées au {fmtShort(today)}.</p>
    </>
  );
}
