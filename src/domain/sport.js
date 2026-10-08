/* Programme de sport : séances push / pull / legs, planification hebdomadaire. */
export const SPORT = {
  push: { name: 'Pousser', sub: 'Pectoraux, épaules, triceps', ex: [['Développé couché', '4 × 6-8'], ['Développé incliné haltères', '3 × 8-10'], ['Élévations latérales', '4 × 12-15'], ['Pec deck ou écartés poulie', '3 × 12-15'], ['Extensions triceps à la poulie', '3 × 10-12'], ['Dips ou barre au front', '2 × 10']] },
  pull: { name: 'Tirer', sub: 'Dos, arrière d\'épaules, biceps', ex: [['Tractions (lestées si facile)', '4 × 6-10'], ['Rowing machine ou buste appuyé', '4 × 8-10'], ['Tirage vertical prise neutre', '3 × 10-12'], ['Face pull', '3 × 15'], ['Curl incliné haltères', '3 × 10-12'], ['Curl marteau', '3 × 10-12']] },
  legs: { name: 'Jambes (priorité)', sub: 'Quadriceps, ischios, mollets, sans charge lourde sur le bas du dos', ex: [['Presse à cuisses', '4 × 10-12'], ['Hack squat ou squat goblet', '3 × 8-10'], ['Fentes bulgares', '3 × 10 par jambe'], ['Leg curl allongé', '4 × 10-12'], ['Leg extension', '3 × 12-15'], ['Mollets debout', '4 × 12-15']] }
};
export const SPORT_WEEK = { 0: 'push', 1: 'pull', 2: 'legs', 3: 'push', 4: 'pull', 5: 'legs' };
