# Liste d'améliorations

Chaque point a un critère de réussite vérifiable. Statut : tout est ✅ fait. Le détail de chaque réalisation est dans `docs/COMPTE-RENDU.md`.

## Performance

| # | Amélioration | Pourquoi | Critère de réussite |
|---|---|---|---|
| ✅ P1 | **Garde-fou de performance** des calculs de planning | Mesuré : réajustement ≈ 4 ms, séries ≈ 2 ms — rien à optimiser aujourd'hui, mais il faut le rester quand le contenu grossira | Test qui échoue si la saison complète dépasse un budget de temps |
| ✅ P2 | **Écritures groupées** pour le rattrapage des statistiques | Jusqu'à 60 écritures Firestore séparées au premier lancement | Une seule écriture par lot (test sur le backend) |
| ✅ P3 | **Polices hébergées avec l'application** | Trois polices Google chargées depuis un tiers : réseau, confidentialité, démarrage plus lent | Plus aucune requête vers Google Fonts (test navigateur) |
| ✅ P4 | **Écrans secondaires chargés à la demande** | Tout le code est téléchargé même pour ouvrir « Aujourd'hui » | Réglages, Mon mois, Statistiques et pages de domaine dans des fichiers séparés (test de construction) |
| ✅ P5 | **Budget de taille** | Éviter que l'application grossisse sans qu'on le voie | Test qui échoue si le fichier principal dépasse 150 Ko compressés |

## Usage

| # | Amélioration | Pourquoi | Critère de réussite |
|---|---|---|---|
| ✅ U1 | **Changer de jour d'un geste** : glisser à gauche / droite, flèches du clavier | Plus rapide que viser les flèches | Test du geste et des touches |
| ✅ U2 | **Jours exceptionnels** : congé, télétravail ou sur site pour un jour précis | Les blocs de travail n'étaient pas modifiables | Un jour de congé libère la journée ; le réajustement en tient compte (tests) |
| ✅ U3 | **Minuteur de concentration** sur chaque bloc d'étude | Démarrer est le plus dur ; le minuteur cadre la séance | Démarrer, arrêter, fin de séance signalée (tests) |
| ✅ U4 | **« Continuer là où je me suis arrêté »** : prochaine étape de chaque parcours, depuis « Aujourd'hui » | Retrouver son cours sans fouiller | La carte pointe l'étape non faite suivante et son lien (tests) |
| ✅ U5 | **Importer ses données** (sauvegarde / restauration) avec validation | L'export existait, pas le retour | Un fichier valide restaure ; un fichier invalide est refusé sans rien écraser (tests) |
| ✅ U6 | **Premier lancement guidé** | Un nouvel utilisateur ne sait pas par où commencer | Carte de démarrage qui disparaît une fois terminée (tests) |

## Progression

| # | Amélioration | Pourquoi | Critère de réussite |
|---|---|---|---|
| ✅ G1 | **Écran Statistiques** : taux de réussite par habitude (7 et 30 jours), meilleure série, calendrier de chaleur sur 12 semaines | Voir la régularité, pas seulement le jour | Chiffres justes sur des données connues (tests) |
| ✅ G2 | **Bilan de la semaine** : heures par domaine, comparaison avec la semaine précédente | Un point hebdomadaire concret | Totaux exacts, comparaison correcte (tests) |
| ✅ G3 | **Badges** : séries de 7, 30, 100 jours ; premiers parcours terminés | Motivation | Attribution exacte aux seuils (tests) |
| ✅ G4 | **Prévision d'achèvement** des parcours au rythme des 14 derniers jours (la date de chaque étape terminée est désormais enregistrée) | Savoir si l'objectif final est atteignable | Date estimée cohérente ; aucune prévision sans rythme (tests) |
| ✅ G5 | **« Sur la bonne voie ? »** par matière MIAGE : tâches faites contre tâches prévues à ce jour | Repérer la matière qui prend du retard | Statut exact (en avance, à jour, en retard) (tests) |
