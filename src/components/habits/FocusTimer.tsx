import { useEffect, useRef } from 'react';
import { clock } from '@/domain/timer';
import { useTimer } from '@/hooks/useTimer';

/** Minuteur de concentration d'un bloc : démarrer, pause, reprendre, recommencer. À la fin : vibration et proposition de cocher. */
export function FocusTimer({ id, minutes, done, onComplete }: { id: string; minutes: number; done: boolean; onComplete: () => void }) {
  const { timer, finished, remaining, start, pause, resume, reset } = useTimer(id, minutes);
  const buzzed = useRef(false);
  useEffect(() => {
    if (finished && !buzzed.current) { buzzed.current = true; try { navigator.vibrate?.([200, 100, 200]); } catch { /* pas de vibration */ } }
    if (!finished) buzzed.current = false;
  }, [finished]);

  if (done && !timer) return null;
  return (
    <div className="focus" role="group" aria-label="Minuteur de concentration">
      <span className={'focus-clock' + (finished ? ' end' : '')} role="timer" aria-live="off">{clock(remaining)}</span>
      {!timer && <button type="button" className="btn small" onClick={start}>▶ Démarrer ({minutes} min)</button>}
      {timer?.kind === 'running' && !finished && <button type="button" className="btn small" onClick={pause}>⏸ Pause</button>}
      {timer?.kind === 'paused' && <button type="button" className="btn small" onClick={resume}>▶ Reprendre</button>}
      {timer && !finished && <button type="button" className="btn small" onClick={reset}>Recommencer</button>}
      {finished && (
        <>
          <span role="status">Séance terminée 🎉</span>
          {!done && <button type="button" className="btn small primary" onClick={() => { onComplete(); reset(); }}>Marquer comme fait</button>}
          <button type="button" className="btn small" onClick={reset}>Fermer</button>
        </>
      )}
    </div>
  );
}
