import { Link, useParams } from 'react-router-dom';
import { addDays, dow, fmtLong } from '@/core/dates';
import { dur, hours } from '@/core/format';
import { DOM } from '@/domain/domains';
import type { DomainId } from '@/domain/types';
import { BlockRow } from '@/components/BlockRow';
import { dc } from '@/components/Icon';
import { PageHead } from '@/components/PageHead';
import { TrackerFields } from '@/components/TrackerFields';
import { useClock } from '@/hooks/useClock';
import { usePlan } from '@/hooks/usePlan';
import { dayTypeLabel } from '@/features/home/labels';

const ISO = /^\d{4}-\d\d-\d\d$/;

export function TodayScreen() {
  const { date: param } = useParams();
  const { today, now } = useClock();
  const date = param && ISO.test(param) ? param : today;
  const { plan, stats: st } = usePlan(date);
  const minutes = (domain: DomainId) => plan.blocks.filter((b) => b.domain === domain).reduce((a, b) => a + b.end - b.start, 0);
  const doms: Partial<Record<DomainId, number>> = {};
  plan.blocks.filter((b) => b.checkable).forEach((b) => { doms[b.domain] = (doms[b.domain] ?? 0) + (b.end - b.start); });
  const trackable = dow(date) !== 6;

  return (
    <>
      <PageHead eyebrow={date === today ? "Aujourd'hui" : 'Planning'} title={fmtLong(date)} />
      <div className="daynav">
        <Link className="icon" to={`/today/${addDays(date, -1)}`} aria-label="Jour précédent">‹</Link>
        <span className="chip">{dayTypeLabel(plan, date, 'short')}</span>
        {date !== today && <Link className="btn small" style={{ textDecoration: 'none' }} to="/today">Revenir à aujourd'hui</Link>}
        <Link className="icon" to={`/today/${addDays(date, 1)}`} aria-label="Jour suivant" style={{ marginLeft: 'auto' }}>›</Link>
      </div>
      <section className="card">
        <div className="kpis">
          <div className="kpi"><b>{hours(st.pl)}</b><span>pour toi</span></div>
          <div className="kpi"><b>{hours(minutes('pro'))}</b><span>travail / cours</span></div>
          <div className="kpi"><b>{hours(minutes('trajet'))}</b><span>trajets</span></div>
        </div>
        <div className="legend" style={{ marginTop: 12 }}>
          {(Object.keys(doms) as DomainId[]).map((d) => <span key={d}><i style={dc(d)} />{DOM[d].name} {dur(doms[d]!)}</span>)}
        </div>
        <div style={{ marginTop: 12 }}>
          <div className="bar"><i style={{ width: `${st.pct}%`, background: 'var(--accent)' }} /></div>
          <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>{st.pct}% fait ({hours(st.dn)} sur {hours(st.pl)})</p>
        </div>
      </section>
      {plan.warnings.map((w) => <div className="warn" key={w}>{w}</div>)}
      {plan.overflow.n > 0 && (
        <div className="warn"><b>Trop chargé aujourd'hui.</b> {plan.overflow.n} élément{plan.overflow.n > 1 ? 's' : ''} n'ont pas trouvé de place (≈ {hours(plan.overflow.min)}). Ils restent en retard et reviennent demain : décide ce que tu coupes ou ce que tu déplaces.</div>
      )}
      <section className="tl" aria-label="Frise de la journée">
        {plan.blocks.map((b) => <BlockRow key={b.id + b.start} block={b} date={date} today={today} now={now} />)}
      </section>
      {trackable && <section className="card"><h2>Mes mesures du jour</h2><p className="muted" style={{ margin: '4px 0 14px' }}>Quelques chiffres suffisent. Ils alimentent tes graphiques.</p><TrackerFields date={date} /></section>}
    </>
  );
}
