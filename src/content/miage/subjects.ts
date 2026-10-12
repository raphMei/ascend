/** Matières MIAGE : identifiant, nom complet, nom court, crédits et heures de cours. */
import type { Subject } from '../types';

export const SUBJ: Subject[] = [
  { id: "dl", name: "Deep Learning", short: "Deep Learning", cr: 4.5, ch: 36 },
  { id: "qa", name: "Contrats, tests et assurance qualité", short: "Tests et qualité", cr: 4.5, ch: 36 },
  { id: "sec", name: "Sécurité des systèmes informatiques", short: "Sécurité", cr: 3, ch: 36 },
  { id: "llm", name: "Ingénierie des données et des connaissances pour les LLM", short: "Données et LLM", cr: 3, ch: 36 },
  { id: "big", name: "Traitement de données massives", short: "Données massives", cr: 3, ch: 36 },
  { id: "ri", name: "Analyse des données et systèmes de recherche d'information", short: "Recherche d'info", cr: 3, ch: 36 },
  { id: "gov", name: "Gouvernance des SI", short: "Gouvernance SI", cr: 3, ch: 36 },
  { id: "eth", name: "Éthique du numérique", short: "Éthique", cr: 1.5, ch: 12 },
  { id: "toeic", name: "Préparation au TOEIC", short: "TOEIC", cr: 3, ch: 18 },
  { id: "proj", name: "Projet Analyse avancée des données", short: "Projet données", cr: 1.5, ch: 12 },
  { id: "org", name: "Routine et organisation", short: "Organisation", cr: 0, ch: 0 }
];
export const byId: Record<string, Subject> = Object.fromEntries(SUBJ.map((s) => [s.id, s]));
