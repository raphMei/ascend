# Contenu des cours : structure et mise à jour

Chaque parcours est découpé en **chapitres à lire, exercices, projets et validations**, avec des **liens vers le cours correspondant**
(français d'abord ; la langue de chaque lien est affichée : `FR` ou `EN`). Il n'y a plus de « gros bloc » par cours.

## Où vit quoi

| Parcours | Fichier | Structure |
|---|---|---|
| Java backend (14 phases) | `src/content/java/path.ts` | phase → sections → étapes (cours, exercice, projet, validation) |
| Dev front (9 phases) | `src/content/front/path.ts` | idem |
| Matières MIAGE (10) | `src/content/miage/plans/<matière>.ts` | séances (chapitre ou exercice) réparties sur la saison jusqu'aux examens |
| Constructeurs et sources | `src/content/dsl.ts`, `sources.ts`, `miage/plans/dsl.ts` | `cours(...)`, `exo(...)`, `projet(...)`, `jdx(...)`, `learn(...)`, `wiki(...)`… |

## Ajouter ou modifier une étape (Java, dev front)

```ts
cours('Collections : List, Set, Map', [jdx('chap-collections', 'Les collections')], 60, { g: 'Le langage' }),
exo('Écrire 10 requêtes JOIN', [en('SQLBolt', 'SQLBolt', 'https://sqlbolt.com/')], 90),
```
Titre, liens (français d'abord), durée en minutes, section facultative `g`. La durée d'une phase est la somme de ses étapes.
Les identifiants (`p1t1`, `p1t2`…) suivent l'ordre : **insérer une étape au milieu décale les suivantes et leurs cases cochées**. Ajoute plutôt en fin de phase, ou accepte de recocher.

## Les matières MIAGE

Les plans fournis sont des **plans types** construits sur le contenu habituel de chaque matière (réseaux de neurones, tests, sécurité, RAG, Spark…).
À remplacer par le programme réel dès que tu l'as : ordre des chapitres, vrais TD, dates de contrôle continu (`milestones`), format de l'examen (`exam`).
Les séances sont réparties régulièrement sur les créneaux de la matière ; les projets datés (« Un RAG minimal », « Un pipeline Spark »…) restent dans `miage/tasks.ts`, les plans y ajoutent leurs liens via `projects`.

## Vérifier les liens

```
npm run check:links     # chaque lien doit répondre (404 = échec ; 403 = site qui bloque les robots, signalé)
```
Un contrôle mensuel tourne aussi sur GitHub (`.github/workflows/links.yml`). Et `npm test` vérifie la structure : chaque chapitre a au moins un lien, les adresses sont en https, le français domine.
