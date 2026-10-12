/** Ingénierie des données et des connaissances pour les LLM. Plan type à adapter au programme réel du cours. */
import { en, hf, wiki } from '../../sources';
import { cours, exo } from './dsl';
import type { SubjectPlan } from './types';

export const llm: SubjectPlan = {
  subject: 'llm',
  units: [
    cours('Comprendre un modèle de langage', 'Ce qu\'est un modèle de langage, ce que « prédire le mot suivant » permet de faire, et ses limites (hallucinations, ancienneté des connaissances).', 1, [wiki('Mod%C3%A8le_de_langage', 'Modèle de langage'), hf(1, 'Cours Hugging Face : les transformeurs (français)')]),
    cours('Tokenisation et plongements (embeddings)', 'Comment un texte devient des nombres : découpage en tokens puis vecteurs. Pourquoi deux phrases de sens proche ont des vecteurs proches.', 1.25, [hf(6, 'Cours Hugging Face : les tokenizers (français)'), wiki('Plongement_lexical', 'Plongement lexical')]),
    cours('Constituer et nettoyer un jeu de données textuelles', 'Collecte, nettoyage, déduplication, filtrage de qualité : pourquoi la qualité des données pèse plus que leur quantité.', 1, [hf(5, 'Cours Hugging Face : la bibliothèque Datasets (français)')]),
    exo('Préparer un corpus de 30 à 50 documents', 'Rassemble des textes libres de droits, découpe-les en passages d\'environ 300 mots, supprime les doublons et note la source de chaque passage.', 1.5),
    cours('Affiner un modèle sur ses propres données (fine-tuning)', 'Quand affiner, quand préférer un RAG, et les coûts de chaque approche.', 1, [hf(3, 'Cours Hugging Face : affiner un modèle (français)')]),
    cours('Génération augmentée de récupération (RAG)', 'Le schéma : retrouver les passages utiles, les donner au modèle, répondre en citant les sources. Dessine-le de mémoire.', 1, [wiki('G%C3%A9n%C3%A9ration_augment%C3%A9e_de_r%C3%A9cup%C3%A9ration', 'Génération augmentée de récupération'), en('LangChain', 'Tutoriel RAG', 'https://python.langchain.com/docs/tutorials/rag/')]),
    cours('Bases de données vectorielles', 'Recherche par similarité : index, distance cosinus, compromis précision et vitesse.', 1, [en('Chroma', 'Documentation Chroma', 'https://docs.trychroma.com/'), en('FAISS', 'Bibliothèque FAISS', 'https://faiss.ai/')]),
    cours('Graphes de connaissances et ontologies', 'Représenter des faits sous forme de triplets (sujet, relation, objet) et les interroger. Écris cinq triplets sur un domaine que tu connais.', 1.25, [wiki('Graphe_de_connaissances', 'Graphe de connaissances'), wiki('Ontologie_(informatique)', 'Ontologie'), wiki('Resource_Description_Framework', 'RDF'), wiki('SPARQL', 'SPARQL')]),
    cours('Évaluer un système RAG', 'Mesurer si le bon passage est retrouvé et si la réponse est fidèle aux sources.', 0.75, [en('Ragas', 'Documentation Ragas', 'https://docs.ragas.io/')])
  ],
  projects: {
    'llm:p0': [en('LangChain', 'Tutoriel RAG', 'https://python.langchain.com/docs/tutorials/rag/'), en('Chroma', 'Documentation Chroma', 'https://docs.trychroma.com/')],
    'llm:p11': [en('Ragas', 'Documentation Ragas', 'https://docs.ragas.io/')]
  }
};
