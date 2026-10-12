# Ascend, outil d'apprentissage : écrans, données, algorithme

Ascend n'est plus un gestionnaire de tâches : chaque séance est une **leçon placée à un jour précis**, et le reste de la journée (routine, sport, repas, travail, trajet, sommeil) est du **temps réservé**, sans case à cocher.

## Les quatre onglets (navigation flottante en verre)

| Onglet | Adresse | Contenu |
|---|---|---|
| Aujourd'hui | `#/today`, `#/today/AAAA-MM-JJ` | bandeau de la semaine ; coach ; **prochaine leçon** (« Démarrer » lance le minuteur) ; **ma semaine** (anneau, séances faites sur prévues, heures) ; **mes domaines** (cartes à faire défiler) ; notions à revoir ; **agenda du jour** (temps réservé en bandes hachurées, leçons en cartes de verre, ligne « maintenant ») |
| Semaine | `#/week`, `#/week/AAAA-MM-JJ` | les sept jours avec leurs leçons (celles replacées par l'ajustement automatique comprises), alerte si des leçons ne tiennent plus, heures par domaine |
| Domaines | `#/domains` | **Mon mois** fusionné : intensité de chaque domaine (Désactivé / Léger / Normal / Intensif), charge du mois, et pour chaque domaine : avancement, retard, prochaine leçon, fin estimée, heures par semaine sur 8 semaines. Suivis personnels repliés (routine, sport, repas, sommeil, finances) |
| Journal | `#/journal` | notions **à revoir aujourd'hui** (« Je sais » / « Flou »), puis le fil des bilans de séance par jour, filtrable par domaine |

Réglages : bouton rond en haut à droite de chaque écran. Bilan (`#/home`) et Statistiques (`#/stats`) : liens depuis l'écran Semaine. `#/month` redirige vers Domaines.

## Bilan de séance et révision espacée

À la fin d'une séance d'apprentissage (hors mise en place et organisation), une feuille propose : ce que j'ai compris, difficulté (facile / correct / dur), « à revoir ». Désactivable dans Réglages (`settings.ui.bilan`).

Donnée : `days/{date}.journal[clé]` = `{ t, k, note?, diff?, rev?, next?, n? }` (clé = identifiant de la tâche, ou du bloc pour Java et les parcours). Champ **ajouté** : aucun champ existant n'est renommé ; les règles Firestore (propriétaire seul) couvrent déjà tout le document du jour.

Révisions : après 2 jours, puis 3, 7, 14 et 30 (`domain/journal.ts`, `REVIEW_STEPS`). « Je sais » passe à l'intervalle suivant (la dernière révision clôt la notion), « Flou » repart de demain. Chaque révision s'annule depuis le message.

## Algorithme (inchangé)

Intensité du mois → minutes par jour et par domaine (`domain/month.ts`) → temps libre mesuré par le planificateur → répartition des leçons (`domain/schedule.ts`, ordre : examens, révisions et projets, fiches et séances, mise en place ; puis échéance) → réajustement automatique d'un oubli. Rien n'est enregistré, tout se recalcule.

## Code

- `domain/journal.ts`, `domain/overview.ts` (avancement et heures par semaine de chaque domaine), `domain/lesson.ts` (libellé « Leçon », « Révision »…), `domain/recent.ts` (Bilan).
- `hooks/useWeek.ts`, `hooks/useOverviews.ts`, `hooks/bilan.ts` (file d'attente du bilan).
- `components/learning/*` (agenda, carte semaine, bande des domaines, rappel de révision), `components/BilanSheet.tsx`.
- `features/week`, `features/journal`, `features/domains/DomainsScreen.tsx`.
- Styles : `styles/learning.css` ; navigation : `styles/layout.css` (capsule de verre, pastille qui glisse, zone sûre de l'iPhone).

## Pas de zoom

Pincement et double toucher sont bloqués (`gesturestart` annulé dans `main.tsx`, `touch-action: manipulation`). La balise viewport garde le zoom autorisé : l'interdire échouerait à l'audit d'accessibilité ; le texte reste agrandissable par les réglages du système.
