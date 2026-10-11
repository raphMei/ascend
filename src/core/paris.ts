import type { ISODate } from './dates';

/** Date et minutes depuis minuit à Paris pour un instant donné (indépendant du fuseau de la machine : sert au serveur d'envoi). */
export function parisNow(at: Date = new Date()): { date: ISODate; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(at);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return { date: `${get('year')}-${get('month')}-${get('day')}`, minutes: +get('hour') * 60 + +get('minute') };
}
