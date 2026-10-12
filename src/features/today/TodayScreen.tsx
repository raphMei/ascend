import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { addDays, dow, fmtLong } from '@/core/dates';
import { hours } from '@/core/format';
import { coachLine } from '@/domain/coach';
import { dueReviews, journalItems } from '@/domain/journal';
import { nextBlock } from '@/domain/next';
import { streak as dayStreak } from '@/domain/stats';
import { AdjustmentsCard } from '@/components/AdjustmentsCard';
import { DebtCard } from '@/components/DebtCard';
import { AddBlock } from '@/components/BlockEditor';
import { OnboardingCard } from '@/components/OnboardingCard';
import { PageHead } from '@/components/PageHead';
import { Celebration, useDayCelebration } from '@/components/habits/Celebration';
import { NextCard } from '@/components/habits/NextCard';
import { WeekStrip } from '@/components/habits/WeekStrip';
import { DayAgenda } from '@/components/learning/DayAgenda';
import { DomainStrip } from '@/components/learning/DomainStrip';
import { ReviewNudge } from '@/components/learning/ReviewNudge';
import { WeekCard } from '@/components/learning/WeekCard';
import { useClock } from '@/hooks/useClock';
import { useDayNavigation } from '@/hooks/useDayNavigation';
import { usePlan } from '@/hooks/usePlan';
import { useStreaks } from '@/hooks/useStreaks';
import { useWeek } from '@/hooks/useWeek';
import { useData } from '@/state/DataContext';
import { dayTypeLabel } from '@/features/home/labels';
import { useShabbat } from '@/features/shell/useShabbat';

const ISO = /^\d{4}-\d\d-\d\d$/;

/** Écran principal : la semaine d'un coup d'œil, la prochaine leçon, l'avancement des domaines, ce qu'il faut revoir, puis l'agenda de la journée. */
export function TodayScreen() {
  const { date: param } = useParams();
  const { today, now } = useClock();
  const date = param && ISO.test(param) ? param : today;
  const { plan, stats: st } = usePlan(date);
  const { state, setDay } = useData();
  const week = useWeek(date);
  const streaks = useStreaks();
  const shab = useShabbat();
  const [adding, setAdding] = useState(false);
  const isToday = date === today;
  const isWeekday = dow(date) >= 1 && dow(date) <= 5;
  const skipped = plan.skipped ?? [];
  const nowHere = isToday ? now : -1;
  const sessions = plan.blocks.filter((b) => b.checkable);
  const done = sessions.filter((b) => b.done).length;
  const next = useMemo(() => nextBlock(plan.blocks, nowHere), [plan.blocks, nowHere]);
  const streakDays = useMemo(() => dayStreak(state.days, today), [state.days, today]);
  const due = useMemo(() => dueReviews(journalItems(state.days), today), [state.days, today]);
  const swipe = useDayNavigation(date, today);
  const [party, closeParty] = useDayCelebration(isToday && sessions.length > 0 && sessions.every((b) => b.done), date);
  const [line, sub] = coachLine({ pct: st.pct, streak: streakDays, late: plan.late, now, shabbat: !!shab || dow(today) === 6, planned: st.pl });

  return (
    <>
      {/* Le balayage de jour ne couvre que l'en-tête : sur les cartes, balayer sert à terminer ou passer. « contents » : aucun effet sur la mise en page. */}
      <div style={{ display: 'contents' }} {...swipe}>
        <PageHead eyebrow={isToday ? "Aujourd'hui" : 'Planning'} title={fmtLong(date)} />
        <WeekStrip date={date} />
      </div>
      {isToday && <OnboardingCard />}
      {isToday && (
        <>
          <section className="card coachline" aria-label="Message du coach">
            <b>{line}</b><span className="muted">{sub}</span>
          </section>
          {next && <NextCard next={next} date={date} />}
          <WeekCard week={week} />
          <DomainStrip />
          <ReviewNudge due={due} />
        </>
      )}

      <div className="daynav">
        <Link className="icon" to={`/today/${addDays(date, -1)}`} aria-label="Jour précédent">‹</Link>
        <span className="chip">{dayTypeLabel(plan, date, 'short')}</span>
        {!isToday && <Link className="btn small" style={{ textDecoration: 'none' }} to="/today">Aujourd'hui</Link>}
        {isWeekday && (
          <select className="daykind" aria-label="Type de journée" value={state.days[date]?.edits?.day ?? 'normal'}
            onChange={(e) => setDay(date, { edits: { day: e.target.value === 'normal' ? null : e.target.value } })}>
            <option value="normal">Journée normale</option><option value="conge">Congé</option><option value="remote">Télétravail</option><option value="onsite">Sur site</option>
          </select>
        )}
        <Link className="icon" to={`/today/${addDays(date, 1)}`} aria-label="Jour suivant" style={{ marginLeft: 'auto' }}>›</Link>
      </div>

      {plan.warnings.map((w) => <div className="warn" key={w}>{w}</div>)}
      {plan.overflow.n > 0 && (
        <div className="warn"><b>Trop chargé aujourd'hui.</b> {plan.overflow.n} élément{plan.overflow.n > 1 ? 's' : ''} n'ont pas trouvé de place (≈ {hours(plan.overflow.min)}). Ils restent en retard et reviennent demain : décide ce que tu coupes ou ce que tu déplaces.</div>
      )}
      {isToday && <DebtCard />}
      {isToday && <AdjustmentsCard />}

      <section aria-label="Ma journée">
        <div className="sectionhead">
          <h2 style={{ fontSize: 18 }}>{isToday ? 'Ma journée' : 'Agenda du jour'}</h2>
          <span className="muted">{sessions.length ? `${done} / ${sessions.length} séance${sessions.length > 1 ? 's' : ''} · ${hours(st.pl)}` : 'Aucune séance prévue'}</span>
        </div>
        <DayAgenda blocks={plan.blocks} date={date} streaks={streaks} now={nowHere} />
      </section>

      <div className="quick" style={{ marginTop: 0 }}>
        <button type="button" className="btn" onClick={() => setAdding(true)}>+ Ajouter un bloc</button>
      </div>
      {skipped.length > 0 && (
        <section className="card flat"><h2 style={{ fontSize: 18 }}>Blocs passés</h2>
          <div className="list" style={{ marginTop: 6 }}>
            {skipped.map((b) => (
              <div className="row" key={b.id}><span className="muted">{b.title}</span>
                <button type="button" className="btn small" onClick={() => setDay(date, { edits: { skip: { [b.id]: null } } })}>Rétablir</button></div>
            ))}
          </div>
        </section>
      )}
      {adding && <AddBlock date={date} onClose={() => setAdding(false)} />}
      {party && <Celebration streak={streakDays} onClose={closeParty} />}
    </>
  );
}
