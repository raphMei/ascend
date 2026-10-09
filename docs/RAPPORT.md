# Rapport de migration React — et ce qu'il reste à faire

## Ce qui est fait

- **Pile** : React 18 + TypeScript strict + Vite + React Router (HashRouter : les anciennes adresses `#/today/…` fonctionnent toujours) + Vitest / Testing Library + ESLint.
- **Logique métier conservée à l'identique** : l'empreinte du planning de chaque jour du 8 oct. 2026 au 28 févr. 2027 est la même qu'avant la migration (`tests/planning.golden.test.ts`).
- **Modèle Firestore inchangé** (`days`, `settings/main`, `progress/main`), même config Firebase, mêmes règles.
- **Architecture en couches** (voir `ARCHITECTURE.md`), registre de domaines, backend interchangeable (Firebase / démo).
- **Corrections au passage** : tâches non mutées (calcul pur mémoïsé, recalculé si les réglages changent — avant, il restait figé sur les réglages du premier rendu) ; saisie sans perte de focus ni écriture à chaque frappe ; champ de réglage vidé ignoré au lieu de passer à 0 ; cases à cocher avec libellé (lecteurs d'écran).
- **Qualité** : `npm run check` = types + lint + 52 tests (logique, réducteur, application complète avec faux backend). CI sur chaque branche, et le déploiement s'arrête si un test échoue.
- **Vérifié dans un navigateur** (build de production, mode démo, 400 px et bureau) : navigation, cocher une case, saisie du poids persistée, six pages de domaine, sous-pages MIAGE/Java, réglages, aucune erreur console, aucun débordement horizontal. L'écran de connexion Firebase s'affiche (SDK chargé).

## Ce que je n'ai PAS pu vérifier (à faire par toi, dans cet ordre)

1. **Source GitHub Pages** : Settings → Pages → *Build and deployment* → Source = **GitHub Actions**. Sans ça, le workflow construit mais rien n'est publié (le site continuerait de servir les fichiers bruts du dépôt).
2. **Connexion Google réelle** sur `https://raphmei.github.io/ascend/` (je ne peux pas me connecter à ta place). Si `auth/unauthorized-domain` : Firebase → Authentication → Settings → Authorized domains → ajouter `raphmei.github.io`.
3. **Synchro iPhone ↔ Mac** : cocher une case sur l'un, vérifier qu'elle apparaît sur l'autre en quelques secondes.
4. **Ajout à l'écran d'accueil iOS** : le manifest et les icônes ont changé de chemin (`icon-192.png` etc. à la racine du site). Si l'icône ne s'affiche pas, supprimer puis rajouter l'app à l'écran d'accueil.
5. **Règles Firestore** : `firestore.rules` est la référence versionnée ; vérifier qu'elle correspond à ce qui est publié dans la console.
6. **Valeurs par défaut non confirmées** : jours sur site mardi + jeudi, 2 700 kcal, 160 g de protéines, 3 L d'eau, 7 h 30 de sommeil, Java 2 h/jour, coucher 22 h 30. Les heures de Chabbat (≈ coucher du soleil − 18 / + 45 min) sont à comparer à ton calendrier.

## Dette technique connue (par priorité)

| # | Sujet | Pourquoi c'est important | Piste |
|---|---|---|---|
| 1 | **La collection `days` est lue en entier** à chaque démarrage | Le coût et le temps de chargement croissent chaque jour | Requête bornée (ex. 120 derniers jours) + chargement à la demande pour l'historique |
| 2 | **Pas de retour arrière si une écriture échoue** | L'écran montre la valeur optimiste alors que Firestore a refusé (règles, réseau) ; seul le bandeau d'erreur le signale | Annuler le patch local ou réessayer ; file d'écritures |
| 3 | **Instantané `stats` écrit seulement quand on coche** | Un jour sans case cochée n'a pas de stats (série et graphiques le voient comme « raté » ; les jours passés ne reflètent pas un changement de planning) | Écrire l'instantané en fin de journée, ou le recalculer |
| 4 | **Pas de test de bout en bout réel** | Les tests utilisent un faux backend : Firebase, règles de sécurité et PWA ne sont pas couverts | Émulateur Firebase + tests des règles ; Playwright sur le site déployé |
| 5 | **Firebase 10.14.1** | Les 11 alertes `npm audit` viennent de dépendances Node de Firebase (`grpc-js`, `undici`) qui ne sont pas dans le code envoyé au navigateur ; la montée de version change le poids (≈ +70 Ko gzip en v13) et le comportement de connexion | Monter de version dans une branche et tester la connexion sur iPhone |
| 6 | **Latitude / longitude de Chabbat fixes** | Calcul pour Deuil-la-Barre uniquement ; les champs existent dans les réglages mais pas dans l'interface | Ajouter la saisie, ou la géolocalisation |
| 7 | **Polices Google en ligne** (Syne, DM Sans, DM Mono) | Dépendance réseau et suivi tiers | Auto-héberger les polices |
| 8 | **Pas d'audit d'accessibilité complet** | Cibles tactiles ≥ 44 px et libellés des cases ok ; contraste, focus et lecteur d'écran non audités | Passage axe / Lighthouse |
| 9 | **Critères de validation Java (`d`) jamais affichés** | La donnée existe dans le parcours mais l'écran ne la montre pas | L'afficher sous chaque étape |
| 10 | **Conflits multi-appareils** : dernier écrivain gagne, champ par champ | Acceptable pour un seul utilisateur | Rien à faire sauf usage simultané intensif |
| 11 | **Styles globaux** (CSS partagé) | Fonctionne et reste identique à la v1, mais un composant peut casser un autre | Modules CSS / Tailwind si l'interface grossit |

## Fonctionnalités à venir (feuille de route d'origine)

1. **Rappels / notifications** (priorité haute) : Web Push iOS (PWA ajoutée à l'écran d'accueil, iOS 16.4+) avec un envoi serveur. Cloud Functions exige l'offre Blaze : alternatives gratuites = cron GitHub Actions qui lit Firestore (compte de service) et envoie via Web Push, ou service tiers. Doit respecter Chabbat. Demande un service worker (aujourd'hui volontairement absent).
2. **Nouveaux domaines** : dev front, anglais (TOEIC), finances / investissement, projets perso / freelance, lecture → procédure en 5 étapes dans `ARCHITECTURE.md`.
3. **Contenu précis des dix matières MIAGE** à la place des tâches génériques (`src/content/miage/tasks.ts`) : dès que tu m'envoies le plan de chaque matière.
4. **Améliorations** : édition libre des blocs du planning, regroupement des petites tâches consécutives, rappel de saisie poids / sommeil, objectif de poids, historique plus long, hors-ligne (service worker, ex. `vite-plugin-pwa`).
