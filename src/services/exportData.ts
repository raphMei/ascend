import { todayISO } from '@/core/dates';
import type { DataState } from '@/state/reducer';

/** Télécharge toutes les données de l'utilisateur au format JSON (sauvegarde manuelle). */
export function exportData(state: Pick<DataState, 'days' | 'settings' | 'progress'>): void {
  const blob = new Blob([JSON.stringify({ days: state.days, settings: state.settings, progress: state.progress }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'ascend-' + todayISO() + '.json'; a.click();
  URL.revokeObjectURL(url);
}
