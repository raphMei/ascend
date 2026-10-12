/** Parcours Java backend : 14 phases, du langage au system design. Chaque phase est découpée en chapitres à lire (liens en français d'abord),
    exercices, projets et validations. Les adresses sont vérifiées par `npm run check:links`. */
import { buildPhases, cours, exo, projet, valid, type RawPhase } from '../dsl';
import { en, fr, gha, guru, jdx, mdn, oc, spring, sqlsh, wiki } from '../sources';
import type { Phase, PathStep } from '../types';

const OC_JAVA = oc('6173501', 'apprenez-a-programmer-en-java', 'Apprenez à programmer en Java');
const OC_BOOT = oc('6900101', 'creez-une-application-java-avec-spring-boot', 'Créez une application Java avec Spring Boot');
const GIT = (slug: string, title: string) => fr('Pro Git', title, 'https://git-scm.com/book/fr/v2/' + slug);

const RAW: RawPhase[] = [
  { id: 'p1', title: 'Java : remise à niveau', core: true,
    goal: 'Retrouver la syntaxe Java et penser objet. Tu es déjà développeur : on traduit ce que tu sais, on ne repart pas de zéro.',
    steps: [
      cours('Syntaxe et éléments de base', [jdx('chap-syntaxe', 'La syntaxe et les éléments de base de Java')], 45, { g: 'Le langage' }),
      cours('Programmation orientée objet : classes, héritage, interfaces', [jdx('chap-poo', 'La programmation orientée objet'), OC_JAVA], 75, { g: 'Le langage' }),
      cours('Génériques', [jdx('chap-generique', 'Les génériques (generics)')], 40, { g: 'Le langage' }),
      cours('Gestion des exceptions', [jdx('chap-exceptions', 'La gestion des exceptions')], 40, { g: 'Le langage' }),
      cours('Collections : List, Set, Map', [jdx('chap-collections', 'Les collections')], 60, { g: 'Le langage' }),
      cours('Lambdas et interfaces fonctionnelles', [jdx('chap-lambdas', 'Les expressions lambda')], 40, { g: 'Le langage' }),
      cours('L\'API Stream', [jdx('chap-streams', 'L\'API Stream')], 45, { g: 'Le langage' }),
      cours('Records et énumérations', [jdx('chap-records', 'Les records'), jdx('chap-enums', 'Les énumérations')], 30, { g: 'Le langage' }),
      cours('Chaînes de caractères et dates', [jdx('chap-chaines', 'Les chaînes de caractères'), jdx('chap-utilisation_dates', 'L\'utilisation des dates')], 40, { g: 'Le langage' }),
      cours('Fichiers : flux et NIO.2', [jdx('chap-flux', 'Les flux d\'entrée/sortie'), jdx('chap-nio2', 'NIO 2')], 45, { g: 'Le langage' }),
      exo('Exercices du MOOC d\'Helsinki : classes, interfaces, collections, exceptions, fichiers', [en('MOOC.fi', 'Java Programming II', 'https://java-programming.mooc.fi/')], 180, { d: 'Saute ce que tu maîtrises déjà. Le MOOC est en anglais : le cours OpenClassrooms ci-dessus propose des exercices équivalents en français.', g: 'S\'entraîner' }),
      exo('Séance 1 : estPair, sommeTableau (itératif puis récursif), recherche linéaire, inverserChaine sans reverse()', [], 60, { g: 'S\'entraîner' }),
      exo('Réécrire trois de tes boucles for avec des Streams', [jdx('chap-streams', 'L\'API Stream')], 30, { g: 'S\'entraîner' }),
      exo('Créer une interface Paiement avec deux implémentations et les utiliser par la même variable (polymorphisme)', [jdx('chap-poo', 'La programmation orientée objet')], 30, { g: 'S\'entraîner' }),
      projet('Devoir séance 1 : nombre premier et Fibonacci', [], 90, { d: 'Programme console qui teste si n est premier, affiche Fibonacci en itératif et en récursif, et mesure les deux temps pour n = 35. Critères : fonctions séparées, entrée négative gérée, commits lisibles.' }),
      projet('Gestion de bibliothèque en console : livres, adhérents, emprunts', [], 240, { d: 'Interfaces ou héritage, List et Map, exceptions métier maison, sauvegarde dans un fichier.' }),
      valid('Les deux projets sont sur GitHub avec un README et un historique de commits lisible.')
    ] },
  { id: 'p2', title: 'Outils : Git, Maven, IntelliJ', core: true,
    goal: 'Les gestes que tout le monde attend de toi dès le premier jour dans une équipe.',
    steps: [
      cours('Git : branches et fusions', [GIT('Les-branches-avec-Git-Les-branches-en-bref', 'Les branches en bref'), GIT('Les-branches-avec-Git-Gestion-des-branches', 'Gestion des branches'), GIT('Les-branches-avec-Git-Travailler-avec-les-branches', 'Travailler avec les branches')], 45, { g: 'Git' }),
      cours('Git : rebase contre merge', [GIT('Les-branches-avec-Git-Rebaser-Rebasing', 'Rebaser (rebasing)')], 30, { g: 'Git' }),
      cours('Git en équipe : travailler avec des dépôts distants et pull requests', [GIT('Les-bases-de-Git-Travailler-avec-des-d%C3%A9p%C3%B4ts-distants', 'Travailler avec des dépôts distants'), gha('pull-requests', 'Les pull requests sur GitHub')], 40, { g: 'Git' }),
      cours('Maven : cycle de vie, pom.xml, dépendances', [jdx('chap-maven', 'Maven'), en('Maven', 'Maven en 5 minutes', 'https://maven.apache.org/guides/getting-started/maven-in-five-minutes.html')], 60, { g: 'Maven' }),
      cours('IntelliJ : déboguer pas à pas', [en('JetBrains', 'Déboguer votre première application Java', 'https://www.jetbrains.com/help/idea/debugging-your-first-java-application.html')], 30, { g: 'IntelliJ' }),
      exo('Provoquer volontairement un conflit entre deux branches puis le résoudre', [GIT('Les-branches-avec-Git-Travailler-avec-les-branches', 'Fusionner et résoudre un conflit')], 30),
      exo('Déboguer pas à pas dans IntelliJ : breakpoint conditionnel, Evaluate Expression', [], 30),
      projet('Migrer la bibliothèque vers Maven et produire un jar exécutable', [jdx('chap-maven', 'Maven')], 60, { d: 'mvn clean package doit produire un jar qui se lance avec java -jar.' }),
      valid('Quelqu\'un d\'autre clone ton dépôt et lance l\'appli avec une seule commande.')
    ] },
  { id: 'p3', title: 'SQL et bases de données', core: true,
    goal: 'Un backend, c\'est surtout des données. Mieux tu comprends SQL, moins Spring te surprendra ensuite.',
    steps: [
      cours('SQL : SELECT, filtres, tri', [sqlsh('select', 'La commande SELECT'), sqlsh('where', 'Filtrer avec WHERE')], 40, { g: 'SQL' }),
      cours('SQL : jointures', [sqlsh('jointures', 'Les jointures')], 40, { g: 'SQL' }),
      cours('SQL : agrégats, GROUP BY, HAVING', [sqlsh('group-by', 'GROUP BY')], 40, { g: 'SQL' }),
      cours('SQL : sous-requêtes', [sqlsh('sous-requete', 'Les sous-requêtes')], 30, { g: 'SQL' }),
      cours('PostgreSQL : installation et prise en main', [fr('PostgreSQL', 'Tutoriel PostgreSQL', 'https://docs.postgresql.fr/current/tutorial.html')], 60, { g: 'PostgreSQL' }),
      cours('Index : pourquoi et comment', [fr('PostgreSQL', 'Les index', 'https://docs.postgresql.fr/current/indexes.html'), sqlsh('index', 'Les index en SQL')], 40, { g: 'Concepts' }),
      cours('Transactions et propriétés ACID', [wiki('Propri%C3%A9t%C3%A9s_ACID', 'Propriétés ACID'), fr('PostgreSQL', 'Les transactions', 'https://docs.postgresql.fr/current/tutorial-transactions.html')], 40, { g: 'Concepts' }),
      exo('Écrire 10 requêtes sur ton schéma : JOIN, GROUP BY, HAVING, sous-requête', [en('SQLBolt', 'SQLBolt : leçons interactives', 'https://sqlbolt.com/')], 90),
      exo('Lire un EXPLAIN avant et après l\'ajout d\'un index', [fr('PostgreSQL', 'EXPLAIN', 'https://docs.postgresql.fr/current/sql-explain.html')], 40),
      projet('Modéliser la bibliothèque en tables avec contraintes, puis la remplir avec un script SQL', [], 120),
      projet('Lire et écrire dans cette base depuis Java en JDBC brut, sans framework', [jdx('chap-jdbc', 'JDBC')], 150, { d: 'Tu verras ensuite exactement ce que Spring te cache.' }),
      valid('Tu expliques à voix haute la différence entre INNER JOIN et LEFT JOIN, et ce qu\'est une transaction.')
    ] },
  { id: 'p4', title: 'Spring Boot : premier projet', core: true,
    goal: 'Comprendre le trajet d\'une requête HTTP : contrôleur, service, repository. C\'est la clé de la plupart des tâches qu\'on te donnera.',
    steps: [
      cours('Inversion de contrôle et injection de dépendances', [wiki('Inversion_de_contr%C3%B4le', 'Inversion de contrôle'), wiki('Injection_de_d%C3%A9pendances', 'Injection de dépendances'), jdx('chap-spring_core', 'Spring Core')], 45, { g: 'Les concepts' }),
      cours('Architecture en couches : le modèle MVC', [wiki('Mod%C3%A8le-vue-contr%C3%B4leur', 'Modèle-vue-contrôleur')], 20, { g: 'Les concepts' }),
      cours('Spring Boot : le cours complet pas à pas', [OC_BOOT], 480, { g: 'Spring Boot' }),
      cours('Auto-configuration, profils, application.yml', [en('Spring', 'Documentation de Spring Boot', 'https://docs.spring.io/spring-boot/index.html')], 60, { g: 'Spring Boot' }),
      cours('Construire un service web REST', [spring('guides/gs/rest-service', 'Building a RESTful Web Service')], 45, { g: 'Spring Boot' }),
      exo('Refaire le projet du cours sans regarder la correction', [OC_BOOT], 180),
      exo('Créer deux profils (dev et prod) avec des propriétés différentes et les activer', [en('Spring', 'Profils Spring Boot', 'https://docs.spring.io/spring-boot/reference/features/profiles.html')], 40),
      exo('Expliquer à voix haute le trajet d\'une requête : contrôleur, service, repository', [], 20),
      projet('API Tâches (to-do) en mémoire : créer, lister, modifier, supprimer', [], 180, { d: 'Couches séparées, injection par constructeur, aucune logique métier dans le contrôleur.' }),
      valid('L\'appli démarre, répond sur 4 endpoints, et tu sais expliquer l\'injection de dépendances.')
    ] },
  { id: 'p5', title: 'Spring Data JPA', core: true,
    goal: 'Brancher l\'API sur une vraie base, versionner le schéma, et repérer le piège classique : le N+1.',
    steps: [
      cours('Persistance des objets : le mapping objet-relationnel', [wiki('Mapping_objet-relationnel', 'Mapping objet-relationnel'), jdx('chap-persistence', 'La persistance des objets')], 30, { g: 'Les concepts' }),
      cours('JPA : entités, annotations, EntityManager', [jdx('chap-jpa', 'JPA (Java Persistence API)')], 90, { g: 'JPA' }),
      cours('Spring Data JPA : repositories et requêtes dérivées', [spring('guides/gs/accessing-data-jpa', 'Accessing Data with JPA')], 60, { g: 'JPA' }),
      cours('Relations @OneToMany et @ManyToOne, LAZY contre EAGER, le problème du N+1', [jdx('chap-hibernate', 'Hibernate'), en('Vlad Mihalcea', 'Le problème de requêtes N+1', 'https://vladmihalcea.com/n-plus-1-query-problem/')], 60, { g: 'JPA' }),
      cours('Transactions avec Spring', [jdx('chap-spring_transactions', 'La gestion des transactions avec Spring')], 40, { g: 'JPA' }),
      cours('Flyway : versionner le schéma avec des migrations SQL', [en('Flyway', 'Documentation Flyway', 'https://flywaydb.org/documentation')], 40, { g: 'Migrations' }),
      exo('Ajouter une entité Utilisateur liée aux Tâches (un utilisateur, plusieurs tâches)', [], 60),
      exo('Écrire une requête dérivée, une @Query JPQL et une pagination avec Pageable', [], 60),
      exo('Provoquer un N+1 volontairement, le repérer dans les logs SQL, puis le corriger', [], 60),
      projet('Brancher l\'API Tâches sur PostgreSQL avec des migrations Flyway', [], 150, { d: 'Aucune table créée à la main : tout passe par des migrations versionnées.' }),
      valid('Tu détruis la base, relances l\'appli, et le schéma se recrée à l\'identique.')
    ] },
  { id: 'p6', title: 'API REST propre', core: true,
    goal: 'La différence entre une API qui marche et une API qu\'une équipe accepte de maintenir.',
    steps: [
      cours('Le protocole HTTP : méthodes, en-têtes, codes de statut', [mdn('Web/HTTP', 'HTTP'), mdn('Web/HTTP/Reference/Status', 'Codes de réponse HTTP')], 45, { g: 'Conception' }),
      cours('Architecture REST : ressources, verbes, idempotence', [wiki('Representational_state_transfer', 'REST')], 25, { g: 'Conception' }),
      cours('DTOs et validation des données (Bean Validation)', [jdx('chap-validation_donnees', 'La validation des données')], 40, { g: 'Conception' }),
      cours('Mapper les entités vers les DTOs avec MapStruct', [en('MapStruct', 'Guide de référence MapStruct', 'https://mapstruct.org/documentation/stable/reference/html/')], 30, { g: 'Conception' }),
      cours('Gestion centralisée des erreurs avec @ControllerAdvice', [en('Spring', 'Gestion des exceptions dans Spring MVC', 'https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-exceptionhandler.html')], 30, { g: 'Conception' }),
      cours('Documenter l\'API avec OpenAPI et Swagger (springdoc)', [en('springdoc', 'springdoc-openapi', 'https://springdoc.org/')], 30, { g: 'Conception' }),
      exo('Renvoyer des erreurs au même format JSON pour les cas 400, 404 et 409', [], 60),
      exo('Ajouter pagination, tri et filtre sur la liste des tâches', [], 60),
      projet('API de réservation de salles : salles, créneaux, réservations', [], 300, { d: 'Règle métier : deux réservations ne se chevauchent jamais. 6 endpoints minimum, DTOs, erreurs propres, Swagger.' }),
      valid('Un autre développeur utilise ton API avec Swagger seul, sans te poser de question.')
    ] },
  { id: 'p7', title: 'Tests : JUnit, Mockito, Testcontainers', core: true,
    goal: 'Une équipe sérieuse attend que tu testes ce que tu écris. Ce palier fait de toi quelqu\'un à qui on peut confier du code.',
    steps: [
      cours('Pourquoi tester : tests unitaires et d\'intégration', [wiki('Test_unitaire', 'Test unitaire'), wiki('Test_d%27int%C3%A9gration', 'Test d\'intégration')], 25, { g: 'Les concepts' }),
      cours('Développement piloté par les tests (TDD)', [wiki('D%C3%A9veloppement_pilot%C3%A9_par_les_tests', 'TDD')], 20, { g: 'Les concepts' }),
      cours('JUnit 5 : cycle de vie, tests paramétrés, assertions', [jdx('chap-junit5', 'JUnit 5')], 60, { g: 'Les outils' }),
      cours('Mockito : mocks, stubs, vérifications', [jdx('chap-objets-mock', 'Les objets de type mock'), en('Mockito', 'Documentation Mockito', 'https://site.mockito.org/')], 45, { g: 'Les outils' }),
      cours('Tests Spring Boot : @WebMvcTest, @DataJpaTest, @SpringBootTest', [en('Spring', 'Tester avec Spring Boot', 'https://docs.spring.io/spring-boot/reference/testing/index.html')], 50, { g: 'Les outils' }),
      cours('Testcontainers : tester contre un vrai PostgreSQL', [en('Testcontainers', 'Guides Testcontainers', 'https://testcontainers.com/guides/')], 40, { g: 'Les outils' }),
      cours('Couverture de code avec JaCoCo', [wiki('Couverture_de_code', 'Couverture de code'), en('JaCoCo', 'Documentation JaCoCo', 'https://www.jacoco.org/jacoco/trunk/doc/')], 25, { g: 'Les outils' }),
      exo('Kata TDD (Roman Numerals ou FizzBuzz) : un cycle rouge, vert, refactor à la fois', [wiki('D%C3%A9veloppement_pilot%C3%A9_par_les_tests', 'TDD')], 60),
      exo('Tester un service avec Mockito en moquant le repository', [], 45),
      exo('Tester un contrôleur avec MockMvc, cas passant et cas d\'erreur', [], 45),
      projet('Couvrir l\'API de réservation de salles', [], 240, { d: 'Au moins 70 % de couverture JaCoCo sur la couche service, un test d\'intégration avec PostgreSQL via Testcontainers.' }),
      valid('mvn test passe sur un poste neuf, et tu sais dire pourquoi tu as mocké ici et pas là.')
    ] },
  { id: 'p8', title: 'Sécurité : Spring Security, JWT', core: false,
    goal: 'Authentifier, autoriser, et ne pas faire les erreurs que la liste OWASP recense depuis des années.',
    steps: [
      cours('OWASP Top 10 : lire les 10 entrées et noter lesquelles concernent ton API', [fr('OWASP', 'OWASP Top 10 (français)', 'https://top10.owasp.org/fr/')], 45, { g: 'Les risques' }),
      cours('Injection SQL et XSS : comprendre l\'attaque', [wiki('Injection_SQL', 'Injection SQL'), wiki('Cross-site_scripting', 'Cross-site scripting')], 30, { g: 'Les risques' }),
      cours('CSRF et CORS', [wiki('Cross-site_request_forgery', 'Cross-site request forgery'), mdn('Web/HTTP/Guides/CORS', 'CORS')], 30, { g: 'Les risques' }),
      cours('Authentification et HTTPS (TLS)', [wiki('Authentification', 'Authentification'), wiki('Transport_Layer_Security', 'TLS')], 25, { g: 'Les concepts' }),
      cours('Spring Security : chaîne de filtres, authentification contre autorisation', [en('Spring', 'Spring Security : architecture', 'https://docs.spring.io/spring-security/reference/servlet/architecture.html'), jdx('chap-securite', 'La sécurité en Java')], 70, { g: 'Spring Security' }),
      cours('JWT : structure, expiration, refresh', [wiki('JSON_Web_Token', 'JSON Web Token'), en('jwt.io', 'Introduction aux JWT', 'https://jwt.io/introduction')], 30, { g: 'Spring Security' }),
      exo('Hasher un mot de passe avec BCrypt et vérifier une connexion', [], 40),
      exo('Protéger un endpoint par rôle avec @PreAuthorize', [], 40),
      projet('Sécuriser l\'API de réservation : inscription, connexion JWT, rôles USER et ADMIN', [], 240, { d: 'Seul un ADMIN crée une salle. Un USER ne voit que ses propres réservations.' }),
      valid('Des tests prouvent qu\'un USER reçoit 403 sur une route ADMIN et qu\'un appel sans token reçoit 401.')
    ] },
  { id: 'p9', title: 'Docker et CI/CD', core: false,
    goal: 'Faire tourner ton code ailleurs que sur ta machine, et le faire tester automatiquement.',
    steps: [
      cours('Docker : images, conteneurs, volumes, réseaux', [wiki('Docker_(logiciel)', 'Docker'), en('Docker', 'Prise en main de Docker', 'https://docs.docker.com/get-started/')], 60, { g: 'Docker' }),
      cours('La JVM dans un conteneur', [jdx('chap-jvm-docker', 'La JVM HotSpot dans un conteneur Docker')], 30, { g: 'Docker' }),
      cours('Intégration continue : le principe', [wiki('Int%C3%A9gration_continue', 'Intégration continue')], 15, { g: 'CI/CD' }),
      cours('GitHub Actions : workflows, jobs, cache Maven', [gha('actions/get-started/quickstart', 'Démarrage rapide de GitHub Actions'), gha('actions/about-github-actions/understanding-github-actions', 'Comprendre GitHub Actions')], 45, { g: 'CI/CD' }),
      exo('Écrire un Dockerfile multi-étapes pour ton appli Spring Boot', [en('Docker', 'Builds multi-étapes', 'https://docs.docker.com/build/building/multi-stage/')], 60),
      exo('Écrire un docker-compose avec l\'appli et PostgreSQL', [en('Docker', 'Docker Compose', 'https://docs.docker.com/compose/')], 60),
      projet('Pipeline CI : à chaque push, build Maven, tests, et image Docker construite', [], 120),
      valid('docker compose up sur une machine vierge et l\'API répond.')
    ] },
  { id: 'p10', title: 'Architecture et design patterns', core: false,
    goal: 'Structurer le code pour qu\'il survive à son troisième développeur.',
    steps: [
      cours('Les principes SOLID', [wiki('SOLID_(informatique)', 'SOLID')], 60, { g: 'Les principes' }),
      cours('Design patterns : le catalogue en français', [guru('design-patterns', 'Les design patterns'), jdx('chap-design-patterns', 'Les motifs de conception')], 30, { g: 'Design patterns' }),
      cours('Strategy', [guru('design-patterns/strategy', 'Stratégie')], 25, { g: 'Design patterns' }),
      cours('Factory Method et Builder', [guru('design-patterns/factory-method', 'Fabrique'), guru('design-patterns/builder', 'Monteur')], 40, { g: 'Design patterns' }),
      cours('Observer et Decorator', [guru('design-patterns/observer', 'Observateur'), guru('design-patterns/decorator', 'Décorateur')], 40, { g: 'Design patterns' }),
      cours('Architecture hexagonale : ports, adaptateurs, domaine sans Spring', [wiki('Architecture_hexagonale', 'Architecture hexagonale')], 40, { g: 'Architecture' }),
      cours('Domain-driven design : entité, objet-valeur, agrégat, contexte borné', [wiki('Domain-driven_design', 'Domain-driven design')], 40, { g: 'Architecture' }),
      exo('Remplacer un gros if/else de ton code par un Strategy', [guru('design-patterns/strategy', 'Stratégie')], 45),
      exo('Écrire un ADR (Architecture Decision Record) d\'une page pour un choix de ton projet', [en('ADR', 'Architecture Decision Records', 'https://adr.github.io/')], 40),
      projet('Refondre le module Réservation en architecture hexagonale', [], 300, { d: 'Domaine testable sans Spring, 3 patterns utilisés et justifiés dans un ADR.' }),
      valid('Le domaine compile et se teste sans aucune dépendance à Spring ni à JPA.')
    ] },
  { id: 'p11', title: 'Concurrence et performance', core: false,
    goal: 'Comprendre pourquoi un code correct peut devenir faux ou lent dès qu\'il y a de la charge.',
    steps: [
      cours('Multitâche et threads', [jdx('chap-multitache', 'Le multitâche'), jdx('chap-threads', 'Les threads')], 60, { g: 'Concurrence' }),
      cours('Le framework Executor et CompletableFuture', [jdx('chap-executor', 'Le framework Executor')], 45, { g: 'Concurrence' }),
      cours('Accès concurrents : synchronized, volatile, race conditions', [jdx('chap-acces_concurrents', 'La gestion des accès concurrents')], 60, { g: 'Concurrence' }),
      cours('Mémoire de la JVM et ramasse-miettes', [jdx('chap-gestion_memoire', 'La gestion de la mémoire dans la JVM HotSpot')], 45, { g: 'Performance' }),
      cours('Mise en cache : le principe', [wiki('Mise_en_cache', 'Mise en cache')], 15, { g: 'Performance' }),
      cours('Cache applicatif avec Spring Cache et Redis', [en('Spring', 'Spring Cache', 'https://docs.spring.io/spring-framework/reference/integration/cache.html'), en('Redis', 'Documentation Redis', 'https://redis.io/docs/latest/')], 45, { g: 'Performance' }),
      cours('Profiler : VisualVM, thread dump', [jdx('chap-visualvm', 'VisualVM')], 40, { g: 'Performance' }),
      exo('Reproduire une race condition avec un compteur partagé, puis la corriger', [jdx('chap-acces_concurrents', 'La gestion des accès concurrents')], 60),
      exo('Paralléliser trois appels indépendants avec CompletableFuture', [jdx('chap-executor', 'Le framework Executor')], 45),
      projet('Rendre un endpoint lent rapide', [], 240, { d: 'Mesure avant et après (temps de réponse, nombre de requêtes SQL), cache Redis, rapport d\'une page.' }),
      valid('Tu prouves ton gain par des chiffres, pas par une impression.')
    ] },
  { id: 'p12', title: 'Messagerie et microservices', core: false,
    goal: 'Savoir quand découper un système, et surtout quand ne pas le faire.',
    steps: [
      cours('Microservices : quand, et quand ne pas', [wiki('Microservices', 'Microservices'), en('microservices.io', 'Patterns de microservices', 'https://microservices.io/patterns/index.html')], 45, { g: 'Les concepts' }),
      cours('Théorème CAP et cohérence éventuelle', [wiki('Th%C3%A9or%C3%A8me_CAP', 'Théorème CAP')], 20, { g: 'Les concepts' }),
      cours('Kafka : topics, partitions, groupes de consommateurs', [wiki('Apache_Kafka', 'Apache Kafka'), en('Kafka', 'Démarrage rapide de Kafka', 'https://kafka.apache.org/quickstart')], 60, { g: 'Messagerie' }),
      cours('Messagerie JMS : le principe', [jdx('chap-jms', 'JMS (Java Message Service)')], 30, { g: 'Messagerie' }),
      cours('Spring for Kafka : producer et consumer', [en('Spring', 'Spring for Apache Kafka', 'https://docs.spring.io/spring-kafka/reference/')], 50, { g: 'Messagerie' }),
      cours('Resilience4j : circuit breaker, retry, timeout', [en('Resilience4j', 'Documentation Resilience4j', 'https://resilience4j.readme.io/docs/getting-started')], 40, { g: 'Résilience' }),
      cours('Saga et cohérence entre services', [en('microservices.io', 'Le pattern Saga', 'https://microservices.io/patterns/data/saga.html')], 30, { g: 'Résilience' }),
      exo('Envoyer des messages et les consommer avec deux consumers du même groupe', [], 60),
      exo('Simuler la panne d\'un service et observer le circuit breaker s\'ouvrir', [], 60),
      projet('Extraire les notifications dans un second service', [], 420, { d: 'Réservation publie un événement, Notification le consomme, idempotence gérée, tout se lance avec docker compose.' }),
      valid('Tu arrêtes le service de notification, tu crées des réservations, tu le relances : rien n\'est perdu.')
    ] },
  { id: 'p13', title: 'Observabilité et production', core: false,
    goal: 'Quand ça casse en production, on ne débogue pas : on lit des logs et des métriques.',
    steps: [
      cours('Logs structurés avec SLF4J et Logback', [jdx('chap-logging', 'Le logging')], 40, { g: 'Logs' }),
      cours('JMX : superviser une application Java', [jdx('chap-jmx', 'JMX')], 30, { g: 'Logs' }),
      cours('Spring Boot Actuator : health checks et métriques', [en('Spring', 'Actuator', 'https://docs.spring.io/spring-boot/reference/actuator/index.html')], 40, { g: 'Métriques' }),
      cours('Micrometer et Prometheus : collecter et interroger des métriques', [en('Micrometer', 'Micrometer', 'https://docs.micrometer.io/micrometer/reference/'), en('Prometheus', 'Introduction à Prometheus', 'https://prometheus.io/docs/introduction/overview/')], 45, { g: 'Métriques' }),
      cours('Grafana : construire un tableau de bord', [en('Grafana', 'Documentation Grafana', 'https://grafana.com/docs/grafana/latest/getting-started/')], 30, { g: 'Métriques' }),
      exo('Ajouter un identifiant de corrélation à chaque ligne de log d\'une requête', [], 45),
      projet('Dashboard Grafana de ton API', [], 150, { d: 'Latence, taux d\'erreurs, requêtes par seconde, et une alerte sur un taux d\'erreurs élevé.' }),
      valid('Tu retrouves la cause d\'une erreur 500 provoquée volontairement, à partir des logs seuls.')
    ] },
  { id: 'p14', title: 'System design et entretiens', core: false,
    goal: 'Savoir présenter et défendre ce que tu as construit.',
    steps: [
      cours('System Design Primer : scalabilité, cache, files d\'attente, partitionnement', [en('GitHub', 'System Design Primer', 'https://github.com/donnemartin/system-design-primer')], 120, { g: 'Concevoir' }),
      cours('Révision : internals de HashMap et des collections', [jdx('chap-collections', 'Les collections')], 40, { g: 'Réviser' }),
      cours('Révision : mémoire JVM et GC', [jdx('chap-gestion_memoire', 'La gestion de la mémoire dans la JVM HotSpot')], 40, { g: 'Réviser' }),
      cours('Révision : transactions Spring et N+1', [jdx('chap-spring_transactions', 'La gestion des transactions avec Spring')], 30, { g: 'Réviser' }),
      exo('Concevoir à l\'écrit un raccourcisseur d\'URL, avec schéma et estimation de charge', [], 60),
      exo('Concevoir à l\'écrit une messagerie instantanée, avec schéma et estimation de charge', [], 60),
      exo('Passer deux entretiens techniques blancs avec Claude', [], 90),
      projet('Portfolio final : le dépôt de l\'API de réservation', [], 240, { d: 'README, schéma d\'architecture, ADR, pipeline et tests.' }),
      valid('Tu présentes ton projet en 5 minutes, sans notes.')
    ] }
];

/** Phases avec numéro, durée et identifiants de tâche (p1t1…) ; construites sans muter les données brutes. */
export const PHASES: Phase[] = buildPhases(RAW);
/** Étapes du parcours à plat, dans l'ordre. */
export const JT: PathStep[] = PHASES.flatMap((p) => p.tasks);
export const JAVA_HOURS = PHASES.reduce((s, p) => s + p.hours, 0);
export const phaseById: Record<string, Phase> = Object.fromEntries(PHASES.map((p) => [p.id, p]));
