import { useEffect, useSyncExternalStore } from 'react';

/* Message éphémère avec « Annuler » (passer une tâche, reporter…). Un seul à la fois : le nouveau remplace l'ancien. */
interface Undo { id: number; message: string; undo: () => void }
let current: Undo | null = null;
let seq = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export function showUndo(message: string, undo: () => void): void { current = { id: ++seq, message, undo }; emit(); }
const clear = () => { current = null; emit(); };

export function UndoToastHost() {
  const u = useSyncExternalStore(subscribe, () => current);
  useEffect(() => {
    if (!u) return;
    const id = setTimeout(() => { if (current?.id === u.id) clear(); }, 5000);
    return () => clearTimeout(id);
  }, [u]);
  if (!u) return null;
  return (
    <div className="undo" role="status">
      <span>{u.message}</span>
      <button type="button" className="linkbtn" onClick={() => { u.undo(); clear(); }}>Annuler</button>
    </div>
  );
}
