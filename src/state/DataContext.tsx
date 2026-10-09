/** Fournit l'état des données (jours, réglages, progression) et les actions d'écriture à toute l'application. */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import type { ISODate } from '@/core/dates';
import { resolveSettings } from '@/domain/settings';
import type { Settings } from '@/domain/types';
import { adjustedTasks } from '@/domain/task-schedule';
import type { MiageTask } from '@/content/types';
import { isDemo } from '@/services/config';
import { createBackend } from '@/services/createBackend';
import type { Backend } from '@/services/types';
import { initialState, reducer, type DataState } from './reducer';

export interface DataApi {
  state: DataState;
  /** Réglages effectifs (défauts + surcharges). */
  settings: Settings;
  /** Tâches MIAGE aux échéances ajustées à la vie réelle (Chabbat). */
  tasks: readonly MiageTask[];
  setDay(date: ISODate, patch: Record<string, unknown>): void;
  setSettings(patch: Record<string, unknown>): void;
  setProgress(patch: Record<string, unknown>): void;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
}

const Ctx = createContext<DataApi | null>(null);

export function DataProvider({ children, backend: injected }: { children: ReactNode; backend?: Backend }) {
  const demo = isDemo();
  const [state, dispatch] = useReducer(reducer, demo, initialState);
  const backendRef = useRef<Backend | null>(injected ?? null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // StrictMode monte deux fois en développement
    started.current = true;
    void (async () => {
      let loadError: string | undefined;
      if (!backendRef.current) { const r = await createBackend(); backendRef.current = r.backend; loadError = r.loadError; }
      await backendRef.current.start({
        onAuth: (user) => dispatch({ type: 'auth', user, demo }),
        onDays: (days) => dispatch({ type: 'days', days }),
        onSettings: (settings) => dispatch({ type: 'settings', settings }),
        onProgress: (progress) => dispatch({ type: 'progress', progress }),
        onError: (code) => dispatch({ type: 'error', code })
      });
      dispatch({ type: 'ready', error: loadError });
    })();
  }, [demo]);

  const setDay = useCallback((date: ISODate, patch: Record<string, unknown>) => { dispatch({ type: 'patchDay', date, patch }); backendRef.current?.writeDay(date, patch); }, []);
  const setSettings = useCallback((patch: Record<string, unknown>) => { dispatch({ type: 'patchSettings', patch }); backendRef.current?.writeSettings(patch); }, []);
  const setProgress = useCallback((patch: Record<string, unknown>) => { dispatch({ type: 'patchProgress', patch }); backendRef.current?.writeProgress(patch); }, []);
  const signIn = useCallback(async () => { await backendRef.current?.signIn(); }, []);
  const signOut = useCallback(async () => { await backendRef.current?.signOut(); }, []);

  const settings = useMemo(() => resolveSettings(state.settings), [state.settings]);
  const tasks = useMemo(() => adjustedTasks(settings), [settings]);
  const api = useMemo<DataApi>(
    () => ({ state, settings, tasks, setDay, setSettings, setProgress, signIn, signOut }),
    [state, settings, tasks, setDay, setSettings, setProgress, signIn, signOut]
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useData(): DataApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useData doit être utilisé dans <DataProvider>');
  return v;
}
