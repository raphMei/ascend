import { Link } from 'react-router-dom';
import { addDays, fmt } from '@/core/dates';
import { hours } from '@/core/format';
import { byId } from '@/content/miage/subjects';
import { SKIP, type Change } from '@/domain/schedule';
import { useClock } from '@/hooks/useClock';
import { useSchedule } from '@/hooks/useSchedule';
import { useData } from '@/state/DataContext';

/** Journal discret du réajustement automatique. Rien à valider : le planning est déjà ajusté.
    Replié par défaut ; déplié, il explique chaque déplacement et permet de revenir en arrière si on le souhaite. */
export function AdjustmentsCard() {
  const sched = useSchedule();
  const { setProgress } = useData();
  const { today } = useClock();
  if (!sched) return null;

  const soon = addDays(today, 6);
  const rows = sched.changes.filter((c) => c.reason === 'retard' || c.reason === 'epingle' || c.reason === 'abandon' || (c.to !== null && c.to <= soon));
  if (!rows.length && !sched.unplaced.length) return null;

  const pin = (id: string, value: string | null) => setProgress({ pins: { [id]: value } });
  const moved = rows.filter((c) => c.reason !== 'abandon').length;
  const abandoned = rows.filter((c) => c.reason === 'abandon').length;
  const summary = [
    moved > 0 ? `${moved} tâche${moved > 1 ? 's' : ''} déplacée${moved > 1 ? 's' : ''}` : '',
    abandoned > 0 ? `${abandoned} abandonnée${abandoned > 1 ? 's' : ''}` : ''
  ].filter(Boolean).join(' · ');

  const undo = (c: Change) => {
    if (c.reason === 'abandon') return <button type="button" className="linkbtn" onClick={() => pin(c.taskId, today)}>Reprendre aujourd'hui</button>;
    if (c.reason === 'epingle') return <button type="button" className="linkbtn" onClick={() => pin(c.taskId, null)}>Annuler ma date</button>;
    return (
      <>
        {c.from >= today && c.to !== c.from && <button type="button" className="linkbtn" onClick={() => pin(c.taskId, c.from)}>Remettre au {fmt(c.from)}</button>}
        {c.to !== today && <button type="button" className="linkbtn" onClick={() => pin(c.taskId, today)}>Faire aujourd'hui</button>}
        {c.reason !== 'avance' && <button type="button" className="linkbtn" onClick={() => pin(c.taskId, SKIP)}>Laisser tomber</button>}
      </>
    );
  };

  return (
    <section aria-label="Ajustements automatiques du planning">
      <details className="autolog">
        <summary><span aria-hidden="true">↻</span> Planning ajusté automatiquement{summary ? ` · ${summary}` : ''}</summary>
        <div className="autolog-body">
          {sched.unplaced.length > 0 && (
            <p className="muted" role="note">
              {sched.unplaced.length} tâche{sched.unplaced.length > 1 ? 's' : ''} ne tien{sched.unplaced.length > 1 ? 'nent' : 't'} plus avant la dernière échéance : les plus importantes sont placées en premier. Un mois « intensif » dans <Link to="/month" style={{ color: 'var(--accent)', fontWeight: 700 }}>Mon mois</Link> en rattrape davantage.
            </p>
          )}
          {rows.map((c) => (
            <div className="autolog-row" key={c.taskId + c.reason}>
              <div style={{ fontWeight: 500 }}>{c.title}</div>
              <div className="muted" style={{ fontSize: 14 }}>{byId[c.subject]?.short ?? ''} · {hours(c.minutes)} · {c.why}</div>
              <div className="autolog-actions">{undo(c)}</div>
            </div>
          ))}
          <p className="muted" style={{ fontSize: 13 }}>Ce réajustement est automatique : tu n'as rien à valider. Il se désactive dans Réglages.</p>
        </div>
      </details>
    </section>
  );
}
