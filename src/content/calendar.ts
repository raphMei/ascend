/* Calendrier réel du CFA (session 2026-2027) : jours de cours, examens, fériés, dates clés. */
import { range, dow, type ISODate } from '../core/dates';

export type DayType = 'ent' | 'ecole' | 'exam' | 'ferie' | 'we';
export const SCHOOL: Record<ISODate, 1> = {};
export const EXAM: Record<ISODate, 1> = {};
export const FERIE: Record<ISODate, 1> = { "2026-11-11": 1, "2026-12-25": 1, "2027-01-01": 1 };
[["2026-11-02", "2026-11-06"], ["2026-11-09", "2026-11-10"], ["2026-11-12", "2026-11-13"], ["2026-11-16", "2026-11-20"],
 ["2026-12-03", "2026-12-04"], ["2026-12-14", "2026-12-18"], ["2027-01-04", "2027-01-08"], ["2027-01-11", "2027-01-15"],
 ["2027-02-08", "2027-02-12"]].forEach((r) => { range(r[0], r[1]).forEach((d) => { SCHOOL[d] = 1; }); });
range("2027-02-22", "2027-02-26").forEach((d) => { EXAM[d] = 1; });
export function dayType(s: ISODate): DayType {
  const w = dow(s);
  if (w === 0 || w === 6) return "we";
  if (FERIE[s]) return "ferie";
  if (EXAM[s]) return "exam";
  if (SCHOOL[s]) return "ecole";
  return "ent";
}

export const KEY_DATES: [ISODate, string][] = [
  ["2026-10-12", "Réunion TE/TP"], ["2026-11-02", "Début du bloc de cours (2 au 20 nov.)"], ["2026-12-03", "Nuit de l'info (3 et 4 déc.)"],
  ["2026-12-14", "Cours du 14 au 18 déc."], ["2027-01-04", "Cours du 4 au 15 janv."], ["2027-02-08", "Dernière semaine de cours"],
  ["2027-02-22", "Examens du 22 au 26 févr."]
];

