/** Parcours Architecture logicielle : 8 phases, des principes de conception jusqu'aux décisions d'architecture documentées.
    Même forme que les autres parcours (a1t1, a1t2…). Les références de Martin Fowler et les articles de Robert C. Martin n'existent qu'en anglais ; le reste est en français. */
import { buildPhases, cours, exo, projet, valid, type RawPhase } from '../dsl';
import { azp, en, fowler, guru, msl, wiki } from '../sources';
import type { PathStep, Phase } from '../types';

const RAW: RawPhase[] = [
  { id: 'a1', title: 'Principes de conception et code propre', core: true,
    goal: 'Écrire du code que d\'autres peuvent changer sans le casser : cohésion, couplage, SOLID, refactoring.',
    steps: [
      cours('Couplage et cohésion : les deux boutons de réglage de toute architecture', [wiki('Couplage_(informatique)', 'Couplage (informatique)'), wiki('Coh%C3%A9sion_(informatique)', 'Cohésion (informatique)')], 40, { g: 'Les idées' }),
      cours('Les principes SOLID', [wiki('SOLID_(informatique)', 'SOLID (informatique)')], 60, { g: 'Les idées' }),
      cours('Inversion de dépendance et injection de dépendances', [wiki('Inversion_des_d%C3%A9pendances', 'Inversion des dépendances'), wiki('Injection_de_d%C3%A9pendances', 'Injection de dépendances')], 45, { g: 'Les idées' }),
      cours('Qu\'est-ce que le refactoring et quand le faire', [guru('refactoring/what-is-refactoring', 'Qu\'est-ce que le refactoring ?')], 30, { g: 'Refactoring' }),
      cours('Les mauvaises odeurs du code', [guru('refactoring/smells', 'Mauvaises odeurs du code')], 60, { g: 'Refactoring' }),
      exo('Reprendre un de tes anciens projets : relever cinq mauvaises odeurs et les corriger, tests à l\'appui', [], 120),
      valid('Prends une classe de ton code : montre quelle responsabilité elle a, ce qui la couple aux autres, et comment tu la découperais.')
    ] },
  { id: 'a2', title: 'Patrons de conception', core: true,
    goal: 'Reconnaître les solutions classiques à des problèmes récurrents et savoir quand ne pas les utiliser.',
    steps: [
      cours('Qu\'est-ce qu\'un patron de conception', [guru('design-patterns/what-is-pattern', 'Qu\'est-ce qu\'un patron de conception ?')], 30, { g: 'Introduction' }),
      cours('Patrons de création : fabrique, monteur, singleton', [guru('design-patterns/creational-patterns', 'Patrons de création'), guru('design-patterns/factory-method', 'Fabrique'), guru('design-patterns/builder', 'Monteur')], 75, { g: 'Création' }),
      cours('Patrons de structure : adaptateur, décorateur, façade', [guru('design-patterns/structural-patterns', 'Patrons de structure'), guru('design-patterns/adapter', 'Adaptateur'), guru('design-patterns/decorator', 'Décorateur')], 75, { g: 'Structure' }),
      cours('Patrons de comportement : stratégie, observateur, commande', [guru('design-patterns/behavioral-patterns', 'Patrons de comportement'), guru('design-patterns/strategy', 'Stratégie'), guru('design-patterns/observer', 'Observateur')], 90, { g: 'Comportement' }),
      exo('Implémenter en Java la stratégie et l\'observateur sur un petit cas (calcul de prix, notifications)', [], 120),
      projet('Refondre un module de ton projet en utilisant deux patrons là où ils simplifient vraiment', [], 150, { d: 'Critères : chaque patron répond à un problème nommé (pas de patron « pour faire joli »), les tests existants passent toujours.' }),
      valid('Choisis un patron de mémoire : décris le problème, la solution, un exemple dans une bibliothèque réelle et un cas où il serait excessif.')
    ] },
  { id: 'a3', title: 'Architectures applicatives', core: true,
    goal: 'Organiser une application en couches ou en ports et adaptateurs pour isoler la logique métier de la technique.',
    steps: [
      cours('L\'architecture en couches et ses limites', [wiki('Architecture_en_couches', 'Architecture en couches'), wiki('Mod%C3%A8le-vue-contr%C3%B4leur', 'Modèle-vue-contrôleur')], 45, { g: 'Les modèles' }),
      cours('Architecture hexagonale : ports et adaptateurs', [wiki('Architecture_hexagonale', 'Architecture hexagonale'), en('Alistair Cockburn', 'Hexagonal architecture', 'https://alistair.cockburn.us/hexagonal-architecture/')], 60, { g: 'Les modèles' }),
      cours('Clean Architecture : la règle de dépendance', [en('Robert C. Martin', 'The Clean Architecture', 'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html')], 45, { g: 'Les modèles' }),
      cours('Organiser ses paquets : par couche ou par fonctionnalité', [fowler('bliki/PresentationDomainDataLayering.html', 'Presentation Domain Data Layering')], 30, { g: 'Les modèles' }),
      exo('Refaire une petite API Spring Boot en hexagonal : domaine sans dépendance au framework', [], 150),
      projet('Application avec un domaine pur, deux adaptateurs de persistance interchangeables (mémoire et base) et des tests du domaine sans base', [], 180, { d: 'Critères : le paquet domaine n\'importe aucune classe Spring ni JPA, les tests du domaine tournent en moins d\'une seconde.' }),
      valid('Dessine les dépendances de ton projet : toutes les flèches pointent-elles vers le domaine ? Sinon, dis lesquelles et pourquoi.')
    ] },
  { id: 'a4', title: 'Conception pilotée par le domaine (DDD)', core: true,
    goal: 'Modéliser le métier avec le vocabulaire des experts : langage commun, contextes, agrégats.',
    steps: [
      cours('Le langage omniprésent et la modélisation du domaine', [wiki('Conception_pilot%C3%A9e_par_le_domaine', 'Conception pilotée par le domaine'), fowler('bliki/DomainDrivenDesign.html', 'Domain-Driven Design')], 45, { g: 'Stratégie' }),
      cours('Contextes bornés et cartographie des contextes', [fowler('bliki/BoundedContext.html', 'Bounded Context')], 40, { g: 'Stratégie' }),
      cours('Entités, objets valeur et agrégats', [fowler('bliki/EvansClassification.html', 'Evans Classification'), fowler('bliki/DDD_Aggregate.html', 'DDD Aggregate')], 60, { g: 'Tactique' }),
      exo('Modéliser un cas d\'assurance (contrat, sinistre, garantie) : langage, contextes, agrégats', [], 120),
      valid('Explique à quelqu\'un du métier ton modèle avec ses mots à lui, sans jargon technique, et note ce qu\'il corrige.')
    ] },
  { id: 'a5', title: 'Monolithe, modules et microservices', core: true,
    goal: 'Choisir le bon découpage selon le contexte, plutôt que suivre la mode.',
    steps: [
      cours('Microservices : définition, avantages et coûts', [wiki('Microservices', 'Microservices'), fowler('articles/microservices.html', 'Microservices')], 60, { g: 'Les choix' }),
      cours('Monolith First et monolithe modulaire', [fowler('bliki/MonolithFirst.html', 'Monolith First')], 30, { g: 'Les choix' }),
      cours('Découper : par capacité métier et par sous-domaine', [en('microservices.io', 'Decompose by business capability', 'https://microservices.io/patterns/decomposition/decompose-by-business-capability.html')], 45, { g: 'Découper' }),
      cours('Migrer sans tout réécrire : le patron étrangleur', [azp('strangler-fig', 'Patron Strangler Fig')], 40, { g: 'Découper' }),
      cours('Communication entre services : synchrone ou asynchrone', [en('microservices.io', 'Communication styles', 'https://microservices.io/patterns/communication-style/messaging.html')], 45, { g: 'Découper' }),
      exo('Prendre un monolithe de TP et proposer trois découpages, avec les coûts de chacun', [], 90),
      valid('Argumente pour ou contre les microservices sur un projet de cinq développeurs, en citant au moins trois coûts.')
    ] },
  { id: 'a6', title: 'Événements, CQRS et cohérence', core: false,
    goal: 'Faire communiquer des composants par événements et accepter la cohérence à terme.',
    steps: [
      cours('Architecture orientée événements', [wiki('Architecture_orient%C3%A9e_%C3%A9v%C3%A8nements', 'Architecture orientée événements'), fowler('articles/201701-event-driven.html', 'What do you mean by Event-Driven?')], 50, { g: 'Événements' }),
      cours('CQRS : séparer lecture et écriture', [azp('cqrs', 'Patron CQRS')], 40, { g: 'Événements' }),
      cours('Event sourcing', [fowler('eaaDev/EventSourcing.html', 'Event Sourcing')], 40, { g: 'Événements' }),
      cours('Transactions distribuées : le patron Saga', [azp('saga', 'Patron Saga')], 45, { g: 'Cohérence' }),
      cours('Théorème CAP et cohérence à terme', [wiki('Th%C3%A9or%C3%A8me_CAP', 'Théorème CAP')], 30, { g: 'Cohérence' }),
      projet('Faire communiquer deux services par événements (file de messages) avec un traitement idempotent', [], 150, { d: 'Critères : un message rejoué deux fois ne crée pas de doublon, un échec est réessayé puis envoyé dans une file d\'erreurs.' }),
      valid('Décris ce qui se passe, étape par étape, quand le paiement échoue au milieu d\'une commande répartie sur trois services.')
    ] },
  { id: 'a7', title: 'Résilience, performance et scalabilité', core: false,
    goal: 'Concevoir un système qui continue de répondre quand une partie tombe ou quand la charge double.',
    steps: [
      cours('Réessayer sans aggraver la panne : nouvelle tentative et disjoncteur', [azp('retry', 'Patron Retry'), azp('circuit-breaker', 'Patron Circuit Breaker')], 50, { g: 'Résilience' }),
      cours('Isoler les pannes : le patron Bulkhead', [azp('bulkhead', 'Patron Bulkhead')], 30, { g: 'Résilience' }),
      cours('Mettre en cache : Cache-Aside et invalidation', [azp('cache-aside', 'Patron Cache-Aside')], 40, { g: 'Performance' }),
      cours('Mise à l\'échelle : verticale, horizontale et sans état', [wiki('Scalabilit%C3%A9', 'Scalabilité')], 40, { g: 'Performance' }),
      exo('Ajouter à une API un cache, un délai d\'attente et un disjoncteur, puis simuler la panne d\'une dépendance', [], 120),
      valid('Pour ton projet, liste ce qui tombe si la base est lente pendant dix minutes, et ce que le système fait alors.')
    ] },
  { id: 'a8', title: 'Décider et documenter l\'architecture', core: true,
    goal: 'Rendre les choix d\'architecture visibles, justifiés et révisables, pour une équipe et pour soi dans six mois.',
    steps: [
      cours('Les attributs de qualité et les compromis', [wiki('Exigence_(ing%C3%A9nierie)', 'Exigence (ingénierie)'), msl('azure/well-architected/', 'Azure Well-Architected Framework')], 45, { g: 'Décider' }),
      cours('Documenter une décision : les ADR', [en('ADR', 'Architecture Decision Records', 'https://adr.github.io/')], 30, { g: 'Documenter' }),
      cours('Le modèle C4 : contexte, conteneurs, composants', [en('C4 model', 'The C4 model for visualising software architecture', 'https://c4model.com/')], 45, { g: 'Documenter' }),
      cours('Modèle de documentation arc42', [en('arc42', 'arc42 : vue d\'ensemble', 'https://arc42.org/overview')], 30, { g: 'Documenter' }),
      projet('Documenter l\'architecture d\'un de tes projets : schéma C4 niveaux 1 et 2, cinq ADR, risques et dette connus', [], 180, { d: 'Critères : un lecteur extérieur comprend le système en dix minutes, chaque ADR liste au moins une alternative écartée et pourquoi.' }),
      valid('Présente ton architecture en dix minutes à quelqu\'un qui ne connaît pas le projet et note chaque question qui montre un trou dans la documentation.')
    ] }
];

export const ARCHI_LEVELS = ['Pas commencé', 'Démarrage', 'Bases de conception', 'Patrons maîtrisés', 'Architecture en couches', 'Pensée par le domaine', 'Architecte confirmé'];
export const ARCHI_PHASES: Phase[] = buildPhases(RAW);
export const ARCHI_TASKS: PathStep[] = ARCHI_PHASES.flatMap((p) => p.tasks);
export const ARCHI_HOURS = ARCHI_PHASES.reduce((s, p) => s + p.hours, 0);
export const archiPhaseById: Record<string, Phase> = Object.fromEntries(ARCHI_PHASES.map((p) => [p.id, p]));
