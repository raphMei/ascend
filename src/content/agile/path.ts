/** Parcours « Agilité et gestion de projet » : socle de départ en deux phases (Scrum et agilité, gérer un projet). À compléter avec ton programme réel :
    ajoute des phases dans `RAW` (identifiants stables g1t1, g1t2…). */
import { buildPhases, cours, exo, valid, type RawPhase } from '../dsl';
import { fr, wiki } from '../sources';
import type { PathStep, Phase } from '../types';

const RAW: RawPhase[] = [
  { id: 'g1', title: 'Agilité et Scrum', core: true,
    goal: 'Comprendre la façon de travailler de ton équipe : valeurs agiles, rôles, événements et artefacts de Scrum, Kanban.',
    steps: [
      cours('Les méthodes agiles : principes et origine', [wiki('M%C3%A9thode_agile', 'Méthode agile')], 40, { g: 'Les idées' }),
      cours('Scrum : rôles, événements, artefacts', [wiki('Scrum_(d%C3%A9veloppement)', 'Scrum (développement)')], 45, { g: 'Scrum' }),
      cours('Le guide Scrum officiel en français', [fr('scrumguides.org', 'Le Guide Scrum 2020', 'https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-French.pdf')], 60, { g: 'Scrum' }),
      cours('Le rôle de Product Owner', [wiki('Product_owner', 'Product owner')], 30, { g: 'Scrum' }),
      cours('Kanban : visualiser et limiter le travail en cours', [wiki('Kanban_(d%C3%A9veloppement)', 'Kanban (développement)')], 35, { g: 'Kanban' }),
      cours('Extreme Programming : les pratiques techniques', [wiki('Extreme_programming', 'Extreme programming')], 35, { g: 'Pratiques' }),
      exo('Décrire comment ton équipe applique Scrum ou Kanban : cérémonies, rôles, outils, et ce qui s\'écarte du guide', [], 45),
      valid('Explique la différence entre Scrum et Kanban, et ce que chaque cérémonie de Scrum apporte à l\'équipe.')
    ] },
  { id: 'g2', title: 'Gérer un projet', core: false,
    goal: 'Planifier, suivre et sécuriser un projet : découpage, planning, risques. Utile dès que tu pilotes un lot de travail.',
    steps: [
      cours('La gestion de projet : cycle et rôles', [wiki('Gestion_de_projet', 'Gestion de projet')], 40, { g: 'Les bases' }),
      cours('Planifier avec un diagramme de Gantt', [wiki('Diagramme_de_Gantt', 'Diagramme de Gantt')], 30, { g: 'Planifier' }),
      cours('Identifier et traiter les risques', [wiki('Gestion_des_risques', 'Gestion des risques')], 40, { g: 'Sécuriser' }),
      exo('Découper un de tes travaux en cours en tâches estimées, dates et dépendances, puis lister ses cinq principaux risques', [], 60),
      exo('Préparer ta prochaine réunion d\'avancement : trois lignes sur le fait, le prévu et les blocages', [], 25),
      valid('Présente l\'avancement d\'un de tes projets en trois minutes : où il en est, ce qui le menace et ce que tu demandes à l\'équipe.')
    ] }
];

export const AGILE_LEVELS = ['Pas commencé', 'Démarrage', 'Agilité comprise', 'Projet maîtrisé'];
export const AGILE_PHASES: Phase[] = buildPhases(RAW);
export const AGILE_TASKS: PathStep[] = AGILE_PHASES.flatMap((p) => p.tasks);
export const AGILE_HOURS = AGILE_PHASES.reduce((s, p) => s + p.hours, 0);
export const agilePhaseById: Record<string, Phase> = Object.fromEntries(AGILE_PHASES.map((p) => [p.id, p]));
