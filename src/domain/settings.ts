import type { Settings } from './types';

/** Réglages par défaut (posés sans confirmation : à valider avec l'utilisateur). */
export const DEFAULT_SETTINGS: Settings = {
  lat: 48.97, lon: 2.33, onsite: [2, 4], javaHours: 2,
  wake: '06:00', bed: '22:30', workMin: 436, candle: 18, havdalah: 45, theme: 'auto',
  // Désactivés par défaut : le planning existant ne change pas tant que tu n'as pas activé un domaine dans les réglages.
  anglaisMin: 0, lectureMin: 0, frontMin: 0, cloudMin: 0, archiMin: 0, assuranceMin: 0, dataMin: 0, agileMin: 0, projetsMin: 0
};

/** Réglages effectifs : valeurs par défaut + surcharges enregistrées. */
export const resolveSettings = (overrides: Partial<Settings> | undefined): Settings => ({ ...DEFAULT_SETTINGS, ...overrides });
