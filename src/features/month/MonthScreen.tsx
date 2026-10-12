import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { monthLabel, shiftMonth } from '@/core/dates';
import { hours } from '@/core/format';
import { LEVELS, LEVEL_LABEL, MONTH_DOMAINS, monthPlanFor } from '@/domain/month';
import { monthLoad } from '@/domain/month-load';
import type { Level, MonthDomain } from '@/domain/types';
import { PageHead } from '@/components/PageHead';
import { useClock } from '@/hooks/useClock';
import { useData } from '@/state/DataContext';


/** « Mon mois » : choisir l'intensité de chaque domaine pour le mois ; le planning de tous les jours s'adapte. */
export function MonthScreen() {
  const { today } = useClock();
  const { state, settings, tasks, setSettings } = useData();
  const current = today.slice(0, 7);
  const [month, setMonth] = useState(current);
  const plan = monthPlanFor(settings, month + '-01') ?? {};
  const own = settings.months?.[month] ?? {};
  const load = useMemo(() => monthLoad(settings, month, state.progress, tasks), [settings, month, state.progress, tasks]);
  const set = (d: MonthDomain, level: Level | null) => setSettings({ months: { [month]: { [d]: level } } });
  const pct = Math.min(100, Math.round(load.ratio * 100));

  return (
    <>
      <PageHead eyebrow="Mon mois" title={monthLabel(month)} />
      <div className="daynav">
        <button type="button" className="icon" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Mois précédent">‹</button>
        {month !== current && <button type="button" className="btn small" onClick={() => setMonth(current)}>Ce mois-ci</button>}
        <button type="button" className="icon" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Mois suivant" style={{ marginLeft: 'auto' }}>›</button>
      </div>
      <p className="muted">Choisis l'intensité de chaque domaine pour ce mois. Le planning de tous les jours s'adapte tout de suite, et un mois sans réglage reprend celui d'avant.</p>

      <section className="card" aria-label="Charge du mois">
        <div className="sectionhead"><h2>Ma charge</h2><span className="mono muted">{pct}%</span></div>
        <div className="bar" style={{ marginTop: 10 }}><i style={{ width: `${pct}%`, background: pct > 75 ? 'var(--late)' : 'var(--accent)' }} /></div>
        <p className="muted" style={{ marginTop: 8 }}>
          Il te reste en moyenne <b style={{ color: 'var(--ink)' }}>{hours(load.freeAvg)}</b> libres par jour (hors Chabbat) ; tes domaines en réservent <b style={{ color: 'var(--ink)' }}>{hours(load.reservedAvg)}</b>.
        </p>
        {pct > 75 && <p className="warn" role="alert" style={{ marginTop: 10 }}>Tu réserves presque tout ton temps libre : il restera très peu de place pour les cours MIAGE, et le planning devra décaler beaucoup de tâches. Allège un domaine.</p>}
      </section>

      {MONTH_DOMAINS.map(({ id, label: name, canBeOff, hint }) => {
        const chosen = plan[id];
        return (
          <section className="card" key={id}>
            <h2 style={{ fontSize: 20 }}>{name}</h2>
            <div className="quick" role="radiogroup" aria-label={`Intensité : ${name}`} style={{ marginTop: 10 }}>
              {LEVELS.filter((l) => l !== 'off' || canBeOff).map((l) => (
                <button key={l} type="button" role="radio" aria-checked={chosen === l} className="btn small" style={chosen === l ? { outline: '2px solid var(--accent)', fontWeight: 700 } : undefined} onClick={() => set(id, l)}>{LEVEL_LABEL[l]}</button>
              ))}
            </div>
            <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>
              {chosen ? hint[chosen] : 'Réglage par défaut (celui de la page Réglages).'}
            </p>
            {own[id] && <div className="quick" style={{ marginTop: 4 }}><button type="button" className="btn small" onClick={() => set(id, null)}>Comme le mois précédent</button></div>}
          </section>
        );
      })}
      <p className="muted" style={{ fontSize: 14 }}>Les minutes exactes par défaut se règlent dans <Link to="/settings" style={{ color: 'var(--accent)', fontWeight: 700 }}>Réglages</Link>.</p>
    </>
  );
}
