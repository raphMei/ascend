/** Traitement de données massives. Plan type à adapter au programme réel du cours. */
import { en, wiki } from '../../sources';
import { cours, exo } from './dsl';
import type { SubjectPlan } from './types';

export const big: SubjectPlan = {
  subject: 'big',
  units: [
    cours('Les données massives : volume, vitesse, variété', 'Quand une seule machine ne suffit plus, et quels problèmes posent le stockage et le calcul distribués.', 0.75, [wiki('M%C3%A9gadonn%C3%A9es', 'Mégadonnées'), wiki('Entrep%C3%B4t_de_donn%C3%A9es', 'Entrepôt de données'), wiki('Lac_de_donn%C3%A9es', 'Lac de données')]),
    cours('Stockage distribué et MapReduce', 'Le modèle MapReduce : map, shuffle, reduce. Écris le comptage de mots sur un exemple de trois lignes, à la main.', 1.25, [wiki('MapReduce', 'MapReduce'), wiki('Apache_Hadoop', 'Apache Hadoop'), en('Hadoop', 'Tutoriel MapReduce', 'https://hadoop.apache.org/docs/stable/hadoop-mapreduce-client/hadoop-mapreduce-client-core/MapReduceTutorial.html')]),
    cours('Apache Spark : principes et architecture', 'Pourquoi Spark remplace MapReduce : calcul en mémoire, évaluation paresseuse, transformations et actions.', 1, [wiki('Apache_Spark', 'Apache Spark'), en('Spark', 'Démarrage rapide', 'https://spark.apache.org/docs/latest/quick-start.html')]),
    cours('DataFrames et Spark SQL', 'Lire un fichier, filtrer, grouper, agréger avec l\'API DataFrame et en SQL.', 1.25, [en('Spark', 'Guide Spark SQL et DataFrames', 'https://spark.apache.org/docs/latest/sql-programming-guide.html')]),
    cours('PySpark : prise en main', 'Installe PySpark en local, exécute les exemples du guide de démarrage.', 1, [en('Spark', 'PySpark : premiers pas', 'https://spark.apache.org/docs/latest/api/python/getting_started/index.html')]),
    exo('Même agrégation avec pandas puis PySpark', 'Trouve un jeu de données public de plusieurs millions de lignes. Fais la même agrégation (par exemple une moyenne par jour) avec pandas, puis avec PySpark. Mesure temps et mémoire de chaque version.', 2),
    cours('Formats de fichiers : CSV, JSON, Parquet', 'Pourquoi un format en colonnes (Parquet) accélère les requêtes analytiques et réduit le volume.', 0.75, [wiki('Apache_Parquet', 'Apache Parquet')]),
    cours('Flux de données : Kafka et le traitement en continu', 'Différence entre traitement par lots et en continu ; le rôle de Kafka dans une architecture.', 1, [wiki('Apache_Kafka', 'Apache Kafka'), en('Kafka', 'Démarrage rapide de Kafka', 'https://kafka.apache.org/quickstart')])
  ],
  projects: { 'big:p1': [en('Spark', 'PySpark : premiers pas', 'https://spark.apache.org/docs/latest/api/python/getting_started/index.html'), wiki('Apache_Parquet', 'Apache Parquet')] }
};
