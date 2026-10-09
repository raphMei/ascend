/** Dates : calcul et formatage en français. Toutes les dates sont des chaînes ISO « AAAA-MM-JJ » (type `ISODate`). */
export type ISODate = string;

export const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
export const MOISL = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
export const JOURS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
export const JOURSL = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

export const pad = (n: number): string => (n < 10 ? '0' : '') + n;

/** Parse à midi UTC : évite tout décalage lié aux changements d'heure. */
export function parse(s: ISODate): Date {
  const p = s.split('-');
  return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 12));
}
export function iso(d: Date): ISODate {
  return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate());
}
export function addDays(s: ISODate, n: number): ISODate {
  const d = parse(s);
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
}
/** Jour de la semaine : 0 = dimanche … 6 = samedi. */
export const dow = (s: ISODate): number => parse(s).getUTCDay();
/** Toutes les dates de a à b inclus. */
export function range(a: ISODate, b: ISODate): ISODate[] {
  const r: ISODate[] = [];
  let c = a;
  while (c <= b) { r.push(c); c = addDays(c, 1); }
  return r;
}
export const diffDays = (a: ISODate, b: ISODate): number => Math.round((parse(b).getTime() - parse(a).getTime()) / 86400000);

export function fmt(s: ISODate): string { const d = parse(s); return JOURS[d.getUTCDay()] + ' ' + d.getUTCDate() + ' ' + MOIS[d.getUTCMonth()]; }
export function fmtLong(s: ISODate): string { const d = parse(s); return JOURSL[d.getUTCDay()] + ' ' + d.getUTCDate() + ' ' + MOISL[d.getUTCMonth()]; }
export function fmtShort(s: ISODate): string { const d = parse(s); return d.getUTCDate() + ' ' + MOIS[d.getUTCMonth()]; }

/** Les n derniers jours (end inclus), du plus ancien au plus récent. */
export const lastDays = (n: number, end: ISODate): ISODate[] => range(addDays(end, -(n - 1)), end);

/** Date du jour (heure locale de l'appareil). */
export function todayISO(): ISODate {
  const d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
/** Minutes écoulées depuis minuit (heure locale). */
export function nowMin(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}
