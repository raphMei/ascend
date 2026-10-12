/** Analyse des données et systèmes de recherche d'information. Plan type à adapter au programme réel du cours. */
import { en, wiki } from '../../sources';
import { cours, exo } from './dsl';
import type { SubjectPlan } from './types';

export const ri: SubjectPlan = {
  subject: 'ri',
  units: [
    cours('La recherche d\'information : le problème et les modèles', 'Requête, document, pertinence. Distingue les modèles booléen, vectoriel et probabiliste.', 0.75, [wiki('Recherche_d%27information', 'Recherche d\'information'), en('Stanford', 'Introduction to Information Retrieval (livre)', 'https://nlp.stanford.edu/IR-book/html/htmledition/irbook.html')]),
    cours('L\'index inversé', 'Construis à la main l\'index inversé de cinq petits documents et réponds à une requête de deux mots.', 1, [wiki('Index_invers%C3%A9', 'Index inversé')]),
    cours('TF-IDF : pondérer les termes', 'Fréquence d\'un terme dans un document et rareté dans le corpus. Calcule le TF-IDF de trois mots sur ton mini-corpus.', 1, [wiki('TF-IDF', 'TF-IDF')]),
    cours('BM25 : le classement de référence', 'Ce que BM25 corrige par rapport à TF-IDF (saturation de la fréquence, longueur du document) et le rôle de k1 et b.', 1, [wiki('Okapi_BM25', 'Okapi BM25')]),
    exo('Implémenter l\'index inversé, TF-IDF et BM25', 'Sur un corpus de 500 à 5 000 documents, construis l\'index, puis implémente le classement TF-IDF et BM25.', 2.5),
    cours('Évaluer un moteur : précision, rappel, F-mesure', 'Calcule précision et rappel sur un exemple de dix résultats ; comprends la précision moyenne (MAP).', 1, [wiki('Pr%C3%A9cision_et_rappel', 'Précision et rappel')]),
    cours('Lucene et Elasticsearch', 'Comment un moteur industriel applique ces idées : analyseurs, index, requêtes.', 1, [wiki('Apache_Lucene', 'Apache Lucene'), wiki('Elasticsearch', 'Elasticsearch'), en('Elastic', 'Premiers pas avec Elasticsearch', 'https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started.html')]),
    cours('PageRank et la recherche sur le web', 'Le lien comme vote de confiance : principe de PageRank.', 0.75, [wiki('PageRank', 'PageRank')]),
    cours('Analyse de données : réduction de dimension (ACP)', 'Pourquoi réduire la dimension, et ce que montre une analyse en composantes principales.', 1, [wiki('Analyse_en_composantes_principales', 'Analyse en composantes principales'), en('scikit-learn', 'Guide scikit-learn', 'https://scikit-learn.org/stable/user_guide.html')]),
    cours('Recherche sémantique avec des plongements', 'Chercher par le sens plutôt que par les mots : plongements et similarité.', 0.75, [wiki('Plongement_lexical', 'Plongement lexical')])
  ],
  projects: { 'ri:p2': [wiki('Okapi_BM25', 'Okapi BM25'), wiki('TF-IDF', 'TF-IDF'), wiki('Pr%C3%A9cision_et_rappel', 'Précision et rappel')] }
};
