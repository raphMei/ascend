import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fmt, monthLabel, shiftMonth } from '@/core/dates';
import { hours } from '@/core/format';
import { DOM } from '@/domain/domains';
import { LEVELS, LEVEL_LABEL, MONTH_DOMAINS, monthPlanFor } from '@/domain/month';
import { monthLoad } from '@/domain/month-load';
import type { Overview } from '@/domain/overview';
import type { Level, MonthDomain } from '@/domain/types';
import { Bar } from '@/components/Bar';
import { dc } from '@/components/Icon';
import { PageHead } from '@/components/PageHead';
import { Spark } from '@/components/learning/Spark';
import { useClock } from '@/hooks/useClock';
import { useOverviews } from '@/hooks/useOverviews';
import { useData } from '@/state/DataContext';
import { DOMAIN_MODULES } from './registry';

/** Domaines de suivi personnel (santé, routine, finances) : accessibles, mais en retrait : le cœur d'Ascend est l'apprentissage. */
const PERSONAL = new Set(['matin', 'sport', 'alim', 'sommeil', 'finances']);

/** Choix de l'intensité d'un domaine pour le mois : le planning de tous les jours se recalcule tout de suite. */
function LevelPicker({ id, name, canBeOff, hint, chosen, onPick }: { id: MonthDomain; name: string; canBeOff: boolean; hint: Record<Level, string>; chosen?: Level; onPick: (id: MonthDomain, l: Level) => void }) {
  return (
    <>
      <div className="lv-seg" role="radiogroup" aria-label={`Intensité : ${name}`}>
        {LEVELS.filter((l) => l !== 'off' || canBeOff).map((l) => (
          <button key={l} type="button" role="radio" aria-checked={chosen === l} onClick={() => onPick(id, l)}>{LEVEL_LABEL[l]}</button>
        ))}
      </div>
      <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>{chosen ? hint[chosen] : 'Réglage par défaut (celui de la page Réglages).'}</p>
    </>
  );
}

function status(o: Overview): { text: string; cls: string } {
  if (o.level === 'off' || !o.active) return { text: 'En pause', cls: 'idle' };
  if (o.late > 0) return { text: `En retard de ${o.late}`, cls: 'late' };
  return { text: 'À jour', cls: 'ok' };
}

/** Mes domaines : où j'en suis dans chacun (avancement, retard, prochaine leçon, fin estimée, heures par semaine), et l'intensité de chaque domaine pour le mois. */
export function DomainsScreen() {
  const { today } = useClock();
  const { state, settings, tasks, setSettings } = useData();
  const list = useOverviews();
  const current = today.slice(0, 7);
  const [month, setMonth] = useState(current);
  const plan = monthPlanFor(settings, month + '-01') ?? {};
  const own = settings.months?.[month] ?? {};
  const load = useMemo(() => monthLoad(settings, month, state.progress, tasks), [settings, month, state.progress, tasks]);
  const set = (d: MonthDomain, level: Level | null) => setSettings({ months: { [month]: { [d]: level } } });
  const pct = Math.min(100, Math.round(load.ratio * 100));
  const meta = (id: MonthDomain) => MONTH_DOMAINS.find((m) => m.id === id)!;
  const personal = DOMAIN_MODULES.filter((d) => PERSONAL.has(d.id));

  return (
    <>
      <PageHead eyebrow="Mes domaines" title={monthLabel(month)} />
      <div className="daynav">
        <button type="button" className="icon" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Mois précédent">‹</button>
        {month !== current && <button type="button" className="btn small" onClick={() => setMonth(current)}>Ce mois-ci</button>}
        <button type="button" className="icon" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Mois suivant" style={{ marginLeft: 'auto' }}>›</button>
      </div>
      <p className="muted">Choisis l'intensité de chaque domaine pour ce mois : le planning de tous les jours s'adapte tout de suite, et un mois sans réglage reprend celui d'avant.</p>

      <section className="card" aria-label="Charge du mois">
        <div className="sectionhead"><h2>Ma charge</h2><span className="mono muted">{pct}%</span></div>
        <div className="bar" style={{ marginTop: 10 }}><i style={{ width: `${pct}%`, background: pct > 75 ? 'var(--late)' : 'var(--accent)' }} /></div>
        <p className="muted" style={{ marginTop: 8 }}>
          Il te reste en moyenne <b style={{ color: 'var(--ink)' }}>{hours(load.freeAvg)}</b> libres par jour (hors Chabbat) ; tes domaines en réservent <b style={{ color: 'var(--ink)' }}>{hours(load.reservedAvg)}</b>.
        </p>
        {pct > 75 && <p className="warn" role="alert" style={{ marginTop: 10 }}>Tu réserves presque tout ton temps libre : il restera très peu de place pour les cours MIAGE, et le planning devra décaler beaucoup de leçons. Allège un domaine.</p>}
      </section>

      <div className="doms-grid">
        {list.map((o, i) => {
          const m = meta(o.id), s = status(o), chosen = plan[o.id];
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
              <LevelPicker id={o.id} name={m.label} canBeOff={m.canBeOff} hint={m.hint} chosen={chosen ?? undefined} onPick={set} />
              {own[o.id] && <div className="quick" style={{ marginTop: 4 }}><button type="button" className="btn small" onClick={() => set(o.id, null)}>Comme le mois précédent</button></div>}
            </section>
          );
        })}
      </div>

      <details className="card flat">
        <summary><b>Mes suivis personnels</b> <span className="muted">· routine, sport, repas, sommeil, finances</span></summary>
        <p className="muted" style={{ margin: '6px 0 12px' }}>Ce sont des temps réservés dans ton planning : rien à cocher ici. Les mesures (poids, eau, nuit) restent saisissables pour tes graphiques.</p>
        <div className="grid three">{personal.map(({ id, Card }) => <Card key={id} />)}</div>
        {(['sport', 'finances'] as const).map((id) => {
          const m = meta(id);
          return (
            <section key={id} style={{ marginTop: 14 }}>
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>{m.label}</h3>
              <LevelPicker id={id} name={m.label} canBeOff={m.canBeOff} hint={m.hint} chosen={plan[id] ?? undefined} onPick={set} />
            </section>
          );
        })}
      </details>
      <p className="muted" style={{ fontSize: 14 }}>Les minutes exactes par défaut se règlent dans <Link to="/settings" style={{ color: 'var(--accent)', fontWeight: 700 }}>Réglages</Link>.</p>
    </>
  );
}
