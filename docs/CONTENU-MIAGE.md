# Remplacer les tâches génériques MIAGE par le vrai contenu

Les tâches « Relire et annoter », « Cinq questions-réponses »… sont génériques. Dès que tu me donnes le programme d'une matière,
je l'écris dans un fichier de données, et les tâches du jour de cette matière deviennent des séances précises sur ton cours.

## Ce qu'il me faut, par matière

1. La **liste des séances** dans l'ordre (chapitres, TD, notions) avec, pour chacune, ce qu'il faut faire en une phrase ou deux.
2. Les **dates** de contrôle continu, rendus, soutenances.
3. Le **format de l'examen final** (durée, type de questions) et les documents autorisés.

Je ne devine pas le contenu : sans programme, la matière garde ses tâches génériques.

## Où ça vit

`src/content/miage/plans/<matière>.ts` (modèle : `plans/_template.ts`), enregistré dans `plans/index.ts`.
Identifiants des matières : `dl` `qa` `sec` `llm` `big` `ri` `gov` `eth` `toeic` `proj`.

## Ce qui change dans l'application

- Chaque créneau « tâche du jour » de la matière prend la séance suivante du plan. Quand le plan est épuisé, les tâches génériques de révision reprennent.
- Une tâche « Préparer : … » apparaît à la date de chaque contrôle continu.
- La tâche « Passer l'examen final » mentionne le format et les documents autorisés.
- La tâche « Envoyer le contenu de la matière » disparaît.

Attention : les cases déjà cochées d'une date (`d:AAAA-MM-JJ`) restent cochées, mais portent alors sur la nouvelle séance. À faire **avant** de commencer à cocher.
