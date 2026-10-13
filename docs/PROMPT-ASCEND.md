# Prompt de présentation d'Ascend

Colle ce texte au début d'une conversation avec une IA pour qu'elle comprenne tout l'outil.

```
Tu vas m'aider sur « Ascend », mon application personnelle de planning et d'habitudes. Voici tout ce qu'il faut savoir. Réponds toujours en français, avec le « pourquoi » de tes choix, et donne-moi des livrables complets prêts à coller.

## 1. Qui je suis et à quoi sert l'outil
Je suis Raphaël, étudiant en M1 MIAGE en alternance chez AXA. Ascend organise ma vie : travail/alternance, cours MIAGE, apprentissage de Java et du front-end, sport, alimentation, sommeil, anglais, lecture, projets perso et finances. L'idée : une journée planifiée automatiquement, des cases à cocher, des séries (streaks) et des statistiques, sans friction. Usage perso, gratuit, un seul utilisateur.

## 2. Plateforme et accès
- Application web installable (PWA) : iPhone + Mac, synchronisée en direct.
- Connexion Google (Firebase Auth) ; données dans Firestore (projet ascend-raphael) ; hébergement GitHub Pages (https://raphmei.github.io/ascend/, dépôt raphMei/ascend).
- Mode démo sans connexion (données locales fictives). Hors ligne : l'application s'ouvre grâce au service worker.
- Pile technique : React 18 + TypeScript strict + Vite, React Router (HashRouter), Vitest + Testing Library, Playwright (iPhone et bureau, audit d'accessibilité axe), émulateur Firestore pour les règles de sécurité.

## 3. Les écrans
1. **Accueil** : vue d'ensemble de la journée (type de journée, avancement, prochaines actions, reprise des cours en cours, objectifs).
2. **Aujourd'hui** (écran principal, style app « Grit ») :
   - Bande de la semaine, navigation jour précédent/suivant (aussi au geste), retour à aujourd'hui.
   - Anneau d'avancement du jour (% fait, heures faites/prévues).
   - Deux affichages : **Liste** regroupée par **Moments** (matin, trajet, après-midi, soirée…) ou par **Thèmes** (productivité, santé, apprentissage…), ou **Frise** horaire.
   - Chaque tâche : case à cocher, durée, minuteur, séries (streak), ajout/modification/déplacement/suppression de blocs ("Blocs passés" restaurables).
   - Type de journée modifiable : normale, congé, télétravail, sur site.
   - Section « Reprendre là où je me suis arrêté » (cours en cours) et **Objectifs**.
   - Pages lues (domaine Lecture) ; bilan de séance (note, difficulté, à revoir) dans le journal.
3. **Domaines** : une page par domaine (voir §5) avec ses détails, son programme et ses cartes.
4. **Mon mois** : choix, mois par mois, de l'**intensité de chaque domaine** (léger/normal/intensif ou désactivé) ; un mois sans réglage reprend le précédent ; charge du mois visible.
5. **Statistiques** : bilan de la semaine (vs semaine précédente), séries, courbes d'heures apprises, habitudes, prévisions de fin de parcours, badges, conseils du « coach ».
6. **Réglages** : horaires (lever/coucher), jours sur site, sport (séances par semaine), apprentissage (ajustement, bilan, son), thème clair/sombre/auto, rappels, Chabbat, sauvegarde (export/import JSON), mode d'emploi.

## 4. Le moteur de planning (le cœur de l'outil)
- Le planning du jour est **calculé** (fonction pure), jamais saisi à la main : heures de travail, trajets, repas, sport selon le jour de la semaine, cours MIAGE, Java, front, anglais, lecture, projets, finances.
- **Replanification intelligente et automatique** (sans validation de ma part) : ce que je rate hier est décalé sur les jours suivants selon la priorité (type de tâche, échéance), la capacité de chaque jour et mes jours de congé/télétravail ; les tâches de routine périmées sont abandonnées après 2 jours ; les examens sont fixes ; le sport raté est rattrapé ; mode « léger »/« intensif » pour la MIAGE.
- Si une journée est trop chargée, l'outil le dit (« Trop chargé aujourd'hui… ») et reporte le reste.
- **Chabbat** : aucune tâche ni rappel du coucher du soleil (bougies) du vendredi à la havdalah du samedi ; le samedi n'est pas suivi.
- Mes modifications (passer un bloc, le déplacer, en ajouter, forcer le type de jour) sont conservées comme « corrections » sur la journée.

## 5. Les domaines suivis
- **Temps réservé** (rien à cocher, pas de série ni de pourcentage) : routine du matin (un seul créneau), sport, repas, sommeil, trajet, travail. Ils bloquent l'agenda pour calculer le temps libre ; la liste du jour les affiche repliés. Les habitudes quotidiennes se suivent dans Grit, pas ici. Il n'y a plus de suivi du poids, de l'eau, du sommeil ni des finances.
- **MIAGE** : 10 matières avec plans (unités de cours réparties sur les créneaux, projets, jalons, examen), petites tâches regroupées.
- **Java** : parcours en 14 phases / 149 étapes. **Front-end** : 9 phases / 95 étapes. **Métier assurance, Data et SQL, Agilité et gestion de projet** : socles de deux phases à compléter. **Cloud et DevOps** : 8 phases (Linux et Git, réseau, Docker, CI/CD, cloud, Terraform, Kubernetes, observabilité). **Architecture logicielle** : 8 phases (principes, patrons, hexagonal, DDD, microservices, événements, résilience, décisions documentées). Chaque étape = chapitre avec type (cours, exercice, projet, validation), durée, et liens vers des ressources de préférence en français (337 liens vérifiés, ~78 % en français). Les heures par phase sont la somme des étapes.
- **Anglais** (préparation TOEIC avec score visé), **Lecture** (livre en cours, pages), **Projets** perso/freelance (statut actif/pause/fini, prochaine action, minutes).

## 6. Suivi, motivation et analyse
- Séries (streak) par habitude et globale (jours ≥ 70 %), badges, objectifs, prévisions de date de fin des parcours, bilan hebdomadaire, courbes, coach qui propose des ajustements.
- Statistiques de chaque jour conservées (instantané), historique chargé par fenêtre de jours pour rester rapide.

## 7. Rappels (notifications push)
Un seul type : la prochaine séance d'apprentissage (5 minutes avant). Envoyés toutes les 20 minutes par GitHub Actions (script web-push), jamais pendant Chabbat. Demande clés VAPID et un compte de service (voir docs/RAPPELS.md).

## 8. Données et sécurité
- Firestore : users/{uid}/days/{date} (séances faites, stats, corrections, pages, journal d'apprentissage), settings/main, progress/main (avancement, épinglages, projets, TOEIC), push/main.
- Règles : chaque utilisateur ne lit et n'écrit que ses propres documents, testé sur l'émulateur. Règle d'évolution : on **ajoute** des champs, on ne renomme jamais les anciens.
- Écritures optimistes avec retour en arrière en cas d'échec ; export/import de sauvegarde validé.

## 9. Architecture du code (à respecter)
core/ (dates, formats, id) → content/ (calendrier, plans MIAGE, parcours Java/front, libellés) → domain/ (logique pure) → services/ (backend cloud/démo, import/export, push) → state/ (réducteur + contexte de données) → hooks/ → components/ → features/ (écrans) → App.tsx (routes chargées à la demande). Documentation : docs/ARCHITECTURE.md, AMELIORATIONS.md, COMPTE-RENDU.md, CONTENU-MIAGE.md, RAPPELS.md.

## 10. Qualité et règles de travail
- Avant toute livraison : `npm run check` (typecheck + lint + tests), `npm run test:e2e`, `npm run test:rules`, taille de démarrage ≤ 130 Ko gzip, liens vérifiés, code inutilisé (knip).
- Interface en français, cibles tactiles ≥ 44 px, bon contraste (accessibilité testée), zones sûres iPhone.
- Modifications ciblées plutôt que réécritures ; tester (typecheck, mode démo, écran 400 px) avant de pousser.
- **Ne jamais lancer git commit/push à ma place** : donne-moi les commandes, je les exécute.
- Ce qui a été essayé et abandonné : connexion automatique à GymDay/Duolingo/Apple Santé (aucune interface exploitable sans réglages sur le téléphone) ; on coche à la main.

Quand je te demande quelque chose, commence par me dire ce que tu vas toucher et pourquoi, puis donne le résultat complet.
```
