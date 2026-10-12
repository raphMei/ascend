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

Neuf matières ont un **plan précis**, écrit d'après tes plans de cours (les PDF reçus le 12 octobre) : `dl`, `qa`, `ri`, `big`, `llm`, `sec`, `gov`, `eth`, `proj`.
Le TOEIC garde un plan type (pas de plan fourni). Chaque séance reprend le titre, le contenu, les exercices et le critère de réussite du plan, avec des liens vers le cours (français d'abord).

| Priorité | Matières | Rôle |
|---|---|---|
| 1 à 3 | Deep Learning, Contrats-tests-qualité, Analyse des données et RI | échéances plus tôt, finissent à 80 % de la période |
| 4 à 6 | Données massives, LLM, Sécurité | finissent à 90 % |
| 7 à 10 | Gouvernance, TOEIC, Éthique, Projet données | finissent à la fin de la période, se révisent par à-coups |

Le rang de chaque matière est dans `miage/subjects.ts` (`rank`). Il décale les échéances (`miage/pacing.ts`) et départage les tâches quand tout ne tient pas.

**Comment une séance devient des tâches**
- Une séance de plus de 1 h 15 est **découpée en parties** (2 h = 2 × 1 h, 3 h = 3 × 1 h) : une soirée de semaine n'offre qu'environ 1 h 15, une séance de 2 h ou plus n'y tient pas et irait forcément le dimanche. Les identifiants sont `dl:u3` (séance entière) ou `dl:u3.1`, `dl:u3.2` (parties).
- Les **révisions chronométrées** et examens blancs (`valid(...)`) ne sont jamais découpés (c'est tout l'intérêt) : ils deviennent des tâches « révision » (prioritaires, jamais proposées à l'abandon).
- Les séances sont des tâches « séance » : jamais abandonnées toutes seules, seulement reprogrammées. Celles qui n'ont pas de place avant la fin sont signalées dans le journal du planning.
- Les **rendus** (TP Snowflake, exposé, Lab 1 et 2, deux rendus R Markdown, deux contrôles continus de gouvernance) sont des tâches « projet » datées d'après la séance qui les précède. Les dates officielles ne sont pas dans tes plans : à corriger quand tu les connais.
- Les séances **provisoires** (plan anticipé, supports non reçus) sont signalées en tête du détail ; à réaligner dès que le professeur publie le contenu.

**Modifier un plan**
1. Édite `src/content/miage/plans/<matière>.ts` : `cours(...)`, `exo(...)`, `projet(...)`, `valid(...)`, `provisoire(...)` ; titre, détail, durée (heures), liens.
2. Lance `npm run gen:outline` : il met à jour le squelette chargé au démarrage (titres, durées, types). Un test échoue tant que ce n'est pas fait.
3. `npm run check`, puis `npm run check:links` si tu as ajouté des liens.

**Pourquoi un squelette ?** Le texte et les liens des 180 séances pèsent environ 40 Ko compressés. Au démarrage, l'application n'embarque que le squelette (`outline.generated.ts` : titres, durées, types) pour dater les tâches ; le texte et les liens (`full.ts`) sont chargés juste après, à la demande.

**Rythme** (`miage/pacing.ts`) : on simule, avec une place type par sorte de jour (soirée d'entreprise, jour sans travail, dimanche), ce que fait le réajustement, pour que les échéances soient réalistes. Quand les séances demandent plus que la place disponible (c'est le cas : ≈ 360 h de séances pour ≈ 330 h de place, fiches, révisions et routine comprises), la place est étirée et les échéances restent réparties sur toute la période, les plus prioritaires d'abord. Le réajustement dit ensuite la vérité avec tes vrais temps libres.

## Vérifier les liens

```
npm run check:links     # chaque lien doit répondre (404 = échec ; 403 = site qui bloque les robots, signalé)
```
Un contrôle mensuel tourne aussi sur GitHub (`.github/workflows/links.yml`). Et `npm test` vérifie la structure : chaque chapitre a au moins un lien, les adresses sont en https, le français domine.
