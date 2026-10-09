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
| `domain/` | Règles métier **pures** : planning, Chabbat, stats, coach, progression, types du modèle | non |
| `services/` | `Backend` (interface) + implémentations Firebase et démo ; export JSON | non |
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

1. `DataProvider` démarre le `Backend` (Firebase, ou démo avec `?demo`) et reçoit ses événements (`onAuth`, `onDays`, …).
2. Le réducteur range tout dans `state` (`days`, `settings`, `progress`, `sync`, `user`).
3. Les écrans lisent via `useData()`, calculent via `usePlan()` / fonctions du domaine.
4. Une action (cocher, saisir) appelle `setDay` / `setProgress` / `setSettings` : l'état local change **tout de suite**
   (optimiste), puis le backend écrit en `merge`. Firestore renvoie ensuite l'état confirmé.
5. Cocher une case enregistre aussi l'instantané `stats` du jour (lu par les graphiques des jours passés).

## Données Firestore (inchangées depuis la v1)

`users/{uid}/days/{AAAA-MM-JJ}`, `users/{uid}/settings/main`, `users/{uid}/progress/main` — voir `src/domain/types.ts`.
Règle de compatibilité : on **ajoute** des champs, on ne renomme jamais ceux qui existent. Règles de sécurité : `firestore.rules`.

## Ajouter un domaine (ex. anglais)

1. `src/domain/domains.ts` : ajouter l'entrée (nom, variable de couleur, icône, description) et l'`id` dans `DomainId` (`types.ts`).
2. `src/styles/tokens.css` : ajouter `--c-anglais` en clair **et** en sombre.
3. `src/features/domains/anglais/index.tsx` : exporter `{ id, Card, Page }` (copier `matin/` comme modèle).
4. `src/features/domains/registry.ts` : l'ajouter à `DOMAIN_MODULES`.
5. S'il place des blocs dans le planning : `src/domain/planner.ts`. Ajouter un test dans `tests/`.

## Tests (`npm test`)

| Fichier | Vérifie |
|---|---|
| `core.test.ts` | dates (heure d'été), formats, fusion |
| `domain.test.ts` | calendrier, Chabbat, invariants du planning, tâches, Java, série, coach |
| `planning.golden.test.ts` | empreinte du planning de toute la saison (identique à la version d'origine) |
| `reducer.test.ts` | états de synchro, déconnexion, écritures optimistes |
| `app.test.tsx` | l'application entière avec un faux backend : connexion, navigation, cocher, saisir, réglages, Chabbat, erreurs de synchro |

## Commandes

```
npm run dev        # serveur local → http://localhost:5173/ascend/?demo   (mode démo, sans Firebase)
npm run check      # types + lint + tests (lancé aussi par la CI avant chaque mise en ligne)
npm run build      # production → dist/
```

## Déploiement

`.github/workflows/deploy.yml` : à chaque push sur `main` → `npm ci` → `npm run check` → `npm run build` → GitHub Pages.
Prérequis (une seule fois) : GitHub → Settings → Pages → *Build and deployment* → Source : **GitHub Actions**.
