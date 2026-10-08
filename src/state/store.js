/* État de l'application (source unique) + écritures optimistes. Aucun accès au DOM ici. */
import { merge } from '../core/merge.js';
import { DEF } from '../domain/settings.js';

export const store = {
  user: null, authReady: false,
  days: {},               // users/{uid}/days/{AAAA-MM-JJ}
  settings: {},           // users/{uid}/settings/main (surcharges de DEF)
  prog: { done: {} },     // users/{uid}/progress/main
  sync: 'loading',        // loading | ok | error | demo
  error: ''
};

const listeners = new Set();
/** Abonne un callback appelé à chaque changement d'état (retourne la fonction de désabonnement). */
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export const notify = () => listeners.forEach((fn) => fn());

let backend = null;
export const setBackend = (b) => { backend = b; };
export const getBackend = () => backend;

/** Réinitialise les données (déconnexion). */
export function clearData() { store.days = {}; store.settings = {}; store.prog = { done: {} }; }

/* Écritures optimistes : on met à jour l'état local tout de suite, puis on envoie au backend. */
export const setDay = (date, patch) => { store.days[date] = merge(store.days[date] || {}, patch); backend.setDay(date, patch); };
export const setSettings = (patch) => { store.settings = merge(store.settings, patch); backend.setSettings(patch); };
export const setProg = (patch) => { store.prog = merge(store.prog, patch); backend.setProg(patch); };

/** Réglages effectifs : valeurs par défaut + surcharges de l'utilisateur. */
export const S = () => Object.assign({}, DEF, store.settings);
