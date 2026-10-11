/** MODÈLE : copie ce fichier en `<matière>.ts` (ex. dl.ts), remplis-le avec le vrai programme, puis ajoute-le dans `index.ts`.
    Ce fichier n'est importé nulle part. */
import type { SubjectPlan } from './types';

export const plan: SubjectPlan = {
  subject: 'dl',
  units: [
    { title: 'Perceptron et descente de gradient', detail: 'Relis le chapitre 1. Refais à la main une itération de descente de gradient sur un exemple à deux entrées.', hours: 0.75 },
    { title: 'Réseaux multicouches et rétropropagation', detail: 'Chapitre 2 : écris la rétropropagation sur un réseau de deux couches, puis implémente-la en NumPy.' }
  ],
  milestones: [{ date: '2026-12-10', label: 'Contrôle continu : TP noté sur les réseaux convolutifs', hours: 1.5 }],
  exam: { format: 'QCM + problème, 2 h', allowed: 'une feuille A4 recto-verso' }
};
