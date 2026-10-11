import { useState } from 'react';
import { Link } from 'react-router-dom';
import { addDays, fmt } from '@/core/dates';
import { hours } from '@/core/format';
import { byId } from '@/content/miage/subjects';
import { SKIP, type Change } from '@/domain/schedule';
import { useClock } from '@/hooks/useClock';
import { useSchedule } from '@/hooks/useSchedule';
import { useData } from '@/state/DataContext';

const SHOWN = 8;

/** « Planning ajusté automatiquement » : ce qui a été déplacé, pourquoi, et comment l'annuler en un toucher. */
export function AdjustmentsCard() {
  const sched = useSchedule();
  const { setProgress, setSettings } = useData();
  const { today } = useClock();
  const [all, setAll] = useState(false);
  if (!sched) return null;

  // On montre ce qui concerne la semaine qui vient ; le reste du déplacement est visible dans chaque journée.
  const soon = addDays(today, 6);
  const rows = sched.changes.filter((c) => c.reason === 'retard' || c.reason === 'epingle' || c.reason === 'abandon' || (c.to !== null && c.to <= soon));
  const unplaced = sched.unplaced.map((id) => byId[id.split(':')[0]] && id).filter(Boolean) as string[];
  if (!rows.length && !sched.notes.length && !sched.unplaced.length) return null;

  const pin = (id: string, value: string | null) => setProgress({ pins: { [id]: value } });
  const moved = rows.filter((c) => c.reason !== 'abandon').length;
  const abandoned = rows.filter((c) => c.reason === 'abandon').length;
  const visible = all ? rows : rows.slice(0, SHOWN);

  const actions = (c: Change) => {
    if (c.reason === 'abandon') return <button type="button" className="btn small" onClick={() => pin(c.taskId, today)}>Reprendre aujourd'hui</button>;
    if (c.reason === 'epingle') return <button type="button" className="btn small" onClick={() => pin(c.taskId, null)}>Annuler</button>;
    return (
      <>
        {c.from >= today && c.to !== c.from && <button type="button" className="btn small" onClick={() => pin(c.taskId, c.from)}>Remettre au {fmt(c.from)}</button>}
        {c.to !== today && <button type="button" className="btn small" onClick={() => pin(c.taskId, today)}>Faire aujourd'hui</button>}
        {c.reason !== 'avance' && <button type="button" className="btn small" onClick={() => pin(c.taskId, SKIP)}>Laisser tomber</button>}
      </>
    );
  };

  return (
    <section className="card" aria-label="Ajustements automatiques du planning">
      <div className="sectionhead"><h2>Planning ajusté</h2><span className="muted" style={{ fontSize: 14 }}>automatiquement</span></div>
      <p className="muted" style={{ margin: '4px 0 8px' }}>
        {moved > 0 ? `${moved} tâche${moved > 1 ? 's' : ''} déplacée${moved > 1 ? 's' : ''}` : 'Aucune tâche déplacée'}
        {abandoned > 0 ? ` · ${abandoned} abandonnée${abandoned > 1 ? 's' : ''}` : ''}. Chaque changement est expliqué et s'annule en un toucher.
      </p>
      {sched.notes.map((n) => <p key={n} className="warn" style={{ marginBottom: 8 }}>{n}</p>)}
      {unplaced.length > 0 && (
        <p className="warn" role="alert" style={{ marginBottom: 8 }}>
          <b>{unplaced.length} tâche{unplaced.length > 1 ? 's' : ''} ne tien{unplaced.length > 1 ? 'nent' : 't'} plus avant la dernière échéance.</b> Les plus importantes sont placées en premier. Laisse tomber ce qui compte le moins, ou passe un mois en « intensif » dans <Link to="/month" style={{ color: 'var(--accent)', fontWeight: 700 }}>Mon mois</Link>.
        </p>
      )}
      {visible.length > 0 && (
        <div className="list">
          {visible.map((c) => (
            <div key={c.taskId + c.reason}>
              <div style={{ fontWeight: 500 }}>{c.title}</div>
              <div className="muted" style={{ fontSize: 14 }}>{byId[c.subject]?.short ?? ''} · {hours(c.minutes)} · {c.why}</div>
              <div className="quick" style={{ marginTop: 8 }}>{actions(c)}</div>
            </div>
          ))}
        </div>
      )}
      {rows.length > SHOWN && <div className="quick"><button type="button" className="btn small" onClick={() => setAll(!all)}>{all ? 'Réduire' : `Voir les ${rows.length} changements`}</button></div>}
      <div className="quick"><button type="button" className="btn small" onClick={() => setSettings({ autoReschedule: false })}>Désactiver l'ajustement automatique</button></div>
    </section>
  );
}
