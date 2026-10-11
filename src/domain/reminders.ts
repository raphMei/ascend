/** Rappels (notifications) : quoi envoyer et quand. Logique pure, partagée entre l'application (réglages)
    et le script d'envoi exécuté par GitHub Actions. Aucun rappel pendant Chabbat. */
import { dow, type ISODate } from '@/core/dates';
import { hm, toMin } from '@/core/format';
import { planDay } from './planner';
import { adjustedTasks } from './task-schedule';
import { buildSchedule } from './schedule';
import type { DayData, Plan, Progress, Settings } from './types';

export type ReminderKind = 'routine' | 'sport' | 'bilan' | 'saisie';
export const REMINDER_KINDS: { kind: ReminderKind; label: string; hint: string }[] = [
  { kind: 'routine', label: 'Routine du matin', hint: 'À ton réveil.' },
  { kind: 'sport', label: 'Séance de sport', hint: '10 minutes avant.' },
  { kind: 'bilan', label: 'Bilan du soir', hint: '50 minutes avant le coucher.' },
  { kind: 'saisie', label: 'Saisie du poids et de la nuit', hint: '30 minutes après le réveil, si pas encore fait.' }
];

export interface Reminder { key: string; kind: ReminderKind; /** minutes depuis minuit */ at: number; title: string; body: string }

/** Un rappel est « dû » dans les 90 minutes après son heure (le planificateur GitHub peut avoir du retard). */
export const GRACE_MIN = 90;

/** Tous les rappels prévus pour une journée, selon son plan et ce qui est déjà fait. */
export function reminderSchedule(date: ISODate, plan: Plan, day: DayData | undefined, S: Settings): Reminder[] {
  const w = dow(date);
  if (w === 6) return [];                       // samedi : Chabbat, rien jusqu'à la sortie
  const out: Reminder[] = [];
  const key = (k: ReminderKind) => `${date}:${k}`;
  const block = (id: string) => plan.blocks.find((b) => b.id === id);

  const tephila = block('tephila');
  if (tephila && !plan.blocks.filter((b) => b.domain === 'matin' && b.checkable).every((b) => b.done)) {
    out.push({ key: key('routine'), kind: 'routine', at: tephila.start, title: 'Ta routine t\'attend', body: 'Téphila, pompes, étirements, petit-déjeuner : 75 minutes avant tout écran.' });
  }
  const sport = block('sport');
  if (sport && !sport.done) {
    out.push({ key: key('sport'), kind: 'sport', at: sport.start - 10, title: sport.title + ' dans 10 minutes', body: 'À ' + hm(sport.start) + '. Prépare ta tenue et ton eau.' });
  }
  const bilan = block('bilan');
  if (bilan && !bilan.done) {
    out.push({ key: key('bilan'), kind: 'bilan', at: bilan.start, title: 'Bilan du soir', body: 'Trois minutes : poids, eau, protéines, puis relis ta journée.' });
  }
  const wake = toMin(S.wake);
  const missing: string[] = [];
  if (day?.weight == null) missing.push('ton poids');
  if (!day?.sleep?.bed || !day.sleep.wake) missing.push('ta nuit');
  if (missing.length) out.push({ key: key('saisie'), kind: 'saisie', at: wake + 30, title: 'Pense à saisir ' + missing.join(' et '), body: 'Dans « Mes mesures du jour », c\'est dix secondes.' });

  return out.filter((r) => !inShabbat(date, r.at, plan));
}

/** Cette heure tombe-t-elle pendant Chabbat ? (vendredi après l'allumage, samedi avant la sortie) */
export function inShabbat(date: ISODate, minute: number, plan: Plan): boolean {
  if (!plan.sh) return false;
  const w = dow(date);
  return (w === 5 && minute >= plan.sh.candle) || (w === 6 && minute < plan.sh.havdalah);
}

/** Rappels à envoyer maintenant : heure passée, pas trop ancienne, pas déjà envoyés, type activé, hors Chabbat. */
export function dueReminders(schedule: Reminder[], date: ISODate, now: number, sent: Record<string, unknown>, S: Settings, plan: Plan): Reminder[] {
  if (inShabbat(date, now, plan)) return [];
  return schedule.filter((r) => r.at <= now && now - r.at <= GRACE_MIN && !sent[r.key] && S.reminders?.[r.kind] !== false);
}

export interface RunInput {
  date: ISODate; now: number; settings: Settings;
  progress: Progress; day: DayData | undefined;
  /** Rappels déjà envoyés (clé → date d'envoi). */
  sent: Record<string, unknown>;
  /** Derniers jours (au moins les 7 derniers) : sert au rattrapage du sport. Par défaut : seulement le jour courant. */
  days?: Record<ISODate, DayData>;
}

/** Calcul complet pour un utilisateur : plan du jour → programme des rappels → ceux à envoyer maintenant. */
export function remindersToSend(i: RunInput): Reminder[] {
  const tasks = adjustedTasks(i.settings);
  const sched = buildSchedule({ tasks, progress: i.progress, settings: i.settings, days: i.days ?? (i.day ? { [i.date]: i.day } : {}), today: i.date, now: i.now });
  const plan = planDay({ date: i.date, settings: i.settings, progress: i.progress, day: i.day, today: i.date, tasks, schedule: sched ?? undefined });
  return dueReminders(reminderSchedule(i.date, plan, i.day, i.settings), i.date, i.now, i.sent, i.settings, plan);
}
