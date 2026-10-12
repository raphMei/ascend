import { render } from '@testing-library/react';
import { App } from '@/App';
import { ClockProvider, type Clock } from '@/hooks/useClock';
import { ScheduleProvider } from '@/hooks/useSchedule';
import { DataProvider } from '@/state/DataContext';
import type { DayData, Progress, Settings } from '@/domain/types';
import type { AuthUser, Backend, BackendListener } from '@/services/types';

export const USER: AuthUser = { uid: 'u1', email: 'test@ascend.dev', displayName: 'Test' };

export interface Seed { user?: AuthUser | null; days?: Record<string, DayData>; settings?: Partial<Settings>; progress?: Progress }
export type Writes = { days: [string, Record<string, unknown>][]; batches: { date: string; patch: Record<string, unknown> }[][]; settings: Record<string, unknown>[]; progress: Record<string, unknown>[]; push: Record<string, unknown>[] };

/** Backend factice : rejoue les données de départ et enregistre toutes les écritures. */
export function fakeBackend(seed: Seed = {}) {
  const writes: Writes = { days: [], batches: [], settings: [], progress: [], push: [] };
  const signIn = vi.fn(async () => {});
  const failWrites = { on: false };
  const history: string[] = [];
  const startedFrom = { value: '' };
  const ref: { listener: BackendListener | null } = { listener: null };
  const backend: Backend = {
    async start(l, from) {
      ref.listener = l; startedFrom.value = from;
      l.onDays(seed.days ?? {}); l.onSettings(seed.settings ?? {}); l.onProgress(seed.progress ?? { done: {} });
      l.onAuth(seed.user === undefined ? USER : seed.user);
    },
    signIn, async signOut() {},
    loadHistory(from) { history.push(from); },
    async writeDay(date, patch) { if (failWrites.on) throw new Error('denied'); writes.days.push([date, patch]); },
    async writeDays(entries) { if (failWrites.on) throw new Error('denied'); writes.batches.push(entries); },
    async writeSettings(patch) { if (failWrites.on) throw new Error('denied'); writes.settings.push(patch); },
    async writePush(patch) { writes.push.push(patch); },
    async writeProgress(patch) { if (failWrites.on) throw new Error('denied'); writes.progress.push(patch); }
  };
  return { backend, writes, signIn, ref, failWrites, history, startedFrom };
}

/** Un mardi de novembre, 10 h : jour d'entreprise (sur site), pas de Chabbat. */
export const TUESDAY: Clock = { today: '2026-11-03', now: 600 };
/** Vendredi soir, après l'allumage. */
export const FRIDAY_NIGHT: Clock = { today: '2026-11-06', now: 1200 };

export function renderApp(opts: { seed?: Seed; clock?: Clock; hash?: string } = {}) {
  window.location.hash = opts.hash ?? '#/home';
  const fb = fakeBackend(opts.seed);
  const view = render(
    <DataProvider backend={fb.backend}>
      <ClockProvider fixed={opts.clock ?? TUESDAY}><ScheduleProvider><App /></ScheduleProvider></ClockProvider>
    </DataProvider>
  );
  return { ...view, ...fb };
}
