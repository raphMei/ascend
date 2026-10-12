import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** Feuille de verre qui monte du bas : menus d'appui long, actions rapides. Échap, fond ou ✕ pour fermer ; le focus y entre et en revient. */
export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('button')?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus(); };
  }, [onClose]);
  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal sheet" role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <div className="grab" aria-hidden="true" />
        <div className="sectionhead"><h2 style={{ fontSize: 20 }}>{title}</h2><button type="button" className="btn small" onClick={onClose} aria-label="Fermer">✕</button></div>
        {children}
      </div>
    </div>,
    document.body
  );
}
