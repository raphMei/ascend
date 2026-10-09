/** Backend de démonstration : données dans localStorage, aucune connexion réseau. */
import { merge } from '@/core/merge';
import type { DayData, Progress, Settings } from '@/domain/types';
import type { Backend, BackendListener } from './types';

export const DEMO_KEY = 'ascend-demo-v1';

interface Saved { days?: Record<string, DayData>; settings?: Partial<Settings>; prog?: Progress }

export function demoBackend(): Backend {
  const load = (): Saved => { try { return JSON.parse(localStorage.getItem(DEMO_KEY) ?? '{}') || {}; } catch { return {}; } };
  const save = (o: Saved) => { try { localStorage.setItem(DEMO_KEY, JSON.stringify(o)); } catch { /* stockage indisponible : on ignore */ } };
  return {
    async start(l: BackendListener) {
      const o = load();
      l.onDays(o.days ?? {}); l.onSettings(o.settings ?? {}); l.onProgress(o.prog ?? { done: {} });
      l.onAuth({ uid: 'demo', displayName: 'Démo', email: 'demo@local' });
    },
    async signIn() { /* rien à faire en démo */ },
    async signOut() { try { localStorage.removeItem(DEMO_KEY); } catch { /* ignore */ } window.location.reload(); },
    writeDay(date, patch) { const o = load(); o.days = o.days ?? {}; o.days[date] = merge(o.days[date], patch); save(o); },
    writeSettings(patch) { const o = load(); o.settings = merge(o.settings, patch); save(o); },
    writeProgress(patch) { const o = load(); o.prog = merge(o.prog ?? { done: {} }, patch); save(o); }
  };
}
