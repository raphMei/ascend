/** Parcours « Data et SQL » : socle de départ en deux phases (SQL, analyse avec Python). À compléter avec ton programme réel :
    ajoute des phases dans `RAW` (identifiants stables d1t1, d1t2…). */
import { buildPhases, cours, exo, projet, valid, type RawPhase } from '../dsl';
import { en, fr, sqlsh, wiki } from '../sources';
import type { PathStep, Phase } from '../types';

const RAW: RawPhase[] = [
  { id: 'd1', title: 'SQL pour l\'analyse', core: true,
    goal: 'Interroger une base relationnelle avec assurance : sélectionner, filtrer, regrouper, joindre. La compétence data la plus utile au quotidien.',
    steps: [
      cours('Le modèle relationnel : tables, clés, relations', [wiki('Mod%C3%A8le_relationnel', 'Modèle relationnel')], 35, { g: 'Les bases' }),
      cours('SELECT, WHERE et ORDER BY', [sqlsh('select', 'SELECT'), sqlsh('where', 'WHERE'), sqlsh('order-by', 'ORDER BY')], 50, { g: 'Les bases' }),
      cours('Agréger : GROUP BY et HAVING', [sqlsh('group-by', 'GROUP BY'), sqlsh('having', 'HAVING')], 45, { g: 'Analyser' }),
      cours('Les jointures', [sqlsh('jointures', 'Jointures')], 60, { g: 'Analyser' }),
      cours('Sous-requêtes et UNION', [sqlsh('sous-requete', 'Sous-requêtes'), sqlsh('union', 'UNION')], 45, { g: 'Analyser' }),
      exo('Résoudre une enquête en SQL : le « SQL Murder Mystery »', [en('Knight Lab', 'SQL Murder Mystery', 'https://mystery.knightlab.com/')], 60),
      projet('Poser dix questions métier à une base d\'exemple (ventes, sinistres…) et y répondre chacune par une requête commentée', [], 90, { d: 'Critères : chaque requête tient en moins de vingt lignes, utilise au moins une jointure ou une agrégation, et son résultat est vérifié à la main sur un cas.' }),
      valid('Écris de mémoire une requête qui joint deux tables, filtre, regroupe et trie, puis explique l\'ordre dans lequel le moteur l\'exécute.')
    ] },
  { id: 'd2', title: 'Analyse de données avec Python', core: false,
    goal: 'Charger, nettoyer et résumer un jeu de données avec Python et pandas, pour aller plus loin que SQL.',
    steps: [
      cours('Python : les bases du langage', [fr('Python', 'Le tutoriel Python', 'https://docs.python.org/fr/3/tutorial/')], 90, { g: 'Python' }),
      cours('pandas : présentation', [wiki('Pandas', 'Pandas')], 20, { g: 'pandas' }),
      cours('pandas en 10 minutes : tableaux, sélection, regroupement', [en('pandas', '10 minutes to pandas', 'https://pandas.pydata.org/docs/user_guide/10min.html')], 60, { g: 'pandas' }),
      cours('Le cours pandas de Kaggle', [en('Kaggle', 'Pandas', 'https://www.kaggle.com/learn/pandas')], 240, { g: 'pandas' }),
      cours('Entrepôts de données et ETL : d\'où viennent les données', [wiki('Entrep%C3%B4t_de_donn%C3%A9es', 'Entrepôt de données'), wiki('Extract-transform-load', 'Extract-transform-load')], 40, { g: 'Le contexte' }),
      projet('Analyser un fichier CSV public : le nettoyer, le résumer en cinq indicateurs, et écrire trois conclusions', [], 150, { d: 'Critères : le notebook se relance de bout en bout, chaque nettoyage est justifié, chaque conclusion cite le chiffre qui la soutient.' }),
      valid('Reproduis en pandas une requête SQL de la phase 1 (jointure, filtre, regroupement) et compare les deux résultats.')
    ] }
];

export const DATA_LEVELS = ['Pas commencé', 'Démarrage', 'SQL solide', 'Analyse avec Python', 'Data confirmé'];
export const DATA_PHASES: Phase[] = buildPhases(RAW);
export const DATA_TASKS: PathStep[] = DATA_PHASES.flatMap((p) => p.tasks);
export const DATA_HOURS = DATA_PHASES.reduce((s, p) => s + p.hours, 0);
export const dataPhaseById: Record<string, Phase> = Object.fromEntries(DATA_PHASES.map((p) => [p.id, p]));
