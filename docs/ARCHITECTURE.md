# Architecture d'Ascend (v2 : React + TypeScript + Vite)

Application web mobile-first, déployée sur GitHub Pages (`https://raphmei.github.io/ascend/`), données dans Firebase
(Authentication Google + Firestore). Un seul dépôt, un seul `npm run check` qui valide types, lint et tests.

## Principe : les dépendances descendent, jamais l'inverse

```
main.tsx → App.tsx → features/ (écrans) ──→ components/ (UI réutilisable)
                          │                       │
                          ▼                       ▼
                 hooks/ + state/ (React) ──→ domain/ (logique pure) ←── content/ (données)
                          │                       │
                          ▼                       ▼
                    services/ (Firebase / démo)  core/ (dates, formats)
```

| Dossier | Rôle | React ? |
|---|---|---|
| `core/` | Dates ISO, formatage, fusion profonde | non |
| `content/` | Données : calendrier CFA, matières et tâches MIAGE, plans de matière, parcours Java et dev front (chapitres + liens) | non |
| `domain/` | Règles métier **pures** : planning (modifications libres, jours exceptionnels), réajustement, intensité du mois, Chabbat, stats et rattrapage, séries, objectifs, badges, prévisions, rappels, groupes, minuteur, types du modèle | non |
| `services/` | `Backend` (interface) + implémentations Firebase et démo ; notifications push ; export JSON | non |
| `state/` | Réducteur (pur) + `DataProvider` (contexte React, écritures optimistes) | oui |
| `hooks/` | `useClock`, `usePlan`, `useTick`, `useDayAmounts` | oui |
| `components/` | Briques d'interface : cases, barres, graphiques SVG, blocs horaires, saisies | oui |
| `features/` | Un dossier par écran (accueil, aujourd'hui, réglages, domaines, shell) | oui |
| `styles/` | CSS global découpé par rôle ; une couleur par domaine (`--c-*`) | — |

Règles tenues par la structure :
- `domain/`, `core/`, `content/`, `services/` n'importent jamais React : ils se testent sans navigateur.
- Le planning est une fonction pure `planDay(entrées) → plan`. L'état global ne s'y glisse jamais.
- Les données brutes ne sont jamais modifiées : `adjustedTasks(réglages)` renvoie une nouvelle liste (mémoïsée).
- Le backend est un adaptateur : les écrans ne savent pas si Firebase ou la démo répond.

## Flux de données

1. `DataProvider` démarre le `Backend` (Firebase, ou démo avec `?demo`) pour une **fenêtre d'historique de 180 jours** (la collection `days` n'est plus lue en entier ; `loadHistory(from)` élargit à la demande, par exemple le graphique de poids sur un an).
2. Le réducteur range tout dans `state` (`days`, `settings`, `progress`, `sync`, `user`, `loaded`).
3. Les écrans lisent via `useData()`, calculent via `usePlan()` / fonctions du domaine.
4. Une action (cocher, saisir) appelle `setDay` / `setProgress` / `setSettings` : l'état local change **tout de suite** (optimiste), puis le backend écrit en `merge`.
   **Si l'écriture est refusée**, l'état d'avant est rétabli (`inverse()` du patch) et un message s'affiche.
5. Cocher une case enregistre aussi l'instantané `stats` du jour. Les jours passés qui n'en ont pas sont **rattrapés** (`domain/backfill.ts`, une fois par jour, après chargement des trois collections).

## Planning

`planDay(entrées) → plan` est pur. Ordre de placement dans les créneaux libres : sport → tâches MIAGE → domaines optionnels
(anglais, lecture, dev front, projets, point finances) → Java (prend le reste). Puis `applyEdits` applique les **modifications libres**
du jour (`days/{date}.edits` : `skip`, `move`, `extra`).

**Mon mois** (`domain/month.ts`) : `settings.months['AAAA-MM']` donne l'intensité de chaque domaine (désactivé, léger, normal, intensif).
`settingsForDate(réglages, date)` en déduit les minutes par jour, la durée de Java, le programme de sport (3, 5 ou 6 séances) et le niveau MIAGE.
Un mois sans réglage reprend le précédent, domaine par domaine. Sans aucun réglage, le planning est identique à celui d'avant.

**Ajustement automatique** (`domain/schedule.ts`, `buildSchedule`) : calculé à partir des données, **jamais enregistré** (donc toujours à jour).
1. Place disponible par jour = temps libre mesuré par le planificateur (`planDay(..., measure)`) − temps réservé aux domaines du mois − 10 % de marge ; aujourd'hui, seule la fin de journée compte ; samedi = 0.
2. Les examens restent à leur date ; les dates imposées (`progress.pins`) passent d'abord ; les tâches de routine de plus de 2 jours sont abandonnées.
3. Le reste est réparti jour après jour : important d'abord (révisions/projets, fiches, mise en place, tâches du jour), puis le plus ancien. Mois « léger » : plus de tâches du jour ; « intensif » : on avance les tâches des 7 jours suivants.
4. Sport : jambes manquées → rattrapées une fois, à la place de la prochaine séance qui n'est pas des jambes.
5. Chaque déplacement est expliqué (`changes`) et s'annule en un toucher (`pins` : date, `'skip'`, ou `null`).
Le résultat (`Schedule`) est fourni à toute l'application par `ScheduleProvider` ; le planificateur ne lit que `dayOf` et `sport`.
Sans ajustement (désactivé dans les réglages), le retard s'empile sur aujourd'hui, comme avant.
L'affichage regroupe les petites tâches MIAGE consécutives (`domain/small-blocks.ts`).

## Liste d'habitudes (écran « Aujourd'hui »)

L'application s'ouvre sur **Aujourd'hui** : bandeau de la semaine (anneau d'avancement par jour), résumé du jour, puis la **liste groupée** (vue « Liste ») ou la frise horaire (vue « Frise »).
- `domain/groups.ts` : groupes **par moments** (Matin, Trajet, Travail et cours, Après-midi, Soirée, Avant de dormir, Chabbat ; dans l'ordre de la journée) ou **par thèmes** (Routine du matin, Productivité, Apprentissage, Santé, Repas, Finances, Sommeil, Trajets et travail, Autre). Fonctions pures, testées : aucun bloc perdu ni dupliqué.
- `domain/streaks.ts` : série 🔥 par habitude (un jour où elle n'est pas prévue ne la casse pas ; aujourd'hui non plus tant que la journée n'est pas finie).
- `domain/goals.ts` : section **Objectifs** (poids, TOEIC, MIAGE, Java, dev front, sport, sommeil, lecture), seulement ce qui a du sens pour toi.
- `domain/habit-meta.ts` : emoji par bloc et par domaine.
- Préférences d'affichage (vue, regroupement) : `settings.ui`, synchronisées. Groupes repliés : `localStorage` (par appareil).
- Pour ajouter un groupe ou changer une règle de regroupement : `domain/groups.ts` seulement.

## Parcours d'apprentissage

`content/dsl.ts` assemble un parcours : phase → étapes (`cours`, `exo`, `projet`, `valid`), chacune avec ses liens (`Resource` : titre, adresse, langue `fr`/`en`, source) et sa durée.
`PathPages.tsx` les affiche en sections avec les liens ; `domain/continue.ts` donne la prochaine étape (« Continuer mes cours ») ; `domain/forecast.ts` estime la date de fin
d'après les étapes terminées sur 14 jours (la date de chaque étape est enregistrée dans `progress.doneAt`). Liens vérifiés par `npm run check:links`.

## Progression

`domain/habit-stats.ts` (taux par habitude, calendrier de chaleur, bilan de la semaine), `domain/badges.ts` (seuils), `domain/track.ts` (« sur la bonne voie ? » par matière) → écran **Statistiques** (`features/stats`).

## Rappels

`domain/reminders.ts` (pur) décide quoi envoyer ; `scripts/send-reminders.ts` l'exécute toutes les 20 minutes via GitHub Actions ;
`public/sw.js` affiche la notification ; `services/push.ts` gère l'abonnement. Détail et mise en route : `RAPPELS.md`.

## Données Firestore (inchangées depuis la v1)

`users/{uid}/days/{AAAA-MM-JJ}`, `users/{uid}/settings/main`, `users/{uid}/progress/main` — voir `src/domain/types.ts`.
Règle de compatibilité : on **ajoute** des champs, on ne renomme jamais ceux qui existent. Règles de sécurité : `firestore.rules`.

## Ajouter un domaine

1. `src/domain/types.ts` : ajouter l'`id` dans `DomainId`. `src/domain/domains.ts` : nom, variable de couleur, icône, description.
2. `src/styles/tokens.css` : ajouter `--c-<id>` en clair **et** en sombre. Icône manquante : `src/components/Icon.tsx`.
3. `src/features/domains/<id>/index.tsx` : exporter `{ id, Card, Page }` (modèle : `lecture/` pour un suivi simple, `front/` pour un parcours en phases).
4. `src/features/domains/registry.ts` : l'ajouter à `DOMAIN_MODULES`.
5. S'il place un bloc quotidien : réglage de minutes dans `Settings` (`types.ts`, `settings.ts`, écran Réglages) et un item dans `src/domain/habits.ts`.
6. Ajouter un test dans `tests/` (voir `habits.test.ts`).

## Tests

| Commande | Contenu |
|---|---|
| `npm test` (398 tests) | logique (`domain.test`, `core.test`, `planning-edits`, `habits`, `reminders`, `backfill`, `miage-plans`, `schedule`, `month`, `groups`, `curriculum`, `habit-stats`, `forecast`, `track`, `import`, `timer`, `performance`), empreinte du planning de toute la saison (`planning.golden`), réducteur, service worker, et l'application entière avec un faux backend (`app.test.tsx`) |
| `npm run test:e2e` (51) | Chromium (iPhone et bureau) sur le site de production : navigation, persistance, Chabbat, PWA, aucun débordement, polices locales, chargement à la demande, minuteur, import/export, **audit d'accessibilité axe** en clair et en sombre |
| `npm run test:rules` | **émulateur Firestore** : règles de sécurité (isolation entre utilisateurs, collections connues, requête fenêtrée) et script d'envoi des rappels de bout en bout (nécessite Java) |
| `npm run test:all` | tout ce qui précède |
| `npm run size` | budget de taille du démarrage (après `npm run build`) |
| `npm run check:links` | liens des cours (réseau) |
| `npm run unused` | code, exports et dépendances inutilisés (knip) |

## Déploiement

`.github/workflows/deploy.yml` : à chaque push sur `main` → `npm ci` → `npm run check` → `npm run build` → GitHub Pages.
Prérequis (une seule fois) : GitHub → Settings → Pages → *Build and deployment* → Source : **GitHub Actions**.
`.github/workflows/ci.yml` lance en plus les tests de bout en bout et l'émulateur sur chaque branche ; `reminders.yml` envoie les rappels.
Les règles Firestore (`firestore.rules`) se publient à la main : `npx firebase deploy --only firestore:rules --project ascend-raphael`.
