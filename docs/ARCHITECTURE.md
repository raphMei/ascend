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
| `content/` | Données : calendrier CFA, matières et tâches MIAGE, parcours Java | non |
| `domain/` | Règles métier **pures** : planning (et ses modifications libres), Chabbat, stats, rattrapage des stats, rappels, domaines optionnels, coach, progression, types du modèle | non |
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
(anglais, lecture, dev front, projets, point finances ; actifs si leurs minutes > 0) → Java (prend le reste).
Puis `applyEdits` applique les **modifications libres** du jour (`days/{date}.edits` : `skip`, `move`, `extra`) et signale chevauchements et blocs tombant pendant Chabbat.
L'affichage regroupe les petites tâches MIAGE consécutives (`domain/grouping.ts`).

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
| `npm test` (133 tests) | logique (`domain.test`, `core.test`, `planning-edits`, `habits`, `reminders`, `backfill`, `miage-plans`), empreinte du planning de toute la saison (`planning.golden`), réducteur, service worker, et l'application entière avec un faux backend (`app.test.tsx`) |
| `npm run test:e2e` | Chromium (iPhone et bureau) sur le site de production : navigation, persistance, Chabbat, PWA, aucun débordement, **audit d'accessibilité axe** en clair et en sombre |
| `npm run test:rules` | **émulateur Firestore** : règles de sécurité (isolation entre utilisateurs, collections connues, requête fenêtrée) et script d'envoi des rappels de bout en bout (nécessite Java) |
| `npm run test:all` | tout ce qui précède |

## Déploiement

`.github/workflows/deploy.yml` : à chaque push sur `main` → `npm ci` → `npm run check` → `npm run build` → GitHub Pages.
Prérequis (une seule fois) : GitHub → Settings → Pages → *Build and deployment* → Source : **GitHub Actions**.
`.github/workflows/ci.yml` lance en plus les tests de bout en bout et l'émulateur sur chaque branche ; `reminders.yml` envoie les rappels.
Les règles Firestore (`firestore.rules`) se publient à la main : `npx firebase deploy --only firestore:rules --project ascend-raphael`.
