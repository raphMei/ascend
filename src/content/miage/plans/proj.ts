/** Projet « Analyse avancée des données ». Plan type à adapter à la consigne réelle (sujet et dates de rendu). */
import { en, fr, wiki } from '../../sources';
import { cours, exo } from './dsl';
import type { SubjectPlan } from './types';

export const proj: SubjectPlan = {
  subject: 'proj',
  units: [
    cours('Python pour l\'analyse de données : les bases', 'Types, listes, dictionnaires, fonctions, modules. Suis le cours en français et fais les exercices.', 2, [fr('Université Paris Cité', 'Cours de Python (français)', 'https://python.sdv.u-paris.fr/'), wiki('Python_(langage)', 'Python')]),
    cours('NumPy et pandas : manipuler des tableaux de données', 'Charger, filtrer, grouper, fusionner. Fais le tutoriel « 10 minutes avec pandas ».', 2, [wiki('Pandas', 'pandas'), en('pandas', '10 minutes avec pandas', 'https://pandas.pydata.org/docs/user_guide/10min.html')]),
    cours('Visualiser : matplotlib et seaborn', 'Choisir le bon graphique (histogramme, nuage de points, boîte à moustaches) et le rendre lisible.', 1.5, [en('seaborn', 'Tutoriel seaborn', 'https://seaborn.pydata.org/tutorial.html'), en('matplotlib', 'Tutoriels matplotlib', 'https://matplotlib.org/stable/tutorials/index.html')]),
    exo('Explorer et nettoyer ton jeu de données', 'Valeurs manquantes, doublons, valeurs aberrantes, types. Note chaque décision de nettoyage et sa raison.', 2, [en('Kaggle', 'Cours Pandas', 'https://www.kaggle.com/learn/pandas')]),
    cours('Apprentissage supervisé avec scikit-learn', 'Séparer apprentissage et test, entraîner un modèle, lire ses scores. Cours gratuit en français de l\'Inria.', 3, [fr('Inria', 'Machine learning avec scikit-learn (MOOC)', 'https://www.fun-mooc.fr/fr/cours/machine-learning-python-scikit-learn/'), wiki('Scikit-learn', 'Scikit-learn')]),
    cours('Validation croisée et métriques', 'Pourquoi un seul découpage apprentissage/test ne suffit pas, et quelle métrique choisir selon le problème.', 1, [wiki('Validation_crois%C3%A9e', 'Validation croisée')]),
    cours('Apprentissage non supervisé : partitionnement et ACP', 'K-moyennes et analyse en composantes principales pour découvrir des structures dans les données.', 1.5, [wiki('K-moyennes', 'K-moyennes'), wiki('Analyse_en_composantes_principales', 'Analyse en composantes principales')])
  ],
  projects: {
    'proj:p3': [en('pandas', '10 minutes avec pandas', 'https://pandas.pydata.org/docs/user_guide/10min.html')],
    'proj:p10': [en('seaborn', 'Tutoriel seaborn', 'https://seaborn.pydata.org/tutorial.html')],
    'proj:p12': [wiki('Validation_crois%C3%A9e', 'Validation croisée')]
  }
};
