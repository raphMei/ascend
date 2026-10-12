import { useState } from 'react';
import { createPortal } from 'react-dom';
import { clock, elapsedMs, overtimeMs, remainingMs } from '@/domain/timer';
import { haptic } from '@/hooks/feedback';
import { useTick } from '@/hooks/useTick';
import { cancelBlockTimer, extendBlockTimer, pauseBlockTimer, resumeBlockTimer, useActiveTimers, useSecondTick, type ActiveTimer } from '@/hooks/useTimer';
import { dc } from '../Icon';

const state = (a: ActiveTimer, now: number) => {
  const total = a.timer.total, over = overtimeMs(a.timer, now) > 0;
  const left = remainingMs(a.timer, now);
  return { over, text: over ? '+' + clock(overtimeMs(a.timer, now)) : clock(left), progress: Math.min(1, elapsedMs(a.timer, now) / total) };
};

function Ring({ p, r, w }: { p: number; r: number; w: number }) {
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox={`0 0 ${(r + w) * 2} ${(r + w) * 2}`} aria-hidden="true">
      <circle cx={r + w} cy={r + w} r={r} className="tr" strokeWidth={w} />
      <circle cx={r + w} cy={r + w} r={r} className="pg" strokeWidth={w} strokeDasharray={`${c * p} ${c}`} />
    </svg>
  );
}

/** Mode concentration plein écran : grand anneau de la couleur du domaine, temps géant, pause, +5 min, terminer. */
function FocusMode({ a, now, onClose }: { a: ActiveTimer; now: number; onClose: () => void }) {
  const tick = useTick();
  const s = state(a, now), b = a.meta.block, running = a.timer.kind === 'running';
  const finish = () => {
    tick(a.meta.date, b.scope === 'prog' ? { scope: 'prog', key: b.taskId! } : { scope: 'day', key: b.id }, true, b);
    haptic([20, 40, 20]); onClose();
  };
  return createPortal(
    <div className="focusmode" style={dc(b.domain)} role="dialog" aria-modal="true" aria-label={`Concentration : ${b.title}`}>
      <span className="eyebrow">Concentration</span>
      <div className="fring"><Ring p={s.progress} r={118} w={14} /><div className="tm" role="timer" aria-live="off">{s.text}<small>{b.title}</small></div></div>
      <div className="acts">
        <button type="button" className="btn" onClick={() => (running ? pauseBlockTimer(a.key) : resumeBlockTimer(a.key))}>{running ? '⏸ Pause' : '▶ Reprendre'}</button>
        <button type="button" className="btn" onClick={() => extendBlockTimer(a.key, 5)}>+5 min</button>
        <button type="button" className="btn main" onClick={finish}>Terminer</button>
      </div>
      <button type="button" className="linkbtn" onClick={onClose}>Réduire</button>
    </div>,
    document.body
  );
}

/** Mini-lecteur : capsule de verre au-dessus de la navigation tant qu'un minuteur est lancé ; un toucher l'ouvre en plein écran. */
export function MiniPlayer() {
  const list = useActiveTimers();
  const now = useSecondTick(list.some((x) => x.timer.kind === 'running'));
  const [focus, setFocus] = useState(false);
  const a = list[list.length - 1];
  if (!a) return null;
  const s = state(a, now), b = a.meta.block;
  return (
    <>
      <div className="miniplayer card" style={dc(b.domain)}>
        <button type="button" className="mini-open" onClick={() => setFocus(true)} aria-label={`Ouvrir le mode concentration : ${b.title}`}>
          <span className="mring"><Ring p={s.progress} r={16} w={4} /></span>
          <span className="mtx"><b>{b.title}</b><span className="mono">{s.text}{s.over ? ' · dépassement' : ''}</span></span>
        </button>
        <button type="button" className="btn small" onClick={() => cancelBlockTimer(a.key)} aria-label="Arrêter le minuteur">✕</button>
      </div>
      {focus && <FocusMode a={a} now={now} onClose={() => setFocus(false)} />}
    </>
  );
}
