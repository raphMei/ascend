/** Parcours dev front : 9 phases, du HTML sémantique au React testé et accessible, jusqu'à un portfolio en ligne.
    Même forme que le parcours Java (identifiants f1t1, f1t2…). */
import type { JavaKind, JavaTask, Phase } from '../types';

interface RawTask { k: JavaKind; t: string; u?: string; d?: string }
interface RawPhase { id: string; title: string; hours: number; core: boolean; goal: string; tasks: RawTask[] }

const U = {
  mdn: 'https://developer.mozilla.org/fr/docs/Learn_web_development',
  html: 'https://web.dev/learn/html',
  a11y: 'https://web.dev/learn/accessibility',
  css: 'https://web.dev/learn/css',
  frog: 'https://flexboxfroggy.com/#fr',
  garden: 'https://cssgridgarden.com/#fr',
  js: 'https://fr.javascript.info/',
  ts: 'https://www.typescriptlang.org/docs/handbook/intro.html',
  react: 'https://react.dev/learn',
  router: 'https://reactrouter.com/start/library/installation',
  vitest: 'https://vitest.dev/guide/',
  rtl: 'https://testing-library.com/docs/react-testing-library/intro/',
  pw: 'https://playwright.dev/docs/intro',
  lh: 'https://developer.chrome.com/docs/lighthouse/overview',
  vitals: 'https://web.dev/articles/vitals',
  pages: 'https://docs.github.com/pages'
};

const RAW: RawPhase[] = [
  { id: 'f1', title: 'HTML sémantique et accessibilité', hours: 12, core: true,
    goal: 'Écrire des pages que les moteurs de recherche, les lecteurs d\'écran et le clavier comprennent. Tout le reste s\'appuie dessus.',
    tasks: [
      { k: 'cours', t: 'Suis le module « Learn HTML » de web.dev : structure d\'un document, titres, listes, liens, images.', u: U.html },
      { k: 'cours', t: 'Lis le module Accessibilité de web.dev : rôles, libellés, ordre du focus, contrastes.', u: U.a11y },
      { k: 'exo', t: 'Recode une page de ton choix (article, formulaire de contact) en HTML seul, sans une ligne de CSS, avec des balises sémantiques.', d: 'Critères : un seul h1, hiérarchie de titres logique, chaque champ de formulaire a un label, tout est atteignable au clavier.' },
      { k: 'valid', t: 'Teste ta page avec la touche Tab seule, puis avec VoiceOver (Cmd+F5 sur Mac) : tu dois pouvoir tout faire sans souris.' }
    ] },
  { id: 'f2', title: 'CSS moderne : flexbox, grid, responsive', hours: 16, core: true,
    goal: 'Mettre en page proprement, sur téléphone d\'abord, avec les outils modernes plutôt que des astuces.',
    tasks: [
      { k: 'cours', t: 'Parcours le cours CSS de web.dev : cascade, spécificité, modèle de boîte, unités.', u: U.css },
      { k: 'exo', t: 'Termine Flexbox Froggy.', u: U.frog },
      { k: 'exo', t: 'Termine CSS Grid Garden.', u: U.garden },
      { k: 'exo', t: 'Mets en forme la page de la phase 1 : mobile d\'abord, deux points de rupture, variables CSS pour les couleurs, thème sombre avec prefers-color-scheme.', d: 'Critères : aucun défilement horizontal à 360 px, cibles tactiles ≥ 44 px, contraste suffisant.' },
      { k: 'valid', t: 'Reproduis de mémoire une mise en page à trois colonnes qui passe en une colonne sur mobile, sans copier de code.' }
    ] },
  { id: 'f3', title: 'JavaScript moderne', hours: 24, core: true,
    goal: 'Maîtriser le langage et le DOM : fonctions, objets, modules, asynchrone, événements.',
    tasks: [
      { k: 'cours', t: 'Lis la partie « Le langage JavaScript » de javascript.info : variables, fonctions, objets, tableaux, closures.', u: U.js },
      { k: 'cours', t: 'Lis les chapitres sur les promesses, async/await et les modules.', u: U.js },
      { k: 'cours', t: 'Lis la partie « Document » : sélection, modification du DOM, événements et délégation.', u: U.js },
      { k: 'exo', t: 'Écris sans framework une petite application de tâches : ajout, case à cocher, suppression, sauvegarde dans localStorage.', d: 'Critères : modules ES, une seule écoute d\'événement par type (délégation), aucune variable globale.' },
      { k: 'exo', t: 'Appelle une API publique avec fetch, gère le chargement et l\'erreur, affiche le résultat.' },
      { k: 'valid', t: 'Explique à voix haute la différence entre une closure, une promesse et un événement, avec un exemple pour chacun.' }
    ] },
  { id: 'f4', title: 'TypeScript', hours: 14, core: true,
    goal: 'Faire vérifier ton code par le compilateur : types, génériques simples, données externes.',
    tasks: [
      { k: 'cours', t: 'Lis le Handbook TypeScript : types de base, interfaces, unions, génériques, narrowing.', u: U.ts },
      { k: 'exo', t: 'Convertis l\'application de tâches de la phase 3 en TypeScript strict.', d: 'Critères : strict activé, aucun any, les données lues depuis localStorage sont validées avant usage.' },
      { k: 'exo', t: 'Type les réponses de l\'API de la phase 3 avec des types précis et une fonction de validation.' },
      { k: 'valid', t: 'Explique la différence entre type et interface, et quand utiliser une union plutôt qu\'un enum.' }
    ] },
  { id: 'f5', title: 'React : composants, état, effets', hours: 24, core: true,
    goal: 'Construire une interface en composants : état, props, effets, formulaires.',
    tasks: [
      { k: 'cours', t: 'Fais le parcours « Learn React » : penser en composants, état, props, rendu conditionnel, listes.', u: U.react },
      { k: 'cours', t: 'Étudie « You Might Not Need an Effect » et la partie sur les hooks personnalisés.', u: U.react },
      { k: 'exo', t: 'Réécris l\'application de tâches en React + TypeScript avec Vite.', d: 'Critères : état remonté au bon niveau, aucun effet inutile, composants courts et nommés.' },
      { k: 'exo', t: 'Ajoute un formulaire contrôlé avec validation et messages d\'erreur accessibles (aria-describedby).' },
      { k: 'valid', t: 'Explique pourquoi on ne modifie jamais l\'état directement, et quand useEffect est la mauvaise réponse.' }
    ] },
  { id: 'f6', title: 'Routage, données et architecture', hours: 16, core: false,
    goal: 'Passer d\'un composant à une application : plusieurs écrans, chargement de données, état partagé.',
    tasks: [
      { k: 'cours', t: 'Lis la documentation de React Router : routes, paramètres, navigation.', u: U.router },
      { k: 'exo', t: 'Ajoute à ton application trois écrans (liste, détail, réglages) avec des adresses lisibles.' },
      { k: 'exo', t: 'Centralise le chargement de données dans un hook : états chargement, erreur, succès, et annulation à la navigation.' },
      { k: 'valid', t: 'Dessine l\'arborescence de tes composants et indique où vit chaque morceau d\'état, et pourquoi.' }
    ] },
  { id: 'f7', title: 'Tests front', hours: 14, core: true,
    goal: 'Prouver que ça marche : tests unitaires, tests de composants, un test de bout en bout.',
    tasks: [
      { k: 'cours', t: 'Lis le guide Vitest : tests, mocks, couverture.', u: U.vitest },
      { k: 'cours', t: 'Lis l\'introduction de Testing Library : tester comme l\'utilisateur, requêtes par rôle.', u: U.rtl },
      { k: 'exo', t: 'Écris des tests de composants pour ton application : afficher, cocher, supprimer, erreur réseau.', d: 'Critères : requêtes par rôle ou libellé, aucun test lié à la structure interne.' },
      { k: 'exo', t: 'Ajoute un test de bout en bout avec Playwright : ouvrir l\'application, ajouter une tâche, recharger, la retrouver.', u: U.pw },
      { k: 'valid', t: 'Casse volontairement une fonctionnalité et vérifie que tes tests le détectent.' }
    ] },
  { id: 'f8', title: 'Performance et qualité web', hours: 10, core: false,
    goal: 'Mesurer avant d\'optimiser : Core Web Vitals, Lighthouse, poids des scripts, accessibilité automatisée.',
    tasks: [
      { k: 'cours', t: 'Lis la page Core Web Vitals de web.dev : LCP, INP, CLS.', u: U.vitals },
      { k: 'exo', t: 'Lance Lighthouse sur ton application, note les scores et corrige les trois points les plus pénalisants.', u: U.lh },
      { k: 'exo', t: 'Découpe ton code par route (import dynamique) et compare le poids avant et après.' },
      { k: 'valid', t: 'Atteins 95 ou plus en accessibilité et en bonnes pratiques sur Lighthouse mobile.' }
    ] },
  { id: 'f9', title: 'Projet portfolio en ligne', hours: 20, core: true,
    goal: 'Livrer : une application complète, testée, accessible, déployée automatiquement.',
    tasks: [
      { k: 'projet', t: 'Choisis un projet réel (par exemple un suivi de lecture ou de budget) et écris en une page : utilisateurs, trois fonctionnalités, ce que tu laisses de côté.' },
      { k: 'projet', t: 'Construis-le en React + TypeScript, avec tests et une intégration continue qui lance types, lint et tests à chaque push.' },
      { k: 'projet', t: 'Déploie-le sur GitHub Pages avec une action automatique.', u: U.pages },
      { k: 'valid', t: 'Présente le projet en 5 minutes à quelqu\'un qui ne connaît pas le web : le problème, la démo, une difficulté rencontrée.' }
    ] }
];

export const FRONT_LEVELS = ['Pas commencé', 'Démarrage', 'Bases du web solides', 'JavaScript à l\'aise', 'React opérationnel', 'Front testé et accessible', 'Dev front confirmé'];

export const FRONT_PHASES: Phase[] = RAW.map((p, pi) => {
  const phase: Phase = { ...p, n: pi + 1, tasks: [] };
  phase.tasks = p.tasks.map((t, i): JavaTask => ({ ...t, id: p.id + 't' + (i + 1), phase }));
  return phase;
});
/** Tâches du parcours à plat, dans l'ordre. */
export const FRONT_TASKS: JavaTask[] = FRONT_PHASES.flatMap((p) => p.tasks);
export const FRONT_HOURS = FRONT_PHASES.reduce((s, p) => s + p.hours, 0);
export const frontPhaseById: Record<string, Phase> = Object.fromEntries(FRONT_PHASES.map((p) => [p.id, p]));
