/** Parcours Java backend : 14 phases, tâches à plat (JT), liens de ressources. */
import type { JavaKind, JavaTask, Phase } from '../types';

interface RawTask { k: JavaKind; t: string; u?: string; d?: string }
interface RawPhase { id: string; title: string; hours: number; core: boolean; goal: string; tasks: RawTask[] }

const U = {
  mooc: "https://java-programming.mooc.fi/", oc: "https://openclassrooms.com/courses/6900101-creez-une-application-java-avec-spring-boot",
  bael: "https://www.baeldung.com/", sqlbolt: "https://sqlbolt.com/", boot: "https://docs.spring.io/spring-boot/", guides: "https://spring.io/guides",
  flyway: "https://flywaydb.org/documentation", junit: "https://junit.org/junit5/docs/current/user-guide/", mockito: "https://site.mockito.org/",
  tc: "https://testcontainers.com/guides/", owasp: "https://owasp.org/www-project-top-ten/", docker: "https://docs.docker.com/get-started/",
  gha: "https://docs.github.com/actions", rg: "https://refactoring.guru/design-patterns", kafka: "https://kafka.apache.org/quickstart",
  r4j: "https://resilience4j.readme.io/", prom: "https://prometheus.io/docs/", sdp: "https://github.com/donnemartin/system-design-primer"
};
const RAW_PHASES: RawPhase[] = [
  { id: "p1", title: "Java : remise à niveau", hours: 25, core: true, goal: "Retrouver la syntaxe Java et penser objet. Tu es déjà développeur : on traduit ce que tu sais, on ne repart pas de zéro.", tasks: [
    { k: "cours", t: "MOOC Helsinki, Java Programming II : fais les exercices sur classes, interfaces, collections, exceptions et fichiers. Saute ce que tu maîtrises déjà.", u: U.mooc },
    { k: "cours", t: "Lire et écrire des lambdas et des Streams (map, filter, collect) et comprendre Optional.", u: U.bael },
    { k: "exo", t: "Séance 1 : estPair, sommeTableau (itératif puis récursif), recherche linéaire, inverserChaine sans reverse()." },
    { k: "exo", t: "Réécrire trois de tes boucles for avec des Streams." },
    { k: "exo", t: "Créer une interface Paiement avec deux implémentations et les utiliser par la même variable (polymorphisme)." },
    { k: "projet", t: "Devoir séance 1 : programme console qui teste si n est premier, affiche Fibonacci en itératif et en récursif, et mesure les deux temps pour n = 35.", d: "Critères : fonctions séparées, entrée négative gérée, commits lisibles." },
    { k: "projet", t: "Gestion de bibliothèque en console : livres, adhérents, emprunts.", d: "Interfaces ou héritage, List et Map, exceptions métier maison, sauvegarde dans un fichier." },
    { k: "valid", t: "Les deux projets sont sur GitHub avec un README et un historique de commits lisible." }] },
  { id: "p2", title: "Outils : Git, Maven, IntelliJ", hours: 8, core: true, goal: "Les gestes que tout le monde attend de toi dès le premier jour dans une équipe.", tasks: [
    { k: "cours", t: "Maven : cycle de vie (compile, test, package), pom.xml, gestion des dépendances.", u: U.bael },
    { k: "cours", t: "Git en équipe : branches, merge contre rebase, résolution de conflit, pull request." },
    { k: "exo", t: "Provoquer volontairement un conflit entre deux branches puis le résoudre." },
    { k: "exo", t: "Déboguer pas à pas dans IntelliJ : breakpoint conditionnel, Evaluate Expression." },
    { k: "projet", t: "Migrer la bibliothèque vers Maven et produire un jar exécutable avec mvn clean package." },
    { k: "valid", t: "Quelqu'un d'autre clone ton dépôt et lance l'appli avec une seule commande." }] },
  { id: "p3", title: "SQL et bases de données", hours: 20, core: true, goal: "Un backend, c'est surtout des données. Mieux tu comprends SQL, moins Spring te surprendra ensuite.", tasks: [
    { k: "cours", t: "SQLBolt : toutes les leçons jusqu'aux jointures et agrégats.", u: U.sqlbolt },
    { k: "cours", t: "Installer PostgreSQL (en local ou avec Docker) et un client (DBeaver ou psql)." },
    { k: "cours", t: "Index, clés étrangères, transactions (ACID), niveaux d'isolation : comprendre pourquoi ça existe." },
    { k: "exo", t: "Écrire 10 requêtes sur ton schéma : JOIN, GROUP BY, HAVING, sous-requête." },
    { k: "exo", t: "Lire un EXPLAIN avant et après l'ajout d'un index." },
    { k: "projet", t: "Modéliser la bibliothèque en tables avec contraintes, puis la remplir avec un script SQL." },
    { k: "projet", t: "Lire et écrire dans cette base depuis Java en JDBC brut, sans framework.", d: "Tu verras ensuite exactement ce que Spring te cache." },
    { k: "valid", t: "Tu expliques à voix haute la différence entre INNER JOIN et LEFT JOIN, et ce qu'est une transaction." }] },
  { id: "p4", title: "Spring Boot : premier projet", hours: 20, core: true, goal: "Comprendre le trajet d'une requête HTTP : contrôleur, service, repository. C'est la clé de la plupart des tâches qu'on te donnera.", tasks: [
    { k: "cours", t: "OpenClassrooms, « Créez une application Java avec Spring Boot » (environ 8 h, en accès libre).", u: U.oc },
    { k: "cours", t: "Documentation Spring Boot : auto-configuration, profils, application.yml.", u: U.boot },
    { k: "cours", t: "Guide spring.io « Building a RESTful Web Service ».", u: U.guides },
    { k: "exo", t: "Refaire le projet du cours sans regarder la correction." },
    { k: "exo", t: "Créer deux profils (dev et prod) avec des propriétés différentes et les activer." },
    { k: "exo", t: "Expliquer à voix haute le trajet d'une requête : contrôleur, service, repository." },
    { k: "projet", t: "API Tâches (to-do) en mémoire : créer, lister, modifier, supprimer.", d: "Couches séparées, injection par constructeur, aucune logique métier dans le contrôleur." },
    { k: "valid", t: "L'appli démarre, répond sur 4 endpoints, et tu sais expliquer l'injection de dépendances." }] },
  { id: "p5", title: "Spring Data JPA", hours: 25, core: true, goal: "Brancher l'API sur une vraie base, versionner le schéma, et repérer le piège classique : le N+1.", tasks: [
    { k: "cours", t: "Spring Data JPA : entités, repositories, requêtes dérivées.", u: U.bael },
    { k: "cours", t: "Relations @OneToMany et @ManyToOne, chargement LAZY contre EAGER, problème du N+1." },
    { k: "cours", t: "Flyway : versionner le schéma avec des migrations SQL.", u: U.flyway },
    { k: "exo", t: "Ajouter une entité Utilisateur liée aux Tâches (un utilisateur, plusieurs tâches)." },
    { k: "exo", t: "Écrire une requête dérivée, une @Query JPQL et une pagination avec Pageable." },
    { k: "exo", t: "Provoquer un N+1 volontairement, le repérer dans les logs SQL, puis le corriger." },
    { k: "projet", t: "Brancher l'API Tâches sur PostgreSQL avec des migrations Flyway.", d: "Aucune table créée à la main : tout passe par des migrations versionnées." },
    { k: "valid", t: "Tu détruis la base, relances l'appli, et le schéma se recrée à l'identique." }] },
  { id: "p6", title: "API REST propre", hours: 25, core: true, goal: "La différence entre une API qui marche et une API qu'une équipe accepte de maintenir.", tasks: [
    { k: "cours", t: "Conception REST : ressources, verbes, codes HTTP (200, 201, 204, 400, 404, 409, 422), idempotence." },
    { k: "cours", t: "DTOs, MapStruct et validation (@Valid, Bean Validation).", u: U.bael },
    { k: "cours", t: "Gestion centralisée des erreurs avec @ControllerAdvice et un format d'erreur unique." },
    { k: "cours", t: "Documenter l'API avec OpenAPI et Swagger (springdoc)." },
    { k: "exo", t: "Renvoyer des erreurs au même format JSON pour les cas 400, 404 et 409." },
    { k: "exo", t: "Ajouter pagination, tri et filtre sur la liste des tâches." },
    { k: "projet", t: "API de réservation de salles : salles, créneaux, réservations.", d: "Règle métier : deux réservations ne se chevauchent jamais. 6 endpoints minimum, DTOs, erreurs propres, Swagger lisible." },
    { k: "valid", t: "Un autre développeur utilise ton API avec Swagger seul, sans te poser de question." }] },
  { id: "p7", title: "Tests : JUnit, Mockito, Testcontainers", hours: 25, core: true, goal: "Une équipe sérieuse attend que tu testes ce que tu écris. Ce palier fait de toi quelqu'un à qui on peut confier du code.", tasks: [
    { k: "cours", t: "JUnit 5 : cycle de vie, tests paramétrés, assertions.", u: U.junit },
    { k: "cours", t: "Mockito : mocks, stubs, vérifications.", u: U.mockito },
    { k: "cours", t: "Tests Spring Boot : @WebMvcTest, @DataJpaTest, @SpringBootTest.", u: U.bael },
    { k: "cours", t: "Testcontainers : tester contre un vrai PostgreSQL.", u: U.tc },
    { k: "exo", t: "Kata TDD (Roman Numerals ou FizzBuzz) : un cycle rouge, vert, refactor à la fois." },
    { k: "exo", t: "Tester un service avec Mockito en moquant le repository." },
    { k: "exo", t: "Tester un contrôleur avec MockMvc, cas passant et cas d'erreur." },
    { k: "projet", t: "Couvrir l'API de réservation de salles.", d: "Au moins 70 % de couverture JaCoCo sur la couche service, un test d'intégration avec PostgreSQL via Testcontainers, le cas de chevauchement testé." },
    { k: "valid", t: "mvn test passe sur un poste neuf, et tu sais dire pourquoi tu as mocké ici et pas là." }] },
  { id: "p8", title: "Sécurité : Spring Security, JWT", hours: 20, core: false, goal: "Authentifier, autoriser, et ne pas faire les erreurs que la liste OWASP recense depuis des années.", tasks: [
    { k: "cours", t: "Spring Security : chaîne de filtres, authentification contre autorisation.", u: U.bael },
    { k: "cours", t: "BCrypt, JWT (structure, expiration, refresh), CORS et CSRF." },
    { k: "cours", t: "OWASP Top 10 : lire les 10 entrées et noter lesquelles concernent ton API.", u: U.owasp },
    { k: "exo", t: "Hasher un mot de passe avec BCrypt et vérifier une connexion." },
    { k: "exo", t: "Protéger un endpoint par rôle avec @PreAuthorize." },
    { k: "projet", t: "Sécuriser l'API de réservation : inscription, connexion JWT, rôles USER et ADMIN.", d: "Seul un ADMIN crée une salle. Un USER ne voit que ses propres réservations." },
    { k: "valid", t: "Des tests prouvent qu'un USER reçoit 403 sur une route ADMIN et qu'un appel sans token reçoit 401." }] },
  { id: "p9", title: "Docker et CI/CD", hours: 20, core: false, goal: "Faire tourner ton code ailleurs que sur ta machine, et le faire tester automatiquement.", tasks: [
    { k: "cours", t: "Docker : images, conteneurs, volumes, réseaux.", u: U.docker },
    { k: "cours", t: "GitHub Actions : workflows, jobs, cache Maven.", u: U.gha },
    { k: "exo", t: "Écrire un Dockerfile multi-étapes pour ton appli Spring Boot." },
    { k: "exo", t: "Écrire un docker-compose avec l'appli et PostgreSQL." },
    { k: "projet", t: "Pipeline CI : à chaque push, build Maven, tests, et image Docker construite." },
    { k: "valid", t: "docker compose up sur une machine vierge et l'API répond." }] },
  { id: "p10", title: "Architecture et design patterns", hours: 30, core: false, goal: "Structurer le code pour qu'il survive à son troisième développeur.", tasks: [
    { k: "cours", t: "SOLID : pour chaque lettre, un exemple de violation et sa correction." },
    { k: "cours", t: "Design patterns : Strategy, Factory, Builder, Observer, Decorator.", u: U.rg },
    { k: "cours", t: "Architecture hexagonale : ports, adaptateurs, domaine sans dépendance Spring." },
    { k: "cours", t: "DDD (notions) : entité, objet-valeur, agrégat, contexte borné." },
    { k: "exo", t: "Remplacer un gros if/else de ton code par un Strategy." },
    { k: "exo", t: "Écrire un ADR (Architecture Decision Record) d'une page pour un choix de ton projet." },
    { k: "projet", t: "Refondre le module Réservation en architecture hexagonale.", d: "Domaine testable sans Spring, 3 patterns utilisés et justifiés dans un ADR." },
    { k: "valid", t: "Le domaine compile et se teste sans aucune dépendance à Spring ni à JPA." }] },
  { id: "p11", title: "Concurrence et performance", hours: 25, core: false, goal: "Comprendre pourquoi un code correct peut devenir faux ou lent dès qu'il y a de la charge.", tasks: [
    { k: "cours", t: "ExecutorService, CompletableFuture, synchronized, volatile : visibilité et race conditions." },
    { k: "cours", t: "Cache applicatif avec Spring Cache et Redis." },
    { k: "cours", t: "Profiler : JFR ou VisualVM, lire un thread dump." },
    { k: "exo", t: "Reproduire une race condition avec un compteur partagé, puis la corriger." },
    { k: "exo", t: "Paralléliser trois appels indépendants avec CompletableFuture." },
    { k: "projet", t: "Rendre un endpoint lent rapide.", d: "Mesure avant et après (temps de réponse, nombre de requêtes SQL), cache Redis, rapport d'une page." },
    { k: "valid", t: "Tu prouves ton gain par des chiffres, pas par une impression." }] },
  { id: "p12", title: "Messagerie et microservices", hours: 35, core: false, goal: "Savoir quand découper un système, et surtout quand ne pas le faire.", tasks: [
    { k: "cours", t: "Quand passer aux microservices, et quand rester sur un monolithe." },
    { k: "cours", t: "Kafka (ou RabbitMQ) : topics, partitions, groupes de consommateurs.", u: U.kafka },
    { k: "cours", t: "Spring for Kafka : producer et consumer." },
    { k: "cours", t: "Resilience4j : circuit breaker, retry, timeout.", u: U.r4j },
    { k: "cours", t: "Saga et cohérence éventuelle." },
    { k: "exo", t: "Envoyer des messages et les consommer avec deux consumers du même groupe." },
    { k: "exo", t: "Simuler la panne d'un service et observer le circuit breaker s'ouvrir." },
    { k: "projet", t: "Extraire les notifications dans un second service.", d: "Réservation publie un événement, Notification le consomme, idempotence gérée, tout se lance avec docker-compose." },
    { k: "valid", t: "Tu arrêtes le service de notification, tu crées des réservations, tu le relances : rien n'est perdu." }] },
  { id: "p13", title: "Observabilité et production", hours: 15, core: false, goal: "Quand ça casse en production, on ne débogue pas : on lit des logs et des métriques.", tasks: [
    { k: "cours", t: "Logs structurés avec SLF4J et Logback : niveaux, corrélation par requête." },
    { k: "cours", t: "Spring Boot Actuator et Micrometer : health checks et métriques." },
    { k: "cours", t: "Prometheus : collecter et interroger des métriques.", u: U.prom },
    { k: "exo", t: "Ajouter un identifiant de corrélation à chaque ligne de log d'une requête." },
    { k: "projet", t: "Dashboard Grafana de ton API.", d: "Latence, taux d'erreurs, requêtes par seconde, et une alerte sur un taux d'erreurs élevé." },
    { k: "valid", t: "Tu retrouves la cause d'une erreur 500 provoquée volontairement, à partir des logs seuls." }] },
  { id: "p14", title: "System design et entretiens", hours: 20, core: false, goal: "Savoir présenter et défendre ce que tu as construit.", tasks: [
    { k: "cours", t: "System Design Primer : scalabilité, cache, files d'attente, partitionnement.", u: U.sdp },
    { k: "cours", t: "Révision entretien : internals de HashMap, mémoire JVM et GC, transactions Spring, N+1." },
    { k: "exo", t: "Concevoir à l'écrit un raccourcisseur d'URL puis une messagerie, avec schémas et estimation de charge." },
    { k: "exo", t: "Passer deux entretiens techniques blancs avec Claude." },
    { k: "projet", t: "Portfolio final : le dépôt de l'API de réservation avec README, schéma d'architecture, ADR, pipeline et tests." },
    { k: "valid", t: "Tu présentes ton projet en 5 minutes, sans notes." }] }
];
export const JKIND: Record<JavaKind, string> = { cours: "Cours", exo: "Exercice", projet: "Projet", valid: "Validation" };

/** Phases avec numéro et identifiants de tâches (p1t1…) ; construites sans muter les données brutes. */
export const PHASES: Phase[] = RAW_PHASES.map((p, pi) => {
  const phase: Phase = { ...p, n: pi + 1, tasks: [] };
  phase.tasks = p.tasks.map((t, i): JavaTask => ({ ...t, id: p.id + "t" + (i + 1), phase }));
  return phase;
});
/** Tâches Java à plat, dans l'ordre du parcours. */
export const JT: JavaTask[] = PHASES.flatMap((p) => p.tasks);
export const CORE_COUNT = PHASES.filter((p) => p.core).length;
export const JAVA_HOURS = PHASES.reduce((s, p) => s + p.hours, 0);
export const phaseById: Record<string, Phase> = Object.fromEntries(PHASES.map((p) => [p.id, p]));
