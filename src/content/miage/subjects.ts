/** Matières MIAGE : liste, unités d'enseignement, types de tâches. */
import type { Subject, UE, TaskKind } from '../types';

export const SUBJ: Subject[] = [
  { id: "dl", name: "Deep Learning", short: "Deep Learning", cr: 4.5, ch: 36, ue: "f" },
  { id: "qa", name: "Contrats, tests et assurance qualité", short: "Tests et qualité", cr: 4.5, ch: 36, ue: "f" },
  { id: "sec", name: "Sécurité des systèmes informatiques", short: "Sécurité", cr: 3, ch: 36, ue: "f" },
  { id: "llm", name: "Ingénierie des données et des connaissances pour les LLM", short: "Données et LLM", cr: 3, ch: 36, ue: "f" },
  { id: "big", name: "Traitement de données massives", short: "Données massives", cr: 3, ch: 36, ue: "f" },
  { id: "ri", name: "Analyse des données et systèmes de recherche d'information", short: "Recherche d'info", cr: 3, ch: 36, ue: "f" },
  { id: "gov", name: "Gouvernance des SI", short: "Gouvernance SI", cr: 3, ch: 36, ue: "a" },
  { id: "eth", name: "Éthique du numérique", short: "Éthique", cr: 1.5, ch: 12, ue: "a" },
  { id: "toeic", name: "Préparation au TOEIC", short: "TOEIC", cr: 3, ch: 18, ue: "l" },
  { id: "proj", name: "Projet Analyse avancée des données", short: "Projet données", cr: 1.5, ch: 12, ue: "p" },
  { id: "org", name: "Routine et organisation", short: "Organisation", cr: 0, ch: 0, ue: "o" }
];
export const UES: UE[] = [
  { k: "f", name: "Connaissances fondamentales", cr: 21 },
  { k: "a", name: "Approfondissement", cr: 4.5 },
  { k: "l", name: "Compétences linguistiques", cr: 3 },
  { k: "p", name: "Projets académiques et professionnels", cr: 1.5 },
  { k: "o", name: "Pour tenir le rythme", cr: 0 }
];
export const byId: Record<string, Subject> = Object.fromEntries(SUBJ.map((s) => [s.id, s]));
export const KIND: Record<TaskKind, string> = { setup: "Mise en place", daily: "Tâche du jour", fiche: "Fiche", proj: "Gros projet", rev: "Révision", exam: "Examen", org: "Organisation" };
