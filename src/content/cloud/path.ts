/** Parcours Cloud et DevOps : 8 phases, de Linux et Git jusqu'au déploiement automatisé, observé et sécurisé sur un fournisseur cloud.
    Même forme que les parcours Java et dev front (c1t1, c1t2…). Les liens sont en français quand ils existent ; la documentation officielle de Docker, Terraform et Prometheus n'existe qu'en anglais. */
import { buildPhases, cours, exo, projet, valid, type RawPhase } from '../dsl';
import { docker, en, fr, gha, git, k8s, msl, wiki } from '../sources';
import type { PathStep, Phase } from '../types';

const RAW: RawPhase[] = [
  { id: 'c1', title: 'Linux, terminal et Git', core: true,
    goal: 'Être à l\'aise dans un terminal et versionner son travail proprement : tout le reste du DevOps s\'exécute dans un shell et se range dans Git.',
    steps: [
      cours('Le terminal et le shell : pourquoi et comment', [wiki('Interface_en_ligne_de_commande', 'Interface en ligne de commande'), wiki('Bash', 'Bash')], 30, { g: 'Linux' }),
      cours('Naviguer, lire et modifier des fichiers (ls, cd, cat, grep, find)', [en('Linux Journey', 'Linux Journey : le terminal et les fichiers', 'https://linuxjourney.com/lesson/the-shell')], 60, { g: 'Linux' }),
      cours('Droits, utilisateurs et processus', [en('Linux Journey', 'Linux Journey : droits et processus', 'https://linuxjourney.com/lesson/file-permissions')], 60, { g: 'Linux' }),
      cours('Redirections, tubes et petits scripts shell', [wiki('Flux_standard', 'Flux standard'), wiki('Tube_(informatique)', 'Tube (informatique)')], 60, { g: 'Linux' }),
      cours('Démarrage rapide avec Git : dépôt, commit, historique', [git('Démarrage-rapide-Rudiments-de-Git', 'Rudiments de Git'), git('Les-bases-de-Git-Enregistrer-des-modifications-dans-le-dépôt', 'Enregistrer des modifications')], 60, { g: 'Git' }),
      cours('Branches, fusion et résolution de conflits', [git('Les-branches-avec-Git-Les-branches-en-bref', 'Les branches en bref'), git('Les-branches-avec-Git-Branches-et-fusions%C2%A0%3A-les-bases', 'Branches et fusions : les bases')], 60, { g: 'Git' }),
      cours('Travailler à plusieurs : dépôt distant, pull request, revue de code', [gha('pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests', 'À propos des pull requests')], 45, { g: 'Git' }),
      exo('Un dépôt d\'entraînement : trois branches, deux conflits résolus, un historique propre', [], 60),
      projet('Automatiser ta mise en place : un script shell qui installe tes outils et configure ton environnement', [], 90, { d: 'Critères : le script se relance sans erreur (idempotent), il affiche ce qu\'il fait, il est dans un dépôt Git avec un README.' }),
      valid('Explique sans notes la différence entre merge et rebase, puis recrée un conflit et résous-le en ligne de commande.')
    ] },
  { id: 'c2', title: 'Réseau et HTTP pour les ingénieurs', core: true,
    goal: 'Comprendre ce qui se passe entre un navigateur et un serveur (DNS, TCP, TLS, HTTP) pour diagnostiquer une panne au lieu de deviner.',
    steps: [
      cours('Le modèle en couches : de l\'IP à HTTP', [wiki('Mod%C3%A8le_OSI', 'Modèle OSI'), wiki('Suite_des_protocoles_Internet', 'Suite des protocoles Internet')], 45, { g: 'Les bases' }),
      cours('Adresses IP, sous-réseaux et ports', [wiki('Adresse_IP', 'Adresse IP'), wiki('Port_(logiciel)', 'Port (logiciel)')], 45, { g: 'Les bases' }),
      cours('DNS : du nom de domaine à l\'adresse', [wiki('Domain_Name_System', 'Domain Name System')], 30, { g: 'Les bases' }),
      cours('HTTP : requêtes, réponses, en-têtes et codes de statut', [fr('MDN', 'Aperçu de HTTP', 'https://developer.mozilla.org/fr/docs/Web/HTTP/Guides/Overview')], 45, { g: 'Le web' }),
      cours('HTTPS et TLS : certificats et chaîne de confiance', [wiki('Transport_Layer_Security', 'Transport Layer Security')], 40, { g: 'Le web' }),
      cours('Pare-feu, proxy inverse et répartiteur de charge', [wiki('Proxy_inverse', 'Proxy inverse'), wiki('R%C3%A9partition_de_charge', 'Répartition de charge')], 40, { g: 'Le web' }),
      exo('Diagnostiquer avec curl, dig et ss : suis une requête de bout en bout', [], 45),
      valid('Décris tout ce qui se passe quand tu tapes une adresse dans le navigateur, du DNS à l\'affichage, en citant les protocoles.')
    ] },
  { id: 'c3', title: 'Conteneurs avec Docker', core: true,
    goal: 'Empaqueter une application avec ses dépendances dans une image reproductible, et la faire tourner de la même façon partout.',
    steps: [
      cours('Pourquoi les conteneurs : machine virtuelle contre conteneur', [wiki('Conteneur_(virtualisation)', 'Conteneur (virtualisation)'), wiki('Docker_(logiciel)', 'Docker (logiciel)')], 40, { g: 'Les bases' }),
      cours('Installer Docker et lancer un premier conteneur', [docker('get-started/', 'Get started with Docker')], 45, { g: 'Les bases' }),
      cours('Images, couches et registres', [docker('get-started/docker-concepts/the-basics/what-is-an-image/', 'What is an image?'), docker('get-started/docker-concepts/the-basics/what-is-a-registry/', 'What is a registry?')], 40, { g: 'Les bases' }),
      cours('Écrire un Dockerfile : instructions, cache et images légères', [docker('reference/dockerfile/', 'Dockerfile reference'), docker('build/building/multi-stage/', 'Multi-stage builds')], 75, { g: 'Construire' }),
      cours('Volumes et réseaux : persister des données, faire parler des conteneurs', [docker('engine/storage/volumes/', 'Volumes'), docker('engine/network/', 'Networking overview')], 60, { g: 'Construire' }),
      cours('Docker Compose : une application à plusieurs services', [docker('compose/', 'Docker Compose')], 60, { g: 'Orchestrer en local' }),
      exo('Conteneuriser une API Java Spring Boot en image multi-étapes de moins de 200 Mo', [], 90),
      projet('Application complète en Compose : API, base de données et front, lancés par une seule commande', [], 150, { d: 'Critères : docker compose up suffit, les données survivent à un redémarrage, aucun secret dans l\'image, healthchecks sur chaque service.' }),
      valid('Explique ce que fait chaque ligne de ton Dockerfile et pourquoi l\'ordre des lignes change la vitesse de build.')
    ] },
  { id: 'c4', title: 'Intégration et livraison continues (CI/CD)', core: true,
    goal: 'Faire tester, construire et livrer automatiquement chaque modification, pour déployer souvent et sans peur.',
    steps: [
      cours('DevOps, intégration, livraison et déploiement continus', [wiki('Int%C3%A9gration_continue', 'Intégration continue'), wiki('DevOps', 'DevOps')], 40, { g: 'Les idées' }),
      cours('Comprendre GitHub Actions : workflows, jobs, étapes', [gha('actions/get-started/understand-github-actions', 'Comprendre GitHub Actions')], 45, { g: 'GitHub Actions' }),
      cours('Construire et tester un projet Java avec Maven', [gha('actions/use-cases-and-examples/building-and-testing/building-and-testing-java-with-maven', 'Build et test Java avec Maven')], 60, { g: 'GitHub Actions' }),
      cours('Secrets, variables et environnements protégés', [gha('actions/security-for-github-actions/security-guides/using-secrets-in-github-actions', 'Utiliser des secrets dans GitHub Actions')], 40, { g: 'GitHub Actions' }),
      cours('Publier une image Docker depuis la CI', [gha('actions/use-cases-and-examples/publishing-packages/publishing-docker-images', 'Publier des images Docker')], 45, { g: 'GitHub Actions' }),
      cours('Stratégies de déploiement : bleu-vert, canari, retour arrière', [wiki('D%C3%A9ploiement_continu', 'Déploiement continu'), msl('azure/architecture/framework/devops/release-engineering-cd', 'Livraison continue')], 40, { g: 'Livrer' }),
      exo('Une pipeline qui compile, teste, mesure la couverture et échoue si un test casse', [], 90),
      projet('Pipeline complète sur un vrai dépôt : tests, analyse statique, image Docker publiée, déploiement automatique sur un environnement de test', [], 180, { d: 'Critères : chaque pull request est testée avant fusion, le déploiement se fait sans action manuelle, un retour arrière tient en une commande.' }),
      valid('Dessine ta pipeline de mémoire et explique où elle t\'a déjà évité un bug.')
    ] },
  { id: 'c5', title: 'Fondamentaux du cloud', core: true,
    goal: 'Savoir ce que le cloud change (services managés, élasticité, facturation) et déployer une application sur un fournisseur.',
    steps: [
      cours('Qu\'est-ce que le cloud : IaaS, PaaS, SaaS et modèle de responsabilité partagée', [wiki('Informatique_en_nuage', 'Informatique en nuage'), msl('training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/', 'Azure Fundamentals : concepts du cloud')], 75, { g: 'Les concepts' }),
      cours('Régions, zones de disponibilité et haute disponibilité', [msl('training/modules/describe-core-architectural-components-of-azure/', 'Composants architecturaux d\'Azure')], 60, { g: 'Les concepts' }),
      cours('Calcul : machines virtuelles, conteneurs managés et fonctions serverless', [msl('training/paths/azure-fundamentals-describe-azure-architecture-services/', 'Azure Fundamentals : services')], 75, { g: 'Les services' }),
      cours('Stockage et bases de données managées', [msl('training/modules/describe-azure-storage-services/', 'Services de stockage Azure')], 60, { g: 'Les services' }),
      cours('Identité, accès et moindre privilège', [msl('training/modules/describe-azure-identity-access-security/', 'Identité, accès et sécurité')], 60, { g: 'Sécurité et coûts' }),
      cours('Coûts : estimer, budgéter, éviter la mauvaise surprise', [msl('training/modules/describe-cost-management-azure/', 'Gestion des coûts Azure')], 45, { g: 'Sécurité et coûts' }),
      exo('Créer un compte gratuit, un budget d\'alerte, puis déployer une image Docker sur un service managé', [], 120),
      projet('Déployer ton API conteneurisée sur le cloud avec une base managée, un domaine et HTTPS', [], 180, { d: 'Critères : l\'URL publique répond en HTTPS, les secrets sont dans un coffre, une alerte de budget est active, tout se supprime proprement pour ne rien payer.' }),
      valid('Compare trois façons d\'héberger ta même API (VM, conteneur managé, serverless) : coût, effort, contrôle.')
    ] },
  { id: 'c6', title: 'Infrastructure as Code', core: false,
    goal: 'Décrire l\'infrastructure dans des fichiers versionnés plutôt que par des clics, pour la recréer à l\'identique.',
    steps: [
      cours('Pourquoi décrire l\'infrastructure en code', [wiki('Infrastructure_as_code', 'Infrastructure as code'), msl('devops/deliver/what-is-infrastructure-as-code', 'Qu\'est-ce que l\'infrastructure as code ?')], 40, { g: 'Les idées' }),
      cours('Terraform : ressources, fournisseurs, plan et apply', [en('HashiCorp', 'Terraform : prise en main', 'https://developer.hashicorp.com/terraform/tutorials')], 90, { g: 'Terraform' }),
      cours('Variables, sorties et modules', [en('HashiCorp', 'Terraform : variables et modules', 'https://developer.hashicorp.com/terraform/language/values')], 60, { g: 'Terraform' }),
      cours('État distant et travail en équipe', [en('HashiCorp', 'Terraform : états distants', 'https://developer.hashicorp.com/terraform/language/state/remote')], 45, { g: 'Terraform' }),
      projet('Recréer l\'environnement de la phase 5 entièrement en Terraform, puis le détruire et le reconstruire', [], 180, { d: 'Critères : terraform plan ne montre aucun écart après le déploiement, l\'état est distant, les variables sensibles ne sont pas dans Git.' }),
      valid('Explique le rôle du fichier d\'état et ce qui se passe si deux personnes lancent apply en même temps.')
    ] },
  { id: 'c7', title: 'Kubernetes', core: false,
    goal: 'Comprendre l\'orchestration de conteneurs : déployer, exposer, mettre à l\'échelle et mettre à jour sans interruption.',
    steps: [
      cours('Qu\'est-ce que Kubernetes et à quoi sert-il', [k8s('concepts/overview/', 'Vue d\'ensemble de Kubernetes')], 40, { g: 'Les concepts' }),
      cours('Pods, déploiements et services', [k8s('tutorials/kubernetes-basics/', 'Les bases de Kubernetes')], 90, { g: 'Les concepts' }),
      cours('Configuration : ConfigMap et Secret', [k8s('tasks/configure-pod-container/configure-pod-configmap/', 'Configurer un pod avec une ConfigMap'), k8s('concepts/configuration/secret/', 'Secrets')], 45, { g: 'Les concepts' }),
      cours('Exposer une application : Service et Ingress', [k8s('concepts/services-networking/service/', 'Service'), k8s('concepts/services-networking/ingress/', 'Ingress')], 60, { g: 'Réseau et échelle' }),
      cours('Mise à l\'échelle et mises à jour progressives', [k8s('tutorials/kubernetes-basics/scale/', 'Mettre à l\'échelle'), k8s('tutorials/kubernetes-basics/update/', 'Mettre à jour')], 60, { g: 'Réseau et échelle' }),
      exo('Un cluster local (kind ou minikube) : déployer l\'API, la scaler à 3 copies, la mettre à jour sans coupure', [], 120),
      valid('Explique ce qui se passe quand un pod plante et quand tu changes l\'image d\'un déploiement.')
    ] },
  { id: 'c8', title: 'Observabilité, fiabilité et sécurité', core: false,
    goal: 'Voir ce que fait le système en production, réagir avant les utilisateurs, et ne pas laisser de faille évidente.',
    steps: [
      cours('Journaux, métriques et traces : les trois piliers', [wiki('Supervision_(informatique)', 'Supervision (informatique)'), en('Google SRE', 'Monitoring distributed systems', 'https://sre.google/sre-book/monitoring-distributed-systems/')], 60, { g: 'Observer' }),
      cours('Prometheus et Grafana : collecter et visualiser', [en('Prometheus', 'Prometheus : présentation', 'https://prometheus.io/docs/introduction/overview/')], 75, { g: 'Observer' }),
      cours('Objectifs de niveau de service : SLI, SLO et budget d\'erreurs', [en('Google SRE', 'Service level objectives', 'https://sre.google/sre-book/service-level-objectives/')], 45, { g: 'Fiabilité' }),
      cours('Application à douze facteurs', [fr('12factor.net', 'L\'application à douze facteurs', 'https://12factor.net/fr/')], 40, { g: 'Fiabilité' }),
      cours('Les dix principaux risques web (OWASP)', [en('OWASP', 'OWASP Top 10', 'https://owasp.org/Top10/')], 60, { g: 'Sécurité' }),
      cours('Analyser les dépendances et les images pour y trouver des failles', [gha('code-security/dependabot/dependabot-alerts/about-dependabot-alerts', 'À propos des alertes Dependabot')], 40, { g: 'Sécurité' }),
      projet('Ajouter à ton API déployée des métriques, un tableau de bord et une alerte qui te prévient avant les utilisateurs', [], 150, { d: 'Critères : taux d\'erreur et latence visibles, une alerte réelle testée en provoquant une panne, une page de procédure pour y réagir.' }),
      valid('Choisis deux SLO pour ton projet, justifie-les et dis ce que tu ferais si le budget d\'erreurs était épuisé.')
    ] }
];

export const CLOUD_LEVELS = ['Pas commencé', 'Démarrage', 'À l\'aise en terminal et Git', 'Conteneurs maîtrisés', 'Pipeline CI/CD en place', 'Déployé sur le cloud', 'DevOps confirmé'];
export const CLOUD_PHASES: Phase[] = buildPhases(RAW);
export const CLOUD_TASKS: PathStep[] = CLOUD_PHASES.flatMap((p) => p.tasks);
export const CLOUD_HOURS = CLOUD_PHASES.reduce((s, p) => s + p.hours, 0);
export const cloudPhaseById: Record<string, Phase> = Object.fromEntries(CLOUD_PHASES.map((p) => [p.id, p]));
