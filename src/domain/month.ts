/** Intensité des domaines, mois par mois : « Mon mois ». Un mois sans réglage reprend le précédent, domaine par domaine.
    Sans aucun réglage, le planning est exactement celui d'avant (réglages « Minutes par jour » et programme de sport complet). */
import type { ISODate } from '@/core/dates';
import { SPORT_WEEK } from './sport';
import type { Level, MonthDomain, MonthPlan, Settings, SportKind } from './types';

/** Réglages résolus pour un jour précis. */
export type DaySettings = Settings & { sportWeek?: Partial<Record<number, SportKind>>; miageLevel?: Level };

export const LEVELS: Level[] = ['off', 'leger', 'normal', 'intensif'];
export const LEVEL_LABEL: Record<Level, string> = { off: 'Désactivé', leger: 'Léger', normal: 'Normal', intensif: 'Intensif' };

/** Domaines proposés dans « Mon mois », dans l'ordre d'affichage. */
export const MONTH_DOMAINS: { id: MonthDomain; label: string; canBeOff: boolean; hint: Record<Level, string> }[] = [
  { id: 'miage', label: 'Cours MIAGE', canBeOff: false, hint: { off: '', leger: 'Seulement l\'essentiel : fiches, révisions, projets, examens. Pas de tâches du jour.', normal: 'Toutes les tâches, réétalées si tu prends du retard.', intensif: 'Toutes les tâches, et tu avances celles de la semaine suivante quand il reste du temps.' } },
  { id: 'sport', label: 'Sport', canBeOff: true, hint: { off: 'Aucune séance.', leger: '3 séances par semaine (tirer, jambes, pousser).', normal: '5 séances par semaine, du lundi au vendredi.', intensif: '6 séances par semaine, jambes en priorité.' } },
  { id: 'java', label: 'Java backend', canBeOff: true, hint: { off: 'Pas de séance Java.', leger: '45 minutes par jour.', normal: '2 heures par jour.', intensif: '3 heures par jour.' } },
  { id: 'front', label: 'Dev front', canBeOff: true, hint: { off: 'Pas de séance.', leger: '30 minutes par jour.', normal: '1 heure par jour.', intensif: '2 heures par jour.' } },
  { id: 'cloud', label: 'Cloud et DevOps', canBeOff: true, hint: { off: 'Pas de séance.', leger: '30 minutes par jour.', normal: '1 heure par jour.', intensif: '2 heures par jour.' } },
  { id: 'archi', label: 'Architecture logicielle', canBeOff: true, hint: { off: 'Pas de séance.', leger: '30 minutes par jour.', normal: '1 heure par jour.', intensif: '1 h 30 par jour.' } },
  { id: 'anglais', label: 'Anglais', canBeOff: true, hint: { off: 'Pas de séance.', leger: '10 minutes par jour.', normal: '20 minutes par jour.', intensif: '40 minutes par jour.' } },
  { id: 'lecture', label: 'Lecture', canBeOff: true, hint: { off: 'Pas de séance.', leger: '10 minutes par jour.', normal: '20 minutes par jour.', intensif: '40 minutes par jour.' } },
  { id: 'projets', label: 'Projets perso', canBeOff: true, hint: { off: 'Pas de séance.', leger: '20 minutes par jour.', normal: '45 minutes par jour.', intensif: '1 h 30 par jour.' } },
  { id: 'finances', label: 'Finances', canBeOff: true, hint: { off: 'Pas de point mensuel.', leger: 'Point de 20 minutes le premier dimanche.', normal: 'Point de 30 minutes le premier dimanche.', intensif: 'Point d\'une heure le premier dimanche.' } }
];

/** Minutes par jour (finances : minutes du point mensuel) selon l'intensité. */
export const MINUTES: Record<'java' | 'front' | 'cloud' | 'archi' | 'anglais' | 'lecture' | 'projets' | 'finances', Record<Level, number>> = {
  java: { off: 0, leger: 45, normal: 120, intensif: 180 },
  front: { off: 0, leger: 30, normal: 60, intensif: 120 },
  cloud: { off: 0, leger: 30, normal: 60, intensif: 120 },
  archi: { off: 0, leger: 30, normal: 60, intensif: 90 },
  anglais: { off: 0, leger: 10, normal: 20, intensif: 40 },
  lecture: { off: 0, leger: 10, normal: 20, intensif: 40 },
  projets: { off: 0, leger: 20, normal: 45, intensif: 90 },
  finances: { off: 0, leger: 20, normal: 30, intensif: 60 }
};

/** Programme de sport par intensité (jour de la semaine, 0 = dimanche). Intensif = le programme complet d'origine. */
export const SPORT_PROGRAMS: Record<Level, Partial<Record<number, SportKind>>> = {
  off: {},
  leger: { 1: 'pull', 2: 'legs', 4: 'push' },
  normal: { 1: 'pull', 2: 'legs', 3: 'push', 4: 'pull', 5: 'legs' },
  intensif: SPORT_WEEK
};

export const monthOf = (date: ISODate): string => date.slice(0, 7);

/** Intensités applicables à ce mois : les réglages des mois précédents, puis ceux du mois (les derniers l'emportent). */
export function monthPlanFor(S: Pick<Settings, 'months'>, date: ISODate): MonthPlan | undefined {
  const months = S.months;
  if (!months) return undefined;
  const upTo = Object.keys(months).filter((k) => k <= monthOf(date)).sort();
  if (!upTo.length) return undefined;
  const out: MonthPlan = {};
  for (const k of upTo) for (const [d, lv] of Object.entries(months[k] ?? {})) if (lv) out[d as MonthDomain] = lv;   // null = « comme avant »
  return out;
}

/** Réglages effectifs pour un jour : les minutes par jour, la durée de Java, le programme de sport et le niveau MIAGE du mois remplacent les valeurs par défaut. */
export function settingsForDate(S: Settings, date: ISODate): DaySettings {
  const plan = monthPlanFor(S, date);
  if (!plan) return S;
  const out: DaySettings = { ...S };
  if (plan.anglais) out.anglaisMin = MINUTES.anglais[plan.anglais];
  if (plan.lecture) out.lectureMin = MINUTES.lecture[plan.lecture];
  if (plan.front) out.frontMin = MINUTES.front[plan.front];
  if (plan.cloud) out.cloudMin = MINUTES.cloud[plan.cloud];
  if (plan.archi) out.archiMin = MINUTES.archi[plan.archi];
  if (plan.projets) out.projetsMin = MINUTES.projets[plan.projets];
  if (plan.finances) out.financesMin = MINUTES.finances[plan.finances];
  if (plan.java) out.javaHours = MINUTES.java[plan.java] / 60;
  if (plan.sport) out.sportWeek = SPORT_PROGRAMS[plan.sport];
  if (plan.miage) out.miageLevel = plan.miage;
  return out;
}
