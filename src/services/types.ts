/** Contrat d'un backend de données. Deux implémentations : Firebase (cloud.ts) et démo locale (demo.ts). */
import type { ISODate } from '@/core/dates';
import type { DayData, Progress, Settings } from '@/domain/types';

export interface AuthUser { uid: string; email: string | null; displayName: string | null }

/** Le backend pousse les changements vers l'application via ces callbacks. */
export interface BackendListener {
  onAuth(user: AuthUser | null): void;
  onDays(days: Record<ISODate, DayData>): void;
  onSettings(settings: Partial<Settings>): void;
  onProgress(progress: Progress): void;
  onError(code: string): void;
}

export interface Backend {
  /** Démarre l'écoute (authentification puis données). */
  start(listener: BackendListener): Promise<void>;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
  /** Écritures en « merge » : on n'envoie que les champs modifiés. */
  writeDay(date: ISODate, patch: Record<string, unknown>): void;
  writeSettings(patch: Record<string, unknown>): void;
  writeProgress(patch: Record<string, unknown>): void;
}
