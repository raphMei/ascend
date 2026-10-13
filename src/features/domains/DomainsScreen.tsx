import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fmt, monthLabel, shiftMonth, type ISODate } from '@/core/dates';
import { hours } from '@/core/format';
import { MAX_ACTIVE, GAP_MIN, breakdown, budgetMessage, budgetOf, canChoose, fillGap, miageNeed, monthFree } from '@/domain/budget';
import { DOM } from '@/domain/domains';
import { LEVELS, LEVEL_LABEL, MONTH_DOMAINS, levelOf, monthPlanFor } from '@/domain/month';
import type { Overview } from '@/domain/overview';
import type { Level, MonthDomain } from '@/domain/types';
import { Bar } from '@/components/Bar';
import { dc } from '@/components/Icon';
import { PageHead } from '@/components/PageHead';
import { Spark } from '@/components/learning/Spark';
import { haptic } from '@/hooks/feedback';
import { useClock } from '@/hooks/useClock';
import { useOverviews } from '@/hooks/useOverviews';
import { useData } from '@/state/DataContext';

function status(o: Overview): { text: string; cls: string } {
  if (o.level === 'off' || !o.active) return { text: 'En pause', cls: 'idle' };
  if (o.late > 0) return { text: `En retard de ${o.late}`, cls: 'late' };
  return { text: 'À jour', cls: 'ok' };
}

/** Mes domaines : le budget de temps du mois (avec ses limites), puis, pour chaque domaine, où j'en suis et l'intensité choisie. */
export function DomainsScreen() {
  const { today } = useClock();
  const { state, settings, tasks, setSettings } = useData();
  const list = useOverviews();
  const current = today.slice(0, 7);
  const [month, setMonth] = useState(current);
  const first: ISODate = month + '-01';
  const own = settings.months?.[month] ?? {};
  const { free } = useMemo(() => monthFree(settings, month, state.progress, tasks), [settings, month, state.progress, tasks]);
  const need = useMemo(() => miageNeed(tasks, state.progress, first > today ? first : today), [tasks, state.progress, first, today]);
  const b = budgetOf(settings, month, free, need);
  const msg = budgetMessage(b);
  const parts = breakdown(settings, month);
  const miageSeg = Math.min(b.miage, Math.max(b.need, b.floor));
  const gapSeg = Math.max(0, b.miage - miageSeg);
  const set = (d: MonthDomain, level: Level | null) => setSettings({ months: { [month]: { [d]: level } } });
  const fill = () => { const changes = fillGap(settings, month, free, need); if (Object.keys(changes).length) { setSettings({ months: { [month]: changes } }); haptic([10, 30, 10]); } };
  const proposal = b.gap >= GAP_MIN ? fillGap(settings, month, free, need) : {};
  const label = (id: MonthDomain) => MONTH_DOMAINS.find((m) => m.id === id)!;
  const seg = (m: number) => `${free ? (100 * m) / free : 0} 1 0`;

  return (
    <>
      <PageHead eyebrow="Mes domaines" title={monthLabel(month)} />
      <div className="daynav">
        <button type="button" className="icon" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Mois précédent">‹</button>
        {month !== current && <button type="button" className="btn small" onClick={() => setMonth(current)}>Ce mois-ci</button>}
        <button type="button" className="icon" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Mois suivant" style={{ marginLeft: 'auto' }}>›</button>
      </div>
      <p className="muted">Choisis l'intensité de chaque domaine pour ce mois : le planning de tous les jours se recalcule, dans la limite de ton temps libre.</p>

      <section className="card budget" aria-label="Budget de temps du mois">
        <div className="sectionhead"><h2>Mon temps libre</h2><span className="mono muted">{hours(free)} / jour</span></div>
        <div className="stack" role="img" aria-label={`${hours(b.reserved)} réservées aux domaines, ${hours(miageSeg)} aux cours MIAGE, ${hours(gapSeg)} sans usage, sur ${hours(free)} libres par jour`}>
          {parts.map((p) => <i key={p.id} style={{ ...dc(p.id), flex: seg(p.min), background: 'var(--df)' }} />)}
          <i className="miage" style={{ flex: seg(miageSeg) }} />
          {gapSeg > 0 && <i className="gap" style={{ flex: seg(gapSeg) }} />}
        </div>
        <div className="legend2">
          {parts.map((p) => <span key={p.id} style={dc(p.id)}><i />{DOM[p.id].name} {hours(p.min)}</span>)}
          <span style={dc('miage')}><i />Cours MIAGE {hours(miageSeg)}</span>
          {gapSeg > 0 && <span><i style={{ background: 'transparent', border: '1px dashed var(--muted)' }} />Sans usage {hours(gapSeg)}</span>}
        </div>
        <p className={'bmsg ' + msg.tone} role="status">{msg.text}</p>
        <div className="row muted" style={{ fontSize: 14 }}><span>{b.active} / {MAX_ACTIVE} domaines actifs (hors MIAGE)</span><span>MIAGE : au moins {hours(b.floor)} par jour</span></div>
        {Object.keys(proposal).length > 0 && (
          <div className="quick" style={{ marginTop: 0 }}>
            <button type="button" className="btn primary" onClick={fill}>Combler automatiquement</button>
            <span className="muted" style={{ alignSelf: 'center', fontSize: 14 }}>{Object.entries(proposal).map(([id, l]) => `${DOM[id as MonthDomain].name} → ${LEVEL_LABEL[l as Level]}`).join(' · ')}</span>
          </div>
        )}
      </section>

      <div className="doms-grid">
        {list.map((o, i) => {
          const m = label(o.id), s = status(o), chosen = levelOf(settings, o.id, month + '-15');
          const blocked = LEVELS.filter((l) => (l !== 'off' || m.canBeOff)).map((l) => ({ l, v: canChoose(settings, month, o.id, l, free) })).filter((x) => !x.v.ok);
          return (
            <section className="card dom" key={o.id} style={{ ...dc(o.id), ['--n' as string]: i }} aria-label={DOM[o.id].name}>
              <div className="row">
                <h2 style={{ fontSize: 19 }}><Link to={`/dom/${o.id}`} className="domlink"><span className="ldot" aria-hidden="true" /> {DOM[o.id].name}</Link></h2>
                <span className={'stag ' + s.cls}>{s.text}</span>
              </div>
              {o.pct !== null ? (
                <>
                  <div className="row muted" style={{ marginTop: 6 }}><span>{o.done} / {o.total} {o.id === 'miage' ? 'tâches' : 'étapes'}</span><span>{o.eta ? `fin vers le ${fmt(o.eta)}` : o.pct >= 100 ? 'terminé' : 'rythme à mesurer'}</span></div>
                  <Bar pct={o.pct} domain={o.id} />
                  {o.next && <p className="muted">Prochaine : <b style={{ color: 'var(--ink)' }}>{o.next}</b></p>}
                </>
              ) : <p className="muted" style={{ marginTop: 6 }}>{DOM[o.id].blurb}</p>}
              <Spark values={o.spark} label={`Heures par semaine, ${DOM[o.id].name}`} />
              <div className="lv-seg" role="radiogroup" aria-label={`Intensité : ${m.label}`}>
                {LEVELS.filter((l) => l !== 'off' || m.canBeOff).map((l) => {
                  const v = canChoose(settings, month, o.id, l, free);
                  return <button key={l} type="button" role="radio" aria-checked={chosen === l} disabled={!v.ok} title={v.reason} onClick={() => set(o.id, l)}>{LEVEL_LABEL[l]}</button>;
                })}
              </div>
              <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>{m.hint[chosen]}</p>
              {blocked[0] && <p className="blocked" role="note">{LEVEL_LABEL[blocked[0].l]} indisponible : {blocked[0].v.reason}</p>}
              {own[o.id] && monthPlanFor(settings, shiftMonth(month, -1) + '-15')?.[o.id] !== undefined && <div className="quick" style={{ marginTop: 4 }}><button type="button" className="btn small" onClick={() => set(o.id, null)}>Comme le mois précédent</button></div>}
            </section>
          );
        })}
      </div>
      <p className="muted" style={{ fontSize: 14 }}>Le sport, les jours sur site et les horaires se règlent dans <Link to="/settings" style={{ color: 'var(--accent)', fontWeight: 700 }}>Réglages</Link>.</p>
    </>
  );
}
