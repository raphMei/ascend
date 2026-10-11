# Rapport : ce qui est fait, ce qu'il reste à faire

## Fait

**Fiabilité des données**
- La collection `days` n'est plus lue en entier : fenêtre de 180 jours au démarrage, historique plus long chargé à la demande (graphique de poids « 90 jours / 1 an »).
- Écriture refusée : la valeur d'avant est rétablie et un message le dit (avant : l'écran gardait une valeur fausse).
- Stats des jours passés sans case cochée : rattrapées automatiquement (une fois par jour, jamais avant le 8 oct. 2026).
- Règles de sécurité resserrées (`firestore.rules`) : quatre collections connues, identifiant de jour = date. **À publier** (voir plus bas).

**Tests de bout en bout**
- Chromium iPhone + bureau sur le site de production : navigation, persistance après rechargement, Chabbat, PWA, aucun débordement horizontal.
- **Accessibilité (axe)** sur 13 écrans, clair et sombre : elle a trouvé de vrais défauts de contraste en thème clair (orange du bouton principal, rouge des retards), corrigés.
- **Émulateur Firestore** : règles de sécurité (isolation entre utilisateurs, collections inconnues refusées, requête fenêtrée autorisée) et script d'envoi des rappels de bout en bout.
- CI : trois jobs sur chaque branche (types/lint/tests, Chromium, émulateur).

**Planning**
- Édition libre : déplacer un créneau, le passer, rétablir, **ajouter un bloc** à la main (avertissement en cas de chevauchement ou de bloc pendant Chabbat).
- Petites tâches MIAGE consécutives regroupées sous une ligne repliable.
- Objectif de poids (pointillés sur la courbe), rappel de saisie du poids et de la nuit, graphique de poids sur 30 / 90 / 365 jours.

**Nouveaux domaines** (désactivés par défaut ; minutes par jour dans Réglages › Mes domaines)
- **Anglais** : séance du jour qui tourne sur quatre exercices, scores TOEIC avec courbe et objectif.
- **Lecture** : livre en cours, pages par jour, courbe, régularité.
- **Dev front** : parcours de 9 phases (HTML → React testé → portfolio), même mécanique que Java.
- **Finances** : point mensuel (4 étapes à cocher), épargne et investissement saisis, courbes 6 mois. Aucun conseil financier.
- **Projets perso** : projets avec prochaine action, statut, temps passé ; le bloc quotidien affiche la prochaine action.

**Rappels** (routine, sport, bilan du soir, saisie) : service worker, abonnement, envoi toutes les 20 minutes par GitHub Actions (gratuit), jamais pendant Chabbat, jamais de doublon. Mise en route : `RAPPELS.md`.

**Contenu MIAGE** : mécanisme prêt (un fichier par matière remplace les tâches génériques ; jalons, examen). Mode d'emploi : `CONTENU-MIAGE.md`.

## À faire par toi (je ne peux pas le faire à ta place)

1. **Pousser** ce lot (commandes dans le message de fin de session).
2. **Publier les nouvelles règles Firestore** : console Firebase › Firestore › Règles › coller `firestore.rules` › Publier (ou `npx firebase deploy --only firestore:rules --project ascend-raphael` après `npx firebase login`). Tant que ce n'est pas fait, les anciennes règles (plus larges) restent actives : l'application fonctionne dans les deux cas.
3. **Source GitHub Pages = GitHub Actions** (Settings › Pages), si pas déjà fait.
4. **Activer les rappels** : suivre `RAPPELS.md` (clés VAPID, compte de service, 4 secrets/variables GitHub, ajout à l'écran d'accueil de l'iPhone, activation dans Réglages).
5. **Tester sur l'iPhone et le Mac** (jamais fait en réel) : connexion Google sur `https://raphmei.github.io/ascend/`, une case cochée visible sur l'autre appareil, une notification de test.
6. **M'envoyer le programme de chaque matière MIAGE** (liste des séances, dates de contrôle, format d'examen) : je remplis `src/content/miage/plans/`.
7. **Activer les domaines voulus** dans Réglages › Mes domaines (minutes par jour) et renseigner livre en cours, score TOEIC visé, poids visé.
8. Valider les **valeurs par défaut** non confirmées (jours sur site, objectifs, 22 h 30) et les **heures de Chabbat** avec ton calendrier.

## Reste à faire côté code (par priorité)

| # | Sujet | Détail |
|---|---|---|
| 1 | **Firebase 10.14.1** | Montée de version non faite volontairement : elle change le poids du site (≈ +70 Ko gzip en v13) et le comportement de la connexion, qui ne peut se tester que sur ton iPhone. Les alertes `npm audit` viennent de dépendances Node de Firebase, absentes du code envoyé au navigateur. À faire dans une branche, une fois l'étape 5 validée. |
| 2 | **Connexion Google non automatisable** | Les tests couvrent le chargement du SDK, l'écran de connexion, les règles et l'envoi des rappels. Le flux OAuth réel ne l'est pas (il faudrait l'émulateur Auth avec une version de l'application branchée dessus). |
| 3 | **Journée exceptionnelle** | Les blocs de travail et de trajet ne sont pas modifiables (congé, maladie, télétravail exceptionnel) : seuls les blocs « pour toi » le sont. |
| 4 | **Rappels plus riches** | Pas encore de rappel pour les tâches MIAGE en retard, les échéances, ni pour les nouveaux domaines. Précision de ±20 minutes (planificateur GitHub). |
| 5 | **Stats dépendantes du plan actuel** | Un instantané est figé à l'écriture ; si tu changes tes réglages (jours sur site…), les jours passés ne sont pas recalculés. |
| 6 | **Lat / long de Chabbat fixes** | Calcul pour Deuil-la-Barre ; champs existants mais pas dans l'interface. |
| 7 | **Polices Google en ligne** | Dépendance réseau et suivi tiers : à auto-héberger. |
| 8 | **Hors-ligne** | Toujours volontairement absent (le service worker ne gère que les notifications). |
| 9 | **Critères de validation Java (`d`)** | Affichés pour le parcours Java et Dev front depuis cette version ; vérifier qu'ils te conviennent. |
| 10 | **Suppression d'un projet** utilise la boîte de confirmation du navigateur | À remplacer par une confirmation intégrée si tu veux un rendu homogène. |
| 11 | **Conflits multi-appareils** | Dernier écrivain gagne, champ par champ : acceptable pour un seul utilisateur. |

## Pas fait, et pourquoi
- **Contenu précis des 10 matières MIAGE** : je ne l'ai pas, et je ne l'invente pas. Le mécanisme est prêt.
- **Conseils financiers** : volontairement exclus ; l'application suit tes chiffres et tes habitudes.
