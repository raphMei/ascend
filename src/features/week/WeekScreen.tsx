import { Link, useParams } from 'react-router-dom';
import { JOURS, addDays, dow, fmtShort, type ISODate } from '@/core/dates';
import { dur, hm, hours } from '@/core/format';
import { lessonTag } from '@/domain/lesson';
import { DOM } from '@/domain/domains';
import type { DomainId } from '@/domain/types';
import { AdjustmentsCard } from '@/components/AdjustmentsCard';
import { dc } from '@/components/Icon';
import { PageHead } from '@/components/PageHead';
import { useClock } from '@/hooks/useClock';
import { useSchedule } from '@/hooks/useSchedule';
import { useWeek } from '@/hooks/useWeek';
import { useData } from '@/state/DataContext';

const ISO = /^\d{4}-\d\d-\d\d$/;

/** La semaine : chaque jour avec ses leçons (celles que l'ajustement automatique a replacées comprises), et les heures par domaine. */
export function WeekScreen() {
  const { date: param } = useParams();
  const { today } = useClock();
  const anchor = param && ISO.test(param) ? param : today;
  const week = useWeek(anchor);
  const sched = useSchedule();
  const { tasks } = useData();
  const monday = week[0].date, sunday = week[6].date;
  const current = monday <= today && today <= sunday;
  const byDomain = new Map<DomainId, { planned: number; done: number }>();
  for (const d of week) for (const b of d.plan.blocks) if (b.checkable) {
    const e = byDomain.get(b.domain) ?? { planned: 0, done: 0 };
    e.planned += b.end - b.start; if (b.done) e.done += b.end - b.start;
    byDomain.set(b.domain, e);
  }
  const rows = [...byDomain.entries()].sort((a, b) => b[1].planned - a[1].planned);
  const unplaced = sched?.unplaced.length ?? 0;
  const go = (d: ISODate) => (d === today ? '/week' : `/week/${d}`);
  return (
    <>
      <PageHead eyebrow={`${fmtShort(monday)} – ${fmtShort(sunday)}`} title={current ? 'Cette semaine' : 'Ma semaine'} />
      <div className="daynav">
        <Link className="icon" to={go(addDays(monday, -7))} aria-label="Semaine précédente">‹</Link>
        {!current && <Link className="btn small" style={{ textDecoration: 'none' }} to="/week">Cette semaine</Link>}
        <Link className="icon" to={go(addDays(monday, 7))} aria-label="Semaine suivante" style={{ marginLeft: 'auto' }}>›</Link>
      </div>
      <AdjustmentsCard />
      {unplaced > 0 && <div className="warn" role="status"><b>{unplaced} leçon{unplaced > 1 ? 's' : ''} ne trouve{unplaced > 1 ? 'nt' : ''} plus de place avant {unplaced > 1 ? 'leur' : 'son'} échéance.</b> Allège un domaine dans « Domaines » ou repousse une échéance.</div>}

      <ol className="wk" aria-label="Les sept jours">
        {week.map(({ date, plan }, i) => {
          const ses = plan.blocks.filter((b) => b.checkable);
          const reserved = plan.blocks.filter((b) => !b.checkable && b.domain !== 'chabbat').reduce((a, b) => a + b.end - b.start, 0);
          const sat = dow(date) === 6;
          const to = date === today ? '/today' : `/today/${date}`;
          return (
            <li key={date} className={'wk-day' + (date === today ? ' today' : '')} style={{ ['--n' as string]: i }}>
              <Link to={to} className="wk-date" aria-label={`Ouvrir ${JOURS[dow(date)]} ${+date.slice(8)}`}>
                <span>{JOURS[dow(date)].slice(0, 3)}</span><b>{+date.slice(8)}</b>
              </Link>
              <div className="wk-items">
                {sat && <div className="wk-chip free">Chabbat : aucune leçon</div>}
                {!sat && !ses.length && <div className="wk-chip free">Aucune leçon</div>}
                {ses.map((b) => (
                  <Link key={b.id + b.start} to={to} className={'wk-chip' + (b.done ? ' done' : '')} style={dc(b.domain)}>
                    <span className="wk-t"><b>{b.title}</b><span className="muted">{DOM[b.domain].name} · {hm(b.start)} · {dur(b.end - b.start)}{lessonTag(b, tasks) === 'Révision' ? ' · révision' : ''}</span></span>
                    <span className="wk-st" aria-label={b.done ? 'Faite' : 'À faire'}>{b.done ? '✓' : ''}</span>
                  </Link>
                ))}
                {!sat && reserved > 0 && <div className="wk-res muted">Temps réservé : {hours(reserved)}</div>}
              </div>
            </li>
          );
        })}
      </ol>

      <section className="card" aria-label="Heures par domaine">
        <div className="sectionhead"><h2>Heures par domaine</h2><span className="muted">faites / prévues</span></div>
        {rows.length ? (
          <div className="list" style={{ marginTop: 10 }}>
            {rows.map(([d, e]) => (
              <div key={d} style={dc(d)} className="hbar">
                <div className="row"><span><span className="ldot" aria-hidden="true" /> {DOM[d].name}</span><span className="mono muted">{hours(e.done)} / {hours(e.planned)}</span></div>
                <div className="bar"><i style={{ width: `${e.planned ? Math.round((100 * e.done) / e.planned) : 0}%` }} /></div>
              </div>
            ))}
          </div>
        ) : <p className="muted" style={{ marginTop: 8 }}>Aucune leçon cette semaine.</p>}
      </section>
      <div className="grid two">
        <Link to="/home" className="card" style={{ textDecoration: 'none', display: 'block' }}><div className="sectionhead"><h2>Bilan</h2><span className="muted">Voir →</span></div><p className="muted" style={{ marginTop: 4 }}>Heures apprises, projets en cours, échéances.</p></Link>
        <Link to="/stats" className="card" style={{ textDecoration: 'none', display: 'block' }}><div className="sectionhead"><h2>Statistiques</h2><span className="muted">Voir →</span></div><p className="muted" style={{ marginTop: 4 }}>Régularité, calendrier, durées réelles, badges.</p></Link>
      </div>
    </>
  );
}
