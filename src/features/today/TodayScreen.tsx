import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { addDays, dow, fmtLong } from '@/core/dates';
import { dur, hm, hours } from '@/core/format';
import { DOM } from '@/domain/domains';
import { continueCards } from '@/domain/continue';
import { buildGoals } from '@/domain/goals';
import { groupBlocks } from '@/domain/groups';
import { groupSmallBlocks } from '@/domain/small-blocks';
import { momentOf } from '@/domain/moment';
import { nextBlock } from '@/domain/next';
import { streak as dayStreak } from '@/domain/stats';
import { toMin } from '@/core/format';
import type { DomainId } from '@/domain/types';
import { AdjustmentsCard } from '@/components/AdjustmentsCard';
import { DebtCard } from '@/components/DebtCard';
import { AddBlock } from '@/components/BlockEditor';
import { BlockRow } from '@/components/BlockRow';
import { OnboardingCard } from '@/components/OnboardingCard';
import { dc } from '@/components/Icon';
import { PageHead } from '@/components/PageHead';
import { ReservedTime } from '@/components/ReservedTime';
import { ContinueSection } from '@/components/habits/ContinueSection';
import { GoalsSection } from '@/components/habits/GoalsSection';
import { GroupSection } from '@/components/habits/GroupSection';
import { SegmentedControl } from '@/components/habits/SegmentedControl';
import { Celebration, useDayCelebration } from '@/components/habits/Celebration';
import { DayHero } from '@/components/habits/DayHero';
import { NextCard } from '@/components/habits/NextCard';
import { WeekStrip } from '@/components/habits/WeekStrip';
import { useClock } from '@/hooks/useClock';
import { useDayNavigation } from '@/hooks/useDayNavigation';
import { usePlan } from '@/hooks/usePlan';
import { useSchedule } from '@/hooks/useSchedule';
import { useStreaks } from '@/hooks/useStreaks';
import { useData } from '@/state/DataContext';
import { dayTypeLabel } from '@/features/home/labels';

const ISO = /^\d{4}-\d\d-\d\d$/;

export function TodayScreen() {
  const { date: param } = useParams();
  const { today, now } = useClock();
  const date = param && ISO.test(param) ? param : today;
  const { plan, stats: st } = usePlan(date);
  const { state, settings, tasks, setDay, setSettings } = useData();
  const sched = useSchedule();
  const streaks = useStreaks();
  const [adding, setAdding] = useState(false);
  const view = settings.ui?.today ?? 'liste';
  const mode = settings.ui?.group ?? 'moments';
  const isWeekday = dow(date) >= 1 && dow(date) <= 5;
  const skipped = plan.skipped ?? [];
  const learn = useMemo(() => plan.blocks.filter((b) => b.checkable || b.domain === 'chabbat'), [plan.blocks]);
  const reserved = useMemo(() => plan.blocks.filter((b) => !b.checkable && b.domain !== 'chabbat'), [plan.blocks]);
  const groups = useMemo(() => groupBlocks(learn, mode, toMin(settings.bed)), [learn, mode, settings.bed]);
  const goals = useMemo(() => buildGoals({ days: state.days, settings, progress: state.progress, tasks, today, dropped: new Set(sched?.dropped ?? []) }), [state.days, settings, state.progress, tasks, today, sched]);
  const nowHere = date === today ? now : -1;
  const cards = useMemo(() => continueCards(state.progress, settings), [state.progress, settings]);
  const checks = plan.blocks.filter((b) => b.checkable);
  const minutes = (domain: DomainId) => plan.blocks.filter((b) => b.domain === domain).reduce((a, b) => a + b.end - b.start, 0);
  const doms: Partial<Record<DomainId, number>> = {};
  checks.forEach((b) => { doms[b.domain] = (doms[b.domain] ?? 0) + (b.end - b.start); });
  const items = groupSmallBlocks(plan.blocks);
  const setUi = (patch: NonNullable<typeof settings.ui>) => setSettings({ ui: patch });
  const swipe = useDayNavigation(date, today);
  const next = useMemo(() => nextBlock(plan.blocks, nowHere), [plan.blocks, nowHere]);
  const streakDays = useMemo(() => dayStreak(state.days, today), [state.days, today]);
  const [party, closeParty] = useDayCelebration(date === today && checks.length > 0 && checks.every((b) => b.done), date);

  return (
    <>
      {/* Le balayage de jour ne couvre que l'en-tête : sur les cartes, balayer sert à cocher ou passer. « contents » : aucun effet sur la mise en page. */}
      <div style={{ display: 'contents' }} {...swipe}>
      <PageHead eyebrow={date === today ? "Aujourd'hui" : 'Planning'} title={fmtLong(date)} />
      <WeekStrip date={date} />
      </div>
      {date === today && <OnboardingCard />}
      <div className="daynav">
        <Link className="icon" to={`/today/${addDays(date, -1)}`} aria-label="Jour précédent">‹</Link>
        <span className="chip">{dayTypeLabel(plan, date, 'short')}</span>
        {date !== today && <Link className="btn small" style={{ textDecoration: 'none' }} to="/today">Aujourd'hui</Link>}
        {isWeekday && (
          <select className="daykind" aria-label="Type de journée" value={state.days[date]?.edits?.day ?? 'normal'}
            onChange={(e) => setDay(date, { edits: { day: e.target.value === 'normal' ? null : e.target.value } })}>
            <option value="normal">Journée normale</option><option value="conge">Congé</option><option value="remote">Télétravail</option><option value="onsite">Sur site</option>
          </select>
        )}
        <Link className="icon" to={`/today/${addDays(date, 1)}`} aria-label="Jour suivant" style={{ marginLeft: 'auto' }}>›</Link>
      </div>

      <DayHero pct={st.pct} doneMin={st.dn} plannedMin={st.pl} doneCount={checks.filter((b) => b.done).length} total={checks.length}
        workMin={minutes('pro')} tripMin={minutes('trajet')} reservedMin={reserved.filter((b) => b.domain !== 'pro' && b.domain !== 'trajet').reduce((a, b) => a + b.end - b.start, 0)} streak={streakDays} calm={momentOf(now) === 'soir'} />
      {next && <NextCard next={next} date={date} />}

      <div className="toolbar">
        <SegmentedControl label="Affichage" value={view} options={[['liste', 'Liste'], ['frise', 'Frise']]} onChange={(v) => setUi({ today: v })} />
        {view === 'liste' && <SegmentedControl label="Regrouper par" value={mode} options={[['moments', 'Moments'], ['themes', 'Thèmes']]} onChange={(v) => setUi({ group: v })} />}
      </div>

      {plan.warnings.map((w) => <div className="warn" key={w}>{w}</div>)}
      {plan.overflow.n > 0 && (
        <div className="warn"><b>Trop chargé aujourd'hui.</b> {plan.overflow.n} élément{plan.overflow.n > 1 ? 's' : ''} n'ont pas trouvé de place (≈ {hours(plan.overflow.min)}). Ils restent en retard et reviennent demain : décide ce que tu coupes ou ce que tu déplaces.</div>
      )}
      {date === today && <DebtCard />}
      {date === today && <AdjustmentsCard />}
      
      {view === 'liste' ? (
        <div className="groups">
          {groups.map((g) => <GroupSection key={mode + g.id} group={g} date={date} streaks={streaks} now={nowHere} />)}
        </div>
      ) : (
        <>
          <div className="legend">{(Object.keys(doms) as DomainId[]).map((d) => <span key={d}><i style={dc(d)} />{DOM[d].name} {dur(doms[d]!)}</span>)}</div>
          <section className="tl" aria-label="Frise de la journée">
            {items.map((it) => it.kind === 'block'
              ? <BlockRow key={it.block.id + it.block.start} block={it.block} date={date} today={today} now={now} />
              : (
                <div className="blk" key={'g' + it.start}>
                  <div className="time">{hm(it.start)}<small>{dur(it.end - it.start)}</small></div>
                  <div className="body" style={dc('miage')}>
                    <details className="smallgroup" style={{ gridColumn: '1 / -1' }}>
                      <summary>{it.blocks.length} petites séances MIAGE <span className="muted" style={{ fontWeight: 400 }}>· {it.blocks.filter((b) => b.done).length} faite{it.blocks.filter((b) => b.done).length > 1 ? 's' : ''} sur {it.blocks.length}</span></summary>
                      <div className="tl">{it.blocks.map((b) => <BlockRow key={b.id} block={b} date={date} today={today} now={now} compact />)}</div>
                    </details>
                  </div>
                </div>
              ))}
          </section>
        </>
      )}

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
      {view === 'liste' && <ReservedTime blocks={reserved} now={nowHere} />}
      {view === 'liste' && date === today && <ContinueSection cards={cards} />}
      {view === 'liste' && date === today && <GoalsSection goals={goals} />}
      {adding && <AddBlock date={date} onClose={() => setAdding(false)} />}
      {party && <Celebration streak={streakDays} onClose={closeParty} />}
    </>
  );
}
