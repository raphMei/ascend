# Durées réelles et retard : spécification

Deux améliorations du moteur de planning, livrées ensemble parce qu'elles partagent le même but : que le planning
corresponde à ce que tu fais vraiment.

1. **Recalibrage des durées** : le temps réellement passé (mesuré au minuteur) ajuste la durée des tâches MIAGE.
2. **Dette de retard et « Repartir à zéro »** : le retard est mesuré en jours de travail ; au-delà de 3 jours,
   l'outil propose d'abandonner les tâches les moins importantes, que tu valides.

## 1. Pourquoi

- Les durées des tâches sont écrites une fois pour toutes dans `content/`. Si une fiche prend en réalité 1 h 30 au lieu
  d'1 h, le planning est trop optimiste tous les jours, la journée déborde et le réajustement reporte sans fin.
- Le réajustement (`schedule.ts`) répartit bien le retard selon la place disponible, mais après plusieurs jours ratés
  il remplit tous les jours à venir : c'est l'effet avalanche. Il manquait une mesure de ce retard et une sortie propre.

## 2. Données (Firestore)

Règle d'évolution respectée : **uniquement des champs ajoutés**, aucun renommage. Les règles de sécurité ne changent pas
(elles ne valident pas les champs).

| Emplacement | Champ ajouté | Contenu |
|---|---|---|
| `users/{uid}/days/{date}` | `time?: Record<string, TimeEntry \| null>` | Une mesure par bloc coché après un minuteur. Clé : `identifiant@début` (un bloc découpé donne une mesure par morceau). `TimeEntry = { c: catégorie, p: minutes prévues, r: minutes réelles }`. `null` = mesure effacée (bloc décoché). |
| `users/{uid}/settings/main` | `calibrate?: boolean` | Ajustement des durées (activé si absent), comme `autoReschedule`. |
| `users/{uid}/progress/main` | `resets?: Record<date, string[] \| null>` | Tâches laissées tomber par « Repartir à zéro », par jour, pour pouvoir tout annuler. |
| (contenu, non stocké) `MiageTask` | `h0?: number` | Durée d'origine quand `h` a été ajustée. |

Les coefficients ne sont **jamais stockés** : comme le réajustement, ils se recalculent à chaque changement de données.
L'export JSON contient ces champs automatiquement ; l'import les valide (`importData.ts`).

## 3. Mesure du temps réel

- `domain/timer.ts` : `elapsedMs(t, now)` (temps écoulé, pauses exclues, **dépassement compris**) et `overtimeMs`.
  `pauseTimer` garde désormais un reste négatif après la fin ; `remainingMs` reste borné à 0 pour l'affichage.
- Le minuteur continue après la fin et affiche le dépassement (`+04:12`).
- **C'est la coche qui enregistre la mesure** (`useTick`, 4ᵉ argument `block`) : elle lit le minuteur du bloc
  (`takeElapsed`, clé `timerKey(date, bloc)` commune aux vues Liste et Frise), l'arrête et écrit `days/{date}.time`.
  Décocher efface la mesure.
- Pas de minuteur lancé : aucune mesure. Rien n'est supposé.

Catégories (`timeCategory`) : `miage:<type>` pour une tâche MIAGE (`daily`, `fiche`, `rev`, `proj`, `setup`, `org`),
sinon le domaine (`java`, `front`, `sport`…). Seules les catégories MIAGE modifient le planning ; les autres sont affichées.

## 4. Calcul du coefficient (`domain/calibration.ts`, fonctions pures)

| Constante | Valeur | Rôle |
|---|---|---|
| `MIN_PLAN` | 5 min | Bloc trop court : mesure ignorée |
| `RATIO_MIN` / `RATIO_MAX` | 0,25 / 3 | Hors bornes : minuteur oublié ou coche par erreur, ignoré |
| `MAX_SAMPLES` | 30 | Mesures les plus récentes gardées par catégorie |
| `MIN_N` | 3 | Mesures nécessaires avant d'appliquer un coefficient propre |
| `PRIOR_N` | 3 | Poids de la valeur de référence (« mesures fictives ») |
| `LO` / `HI` | 0,7 / 1,8 | Bornes du coefficient |

Estimation rétrécie vers une référence, par niveau :

```
coef = (Σ réel + PRIOR_N × référence × moyenne prévue) / (Σ prévu + PRIOR_N × moyenne prévue)
```

1. **Global MIAGE** : toutes les mesures `miage:*`, référence 1.
2. **Par type** : référence = global MIAGE. Moins de 3 mesures : le type suit le global.
3. Borné à [0,7 ; 1,8] et **arrondi au dixième** : le planning ne bouge pas à chaque case cochée.
4. Les **examens ne sont jamais ajustés**.

Exemple : 10 fiches prévues 60 min, faites en 90 → global ×1,4 ; fiches ×1,5 ; une fiche d'1 h est planifiée 1 h 30.

Application : `calibrateTasks(tasks, calibration)` multiplie `h` (au pas de 5 min) et garde `h0`. Une tâche inchangée
garde la même référence. Point d'injection unique : `DataContext` (`tasks`), mémoïsé sur `calibKey` (signature des
coefficients) : le réajustement et le planning ne se recalculent que si un coefficient change. Les rappels
(`reminders.ts`, GitHub Actions) appliquent le même calcul sur les jours qu'on leur transmet.

Le bloc MIAGE ajusté l'explique dans son détail : « Durée ajustée à ton rythme réel : 1 h prévues, 1 h 30 comptées. »

### Parcours Java et front (`pathPace`)

Les séances Java/front ont une durée fixe : le minuteur ne dit rien sur la durée d'une **étape**. On compare donc, sur
28 jours, les minutes de séances cochées (instantanés `stats.done.java`, déjà enregistrés) aux minutes des étapes
validées (`progress.doneAt`). Minimum 3 étapes et 2 h d'étapes, sinon rien. Affiché sous la prévision :
« 30 h de séances pour 20 h d'étapes prévues, soit ×1,5. En séances, le reste représente plutôt … ».
La date de fin estimée ne change pas : elle se fonde déjà sur le rythme réel de validation.

## 5. Dette de retard (`domain/debt.ts`, fonctions pures)

- **Retard** : tâches MIAGE dont l'échéance est passée, ni faites, ni abandonnées (automatiquement ou par toi), examens exclus.
- **Place d'une journée** : moyenne de `schedule.capacity` sur les 14 prochains jours (samedis exclus).
- **Retard en jours** = minutes en retard ÷ place moyenne, au dixième. Sans place mesurable : seuil de 600 min.
- **Alerte** au-delà de **3 jours** : carte sur l'écran Aujourd'hui.

« Repartir à zéro » (`resetProposal`) :
- candidats : tous les types **sauf révisions, projets et examens** ;
- ordre : priorité la plus faible d'abord (`WEIGHT` du réajustement, désormais exporté : organisation, cours du jour,
  mise en place, fiches), puis la plus ancienne ;
- on s'arrête dès que le retard restant revient à **1 jour** ;
- fenêtre de validation : chaque tâche décochable, bouton « Laisser tomber N tâches (≈ X) ».

Pourquoi une proposition et pas un abandon automatique : les tâches concernées (fiches notamment) préparent des
examens ; les supprimer en silence ferait perdre confiance dans le planning. Le réajustement abandonne déjà seul les
tâches de routine de plus de 2 jours.

Écriture : `pins[id] = 'skip'` (mécanisme existant) et `resets[aujourd'hui] = [ids]`. « Annuler » (visible toute la
journée) remet les `pins` à `null` et efface l'entrée de `resets`.

## 6. Interface

| Écran | Changement |
|---|---|
| Aujourd'hui | `DebtCard` au-dessus du journal d'ajustements : alerte, fenêtre « Repartir à zéro », annulation |
| Bloc (Liste) | Minuteur avec dépassement ; la coche enregistre le temps |
| Statistiques | `CalibrationCard` « Tes durées réelles » : par catégorie, mesures, prévu/réel, coefficient |
| Domaines Java / front | Ligne de rythme réel sous la prévision |
| Réglages | Case « Ajuster les durées à mon rythme réel » |

Cibles tactiles ≥ 44 px dans la fenêtre, textes en français, vérifié à 400 px en mode démo.

## 7. Fichiers

Nouveaux : `src/domain/calibration.ts`, `src/domain/debt.ts`, `src/components/CalibrationCard.tsx`,
`src/components/DebtCard.tsx`, `tests/calibration.test.ts`, `tests/debt.test.ts`, `docs/CALIBRAGE.md`.

Modifiés (ciblé) : `domain/types.ts`, `content/types.ts`, `domain/timer.ts`, `domain/schedule.ts` (export de `WEIGHT`),
`domain/planner.ts` (texte du détail), `domain/reminders.ts`, `hooks/useTimer.ts`, `hooks/useTick.ts`,
`state/DataContext.tsx`, `services/importData.ts`, `components/habits/FocusTimer.tsx`, `components/habits/HabitRow.tsx`,
`components/BlockRow.tsx`, `components/ForecastCard.tsx`, `features/today/TodayScreen.tsx`,
`features/stats/StatsScreen.tsx`, `features/settings/SettingsScreen.tsx`, `features/domains/shared/PathPages.tsx`,
`tests/timer.test.tsx` (nouveau contrat : c'est la coche qui arrête le minuteur).

## 8. Tests

29 tests ajoutés (345 au total) : temps écoulé et dépassement, filtrage des mesures, seuil de 3 mesures, rétrécissement
vers le global, bornes, fenêtre des 30 dernières, examens jamais ajustés, pas de 5 min, stabilité de la clé, rythme des
parcours, import/validation ; dette (exclusions, jours de travail, seuil, repli en minutes), proposition (types protégés,
ordre, arrêt à 1 jour), validation puis annulation qui revient à l'état de départ.

## 9. Pistes suivantes

- Sans minuteur : après avoir coché une tâche MIAGE, proposer en un geste « plus court / comme prévu / plus long ».
- Utiliser le retard en jours dans le message du coach à la place du nombre de tâches.
