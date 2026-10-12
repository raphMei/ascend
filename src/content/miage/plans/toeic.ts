/** Préparation au TOEIC. Les ressources de pratique de l'anglais sont en anglais (c'est le but) ; les présentations de l'examen sont en français. */
import { en, wiki } from '../../sources';
import { cours, exo } from './dsl';
import type { SubjectPlan } from './types';

export const toeic: SubjectPlan = {
  subject: 'toeic',
  units: [
    cours('Comprendre le TOEIC : structure, scores, stratégie', 'Écoute et lecture, 990 points, 2 heures. Note combien de temps tu as par partie et par question, et fixe ton score visé.', 0.5, [wiki('Test_of_English_for_International_Communication', 'Test of English for International Communication')]),
    cours('Compréhension orale : photographies et questions-réponses (parties 1 et 2)', 'Entraîne-toi à repérer les pièges classiques : mots qui se ressemblent, réponses indirectes.', 0.75, [en('ExamEnglish', 'Exercices TOEIC', 'https://www.examenglish.com/TOEIC/'), en('BBC', '6 Minute English', 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english')]),
    cours('Compréhension orale : conversations et exposés (parties 3 et 4)', 'Lis les questions avant d\'écouter. Après chaque extrait, note les trois informations qui comptaient.', 0.75, [en('ExamEnglish', 'Exercices TOEIC', 'https://www.examenglish.com/TOEIC/')]),
    cours('Grammaire du TOEIC : temps, prépositions, mots de liaison', 'Une règle par séance, un exemple écrit de ta main.', 0.75, [en('British Council', 'Grammaire', 'https://learnenglish.britishcouncil.org/grammar')]),
    cours('Vocabulaire professionnel : réunions, e-mails, voyages', 'Dix mots par séance, une phrase par mot, puis teste-toi.', 0.75, [en('British Council', 'Business English', 'https://learnenglish.britishcouncil.org/business-english')]),
    exo('Compréhension écrite : compléter des phrases et des textes (parties 5 et 6)', 'Chronomètre-toi : 30 secondes maximum par phrase. Relis chaque erreur et écris la règle en une ligne.', 1, [en('ExamEnglish', 'Exercices TOEIC', 'https://www.examenglish.com/TOEIC/')]),
    exo('Compréhension écrite : textes à lire (partie 7)', 'Lis les questions d\'abord, puis cherche la réponse dans le texte. Entraîne-toi à écrémer.', 1, [en('ExamEnglish', 'Exercices TOEIC', 'https://www.examenglish.com/TOEIC/')]),
    exo('Écoute active', 'Quinze minutes de podcast ou de vidéo sans sous-titres. Note 5 mots ou expressions nouveaux avec leur phrase.', 0.5, [en('BBC', '6 Minute English', 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english')])
  ],
  projects: {
    'toeic:p9': [en('ExamEnglish', 'Exercices TOEIC', 'https://www.examenglish.com/TOEIC/')],
    'toeic:p13': [en('ExamEnglish', 'Exercices TOEIC', 'https://www.examenglish.com/TOEIC/')],
    'toeic:p14': [en('ExamEnglish', 'Exercices TOEIC', 'https://www.examenglish.com/TOEIC/')]
  }
};
