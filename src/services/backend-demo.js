/* Backend de démonstration : données dans localStorage, aucune connexion. */
import { store, notify } from '../state/store.js';
import { merge } from '../core/merge.js';

export const DEMO_KEY = 'ascend-demo-v1';

export function demoBackend() {
  const load = () => { try { return JSON.parse(localStorage.getItem(DEMO_KEY)) || {}; } catch (e) { return {}; } };
  const save = (o) => { try { localStorage.setItem(DEMO_KEY, JSON.stringify(o)); } catch (e) { /* ignore */ } };
  return {
    async init() {
      const o = load();
      store.days = o.days || {}; store.settings = o.settings || {}; store.prog = o.prog || { done: {} };
      store.user = { displayName: 'Démo', email: 'demo@local' }; store.authReady = true; store.sync = 'demo';
      notify();
    },
    async signIn() {},
    async signOut() { try { localStorage.removeItem(DEMO_KEY); } catch (e) { /* ignore */ } location.reload(); },
    setDay(date, patch) { const o = load(); o.days = o.days || {}; o.days[date] = merge(o.days[date] || {}, patch); save(o); },
    setSettings(patch) { const o = load(); o.settings = merge(o.settings || {}, patch); save(o); },
    setProg(patch) { const o = load(); o.prog = merge(o.prog || { done: {} }, patch); save(o); }
  };
}
