/** Données de test indépendantes du contenu pédagogique : tâches MIAGE génériques (sans plans de matière).
    Les tests de logique (planning, ajustement, groupes…) ne doivent pas dépendre des textes ni des durées des cours. */
import { buildLegacyTasks } from './legacy-tasks';
import { adjustTasks } from '@/domain/task-schedule';
import type { Settings } from '@/domain/types';
import type { MiageTask } from '@/content/types';

const base = buildLegacyTasks({});
export const genericTasks = (S: Settings): MiageTask[] => adjustTasks(base, S);
