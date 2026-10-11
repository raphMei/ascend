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
  /** Démarre l'écoute (authentification puis données). Seuls les jours depuis `historyFrom` sont chargés. */
  start(listener: BackendListener, historyFrom: ISODate): Promise<void>;
  /** Élargit la fenêtre d'historique (jours depuis `from`), par exemple pour afficher un graphique plus long. */
  loadHistory(from: ISODate): void;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
  /** Écritures en « merge » : on n'envoie que les champs modifiés. La promesse est rejetée si l'écriture est refusée. */
  writeDay(date: ISODate, patch: Record<string, unknown>): Promise<void>;
  writeSettings(patch: Record<string, unknown>): Promise<void>;
  writeProgress(patch: Record<string, unknown>): Promise<void>;
  /** Abonnements aux notifications de cet utilisateur (users/{uid}/push/main), lus par le script d'envoi. */
  writePush(patch: Record<string, unknown>): Promise<void>;
}
