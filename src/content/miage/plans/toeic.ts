/** Préparation au TOEIC (18 h de TD, 3 ECTS) : oral de 20 minutes (1/3 de la note) à préparer à l'avance. Les ressources de pratique de l'anglais
    sont en anglais (c'est le but) ; les présentations de l'examen sont en français. Pas de plan officiel reçu : séances provisoires. */
import { en, wiki } from '../../sources';
import { cours, exo, provisoire, valid } from './dsl';
import type { SubjectPlan } from './types';

const examEnglish = en('ExamEnglish', 'Exercices TOEIC', 'https://www.examenglish.com/TOEIC/');
const bbc = en('BBC', '6 Minute English', 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english');

export const toeic: SubjectPlan = {
  subject: 'toeic',
  paced: true,
  units: [
    provisoire(cours('Comprendre le TOEIC : structure, scores, stratégie', 'Écoute et lecture, 990 points, 2 heures. Note combien de temps tu as par partie et par question, et fixe ton score visé.', 0.5, [wiki('Test_of_English_for_International_Communication', 'Test of English for International Communication')])),
    provisoire(cours('Compréhension orale : photographies et questions-réponses (parties 1 et 2)', 'Entraîne-toi à repérer les pièges classiques : mots qui se ressemblent, réponses indirectes.', 0.75, [examEnglish, bbc])),
    provisoire(cours('Compréhension orale : conversations et exposés (parties 3 et 4)', 'Lis les questions avant d\'écouter. Après chaque extrait, note les trois informations qui comptaient.', 0.75, [examEnglish])),
    provisoire(cours('Grammaire du TOEIC : temps, prépositions, mots de liaison', 'Une règle par séance, un exemple écrit de ta main.', 0.75, [en('British Council', 'Grammaire', 'https://learnenglish.britishcouncil.org/grammar')])),
    provisoire(cours('Vocabulaire professionnel : réunions, e-mails, voyages', 'Dix mots par séance, une phrase par mot, puis teste-toi.', 0.75, [en('British Council', 'Business English', 'https://learnenglish.britishcouncil.org/business-english')])),
    provisoire(valid('Test blanc TOEIC n°1', 'Fais un test complet en conditions réelles : 2 heures, sans pause ni dictionnaire, écoute puis lecture. Note ton score par partie et les types de questions où tu perds le plus de points, puis liste 5 points faibles à travailler.', 2, [examEnglish])),
    provisoire(exo('Compréhension écrite : compléter des phrases et des textes (parties 5 et 6)', 'Chronomètre-toi : 30 secondes maximum par phrase. Relis chaque erreur et écris la règle en une ligne.', 1, [examEnglish])),
    provisoire(exo('Compréhension écrite : textes à lire (partie 7)', 'Lis les questions d\'abord, puis cherche la réponse dans le texte. Entraîne-toi à écrémer.', 1, [examEnglish])),
    provisoire(exo('Préparer l\'oral de 20 minutes', 'L\'oral compte pour un tiers de la note : prépare à l\'avance une présentation de toi et de ton alternance (2 minutes), puis 5 questions possibles du jury et tes réponses, à voix haute et chronométrées.', 1, [bbc])),
    provisoire(valid('Test blanc TOEIC n°2', 'Même protocole que le premier : 2 heures, conditions réelles. Compare avec ton premier score et vérifie que tes 5 points faibles ont progressé.', 2, [examEnglish])),
    provisoire(exo('Écoute active', 'Quinze minutes de podcast ou de vidéo sans sous-titres. Note 5 mots ou expressions nouveaux avec leur phrase.', 0.5, [bbc])),
    provisoire(valid('Test blanc TOEIC n°3', 'Dernier test complet avant l\'examen. Sers-toi du résultat pour décider où passer ton temps de révision de la dernière semaine.', 2, [examEnglish]))
  ],
  deliverables: [
    { title: 'Oral TOEIC (20 minutes)', detail: 'L\'oral de 20 minutes compte pour un tiers de la note : date et format à confirmer avec l\'enseignant. Relis ta présentation, tes réponses aux questions possibles, et chronomètre-toi une dernière fois.', hours: 1, after: 9 }
  ],
  exam: { format: 'test TOEIC (écoute et lecture) et oral de 20 minutes comptant pour un tiers de la note ; date à confirmer', allowed: 'à confirmer' }
};
