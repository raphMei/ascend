import { dow, type ISODate } from '@/core/dates';
import type { Plan } from '@/domain/types';

/** Libellé du type de journée (long : accueil ; court : écran « Aujourd'hui »). */
export function dayTypeLabel(plan: Plan, date: ISODate, size: 'long' | 'short'): string {
  const long = size === 'long';
  switch (plan.type) {
    case 'ent': return plan.onsite ? (long ? 'Journée AXA sur site' : 'AXA sur site') : (long ? 'Journée AXA en télétravail' : 'AXA en télétravail');
    case 'ecole': return long ? 'Journée de cours' : 'Cours';
    case 'exam': return long ? "Journée d'examen" : 'Examen';
    case 'ferie': return long ? 'Jour férié' : 'Férié';
    default: return dow(date) === 6 ? 'Chabbat' : long ? 'Dimanche' : 'Week-end';
  }
}
