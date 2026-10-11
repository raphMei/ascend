import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** Fenêtre modale accessible : Échap ou clic sur le fond pour fermer, focus placé dans la fenêtre. */
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('input, select, button')?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus(); };
  }, [onClose]);
  // Rendu dans <body> : un ancêtre animé (transform) ne doit pas piéger le positionnement « fixed » ni passer sous la navigation.
  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal card" role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <div className="sectionhead"><h2>{title}</h2><button type="button" className="btn small" onClick={onClose} aria-label="Fermer">✕</button></div>
        {children}
      </div>
    </div>,
    document.body
  );
}
