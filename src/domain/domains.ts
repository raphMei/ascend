/** Registre des domaines de vie : nom, couleur (variable CSS), icône. Pour en ajouter un, voir docs/ARCHITECTURE.md. */
import type { DomainId } from './types';

export type IconName = 'sun' | 'dumbbell' | 'leaf' | 'moon' | 'book' | 'code' | 'briefcase' | 'route' | 'star' | 'globe' | 'bookopen' | 'layout' | 'cloud' | 'blocks' | 'shield' | 'database' | 'flow' | 'coins' | 'rocket';
export interface DomainInfo { name: string; c: string; ico: IconName; blurb: string }

export const DOM: Record<DomainId, DomainInfo> = {
  matin: { name: 'Routine du matin', c: '--c-matin', ico: 'sun', blurb: 'Téphila, pompes, étirements, petit-déjeuner.' },
  sport: { name: 'Sport', c: '--c-sport', ico: 'dumbbell', blurb: 'Pousser, tirer, jambes, six séances par semaine.' },
  alim: { name: 'Alimentation', c: '--c-alim', ico: 'leaf', blurb: 'Calories, protéines, eau et poids.' },
  sommeil: { name: 'Sommeil', c: '--c-sommeil', ico: 'moon', blurb: 'Coucher, lever, durée et régularité.' },
  miage: { name: 'Cours MIAGE', c: '--c-miage', ico: 'book', blurb: 'Tes dix matières jusqu\'aux examens de février.' },
  java: { name: 'Java backend', c: '--c-java', ico: 'code', blurb: 'Quatorze phases, de la remise à niveau au système design.' },
  pro: { name: 'Travail et cours', c: '--c-pro', ico: 'briefcase', blurb: '' },
  trajet: { name: 'Trajet', c: '--c-trajet', ico: 'route', blurb: '' },
  chabbat: { name: 'Chabbat', c: '--c-chabbat', ico: 'star', blurb: '' },
  autre: { name: 'Autre', c: '--c-autre', ico: 'star', blurb: '' },
  anglais: { name: 'Anglais', c: '--c-anglais', ico: 'globe', blurb: 'Une courte séance par jour, jusqu\'au score TOEIC visé.' },
  lecture: { name: 'Lecture', c: '--c-lecture', ico: 'bookopen', blurb: 'Un livre à la fois, quelques pages chaque jour.' },
  front: { name: 'Dev front', c: '--c-front', ico: 'layout', blurb: 'Du HTML au React testé et accessible, en neuf phases.' },
  cloud: { name: 'Cloud et DevOps', c: '--c-cloud', ico: 'cloud', blurb: 'Linux, Docker, CI/CD, cloud, Terraform et Kubernetes, en huit phases.' },
  archi: { name: 'Architecture logicielle', c: '--c-archi', ico: 'blocks', blurb: 'Principes, patrons, architecture hexagonale, DDD, microservices et décisions documentées.' },
  assurance: { name: 'Métier assurance', c: '--c-assurance', ico: 'shield', blurb: 'Risque, contrat, sinistre, réglementation : le métier dans lequel tu travailles.' },
  data: { name: 'Data et SQL', c: '--c-data', ico: 'database', blurb: 'SQL pour l\'analyse, puis Python et pandas.' },
  agile: { name: 'Agilité et gestion de projet', c: '--c-agile', ico: 'flow', blurb: 'Scrum, Kanban, planification et gestion des risques.' },
  finances: { name: 'Finances', c: '--c-finances', ico: 'coins', blurb: 'Point mensuel, épargne et versements.' },
  projets: { name: 'Projets perso', c: '--c-projets', ico: 'rocket', blurb: 'Tes projets perso et freelance, une prochaine action chacun.' }
};
