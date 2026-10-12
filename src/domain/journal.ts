/** Journal d'apprentissage et révision espacée. Fonctions pures.
    Un bilan est écrit à la fin d'une séance (`days/{date}.journal`). S'il est marqué « à revoir », il revient après 2 jours, puis
    3, 7, 14 et 30 jours : « Je sais » passe à l'intervalle suivant, « Flou » repart de demain. */
import { addDays, type ISODate } from '@/core/dates';
import type { Block, DayData, JournalEntry } from './types';

/** Jours avant chaque révision successive. */
export const REVIEW_STEPS = [2, 3, 7, 14, 30] as const;

export interface JournalItem extends JournalEntry { id: string; date: ISODate }

/** Clé d'un bilan : la tâche pour un cours ou une étape de parcours, le bloc sinon. */
export const journalKey = (b: Pick<Block, 'id' | 'taskId'>): string => b.taskId ?? b.id;

/** Écriture d'un nouveau bilan à la fin d'une séance. Sans « à revoir », aucune date de révision. */
export function newEntry(b: Pick<Block, 'title' | 'domain'>, date: ISODate, input: { note?: string; diff?: 1 | 2 | 3; rev?: boolean }): JournalEntry {
  const e: JournalEntry = { t: b.title, k: b.domain };
  if (input.note?.trim()) e.note = input.note.trim();
  if (input.diff) e.diff = input.diff;
  if (input.rev) { e.rev = true; e.n = 0; e.next = addDays(date, REVIEW_STEPS[0]); }
  return e;
}

/** Tous les bilans, du plus récent au plus ancien. */
export function journalItems(days: Readonly<Record<ISODate, DayData>>): JournalItem[] {
  const out: JournalItem[] = [];
  for (const [date, d] of Object.entries(days)) for (const [id, e] of Object.entries(d.journal ?? {})) if (e) out.push({ ...e, id, date });
  return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? -1 : 1));
}

/** Notions à revoir aujourd'hui (ou en retard), les plus anciennes d'abord. */
export function dueReviews(items: readonly JournalItem[], today: ISODate): JournalItem[] {
  return items.filter((i) => i.rev && i.next && i.next <= today).sort((a, b) => (a.next! < b.next! ? -1 : a.next! > b.next! ? 1 : a.id < b.id ? -1 : 1));
}

/** Champs à écrire dans le bilan après une révision. « Je sais » : intervalle suivant (fin des révisions après le dernier) ; « Flou » : demain. */
export function reviewPatch(item: Pick<JournalEntry, 'n'>, known: boolean, today: ISODate): Pick<JournalEntry, 'n' | 'next' | 'rev'> {
  if (!known) return { n: 0, next: addDays(today, 1), rev: true };
  const n = (item.n ?? 0) + 1;
  if (n >= REVIEW_STEPS.length) return { n, next: null, rev: false };
  return { n, next: addDays(today, REVIEW_STEPS[n]), rev: true };
}
