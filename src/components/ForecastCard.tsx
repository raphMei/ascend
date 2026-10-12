import { fmtLong } from '@/core/dates';
import { dur } from '@/core/format';
import type { PathPace } from '@/domain/calibration';
import type { Forecast } from '@/domain/forecast';

/** « Au rythme actuel, tu termines le … » : prévision d'achèvement d'un parcours. */
/** `pace` (facultatif) : temps de séance réellement passé par minute d'étape prévue, sur 28 jours. */
export function ForecastCard({ forecast: f, pace }: { forecast: Forecast; pace?: PathPace | null }) {
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
      {pace && pace.ratio !== 1 && (
        <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>
          Sur {pace.window} jours : {dur(pace.sessionMin)} de séances pour {dur(pace.stepMin)} d'étapes prévues ({pace.steps} étapes), soit ×{pace.ratio.toString().replace('.', ',')}.
          {' '}En séances, le reste représente plutôt <b>{dur(Math.round(f.remainingMin * pace.ratio))}</b>.
        </p>
      )}
    </section>
  );
}
