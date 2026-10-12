/** Réducteur de l'état des données. Pur et testable : aucune dépendance à React ni à Firebase. */
import { merge } from '@/core/merge';
import type { ISODate } from '@/core/dates';
import type { DayData, Progress, Settings } from '@/domain/types';
import type { AuthUser } from '@/services/types';

type SyncStatus = 'loading' | 'ok' | 'error' | 'demo';

export interface DataState {
  user: AuthUser | null;
  authReady: boolean;
  days: Record<ISODate, DayData>;       // users/{uid}/days/*
  settings: Partial<Settings>;          // users/{uid}/settings/main (surcharges)
  progress: Progress;                   // users/{uid}/progress/main
  sync: SyncStatus;
  error: string;
  /** Message affiché une fois (ex. écriture refusée), puis effacé. */
  notice: string | null;
  /** Quelles collections ont fourni leur premier état (nécessaire avant tout calcul qui écrit en base). */
  loaded: { days: boolean; settings: boolean; progress: boolean };
  /** Début de la fenêtre d'historique chargée (jours antérieurs non chargés). */
  historyFrom: ISODate;
}

export const initialState = (demo: boolean, historyFrom: ISODate = '0000-00-00'): DataState => ({
  user: null, authReady: false, days: {}, settings: {}, progress: { done: {} }, sync: demo ? 'demo' : 'loading', error: '',
  notice: null, historyFrom, loaded: { days: false, settings: false, progress: false }
});

export type Action =
  | { type: 'auth'; user: AuthUser | null; demo: boolean }
  | { type: 'days'; days: Record<ISODate, DayData> }
  | { type: 'settings'; settings: Partial<Settings> }
  | { type: 'progress'; progress: Progress }
  | { type: 'error'; code: string }
  | { type: 'ready'; error?: string }
  | { type: 'notice'; message: string | null }
  | { type: 'historyFrom'; from: ISODate }
  | { type: 'patchDay'; date: ISODate; patch: Record<string, unknown> }
  | { type: 'patchSettings'; patch: Record<string, unknown> }
  | { type: 'patchProgress'; patch: Record<string, unknown> };

export function reducer(s: DataState, a: Action): DataState {
  switch (a.type) {
    case 'auth':
      // Déconnexion : on efface les données locales.
      return a.user
        ? { ...s, user: a.user, authReady: true, sync: a.demo ? 'demo' : 'loading' }
        : { ...s, user: null, authReady: true, days: {}, settings: {}, progress: { done: {} }, loaded: { days: false, settings: false, progress: false } };
    case 'days': return { ...s, days: a.days, sync: s.sync === 'demo' ? 'demo' : 'ok', loaded: { ...s.loaded, days: true } };
    case 'settings': return { ...s, settings: a.settings, loaded: { ...s.loaded, settings: true } };
    case 'progress': return { ...s, progress: a.progress, loaded: { ...s.loaded, progress: true } };
    case 'error': return { ...s, sync: 'error', error: a.code };
    case 'notice': return { ...s, notice: a.message };
    case 'historyFrom': return { ...s, historyFrom: a.from };
    case 'ready': return { ...s, authReady: true, error: a.error ?? s.error };
    // Écritures optimistes : l'état local change tout de suite, le backend est notifié à part.
    case 'patchDay': return { ...s, days: { ...s.days, [a.date]: merge(s.days[a.date], a.patch) } };
    case 'patchSettings': return { ...s, settings: merge(s.settings, a.patch) };
    case 'patchProgress': return { ...s, progress: merge(s.progress, a.patch) };
  }
}
