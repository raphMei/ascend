import { useEffect, useRef } from 'react';
import { clock } from '@/domain/timer';
import { useTimer, type TimerMeta } from '@/hooks/useTimer';

/** Minuteur de concentration d'un bloc : démarrer, pause, reprendre, recommencer. À la fin : vibration et proposition de cocher.
    Après la fin, il continue de compter le dépassement (« +04:12 ») : le temps réel sert à recalibrer les durées.
    `onComplete` coche le bloc ; c'est la coche qui lit et enregistre le temps écoulé (voir `takeElapsed`). */
export function FocusTimer({ id, minutes, done, onComplete, meta }: { id: string; minutes: number; done: boolean; onComplete: () => void; meta?: TimerMeta }) {
  const { timer, finished, remaining, overtime, start, pause, resume, reset } = useTimer(id, minutes, meta);
  const buzzed = useRef(false);
  useEffect(() => {
    if (finished && !buzzed.current) { buzzed.current = true; try { navigator.vibrate?.([200, 100, 200]); } catch { /* pas de vibration */ } }
    if (!finished) buzzed.current = false;
  }, [finished]);

  if (done && !timer) return null;
  return (
    <div className="focus" role="group" aria-label="Minuteur de concentration">
      <span className={'focus-clock' + (finished ? ' end' : '')} role="timer" aria-live="off">{finished && overtime >= 1000 ? '+' + clock(overtime) : clock(remaining)}</span>
      {!timer && <button type="button" className="btn small" onClick={start}>▶ Démarrer ({minutes} min)</button>}
      {timer?.kind === 'running' && !finished && <button type="button" className="btn small" onClick={pause}>⏸ Pause</button>}
      {timer?.kind === 'paused' && <button type="button" className="btn small" onClick={resume}>▶ Reprendre</button>}
      {timer && !finished && <button type="button" className="btn small" onClick={reset}>Recommencer</button>}
      {finished && (
        <>
          <span role="status">Séance terminée 🎉</span>
          {!done && <button type="button" className="btn small primary" onClick={onComplete}>Marquer comme fait</button>}
          <button type="button" className="btn small" onClick={reset}>Fermer</button>
        </>
      )}
    </div>
  );
}
