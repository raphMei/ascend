import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { addDays, dow, fmtLong } from '@/core/dates';
import { dur, hm, hours } from '@/core/format';
import { DOM } from '@/domain/domains';
import { buildGoals } from '@/domain/goals';
import { groupBlocks } from '@/domain/groups';
import { groupSmallBlocks } from '@/domain/grouping';
import { toMin } from '@/core/format';
import type { DomainId } from '@/domain/types';
import { AdjustmentsCard } from '@/components/AdjustmentsCard';
import { AddBlock } from '@/components/BlockEditor';
import { BlockRow } from '@/components/BlockRow';
import { EntryReminder } from '@/components/EntryReminder';
import { dc } from '@/components/Icon';
import { PageHead } from '@/components/PageHead';
import { TrackerFields } from '@/components/TrackerFields';
import { GoalsSection } from '@/components/habits/GoalsSection';
import { GroupSection } from '@/components/habits/GroupSection';
import { SegmentedControl } from '@/components/habits/SegmentedControl';
import { WeekStrip } from '@/components/habits/WeekStrip';
import { Ring } from '@/components/charts/Ring';
import { useClock } from '@/hooks/useClock';
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
  const trackable = dow(date) !== 6;
  const skipped = plan.skipped ?? [];
  const groups = useMemo(() => groupBlocks(plan.blocks, mode, toMin(settings.bed)), [plan.blocks, mode, settings.bed]);
  const goals = useMemo(() => buildGoals({ days: state.days, settings, progress: state.progress, tasks, today, dropped: new Set(sched?.dropped ?? []) }), [state.days, settings, state.progress, tasks, today, sched]);
  const nowHere = date === today ? now : -1;
  const checks = plan.blocks.filter((b) => b.checkable);
  const minutes = (domain: DomainId) => plan.blocks.filter((b) => b.domain === domain).reduce((a, b) => a + b.end - b.start, 0);
  const doms: Partial<Record<DomainId, number>> = {};
  checks.forEach((b) => { doms[b.domain] = (doms[b.domain] ?? 0) + (b.end - b.start); });
  const items = groupSmallBlocks(plan.blocks);
  const setUi = (patch: NonNullable<typeof settings.ui>) => setSettings({ ui: patch });

  return (
    <>
      <PageHead eyebrow={date === today ? "Aujourd'hui" : 'Planning'} title={fmtLong(date)} />
      <WeekStrip date={date} />
      <div className="daynav">
        <Link className="icon" to={`/today/${addDays(date, -1)}`} aria-label="Jour précédent">‹</Link>
        <span className="chip">{dayTypeLabel(plan, date, 'short')}</span>
        {date !== today && <Link className="btn small" style={{ textDecoration: 'none' }} to="/today">Aujourd'hui</Link>}
        <Link className="icon" to={`/today/${addDays(date, 1)}`} aria-label="Jour suivant" style={{ marginLeft: 'auto' }}>›</Link>
      </div>

      <section className="card daysum" aria-label="Avancement du jour">
        <div className="ring"><Ring pct={st.pct} color="var(--accent)" /><div className="num"><b>{st.pct}%</b></div></div>
        <div className="txt">
          <b>{checks.filter((b) => b.done).length} / {checks.length} faites</b>
          <span className="muted">{hours(st.dn)} sur {hours(st.pl)} pour toi · travail {hours(minutes('pro'))} · trajets {hours(minutes('trajet'))}</span>
        </div>
      </section>

      <div className="toolbar">
        <SegmentedControl label="Affichage" value={view} options={[['liste', 'Liste'], ['frise', 'Frise']]} onChange={(v) => setUi({ today: v })} />
        {view === 'liste' && <SegmentedControl label="Regrouper par" value={mode} options={[['moments', 'Moments'], ['themes', 'Thèmes']]} onChange={(v) => setUi({ group: v })} />}
      </div>

      {plan.warnings.map((w) => <div className="warn" key={w}>{w}</div>)}
      {plan.overflow.n > 0 && (
        <div className="warn"><b>Trop chargé aujourd'hui.</b> {plan.overflow.n} élément{plan.overflow.n > 1 ? 's' : ''} n'ont pas trouvé de place (≈ {hours(plan.overflow.min)}). Ils restent en retard et reviennent demain : décide ce que tu coupes ou ce que tu déplaces.</div>
      )}
      {date === today && <AdjustmentsCard />}
      {date === today && trackable && <EntryReminder date={date} />}

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
                      <summary>{it.blocks.length} petites tâches MIAGE <span className="muted" style={{ fontWeight: 400 }}>· {it.blocks.filter((b) => b.done).length} faite{it.blocks.filter((b) => b.done).length > 1 ? 's' : ''} sur {it.blocks.length}</span></summary>
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
      {view === 'liste' && date === today && <GoalsSection goals={goals} />}
      {adding && <AddBlock date={date} onClose={() => setAdding(false)} />}
      {trackable && <section className="card"><h2>Mes mesures du jour</h2><p className="muted" style={{ margin: '4px 0 14px' }}>Quelques chiffres suffisent. Ils alimentent tes graphiques.</p><TrackerFields date={date} /></section>}
    </>
  );
}
