import { fmtLong } from '@/core/dates';
import { dur } from '@/core/format';
import type { Forecast } from '@/domain/forecast';

/** « Au rythme actuel, tu termines le … » : prévision d'achèvement d'un parcours. */
export function ForecastCard({ forecast: f }: { forecast: Forecast }) {
  if (f.finished) return null;
  return (
    <section className="card" aria-label="Prévision d'achèvement">
      <h2>Prévision</h2>
      {f.eta && f.days != null ? (
        <p style={{ marginTop: 6 }}>
          Au rythme des 14 derniers jours (<b>{dur(Math.round(f.perDayMin))} par jour</b>), il te reste <b>{dur(f.remainingMin)}</b> :
          tu termines <b>{f.days > 730 ? 'dans plus de deux ans' : 'vers le ' + fmtLong(f.eta)}</b>.
        </p>
      ) : (
        <p className="muted" style={{ marginTop: 6 }}>Il te reste {dur(f.remainingMin)}. Coche tes premières étapes : la prévision apparaît dès qu'un rythme existe.</p>
      )}
    </section>
  );
}
