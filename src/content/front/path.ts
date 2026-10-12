/** Parcours dev front : 9 phases, du HTML sémantique au React testé et accessible, jusqu'à un portfolio en ligne.
    Chapitres, exercices et projets avec liens (MDN, javascript.info et React en français). Même forme que le parcours Java (f1t1, f1t2…). */
import { buildPhases, cours, exo, projet, valid, type RawPhase } from '../dsl';
import { en, fr, gha, jsi, learn, mdn, react, wiki } from '../sources';
import type { PathStep, Phase } from '../types';

const GRAFIKART = (p: string, title: string) => fr('Grafikart', title, 'https://grafikart.fr/' + p);

const RAW: RawPhase[] = [
  { id: 'f1', title: 'HTML sémantique et accessibilité', core: true,
    goal: 'Écrire des pages que les moteurs de recherche, les lecteurs d\'écran et le clavier comprennent. Tout le reste s\'appuie dessus.',
    steps: [
      cours('Syntaxe de base du HTML', [learn('Core/Structuring_content/Basic_HTML_syntax', 'Syntaxe de base du HTML')], 30, { g: 'Le texte et la structure' }),
      cours('Métadonnées de la page (l\'en-tête)', [learn('Core/Structuring_content/Webpage_metadata', 'Métadonnées d\'une page Web')], 20, { g: 'Le texte et la structure' }),
      cours('Titres, paragraphes, emphase et listes', [learn('Core/Structuring_content/Headings_and_paragraphs', 'Titres et paragraphes'), learn('Core/Structuring_content/Lists', 'Listes')], 40, { g: 'Le texte et la structure' }),
      cours('Structurer des documents : header, nav, main, footer', [learn('Core/Structuring_content/Structuring_documents', 'Structurer des documents'), learn('Core/Structuring_content/Structuring_a_page_of_content', 'Structurer une page de contenu')], 45, { g: 'Le texte et la structure' }),
      cours('Liens, images, audio et vidéo', [learn('Core/Structuring_content/Creating_links', 'Créer des liens'), learn('Core/Structuring_content/HTML_images', 'Images HTML'), learn('Core/Structuring_content/HTML_video_and_audio', 'Vidéo et audio HTML')], 50, { g: 'Le contenu' }),
      cours('Tableaux HTML', [learn('Core/Structuring_content/HTML_table_basics', 'Bases des tableaux HTML'), learn('Core/Structuring_content/Table_accessibility', 'Accessibilité des tableaux')], 30, { g: 'Le contenu' }),
      cours('Formulaires et boutons', [learn('Core/Structuring_content/HTML_forms', 'Formulaires et boutons en HTML'), learn('Extensions/Forms/HTML5_input_types', 'Les types de champs HTML5')], 60, { g: 'Les formulaires' }),
      cours('Qu\'est-ce que l\'accessibilité ?', [learn('Core/Accessibility/What_is_accessibility', 'Qu\'est-ce que l\'accessibilité ?'), learn('Core/Accessibility/HTML', 'HTML : une bonne base pour l\'accessibilité')], 45, { g: 'Accessibilité' }),
      cours('WAI-ARIA : les bases', [learn('Core/Accessibility/WAI-ARIA_basics', 'Principes de base du WAI-ARIA')], 30, { g: 'Accessibilité' }),
      exo('Tester tes connaissances : les exercices MDN sur le HTML', [learn('Core/Structuring_content/Test_your_skills', 'Tester vos compétences : HTML')], 45),
      projet('Recoder une page de ton choix (article, formulaire de contact) en HTML seul, sans une ligne de CSS', [], 90, { d: 'Critères : un seul h1, hiérarchie de titres logique, chaque champ de formulaire a un label, tout est atteignable au clavier.' }),
      valid('Teste ta page avec la touche Tab seule, puis avec VoiceOver (Cmd+F5 sur Mac) : tu dois pouvoir tout faire sans souris.')
    ] },
  { id: 'f2', title: 'CSS moderne : flexbox, grid, responsive', core: true,
    goal: 'Mettre en page proprement, sur téléphone d\'abord, avec les outils modernes plutôt que des astuces.',
    steps: [
      cours('Qu\'est-ce que le CSS ? Premiers pas', [learn('Core/Styling_basics/What_is_CSS', 'Qu\'est-ce que le CSS ?'), learn('Core/Styling_basics/Getting_started', 'Commencer avec le CSS')], 45, { g: 'Les bases' }),
      cours('Sélecteurs, pseudo-classes et combinateurs', [learn('Core/Styling_basics/Basic_selectors', 'Sélecteurs CSS de base'), learn('Core/Styling_basics/Pseudo_classes_and_elements', 'Pseudo-classes et pseudo-éléments'), learn('Core/Styling_basics/Combinators', 'Sélecteurs combinés')], 60, { g: 'Les bases' }),
      cours('La cascade : gérer les conflits et la spécificité', [learn('Core/Styling_basics/Handling_conflicts', 'Gérer les conflits')], 30, { g: 'Les bases' }),
      cours('Le modèle de boîte', [learn('Core/Styling_basics/Box_model', 'Le modèle de boîte')], 40, { g: 'Les bases' }),
      cours('Valeurs, unités et dimensions', [learn('Core/Styling_basics/Values_and_units', 'Valeurs et unités'), learn('Core/Styling_basics/Sizing', 'Dimensionner les éléments en CSS')], 40, { g: 'Les bases' }),
      cours('Arrière-plans, bordures et débordement', [learn('Core/Styling_basics/Backgrounds_and_borders', 'Arrière-plans et bordures'), learn('Core/Styling_basics/Overflow', 'Contenu débordant')], 40, { g: 'Les bases' }),
      cours('Introduction à la mise en page CSS', [learn('Core/CSS_layout/Introduction', 'Introduction à la mise en page en CSS')], 30, { g: 'La mise en page' }),
      cours('Flexbox', [learn('Core/CSS_layout/Flexbox', 'Flexbox')], 60, { g: 'La mise en page' }),
      cours('Grilles CSS (Grid)', [learn('Core/CSS_layout/Grids', 'Grilles')], 60, { g: 'La mise en page' }),
      cours('Positionnement', [learn('Core/CSS_layout/Positioning', 'Le positionnement')], 30, { g: 'La mise en page' }),
      cours('Responsive design', [learn('Core/CSS_layout/Responsive_Design', 'Responsive design')], 45, { g: 'La mise en page' }),
      exo('Flexbox Froggy', [fr('Jeu', 'Flexbox Froggy', 'https://flexboxfroggy.com/')], 30),
      exo('CSS Grid Garden', [fr('Jeu', 'CSS Grid Garden', 'https://cssgridgarden.com/')], 30),
      projet('Mettre en forme la page de la phase 1 : mobile d\'abord, deux points de rupture, variables CSS, thème sombre', [], 150, { d: 'Critères : aucun défilement horizontal à 360 px, cibles tactiles ≥ 44 px, contraste suffisant, prefers-color-scheme.' }),
      valid('Reproduis de mémoire une mise en page à trois colonnes qui passe en une colonne sur mobile, sans copier de code.')
    ] },
  { id: 'f3', title: 'JavaScript moderne', core: true,
    goal: 'Maîtriser le langage et le DOM : fonctions, objets, modules, asynchrone, événements.',
    steps: [
      cours('Qu\'est-ce que JavaScript ? Premier code', [learn('Core/Scripting/What_is_JavaScript', 'Qu\'est-ce que JavaScript ?'), learn('Core/Scripting/A_first_splash', 'Notre premier code JavaScript')], 45, { g: 'Les bases du langage' }),
      cours('Variables, nombres et chaînes', [learn('Core/Scripting/Variables', 'Les variables'), learn('Core/Scripting/Strings', 'Les chaînes de caractères')], 45, { g: 'Les bases du langage' }),
      cours('Tableaux, conditions et boucles', [learn('Core/Scripting/Arrays', 'Les tableaux'), learn('Core/Scripting/Conditionals', 'Les conditions'), learn('Core/Scripting/Loops', 'Les boucles')], 60, { g: 'Les bases du langage' }),
      cours('Fonctions', [learn('Core/Scripting/Functions', 'Fonctions'), learn('Core/Scripting/Return_values', 'Valeurs de retour'), jsi('function-basics', 'Les fonctions')], 60, { g: 'Les bases du langage' }),
      cours('Objets et tableaux en profondeur', [learn('Core/Scripting/Object_basics', 'Les bases des objets'), jsi('object', 'Objets'), jsi('array', 'Tableaux et méthodes')], 75, { g: 'Aller plus loin' }),
      cours('Closures et portée des variables', [jsi('closure', 'Portée des variables et closures')], 40, { g: 'Aller plus loin' }),
      cours('Classes', [jsi('class', 'Classes')], 40, { g: 'Aller plus loin' }),
      cours('Modules ES', [jsi('modules-intro', 'Modules : introduction')], 30, { g: 'Aller plus loin' }),
      cours('Manipuler le DOM', [learn('Core/Scripting/DOM_scripting', 'Manipuler des documents'), jsi('dom-nodes', 'Arborescence du DOM')], 60, { g: 'Le navigateur' }),
      cours('Événements et délégation', [learn('Core/Scripting/Events', 'Introduction aux évènements'), jsi('event-delegation', 'Délégation d\'événements')], 50, { g: 'Le navigateur' }),
      cours('Promesses et async/await', [learn('Extensions/Async_JS/Introducing', 'Introduction au JavaScript asynchrone'), jsi('promise-basics', 'Les promesses'), jsi('async-await', 'Async/await')], 75, { g: 'L\'asynchrone et le réseau' }),
      cours('Récupérer des données : fetch et JSON', [learn('Core/Scripting/Network_requests', 'Récupérer des données du serveur'), learn('Core/Scripting/JSON', 'Manipuler des données JSON')], 45, { g: 'L\'asynchrone et le réseau' }),
      cours('Stockage dans le navigateur : localStorage', [jsi('localstorage', 'LocalStorage et sessionStorage')], 25, { g: 'L\'asynchrone et le réseau' }),
      exo('Exercices MDN : tableaux et fonctions', [learn('Core/Scripting/Test_your_skills/Arrays', 'Testez vos compétences : les tableaux')], 45),
      projet('Application de tâches sans framework : ajout, case à cocher, suppression, sauvegarde dans localStorage', [], 180, { d: 'Critères : modules ES, une seule écoute d\'événement par type (délégation), aucune variable globale.' }),
      projet('Appeler une API publique avec fetch, gérer le chargement et l\'erreur, afficher le résultat', [learn('Core/Scripting/Network_requests', 'Récupérer des données du serveur')], 90),
      valid('Explique à voix haute la différence entre une closure, une promesse et un événement, avec un exemple pour chacun.')
    ] },
  { id: 'f4', title: 'TypeScript', core: true,
    goal: 'Faire vérifier ton code par le compilateur : types, génériques simples, données externes.',
    steps: [
      cours('TypeScript en 5 minutes', [en('TypeScript', 'TypeScript for JavaScript Programmers', 'https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html')], 15, { g: 'Les bases' }),
      cours('Formation TypeScript en français', [GRAFIKART('formations/typescript', 'Apprendre TypeScript')], 120, { g: 'Les bases' }),
      cours('Types courants : primitifs, tableaux, unions', [en('TypeScript', 'Everyday Types', 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html')], 40, { g: 'Le manuel' }),
      cours('Narrowing : affiner un type', [en('TypeScript', 'Narrowing', 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html')], 30, { g: 'Le manuel' }),
      cours('Fonctions et types d\'objets', [en('TypeScript', 'More on Functions', 'https://www.typescriptlang.org/docs/handbook/2/functions.html'), en('TypeScript', 'Object Types', 'https://www.typescriptlang.org/docs/handbook/2/objects.html')], 45, { g: 'Le manuel' }),
      cours('Génériques', [en('TypeScript', 'Generics', 'https://www.typescriptlang.org/docs/handbook/2/generics.html')], 40, { g: 'Le manuel' }),
      exo('Convertir l\'application de tâches de la phase 3 en TypeScript strict', [], 120, { d: 'Critères : strict activé, aucun any, les données lues depuis localStorage sont validées avant usage.' }),
      exo('Typer les réponses de l\'API de la phase 3 avec des types précis et une fonction de validation', [], 60),
      valid('Explique la différence entre type et interface, et quand utiliser une union plutôt qu\'un enum.')
    ] },
  { id: 'f5', title: 'React : composants, état, effets', core: true,
    goal: 'Construire une interface en composants : état, props, effets, formulaires.',
    steps: [
      cours('Démarrer un projet React avec Vite', [react('learn/start-a-new-react-project', 'Démarrer un nouveau projet React')], 20, { g: 'Démarrer' }),
      cours('Décrire l\'interface : composants, JSX, props, listes', [react('learn/describing-the-ui', 'Décrire l\'UI'), react('learn/passing-props-to-a-component', 'Passer des props'), react('learn/rendering-lists', 'Afficher des listes')], 90, { g: 'Les bases' }),
      cours('Ajouter de l\'interactivité : événements et état', [react('learn/adding-interactivity', 'Ajouter de l\'interactivité'), react('learn/state-a-components-memory', 'L\'état : la mémoire d\'un composant')], 90, { g: 'Les bases' }),
      cours('Penser en React', [react('learn/thinking-in-react', 'Penser en React')], 30, { g: 'Les bases' }),
      cours('Gérer l\'état : le remonter, le structurer', [react('learn/managing-state', 'Gérer l\'état'), react('learn/sharing-state-between-components', 'Partager l\'état entre composants')], 75, { g: 'L\'état' }),
      cours('Effets : se synchroniser avec l\'extérieur', [react('learn/synchronizing-with-effects', 'Synchroniser avec les Effets'), react('learn/you-might-not-need-an-effect', 'Vous n\'avez peut-être pas besoin d\'un Effet')], 75, { g: 'Les effets' }),
      cours('Hooks personnalisés', [react('learn/reusing-logic-with-custom-hooks', 'Réutiliser la logique avec des hooks personnalisés')], 30, { g: 'Les effets' }),
      cours('React et TypeScript', [react('learn/typescript', 'Utiliser TypeScript')], 30, { g: 'Les effets' }),
      cours('Version guidée : liste de tâches React (MDN)', [learn('Core/Frameworks_libraries/React_getting_started', 'Premier pas avec React')], 120, { g: 'S\'entraîner' }),
      exo('Tutoriel officiel : le jeu du morpion', [react('learn/tutorial-tic-tac-toe', 'Tutoriel : Morpion')], 90),
      projet('Réécrire l\'application de tâches en React + TypeScript avec Vite', [], 240, { d: 'Critères : état remonté au bon niveau, aucun effet inutile, composants courts et nommés.' }),
      projet('Ajouter un formulaire contrôlé avec validation et messages d\'erreur accessibles (aria-describedby)', [learn('Extensions/Forms/Form_validation', 'Validation des données du formulaire côté client')], 90),
      valid('Explique pourquoi on ne modifie jamais l\'état directement, et quand useEffect est la mauvaise réponse.')
    ] },
  { id: 'f6', title: 'Routage, données et architecture', core: false,
    goal: 'Passer d\'un composant à une application : plusieurs écrans, chargement de données, état partagé.',
    steps: [
      cours('React Router : routes, paramètres, navigation', [en('React Router', 'Documentation de React Router', 'https://reactrouter.com/start/library/installation')], 45, { g: 'Plusieurs écrans' }),
      cours('Les API du navigateur : stockage côté client', [learn('Extensions/Client-side_APIs/Client-side_storage', 'Stockage côté client')], 40, { g: 'Les données' }),
      cours('Récupérer des données dans React : états chargement, erreur, succès', [react('learn/you-might-not-need-an-effect', 'Récupération de données')], 30, { g: 'Les données' }),
      cours('Gérer les cas complexes avec un reducer', [react('learn/extracting-state-logic-into-a-reducer', 'Extraire la logique d\'état dans un reducer')], 40, { g: 'Les données' }),
      cours('Le contexte : partager des données sans les passer partout', [react('learn/passing-data-deeply-with-context', 'Passer des données en profondeur avec le contexte')], 30, { g: 'Les données' }),
      exo('Ajouter à ton application trois écrans (liste, détail, réglages) avec des adresses lisibles', [], 90),
      exo('Centraliser le chargement de données dans un hook : états chargement, erreur, succès, et annulation à la navigation', [], 90),
      valid('Dessine l\'arborescence de tes composants et indique où vit chaque morceau d\'état, et pourquoi.')
    ] },
  { id: 'f7', title: 'Tests front', core: true,
    goal: 'Prouver que ça marche : tests unitaires, tests de composants, un test de bout en bout.',
    steps: [
      cours('Stratégies de test', [learn('Extensions/Testing/Testing_strategies', 'Stratégies de réalisation des tests')], 30, { g: 'Les concepts' }),
      cours('Tests unitaires : le principe', [wiki('Test_unitaire', 'Test unitaire')], 15, { g: 'Les concepts' }),
      cours('Vitest : tests, mocks, couverture', [en('Vitest', 'Guide Vitest', 'https://vitest.dev/guide/')], 45, { g: 'Les outils' }),
      cours('Testing Library : tester comme l\'utilisateur', [en('Testing Library', 'Introduction à React Testing Library', 'https://testing-library.com/docs/react-testing-library/intro/')], 45, { g: 'Les outils' }),
      cours('Playwright : un test de bout en bout', [en('Playwright', 'Démarrer avec Playwright', 'https://playwright.dev/docs/intro')], 45, { g: 'Les outils' }),
      exo('Écrire des tests de composants : afficher, cocher, supprimer, erreur réseau', [], 120, { d: 'Critères : requêtes par rôle ou libellé, aucun test lié à la structure interne.' }),
      exo('Ajouter un test de bout en bout : ouvrir l\'application, ajouter une tâche, recharger, la retrouver', [], 90),
      valid('Casse volontairement une fonctionnalité et vérifie que tes tests le détectent.')
    ] },
  { id: 'f8', title: 'Performance et qualité web', core: false,
    goal: 'Mesurer avant d\'optimiser : Core Web Vitals, Lighthouse, poids des scripts, accessibilité automatisée.',
    steps: [
      cours('Pourquoi la performance compte', [learn('Extensions/Performance/why_web_performance', 'Le « pourquoi » des performances Web')], 20, { g: 'Comprendre' }),
      cours('Mesurer les performances', [learn('Extensions/Performance/Measuring_performance', 'Mesurer les performances')], 30, { g: 'Comprendre' }),
      cours('Optimiser images, HTML et CSS', [learn('Extensions/Performance/Multimedia', 'Multimédia : images'), learn('Extensions/Performance/HTML', 'Fonctionnalités de performances HTML'), learn('Extensions/Performance/CSS', 'Optimisation des performances en CSS')], 60, { g: 'Optimiser' }),
      cours('Core Web Vitals : LCP, INP, CLS', [en('web.dev', 'Core Web Vitals', 'https://web.dev/articles/vitals')], 25, { g: 'Optimiser' }),
      cours('Diagnostic et outils d\'accessibilité', [learn('Core/Accessibility/Accessibility_troubleshooting', 'Diagnostic et amélioration de l\'accessibilité'), learn('Core/Accessibility/Tooling', 'Outils d\'accessibilité')], 45, { g: 'Accessibilité' }),
      exo('Lancer Lighthouse sur ton application, noter les scores et corriger les trois points les plus pénalisants', [en('Chrome', 'Lighthouse', 'https://developer.chrome.com/docs/lighthouse/overview')], 90),
      exo('Découper ton code par route (import dynamique) et comparer le poids avant et après', [mdn('Web/JavaScript/Reference/Operators/import', 'import() dynamique')], 60),
      valid('Atteins 95 ou plus en accessibilité et en bonnes pratiques sur Lighthouse mobile.')
    ] },
  { id: 'f9', title: 'Projet portfolio en ligne', core: true,
    goal: 'Livrer : une application complète, testée, accessible, déployée automatiquement.',
    steps: [
      cours('GitHub Pages et GitHub Actions : déployer automatiquement', [gha('pages', 'GitHub Pages'), gha('actions/about-github-actions/understanding-github-actions', 'Comprendre GitHub Actions')], 45, { g: 'Préparer' }),
      projet('Choisir un projet réel et cadrer en une page', [], 60, { d: 'Utilisateurs, trois fonctionnalités, ce que tu laisses de côté (par exemple un suivi de lecture ou de budget).' }),
      projet('Construire l\'application en React + TypeScript, avec tests et intégration continue', [], 600, { d: 'Types, lint et tests lancés à chaque push.' }),
      projet('Déployer sur GitHub Pages avec une action automatique', [gha('pages', 'GitHub Pages')], 90),
      valid('Présente le projet en 5 minutes à quelqu\'un qui ne connaît pas le web : le problème, la démo, une difficulté rencontrée.')
    ] }
];

export const FRONT_LEVELS = ['Pas commencé', 'Démarrage', 'Bases du web solides', 'JavaScript à l\'aise', 'React opérationnel', 'Front testé et accessible', 'Dev front confirmé'];

export const FRONT_PHASES: Phase[] = buildPhases(RAW);
/** Étapes du parcours à plat, dans l'ordre. */
export const FRONT_TASKS: PathStep[] = FRONT_PHASES.flatMap((p) => p.tasks);
export const FRONT_HOURS = FRONT_PHASES.reduce((s, p) => s + p.hours, 0);
export const frontPhaseById: Record<string, Phase> = Object.fromEntries(FRONT_PHASES.map((p) => [p.id, p]));
