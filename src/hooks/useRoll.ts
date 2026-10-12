import { useEffect, useRef, useState } from 'react';
import { reducedMotion } from './feedback';

/** Nombre qui « défile » vers sa nouvelle valeur (compteur). Affiche la valeur tout de suite au premier rendu et si le mouvement est réduit. */
export function useRoll(target: number, ms = 700): number {
  const [shown, setShown] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    if (cur.current === target) return;
    const from = cur.current;
    if (reducedMotion() || typeof requestAnimationFrame !== 'function') { cur.current = target; setShown(target); return; }
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      cur.current = Math.round(from + (target - from) * (1 - Math.pow(1 - k, 3)));
      setShown(cur.current);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return shown;
}
