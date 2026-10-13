/** Séances d'anglais (préparation TOEIC) : quatre exercices courts qui tournent. Partagé entre les tâches MIAGE « TOEIC » et le domaine Anglais. */
import { diffDays, type ISODate } from '@/core/dates';

export const ENGLISH_EXERCISES: [string, string][] = [
  ["Écoute active", "Écoute 15 minutes d'anglais (podcast, vidéo sans sous-titres). Note 5 mots ou expressions que tu ne connaissais pas, avec la phrase où ils apparaissent."],
  ["Dix mots du jour", "Apprends 10 mots de vocabulaire professionnel (réunions, e-mails, voyages). Écris une phrase par mot, puis cache les définitions et teste-toi."],
  ["Une partie de grammaire", "Fais une série d'exercices sur un point de grammaire du TOEIC (temps, prépositions, mots de liaison). Relis chaque erreur et écris la règle en une ligne."],
  ["Lecture chronométrée", "Lis un texte court en 5 minutes puis réponds à 5 questions. Relis ce que tu as raté pour comprendre pourquoi la bonne réponse était la bonne."]
];

/** Exercice du jour : on fait tourner les quatre en partant du début de la saison. */
export function englishExerciseFor(date: ISODate): [string, string] {
  const i = ((diffDays('2026-10-13', date) % 4) + 4) % 4;
  return ENGLISH_EXERCISES[i];
}

/** Score TOEIC maximal (Listening + Reading). */
export const TOEIC_MAX = 990;
