/** Rappels (notifications) : quoi envoyer et quand. Logique pure, partagée entre l'application (réglages)
    et le script d'envoi exécuté par GitHub Actions. Aucun rappel pendant Chabbat. */
import { dow, type ISODate } from '@/core/dates';
import { hm } from '@/core/format';
import { planDay } from './planner';
import { adjustedTasks } from './task-schedule';
import { calibrate, calibrateTasks } from './calibration';
import { buildSchedule } from './schedule';
import type { DayData, Plan, Progress, Settings } from './types';

export type ReminderKind = 'seance';
export const REMINDER_KINDS: { kind: ReminderKind; label: string; hint: string }[] = [
  { kind: 'seance', label: 'Séance d\'apprentissage', hint: 'Quelques minutes avant ta première séance du jour, si elle n\'est pas faite.' }
];

export interface Reminder { key: string; kind: ReminderKind; /** minutes depuis minuit */ at: number; title: string; body: string }

/** Un rappel est « dû » dans les 90 minutes après son heure (le planificateur GitHub peut avoir du retard). */
export const GRACE_MIN = 90;

/** Rappels prévus pour une journée : un seul, avant la première séance d'apprentissage pas encore faite. Routine, sport et sommeil
    sont du temps réservé (leur suivi est ailleurs) : aucun rappel pour eux. */
export function reminderSchedule(date: ISODate, plan: Plan, _day: DayData | undefined, _S: Settings): Reminder[] {
  if (dow(date) === 6) return [];                       // samedi : Chabbat, rien jusqu'à la sortie
  const next = plan.blocks.find((b) => b.checkable && !b.done && !b.blocked);
  if (!next) return [];
  const r: Reminder = { key: `${date}:seance`, kind: 'seance', at: next.start - 5, title: next.title, body: 'À ' + hm(next.start) + (next.sub ? ' · ' + next.sub : '') };
  return inShabbat(date, r.at, plan) ? [] : [r];
}

/** Cette heure tombe-t-elle pendant Chabbat ? (vendredi après l'allumage, samedi avant la sortie) */
function inShabbat(date: ISODate, minute: number, plan: Plan): boolean {
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
  /** Derniers jours : servent à ajuster les durées au temps réel mesuré. Par défaut : seulement le jour courant. */
  days?: Record<ISODate, DayData>;
}

/** Calcul complet pour un utilisateur : plan du jour → programme des rappels → ceux à envoyer maintenant. */
export function remindersToSend(i: RunInput): Reminder[] {
  // Mêmes durées que dans l'application : ajustées au temps réel mesuré sur les jours transmis.
  const tasks = i.settings.calibrate === false || !i.days ? adjustedTasks(i.settings) : calibrateTasks(adjustedTasks(i.settings), calibrate(i.days));
  const sched = buildSchedule({ tasks, progress: i.progress, settings: i.settings, days: i.days ?? (i.day ? { [i.date]: i.day } : {}), today: i.date, now: i.now });
  const plan = planDay({ date: i.date, settings: i.settings, progress: i.progress, day: i.day, today: i.date, tasks, schedule: sched ?? undefined });
  return dueReminders(reminderSchedule(i.date, plan, i.day, i.settings), i.date, i.now, i.sent, i.settings, plan);
}
