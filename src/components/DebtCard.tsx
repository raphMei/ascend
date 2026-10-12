import { useMemo, useState } from 'react';
import { fmt } from '@/core/dates';
import { hours } from '@/core/format';
import { byId } from '@/content/miage/subjects';
import { DEBT, debtOf, resetPatch, resetProposal, undoResetPatch } from '@/domain/debt';
import { useClock } from '@/hooks/useClock';
import { useSchedule } from '@/hooks/useSchedule';
import { useData } from '@/state/DataContext';
import { Modal } from './Modal';

const frDays = (d: number) => d.toString().replace('.', ',');

/** Retard MIAGE en jours de travail. Au-delà de 3 jours : proposition de « Repartir à zéro », que tu valides.
    Après une remise à zéro faite aujourd'hui : bouton pour tout annuler. */
export function DebtCard() {
  const sched = useSchedule();
  const { state, tasks, setProgress } = useData();
  const { today } = useClock();
  const [open, setOpen] = useState(false);
  const debt = useMemo(() => (sched ? debtOf(tasks, state.progress, sched, today) : null), [sched, tasks, state.progress, today]);
  const proposal = useMemo(() => (debt ? resetProposal(debt) : null), [debt]);
  const [unchecked, setUnchecked] = useState<Set<string>>(new Set());
  const undo = undoResetPatch(state.progress, today);

  if (undo) {
    const n = state.progress.resets?.[today]?.length ?? 0;
    return (
      <div className="warn" role="status">
        Tu es reparti à zéro aujourd'hui : {n} tâche{n > 1 ? 's' : ''} laissée{n > 1 ? 's' : ''} de côté.{' '}
        <button type="button" className="linkbtn" onClick={() => setProgress(undo)}>Annuler</button>
      </div>
    );
  }
  if (!debt?.over || !proposal || !proposal.drop.length) return null;

  const chosen = proposal.drop.filter((t) => !unchecked.has(t.id));
  const savedMin = chosen.reduce((a, t) => a + Math.max(15, Math.round(t.h * 60)), 0);
  const toggle = (id: string) => setUnchecked((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const apply = () => { setProgress(resetPatch(chosen.map((t) => t.id), today)); setOpen(false); };

  return (
    <>
      <div className="warn" role="note">
        <b>{debt.days != null ? `${frDays(debt.days)} jours de retard MIAGE` : 'Gros retard MIAGE'}</b> (≈ {hours(debt.min)}, {debt.late.length} tâche{debt.late.length > 1 ? 's' : ''}).
        {' '}Le report automatique remplit les jours à venir sans jamais rattraper.{' '}
        <button type="button" className="linkbtn" onClick={() => setOpen(true)}>Repartir à zéro…</button>
      </div>
      {open && (
        <Modal title="Repartir à zéro" onClose={() => setOpen(false)}>
          <p className="muted" style={{ marginTop: 4 }}>
            Pour revenir à {DEBT.TARGET_DAYS} jour de retard, je te propose de laisser tomber les tâches les moins importantes, les plus anciennes d'abord.
            Révisions, projets et examens restent toujours. Tu peux décocher ce que tu veux garder.
          </p>
          <div className="list" style={{ marginTop: 8 }}>
            {proposal.drop.map((t) => (
              <label className="row" key={t.id} style={{ cursor: 'pointer', minHeight: 44 }}>
                <span><span style={{ fontWeight: 500 }}>{t.t}</span><br /><span className="muted" style={{ fontSize: 13 }}>{byId[t.s]?.short ?? ''} · prévue {fmt(t.due)} · {hours(Math.max(15, Math.round(t.h * 60)))}</span></span>
                <input type="checkbox" checked={!unchecked.has(t.id)} onChange={() => toggle(t.id)} aria-label={`Laisser tomber « ${t.t} »`} style={{ width: 24, height: 24 }} />
              </label>
            ))}
          </div>
          {proposal.keep.length > 0 && <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>Gardées : {proposal.keep.length} tâche{proposal.keep.length > 1 ? 's' : ''} (dont révisions et projets).</p>}
          <div className="quick" style={{ marginTop: 12 }}>
            <button type="button" className="btn primary" disabled={!chosen.length} onClick={apply}>Laisser tomber {chosen.length} tâche{chosen.length > 1 ? 's' : ''} (≈ {hours(savedMin)})</button>
            <button type="button" className="btn" onClick={() => setOpen(false)}>Plus tard</button>
          </div>
          <p className="muted" style={{ fontSize: 13 }}>Annulable toute la journée depuis l'écran Aujourd'hui.</p>
        </Modal>
      )}
    </>
  );
}
