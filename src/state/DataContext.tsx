/** Fournit l'état des données (jours, réglages, progression) et les actions d'écriture à toute l'application. */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import { addDays, todayISO, type ISODate } from '@/core/dates';
import { inverse } from '@/core/merge';
import { resolveSettings } from '@/domain/settings';
import type { Settings } from '@/domain/types';
import { adjustedTasks } from '@/domain/task-schedule';
import { calibKey, calibrate, calibrateTasks, type Calibration } from '@/domain/calibration';
import type { MiageTask } from '@/content/types';
import { isDemo } from '@/services/config';
import type { Backup } from '@/services/importData';
import { createBackend } from '@/services/createBackend';
import type { Backend } from '@/services/types';
import { HISTORY_DAYS } from './constants';
import { initialState, reducer, type Action, type DataState } from './reducer';

export interface DataApi {
  state: DataState;
  /** Réglages effectifs (défauts + surcharges). */
  settings: Settings;
  /** Tâches MIAGE aux échéances ajustées à la vie réelle (Chabbat). */
  tasks: readonly MiageTask[];
  /** Étalonnage des durées à partir des temps mesurés (affiché dans Statistiques). */
  calibration: Calibration;
  setDay(date: ISODate, patch: Record<string, unknown>): void;
  /** Plusieurs jours d'un coup : une seule écriture groupée. */
  setDays(entries: { date: ISODate; patch: Record<string, unknown> }[]): void;
  setSettings(patch: Record<string, unknown>): void;
  setProgress(patch: Record<string, unknown>): void;
  /** Charge l'historique depuis `from` (si pas déjà chargé). */
  loadHistory(from: ISODate): void;
  /** Enregistre un abonnement aux notifications (ou le retire avec `null`). */
  savePush(patch: Record<string, unknown>): Promise<void>;
  dismissNotice(): void;
  /** Applique une sauvegarde validée : fusionne réglages et progression, écrit tous les jours en une écriture groupée. */
  importBackup(data: Backup): void;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
}

const Ctx = createContext<DataApi | null>(null);

export function DataProvider({ children, backend: injected }: { children: ReactNode; backend?: Backend }) {
  const demo = isDemo();
  const [state, dispatch] = useReducer(reducer, demo, (d: boolean) => initialState(d, addDays(todayISO(), -HISTORY_DAYS)));
  const stateRef = useRef(state);
  stateRef.current = state;
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
      }, stateRef.current.historyFrom);
      dispatch({ type: 'ready', error: loadError });
    })();
  }, [demo]);

  /** Écriture optimiste avec retour arrière : si le backend refuse, on rétablit les valeurs d'avant et on prévient. */
  const optimistic = useCallback((apply: Action, undo: () => Action, send: () => Promise<void> | undefined) => {
    dispatch(apply);
    send()?.catch(() => {
      dispatch(undo());
      dispatch({ type: 'notice', message: "Enregistrement impossible : la valeur précédente a été rétablie. Vérifie ta connexion et réessaie." });
    });
  }, []);
  const setDay = useCallback((date: ISODate, patch: Record<string, unknown>) => {
    const undo = inverse(stateRef.current.days[date], patch);
    optimistic({ type: 'patchDay', date, patch }, () => ({ type: 'patchDay', date, patch: undo }), () => backendRef.current?.writeDay(date, patch));
  }, [optimistic]);
  const setDays = useCallback((entries: { date: ISODate; patch: Record<string, unknown> }[]) => {
    if (!entries.length) return;
    const undo = entries.map(({ date, patch }) => ({ date, patch: inverse(stateRef.current.days[date], patch) }));
    entries.forEach(({ date, patch }) => dispatch({ type: 'patchDay', date, patch }));
    backendRef.current?.writeDays(entries)?.catch(() => {
      undo.forEach(({ date, patch }) => dispatch({ type: 'patchDay', date, patch }));
      dispatch({ type: 'notice', message: "Enregistrement impossible : les valeurs précédentes ont été rétablies. Vérifie ta connexion et réessaie." });
    });
  }, []);
  const setSettings = useCallback((patch: Record<string, unknown>) => {
    const undo = inverse(stateRef.current.settings, patch);
    optimistic({ type: 'patchSettings', patch }, () => ({ type: 'patchSettings', patch: undo }), () => backendRef.current?.writeSettings(patch));
  }, [optimistic]);
  const setProgress = useCallback((patch: Record<string, unknown>) => {
    const undo = inverse(stateRef.current.progress, patch);
    optimistic({ type: 'patchProgress', patch }, () => ({ type: 'patchProgress', patch: undo }), () => backendRef.current?.writeProgress(patch));
  }, [optimistic]);
  const loadHistory = useCallback((from: ISODate) => {
    if (from >= stateRef.current.historyFrom) return;
    dispatch({ type: 'historyFrom', from });
    backendRef.current?.loadHistory(from);
  }, []);
  const savePush = useCallback(async (patch: Record<string, unknown>) => { await backendRef.current?.writePush(patch); }, []);
  const importBackup = useCallback((data: Backup) => {
    if (Object.keys(data.settings).length) setSettings(data.settings as Record<string, unknown>);
    if (Object.keys(data.progress.done).length || Object.keys(data.progress).length > 1) setProgress(data.progress as unknown as Record<string, unknown>);
    setDays(Object.entries(data.days).map(([date, patch]) => ({ date, patch: patch as Record<string, unknown> })));
  }, [setSettings, setProgress, setDays]);
  const dismissNotice = useCallback(() => dispatch({ type: 'notice', message: null }), []);
  const signIn = useCallback(async () => { await backendRef.current?.signIn(); }, []);
  const signOut = useCallback(async () => { await backendRef.current?.signOut(); }, []);

  const settings = useMemo(() => resolveSettings(state.settings), [state.settings]);
  // Durées des tâches ajustées au temps réel mesuré : les tâches ne changent que si un coefficient change (clé stable).
  const calibration = useMemo(() => calibrate(state.days), [state.days]);
  const ck = calibKey(calibration);
  const tasks = useMemo(
    () => (settings.calibrate === false ? adjustedTasks(settings) : calibrateTasks(adjustedTasks(settings), calibration)),
    [settings, ck] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const api = useMemo<DataApi>(
    () => ({ state, settings, tasks, calibration, setDay, setDays, setSettings, setProgress, loadHistory, savePush, importBackup, dismissNotice, signIn, signOut }),
    [state, settings, tasks, calibration, setDay, setDays, setSettings, setProgress, loadHistory, savePush, importBackup, dismissNotice, signIn, signOut]
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useData(): DataApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useData doit être utilisé dans <DataProvider>');
  return v;
}
