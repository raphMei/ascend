import { dur } from '@/core/format';
import { CALIB, type CalibRow } from '@/domain/calibration';
import { DOM } from '@/domain/domains';
import type { DomainId } from '@/domain/types';
import { useData } from '@/state/DataContext';

const KIND: Record<string, string> = {
  miage: 'MIAGE (toutes tâches)', 'miage:daily': 'MIAGE · cours du jour', 'miage:fiche': 'MIAGE · fiches', 'miage:rev': 'MIAGE · révisions',
  'miage:proj': 'MIAGE · projets', 'miage:setup': 'MIAGE · mise en place', 'miage:org': 'MIAGE · organisation'
};
const label = (c: string) => KIND[c] ?? DOM[c as DomainId]?.name ?? c;
const coef = (x: number) => '×' + x.toFixed(1).replace('.', ',');

function verdict(r: CalibRow): string {
  if (!r.own) return `${r.n}/${CALIB.MIN_N} mesures : ` + (r.category.startsWith('miage:') && r.coef !== 1 ? 'suit le coefficient MIAGE' : "pas encore d'ajustement");
  if (r.coef === 1) return 'conforme au prévu';
  return r.coef > 1 ? `${Math.round((r.coef - 1) * 100)} % plus long que prévu` : `${Math.round((1 - r.coef) * 100)} % plus court que prévu`;
}

/** Durées réelles mesurées au minuteur, par type de tâche, et le coefficient appliqué au planning MIAGE. */
export function CalibrationCard() {
  const { calibration: c, settings } = useData();
  const off = settings.calibrate === false;
  return (
    <section className="card" aria-label="Durées réelles">
      <h2>Tes durées réelles</h2>
      <p className="muted" style={{ margin: '4px 0 6px' }}>
        Mesurées au minuteur quand tu coches un bloc. {off ? 'Ajustement désactivé dans Réglages : le planning garde les durées prévues.' : 'Les tâches MIAGE sont planifiées avec ces coefficients (les examens jamais).'}
      </p>
      {c.rows.length === 0 ? (
        <p className="muted">Lance le minuteur d'une tâche, puis coche-la à la fin : les premières mesures apparaissent ici.</p>
      ) : (
        <div className="list">
          {c.rows.map((r) => (
            <div className="rate" key={r.category}>
              <span style={{ fontWeight: r.category === 'miage' ? 700 : 500 }}>{label(r.category)}</span>
              <span className="mono muted" aria-label={`Coefficient ${coef(r.coef)}`}>{coef(r.coef)}</span>
              <span className="muted" style={{ fontSize: 13, gridColumn: '1 / -1' }}>{r.n} mesure{r.n > 1 ? 's' : ''} · prévu {dur(r.plannedMin)}, réel {dur(r.realMin)} · {verdict(r)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
