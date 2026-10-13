# Ascend, outil d'apprentissage : écrans, données, algorithme

Ascend n'est plus un gestionnaire de tâches : chaque séance est une **leçon placée à un jour précis**, et le reste de la journée (routine, sport, repas, travail, trajet, sommeil) est du **temps réservé**, sans case à cocher.

## Les quatre onglets (navigation flottante en verre)

| Onglet | Adresse | Contenu |
|---|---|---|
| Aujourd'hui | `#/today`, `#/today/AAAA-MM-JJ` | bandeau de la semaine ; coach ; **prochaine leçon** (« Démarrer » lance le minuteur) ; **ma semaine** (anneau, séances faites sur prévues, heures) ; **mes domaines** (cartes à faire défiler) ; notions à revoir ; **agenda du jour** (temps réservé en bandes hachurées, leçons en cartes de verre, ligne « maintenant ») |
| Semaine | `#/week`, `#/week/AAAA-MM-JJ` | les sept jours avec leurs leçons (celles replacées par l'ajustement automatique comprises), alerte si des leçons ne tiennent plus, heures par domaine |
| Domaines | `#/domains` | **Mon mois** fusionné : budget de temps du mois (temps libre, réservé par domaine, MIAGE, trou), intensité de chaque domaine (Désactivé / Léger / Normal / Intensif) **avec limites**, et pour chaque domaine : avancement, retard, prochaine leçon, fin estimée, heures par semaine sur 8 semaines. Plus de suivis personnels : routine, sport, repas et sommeil sont du temps réservé |
| Journal | `#/journal` | notions **à revoir aujourd'hui** (« Je sais » / « Flou »), puis le fil des bilans de séance par jour, filtrable par domaine |

Réglages : bouton rond en haut à droite de chaque écran. Bilan (`#/home`) et Statistiques (`#/stats`) : liens depuis l'écran Semaine. `#/month` redirige vers Domaines.

## Bilan de séance et révision espacée

À la fin d'une séance d'apprentissage (hors mise en place et organisation), une feuille propose : ce que j'ai compris, difficulté (facile / correct / dur), « à revoir ». Désactivable dans Réglages (`settings.ui.bilan`).

Donnée : `days/{date}.journal[clé]` = `{ t, k, note?, diff?, rev?, next?, n? }` (clé = identifiant de la tâche, ou du bloc pour Java et les parcours). Champ **ajouté** : aucun champ existant n'est renommé ; les règles Firestore (propriétaire seul) couvrent déjà tout le document du jour.

Révisions : après 2 jours, puis 3, 7, 14 et 30 (`domain/journal.ts`, `REVIEW_STEPS`). « Je sais » passe à l'intervalle suivant (la dernière révision clôt la notion), « Flou » repart de demain. Chaque révision s'annule depuis le message.

## Domaines

MIAGE, Java, Dev front, Cloud et DevOps, Architecture, **Métier assurance, Data et SQL, Agilité et gestion de projet** (socles de départ de deux phases, à compléter avec ton programme : `src/content/<id>/path.ts`), Anglais, Lecture, Projets perso. Le sport est du temps réservé, réglé dans Réglages.

## Budget de temps et limites (`domain/budget.ts`)

Temps libre par jour = ce que mesure le planificateur après travail, trajets, repas et sport (hors Chabbat). Chaque intensité réserve des minutes (`MINUTES` dans `domain/month.ts`).
- **Plafond** : les autres domaines ne peuvent pas prendre plus que (temps libre − minutes gardées à MIAGE : 45 / 90 / 150 selon Léger / Normal / Intensif). Un choix qui dépasse est grisé, avec la raison.
- **Limite de domaines** : 5 actifs au plus en plus de MIAGE.
- **Trou** : temps libre sans usage (ni domaine ni besoin MIAGE). Au-delà de 45 min par jour, « Combler automatiquement » propose des intensités, dans l'ordre Java, front, cloud, architecture, assurance, data, agilité, anglais, lecture, projets.
- Le besoin MIAGE (minutes restantes / jours d'étude jusqu'à la dernière échéance) est affiché : s'il dépasse ce qui lui reste, le message le dit.

## Réglages

Compte, semaine de travail (jours sur site, réveil, coucher, temps de travail), sport (séances par semaine), apprentissage (ajustement automatique, durées réelles, bilan, son), Chabbat, rappels, apparence, sauvegarde. Les minutes par domaine ne se règlent plus ici : c'est l'intensité du mois.

## Algorithme de réajustement

Intensité du mois → minutes par jour et par domaine (`domain/month.ts`) → temps libre mesuré par le planificateur → répartition des leçons (`domain/schedule.ts`, ordre : examens, révisions et projets, fiches et séances, mise en place ; puis échéance ; **les séances d'une matière restent dans l'ordre de son plan**, et une journée est plafonnée à 7 h) → réajustement automatique d'un oubli. Rien n'est enregistré, tout se recalcule.

## Code

- `domain/budget.ts` (budget et limites), `domain/journal.ts`, `domain/overview.ts` (avancement et heures par semaine de chaque domaine), `domain/lesson.ts` (libellé « Leçon », « Révision »…), `domain/recent.ts` (Bilan).
- `hooks/useWeek.ts`, `hooks/useOverviews.ts`, `hooks/bilan.ts` (file d'attente du bilan).
- `components/learning/*` (agenda, carte semaine, bande des domaines, rappel de révision), `components/BilanSheet.tsx`.
- `features/week`, `features/journal`, `features/domains/DomainsScreen.tsx`.
- Styles : `styles/learning.css` ; navigation : `styles/layout.css` (capsule de verre, pastille qui glisse, zone sûre de l'iPhone).

## Début de saison : `APP_START` (`domain/backfill.ts`) = 13 octobre 2026.

## Pas de zoom

Pincement et double toucher sont bloqués (`gesturestart` annulé dans `main.tsx`, `touch-action: manipulation`). La balise viewport garde le zoom autorisé : l'interdire échouerait à l'audit d'accessibilité ; le texte reste agrandissable par les réglages du système.
