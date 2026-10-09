import type { Settings } from './types';

/** Réglages par défaut (posés sans confirmation : à valider avec l'utilisateur). */
export const DEFAULT_SETTINGS: Settings = {
  lat: 48.97, lon: 2.33, onsite: [2, 4], javaHours: 2, waterGoal: 3000, protGoal: 160, kcalGoal: 2700, sleepGoal: 7.5,
  wake: '06:00', bed: '22:30', workMin: 436, candle: 18, havdalah: 45, theme: 'auto'
};

/** Réglages effectifs : valeurs par défaut + surcharges enregistrées. */
export const resolveSettings = (overrides: Partial<Settings> | undefined): Settings => ({ ...DEFAULT_SETTINGS, ...overrides });
