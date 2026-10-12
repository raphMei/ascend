import { useEffect, useRef, type TouchEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDays, type ISODate } from '@/core/dates';

const MIN_DX = 70;      // distance horizontale minimale d'un balayage (px)
const MAX_DY = 45;      // tolérance verticale : un défilement n'est pas un balayage

/** Changer de jour sans viser les flèches : glisser vers la gauche (jour suivant) ou la droite (jour précédent),
    flèches ← → du clavier, « T » pour revenir à aujourd'hui. Ignoré dans les champs de saisie et pendant une fenêtre ouverte. */
export function useDayNavigation(date: ISODate, today: ISODate) {
  const navigate = useNavigate();
  const go = (d: ISODate) => navigate(d === today ? '/today' : `/today/${d}`);
  const goRef = useRef(go);
  goRef.current = go;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable)) return;
      if (document.querySelector('[role="dialog"]')) return;
      if (e.key === 'ArrowLeft') goRef.current(addDays(date, -1));
      else if (e.key === 'ArrowRight') goRef.current(addDays(date, 1));
      else if (e.key === 't' || e.key === 'T') goRef.current(today);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [date, today]);

  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onTouchStart: (e: TouchEvent) => {
      const el = e.target as HTMLElement;
      start.current = el.closest('input, select, textarea, [role="dialog"]') ? null : { x: e.touches[0].clientX, y: e.touches[0].clientY };
    },
    onTouchEnd: (e: TouchEvent) => {
      const s = start.current; start.current = null;
      if (!s) return;
      const dx = e.changedTouches[0].clientX - s.x, dy = e.changedTouches[0].clientY - s.y;
      if (Math.abs(dx) >= MIN_DX && Math.abs(dy) <= MAX_DY && Math.abs(dx) > 2 * Math.abs(dy)) go(addDays(date, dx < 0 ? 1 : -1));
    }
  };
}
