/* Registre des domaines de vie : nom, couleur (variable CSS), icône. Pour en ajouter un, voir docs/ARCHITECTURE.md. */
export const DOM = {
  matin: { name: 'Routine du matin', c: '--c-matin', ico: 'sun', blurb: 'Téphila, pompes, étirements, petit-déjeuner.' },
  sport: { name: 'Sport', c: '--c-sport', ico: 'dumbbell', blurb: 'Pousser, tirer, jambes, six séances par semaine.' },
  alim: { name: 'Alimentation', c: '--c-alim', ico: 'leaf', blurb: 'Calories, protéines, eau et poids.' },
  sommeil: { name: 'Sommeil', c: '--c-sommeil', ico: 'moon', blurb: 'Coucher, lever, durée et régularité.' },
  miage: { name: 'Cours MIAGE', c: '--c-miage', ico: 'book', blurb: 'Tes dix matières jusqu\'aux examens de février.' },
  java: { name: 'Java backend', c: '--c-java', ico: 'code', blurb: 'Quatorze phases, de la remise à niveau au système design.' },
  pro: { name: 'Travail et cours', c: '--c-pro', ico: 'briefcase', blurb: '' },
  trajet: { name: 'Trajet', c: '--c-trajet', ico: 'route', blurb: '' },
  chabbat: { name: 'Chabbat', c: '--c-chabbat', ico: 'star', blurb: '' }
};
export const TRACKED = ['matin', 'sport', 'sommeil', 'miage', 'java'];
