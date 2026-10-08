/* Choix du backend : démo (?demo) ou Firebase. Contrat commun : init, signIn, signOut, setDay, setSettings, setProg. */
import { DEMO } from './config.js';
import { store } from '../state/store.js';

export async function createBackend() {
  try {
    if (DEMO) return (await import('./backend-demo.js')).demoBackend();
    return await (await import('./backend-cloud.js')).cloudBackend();
  } catch (e) {
    // Firebase injoignable : on affiche l'erreur sur l'écran de connexion plutôt qu'une page blanche.
    store.authReady = true;
    store.error = 'chargement de Firebase impossible (' + ((e && e.message) || e) + ')';
    return { init: async () => {}, signIn: async () => location.reload(), signOut: async () => {}, setDay() {}, setSettings() {}, setProg() {} };
  }
}
