# Architecture d'Ascend

Site statique sans build : modules ES chargés directement par `index.html` (point d'entrée `src/main.js`).
Zéro dépendance. Les tests utilisent uniquement `node:test` (Node ≥ 20).

## Principe : les dépendances descendent, jamais l'inverse

```
main.js → app/ (rendu, événements, routage)
            └→ screens/ → ui/ (HTML pur) ──┐
            └→ state/ (store, sélecteurs)  │
                  └→ domain/ (logique pure) ← content/ (données)
                                           └→ core/ (dates, format)
services/ (Firebase / démo) → state/
```

| Dossier | Rôle | Touche au DOM ? |
|---|---|---|
| `core/` | Dates, formatage, fusion profonde | non |
| `content/` | Données : calendrier CFA, matières et tâches MIAGE, parcours Java | non |
| `domain/` | Règles métier : planning, Chabbat, stats, coach, progression, sport, registre des domaines | non |
| `state/` | `store` (état unique), écritures optimistes, sélecteurs | non |
| `services/` | Backends interchangeables (Firebase, démo) | non |
| `ui/` | Icônes, graphiques SVG, composants : fonctions qui retournent du HTML | non |
| `screens/` | Un fichier par écran ; `screens/domains/` une page par domaine | non |
| `app/` | Routeur, rendu, événements délégués | oui |

Tout ce qui est hors `app/` est testable sous Node.

## Ajouter un domaine (ex. anglais)

1. `domain/domains.js` : ajouter l'entrée (nom, variable de couleur, icône, description).
2. `css/tokens.css` : ajouter `--c-anglais` en clair et en sombre.
3. `screens/domains/anglais.js` : exporter `{ id, card(), page(sousPage) }` (copier `matin.js` comme modèle).
4. `screens/domains/index.js` : ajouter le module dans `DOMAIN_PAGES`.
5. Si le domaine place des blocs dans le planning : `domain/planner.js`.

## Données Firestore (inchangées)

`users/{uid}/days/{AAAA-MM-JJ}`, `users/{uid}/settings/main`, `users/{uid}/progress/main`.
Règle : on ajoute des champs, on ne renomme jamais ceux qui existent.

## Vérifier

```
sh scripts/check.sh                       # syntaxe + tests
python3 -m http.server 8765               # puis http://localhost:8765/index.html?demo
```
