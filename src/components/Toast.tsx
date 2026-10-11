import { useEffect } from 'react';
import { useData } from '@/state/DataContext';

/** Message éphémère (ex. écriture refusée et rétablie). Disparaît seul après 7 s ou au toucher. */
export function Toast() {
  const { state, dismissNotice } = useData();
  const message = state.notice;
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(dismissNotice, 7000);
    return () => clearTimeout(id);
  }, [message, dismissNotice]);
  if (!message) return null;
  return <div className="toast" role="alert" onClick={dismissNotice}>{message}</div>;
}
