import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { haptic, tickSound } from '@/hooks/feedback';
import { useData } from '@/state/DataContext';
import { sparks } from '../fx/sparks';

const KEY = 'ascend-party';
const read = (): string => { try { return localStorage.getItem(KEY) ?? ''; } catch { return ''; } };
const write = (v: string) => { try { localStorage.setItem(KEY, v); } catch { /* stockage indisponible : on ignore */ } };

/** Vrai le temps d'une célébration : la journée vient d'atteindre 100 % pendant que l'application est ouverte
    (jamais au chargement, jamais deux fois le même jour). */
export function useDayCelebration(complete: boolean, date: string): [boolean, () => void] {
  const [show, setShow] = useState(false);
  const prev = useRef({ date, complete });
  useEffect(() => {
    if (prev.current.date === date && !prev.current.complete && complete && read() !== date) { write(date); setShow(true); }
    prev.current = { date, complete };
  }, [complete, date]);
  return [show, () => setShow(false)];
}

const MILESTONES = [7, 30, 100];

/** Célébration plein écran : journée à 100 %, avec la série en cours (et un message spécial aux paliers 7, 30, 100 jours). */
export function Celebration({ streak, onClose }: { streak: number; onClose: () => void }) {
  const { settings } = useData();
  const big = useRef<HTMLDivElement>(null);
  const milestone = MILESTONES.includes(streak);
  useEffect(() => {
    haptic([30, 60, 30, 60, 60]); tickSound(!!settings.ui?.sound, 1200);
    const ids = [0, 1, 2, 3, 4].map((i) => setTimeout(() => sparks(big.current, 22), i * 140));
    return () => ids.forEach(clearTimeout);
  }, [settings.ui?.sound]);
  return createPortal(
    <div className="party" role="dialog" aria-modal="true" aria-label="Journée terminée">
      <span className="eyebrow">Journée à 100 %</span>
      <div className="n" ref={big}>{streak}</div>
      <h2>{milestone ? `Palier : ${streak} jours d'affilée !` : streak > 1 ? "jours d'affilée" : 'jour'}</h2>
      <p className="muted">{milestone ? 'Un vrai cap, bien joué.' : 'Direct, régulier, solide.'}</p>
      <button type="button" className="btn primary" onClick={onClose} autoFocus>Continuer</button>
    </div>,
    document.body
  );
}
