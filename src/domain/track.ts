/** « Sur la bonne voie ? » : pour chaque matière, les tâches faites contre les tâches prévues jusqu'à aujourd'hui. */
import type { ISODate } from '@/core/dates';
import type { MiageTask } from '@/content/types';
import type { Progress } from './types';

export type TrackStatus = 'avance' | 'a-jour' | 'retard' | 'grand-retard';

export interface SubjectTrack {
  /** Tâches prévues jusqu'à aujourd'hui (hors tâches abandonnées). */
  planned: number;
  /** Parmi elles, celles qui sont faites. */
  done: number;
  /** Tâches prévues mais pas faites. */
  late: number;
  /** Tâches faites alors qu'elles sont prévues plus tard. */
  ahead: number;
  status: TrackStatus;
}

export const TRACK_LABEL: Record<TrackStatus, string> = { avance: 'En avance', 'a-jour': 'À jour', retard: 'En retard', 'grand-retard': 'Retard important' };

/** À jour dès 90 % des tâches prévues faites ; en retard sous 90 % ; retard important sous 60 % ; en avance si au moins 3 tâches futures sont déjà faites. */
export function subjectTracks(tasks: readonly MiageTask[], progress: Progress, today: ISODate, excluded?: ReadonlySet<string>): Record<string, SubjectTrack> {
  const out: Record<string, SubjectTrack> = {};
  for (const t of tasks) {
    if (excluded?.has(t.id)) continue;
    const r = (out[t.s] ??= { planned: 0, done: 0, late: 0, ahead: 0, status: 'a-jour' });
    const done = !!progress.done[t.id];
    if (t.due <= today) { r.planned++; if (done) r.done++; else r.late++; }
    else if (done) r.ahead++;
  }
  for (const r of Object.values(out)) {
    const ratio = r.planned ? r.done / r.planned : 1;
    r.status = ratio < 0.6 ? 'grand-retard' : ratio < 0.9 ? 'retard' : r.ahead >= 3 ? 'avance' : 'a-jour';
  }
  return out;
}
