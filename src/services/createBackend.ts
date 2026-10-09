import { isDemo } from './config';
import type { Backend } from './types';

/** Choisit le backend : démo (?demo) ou Firebase. Si Firebase est injoignable, retourne un backend inerte et l'erreur. */
export async function createBackend(): Promise<{ backend: Backend; loadError?: string }> {
  try {
    if (isDemo()) return { backend: (await import('./demo')).demoBackend() };
    return { backend: await (await import('./cloud')).cloudBackend() };
  } catch (e) {
    const inert: Backend = {
      async start(l) { l.onAuth(null); },
      signIn: async () => { window.location.reload(); },
      signOut: async () => {}, writeDay() {}, writeSettings() {}, writeProgress() {}
    };
    return { backend: inert, loadError: 'chargement de Firebase impossible (' + (e instanceof Error ? e.message : String(e)) + ')' };
  }
}
